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
  Sequence,
} from "remotion";

const AVATAR = staticFile("avatar.jpg");
const BG_IMAGES = [
  staticFile("images/img1db6ae.jpg"),
  staticFile("images/img2cd9d5.jpg"),
  staticFile("images/cyber_12954.jpg"),
  staticFile("images/cin_19791.jpg"),
  staticFile("images/img97b502.jpg"),
];

const YT_RED = "#FF0000";
const IG_GRADIENT = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";
const TW_BLUE = "#1DA1F2";
const GOLD = "#FFD700";

// Reusable cursor
const Cursor = ({ x, y, pressed }: { x: number; y: number; pressed: boolean }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 999, pointerEvents: "none" }}>
    <svg width="28" height="38" viewBox="0 0 24 32" fill="none">
      <path d="M5 2L5 24L10.5 18.5L15.5 28L19 26.5L14 17L21 17L5 2Z"
        fill={pressed ? "#ccc" : "white"} stroke="black" strokeWidth="1.5" />
    </svg>
  </div>
);

export const ShowcaseReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#0a0a12" }}>
      {/* Sound effects at each style transition */}
      <Sequence from={75} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.7} /></Sequence>
      <Sequence from={120} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={145} durationInFrames={20}><Audio src={staticFile("bell.mp3")} volume={0.9} /></Sequence>
      <Sequence from={225} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.7} /></Sequence>
      <Sequence from={280} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={310} durationInFrames={20}><Audio src={staticFile("bell.mp3")} volume={0.9} /></Sequence>
      <Sequence from={375} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.7} /></Sequence>
      <Sequence from={435} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={465} durationInFrames={20}><Audio src={staticFile("bell.mp3")} volume={0.9} /></Sequence>
      <Sequence from={525} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.7} /></Sequence>
      <Sequence from={555} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.6} /></Sequence>
      <Sequence from={585} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.6} /></Sequence>
      <Sequence from={700} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.7} /></Sequence>
      <Sequence from={850} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.7} /></Sequence>
      <Sequence from={1000} durationInFrames={15}><Audio src={staticFile("pop.mp3")} volume={0.7} /></Sequence>

      {/* ===== INTRO: Title Card (0-75) ===== */}
      <Sequence from={0} durationInFrames={75}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${spring({ frame, fps, config: { stiffness: 100, damping: 14 } })})`,
            textAlign: "center",
          }}>
            <h1 style={{
              fontSize: 72, fontWeight: 900, color: "white", letterSpacing: -2, margin: 0,
              textShadow: "0 0 60px rgba(255,0,0,0.4)",
            }}>
              SUBSCRIBE OVERLAYS
            </h1>
            <p style={{
              fontSize: 28, color: "#aaa", marginTop: 12, fontWeight: 500,
              opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              Animated Lower Thirds & Subscribe Buttons
            </p>
            <div style={{
              marginTop: 20, display: "flex", gap: 12, justifyContent: "center",
              opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              {["Transparent BG", "Sound Effects", "Custom Branding"].map((tag) => (
                <span key={tag} style={{
                  padding: "6px 16px", borderRadius: 20, background: "rgba(255,0,0,0.15)",
                  color: "#ff4444", fontSize: 16, fontWeight: 600, border: "1px solid rgba(255,0,0,0.3)",
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== STYLE 1: Classic YouTube (75-225) ===== */}
      <Sequence from={75} durationInFrames={150}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[0]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
          {/* Style label */}
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 75, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>STYLE 1: Classic</span>
          </div>
          {/* Subscribe card - bigger */}
          <SubscribeCard frame={frame - 75} fps={fps} scale={1.4} bottom={120} />
        </AbsoluteFill>
      </Sequence>

      {/* ===== STYLE 2: Red Bar (225-375) ===== */}
      <Sequence from={225} durationInFrames={150}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[1]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 225, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>STYLE 2: Red Bar</span>
          </div>
          {/* Red bar overlay - bigger */}
          <RedBar frame={frame - 225} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* ===== STYLE 3: Big Avatar (375-525) ===== */}
      <Sequence from={375} durationInFrames={150}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[2]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 375, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>STYLE 3: Big Avatar</span>
          </div>
          <BigAvatar frame={frame - 375} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* ===== STYLE 4: Multi-Platform (525-700) ===== */}
      <Sequence from={525} durationInFrames={175}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[3]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)" }} />
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 525, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>STYLE 4: Multi-Platform</span>
          </div>
          <MultiPlatformDemo frame={frame - 525} fps={fps} />
        </AbsoluteFill>
      </Sequence>

      {/* ===== STYLE 5: Minimal Pill (525+175=700 to 850) ===== */}
      <Sequence from={700} durationInFrames={150}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[0]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }} />
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 700, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>STYLE 5: Minimal Pill</span>
          </div>
          {/* Simple dark pill at bottom center */}
          <div style={{
            position: "absolute", bottom: 80, left: "50%",
            transform: `translateX(-50%) translateY(${interpolate(spring({ frame: frame - 700, fps, config: { stiffness: 80, damping: 14 } }), [0, 1], [100, 0])}px)`,
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(0,0,0,0.85)", borderRadius: 50, padding: "12px 24px 12px 14px",
            backdropFilter: "blur(10px)", boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill={YT_RED}>
              <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5 3-5 3z"/>
            </svg>
            <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid white" }}>
              <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ color: "white", fontSize: 20, fontWeight: 700 }}>AI Injection</span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== STYLE 6: Full Width White Bar (850-1000) ===== */}
      <Sequence from={850} durationInFrames={150}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[2]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65)" }} />
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 850, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>STYLE 6: Full Width Bar</span>
          </div>
          {/* White bar at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
            background: "rgba(255,255,255,0.95)",
            transform: `translateY(${interpolate(spring({ frame: frame - 850, fps, config: { stiffness: 80, damping: 14 } }), [0, 1], [120, 0])}px)`,
            display: "flex", alignItems: "center", padding: "0 40px", gap: 20,
            boxShadow: "0 -4px 30px rgba(0,0,0,0.2)",
          }}>
            {/* Teal accent line at top */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#4ecdc4" }} />
            <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "3px solid #eee", flexShrink: 0 }}>
              <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#222", fontSize: 24, fontWeight: 800 }}>AI Injection</div>
              <div style={{ color: "#888", fontSize: 15 }}>1.79K subscribers</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 20, color: "#555" }}>👍</span>
                <span style={{ color: "#555", fontSize: 16, fontWeight: 600 }}>325K</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 20, color: "#555" }}>👎</span>
                <span style={{ color: "#555", fontSize: 16, fontWeight: 600 }}>18K</span>
              </div>
            </div>
            <div style={{
              padding: "10px 24px", borderRadius: 6, background: YT_RED,
              transform: `scale(${spring({ frame: frame - 870, fps, config: { stiffness: 150, damping: 10 } })})`,
            }}>
              <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Subscribed</span>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill={GOLD}>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== STYLE 7: Neon Glow (1000-1150) ===== */}
      <Sequence from={1000} durationInFrames={150}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[3]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 1000, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>STYLE 7: Neon Glow</span>
          </div>
          {/* Neon style card */}
          <div style={{
            position: "absolute", bottom: 80, left: "50%",
            transform: `translateX(-50%) scale(${spring({ frame: frame - 1000, fps, config: { stiffness: 80, damping: 12 } })})`,
            display: "flex", alignItems: "center", gap: 16,
            background: "rgba(0,0,0,0.8)", borderRadius: 20, padding: "16px 28px",
            border: `2px solid ${YT_RED}`,
            boxShadow: `0 0 20px rgba(255,0,0,0.4), 0 0 60px rgba(255,0,0,0.15), inset 0 0 20px rgba(255,0,0,0.05)`,
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%", overflow: "hidden",
              border: `3px solid ${YT_RED}`, boxShadow: `0 0 15px rgba(255,0,0,0.5)`,
            }}>
              <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ color: "white", fontSize: 24, fontWeight: 800, textShadow: `0 0 10px rgba(255,0,0,0.3)` }}>AI Injection</div>
              <div style={{ color: "#ff6666", fontSize: 14 }}>1.79K subscribers</div>
            </div>
            <div style={{
              padding: "10px 22px", borderRadius: 12, background: "transparent",
              border: `2px solid ${YT_RED}`, boxShadow: `0 0 10px rgba(255,0,0,0.4)`,
              transform: `scale(${spring({ frame: frame - 1020, fps, config: { stiffness: 150, damping: 10 } })})`,
            }}>
              <span style={{ color: YT_RED, fontSize: 16, fontWeight: 700, textShadow: `0 0 8px rgba(255,0,0,0.5)` }}>SUBSCRIBE</span>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill={YT_RED} style={{ filter: `drop-shadow(0 0 6px rgba(255,0,0,0.5))` }}>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== FLOOD SCREEN - Multiple channels at once (1150-1350) ===== */}
      <Sequence from={1150} durationInFrames={200}>
        <AbsoluteFill>
          <Img src={BG_IMAGES[1]} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3)" }} />
          <div style={{
            position: "absolute", top: 30, left: 30, background: "rgba(0,0,0,0.7)", padding: "8px 20px",
            borderRadius: 8, backdropFilter: "blur(10px)",
            opacity: interpolate(frame - 1150, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <span style={{ color: "#4ecdc4", fontSize: 18, fontWeight: 700 }}>WORKS FOR ANY CHANNEL</span>
          </div>
          {/* Flood of different channels */}
          {[
            { name: "MrBeast", subs: "342M", x: 100, y: 150, delay: 0, color: "#FF0000" },
            { name: "PewDiePie", subs: "111M", x: 900, y: 120, delay: 8, color: "#FF0000" },
            { name: "Marques B.", subs: "19.5M", x: 500, y: 280, delay: 4, color: "#FF0000" },
            { name: "Casey Neistat", subs: "12.7M", x: 50, y: 420, delay: 12, color: "#FF0000" },
            { name: "Linus Tech", subs: "16.2M", x: 650, y: 450, delay: 6, color: "#FF0000" },
            { name: "AI Injection", subs: "1.79K", x: 350, y: 580, delay: 10, color: "#4ecdc4" },
            { name: "Your Channel", subs: "??? subs", x: 1050, y: 350, delay: 16, color: "#FFD700" },
            { name: "Tech Review", subs: "5.2M", x: 1200, y: 550, delay: 14, color: "#FF0000" },
            { name: "Gaming Pro", subs: "8.1M", x: 200, y: 700, delay: 18, color: "#FF0000" },
            { name: "Food Nation", subs: "3.4M", x: 750, y: 680, delay: 20, color: "#FF0000" },
            { name: "Fitness Hub", subs: "2.1M", x: 1100, y: 750, delay: 22, color: "#FF0000" },
            { name: "Music Daily", subs: "7.8M", x: 450, y: 800, delay: 24, color: "#FF0000" },
          ].map((ch, i) => {
            const s = spring({ frame: frame - 1150 - ch.delay, fps, config: { stiffness: 120, damping: 12 } });
            const isSpecial = ch.color !== "#FF0000";
            return (
              <div key={i} style={{
                position: "absolute", left: ch.x, top: ch.y,
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(33,33,33,0.95)", borderRadius: 40, padding: "8px 18px 8px 10px",
                border: isSpecial ? `2px solid ${ch.color}` : "1px solid rgba(255,255,255,0.15)",
                boxShadow: isSpecial ? `0 0 20px ${ch.color}40` : "0 4px 15px rgba(0,0,0,0.4)",
                transform: `scale(${s * (isSpecial ? 1.15 : 1)}) rotate(${interpolate(s, [0, 1], [10 * (i % 2 === 0 ? 1 : -1), 0])}deg)`,
                opacity: s,
                zIndex: isSpecial ? 20 : 10,
              }}>
                <div style={{
                  width: isSpecial ? 44 : 36, height: isSpecial ? 44 : 36, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${ch.color}80, ${ch.color})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isSpecial ? 18 : 14, color: "white", fontWeight: 900,
                  border: isSpecial ? `2px solid ${ch.color}` : "none",
                }}>
                  {ch.name[0]}
                </div>
                <div>
                  <div style={{ color: "white", fontSize: isSpecial ? 16 : 14, fontWeight: 700 }}>{ch.name}</div>
                  <div style={{ color: "#aaa", fontSize: 11 }}>{ch.subs}</div>
                </div>
                <div style={{
                  padding: "4px 12px", borderRadius: 14,
                  background: isSpecial ? ch.color : "white",
                  color: isSpecial ? "white" : "#0f0f0f",
                  fontSize: 11, fontWeight: 700,
                }}>
                  {isSpecial ? "★ SUBSCRIBE" : "Subscribe"}
                </div>
              </div>
            );
          })}
          {/* Pop sounds for the flood */}
          {[0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((d) => (
            <Sequence key={d} from={1150 + d} durationInFrames={15}>
              <Audio src={staticFile("pop.mp3")} volume={0.4} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* ===== OUTRO CTA (1350-1550) ===== */}
      <Sequence from={1350} durationInFrames={200}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={BG_IMAGES[4]} style={{
            position: "absolute", width: "100%", height: "100%", objectFit: "cover",
            filter: "brightness(0.2) blur(5px)",
          }} />
          <div style={{ textAlign: "center", zIndex: 10 }}>
            <h1 style={{
              fontSize: 64, fontWeight: 900, color: "white", margin: 0,
              opacity: interpolate(frame - 700, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame - 700, [0, 20], [30, 0], { extrapolateRight: "clamp" })}px)`,
            }}>
              CUSTOM MADE FOR YOU
            </h1>
            <p style={{
              fontSize: 24, color: "#aaa", margin: "12px 0 30px",
              opacity: interpolate(frame - 700, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              Any channel. Any platform. Any style.
            </p>
            <div style={{
              display: "inline-flex", gap: 20,
              opacity: interpolate(frame - 700, [35, 50], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              {["Transparent Background", "Sound Effects", "Unlimited Revisions", "24hr Delivery"].map((item, i) => (
                <div key={item} style={{
                  padding: "10px 20px", borderRadius: 12, background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  transform: `scale(${spring({ frame: frame - 700 - 35 - i * 5, fps, config: { stiffness: 150, damping: 12 } })})`,
                }}>
                  <span style={{ color: "white", fontSize: 16, fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 40,
              transform: `scale(${spring({ frame: frame - 770, fps, config: { stiffness: 120, damping: 10 } })})`,
            }}>
              <div style={{
                padding: "16px 50px", borderRadius: 50, background: YT_RED, display: "inline-block",
              }}>
                <span style={{ color: "white", fontSize: 28, fontWeight: 800 }}>ORDER NOW ON FIVERR</span>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ===== INLINE DEMO COMPONENTS (bigger versions) =====

const SubscribeCard = ({ frame, fps, scale, bottom }: { frame: number; fps: number; scale: number; bottom: number }) => {
  const slideIn = spring({ frame, fps, config: { stiffness: 80, damping: 14 } });
  const subClicked = frame >= 50;
  const bellClicked = frame >= 90;
  const bellWiggle = bellClicked ? Math.sin((frame - 90) * 1) * interpolate(frame - 90, [0, 25], [15, 0], { extrapolateRight: "clamp" }) : 0;
  const cursorX = interpolate(frame, [25, 45, 55, 85], [600, 480, 480, 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorY = interpolate(frame, [25, 45, 55, 85], [300, bottom + 10, bottom + 10, bottom + 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pressing = (frame >= 48 && frame <= 52) || (frame >= 88 && frame <= 92);

  return (
    <>
      <div style={{
        position: "absolute", bottom, left: "50%",
        transform: `translateX(-50%) translateY(${interpolate(slideIn, [0, 1], [200, 0])}px) scale(${scale})`,
        display: "flex", alignItems: "center", gap: 0, zIndex: 20,
      }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "3px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 2 }}>
          <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 16, background: "#212121", borderRadius: "0 40px 40px 0",
          padding: "10px 20px 10px 50px", marginLeft: -35, zIndex: 1,
          transform: `scaleX(${spring({ frame: frame - 5, fps, config: { stiffness: 100, damping: 14 } })})`,
          transformOrigin: "left",
        }}>
          <div>
            <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>AI Injection</div>
            <div style={{ color: "#aaa", fontSize: 13 }}>1.79K subscribers</div>
          </div>
          <div style={{
            padding: "8px 18px", borderRadius: 20, fontWeight: 700, fontSize: 15,
            background: subClicked ? "#333" : "white", color: subClicked ? "#aaa" : "#0f0f0f",
            transform: `scale(${subClicked && frame < 60 ? spring({ frame: frame - 50, fps, config: { stiffness: 300, damping: 8 } }) : 1})`,
          }}>
            {subClicked ? "Subscribed" : "Subscribe"}
          </div>
          <div style={{ transform: `rotate(${bellWiggle}deg)` }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill={bellClicked ? GOLD : "white"}>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
        </div>
      </div>
      {frame >= 25 && frame < 120 && <Cursor x={cursorX} y={cursorY} pressed={pressing} />}
    </>
  );
};

const RedBar = ({ frame, fps }: { frame: number; fps: number }) => {
  const slideIn = spring({ frame, fps, config: { stiffness: 100, damping: 16 } });
  const subClicked = frame >= 55;
  const bellClicked = frame >= 95;
  const bellWiggle = bellClicked ? Math.sin((frame - 95) * 1) * interpolate(frame - 95, [0, 25], [15, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <div style={{
      position: "absolute", top: interpolate(slideIn, [0, 1], [-120, 0]), left: 0, right: 0,
      height: 100, background: subClicked ? "#CC0000" : YT_RED,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 30, padding: "0 40px",
      boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
    }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: "2px solid white" }}>
        <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <span style={{ color: "white", fontSize: 32, fontWeight: 800, letterSpacing: 3 }}>
        {subClicked ? "SUBSCRIBED" : "SUBSCRIBE"}
      </span>
      <div style={{ transform: `rotate(${bellWiggle}deg)` }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill={bellClicked ? GOLD : "white"}>
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
      </div>
    </div>
  );
};

const BigAvatar = ({ frame, fps }: { frame: number; fps: number }) => {
  const slideIn = spring({ frame, fps, config: { stiffness: 70, damping: 14 } });
  const subClicked = frame >= 60;
  const bellClicked = frame >= 100;
  const bellWiggle = bellClicked ? Math.sin((frame - 100) * 1) * interpolate(frame - 100, [0, 25], [15, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <div style={{
      position: "absolute", bottom: 60, left: 60,
      transform: `translateY(${interpolate(slideIn, [0, 1], [200, 0])}px)`,
      display: "flex", alignItems: "flex-end", gap: 20,
    }}>
      <div style={{ width: 160, height: 160, borderRadius: "50%", overflow: "hidden", border: `6px solid ${YT_RED}`, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
        <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div>
        <div style={{
          background: subClicked ? "#666" : "#333", padding: "8px 24px", borderRadius: 8, marginBottom: 10,
          display: "inline-block",
        }}>
          <span style={{ color: "white", fontSize: 18, fontWeight: 700 }}>
            {subClicked ? "SUBSCRIBED" : "SUBSCRIBE"}
          </span>
          <span style={{ marginLeft: 10, transform: `rotate(${bellWiggle}deg)`, display: "inline-block" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={bellClicked ? GOLD : "white"} style={{ verticalAlign: "middle" }}>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </span>
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 800 }}>AI Injection</div>
        <div style={{ color: "#ccc", fontSize: 16 }}>1.79K subscribers</div>
      </div>
    </div>
  );
};

const MultiPlatformDemo = ({ frame, fps }: { frame: number; fps: number }) => {
  const platforms = [
    { name: "AI Injection", handle: "Subscribe", icon: "YT", color: YT_RED, btnColor: YT_RED, delay: 0, fromLeft: true },
    { name: "@aiinjection", handle: "Follow", icon: "IG", color: "#E1306C", btnColor: "#0095F6", delay: 30, fromLeft: false },
    { name: "@AIInjection", handle: "Follow", icon: "TW", color: TW_BLUE, btnColor: TW_BLUE, delay: 60, fromLeft: true },
  ];

  return (
    <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {platforms.map((p, i) => {
        const s = spring({ frame: frame - p.delay, fps, config: { stiffness: 80, damping: 14 } });
        const dir = p.fromLeft ? -1 : 1;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(255,255,255,0.95)", borderRadius: 16, padding: "10px 20px", minWidth: 420,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            transform: `translateX(${interpolate(s, [0, 1], [dir * 600, 0])}px)`,
            opacity: s,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: p.icon === "IG" ? 10 : "50%",
              background: p.icon === "IG" ? IG_GRADIENT : p.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "white", fontSize: 16, fontWeight: 900 }}>{p.icon === "YT" ? "▶" : p.icon}</span>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid #eee" }}>
              <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ color: "#222", fontSize: 18, fontWeight: 700, flex: 1 }}>{p.name}</span>
            <div style={{ padding: "6px 18px", borderRadius: 20, background: p.btnColor }}>
              <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{p.handle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
