const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '..', '.env');
const REQUIRED_KEYS = ['ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'ELEVEN_API_KEY'];

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function getStatus() {
  const env = readEnvFile();
  const status = { envFileExists: fs.existsSync(ENV_FILE), missing: [], present: [] };
  for (const key of REQUIRED_KEYS) {
    const v = env[key] || process.env[key];
    if (v && v.length > 10) status.present.push(key);
    else status.missing.push(key);
  }
  status.complete = status.missing.length === 0;
  return status;
}

function saveKeys(updates) {
  const env = readEnvFile();
  for (const [key, value] of Object.entries(updates || {})) {
    if (!REQUIRED_KEYS.includes(key)) continue;
    if (typeof value !== 'string') continue;
    const clean = value.trim();
    if (clean) env[key] = clean;
  }
  // Preserve any other keys that were already in the file but aren't in
  // REQUIRED_KEYS — users may have extra ones.
  const lines = Object.entries(env).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n');
  return getStatus();
}

module.exports = { getStatus, saveKeys, REQUIRED_KEYS };
