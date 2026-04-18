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

const I = [
  staticFile("images/img1db6ae.jpg"), staticFile("images/img2cd9d5.jpg"),
  staticFile("images/img7090a6.jpg"), staticFile("images/img97b502.jpg"),
  staticFile("images/imga0519b.jpg"), staticFile("images/imge1c1a8.jpg"),
  staticFile("images/cyber_12954.jpg"), staticFile("images/cyber_20299.jpg"),
  staticFile("images/fan_20341.jpg"), staticFile("images/fan_7523.jpg"),
  staticFile("images/edit_2788.jpg"), staticFile("images/prod_1080.jpg"),
  staticFile("images/car_25780.jpg"), staticFile("images/cin_19791.jpg"),
];

export const PromptVaultV4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-black overflow-hidden">
      <Audio src={staticFile("vo3.mp3")} volume={1} />
      <Audio src={staticFile("bgm3.mp3")}
        volume={(f) => interpolate(f, [0, 10, 780, 840], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {/* Scene 1: EXPLOSION OPEN - Images spin in from all angles (0-120) */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill>
          {/* Dark vortex background */}
          <div className="absolute inset-0" style={{
            background: `conic-gradient(from ${frame * 2}deg at 50% 50%, #000 0deg, #0a1a18 90deg, #000 180deg, #0a1a18 270deg, #000 360deg)`,
          }} />

          {/* 8 images spinning into a grid from the edges */}
          {I.slice(0, 8).map((img, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const progress = spring({ frame: frame - i * 5, fps, config: { stiffness: 60, damping: 12 } });
            const startX = Math.cos(angle) * 1500;
            const startY = Math.sin(angle) * 2000;
            const col = i % 4;
            const row = Math.floor(i / 4);
            const endX = -370 + col * 210;
            const endY = -350 + row * 380;
            const x = interpolate(progress, [0, 1], [startX, endX]);
            const y = interpolate(progress, [0, 1], [startY, endY]);
            const rot = interpolate(progress, [0, 1], [360 + i * 45, 0]);
            const s = interpolate(progress, [0, 0.5, 1], [0.2, 0.6, 1]);

            return (
              <div key={i} className="absolute rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  width: "190px", height: "340px",
                  left: "50%", top: "50%",
                  transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`,
                  boxShadow: "0 0 30px rgba(78,205,196,0.3)",
                }}>
                <Img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-[#4ecdc4]/40 rounded-2xl" />
              </div>
            );
          })}

          {/* Title slams in */}
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div style={{
              transform: `scale(${spring({ frame: frame - 55, fps, config: { stiffness: 200, damping: 10 } })})`,
              opacity: interpolate(frame, [50, 60], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <h1 className="text-7xl font-black text-center" style={{
                background: "linear-gradient(135deg, #4ecdc4 0%, #44e0d0 50%, #2af5e8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 40px rgba(78,205,196,0.6))",
              }}>
                PROMPT
                <br />
                VAULT
              </h1>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: 3D Card Fan - Images spread like a deck of cards (120-240) */}
      <Sequence from={120} durationInFrames={120}>
        <AbsoluteFill className="flex items-center justify-center">
          {I.slice(0, 7).map((img, i) => {
            const totalCards = 7;
            const spreadAngle = 60;
            const cardAngle = interpolate(i, [0, totalCards - 1], [-spreadAngle / 2, spreadAngle / 2]);
            const progress = spring({ frame: frame - 120 - i * 6, fps, config: { stiffness: 80, damping: 14 } });
            const finalAngle = cardAngle * progress;
            const yShift = Math.abs(cardAngle) * 2 * progress;

            return (
              <div key={i} className="absolute rounded-2xl overflow-hidden"
                style={{
                  width: "220px", height: "360px",
                  transform: `rotate(${finalAngle}deg) translateY(${-yShift}px) scale(${0.3 + progress * 0.7})`,
                  transformOrigin: "bottom center",
                  opacity: progress,
                  zIndex: i === 3 ? 20 : 10 - Math.abs(i - 3),
                  boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 ${i === 3 ? 20 : 0}px rgba(78,205,196,0.4)`,
                }}>
                <Img src={img} className="w-full h-full object-cover" />
              </div>
            );
          })}
          {/* Floating text */}
          <div className="absolute bottom-32 text-center z-30"
            style={{ opacity: interpolate(frame - 120, [50, 65], [0, 1], { extrapolateRight: "clamp" }) }}>
            <p className="text-3xl font-bold" style={{
              background: "linear-gradient(90deg, #4ecdc4, #fff, #4ecdc4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Every Image Born From Words</p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Hexagon Grid - Images pop into honeycomb (240-370) */}
      <Sequence from={240} durationInFrames={130}>
        <AbsoluteFill className="flex items-center justify-center">
          {[0,1,2,3,4,5,6].map((i) => {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const radius = i === 6 ? 0 : 230;
            const cx = Math.cos(angle) * radius;
            const cy = Math.sin(angle) * radius;
            const delay = i === 6 ? 0 : (i + 1) * 8;
            const s = spring({ frame: frame - 240 - delay, fps, config: { stiffness: 100, damping: 12 } });
            const spin = interpolate(s, [0, 1], [180, 0]);

            return (
              <div key={i} className="absolute overflow-hidden"
                style={{
                  width: i === 6 ? "220px" : "180px",
                  height: i === 6 ? "220px" : "180px",
                  left: `calc(50% + ${cx}px - ${i === 6 ? 110 : 90}px)`,
                  top: `calc(45% + ${cy}px - ${i === 6 ? 110 : 90}px)`,
                  borderRadius: "50%",
                  transform: `scale(${s}) rotate(${spin}deg)`,
                  border: `3px solid rgba(78,205,196,${i === 6 ? 0.8 : 0.3})`,
                  boxShadow: i === 6 ? "0 0 40px rgba(78,205,196,0.5)" : "none",
                }}>
                <Img src={I[i % I.length]} className="w-full h-full object-cover"
                  style={{ transform: `rotate(${-spin}deg) scale(1.3)` }} />
              </div>
            );
          })}

          {/* Category text cycling */}
          <div className="absolute bottom-28 text-center z-20">
            {["Cinematic", "Cyberpunk", "Fantasy", "Editorial", "Influencer", "Product"].map((cat, i) => {
              const segLen = 20;
              const visible = Math.floor((frame - 240) / segLen) % 6 === i;
              return visible ? (
                <span key={cat} className="text-4xl font-black tracking-wider" style={{
                  background: "linear-gradient(135deg, #4ecdc4, #2af5e8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 20px rgba(78,205,196,0.5))",
                }}>{cat}</span>
              ) : null;
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Morphing Tiles - Images morph between sizes (370-510) */}
      <Sequence from={370} durationInFrames={140}>
        <AbsoluteFill>
          {/* Large background image slowly panning */}
          <Img src={I[0]} className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "brightness(0.2) blur(8px)",
              transform: `scale(1.3) translateX(${interpolate(frame - 370, [0, 140], [0, -50], { extrapolateRight: "clamp" })}px)`,
            }} />

          {/* Tool names with glow effect */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            {["MIDJOURNEY", "SORA", "DALL-E", "KLING", "CLAUDE"].map((tool, i) => {
              const delay = i * 12;
              const s = spring({ frame: frame - 370 - delay, fps, config: { stiffness: 150, damping: 12 } });
              const width = interpolate(s, [0, 1], [0, 100]);

              return (
                <div key={tool} className="relative flex items-center gap-4"
                  style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [100, 0])}px)` }}>
                  <div className="h-[2px] bg-[#4ecdc4]" style={{
                    width: `${width}px`,
                    boxShadow: "0 0 10px #4ecdc4",
                  }} />
                  <span className="text-white text-4xl font-black tracking-[0.2em]">{tool}</span>
                  <div className="h-[2px] bg-[#4ecdc4]" style={{
                    width: `${width}px`,
                    boxShadow: "0 0 10px #4ecdc4",
                  }} />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Kinetic Typography CTA (510-840) */}
      <Sequence from={510} durationInFrames={330}>
        <AbsoluteFill>
          {/* Crossfading hero images */}
          {[I[1], I[6], I[8]].map((img, i) => {
            const seg = 50;
            const start = i * seg;
            return (
              <Img key={i} src={img} className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: interpolate(frame - 510, [start, start + 10, start + seg - 10, start + seg], [0, 0.35, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  filter: "brightness(0.3) saturate(1.3)",
                  transform: `scale(${1.1 + (frame - 510 - start) * 0.001})`,
                }} />
            );
          })}

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {/* Staggered word reveal */}
            {["CREATE", "WITHOUT", "LIMITS"].map((word, i) => {
              const delay = i * 15;
              const s = spring({ frame: frame - 510 - delay, fps, config: { stiffness: 200, damping: 8 } });
              return (
                <h1 key={word} style={{
                  fontSize: word === "LIMITS" ? "100px" : "70px",
                  fontWeight: 900,
                  letterSpacing: "0.05em",
                  transform: `scale(${s}) translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
                  opacity: s,
                  ...(word === "LIMITS" ? {
                    background: "linear-gradient(135deg, #4ecdc4 0%, #2af5e8 50%, #4ecdc4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 40px rgba(78,205,196,0.6))",
                  } : { color: "white", textShadow: "0 4px 30px rgba(0,0,0,0.8)" }),
                }}>
                  {word}
                </h1>
              );
            })}

            {/* Button */}
            <div className="mt-8 px-14 py-6 rounded-full relative overflow-hidden"
              style={{
                transform: `scale(${spring({ frame: frame - 570, fps, config: { stiffness: 120, damping: 10 } })})`,
              }}>
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(from ${(frame - 510) * 3}deg, #4ecdc4, #2af5e8, #4ecdc4, #2af5e8)`,
                padding: "3px",
              }}>
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center px-14 py-6">
                  <span className="text-[#4ecdc4] text-3xl font-black tracking-wide">PROMPT VAULT</span>
                </div>
              </div>
            </div>

            <p className="text-white/40 text-lg mt-4 tracking-[0.4em]"
              style={{ opacity: interpolate(frame - 510, [80, 95], [0, 1], { extrapolateRight: "clamp" }) }}>
              THE AI PROMPT LIBRARY
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }} />
    </AbsoluteFill>
  );
};
