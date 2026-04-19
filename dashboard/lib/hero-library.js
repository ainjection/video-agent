// Hero Library — catalogue of pre-rendered hero clips (Blender / AI video
// gen / curated MP4s). Lives in public/hero-library/ so Remotion can
// staticFile() them directly.
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const HERO_DIR = path.join(PROJECT_ROOT, 'public', 'hero-library');
const MANIFEST_FILE = path.join(HERO_DIR, 'manifest.json');

function ensureDir() {
  if (!fs.existsSync(HERO_DIR)) fs.mkdirSync(HERO_DIR, { recursive: true });
  if (!fs.existsSync(MANIFEST_FILE)) fs.writeFileSync(MANIFEST_FILE, JSON.stringify({ clips: [] }, null, 2));
}

function readManifest() {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  } catch {
    return { clips: [] };
  }
}

function writeManifest(m) {
  ensureDir();
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(m, null, 2));
}

function listClips() {
  const m = readManifest();
  // Only return clips whose files still exist.
  return (m.clips || []).filter(c => fs.existsSync(path.join(HERO_DIR, c.filename)));
}

function addClip({ filename, name, description, category, durationSeconds, thumbnail, source, tags }) {
  if (!filename) throw new Error('filename required');
  const filePath = path.join(HERO_DIR, filename);
  if (!fs.existsSync(filePath)) throw new Error(`file not found in public/hero-library/: ${filename}`);
  const m = readManifest();
  const id = 'hero-' + filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const existing = m.clips.findIndex(c => c.id === id);
  const entry = {
    id,
    filename,
    name: name || filename,
    description: description || '',
    category: category || 'hero',
    durationSeconds: durationSeconds || null,
    thumbnail: thumbnail || null,
    source: source || 'unknown',
    tags: tags || [],
    addedAt: Date.now()
  };
  if (existing >= 0) m.clips[existing] = entry;
  else m.clips.push(entry);
  writeManifest(m);
  return entry;
}

function removeClip(id) {
  const m = readManifest();
  m.clips = (m.clips || []).filter(c => c.id !== id);
  writeManifest(m);
}

function getClip(id) {
  return (readManifest().clips || []).find(c => c.id === id) || null;
}

module.exports = { listClips, addClip, removeClip, getClip, HERO_DIR };
