import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(#00FF66 1px, transparent 1px), linear-gradient(90deg, #00FF66 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          transform: `translate(${frame * 0.3}px, ${frame * 0.3}px)`,
        }}
      />

      {/* Scene 1: The Hook */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill className="flex items-center justify-center">
          <div
            className="flex items-center gap-4"
            style={{
              opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <span
              className="text-[#00FF66] text-8xl font-bold"
              style={{
                transform: `translateX(${interpolate(frame, [0, 20], [-200, 0], { extrapolateRight: "clamp" })}px)`,
              }}
            >
              [
            </span>
            <span
              className="text-white text-5xl font-bold tracking-wider"
              style={{
                opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              STOP EDITING VIDEOS
            </span>
            <span
              className="text-[#00FF66] text-8xl font-bold"
              style={{
                transform: `translateX(${interpolate(frame, [0, 20], [200, 0], { extrapolateRight: "clamp" })}px)`,
              }}
            >
              ]
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: The Problem */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill className="flex flex-col items-center justify-center gap-8">
          {/* Loading ring stuck at 45% */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a1a" strokeWidth="4" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#00FF66"
              strokeWidth="4"
              strokeDasharray={`${Math.PI * 100 * 0.45} ${Math.PI * 100}`}
              strokeLinecap="round"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                filter: `${(frame - 90) % 15 < 3 ? "blur(2px)" : "none"}`,
              }}
            />
            <text x="60" y="65" textAnchor="middle" fill="#00FF66" fontSize="18" fontFamily="monospace">
              45%
            </text>
          </svg>
          <p
            className="text-white text-4xl font-bold tracking-wider"
            style={{
              opacity: interpolate(frame - 90, [10, 25], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame - 90, [10, 25], [30, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            MANUAL EDITING IS OBSOLETE
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: The Solution - Scanner Reveal */}
      <Sequence from={180} durationInFrames={90}>
        <AbsoluteFill className="flex items-center justify-center">
          {/* Scanner line */}
          <div
            className="absolute w-full h-[2px] bg-[#00FF66]"
            style={{
              top: "50%",
              left: `${interpolate(frame - 180, [0, 60], [-100, 110], { extrapolateRight: "clamp" })}%`,
              boxShadow: "0 0 20px #00FF66, 0 0 40px #00FF66",
              width: "3px",
              height: "100%",
              transform: "translateX(-50%)",
            }}
          />
          <h1
            className="text-white text-5xl font-bold tracking-wider"
            style={{
              clipPath: `inset(0 ${interpolate(frame - 180, [0, 60], [100, 0], { extrapolateRight: "clamp" })}% 0 0)`,
            }}
          >
            CODE YOUR VIDEOS WITH AI
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Terminal */}
      <Sequence from={270} durationInFrames={90}>
        <AbsoluteFill className="flex items-center justify-center">
          <div
            className="border border-[#00FF66] rounded-lg p-8 bg-black/80"
            style={{
              transform: `scale(${spring({ frame: frame - 270, fps, config: { stiffness: 200, damping: 20 } })})`,
              minWidth: "500px",
            }}
          >
            <p className="text-[#00FF66] font-mono text-2xl mb-2"
              style={{ opacity: interpolate(frame - 270, [15, 25], [0, 1], { extrapolateRight: "clamp" }) }}>
              {">"} _No Premiere
            </p>
            <p className="text-[#00FF66] font-mono text-2xl mb-2"
              style={{ opacity: interpolate(frame - 270, [30, 40], [0, 1], { extrapolateRight: "clamp" }) }}>
              {">"} _No After Effects
            </p>
            <p className="text-[#00FF66] font-mono text-2xl"
              style={{ opacity: interpolate(frame - 270, [45, 55], [0, 1], { extrapolateRight: "clamp" }) }}>
              {">"} _Just AI + Code
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: The Promise */}
      <Sequence from={360} durationInFrames={90}>
        <AbsoluteFill className="flex items-center justify-center">
          {/* Radar circles */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute border border-[#00FF66] rounded-full"
              style={{
                width: `${interpolate(frame - 360 - i * 10, [0, 60], [0, 800], { extrapolateRight: "clamp" })}px`,
                height: `${interpolate(frame - 360 - i * 10, [0, 60], [0, 800], { extrapolateRight: "clamp" })}px`,
                opacity: interpolate(frame - 360 - i * 10, [0, 30, 60], [0.5, 0.3, 0], { extrapolateRight: "clamp" }),
              }}
            />
          ))}
          <h1
            className="text-white text-6xl font-bold tracking-wider z-10"
            style={{
              transform: `scale(${interpolate(frame - 360, [0, 20], [0.8, 1], { extrapolateRight: "clamp" })})`,
            }}
          >
            ZERO EXPERIENCE REQUIRED
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: CTA */}
      <Sequence from={450} durationInFrames={90}>
        <AbsoluteFill className="flex flex-col items-center justify-center gap-4">
          <h1
            className="text-white text-7xl font-bold"
            style={{
              opacity: interpolate(frame - 450, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame - 450, [0, 15], [40, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            BUILD ON AUTOPILOT
          </h1>
          <div className="flex items-center gap-2 mt-4"
            style={{
              opacity: interpolate(frame - 450, [25, 35], [0, 1], { extrapolateRight: "clamp" }),
            }}>
            <span className="text-[#00FF66] font-mono text-3xl">
              {(frame - 450) % 20 < 10 ? "_" : ""}
            </span>
            <span
              className="text-[#00FF66] text-3xl font-bold"
              style={{
                opacity: interpolate(frame - 450, [40, 50], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              TUTORIAL STARTS NOW
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
