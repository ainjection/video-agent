import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  OffthreadVideo,
  Sequence,
} from "remotion";

const CLIPS = [
  staticFile("2103491a-3415-4840-8f0f-9373ed74a3e2.mp4"),
  staticFile("6533ba84-9175-44dd-a10b-dc4b1631e49e.mp4"),
  staticFile("7eb6826b-591a-4d6b-b123-5c61ba201895.mp4"),
  staticFile("839bb8a6-a3f2-4f60-8f89-62eab37f91a0.mp4"),
  staticFile("a24598e3-9fb0-481a-972b-511f103d80f7.mp4"),
  staticFile("bed6578a-2135-4d19-bf2b-5dea6cc6ea28.mp4"),
  staticFile("f962e240-ab00-4956-9a5f-2f3e43ca5572.mp4"),
  staticFile("hf_20260117_141307_690534ee-7b0c-4a2a-88e1-f48c11fce3d0.mp4"),
  staticFile("hf_20260117_144150_7bf8abf7-1c95-43a7-a33e-2b905f3f82b5.mp4"),
];

const AVATAR = staticFile("avatar.jpg");
const BG = staticFile("images/hollywood-hills.jpg");
const GOLD = "#FFD700";
const GOLD_GLOW = "rgba(255,215,0,0.6)";

// Card landing positions and final rotations (pre-defined for consistent layout)
const CARD_LAYOUTS = [
  { x: 120,  y: 80,  rot: -8,  entrance: "spinTop" },
  { x: 700,  y: 50,  rot: 5,   entrance: "flipLeft" },
  { x: 1300, y: 90,  rot: -3,  entrance: "rollBottom" },
  { x: 80,   y: 480, rot: 6,   entrance: "tumbleCorner" },
  { x: 500,  y: 400, rot: -4,  entrance: "zoomCenter" },
  { x: 950,  y: 450, rot: 7,   entrance: "spinTop" },
  { x: 1400, y: 420, rot: -6,  entrance: "flipLeft" },
  { x: 300,  y: 280, rot: 3,   entrance: "tumbleCorner" },
  { x: 1100, y: 260, rot: -5,  entrance: "rollBottom" },
];

const CARD_W = 280;
const CARD_H = 380;
const ENTRANCE_INTERVAL = 20; // frames between each card entrance

// Film card with sprocket holes
const FilmCard = ({ children, glow }: { children: React.ReactNode; glow: number }) => (
  <div style={{
    width: CARD_W, height: CARD_H,
    background: "#1a1a1a", borderRadius: 8, position: "relative",
    boxShadow: glow > 0.3
      ? `0 0 ${40 * glow}px ${GOLD_GLOW}, 0 0 ${80 * glow}px rgba(255,215,0,${0.2 * glow}), 0 8px 30px rgba(0,0,0,0.6)`
      : "0 8px 30px rgba(0,0,0,0.6)",
    border: glow > 0.3 ? `2px solid rgba(255,215,0,${0.5 * glow})` : "1px solid #444",
  }}>
    {/* Sprockets left */}
    <div style={{ position: "absolute", left: 3, top: 6, bottom: 6, width: 16, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ width: 10, height: 7, borderRadius: 2, background: glow > 0.3 ? `rgba(255,215,0,${0.3 + glow * 0.3})` : "#333", border: "1px solid #555" }} />
      ))}
    </div>
    {/* Sprockets right */}
    <div style={{ position: "absolute", right: 3, top: 6, bottom: 6, width: 16, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ width: 10, height: 7, borderRadius: 2, background: glow > 0.3 ? `rgba(255,215,0,${0.3 + glow * 0.3})` : "#333", border: "1px solid #555" }} />
      ))}
    </div>
    {/* Video area */}
    <div style={{ position: "absolute", left: 22, right: 22, top: 6, bottom: 6, borderRadius: 4, overflow: "hidden", background: "#000" }}>
      {children}
    </div>
    {/* Glow overlay */}
    {glow > 0.2 && (
      <div style={{
        position: "absolute", left: 22, right: 22, top: 6, bottom: 6, borderRadius: 4, pointerEvents: "none",
        boxShadow: `inset 0 0 ${25 * glow}px rgba(255,215,0,${0.15 * glow})`,
        border: `1px solid rgba(255,215,0,${0.4 * glow})`,
      }} />
    )}
  </div>
);

// Get entrance animation transform
const getEntrance = (type: string, progress: number): string => {
  const inv = 1 - progress;
  switch (type) {
    case "spinTop":
      return `translateY(${inv * -800}px) rotate(${inv * 720}deg) scale(${0.3 + progress * 0.7})`;
    case "flipLeft":
      return `translateX(${inv * -1200}px) perspective(800px) rotateY(${inv * 360}deg) scale(${0.4 + progress * 0.6})`;
    case "rollBottom":
      return `translateY(${inv * 900}px) rotate(${inv * -540}deg) scale(${0.3 + progress * 0.7})`;
    case "tumbleCorner":
      return `translate(${inv * 1000}px, ${inv * -600}px) rotate(${inv * 450}deg) scale(${0.2 + progress * 0.8})`;
    case "zoomCenter":
      return `scale(${inv * 4 + progress}) rotate(${inv * -180}deg)`;
    default:
      return `translateY(${inv * -600}px) rotate(${inv * 360}deg)`;
  }
};

export const FilmStripV3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Which card is currently the "latest" (most recently arrived)
  const latestCard = Math.min(Math.floor(frame / ENTRANCE_INTERVAL), CLIPS.length - 1);

  // Fade out at end
  const fadeOut = interpolate(frame, [350, 390], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Pop sound for each card entrance */}
      {CLIPS.map((_, i) => (
        <Sequence key={`snd${i}`} from={i * ENTRANCE_INTERVAL} durationInFrames={10}>
          <Audio src={staticFile("pop.mp3")} volume={0.5 + i * 0.03} />
        </Sequence>
      ))}

      {/* Hollywood hills background */}
      <Img src={BG} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        filter: "brightness(0.35) saturate(1.2)",
        transform: `scale(${1.05 + Math.sin(frame * 0.005) * 0.02})`,
      }} />

      {/* Warm overlay */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(255,200,80,0.06) 0%, transparent 60%)" }} />

      {/* CARDS */}
      <div style={{ opacity: fadeOut }}>
        {CLIPS.map((clip, i) => {
          const entranceStart = i * ENTRANCE_INTERVAL;
          const layout = CARD_LAYOUTS[i];
          const progress = spring({
            frame: Math.max(0, frame - entranceStart),
            fps,
            config: { stiffness: 60, damping: 11 },
          });

          // Glow: brightest on latest card, fades on older cards
          const isLatest = i === latestCard && frame >= entranceStart;
          const timeSinceLanding = frame - entranceStart - 15;
          const glow = isLatest
            ? interpolate(timeSinceLanding, [0, 10, 40], [0, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : i === latestCard - 1
            ? 0.2
            : 0;

          // Don't render until entrance starts
          if (frame < entranceStart) return null;

          const entranceTransform = getEntrance(layout.entrance, progress);

          // After landing, settle into final position with slight float
          const floatY = progress >= 0.95 ? Math.sin((frame - entranceStart) * 0.05 + i) * 3 : 0;

          return (
            <div key={i} style={{
              position: "absolute",
              left: layout.x,
              top: layout.y + floatY,
              transform: `${entranceTransform} rotate(${layout.rot * progress}deg)`,
              zIndex: 10 + i, // later cards on top
            }}>
              <FilmCard glow={glow}>
                <OffthreadVideo
                  src={clip}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: `brightness(${0.7 + glow * 0.4})`,
                  }}
                  startFrom={i * 15}
                />
              </FilmCard>
            </div>
          );
        })}
      </div>

      {/* Golden sparkles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const speed = 0.3 + (i % 5) * 0.2;
        const px = ((frame * speed + i * 100) % 2100) - 100;
        const py = ((i * 83 + frame * (0.2 + i * 0.03)) % 1200) - 50;
        const size = 1 + (i % 3);
        const twinkle = 0.1 + Math.sin(frame * 0.12 + i * 2) * 0.2;
        return (
          <div key={i} style={{
            position: "absolute", left: px, top: py,
            width: size, height: size, borderRadius: "50%",
            background: `rgba(255,215,100,${twinkle})`,
            boxShadow: `0 0 ${size * 3}px rgba(255,200,80,${twinkle * 0.5})`,
            zIndex: 50,
          }} />
        );
      })}

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 55,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
      }} />

      {/* Subscribe overlay at end */}
      <Sequence from={300} durationInFrames={100}>
        <div style={{
          position: "absolute", bottom: 35, left: "50%",
          transform: `translateX(-50%) translateY(${interpolate(
            spring({ frame: frame - 300, fps, config: { stiffness: 80, damping: 14 } }),
            [0, 1], [120, 0]
          )}px) scale(1.5)`,
          display: "flex", alignItems: "center", gap: 0, zIndex: 60,
        }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", border: `3px solid ${GOLD}`, boxShadow: `0 0 20px ${GOLD_GLOW}`, zIndex: 2 }}>
            <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(20,20,20,0.95)", borderRadius: "0 36px 36px 0",
            padding: "10px 22px 10px 46px", marginLeft: -32, zIndex: 1,
            transform: `scaleX(${spring({ frame: frame - 305, fps, config: { stiffness: 100, damping: 14 } })})`,
            transformOrigin: "left",
            border: `1px solid rgba(255,215,0,0.3)`,
          }}>
            <div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>AI Injection</div>
              <div style={{ color: "#aaa", fontSize: 13 }}>1.79K subscribers</div>
            </div>
            <div style={{
              padding: "8px 18px", borderRadius: 22, fontWeight: 700, fontSize: 15,
              background: frame >= 340 ? "rgba(255,215,0,0.15)" : GOLD,
              color: frame >= 340 ? GOLD : "#0f0f0f",
              border: frame >= 340 ? `1px solid ${GOLD}` : "none",
            }}>
              {frame >= 340 ? "Subscribed" : "Subscribe"}
            </div>
            <div style={{
              transform: `rotate(${frame >= 355 ? Math.sin((frame - 355) * 1) * interpolate(frame - 355, [0, 25], [15, 0], { extrapolateRight: "clamp" }) : 0}deg)`,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill={frame >= 355 ? GOLD : "white"} style={{
                filter: frame >= 355 ? `drop-shadow(0 0 8px ${GOLD_GLOW})` : "none",
              }}>
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        <Sequence from={40} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
        <Sequence from={55} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
        <Sequence from={57} durationInFrames={30}><Audio src={staticFile("bell.mp3")} volume={1} /></Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
