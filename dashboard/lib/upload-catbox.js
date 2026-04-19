// Simple anonymous video hosting via catbox.moe. Returns a permanent
// public URL like https://files.catbox.moe/xxxxxx.mp4 — perfect for
// handing off to Blotato which needs a URL to ingest from.
const https = require('https');
const fs = require('fs');

function uploadToCatbox(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject(new Error('file not found: ' + filePath));
    const data = fs.readFileSync(filePath);
    const filename = filePath.split(/[\\/]/).pop();

    const boundary = '----videoAgent' + Date.now();
    const CRLF = '\r\n';
    const preamble = Buffer.from(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="reqtype"${CRLF}${CRLF}fileupload${CRLF}` +
      `--${boundary}${CRLF}Content-Disposition: form-data; name="fileToUpload"; filename="${filename}"${CRLF}Content-Type: video/mp4${CRLF}${CRLF}`
    );
    const epilogue = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);
    const body = Buffer.concat([preamble, data, epilogue]);

    const req = https.request({
      hostname: 'catbox.moe',
      path: '/user/api.php',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'User-Agent': 'video-agent/0.1'
      }
    }, (res) => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        const trimmed = buf.trim();
        if (res.statusCode >= 200 && res.statusCode < 300 && /^https?:\/\//.test(trimmed)) {
          resolve({ url: trimmed });
        } else {
          reject(new Error(`catbox ${res.statusCode}: ${trimmed.slice(0, 300) || 'empty response'}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { uploadToCatbox };
