const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'render-history.json');

function ensureFile() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
}

function list() {
  ensureFile();
  const raw = fs.readFileSync(FILE, 'utf8');
  try { return JSON.parse(raw); } catch { return []; }
}

function save(all) {
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
}

function add(entry) {
  const all = list();
  all.unshift({ ...entry, createdAt: Date.now() });
  // cap at 200 entries
  if (all.length > 200) all.splice(200);
  save(all);
  return all[0];
}

function update(id, patch) {
  const all = list();
  const i = all.findIndex(e => e.id === id);
  if (i === -1) return null;
  all[i] = { ...all[i], ...patch };
  save(all);
  return all[i];
}

function get(id) {
  return list().find(e => e.id === id);
}

module.exports = { list, add, update, get };
