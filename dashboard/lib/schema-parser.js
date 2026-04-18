// Parse a MotionKit-style schema from pasted TSX source.
// Returns: { fieldName: { type, label, default, group, min?, max?, step?, options? } }
//
// Example input:
//   schema: {
//     word1: { type: "text" as const, label: "Word 1", default: "Bold", group: "Words" },
//     fontSize: { type: "number" as const, label: "Font Size", default: 240, min: 120, max: 400, step: 10, group: "Typography" },
//     ...
//   }

function extractSchema(code) {
  const block = findBalancedValue(code, 'schema');
  if (!block) return {};

  const schema = {};
  let i = 0;
  while (i < block.length) {
    // Advance to next candidate field: `identifier : {`
    const tail = block.slice(i);
    const m = tail.match(/(\w+)\s*:\s*\{/);
    if (!m) break;

    const nameStartLocal = m.index;
    const braceOpenLocal = tail.indexOf('{', nameStartLocal);
    if (braceOpenLocal === -1) break;

    // Balance braces to find the closing }
    let depth = 1;
    let j = braceOpenLocal + 1;
    while (j < tail.length && depth > 0) {
      if (tail[j] === '{') depth++;
      else if (tail[j] === '}') depth--;
      j++;
    }
    if (depth !== 0) break;

    const fieldBlock = tail.slice(braceOpenLocal + 1, j - 1);
    const parsed = parseFieldBlock(fieldBlock);
    if (parsed.type) schema[m[1]] = parsed;

    i += j;
  }
  return schema;
}

// Find `keyword: { ... }` and return the content between the matching braces.
function findBalancedValue(code, keyword) {
  const re = new RegExp('(^|[\\s,{])' + keyword + '\\s*:\\s*\\{');
  const m = code.match(re);
  if (!m) return null;
  const openIdx = code.indexOf('{', m.index);
  let depth = 1;
  let i = openIdx + 1;
  while (i < code.length && depth > 0) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;
  return code.slice(openIdx + 1, i - 1);
}

// Parse the inside of a single field object — pull out the known keys.
function parseFieldBlock(block) {
  const field = {};
  const keys = ['type', 'label', 'default', 'group', 'min', 'max', 'step', 'placeholder'];

  for (const key of keys) {
    const value = readValue(block, key);
    if (value !== undefined) field[key] = value;
  }

  // Options for select-type fields: options: ["a", "b"] or options: [{value: "a", label: "A"}, ...]
  const optionsMatch = block.match(/options\s*:\s*(\[[\s\S]*?\])/);
  if (optionsMatch) {
    try {
      // Normalise to valid JSON: quote unquoted keys, strip "as const", etc.
      let raw = optionsMatch[1]
        .replace(/\s+as\s+const/g, '')
        .replace(/(\{|,)\s*(\w+)\s*:/g, '$1"$2":');
      field.options = JSON.parse(raw);
    } catch { /* ignore bad options list */ }
  }

  return field;
}

function readValue(block, key) {
  // Match: key: "value" | 'value' | number | true | false | identifier
  const re = new RegExp(key + '\\s*:\\s*(?:"([^"]*)"|\\\'([^\']*)\\\'|(-?\\d+(?:\\.\\d+)?)|(true|false)|(\\w+))(?:\\s+as\\s+const)?');
  const m = block.match(re);
  if (!m) return undefined;
  if (m[1] !== undefined) return m[1];
  if (m[2] !== undefined) return m[2];
  if (m[3] !== undefined) return parseFloat(m[3]);
  if (m[4] !== undefined) return m[4] === 'true';
  if (m[5] !== undefined) return m[5];
  return undefined;
}

module.exports = { extractSchema };
