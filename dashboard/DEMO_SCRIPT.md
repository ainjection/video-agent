# Video Agent Dashboard — Demo Script

**Target length:** 10-12 minutes
**Style:** screen-record + narration, Rob's usual direct tone
**Hook at 0-5s, feature highlights, then full walkthrough, CTA at end**

Timing per section is approximate — adjust to your pace. On-screen actions are in **bold**, narration in plain text, (camera notes) in parens.

---

## 0:00 — HOOK (15s)

(Camera: tight on the Library grid tab with hover autoplay triggering on a cool composition)

> "I built this tool in a weekend that turns any video idea into a rendered MP4 in under 2 minutes — without touching code. You type what you want, AI writes the Remotion, it renders, and it saves to your library. Let me show you."

**Cut hard to the dashboard home.**

---

## 0:15 — What it is (20s)

(Camera: full sidebar visible)

> "This is Video Agent — a local GUI wrapper around Remotion. Remotion lets you make videos with React code. This dashboard removes the code part. You get a visual library, a drag-and-drop timeline, an AI studio that writes code for you, brand kits, the lot. Runs on your laptop, no monthly fees, no cloud account."

**Hover across the sidebar: Library, Brand Kits, Timeline, AI Compose, AI Generate, AI Studio, Import Code, Render History.**

---

## 0:35 — Feature 1: Library + hover autoplay (45s)

**Click Library. Scroll through the grid. Hover over a few cards so they autoplay.**

> "Every composition in my project shows up here as a card. Over 50 templates right now — intros, titles, lower thirds, CTAs, film strips. Hover over any card — I rendered them before so the full video plays right in the grid. Makes finding what you need actually fast."

**Filter by category chip — click "Intro".**

> "Auto-categorised. Click any filter, see only that type. Click one to dig in."

**Click a composition — detail page opens.**

---

## 1:20 — Detail page: render + params (60s)

(Camera: split — preview on left, form on right)

> "Detail page. Preview video on the left, parameters on the right. If the template has a schema, I get proper typed fields — text inputs, sliders, colour pickers, toggles. Not just raw JSON."

**Change one text field and one colour.**

> "I can tweak anything and hit Render."

**Click ▶ Render. Show progress bar streaming.**

> "Rendering happens locally — no cloud queue, no wait list. Progress streams live."

**When done, the video plays inline.**

> "Done. Video plays, download button's there, and the render history tracks everything I've made."

---

## 2:20 — Feature 2: Brand Kits + Variants (40s)

**Back to a detail page. Show the Brand Kit chips.**

> "Three brand kits pre-loaded. Click one — every colour field in the form gets swapped to that palette automatically. Zero-click rebranding."

**Click a brand kit — show the colour fields change.**

**Click 💾 Save Variant. Name it "My Red Version".**

> "I can save any set of parameters as a named variant. That's my 'red brand 10-second version'. Next time I open this composition, it's one click to reapply."

**Show the variant appearing as a chip.**

---

## 3:00 — Feature 3: Multi-aspect export (35s)

**On detail page, tick 9:16 and 1:1 checkboxes above Render.**

> "Before I render, I can tick any extra aspect ratios. 9:16 for TikTok, 1:1 for Instagram square, 4:5 for portrait. One render, all formats."

**Click Render. Wait for it to finish.**

> "When it's done, I get all three videos side-by-side — landscape, portrait, square. Each with its own download. One click to post across every platform."

---

## 3:35 — Feature 4: Timeline Editor (80s)

**Click Timeline tab.**

> "This is the Timeline. It's like CapCut or Premiere, but for Remotion compositions."

**Drag a composition from the left sidebar onto the timeline strip.**

> "Drag templates from the library onto the bottom strip. They line up in order."

**Drag 2 more. Show the timeline now has 3 clips.**

**Drag the right edge of a middle clip inward to trim it.**

> "Green handles on hover — drag to trim clips without editing source code. Watch the block shrink in real time."

**Set Crossfade to 15 in the header.**

> "Type a crossfade frame count to add fades between every clip."

**Click 🎵 Music → upload an MP3.**

> "Add background music — drop any MP3."

**Click ▶ Render Project.**

> "Hit Render Project. All clips stitch into a single MP4 with your music bed."

**Show the rendered result playing.**

---

## 4:55 — Feature 5: AI Studio (the magic) (2m)

(Camera: calm, give this one breathing room — it's the headliner)

**Click AI Studio tab.**

> "This is the feature that blows everyone's mind. AI Studio."

**Type:** *"Create a demo video of my app. Dark theme. Bold spinning text that says 'Launch Day'. 8 seconds. Use Tailwind."*

**Click Send.**

> "I'm using Gemini 3.1 Pro. I could also swap to Claude Sonnet. Both know Remotion — they read Remotion's full docs as their system prompt."

**(wait for AI reply)**

> "Look — it explains what it's making, then drops a complete TSX file. Uses AbsoluteFill, useCurrentFrame, spring, interpolate — all Remotion's real APIs. Tailwind classes for styling. No hallucinated libraries."

**Scroll down to the ▶ Render preview button.**

> "Hit Render Preview. No terminal, no install, no edit. The code gets written to disk, Remotion bundles it, renders an MP4 — all automatic."

**Click it. Wait for render.**

**Video plays in the chat bubble.**

> "Video renders right inside the chat. If I like it, I name it and save to my library — now it's a proper template I can re-render any time. If I don't like it, I tell the AI 'swap the colours to purple', it regenerates, new render."

**Type:** *"make the text pulse instead of spin, use cyan"*

**(show iteration)**

> "Iterative. No dev loop, no restart."

---

## 6:55 — Feature 6: Import Code (40s)

**Click Import Code tab.**

> "If you find Remotion snippets online — GitHub, Twitter threads, MotionKit, YouTube tutorials — paste them here."

**Paste any simple Remotion snippet.**

**Click Render Preview.**

> "It renders a preview so you can check it works before committing. If it looks good, name it and save. If not, discard — file and Root.tsx entry both cleaned up automatically."

**Show the schema-based parameter form appearing on a MotionKit-style preset.**

> "For presets with a schema, you get the full MotionKit-style parameter panel — grouped by section, proper sliders and colour pickers with labels. Not just raw props."

---

## 7:35 — Feature 7: Daily Render + AI Compose (30s)

**Click AI Compose.**

> "AI Compose is different from AI Studio — instead of writing new code, it picks templates from your library and arranges them into a timeline. Useful for 'give me a 30-second intro using what I already have'."

**Click Daily Render.**

> "Daily Render lets you paste a batch of prompts, queue them all, go make coffee. Each becomes a separate render."

---

## 8:05 — Cleanup + housekeeping (25s)

**Click Cleanup tab.**

> "One-click cleanup for auto-generated previews you didn't keep. The dashboard creates temporary files when you preview-render AI output — this wipes them in one shot. Never touches your saved work."

---

## 8:30 — Closing + CTA (45s)

(Camera: back to Library grid, show the breadth of compositions)

> "So that's Video Agent. Visual library, AI Studio that writes working Remotion, drag-and-drop timeline with trim + crossfades + music, brand kits, variants, multi-aspect export. Everything runs locally on your laptop. No subscription, no cloud, your data stays yours."

> "I built this for myself first. If you want it for your own content, it's available to my Skool community — link in the description. Full source, install instructions, free updates. If you're building KDP videos, YouTube content, product demos, or anything else with React + video — this saves you hours every week."

**End card / channel branding.**

---

## Optional extras (cut in as B-roll)

- Quick montage of 3-4 different AI Studio renders finishing in the chat (shows speed + range)
- Side-by-side: Rob writing a brief → final MP4 30 seconds later
- Live demo: open on a non-dev laptop, prove it installs in under 2 min

---

## Suggested thumbnail concept

Split screen:
- **Left:** terminal with raw Remotion code
- **Right:** your dashboard (pretty UI, video playing, chat bubble with AI response)
- **Text overlay:** "I Built This In A Weekend"
- Arrow from left to right
- Your face in bottom-right corner

---

## Title options

1. "I Built A Local Video Agent with AI That Writes Its Own Remotion Code"
2. "This AI Actually Writes Working Video Code (And Renders It)"
3. "No More Coding Remotion — My AI Does It For You"
4. "Replacing MotionKit With My Own AI-Powered Video Studio"
5. "How I Turned Remotion Into a ChatGPT for Videos"

Pick one, test the rest as end cards / playlist titles.
