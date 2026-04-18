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

const FRAME_W = 300;
const FRAME_H = 420;
const FRAME_GAP = 14;
const CENTER_X = 1920 / 2;

// Film frame with sprocket holes
const FilmFrame = ({ children, glowIntensity }: { children: React.ReactNode; glowIntensity: number }) => {
  const sprocketCount = 12;
  return (
    <div style={{
      width: FRAME_W, height: FRAME_H,
      background: "#1a1a1a", borderRadius: 6, position: "relative", flexShrink: 0,
      boxShadow: glowIntensity > 0.1
        ? `0 0 ${30 * glowIntensity}px ${GOLD_GLOW}, 0 0 ${60 * glowIntensity}px rgba(255,215,0,${0.3 * glowIntensity}), 0 4px 20px rgba(0,0,0,0.5)`
        : "0 4px 20px rgba(0,0,0,0.5)",
      border: glowIntensity > 0.1 ? `2px solid rgba(255,215,0,${0.4 * glowIntensity})` : "1px solid #333",
      transition: "box-shadow 0.1s, border 0.1s",
    }}>
      {/* Left sprockets */}
      <div style={{ position: "absolute", left: 3, top: 8, bottom: 8, width: 18, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
        {Array.from({ length: sprocketCount }).map((_, i) => (
          <div key={`l${i}`} style={{ width: 12, height: 8, borderRadius: 2, background: glowIntensity > 0.3 ? `rgba(255,215,0,${0.2 + glowIntensity * 0.3})` : "#333", border: "1px solid #555" }} />
        ))}
      </div>
      {/* Right sprockets */}
      <div style={{ position: "absolute", right: 3, top: 8, bottom: 8, width: 18, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }}>
        {Array.from({ length: sprocketCount }).map((_, i) => (
          <div key={`r${i}`} style={{ width: 12, height: 8, borderRadius: 2, background: glowIntensity > 0.3 ? `rgba(255,215,0,${0.2 + glowIntensity * 0.3})` : "#333", border: "1px solid #555" }} />
        ))}
      </div>
      {/* Video area */}
      <div style={{ position: "absolute", left: 24, right: 24, top: 8, bottom: 8, borderRadius: 4, overflow: "hidden", background: "#000" }}>
        {children}
      </div>
      {/* Gold glow overlay on the video */}
      {glowIntensity > 0.1 && (
        <div style={{
          position: "absolute", left: 24, right: 24, top: 8, bottom: 8, borderRadius: 4,
          border: `1px solid rgba(255,215,0,${0.5 * glowIntensity})`,
          boxShadow: `inset 0 0 ${20 * glowIntensity}px rgba(255,215,0,${0.15 * glowIntensity})`,
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
};

export const FilmStripV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const TOTAL_W = CLIPS.length * (FRAME_W + FRAME_GAP);

  // Scroll from right to left
  const scrollX = interpolate(frame, [20, 330], [500, -TOTAL_W + 800], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Subtle wave on the strip
  const stripY = 330 + Math.sin(frame * 0.025) * 12;
  const stripRotate = interpolate(frame, [0, 360], [1.5, -1.5], { extrapolateRight: "clamp" });

  // Fade out
  const fadeOut = interpolate(frame, [330, 360], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Sound */}
      <Sequence from={0} durationInFrames={10}>
        <Audio src={staticFile("pop.mp3")} volume={0.6} />
      </Sequence>

      {/* Hollywood hills background */}
      <Img src={BG} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        filter: "brightness(0.4) saturate(1.3)",
        transform: `scale(${1.05 + Math.sin(frame * 0.006) * 0.02})`,
      }} />

      {/* Warm ambient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 60%, rgba(255,200,80,0.08) 0%, transparent 60%)",
      }} />

      {/* Center glow beam - the neon spotlight */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        left: CENTER_X - 80, width: 160,
        background: `linear-gradient(180deg, rgba(255,215,0,0.05) 0%, rgba(255,215,0,0.15) 40%, rgba(255,215,0,0.15) 60%, rgba(255,215,0,0.05) 100%)`,
        filter: "blur(30px)",
        zIndex: 5, pointerEvents: "none",
      }} />
      {/* Sharp center line */}
      <div style={{
        position: "absolute", top: stripY - 20, bottom: 1080 - stripY - FRAME_H - 20,
        left: CENTER_X - 1, width: 2,
        background: `linear-gradient(180deg, transparent, ${GOLD}, transparent)`,
        opacity: 0.4, zIndex: 15, pointerEvents: "none",
      }} />

      {/* THE FILM STRIP */}
      <div style={{
        position: "absolute", left: scrollX, top: stripY,
        display: "flex", gap: FRAME_GAP,
        transform: `rotate(${stripRotate}deg)`,
        transformOrigin: "center center",
        zIndex: 10,
        opacity: fadeOut,
      }}>
        {CLIPS.map((clip, i) => {
          // Calculate how close this frame is to center
          const frameCenter = scrollX + i * (FRAME_W + FRAME_GAP) + FRAME_W / 2;
          const distFromCenter = Math.abs(frameCenter - CENTER_X);
          const glowIntensity = interpolate(distFromCenter, [0, 200, 400], [1, 0.3, 0], {
            extrapolateRight: "clamp",
          });

          // Scale up when near center
          const scale = interpolate(distFromCenter, [0, 300, 600], [1.08, 1, 0.95], {
            extrapolateRight: "clamp",
          });

          // Brightness boost near center
          const brightness = interpolate(distFromCenter, [0, 300], [1.1, 0.7], {
            extrapolateRight: "clamp",
          });

          return (
            <div key={i} style={{
              transform: `scale(${scale})`,
              transition: "transform 0.05s",
              zIndex: glowIntensity > 0.5 ? 20 : 10,
            }}>
              <FilmFrame glowIntensity={glowIntensity}>
                <OffthreadVideo
                  src={clip}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: `brightness(${brightness})`,
                  }}
                  startFrom={i * 20}
                />
              </FilmFrame>
            </div>
          );
        })}
      </div>

      {/* Ground reflection */}
      <div style={{
        position: "absolute", left: scrollX, top: stripY + FRAME_H + 5,
        display: "flex", gap: FRAME_GAP,
        transform: `rotate(${stripRotate}deg) scaleY(-0.3)`,
        transformOrigin: "top center",
        opacity: 0.15, filter: "blur(4px)",
        zIndex: 4,
      }}>
        {CLIPS.map((clip, i) => (
          <div key={`ref${i}`} style={{ width: FRAME_W, height: FRAME_H, background: "#1a1a1a", borderRadius: 6, flexShrink: 0 }}>
            <div style={{ margin: "8px 24px", height: "calc(100% - 16px)", borderRadius: 4, overflow: "hidden", background: "#000" }}>
              <OffthreadVideo src={clip} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} startFrom={i * 20} />
            </div>
          </div>
        ))}
      </div>

      {/* Golden sparkle particles */}
      {Array.from({ length: 25 }).map((_, i) => {
        const speed = 0.4 + (i % 6) * 0.2;
        const px = ((frame * speed + i * 80) % 2200) - 100;
        const py = ((i * 73 + frame * (0.2 + i * 0.04)) % 1200) - 50;
        const size = 1 + (i % 3);
        const twinkle = 0.15 + Math.sin(frame * 0.15 + i * 1.8) * 0.25;
        return (
          <div key={i} style={{
            position: "absolute", left: px, top: py,
            width: size, height: size, borderRadius: "50%",
            background: `rgba(255,215,100,${twinkle})`,
            boxShadow: `0 0 ${size * 3}px rgba(255,200,80,${twinkle * 0.6})`,
            zIndex: 25,
          }} />
        );
      })}

      {/* Film scratches */}
      {frame % 11 < 1 && (
        <div style={{
          position: "absolute", left: `${20 + (frame * 7) % 60}%`, top: 0,
          width: 1, height: "100%", background: "rgba(255,255,255,0.04)", zIndex: 30,
        }} />
      )}

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* Subscribe overlay at end */}
      <Sequence from={280} durationInFrames={120}>
        <div style={{
          position: "absolute", bottom: 40, left: "50%",
          transform: `translateX(-50%) translateY(${interpolate(
            spring({ frame: frame - 280, fps, config: { stiffness: 80, damping: 14 } }),
            [0, 1], [120, 0]
          )}px) scale(1.5)`,
          display: "flex", alignItems: "center", gap: 0, zIndex: 50,
        }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", border: `3px solid ${GOLD}`, boxShadow: `0 0 20px ${GOLD_GLOW}, 0 4px 20px rgba(0,0,0,0.5)`, zIndex: 2 }}>
            <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(20,20,20,0.95)", borderRadius: "0 36px 36px 0",
            padding: "10px 22px 10px 46px", marginLeft: -32, zIndex: 1,
            transform: `scaleX(${spring({ frame: frame - 285, fps, config: { stiffness: 100, damping: 14 } })})`,
            transformOrigin: "left",
            border: `1px solid rgba(255,215,0,0.3)`,
          }}>
            <div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>AI Injection</div>
              <div style={{ color: "#aaa", fontSize: 13 }}>1.79K subscribers</div>
            </div>
            <div style={{
              padding: "8px 18px", borderRadius: 22, fontWeight: 700, fontSize: 15,
              background: frame >= 320 ? "rgba(255,215,0,0.15)" : GOLD,
              color: frame >= 320 ? GOLD : "#0f0f0f",
              border: frame >= 320 ? `1px solid ${GOLD}` : "none",
            }}>
              {frame >= 320 ? "Subscribed" : "Subscribe"}
            </div>
            <div style={{
              transform: `rotate(${frame >= 340 ? Math.sin((frame - 340) * 1) * interpolate(frame - 340, [0, 25], [15, 0], { extrapolateRight: "clamp" }) : 0}deg)`,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill={frame >= 340 ? GOLD : "white"} style={{
                filter: frame >= 340 ? `drop-shadow(0 0 8px ${GOLD_GLOW})` : "none",
              }}>
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Click and bell sounds */}
        <Sequence from={40} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
        <Sequence from={60} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
        <Sequence from={62} durationInFrames={30}><Audio src={staticFile("bell.mp3")} volume={1} /></Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
