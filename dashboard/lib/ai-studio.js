// AI Studio — conversational code-generation using Remotion's own system prompt.
// Supports Claude and Gemini, multi-turn chat with history.
const https = require('https');
const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, '..', 'data', 'remotion-system-prompt.md'),
  'utf8'
);

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
        } catch (err) { reject(new Error(`parse: ${err.message}`)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function chatClaude(messages) {
  const apiKey = resolveKey('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('No ANTHROPIC_API_KEY found');

  const data = await postJson({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: {
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages
    }
  });

  return (data.content || []).map(c => c.text || '').join('').trim();
}

async function chatGemini(messages) {
  const apiKey = resolveKey('GEMINI_API_KEY') || resolveKey('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('No GEMINI_API_KEY found');

  // Gemini doesn't have a separate system role; inline it as the first user
  // turn and prefix subsequent user turns normally.
  const contents = [
    { role: 'user', parts: [{ text: 'SYSTEM INSTRUCTIONS (follow exactly):\n\n' + SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. What would you like to create?' }] },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  ];

  const data = await postJson({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`,
    headers: {},
    body: {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    }
  });

  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('').trim();
}

async function chat(messages, provider = 'auto') {
  const hasClaude = !!resolveKey('ANTHROPIC_API_KEY');
  const hasGemini = !!(resolveKey('GEMINI_API_KEY') || resolveKey('GOOGLE_API_KEY'));

  let chosen = provider;
  if (chosen === 'auto') chosen = hasClaude ? 'claude' : (hasGemini ? 'gemini' : null);
  if (!chosen) throw new Error('No AI provider keys found');

  const reply = chosen === 'claude' ? await chatClaude(messages) : await chatGemini(messages);
  return { reply, providerUsed: chosen };
}

// Extract the first PROPERLY CLOSED TSX code block from an assistant reply.
// Accepts language tags: tsx, typescript, ts, jsx, js, or none.
// If the response is truncated (no closing fence), returns null — the UI
// will prompt the user to regenerate instead of trying to render broken code.
function extractTsxBlock(text) {
  const m = text.match(/```(?:tsx|typescript|ts|jsx|js)?\s*\n?([\s\S]*?)```/);
  if (!m) return null;
  const code = m[1].trim();
  if (!code) return null;
  if (/(?:export\s+(?:const|default|function)|import\s+)/.test(code)) return code;
  return null;
}

// Helper the UI uses to warn when a response looks truncated (fences unbalanced)
function looksTruncated(text) {
  const fences = (text.match(/```/g) || []).length;
  return fences % 2 === 1;
}

module.exports = { chat, extractTsxBlock, looksTruncated, SYSTEM_PROMPT };
