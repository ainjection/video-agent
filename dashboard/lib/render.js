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

  const state = { progress: 0, line: 'starting…', listeners: new Set(), status: 'running', stderrLog: '' };
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
    state.stderrLog = (state.stderrLog + text).slice(-4000); // keep last 4kb
    emit({ line: text.trim().slice(-200) });
  });

  proc.on('close', async (code) => {
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
  // Remotion usually includes lines like "Error: ..." or "ZodError: ..."
  const lines = stderr.split(/\r?\n/).filter(l => l.trim());
  const meaningful = lines.find(l =>
    /error|invalid|zod|schema|fail|not a valid|does not match/i.test(l) &&
    !/npm warn/i.test(l)
  );
  if (meaningful) return meaningful.trim().slice(0, 400);
  return lines.slice(-3).join(' | ').slice(0, 400);
}

function getLive(id) {
  return live.get(id) || null;
}

module.exports = { startRender, subscribe, getLive, OUT_DIR };
