const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const db = require('./renders-db');
const aspects = require('./aspects');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const PROPS_DIR = path.join(__dirname, '..', 'data', 'props');

function ensureDirs() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(PROPS_DIR)) fs.mkdirSync(PROPS_DIR, { recursive: true });
}

// In-memory progress tracker (for SSE streaming)
const live = new Map(); // id → { progress, line, listeners: Set<fn>, proc, stderr }

function startRender({ compositionId, props = {}, label = '', extraAspects = [] }) {
  ensureDirs();
  const id = randomUUID().slice(0, 8);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${compositionId.toLowerCase()}-${ts}.mp4`;
  const outPath = path.join(OUT_DIR, filename);

  const args = [
    'remotion', 'render', compositionId,
    outPath,
    '--concurrency=4'
  ];

  // Write props to a temp JSON file — safer on Windows than passing JSON
  // on the command line (quote escaping breaks).
  if (Object.keys(props).length) {
    const propsFile = path.join(PROPS_DIR, `${id}.json`);
    fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
    args.push(`--props=${propsFile}`);
  }

  const state = { progress: 0, line: 'starting…', listeners: new Set(), status: 'running', stderrLog: '', stdoutLog: '' };
  live.set(id, state);

  db.add({
    id,
    compositionId,
    label: label || compositionId,
    filename,
    outPath,
    props,
    status: 'running',
    progress: 0
  });

  const proc = spawn('npx', args, {
    cwd: PROJECT_ROOT,
    shell: true,
    env: { ...process.env }
  });
  state.proc = proc;

  const emit = (patch) => {
    Object.assign(state, patch);
    state.listeners.forEach(fn => { try { fn(state); } catch {} });
    db.update(id, { progress: state.progress, status: state.status });
  };

  proc.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    state.stdoutLog = (state.stdoutLog + text).slice(-32000);
    const m = text.match(/Rendered\s+(\d+)\/(\d+)/) || text.match(/Encoded\s+(\d+)\/(\d+)/);
    if (m) {
      const pct = Math.round((parseInt(m[1], 10) / parseInt(m[2], 10)) * 100);
      emit({ progress: pct, line: text.trim().slice(-200) });
    } else {
      emit({ line: text.trim().slice(-200) });
    }
  });

  proc.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    state.stderrLog = (state.stderrLog + text).slice(-32000); // keep last 32kb
    emit({ line: text.trim().slice(-200) });
  });

  proc.on('close', async (code) => {
    // Capture stdout as part of the error log too — Remotion sometimes prints
    // compiler errors to stdout rather than stderr.
    if (code !== 0 && state.stdoutLog) {
      state.stderrLog = (state.stdoutLog + '\n' + state.stderrLog).slice(-32000);
    }
    if (code === 0) {
      emit({ progress: 100, line: 'render complete — converting aspects…' });

      // Run aspect conversions sequentially so we don't thrash the CPU.
      const extraOutputs = [];
      for (const aspectKey of extraAspects) {
        try {
          emit({ line: `converting ${aspectKey}…` });
          const { filename: extraFile } = await aspects.convertAspect(outPath, aspectKey);
          extraOutputs.push({ aspect: aspectKey, filename: extraFile });
        } catch (err) {
          console.warn(`[render] ${aspectKey} conversion failed`, err.message);
          extraOutputs.push({ aspect: aspectKey, error: err.message });
        }
      }

      emit({ status: 'done', progress: 100, line: 'done', extraOutputs });
      db.update(id, { status: 'done', progress: 100, completedAt: Date.now(), extraOutputs });
    } else {
      const err = extractErrorMessage(state.stderrLog);
      emit({ status: 'failed', line: err || `exit ${code}`, error: err });
      db.update(id, { status: 'failed', error: err, completedAt: Date.now() });
    }
  });

  return { id, filename, outPath };
}

function subscribe(id, fn) {
  const state = live.get(id);
  if (!state) return () => {};
  state.listeners.add(fn);
  fn(state); // fire immediately with current state
  return () => state.listeners.delete(fn);
}

function extractErrorMessage(stderr) {
  if (!stderr) return null;

  // Strip ANSI colour codes so our matchers work, keep both clean and raw
  const raw = stderr.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const clean = raw.map(l => l.replace(/\x1b\[\d+m/g, ''));

  // 1. Prefer lines that start with a real error type — skip stack frames.
  const errorPrefix = /^(Error|TypeError|SyntaxError|RangeError|ReferenceError|ZodError|Invariant Violation|Module build failed|Failed to|Unexpected token)\b/;
  for (let i = 0; i < clean.length; i++) {
    if (errorPrefix.test(clean[i]) && !clean[i].startsWith('at ')) {
      // Return the error line plus its "caused by" hint (next 1-2 non-stack lines)
      let out = clean[i];
      let j = i + 1;
      while (j < clean.length && !clean[j].startsWith('at ') && out.length < 600) {
        out += ' · ' + clean[j];
        j++;
      }
      return out.slice(0, 600);
    }
  }

  // 2. Common "Cannot ... / Failed ..." sentences that aren't stack frames.
  for (const line of clean) {
    if (/^(Cannot|Failed|Invalid|Duplicate|Unknown)\s/.test(line) && !line.startsWith('at ')) {
      return line.slice(0, 600);
    }
  }

  // 3. First non-stack-frame line longer than 20 chars.
  for (const line of clean) {
    if (!/^\s*at\s/.test(line) && line.length > 20 && !/npm warn/i.test(line)) {
      return line.slice(0, 600);
    }
  }

  // 4. Fallback: the last 3 lines joined.
  return clean.slice(-3).join(' | ').slice(0, 600);
}

function getLive(id) {
  return live.get(id) || null;
}

module.exports = { startRender, subscribe, getLive, OUT_DIR };
