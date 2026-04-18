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

const IMAGES = [
  staticFile("images/img1db6ae.jpg"),
  staticFile("images/img2cd9d5.jpg"),
  staticFile("images/img7090a6.jpg"),
  staticFile("images/img963b08.jpg"),
  staticFile("images/img97b502.jpg"),
  staticFile("images/imga0519b.jpg"),
  staticFile("images/imgddd3d2.jpg"),
  staticFile("images/imge1c1a8.jpg"),
];

const CATEGORIES = ["Cinematic", "Product", "Atmospheric", "Portrait", "Abstract", "Motion", "Text", "Generator"];
const AI_TOOLS = ["Midjourney", "DALL-E", "Stable Diffusion", "Runway", "Kling", "Sora", "ChatGPT", "Claude"];

export const PromptVaultPromo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-[#0a0a12] overflow-hidden">
      {/* Voiceover */}
      <Audio src={staticFile("vo.mp3")} volume={1} />

      {/* Background music - louder, fades out at end */}
      <Audio
        src={staticFile("bgm.mp3")}
        volume={(f) =>
          interpolate(f, [0, 20, 600, 690], [0, 0.9, 0.9, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* Scene 1: Image Cascade - Visual Impact */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill>
          {/* Full bleed hero image with slow zoom */}
          <Img
            src={IMAGES[0]}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `scale(${interpolate(frame, [0, 120], [1.1, 1.3], { extrapolateRight: "clamp" })})`,
              filter: `brightness(0.6)`,
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(10,10,18,0.95) 0%, rgba(10,10,18,0.3) 40%, rgba(10,10,18,0.1) 100%)",
          }} />
          {/* Text */}
          <div className="absolute bottom-0 left-0 right-0 p-12 flex flex-col items-center">
            <h1
              className="text-[#4ecdc4] text-8xl font-black tracking-tight"
              style={{
                opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame, [10, 30], [40, 0], { extrapolateRight: "clamp" })}px)`,
                textShadow: "0 0 60px rgba(78,205,196,0.6)",
              }}
            >
              PROMPT VAULT
            </h1>
            <p
              className="text-white/80 text-3xl mt-4 font-light"
              style={{
                opacity: interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              6,000+ AI Prompts That Actually Work
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Image Grid Reveal */}
      <Sequence from={120} durationInFrames={120}>
        <AbsoluteFill className="flex items-center justify-center p-8">
          <div className="grid grid-cols-3 gap-3 w-full h-full max-w-[900px] max-h-[1400px]">
            {IMAGES.slice(0, 6).map((img, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const delay = (row + col) * 8;
              const s = spring({ frame: frame - 120 - delay, fps, config: { stiffness: 120, damping: 14 } });
              return (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    transform: `scale(${s})`,
                    opacity: s,
                  }}
                >
                  <Img src={img} className="w-full h-full object-cover" style={{ aspectRatio: "3/4" }} />
                  <div className="absolute inset-0 border-2 border-[#4ecdc4]/30 rounded-xl" />
                </div>
              );
            })}
          </div>
          {/* Overlay text */}
          <div
            className="absolute bottom-20 left-0 right-0 text-center"
            style={{
              opacity: interpolate(frame - 120, [40, 55], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <p className="text-white text-4xl font-bold drop-shadow-lg">Every Image Made From a Prompt</p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Swipe Through - Phone Style */}
      <Sequence from={240} durationInFrames={120}>
        <AbsoluteFill className="flex items-center justify-center">
          {IMAGES.map((img, i) => {
            const offset = interpolate(frame - 240, [0, 100], [0, -IMAGES.length * 400], { extrapolateRight: "clamp" });
            const x = i * 400 + offset + 340;
            const isCenter = Math.abs(x) < 200;
            return (
              <div
                key={i}
                className="absolute rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  width: "350px",
                  height: "500px",
                  left: `${x}px`,
                  top: "50%",
                  transform: `translateY(-50%) scale(${isCenter ? 1.05 : 0.9}) rotateY(${x * 0.02}deg)`,
                  opacity: Math.abs(x) > 600 ? 0.3 : 1,
                  transition: "transform 0.1s",
                  zIndex: isCenter ? 10 : 1,
                }}
              >
                <Img src={img} className="w-full h-full object-cover" />
                {isCenter && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[#4ecdc4] text-sm font-bold">AI GENERATED</p>
                    <p className="text-white text-lg font-semibold">From One Prompt</p>
                  </div>
                )}
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Categories Over Image */}
      <Sequence from={360} durationInFrames={110}>
        <AbsoluteFill>
          <Img
            src={IMAGES[3]}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "brightness(0.3) blur(3px)",
              transform: `scale(${interpolate(frame - 360, [0, 110], [1, 1.1], { extrapolateRight: "clamp" })})`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
            <h2
              className="text-[#4ecdc4] text-3xl tracking-widest font-bold"
              style={{ opacity: interpolate(frame - 360, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}
            >
              8 CATEGORIES
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-[800px]">
              {CATEGORIES.map((cat, i) => {
                const s = spring({ frame: frame - 360 - i * 5, fps, config: { stiffness: 200, damping: 18 } });
                return (
                  <div
                    key={cat}
                    className="px-5 py-3 rounded-full border border-[#4ecdc4]/50 bg-black/60 backdrop-blur-sm"
                    style={{ transform: `scale(${s})`, opacity: s }}
                  >
                    <span className="text-[#4ecdc4] text-xl font-semibold">{cat}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[700px]">
              {AI_TOOLS.map((tool, i) => {
                const s = spring({ frame: frame - 360 - 40 - i * 4, fps, config: { stiffness: 180, damping: 16 } });
                return (
                  <div key={tool} className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm"
                    style={{ transform: `scale(${s})`, opacity: s }}>
                    <span className="text-white/90 text-base">{tool}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Features Over Split Images */}
      <Sequence from={470} durationInFrames={110}>
        <AbsoluteFill>
          {/* Split background images */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 h-full overflow-hidden">
              <Img src={IMAGES[5]} className="w-full h-full object-cover" style={{ filter: "brightness(0.25)" }} />
            </div>
            <div className="w-1/2 h-full overflow-hidden">
              <Img src={IMAGES[6]} className="w-full h-full object-cover" style={{ filter: "brightness(0.25)" }} />
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 p-8">
            {[
              { text: "Copy & Paste Into Any AI Tool", delay: 0 },
              { text: "New Prompts Added Weekly", delay: 10 },
              { text: "Commercial Use Included", delay: 20 },
              { text: "No Signup Required", delay: 30 },
            ].map((f, i) => {
              const s = spring({ frame: frame - 470 - f.delay, fps, config: { stiffness: 180, damping: 16 } });
              return (
                <div key={i} className="flex items-center gap-4"
                  style={{ transform: `translateX(${interpolate(s, [0, 1], [-80, 0])}px)`, opacity: s }}>
                  <div className="w-10 h-10 rounded-full bg-[#4ecdc4] flex items-center justify-center">
                    <span className="text-black text-xl font-bold">✓</span>
                  </div>
                  <span className="text-white text-3xl font-semibold">{f.text}</span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: CTA with Hero Image */}
      <Sequence from={580} durationInFrames={110}>
        <AbsoluteFill>
          <Img
            src={IMAGES[7]}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "brightness(0.35)",
              transform: `scale(${interpolate(frame - 580, [0, 110], [1, 1.15], { extrapolateRight: "clamp" })})`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,18,0.8) 100%)",
          }}>
            <h1
              className="text-white text-6xl font-black z-10"
              style={{
                opacity: interpolate(frame - 580, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame - 580, [0, 20], [30, 0], { extrapolateRight: "clamp" })}px)`,
              }}
            >
              START CREATING
            </h1>
            <div
              className="mt-8 px-10 py-5 rounded-full bg-[#4ecdc4] z-10"
              style={{
                opacity: interpolate(frame - 580, [25, 40], [0, 1], { extrapolateRight: "clamp" }),
                transform: `scale(${spring({ frame: frame - 605, fps, config: { stiffness: 150, damping: 12 } })})`,
              }}
            >
              <span className="text-[#0a0a12] text-3xl font-bold">Visit Prompt Vault</span>
            </div>
            <p
              className="text-white/50 text-xl mt-6 z-10"
              style={{ opacity: interpolate(frame - 580, [45, 60], [0, 1], { extrapolateRight: "clamp" }) }}
            >
              6,000+ prompts. Free to browse.
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
