import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// Mix of influencers, cinematic, products, cars
const INFLUENCER = [
  staticFile("images/img1db6ae.jpg"),
  staticFile("images/img2cd9d5.jpg"),
  staticFile("images/img7090a6.jpg"),
  staticFile("images/img963b08.jpg"),
];
const CINEMATIC = [
  staticFile("images/cin_19791.jpg"),
  staticFile("images/cin_25468.jpg"),
  staticFile("images/cin_31515.jpg"),
];
const PRODUCTS = [
  staticFile("images/prod_1080.jpg"),
  staticFile("images/prod_14319.jpg"),
  staticFile("images/prod_23985.jpg"),
];
const CARS = [
  staticFile("images/car_25780.jpg"),
  staticFile("images/car_6211.jpg"),
];
const ALL_IMAGES = [...INFLUENCER, ...CINEMATIC, ...PRODUCTS, ...CARS];

export const PromptVaultV2 = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-black overflow-hidden">
      {/* Audio */}
      <Audio src={staticFile("vo.mp3")} volume={1} />
      <Audio
        src={staticFile("bgm.mp3")}
        volume={(f) => interpolate(f, [0, 20, 700, 780], [0, 0.85, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      {/* Scene 1: Rapid Flash Montage (0-90) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill>
          {ALL_IMAGES.slice(0, 8).map((img, i) => {
            const showStart = i * 8;
            const showEnd = showStart + 12;
            const visible = frame >= showStart && frame < showEnd;
            return visible ? (
              <Img
                key={i}
                src={img}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transform: `scale(${1 + (frame - showStart) * 0.01})`,
                  opacity: interpolate(frame, [showStart, showStart + 2, showEnd - 2, showEnd], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              />
            ) : null;
          })}
          {/* White flash between cuts */}
          {frame % 8 < 1 && frame < 64 && (
            <div className="absolute inset-0 bg-white" style={{ opacity: 0.6 }} />
          )}
          {/* Title slam at end */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: interpolate(frame, [65, 70], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <h1
              className="text-[#4ecdc4] text-9xl font-black"
              style={{
                transform: `scale(${spring({ frame: frame - 65, fps, config: { stiffness: 300, damping: 12 } })})`,
                textShadow: "0 0 80px rgba(78,205,196,0.8), 0 0 160px rgba(78,205,196,0.3)",
              }}
            >
              PROMPT VAULT
            </h1>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Split Wipe - Influencer (90-180) */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill>
          {/* Left half - image 1 */}
          <div
            className="absolute top-0 left-0 h-full overflow-hidden"
            style={{
              width: `${interpolate(frame - 90, [0, 25], [0, 50], { extrapolateRight: "clamp" })}%`,
            }}
          >
            <Img src={INFLUENCER[0]} className="w-[1080px] h-full object-cover" />
          </div>
          {/* Right half - image 2 */}
          <div
            className="absolute top-0 right-0 h-full overflow-hidden"
            style={{
              width: `${interpolate(frame - 90, [10, 35], [0, 50], { extrapolateRight: "clamp" })}%`,
            }}
          >
            <Img src={INFLUENCER[1]} className="w-[1080px] h-full object-cover object-right" />
          </div>
          {/* Divider line */}
          <div
            className="absolute top-0 bottom-0 w-[3px] bg-[#4ecdc4]"
            style={{
              left: "50%",
              opacity: interpolate(frame - 90, [20, 30], [0, 1], { extrapolateRight: "clamp" }),
              boxShadow: "0 0 20px #4ecdc4, 0 0 40px #4ecdc4",
            }}
          />
          {/* Text overlay */}
          <div
            className="absolute bottom-16 left-0 right-0 text-center"
            style={{ opacity: interpolate(frame - 90, [40, 50], [0, 1], { extrapolateRight: "clamp" }) }}
          >
            <p className="text-white text-4xl font-bold" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
              AI Influencer Prompts
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Zoom Out Mosaic - Products (180-270) */}
      <Sequence from={180} durationInFrames={90}>
        <AbsoluteFill className="flex items-center justify-center">
          <div
            className="grid grid-cols-3 grid-rows-2 gap-2"
            style={{
              width: "1000px",
              height: "1600px",
              transform: `scale(${interpolate(frame - 180, [0, 40], [2.5, 1], { extrapolateRight: "clamp" })})`,
              opacity: interpolate(frame - 180, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            {[...PRODUCTS, ...CINEMATIC].map((img, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl">
                <Img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-[#4ecdc4]/20 rounded-xl" />
              </div>
            ))}
          </div>
          {/* Category labels floating */}
          {["Cinematic", "Product", "Atmospheric"].map((cat, i) => {
            const s = spring({ frame: frame - 180 - 40 - i * 8, fps, config: { stiffness: 200, damping: 15 } });
            return (
              <div
                key={cat}
                className="absolute px-5 py-2 rounded-full bg-[#4ecdc4]/90"
                style={{
                  top: `${25 + i * 25}%`,
                  right: "8%",
                  transform: `translateX(${interpolate(s, [0, 1], [100, 0])}px) scale(${s})`,
                  opacity: s,
                }}
              >
                <span className="text-black text-lg font-bold">{cat}</span>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Diagonal Slide - Cars (270-360) */}
      <Sequence from={270} durationInFrames={90}>
        <AbsoluteFill>
          <div
            className="absolute inset-0"
            style={{
              clipPath: `polygon(${interpolate(frame - 270, [0, 30], [100, 0], { extrapolateRight: "clamp" })}% 0, 100% 0, 100% 100%, ${interpolate(frame - 270, [0, 30], [100, 30], { extrapolateRight: "clamp" })}% 100%)`,
            }}
          >
            <Img src={CARS[0]} className="w-full h-full object-cover" style={{ filter: "brightness(0.7)" }} />
          </div>
          <div
            className="absolute inset-0"
            style={{
              clipPath: `polygon(0 0, ${interpolate(frame - 270, [5, 35], [0, 70], { extrapolateRight: "clamp" })}% 0, ${interpolate(frame - 270, [5, 35], [0, 40], { extrapolateRight: "clamp" })}% 100%, 0 100%)`,
            }}
          >
            <Img src={CARS[1]} className="w-full h-full object-cover" style={{ filter: "brightness(0.7)" }} />
          </div>
          {/* Diagonal divider */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, transparent 48%, #4ecdc4 49%, #4ecdc4 51%, transparent 52%)",
              opacity: interpolate(frame - 270, [25, 35], [0, 0.8], { extrapolateRight: "clamp" }),
            }}
          />
          <div
            className="absolute bottom-20 left-0 right-0 text-center"
            style={{ opacity: interpolate(frame - 270, [40, 50], [0, 1], { extrapolateRight: "clamp" }) }}
          >
            <p className="text-white text-4xl font-bold" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
              Cars. Products. Anything.
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Counter + Spinning Gallery (360-480) */}
      <Sequence from={360} durationInFrames={120}>
        <AbsoluteFill className="flex flex-col items-center justify-center">
          {/* Rotating images in background */}
          {ALL_IMAGES.slice(0, 6).map((img, i) => {
            const angle = ((frame - 360) * 0.8 + i * 60) * (Math.PI / 180);
            const radius = 350;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.4;
            return (
              <div
                key={i}
                className="absolute w-40 h-56 rounded-xl overflow-hidden shadow-2xl"
                style={{
                  left: `calc(50% + ${x}px - 80px)`,
                  top: `calc(50% + ${y}px - 112px)`,
                  transform: `scale(${0.6 + Math.cos(angle) * 0.2})`,
                  opacity: 0.4 + Math.cos(angle) * 0.3,
                  zIndex: Math.round(Math.cos(angle) * 10) + 10,
                }}
              >
                <Img src={img} className="w-full h-full object-cover" />
              </div>
            );
          })}
          {/* Counter in center */}
          <div className="z-50 text-center bg-black/70 px-12 py-8 rounded-2xl backdrop-blur-sm">
            <span className="text-[#4ecdc4] text-8xl font-black">
              {Math.round(interpolate(frame - 360, [0, 60], [0, 6000], { extrapolateRight: "clamp" }))}+
            </span>
            <p className="text-white text-3xl font-bold mt-2">Tested Prompts</p>
            <p className="text-white/50 text-xl mt-1">Updated Weekly</p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: Glitch CTA (480-570) */}
      <Sequence from={480} durationInFrames={90}>
        <AbsoluteFill>
          <Img
            src={INFLUENCER[2]}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: `brightness(0.3) saturate(1.3)`,
              transform: `scale(${interpolate(frame - 480, [0, 90], [1, 1.2], { extrapolateRight: "clamp" })})`,
            }}
          />
          {/* Glitch slices */}
          {(frame - 480) % 30 < 3 && (
            <>
              <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-[#4ecdc4] opacity-60" />
              <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-red-500 opacity-40" />
            </>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <h1
              className="text-white text-7xl font-black"
              style={{
                opacity: interpolate(frame - 480, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame - 480, [0, 15], [50, 0], { extrapolateRight: "clamp" })}px)`,
                textShadow: "0 0 30px rgba(0,0,0,0.8)",
              }}
            >
              FREE TO BROWSE
            </h1>
            <div
              className="px-12 py-5 rounded-full bg-[#4ecdc4]"
              style={{
                transform: `scale(${spring({ frame: frame - 510, fps, config: { stiffness: 150, damping: 10 } })})`,
              }}
            >
              <span className="text-black text-3xl font-black tracking-wide">PROMPT VAULT</span>
            </div>
            <p
              className="text-white/60 text-xl"
              style={{ opacity: interpolate(frame - 480, [45, 55], [0, 1], { extrapolateRight: "clamp" }) }}
            >
              Copy. Paste. Create. Repeat.
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 7: Final Logo (570-660) */}
      <Sequence from={570} durationInFrames={90}>
        <AbsoluteFill className="flex items-center justify-center bg-black">
          <div
            style={{
              opacity: interpolate(frame - 570, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <h1
              className="text-[#4ecdc4] text-9xl font-black tracking-tight text-center"
              style={{
                textShadow: `0 0 ${40 + Math.sin((frame - 570) * 0.15) * 20}px rgba(78,205,196,0.6)`,
              }}
            >
              PROMPT
              <br />
              VAULT
            </h1>
            <p
              className="text-white/40 text-xl text-center mt-6 tracking-widest"
              style={{ opacity: interpolate(frame - 570, [30, 45], [0, 1], { extrapolateRight: "clamp" }) }}
            >
              THE AI PROMPT LIBRARY
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
