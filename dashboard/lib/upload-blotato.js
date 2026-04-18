// Minimal Blotato API client for publishing finished renders to social
// platforms. Reuses the resolveKey helper so BLOTATO_API_KEY can live in
// the project's .env or the ambient shell env.
const https = require('https');
const fs = require('fs');
const path = require('path');

const BLOTATO_HOST = 'backend.blotato.com';

function resolveKey(varName) {
  if (process.env[varName]) return process.env[varName];
  const candidates = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env')
  ];
  const re = new RegExp(varName + '\\s*=\\s*([^\\r\\n]+)');
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const m = fs.readFileSync(p, 'utf8').match(re);
      if (m && m[1].trim().length > 10) return m[1].trim();
    } catch {}
  }
  return null;
}

function api({ method, path: p, body }) {
  return new Promise((resolve, reject) => {
    const apiKey = resolveKey('BLOTATO_API_KEY');
    if (!apiKey) return reject(new Error('BLOTATO_API_KEY not set'));
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: BLOTATO_HOST,
      path: '/v2' + p,
      method,
      headers: {
        'Content-Type': 'application/json',
        'blotato-api-key': apiKey,
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try {
          const parsed = buf ? JSON.parse(buf) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`Blotato ${res.statusCode}: ${buf.slice(0, 300)}`));
        } catch {
          reject(new Error(`Blotato parse error: ${buf.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function listAccounts() {
  const res = await api({ method: 'GET', path: '/users/me/accounts' });
  return res.items || res.accounts || res;
}

async function uploadVideo(publicUrl) {
  // Simple path: ask Blotato to ingest a publicly-reachable URL as a source.
  // (Caller must expose the local MP4 via a public URL first — ngrok,
  // tunnel, or already-uploaded storage.)
  const src = await api({ method: 'POST', path: '/sources', body: { url: publicUrl, type: 'video' } });
  return src;
}

async function createPost({ accountIds, caption, videoSourceId }) {
  return api({
    method: 'POST',
    path: '/posts',
    body: {
      accountIds,
      content: caption || '',
      media: videoSourceId ? [{ sourceId: videoSourceId, type: 'video' }] : []
    }
  });
}

function hasKey() {
  return !!resolveKey('BLOTATO_API_KEY');
}

module.exports = { listAccounts, uploadVideo, createPost, hasKey };
