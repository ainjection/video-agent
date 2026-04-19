// Auto-Edit pipeline: raw MP4 → clean edited MP4.
//
// Stages (each optional):
//   1. Transcribe via ElevenLabs Scribe                   → word-level timings
//   2. Rule-based filler detection (um, uh, like, …)      → list of ranges to cut
//   3. Claude-driven AI cuts (retakes, false starts)      → list of ranges to cut
//   4. Silence trim (gaps > N seconds in word timings)    → list of ranges to cut
//   5. Build KEEP list (invert & merge CUT ranges)
//   6. FFmpeg single pass: trim+concat → captions (SRT burn) → loudnorm+compressor
//
// Each job gets a jobId. Progress is streamed via an in-memory event bus
// so the server can SSE it to the dashboard.
const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const WORK_DIR = path.join(__dirname, '..', 'data', 'auto-edit');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');

// In-memory job tracker
const jobs = new Map(); // id → { status, stage, progress, log, listeners, result, error }

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

function emit(job, patch) {
  Object.assign(job, patch);
  for (const fn of job.listeners) {
    try { fn(job); } catch {}
  }
}

function subscribe(jobId, fn) {
  const job = jobs.get(jobId);
  if (!job) return () => {};
  job.listeners.add(fn);
  fn(job); // fire immediately with current state
  return () => job.listeners.delete(fn);
}

function getJob(jobId) {
  return jobs.get(jobId) || null;
}

// ──────────────────────────────────────────────────────────────────────
// Rule-based filler detection
// ──────────────────────────────────────────────────────────────────────

const FILLER_SINGLE_WORDS = new Set([
  'um', 'uh', 'er', 'erm', 'ah', 'hmm', 'mm', 'mmm', 'uhh', 'umm', 'uhm',
  'like'  // "like" is contextually iffy — still, in casual YT it's often filler
]);

// Phrases that are almost always fillers when present as standalone groups
const FILLER_PHRASES = [
  ['you', 'know'],
  ['i', 'mean'],
  ['sort', 'of'],
  ['kind', 'of']
];

function rangesFromFillers(words) {
  const ranges = [];
  const lc = words.map(w => (w.text || w.word || '').toLowerCase().replace(/[^a-z']/g, ''));
  for (let i = 0; i < words.length; i++) {
    if (FILLER_SINGLE_WORDS.has(lc[i])) {
      const w = words[i];
      const start = typeof w.start === 'number' ? w.start : w.startTime;
      const end = typeof w.end === 'number' ? w.end : w.endTime;
      ranges.push({ start, end, reason: 'filler:' + lc[i] });
      continue;
    }
    for (const phrase of FILLER_PHRASES) {
      if (phrase.every((p, k) => lc[i + k] === p)) {
        const s = words[i];
        const e = words[i + phrase.length - 1];
        ranges.push({
          start: typeof s.start === 'number' ? s.start : s.startTime,
          end: typeof e.end === 'number' ? e.end : e.endTime,
          reason: 'filler:' + phrase.join(' ')
        });
        i += phrase.length - 1;
        break;
      }
    }
  }
  return ranges;
}

// ──────────────────────────────────────────────────────────────────────
// Silence detection — gaps between consecutive words
// ──────────────────────────────────────────────────────────────────────

function rangesFromSilence(words, maxGapSeconds = 1.2, trimToSeconds = 0.4) {
  const ranges = [];
  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    const cur = words[i];
    const prevEnd = typeof prev.end === 'number' ? prev.end : prev.endTime;
    const curStart = typeof cur.start === 'number' ? cur.start : cur.startTime;
    const gap = curStart - prevEnd;
    if (gap > maxGapSeconds) {
      // Trim the middle of the gap, leaving ~trimToSeconds of air on each side
      const cutStart = prevEnd + trimToSeconds;
      const cutEnd = curStart - trimToSeconds;
      if (cutEnd > cutStart + 0.1) {
        ranges.push({ start: cutStart, end: cutEnd, reason: `silence:${gap.toFixed(1)}s` });
      }
    }
  }
  return ranges;
}

// ──────────────────────────────────────────────────────────────────────
// Claude-driven AI cuts: retakes, false starts
// ──────────────────────────────────────────────────────────────────────

function claudeCutPlan(words, anthropicKey) {
  return new Promise((resolve, reject) => {
    // Build a numbered transcript. Feed Claude enough signal to spot retakes.
    // Cap at ~4000 words to stay within sensible token budgets on long clips.
    const clipped = words.slice(0, 4000);
    const numbered = clipped.map((w, i) => {
      const start = typeof w.start === 'number' ? w.start : w.startTime;
      return `${i} [${start.toFixed(2)}s] ${(w.text || w.word || '').trim()}`;
    }).join(' ');

    const prompt = `You are editing a spoken-video transcript. Each word is indexed and timestamped.

Find spans to REMOVE — false starts, retakes (same sentence said twice with the 2nd being the clean take), and obvious misspeaks. Ignore normal filler (um/uh/like) — another pass handles those.

Only return ranges you're confident improve the edit. If unsure, do nothing.

Return ONLY valid JSON, no prose:
[{"startIndex": <number>, "endIndex": <number>, "reason": "retake|falsestart|misspeak"}]

Transcript:
${numbered}`;

    const body = JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
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
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`Claude ${res.statusCode}: ${buf.slice(0, 300)}`));
          }
          const text = (data.content || []).map(c => c.text || '').join('');
          const m = text.match(/\[[\s\S]*\]/);
          if (!m) return resolve([]);
          const parsed = JSON.parse(m[0]);
          // Map index ranges back to time ranges
          const ranges = [];
          for (const item of parsed) {
            const s = clipped[item.startIndex];
            const e = clipped[item.endIndex];
            if (!s || !e) continue;
            const start = typeof s.start === 'number' ? s.start : s.startTime;
            const end = typeof e.end === 'number' ? e.end : e.endTime;
            if (end > start) ranges.push({ start, end, reason: 'ai:' + (item.reason || 'cut') });
          }
          resolve(ranges);
        } catch (err) {
          resolve([]); // best-effort — don't fail the whole pipeline
        }
      });
    });
    req.on('error', () => resolve([]));
    req.write(body);
    req.end();
  });
}

// ──────────────────────────────────────────────────────────────────────
// Range merging + keep-list construction
// ──────────────────────────────────────────────────────────────────────

function mergeRanges(ranges) {
  if (!ranges.length) return [];
  const sorted = ranges.slice().sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end + 0.05) {
      last.end = Math.max(last.end, cur.end);
      last.reason = last.reason + '+' + cur.reason;
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

function buildKeepList(cuts, totalDuration) {
  if (!cuts.length) return [{ start: 0, end: totalDuration }];
  const keeps = [];
  let cursor = 0;
  for (const cut of cuts) {
    if (cut.start > cursor + 0.05) keeps.push({ start: cursor, end: cut.start });
    cursor = Math.max(cursor, cut.end);
  }
  if (cursor < totalDuration - 0.05) keeps.push({ start: cursor, end: totalDuration });
  return keeps.filter(k => k.end - k.start > 0.12);
}

// ──────────────────────────────────────────────────────────────────────
// FFmpeg helpers
// ──────────────────────────────────────────────────────────────────────

function runFfmpeg(args, onProgress) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { shell: true });
    let err = '';
    proc.stderr.on('data', c => {
      const s = c.toString();
      err += s;
      if (onProgress) {
        const m = s.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (m) {
          const seconds = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
          onProgress(seconds);
        }
      }
    });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error('ffmpeg failed: ' + err.slice(-500)));
    });
  });
}

function probeDuration(inputPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', `"${inputPath}"`
    ], { shell: true });
    let out = '';
    let err = '';
    proc.stdout.on('data', c => { out += c; });
    proc.stderr.on('data', c => { err += c; });
    proc.on('close', code => {
      if (code !== 0) return reject(new Error('ffprobe: ' + err.slice(-300)));
      const d = parseFloat(out.trim());
      if (!d || Number.isNaN(d)) return reject(new Error('no duration'));
      resolve(d);
    });
  });
}

// ──────────────────────────────────────────────────────────────────────
// Transcription via ElevenLabs Scribe
// ──────────────────────────────────────────────────────────────────────

function transcribe(audioPath) {
  return new Promise((resolve, reject) => {
    const key = resolveKey('ELEVEN_API_KEY');
    if (!key) return reject(new Error('ELEVEN_API_KEY not set'));
    const boundary = '----ae' + Date.now();
    const data = fs.readFileSync(audioPath);
    const pre = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n`
    );
    const post = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([pre, data, post]);
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: '/v1/speech-to-text',
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try {
          const p = JSON.parse(buf);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`Scribe ${res.statusCode}: ${buf.slice(0, 300)}`));
          }
          const words = p.words || (p.segments && p.segments.flatMap(s => s.words)) || [];
          resolve(words);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ──────────────────────────────────────────────────────────────────────
// Caption generation from KEEP list
// ──────────────────────────────────────────────────────────────────────

function secondsToSrtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

// Build captions against the FINAL output timeline (kept words only, re-timed).
function captionsFromKeeps(words, keeps) {
  // For each word, find which keep-segment it falls in, compute its output-time.
  const outputWords = [];
  let outCursor = 0;
  for (const k of keeps) {
    for (const w of words) {
      const ws = typeof w.start === 'number' ? w.start : w.startTime;
      const we = typeof w.end === 'number' ? w.end : w.endTime;
      if (ws >= k.start && we <= k.end) {
        outputWords.push({
          text: (w.text || w.word || '').trim(),
          start: outCursor + (ws - k.start),
          end: outCursor + (we - k.start)
        });
      }
    }
    outCursor += (k.end - k.start);
  }
  // Group into ~8-word / 3s chunks (same style as subtitle burn)
  const chunks = [];
  let cur = { start: null, end: 0, text: '' };
  for (const w of outputWords) {
    if (!w.text) continue;
    if (cur.start === null) { cur.start = w.start; cur.text = w.text; cur.end = w.end; continue; }
    cur.text += ' ' + w.text;
    cur.end = w.end;
    if (cur.text.split(' ').length >= 8 || w.end - cur.start > 3) {
      chunks.push(cur);
      cur = { start: null, end: 0, text: '' };
    }
  }
  if (cur.start !== null) chunks.push(cur);
  return chunks.map((c, i) => `${i + 1}\n${secondsToSrtTime(c.start)} --> ${secondsToSrtTime(c.end)}\n${c.text}\n`).join('\n');
}

// ──────────────────────────────────────────────────────────────────────
// Main — orchestrator
// ──────────────────────────────────────────────────────────────────────

async function autoEdit({ inputPath, outputName, options = {} }) {
  const {
    doFillers = true,
    doSilence = true,
    doAiCuts = true,
    silenceGapSeconds = 1.2,
    doCaptions = true,
    doAudioPolish = true
  } = options;

  const jobId = randomUUID().slice(0, 8);
  const job = {
    id: jobId,
    status: 'running',
    stage: 'starting',
    progress: 0,
    log: '',
    listeners: new Set(),
    result: null,
    error: null
  };
  jobs.set(jobId, job);

  // Kick off async so the caller gets jobId immediately
  (async () => {
    try {
      if (!fs.existsSync(inputPath)) throw new Error('input file not found: ' + inputPath);
      if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });
      if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const jobDir = path.join(WORK_DIR, `${stamp}_${jobId}`);
      fs.mkdirSync(jobDir, { recursive: true });
      const audioPath = path.join(jobDir, 'audio.mp3');
      const srtPath = path.join(jobDir, 'captions.srt');
      const finalOut = path.join(OUT_DIR, outputName || `auto-edit-${stamp}.mp4`);

      // Stage 1: extract audio
      emit(job, { stage: 'extracting audio', progress: 5 });
      await runFfmpeg(['-y', '-i', `"${inputPath}"`, '-vn', '-c:a', 'libmp3lame', '-q:a', '4', `"${audioPath}"`]);

      // Stage 2: transcribe
      emit(job, { stage: 'transcribing (ElevenLabs Scribe)', progress: 15 });
      const words = await transcribe(audioPath);
      if (!words.length) throw new Error('transcription returned no words');
      emit(job, { log: `transcribed ${words.length} words`, progress: 30 });

      // Stage 3: rule-based filler detection
      let cuts = [];
      if (doFillers) {
        emit(job, { stage: 'detecting fillers', progress: 35 });
        const fillerRanges = rangesFromFillers(words);
        cuts = cuts.concat(fillerRanges);
        emit(job, { log: `${fillerRanges.length} filler ranges` });
      }

      // Stage 4: Claude AI cuts
      if (doAiCuts) {
        emit(job, { stage: 'AI cut planning (Claude)', progress: 45 });
        const anthropicKey = resolveKey('ANTHROPIC_API_KEY');
        if (anthropicKey) {
          try {
            const aiRanges = await claudeCutPlan(words, anthropicKey);
            cuts = cuts.concat(aiRanges);
            emit(job, { log: `${aiRanges.length} AI-suggested ranges` });
          } catch (err) {
            emit(job, { log: `AI cuts skipped: ${err.message}` });
          }
        } else {
          emit(job, { log: 'skipped — no ANTHROPIC_API_KEY' });
        }
      }

      // Stage 5: silence trimming
      if (doSilence) {
        emit(job, { stage: 'trimming silences', progress: 55 });
        const silenceRanges = rangesFromSilence(words, silenceGapSeconds);
        cuts = cuts.concat(silenceRanges);
        emit(job, { log: `${silenceRanges.length} silence ranges` });
      }

      // Merge & build keep list
      emit(job, { stage: 'building keep list', progress: 60 });
      const mergedCuts = mergeRanges(cuts);
      const totalDur = await probeDuration(inputPath);
      const keeps = buildKeepList(mergedCuts, totalDur);
      const keptSecs = keeps.reduce((s, k) => s + (k.end - k.start), 0);
      emit(job, {
        log: `kept ${keeps.length} segments · ${keptSecs.toFixed(1)}s of ${totalDur.toFixed(1)}s (${Math.round(keptSecs / totalDur * 100)}%)`,
        progress: 65
      });

      // Captions from keeps (output timeline)
      if (doCaptions) {
        const srt = captionsFromKeeps(words, keeps);
        fs.writeFileSync(srtPath, srt);
      }

      // Stage 6: final render
      emit(job, { stage: 'rendering final cut', progress: 70 });

      // Build filter_complex: trim each keep segment, concat, apply captions + audio
      const filters = [];
      for (let i = 0; i < keeps.length; i++) {
        const { start, end } = keeps[i];
        filters.push(`[0:v]trim=${start.toFixed(3)}:${end.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
        filters.push(`[0:a]atrim=${start.toFixed(3)}:${end.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
      }
      const concatInputs = keeps.map((_, i) => `[v${i}][a${i}]`).join('');
      filters.push(`${concatInputs}concat=n=${keeps.length}:v=1:a=1[vout][aout]`);

      // Optional subtitle burn chained onto [vout]
      let videoOutLabel = 'vout';
      if (doCaptions) {
        const srtForFilter = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
        const style = 'FontName=Inter,FontSize=26,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=0,MarginV=80';
        filters.push(`[vout]subtitles='${srtForFilter}':force_style='${style}'[vcap]`);
        videoOutLabel = 'vcap';
      }

      // Optional audio polish chained onto [aout]
      let audioOutLabel = 'aout';
      if (doAudioPolish) {
        filters.push(`[aout]loudnorm=I=-16:TP=-1.5:LRA=11,acompressor=threshold=-18dB:ratio=3:attack=5:release=50:makeup=2[apol]`);
        audioOutLabel = 'apol';
      }

      const filterComplex = filters.join(';');

      await runFfmpeg([
        '-y', '-i', `"${inputPath}"`,
        '-filter_complex', `"${filterComplex}"`,
        '-map', `"[${videoOutLabel}]"`,
        '-map', `"[${audioOutLabel}]"`,
        '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k',
        `"${finalOut}"`
      ], (seconds) => {
        const pct = Math.min(99, 70 + Math.round((seconds / keptSecs) * 29));
        emit(job, { progress: pct });
      });

      const size = fs.statSync(finalOut).size;
      emit(job, {
        status: 'done',
        stage: 'done',
        progress: 100,
        result: {
          outputPath: finalOut,
          outputName: path.basename(finalOut),
          sizeBytes: size,
          durationSeconds: keptSecs,
          originalSeconds: totalDur,
          trimmedPct: Math.round((1 - keptSecs / totalDur) * 100),
          keeps,
          cuts: mergedCuts
        }
      });
    } catch (err) {
      emit(job, { status: 'failed', stage: 'failed', error: err.message });
    }
  })();

  return { jobId };
}

module.exports = { autoEdit, getJob, subscribe };
