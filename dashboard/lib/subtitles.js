// Subtitle burn-in: extract audio → ElevenLabs Scribe → SRT → FFmpeg burn.
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const TMP_DIR = path.join(__dirname, '..', 'data', 'subtitles');

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

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { shell: true });
    let err = '';
    proc.stderr.on('data', c => { err += c.toString(); });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error('ffmpeg failed: ' + err.slice(-600)));
    });
  });
}

function secondsToSrtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

// ElevenLabs Scribe endpoint — returns word-level timings.
function transcribeWithElevenLabs(audioPath) {
  return new Promise((resolve, reject) => {
    const apiKey = resolveKey('ELEVEN_API_KEY');
    if (!apiKey) return reject(new Error('ELEVEN_API_KEY not set'));

    const boundary = '----videoAgent' + Date.now();
    const audio = fs.readFileSync(audioPath);
    const pre = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n`
    );
    const post = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([pre, audio, post]);

    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: '/v1/speech-to-text',
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(buf);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`ElevenLabs ${res.statusCode}: ${buf.slice(0, 400)}`));
        } catch (e) {
          reject(new Error('ElevenLabs parse error: ' + buf.slice(0, 400)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Group Scribe words into readable caption chunks (~8 words or ~3s each).
function wordsToSrt(words) {
  const chunks = [];
  let current = { start: null, end: 0, text: '' };
  for (const w of words || []) {
    const text = (w.text || w.word || '').trim();
    if (!text) continue;
    const start = typeof w.start === 'number' ? w.start : w.startTime;
    const end = typeof w.end === 'number' ? w.end : w.endTime;
    if (current.start === null) { current.start = start; current.text = text; current.end = end; continue; }
    current.text += ' ' + text;
    current.end = end;
    if (current.text.split(' ').length >= 8 || end - current.start > 3) {
      chunks.push(current);
      current = { start: null, end: 0, text: '' };
    }
  }
  if (current.start !== null) chunks.push(current);

  return chunks.map((c, i) =>
    `${i + 1}\n${secondsToSrtTime(c.start)} --> ${secondsToSrtTime(c.end)}\n${c.text}\n`
  ).join('\n');
}

async function burnSubtitles({ inputMp4, outputMp4, style }) {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  const base = path.basename(inputMp4, path.extname(inputMp4));
  const audioPath = path.join(TMP_DIR, `${base}.mp3`);
  const srtPath = path.join(TMP_DIR, `${base}.srt`);

  await runFfmpeg(['-y', '-i', `"${inputMp4}"`, '-vn', '-c:a', 'libmp3lame', '-q:a', '4', `"${audioPath}"`]);
  const transcript = await transcribeWithElevenLabs(audioPath);
  const words = transcript.words || transcript.segments?.flatMap(s => s.words) || [];
  if (!words.length) throw new Error('no words returned from transcription');
  fs.writeFileSync(srtPath, wordsToSrt(words));

  const styleOpts = style || 'FontName=Inter,FontSize=26,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=0,MarginV=80';
  // FFmpeg subtitles filter needs forward slashes even on Windows + escape colons.
  const srtForFilter = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  await runFfmpeg([
    '-y', '-i', `"${inputMp4}"`,
    '-vf', `"subtitles='${srtForFilter}':force_style='${styleOpts}'"`,
    '-c:a', 'copy',
    `"${outputMp4}"`
  ]);
  return { outputMp4, srtPath, wordCount: words.length };
}

module.exports = { burnSubtitles };
