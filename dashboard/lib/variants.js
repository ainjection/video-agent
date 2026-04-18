const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'variants.json');

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

// All variants for a given composition id
function listFor(compId) {
  const all = readAll();
  return all[compId] || [];
}

function saveVariant(compId, variant) {
  const all = readAll();
  if (!all[compId]) all[compId] = [];
  const existing = all[compId].findIndex(v => v.id === variant.id);
  const entry = { ...variant, updatedAt: Date.now() };
  if (existing === -1) {
    entry.id = entry.id || Date.now().toString(36);
    entry.createdAt = Date.now();
    all[compId].push(entry);
  } else {
    all[compId][existing] = { ...all[compId][existing], ...entry };
  }
  writeAll(all);
  return entry;
}

function removeVariant(compId, variantId) {
  const all = readAll();
  if (!all[compId]) return;
  all[compId] = all[compId].filter(v => v.id !== variantId);
  writeAll(all);
}

function getVariant(compId, variantId) {
  return listFor(compId).find(v => v.id === variantId);
}

module.exports = { listFor, saveVariant, removeVariant, getVariant };
