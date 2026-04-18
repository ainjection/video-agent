// Fork a composition: add a new <Composition> entry (or BLOCKS array entry
// for Block-* ids) that reuses the same component under a new id, with the
// current defaults copied in. No file duplication — the original TSX is
// still the source of truth.
const fs = require('fs');
const path = require('path');

const ROOT_FILE = path.join(__dirname, '..', '..', 'src', 'Root.tsx');
const REGISTER_FILE = path.join(__dirname, '..', '..', 'src', 'blocks', 'register.tsx');

const ID_RE = /^[A-Za-z][A-Za-z0-9-]{0,59}$/;

function sanitizeId(name) {
  const cleaned = String(name || '').trim().replace(/[^A-Za-z0-9-]/g, '-');
  const withLetter = /^[A-Za-z]/.test(cleaned) ? cleaned : 'Fork-' + cleaned;
  return withLetter.slice(0, 60) || `Fork-${Date.now()}`;
}

function idTaken(newId) {
  if (fs.existsSync(ROOT_FILE) && fs.readFileSync(ROOT_FILE, 'utf8').includes(`id="${newId}"`)) return true;
  if (fs.existsSync(REGISTER_FILE) && fs.readFileSync(REGISTER_FILE, 'utf8').includes(`'${newId}'`)) return true;
  return false;
}

function forkComposition({ sourceId, newId }) {
  const finalId = sanitizeId(newId);
  if (!ID_RE.test(finalId)) throw new Error(`invalid id: ${finalId}`);
  if (idTaken(finalId)) throw new Error(`id "${finalId}" is already in use`);

  if (sourceId.startsWith('Block-')) {
    forkBlockEntry(sourceId, finalId);
  } else {
    forkRootComposition(sourceId, finalId);
  }
  return { id: finalId };
}

function forkBlockEntry(sourceId, newId) {
  const code = fs.readFileSync(REGISTER_FILE, 'utf8');
  const needle = `id: '${sourceId}'`;
  const idx = code.indexOf(needle);
  if (idx === -1) throw new Error(`Block ${sourceId} not found`);
  // Entry starts at the nearest '{' before idx
  const entryStart = code.lastIndexOf('{', idx);
  if (entryStart === -1) throw new Error('could not locate entry opening brace');
  // Walk balanced braces from entryStart to find end
  let depth = 1;
  let end = entryStart;
  for (let j = entryStart + 1; j < code.length; j++) {
    const ch = code[j];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (depth !== 0) throw new Error('unbalanced braces in entry');
  const originalEntry = code.slice(entryStart, end + 1);
  const forkedEntry = originalEntry.replace(needle, `id: '${newId}'`);
  // Insert right after the original entry (before its trailing comma)
  const insertAt = end + 1;
  const updated = code.slice(0, insertAt) + ',\n  ' + forkedEntry + code.slice(insertAt);
  fs.writeFileSync(REGISTER_FILE, updated);
}

function forkRootComposition(sourceId, newId) {
  const code = fs.readFileSync(ROOT_FILE, 'utf8');
  const idPattern = `id="${sourceId}"`;
  const idIdx = code.indexOf(idPattern);
  if (idIdx === -1) throw new Error(`composition ${sourceId} not found in Root.tsx`);
  const blockStart = code.lastIndexOf('<Composition', idIdx);
  if (blockStart === -1) throw new Error('could not locate <Composition opening');
  let depth = 0;
  let blockEnd = -1;
  for (let i = blockStart + 1; i < code.length - 1; i++) {
    const ch = code[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (depth === 0 && ch === '/' && code[i + 1] === '>') { blockEnd = i + 2; break; }
  }
  if (blockEnd === -1) throw new Error('could not locate /> of Composition');
  const originalBlock = code.slice(blockStart, blockEnd);
  const forkedBlock = originalBlock.replace(idPattern, `id="${newId}"`);
  const insertAt = blockEnd;
  const updated = code.slice(0, insertAt) + '\n      ' + forkedBlock + code.slice(insertAt);
  fs.writeFileSync(ROOT_FILE, updated);
}

module.exports = { forkComposition, sanitizeId };
