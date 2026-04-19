// Given an array of sentences, ask the AI to pick a block + props for each
// so each scene looks different. Falls back to a preset rotation if no AI
// key is available.
const https = require('https');
const fs = require('fs');
const path = require('path');

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

// Per-style rotations used when "Auto" isn't an option (no AI key, or the
// user picks a named style).
const STYLE_ROTATIONS = {
  Cinematic: ['BlurIn', 'TextReveal', 'WordByWord', 'SplitHeadline', 'BlurIn'],
  Glitch: ['Glitch', 'TextReveal', 'Glitch', 'SplitHeadline', 'Glitch'],
  Minimal: ['BigHeadline', 'TextReveal', 'BigHeadline', 'WordByWord', 'BigHeadline'],
  Typewriter: ['TypewriterText', 'TypewriterText', 'TypingCode', 'TypewriterText', 'BigHeadline'],
  Bold: ['WordByWord', 'SplitHeadline', 'Glitch', 'WordByWord', 'BigHeadline']
};

const ACCENT_ROTATION = ['#00e676', '#00b0ff', '#ff0080', '#f59e0b', '#a78bfa'];

function applyStyleRotation(sentences, style) {
  const rotation = STYLE_ROTATIONS[style] || STYLE_ROTATIONS.Bold;
  return sentences.map((text, i) => ({
    block: rotation[i % rotation.length],
    blockProps: pickDefaultProps(rotation[i % rotation.length], text, i)
  }));
}

function pickDefaultProps(block, text, i) {
  const accent = ACCENT_ROTATION[i % ACCENT_ROTATION.length];
  switch (block) {
    case 'Glitch':
      return { accentColor1: accent, accentColor2: '#00ffe0', intensity: 1 };
    case 'WordByWord':
      return { accentColor: accent, accentEvery: 3, fontSize: 110 };
    case 'SplitHeadline': {
      const words = text.split(/\s+/);
      const mid = Math.floor(words.length / 2);
      return { topText: words.slice(0, mid).join(' ').toUpperCase(), bottomText: words.slice(mid).join(' ').toUpperCase(), bottomColor: accent, fontSize: 200 };
    }
    case 'TextReveal':
      return { direction: ['left', 'right', 'up'][i % 3], easing: 'inOut', fontSize: 150 };
    case 'BlurIn':
      return { startBlur: 40, durationInFrames: 30, fontSize: 180 };
    case 'TypewriterText':
      return { charsPerSecond: 22 };
    case 'TypingCode':
      return { code: text, language: 'markdown', charsPerSecond: 35 };
    case 'CountUp':
      return { from: 0, to: 100, suffix: '%' };
    default:
      return {};
  }
}

async function pickScenesWithClaude(sentences) {
  const apiKey = resolveKey('ANTHROPIC_API_KEY');
  if (!apiKey) return null;

  const catalog = [
    'BigHeadline', 'TextReveal', 'WordByWord', 'BlurIn',
    'Glitch', 'SplitHeadline', 'TypewriterText', 'TypingCode', 'CountUp'
  ];

  const system = `You are a motion designer choosing which visual treatment to use for each sentence of a short voiceover video. For each sentence, pick exactly one block from this list and a few props that fit the content. Each scene must look different from its neighbours. Pick accent colours from a cohesive palette (neon green #00e676, cyan #00b0ff, magenta #ff0080, amber #f59e0b, violet #a78bfa).

Available blocks: ${catalog.join(', ')}

Reply with ONLY a JSON array of objects, one per sentence, shape:
[{ "block": "TextReveal", "blockProps": { "color": "#fff", "direction": "left", "fontSize": 160 } }]

Rules:
- Don't repeat the same block in a row
- For SplitHeadline, set topText and bottomText (split the sentence in half, UPPERCASE)
- For CountUp, only use if the sentence mentions a number
- For TypingCode, only use if the sentence is code-flavoured
- fontSize between 80 and 220`;

  const user = sentences.map((s, i) => `${i + 1}. ${s}`).join('\n');

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: user }]
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try {
          const data = JSON.parse(buf);
          const text = (data.content || []).map(c => c.text || '').join('');
          const match = text.match(/\[[\s\S]*\]/);
          if (!match) return resolve(null);
          const parsed = JSON.parse(match[0]);
          resolve(parsed);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

// Main entry: given sentences + style choice, return per-scene block/props.
async function chooseScenesForSentences({ sentences, style }) {
  if (style === 'Auto' || !style) {
    const ai = await pickScenesWithClaude(sentences);
    if (ai && ai.length === sentences.length) return ai;
    // Fallback if AI wobbles — rotate through Bold.
    return applyStyleRotation(sentences, 'Bold');
  }
  return applyStyleRotation(sentences, style);
}

module.exports = { chooseScenesForSentences, STYLE_ROTATIONS };
