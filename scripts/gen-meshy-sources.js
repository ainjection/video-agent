// One-shot: generate 6 Nano Banana images tuned for Meshy Image-to-3D.
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
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
if (!API_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }

const OUT = path.join(__dirname, '..', 'meshy-source-images');
fs.mkdirSync(OUT, { recursive: true });

const PROMPTS = [
  {
    name: 'GlassCardsTrio',
    prompt: 'Three translucent frosted-glass dashboard panels stacked at slight angles, glowing neon outlines (one orange, two cyan), faint line-art diagrams faintly visible through the glass, floating on completely pitch black background with no stars and no other objects, hero product photography, 3/4 angle, dramatic studio lighting, centred composition, crisp edges, single cohesive subject.'
  },
  {
    name: 'CrystalShield',
    prompt: 'A single faceted crystalline shield emblem, hexagonal, translucent turquoise-blue crystal with warm inner glow, isolated on pure black background, no other elements, centered, studio product-shot lighting with rim highlights, hero angle.'
  },
  {
    name: 'CircuitSphere',
    prompt: 'A single hollow geometric sphere made of glowing neon green circuit traces over a transparent shell, exposed circuit board textures visible, isolated on pitch black background, no stars, no floor, 3/4 view, centred, hero product lighting.'
  },
  {
    name: 'HoloOrb',
    prompt: 'A single sci-fi energy orb with three concentric orbital rings around it, bright plasma core at center with magenta and cyan volumetric glow, suspended in pitch black void, centred composition, no other elements.'
  },
  {
    name: 'ChromeObelisk',
    prompt: 'A single tall polished chrome obelisk monolith, rectangular tower with glowing light-blue runes engraved down its faces, isolated on pitch black background, low-angle 3/4 hero shot, reflective surface, centered, no ground or context.'
  },
  {
    name: 'LiquidMetalBlob',
    prompt: 'A single shiny chrome liquid-metal blob with soft amorphous curves, orange and cyan light trails reflecting off its surface, isolated on pitch black background, centred, no other elements, cinematic studio lighting.'
  }
];

function generate({ name, prompt }) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, responseModalities: ['IMAGE'] }
    });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/nano-banana-pro-preview:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const parts = data.candidates?.[0]?.content?.parts || [];
          const imgPart = parts.find(p => p.inlineData);
          if (!imgPart) {
            const textPart = parts.find(p => p.text)?.text || 'no image returned';
            return reject(new Error(`${name}: ${textPart.slice(0, 200)}`));
          }
          const out = path.join(OUT, name + '.png');
          fs.writeFileSync(out, Buffer.from(imgPart.inlineData.data, 'base64'));
          resolve({ name, path: out, bytes: fs.statSync(out).size });
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

(async () => {
  const results = await Promise.allSettled(PROMPTS.map(generate));
  for (const r of results) {
    if (r.status === 'fulfilled') console.log('OK  ', r.value.name, Math.round(r.value.bytes / 1024), 'KB');
    else console.log('FAIL', r.reason.message);
  }
})();
