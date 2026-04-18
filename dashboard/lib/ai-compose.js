const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to resolve an API key for a given provider from known env file locations.
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
      const txt = fs.readFileSync(p, 'utf8');
      const m = txt.match(re);
      if (m && m[1].trim() && m[1].trim().length > 10) return m[1].trim();
    } catch {}
  }
  return null;
}

function availableProviders() {
  return {
    claude: !!resolveKey('ANTHROPIC_API_KEY'),
    gemini: !!resolveKey('GEMINI_API_KEY') || !!resolveKey('GOOGLE_API_KEY')
  };
}

function postJson({ hostname, path: p, headers, body }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname,
      path: p,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try {
          const data = JSON.parse(buf);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`${res.statusCode}: ${data.error ? (data.error.message || JSON.stringify(data.error)) : buf.slice(0, 200)}`));
        } catch (err) { reject(new Error(`parse: ${err.message} · body=${buf.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Build a compact list of available compositions
function buildLibrary(compositions) {
  return compositions.map(c => ({
    id: c.id,
    category: c.category || 'Other',
    duration_frames: c.durationInFrames,
    duration_seconds: Math.round((c.durationInFrames / c.fps) * 10) / 10,
    aspect: c.width === 1920 ? 'landscape' : c.width === 1080 && c.height === 1920 ? 'portrait' : `${c.width}x${c.height}`
  }));
}

const SYSTEM_PROMPT = `You are a video director assembling a timeline from a library of pre-built Remotion compositions.
Given a user's description of what they want, pick the best compositions from the library and arrange them in a sensible order.

You MUST reply with a single JSON object and nothing else. Schema:
{
  "clips": [
    { "compId": "<exact id from library>", "trimEnd": <frames, optional to shorten>, "notes": "<why this clip>" }
  ],
  "crossfadeFrames": <0 for hard cuts, 15 for 0.5s fades, 30 for 1s fades>,
  "summary": "<one sentence explaining the video>"
}

Rules:
- Use only compIds that appear in the library. Never invent ids.
- Aim for the total duration requested (or around 20-30s if unspecified).
- Prefer an Intro category clip first and a CTA / Subscribe / Outro last when it makes sense.
- Use trimEnd to shorten long clips (e.g. a 20s intro trimmed to 5s via trimEnd:150).
- 3-6 clips typically. Never more than 10.`;

async function composeClaude(description, compositions) {
  const apiKey = resolveKey('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('No ANTHROPIC_API_KEY found');

  const userPrompt = `LIBRARY:
${JSON.stringify(buildLibrary(compositions), null, 2)}

REQUEST: ${description}

Respond with JSON only.`;

  const data = await postJson({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: {
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    }
  });

  return (data.content || []).map(c => c.text || '').join('').trim();
}

async function composeGemini(description, compositions) {
  const apiKey = resolveKey('GEMINI_API_KEY') || resolveKey('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('No GEMINI_API_KEY found');

  const model = 'gemini-3.1-pro-preview';
  const userPrompt = `${SYSTEM_PROMPT}

LIBRARY:
${JSON.stringify(buildLibrary(compositions), null, 2)}

REQUEST: ${description}

Respond with JSON only.`;

  const data = await postJson({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
    headers: {},
    body: {
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
    }
  });

  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('').trim();
}

// Compose a timeline from a natural-language description.
// provider: 'claude' | 'gemini' | 'auto' (auto picks whichever key is available, preferring Claude)
async function compose(description, compositions, provider = 'auto') {
  const available = availableProviders();
  let chosen = provider;
  if (chosen === 'auto') {
    chosen = available.claude ? 'claude' : (available.gemini ? 'gemini' : null);
    if (!chosen) throw new Error('No AI provider keys found. Add ANTHROPIC_API_KEY or GEMINI_API_KEY to an .env file.');
  } else if (!available[chosen]) {
    throw new Error(`${chosen.toUpperCase()} key not found. Add ${chosen === 'claude' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY'} to an .env file.`);
  }

  const text = chosen === 'claude'
    ? await composeClaude(description, compositions)
    : await composeGemini(description, compositions);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`${chosen} response had no JSON: ` + text.slice(0, 300));
  const parsed = JSON.parse(jsonMatch[0]);

  const libIds = new Set(compositions.map(c => c.id));
  parsed.clips = (parsed.clips || []).filter(clip => libIds.has(clip.compId));
  if (parsed.clips.length === 0) throw new Error(`${chosen} picked no valid compositions. Try a more specific request.`);
  parsed.providerUsed = chosen;
  return parsed;
}

module.exports = { compose, availableProviders };
