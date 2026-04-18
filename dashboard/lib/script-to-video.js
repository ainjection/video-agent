// Script-to-video: sentence-by-sentence ElevenLabs voiceover + block-based
// Remotion composition. Builds a ScriptScene[] prop array that gets passed
// to the generic <ScriptRunner> composition already registered in Root.tsx.
const https = require('https');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const VO_DIR = path.join(PUBLIC_DIR, 'script-vo');

const DEFAULT_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // Daniel

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

function splitSentences(script) {
  // Keep line breaks as sentence breaks too.
  return script
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+|\n+/g)
    .map(s => s.trim())
    .filter(s => s.length > 4);
}

function ttsElevenLabs({ text, voiceId, outPath }) {
  return new Promise((resolve, reject) => {
    const apiKey = resolveKey('ELEVEN_API_KEY');
    if (!apiKey) return reject(new Error('ELEVEN_API_KEY not set'));
    const body = JSON.stringify({ text, model_id: 'eleven_multilingual_v2' });
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        let buf = '';
        res.on('data', c => { buf += c; });
        res.on('end', () => reject(new Error(`ElevenLabs ${res.statusCode}: ${buf.slice(0, 300)}`)));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        fs.writeFileSync(outPath, Buffer.concat(chunks));
        resolve(outPath);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function probeDurationSeconds(audioPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', `"${audioPath}"`], { shell: true });
    let out = '';
    let err = '';
    proc.stdout.on('data', c => { out += c.toString(); });
    proc.stderr.on('data', c => { err += c.toString(); });
    proc.on('close', code => {
      if (code !== 0) return reject(new Error('ffprobe failed: ' + err.slice(-300)));
      const seconds = parseFloat(out.trim());
      if (!seconds || Number.isNaN(seconds)) return reject(new Error('ffprobe returned no duration'));
      resolve(seconds);
    });
  });
}

async function buildScenes({ script, voiceId }) {
  if (!fs.existsSync(VO_DIR)) fs.mkdirSync(VO_DIR, { recursive: true });
  const sentences = splitSentences(script);
  if (!sentences.length) throw new Error('script is empty after sentence split');
  const runId = randomUUID().slice(0, 8);
  const batchDir = path.join(VO_DIR, runId);
  fs.mkdirSync(batchDir, { recursive: true });

  const scenes = [];
  for (let i = 0; i < sentences.length; i++) {
    const text = sentences[i];
    const audioPath = path.join(batchDir, `${String(i).padStart(3, '0')}.mp3`);
    await ttsElevenLabs({ text, voiceId: voiceId || DEFAULT_VOICE, outPath: audioPath });
    const seconds = await probeDurationSeconds(audioPath);
    // Add 0.4s breathing room after each sentence.
    const durationInFrames = Math.round((seconds + 0.4) * 30);
    // Scene uses staticFile path relative to /public
    const relativeAudio = path.posix.join('script-vo', runId, `${String(i).padStart(3, '0')}.mp3`);
    scenes.push({ text, audio: relativeAudio, durationInFrames });
  }
  const totalFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  return { runId, scenes, totalFrames };
}

module.exports = { buildScenes, splitSentences };
