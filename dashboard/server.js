const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const compositions = require('./lib/compositions');
const brandkits = require('./lib/brandkits');
const renderer = require('./lib/render');
const rendersDb = require('./lib/renders-db');
const thumbnails = require('./lib/thumbnails');
const categories = require('./lib/categories');
const importer = require('./lib/import-composition');
const studio = require('./lib/studio');
const timeline = require('./lib/timeline');
const variants = require('./lib/variants');
const upload = require('./lib/upload');
const aiCompose = require('./lib/ai-compose');
const aiGenerate = require('./lib/ai-generate');
const aiStudio = require('./lib/ai-studio');
const compilePlan = require('./lib/compile-plan');
const cleanup = require('./lib/cleanup');
const schemasDb = require('./lib/schemas');
const liveProps = require('./lib/live-props');
const fork = require('./lib/fork');
const deleteComposition = require('./lib/delete-composition');
const setup = require('./lib/setup');
const aiThumbnail = require('./lib/ai-thumbnail');
const uploadBlotato = require('./lib/upload-blotato');
const uploadCatbox = require('./lib/upload-catbox');
const subtitles = require('./lib/subtitles');
const scriptToVideo = require('./lib/script-to-video');
const moods = require('./lib/moods');
const visualBrief = require('./lib/visual-brief');
const heroLibrary = require('./lib/hero-library');
const IMAGES_DIR = path.join(__dirname, 'data', 'images');
const REMOTION_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const AUDIO_DIR = path.join(__dirname, 'data', 'audio');

const PORT = process.env.DASHBOARD_PORT || 4100;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4'
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ─── API routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/schemas/') && req.method === 'GET') {
    const compId = decodeURIComponent(pathname.replace('/api/schemas/', ''));
    const schema = schemasDb.get(compId);
    return send(res, 200, schema || {});
  }

  // First-run setup: checks which API keys are present, lets the user
  // paste missing ones directly into a modal — written to .env.
  if (pathname === '/api/setup/status' && req.method === 'GET') {
    return send(res, 200, setup.getStatus());
  }
  if (pathname === '/api/setup/save' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const updates = JSON.parse(body || '{}');
        const status = setup.saveKeys(updates);
        send(res, 200, status);
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  // Render a short preview clip for every Block-* composition so the
  // library grid's hover-autoplay has something to show per block.
  if (pathname === '/api/blocks/render-previews' && req.method === 'POST') {
    try {
      const all = compositions.listCompositions().filter(c => c.id.startsWith('Block-'));
      const started = [];
      for (const c of all) {
        const render = renderer.startRender({
          compositionId: c.id,
          props: {},
          label: `Preview: ${c.id}`
        });
        started.push({ id: c.id, renderId: render.id });
      }
      return send(res, 200, { ok: true, queued: started.length, renders: started });
    } catch (err) {
      return send(res, 500, { error: err.message });
    }
  }

  // Hero Library — pre-rendered MP4 clips (Blender / AI video gen) that
  // can be dropped into the timeline or used as hero scenes.
  if (pathname === '/api/hero/list' && req.method === 'GET') {
    return send(res, 200, { clips: heroLibrary.listClips() });
  }
  if (pathname === '/api/hero/add' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const data = JSON.parse(body || '{}');
        const entry = heroLibrary.addClip(data);
        send(res, 200, { ok: true, clip: entry });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }
  if (/^\/api\/hero\/remove\/[^/]+$/.test(pathname) && req.method === 'POST') {
    const id = decodeURIComponent(pathname.split('/').pop());
    heroLibrary.removeClip(id);
    return send(res, 200, { ok: true });
  }
  if (pathname.startsWith('/hero/') && req.method === 'GET') {
    const name = decodeURIComponent(pathname.replace('/hero/', ''));
    if (name.includes('..') || name.includes('/')) return send(res, 400, { error: 'bad path' });
    const filePath = path.join(heroLibrary.HERO_DIR, name);
    if (!fs.existsSync(filePath)) return send(res, 404, { error: 'not found' });
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.mp4' ? 'video/mp4' : ext === '.png' ? 'image/png' : ext === '.jpg' ? 'image/jpeg' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Visual Brief — analyse a reference image with Gemini Vision, return
  // a design-language description + matched mood id.
  if (pathname === '/api/brief/analyze' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { imageBase64, mimeType } = JSON.parse(body || '{}');
        if (!imageBase64) return send(res, 400, { error: 'imageBase64 required' });
        const analysis = await visualBrief.analyze({ imageBase64, mimeType });
        send(res, 200, analysis);
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  // Mood Library — 12 curated visual styles. Each locks in palette,
  // block rotation, background, and pacing for a whole video.
  if (pathname === '/api/moods' && req.method === 'GET') {
    return send(res, 200, moods.list());
  }

  // Script-to-video: sentence-by-sentence VO + block scenes → render.
  if (pathname === '/api/script/build' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { script, voiceId, fontSize, textColor, bgColors, style, moodId } = JSON.parse(body || '{}');
        if (!script || script.trim().length < 20) return send(res, 400, { error: 'script too short' });
        const built = await scriptToVideo.buildScenes({ script, voiceId, style, moodId });
        const render = renderer.startRender({
          compositionId: 'ScriptRunner',
          props: {
            scenes: built.scenes,
            fontSize: fontSize || 140,
            textColor: textColor || '#ffffff',
            bgColors: bgColors || ['#0f172a', '#1e293b']
          },
          label: `Script: ${built.scenes[0].text.slice(0, 40)}…`
        });
        send(res, 200, { ok: true, runId: built.runId, scenes: built.scenes, totalFrames: built.totalFrames, render });
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  // Burn subtitles onto a rendered MP4 via ElevenLabs Scribe + FFmpeg.
  if (pathname === '/api/subtitles/burn' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { filename } = JSON.parse(body || '{}');
        if (!filename || filename.includes('..') || filename.includes('/')) return send(res, 400, { error: 'filename required (bare mp4 name)' });
        const outDir = path.join(__dirname, '..', 'out');
        const inputMp4 = path.join(outDir, filename);
        if (!fs.existsSync(inputMp4)) return send(res, 404, { error: 'input mp4 not found' });
        const outName = filename.replace(/\.mp4$/i, '-captioned.mp4');
        const outputMp4 = path.join(outDir, outName);
        const result = await subtitles.burnSubtitles({ inputMp4, outputMp4 });
        send(res, 200, { ok: true, filename: outName, wordCount: result.wordCount });
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  // Upload a local MP4 to catbox.moe to get a public URL (handy for
  // Blotato publish, which needs a URL to ingest from).
  if (pathname === '/api/upload/catbox' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { filename } = JSON.parse(body || '{}');
        if (!filename || filename.includes('..') || filename.includes('/')) return send(res, 400, { error: 'filename required (bare mp4 name)' });
        const outDir = path.join(__dirname, '..', 'out');
        const filePath = path.join(outDir, filename);
        if (!fs.existsSync(filePath)) return send(res, 404, { error: 'file not found in out/' });
        const result = await uploadCatbox.uploadToCatbox(filePath);
        send(res, 200, { ok: true, url: result.url });
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  // Blotato upload endpoints — list connected accounts and trigger a post
  // from a completed render file.
  if (pathname === '/api/upload/status' && req.method === 'GET') {
    return send(res, 200, { configured: uploadBlotato.hasKey() });
  }
  if (pathname === '/api/upload/accounts' && req.method === 'GET') {
    return uploadBlotato.listAccounts()
      .then(accounts => send(res, 200, { accounts }))
      .catch(err => send(res, 500, { error: err.message }));
  }
  if (pathname === '/api/upload/post' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { publicUrl, accountIds, caption } = JSON.parse(body || '{}');
        if (!publicUrl) return send(res, 400, { error: 'publicUrl required (upload the MP4 somewhere reachable first)' });
        if (!Array.isArray(accountIds) || accountIds.length === 0) return send(res, 400, { error: 'accountIds required' });
        // Need the full account records so we know each one's platform.
        const allAccounts = await uploadBlotato.listAccounts();
        const selected = allAccounts.filter(a => accountIds.includes(String(a.id)) || accountIds.includes(a.id));
        if (!selected.length) return send(res, 400, { error: 'selected accounts not found in Blotato' });
        const results = await uploadBlotato.publishToAccounts({ accounts: selected, publicUrl, caption });
        const anyFailed = results.some(r => !r.ok);
        send(res, anyFailed ? 207 : 200, { ok: !anyFailed, results });
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  // Return the source TSX of a composition (used by AI Studio edit mode).
  if (/^\/api\/compositions\/[^/]+\/source$/.test(pathname) && req.method === 'GET') {
    const compId = decodeURIComponent(pathname.split('/')[3]);
    try {
      const comp = compositions.listCompositions().find(c => c.id === compId);
      if (!comp) return send(res, 404, { error: 'composition not found' });
      let filePath;
      if (compId.startsWith('Block-')) {
        filePath = path.join(__dirname, '..', 'src', 'blocks', `${comp.component}.tsx`);
      } else if (comp.importPath) {
        filePath = path.join(__dirname, '..', 'src', comp.importPath.replace(/^\.\//, '') + '.tsx');
      }
      if (!filePath || !fs.existsSync(filePath)) return send(res, 404, { error: 'source file not found' });
      const code = fs.readFileSync(filePath, 'utf8');
      return send(res, 200, { code, filePath: path.relative(path.join(__dirname, '..'), filePath), component: comp.component });
    } catch (err) {
      return send(res, 500, { error: err.message });
    }
  }

  // AI Studio edit-mode save: overwrite the original composition's TSX file
  // with edited code. compId locates the target file; code is the new TSX.
  if (pathname === '/api/ai/studio/save-edit' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const { sourceId, code } = JSON.parse(body || '{}');
        if (!sourceId || !code) return send(res, 400, { error: 'sourceId and code required' });
        const comp = compositions.listCompositions().find(c => c.id === sourceId);
        if (!comp) return send(res, 404, { error: 'source composition not found' });
        let filePath;
        if (sourceId.startsWith('Block-')) {
          filePath = path.join(__dirname, '..', 'src', 'blocks', `${comp.component}.tsx`);
        } else if (comp.importPath) {
          filePath = path.join(__dirname, '..', 'src', comp.importPath.replace(/^\.\//, '') + '.tsx');
        }
        if (!filePath) return send(res, 400, { error: 'no writable source file for this composition' });
        fs.writeFileSync(filePath, code);
        send(res, 200, { ok: true, filePath: path.relative(path.join(__dirname, '..'), filePath) });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  // AI thumbnail generation via Nano Banana Pro — replaces the auto-
  // generated still frame with a YouTube-style hero image.
  if (/^\/api\/compositions\/[^/]+\/ai-thumbnail$/.test(pathname) && req.method === 'POST') {
    const compId = decodeURIComponent(pathname.split('/')[3]);
    return readBody(req, async (body) => {
      try {
        const { prompt } = JSON.parse(body || '{}');
        const result = await aiThumbnail.generate({ compId, prompt });
        send(res, 200, { ok: true, bytes: result.bytes });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  // Delete a composition's registration from wherever it lives (Root.tsx,
  // blocks/register.tsx, or hero-library/manifest.json). Source files
  // (.tsx / .mp4) are left on disk — only the composition entry is
  // removed so it stops showing in the library.
  if (/^\/api\/compositions\/[^/]+\/delete$/.test(pathname) && req.method === 'POST') {
    const compId = decodeURIComponent(pathname.split('/')[3]);
    try {
      const result = deleteComposition.deleteComposition(compId);
      return send(res, 200, { ok: true, ...result });
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
  }

  // Fork a composition — duplicate its registration with a new id so you
  // can tweak defaults/variants independently of the original.
  if (/^\/api\/compositions\/[^/]+\/fork$/.test(pathname) && req.method === 'POST') {
    const sourceId = decodeURIComponent(pathname.split('/')[3]);
    return readBody(req, (body) => {
      try {
        const { newId } = JSON.parse(body || '{}');
        if (!newId) return send(res, 400, { error: 'newId required' });
        const result = fork.forkComposition({ sourceId, newId });
        send(res, 200, { ok: true, id: result.id });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  // Live-preview prop writer: update defaultProps for <Composition id="X" />
  // inside Root.tsx so Remotion Studio hot-reloads with the new values.
  if (/^\/api\/compositions\/[^/]+\/default-props$/.test(pathname) && req.method === 'POST') {
    const compId = decodeURIComponent(pathname.split('/')[3]);
    return readBody(req, async (body) => {
      try {
        const { props } = JSON.parse(body);
        if (!props || typeof props !== 'object') return send(res, 400, { error: 'props required' });
        await liveProps.updateDefaultProps(compId, props);
        send(res, 200, { ok: true });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  if (pathname === '/api/compositions' && req.method === 'GET') {
    // Build a lookup of latest successful render per composition (for
    // hover autoplay + detail preview)
    const renders = rendersDb.list();
    const latestByComp = {};
    renders.forEach(r => {
      if (r.status === 'done' && !latestByComp[r.compositionId]) {
        latestByComp[r.compositionId] = r.filename;
      }
    });
    const list = compositions.listCompositions().map(c => ({
      ...c,
      category: categories.categoryFor(c.id),
      hasThumbnail: thumbnails.exists(c.id),
      latestRender: latestByComp[c.id] || null
    }));
    return send(res, 200, list);
  }

  if (pathname === '/api/categories' && req.method === 'GET') {
    return send(res, 200, categories.allCategories(compositions.listCompositions()));
  }

  if (pathname === '/api/thumbnails/status' && req.method === 'GET') {
    return send(res, 200, thumbnails.getStatus());
  }

  if (pathname === '/api/studio/status' && req.method === 'GET') {
    return send(res, 200, studio.getStatus());
  }

  if (pathname === '/api/studio/start' && req.method === 'POST') {
    studio.start().catch(err => console.warn('[studio] start error', err));
    return send(res, 200, studio.getStatus());
  }

  if (pathname.startsWith('/api/thumbnails/regenerate/') && req.method === 'POST') {
    const id = decodeURIComponent(pathname.split('/').pop());
    const comp = compositions.listCompositions().find(c => c.id === id);
    if (!comp) return send(res, 404, { error: 'composition not found' });
    thumbnails.regenerate(comp);
    return send(res, 200, { ok: true, queued: id });
  }

  if (pathname.startsWith('/thumbnails/') && req.method === 'GET') {
    const id = decodeURIComponent(pathname.replace('/thumbnails/', '').replace('.png', ''));
    const file = thumbnails.thumbnailPath(id);
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-cache' });
      return fs.createReadStream(file).pipe(res);
    }
    return send(res, 404, { error: 'thumbnail not found' });
  }

  if (pathname === '/api/brandkits' && req.method === 'GET') {
    return send(res, 200, brandkits.list());
  }

  if (pathname === '/api/brandkits' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const kit = JSON.parse(body);
        if (!kit.id) return send(res, 400, { error: 'id required' });
        brandkits.upsert(kit);
        send(res, 200, kit);
      } catch (err) { send(res, 400, { error: err.message }); }
    });
  }

  if (pathname.startsWith('/api/brandkits/') && req.method === 'DELETE') {
    const id = pathname.split('/').pop();
    brandkits.remove(id);
    return send(res, 200, { ok: true });
  }

  if (pathname === '/api/renders' && req.method === 'GET') {
    return send(res, 200, rendersDb.list());
  }

  if (pathname === '/api/imports/preview' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const opts = JSON.parse(body);
        if (!opts.code) return send(res, 400, { error: 'code required' });
        const preview = importer.createPreview({
          durationInFrames: parseInt(opts.durationInFrames, 10) || 150,
          fps: parseInt(opts.fps, 10) || 30,
          width: parseInt(opts.width, 10) || 1920,
          height: parseInt(opts.height, 10) || 1080,
          code: opts.code
        });
        // Immediately start a render of the preview
        const render = renderer.startRender({
          compositionId: preview.compId,
          props: {},
          label: `Preview: ${preview.compId}`
        });
        send(res, 200, { ok: true, preview, render });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  if (pathname === '/api/imports/finalise' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const { previewCompId, name } = JSON.parse(body);
        if (!previewCompId || !name) return send(res, 400, { error: 'previewCompId and name required' });
        const result = importer.finalisePreview(previewCompId, name);
        // Queue thumbnail for the newly-named comp
        const comp = compositions.listCompositions().find(c => c.id === result.compId);
        if (comp) thumbnails.queueMissing([comp]);
        send(res, 200, { ok: true, ...result });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  if (pathname.startsWith('/api/variants/') && req.method === 'GET') {
    const compId = decodeURIComponent(pathname.replace('/api/variants/', ''));
    return send(res, 200, variants.listFor(compId));
  }

  if (pathname.startsWith('/api/variants/') && req.method === 'POST') {
    const compId = decodeURIComponent(pathname.replace('/api/variants/', ''));
    return readBody(req, (body) => {
      try {
        const variant = JSON.parse(body);
        const saved = variants.saveVariant(compId, variant);
        send(res, 200, saved);
      } catch (err) { send(res, 400, { error: err.message }); }
    });
  }

  if (pathname.startsWith('/api/variants/') && req.method === 'DELETE') {
    const parts = pathname.split('/');
    const compId = decodeURIComponent(parts[3]);
    const variantId = decodeURIComponent(parts[4]);
    variants.removeVariant(compId, variantId);
    return send(res, 200, { ok: true });
  }

  if (pathname === '/api/ai/compose' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { description, provider } = JSON.parse(body);
        if (!description || !description.trim()) return send(res, 400, { error: 'description required' });
        const comps = compositions.listCompositions().map(c => ({
          ...c,
          category: categories.categoryFor(c.id)
        }));
        const plan = await aiCompose.compose(description, comps, provider || 'auto');
        send(res, 200, plan);
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  if (pathname === '/api/ai/providers' && req.method === 'GET') {
    return send(res, 200, aiCompose.availableProviders());
  }

  if (pathname === '/api/ai/studio/chat' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { messages, provider } = JSON.parse(body);
        if (!Array.isArray(messages) || messages.length === 0) return send(res, 400, { error: 'messages required' });
        const result = await aiStudio.chat(messages, provider || 'auto');
        const code = aiStudio.extractTsxBlock(result.reply);
        const truncated = aiStudio.looksTruncated(result.reply);
        send(res, 200, { reply: result.reply, providerUsed: result.providerUsed, code, truncated });
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  if (pathname === '/api/ai/studio/preview' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const { code, durationInFrames, fps, width, height } = JSON.parse(body);
        if (!code || !code.trim()) return send(res, 400, { error: 'code required' });
        const preview = importer.createPreview({
          durationInFrames: parseInt(durationInFrames, 10) || 150,
          fps: parseInt(fps, 10) || 30,
          width: parseInt(width, 10) || 1920,
          height: parseInt(height, 10) || 1080,
          code
        });
        const render = renderer.startRender({
          compositionId: preview.compId,
          props: {},
          label: `AI Studio: ${preview.compId}`
        });
        send(res, 200, { ok: true, preview, render });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  if (pathname === '/api/cleanup/preview' && req.method === 'GET') {
    return send(res, 200, {
      broken: cleanup.findBrokenAutoGenerated(),
      allAutoGenerated: cleanup.findAllAutoGenerated()
    });
  }

  if (pathname === '/api/cleanup/broken' && req.method === 'POST') {
    const ids = cleanup.findBrokenAutoGenerated();
    const cleaned = cleanup.cleanAll(ids);
    return send(res, 200, { ok: true, cleaned });
  }

  if (pathname === '/api/cleanup/all-auto' && req.method === 'POST') {
    const ids = cleanup.findAllAutoGenerated();
    const cleaned = cleanup.cleanAll(ids);
    return send(res, 200, { ok: true, cleaned });
  }

  if (pathname === '/api/ai/upload-image' && req.method === 'POST') {
    return upload.saveFiles(req, res, IMAGES_DIR, (r, status, body) => {
      if (body.ok && body.files) {
        // Mirror to Remotion public/images/ so staticFile resolves
        if (!fs.existsSync(REMOTION_IMAGES_DIR)) fs.mkdirSync(REMOTION_IMAGES_DIR, { recursive: true });
        body.files.forEach(f => {
          const dst = path.join(REMOTION_IMAGES_DIR, f.filename);
          try { fs.copyFileSync(f.path, dst); } catch (err) { console.warn('[ai-upload] mirror failed', err); }
          f.staticPath = `images/${f.filename}`;
          f.url = `/ai-images/${f.filename}`;
        });
      }
      send(r, status, body);
    });
  }

  if (pathname.startsWith('/ai-images/') && req.method === 'GET') {
    const name = pathname.replace('/ai-images/', '');
    const file = path.join(IMAGES_DIR, name);
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'image/png' });
      return fs.createReadStream(file).pipe(res);
    }
    return send(res, 404, { error: 'image not found' });
  }

  if (pathname === '/api/ai/generate' && req.method === 'POST') {
    return readBody(req, async (body) => {
      try {
        const { description, images, provider } = JSON.parse(body);
        if (!description || !description.trim()) return send(res, 400, { error: 'description required' });
        const imagePaths = (images || []).map(p => p.startsWith('images/') ? p : `images/${p}`);
        const plan = await aiGenerate.generate(description, imagePaths, provider || 'auto');
        send(res, 200, plan);
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  if (pathname === '/api/ai/render-plan' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const { plan } = JSON.parse(body);
        if (!plan) return send(res, 400, { error: 'plan required' });
        const result = compilePlan.compilePlan(plan);
        const render = renderer.startRender({
          compositionId: result.compId,
          props: {},
          label: `AI Generated: ${plan.name || result.compId}`
        });
        send(res, 200, { ok: true, compId: result.compId, render });
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  if (pathname === '/api/ai/discard' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const { compId } = JSON.parse(body);
        if (!compId) return send(res, 400, { error: 'compId required' });
        compilePlan.discardGenerated(compId);
        send(res, 200, { ok: true });
      } catch (err) {
        send(res, 500, { error: err.message });
      }
    });
  }

  if (pathname === '/api/timeline/upload-music' && req.method === 'POST') {
    return upload.saveAudio(req, res, AUDIO_DIR, (r, status, body) => {
      if (body.ok) body.url = `/audio/${body.filename}`;
      send(r, status, body);
    });
  }

  if (pathname.startsWith('/audio/') && req.method === 'GET') {
    const name = pathname.replace('/audio/', '');
    const file = path.join(AUDIO_DIR, name);
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'audio/mpeg' });
      return fs.createReadStream(file).pipe(res);
    }
    return send(res, 404, { error: 'audio not found' });
  }

  if (pathname === '/api/timeline/render' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const parsed = JSON.parse(body);
        const { items, fps, width, height, musicUrl, musicVolume, crossfadeFrames, preview, noRender } = parsed;
        if (!items || !items.length) return send(res, 400, { error: 'items required' });
        const all = compositions.listCompositions();
        const enriched = items.map(it => {
          const comp = all.find(c => c.id === it.compId);
          if (!comp) throw new Error(`Composition not found: ${it.compId}`);
          const defaults = (comp.defaultProps && !comp.defaultProps.__parseError) ? comp.defaultProps : {};
          return {
            compId: it.compId,
            component: comp.component,
            importPath: comp.importPath,
            durationInFrames: it.durationInFrames || comp.durationInFrames,
            sourceDuration: it.sourceDuration || comp.durationInFrames,
            trimStart: it.trimStart || 0,
            trimEnd: it.trimEnd != null ? it.trimEnd : comp.durationInFrames,
            props: { ...defaults, ...(it.props || {}) }
          };
        });
        const project = timeline.generateProject(enriched, {
          fps: fps || 30,
          width: width || 1920,
          height: height || 1080,
          musicUrl: musicUrl || undefined,
          musicVolume: musicVolume != null ? musicVolume : 0.5,
          crossfadeFrames: crossfadeFrames || 0,
          preview: !!preview
        });
        // If noRender is set (live preview mode), skip the MP4 render —
        // Studio iframe is the source of truth for preview playback.
        if (noRender) {
          return send(res, 200, { ok: true, project, render: null });
        }
        const render = renderer.startRender({
          compositionId: project.compId,
          props: {},
          label: `Timeline: ${project.compId}`
        });
        send(res, 200, { ok: true, project, render });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  if (pathname === '/api/timeline/save' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const project = JSON.parse(body);
        if (!project.id) project.id = Date.now().toString(36);
        project.updatedAt = Date.now();
        timeline.saveProject(project);
        send(res, 200, { ok: true, project });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  if (pathname === '/api/timeline/projects' && req.method === 'GET') {
    return send(res, 200, timeline.listProjects());
  }

  if (pathname.startsWith('/api/timeline/projects/') && req.method === 'DELETE') {
    const id = decodeURIComponent(pathname.split('/').pop());
    timeline.deleteProject(id);
    return send(res, 200, { ok: true });
  }

  if (pathname === '/api/imports/discard' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const { previewCompId } = JSON.parse(body);
        if (!previewCompId) return send(res, 400, { error: 'previewCompId required' });
        importer.discardPreview(previewCompId);
        send(res, 200, { ok: true });
      } catch (err) {
        send(res, 400, { error: err.message });
      }
    });
  }

  if (pathname === '/api/render' && req.method === 'POST') {
    return readBody(req, (body) => {
      try {
        const { compositionId, props, label, extraAspects } = JSON.parse(body);
        if (!compositionId) return send(res, 400, { error: 'compositionId required' });
        const result = renderer.startRender({ compositionId, props: props || {}, label, extraAspects: extraAspects || [] });
        send(res, 200, result);
      } catch (err) { send(res, 500, { error: err.message }); }
    });
  }

  if (pathname.startsWith('/api/renders/') && pathname.endsWith('/stream')) {
    const id = pathname.split('/')[3];
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    const unsubscribe = renderer.subscribe(id, (state) => {
      res.write(`data: ${JSON.stringify({
        progress: state.progress, line: state.line, status: state.status
      })}\n\n`);
      if (state.status === 'done' || state.status === 'failed') {
        setTimeout(() => { unsubscribe(); res.end(); }, 200);
      }
    });
    req.on('close', unsubscribe);
    return;
  }

  // ─── Serve rendered videos from /out ──────────────────────────────────────
  if (pathname.startsWith('/out/')) {
    const filePath = path.join(renderer.OUT_DIR, pathname.replace('/out/', ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      return fs.createReadStream(filePath).pipe(res);
    }
    return send(res, 404, { error: 'not found' });
  }

  // ─── Static files ─────────────────────────────────────────────────────────
  const filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    return fs.createReadStream(filePath).pipe(res);
  }

  send(res, 404, { error: 'not found' });
});

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(json);
}

function readBody(req, cb) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => cb(body));
}

server.listen(PORT, () => {
  console.log(`\n  🎬 Video Agent Dashboard\n  → http://localhost:${PORT}\n`);
  const comps = compositions.listCompositions();
  thumbnails.queueMissing(comps).catch(err => console.warn('[thumbnails] queue error', err));

  // Boot Remotion Studio in the background so the iframe has something to
  // embed by the time the user opens a composition.
  studio.start()
    .then(s => console.log(`[studio] starting → ${s.status}`))
    .catch(err => console.warn('[studio] start failed', err));
});

process.on('SIGINT', () => {
  console.log('\n[dashboard] shutting down…');
  studio.stop();
  process.exit(0);
});
