// Parses Root.tsx to extract the list of registered compositions plus
// their metadata (id, duration, fps, width, height, defaultProps).
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', '..', 'src');
const ROOT_FILE = path.join(SRC_DIR, 'Root.tsx');

function listCompositions() {
  const root = fs.readFileSync(ROOT_FILE, 'utf8');
  const importMap = buildImportMap(root);
  const compositions = [];
  const re = /<Composition\b([\s\S]*?)\/>/g;
  let m;
  while ((m = re.exec(root)) !== null) {
    const block = m[1];
    const component = getJsxProp(block, 'component');
    const comp = {
      id: getProp(block, 'id'),
      component,
      importPath: component ? importMap[component] || null : null,
      durationInFrames: toInt(getJsxProp(block, 'durationInFrames')) || 150,
      fps: toInt(getJsxProp(block, 'fps')) || 30,
      width: toInt(getJsxProp(block, 'width')) || 1920,
      height: toInt(getJsxProp(block, 'height')) || 1080,
      defaultProps: extractDefaultProps(block)
    };
    if (comp.id) compositions.push(comp);
  }
  return compositions;
}

// Scans all `import { A, B } from "./path";` statements and maps each
// imported identifier to its source path.
function buildImportMap(root) {
  const map = {};
  const re = /import\s+(?:(\w+)|{([^}]+)})\s+from\s+["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(root)) !== null) {
    const defaultName = m[1];
    const namedBlock = m[2];
    const sourcePath = m[3];
    if (defaultName) map[defaultName] = sourcePath;
    if (namedBlock) {
      namedBlock.split(',').forEach(part => {
        const name = part.trim().split(/\s+as\s+/)[0].trim();
        if (name) map[name] = sourcePath;
      });
    }
  }
  return map;
}

function getProp(block, name) {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`);
  const m = block.match(re);
  return m ? m[1] : null;
}

function getJsxProp(block, name) {
  const re = new RegExp(`${name}\\s*=\\s*\\{([^}]+)\\}`);
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

function toInt(s) {
  if (!s) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function extractDefaultProps(block) {
  // Find defaultProps={{ ... }} block — match outermost braces
  const key = 'defaultProps';
  const keyIdx = block.indexOf(key);
  if (keyIdx === -1) return {};
  let i = block.indexOf('{', keyIdx);
  if (i === -1) return {};
  i = block.indexOf('{', i + 1); // second brace opens the object literal
  if (i === -1) return {};
  const start = i;
  let depth = 1;
  let end = start;
  for (let j = start + 1; j < block.length; j++) {
    const ch = block[j];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  const objSrc = block.substring(start, end + 1);
  try {
    return jsonLoose(objSrc);
  } catch (err) {
    return { __parseError: err.message };
  }
}

// Very loose JSON parser for Remotion defaultProps. Handles strings, numbers,
// booleans, arrays, nested objects, trailing commas, unquoted keys.
function jsonLoose(src) {
  // Normalise to valid JSON
  let s = src.trim();
  // Quote unquoted keys: {foo: 1} → {"foo": 1}
  s = s.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
  // Remove trailing commas
  s = s.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(s);
}

module.exports = { listCompositions };
