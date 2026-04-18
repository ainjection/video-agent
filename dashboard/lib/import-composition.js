const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { extractSchema } = require('./schema-parser');
const schemasDb = require('./schemas');

const SRC_DIR = path.join(__dirname, '..', '..', 'src');
const IMPORTS_DIR = path.join(SRC_DIR, 'imports');
const ROOT_FILE = path.join(SRC_DIR, 'Root.tsx');

function ensureImportsDir() {
  if (!fs.existsSync(IMPORTS_DIR)) fs.mkdirSync(IMPORTS_DIR, { recursive: true });
}

// Remotion's composition id rule: only a-z, A-Z, 0-9, CJK, and hyphens.
// Must also start with a letter. File names follow the same rules so the
// generated TS imports resolve cleanly.
function sanitizeId(name) {
  const cleaned = (name || '').replace(/[^A-Za-z0-9-]/g, '');
  const final = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return (final.match(/^[A-Za-z]/) ? final : 'I' + final).slice(0, 60) || `Imported${Date.now()}`;
}

// Scan the pasted code for default values in BOTH schema styles we've seen
// shipped by MotionKit-style presets:
//   A) Zod:        fieldName: z.string().default("hello")
//   B) MotionKit:  fieldName: { type: "text", default: "hello", ... }
// Either way, we inject the extracted values as hardcoded defaults so the
// component always renders with something real and never crashes on
// undefined.trim() etc.
function extractZodDefaults(code) {
  const defaults = {};

  // Pattern A — zod chains
  const zodRe = /(\w+)\s*:\s*z\.\w+\([^)]*\)(?:\.[\w]+\([^)]*\))*\.default\(([\s\S]*?)\)(?=\s*(?:,|\}))/g;
  let m;
  while ((m = zodRe.exec(code)) !== null) {
    defaults[m[1]] = m[2].trim();
  }

  // Pattern B — MotionKit schema object
  // Match: fieldName: { ...any-non-brace-content..., default: VALUE, ...
  // Value stops at comma or newline (assumes primitive values only).
  const mkRe = /(\w+)\s*:\s*\{[^{}]*?default\s*:\s*([^,\n}]+)/g;
  while ((m = mkRe.exec(code)) !== null) {
    if (!defaults[m[1]]) {
      defaults[m[1]] = m[2].trim();
    }
  }

  return defaults;
}

function formatDefaultsObject(defaults) {
  const entries = Object.entries(defaults).map(([k, v]) => `    ${JSON.stringify(k)}: ${v}`);
  return `{\n${entries.join(',\n')}\n  }`;
}

// Detect what the user pasted. Handles several patterns:
//  a) export const Foo: React.FC = ... / export const Foo = (...) => ...
//  b) export function Foo(...)
//  c) export default Foo  (where Foo is a PascalCase identifier)
//  d) const preset = { component: Foo }; export default preset;
//  e) Raw JSX body (no exports at all) — treat as a function body to wrap
function detectComponentSource(code) {
  // CHECK PRESET PATTERN FIRST. MotionKit presets often use PascalCase names
  // for the preset object itself (e.g. `export default FlightMapPreset`) —
  // if we matched `defaultIdentifier` first we'd treat the preset OBJECT as
  // a React component and every render would crash.
  const presetCompMatch = code.match(/component\s*:\s*([A-Z][A-Za-z0-9_]*)/);
  const defaultExportMatch = code.match(/export\s+default\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (presetCompMatch && defaultExportMatch) {
    return {
      kind: 'presetComponent',
      name: presetCompMatch[1],
      presetName: defaultExportMatch[1]
    };
  }

  // (a) Named const export
  const constMatch = code.match(/export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*[:=]/);
  if (constMatch) return { kind: 'namedExport', name: constMatch[1] };

  // (b) Named function export
  const fnMatch = code.match(/export\s+function\s+([A-Z][A-Za-z0-9_]*)/);
  if (fnMatch) return { kind: 'namedExport', name: fnMatch[1] };

  // (c) Bare PascalCase default export (no preset)
  const defaultId = code.match(/export\s+default\s+([A-Z][A-Za-z0-9_]*)/);
  if (defaultId) return { kind: 'defaultIdentifier', name: defaultId[1] };

  return { kind: 'rawBody', name: null };
}

// Write a temporary preview composition. Used for "paste → render →
// preview → keep" flow. Returns {compId, filePath, token} — token lets the
// caller later finalise or discard.
function createPreview(opts) {
  ensureImportsDir();
  const token = randomUUID().replace(/-/g, '').slice(0, 8);
  const compId = `Preview-${token}`;
  const fileSlug = `Preview${token}`;
  const filename = `${fileSlug}.tsx`;
  const filePath = path.join(IMPORTS_DIR, filename);

  // Detect the export shape so we know whether Root.tsx should use a named
  // import (`import { X } from ...`) or a default import (`import X from ...`).
  const detected = detectComponentSource(opts.code);
  // defaultIdentifier = the pasted file ONLY has `export default <X>`.
  // Our adapter-wrapped cases (namedExport, presetComponent, rawBody) all
  // add or already have a named `export const` that Root can import by name.
  const useDefaultImport = detected.kind === 'defaultIdentifier';

  const { finalCode, exportName } = prepareCode(opts.code, fileSlug);
  fs.writeFileSync(filePath, finalCode);

  // Extract the composition's full schema (fields, types, labels, groups)
  // and cache it so the detail page can render a typed form.
  try {
    const schema = extractSchema(opts.code);
    if (Object.keys(schema).length) schemasDb.set(compId, schema);
  } catch (err) {
    console.warn('[import] schema extraction failed', err.message);
  }

  patchRootTsx({
    filename,
    componentName: exportName,
    compId,
    durationInFrames: opts.durationInFrames,
    fps: opts.fps,
    width: opts.width,
    height: opts.height,
    isDefault: useDefaultImport
  });

  return { compId, filePath, token, exportName, fileSlug };
}

// Resolve the fileSlug (PascalCase, no hyphens) from a preview comp id
// ("Preview-<token>" → "Preview<token>").
function fileSlugFromPreview(previewCompId) {
  return previewCompId.replace(/-/g, '');
}

// Promote a preview to a proper library composition with the user's chosen
// name. Renames the file and updates Root.tsx accordingly.
function finalisePreview(previewCompId, newName) {
  const finalId = sanitizeId(newName);
  const oldSlug = fileSlugFromPreview(previewCompId);
  const oldFilename = `${oldSlug}.tsx`;
  const newFilename = `${finalId}.tsx`;
  const oldPath = path.join(IMPORTS_DIR, oldFilename);
  const newPath = path.join(IMPORTS_DIR, newFilename);

  if (!fs.existsSync(oldPath)) throw new Error(`Preview file not found: ${oldFilename}`);
  if (fs.existsSync(newPath)) throw new Error(`A composition named "${finalId}" already exists. Pick a different name.`);

  fs.renameSync(oldPath, newPath);

  // Also rewrite the file CONTENT so any auto-generated identifier that used
  // the slug (e.g. `export const AIGenxxxxxxxx = ...` from AI Generate) gets
  // renamed to the final id. Without this, Root.tsx imports `{ Trip }` but
  // the file still exports `AIGenxxxxxxxx` → undefined at import time.
  try {
    const content = fs.readFileSync(newPath, 'utf8');
    const updated = content.split(oldSlug).join(finalId);
    if (updated !== content) fs.writeFileSync(newPath, updated);
  } catch (err) {
    console.warn('[finalise] file content rewrite failed', err.message);
  }

  // Update Root.tsx: replace the preview id AND the import path/name so the
  // final composition points at the new file.
  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  const replaceAll = (s, from, to) => s.split(from).join(to);
  root = replaceAll(root, previewCompId, finalId);
  root = replaceAll(root, `"./imports/${oldSlug}"`, `"./imports/${finalId}"`);
  root = replaceAll(root, oldSlug, finalId);
  fs.writeFileSync(ROOT_FILE, root);

  // Migrate the stored schema to the final comp id so the form shows up.
  schemasDb.rename(previewCompId, finalId);

  return { compId: finalId, filePath: newPath };
}

// Discard a preview entirely: remove the file and un-patch Root.tsx.
function discardPreview(previewCompId) {
  const slug = fileSlugFromPreview(previewCompId);
  const filename = `${slug}.tsx`;
  const filePath = path.join(IMPORTS_DIR, filename);

  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
  schemasDb.remove(previewCompId);

  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  root = root.replace(new RegExp(`^import.*${slug}.*\\n`, 'gm'), '');
  const compBlockRe = new RegExp(`\\s*\\{\\s*/\\*\\s*Imported:\\s*${previewCompId}\\s*\\*/\\s*\\}[\\s\\S]*?/>`);
  root = root.replace(compBlockRe, '');
  fs.writeFileSync(ROOT_FILE, root);
}

// Repair common paste issues — mostly backticks getting stripped when the
// code travels through a channel that does Markdown parsing (Telegram,
// Discord, some clipboards). Looks for `property: funcName(${...}...)`
// without surrounding backticks and wraps them into template literals.
function repairStrippedBackticks(code) {
  let fixCount = 0;
  const repaired = code.replace(
    /(\w+\s*:\s*)(\w+\s*\([^)]*\$\{[^}]*\}[^)]*\))(?=\s*[,\n])/g,
    (match, prefix, expr) => { fixCount++; return `${prefix}\`${expr}\``; }
  );
  if (fixCount > 0) {
    console.log(`[import] repaired ${fixCount} stripped template literal${fixCount === 1 ? '' : 's'}`);
  }
  return repaired;
}

// Normalise user-pasted code into a file we can import. Returns the final
// file text and the name we should import from Root.tsx.
function prepareCode(code, compId) {
  // Run paste repairs before detection so stripped backticks don't throw off
  // regex matching.
  code = repairStrippedBackticks(code);
  const detected = detectComponentSource(code);
  let finalCode = code;
  let exportName;

  if (detected.kind === 'namedExport' || detected.kind === 'defaultIdentifier') {
    exportName = detected.name;
  } else if (detected.kind === 'presetComponent') {
    exportName = '__ImportedComp';
    // We compute defaults BOTH at build-time (regex extraction as backup) and
    // at runtime (directly iterating the preset.schema object). Runtime is
    // always correct because it reads the real object; static is the fallback
    // in case runtime access fails for any reason.
    const zodDefaults = extractZodDefaults(code);
    const staticDefaultsCode = Object.keys(zodDefaults).length
      ? formatDefaultsObject(zodDefaults)
      : '{}';

    finalCode = code + `

// Added by dashboard importer: adapter that reads preset defaults at runtime.
// Iterates preset.schema directly so complex default shapes (nested objects,
// arrays) are handled correctly — something regex parsing can't do.
const __STATIC_DEFAULTS: any = ${staticDefaultsCode};

export const __ImportedComp: React.FC<any> = (props) => {
  const defaults: any = { ...__STATIC_DEFAULTS };
  try {
    const _p: any = ${detected.presetName};
    if (_p && typeof _p === 'object') {
      if (_p.schema && typeof _p.schema === 'object' && typeof _p.schema.parse !== 'function') {
        for (const key of Object.keys(_p.schema)) {
          const field = _p.schema[key];
          if (field && typeof field === 'object' && 'default' in field) {
            defaults[key] = field.default;
          }
        }
      }
      if (_p.schema && typeof _p.schema.parse === 'function') {
        try { Object.assign(defaults, _p.schema.parse({})); } catch {}
      }
      if (_p.meta && _p.meta.defaults) Object.assign(defaults, _p.meta.defaults);
      if (_p.defaults) Object.assign(defaults, _p.defaults);
    }
  } catch {}
  return React.createElement(${detected.name}, { ...defaults, ...props });
};
`;
  } else {
    // Raw JSX body — wrap it
    exportName = compId;
    finalCode = `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Easing } from 'remotion';

export const ${compId}: React.FC = () => {
  return (
    <AbsoluteFill>
${code.split('\n').map(l => '      ' + l).join('\n')}
    </AbsoluteFill>
  );
};
`;
  }

  // Ensure essential imports exist
  if (!/from\s+['"]remotion['"]/.test(finalCode)) {
    finalCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Easing } from 'remotion';\n` + finalCode;
  }
  if (!/import\s+React/.test(finalCode)) {
    finalCode = `import React from 'react';\n` + finalCode;
  }

  return { finalCode, exportName };
}

function patchRootTsx(o) {
  let root = fs.readFileSync(ROOT_FILE, 'utf8');
  const importPath = `./imports/${o.filename.replace(/\.tsx$/, '')}`;

  // Skip if already imported (prevent duplicate patches)
  if (root.includes(importPath)) {
    throw new Error(`${o.compId} already registered in Root.tsx`);
  }

  // Default vs named import. Default when the pasted file ONLY has
  // `export default X` — otherwise we have a named `export const X`.
  // Use a file-scoped alias to prevent collisions with other imports that
  // happen to export the same symbol name (e.g. every preset exports
  // `__ImportedComp` so we'd shadow each other without aliasing).
  const fileSlugForAlias = o.filename.replace(/\.tsx$/, '').replace(/[^A-Za-z0-9_]/g, '');
  const alias = `__IC_${fileSlugForAlias}`;
  const importLine = o.isDefault
    ? `import ${alias} from "${importPath}";\n`
    : `import { ${o.componentName} as ${alias} } from "${importPath}";\n`;
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

  // Add Composition entry right after the <> fragment opening
  const compositionBlock = `
      {/* Imported: ${o.compId} */}
      <Composition
        id="${o.compId}"
        component={${alias}}
        durationInFrames={${o.durationInFrames}}
        fps={${o.fps}}
        width={${o.width}}
        height={${o.height}}
        defaultProps={{}}
      />
`;

  const returnOpenMatch = root.match(/return\s*\(\s*<>\s*/);
  if (returnOpenMatch) {
    const idx = returnOpenMatch.index + returnOpenMatch[0].length;
    root = root.slice(0, idx) + compositionBlock + root.slice(idx);
  } else {
    throw new Error('Could not find return (<> ... </>) in Root.tsx — manual edit required.');
  }

  fs.writeFileSync(ROOT_FILE, root);
}

module.exports = { createPreview, finalisePreview, discardPreview, IMPORTS_DIR };
