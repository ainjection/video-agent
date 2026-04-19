// Parses Root.tsx to extract the list of registered compositions plus
// their metadata (id, duration, fps, width, height, defaultProps).
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', '..', 'src');
const ROOT_FILE = path.join(SRC_DIR, 'Root.tsx');
const REGISTER_FILE = path.join(SRC_DIR, 'blocks', 'register.tsx');

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
  // Auto-pull blocks registered via <BlockCompositions /> — they live in
  // src/blocks/register.tsx as a BLOCKS array, not as literal <Composition>
  // tags, so the regex above won't see them.
  compositions.push(...listBlockCompositions());
  // Hero clips — generated from the manifest in public/hero-library/.
  compositions.push(...listHeroCompositions());
  return compositions;
}

function listHeroCompositions() {
  const manifestFile = path.join(__dirname, '..', '..', 'public', 'hero-library', 'manifest.json');
  if (!fs.existsSync(manifestFile)) return [];
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const clips = Array.isArray(manifest.clips) ? manifest.clips : [];
    return clips.map(c => {
      const cleaned = String(c.id || c.filename).replace(/[^A-Za-z0-9-]/g, '-');
      const compId = (/^[A-Za-z]/.test(cleaned) ? cleaned : 'H-' + cleaned).slice(0, 60);
      const seconds = c.durationSeconds || 2.5;
      return {
        id: compId,
        component: 'HeroClip',
        importPath: './HeroClip',
        durationInFrames: Math.max(15, Math.round(seconds * 30)),
        fps: 30,
        width: 1920,
        height: 1080,
        defaultProps: {
          src: `hero-library/${c.filename}`,
          overlayText: '',
          overlayColor: '#ffffff',
          overlayFontSize: 140,
          overlayAlign: 'bottom',
          darken: 0
        }
      };
    });
  } catch {
    return [];
  }
}

function listBlockCompositions() {
  if (!fs.existsSync(REGISTER_FILE)) return [];
  const src = fs.readFileSync(REGISTER_FILE, 'utf8');
  const out = [];
  // Grab each entry: { id: 'Block-X', component: X, defaultProps: { … } }
  const entryRe = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*component:\s*(\w+)\s*,\s*defaultProps:/g;
  let em;
  while ((em = entryRe.exec(src)) !== null) {
    const id = em[1];
    const component = em[2];
    // Extract the defaultProps object that follows the match — find the first
    // `{` after the cursor and walk balanced braces.
    const startKey = src.indexOf('defaultProps:', em.index);
    const firstBrace = src.indexOf('{', startKey + 'defaultProps:'.length);
    let depth = 1;
    let end = firstBrace;
    for (let j = firstBrace + 1; j < src.length; j++) {
      const ch = src[j];
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { end = j; break; } }
    }
    let defaultProps = {};
    try { defaultProps = jsonLoose(src.substring(firstBrace, end + 1)); } catch {}
    out.push({
      id,
      component,
      importPath: './blocks',
      durationInFrames: 90,
      fps: 30,
      width: 1920,
      height: 1080,
      defaultProps
    });
  }
  return out;
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
        // For "Foo as Bar", Bar is the local binding — that's the name used
        // as the component reference, so it's the key we need in the map.
        const [original, alias] = part.trim().split(/\s+as\s+/).map(s => s.trim());
        const localName = alias || original;
        if (localName) map[localName] = sourcePath;
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
  // Convert single-quoted strings to double-quoted (handles escaped single quotes)
  s = s.replace(/'((?:[^'\\]|\\.)*)'/g, (_, body) => {
    return '"' + body.replace(/"/g, '\\"').replace(/\\'/g, "'") + '"';
  });
  // Remove trailing commas
  s = s.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(s);
}

module.exports = { listCompositions };
