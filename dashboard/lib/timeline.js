const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const SRC_DIR = path.join(__dirname, '..', '..', 'src');
const IMPORTS_DIR = path.join(SRC_DIR, 'imports');
const ROOT_FILE = path.join(SRC_DIR, 'Root.tsx');
const PROJECTS_FILE = path.join(__dirname, '..', 'data', 'timeline-projects.json');

function ensureImportsDir() {
  if (!fs.existsSync(IMPORTS_DIR)) fs.mkdirSync(IMPORTS_DIR, { recursive: true });
}

// Rewrite a Root.tsx-relative import path to be relative to src/imports/
function rewriteImportPath(srcPath) {
  if (srcPath.startsWith('./imports/')) {
    return './' + srcPath.slice('./imports/'.length);
  }
  if (srcPath.startsWith('./')) {
    return '../' + srcPath.slice('./'.length);
  }
  return srcPath;
}

function sanitizeComponentName(s) {
  const base = s.replace(/[^A-Za-z0-9_]/g, '');
  const cap = base.charAt(0).toUpperCase() + base.slice(1);
  return cap || 'Component';
}

// Generate a master composition that chains the timeline items via Sequences.
// items: [{ compId, component, importPath, durationInFrames, props? }]
// Returns: { compId, filename, totalDuration }
function generateProject(items, opts = {}) {
  ensureImportsDir();
  if (!items || items.length === 0) throw new Error('Timeline has no clips');

  // When opts.preview is set, reuse a single `TimelinePreview` composition
  // and overwrite its file each time. Prevents 50+ orphaned TimelineProject
  // files building up from every keystroke in the editor.
  let compId;
  let fileSlug;
  if (opts.preview) {
    compId = 'TimelinePreview';
    fileSlug = 'TimelinePreview';
  } else if (opts.name) {
    compId = opts.name.replace(/[^A-Za-z0-9-]/g, '');
    fileSlug = compId.replace(/-/g, '');
  } else {
    const token = randomUUID().replace(/-/g, '').slice(0, 8);
    compId = `TimelineProject-${token}`;
    fileSlug = compId.replace(/-/g, '');
  }
  const filename = `${fileSlug}.tsx`;
  const filePath = path.join(IMPORTS_DIR, filename);

  // Deduplicate imports — each unique component imported once with an alias
  const importLines = [];
  const aliasMap = {}; // originalComponent → unique alias
  let aliasCounter = 0;

  items.forEach(item => {
    if (!item.component || !item.importPath) {
      throw new Error(`Missing component or importPath for clip ${item.compId}`);
    }
    if (!aliasMap[item.component + '|' + item.importPath]) {
      aliasCounter++;
      const alias = `${sanitizeComponentName(item.component)}__${aliasCounter}`;
      aliasMap[item.component + '|' + item.importPath] = alias;
      const rewritten = rewriteImportPath(item.importPath);
      importLines.push(`import { ${item.component} as ${alias} } from "${rewritten}";`);
    }
  });

  // Build sequences — spread defaultProps, handle trim ranges via nested
  // Sequence (outer sets timeline slot, inner with negative `from` shifts
  // the sub-comp's internal frame by `trimStart`), and apply opt-in
  // crossfade overlap via a Fade helper.
  const crossfadeFrames = Math.max(0, parseInt(opts.crossfadeFrames || 0, 10));

  let cursor = 0;
  const sequenceLines = items.map((item, i) => {
    const alias = aliasMap[item.component + '|' + item.importPath];
    const propsObj = item.props || {};
    const hasProps = Object.keys(propsObj).length > 0;
    const propsExpr = hasProps ? ` {...(${JSON.stringify(propsObj)} as any)}` : '';

    const trimStart = parseInt(item.trimStart || 0, 10);
    const trimEnd = item.trimEnd != null ? parseInt(item.trimEnd, 10) : (item.sourceDuration || item.durationInFrames);
    const effectiveLen = Math.max(1, trimEnd - trimStart);

    // Crossfade overlap: pull this clip's start back by crossfadeFrames from
    // the 2nd clip onwards so it overlaps the previous one.
    const slotStart = i === 0 ? cursor : cursor - crossfadeFrames;
    const slotDuration = effectiveLen;
    const shouldFadeIn = i > 0 && crossfadeFrames > 0;

    // Inner element — either the aliased component, or a trim-shifted Sequence
    const innerClip = trimStart > 0
      ? `<Sequence from={-${trimStart}}><${alias}${propsExpr} /></Sequence>`
      : `<${alias}${propsExpr} />`;

    const withFade = shouldFadeIn
      ? `<FadeIn frames={${crossfadeFrames}}>${innerClip}</FadeIn>`
      : innerClip;

    const line = `      <Sequence from={${slotStart}} durationInFrames={${slotDuration}}>${withFade}</Sequence>`;

    cursor += effectiveLen;
    return line;
  });

  const totalDuration = Math.max(1, cursor - (crossfadeFrames * Math.max(0, items.length - 1)));

  // Pull audio files into the Remotion public/ folder so <Audio> + staticFile()
  // can resolve them. Source: dashboard/data/audio/<name>. Dest: public/audio-agent/<name>.
  let musicTag = '';
  if (opts.musicUrl) {
    const name = path.basename(opts.musicUrl);
    const srcAudio = path.join(__dirname, '..', 'data', 'audio', name);
    const dstDir = path.join(__dirname, '..', '..', 'public', 'audio-agent');
    if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
    const dstAudio = path.join(dstDir, name);
    if (fs.existsSync(srcAudio) && !fs.existsSync(dstAudio)) fs.copyFileSync(srcAudio, dstAudio);
    musicTag = `      <Audio src={staticFile(${JSON.stringify('audio-agent/' + name)})} volume={${typeof opts.musicVolume === 'number' ? opts.musicVolume : 0.5}} />\n`;
  }

  const needsStaticFile = !!opts.musicUrl;
  const needsFade = crossfadeFrames > 0 && items.length > 1;

  const fadeHelper = needsFade ? `
const FadeIn: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(1, Math.max(0, frame / Math.max(1, frames)));
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
` : '';

  const imports = ['AbsoluteFill', 'Sequence'];
  if (needsStaticFile) imports.push('Audio', 'staticFile');
  if (needsFade) imports.push('useCurrentFrame');

  const code = `import React from 'react';
import { ${imports.join(', ')} } from 'remotion';
${importLines.join('\n')}
${fadeHelper}
export const ${fileSlug}: React.FC = () => {
  return (
    <AbsoluteFill>
${musicTag}${sequenceLines.join('\n')}
    </AbsoluteFill>
  );
};
`;

  fs.writeFileSync(filePath, code);

  // For preview mode: only add Root.tsx entry if it's not already there
  // (subsequent edits just overwrite the .tsx file — Remotion Studio picks
  // up the change via its file watcher).
  if (opts.preview) {
    const root = fs.readFileSync(ROOT_FILE, 'utf8');
    if (!root.includes(`./imports/${fileSlug}`)) {
      patchRootTsx({
        filename,
        componentName: fileSlug,
        compId,
        durationInFrames: totalDuration,
        fps: opts.fps || 30,
        width: opts.width || 1920,
        height: opts.height || 1080
      });
    } else {
      // Update the duration in the existing Composition entry
      updateRootDuration(compId, totalDuration);
    }
  } else {
    patchRootTsx({
      filename,
      componentName: fileSlug,
      compId,
      durationInFrames: totalDuration,
      fps: opts.fps || 30,
      width: opts.width || 1920,
      height: opts.height || 1080
    });
  }

  return { compId, filename, totalDuration, filePath, fileSlug };
}

function updateRootDuration(compId, newDuration) {
  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  const re = new RegExp(`(id="${compId}"[\\s\\S]*?durationInFrames=\\{)\\d+(\\})`);
  root = root.replace(re, `$1${newDuration}$2`);
  fs.writeFileSync(ROOT_FILE, root);
}

function patchRootTsx(o) {
  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  const importPath = `./imports/${o.filename.replace(/\.tsx$/, '')}`;
  if (root.includes(importPath)) {
    throw new Error(`${o.compId} already registered in Root.tsx`);
  }

  const importLine = `import { ${o.componentName} } from "${importPath}";\n`;
  const importRe = /^import\s[\s\S]+?;\s*$/gm;
  let lastEnd = 0;
  let m;
  while ((m = importRe.exec(root)) !== null) {
    lastEnd = m.index + m[0].length;
  }
  if (lastEnd > 0) {
    root = root.slice(0, lastEnd) + '\n' + importLine + root.slice(lastEnd);
  } else {
    root = importLine + root;
  }

  const compositionBlock = `
      {/* Timeline: ${o.compId} */}
      <Composition
        id="${o.compId}"
        component={${o.componentName}}
        durationInFrames={${o.durationInFrames}}
        fps={${o.fps}}
        width={${o.width}}
        height={${o.height}}
        defaultProps={{}}
      />
`;

  const returnOpenMatch = root.match(/return\s*\(\s*<>\s*/);
  if (!returnOpenMatch) throw new Error('Could not find return (<> ... </>) in Root.tsx');
  const idx = returnOpenMatch.index + returnOpenMatch[0].length;
  root = root.slice(0, idx) + compositionBlock + root.slice(idx);

  fs.writeFileSync(ROOT_FILE, root);
}

function removeProject(compId) {
  const fileSlug = compId.replace(/-/g, '');
  const filePath = path.join(IMPORTS_DIR, `${fileSlug}.tsx`);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}

  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  root = root.replace(new RegExp(`^import.*${fileSlug}.*\\n`, 'gm'), '');
  const compBlockRe = new RegExp(`\\s*\\{\\s*/\\*\\s*Timeline:\\s*${compId}\\s*\\*/\\s*\\}[\\s\\S]*?/>`);
  root = root.replace(compBlockRe, '');
  fs.writeFileSync(ROOT_FILE, root);
}

function listProjects() {
  if (!fs.existsSync(PROJECTS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8')); } catch { return []; }
}

function saveProject(project) {
  const all = listProjects();
  const i = all.findIndex(p => p.id === project.id);
  if (i === -1) all.push(project); else all[i] = project;
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(all, null, 2));
  return project;
}

function getProject(id) {
  return listProjects().find(p => p.id === id);
}

function deleteProject(id) {
  const all = listProjects().filter(p => p.id !== id);
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(all, null, 2));
}

module.exports = { generateProject, removeProject, listProjects, saveProject, getProject, deleteProject };
