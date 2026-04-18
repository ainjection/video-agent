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

const CYBER = [staticFile("images/cyber_12954.jpg"), staticFile("images/cyber_20299.jpg"), staticFile("images/cyber_32197.jpg")];
const FANTASY = [staticFile("images/fan_20341.jpg"), staticFile("images/fan_7523.jpg"), staticFile("images/fan_7863.jpg")];
const EDITORIAL = [staticFile("images/edit_2788.jpg"), staticFile("images/edit_3061.jpg")];
const INFLUENCER = [staticFile("images/img1db6ae.jpg"), staticFile("images/img97b502.jpg"), staticFile("images/imga0519b.jpg"), staticFile("images/imge1c1a8.jpg")];
const PRODUCTS = [staticFile("images/prod_1080.jpg"), staticFile("images/prod_14319.jpg")];
const ALL = [...INFLUENCER.slice(0,2), ...CYBER.slice(0,2), ...FANTASY.slice(0,2), ...EDITORIAL, ...PRODUCTS];

export const PromptVaultV3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-black overflow-hidden">
      <Audio src={staticFile("vo2.mp3")} volume={1} />
      <Audio
        src={staticFile("bgm2.mp3")}
        volume={(f) => interpolate(f, [0, 15, 680, 750], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      {/* Scene 1: "What if one prompt..." - Cinematic Reveal (0-100) */}
      <Sequence from={0} durationInFrames={100}>
        <AbsoluteFill>
          <Img src={CYBER[0]} className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `scale(${interpolate(frame, [0, 100], [1.3, 1], { extrapolateRight: "clamp" })})`,
              filter: `brightness(${interpolate(frame, [0, 40, 70], [0, 0.7, 0.4], { extrapolateRight: "clamp" })})`,
            }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-6xl font-black text-center leading-tight px-8"
              style={{
                opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame, [10, 30], [30, 0], { extrapolateRight: "clamp" })}px)`,
                textShadow: "0 4px 40px rgba(0,0,0,0.9)",
              }}>
              What If One Prompt{"\n"}Could Create All Of This?
            </h1>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Horizontal Scroll Showcase (100-220) */}
      <Sequence from={100} durationInFrames={120}>
        <AbsoluteFill>
          <div className="absolute inset-0 flex items-start pt-12"
            style={{ transform: `translateX(${interpolate(frame - 100, [0, 100], [200, -2200], { extrapolateRight: "clamp" })}px)` }}>
            {ALL.map((img, i) => (
              <div key={i} className="flex-shrink-0 w-[380px] h-[650px] mx-3 rounded-2xl overflow-hidden relative"
                style={{ transform: `rotate(${Math.sin(i * 1.2) * 3}deg)` }}>
                <Img src={img} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
            ))}
          </div>
          {/* Category label */}
          <div className="absolute top-16 left-0 right-0 text-center">
            {["Influencers", "Cyberpunk", "Fantasy", "Editorial", "Products"][Math.floor(interpolate(frame - 100, [0, 100], [0, 4.9], { extrapolateRight: "clamp" }))] && (
              <span className="text-[#4ecdc4] text-3xl font-bold tracking-widest px-6 py-2 bg-black/50 rounded-full backdrop-blur-sm">
                {["Influencers", "Cyberpunk", "Fantasy", "Editorial", "Products"][Math.floor(interpolate(frame - 100, [0, 100], [0, 4.9], { extrapolateRight: "clamp" }))]}
              </span>
            )}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Vertical Stack Reveal (220-330) */}
      <Sequence from={220} durationInFrames={110}>
        <AbsoluteFill className="flex flex-col items-center justify-center gap-3 p-6">
          {[FANTASY[0], CYBER[1], INFLUENCER[2], EDITORIAL[0]].map((img, i) => {
            const s = spring({ frame: frame - 220 - i * 12, fps, config: { stiffness: 120, damping: 14 } });
            const direction = i % 2 === 0 ? -1 : 1;
            return (
              <div key={i} className="w-full h-[200px] rounded-2xl overflow-hidden relative"
                style={{
                  transform: `translateX(${interpolate(s, [0, 1], [direction * 400, 0])}px)`,
                  opacity: s,
                }}>
                <Img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              </div>
            );
          })}
          <div className="absolute bottom-20 left-0 right-0 text-center"
            style={{ opacity: interpolate(frame - 220, [60, 75], [0, 1], { extrapolateRight: "clamp" }) }}>
            <p className="text-white text-3xl font-bold" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
              Every Style. One Library.
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Tool Logos Cascade (330-430) */}
      <Sequence from={330} durationInFrames={100}>
        <AbsoluteFill>
          <Img src={INFLUENCER[3]} className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.2) blur(5px)" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <p className="text-[#4ecdc4] text-2xl tracking-[0.3em] mb-4"
              style={{ opacity: interpolate(frame - 330, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
              WORKS WITH
            </p>
            {[
              ["Midjourney", "Sora", "DALL-E"],
              ["Kling", "Runway", "Stable Diffusion"],
              ["ChatGPT", "Claude", "Gemini"],
            ].map((row, ri) => (
              <div key={ri} className="flex gap-3">
                {row.map((tool, ti) => {
                  const delay = ri * 10 + ti * 5 + 10;
                  const s = spring({ frame: frame - 330 - delay, fps, config: { stiffness: 180, damping: 14 } });
                  return (
                    <div key={tool} className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm"
                      style={{ transform: `scale(${s}) translateY(${interpolate(s, [0, 1], [20, 0])}px)`, opacity: s }}>
                      <span className="text-white text-lg font-semibold">{tool}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Pulsing Stats over Influencer (430-540) */}
      <Sequence from={430} durationInFrames={110}>
        <AbsoluteFill>
          {/* Hero influencer background */}
          <Img src={INFLUENCER[0]} className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `scale(${interpolate(frame - 430, [0, 110], [1, 1.15], { extrapolateRight: "clamp" })})`,
              filter: "brightness(0.35) saturate(1.2)",
            }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%)",
          }} />

          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[500px] h-[500px] rounded-full border-2 border-[#4ecdc4]/20"
              style={{ transform: `scale(${1 + Math.sin((frame - 430) * 0.08) * 0.1})` }} />
            <div className="absolute w-[350px] h-[350px] rounded-full border border-[#4ecdc4]/15"
              style={{ transform: `scale(${1 + Math.cos((frame - 430) * 0.06) * 0.15})` }} />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
            {[
              { num: "6,000+", label: "Tested Prompts", delay: 0 },
              { num: "8", label: "Categories", delay: 15 },
              { num: "FREE", label: "To Browse", delay: 30 },
            ].map((stat, i) => {
              const s = spring({ frame: frame - 430 - stat.delay, fps, config: { stiffness: 150, damping: 14 } });
              return (
                <div key={i} className="text-center bg-black/40 px-10 py-4 rounded-2xl backdrop-blur-sm"
                  style={{ transform: `scale(${s})`, opacity: s }}>
                  <span className="text-[#4ecdc4] text-6xl font-black">{stat.num}</span>
                  <p className="text-white/80 text-xl mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: Dramatic CTA (540-750) */}
      <Sequence from={540} durationInFrames={210}>
        <AbsoluteFill>
          {/* Crossfading background images */}
          {[FANTASY[1], CYBER[2], INFLUENCER[0]].map((img, i) => {
            const segLen = 40;
            const start = i * segLen;
            const op = interpolate(frame - 540, [start, start + 10, start + segLen - 10, start + segLen], [0, 0.3, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <Img key={i} src={img} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: op, filter: "brightness(0.25)" }} />;
          })}

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-white text-5xl font-black text-center leading-tight"
              style={{
                opacity: interpolate(frame - 540, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame - 540, [0, 20], [40, 0], { extrapolateRight: "clamp" })}px)`,
              }}>
              YOUR UNFAIR
              <br />
              <span className="text-[#4ecdc4]">ADVANTAGE</span>
            </h1>
            <div className="mt-10 px-12 py-5 rounded-full bg-[#4ecdc4]"
              style={{
                transform: `scale(${spring({ frame: frame - 575, fps, config: { stiffness: 120, damping: 10 } })})`,
              }}>
              <span className="text-black text-3xl font-black">PROMPT VAULT</span>
            </div>
            <p className="text-white/40 text-lg mt-6 tracking-widest"
              style={{ opacity: interpolate(frame - 540, [50, 65], [0, 1], { extrapolateRight: "clamp" }) }}>
              promptvault.com
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scanlines overlay for cinematic feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }} />
    </AbsoluteFill>
  );
};
