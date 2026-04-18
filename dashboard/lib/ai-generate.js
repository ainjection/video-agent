// AI Generate — turns a description + optional images into a block plan
// (JSON). The plan is then compiled to TSX by compile-plan.js.
const aiCompose = require('./ai-compose');
const CATALOG = require('./blocks-catalog');
const https = require('https');
const fs = require('fs');
const path = require('path');

function resolveKey(varName) {
  if (process.env[varName]) return process.env[varName];
  const candidates = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env'),
    'C:/Users/clawb/Desktop/obsidian-engine-review/.env',
    'C:/Users/clawb/Desktop/videoteach/.env'
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

function postJson({ hostname, path: p, headers, body }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname, path: p, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers }
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

function buildSystemPrompt() {
  const catalog = Object.entries(CATALOG).map(([name, spec]) => {
    const props = Object.entries(spec.props || {})
      .map(([pname, ps]) => `    ${pname}: ${ps.type}${ps.default !== undefined ? ` (default: ${JSON.stringify(ps.default)})` : ''}${ps.required ? ' — REQUIRED' : ''}`)
      .join('\n');
    return `### ${name} (${spec.category})
${spec.description}
Props:
${props}`;
  }).join('\n\n');

  return `You are a video director composing short videos from a library of pre-built scene blocks.
Given the user's description and any images they've uploaded, output a JSON plan that layers blocks on a timeline.

AVAILABLE BLOCKS:
${catalog}

OUTPUT SCHEMA (respond with JSON only, no prose):
{
  "name": "<short PascalCase name, no spaces>",
  "totalDuration": <frames at 30fps>,
  "scenes": [
    { "block": "<block name from catalog>", "props": { ... }, "duration": <frames>, "start": <frame offset, optional> }
  ]
}

LAYERING RULES:
- Scenes render in order. If you want layers (e.g. background + foreground), give them the same "start" frame.
- By default "start" is the end of the previous scene (sequential playback).
- Set an explicit "start" when you want overlap.
- For layered composition: first scene = background at start:0, second scene = frame/content at start:0, third scene = overlay at start:0. All with the same duration.

RULES:
- Use ONLY block names from the catalog. Never invent new ones.
- Ensure all required props are provided.
- For image props, use the exact image paths the user provides (e.g. "images/abc123.png").
- Aim for 3-5 scenes typically. Keep total duration 90-300 frames (3-10 seconds) unless the user specifies.
- Choose colours and style to match the user's described mood.
- Hex colours only, no named colours.

Respond with JSON only.`;
}

function buildUserPrompt(description, imagePaths) {
  const imageList = imagePaths && imagePaths.length
    ? `\nUPLOADED IMAGES (use in "image" props as needed):\n${imagePaths.map((p, i) => `- ${p}`).join('\n')}`
    : '\nNo images uploaded — avoid blocks that require an image prop (iPadFrame, iPhoneFrame, BrowserWindow, ImageZoom, LogoReveal with image).';
  return `DESCRIPTION:
${description}
${imageList}

Respond with the JSON plan only.`;
}

async function generatePlanClaude(description, imagePaths) {
  const apiKey = resolveKey('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('No ANTHROPIC_API_KEY found');

  const data = await postJson({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: {
      model: 'claude-sonnet-4-5',
      max_tokens: 2500,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(description, imagePaths) }]
    }
  });

  return (data.content || []).map(c => c.text || '').join('').trim();
}

async function generatePlanGemini(description, imagePaths) {
  const apiKey = resolveKey('GEMINI_API_KEY') || resolveKey('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('No GEMINI_API_KEY found');

  const combinedPrompt = `${buildSystemPrompt()}

---

${buildUserPrompt(description, imagePaths)}`;

  const data = await postJson({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`,
    headers: {},
    body: {
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
    }
  });

  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('').trim();
}

async function generate(description, imagePaths, provider = 'auto') {
  const available = aiCompose.availableProviders();
  let chosen = provider;
  if (chosen === 'auto') {
    chosen = available.claude ? 'claude' : (available.gemini ? 'gemini' : null);
    if (!chosen) throw new Error('No AI provider keys found');
  }

  const text = chosen === 'claude'
    ? await generatePlanClaude(description, imagePaths)
    : await generatePlanGemini(description, imagePaths);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`${chosen} response had no JSON: ` + text.slice(0, 300));
  const plan = JSON.parse(jsonMatch[0]);

  // Validate blocks exist
  (plan.scenes || []).forEach((s, i) => {
    if (!CATALOG[s.block]) throw new Error(`AI picked unknown block at scene ${i}: ${s.block}`);
  });

  plan.providerUsed = chosen;
  return plan;
}

module.exports = { generate };
