// Live-preview prop writer. When a user edits the parameter form in Live
// Studio mode, we update the Composition's `defaultProps={{ ... }}` inside
// `src/Root.tsx` on a debounce. Remotion Studio watches the file → hot-
// reloads the composition → the user sees their changes immediately.
//
// We use a balanced-brace parser (not regex alone) because defaultProps
// values can contain nested objects/arrays, inline comments, trailing
// commas, etc. — all of which confuse naive regex replacement.
const fs = require('fs');
const path = require('path');

const ROOT_FILE = path.join(__dirname, '..', '..', 'src', 'Root.tsx');

// Serialise writes so a burst of form events doesn't race.
let writeChain = Promise.resolve();

function updateDefaultProps(compId, newProps) {
  writeChain = writeChain.then(async () => {
    const code = fs.readFileSync(ROOT_FILE, 'utf8');
    const updated = rewriteCompositionDefaults(code, compId, newProps);
    if (updated !== code) {
      fs.writeFileSync(ROOT_FILE, updated);
    }
  }).catch(err => {
    console.warn('[live-props] write failed', err.message);
  });
  return writeChain;
}

// Rewrite the `defaultProps={{ ... }}` of a single <Composition id="X" .../>
// block. Leaves every other composition in Root.tsx untouched.
function rewriteCompositionDefaults(code, compId, newProps) {
  const idPattern = `id="${compId}"`;
  const idIdx = code.indexOf(idPattern);
  if (idIdx === -1) throw new Error(`Composition "${compId}" not found in Root.tsx`);

  // Find the opening <Composition that contains this id
  const blockStart = code.lastIndexOf('<Composition', idIdx);
  if (blockStart === -1) throw new Error('Could not locate <Composition opening');

  // Find the self-closing "/>" for this block, skipping nested braces
  const blockEnd = findSelfClosingEnd(code, blockStart);
  if (blockEnd === -1) throw new Error('Could not locate /> of the Composition block');

  const before = code.slice(0, blockStart);
  const block = code.slice(blockStart, blockEnd + 2);
  const after = code.slice(blockEnd + 2);

  const newBlock = replaceDefaultPropsInBlock(block, newProps);
  return before + newBlock + after;
}

// Find the "/>" that closes a JSX self-closing tag starting at blockStart.
// Skips over braces since attribute expressions can contain /> inside strings
// or nested JSX (rare, but worth guarding against).
function findSelfClosingEnd(code, blockStart) {
  let depth = 0;
  for (let i = blockStart + 1; i < code.length - 1; i++) {
    const ch = code[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (depth === 0 && ch === '/' && code[i + 1] === '>') return i;
  }
  return -1;
}

// Within a single Composition's opening tag, replace any existing
// `defaultProps={...}` with the new value. If not present, inject it
// before the closing `/>`.
function replaceDefaultPropsInBlock(block, newProps) {
  const key = 'defaultProps=';
  const keyIdx = block.indexOf(key);
  const formatted = formatPropsExpression(newProps);

  if (keyIdx !== -1) {
    // Find the first "{" after defaultProps= (the JSX expression brace)
    let i = keyIdx + key.length;
    while (i < block.length && block[i] !== '{') i++;
    if (i === block.length) throw new Error('defaultProps has no value');

    // Balance braces to find the matching "}"
    let depth = 1;
    let j = i + 1;
    while (j < block.length && depth > 0) {
      if (block[j] === '{') depth++;
      else if (block[j] === '}') depth--;
      j++;
    }
    if (depth !== 0) throw new Error('Unbalanced braces in defaultProps');

    return block.slice(0, keyIdx) + `defaultProps=${formatted}` + block.slice(j);
  }

  // No existing defaultProps — insert before the /> at the end.
  const closeIdx = block.lastIndexOf('/>');
  if (closeIdx === -1) return block;
  const indent = '\n        ';
  const padding = indent + `defaultProps=${formatted}` + indent.slice(0, -2);
  return block.slice(0, closeIdx) + padding + block.slice(closeIdx);
}

// JSX expects the value in {JS_EXPR}. A JSON object is a valid JS literal,
// so we just wrap the JSON in an outer pair of braces.
function formatPropsExpression(props) {
  const json = JSON.stringify(props || {}, null, 2);
  // Indent nested lines to match our 8-space JSX indentation
  const indented = json.replace(/\n/g, '\n        ');
  return `{${indented}}`;
}

module.exports = { updateDefaultProps, rewriteCompositionDefaults };
