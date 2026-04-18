import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
  Audio,
  Img,
  Sequence,
} from "remotion";
import { z } from "zod";
import {
  DAILY_PROMPTS, DAILY_IMAGES, DAILY_VOICEOVERS, DAILY_CATEGORIES,
  DAILY_SECTION_FRAMES, DAILY_SECTION_STARTS, DAILY_NUM_PROMPTS,
  DAILY_INTRO_VO, DAILY_OUTRO_VO, DAILY_TOTAL_FRAMES,
} from "./dailyData";

// ── Schema ──
export const dailyVideoSchema = z.object({
  numPrompts: z.number().default(5),
  channelName: z.string().default("Prompt Vault"),
  subscriberText: z.string().default("AI Prompt Library"),
});

// ── Fallback Data (matches PromptShowcaseV2) ──
const FALLBACK_PROMPTS = [
  "a cyberpunk female singer in a futuristic recording studio, facing camera directly, long messy bright pink hair, wearing large black headphones, metallic futuristic jewelry and accessories, microphones in front of her, music equipment and speakers in the background, realistic style, natural lighting, ultra detailed, cinematic, photorealistic, 8k",
  "behind the scenes of an action movie scene, stills archive, harley quinn, dramatic lighting, film set atmosphere, cinematic composition",
  "photograph, ultra-realistic, beautiful woman hosting a podcast, looking into the camera speaking into a black microphone, modern podcast studio, interior shadows clash with external flash, causing intense light bloom, shades of gradient neon lighting decorates the studio",
  "Influencer model in silk head-scarf powers her red Lamborghini Huracan, dust pluming, car fishtails to a stylish stop, scissor door arcs up, she steps onto cracked asphalt and walks toward camera, sand whipping around heels. Low-angle tracking dolly then rising crane move, luxury-auto campaign mood, 8K, slow-mo",
  "Two attractive brunette women in their early 30s, stylish casual outfit, speaking into a podcast microphone, headphones on, confident expression, seated in a modern podcast studio with soft lighting, blurred bookshelf background, subtle LED lighting, cinematic angle, photorealistic, shallow depth of field",
];

const FALLBACK_CATEGORIES = [
  "AI Influencer",
  "Cinematic",
  "Podcast Studio",
  "Automotive",
  "Lifestyle",
];

// VO durations in frames (from PromptShowcaseV2)
const FALLBACK_VO_FRAMES = [681, 256, 592, 671, 600];

const FALLBACK_IMAGES = Array.from({ length: 5 }, (_, i) =>
  staticFile(`prompts/img_${i + 1}.png`)
);
const FALLBACK_VOICEOVERS = Array.from({ length: 5 }, (_, i) =>
  staticFile(`prompts/vo_${i + 1}.mp3`)
);

const POP_SOUND = staticFile("pop.mp3");
const CLICK_SOUND = staticFile("click.mp3");
const AVATAR = staticFile("avatar.jpg");
const AMBIENT_MUSIC = staticFile("prompts/ambient.mp3");

// ── Check if daily data is available ──
const HAS_DAILY_DATA = DAILY_NUM_PROMPTS > 0 && DAILY_PROMPTS.length > 0;

function getPrompts(numPrompts: number) {
  if (HAS_DAILY_DATA) return DAILY_PROMPTS;
  return FALLBACK_PROMPTS.slice(0, numPrompts);
}
function getImages(numPrompts: number) {
  if (HAS_DAILY_DATA) return DAILY_IMAGES;
  return FALLBACK_IMAGES.slice(0, numPrompts);
}
function getVoiceovers(numPrompts: number) {
  if (HAS_DAILY_DATA) return DAILY_VOICEOVERS;
  return FALLBACK_VOICEOVERS.slice(0, numPrompts);
}
function getCategories(numPrompts: number) {
  if (HAS_DAILY_DATA) return DAILY_CATEGORIES;
  return FALLBACK_CATEGORIES.slice(0, numPrompts);
}
function getIntroVo() {
  if (HAS_DAILY_DATA && DAILY_INTRO_VO) return DAILY_INTRO_VO;
  return staticFile("prompts/vo_intro.mp3");
}
function getOutroVo() {
  if (HAS_DAILY_DATA && DAILY_OUTRO_VO) return DAILY_OUTRO_VO;
  return staticFile("prompts/vo_outro.mp3");
}

// ── Helpers ──
function buildSections(numPrompts: number) {
  // Use daily data section frames if available
  if (HAS_DAILY_DATA && DAILY_SECTION_FRAMES.length > 0) {
    return {
      sectionFrames: DAILY_SECTION_FRAMES,
      sectionStarts: DAILY_SECTION_STARTS,
      totalPromptFrames: DAILY_SECTION_FRAMES.reduce((a, b) => a + b, 0),
    };
  }

  // Fallback: Each section = VO frames + 90 frames hold
  const voFrames =
    numPrompts <= 5
      ? FALLBACK_VO_FRAMES
      : Array.from({ length: numPrompts }, (_, i) =>
          FALLBACK_VO_FRAMES[i % 5]
        );

  const sectionFrames = voFrames.map((vf) => vf + 90);
  const sectionStarts: number[] = [];
  let cursor = 0;
  for (const sf of sectionFrames) {
    sectionStarts.push(cursor);
    cursor += sf;
  }
  const totalPromptFrames = cursor;
  return { voFrames, sectionFrames, sectionStarts, totalPromptFrames };
}

function getPromptData(numPrompts: number) {
  // Use daily data if available, otherwise fallback
  const prompts = getPrompts(numPrompts);
  const images = getImages(numPrompts);
  const voiceovers = getVoiceovers(numPrompts);
  const categories = getCategories(numPrompts);
  const actualCount = HAS_DAILY_DATA ? DAILY_NUM_PROMPTS : numPrompts;

  return {
    prompts: prompts.slice(0, actualCount),
    images: images.slice(0, actualCount),
    voiceovers: voiceovers.slice(0, actualCount),
    categories: categories.slice(0, actualCount),
  };
}

// ── Gold Sparkle Particle ──
const Sparkle: React.FC<{
  x: number;
  y: number;
  delay: number;
  size: number;
  frame: number;
}> = ({ x, y, delay, size, frame }) => {
  const localFrame = frame - delay;
  if (localFrame < 0 || localFrame > 40) return null;
  const opacity = interpolate(localFrame, [0, 8, 30, 40], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(localFrame, [0, 10, 40], [0, 1.2, 0.3], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, #ffd700, #ffaa00 60%, transparent 70%)",
        opacity,
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${size * 2}px #ffd700`,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Sparkle Field ──
const SparkleField: React.FC<{ frame: number; count?: number }> = ({
  frame,
  count = 20,
}) => {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i * 307 + 53) % 1920),
        y: ((i * 541 + 97) % 1080),
        delay: (i * 17) % 60,
        size: 4 + ((i * 13) % 8),
      })),
    [count]
  );
  return (
    <>
      {sparkles.map((s, i) => (
        <Sparkle
          key={i}
          x={s.x}
          y={s.y}
          delay={s.delay + Math.floor(frame / 60) * 60}
          size={s.size}
          frame={frame % 120}
        />
      ))}
    </>
  );
};

// ── Film Grain Overlay ──
const FilmGrain: React.FC<{ frame: number }> = ({ frame }) => {
  const seed = frame % 4;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${seed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.04,
        mixBlendMode: "overlay" as const,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Typing Text ──
const TypingText: React.FC<{
  text: string;
  frame: number;
  startFrame: number;
  endFrame: number;
  fontSize: number;
  maxWidth?: number;
  singleLine?: boolean;
}> = ({ text, frame, startFrame, endFrame, fontSize, maxWidth, singleLine }) => {
  const duration = endFrame - startFrame;
  const localFrame = frame - startFrame;
  const charsToShow = Math.min(
    text.length,
    Math.floor((localFrame / duration) * text.length)
  );
  const visibleText = text.slice(0, Math.max(0, charsToShow));
  const showCursor = localFrame >= 0 && Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        fontSize,
        color: "#ffffff",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontWeight: 400,
        lineHeight: 1.5,
        maxWidth: maxWidth || "100%",
        overflow: singleLine ? "hidden" : "visible",
        textOverflow: singleLine ? "ellipsis" : "clip",
        whiteSpace: singleLine ? "nowrap" : "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {visibleText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: fontSize,
            background: "#ffd700",
            marginLeft: 2,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </div>
  );
};

// ── ImageFirst Prompt Section ──
const DailyPromptSection: React.FC<{
  prompt: string;
  image: string;
  voiceover: string;
  index: number;
  total: number;
  category: string;
  sectionLen: number;
  fps: number;
}> = ({ prompt, image, voiceover, index, total, category, sectionLen, fps }) => {
  const frame = useCurrentFrame();

  // Flash transition at start
  const flashIn =
    frame < 3
      ? interpolate(frame, [0, 1, 3], [0.8, 0.5, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  // Dynamic timing
  // VO ends 90 frames before section end
  // But text HOLDS for 60 more frames (2 seconds) so viewer can screenshot
  const voEndFrame = sectionLen - 90; // VO finishes here
  const textHoldEnd = voEndFrame + 60; // Text stays visible for 2 more seconds
  const fadeStart = sectionLen - 15;

  // Image brightness: 60% while text shows, 100% after text disappears
  const brightness = interpolate(
    frame,
    [0, 3, textHoldEnd - 5, textHoldEnd],
    [0.6, 0.6, 0.6, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle slow zoom
  const slowZoom = interpolate(frame, [3, 150], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });

  // Gold glow on reveal
  const glowOpacity = interpolate(
    frame,
    [textHoldEnd - 5, textHoldEnd, textHoldEnd + 10, textHoldEnd + 30],
    [0, 1, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Cross-dissolve at end
  const fadeOut = interpolate(frame, [fadeStart, sectionLen], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Voiceover */}
      <Audio src={voiceover} volume={1} />

      {/* Pop sound at start */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={POP_SOUND} volume={0.6} />
      </Sequence>

      {/* Click sound when text disappears */}
      <Sequence from={Math.max(0, textHoldEnd - 5)} durationInFrames={30}>
        <Audio src={CLICK_SOUND} volume={0.7} />
      </Sequence>

      {/* Blurred background fill for black bars */}
      <AbsoluteFill style={{ background: "#0a0a0f" }}>
        <Img
          src={image}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `brightness(${brightness * 0.3}) blur(30px) saturate(1.3)`,
            transform: "scale(1.2)",
          }}
        />
      </AbsoluteFill>

      {/* Main image (contain fit) */}
      <AbsoluteFill>
        <Img
          src={image}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: `brightness(${brightness})`,
            transform: `scale(${slowZoom})`,
          }}
        />
      </AbsoluteFill>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Animated gold border on reveal */}
      {frame >= textHoldEnd - 5 && (
        <div
          style={{
            position: "absolute",
            inset: 8,
            pointerEvents: "none",
            border: "2px solid #ffd700",
            opacity: interpolate(
              frame,
              [textHoldEnd - 5, textHoldEnd, textHoldEnd + 40, textHoldEnd + 60],
              [0, 0.8, 0.6, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
            boxShadow: "0 0 20px rgba(255,215,0,0.3)",
          }}
        />
      )}

      {/* Gold glow border flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: "4px solid #ffd700",
          boxShadow:
            "inset 0 0 80px rgba(255,215,0,0.3), 0 0 80px rgba(255,215,0,0.3)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Particle burst on transition */}
      {frame < 15 && (
        <>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = frame * 25;
            return (
              <div
                key={`burst-${i}`}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${Math.cos(angle) * dist}px)`,
                  top: `calc(50% + ${Math.sin(angle) * dist}px)`,
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#ffd700",
                  opacity: interpolate(frame, [0, 15], [0.8, 0], {
                    extrapolateRight: "clamp",
                  }),
                  boxShadow: "0 0 8px rgba(255,215,0,0.6)",
                }}
              />
            );
          })}
        </>
      )}

      {/* Category badge - top left */}
      {frame >= 5 && frame < textHoldEnd && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            padding: "6px 16px",
            borderRadius: 20,
            background: "rgba(255,215,0,0.15)",
            border: "1px solid rgba(255,215,0,0.4)",
            opacity: interpolate(
              frame,
              [5, 15, textHoldEnd - 20, textHoldEnd],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          <span
            style={{
              color: "#ffd700",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            {category}
          </span>
        </div>
      )}

      {/* Counter - top right */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          padding: "6px 14px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.5)",
          opacity: 0.7,
        }}
      >
        <span style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>
          {index + 1}/{total}
        </span>
      </div>

      {/* PROMPT VAULT watermark - bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: frame < textHoldEnd ? 220 : 16,
          right: 20,
          opacity: 0.2,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            color: "#ffd700",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 3,
          }}
        >
          PROMPT VAULT
        </span>
      </div>

      {/* Frosted prompt bar at bottom - while VO plays */}
      {frame >= 3 && frame < textHoldEnd && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: 200,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(10px)",
            padding: "24px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            borderTop: "2px solid rgba(255,215,0,0.4)",
            opacity: interpolate(
              frame,
              [textHoldEnd - 20, textHoldEnd],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              color: "#ffd700",
              letterSpacing: 3,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            PROMPT:
          </div>
          <TypingText
            text={prompt}
            frame={frame}
            startFrame={5}
            endFrame={voEndFrame - 30}
            fontSize={34}
            maxWidth={1800}
          />
        </div>
      )}

      {/* Flash transition */}
      <AbsoluteFill
        style={{
          background: "#ffffff",
          opacity: flashIn,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Main Composition ──
export const DailyPromptVideo: React.FC<z.infer<typeof dailyVideoSchema>> = ({
  numPrompts,
  channelName,
  subscriberText,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { sectionFrames, sectionStarts, totalPromptFrames } =
    buildSections(numPrompts);
  const { prompts, images, voiceovers, categories } =
    getPromptData(numPrompts);

  // When using daily data, section starts already include intro offset
  // Use the first section start as the intro duration (it's the gap before prompts begin)
  const INTRO_DUR = HAS_DAILY_DATA ? (DAILY_SECTION_STARTS[0] || 300) : 300;
  const OUTRO_DUR = 300; // ~10s
  const lastSectionEnd = HAS_DAILY_DATA
    ? (DAILY_SECTION_STARTS[DAILY_SECTION_STARTS.length - 1] || 0) + (DAILY_SECTION_FRAMES[DAILY_SECTION_FRAMES.length - 1] || 0)
    : INTRO_DUR + totalPromptFrames;
  const OUTRO_START = lastSectionEnd;
  const TOTAL = OUTRO_START + OUTRO_DUR;

  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      {/* Ambient music throughout at 0.3 volume, fade in/out */}
      <Audio
        src={AMBIENT_MUSIC}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, TOTAL - 60, TOTAL],
            [0, 0.3, 0.3, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* ═══ INTRO (0 - 300) ═══ */}
      <Sequence from={0} durationInFrames={INTRO_DUR}>
        <AbsoluteFill
          style={{
            background: "#0a0a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Audio src={getIntroVo()} volume={1} />
          <Sequence from={0} durationInFrames={15}>
            <Audio src={POP_SOUND} volume={0.6} />
          </Sequence>

          {/* Blurred collage background */}
          {images.slice(0, 5).map((img, i) => (
            <Img
              key={i}
              src={img}
              style={{
                position: "absolute",
                width: "50%",
                height: "50%",
                left: `${(i % 3) * 33}%`,
                top: `${Math.floor(i / 3) * 50}%`,
                objectFit: "cover",
                filter: "blur(20px) brightness(0.15)",
              }}
            />
          ))}

          {/* Title */}
          <div style={{ zIndex: 10, textAlign: "center" }}>
            <h1
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: "white",
                transform: `scale(${spring({
                  frame,
                  fps,
                  config: { stiffness: 80, damping: 12 },
                })})`,
                textShadow: "0 0 60px rgba(255,215,0,0.3)",
                lineHeight: 1.1,
                fontFamily: "'Inter', sans-serif",
                margin: 0,
              }}
            >
              {numPrompts} AI Prompts That Will
              <br />
              <span style={{ color: "#ffd700" }}>Blow Your Mind</span>
            </h1>
            <p
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.6)",
                marginTop: 20,
                opacity: interpolate(frame, [40, 60], [0, 1], {
                  extrapolateRight: "clamp",
                }),
                letterSpacing: 4,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {channelName.toUpperCase()}
            </p>
          </div>

          {/* Fade to black at end of intro */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#0a0a0f",
              opacity: interpolate(
                frame,
                [INTRO_DUR - 20, INTRO_DUR],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ═══ PROMPT SECTIONS ═══ */}
      {prompts.map((prompt, i) => {
        // Daily data: sectionStarts are absolute (include intro). Fallback: need to add INTRO_DUR
        const seqStart = HAS_DAILY_DATA ? sectionStarts[i] : (INTRO_DUR + sectionStarts[i]);
        const seqDur = sectionFrames[i];
        return (
          <Sequence key={i} from={seqStart} durationInFrames={seqDur}>
            <DailyPromptSection
              prompt={prompt}
              image={images[i]}
              voiceover={voiceovers[i]}
              index={i}
              total={numPrompts}
              category={categories[i]}
              sectionLen={seqDur}
              fps={fps}
            />
          </Sequence>
        );
      })}

      {/* ═══ OUTRO ═══ */}
      <Sequence from={OUTRO_START} durationInFrames={OUTRO_DUR}>
        <AbsoluteFill
          style={{
            background: "#0a0a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Audio src={getOutroVo()} volume={1} />

          {/* Fade in */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#0a0a0f",
              opacity: interpolate(
                frame - OUTRO_START,
                [0, 15],
                [1, 0],
                { extrapolateRight: "clamp" }
              ),
              zIndex: 50,
            }}
          />

          {/* Branding */}
          <div style={{ zIndex: 10, textAlign: "center" }}>
            <h1
              style={{
                fontSize: 90,
                fontWeight: 900,
                color: "#ffd700",
                transform: `scale(${spring({
                  frame: frame - OUTRO_START,
                  fps,
                  config: { stiffness: 80, damping: 12 },
                })})`,
                textShadow: "0 0 80px rgba(255,215,0,0.4)",
                fontFamily: "'Inter', sans-serif",
                margin: 0,
              }}
            >
              {channelName.toUpperCase()}
            </h1>
            <p
              style={{
                fontSize: 32,
                color: "rgba(255,255,255,0.7)",
                marginTop: 16,
                opacity: interpolate(
                  frame - OUTRO_START,
                  [20, 40],
                  [0, 1],
                  { extrapolateRight: "clamp" }
                ),
                fontFamily: "'Inter', sans-serif",
              }}
            >
              6,000+ Tested AI Prompts
            </p>

            {/* Subscribe overlay */}
            <div
              style={{
                marginTop: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                transform: `translateY(${interpolate(
                  spring({
                    frame: frame - OUTRO_START - 50,
                    fps,
                    config: { stiffness: 80, damping: 14 },
                  }),
                  [0, 1],
                  [60, 0]
                )}px)`,
                opacity: interpolate(
                  frame - OUTRO_START,
                  [50, 65],
                  [0, 1],
                  { extrapolateRight: "clamp" }
                ),
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #ffd700",
                  boxShadow: "0 0 20px rgba(255,215,0,0.4)",
                  zIndex: 2,
                }}
              >
                <Img
                  src={AVATAR}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "rgba(20,20,20,0.95)",
                  borderRadius: "0 36px 36px 0",
                  padding: "10px 22px 10px 46px",
                  marginLeft: -30,
                  zIndex: 1,
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {channelName}
                  </div>
                  <div
                    style={{
                      color: "#aaa",
                      fontSize: 13,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {subscriberText}
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px 18px",
                    borderRadius: 22,
                    fontWeight: 700,
                    fontSize: 15,
                    fontFamily: "'Inter', sans-serif",
                    background:
                      frame - OUTRO_START >= 120
                        ? "rgba(255,215,0,0.15)"
                        : "#ffd700",
                    color:
                      frame - OUTRO_START >= 120 ? "#ffd700" : "#0f0f0f",
                    border:
                      frame - OUTRO_START >= 120
                        ? "1px solid #ffd700"
                        : "none",
                  }}
                >
                  {frame - OUTRO_START >= 120 ? "Subscribed" : "Subscribe"}
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.4)",
                marginTop: 30,
                letterSpacing: 5,
                opacity: interpolate(
                  frame - OUTRO_START,
                  [70, 85],
                  [0, 1],
                  { extrapolateRight: "clamp" }
                ),
                fontFamily: "'Inter', sans-serif",
              }}
            >
              LINK IN DESCRIPTION
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sparkles throughout */}
      <SparkleField frame={frame} count={25} />

      {/* Film grain */}
      <FilmGrain frame={frame} />
    </AbsoluteFill>
  );
};

// ── Calculate metadata for dynamic duration ──
export const calculateDailyVideoMetadata: React.FC = () => null;

export function getDailyVideoDuration(numPrompts: number): number {
  const { totalPromptFrames } = buildSections(numPrompts);
  return 300 + totalPromptFrames + 300; // intro + prompts + outro
}
