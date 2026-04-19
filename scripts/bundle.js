#!/usr/bin/env node
// Bundle Video Agent + Pro extras into a single distributable zip.
// Run: `npm run bundle`
//
// Output: dist-bundle/video-agent-pro-v<VERSION>.zip
//
// Strips: .git, node_modules, .env, renders, runtime data, intermediates.
// Adds:  Pro extras from ../video-agent-pro/ (if present) + INSTALL.md.
//
// No dependencies — uses built-in fs + child_process (PowerShell on Win,
// zip on macOS/Linux).

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = process.env.BUNDLE_VERSION || PKG.version || '0.1.0';
const BUNDLE_NAME = `video-agent-pro-v${VERSION}`;
const OUT_DIR = path.join(ROOT, 'dist-bundle');
const STAGE_DIR = path.join(OUT_DIR, BUNDLE_NAME);
const ZIP_PATH = path.join(OUT_DIR, `${BUNDLE_NAME}.zip`);
const PRO_REPO = path.resolve(ROOT, '..', 'video-agent-pro');

// ── Patterns to EXCLUDE from the bundle ────────────────────────────────
const EXCLUDE = [
  '.git',
  '.gitignore',
  'node_modules',
  'out',
  '.env',
  '.env.local',
  'dist-bundle',
  '.remotion',
  'remotion-bundle',
  'dashboard/data/render-history.json',
  'dashboard/data/props',
  'dashboard/data/timeline-projects.json',
  'dashboard/data/subtitles',
  'dashboard/data/audio',
  'dashboard/data/images',
  'dashboard/data/thumbnails',
  'public/audio-agent',
  'public/images',
  'public/script-vo',
  'public/daily',
  'meshy-source-images',
];

// Additional glob-ish patterns matched per-path
const EXCLUDE_PATTERNS = [
  /(^|\/)dist-bundle(\/|$)/,
  /(^|\/)_[^/]*frames(\/|$)/,
  /(^|\/)_preview[^/]*\.(png|jpg)$/,
  /\.log$/,
  /\.DS_Store$/,
];

function shouldExclude(relPath) {
  const normalised = relPath.replace(/\\/g, '/');
  for (const p of EXCLUDE) {
    if (normalised === p || normalised.startsWith(p + '/')) return true;
  }
  for (const re of EXCLUDE_PATTERNS) {
    if (re.test(normalised)) return true;
  }
  return false;
}

function rmrf(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyTree(src, dst, relBase = '') {
  const stat = fs.statSync(src);
  const relPath = relBase;
  if (relPath && shouldExclude(relPath)) return;
  if (stat.isDirectory()) {
    mkdirp(dst);
    for (const entry of fs.readdirSync(src)) {
      const childRel = relPath ? `${relPath}/${entry}` : entry;
      if (shouldExclude(childRel)) continue;
      copyTree(path.join(src, entry), path.join(dst, entry), childRel);
    }
  } else if (stat.isFile()) {
    fs.copyFileSync(src, dst);
  }
}

function writeIfMissing(target, content) {
  if (fs.existsSync(target)) return;
  mkdirp(path.dirname(target));
  fs.writeFileSync(target, content);
}

function envExample() {
  return `# Copy to .env and fill in. .env is gitignored — never commit.
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
ELEVEN_API_KEY=
BLOTATO_API_KEY=
MESHY_API_KEY=
`;
}

function installMd() {
  return `# Install — Video Agent (Pro bundle)

You have Claude Code or Cursor installed, right? Paste the prompt below into it and it'll handle the rest. Otherwise follow the manual steps lower down.

## The one-prompt install (Claude Code / Cursor)

> I just unzipped \`video-agent-pro-v${VERSION}\` into this folder. Read \`SETUP.md\`. Run \`npm install\`. Check if I have a \`.env\` already — if not, copy \`.env.example\` to \`.env\` and ask me which API keys I have so you can fill them in. Then open two terminals and run \`npm run dev\` in one and \`npm run dashboard\` in the other. Tell me the URL when the dashboard is ready. Don't ask clarifying questions unless something fails.

Paste that, let it run. 30 seconds.

## Manual install

1. Install Node 18+ (\`node --version\` should print v18 or higher).
2. Install FFmpeg and make sure \`ffmpeg -version\` works in your terminal.
3. In this folder: \`npm install\`.
4. Copy \`.env.example\` → \`.env\` and paste your API keys.
5. Terminal 1: \`npm run dev\` (Remotion Studio on :3000).
6. Terminal 2: \`npm run dashboard\` (Dashboard on :4100).
7. Open http://localhost:4100. Go to 🦸 Hero Library to see the 6 Blender-rendered hero clips included in the Pro bundle.

## API keys — which do I actually need?

- **Anthropic or Gemini** — at least one, for AI Studio / Script to Video / Visual Brief.
- **ElevenLabs** — for voiceovers (Script to Video, Subtitle burn-in).
- **Blotato** — only if you want to publish direct to social from the dashboard.
- **Meshy** — only if you want to generate new hero assets.

## Pro-bundle contents

- \`public/hero-library/\` — 6 Blender-rendered MP4s (Glass Cards Trio, Holographic Process, AI Injection, Runic Obelisk, Liquid Neon Ribbon, Neptune).
- \`hero-scripts/\` — Blender Python recipes for each hero; tweak materials/lighting and re-render.
- \`moods-pro/moods-pro.json\` — 4 additional mood presets (Product Showcase Pro, Documentary Drama, Late-Night Talk, Broadcast Sports).
- \`SETUP.md\`, \`LICENCE.md\`, \`CHANGELOG.md\` — documentation + terms.

## Support

Skool community: link + invite code in the welcome email that accompanied your download.
`;
}

function zip(srcDir, outZip) {
  if (process.platform === 'win32') {
    // Use PowerShell's Compress-Archive — built in on Win10+.
    const psPath = srcDir.replace(/'/g, "''");
    const psOut = outZip.replace(/'/g, "''");
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -LiteralPath '${psPath}' -DestinationPath '${psOut}' -Force"`,
      { stdio: 'inherit' }
    );
  } else {
    // macOS / Linux — use system zip.
    const parent = path.dirname(srcDir);
    const folder = path.basename(srcDir);
    const result = spawnSync('zip', ['-r', outZip, folder], { cwd: parent, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('zip failed');
  }
}

function humanSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

// ── Main ────────────────────────────────────────────────────────────────

console.log(`Bundling ${BUNDLE_NAME}...`);
rmrf(STAGE_DIR);
rmrf(ZIP_PATH);
mkdirp(STAGE_DIR);

console.log('  copying core project...');
copyTree(ROOT, STAGE_DIR, '');

// Add Pro extras from the sibling repo if present (hero-scripts, moods-pro,
// SETUP.md, LICENCE.md, CHANGELOG.md).
if (fs.existsSync(PRO_REPO)) {
  console.log('  merging Pro extras from', path.basename(PRO_REPO));
  for (const entry of ['hero-scripts', 'moods-pro', 'SETUP.md', 'LICENCE.md', 'CHANGELOG.md']) {
    const src = path.join(PRO_REPO, entry);
    if (!fs.existsSync(src)) continue;
    const dst = path.join(STAGE_DIR, entry);
    rmrf(dst);
    copyTree(src, dst, '');
  }
} else {
  console.log('  [note] no sibling video-agent-pro/ found — shipping core only');
}

// Always write INSTALL.md + .env.example fresh so they reflect the current
// bundle version even if the repo already has one.
fs.writeFileSync(path.join(STAGE_DIR, 'INSTALL.md'), installMd());
writeIfMissing(path.join(STAGE_DIR, '.env.example'), envExample());

// Zip
console.log('  zipping...');
zip(STAGE_DIR, ZIP_PATH);

const size = fs.statSync(ZIP_PATH).size;
console.log(`\n✓ ${path.relative(ROOT, ZIP_PATH)}  (${humanSize(size)})`);
console.log(`  staged in ${path.relative(ROOT, STAGE_DIR)} (kept for inspection)`);
