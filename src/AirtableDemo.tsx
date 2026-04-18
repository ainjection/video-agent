import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
  Sequence,
  OffthreadVideo,
  Img,
  Audio,
} from "remotion";

// ─── HELPERS ───────────────────────────────────────────────────────

const GREEN = "#00ff66";
const BG = "#0a0f0a";

const StepLabel: React.FC<{ text: string; frame: number; delay: number }> = ({
  text,
  frame,
  delay,
}) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { stiffness: 200, damping: 18 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: GREEN,
        color: BG,
        fontWeight: 900,
        fontSize: 28,
        padding: "8px 24px",
        borderRadius: 999,
        transform: `translateX(${interpolate(enter, [0, 1], [-400, 0])}px)`,
        opacity: enter,
        zIndex: 10,
      }}
    >
      {text}
    </div>
  );
};

const Callout: React.FC<{
  text: string;
  frame: number;
  delay: number;
  top?: number;
  left?: number;
}> = ({ text, frame, delay, top = 200, left = 1400 }) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { stiffness: 220, damping: 16 } });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        background: "rgba(10,15,10,0.92)",
        borderLeft: `4px solid ${GREEN}`,
        color: "#fff",
        fontWeight: 700,
        fontSize: 26,
        padding: "12px 20px",
        borderRadius: 8,
        transform: `translateX(${interpolate(enter, [0, 1], [300, 0])}px)`,
        opacity: enter,
        zIndex: 10,
        maxWidth: 420,
      }}
    >
      {text}
    </div>
  );
};

const PulsingArrow: React.FC<{ frame: number; top: number; left: number }> = ({
  frame,
  top,
  left,
}) => {
  const pulse = Math.sin(frame * 0.3) * 8;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: left + pulse,
        color: GREEN,
        fontSize: 60,
        fontWeight: 900,
        zIndex: 10,
        textShadow: `0 0 20px ${GREEN}`,
      }}
    >
      ›››
    </div>
  );
};

// ─── INTRO ─────────────────────────────────────────────────────────

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { stiffness: 180, damping: 14 } });
  const subtitleSpring = spring({
    frame: frame - 15,
    fps,
    config: { stiffness: 160, damping: 16 },
  });

  const tags = ["Free Tool", "Open Source", "Bulk Download"];

  return (
    <AbsoluteFill
      style={{
        background: BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${GREEN}11 1px, transparent 1px), linear-gradient(90deg, ${GREEN}11 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div style={{ transform: `scale(${titleSpring})`, textAlign: "center", zIndex: 1 }}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: GREEN,
            letterSpacing: 4,
            textShadow: `0 0 40px ${GREEN}88`,
          }}
        >
          AIRTABLE DOWNLOADER
        </div>
        <div
          style={{
            display: "inline-block",
            background: GREEN,
            color: BG,
            fontSize: 20,
            fontWeight: 800,
            padding: "4px 14px",
            borderRadius: 6,
            marginTop: 8,
          }}
        >
          v1.0
        </div>
      </div>

      <div
        style={{
          marginTop: 30,
          fontSize: 32,
          color: "#ccc",
          fontWeight: 500,
          opacity: subtitleSpring,
          transform: `translateY(${interpolate(subtitleSpring, [0, 1], [30, 0])}px)`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        Download your entire Airtable base with all images and prompts
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 40, zIndex: 1 }}>
        {tags.map((tag, i) => {
          const s = spring({
            frame: frame - 30 - i * 8,
            fps,
            config: { stiffness: 200, damping: 12 },
          });
          return (
            <div
              key={tag}
              style={{
                background: `${GREEN}22`,
                border: `2px solid ${GREEN}`,
                color: GREEN,
                fontWeight: 700,
                fontSize: 22,
                padding: "8px 22px",
                borderRadius: 999,
                transform: `scale(${s})`,
              }}
            >
              {tag}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── GLITCH TRANSITION ─────────────────────────────────────────────

const GlitchTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = frame / 15;
  const scanY = progress * 1080;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {[0, 1, 2].map((i) => {
        const offset = Math.sin(frame * 3 + i * 2) * 80;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * 360,
              left: offset,
              width: 1920,
              height: 360,
              background: `${GREEN}08`,
            }}
          />
        );
      })}
      {/* Scanline */}
      <div
        style={{
          position: "absolute",
          top: scanY,
          left: 0,
          width: 1920,
          height: 3,
          background: GREEN,
          boxShadow: `0 0 30px ${GREEN}`,
        }}
      />
      {/* Flash */}
      {frame < 3 && (
        <AbsoluteFill style={{ background: `${GREEN}33` }} />
      )}
    </AbsoluteFill>
  );
};

// ─── ZOOM WARP TRANSITION ──────────────────────────────────────────

const ZoomWarpTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 8, 15], [1, 3, 1], {
    extrapolateRight: "clamp",
  });
  const ripple = Math.sin(frame * 0.8) * 20;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 200 + ripple,
          height: 200 + ripple,
          borderRadius: "50%",
          border: `3px solid ${GREEN}`,
          transform: `scale(${scale})`,
          boxShadow: `0 0 60px ${GREEN}66`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── DATA STREAM TRANSITION ────────────────────────────────────────

const DataStreamTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = "01アイウエオカキクケコ∞§†‡";
  const columns = 40;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden", fontFamily: "monospace" }}>
      {Array.from({ length: columns }).map((_, i) => {
        const speed = 1.5 + (i % 5) * 0.5;
        const yOffset = ((frame * speed * 30 + i * 97) % 1400) - 200;
        const char = chars[(frame + i * 3) % chars.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * (1920 / columns),
              top: yOffset,
              color: GREEN,
              fontSize: 24,
              opacity: 0.6 + Math.sin(i) * 0.3,
              textShadow: `0 0 8px ${GREEN}`,
            }}
          >
            {char}
          </div>
        );
      })}
      {/* Burst */}
      {frame < 5 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle, ${GREEN}44 0%, transparent 70%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ─── RESULTS CARD ──────────────────────────────────────────────────

const ResultsCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { label: "Records", value: "86" },
    { label: "Attachments", value: "153" },
    { label: "Total Size", value: "0 MB" },
  ];

  const checkSpring = spring({
    frame: frame - 60,
    fps,
    config: { stiffness: 160, damping: 14 },
  });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* Grid bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${GREEN}0a 1px, transparent 1px), linear-gradient(90deg, ${GREEN}0a 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div style={{ display: "flex", gap: 60, zIndex: 1 }}>
        {stats.map((s, i) => {
          const cardSpring = spring({
            frame: frame - i * 12,
            fps,
            config: { stiffness: 200, damping: 14 },
          });
          return (
            <div
              key={s.label}
              style={{
                textAlign: "center",
                transform: `scale(${cardSpring}) translateY(${interpolate(cardSpring, [0, 1], [60, 0])}px)`,
                opacity: cardSpring,
              }}
            >
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 900,
                  color: GREEN,
                  textShadow: `0 0 40px ${GREEN}66`,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: "#aaa",
                  fontWeight: 600,
                  marginTop: 10,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 180,
          fontSize: 52,
          fontWeight: 900,
          color: GREEN,
          transform: `scale(${checkSpring})`,
          opacity: checkSpring,
          zIndex: 1,
        }}
      >
        ✓ Download Complete!
      </div>
    </AbsoluteFill>
  );
};

// ─── OUTRO ─────────────────────────────────────────────────────────

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const getIt = spring({ frame, fps, config: { stiffness: 180, damping: 14 } });
  const subCard = spring({ frame: frame - 30, fps, config: { stiffness: 160, damping: 16 } });
  const bellBounce = spring({
    frame: frame - 80,
    fps,
    config: { stiffness: 300, damping: 8 },
  });
  const fadeOut = interpolate(frame, [240, 270], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          fontSize: 100,
          fontWeight: 900,
          color: GREEN,
          transform: `scale(${getIt})`,
          textShadow: `0 0 60px ${GREEN}88`,
        }}
      >
        GET IT NOW
      </div>

      <div
        style={{
          fontSize: 32,
          color: "#aaa",
          marginTop: 16,
          opacity: interpolate(subCard, [0, 1], [0, 1]),
        }}
      >
        Available on Skool & Gumroad
      </div>

      {/* Subscribe card */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: "rgba(10,15,10,0.95)",
          border: `2px solid ${GREEN}44`,
          borderRadius: 16,
          padding: "16px 32px",
          transform: `translateY(${interpolate(subCard, [0, 1], [100, 0])}px)`,
          opacity: subCard,
        }}
      >
        <Img
          src={staticFile("avatar.jpg")}
          style={{ width: 64, height: 64, borderRadius: "50%" }}
        />
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 24 }}>AI Injection</div>
          <div style={{ color: GREEN, fontSize: 18 }}>Subscribe for more tools</div>
        </div>
        <div
          style={{
            background: "#ff0000",
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            padding: "8px 20px",
            borderRadius: 6,
            marginLeft: 20,
          }}
        >
          SUBSCRIBE
        </div>
        <div
          style={{
            fontSize: 32,
            transform: `scale(${bellBounce}) rotate(${Math.sin(frame * 0.4) * 15}deg)`,
          }}
        >
          🔔
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 180,
          color: "#888",
          fontSize: 22,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Like & Subscribe
      </div>
    </AbsoluteFill>
  );
};

// ─── PROGRESS BAR ──────────────────────────────────────────────────

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 1920,
      height: 6,
      background: `${GREEN}22`,
      zIndex: 10,
    }}
  >
    <div
      style={{
        width: `${progress * 100}%`,
        height: "100%",
        background: GREEN,
        boxShadow: `0 0 16px ${GREEN}`,
      }}
    />
  </div>
);

// ─── ANIMATED COUNTER ──────────────────────────────────────────────

const AnimatedCounter: React.FC<{
  label: string;
  target: number;
  frame: number;
  delay: number;
  top: number;
}> = ({ label, target, frame, delay, top }) => {
  const progress = interpolate(frame - delay, [0, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const value = Math.round(target * progress);
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { stiffness: 200, damping: 16 } });

  return (
    <div
      style={{
        position: "absolute",
        top,
        right: 30,
        background: "rgba(10,15,10,0.9)",
        borderLeft: `4px solid ${GREEN}`,
        padding: "8px 18px",
        borderRadius: 8,
        color: "#fff",
        fontWeight: 700,
        fontSize: 22,
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [200, 0])}px)`,
        zIndex: 10,
        fontFamily: "monospace",
      }}
    >
      {label}: <span style={{ color: GREEN }}>{value}</span>
    </div>
  );
};

// ─── MAIN COMPOSITION ──────────────────────────────────────────────

export const AirtableDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "sans-serif" }}>
      {/* Voiceover */}
      <Audio src={staticFile("vo-demo.mp3")} volume={1} />

      {/* ── INTRO (0-90) ── */}
      <Sequence from={0} durationInFrames={90}>
        <Intro />
        <Audio src={staticFile("pop.mp3")} startFrom={0} volume={0.6} />
      </Sequence>

      {/* ── SECTION 1: App Overview (90-390) ── */}
      <Sequence from={90} durationInFrames={300}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("screen-recording.mp4")}
            startFrom={50 * 30}
            playbackRate={4}
            style={{ width: 1920, height: 1080 }}
          />
          <StepLabel text="STEP 1: Connect to Airtable" frame={frame - 90} delay={0} />
          {frame >= 150 && <PulsingArrow frame={frame} top={500} left={900} />}
          <Callout text="Found 82 Bases!" frame={frame - 90} delay={110} top={300} left={1380} />
        </AbsoluteFill>
        <Audio src={staticFile("click.mp3")} startFrom={0} volume={0.5} />
      </Sequence>

      {/* ── CROSSFADE: Section 1 fades out ── */}
      <Sequence from={375} durationInFrames={30}>
        <AbsoluteFill style={{
          background: BG,
          opacity: interpolate(frame - 375, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }} />
      </Sequence>

      {/* ── GLITCH TRANSITION (390-410) ── */}
      <Sequence from={390} durationInFrames={20}>
        <GlitchTransition />
        <Audio src={staticFile("pop.mp3")} volume={0.6} />
      </Sequence>

      {/* ── SECTION 2: Select & Download (405-705) ── */}
      <Sequence from={405} durationInFrames={300}>
        <AbsoluteFill>
          {/* Fade in from black */}
          <div style={{
            position: "absolute", inset: 0, background: BG, zIndex: 50, pointerEvents: "none",
            opacity: interpolate(frame - 405, [0, 15], [1, 0], { extrapolateRight: "clamp" }),
          }} />
          <OffthreadVideo
            src={staticFile("screen-recording.mp4")}
            startFrom={90 * 30}
            playbackRate={4}
            style={{ width: 1920, height: 1080 }}
          />
          <StepLabel text="STEP 2: Select Base & Table" frame={frame - 405} delay={0} />
          <Callout
            text="Mega Prompts Database"
            frame={frame - 405}
            delay={40}
            top={260}
            left={1380}
          />
          <Callout
            text="AI Influencers"
            frame={frame - 405}
            delay={90}
            top={340}
            left={1380}
          />
          <Callout
            text="D:\airtable folder"
            frame={frame - 405}
            delay={150}
            top={420}
            left={1380}
          />
        </AbsoluteFill>
        <Audio src={staticFile("click.mp3")} startFrom={0} volume={0.5} />
      </Sequence>

      {/* ── ZOOM WARP TRANSITION (705-720) ── */}
      <Sequence from={705} durationInFrames={15}>
        <ZoomWarpTransition />
      </Sequence>

      {/* ── SECTION 3: Downloading (720-960) ── */}
      <Sequence from={720} durationInFrames={240}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("screen-recording.mp4")}
            startFrom={130 * 30}
            playbackRate={5}
            style={{ width: 1920, height: 1080 }}
          />
          <StepLabel text="STEP 3: Downloading..." frame={frame - 720} delay={0} />
          <AnimatedCounter
            label="Records"
            target={86}
            frame={frame - 720}
            delay={20}
            top={100}
          />
          <AnimatedCounter
            label="Attachments"
            target={153}
            frame={frame - 720}
            delay={40}
            top={160}
          />
          {/* Spinner text */}
          {frame >= 780 && (
            <div
              style={{
                position: "absolute",
                top: 220,
                right: 30,
                background: "rgba(10,15,10,0.9)",
                borderLeft: `4px solid ${GREEN}`,
                padding: "8px 18px",
                borderRadius: 8,
                color: "#fff",
                fontWeight: 700,
                fontSize: 22,
                zIndex: 10,
                fontFamily: "monospace",
              }}
            >
              Images:{" "}
              <span style={{ color: GREEN }}>
                downloading{".".repeat(((frame - 780) % 12 < 4 ? 1 : (frame - 780) % 12 < 8 ? 2 : 3))}
              </span>
            </div>
          )}
          <ProgressBar
            progress={interpolate(frame - 720, [0, 480], [0, 1], {
              extrapolateRight: "clamp",
            })}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ── DATA STREAM TRANSITION (960-990) ── */}
      <Sequence from={960} durationInFrames={30}>
        <DataStreamTransition />
      </Sequence>

      {/* ── RESULTS CARD (990-1200) ── */}
      <Sequence from={990} durationInFrames={210}>
        <ResultsCard />
        <Audio src={staticFile("bell.mp3")} startFrom={0} volume={0.6} />
      </Sequence>

      {/* ── OUTRO (1200-1440) ── */}
      <Sequence from={1200} durationInFrames={240}>
        <Outro />
        <Audio src={staticFile("pop.mp3")} startFrom={0} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
