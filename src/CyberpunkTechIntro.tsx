/**
 * CyberpunkTechIntro.tsx
 * 15-second cyberpunk tech hook — replicates "Paperclip AI" opening style
 * 1920x1080 @ 30fps — 450 frames
 *
 * TIMELINE
 * ─────────────────────────────────────────────────────────
 * 0-84    (2.8s)  Gimbal glide — terminal code scrolling
 * 84-153  (2.3s)  Dashboard — progress bar blue → neon green
 * 153-252 (3.3s)  Snap zoom — Deploy button punch-in
 * 252-336 (2.8s)  Wide shot — multi-monitor data viz
 * 336-450 (3.8s)  Silhouette — glow + floating particles
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

// ─── Constants ────────────────────────────────────────────────────────────────
const BG = "#060b18";
const PURPLE = "#8b5cf6";
const CYAN = "#00d4ff";
const GREEN = "#22c55e";
const BLUE = "#3b82f6";
const MONO = "'Courier New', 'Lucida Console', monospace";

// ─── Scanlines ────────────────────────────────────────────────────────────────
const ScanLines: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
      pointerEvents: "none",
      zIndex: 100,
    }}
  />
);

// ─── Vignette ─────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
      pointerEvents: "none",
      zIndex: 99,
    }}
  />
);

// ─── Glitch flash ─────────────────────────────────────────────────────────────
const GlitchFlash: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 200 }}>
      {[0.2, 0.45, 0.68, 0.82].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${pos * 100}%`,
            left: i % 2 === 0 ? "-3%" : "3%",
            width: "106%",
            height: `${1 + (i % 3)}px`,
            background: i % 2 === 0 ? CYAN : PURPLE,
            opacity: 0.5,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ─── Scene 1: Terminal Gimbal Glide ───────────────────────────────────────────
const TERMINAL_LINES = [
  "> initializing agent runtime v2.4.1...",
  "> loading knowledge graph [████████░░] 83%",
  "> connecting to task orchestrator",
  "> agent.think({ goal: 'optimize workflow' })",
  "  ↳ plan generated: 7 steps",
  "  ↳ tools available: 12",
  "> executing step 1/7: fetch_context()",
  "  data retrieved: 4.2MB",
  "> executing step 2/7: analyze_patterns()",
  "  anomalies detected: 0",
  "> executing step 3/7: generate_solution()",
  "  model: claude-sonnet-4-6",
  "  tokens: 8,420 / 200,000",
  "> executing step 4/7: validate_output()",
  "  status: PASSED ✓",
  "> executing step 5/7: deploy()",
  "  [████████████████████] 100%",
  "> agent task complete in 2.3s",
  "> paperclip_ai: ready",
  "$ _",
];

const TerminalGlide: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow pan left (gimbal glide simulation)
  const panX = interpolate(frame, [0, 84], [60, -60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const panY = interpolate(frame, [0, 84], [10, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  // Fade in
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // How many lines are "typed"
  const linesVisible = Math.floor(interpolate(frame, [0, 80], [3, TERMINAL_LINES.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill
      style={{
        background: BG,
        opacity,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Screen panel */}
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
          width: 900,
          height: 560,
          background: "rgba(0,20,10,0.95)",
          border: `1px solid rgba(0,255,100,0.3)`,
          borderRadius: 4,
          padding: "28px 36px",
          boxShadow: `0 0 80px rgba(0,212,100,0.15), inset 0 0 40px rgba(0,0,0,0.5)`,
          overflow: "hidden",
        }}
      >
        {/* Terminal header */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, fontFamily: MONO, marginLeft: 12 }}>
            agent_runtime — bash
          </span>
        </div>
        {/* Terminal lines */}
        <div style={{ fontFamily: MONO, fontSize: 15, lineHeight: 1.7 }}>
          {TERMINAL_LINES.slice(0, linesVisible).map((line, i) => (
            <div
              key={i}
              style={{
                color: line.startsWith(">")
                  ? "#22c55e"
                  : line.startsWith("  ↳") || line.startsWith("  ")
                  ? "rgba(0,212,255,0.85)"
                  : line.startsWith("$")
                  ? "#ffffff"
                  : "rgba(255,255,255,0.6)",
                whiteSpace: "pre",
              }}
            >
              {line}
              {i === linesVisible - 1 && frame % 30 < 20 ? "█" : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Ambient screen glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 560,
          transform: `translate(${panX}px, ${panY}px)`,
          boxShadow: "0 0 200px rgba(0,200,80,0.12)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Scene 2: Dashboard Progress Bar ─────────────────────────────────────────
const DashboardProgress: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Progress 0 → 100% over 50 frames
  const progress = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Color shift: blue → green
  const r = Math.round(interpolate(progress, [0, 1], [59, 34]));
  const g = Math.round(interpolate(progress, [0, 1], [130, 197]));
  const b = Math.round(interpolate(progress, [0, 1], [246, 94]));
  const barColor = `rgb(${r},${g},${b})`;
  const glowColor = progress > 0.8 ? "rgba(34,197,94,0.4)" : "rgba(59,130,246,0.4)";

  const pct = Math.round(progress * 100);

  // Slight zoom in on the panel
  const scale = interpolate(frame, [0, 69], [0.95, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{ background: BG, opacity: fadeIn, justifyContent: "center", alignItems: "center" }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          width: 720,
          background: "rgba(10,15,40,0.98)",
          border: `1px solid rgba(139,92,246,0.4)`,
          borderRadius: 12,
          padding: "40px 48px",
          boxShadow: `0 0 80px rgba(139,92,246,0.15)`,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: MONO, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
            AGENT DEPLOYMENT PIPELINE
          </div>
          <div style={{ color: "#ffffff", fontFamily: "Arial Black, sans-serif", fontSize: 28, fontWeight: 900 }}>
            Paperclip AI v2.1
          </div>
        </div>

        {/* Status dots */}
        {["Context Load", "Pattern Analysis", "Solution Build", "Validation"].map((label, i) => {
          const done = progress > (i + 1) / 5;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: done ? GREEN : "rgba(255,255,255,0.2)",
                boxShadow: done ? `0 0 8px ${GREEN}` : "none",
                flexShrink: 0,
              }} />
              <div style={{ color: done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)", fontSize: 16, fontFamily: MONO }}>
                {label}
              </div>
              {done && (
                <div style={{ color: GREEN, fontSize: 14, fontFamily: MONO, marginLeft: "auto" }}>✓</div>
              )}
            </div>
          );
        })}

        {/* Progress bar */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: MONO, fontSize: 13 }}>DEPLOYING...</span>
            <span style={{ color: barColor, fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{
            width: "100%", height: 10,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 5, overflow: "hidden",
          }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: `linear-gradient(90deg, ${BLUE}, ${barColor})`,
              borderRadius: 5,
              boxShadow: `0 0 16px ${glowColor}`,
              transition: "width 0.05s linear",
            }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Snap Zoom → Deploy Button ──────────────────────────────────────
const SnapZoomDeploy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Snap zoom: smooth pan then punch in at frame 60
  const scale = spring({
    frame: frame - 55,
    fps,
    from: 1,
    to: 2.4,
    config: { stiffness: 400, damping: 30 },
  });
  const scaleBeforeZoom = interpolate(frame, [0, 55], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const finalScale = frame < 55 ? scaleBeforeZoom : scale;

  // Slight glitch on the snap
  const glitchActive = frame >= 55 && frame <= 62;

  // Button glow pulse after zoom
  const btnGlow = frame > 65
    ? interpolate(frame, [65, 99], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) })
    : 0;

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn, justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `scale(${finalScale})`, transformOrigin: "60% 55%" }}>
        {/* UI Panel */}
        <div style={{
          width: 860,
          background: "rgba(8,12,35,0.98)",
          border: `1px solid rgba(0,212,255,0.25)`,
          borderRadius: 10,
          padding: "36px 44px",
          boxShadow: "0 0 60px rgba(0,212,255,0.08)",
        }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div style={{ color: CYAN, fontFamily: MONO, fontSize: 13, letterSpacing: "0.1em" }}>AGENT CONTROL PANEL</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[CYAN, PURPLE, GREEN].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
            </div>
          </div>

          {/* Node graph */}
          <div style={{ display: "flex", gap: 16, marginBottom: 32, alignItems: "center" }}>
            {["Input", "Process", "Validate", "Output"].map((label, i) => (
              <React.Fragment key={i}>
                <div style={{
                  background: "rgba(139,92,246,0.15)",
                  border: `1px solid rgba(139,92,246,0.4)`,
                  borderRadius: 8,
                  padding: "10px 18px",
                  color: "#ffffff",
                  fontFamily: MONO,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}>
                  {label}
                </div>
                {i < 3 && (
                  <div style={{ color: CYAN, fontSize: 18, opacity: 0.6 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Metrics row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Uptime", val: "99.9%", color: GREEN },
              { label: "Latency", val: "42ms", color: CYAN },
              { label: "Tasks/hr", val: "2,847", color: PURPLE },
            ].map((m, i) => (
              <div key={i} style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 8,
                padding: "14px 16px",
                textAlign: "center",
              }}>
                <div style={{ color: m.color, fontFamily: MONO, fontSize: 22, fontWeight: 700 }}>{m.val}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: MONO, fontSize: 11, marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Deploy button — the snap zoom target */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              background: `linear-gradient(135deg, ${PURPLE}, #6d28d9)`,
              borderRadius: 8,
              padding: "16px 40px",
              color: "#ffffff",
              fontFamily: "Arial Black, sans-serif",
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: `0 0 ${30 + btnGlow * 40}px rgba(139,92,246,${0.3 + btnGlow * 0.4})`,
              cursor: "pointer",
              position: "relative",
            }}>
              ▶ DEPLOY
              {btnGlow > 0.5 && (
                <div style={{
                  position: "absolute",
                  inset: -2,
                  borderRadius: 10,
                  border: `2px solid rgba(139,92,246,${btnGlow * 0.8})`,
                  animation: "none",
                }} />
              )}
            </div>
          </div>
        </div>
      </div>

      <GlitchFlash active={glitchActive} />
    </AbsoluteFill>
  );
};

// ─── Scene 4: Wide Multi-Monitor Data Viz ─────────────────────────────────────
const DataVizWide: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Crane sweep: slight upward drift
  const panY = interpolate(frame, [0, 84], [30, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  // Mini bar chart data
  const bars = [0.3, 0.65, 0.45, 0.8, 0.55, 0.9, 0.7, 0.4, 0.85, 0.6];
  const barReveal = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const Monitor: React.FC<{ title: string; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
    title, color, children, style,
  }) => (
    <div style={{
      background: "rgba(6,11,24,0.97)",
      border: `1px solid rgba(255,255,255,0.08)`,
      borderTop: `2px solid ${color}`,
      borderRadius: 8,
      padding: "16px 20px",
      boxShadow: `0 4px 40px rgba(0,0,0,0.5)`,
      ...style,
    }}>
      <div style={{ color, fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", marginBottom: 14, opacity: 0.8 }}>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#03060f", opacity: fadeIn }}>
      {/* Purple ambient glow background */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "60%",
        transform: "translate(-50%, -50%)",
        width: 1200,
        height: 400,
        background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ transform: `translateY(${panY}px)`, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 20, width: 1500, padding: "0 60px" }}>

          {/* Left monitor: bar chart */}
          <Monitor title="AGENT PERFORMANCE" color={CYAN}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h * barReveal * 100}%`,
                    background: `linear-gradient(0deg, ${CYAN}, rgba(0,212,255,0.3))`,
                    borderRadius: "3px 3px 0 0",
                    minHeight: 4,
                  }}
                />
              ))}
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO, fontSize: 10, marginTop: 8 }}>
              Last 10 sessions
            </div>
          </Monitor>

          {/* Center monitor: node graph (large) */}
          <Monitor title="WORKFLOW NODE MAP" color={PURPLE} style={{ gridRow: "span 1" }}>
            <div style={{ position: "relative", height: 160 }}>
              {/* Node connections */}
              {[
                { x1: 70, y1: 30, x2: 200, y2: 80 },
                { x1: 200, y1: 80, x2: 330, y2: 40 },
                { x1: 200, y1: 80, x2: 320, y2: 130 },
                { x1: 70, y1: 30, x2: 100, y2: 120 },
                { x1: 100, y1: 120, x2: 200, y2: 80 },
              ].map((line, i) => (
                <svg key={i} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
                  <line
                    x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                    stroke={`rgba(139,92,246,${0.3 * barReveal})`}
                    strokeWidth={1.5}
                  />
                </svg>
              ))}
              {/* Nodes */}
              {[
                { x: 55, y: 22, label: "Input", color: CYAN },
                { x: 185, y: 72, label: "Core", color: PURPLE },
                { x: 315, y: 32, label: "Out A", color: GREEN },
                { x: 305, y: 122, label: "Out B", color: GREEN },
                { x: 85, y: 112, label: "Cache", color: "rgba(255,255,255,0.5)" },
              ].map((node, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: node.x,
                  top: node.y,
                  transform: "translate(-50%, -50%)",
                  width: 52,
                  height: 24,
                  background: `rgba(10,15,40,0.95)`,
                  border: `1px solid ${node.color}`,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: node.color,
                  fontFamily: MONO,
                  fontSize: 10,
                  opacity: barReveal,
                }}>
                  {node.label}
                </div>
              ))}
            </div>
          </Monitor>

          {/* Right monitor: metrics */}
          <Monitor title="LIVE METRICS" color={GREEN}>
            {[
              { label: "Active Agents", val: "12", color: GREEN },
              { label: "Tasks Queued", val: "847", color: CYAN },
              { label: "Avg Response", val: "38ms", color: PURPLE },
              { label: "Success Rate", val: "99.2%", color: GREEN },
            ].map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 0",
                borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: MONO, fontSize: 12 }}>{m.label}</span>
                <span style={{ color: m.color, fontFamily: MONO, fontSize: 14, fontWeight: 700 }}>{m.val}</span>
              </div>
            ))}
          </Monitor>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Silhouette + Particles ─────────────────────────────────────────
const SilhouetteParticles: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Particles — stable positions, floating upward
  const particles = React.useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        x: 10 + ((i * 37) % 80),
        baseY: 20 + ((i * 53) % 75),
        size: 1.5 + ((i * 7) % 4),
        speed: 0.3 + ((i * 3) % 7) * 0.1,
        opacity: 0.2 + ((i * 11) % 6) * 0.08,
        color: i % 3 === 0 ? PURPLE : i % 3 === 1 ? CYAN : "rgba(255,255,255,0.6)",
      })),
    []
  );

  return (
    <AbsoluteFill style={{ background: "#050810", opacity: fadeIn }}>
      {/* Screen glow behind silhouette */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "35%",
        transform: "translate(-50%, -50%)",
        width: 1400,
        height: 500,
        background: `radial-gradient(ellipse, rgba(0,212,255,0.12) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Purple side accent lights */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 200,
        background: "linear-gradient(90deg, rgba(139,92,246,0.15), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 200,
        background: "linear-gradient(270deg, rgba(139,92,246,0.15), transparent)",
        pointerEvents: "none",
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => {
        const yOffset = (frame * p.speed) % 100;
        const currentY = p.baseY - yOffset;
        const wrappedY = currentY < -5 ? currentY + 100 : currentY;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${wrappedY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: p.opacity * fadeIn,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Silhouette — CSS person shape */}
      <div style={{
        position: "absolute",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
      }}>
        {/* Body silhouette */}
        <div style={{
          position: "relative",
          width: 180,
          height: 480,
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          {/* Head */}
          <div style={{
            width: 72,
            height: 80,
            borderRadius: "50% 50% 45% 45%",
            background: "rgba(3,6,15,0.95)",
            boxShadow: `0 0 30px rgba(0,212,255,0.2)`,
            marginTop: 20,
          }} />
          {/* Neck */}
          <div style={{ width: 28, height: 30, background: "rgba(3,6,15,0.95)" }} />
          {/* Shoulders & torso */}
          <div style={{
            width: 160,
            height: 220,
            borderRadius: "40% 40% 20% 20% / 20% 20% 10% 10%",
            background: "rgba(3,6,15,0.95)",
            boxShadow: `0 0 60px rgba(139,92,246,0.15), 0 -20px 60px rgba(0,212,255,0.1)`,
          }} />
        </div>
      </div>

      {/* Text overlay */}
      <div style={{
        position: "absolute",
        bottom: 120,
        right: 200,
        textAlign: "right",
      }}>
        <div style={{
          color: "rgba(255,255,255,0.7)",
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          Powered by
        </div>
        <div style={{
          color: "#ffffff",
          fontFamily: "Arial Black, sans-serif",
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: "-0.01em",
          textShadow: `0 0 40px rgba(139,92,246,0.6), 0 0 80px rgba(0,212,255,0.3)`,
        }}>
          Paperclip AI
        </div>
        <div style={{
          width: "100%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${PURPLE}, ${CYAN})`,
          marginTop: 8,
        }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Fade to black ────────────────────────────────────────────────────────────
const FadeBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#000", opacity }} />;
};

// ─── Main Composition ─────────────────────────────────────────────────────────
export const CyberpunkTechIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Flash white on scene cuts
  const cutFlash = (
    (frame >= 83 && frame <= 87) ||
    (frame >= 152 && frame <= 156) ||
    (frame >= 251 && frame <= 255) ||
    (frame >= 335 && frame <= 339)
  );

  const flashOpacity = cutFlash
    ? interpolate(frame % 5, [0, 1, 4], [0, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Scene 1: Terminal glide (0-84) */}
      <Sequence from={0} durationInFrames={84}>
        <TerminalGlide />
      </Sequence>

      {/* Scene 2: Progress bar (84-153) */}
      <Sequence from={84} durationInFrames={69}>
        <DashboardProgress />
      </Sequence>

      {/* Scene 3: Snap zoom Deploy (153-252) */}
      <Sequence from={153} durationInFrames={99}>
        <SnapZoomDeploy />
      </Sequence>

      {/* Scene 4: Wide data viz (252-336) */}
      <Sequence from={252} durationInFrames={84}>
        <DataVizWide />
      </Sequence>

      {/* Scene 5: Silhouette + particles (336-420) */}
      <Sequence from={336} durationInFrames={84}>
        <SilhouetteParticles />
      </Sequence>

      {/* Fade to black (420-450) */}
      <Sequence from={420} durationInFrames={30}>
        <FadeBlack />
      </Sequence>

      {/* Global: scanlines + vignette */}
      <ScanLines />
      <Vignette />

      {/* Cut flash overlay */}
      {flashOpacity > 0 && (
        <AbsoluteFill style={{ background: `rgba(255,255,255,${flashOpacity})`, pointerEvents: "none", zIndex: 150 }} />
      )}
    </AbsoluteFill>
  );
};
