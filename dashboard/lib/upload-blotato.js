// Minimal Blotato API client — POST /v2/posts with account + media URL.
// Shape mirrors Rob's production remotion-automation server.mjs.
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
          else reject(new Error(`Blotato ${res.statusCode}: ${JSON.stringify(parsed).slice(0, 400)}`));
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

// Target defaults per platform. Blotato insists on these; minimal safe values.
function defaultTargetForPlatform(platform, caption) {
  switch (platform) {
    case 'youtube':
      return { targetType: 'youtube', title: (caption || 'Video').slice(0, 95), privacyStatus: 'public', shouldNotifySubscribers: true };
    case 'tiktok':
      return { targetType: 'tiktok', privacyLevel: 'PUBLIC_TO_EVERYONE', disabledComments: false, disabledDuet: false, disabledStitch: false, isBrandedContent: false, isYourBrand: false, isAiGenerated: true };
    case 'instagram':
      return { targetType: 'instagram' };
    case 'facebook':
      return { targetType: 'facebook' };
    case 'twitter':
    case 'x':
      return { targetType: 'twitter' };
    case 'threads':
      return { targetType: 'threads' };
    case 'linkedin':
      return { targetType: 'linkedin' };
    default:
      return { targetType: platform };
  }
}

// Submit one post per selected account. Each account has its own platform,
// so we look up the platform from the account record.
async function publishToAccounts({ accounts, publicUrl, caption }) {
  const results = [];
  for (const acc of accounts) {
    const platform = acc.platform;
    if (!platform) {
      results.push({ accountId: acc.id, error: 'no platform on account record' });
      continue;
    }
    const postBody = {
      post: {
        accountId: String(acc.id),
        content: {
          text: caption || '',
          mediaUrls: [publicUrl],
          platform
        },
        target: defaultTargetForPlatform(platform, caption)
      }
    };
    try {
      const data = await api({ method: 'POST', path: '/posts', body: postBody });
      results.push({ accountId: acc.id, platform, ok: true, postSubmissionId: data.postSubmissionId || data.id });
    } catch (err) {
      results.push({ accountId: acc.id, platform, ok: false, error: err.message });
    }
  }
  return results;
}

function hasKey() {
  return !!resolveKey('BLOTATO_API_KEY');
}

module.exports = { listAccounts, publishToAccounts, hasKey };
