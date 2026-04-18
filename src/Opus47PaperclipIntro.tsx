/**
 * Opus47PaperclipIntro.tsx
 * CineStruct JSON → Remotion (Opus 4.7 + Paperclip AI)
 * 1920x1080 @ 30fps — 600 frames (20s)
 * Palette: #1A1A1A / #FF6B00 (Cyber Orange) / #00A3FF (Tech Blue)
 * Presenter scene skipped — replaced with feature highlight beats
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

const ORANGE = "#FF6B00";
const BLUE = "#00A3FF";
const BG = "#1A1A1A";
const BG_DEEP = "#0a0a0c";
const CARD = "#141416";
const WHITE = "#ffffff";
const MONO = "'Courier New', monospace";
const SANS = "Arial Black, Arial, sans-serif";

// ─── Shared overlays ──────────────────────────────────────────────────────────
const ColorGrade: React.FC = () => (
  <>
    <AbsoluteFill style={{
      background: "linear-gradient(135deg,rgba(0,80,130,0.10) 0%,transparent 50%,rgba(0,40,70,0.08) 100%)",
      mixBlendMode: "multiply",
      pointerEvents: "none",
      zIndex: 196,
    }} />
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse at 50% 50%,rgba(255,120,40,0.05) 0%,transparent 65%)",
      mixBlendMode: "screen",
      pointerEvents: "none",
      zIndex: 195,
    }} />
  </>
);

const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (frame * 13) % 11;
  return (
    <AbsoluteFill style={{
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' seed='${seed}' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)' opacity='0.5'/></svg>")`,
      backgroundSize: "300px 300px",
      mixBlendMode: "overlay",
      opacity: 0.11,
      pointerEvents: "none",
      zIndex: 193,
    }} />
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse at 50% 52%,transparent 38%,rgba(0,0,0,0.35) 72%,rgba(0,0,0,0.85) 100%)",
    pointerEvents: "none",
    zIndex: 197,
  }} />
);

const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50, background: "#000", zIndex: 210, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "#000", zIndex: 210, pointerEvents: "none" }} />
  </>
);

// ─── Scene 1 (0-5s, 150 frames): Opus 4.7 crash-zoom logo montage ─────────────
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background — animated diagonal lines + radial pulse
  const bgPulse = 0.4 + Math.sin(frame * 0.12) * 0.2;

  // Stage 1 (0-30): Opus 4.7 logo crash-zoom in
  const logoScale = interpolate(frame, [0, 14], [8, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const logoOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoExit = interpolate(frame, [40, 52], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stage 2 (45-85): "Claude Code" chip flashes
  const chipIn = spring({ frame: frame - 48, fps, from: -600, to: 0, config: { stiffness: 220, damping: 16 } });
  const chipOp = interpolate(frame, [48, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chipExit = interpolate(frame, [82, 92], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stage 3 (88-150): Feature text rapid-fire
  const feat1 = interpolate(frame, [90, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const feat1Exit = interpolate(frame, [115, 122], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const feat2 = interpolate(frame, [118, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Flash transitions at 42, 85
  const flash = (frame >= 42 && frame <= 48) || (frame >= 85 && frame <= 91)
    ? interpolate(frame % 7, [0, 2, 6], [0.7, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Diagonal speed lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(-30deg,transparent 0,transparent 40px,rgba(255,107,0,0.04) 40px,rgba(255,107,0,0.04) 41px)`,
        transform: `translateX(${(frame * 3) % 80}px)`,
        pointerEvents: "none",
      }} />

      {/* Radial pulse */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 50%,rgba(255,107,0,${bgPulse * 0.15}) 0%,rgba(0,163,255,${bgPulse * 0.1}) 35%,transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Stage 1: Opus 4.7 logo */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: logoOp * logoExit,
      }}>
        <div style={{ transform: `scale(${logoScale})`, textAlign: "center" }}>
          <div style={{
            color: "rgba(255,255,255,0.35)",
            fontFamily: MONO, fontSize: 18, letterSpacing: "0.5em",
            marginBottom: 18,
          }}>ANTHROPIC PRESENTS</div>
          <div style={{
            fontFamily: SANS,
            fontSize: 168, fontWeight: 900,
            lineHeight: 0.9, letterSpacing: "-0.04em",
            background: `linear-gradient(135deg,${WHITE} 0%,${ORANGE} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: `drop-shadow(0 0 40px rgba(255,107,0,0.5))`,
          }}>Opus 4.7</div>
          <div style={{
            width: 380, height: 4,
            background: `linear-gradient(90deg,transparent,${ORANGE} 30%,${BLUE} 70%,transparent)`,
            margin: "14px auto 0",
            boxShadow: `0 0 24px ${ORANGE}`,
          }} />
          <div style={{
            color: BLUE,
            fontFamily: MONO, fontSize: 18, letterSpacing: "0.35em",
            marginTop: 18,
            textTransform: "uppercase",
          }}>1M Context · Frontier Model</div>
        </div>
      </div>

      {/* Stage 2: Claude Code chip */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: `translate(calc(-50% + ${chipIn}px),-50%)`,
        opacity: chipOp * chipExit,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 20,
          background: "rgba(10,10,12,0.85)",
          border: `2px solid ${ORANGE}`,
          borderRadius: 18,
          padding: "28px 52px",
          backdropFilter: "blur(8px)",
          boxShadow: `0 0 80px rgba(255,107,0,0.35), inset 0 0 30px rgba(255,107,0,0.05)`,
        }}>
          <div style={{
            fontSize: 60,
            filter: `drop-shadow(0 0 18px ${ORANGE})`,
          }}>◆</div>
          <div>
            <div style={{
              color: "rgba(255,107,0,0.85)",
              fontFamily: MONO, fontSize: 14, letterSpacing: "0.3em",
              marginBottom: 4,
            }}>NOW AVAILABLE IN</div>
            <div style={{
              color: WHITE, fontFamily: SANS,
              fontSize: 68, fontWeight: 900, letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>Claude Code</div>
          </div>
        </div>
      </div>

      {/* Stage 3: Feature rapid-fire */}
      <div style={{
        position: "absolute",
        left: "50%", top: "45%",
        transform: "translate(-50%,-50%)",
        textAlign: "center",
      }}>
        <div style={{
          opacity: feat1 * feat1Exit,
          transform: `scale(${0.9 + feat1 * 0.1})`,
        }}>
          <div style={{
            color: BLUE,
            fontFamily: MONO, fontSize: 20, letterSpacing: "0.4em",
            marginBottom: 12,
          }}>FEATURE</div>
          <div style={{
            color: WHITE, fontFamily: SANS,
            fontSize: 108, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.95,
            textShadow: `0 0 50px rgba(0,163,255,0.5)`,
          }}>1M Context</div>
        </div>
      </div>

      <div style={{
        position: "absolute",
        left: "50%", top: "45%",
        transform: "translate(-50%,-50%)",
        textAlign: "center",
      }}>
        <div style={{
          opacity: feat2,
          transform: `scale(${0.9 + feat2 * 0.1})`,
        }}>
          <div style={{
            color: ORANGE,
            fontFamily: MONO, fontSize: 20, letterSpacing: "0.4em",
            marginBottom: 12,
          }}>BUILT FOR</div>
          <div style={{
            color: WHITE, fontFamily: SANS,
            fontSize: 108, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.95,
            textShadow: `0 0 50px rgba(255,107,0,0.5)`,
          }}>AI Agents</div>
        </div>
      </div>

      {/* Flash overlay */}
      {flash > 0 && (
        <AbsoluteFill style={{ background: WHITE, opacity: flash, pointerEvents: "none" }} />
      )}
    </AbsoluteFill>
  );
};

// ─── Scene 2 (5-12s, 210 frames): Feature cards ───────────────────────────────
type Feat = { emoji: string; title: string; sub: string; color: string; side: "l" | "r" };

const FEATURES: Feat[] = [
  { emoji: "🧠", title: "1M Tokens", sub: "Massive context window", color: BLUE, side: "l" },
  { emoji: "⚡", title: "Faster", sub: "Opus-class reasoning, Sonnet speed", color: ORANGE, side: "r" },
  { emoji: "🎯", title: "Agent-First", sub: "Built for multi-step tool use", color: BLUE, side: "l" },
  { emoji: "🔧", title: "Claude Code", sub: "Terminal-native, IDE-ready", color: ORANGE, side: "r" },
];

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtle drift
  const drift = interpolate(frame, [0, 210], [-15, 15], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const Card: React.FC<{ feat: Feat; delay: number; i: number }> = ({ feat, delay, i }) => {
    const slideX = feat.side === "l"
      ? spring({ frame: frame - delay, fps, from: -800, to: 0, config: { stiffness: 130, damping: 20 } })
      : spring({ frame: frame - delay, fps, from: 800, to: 0, config: { stiffness: 130, damping: 20 } });
    const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glow = 0.4 + Math.sin(frame * 0.07 + i) * 0.2;

    return (
      <div style={{
        position: "absolute",
        left: feat.side === "l" ? "8%" : "auto",
        right: feat.side === "r" ? "8%" : "auto",
        top: 120 + i * 175,
        transform: `translateX(${slideX}px)`,
        opacity: op,
        display: "flex", alignItems: "center", gap: 24,
      }}>
        {feat.side === "l" && (
          <div style={{
            width: 100, height: 100,
            borderRadius: 18,
            background: `linear-gradient(135deg,${feat.color}33 0%,${feat.color}11 100%)`,
            border: `1px solid ${feat.color}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 52,
            filter: `drop-shadow(0 0 20px ${feat.color})`,
            boxShadow: `0 0 40px ${feat.color}${Math.round(glow * 60).toString(16).padStart(2, "0")}`,
          }}>{feat.emoji}</div>
        )}
        <div style={{
          background: "rgba(10,10,12,0.85)",
          border: `1px solid ${feat.color}55`,
          borderLeft: feat.side === "l" ? `4px solid ${feat.color}` : `1px solid ${feat.color}55`,
          borderRight: feat.side === "r" ? `4px solid ${feat.color}` : `1px solid ${feat.color}55`,
          borderRadius: 14,
          padding: "26px 38px",
          minWidth: 480,
          backdropFilter: "blur(10px)",
          boxShadow: `0 0 50px ${feat.color}22`,
        }}>
          <div style={{
            color: feat.color, fontFamily: MONO, fontSize: 13, letterSpacing: "0.28em",
            marginBottom: 8,
          }}>/// 0{i + 1}</div>
          <div style={{
            color: WHITE, fontFamily: SANS,
            fontSize: 44, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1,
            marginBottom: 6,
          }}>{feat.title}</div>
          <div style={{
            color: "rgba(255,255,255,0.55)",
            fontFamily: MONO, fontSize: 16, letterSpacing: "0.04em",
          }}>{feat.sub}</div>
        </div>
        {feat.side === "r" && (
          <div style={{
            width: 100, height: 100,
            borderRadius: 18,
            background: `linear-gradient(135deg,${feat.color}33 0%,${feat.color}11 100%)`,
            border: `1px solid ${feat.color}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 52,
            filter: `drop-shadow(0 0 20px ${feat.color})`,
            boxShadow: `0 0 40px ${feat.color}${Math.round(glow * 60).toString(16).padStart(2, "0")}`,
          }}>{feat.emoji}</div>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: BG_DEEP, opacity: fadeIn }}>
      {/* Soft bokeh practicals */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse at 85% 20%,rgba(255,107,0,0.22) 0%,transparent 35%),
          radial-gradient(ellipse at 15% 80%,rgba(0,163,255,0.18) 0%,transparent 40%)
        `,
        filter: "blur(30px)",
        transform: `translateX(${drift}px)`,
        pointerEvents: "none",
      }} />

      {/* Title band */}
      <div style={{
        position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)",
        textAlign: "center",
        opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          color: "rgba(255,255,255,0.35)",
          fontFamily: MONO, fontSize: 15, letterSpacing: "0.4em",
          marginBottom: 4,
        }}>WHY IT MATTERS</div>
        <div style={{
          color: WHITE, fontFamily: SANS,
          fontSize: 36, fontWeight: 900, letterSpacing: "-0.01em",
        }}>The leap from 4.6 → 4.7</div>
      </div>

      {FEATURES.map((f, i) => (
        <Card key={f.title} feat={f} delay={12 + i * 18} i={i} />
      ))}
    </AbsoluteFill>
  );
};

// ─── Scene 3 (12-20s, 240 frames): Paperclip dashboard screen recording ───────
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Camera push-in on the dashboard
  const push = interpolate(frame, [0, 240], [0.88, 1.08], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Cursor path — moves to CEO at ~f40, then down to Team at ~f130
  const cursorX = interpolate(frame,
    [0, 40, 80, 130, 200],
    [1400, 640, 640, 640, 640],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );
  const cursorY = interpolate(frame,
    [0, 40, 80, 130, 200],
    [900, 330, 330, 555, 555],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );
  const cursorOp = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Highlight rings
  const ceoHL = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ceoHLFade = interpolate(frame, [120, 135], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const teamHL = interpolate(frame, [130, 148], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Team members animate in after cursor hovers
  const members = [
    { name: "Writer", emoji: "✍️" },
    { name: "Editor", emoji: "📝" },
    { name: "SEO", emoji: "🔍" },
    { name: "Social", emoji: "📱" },
  ];

  return (
    <AbsoluteFill style={{ background: "#050608", opacity: fadeIn }}>
      {/* Dashboard "screen" framed with browser chrome */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: `translate(-50%,-50%) scale(${push})`,
        width: 1680, height: 900,
        borderRadius: 16,
        background: CARD,
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.9), 0 0 80px rgba(0,163,255,0.08)`,
        overflow: "hidden",
      }}>
        {/* Browser chrome */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 22px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
            <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
          ))}
          <div style={{
            marginLeft: 18,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 8,
            padding: "6px 18px",
            color: "rgba(255,255,255,0.5)",
            fontFamily: MONO, fontSize: 13,
          }}>paperclip.ai/dashboard</div>
        </div>

        {/* Sidebar */}
        <div style={{
          position: "absolute", left: 0, top: 55, width: 240, bottom: 0,
          background: "rgba(0,0,0,0.3)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "24px 20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
            <span style={{ fontSize: 26, filter: `drop-shadow(0 0 10px ${ORANGE})` }}>📎</span>
            <span style={{ color: WHITE, fontFamily: SANS, fontSize: 20, fontWeight: 900 }}>Paperclip</span>
          </div>
          {["Dashboard","Agents","Workflows","Analytics","Settings"].map((l, i) => (
            <div key={l} style={{
              color: i === 0 ? WHITE : "rgba(255,255,255,0.45)",
              fontFamily: MONO, fontSize: 14,
              padding: "12px 14px",
              borderRadius: 8,
              background: i === 0 ? `${ORANGE}22` : "transparent",
              borderLeft: i === 0 ? `3px solid ${ORANGE}` : "3px solid transparent",
              marginBottom: 4,
            }}>{l}</div>
          ))}
        </div>

        {/* Main content — CEO node at top, team below */}
        <div style={{ position: "absolute", left: 240, top: 55, right: 0, bottom: 0, padding: "32px 40px" }}>
          <div style={{
            color: "rgba(255,255,255,0.35)", fontFamily: MONO, fontSize: 13, letterSpacing: "0.2em",
            marginBottom: 6,
          }}>AGENT PIPELINE</div>
          <div style={{ color: WHITE, fontFamily: SANS, fontSize: 32, fontWeight: 900, marginBottom: 28 }}>
            Content Team
          </div>

          {/* CEO card */}
          <div style={{
            position: "relative",
            margin: "0 auto 30px",
            width: 280,
            background: `linear-gradient(135deg,${ORANGE}22 0%,${ORANGE}08 100%)`,
            border: `2px solid ${ORANGE}`,
            borderRadius: 14,
            padding: "20px 28px",
            textAlign: "center",
            boxShadow: ceoHL > 0 ? `0 0 ${40 * ceoHLFade}px ${ORANGE}, inset 0 0 20px ${ORANGE}44` : "none",
          }}>
            <div style={{ fontSize: 32, filter: `drop-shadow(0 0 12px ${ORANGE})` }}>🤖</div>
            <div style={{ color: WHITE, fontFamily: SANS, fontSize: 22, fontWeight: 900, marginTop: 4 }}>CEO</div>
            <div style={{ color: `${ORANGE}cc`, fontFamily: MONO, fontSize: 12, letterSpacing: "0.15em", marginTop: 2 }}>ORCHESTRATOR</div>
            {/* Highlight ring animation */}
            {ceoHL > 0 && (
              <div style={{
                position: "absolute", inset: -8 - ceoHL * 4,
                border: `2px solid ${ORANGE}`,
                borderRadius: 18,
                opacity: ceoHL * ceoHLFade * 0.7,
                pointerEvents: "none",
              }} />
            )}
          </div>

          {/* Connecting lines + team */}
          <div style={{ position: "relative", height: 50, margin: "0 auto", width: 600 }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {[150, 250, 350, 450].map((x, i) => (
                <line key={i} x1={300} y1={0} x2={x} y2={50} stroke={`${BLUE}88`} strokeWidth={1.5} />
              ))}
            </svg>
          </div>

          <div style={{
            display: "flex", justifyContent: "center", gap: 18,
            position: "relative",
          }}>
            {members.map((m, i) => {
              const delay = 148 + i * 8;
              const op = interpolate(frame, [delay, delay + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const sc = spring({ frame: frame - delay, fps, from: 0.5, to: 1, config: { stiffness: 180, damping: 18 } });
              return (
                <div key={m.name} style={{
                  width: 130,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${BLUE}55`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  textAlign: "center",
                  opacity: op,
                  transform: `scale(${sc})`,
                  boxShadow: teamHL > 0 ? `0 0 20px ${BLUE}55` : "none",
                }}>
                  <div style={{ fontSize: 26 }}>{m.emoji}</div>
                  <div style={{ color: WHITE, fontFamily: SANS, fontSize: 16, fontWeight: 900, marginTop: 4 }}>{m.name}</div>
                  <div style={{ color: `${BLUE}cc`, fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", marginTop: 2 }}>AGENT</div>
                </div>
              );
            })}
          </div>

          {/* Team highlight ring */}
          {teamHL > 0 && (
            <div style={{
              position: "absolute",
              left: "50%", top: 340,
              width: 600, height: 120,
              transform: "translateX(-50%)",
              border: `2px solid ${BLUE}`,
              borderRadius: 16,
              opacity: teamHL * 0.6,
              boxShadow: `0 0 40px ${BLUE}`,
              pointerEvents: "none",
            }} />
          )}
        </div>
      </div>

      {/* Cursor */}
      <div style={{
        position: "absolute",
        left: cursorX, top: cursorY,
        width: 30, height: 30,
        opacity: cursorOp,
        pointerEvents: "none",
        zIndex: 50,
        filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.8))`,
      }}>
        <svg viewBox="0 0 30 30" width={30} height={30}>
          <path d="M2 2 L2 22 L8 17 L12 26 L16 24 L12 15 L20 15 Z"
            fill={WHITE} stroke="#000" strokeWidth={1.5} />
        </svg>
      </div>

      {/* Click ripple */}
      {frame >= 40 && frame <= 65 && (
        <div style={{
          position: "absolute",
          left: cursorX - 20, top: cursorY - 20,
          width: 40 + (frame - 40) * 3, height: 40 + (frame - 40) * 3,
          borderRadius: "50%",
          border: `2px solid ${ORANGE}`,
          opacity: Math.max(0, 1 - (frame - 40) / 25),
          pointerEvents: "none",
          zIndex: 49,
        }} />
      )}
      {frame >= 130 && frame <= 155 && (
        <div style={{
          position: "absolute",
          left: cursorX - 20, top: cursorY - 20,
          width: 40 + (frame - 130) * 3, height: 40 + (frame - 130) * 3,
          borderRadius: "50%",
          border: `2px solid ${BLUE}`,
          opacity: Math.max(0, 1 - (frame - 130) / 25),
          pointerEvents: "none",
          zIndex: 49,
        }} />
      )}

      {/* Bottom CTA */}
      <div style={{
        position: "absolute",
        left: "50%", bottom: 40,
        transform: "translateX(-50%)",
        textAlign: "center",
        opacity: interpolate(frame, [195, 215], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          color: "rgba(255,255,255,0.45)",
          fontFamily: MONO, fontSize: 14, letterSpacing: "0.3em",
        }}>PAPERCLIP · POWERED BY OPUS 4.7</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const Opus47PaperclipIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={150}><Scene1 /></Sequence>
      <Sequence from={150} durationInFrames={210}><Scene2 /></Sequence>
      <Sequence from={360} durationInFrames={240}><Scene3 /></Sequence>

      <FilmGrain />
      <ColorGrade />
      <Vignette />
      <Letterbox />
    </AbsoluteFill>
  );
};
