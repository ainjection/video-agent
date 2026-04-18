const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Supported target aspects. Each maps to {label, width, height}.
const ASPECTS = {
  '9x16': { label: '9:16 Portrait', width: 1080, height: 1920 },
  '1x1':  { label: '1:1 Square',    width: 1080, height: 1080 },
  '4x5':  { label: '4:5 Portrait',  width: 1080, height: 1350 }
};

// Run ffmpeg to crop+scale a source MP4 into a new aspect.
// Uses center-crop + scale to target dimensions. Deterministic, no letterbox.
function convertAspect(sourcePath, targetKey) {
  const target = ASPECTS[targetKey];
  if (!target) throw new Error(`Unknown aspect ${targetKey}`);

  const srcBase = path.basename(sourcePath, path.extname(sourcePath));
  const outPath = path.join(path.dirname(sourcePath), `${srcBase}-${targetKey}.mp4`);

  // Center-crop then scale: crop=W:H:x:y, scale=tw:th
  // Using `min(iw,ih*aspect)` to compute crop width that matches target aspect
  const aspectRatio = `${target.width}/${target.height}`;
  const vf = [
    `crop='min(iw,ih*${aspectRatio})':'min(ih,iw*${target.height}/${target.width})'`,
    `scale=${target.width}:${target.height}`
  ].join(',');

  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', sourcePath, '-vf', vf, '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'copy', outPath];
    const proc = spawn('ffmpeg', args, { shell: true });
    let errBuf = '';
    proc.stderr.on('data', d => { errBuf += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outPath)) resolve({ path: outPath, filename: path.basename(outPath) });
      else reject(new Error(errBuf.split(/\r?\n/).slice(-3).join(' ').slice(0, 300) || `ffmpeg exit ${code}`));
    });
  });
}

module.exports = { ASPECTS, convertAspect };
