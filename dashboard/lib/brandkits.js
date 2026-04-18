const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'brandkits.json');

const DEFAULTS = [
  {
    id: 'ai-injection',
    name: 'AI Injection',
    colors: {
      primary: '#00FF41',
      secondary: '#FF4500',
      accent: '#FFD700',
      background: '#050507',
      text: '#ffffff'
    },
    fonts: {
      heading: 'Arial Black, sans-serif',
      body: 'Arial, sans-serif',
      mono: 'Courier New, monospace'
    }
  },
  {
    id: 'two-flags',
    name: 'Two Flags',
    colors: {
      primary: '#E53935',
      secondary: '#1976D2',
      accent: '#FFFFFF',
      background: '#0a0a0a',
      text: '#ffffff'
    },
    fonts: {
      heading: 'Arial Black, sans-serif',
      body: 'Arial, sans-serif',
      mono: 'Courier New, monospace'
    }
  },
  {
    id: 'hidden-mind',
    name: 'Hidden Mind',
    colors: {
      primary: '#8B5CF6',
      secondary: '#22C55E',
      accent: '#F59E0B',
      background: '#0f0f1e',
      text: '#e5e7eb'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'system-ui, sans-serif',
      mono: 'Menlo, monospace'
    }
  }
];

function ensureFile() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(DEFAULTS, null, 2));
}

function list() {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return DEFAULTS; }
}

function save(all) {
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
}

function upsert(kit) {
  const all = list();
  const i = all.findIndex(k => k.id === kit.id);
  if (i === -1) all.push(kit); else all[i] = kit;
  save(all);
  return kit;
}

function remove(id) {
  const all = list().filter(k => k.id !== id);
  save(all);
}

module.exports = { list, upsert, remove };
