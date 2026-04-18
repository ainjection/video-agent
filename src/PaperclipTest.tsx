/**
 * PaperclipTest.tsx
 * Enhanced rebuild of PaperclipIntro — deeper cyberpunk aesthetic, more cinematic
 * Same JSON source, pushed visual quality
 * 1920x1080 @ 30fps — 600 frames (20s)
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

const NEON = "#00FF41";
const RED = "#FF4500";
const YELLOW = "#FFD700";
const CYAN = "#00D4FF";
const BG = "#060608";
const CARD = "#0d0d10";
const MONO = "'Courier New', monospace";
const SANS = "Arial Black, Arial, sans-serif";

// ─── Global overlays ──────────────────────────────────────────────────────────
const ScanLines = () => (
  <AbsoluteFill style={{
    background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 6px)",
    pointerEvents: "none", zIndex: 200,
  }} />
);

const Vignette = () => (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse at 50% 50%,transparent 38%,rgba(0,0,0,0.85) 100%)",
    pointerEvents: "none", zIndex: 199,
  }} />
);

const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  // Shift background position each frame to simulate grain
  const offset = (frame * 47) % 200;
  return (
    <AbsoluteFill style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px",
      backgroundPosition: `${offset}px ${offset}px`,
      pointerEvents: "none", zIndex: 198, opacity: 0.4,
    }} />
  );
};

// ─── Scene 1: Presenter — deeper bokeh, stronger rim lights ──────────────────
const Scene1Presenter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const breath = 1 + Math.sin(frame * 0.045) * 0.004;

  // Bokeh circles — practical background lights
  const bokehCircles = React.useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      x: 5 + ((i * 61) % 90),
      y: 5 + ((i * 37) % 90),
      size: 40 + ((i * 23) % 80),
      color: i % 3 === 0 ? RED : i % 3 === 1 ? NEON : "rgba(255,255,200,0.8)",
      opacity: 0.04 + ((i * 7) % 6) * 0.01,
    })), []);

  const logoSlide = spring({ frame: frame - 8, fps, from: -280, to: 0, config: { stiffness: 100, damping: 22 } });
  const logoOp = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn }}>
      {/* Wooden slat texture — finer, more realistic */}
      <AbsoluteFill style={{
        backgroundImage: "repeating-linear-gradient(90deg,rgba(45,28,12,0.12) 0px,rgba(45,28,12,0.12) 16px,rgba(55,35,15,0.08) 16px,rgba(55,35,15,0.08) 32px,transparent 32px,transparent 48px)",
        pointerEvents: "none",
      }} />

      {/* Bokeh practical lights bg */}
      {bokehCircles.map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${b.x}%`, top: `${b.y}%`,
          width: b.size, height: b.size,
          borderRadius: "50%",
          background: b.color,
          opacity: b.opacity,
          filter: "blur(20px)",
          pointerEvents: "none",
        }} />
      ))}

      {/* Strong red rim — left */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at -10% 45%,rgba(255,50,0,0.35) 0%,rgba(200,30,0,0.1) 35%,transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Strong green rim — right */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 110% 45%,rgba(0,255,65,0.28) 0%,rgba(0,180,50,0.08) 35%,transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Soft key light — top center */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% -10%,rgba(255,240,220,0.12) 0%,transparent 50%)",
        pointerEvents: "none",
      }} />

      {/* Shallow DOF blur — background only (overlay) */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 40%,transparent 20%,rgba(6,6,8,0.5) 80%)",
        pointerEvents: "none",
      }} />

      {/* Presenter silhouette — more detailed */}
      <div style={{
        position: "absolute", left: "50%", bottom: 0,
        transform: `translateX(-50%) scale(${breath})`,
        transformOrigin: "bottom center",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* Head */}
        <div style={{
          width: 100, height: 112,
          borderRadius: "50% 50% 40% 40%",
          background: "rgba(5,5,7,0.98)",
          boxShadow: `-14px 0 50px rgba(255,50,0,0.25), 14px 0 50px rgba(0,255,65,0.2), 0 -10px 30px rgba(255,240,220,0.08)`,
          marginBottom: 0,
        }} />
        {/* Neck */}
        <div style={{ width: 36, height: 32, background: "rgba(5,5,7,0.98)" }} />
        {/* Shoulders — more defined */}
        <div style={{
          width: 260, height: 60,
          borderRadius: "50% 50% 0 0",
          background: "rgba(5,5,7,0.98)",
          boxShadow: `-18px 0 70px rgba(255,50,0,0.2), 18px 0 70px rgba(0,255,65,0.15)`,
        }} />
        {/* Torso */}
        <div style={{
          width: 220, height: 360,
          background: "rgba(5,5,7,0.98)",
          boxShadow: `-10px 0 50px rgba(255,50,0,0.15), 10px 0 50px rgba(0,255,65,0.12)`,
        }} />
      </div>

      {/* Logo card — left */}
      <div style={{
        position: "absolute", left: 70 + logoSlide, top: "50%",
        transform: "translateY(-55%)",
        opacity: logoOp,
      }}>
        <div style={{
          background: "rgba(0,0,0,0.82)",
          border: `1px solid rgba(0,255,65,0.5)`,
          borderLeft: `3px solid ${NEON}`,
          borderRadius: 12,
          padding: "22px 32px",
          backdropFilter: "blur(12px)",
          boxShadow: `0 0 40px rgba(0,255,65,0.12), 0 20px 60px rgba(0,0,0,0.5)`,
        }}>
          <div style={{ color: NEON, fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", marginBottom: 8, opacity: 0.7 }}>
            FEATURED TOOL
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 36, filter: `drop-shadow(0 0 12px ${NEON})` }}>📎</span>
            <div style={{ color: "#fff", fontFamily: SANS, fontSize: 36, fontWeight: 900, textShadow: `0 0 24px rgba(0,255,65,0.4)` }}>
              Paperclip
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontFamily: MONO, fontSize: 13 }}>
            AI Agent Framework
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: NEON, boxShadow: `0 0 8px ${NEON}` }} />
            <span style={{ color: NEON, fontFamily: MONO, fontSize: 12 }}>Live</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Logo reveal — particle field, stronger push ─────────────────────
const Scene2Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stronger push-in
  const pushScale = interpolate(frame, [0, 180], [0.9, 1.12], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const logoScale = spring({ frame: frame - 8, fps, from: 0.5, to: 1, config: { stiffness: 180, damping: 20 } });
  const logoOp = interpolate(frame, [5, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const stars = Math.round(interpolate(frame, [45, 145], [0, 38000], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }));
  const starsOp = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tagOp = interpolate(frame, [90, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = spring({ frame: frame - 90, fps, from: 40, to: 0, config: { stiffness: 130, damping: 18 } });

  // Floating particles
  const particles = React.useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: ((i * 43) % 100),
      baseY: ((i * 67) % 100),
      size: 1 + ((i * 3) % 3),
      speed: 0.15 + ((i * 2) % 5) * 0.06,
      opacity: 0.1 + ((i * 7) % 4) * 0.06,
    })), []);

  const pulseGlow = 0.3 + Math.sin(frame * 0.07) * 0.12;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 50%, #020f04 0%, #010804 40%, #000300 100%)`,
      opacity: fadeIn,
    }}>
      {/* Animated radial pulse */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 50%,rgba(0,255,65,${pulseGlow * 0.14}) 0%,rgba(0,180,50,${pulseGlow * 0.05}) 30%,transparent 65%)`,
        transform: `scale(${pushScale})`,
        pointerEvents: "none",
      }} />

      {/* Grid lines — subtle */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(rgba(0,255,65,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.04) 1px,transparent 1px)`,
        backgroundSize: "80px 80px",
        transform: `scale(${pushScale})`,
        pointerEvents: "none",
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => {
        const y = p.baseY - (frame * p.speed) % 100;
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${y < 0 ? y + 100 : y}%`,
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: NEON,
            opacity: p.opacity * fadeIn,
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
        {/* Logo mark */}
        <div style={{ transform: `scale(${logoScale})`, opacity: logoOp, textAlign: "center" }}>
          <div style={{
            fontSize: 110,
            filter: `drop-shadow(0 0 40px ${NEON}) drop-shadow(0 0 80px rgba(0,255,65,0.25))`,
            lineHeight: 1,
          }}>📎</div>
          <div style={{
            color: "#ffffff",
            fontFamily: SANS,
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: "-0.025em",
            lineHeight: 0.9,
            textShadow: `0 0 60px rgba(0,255,65,0.6), 0 0 120px rgba(0,255,65,0.2)`,
            marginTop: 8,
          }}>Paperclip</div>
          {/* Accent line */}
          <div style={{
            width: "100%", height: 3,
            background: `linear-gradient(90deg,transparent,${NEON},transparent)`,
            marginTop: 16,
            boxShadow: `0 0 20px rgba(0,255,65,0.5)`,
          }} />
        </div>

        {/* Stars badge */}
        <div style={{
          opacity: starsOp,
          display: "flex", alignItems: "center", gap: 16,
          background: "rgba(0,255,65,0.06)",
          border: `1px solid rgba(0,255,65,0.4)`,
          borderRadius: 60,
          padding: "14px 36px",
          marginTop: 36,
          boxShadow: `0 0 30px rgba(0,255,65,0.1)`,
        }}>
          <span style={{ fontSize: 28, filter: `drop-shadow(0 0 12px ${YELLOW})` }}>⭐</span>
          <span style={{
            color: YELLOW, fontFamily: SANS, fontSize: 38, fontWeight: 900,
            textShadow: `0 0 24px rgba(255,215,0,0.7)`,
          }}>
            {stars.toLocaleString()} stars
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: tagOp, transform: `translateY(${tagY}px)`, marginTop: 24,
          color: "rgba(255,255,255,0.45)", fontFamily: MONO, fontSize: 18,
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}>
          Open-Source Multi-Agent Framework
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Org Chart — drawn connections, orbital drift ────────────────────
type Node = { id: string; emoji: string; label: string; sub: string; x: number; y: number };

const NODES: Node[] = [
  { id: "ceo", emoji: "🤖", label: "CEO", sub: "Orchestrator", x: 960, y: 160 },
  { id: "w", emoji: "✍️", label: "Writer", sub: "Content Writer", x: 380, y: 360 },
  { id: "e", emoji: "📝", label: "Editor", sub: "Content Editor", x: 640, y: 360 },
  { id: "s", emoji: "🔍", label: "SEO", sub: "SEO Agent", x: 900, y: 360 },
  { id: "sm", emoji: "📱", label: "Social", sub: "Social Mgr", x: 1160, y: 360 },
  { id: "da", emoji: "📊", label: "Data", sub: "Analyst", x: 1420, y: 360 },
  { id: "qa", emoji: "✅", label: "QA", sub: "Review Agent", x: 510, y: 560 },
  { id: "pub", emoji: "🚀", label: "Deploy", sub: "Publisher", x: 900, y: 560 },
];

const CEO = NODES[0];

const Scene3OrgChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const driftX = Math.sin(frame * 0.012) * 12;
  const driftY = Math.cos(frame * 0.016) * 7;

  const ChartNode: React.FC<{ node: Node; delay: number }> = ({ node, delay }) => {
    const isCEO = node.id === "ceo";
    const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sc = spring({ frame: frame - delay, fps, from: 0.3, to: 1, config: { stiffness: 240, damping: 20 } });
    const pulse = 0.5 + Math.sin(frame * 0.05 + delay * 0.15) * 0.25;
    const w = isCEO ? 200 : 160;
    const h = isCEO ? 80 : 66;

    return (
      <div style={{
        position: "absolute",
        left: node.x - w / 2, top: node.y - h / 2,
        opacity: op, transform: `scale(${sc})`, transformOrigin: "center",
      }}>
        <div style={{
          width: w, height: h,
          background: isCEO ? `rgba(0,255,65,0.1)` : "rgba(6,14,8,0.95)",
          border: `${isCEO ? 2 : 1}px solid rgba(0,255,65,${isCEO ? 1 : 0.55})`,
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 ${isCEO ? 40 : 20}px rgba(0,255,65,${pulse * (isCEO ? 0.35 : 0.18)})`,
          padding: "8px 14px",
        }}>
          <div style={{ fontSize: isCEO ? 22 : 18, lineHeight: 1 }}>{node.emoji}</div>
          <div style={{ color: "#fff", fontFamily: SANS, fontSize: isCEO ? 18 : 15, fontWeight: 900, marginTop: 3 }}>{node.label}</div>
          <div style={{ color: `rgba(0,255,65,0.7)`, fontFamily: MONO, fontSize: 10, marginTop: 2 }}>{node.sub}</div>
        </div>
      </div>
    );
  };

  const Connection: React.FC<{ from: Node; to: Node; delay: number }> = ({ from, to, delay }) => {
    const progress = interpolate(frame, [delay, delay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dx = to.x - from.x, dy = to.y - from.y;
    const ex = from.x + dx * progress;
    const ey = from.y + dy * progress;
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
        <line x1={from.x} y1={from.y + 40} x2={ex} y2={Math.min(ey, to.y - 33)}
          stroke={`rgba(0,255,65,${0.45 * progress})`} strokeWidth={1.5} />
      </svg>
    );
  };

  const delays = [5, 35, 45, 55, 65, 75, 85, 90, 100];

  return (
    <AbsoluteFill style={{ background: "#030a04", opacity: fadeIn }}>
      {/* God rays */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% -5%,rgba(0,255,65,0.1) 0%,rgba(0,120,30,0.03) 40%,transparent 65%)",
        pointerEvents: "none",
      }} />
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: 0, left: `${30 + i * 8}%`,
          width: 2, height: "100%",
          background: `linear-gradient(180deg,rgba(0,255,65,${0.04 + i * 0.01}),transparent)`,
          transform: `rotate(${-8 + i * 3}deg)`,
          transformOrigin: "top center",
          pointerEvents: "none",
        }} />
      ))}

      <div style={{ position: "absolute", inset: 0, transform: `translate(${driftX}px,${driftY}px)` }}>
        {NODES.slice(1).map((n, i) => <Connection key={n.id} from={CEO} to={n} delay={delays[i + 1] - 10} />)}
        <Connection from={NODES[1]} to={NODES[6]} delay={delays[7] - 10} />
        <Connection from={NODES[3]} to={NODES[7]} delay={delays[8] - 10} />
        {NODES.map((n, i) => <ChartNode key={n.id} node={n} delay={delays[i]} />)}
      </div>

      <div style={{
        position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)",
        color: "rgba(0,255,65,0.35)", fontFamily: MONO, fontSize: 13, letterSpacing: "0.22em",
        opacity: interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        MULTI-AGENT ARCHITECTURE
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Floating UI — parallax depth, overlapping windows ───────────────
const Scene4UI: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Three layers with different slide speeds = parallax
  const fastSlide = interpolate(frame, [0, 50], [1920, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const midSlide = interpolate(frame, [15, 70], [1920, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const slowSlide = interpolate(frame, [30, 90], [1920, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const presenterFade = interpolate(frame, [138, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const windowsFade = interpolate(frame, [135, 160], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const Win: React.FC<{ title: string; accent: string; slideX: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
    title, accent, slideX, style, children,
  }) => (
    <div style={{
      transform: `translateX(${slideX}px)`,
      opacity: windowsFade,
      ...style,
    }}>
      <div style={{
        background: CARD,
        border: `1px solid rgba(255,255,255,0.09)`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: `0 16px 80px rgba(0,0,0,0.8),0 0 40px rgba(0,255,65,0.06)`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "14px 20px",
          background: "rgba(255,255,255,0.035)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: MONO, fontSize: 12, marginLeft: 10 }}>{title}</span>
        </div>
        <div style={{ padding: "24px 28px" }}>{children}</div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn }}>
      {/* Centered layout with parallax */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Layer 1 — Code (fastest) */}
          <Win title="agent.py" accent={NEON} slideX={fastSlide} style={{ width: 580 }}>
            <div style={{ fontFamily: MONO, fontSize: 16 }}>
              {[
                { t: "class ", hl: "#569cd6", rest: "PaperclipAgent:", end: "" },
              ].map((_, i) => null)}
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: "#569cd6" }}>class </span>
                <span style={{ color: "#4ec9b0" }}>PaperclipAgent</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>:</span>
              </div>
              <div style={{ paddingLeft: 26, marginBottom: 6 }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>def </span>
                <span style={{ color: NEON }}>__init__</span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>(self, role, tools):</span>
              </div>
              {["self.role = role", "self.tools = tools", "self.memory = []", "self.llm = Claude()"].map((l, i) => (
                <div key={i} style={{ paddingLeft: 52, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{l}</div>
              ))}
              <div style={{ paddingLeft: 26, margin: "8px 0 6px" }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>def </span>
                <span style={{ color: NEON }}>run</span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>(self, task):</span>
              </div>
              <div style={{ paddingLeft: 52, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>plan = self.think(task)</div>
              <div style={{ paddingLeft: 52, color: "rgba(255,255,255,0.35)" }}>return self.execute(plan)</div>
            </div>
          </Win>

          {/* Layer 2 — Dashboard (mid) */}
          <Win title="live-dashboard.app" accent={RED} slideX={midSlide} style={{ width: 560 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontFamily: MONO, fontSize: 12, letterSpacing: "0.12em", marginBottom: 18 }}>
                ● AGENT PIPELINE — LIVE
              </div>
              {[
                { name: "CEO Agent", status: "Orchestrating", color: NEON, pct: 100 },
                { name: "Writer Agent", status: "Generating", color: CYAN, pct: 72 },
                { name: "Editor Agent", status: "Reviewing", color: YELLOW, pct: 45 },
                { name: "SEO Agent", status: "Queued", color: "rgba(255,255,255,0.3)", pct: 0 },
              ].map((a, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: MONO, fontSize: 14 }}>{a.name}</span>
                    <span style={{ color: a.color, fontFamily: MONO, fontSize: 13 }}>● {a.status}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${a.pct}%`, background: a.pct > 0 ? a.color : "transparent", borderRadius: 2, boxShadow: a.pct > 0 ? `0 0 8px ${a.color}` : "none" }} />
                  </div>
                </div>
              ))}
            </div>
          </Win>

          {/* Layer 3 — Stats grid (slowest) */}
          <Win title="metrics.json" accent={YELLOW} slideX={slowSlide} style={{ width: 440 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { k: "Tasks Done", v: "1,247", c: NEON },
                { k: "Tokens", v: "2.4M", c: YELLOW },
                { k: "Latency", v: "340ms", c: CYAN },
                { k: "Saved", v: "$847", c: NEON },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: "18px 20px",
                }}>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontFamily: MONO, fontSize: 11, marginBottom: 8 }}>{m.k}</div>
                  <div style={{ color: m.c, fontFamily: MONO, fontSize: 30, fontWeight: 700, textShadow: `0 0 16px ${m.c}50` }}>{m.v}</div>
                </div>
              ))}
            </div>
          </Win>
        </div>
      </div>

      {/* Presenter return */}
      {presenterFade > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: presenterFade }}>
          <Scene1Presenter />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: interpolate(frame, [158, 178], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div style={{
              textAlign: "center",
              textShadow: `0 0 60px rgba(0,255,65,0.6)`,
            }}>
              <div style={{ color: "#ffffff", fontFamily: SANS, fontSize: 60, fontWeight: 900, letterSpacing: "-0.02em" }}>
                Build Smarter
              </div>
              <div style={{ color: NEON, fontFamily: SANS, fontSize: 60, fontWeight: 900, letterSpacing: "-0.02em" }}>
                Ship Faster
              </div>
              <div style={{ width: 400, height: 3, background: `linear-gradient(90deg,transparent,${NEON},transparent)`, margin: "16px auto 0", boxShadow: `0 0 20px ${NEON}` }} />
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const PaperclipTest: React.FC = () => {
  const frame = useCurrentFrame();

  const isFlash = (frame >= 58 && frame <= 64) || (frame >= 238 && frame <= 244) || (frame >= 418 && frame <= 424);
  const flashOp = isFlash ? interpolate(frame % 7, [0, 1, 6], [0.6, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={60}><Scene1Presenter /></Sequence>
      <Sequence from={60} durationInFrames={180}><Scene2Logo /></Sequence>
      <Sequence from={240} durationInFrames={180}><Scene3OrgChart /></Sequence>
      <Sequence from={420} durationInFrames={180}><Scene4UI /></Sequence>

      {flashOp > 0 && (
        <AbsoluteFill style={{ background: NEON, opacity: flashOp, pointerEvents: "none", zIndex: 197 }} />
      )}
      <FilmGrain />
      <ScanLines />
      <Vignette />
    </AbsoluteFill>
  );
};
