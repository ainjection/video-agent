#!/usr/bin/env node

/**
 * Daily Prompt Video Pipeline
 *
 * Picks 10 random prompts from the library, generates ElevenLabs voiceover,
 * builds a Remotion config, and renders a finished YouTube-ready video.
 *
 * Usage:
 *   node daily-render.js              # Generate and render
 *   node daily-render.js --pick-only  # Just pick prompts, don't render
 *   node daily-render.js --render-only # Just render (prompts already picked)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════
const CONFIG = {
  promptsBase: 'D:/airtable folder images with data',
  projectDir: __dirname,
  publicDir: path.join(__dirname, 'public'),
  outputDir: path.join(__dirname, 'out'),
  dailyDir: path.join(__dirname, 'public', 'daily'),

  numPrompts: 10,
  usedPromptsFile: path.join(__dirname, 'used-prompts.json'),
  dailyConfigFile: path.join(__dirname, 'public', 'daily', 'config.json'),

  // ElevenLabs
  elevenLabsKey: 'eeda2c834fede2667707755b8d19d8f48952a2862f843e1ae1c0e9964cd6e504',
  voiceId: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - Energetic, Social Media Creator
  voiceModel: 'eleven_multilingual_v2',

  // Intro/outro text
  introText: (count) => `${count} AI prompts that will completely blow your mind. Each one was typed into an AI tool, and what came out is absolutely insane. Watch this.`,
  outroText: 'If you want access to over six thousand tested prompts just like these, check out Prompt Vault. Link in the description. Like and subscribe for more.',

  // Categories to pull from (with weights - higher = more likely)
  categories: [
    { pattern: 'AI Influencers', weight: 3 },
    { pattern: 'Cinematic', weight: 2 },
    { pattern: 'AI Images', weight: 2 },
    { pattern: 'Editorial', weight: 1 },
    { pattern: 'Cyberpunk', weight: 1 },
    { pattern: 'Fantasy', weight: 1 },
    { pattern: 'Products', weight: 1 },
    { pattern: 'Cars', weight: 1 },
    { pattern: 'Video Game', weight: 1 },
    { pattern: 'Nano Banana', weight: 1 },
  ],
};

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function log(msg) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] ${msg}`);
}

function loadUsedPrompts() {
  try {
    if (fs.existsSync(CONFIG.usedPromptsFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.usedPromptsFile, 'utf8'));
    }
  } catch (e) {}
  return { used: [], lastRun: null };
}

function saveUsedPrompts(data) {
  fs.writeFileSync(CONFIG.usedPromptsFile, JSON.stringify(data, null, 2), 'utf8');
}

function getGlobFiles(dir, ext) {
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith(ext));
  } catch (e) {
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// STEP 1: DISCOVER & PICK PROMPTS
// ═══════════════════════════════════════════════════════
function discoverAllPrompts() {
  log('Discovering all available prompts...');
  const allPrompts = [];
  const base = CONFIG.promptsBase;
  const categories = fs.readdirSync(base);

  for (const cat of categories) {
    const recordsDir = path.join(base, cat, 'records');
    if (!fs.existsSync(recordsDir) || !fs.statSync(recordsDir).isDirectory()) continue;

    // Check if this category matches any of our weighted categories
    let weight = 0;
    for (const c of CONFIG.categories) {
      if (cat.includes(c.pattern)) {
        weight = c.weight;
        break;
      }
    }
    if (weight === 0) continue; // Skip uncategorized

    const folders = fs.readdirSync(recordsDir).filter(f => {
      return fs.statSync(path.join(recordsDir, f)).isDirectory();
    });

    for (const folder of folders) {
      const promptFile = path.join(recordsDir, folder, 'prompt.txt');
      const folderPath = path.join(recordsDir, folder);

      if (!fs.existsSync(promptFile)) continue;

      const images = getGlobFiles(folderPath, '.png')
        .concat(getGlobFiles(folderPath, '.jpg'))
        .filter(f => !f.startsWith('.'));

      if (images.length === 0) continue;

      // Extract prompt text
      const content = fs.readFileSync(promptFile, 'utf8');
      const promptMatch = content.match(/^Prompt:\s*(.+)/m);
      const prompt = promptMatch ? promptMatch[1].trim() : '';

      if (!prompt || prompt.length < 20) continue;

      // Extract category label
      let categoryLabel = 'AI Generated';
      if (cat.includes('Influencer')) categoryLabel = 'AI Influencer';
      else if (cat.includes('Cinematic')) categoryLabel = 'Cinematic';
      else if (cat.includes('Cyberpunk')) categoryLabel = 'Cyberpunk';
      else if (cat.includes('Fantasy')) categoryLabel = 'Fantasy';
      else if (cat.includes('Editorial')) categoryLabel = 'Editorial';
      else if (cat.includes('Products')) categoryLabel = 'Products';
      else if (cat.includes('Cars')) categoryLabel = 'Automotive';
      else if (cat.includes('Video Game')) categoryLabel = 'Gaming';
      else if (cat.includes('Nano Banana')) categoryLabel = 'Nano Banana';

      allPrompts.push({
        id: `${cat}/${folder}`,
        prompt,
        imagePath: path.join(folderPath, images[0]),
        category: categoryLabel,
        weight,
      });
    }
  }

  log(`Found ${allPrompts.length} valid prompts across all categories`);
  return allPrompts;
}

function pickRandomPrompts(allPrompts, count) {
  const usedData = loadUsedPrompts();
  const usedSet = new Set(usedData.used);

  // Filter out already used
  let available = allPrompts.filter(p => !usedSet.has(p.id));
  log(`${available.length} unused prompts available (${usedData.used.length} already used)`);

  if (available.length < count) {
    log('Running low on unused prompts, resetting used list...');
    usedData.used = [];
    available = allPrompts;
  }

  // Weighted random selection
  const weighted = [];
  for (const p of available) {
    for (let i = 0; i < p.weight; i++) {
      weighted.push(p);
    }
  }

  // Shuffle and pick
  const shuffled = weighted.sort(() => Math.random() - 0.5);
  const picked = [];
  const pickedIds = new Set();

  for (const p of shuffled) {
    if (pickedIds.has(p.id)) continue;
    picked.push(p);
    pickedIds.add(p.id);
    if (picked.length >= count) break;
  }

  // Record as used
  usedData.used.push(...picked.map(p => p.id));
  usedData.lastRun = new Date().toISOString();
  saveUsedPrompts(usedData);

  log(`Picked ${picked.length} prompts:`);
  picked.forEach((p, i) => log(`  ${i + 1}. [${p.category}] ${p.prompt.substring(0, 60)}...`));

  return picked;
}

// ═══════════════════════════════════════════════════════
// STEP 2: COPY IMAGES
// ═══════════════════════════════════════════════════════
function copyImages(prompts) {
  log('Copying images to daily folder...');
  const dailyDir = CONFIG.dailyDir;
  if (!fs.existsSync(dailyDir)) fs.mkdirSync(dailyDir, { recursive: true });

  // Clean old daily images
  for (const f of fs.readdirSync(dailyDir)) {
    if (f.startsWith('img_') || f.startsWith('vo_') || f === 'config.json') {
      fs.unlinkSync(path.join(dailyDir, f));
    }
  }

  for (let i = 0; i < prompts.length; i++) {
    const ext = path.extname(prompts[i].imagePath);
    const dest = path.join(dailyDir, `img_${i + 1}${ext}`);
    fs.copyFileSync(prompts[i].imagePath, dest);
    prompts[i].imageFile = `daily/img_${i + 1}${ext}`;
    log(`  Copied image ${i + 1}: ${path.basename(prompts[i].imagePath).substring(0, 40)}...`);
  }
}

// ═══════════════════════════════════════════════════════
// STEP 3: GENERATE VOICEOVERS (ElevenLabs)
// ═══════════════════════════════════════════════════════
function generateVO(text, outputPath) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text,
      model_id: CONFIG.voiceModel,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    });

    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${CONFIG.voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': CONFIG.elevenLabsKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => reject(new Error(`ElevenLabs ${res.statusCode}: ${body.substring(0, 200)}`)));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(outputPath, buffer);
        resolve(buffer.length);
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function generateAllVoiceovers(prompts) {
  log('Generating ElevenLabs voiceovers...');
  const dailyDir = CONFIG.dailyDir;

  // Intro VO
  const introPath = path.join(dailyDir, 'vo_intro.mp3');
  const introSize = await generateVO(CONFIG.introText(prompts.length), introPath);
  log(`  Intro VO: ${(introSize / 1024).toFixed(1)}KB`);

  // Prompt VOs
  for (let i = 0; i < prompts.length; i++) {
    const voPath = path.join(dailyDir, `vo_${i + 1}.mp3`);
    const size = await generateVO(prompts[i].prompt, voPath);
    prompts[i].voFile = `daily/vo_${i + 1}.mp3`;
    log(`  VO ${i + 1}: ${(size / 1024).toFixed(1)}KB - ${prompts[i].prompt.substring(0, 40)}...`);

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Outro VO
  const outroPath = path.join(dailyDir, 'vo_outro.mp3');
  const outroSize = await generateVO(CONFIG.outroText, outroPath);
  log(`  Outro VO: ${(outroSize / 1024).toFixed(1)}KB`);
}

// ═══════════════════════════════════════════════════════
// STEP 4: GET VO DURATIONS & BUILD CONFIG
// ═══════════════════════════════════════════════════════
function getAudioDuration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v quiet -print_format json -show_format "${filePath}"`,
      { encoding: 'utf8' }
    );
    const data = JSON.parse(result);
    return parseFloat(data.format.duration) || 5;
  } catch (e) {
    return 5; // fallback
  }
}

function writeDailyData(prompts, sectionFrames, sectionStarts, totalFrames) {
  // Write a TypeScript file that the Remotion composition imports
  const dataFile = path.join(CONFIG.projectDir, 'src', 'dailyData.ts');

  const lines = [
    '// AUTO-GENERATED by daily-render.js - DO NOT EDIT',
    `// Generated: ${new Date().toISOString()}`,
    '',
    'import { staticFile } from "remotion";',
    '',
    `export const DAILY_DATE = "${new Date().toISOString().split('T')[0]}";`,
    `export const DAILY_NUM_PROMPTS = ${prompts.length};`,
    `export const DAILY_TOTAL_FRAMES = ${totalFrames};`,
    '',
    'export const DAILY_PROMPTS = [',
  ];

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    const escapedPrompt = p.prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
    lines.push(`  "${escapedPrompt}",`);
  }
  lines.push('];');
  lines.push('');

  lines.push('export const DAILY_IMAGES = [');
  for (let i = 0; i < prompts.length; i++) {
    lines.push(`  staticFile("${prompts[i].imageFile}"),`);
  }
  lines.push('];');
  lines.push('');

  lines.push('export const DAILY_VOICEOVERS = [');
  for (let i = 0; i < prompts.length; i++) {
    lines.push(`  staticFile("${prompts[i].voFile}"),`);
  }
  lines.push('];');
  lines.push('');

  lines.push('export const DAILY_CATEGORIES = [');
  for (let i = 0; i < prompts.length; i++) {
    lines.push(`  "${prompts[i].category}",`);
  }
  lines.push('];');
  lines.push('');

  lines.push(`export const DAILY_SECTION_FRAMES = [${sectionFrames.join(', ')}];`);
  lines.push(`export const DAILY_SECTION_STARTS = [${sectionStarts.join(', ')}];`);
  lines.push('');
  lines.push('export const DAILY_INTRO_VO = staticFile("daily/vo_intro.mp3");');
  lines.push('export const DAILY_OUTRO_VO = staticFile("daily/vo_outro.mp3");');
  lines.push('');

  fs.writeFileSync(dataFile, lines.join('\n'), 'utf8');
  log(`Written dailyData.ts with ${prompts.length} prompts`);
}

function buildConfig(prompts) {
  log('Building daily config...');
  const dailyDir = CONFIG.dailyDir;

  // Get VO durations
  const introDur = getAudioDuration(path.join(dailyDir, 'vo_intro.mp3'));
  const outroDur = getAudioDuration(path.join(dailyDir, 'vo_outro.mp3'));

  const sections = [];
  let currentStart = 0;

  // Intro
  const introFrames = Math.ceil((introDur + 2) * 30); // VO + 2s hold
  sections.push({ type: 'intro', start: 0, frames: introFrames });
  currentStart = introFrames;

  // Prompts
  for (let i = 0; i < prompts.length; i++) {
    const voDur = getAudioDuration(path.join(dailyDir, `vo_${i + 1}.mp3`));
    const sectionFrames = Math.ceil((voDur + 3) * 30); // VO + 3s hold on image
    sections.push({
      type: 'prompt',
      index: i,
      start: currentStart,
      frames: sectionFrames,
      voDuration: voDur,
      prompt: prompts[i].prompt,
      image: prompts[i].imageFile,
      voiceover: prompts[i].voFile,
      category: prompts[i].category,
    });
    currentStart += sectionFrames;
    log(`  Section ${i + 1}: ${sectionFrames} frames (${voDur.toFixed(1)}s VO + 3s hold)`);
  }

  // Outro
  const outroFrames = Math.ceil((outroDur + 3) * 30);
  sections.push({ type: 'outro', start: currentStart, frames: outroFrames });
  currentStart += outroFrames;

  const config = {
    date: new Date().toISOString().split('T')[0],
    totalFrames: currentStart,
    totalDuration: (currentStart / 30).toFixed(1),
    numPrompts: prompts.length,
    sections,
    introVo: 'daily/vo_intro.mp3',
    outroVo: 'daily/vo_outro.mp3',
    ambientMusic: 'prompts/ambient.mp3',
  };

  fs.writeFileSync(CONFIG.dailyConfigFile, JSON.stringify(config, null, 2), 'utf8');
  log(`Config saved: ${currentStart} total frames (${config.totalDuration}s)`);

  // Write TypeScript data file for Remotion to import
  const sectionFrames = [];
  const sectionStarts = [];
  for (const s of sections) {
    if (s.type === 'prompt') {
      sectionFrames.push(s.frames);
      sectionStarts.push(s.start);
    }
  }
  writeDailyData(prompts, sectionFrames, sectionStarts, currentStart);

  return config;
}

// ═══════════════════════════════════════════════════════
// STEP 5: RENDER
// ═══════════════════════════════════════════════════════
function renderVideo(config) {
  const date = config.date;
  const outputFile = path.join(CONFIG.outputDir, `prompt-vault-${date}.mp4`);

  log(`Rendering video: ${outputFile}`);
  log(`Total frames: ${config.totalFrames} (${config.totalDuration}s)`);

  try {
    execSync(
      `npx remotion render DailyPromptVideo "${outputFile}" --props="${CONFIG.dailyConfigFile}"`,
      { cwd: CONFIG.projectDir, stdio: 'inherit', timeout: 3600000 }
    );
    log(`RENDER COMPLETE: ${outputFile}`);

    // Check output
    if (fs.existsSync(outputFile)) {
      const size = fs.statSync(outputFile).size;
      log(`Output: ${outputFile} (${(size / 1024 / 1024).toFixed(1)}MB)`);
    }
  } catch (e) {
    log(`RENDER ERROR: ${e.message}`);
    log('Try running manually: npx remotion render DailyPromptVideo out/daily.mp4');
  }
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const pickOnly = args.includes('--pick-only');
  const renderOnly = args.includes('--render-only');

  log('═══════════════════════════════════════════');
  log('  DAILY PROMPT VIDEO PIPELINE');
  log('═══════════════════════════════════════════');

  if (!fs.existsSync(CONFIG.dailyDir)) {
    fs.mkdirSync(CONFIG.dailyDir, { recursive: true });
  }
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  if (!renderOnly) {
    // Step 1: Discover & pick
    const allPrompts = discoverAllPrompts();
    const picked = pickRandomPrompts(allPrompts, CONFIG.numPrompts);

    // Step 2: Copy images
    copyImages(picked);

    // Step 3: Generate VOs
    await generateAllVoiceovers(picked);

    // Step 4: Build config
    const config = buildConfig(picked);

    // Don't auto-render - Rob will review in Remotion Studio first
    log('Pipeline complete. Open Remotion Studio to preview:');
    log('  cd C:\\Users\\clawb\\Desktop\\video-agent && npm run dev');
    log('  Select "DailyPromptVideo" from the dropdown');
    log('  When approved, render with: npx remotion render DailyPromptVideo out/daily.mp4');

    if (pickOnly) {
      return;
    }

    // Only render if explicitly requested
    if (args.includes('--render')) {
      renderVideo(config);
    }
  } else {
    // Render only - use existing config
    if (!fs.existsSync(CONFIG.dailyConfigFile)) {
      log('ERROR: No config file found. Run without --render-only first.');
      return;
    }
    const config = JSON.parse(fs.readFileSync(CONFIG.dailyConfigFile, 'utf8'));
    renderVideo(config);
  }

  log('═══════════════════════════════════════════');
  log('  PIPELINE COMPLETE');
  log('═══════════════════════════════════════════');
}

main().catch(e => {
  log(`FATAL ERROR: ${e.message}`);
  console.error(e);
  process.exit(1);
});
