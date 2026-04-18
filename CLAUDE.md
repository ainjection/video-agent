# Video Agent - Claude Code Skills

## Project Overview
This is a Remotion-based video production agent. It contains templates for YouTube intros, subscribe overlays, promo videos, and demo videos. All compositions are in the `src/` directory.

## Commands
```bash
npm run dev          # Open Remotion Studio (browser preview)
npm run build        # Bundle for production
npx remotion render <CompositionId> out/<filename>.mp4   # Render video
npx remotion render <CompositionId> out/<filename>.webm --codec=vp8  # Render with transparency
```

## Available Templates

### Subscribe Overlays (transparent background)
- **SubClassic** - Classic YouTube lower third with cursor click animation
- **SubBigAvatar** - Large avatar with red ring border
- **SubRedBar** - Full-width red bar from top
- **SubMultiPlatform** - YouTube + Instagram + Twitter stacked
- **SubSocialIcons** - Platform icons bounce with expanding cards

### YouTube Intros
- **FilmStripIntro** - Hollywood film strip with live video clips scrolling, cinema background, spotlights, golden particles
- **CleanModern** - Minimal white, teal accent, floating shapes
- **PodcastGritty** - Dark textured, host photo, red accent, smoke
- **PlayfulCute** - Pastel checkerboard, floating emojis, Y2K style
- **DarkCinematic** - Black, lens flare, letter-by-letter reveal, gold lines
- **NeonGaming** - Purple, neon cyan glow, Tron grid, gamepad icon

### Promo Videos
- **PromptVaultV4** - Prompt Vault product promo with AI images
- **AirtableDemo** - Full demo video with screen recording + overlays

### Showcases
- **FiverrShowcase** - 20 subscribe styles in 2x2 grid with transitions
- **ShowcaseReel** - 7 subscribe styles shown over real backgrounds
- **IntroShowcase** - All 5 intro templates in sequence

## How to Customise a Template for a Client

### Subscribe Overlay
1. Get from client: channel name, subscriber count, avatar image
2. Place avatar in `public/` folder
3. Open the relevant component in `src/SubscribePack.tsx`
4. Change CHANNEL_NAME, SUB_COUNT, AVATAR constants
5. Render: `npx remotion render SubClassic out/client-subscribe.webm --codec=vp8`

### Film Strip Intro
1. Get from client: channel name, tagline, avatar, 4-6 short video clips
2. Place all files in `public/` folder
3. Open `src/FilmStrip.tsx`
4. Update CHANNEL, CLIPS array, AVATAR, and tagline text
5. Render: `npx remotion render FilmStripIntro out/client-filmstrip.mp4`

### YouTube Intro
1. Get from client: channel name, tagline, brand colours, avatar
2. Open the relevant template in `src/YouTubeIntros.tsx`
3. Update text, colours, and avatar
4. Render: `npx remotion render CleanModern out/client-intro.mp4`

## Skill: Create Subscribe Overlay
When asked to create a subscribe overlay:
1. Ask for: channel name, subscriber count, YouTube channel URL (to scrape avatar)
2. Download avatar using curl
3. Edit the appropriate template component
4. Render with transparent background (webm + vp8)
5. Provide the output file path

## Skill: Create YouTube Intro
When asked to create a YouTube intro:
1. Ask for: channel name, tagline, style preference, any video clips
2. Select the best matching template
3. Customise text, colours, avatar
4. If Film Strip: need 4-6 short video clips in public folder
5. Render as mp4
6. Provide the output file path

## Skill: Create Demo/Promo Video
When asked to create a demo or promo video:
1. Need: screen recording or product images, key features, CTA text
2. Place assets in public folder
3. Create new composition or modify existing template
4. Add overlays: step labels, callouts, transitions, VO
5. Generate voiceover with edge-tts if needed
6. Render as mp4

## Asset Locations
- Avatars/images: `public/images/`
- Sound effects: `public/click.mp3`, `public/bell.mp3`, `public/pop.mp3`
- Video clips: `public/*.mp4`
- Voiceovers: `public/vo*.mp3`

## Tech Notes
- All compositions are 1920x1080 at 30fps unless noted
- Use spring() for entrance animations (high stiffness = snappy)
- Use interpolate() for smooth transitions
- OffthreadVideo for embedding video clips
- Sequence for timing sections
- Audio for sound effects (wrap in Sequence for timing)
- For transparent overlays: render as webm with vp8 codec
- Avoid duplicate values in interpolate inputRange (use +1/-1 offsets)
