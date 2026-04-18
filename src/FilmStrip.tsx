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
  staticFile("7eb6826b-591a-4d6b-b123-5c61ba201895.mp4"),
  staticFile("839bb8a6-a3f2-4f60-8f89-62eab37f91a0.mp4"),
  staticFile("a24598e3-9fb0-481a-972b-511f103d80f7.mp4"),
  staticFile("hf_20260117_141307_690534ee-7b0c-4a2a-88e1-f48c11fce3d0.mp4"),
  staticFile("7eb6826b-591a-4d6b-b123-5c61ba201895.mp4"), // repeat for more frames
  staticFile("839bb8a6-a3f2-4f60-8f89-62eab37f91a0.mp4"),
];

const AVATAR = staticFile("avatar.jpg");
const CHANNEL = "AI INJECTION";

// Single film frame with sprocket holes
const FilmFrame = ({
  children,
  width,
  height,
}: {
  children: React.ReactNode;
  width: number;
  height: number;
}) => {
  const sprocketSize = 14;
  const sprocketGap = 22;
  const borderWidth = 28;
  const numSprockets = Math.floor(height / sprocketGap);

  return (
    <div
      style={{
        width,
        height,
        background: "#1a1a1a",
        borderRadius: 6,
        position: "relative",
        flexShrink: 0,
        boxShadow: "0 4px 30px rgba(0,0,0,0.6)",
      }}
    >
      {/* Left sprocket strip */}
      <div style={{ position: "absolute", left: 4, top: 0, bottom: 0, width: borderWidth - 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
        {Array.from({ length: numSprockets }).map((_, i) => (
          <div key={`l${i}`} style={{ width: sprocketSize, height: sprocketSize * 0.7, borderRadius: 3, background: "#333", border: "1px solid #555" }} />
        ))}
      </div>
      {/* Right sprocket strip */}
      <div style={{ position: "absolute", right: 4, top: 0, bottom: 0, width: borderWidth - 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
        {Array.from({ length: numSprockets }).map((_, i) => (
          <div key={`r${i}`} style={{ width: sprocketSize, height: sprocketSize * 0.7, borderRadius: 3, background: "#333", border: "1px solid #555" }} />
        ))}
      </div>
      {/* Video content area */}
      <div
        style={{
          position: "absolute",
          left: borderWidth,
          right: borderWidth,
          top: 8,
          bottom: 8,
          borderRadius: 4,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {children}
      </div>
      {/* Film grain overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 6, pointerEvents: "none",
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)`,
      }} />
    </div>
  );
};

export const FilmStripIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const FRAME_W = 340;
  const FRAME_H = 440;
  const FRAME_GAP = 16;
  const TOTAL_STRIP_W = CLIPS.length * (FRAME_W + FRAME_GAP);

  // Scroll the strip from right to left
  const scrollX = interpolate(frame, [30, 270], [400, -TOTAL_STRIP_W + 1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Film strip vertical position - slight wave
  const stripY = 300 + Math.sin(frame * 0.03) * 15;

  // Strip rotation for perspective
  const stripRotate = interpolate(frame, [0, 300], [2, -2], { extrapolateRight: "clamp" });

  // Channel name
  const nameScale = spring({ frame: frame - 10, fps, config: { stiffness: 80, damping: 12 } });
  const nameOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });

  // Vignette fade in
  const vignetteOp = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // Fade out at end
  const fadeOut = interpolate(frame, [270, 300], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#0a0a0a", overflow: "hidden", opacity: fadeOut }}>
      {/* Sound */}
      <Sequence from={0} durationInFrames={10}>
        <Audio src={staticFile("pop.mp3")} volume={0.6} />
      </Sequence>

      {/* Hollywood background image */}
      <Img src={staticFile("images/hollywood-bg.jpg")} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        filter: `brightness(0.35) saturate(1.2)`,
        transform: `scale(${1.05 + Math.sin(frame * 0.008) * 0.02})`,
      }} />

      {/* Red curtain edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 120,
        background: "linear-gradient(90deg, rgba(80,0,0,0.7) 0%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 120,
        background: "linear-gradient(270deg, rgba(80,0,0,0.7) 0%, transparent 100%)",
      }} />

      {/* Spotlight beams */}
      <div style={{
        position: "absolute", bottom: 0, left: "20%", width: 300, height: "120%",
        background: "linear-gradient(to top, rgba(255,220,100,0.08) 0%, transparent 60%)",
        transform: `rotate(${-15 + Math.sin(frame * 0.015) * 3}deg)`,
        transformOrigin: "bottom center",
        filter: "blur(20px)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: "20%", width: 300, height: "120%",
        background: "linear-gradient(to top, rgba(255,220,100,0.08) 0%, transparent 60%)",
        transform: `rotate(${15 + Math.cos(frame * 0.012) * 3}deg)`,
        transformOrigin: "bottom center",
        filter: "blur(20px)",
      }} />

      {/* Lens flare */}
      <div style={{
        position: "absolute",
        left: `${interpolate(frame, [0, 300], [10, 80], { extrapolateRight: "clamp" })}%`,
        top: `${30 + Math.sin(frame * 0.03) * 10}%`,
        width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,230,150,0.15) 0%, transparent 60%)",
        filter: "blur(30px)",
      }} />
      {/* Anamorphic flare streak */}
      <div style={{
        position: "absolute",
        left: `${interpolate(frame, [0, 300], [5, 75], { extrapolateRight: "clamp" })}%`,
        top: `${30 + Math.sin(frame * 0.03) * 10}%`,
        width: 600, height: 3,
        background: "linear-gradient(90deg, transparent, rgba(255,230,150,0.2), rgba(255,200,100,0.1), transparent)",
        filter: "blur(2px)",
        transform: "translateY(-50%)",
      }} />

      {/* Spinning film reel - top right corner */}
      <div style={{
        position: "absolute", top: 40, right: 60, width: 80, height: 80,
        opacity: interpolate(frame, [20, 40], [0, 0.4], { extrapolateRight: "clamp" }),
      }}>
        <svg viewBox="0 0 100 100" style={{ transform: `rotate(${frame * 3}deg)` }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,200,100,0.4)" strokeWidth="3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,200,100,0.3)" strokeWidth="2" />
          <circle cx="50" cy="50" r="8" fill="rgba(255,200,100,0.4)" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <circle key={angle} cx={50 + 20 * Math.cos(angle * Math.PI / 180)} cy={50 + 20 * Math.sin(angle * Math.PI / 180)} r="6" fill="rgba(0,0,0,0.5)" stroke="rgba(255,200,100,0.3)" strokeWidth="1" />
          ))}
        </svg>
      </div>

      {/* THE FILM STRIP */}
      <div
        style={{
          position: "absolute",
          left: scrollX,
          top: stripY,
          display: "flex",
          gap: FRAME_GAP,
          transform: `rotate(${stripRotate}deg) perspective(2000px) rotateY(${Math.sin(frame * 0.01) * 2}deg)`,
          transformOrigin: "center center",
        }}
      >
        {CLIPS.map((clip, i) => (
          <FilmFrame key={i} width={FRAME_W} height={FRAME_H}>
            <OffthreadVideo
              src={clip}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              startFrom={i * 30}
            />
          </FilmFrame>
        ))}
      </div>

      {/* Channel name - center floating above strip */}
      <div style={{
        position: "absolute", top: 60, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        transform: `scale(${nameScale})`,
        opacity: nameOpacity,
      }}>
        {/* Logo circle */}
        <div style={{
          width: 90, height: 90, borderRadius: "50%", overflow: "hidden",
          border: "3px solid rgba(255,200,100,0.6)",
          boxShadow: "0 0 30px rgba(255,200,100,0.3)",
          marginBottom: 16,
        }}>
          <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{
          fontSize: 72, fontWeight: 900, color: "white", letterSpacing: 8,
          textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,200,100,0.2)",
          margin: 0,
        }}>
          {CHANNEL}
        </h1>
      </div>

      {/* Tagline - positioned BELOW the film strip */}
      <div style={{
        position: "absolute", bottom: 120, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          width: 120, height: 3, background: "linear-gradient(90deg, transparent, rgba(255,200,100,0.6), transparent)",
          marginBottom: 12,
        }} />
        <p style={{
          fontSize: 22, color: "rgba(255,200,100,0.7)",
          letterSpacing: 6, fontWeight: 500,
        }}>
          TECH • AI • INNOVATION
        </p>
      </div>

      {/* Subscribe overlay at the end */}
      <Sequence from={200} durationInFrames={100}>
        <div style={{
          position: "absolute", bottom: 30, left: "50%",
          transform: `translateX(-50%) translateY(${interpolate(
            spring({ frame: frame - 200, fps, config: { stiffness: 80, damping: 14 } }),
            [0, 1], [100, 0]
          )}px) scale(1.6)`,
          display: "flex", alignItems: "center", gap: 0, zIndex: 30,
        }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "3px solid white", boxShadow: "0 4px 30px rgba(0,0,0,0.6)", zIndex: 2 }}>
            <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 16, background: "#212121", borderRadius: "0 40px 40px 0",
            padding: "12px 24px 12px 50px", marginLeft: -35, zIndex: 1,
            transform: `scaleX(${spring({ frame: frame - 205, fps, config: { stiffness: 100, damping: 14 } })})`,
            transformOrigin: "left",
          }}>
            <div>
              <div style={{ color: "white", fontSize: 22, fontWeight: 700 }}>AI Injection</div>
              <div style={{ color: "#aaa", fontSize: 14 }}>1.79K subscribers</div>
            </div>
            <div style={{
              padding: "10px 20px", borderRadius: 24, fontWeight: 700, fontSize: 17,
              background: frame >= 240 ? "#333" : "white",
              color: frame >= 240 ? "#aaa" : "#0f0f0f",
            }}>
              {frame >= 240 ? "Subscribed" : "Subscribe"}
            </div>
            <div style={{
              transform: `rotate(${frame >= 260 ? Math.sin((frame - 260) * 1) * interpolate(frame - 260, [0, 20], [15, 0], { extrapolateRight: "clamp" }) : 0}deg)`,
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill={frame >= 260 ? "#FFD700" : "white"}>
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </Sequence>

      {/* Film scratches overlay */}
      {frame % 7 < 1 && (
        <div style={{
          position: "absolute",
          left: `${30 + Math.random() * 40}%`,
          top: 0, width: 1, height: "100%",
          background: "rgba(255,255,255,0.06)",
        }} />
      )}

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
        opacity: vignetteOp,
      }} />

      {/* Golden sparkle particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const speed = 0.5 + (i % 5) * 0.3;
        const px = ((frame * speed + i * 100) % 2200) - 100;
        const py = ((i * 97 + frame * (0.3 + i * 0.05)) % 1300) - 100;
        const size = 1 + (i % 4);
        const twinkle = 0.2 + Math.sin(frame * 0.2 + i * 2) * 0.3;
        const isGold = i % 3 !== 0;
        return (
          <div key={i} style={{
            position: "absolute", left: px, top: py,
            width: size, height: size,
            borderRadius: "50%",
            background: isGold ? `rgba(255,215,100,${twinkle})` : `rgba(255,255,255,${twinkle * 0.7})`,
            boxShadow: isGold ? `0 0 ${size * 2}px rgba(255,200,80,${twinkle * 0.5})` : "none",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
