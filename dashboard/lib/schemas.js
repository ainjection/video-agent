const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'schemas.json');

function ensureFile() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');
}

function readAll() {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; }
}

function writeAll(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function get(compId) {
  return readAll()[compId] || null;
}

function set(compId, schema) {
  const all = readAll();
  all[compId] = schema;
  writeAll(all);
}

function rename(oldId, newId) {
  const all = readAll();
  if (all[oldId]) {
    all[newId] = all[oldId];
    delete all[oldId];
    writeAll(all);
  }
}

function remove(compId) {
  const all = readAll();
  delete all[compId];
  writeAll(all);
}

module.exports = { get, set, rename, remove };
