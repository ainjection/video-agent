import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Assets ──
const AVATAR = staticFile("avatar.jpg");
const POP_SFX = staticFile("pop.mp3");
const CLICK_SFX = staticFile("click.mp3");
const BELL_SFX = staticFile("bell.mp3");

const INFLUENCER_1 = staticFile("images/img1db6ae.jpg");
const INFLUENCER_2 = staticFile("images/imge1c1a8.jpg");
const CYBER_IMG = staticFile("images/cyber_12954.jpg");

// ════════════════════════════════════════════════════════════════
// TEMPLATE 1 — CleanModern  (180 frames / 6s @ 30fps)
// ════════════════════════════════════════════════════════════════
export const CleanModern: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Channel name slide-in with spring bounce
  const nameX = spring({ frame, fps, from: -1200, to: 0, config: { damping: 12, mass: 0.8 } });

  // Accent line width
  const lineWidth = interpolate(frame, [30, 70], [0, 700], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Tagline fade
  const tagOpacity = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Floating shapes
  const shapeY1 = interpolate(frame, [0, 180], [600, -100]);
  const shapeY2 = interpolate(frame, [0, 180], [800, -200]);
  const shapeY3 = interpolate(frame, [0, 180], [700, -150]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#fafafa", overflow: "hidden" }}>
      {/* Geometric shapes */}
      <div
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "2px solid rgba(78,205,196,0.2)",
          left: 200,
          top: shapeY1,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          borderLeft: "40px solid transparent",
          borderRight: "40px solid transparent",
          borderBottom: "70px solid rgba(78,205,196,0.12)",
          right: 300,
          top: shapeY2,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          border: "2px solid rgba(78,205,196,0.15)",
          transform: "rotate(45deg)",
          right: 500,
          top: shapeY3,
        }}
      />

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {/* Channel name */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "#1a1a1a",
            letterSpacing: 8,
            transform: `translateX(${nameX - 0}px)`,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          AI INJECTION
        </div>

        {/* Accent line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: "#4ecdc4",
            marginTop: 20,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: "#666",
            letterSpacing: 12,
            marginTop: 30,
            opacity: tagOpacity,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          Tech. AI. Innovation.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════════
// TEMPLATE 2 — PodcastGritty  (210 frames / 7s @ 30fps)
// ════════════════════════════════════════════════════════════════
export const PodcastGritty: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Host photo slide + scale
  const photoX = spring({ frame, fps, from: -600, to: 350, config: { damping: 14 } });
  const photoScale = spring({ frame, fps, from: 0.3, to: 1, config: { damping: 12 } });

  // Channel name glitch
  const nameOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glitchX = frame > 30 && frame < 50 && frame % 3 === 0 ? (Math.random() - 0.5) * 12 : 0;
  const glitchY = frame > 30 && frame < 50 && frame % 4 === 0 ? (Math.random() - 0.5) * 8 : 0;

  // Smoke particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const startFrame = i * 8;
    const elapsed = frame - startFrame;
    if (elapsed < 0 || elapsed > 80) return null;
    const x = 300 + (i * 73) % 1300;
    const y = interpolate(elapsed, [0, 80], [1080, -100]);
    const opacity = interpolate(elapsed, [0, 20, 60, 80], [0, 0.3, 0.3, 0]);
    const size = 4 + (i % 5) * 2;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "rgba(200,200,200,0.5)",
          left: x,
          top: y,
          opacity,
        }}
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a1a",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
        overflow: "hidden",
      }}
    >
      {particles}

      {/* Scattered collage photos */}
      {[INFLUENCER_1, INFLUENCER_2, AVATAR].map((src, i) => {
        const angles = [-12, 8, -5];
        const positions = [
          { left: 100, top: 200 },
          { left: 1400, top: 150 },
          { left: 1200, top: 550 },
        ];
        const colOpacity = interpolate(frame, [10 + i * 10, 30 + i * 10], [0, 0.35], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <Img
            key={i}
            src={src}
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              objectFit: "cover",
              borderRadius: 8,
              transform: `rotate(${angles[i]}deg)`,
              opacity: colOpacity,
              border: "3px solid rgba(204,0,0,0.4)",
              ...positions[i],
            }}
          />
        );
      })}

      {/* Main host photo */}
      <div
        style={{
          position: "absolute",
          left: photoX,
          top: 280,
          width: 400,
          height: 400,
          borderRadius: "50%",
          overflow: "hidden",
          transform: `scale(${photoScale})`,
          border: "5px solid #cc0000",
        }}
      >
        <Img
          src={INFLUENCER_1}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Channel name */}
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 350,
          fontSize: 100,
          fontWeight: 900,
          fontStyle: "italic",
          color: "#ffffff",
          opacity: nameOpacity,
          transform: `translate(${glitchX}px, ${glitchY}px)`,
          textShadow: "4px 4px 0 #cc0000",
          fontFamily: "Georgia, serif",
        }}
      >
        AI INJECTION
      </div>

      {/* Scribble SVG line */}
      <svg
        style={{ position: "absolute", right: 120, top: 470 }}
        width="600"
        height="30"
        viewBox="0 0 600 30"
      >
        <path
          d={`M0,15 Q50,${5 + (frame % 10)} 100,15 Q150,${25 - (frame % 8)} 200,15 Q250,${8 + (frame % 6)} 300,15 Q350,${22 - (frame % 7)} 400,15 Q450,${10 + (frame % 9)} 500,15 Q550,${20 - (frame % 5)} 600,15`}
          stroke="#cc0000"
          strokeWidth="3"
          fill="none"
          strokeDasharray="600"
          strokeDashoffset={interpolate(frame, [40, 90], [600, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      </svg>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════════
// TEMPLATE 3 — PlayfulCute  (180 frames / 6s @ 30fps)
// ════════════════════════════════════════════════════════════════
const EMOJIS = ["⭐", "💖", "🌸", "😊", "✨", "🌟", "💐", "🎀", "💫", "🦋"];

export const PlayfulCute: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Checkerboard rotation
  const bgRotation = interpolate(frame, [0, 180], [0, 8]);

  // Channel name spring bounce
  const nameScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 8, mass: 0.6, stiffness: 120 } });

  // Floating emojis
  const emojiElements = EMOJIS.map((emoji, i) => {
    const x = 100 + (i * 170) % 1700;
    const startY = 1100 + (i * 50) % 200;
    const y = interpolate(frame, [0, 180], [startY, -200 - (i * 40)]);
    const wobble = Math.sin(frame * 0.1 + i * 1.5) * 20;
    const emojiScale = spring({
      frame: Math.max(0, frame - i * 5),
      fps,
      from: 0,
      to: 1,
      config: { damping: 6, mass: 0.5 },
    });
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x + wobble,
          top: y,
          fontSize: 50 + (i % 3) * 15,
          transform: `scale(${emojiScale})`,
        }}
      >
        {emoji}
      </div>
    );
  });

  // Checkerboard pattern
  const checkerSize = 120;
  const cols = Math.ceil(2400 / checkerSize);
  const rows = Math.ceil(1600 / checkerSize);
  const checkers: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) {
        checkers.push(
          <div
            key={`${r}-${c}`}
            style={{
              position: "absolute",
              left: c * checkerSize - 200,
              top: r * checkerSize - 200,
              width: checkerSize,
              height: checkerSize,
              backgroundColor: "#b19cd9",
              opacity: 0.3,
            }}
          />,
        );
      }
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#f0e6ff", overflow: "hidden" }}>
      {/* Rotating checkerboard */}
      <div
        style={{
          position: "absolute",
          width: 2400,
          height: 1600,
          left: -240,
          top: -260,
          transform: `rotate(${bgRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        {checkers}
      </div>

      {emojiElements}

      {/* Channel name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: "#d63384",
            transform: `scale(${nameScale})`,
            textShadow:
              "4px 4px 0 #ff69b4, 8px 8px 0 rgba(177,156,217,0.5), 12px 12px 0 rgba(255,215,0,0.3)",
            fontFamily: "Arial Black, Arial, sans-serif",
            letterSpacing: 4,
          }}
        >
          AI INJECTION
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#b19cd9",
            marginTop: 20,
            fontWeight: 700,
            opacity: interpolate(frame, [50, 80], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontFamily: "Arial, sans-serif",
          }}
        >
          Subscribe & Join the Fun!
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════════
// TEMPLATE 4 — DarkCinematic  (210 frames / 7s @ 30fps)
// ════════════════════════════════════════════════════════════════
export const DarkCinematic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CHANNEL = "AI INJECTION";

  // Letter-by-letter reveal
  const lettersShown = Math.floor(
    interpolate(frame, [30, 100], [0, CHANNEL.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const revealedText = CHANNEL.slice(0, lettersShown);

  // Lens flare
  const flareX = interpolate(frame, [0, 210], [-200, 2100]);
  const flareOpacity = interpolate(frame, [0, 60, 150, 210], [0, 0.8, 0.8, 0]);

  // Gold lines
  const lineWidth = interpolate(frame, [80, 130], [0, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const tagOpacity = interpolate(frame, [140, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particle dust
  const dustParticles = Array.from({ length: 40 }, (_, i) => {
    const x = (i * 53 + 17) % 1920;
    const baseY = (i * 37 + 11) % 1080;
    const drift = Math.sin(frame * 0.03 + i) * 30;
    const yDrift = Math.cos(frame * 0.02 + i * 0.7) * 20;
    const opacity = 0.15 + Math.sin(frame * 0.05 + i * 2) * 0.1;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x + drift,
          top: baseY + yDrift,
          width: 2 + (i % 3),
          height: 2 + (i % 3),
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.6)",
          opacity,
        }}
      />
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {dustParticles}

      {/* Lens flare */}
      <div
        style={{
          position: "absolute",
          left: flareX,
          top: 440,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,255,255,0.4) 30%, transparent 70%)",
          opacity: flareOpacity,
          filter: "blur(20px)",
        }}
      />

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {/* Top gold line */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
            marginBottom: 30,
          }}
        />

        {/* Channel name - metallic */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            background: "linear-gradient(180deg, #e0e0e0 0%, #ffffff 50%, #b0b0b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 10,
            fontFamily: "Arial, Helvetica, sans-serif",
            minHeight: 140,
          }}
        >
          {revealedText}
        </div>

        {/* Bottom gold line */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
            marginTop: 30,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: "#aaaaaa",
            letterSpacing: 8,
            marginTop: 40,
            opacity: tagOpacity,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          SUBSCRIBE FOR MORE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════════
// TEMPLATE 5 — NeonGaming  (180 frames / 6s @ 30fps)
// ════════════════════════════════════════════════════════════════
export const NeonGaming: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Neon pulse
  const glowIntensity = 20 + Math.sin(frame * 0.15) * 10;

  // Name spring
  const nameScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 10, mass: 0.7 } });

  // Grid animation
  const gridOffset = (frame * 3) % 100;

  // Controller bounce
  const controllerY = spring({
    frame: Math.max(0, frame - 40),
    fps,
    from: 300,
    to: 0,
    config: { damping: 8, mass: 0.6 },
  });

  // Electric pulse lines
  const pulseLines = Array.from({ length: 5 }, (_, i) => {
    const startFrame = 20 + i * 20;
    const elapsed = frame - startFrame;
    if (elapsed < 0 || elapsed > 30) return null;
    const x = interpolate(elapsed, [0, 30], [-200, 2100]);
    const y = 200 + i * 160;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 200,
          height: 2,
          background: "linear-gradient(90deg, transparent, #00ffff, transparent)",
          opacity: interpolate(elapsed, [0, 10, 20, 30], [0, 1, 1, 0]),
          filter: "blur(1px)",
        }}
      />
    );
  });

  // RGB edge shift
  const rgbPhase = frame * 2;

  // Tagline
  const tagOpacity = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0014", overflow: "hidden" }}>
      {/* RGB edge glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 4px 0 20px rgba(255,0,0,${0.3 + Math.sin(rgbPhase * 0.05) * 0.2}), inset -4px 0 20px rgba(0,0,255,${0.3 + Math.cos(rgbPhase * 0.05) * 0.2}), inset 0 4px 20px rgba(0,255,0,${0.3 + Math.sin(rgbPhase * 0.07) * 0.2})`,
        }}
      />

      {/* Tron grid floor */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 500,
          perspective: 600,
          perspectiveOrigin: "50% 0%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: "rotateX(60deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
            backgroundPosition: `0 ${gridOffset}px`,
          }}
        />
      </div>

      {pulseLines}

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          position: "relative",
        }}
      >
        {/* Controller SVG */}
        <svg
          width="100"
          height="70"
          viewBox="0 0 100 70"
          style={{
            transform: `translateY(${controllerY}px)`,
            marginBottom: 30,
            filter: `drop-shadow(0 0 8px #00ffff)`,
          }}
        >
          <rect x="10" y="15" width="80" height="40" rx="20" fill="none" stroke="#00ffff" strokeWidth="2" />
          <circle cx="35" cy="35" r="6" fill="none" stroke="#00ffff" strokeWidth="1.5" />
          <circle cx="65" cy="35" r="3" fill="#00ffff" />
          <circle cx="75" cy="28" r="3" fill="#00ffff" />
          <rect x="42" y="10" width="16" height="8" rx="3" fill="none" stroke="#00ffff" strokeWidth="1.5" />
        </svg>

        {/* Channel name - neon glow */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: "#00ffff",
            transform: `scale(${nameScale})`,
            textShadow: `0 0 ${glowIntensity}px #00ffff, 0 0 ${glowIntensity * 2}px rgba(0,255,255,0.5), 0 0 ${glowIntensity * 3}px rgba(0,255,255,0.2)`,
            fontFamily: "Arial Black, Arial, sans-serif",
            letterSpacing: 6,
          }}
        >
          AI INJECTION
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 34,
            color: "#00ffff",
            letterSpacing: 10,
            marginTop: 30,
            opacity: tagOpacity,
            textShadow: `0 0 10px #00ffff`,
            fontFamily: "Arial, sans-serif",
          }}
        >
          LEVEL UP YOUR CONTENT
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════════════════
// SHOWCASE — ShowcaseIntros  (900 frames / 30s @ 30fps)
// ════════════════════════════════════════════════════════════════

const INTROS: { Component: React.FC; label: string; duration: number }[] = [
  { Component: CleanModern, label: "#1 — Clean Modern", duration: 150 },
  { Component: PodcastGritty, label: "#2 — Podcast Gritty", duration: 150 },
  { Component: PlayfulCute, label: "#3 — Playful Cute", duration: 150 },
  { Component: DarkCinematic, label: "#4 — Dark Cinematic", duration: 150 },
  { Component: NeonGaming, label: "#5 — Neon Gaming", duration: 150 },
];

export const ShowcaseIntros: React.FC = () => {
  const frame = useCurrentFrame();

  // Layout:
  // 0-59:   Opening title (60 frames)
  // 60-809: 5 intros x 150 frames each = 750 frames
  // 810-899: Closing CTA (90 frames)

  const openingEnd = 60;
  const closingStart = 810;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Opening title */}
      <Sequence from={0} durationInFrames={openingEnd}>
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: 6,
              opacity: interpolate(frame, [0, 20, 45, 60], [0, 1, 1, 0]),
              fontFamily: "Arial Black, Arial, sans-serif",
            }}
          >
            YOUTUBE INTRO TEMPLATES
          </div>
        </AbsoluteFill>
        <Audio src={POP_SFX} volume={0.6} />
      </Sequence>

      {/* Each intro */}
      {INTROS.map(({ Component, label, duration }, i) => {
        const startFrame = openingEnd + i * duration;
        return (
          <Sequence key={i} from={startFrame} durationInFrames={duration}>
            {/* The intro itself */}
            <Component />

            {/* Style label badge */}
            <div
              style={{
                position: "absolute",
                top: 30,
                right: 40,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
                padding: "10px 24px",
                borderRadius: 8,
                fontFamily: "Arial, sans-serif",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {label}
            </div>

            {/* Pop sound at each transition */}
            <Audio src={POP_SFX} volume={0.5} />
          </Sequence>
        );
      })}

      {/* Closing CTA */}
      <Sequence from={closingStart} durationInFrames={90}>
        <ClosingCTA />
      </Sequence>
    </AbsoluteFill>
  );
};

const ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 10 } });
  const opacity = interpolate(frame, [0, 15, 70, 90], [0, 1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#FFD700",
          transform: `scale(${scale})`,
          opacity,
          textAlign: "center",
          lineHeight: 1.3,
          fontFamily: "Arial Black, Arial, sans-serif",
        }}
      >
        CUSTOM INTROS
        <br />
        ORDER NOW
      </div>
      <Audio src={BELL_SFX} volume={0.6} />
    </AbsoluteFill>
  );
};
