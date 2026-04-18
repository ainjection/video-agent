/**
 * PaperclipIntro.tsx
 * Remotion recreation from CineStruct JSON — Paperclip AI style
 * 1920x1080 @ 30fps — 600 frames (20s)
 *
 * TIMELINE
 * ─────────────────────────────────────────────────────────
 * 0-60    (2s)   Scene 1 — Presenter + logo, red/green rim lights
 * 60-240  (6s)   Scene 2 — Logo reveal + "38,000 stars" counter
 * 240-420 (6s)   Scene 3 — Org chart node build
 * 420-600 (6s)   Scene 4 — Floating UI windows + presenter return
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

// ─── Brand colours ────────────────────────────────────────────────────────────
const NEON_GREEN = "#00FF41";
const CYBER_RED = "#FF4500";
const STAR_YELLOW = "#FFD700";
const BG_DARK = "#0a0a0a";
const BG_CARD = "#111111";
const MONO = "'Courier New', monospace";
const SANS = "Arial Black, Arial, sans-serif";

// ─── Shared: Scanlines ────────────────────────────────────────────────────────
const ScanLines: React.FC = () => (
  <AbsoluteFill style={{
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
    pointerEvents: "none", zIndex: 200,
  }} />
);

// ─── Shared: Vignette ─────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.8) 100%)",
    pointerEvents: "none", zIndex: 199,
  }} />
);

// ─── Shared: Neon glow cut flash ─────────────────────────────────────────────
const CutFlash: React.FC<{ color?: string }> = ({ color = NEON_GREEN }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, 8], [0.5, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: color, opacity, pointerEvents: "none", zIndex: 198 }} />;
};

// ─── Scene 1: Presenter + Paperclip Logo ─────────────────────────────────────
const PresenterScene: React.FC<{ showReturn?: boolean }> = ({ showReturn = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtle breathing cam
  const breathScale = 1 + Math.sin(frame * 0.04) * 0.003;

  // Logo slide in from left
  const logoX = spring({ frame: frame - 10, fps, from: -200, to: 0, config: { stiffness: 120, damping: 20 } });

  return (
    <AbsoluteFill style={{ background: BG_DARK, opacity: fadeIn }}>
      {/* Wood slat background — vertical CSS stripes */}
      <AbsoluteFill style={{
        backgroundImage: "repeating-linear-gradient(90deg, rgba(60,40,20,0.15) 0px, rgba(60,40,20,0.15) 18px, transparent 18px, transparent 40px)",
        pointerEvents: "none",
      }} />

      {/* Red rim light — left side */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 0% 50%, rgba(255,69,0,0.25) 0%, transparent 55%)",
        pointerEvents: "none",
      }} />

      {/* Green rim light — right side */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 100% 50%, rgba(0,255,65,0.2) 0%, transparent 55%)",
        pointerEvents: "none",
      }} />

      {/* Screen glow behind presenter */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 45%, rgba(0,255,65,0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Presenter silhouette */}
      <div style={{
        position: "absolute",
        left: "50%", bottom: 0,
        transform: `translateX(-50%) scale(${breathScale})`,
        transformOrigin: "bottom center",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* Head */}
        <div style={{
          width: 90, height: 100,
          borderRadius: "50% 50% 42% 42%",
          background: "rgba(8,8,8,0.97)",
          boxShadow: `0 0 20px rgba(0,255,65,0.1), -8px 0 30px rgba(255,69,0,0.15), 8px 0 30px rgba(0,255,65,0.12)`,
          marginBottom: 0,
        }} />
        {/* Neck */}
        <div style={{ width: 32, height: 28, background: "rgba(8,8,8,0.97)" }} />
        {/* Torso */}
        <div style={{
          width: 200, height: 340,
          borderRadius: "45% 45% 15% 15% / 15% 15% 8% 8%",
          background: "rgba(8,8,8,0.97)",
          boxShadow: `-12px 0 60px rgba(255,69,0,0.12), 12px 0 60px rgba(0,255,65,0.1)`,
        }} />
      </div>

      {/* Paperclip logo — left overlay */}
      <div style={{
        position: "absolute",
        left: 80 + logoX,
        top: "50%",
        transform: "translateY(-50%)",
      }}>
        <div style={{
          background: "rgba(0,0,0,0.75)",
          border: `1px solid rgba(0,255,65,0.4)`,
          borderRadius: 12,
          padding: "20px 28px",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            color: NEON_GREEN,
            fontFamily: SANS,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 6,
            opacity: 0.7,
          }}>FEATURED</div>
          <div style={{
            color: "#ffffff",
            fontFamily: SANS,
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            textShadow: `0 0 20px rgba(0,255,65,0.4)`,
          }}>
            📎 Paperclip
          </div>
          <div style={{
            color: "rgba(255,255,255,0.5)",
            fontFamily: MONO,
            fontSize: 13,
            marginTop: 6,
          }}>AI Agent Framework</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Logo Reveal + Stars Counter ────────────────────────────────────
const LogoRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Smooth push-in scale
  const scale = interpolate(frame, [0, 180], [1, 1.06], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Logo scale spring
  const logoScale = spring({ frame: frame - 10, fps, from: 0.6, to: 1, config: { stiffness: 150, damping: 18 } });
  const logoOp = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stars counter animate 0 → 38000
  const starsVal = Math.round(interpolate(frame, [50, 150], [0, 38000], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }));
  const starsOp = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Tagline slide up
  const tagY = spring({ frame: frame - 80, fps, from: 30, to: 0, config: { stiffness: 120, damping: 18 } });
  const tagOp = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Glow pulse
  const glow = 0.4 + Math.sin(frame * 0.08) * 0.15;

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #010d04 0%, #011a08 50%, #010d04 100%)",
      opacity: fadeIn,
    }}>
      {/* Radial green glow bg */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at center, rgba(0,255,65,${glow * 0.12}) 0%, transparent 65%)`,
        pointerEvents: "none",
        transform: `scale(${scale})`,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transform: `scale(${scale})`,
      }}>
        {/* Logo */}
        <div style={{
          transform: `scale(${logoScale})`,
          opacity: logoOp,
          textAlign: "center",
          marginBottom: 40,
        }}>
          <div style={{
            fontSize: 100,
            filter: `drop-shadow(0 0 30px ${NEON_GREEN}) drop-shadow(0 0 60px rgba(0,255,65,0.3))`,
          }}>📎</div>
          <div style={{
            color: "#ffffff",
            fontFamily: SANS,
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            textShadow: `0 0 40px rgba(0,255,65,0.5), 0 0 80px rgba(0,255,65,0.2)`,
            marginTop: -10,
          }}>Paperclip</div>
          <div style={{
            width: "100%", height: 2,
            background: `linear-gradient(90deg, transparent, ${NEON_GREEN}, transparent)`,
            marginTop: 12, opacity: 0.8,
          }} />
        </div>

        {/* Stars counter */}
        <div style={{
          opacity: starsOp,
          display: "flex", alignItems: "center", gap: 14,
          background: "rgba(0,0,0,0.5)",
          border: `1px solid rgba(0,255,65,0.3)`,
          borderRadius: 50,
          padding: "12px 30px",
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 24, filter: `drop-shadow(0 0 8px ${STAR_YELLOW})` }}>⭐</span>
          <span style={{
            color: STAR_YELLOW,
            fontFamily: SANS,
            fontSize: 32,
            fontWeight: 900,
            textShadow: `0 0 20px rgba(255,215,0,0.6)`,
          }}>
            {starsVal.toLocaleString()} stars
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: tagOp,
          transform: `translateY(${tagY}px)`,
          color: "rgba(255,255,255,0.5)",
          fontFamily: MONO,
          fontSize: 18,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          Open-Source AI Agent Framework
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Org Chart Node Build ───────────────────────────────────────────
type OrgNode = { id: string; label: string; role: string; x: number; y: number; parent?: string };

const ORG_NODES: OrgNode[] = [
  { id: "ceo", label: "🤖 CEO", role: "Orchestrator", x: 960, y: 180 },
  { id: "writer", label: "✍️ Writer", role: "Content Writer", x: 480, y: 380 },
  { id: "editor", label: "📝 Editor", role: "Content Editor", x: 760, y: 380 },
  { id: "seo", label: "🔍 SEO", role: "SEO Agent", x: 1040, y: 380 },
  { id: "social", label: "📱 Social", role: "Social Manager", x: 1280, y: 380 },
  { id: "analyst", label: "📊 Data", role: "Data Analyst", x: 1520, y: 380 },
  { id: "publish", label: "🚀 Deploy", role: "Publisher", x: 620, y: 560 },
  { id: "review", label: "✅ Review", role: "QA Agent", x: 900, y: 560 },
];

const OrgChartScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Dreamy micro-movement
  const microX = Math.sin(frame * 0.015) * 8;
  const microY = Math.cos(frame * 0.02) * 5;

  const Node: React.FC<{ node: OrgNode; delay: number }> = ({ node, delay }) => {
    const nodeOp = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nodeScale = spring({ frame: frame - delay, fps, from: 0.4, to: 1, config: { stiffness: 200, damping: 18 } });
    const glow = 0.5 + Math.sin(frame * 0.06 + delay * 0.1) * 0.2;
    const isCEO = node.id === "ceo";

    return (
      <div style={{
        position: "absolute",
        left: node.x - (isCEO ? 90 : 75),
        top: node.y - 35,
        opacity: nodeOp,
        transform: `scale(${nodeScale})`,
        transformOrigin: "center",
      }}>
        <div style={{
          background: isCEO ? `rgba(0,255,65,0.12)` : "rgba(0,20,8,0.9)",
          border: `${isCEO ? 2 : 1}px solid rgba(0,255,65,${isCEO ? 0.9 : 0.5})`,
          borderRadius: 8,
          padding: isCEO ? "14px 28px" : "10px 20px",
          textAlign: "center",
          boxShadow: `0 0 ${isCEO ? 30 : 16}px rgba(0,255,65,${glow * (isCEO ? 0.4 : 0.2)})`,
          minWidth: isCEO ? 180 : 140,
        }}>
          <div style={{
            color: "#ffffff",
            fontFamily: SANS,
            fontSize: isCEO ? 20 : 16,
            fontWeight: 900,
          }}>{node.label}</div>
          <div style={{
            color: NEON_GREEN,
            fontFamily: MONO,
            fontSize: isCEO ? 12 : 10,
            marginTop: 4,
            opacity: 0.8,
            letterSpacing: "0.08em",
          }}>{node.role}</div>
        </div>
      </div>
    );
  };

  // Connector line between CEO and each child
  const ConnectorLine: React.FC<{ from: OrgNode; to: OrgNode; delay: number }> = ({ from, to, delay }) => {
    const lineOp = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
        <line
          x1={from.x} y1={from.y + 35}
          x2={to.x} y2={to.y - 35}
          stroke={`rgba(0,255,65,${lineOp * 0.5})`}
          strokeWidth={1.5}
          strokeDasharray="6 3"
        />
      </svg>
    );
  };

  const delays = [10, 30, 40, 50, 60, 70, 80, 90, 100, 110];

  return (
    <AbsoluteFill style={{ background: "#050d07", opacity: fadeIn }}>
      {/* Volumetric god rays */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <AbsoluteFill style={{
        backgroundImage: "repeating-linear-gradient(170deg, transparent 0%, rgba(0,255,65,0.015) 1px, transparent 2px)",
        backgroundSize: "100px 200px",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${microX}px, ${microY}px)`,
      }}>
        {/* Connection lines */}
        {ORG_NODES.slice(1).map((node, i) => {
          const parent = ORG_NODES.find(n => n.id === "ceo")!;
          return <ConnectorLine key={node.id} from={parent} to={node} delay={delays[i + 1]} />;
        })}
        {/* 2nd level connections */}
        <ConnectorLine from={ORG_NODES[1]} to={ORG_NODES[6]} delay={delays[7]} />
        <ConnectorLine from={ORG_NODES[2]} to={ORG_NODES[7]} delay={delays[8]} />

        {/* Nodes */}
        {ORG_NODES.map((node, i) => (
          <Node key={node.id} node={node} delay={delays[i]} />
        ))}
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 60, left: "50%",
        transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.4)",
        fontFamily: MONO, fontSize: 14,
        letterSpacing: "0.2em", textTransform: "uppercase",
        opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        MULTI-AGENT ARCHITECTURE
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Floating UI Windows ────────────────────────────────────────────
const FloatingUIScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Right-to-left truck slide — comes in from off-screen right, lands center
  const slideX = interpolate(frame, [0, 60], [1920, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Return to presenter fade
  const presenterFade = interpolate(frame, [140, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const windowsFade = interpolate(frame, [140, 165], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const UIWindow: React.FC<{
    title: string; color: string; delay: number; width?: number; children: React.ReactNode;
  }> = ({ title, color, delay, width = 600, children }) => {
    const wOp = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ width, opacity: wOp * windowsFade, flexShrink: 0 }}>
        <div style={{
          background: BG_CARD,
          border: `1px solid rgba(0,255,65,0.3)`,
          borderTop: `3px solid ${color}`,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: `0 12px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,255,65,0.07)`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 20px",
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
            ))}
            <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: MONO, fontSize: 13, marginLeft: 10 }}>{title}</span>
          </div>
          <div style={{ padding: "22px 26px" }}>{children}</div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: BG_DARK, opacity: fadeIn }}>
      {/* Windows container — slides in from right, centered vertically */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `translateX(${slideX}px)`,
      }}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", padding: "0 60px" }}>

          {/* Window 1 — Code editor */}
          <UIWindow title="agent.py" color={NEON_GREEN} delay={5}>
            <div style={{ fontFamily: MONO, fontSize: 16 }}>
              <div style={{ color: "#569cd6", marginBottom: 8 }}>class <span style={{ color: "#4ec9b0" }}>PaperclipAgent</span>:</div>
              <div style={{ color: "rgba(255,255,255,0.55)", paddingLeft: 24, marginBottom: 6 }}>def <span style={{ color: NEON_GREEN }}>__init__</span>(self, role):</div>
              <div style={{ color: "rgba(255,255,255,0.38)", paddingLeft: 48, marginBottom: 4 }}>self.role = role</div>
              <div style={{ color: "rgba(255,255,255,0.38)", paddingLeft: 48, marginBottom: 10 }}>self.memory = []</div>
              <div style={{ color: "rgba(255,255,255,0.55)", paddingLeft: 24, marginBottom: 6 }}>def <span style={{ color: NEON_GREEN }}>execute</span>(self, task):</div>
              <div style={{ color: "rgba(255,255,255,0.38)", paddingLeft: 48, marginBottom: 4 }}>result = self.llm(task)</div>
              <div style={{ color: "rgba(255,255,255,0.38)", paddingLeft: 48 }}>return result</div>
            </div>
          </UIWindow>

          {/* Window 2 — Dashboard */}
          <UIWindow title="dashboard.app" color={CYBER_RED} delay={20} width={560}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontFamily: MONO, fontSize: 13, marginBottom: 18, letterSpacing: "0.1em" }}>AGENT STATUS BOARD</div>
              {[
                { name: "CEO Agent", status: "Running", color: NEON_GREEN },
                { name: "Writer Agent", status: "Idle", color: STAR_YELLOW },
                { name: "Editor Agent", status: "Running", color: NEON_GREEN },
                { name: "SEO Agent", status: "Processing", color: "#00d4ff" },
                { name: "Social Agent", status: "Queued", color: "rgba(255,255,255,0.4)" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontFamily: MONO, fontSize: 15 }}>{a.name}</span>
                  <span style={{ color: a.color, fontFamily: MONO, fontSize: 14 }}>● {a.status}</span>
                </div>
              ))}
            </div>
          </UIWindow>

          {/* Window 3 — Stats */}
          <UIWindow title="analytics.json" color={STAR_YELLOW} delay={35} width={480}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { k: "Tasks Done", v: "1,247", c: NEON_GREEN },
                { k: "Tokens Used", v: "2.4M", c: STAR_YELLOW },
                { k: "Avg Latency", v: "340ms", c: "#00d4ff" },
                { k: "Cost Saved", v: "$847", c: NEON_GREEN },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 8, padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: MONO, fontSize: 12, marginBottom: 6 }}>{m.k}</div>
                  <div style={{ color: m.c, fontFamily: MONO, fontSize: 26, fontWeight: 700 }}>{m.v}</div>
                </div>
              ))}
            </div>
          </UIWindow>
        </div>
      </div>

      {/* Presenter return fade */}
      {presenterFade > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: presenterFade }}>
          <PresenterScene />
          {/* End card overlay */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: interpolate(frame, [160, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div style={{
              color: "#ffffff",
              fontFamily: SANS,
              fontSize: 52,
              fontWeight: 900,
              textAlign: "center",
              textShadow: `0 0 40px rgba(0,255,65,0.5)`,
            }}>
              Build Smarter<br />
              <span style={{ color: NEON_GREEN }}>Ship Faster</span>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────
export const PaperclipIntro: React.FC = () => {
  const frame = useCurrentFrame();

  const cutFlashActive = (
    (frame >= 58 && frame <= 65) ||
    (frame >= 238 && frame <= 245) ||
    (frame >= 418 && frame <= 425)
  );

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Scene 1 — Presenter (0-60) */}
      <Sequence from={0} durationInFrames={60}>
        <PresenterScene />
      </Sequence>

      {/* Scene 2 — Logo reveal (60-240) */}
      <Sequence from={60} durationInFrames={180}>
        <LogoRevealScene />
      </Sequence>

      {/* Scene 3 — Org chart (240-420) */}
      <Sequence from={240} durationInFrames={180}>
        <OrgChartScene />
      </Sequence>

      {/* Scene 4 — Floating UI (420-600) */}
      <Sequence from={420} durationInFrames={180}>
        <FloatingUIScene />
      </Sequence>

      {/* Cut flashes */}
      {cutFlashActive && (
        <Sequence from={cutFlashActive ? frame - (frame % 1) : 0} durationInFrames={8}>
          <CutFlash color={NEON_GREEN} />
        </Sequence>
      )}

      <ScanLines />
      <Vignette />
    </AbsoluteFill>
  );
};
