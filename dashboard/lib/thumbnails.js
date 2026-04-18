const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const THUMB_DIR = path.join(__dirname, '..', 'data', 'thumbnails');

function ensureDir() {
  if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });
}

function thumbnailPath(compId) {
  return path.join(THUMB_DIR, `${compId}.png`);
}

function exists(compId) {
  return fs.existsSync(thumbnailPath(compId));
}

// Generate a single thumbnail via `npx remotion still`. Picks a frame ~15%
// into the composition for variety.
function generate(comp) {
  ensureDir();
  return new Promise((resolve, reject) => {
    const out = thumbnailPath(comp.id);
    // Pick a frame that's 15% into the composition (but at least frame 10
    // to skip any fade-ins that start black). Clamp to durationInFrames-1
    // so we never ask for a frame the composition doesn't render.
    const maxFrame = Math.max(0, (comp.durationInFrames || 1) - 1);
    const preferred = Math.floor((comp.durationInFrames || 1) * 0.15);
    const frame = Math.min(maxFrame, Math.max(0, Math.min(preferred, 10)));

    const args = ['remotion', 'still', comp.id, out, `--frame=${frame}`];
    const proc = spawn('npx', args, {
      cwd: PROJECT_ROOT,
      shell: true,
      env: { ...process.env }
    });

    let errBuf = '';
    proc.stderr.on('data', d => { errBuf += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(out)) {
        resolve(out);
      } else {
        reject(new Error(errBuf.trim().slice(0, 200) || `exit ${code}`));
      }
    });
  });
}

// State shared with the server to show progress
const state = {
  queue: [],
  current: null,
  done: 0,
  failed: 0,
  total: 0,
  status: 'idle',
  errors: {}
};

function getStatus() {
  return { ...state, queue: state.queue.map(c => c.id) };
}

async function queueMissing(compositions) {
  ensureDir();
  const missing = compositions.filter(c => !exists(c.id));
  state.queue.push(...missing);
  state.total = state.done + state.failed + state.queue.length + (state.current ? 1 : 0);
  if (state.status === 'idle') {
    state.status = 'running';
    processNext();
  }
}

async function processNext() {
  if (state.queue.length === 0) {
    state.status = 'idle';
    state.current = null;
    return;
  }
  const comp = state.queue.shift();
  state.current = comp;
  try {
    await generate(comp);
    state.done++;
    console.log(`[thumbnails] ${comp.id} ✓ (${state.done}/${state.total})`);
  } catch (err) {
    state.failed++;
    state.errors[comp.id] = err.message;
    console.warn(`[thumbnails] ${comp.id} ✗ ${err.message}`);
  }
  // Brief pause between renders so Remotion's bundler cache gets reused
  // and we don't slam the CPU.
  setTimeout(processNext, 300);
}

async function regenerate(comp) {
  // Remove cached, re-queue
  try { fs.unlinkSync(thumbnailPath(comp.id)); } catch {}
  if (!state.queue.find(c => c.id === comp.id) && state.current?.id !== comp.id) {
    state.queue.push(comp);
    state.total = state.done + state.failed + state.queue.length + (state.current ? 1 : 0);
  }
  if (state.status === 'idle') {
    state.status = 'running';
    processNext();
  }
}

module.exports = {
  THUMB_DIR,
  thumbnailPath,
  exists,
  generate,
  queueMissing,
  regenerate,
  getStatus
};
