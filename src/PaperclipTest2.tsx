/**
 * PaperclipTest2.tsx
 * Built on Opus 4.7 — same CineStruct JSON, real cinematic depth
 * 1920x1080 @ 30fps — 600 frames (20s)
 *
 * Focus: 3D perspective, colour grading, parallax, true orbital camera feel
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

// ─── Palette (from JSON) ──────────────────────────────────────────────────────
const NEON = "#00FF41";
const RED = "#FF4500";
const YELLOW = "#FFD700";
const CYAN = "#00D4FF";
const BG = "#050507";
const CARD = "#0a0a0d";
const MONO = "'Courier New', monospace";
const SANS = "Arial Black, Arial, sans-serif";

// ─── Global: Teal & Orange LUT emulation ─────────────────────────────────────
// Simulates the "Teal and Orange Blockbuster" grade + ARRI LogC4 lift
const ColorGrade: React.FC = () => (
  <>
    {/* Teal cast in shadows */}
    <AbsoluteFill style={{
      background: "linear-gradient(135deg,rgba(0,60,90,0.12) 0%,transparent 50%,rgba(0,40,60,0.08) 100%)",
      mixBlendMode: "multiply",
      pointerEvents: "none",
      zIndex: 196,
    }} />
    {/* Orange lift in highlights */}
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse at 50% 50%,rgba(255,140,50,0.04) 0%,transparent 60%)",
      mixBlendMode: "screen",
      pointerEvents: "none",
      zIndex: 195,
    }} />
    {/* Gentle gamma lift — film stock softness */}
    <AbsoluteFill style={{
      background: "rgba(20,25,30,0.03)",
      mixBlendMode: "lighten",
      pointerEvents: "none",
      zIndex: 194,
    }} />
  </>
);

// ─── Global: Letterbox (cinematic crop) ──────────────────────────────────────
const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50, background: "#000", zIndex: 210, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "#000", zIndex: 210, pointerEvents: "none" }} />
  </>
);

// ─── Global: Film Grain (SVG turbulence) ──────────────────────────────────────
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (frame * 13) % 11;
  return (
    <AbsoluteFill style={{
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' seed='${seed}' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)' opacity='0.5'/></svg>")`,
      backgroundSize: "300px 300px",
      mixBlendMode: "overlay",
      opacity: 0.14,
      pointerEvents: "none",
      zIndex: 193,
    }} />
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse at 50% 52%,transparent 35%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0.9) 100%)",
    pointerEvents: "none",
    zIndex: 197,
  }} />
);

// ─── Scene 1: Presenter — real depth, bokeh, hair rim light ──────────────────
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const breath = 1 + Math.sin(frame * 0.05) * 0.003;

  // Bokeh orbs (background practicals, out of focus)
  const bokeh = React.useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    x: (i * 53) % 95 + 2.5,
    y: (i * 31) % 90 + 5,
    size: 30 + (i * 17) % 90,
    color: i % 4 === 0 ? "rgba(255,80,30,0.5)" : i % 4 === 1 ? "rgba(0,255,80,0.35)" : i % 4 === 2 ? "rgba(255,180,80,0.25)" : "rgba(60,180,255,0.2)",
    blur: 18 + (i * 3) % 20,
    drift: 0.02 + (i % 5) * 0.005,
  })), []);

  const logoIn = spring({ frame: frame - 5, fps, from: -320, to: 0, config: { stiffness: 95, damping: 20 } });
  const logoOp = interpolate(frame, [3, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn }}>
      {/* Layer 1: Wooden slat wall (far back, in focus) */}
      <AbsoluteFill style={{
        backgroundImage: `
          linear-gradient(90deg,
            rgba(35,22,10,0.0) 0%,
            rgba(55,32,15,0.25) 50%,
            rgba(35,22,10,0.0) 100%
          ),
          repeating-linear-gradient(90deg,
            rgba(50,30,15,0.3) 0px,
            rgba(50,30,15,0.3) 18px,
            rgba(25,15,8,0.5) 18px,
            rgba(25,15,8,0.5) 22px,
            rgba(70,42,20,0.2) 22px,
            rgba(70,42,20,0.2) 45px
          )
        `,
        filter: "blur(4px)",
        opacity: 0.7,
      }} />

      {/* Layer 2: Bokeh practicals (deep background, very blurred) */}
      {bokeh.map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${b.x + Math.sin(frame * b.drift) * 0.5}%`,
          top: `${b.y}%`,
          width: b.size, height: b.size,
          borderRadius: "50%",
          background: b.color,
          filter: `blur(${b.blur}px)`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Layer 3: Rim light — RED left side (hits shoulder & hair) */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse at -5% 40%,rgba(255,60,10,0.4) 0%,rgba(200,40,0,0.15) 30%,transparent 55%),
          linear-gradient(90deg,rgba(255,50,0,0.12) 0%,transparent 35%)
        `,
        pointerEvents: "none",
      }} />

      {/* Layer 4: Rim light — GREEN right side (hits shoulder & hair) */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse at 105% 40%,rgba(0,255,65,0.32) 0%,rgba(0,180,40,0.1) 30%,transparent 55%),
          linear-gradient(270deg,rgba(0,200,60,0.08) 0%,transparent 35%)
        `,
        pointerEvents: "none",
      }} />

      {/* Layer 5: Key light fill (top, warm) */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% -8%,rgba(255,230,200,0.14) 0%,transparent 40%)",
        pointerEvents: "none",
      }} />

      {/* Layer 6: Shallow DOF — darken corners, focus center */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 55%,transparent 15%,rgba(5,5,7,0.45) 60%,rgba(5,5,7,0.7) 90%)",
        pointerEvents: "none",
      }} />

      {/* Centerpiece — animated vector badge (replaces presenter) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: `translate(-50%,-50%) scale(${breath})`,
        transformOrigin: "center",
      }}>
        {/* Outer rotating ring */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 520, height: 520,
          transform: `translate(-50%,-50%) rotate(${frame * 0.4}deg)`,
          borderRadius: "50%",
          border: `1px dashed rgba(0,255,65,0.25)`,
          boxShadow: `0 0 60px rgba(0,255,65,0.08), inset 0 0 40px rgba(0,255,65,0.04)`,
        }} />
        {/* Inner counter-rotating ring */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 400, height: 400,
          transform: `translate(-50%,-50%) rotate(${-frame * 0.6}deg)`,
          borderRadius: "50%",
          border: `1px solid rgba(255,60,0,0.3)`,
          boxShadow: `0 0 40px rgba(255,60,0,0.1)`,
        }} />
        {/* Core glow disc */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 300, height: 300,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle,rgba(0,255,65,0.18) 0%,rgba(0,180,50,0.05) 40%,transparent 70%)`,
          filter: "blur(6px)",
        }} />
        {/* Giant paperclip emoji centre */}
        <div style={{
          position: "relative",
          fontSize: 180,
          lineHeight: 1,
          filter: `drop-shadow(0 0 35px ${NEON}) drop-shadow(0 0 70px rgba(0,255,65,0.5))`,
          textAlign: "center",
          zIndex: 2,
        }}>📎</div>
      </div>

      {/* Logo lower-third — styled like a real broadcast ID */}
      <div style={{
        position: "absolute",
        left: 70 + logoIn,
        bottom: 140,
        opacity: logoOp,
      }}>
        {/* Accent bar */}
        <div style={{
          width: 6, height: 160,
          background: `linear-gradient(180deg,${NEON},rgba(0,255,65,0.3))`,
          boxShadow: `0 0 20px ${NEON}`,
          position: "absolute",
          left: 0, top: 0,
        }} />
        {/* Card */}
        <div style={{
          marginLeft: 6,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(14px)",
          padding: "20px 32px",
          minWidth: 340,
          borderTop: "1px solid rgba(0,255,65,0.25)",
          borderRight: "1px solid rgba(0,255,65,0.15)",
          borderBottom: "1px solid rgba(0,255,65,0.25)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            color: NEON, fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em",
            marginBottom: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
            <span>FEATURED · LIVE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <span style={{ fontSize: 38, filter: `drop-shadow(0 0 14px ${NEON})` }}>📎</span>
            <div style={{ color: "#fff", fontFamily: SANS, fontSize: 40, fontWeight: 900, letterSpacing: "-0.015em", textShadow: `0 0 28px rgba(0,255,65,0.35)` }}>
              Paperclip
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO, fontSize: 13, letterSpacing: "0.04em" }}>
            Open-source AI agent framework
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Logo reveal — perspective grid, fog, 3D push-in ────────────────
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Camera push-in: scale + subtle Z translate feel
  const pushScale = interpolate(frame, [0, 180], [0.85, 1.18], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Logo emerges
  const logoScale = spring({ frame: frame - 10, fps, from: 0.4, to: 1, config: { stiffness: 140, damping: 18 } });
  const logoOp = interpolate(frame, [8, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stars counter
  const starsVal = Math.round(interpolate(frame, [50, 150], [0, 38000], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }));
  const starsOp = interpolate(frame, [48, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const starsY = spring({ frame: frame - 48, fps, from: 30, to: 0, config: { stiffness: 120, damping: 18 } });

  const tagOp = interpolate(frame, [95, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = spring({ frame: frame - 95, fps, from: 30, to: 0, config: { stiffness: 120, damping: 18 } });

  const pulse = 0.3 + Math.sin(frame * 0.08) * 0.15;

  // Particles at different depths (parallax)
  const particles = React.useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    x: (i * 47) % 100,
    baseY: (i * 71) % 100,
    size: 1 + (i % 4),
    depth: 0.3 + ((i * 3) % 10) * 0.08,
    opacity: 0.15 + ((i * 5) % 7) * 0.05,
  })), []);

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 50%,#021208 0%,#010905 35%,#000200 100%)`,
      opacity: fadeIn,
      perspective: "1200px",
    }}>
      {/* Perspective floor grid — recedes into distance */}
      <div style={{
        position: "absolute",
        left: "50%", top: "55%",
        width: "300%", height: "80%",
        transform: `translateX(-50%) rotateX(72deg) scale(${pushScale * 1.2})`,
        transformOrigin: "center top",
        backgroundImage: `
          linear-gradient(rgba(0,255,65,0.25) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,255,65,0.25) 1px,transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 30%,rgba(0,0,0,1) 80%,rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 30%,rgba(0,0,0,1) 80%,rgba(0,0,0,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Fog layer */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 70%,rgba(0,100,40,0.25) 0%,transparent 50%)`,
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      {/* Pulsing radial glow behind logo */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 42%,rgba(0,255,65,${pulse * 0.22}) 0%,rgba(0,180,50,${pulse * 0.08}) 25%,transparent 55%)`,
        transform: `scale(${pushScale})`,
        pointerEvents: "none",
      }} />

      {/* Parallax particles */}
      {particles.map((p, i) => {
        const y = p.baseY - (frame * p.depth * 0.5) % 100;
        const currentScale = pushScale * (0.7 + p.depth * 0.5);
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${y < 0 ? y + 100 : y}%`,
            width: p.size * currentScale,
            height: p.size * currentScale,
            borderRadius: "50%",
            background: NEON,
            opacity: p.opacity * fadeIn,
            boxShadow: `0 0 ${p.size * 2}px ${NEON}`,
            pointerEvents: "none",
          }} />
        );
      })}

      {/* Main content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transform: `scale(${pushScale})`,
      }}>
        <div style={{ transform: `scale(${logoScale})`, opacity: logoOp, textAlign: "center" }}>
          <div style={{
            fontSize: 130,
            filter: `drop-shadow(0 0 50px ${NEON}) drop-shadow(0 0 100px rgba(0,255,65,0.3))`,
            lineHeight: 1,
            marginBottom: 4,
          }}>📎</div>
          <div style={{
            color: "#ffffff", fontFamily: SANS,
            fontSize: 104, fontWeight: 900,
            letterSpacing: "-0.03em", lineHeight: 0.88,
            textShadow: `0 0 80px rgba(0,255,65,0.55), 0 0 160px rgba(0,255,65,0.2)`,
          }}>Paperclip</div>
          <div style={{
            width: "100%", height: 2,
            background: `linear-gradient(90deg,transparent 20%,${NEON} 50%,transparent 80%)`,
            marginTop: 18,
            boxShadow: `0 0 20px rgba(0,255,65,0.6)`,
          }} />
        </div>

        <div style={{
          opacity: starsOp,
          transform: `translateY(${starsY}px)`,
          display: "flex", alignItems: "center", gap: 16,
          background: "rgba(0,40,15,0.6)",
          border: `1px solid rgba(0,255,65,0.5)`,
          borderRadius: 70,
          padding: "16px 42px",
          marginTop: 42,
          backdropFilter: "blur(8px)",
          boxShadow: `0 0 40px rgba(0,255,65,0.12), inset 0 0 20px rgba(0,255,65,0.05)`,
        }}>
          <span style={{ fontSize: 30, filter: `drop-shadow(0 0 14px ${YELLOW})` }}>⭐</span>
          <span style={{
            color: YELLOW, fontFamily: SANS, fontSize: 42, fontWeight: 900,
            textShadow: `0 0 28px rgba(255,215,0,0.8)`,
            fontVariantNumeric: "tabular-nums",
          }}>
            {starsVal.toLocaleString()}
          </span>
          <span style={{
            color: "rgba(255,215,0,0.6)", fontFamily: MONO, fontSize: 16, letterSpacing: "0.2em",
            marginLeft: 4,
          }}>STARS</span>
        </div>

        <div style={{
          opacity: tagOp, transform: `translateY(${tagY}px)`,
          marginTop: 28,
          color: "rgba(255,255,255,0.4)", fontFamily: MONO, fontSize: 19,
          letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          Multi-Agent AI Framework · Open Source
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Org Chart — true orbital rotation, god rays, drawn connections ─
type Node = { id: string; emoji: string; label: string; sub: string; x: number; y: number };

const N: Node[] = [
  { id: "ceo", emoji: "🤖", label: "CEO", sub: "Orchestrator", x: 960, y: 170 },
  { id: "w", emoji: "✍️", label: "Writer", sub: "Content Writer", x: 380, y: 370 },
  { id: "e", emoji: "📝", label: "Editor", sub: "Content Editor", x: 640, y: 370 },
  { id: "s", emoji: "🔍", label: "SEO", sub: "SEO Agent", x: 900, y: 370 },
  { id: "sm", emoji: "📱", label: "Social", sub: "Social Manager", x: 1160, y: 370 },
  { id: "d", emoji: "📊", label: "Data", sub: "Analyst", x: 1420, y: 370 },
  { id: "qa", emoji: "✅", label: "QA", sub: "Review", x: 510, y: 570 },
  { id: "p", emoji: "🚀", label: "Deploy", sub: "Publisher", x: 900, y: 570 },
];

const CEO = N[0];

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // SLOW ORBITING DRONE — actual rotation of the chart in 3D space
  const orbitY = interpolate(frame, [0, 180], [-6, 6], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const orbitX = interpolate(frame, [0, 180], [2, -2], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const ChartNode: React.FC<{ node: Node; delay: number }> = ({ node, delay }) => {
    const isCEO = node.id === "ceo";
    const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sc = spring({ frame: frame - delay, fps, from: 0.3, to: 1, config: { stiffness: 220, damping: 19 } });
    const pulse = 0.5 + Math.sin(frame * 0.055 + delay * 0.1) * 0.3;
    const w = isCEO ? 220 : 170;
    const h = isCEO ? 90 : 74;

    return (
      <div style={{
        position: "absolute",
        left: node.x - w / 2, top: node.y - h / 2,
        width: w, height: h,
        opacity: op,
        transform: `scale(${sc})`,
        transformOrigin: "center",
      }}>
        <div style={{
          width: "100%", height: "100%",
          background: isCEO
            ? "linear-gradient(135deg,rgba(0,255,65,0.18) 0%,rgba(0,180,50,0.08) 100%)"
            : "linear-gradient(135deg,rgba(8,16,10,0.96) 0%,rgba(4,10,6,0.98) 100%)",
          border: `${isCEO ? 2 : 1}px solid rgba(0,255,65,${isCEO ? 1 : 0.55})`,
          borderRadius: 12,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 ${isCEO ? 50 : 24}px rgba(0,255,65,${pulse * (isCEO ? 0.45 : 0.2)}), inset 0 0 20px rgba(0,255,65,${isCEO ? 0.08 : 0.02})`,
          padding: "10px 16px",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ fontSize: isCEO ? 26 : 20, lineHeight: 1, filter: `drop-shadow(0 0 8px ${NEON})` }}>{node.emoji}</div>
          <div style={{ color: "#fff", fontFamily: SANS, fontSize: isCEO ? 20 : 16, fontWeight: 900, marginTop: 4 }}>{node.label}</div>
          <div style={{ color: `rgba(0,255,65,0.75)`, fontFamily: MONO, fontSize: isCEO ? 11 : 10, marginTop: 2, letterSpacing: "0.05em" }}>{node.sub}</div>
        </div>
      </div>
    );
  };

  // Animated connection — particle travels along the line
  const Connection: React.FC<{ from: Node; to: Node; delay: number }> = ({ from, to, delay }) => {
    const progress = interpolate(frame, [delay, delay + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fromY = from.y + 45;
    const toY = to.y - 37;
    const ex = from.x + (to.x - from.x) * progress;
    const ey = fromY + (toY - fromY) * progress;

    // Travelling data pulse along the line
    const pulseProgress = ((frame - delay - 22) * 0.02) % 1;
    const pulseX = from.x + (to.x - from.x) * pulseProgress;
    const pulseY = fromY + (toY - fromY) * pulseProgress;
    const showPulse = frame > delay + 25 && pulseProgress > 0 && pulseProgress < 1;

    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
        <defs>
          <linearGradient id={`g-${from.id}-${to.id}`} x1={from.x} y1={fromY} x2={to.x} y2={toY} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(0,255,65,0.1)" />
            <stop offset="50%" stopColor="rgba(0,255,65,0.7)" />
            <stop offset="100%" stopColor="rgba(0,255,65,0.1)" />
          </linearGradient>
        </defs>
        <line x1={from.x} y1={fromY} x2={ex} y2={ey}
          stroke={`url(#g-${from.id}-${to.id})`} strokeWidth={1.5} strokeLinecap="round" />
        {showPulse && (
          <circle cx={pulseX} cy={pulseY} r={3} fill={NEON}
            filter={`drop-shadow(0 0 6px ${NEON})`} opacity={0.9} />
        )}
      </svg>
    );
  };

  const delays = [5, 32, 42, 52, 62, 72, 82, 92];

  return (
    <AbsoluteFill style={{ background: "#020805", opacity: fadeIn, perspective: "2000px" }}>
      {/* God rays — real volumetric beams from above */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% -10%,rgba(0,255,65,0.18) 0%,rgba(0,120,30,0.04) 30%,transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Angled light shafts */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.4 }}>
        <defs>
          <linearGradient id="shaft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,255,65,0.25)" />
            <stop offset="100%" stopColor="rgba(0,255,65,0)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <polygon
            key={i}
            points={`${700 + i * 80},0 ${720 + i * 80},0 ${660 + i * 110},1080 ${580 + i * 110},1080`}
            fill="url(#shaft)"
          />
        ))}
      </svg>

      {/* Chart container — slowly orbits on Y axis */}
      <div style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
        transform: `rotateY(${orbitY}deg) rotateX(${orbitX}deg)`,
        transformOrigin: "center center",
      }}>
        {/* Connections from CEO to each */}
        {N.slice(1).map((n, i) => (
          <Connection key={`c-${n.id}`} from={CEO} to={n} delay={delays[i + 1] - 8} />
        ))}
        {/* Level 2 */}
        <Connection from={N[1]} to={N[6]} delay={delays[6] + 8} />
        <Connection from={N[3]} to={N[7]} delay={delays[7] + 8} />

        {/* Nodes */}
        {N.map((n, i) => <ChartNode key={n.id} node={n} delay={delays[i]} />)}
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)",
        textAlign: "center",
        opacity: interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{ color: "rgba(0,255,65,0.4)", fontFamily: MONO, fontSize: 12, letterSpacing: "0.3em" }}>
          /// ARCHITECTURE
        </div>
        <div style={{ color: "#fff", fontFamily: SANS, fontSize: 28, fontWeight: 900, marginTop: 6, letterSpacing: "-0.01em" }}>
          Multi-Agent Framework
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Floating UI — 3D perspective, parallax slide ────────────────────
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Three layers — different slide speeds + different Z depths
  const frontSlide = interpolate(frame, [0, 55], [2000, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const midSlide = interpolate(frame, [12, 72], [2000, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const backSlide = interpolate(frame, [25, 90], [2000, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Subtle camera truck — whole scene drifts
  const trackDrift = interpolate(frame, [0, 180], [-20, 20], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const presenterFade = interpolate(frame, [135, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const windowsFade = interpolate(frame, [130, 160], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const Win: React.FC<{
    title: string; accent: string; slideX: number;
    zDepth: number; tiltY?: number;
    children: React.ReactNode; width: number;
  }> = ({ title, accent, slideX, zDepth, tiltY = 0, children, width }) => (
    <div style={{
      width,
      transform: `translate3d(${slideX}px,0,${zDepth}px) rotateY(${tiltY}deg)`,
      opacity: windowsFade * (zDepth > -100 ? 1 : 0.85),
      filter: zDepth < -50 ? "brightness(0.85)" : "none",
      flexShrink: 0,
    }}>
      <div style={{
        background: CARD,
        border: `1px solid rgba(255,255,255,0.1)`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: `0 20px 80px rgba(0,0,0,0.85), 0 0 40px rgba(0,255,65,0.06)`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "14px 22px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: MONO, fontSize: 13, marginLeft: 10 }}>{title}</span>
        </div>
        <div style={{ padding: "24px 28px" }}>{children}</div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn, perspective: "1400px" }}>
      {/* Centered layout with parallax slide + subtle truck */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        transformStyle: "preserve-3d",
        transform: `translateX(${trackDrift}px)`,
      }}>
        <div style={{ display: "flex", gap: 26, alignItems: "flex-start", transformStyle: "preserve-3d" }}>

          {/* Front — Code (fastest, tilted in toward camera) */}
          <Win title="agent.py" accent={NEON} slideX={frontSlide} zDepth={60} tiltY={-3} width={580}>
            <div style={{ fontFamily: MONO, fontSize: 16 }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ color: "#569cd6" }}>class </span>
                <span style={{ color: "#4ec9b0" }}>PaperclipAgent</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>:</span>
              </div>
              <div style={{ paddingLeft: 26, marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>def </span>
                <span style={{ color: NEON }}>__init__</span>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>(self, role, tools):</span>
              </div>
              {["self.role = role", "self.tools = tools", "self.memory = []", "self.llm = Claude()"].map((l, i) => (
                <div key={i} style={{ paddingLeft: 52, color: "rgba(255,255,255,0.38)", marginBottom: 5 }}>{l}</div>
              ))}
              <div style={{ paddingLeft: 26, margin: "12px 0 8px" }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>def </span>
                <span style={{ color: NEON }}>run</span>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>(self, task):</span>
              </div>
              <div style={{ paddingLeft: 52, color: "rgba(255,255,255,0.38)", marginBottom: 5 }}>plan = self.think(task)</div>
              <div style={{ paddingLeft: 52, color: "rgba(255,255,255,0.38)" }}>return self.execute(plan)</div>
            </div>
          </Win>

          {/* Mid — Dashboard (center, flat) */}
          <Win title="live-dashboard.app" accent={RED} slideX={midSlide} zDepth={0} width={560}>
            <div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                color: "rgba(255,255,255,0.4)", fontFamily: MONO, fontSize: 12,
                letterSpacing: "0.12em", marginBottom: 18,
              }}>
                <span>● AGENT PIPELINE — LIVE</span>
                <span style={{ color: NEON }}>● RUNNING</span>
              </div>
              {[
                { name: "CEO Agent", status: "Orchestrating", color: NEON, pct: 100 },
                { name: "Writer Agent", status: "Generating", color: CYAN, pct: 72 },
                { name: "Editor Agent", status: "Reviewing", color: YELLOW, pct: 45 },
                { name: "SEO Agent", status: "Queued", color: "rgba(255,255,255,0.35)", pct: 0 },
              ].map((a, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ color: "rgba(255,255,255,0.78)", fontFamily: MONO, fontSize: 14 }}>{a.name}</span>
                    <span style={{ color: a.color, fontFamily: MONO, fontSize: 13 }}>● {a.status}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
                    <div style={{
                      height: "100%", width: `${a.pct}%`,
                      background: a.pct > 0 ? `linear-gradient(90deg,${a.color},${a.color}dd)` : "transparent",
                      borderRadius: 3,
                      boxShadow: a.pct > 0 ? `0 0 10px ${a.color}` : "none",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Win>

          {/* Back — Metrics (slowest, tilted away from camera, darker) */}
          <Win title="metrics.json" accent={YELLOW} slideX={backSlide} zDepth={-120} tiltY={4} width={460}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {[
                { k: "Tasks Done", v: "1,247", c: NEON },
                { k: "Tokens", v: "2.4M", c: YELLOW },
                { k: "Latency", v: "340ms", c: CYAN },
                { k: "Cost Saved", v: "$847", c: NEON },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "18px 20px",
                }}>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: MONO, fontSize: 11, marginBottom: 8, letterSpacing: "0.08em" }}>
                    {m.k}
                  </div>
                  <div style={{
                    color: m.c, fontFamily: MONO, fontSize: 30, fontWeight: 700,
                    textShadow: `0 0 18px ${m.c}60`,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {m.v}
                  </div>
                </div>
              ))}
            </div>
          </Win>
        </div>
      </div>

      {/* End card — pure graphics, no presenter */}
      {presenterFade > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: presenterFade, zIndex: 10 }}>
          {/* Dark backdrop with radial glow */}
          <AbsoluteFill style={{
            background: `radial-gradient(ellipse at 50% 50%,#021208 0%,#010905 40%,#000200 100%)`,
          }} />
          {/* God-ray shafts */}
          <AbsoluteFill style={{
            background: "radial-gradient(ellipse at 50% -10%,rgba(0,255,65,0.2) 0%,rgba(0,120,30,0.05) 30%,transparent 60%)",
            pointerEvents: "none",
          }} />
          {/* Rotating accent ring behind text */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            width: 800, height: 800,
            transform: `translate(-50%,-50%) rotate(${frame * 0.3}deg)`,
            borderRadius: "50%",
            border: `1px dashed rgba(0,255,65,0.2)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: interpolate(frame, [155, 178], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 68,
                filter: `drop-shadow(0 0 24px ${NEON})`,
                lineHeight: 1,
                marginBottom: 14,
              }}>📎</div>
              <div style={{
                color: "#ffffff", fontFamily: SANS,
                fontSize: 72, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1,
                textShadow: `0 0 40px rgba(255,255,255,0.3)`,
              }}>
                Build Smarter
              </div>
              <div style={{
                color: NEON, fontFamily: SANS,
                fontSize: 72, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1,
                textShadow: `0 0 60px rgba(0,255,65,0.7)`,
                marginTop: 6,
              }}>
                Ship Faster
              </div>
              <div style={{
                width: 480, height: 3,
                background: `linear-gradient(90deg,transparent,${NEON} 50%,transparent)`,
                margin: "26px auto 0",
                boxShadow: `0 0 20px ${NEON}`,
              }} />
              <div style={{
                color: "rgba(255,255,255,0.45)",
                fontFamily: MONO, fontSize: 18,
                letterSpacing: "0.25em", textTransform: "uppercase",
                marginTop: 22,
              }}>
                Paperclip · Open Source
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const PaperclipTest2: React.FC = () => {
  const frame = useCurrentFrame();

  const isFlash = (frame >= 58 && frame <= 64) || (frame >= 238 && frame <= 244) || (frame >= 418 && frame <= 424);
  const flashOp = isFlash
    ? interpolate((frame - 58) % 7, [0, 1, 6], [0.55, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={60}><Scene1 /></Sequence>
      <Sequence from={60} durationInFrames={180}><Scene2 /></Sequence>
      <Sequence from={240} durationInFrames={180}><Scene3 /></Sequence>
      <Sequence from={420} durationInFrames={180}><Scene4 /></Sequence>

      {flashOp > 0 && (
        <AbsoluteFill style={{ background: NEON, opacity: flashOp, pointerEvents: "none", zIndex: 192 }} />
      )}

      <FilmGrain />
      <ColorGrade />
      <Vignette />
      <Letterbox />
    </AbsoluteFill>
  );
};
