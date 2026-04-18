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

// ── Data ──
const PROMPTS = [
  "a cyberpunk female singer in a futuristic recording studio, facing camera directly, long messy bright pink hair, wearing large black headphones, metallic futuristic jewelry and accessories, microphones in front of her, music equipment and speakers in the background, realistic style, natural lighting, ultra detailed, cinematic, photorealistic, 8k",
  "behind the scenes of an action movie scene, stills archive, harley quinn, dramatic lighting, film set atmosphere, cinematic composition",
  "photograph, ultra-realistic, beautiful woman hosting a podcast, looking into the camera speaking into a black microphone, modern podcast studio, interior shadows clash with external flash, causing intense light bloom, shades of gradient neon lighting decorates the studio",
  "Influencer model in silk head-scarf powers her red Lamborghini Huracan, dust pluming, car fishtails to a stylish stop, scissor door arcs up, she steps onto cracked asphalt and walks toward camera, sand whipping around heels. Low-angle tracking dolly then rising crane move, luxury-auto campaign mood, 8K, slow-mo",
  "Two attractive brunette women in their early 30s, stylish casual outfit, speaking into a podcast microphone, headphones on, confident expression, seated in a modern podcast studio with soft lighting, blurred bookshelf background, subtle LED lighting, cinematic angle, photorealistic, shallow depth of field",
];

const IMAGES = Array.from({ length: 5 }, (_, i) =>
  staticFile(`prompts/img_${i + 1}.png`)
);
const VOICEOVERS = Array.from({ length: 5 }, (_, i) =>
  staticFile(`prompts/vo_${i + 1}.mp3`)
);
const POP_SOUND = staticFile("pop.mp3");
const CLICK_SOUND = staticFile("click.mp3");
const AVATAR = staticFile("avatar.jpg");

// Each section = VO duration + 75 frames (2.5s hold on image) + 15 frames transition
// VO durations in frames: 681, 256, 592, 671, 600
const SECTION_FRAMES = [770, 345, 680, 760, 690];
const SECTION_STARTS = [0, 770, 1115, 1795, 2555];
const TOTAL_PROMPT_FRAMES = 3245; // sum of all sections
const FRAMES_PER_PROMPT = 680; // max, used as fallback
const CLOSING_START = TOTAL_PROMPT_FRAMES; // 2790

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
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

// ── Gold Particle Burst ──
const ParticleBurst: React.FC<{ frame: number; cx: number; cy: number }> = ({
  frame,
  cx,
  cy,
}) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return { angle, speed: 8 + (i % 5) * 3, size: 3 + (i % 4) };
      }),
    []
  );
  if (frame < 0 || frame > 25) return null;
  return (
    <>
      {particles.map((p, i) => {
        const dist = p.speed * frame;
        const opacity = interpolate(frame, [0, 5, 25], [0, 1, 0], {
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + Math.cos(p.angle) * dist,
              top: cy + Math.sin(p.angle) * dist,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "#ffd700",
              opacity,
              boxShadow: "0 0 6px #ffd700",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
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

// ── Closing Overlay ──
const ClosingOverlay: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = frame - CLOSING_START;
  if (localFrame < 0) return null;

  const fadeIn = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleScale = spring({ frame: localFrame, fps, config: { damping: 12 } });
  const subtitleOpacity = interpolate(localFrame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });
  const avatarScale = spring({
    frame: localFrame - 60,
    fps,
    config: { damping: 10 },
  });
  const subBtnOpacity = interpolate(localFrame, [80, 100], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a1020 50%, #0a0a0f 100%)",
        opacity: fadeIn,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 800,
          color: "#ffd700",
          transform: `scale(${titleScale})`,
          textShadow: "0 0 40px rgba(255,215,0,0.5)",
          letterSpacing: 6,
        }}
      >
        PROMPT VAULT
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 32,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          color: "#ffffff",
          opacity: subtitleOpacity,
          marginTop: 20,
        }}
      >
        6,000+ Tested Prompts
      </div>

      {/* Avatar + Subscribe */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginTop: 60,
          opacity: subBtnOpacity,
          transform: `scale(${Math.max(0, avatarScale)})`,
        }}
      >
        <Img
          src={AVATAR}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "3px solid #ffd700",
          }}
        />
        <div
          style={{
            background: "#cc0000",
            color: "#ffffff",
            fontSize: 24,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            padding: "14px 40px",
            borderRadius: 8,
            letterSpacing: 1,
          }}
        >
          SUBSCRIBE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════
// TEMPLATE A: CinemaReveal
// ═══════════════════════════════════════════════════
export const CinemaReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      {/* Ambient gradient during typing phases */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 80%, rgba(255,215,0,0.03) 0%, transparent 60%)`,
          opacity: interpolate(
            Math.sin(frame * 0.02),
            [-1, 1],
            [0.3, 0.7]
          ),
        }}
      />

      {/* Prompt sequences - each section matches its VO duration */}
      {PROMPTS.map((prompt, i) => {
        const seqStart = SECTION_STARTS[i];
        const seqDur = SECTION_FRAMES[i];
        return (
          <Sequence key={i} from={seqStart} durationInFrames={seqDur}>
            <CinemaRevealPrompt
              prompt={prompt}
              image={IMAGES[i]}
              voiceover={VOICEOVERS[i]}
              index={i}
              fps={fps}
            />
          </Sequence>
        );
      })}

      {/* Sparkles throughout */}
      <SparkleField frame={frame} count={25} />

      {/* Film grain */}
      <FilmGrain frame={frame} />

      {/* Closing */}
      <ClosingOverlay frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

const CinemaRevealPrompt: React.FC<{
  prompt: string;
  image: string;
  voiceover: string;
  index: number;
  fps: number;
}> = ({ prompt, image, voiceover, index, fps }) => {
  const frame = useCurrentFrame();

  // Dynamic timing based on section length
  const sectionLen = SECTION_FRAMES[index] || 680;
  const voEnd = sectionLen - 75; // VO ends, image holds for 2.5s
  const revealStart = Math.floor(voEnd * 0.65); // Image reveals at 65% through VO
  const revealFlashEnd = revealStart + 5;
  const fadeStart = sectionLen - 15;

  // Phase calculations
  const isTypingPhase = frame >= 3 && frame < revealStart;
  const isRevealFlash = frame >= revealStart && frame < revealFlashEnd;
  const isImagePhase = frame >= revealFlashEnd && frame < fadeStart;
  const isFadeOut = frame >= fadeStart;

  // Flash burst
  const flashOpacity = isRevealFlash
    ? interpolate(frame, [revealStart, revealStart + 2, revealFlashEnd], [0, 0.9, 0], { extrapolateRight: "clamp" })
    : 0;

  // Fade out
  const fadeOut = isFadeOut
    ? interpolate(frame, [fadeStart, sectionLen], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  // Image scale (spring from 0.8 to 1.0)
  const imgScale = isImagePhase || isFadeOut
    ? spring({
        frame: frame - revealFlashEnd,
        fps,
        config: { damping: 14, stiffness: 80 },
        from: 0.8,
        to: 1.0,
      })
    : 0.8;

  // Subtle slow zoom on image
  const slowZoom = isImagePhase
    ? interpolate(frame, [85, 145], [1.0, 1.03], { extrapolateRight: "clamp" })
    : 1.0;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Voiceover */}
      <Audio src={voiceover} volume={1} />

      {/* Pop sound at start */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={POP_SOUND} volume={0.6} />
      </Sequence>

      {/* Click sound at reveal */}
      <Sequence from={80} durationInFrames={30}>
        <Audio src={CLICK_SOUND} volume={0.7} />
      </Sequence>

      {/* Image (visible during reveal phase) */}
      {(isImagePhase || isFadeOut) && (
        <AbsoluteFill>
          <Img
            src={image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${imgScale * slowZoom})`,
            }}
          />
        </AbsoluteFill>
      )}

      {/* TYPING PHASE: Prompt card */}
      {isTypingPhase && (
        <div
          style={{
            position: "absolute",
            bottom: 140,
            left: "10%",
            right: "10%",
            background: "rgba(0,0,0,0.75)",
            borderRadius: 16,
            padding: "30px 40px",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              color: "#ffd700",
              letterSpacing: 3,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            PROMPT:
          </div>
          <TypingText
            text={prompt}
            frame={frame}
            startFrame={3}
            endFrame={75}
            fontSize={36}
          />
        </div>
      )}

      {/* IMAGE PHASE: Prompt bar at bottom */}
      {(isImagePhase || isFadeOut) && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.7)",
            padding: "16px 40px",
            borderTop: "1px solid rgba(255,215,0,0.3)",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              color: "#ffd700",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            PROMPT:
          </div>
          <TypingText
            text={prompt}
            frame={150}
            startFrame={0}
            endFrame={1}
            fontSize={28}
            singleLine
          />
        </div>
      )}

      {/* Gold particle burst on reveal */}
      <ParticleBurst frame={frame - 82} cx={960} cy={540} />

      {/* White flash */}
      <AbsoluteFill
        style={{
          background: "#ffffff",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════
// TEMPLATE B: ImageFirst
// ═══════════════════════════════════════════════════
export const ImageFirst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const INTRO_DUR = 300; // 10 seconds
  const OUTRO_START = INTRO_DUR + TOTAL_PROMPT_FRAMES; // after all prompts
  const OUTRO_DUR = 300; // 10 seconds

  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      {/* Ambient music throughout - quiet under VO */}
      <Audio
        src={staticFile("prompts/ambient.mp3")}
        volume={(f) => interpolate(f, [0, 30, OUTRO_START + OUTRO_DUR - 60, OUTRO_START + OUTRO_DUR], [0, 0.35, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      {/* ═══ INTRO (0 - 300) ═══ */}
      <Sequence from={0} durationInFrames={INTRO_DUR}>
        <AbsoluteFill style={{ background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Audio src={staticFile("prompts/vo_intro.mp3")} volume={1} />
          <Sequence from={0} durationInFrames={15}><Audio src={POP_SOUND} volume={0.6} /></Sequence>

          {/* Blurred collage of all images as background */}
          {IMAGES.map((img, i) => (
            <Img key={i} src={img} style={{
              position: "absolute",
              width: "50%", height: "50%",
              left: `${(i % 3) * 33}%`, top: `${Math.floor(i / 3) * 50}%`,
              objectFit: "cover",
              filter: "blur(20px) brightness(0.15)",
            }} />
          ))}

          {/* Title text */}
          <div style={{ zIndex: 10, textAlign: "center" }}>
            <h1 style={{
              fontSize: 80, fontWeight: 900, color: "white",
              transform: `scale(${spring({ frame, fps, config: { stiffness: 80, damping: 12 } })})`,
              textShadow: "0 0 60px rgba(255,215,0,0.3)",
              lineHeight: 1.1,
            }}>
              5 AI Prompts That Will
              <br />
              <span style={{ color: "#ffd700" }}>Blow Your Mind</span>
            </h1>
            <p style={{
              fontSize: 28, color: "rgba(255,255,255,0.6)", marginTop: 20,
              opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
              letterSpacing: 4,
            }}>
              PROMPT VAULT
            </p>
          </div>

          {/* Fade to black at end */}
          <div style={{
            position: "absolute", inset: 0, background: "#0a0a0f",
            opacity: interpolate(frame, [INTRO_DUR - 20, INTRO_DUR], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }} />
        </AbsoluteFill>
      </Sequence>

      {/* ═══ PROMPT SEQUENCES (300 - 3545) ═══ */}
      {PROMPTS.map((prompt, i) => {
        const seqStart = INTRO_DUR + SECTION_STARTS[i];
        const seqDur = SECTION_FRAMES[i];
        return (
          <Sequence key={i} from={seqStart} durationInFrames={seqDur}>
            <ImageFirstPrompt
              prompt={prompt}
              image={IMAGES[i]}
              voiceover={VOICEOVERS[i]}
              index={i}
              fps={fps}
            />
          </Sequence>
        );
      })}

      {/* ═══ OUTRO (3545 - 3845) ═══ */}
      <Sequence from={OUTRO_START} durationInFrames={OUTRO_DUR}>
        <AbsoluteFill style={{ background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Audio src={staticFile("prompts/vo_outro.mp3")} volume={1} />

          {/* Fade in */}
          <div style={{
            position: "absolute", inset: 0, background: "#0a0a0f",
            opacity: interpolate(frame - OUTRO_START, [0, 15], [1, 0], { extrapolateRight: "clamp" }),
            zIndex: 50,
          }} />

          {/* "PROMPT VAULT" branding */}
          <div style={{ zIndex: 10, textAlign: "center" }}>
            <h1 style={{
              fontSize: 90, fontWeight: 900, color: "#ffd700",
              transform: `scale(${spring({ frame: frame - OUTRO_START, fps, config: { stiffness: 80, damping: 12 } })})`,
              textShadow: "0 0 80px rgba(255,215,0,0.4)",
            }}>
              PROMPT VAULT
            </h1>
            <p style={{
              fontSize: 32, color: "rgba(255,255,255,0.7)", marginTop: 16,
              opacity: interpolate(frame - OUTRO_START, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              6,000+ Tested AI Prompts
            </p>

            {/* Subscribe overlay */}
            <div style={{
              marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 0,
              transform: `translateY(${interpolate(spring({ frame: frame - OUTRO_START - 50, fps, config: { stiffness: 80, damping: 14 } }), [0, 1], [60, 0])}px)`,
              opacity: interpolate(frame - OUTRO_START, [50, 65], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: "3px solid #ffd700", boxShadow: "0 0 20px rgba(255,215,0,0.4)", zIndex: 2 }}>
                <Img src={staticFile("avatar.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(20,20,20,0.95)", borderRadius: "0 36px 36px 0",
                padding: "10px 22px 10px 46px", marginLeft: -30, zIndex: 1,
                border: "1px solid rgba(255,215,0,0.3)",
              }}>
                <div>
                  <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>Prompt Vault</div>
                  <div style={{ color: "#aaa", fontSize: 13 }}>AI Prompt Library</div>
                </div>
                <div style={{
                  padding: "8px 18px", borderRadius: 22, fontWeight: 700, fontSize: 15,
                  background: frame - OUTRO_START >= 120 ? "rgba(255,215,0,0.15)" : "#ffd700",
                  color: frame - OUTRO_START >= 120 ? "#ffd700" : "#0f0f0f",
                  border: frame - OUTRO_START >= 120 ? "1px solid #ffd700" : "none",
                }}>
                  {frame - OUTRO_START >= 120 ? "Subscribed" : "Subscribe"}
                </div>
              </div>
            </div>

            <p style={{
              fontSize: 20, color: "rgba(255,255,255,0.4)", marginTop: 30, letterSpacing: 5,
              opacity: interpolate(frame - OUTRO_START, [70, 85], [0, 1], { extrapolateRight: "clamp" }),
            }}>
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

const ImageFirstPrompt: React.FC<{
  prompt: string;
  image: string;
  voiceover: string;
  index: number;
  fps: number;
}> = ({ prompt, image, voiceover, index, fps }) => {
  const frame = useCurrentFrame();

  // Flash transition at start
  const flashIn =
    frame < 3
      ? interpolate(frame, [0, 1, 3], [0.8, 0.5, 0], { extrapolateRight: "clamp" })
      : 0;

  // Dynamic timing
  const sectionLen = SECTION_FRAMES[index] || 770;
  const voEndFrame = sectionLen - 90; // VO ends, text disappears
  const fadeStart = sectionLen - 15;

  // Image brightness: visible immediately, slightly dimmed while text shows, full after text goes
  const brightness = interpolate(frame, [0, 3, voEndFrame - 5, voEndFrame], [0.6, 0.6, 0.6, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle slow zoom throughout
  const slowZoom = interpolate(frame, [3, 150], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });

  // Gold glow border when text disappears (the reveal moment)
  const glowOpacity = interpolate(frame, [voEndFrame - 5, voEndFrame, voEndFrame + 10, voEndFrame + 30], [0, 1, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cross-dissolve at end
  const fadeOut = interpolate(frame, [fadeStart, sectionLen], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Category labels
  const categories = ["AI Influencer", "Cinematic", "Podcast Studio", "Automotive", "Lifestyle"];
  const category = categories[index] || "AI Generated";

  // Animated gold border trace
  const borderProgress = interpolate(frame, [voEndFrame, voEndFrame + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const borderDash = `${borderProgress * 100}% ${100 - borderProgress * 100}%`;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Voiceover */}
      <Audio src={voiceover} volume={1} />

      {/* Pop sound at start */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={POP_SOUND} volume={0.6} />
      </Sequence>

      {/* Click sound when text disappears and image fully reveals */}
      <Sequence from={Math.max(0, voEndFrame - 5)} durationInFrames={30}>
        <Audio src={CLICK_SOUND} volume={0.7} />
      </Sequence>

      {/* 1. BLURRED BACKGROUND FILL - fills black bars with blurred image */}
      <AbsoluteFill style={{ background: "#0a0a0f" }}>
        <Img
          src={image}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `brightness(${brightness * 0.3}) blur(30px) saturate(1.3)`,
            transform: `scale(1.2)`,
          }}
        />
      </AbsoluteFill>

      {/* Main image (contain so no cropping) */}
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

      {/* 5. VIGNETTE - darken edges for focus */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
      }} />

      {/* 7. ANIMATED GOLD BORDER on reveal */}
      {frame >= voEndFrame - 5 && (
        <div style={{
          position: "absolute", inset: 8, pointerEvents: "none",
          border: "2px solid #ffd700",
          opacity: interpolate(frame, [voEndFrame - 5, voEndFrame, voEndFrame + 40, voEndFrame + 60], [0, 0.8, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          boxShadow: `0 0 20px rgba(255,215,0,0.3)`,
        }} />
      )}

      {/* Gold glow border flash on reveal */}
      <div
        style={{
          position: "absolute", inset: 0,
          border: "4px solid #ffd700",
          boxShadow: `inset 0 0 80px rgba(255,215,0,0.3), 0 0 80px rgba(255,215,0,0.3)`,
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* 3. TRANSITION PARTICLE BURST between prompts */}
      {frame < 15 && (
        <>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = frame * 25;
            return (
              <div key={`burst-${i}`} style={{
                position: "absolute",
                left: `calc(50% + ${Math.cos(angle) * dist}px)`,
                top: `calc(50% + ${Math.sin(angle) * dist}px)`,
                width: 4, height: 4, borderRadius: "50%",
                background: "#ffd700",
                opacity: interpolate(frame, [0, 15], [0.8, 0], { extrapolateRight: "clamp" }),
                boxShadow: "0 0 8px rgba(255,215,0,0.6)",
              }} />
            );
          })}
        </>
      )}

      {/* 2. CATEGORY BADGE - top left */}
      {frame >= 5 && frame < voEndFrame && (
        <div style={{
          position: "absolute", top: 24, left: 24,
          padding: "6px 16px", borderRadius: 20,
          background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.4)",
          opacity: interpolate(frame, [5, 15, voEndFrame - 20, voEndFrame], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <span style={{ color: "#ffd700", fontSize: 16, fontWeight: 600, letterSpacing: 2 }}>{category}</span>
        </div>
      )}

      {/* 4. IMAGE COUNTER - top right */}
      <div style={{
        position: "absolute", top: 24, right: 24,
        padding: "6px 14px", borderRadius: 8,
        background: "rgba(0,0,0,0.5)",
        opacity: 0.7,
      }}>
        <span style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>{index + 1}/5</span>
      </div>

      {/* 6. PROMPT VAULT WATERMARK - subtle bottom right */}
      <div style={{
        position: "absolute", bottom: frame < voEndFrame ? 220 : 16, right: 20,
        opacity: 0.2, pointerEvents: "none",
        transition: "bottom 0.3s",
      }}>
        <span style={{ color: "#ffd700", fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>PROMPT VAULT</span>
      </div>

      {/* Prompt bar at bottom - disappears when VO finishes */}
      {frame >= 3 && frame < voEndFrame && (
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
            opacity: interpolate(frame, [voEndFrame - 20, voEndFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
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
