// Compile an AI-generated block plan JSON into a Remotion composition TSX.
// Writes the file into src/imports/, patches Root.tsx, returns compId.
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const SRC_DIR = path.join(__dirname, '..', '..', 'src');
const IMPORTS_DIR = path.join(SRC_DIR, 'imports');
const ROOT_FILE = path.join(SRC_DIR, 'Root.tsx');
const CATALOG = require('./blocks-catalog');

function ensureImportsDir() {
  if (!fs.existsSync(IMPORTS_DIR)) fs.mkdirSync(IMPORTS_DIR, { recursive: true });
}

// plan: { name?, scenes: [{ block, props, duration, start?, layer? }], totalDuration?, fps?, width?, height? }
// Returns: { compId, filePath, fileSlug }
function compilePlan(plan, opts = {}) {
  ensureImportsDir();
  if (!plan || !Array.isArray(plan.scenes) || plan.scenes.length === 0) {
    throw new Error('Plan has no scenes');
  }

  // Validate every block exists in the catalog
  plan.scenes.forEach((s, i) => {
    if (!CATALOG[s.block]) throw new Error(`Unknown block at scene ${i}: ${s.block}`);
  });

  const token = randomUUID().replace(/-/g, '').slice(0, 8);
  const compId = `AIGen-${token}`;
  const fileSlug = `AIGen${token}`;
  const filename = `${fileSlug}.tsx`;
  const filePath = path.join(IMPORTS_DIR, filename);

  // Compute cursor + total duration
  const fps = plan.fps || opts.fps || 30;
  let cursor = 0;
  const sceneLines = plan.scenes.map((s) => {
    const duration = parseInt(s.duration, 10) || 60;
    const start = s.start != null ? parseInt(s.start, 10) : cursor;
    const propsJson = JSON.stringify(s.props || {});
    const line = `      <Sequence from={${start}} durationInFrames={${duration}} layout="none"><AbsoluteFill><${s.block} {...(${propsJson} as any)} /></AbsoluteFill></Sequence>`;
    if (s.start == null) cursor += duration;
    return line;
  });

  const total = parseInt(plan.totalDuration, 10) || cursor || 150;

  // Unique block names for import
  const blockNames = [...new Set(plan.scenes.map(s => s.block))];

  const code = `import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { ${blockNames.join(', ')} } from '../blocks';

export const ${fileSlug}: React.FC = () => {
  return (
    <AbsoluteFill>
${sceneLines.join('\n')}
    </AbsoluteFill>
  );
};
`;

  fs.writeFileSync(filePath, code);

  patchRootTsx({
    filename,
    componentName: fileSlug,
    compId,
    durationInFrames: total,
    fps,
    width: plan.width || opts.width || 1920,
    height: plan.height || opts.height || 1080
  });

  return { compId, filePath, fileSlug, totalDuration: total };
}

function patchRootTsx(o) {
  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  const importPath = `./imports/${o.filename.replace(/\.tsx$/, '')}`;
  if (root.includes(importPath)) throw new Error(`${o.compId} already registered in Root.tsx`);

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

  const block = `
      {/* AIGen: ${o.compId} */}
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
  root = root.slice(0, idx) + block + root.slice(idx);
  fs.writeFileSync(ROOT_FILE, root);
}

function discardGenerated(compId) {
  const fileSlug = compId.replace(/-/g, '');
  const filePath = path.join(IMPORTS_DIR, `${fileSlug}.tsx`);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  root = root.replace(new RegExp(`^import.*${fileSlug}.*\\n`, 'gm'), '');
  const compBlockRe = new RegExp(`\\s*\\{\\s*/\\*\\s*AIGen:\\s*${compId}\\s*\\*/\\s*\\}[\\s\\S]*?/>`);
  root = root.replace(compBlockRe, '');
  fs.writeFileSync(ROOT_FILE, root);
}

module.exports = { compilePlan, discardGenerated };
