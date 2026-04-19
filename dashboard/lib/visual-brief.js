// Visual Brief — take a reference image, send to Gemini Vision, get back
// a design-language description and a matched mood id. Lets users point
// at a visual reference instead of describing it in words.
const https = require('https');
const fs = require('fs');
const path = require('path');
const moods = require('./moods');

function resolveKey(varName) {
  if (process.env[varName]) return process.env[varName];
  const candidates = [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '..', '.env')];
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

function buildPrompt() {
  const catalog = moods.list().map(m => `- ${m.id}: ${m.name} — ${m.description}`).join('\n');
  return `You're a motion designer looking at a still frame from a video (or a design reference). Analyse the VISUAL STYLE only — ignore subject matter.

Describe it using precise design language. Cover:
- Palette (dominant colours as hex approximations, named accents)
- Typography (serif/sans, weight, letter-spacing, case, size)
- Layout (centred/offset, margins, alignment)
- Treatment (film grain, chromatic aberration, scanlines, glow, depth-of-field, glass blur, solid, glitch, texture)
- Motion cues if implied (zoom, pan, cut, static)
- Mood in 3-5 adjectives

Also assess FEASIBILITY — our moods produce animated text on a stylised background. We CANNOT recreate:
- Full 3D scenes or product renders made in Blender/Cinema4D
- Photographic content, live-action footage, people, real locations
- Custom illustrations, hand-drawn elements, 2D character animation

We CAN produce (closely): animated text, kinetic typography, code/terminal reveals, chromatic VHS, matrix rain, floating 3D glass cards with glowing outlines (via CardStack3D), glassmorphism cards, shatter reveals.

Then match to ONE of these moods that best fits:
${catalog}

Reply with ONLY valid JSON in this shape, nothing else:
{
  "palette": "hex + name summary",
  "typography": "...",
  "layout": "...",
  "treatment": "...",
  "motion": "...",
  "adjectives": ["...","...","..."],
  "matchedMoodId": "one of the ids above",
  "matchedReason": "one sentence why this mood fits",
  "feasibility": "high" | "medium" | "low",
  "feasibilityNote": "if medium/low, one sentence on what isn't achievable (e.g. 'reference is a photo-realistic 3D render; we can approximate the glass-card look but not the physical materials')"
}`;
}

async function analyze({ imageBase64, mimeType = 'image/jpeg' }) {
  const apiKey = resolveKey('GEMINI_API_KEY') || resolveKey('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  if (!imageBase64) throw new Error('imageBase64 required');

  const body = JSON.stringify({
    contents: [{
      role: 'user',
      parts: [
        { text: buildPrompt() },
        { inline_data: { mime_type: mimeType, data: imageBase64 } }
      ]
    }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2000,
      responseMimeType: 'application/json'
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try {
          const data = JSON.parse(buf);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`Gemini ${res.statusCode}: ${buf.slice(0, 400)}`));
          }
          const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
          const finishReason = data.candidates?.[0]?.finishReason;
          // responseMimeType: application/json should give us clean JSON,
          // but fall back to regex extraction if it doesn't.
          let parsed;
          try {
            parsed = JSON.parse(text);
          } catch {
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) {
              const hint = finishReason === 'MAX_TOKENS' ? ' (model hit max_tokens — response was cut off; try a smaller image or retry)' : '';
              return reject(new Error(`Gemini returned no valid JSON${hint}: ${text.slice(0, 300)}`));
            }
            try {
              parsed = JSON.parse(match[0]);
            } catch (err) {
              return reject(new Error(`Gemini JSON parse failed: ${err.message}. Raw: ${text.slice(0, 300)}`));
            }
          }
          // Attach the full mood object so the frontend can preview palette.
          const mood = parsed.matchedMoodId ? moods.get(parsed.matchedMoodId) : null;
          resolve({ ...parsed, mood });
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

module.exports = { analyze };
