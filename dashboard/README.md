# Video Agent Dashboard

A local GUI for your Remotion compositions. Browse, tweak, render — no terminal required.

## Run it

From the `video-agent/` folder:

```
npm run dashboard
```

Then open http://localhost:4100 in your browser.

## What it does

- **Library** — every composition registered in `src/Root.tsx` appears as a row. Click one, get a parameter form auto-generated from its `defaultProps`. Hit **Render** and watch progress live, with the finished video inline.
- **Brand Kits** — saved palettes + fonts you can apply to any template. Three defaults shipped (AI Injection, Two Flags, Hidden Mind).
- **Daily Render** — paste a batch of prompts, pick a template, queue the lot. Each becomes a separate render in `out/`.
- **Render History** — everything you've generated, with status + quick open.

## How compositions get parsed

`dashboard/lib/compositions.js` reads `src/Root.tsx` and pulls every `<Composition ... />` entry. It grabs:

- `id`
- `durationInFrames`, `fps`, `width`, `height`
- `defaultProps` object (best-effort JSON parsing — if a prop can't be read, the component's own defaults are used at render time)

## Adding new brand kits

Click **+ New Brand Kit** on the Brand Kits tab. Kits save to `dashboard/data/brandkits.json`.

## Ports

Default is `4100`. Override with `DASHBOARD_PORT=4101 npm run dashboard`.

## Planned for v0.2

- Live preview (embed Remotion Studio in an iframe pinned to the selected composition)
- Airtable prompt library integration on the Daily Render tab (pull your 6000 Nano Banana prompts directly)
- Electron packaging for Skool distribution
- Render queue concurrency control
- Variant save/load per composition
