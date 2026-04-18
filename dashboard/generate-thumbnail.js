// Generate a YouTube thumbnail for the video-agent demo video using Google's
// Nano Banana image model.
const https = require('https');
const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dep)
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  }
} catch {}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY not set — export it or put it in .env');
  process.exit(1);
}
const MODEL = 'nano-banana-pro-preview';

const prompt = `YouTube thumbnail design, 16:9 aspect ratio, high-contrast, bold and cinematic.

Scene: A futuristic developer workstation. Dark techy background with subtle neon-green glow. In the left half, a code editor window showing TypeScript/TSX code for a video animation — syntax-highlighted with green accents, lines visible but not readable. In the right half, massive bold sans-serif text on 3 stacked lines reading:

Line 1: "AI WROTE"  (in bright white)
Line 2: "THIS CODE"  (in neon green #00e676, larger, glowing)
Line 3: "↓ DON'T MISS ↓"  (smaller, in bright yellow, underlined, with two downward arrows)

Below the code window on the left, a video preview thumbnail showing colourful motion-graphics composition cards (dashboard grid feel, like a Netflix of video templates). Small glowing particles around the text. Black-to-dark-purple gradient background. High production value, YouTube thumbnail aesthetic. No faces, no people, no watermark. The text must be SHARP, LEGIBLE, and READABLE at small sizes. Bold impactful font like Inter Black or Anton.`;

const body = JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.8,
    responseModalities: ['IMAGE']
  }
});

const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  let chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    try {
      const data = JSON.parse(raw);
      const parts = data.candidates?.[0]?.content?.parts || [];
      let found = false;
      parts.forEach((p, i) => {
        if (p.inlineData) {
          const buf = Buffer.from(p.inlineData.data, 'base64');
          const out = path.join(__dirname, 'out', `thumbnail-${i}.png`);
          fs.writeFileSync(out, buf);
          console.log('Wrote', out, buf.length, 'bytes');
          found = true;
        } else if (p.text) {
          console.log('Model text:', p.text.slice(0, 300));
        }
      });
      if (!found) {
        console.log('No image returned. Full response:');
        console.log(raw.slice(0, 2000));
      }
    } catch (err) {
      console.log('Parse error:', err.message);
      console.log(raw.slice(0, 1000));
    }
  });
});

req.on('error', err => console.error('Error:', err));
req.write(body);
req.end();
