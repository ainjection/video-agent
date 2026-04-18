const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const STUDIO_PORT = 3000;

let proc = null;
let status = 'stopped'; // stopped | starting | ready | failed
let lastLine = '';
let startedAt = 0;

function checkPortOpen() {
  return new Promise((resolve) => {
    const req = http.get({ host: 'localhost', port: STUDIO_PORT, path: '/', timeout: 1200 }, (res) => {
      // Any HTTP response means something is listening
      resolve(true);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function start() {
  if (status === 'starting' || status === 'ready') return { status };

  // If studio is already running (user started it separately), adopt it.
  if (await checkPortOpen()) {
    status = 'ready';
    startedAt = Date.now();
    lastLine = 'external studio detected';
    return { status };
  }

  status = 'starting';
  startedAt = Date.now();
  lastLine = 'launching…';

  proc = spawn('npx', ['remotion', 'studio', '--no-open'], {
    cwd: PROJECT_ROOT,
    shell: true,
    env: { ...process.env }
  });

  proc.stdout.on('data', (d) => {
    const text = d.toString();
    lastLine = text.trim().slice(-200);
    // Studio prints "Server ready" / "Compiled" once it's usable
    if (/ready|compiled|listening|started/i.test(text)) {
      status = 'ready';
    }
  });

  proc.stderr.on('data', (d) => {
    lastLine = d.toString().trim().slice(-200);
  });

  proc.on('close', (code) => {
    console.log(`[studio] exited with ${code}`);
    status = code === 0 ? 'stopped' : 'failed';
    proc = null;
  });

  // Poll the port every 2s for up to 60s as a fallback readiness signal
  const deadline = Date.now() + 60000;
  const poll = setInterval(async () => {
    if (status === 'ready' || status === 'failed' || status === 'stopped') {
      clearInterval(poll);
      return;
    }
    if (await checkPortOpen()) {
      status = 'ready';
      clearInterval(poll);
      return;
    }
    if (Date.now() > deadline) {
      status = 'failed';
      lastLine = 'timed out waiting for studio';
      clearInterval(poll);
    }
  }, 2000);

  return { status };
}

function getStatus() {
  return {
    status,
    port: STUDIO_PORT,
    url: `http://localhost:${STUDIO_PORT}`,
    lastLine,
    uptimeMs: startedAt ? Date.now() - startedAt : 0
  };
}

function stop() {
  if (proc) {
    try { proc.kill(); } catch {}
    proc = null;
  }
  status = 'stopped';
}

module.exports = { start, stop, getStatus, STUDIO_PORT };
