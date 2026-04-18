# Video Agent

A local Remotion workstation with a click-and-tweak dashboard, AI code generation, a timeline editor, and multi-aspect rendering. Built in a weekend. Runs on localhost. No subscription.

https://github.com/ainjection/video-agent

![Video Agent Dashboard](dashboard/out/thumbnail-0.png)

## What it is

Remotion is the React framework for making videos programmatically — normally that means writing TypeScript by hand. Video Agent turns it into a visual tool:

- **40+ compositions** out of the box — intros, titles, lower thirds, CTAs, subscribe packs, explainers
- **Schema-aware parameter panel** — every template exposes a typed form (text, colour pickers, sliders, toggles) auto-generated from its schema
- **Live preview** — tweak values, Remotion Studio hot-reloads in the browser
- **Variants** — save named presets per template so you can switch configurations with one click
- **Brand kits** — apply your colour palette across every composition in the library
- **Timeline editor** — drag compositions onto a strip, trim, add crossfades, drop in an MP3, render as one MP4
- **Multi-aspect export** — render 9:16, 1:1, 4:5 in parallel from the same source
- **Import Code** — paste any Remotion snippet, preview it, wire it into the library automatically
- **AI Studio** — describe what you want, Claude Sonnet 4.5 or Gemini 3.1 Pro writes the full Remotion component (using Remotion's official system prompt), renders a preview inside the chat bubble, and saves it on your approval
- **Render history + daily batch renders** — everything tracked, everything re-runnable

## Requirements

- Node 18+
- FFmpeg on PATH (for multi-aspect conversion and audio mux)
- API keys (optional, for AI features):
  - `ANTHROPIC_API_KEY` — AI Studio (Claude)
  - `GEMINI_API_KEY` — AI Studio (Gemini) and thumbnail generation
  - `ELEVEN_API_KEY` — voiceover generation

Put them in a `.env` at the project root.

## Install

```bash
npm install
```

## Run

Two processes, two terminals:

```bash
# Terminal 1 — Remotion Studio (live preview on :3000)
npm run dev

# Terminal 2 — Dashboard (click-and-tweak UI on :4100)
npm run dashboard
```

Open <http://localhost:4100> for the dashboard. The dashboard writes props to `src/Root.tsx`, so Remotion Studio at <http://localhost:3000> hot-reloads whenever you tweak a parameter.

## Layout

```
src/                     Remotion compositions (TSX)
src/Root.tsx             Composition registry
src/imports/             AI- and user-imported compositions
dashboard/
  server.js              Node HTTP server
  lib/                   Feature modules (ai-studio, timeline, render, …)
  public/                Dashboard frontend (vanilla HTML/CSS/JS)
  data/                  Variants, brand kits, schemas, render history
  out/                   Rendered MP4s and thumbnails
public/                  Remotion-static assets (audio, images)
```

## Render from the CLI

```bash
npx remotion render CompositionId out/video.mp4
```

Or just hit Render in the dashboard.

## How the AI Studio works

1. You type what you want.
2. The model reads Remotion's official API reference from `dashboard/data/remotion-system-prompt.md` so it doesn't hallucinate APIs.
3. It can ask follow-up questions — mood, brand, duration — before writing code.
4. It produces a full TSX component using `interpolate`, `spring`, `Sequence`, `AbsoluteFill`, `Audio`, `staticFile`, etc.
5. A **Render Preview** button appears in the chat bubble. Click it — the file gets written, the composition bundles, the MP4 renders, the video plays inline.
6. Approve → saved to the library. Discard → cleaned up with one click.

## Licence

MIT. Do whatever.

## Credits

Built on [Remotion](https://www.remotion.dev/). Dashboard is vanilla Node + vanilla JS — no frameworks, no build step.
