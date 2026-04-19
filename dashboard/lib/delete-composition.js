// Delete a composition by its id. Handles the three places where
// compositions live:
//   1. hero-* / H-*   → remove from public/hero-library/manifest.json
//   2. Block-*        → remove entry from src/blocks/register.tsx BLOCKS array
//   3. Everything else → remove <Composition id="X" /> from src/Root.tsx
//
// We never delete source .tsx files or MP4s — only the registration.
// That way the user can always re-add something by editing the file.
const fs = require('fs');
const path = require('path');

const ROOT_FILE = path.join(__dirname, '..', '..', 'src', 'Root.tsx');
const REGISTER_FILE = path.join(__dirname, '..', '..', 'src', 'blocks', 'register.tsx');
const HERO_MANIFEST = path.join(__dirname, '..', '..', 'public', 'hero-library', 'manifest.json');

function deleteComposition(compId) {
  if (!compId) throw new Error('compId required');
  if (compId.startsWith('hero-') || compId.startsWith('H-')) {
    return deleteFromHeroManifest(compId);
  }
  if (compId.startsWith('Block-')) {
    return deleteFromBlocksRegister(compId);
  }
  return deleteFromRoot(compId);
}

function deleteFromHeroManifest(compId) {
  if (!fs.existsSync(HERO_MANIFEST)) throw new Error('hero manifest missing');
  const manifest = JSON.parse(fs.readFileSync(HERO_MANIFEST, 'utf8'));
  const before = (manifest.clips || []).length;
  // Map compId back to manifest entry: id matches loosely (strip prefix)
  manifest.clips = (manifest.clips || []).filter(c => {
    const cleaned = String(c.id || c.filename).replace(/[^A-Za-z0-9-]/g, '-');
    const mapped = (/^[A-Za-z]/.test(cleaned) ? cleaned : 'H-' + cleaned).slice(0, 60);
    return mapped !== compId;
  });
  const removed = before - manifest.clips.length;
  if (!removed) throw new Error(`hero clip ${compId} not found in manifest`);
  fs.writeFileSync(HERO_MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  return { kind: 'hero', removed };
}

function deleteFromBlocksRegister(compId) {
  const code = fs.readFileSync(REGISTER_FILE, 'utf8');
  const needle = `id: '${compId}'`;
  const idx = code.indexOf(needle);
  if (idx === -1) throw new Error(`block ${compId} not found in register.tsx`);
  // Entry spans from the '{' before this id to its matching '}' — remove
  // the whole `{ ... },` segment.
  const entryStart = code.lastIndexOf('{', idx);
  if (entryStart === -1) throw new Error('could not locate entry opening brace');
  let depth = 1;
  let end = entryStart;
  for (let j = entryStart + 1; j < code.length; j++) {
    const ch = code[j];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (depth !== 0) throw new Error('unbalanced braces in entry');
  // Also consume the trailing comma + any whitespace on the same deletion line
  let tail = end + 1;
  while (tail < code.length && /[\s,]/.test(code[tail])) {
    const ch = code[tail];
    tail++;
    if (ch === '\n') break;
  }
  const head = entryStart;
  const updated = code.slice(0, head) + code.slice(tail);
  fs.writeFileSync(REGISTER_FILE, updated);
  return { kind: 'block', removed: 1 };
}

function deleteFromRoot(compId) {
  const code = fs.readFileSync(ROOT_FILE, 'utf8');
  const idPattern = `id="${compId}"`;
  const idIdx = code.indexOf(idPattern);
  if (idIdx === -1) throw new Error(`composition ${compId} not found in Root.tsx`);
  const blockStart = code.lastIndexOf('<Composition', idIdx);
  if (blockStart === -1) throw new Error('could not locate <Composition opening');
  // Find the /> that closes this block, skipping nested braces
  let depth = 0;
  let blockEnd = -1;
  for (let i = blockStart + 1; i < code.length - 1; i++) {
    const ch = code[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (depth === 0 && ch === '/' && code[i + 1] === '>') { blockEnd = i + 2; break; }
  }
  if (blockEnd === -1) throw new Error('could not locate /> of Composition');
  // Consume a leading comment on the same line (e.g. `{/* Imported: X */}`)
  // and any trailing whitespace up to the next line break so we don't leave
  // a blank hole.
  let head = blockStart;
  const prevLineStart = code.lastIndexOf('\n', blockStart) + 1;
  const preceding = code.slice(prevLineStart, blockStart).trim();
  if (/^\{\s*\/\*.*\*\/\s*\}$/.test(preceding)) {
    head = prevLineStart;
  }
  let tail = blockEnd;
  while (tail < code.length && code[tail] !== '\n') tail++;
  if (tail < code.length) tail++;
  const updated = code.slice(0, head) + code.slice(tail);
  fs.writeFileSync(ROOT_FILE, updated);
  return { kind: 'root', removed: 1 };
}

module.exports = { deleteComposition };
