// Generate a thumbnail image using Google's Nano Banana Pro model.
// Reuses the resolveKey pattern from ai-studio.js so .env is picked up.
const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL = 'nano-banana-pro-preview';
const THUMB_DIR = path.join(__dirname, '..', 'data', 'thumbnails');

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

function generate({ compId, prompt }) {
  const apiKey = resolveKey('GEMINI_API_KEY') || resolveKey('GOOGLE_API_KEY');
  if (!apiKey) return Promise.reject(new Error('GEMINI_API_KEY not set'));
  if (!compId) return Promise.reject(new Error('compId required'));
  if (!prompt || prompt.trim().length < 10) return Promise.reject(new Error('prompt too short'));

  if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, responseModalities: ['IMAGE'] }
    });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const parts = data.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find(p => p.inlineData);
          if (!imagePart) {
            const textPart = parts.find(p => p.text)?.text || 'no image returned';
            return reject(new Error(textPart.slice(0, 300)));
          }
          const buf = Buffer.from(imagePart.inlineData.data, 'base64');
          const outPath = path.join(THUMB_DIR, `${compId}.png`);
          fs.writeFileSync(outPath, buf);
          resolve({ path: outPath, bytes: buf.length });
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { generate };
