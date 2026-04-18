import React, { useMemo } from "react";
import { z } from "zod";
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

// ── Zod Props Schema ──
export const promptShowcaseSchema = z.object({
  channelName: z.string().default("AI Injection"),
  subscriberCount: z.string().default("1.79K subscribers"),
});

type Props = z.infer<typeof promptShowcaseSchema>;

const PROMPTS = [
  "a cyberpunk female singer in a futuristic recording studio, facing camera directly, long messy bright pink hair, wearing large black headphones, metallic futuristic jewelry",
  "behind the scenes of an action movie scene, stunning woman in tactical outfit, dramatic lighting, film set atmosphere",
  "photograph, ultra-realistic, beautiful woman in elegant white dress, golden hour lighting, cinematic portrait",
  "Influencer model in silk head-scarf powers her red Lamborghini through desert, cinematic wide shot, dust trails",
  "Two attractive brunette women in their early 30s, stylish casual outfit, urban cafe setting, natural lighting",
];

const IMAGES = [
  staticFile("prompts/img_1.png"),
  staticFile("prompts/img_2.png"),
  staticFile("prompts/img_3.png"),
  staticFile("prompts/img_4.png"),
  staticFile("prompts/img_5.png"),
];

const FRAMES_PER_PROMPT = 150;

// ── Sparkle Particle ──
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
        background: "radial-gradient(circle, #ffd700, #ffaa00 60%, transparent 70%)",
        opacity,
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${size * 2}px #ffd700`,
        pointerEvents: "none",
      }}
    />
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
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.${65 + seed}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

// ── Animated Background ──
const AnimatedBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const hueShift = interpolate(frame, [0, 900], [0, 60]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 50%, hsla(${260 + hueShift}, 80%, 8%, 0.6) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 30%, hsla(${200 + hueShift}, 70%, 6%, 0.5) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, hsla(${300 + hueShift}, 60%, 5%, 0.4) 0%, transparent 60%),
          #0a0a10
        `,
      }}
    />
  );
};

// ── Single Prompt Section ──
const PromptSection: React.FC<{
  prompt: string;
  imageSrc: string;
  frame: number;
  index: number;
  fps: number;
}> = ({ prompt, imageSrc, frame, index, fps }) => {
  // Phase calculations
  const isTyping = frame >= 5 && frame < 60;
  const isPause = frame >= 60 && frame < 65;
  const isReveal = frame >= 65 && frame < 140;
  const isExit = frame >= 140;

  // Typing
  const charsToShow = isTyping
    ? Math.floor(
        interpolate(frame, [5, 58], [0, prompt.length], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      )
    : frame >= 60
    ? prompt.length
    : 0;

  const cursorVisible = isTyping && Math.floor(frame * 2) % 2 === 0;
  const typedText = prompt.slice(0, charsToShow);

  // Progress bar
  const progressWidth = interpolate(frame, [5, 58], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Terminal status
  const terminalText =
    frame < 5
      ? "> initializing..."
      : frame < 60
      ? "> generating..."
      : "> complete \u2713";
  const terminalColor = frame >= 60 ? "#00ff66" : "#ffd700";

  // Flash on transition
  const flashOpacity =
    frame >= 0 && frame < 5
      ? interpolate(frame, [0, 5], [0.6, 0], { extrapolateRight: "clamp" })
      : frame >= 60 && frame < 65
      ? interpolate(frame, [60, 65], [0.5, 0], { extrapolateRight: "clamp" })
      : 0;

  // Image reveal
  const imageScale = isReveal
    ? spring({
        frame: frame - 65,
        fps,
        config: { damping: 12, stiffness: 80, mass: 0.8 },
      }) * 0.5 + 0.5
    : isExit
    ? 1
    : 0.5;

  const imageOpacity = isReveal
    ? interpolate(frame, [65, 75], [0, 1], { extrapolateRight: "clamp" })
    : isExit
    ? interpolate(frame, [140, 150], [1, 0], { extrapolateRight: "clamp" })
    : 0;

  // Subtle slow zoom on revealed image
  const imageZoom = isReveal
    ? interpolate(frame, [65, 140], [1, 1.04], { extrapolateRight: "clamp" })
    : 1.04;

  // Gold glow around image
  const glowIntensity = isReveal
    ? interpolate(frame, [65, 80, 130, 140], [0, 1, 1, 0.5], {
        extrapolateRight: "clamp",
      })
    : 0;

  // Card opacity
  const cardOpacity =
    frame < 5
      ? interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" })
      : isExit
      ? interpolate(frame, [140, 148], [1, 0], { extrapolateRight: "clamp" })
      : 1;

  // Card slide
  const cardX = spring({
    frame: Math.max(0, frame - 1),
    fps,
    config: { damping: 15, stiffness: 60, mass: 0.6 },
  });
  const cardTranslateX = interpolate(cardX, [0, 1], [-80, 0]);

  // Exit scale
  const exitScale = isExit
    ? interpolate(frame, [140, 150], [1, 0.9], { extrapolateRight: "clamp" })
    : 1;

  // Generate sparkle positions deterministically from index
  const sparkles = useMemo(() => {
    const s = [];
    for (let i = 0; i < 12; i++) {
      s.push({
        x: 960 + Math.cos((i * Math.PI * 2) / 12 + index) * (200 + (i % 3) * 100),
        y: 540 + Math.sin((i * Math.PI * 2) / 12 + index) * (150 + (i % 4) * 80),
        delay: 65 + i * 2,
        size: 4 + (i % 3) * 3,
      });
    }
    return s;
  }, [index]);

  return (
    <AbsoluteFill style={{ transform: `scale(${exitScale})`, opacity: cardOpacity }}>
      {/* Terminal Header */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          fontFamily: "'Courier New', monospace",
          fontSize: 20,
          color: terminalColor,
          letterSpacing: 1,
          textShadow: `0 0 10px ${terminalColor}`,
        }}
      >
        {terminalText}
      </div>

      {/* Prompt Number Badge */}
      <div
        style={{
          position: "absolute",
          top: 38,
          right: 60,
          fontFamily: "'Courier New', monospace",
          fontSize: 16,
          color: "#888",
          background: "rgba(255,255,255,0.05)",
          padding: "6px 16px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        PROMPT {index + 1}/5
      </div>

      {/* Prompt Card - Left Side */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: "50%",
          transform: `translateY(-50%) translateX(${cardTranslateX}px)`,
          width: "52%",
          maxWidth: 1000,
          zIndex: 10,
        }}
      >
        {/* PROMPT Label */}
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 14,
            color: "#ffd700",
            letterSpacing: 3,
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          PROMPT:
        </div>

        {/* Prompt Text Card */}
        <div
          style={{
            background: "rgba(10, 10, 20, 0.85)",
            border: "1px solid rgba(0, 255, 102, 0.2)",
            borderRadius: 12,
            padding: "28px 32px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 22,
              color: "#00ff66",
              lineHeight: 1.6,
              minHeight: 120,
              textShadow: "0 0 8px rgba(0, 255, 102, 0.3)",
              wordBreak: "break-word",
            }}
          >
            {typedText}
            {isTyping && (
              <span
                style={{
                  opacity: cursorVisible ? 1 : 0,
                  color: "#00ff66",
                  textShadow: "0 0 10px #00ff66",
                }}
              >
                |
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div
            style={{
              marginTop: 16,
              height: 3,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressWidth}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00ff66, #ffd700)",
                borderRadius: 2,
                boxShadow: "0 0 8px rgba(0,255,102,0.4)",
                transition: "none",
              }}
            />
          </div>
        </div>

        {/* AI Badge */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 12,
              color: "#aaa",
              background: "rgba(255,255,255,0.06)",
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            AI Generated
          </div>
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: 12,
              color: "#aaa",
              background: "rgba(255,255,255,0.06)",
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Midjourney v6
          </div>
        </div>
      </div>

      {/* Image - Right Side */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: "50%",
          transform: "translateY(-50%)",
          width: "48%",
          maxWidth: 860,
          aspectRatio: "4/3",
          overflow: "hidden",
          borderRadius: 16,
          opacity: imageOpacity,
          boxShadow: `0 0 ${40 * glowIntensity}px rgba(255, 215, 0, ${0.4 * glowIntensity}), 0 0 ${80 * glowIntensity}px rgba(255, 215, 0, ${0.15 * glowIntensity}), 0 20px 60px rgba(0,0,0,0.6)`,
          border: `2px solid rgba(255, 215, 0, ${0.3 * glowIntensity})`,
        }}
      >
        <Img
          src={imageSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imageScale * imageZoom})`,
          }}
        />
      </div>

      {/* Sparkles */}
      {sparkles.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} delay={s.delay} size={s.size} frame={frame} />
      ))}

      {/* Flash overlay */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "white",
            opacity: flashOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ── Closing Card ──
const ClosingCard: React.FC<{
  frame: number;
  fps: number;
  channelName: string;
  subscriberCount: string;
}> = ({ frame, fps, channelName, subscriberCount }) => {
  const enterScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });

  const titleY = interpolate(enterScale, [0, 1], [60, 0]);

  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subscribeOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subscribeScale = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 10, stiffness: 100, mass: 0.5 },
  });

  // Floating sparkles for closing
  const closingSparkles = useMemo(() => {
    const s = [];
    for (let i = 0; i < 20; i++) {
      s.push({
        x: 200 + (i * 1520) / 20 + Math.sin(i * 1.5) * 80,
        y: 150 + Math.cos(i * 2.1) * 350 + 200,
        delay: i * 4,
        size: 3 + (i % 4) * 2,
      });
    }
    return s;
  }, []);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px) scale(${enterScale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 80,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 8,
            textShadow: "0 0 40px rgba(255,215,0,0.4), 0 0 80px rgba(255,215,0,0.15)",
          }}
        >
          PROMPT VAULT
        </div>

        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 32,
            color: "#ffd700",
            marginTop: 20,
            opacity: subtitleOpacity,
            letterSpacing: 4,
          }}
        >
          6,000+ Tested Prompts
        </div>

        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 24,
            color: "#00ff66",
            marginTop: 16,
            opacity: subtitleOpacity,
            textShadow: "0 0 10px rgba(0,255,102,0.4)",
          }}
        >
          promptvault.com
        </div>
      </div>

      {/* Subscribe Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          opacity: subscribeOpacity,
          transform: `scale(${subscribeScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ff0000, #cc0000)",
            color: "#fff",
            fontFamily: "sans-serif",
            fontSize: 22,
            fontWeight: 700,
            padding: "14px 48px",
            borderRadius: 8,
            letterSpacing: 2,
            boxShadow: "0 4px 20px rgba(255,0,0,0.3)",
          }}
        >
          SUBSCRIBE
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 16,
            color: "#aaa",
          }}
        >
          {channelName} - {subscriberCount}
        </div>
      </div>

      {/* Sparkles */}
      {closingSparkles.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} delay={s.delay} size={s.size} frame={frame} />
      ))}
    </AbsoluteFill>
  );
};

// ── Main Composition ──
export const PromptShowcase: React.FC<Props> = ({
  channelName,
  subscriberCount,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine which prompt section we're in
  const promptIndex = Math.min(Math.floor(frame / FRAMES_PER_PROMPT), 4);
  const localFrame = frame - promptIndex * FRAMES_PER_PROMPT;
  const isClosing = frame >= 750;

  // Gold floating particles throughout
  const ambientSparkles = useMemo(() => {
    const s = [];
    for (let i = 0; i < 8; i++) {
      s.push({
        x: 100 + (i * 1700) / 8,
        y: 80 + Math.sin(i * 1.8) * 400 + 450,
        size: 2 + (i % 3) * 1.5,
      });
    }
    return s;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a10" }}>
      {/* Animated gradient background */}
      <AnimatedBackground frame={frame} />

      {/* Prompt sections */}
      {!isClosing &&
        PROMPTS.map((prompt, i) => (
          <Sequence key={i} from={i * FRAMES_PER_PROMPT} durationInFrames={FRAMES_PER_PROMPT}>
            <PromptSection
              prompt={prompt}
              imageSrc={IMAGES[i]}
              frame={localFrame}
              index={i}
              fps={fps}
            />
          </Sequence>
        ))}

      {/* Closing card */}
      <Sequence from={750} durationInFrames={150}>
        <ClosingCard
          frame={frame - 750}
          fps={fps}
          channelName={channelName}
          subscriberCount={subscriberCount}
        />
      </Sequence>

      {/* Audio - pop on each prompt start */}
      {PROMPTS.map((_, i) => (
        <Sequence key={`pop-${i}`} from={i * FRAMES_PER_PROMPT} durationInFrames={30}>
          <Audio src={staticFile("pop.mp3")} volume={0.6} />
        </Sequence>
      ))}

      {/* Audio - click on each image reveal */}
      {PROMPTS.map((_, i) => (
        <Sequence key={`click-${i}`} from={i * FRAMES_PER_PROMPT + 60} durationInFrames={30}>
          <Audio src={staticFile("click.mp3")} volume={0.5} />
        </Sequence>
      ))}

      {/* Ambient gold sparkles throughout */}
      {ambientSparkles.map((s, i) => {
        const sparkleFrame = (frame + i * 40) % 120;
        const opacity = interpolate(sparkleFrame, [0, 20, 100, 120], [0, 0.6, 0.6, 0], {
          extrapolateRight: "clamp",
        });
        const yOffset = interpolate(sparkleFrame, [0, 120], [0, -60]);
        return (
          <div
            key={`ambient-${i}`}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y + yOffset,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: "#ffd700",
              opacity,
              boxShadow: `0 0 ${s.size * 3}px #ffd700`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Film grain overlay */}
      <FilmGrain frame={frame} />
    </AbsoluteFill>
  );
};
