// Very small multipart/form-data parser for uploading audio files.
// Enough for single-file uploads in a local dashboard — don't use for
// production with untrusted input.
const fs = require('fs');
const path = require('path');

function parseMultipart(req, boundary, onFile, onEnd) {
  const BOUNDARY = Buffer.from('--' + boundary);
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const buf = Buffer.concat(chunks);
    // Split by boundary
    const parts = [];
    let idx = 0;
    while (idx < buf.length) {
      const start = buf.indexOf(BOUNDARY, idx);
      if (start === -1) break;
      const end = buf.indexOf(BOUNDARY, start + BOUNDARY.length);
      if (end === -1) break;
      parts.push(buf.slice(start + BOUNDARY.length, end));
      idx = end;
    }

    parts.forEach(part => {
      // Skip leading \r\n and trailing \r\n
      let p = part;
      if (p[0] === 0x0d) p = p.slice(2); // \r\n
      if (p.slice(-2).equals(Buffer.from([0x0d, 0x0a]))) p = p.slice(0, -2);

      const headerEnd = p.indexOf(Buffer.from('\r\n\r\n'));
      if (headerEnd === -1) return;
      const headerText = p.slice(0, headerEnd).toString('utf8');
      const body = p.slice(headerEnd + 4);

      const dispMatch = headerText.match(/filename="([^"]+)"/);
      const typeMatch = headerText.match(/Content-Type:\s*(\S+)/i);
      if (dispMatch) {
        onFile({ filename: dispMatch[1], mimetype: typeMatch ? typeMatch[1] : 'application/octet-stream', data: body });
      }
    });

    onEnd();
  });
}

function saveAudio(req, res, saveDir, sendFn) {
  return saveFiles(req, res, saveDir, sendFn, 'filename');
}

// Upload one or more files. Returns array of {filename, originalName}
function saveFiles(req, res, saveDir, sendFn, singleKey) {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=([^;]+)/);
  if (!boundaryMatch) return sendFn(res, 400, { error: 'no multipart boundary' });
  const boundary = boundaryMatch[1].trim();

  if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

  const saved = [];
  parseMultipart(req, boundary, (file) => {
    const safeName = file.filename.replace(/[^A-Za-z0-9._-]/g, '_');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${safeName}`;
    const filePath = path.join(saveDir, filename);
    fs.writeFileSync(filePath, file.data);
    saved.push({ filename, originalName: file.filename, path: filePath });
  }, () => {
    if (!saved.length) return sendFn(res, 400, { error: 'no files received' });
    if (singleKey) {
      sendFn(res, 200, { ok: true, filename: saved[0].filename });
    } else {
      sendFn(res, 200, { ok: true, files: saved });
    }
  });
}

module.exports = { saveAudio, saveFiles };
