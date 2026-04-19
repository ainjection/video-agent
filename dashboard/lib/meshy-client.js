// Minimal Meshy text-to-3D client. Used by the hero-library pipeline to
// generate .glb assets from text prompts, without the user having to open
// the Meshy web app.
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MESHY_HOST = 'api.meshy.ai';

function resolveKey(varName) {
  if (process.env[varName]) return process.env[varName];
  const candidates = [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '..', '.env')];
  const re = new RegExp(varName + '\\s*=\\s*([^\\r\\n]+)');
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const m = fs.readFileSync(p, 'utf8').match(re);
      if (m && m[1].trim().length > 10) return m[1].trim();
    } catch {}
  }
  return null;
}

function req({ method, pathName, body }) {
  return new Promise((resolve, reject) => {
    const apiKey = resolveKey('MESHY_API_KEY');
    if (!apiKey) return reject(new Error('MESHY_API_KEY not set'));
    const payload = body ? JSON.stringify(body) : null;
    const r = https.request({
      hostname: MESHY_HOST,
      path: pathName,
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try {
          const parsed = buf ? JSON.parse(buf) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`Meshy ${res.statusCode}: ${JSON.stringify(parsed).slice(0, 400)}`));
        } catch {
          reject(new Error(`Meshy parse error: ${buf.slice(0, 400)}`));
        }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

// Create a preview-mode text-to-3D task. Returns the task id.
async function startPreview(prompt, opts = {}) {
  const data = await req({
    method: 'POST',
    pathName: '/openapi/v2/text-to-3d',
    body: {
      mode: 'preview',
      prompt,
      art_style: opts.art_style || 'realistic',
      ai_model: opts.ai_model || 'meshy-5',
      should_remesh: true
    }
  });
  return data.result;
}

async function startRefine(previewTaskId) {
  const data = await req({
    method: 'POST',
    pathName: '/openapi/v2/text-to-3d',
    body: { mode: 'refine', preview_task_id: previewTaskId }
  });
  return data.result;
}

async function getTask(taskId) {
  return req({ method: 'GET', pathName: `/openapi/v2/text-to-3d/${taskId}` });
}

function downloadTo(url, outPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https:') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadTo(res.headers.location, outPath).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`download ${res.statusCode} for ${url.slice(0, 80)}`));
      const f = fs.createWriteStream(outPath);
      res.pipe(f);
      f.on('finish', () => f.close(() => resolve(outPath)));
      f.on('error', reject);
    }).on('error', reject);
  });
}

async function waitForTask(taskId, { pollMs = 5000, timeoutMs = 10 * 60 * 1000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const data = await getTask(taskId);
    if (data.status === 'SUCCEEDED') return data;
    if (data.status === 'FAILED' || data.status === 'EXPIRED' || data.status === 'CANCELED') {
      throw new Error(`task ${taskId} ${data.status}: ${data.task_error?.message || 'no message'}`);
    }
    await new Promise(r => setTimeout(r, pollMs));
  }
  throw new Error(`task ${taskId} timed out after ${timeoutMs / 1000}s`);
}

module.exports = { startPreview, startRefine, getTask, waitForTask, downloadTo };
