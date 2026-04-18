import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// ============================================================
// SCENE 1: Big 3D Glass Icons (Claude + Excalidraw) with orbit
// ============================================================

const EnergyWisp: React.FC<{
  index: number;
  startX: number;
  endX: number;
  centerY: number;
}> = ({ index, startX, endX, centerY }) => {
  const frame = useCurrentFrame();
  const seed = index * 47.3;
  const speed = 0.015 + (index % 4) * 0.008;
  const progress = (Math.sin(frame * speed + seed) + 1) / 2;
  const x = interpolate(progress, [0, 1], [startX, endX]);
  const yOffset = Math.sin(frame * 0.03 + seed * 2) * (20 + index * 8);
  const y = centerY + yOffset;
  const size = 3 + (index % 3) * 2;
  const opacity = interpolate(
    Math.sin(frame * speed * 2 + seed),
    [-1, 1],
    [0.1, 0.6]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          index % 2 === 0
            ? "radial-gradient(circle, #ffcc80, #ff8c42)"
            : "radial-gradient(circle, #c4b5fd, #7c3aed)",
        boxShadow:
          index % 2 === 0
            ? `0 0 ${size * 4}px #ff8c42, 0 0 ${size * 8}px rgba(255,140,66,0.3)`
            : `0 0 ${size * 4}px #8b5cf6, 0 0 ${size * 8}px rgba(139,92,246,0.3)`,
        opacity,
      }}
    />
  );
};

const Sparkle: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const seed = index * 137.5;
  const x = (seed * 7.3) % 1920;
  const y = (seed * 13.1) % 1080;
  const speed = 0.008 + (index % 5) * 0.004;
  const size = 1.5 + (index % 3);
  const opacity = interpolate(
    Math.sin(frame * speed * 3 + seed),
    [-1, 1],
    [0, 0.5]
  );
  const floatX = Math.sin(frame * speed + seed) * 20;
  const floatY = Math.cos(frame * speed * 0.7 + seed) * 15;

  return (
    <div
      style={{
        position: "absolute",
        left: x + floatX,
        top: y + floatY,
        width: size,
        height: size,
        borderRadius: "50%",
        background: index % 4 === 0 ? "#ffd700" : "#a5b4fc",
        boxShadow: `0 0 ${size * 3}px ${index % 4 === 0 ? "#ffd700" : "#a5b4fc"}`,
        opacity,
      }}
    />
  );
};

const ClaudeStarburst: React.FC<{ size: number }> = ({ size }) => {
  const rays = 12;
  const innerR = size * 0.15;
  const outerR = size * 0.42;
  const points: string[] = [];
  for (let i = 0; i < rays * 2; i++) {
    const angle = (i * Math.PI) / rays - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = size / 2 + Math.cos(angle) * r;
    const y = size / 2 + Math.sin(angle) * r;
    points.push(`${x},${y}`);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e1" stopOpacity="1" />
          <stop offset="60%" stopColor="#ffcc80" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff8c42" stopOpacity="0.6" />
        </radialGradient>
        <filter id="starBlur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <polygon
        points={points.join(" ")}
        fill="url(#starGlow)"
        filter="url(#starBlur)"
        opacity={0.6}
      />
      <polygon points={points.join(" ")} fill="url(#starGlow)" />
    </svg>
  );
};

const ExcalidrawX: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="xGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <path
      d="M25 20 L50 48 L75 20 L82 28 L58 52 L82 76 L75 84 L50 58 L25 84 L18 76 L42 52 L18 28 Z"
      fill="url(#xGrad)"
      stroke="rgba(196,181,253,0.4)"
      strokeWidth="1"
    />
  </svg>
);

// Scene 1 component
const IconsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const orangeEntrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 50, mass: 1 },
  });
  const purpleEntrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 50, mass: 1 },
  });

  const floatY1 = Math.sin(frame * 0.018) * 12;
  const floatY2 = Math.cos(frame * 0.02) * 10;
  const tiltX1 = Math.sin(frame * 0.012) * 3;
  const tiltY1 = Math.cos(frame * 0.015) * 4;
  const tiltX2 = Math.cos(frame * 0.013) * 3;
  const tiltY2 = Math.sin(frame * 0.016) * 4;

  const ringOpacity = interpolate(frame, [30, 70], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowPulse = 0.25 + Math.sin(frame * 0.025) * 0.1;
  const glowPulse2 = 0.2 + Math.cos(frame * 0.03) * 0.08;

  const orangeX = 620;
  const purpleX = 1060;
  const iconCenterY = 420;
  const iconSize = 280;
  const symbolSize = 160;

  const orangeSlideX = interpolate(orangeEntrance, [0, 1], [-400, 0]);
  const purpleSlideX = interpolate(purpleEntrance, [0, 1], [400, 0]);

  // Exit fade
  const exitOpacity = interpolate(frame, [200, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [80, 120, 200, 240], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [80, 120], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flareOpacity = interpolate(
    frame,
    [60, 100, 180, 220],
    [0, 0.12, 0.12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const flareX = interpolate(frame, [60, 240], [-100, 2100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Background glows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 38% 42%, rgba(255,107,53,${glowPulse}) 0%, transparent 50%),
            radial-gradient(ellipse 70% 55% at 62% 40%, rgba(124,58,237,${glowPulse2}) 0%, transparent 50%)
          `,
        }}
      />

      {Array.from({ length: 30 }).map((_, i) => (
        <Sparkle key={i} index={i} />
      ))}

      {/* Orbital ring */}
      <svg
        style={{
          position: "absolute",
          left: 960 - 450,
          top: iconCenterY - 180,
          width: 900,
          height: 360,
          transform: `rotate(-8deg) rotateX(${55 + Math.sin(frame * 0.01) * 3}deg)`,
          transformOrigin: "center center",
          opacity: ringOpacity,
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff8c42" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#ffd700" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fff8e1" stopOpacity="1" />
            <stop offset="70%" stopColor="#c4b5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
          <filter id="rGlow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <ellipse cx={450} cy={180} rx={420} ry={160} fill="none" stroke="url(#rg1)" strokeWidth={6} filter="url(#rGlow)" opacity={0.5} />
        <ellipse cx={450} cy={180} rx={420} ry={160} fill="none" stroke="url(#rg1)" strokeWidth={3} />
      </svg>

      {/* Energy wisps */}
      {Array.from({ length: 16 }).map((_, i) => (
        <EnergyWisp key={i} index={i} startX={orangeX + iconSize / 2} endX={purpleX - iconSize / 2 + 60} centerY={iconCenterY} />
      ))}

      {/* Orange icon */}
      <div
        style={{
          position: "absolute",
          left: orangeX - iconSize / 2 + orangeSlideX,
          top: iconCenterY - iconSize / 2 + floatY1,
          width: iconSize,
          height: iconSize,
          borderRadius: 56,
          transform: `scale(${orangeEntrance}) perspective(600px) rotateX(${tiltX1}deg) rotateY(${tiltY1}deg)`,
          background: "linear-gradient(145deg, rgba(255,180,120,0.9), rgba(255,140,66,0.85), rgba(230,100,30,0.8))",
          border: "1.5px solid rgba(255,200,150,0.5)",
          boxShadow: `0 0 60px rgba(255,140,66,0.5), 0 0 120px rgba(255,107,53,0.3), 0 20px 60px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: 56, background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)", pointerEvents: "none" }} />
        <ClaudeStarburst size={symbolSize} />
      </div>

      {/* Purple icon */}
      <div
        style={{
          position: "absolute",
          left: purpleX - iconSize / 2 + purpleSlideX,
          top: iconCenterY - iconSize / 2 + floatY2,
          width: iconSize,
          height: iconSize,
          borderRadius: 56,
          transform: `scale(${purpleEntrance}) perspective(600px) rotateX(${tiltX2}deg) rotateY(${tiltY2}deg)`,
          background: "linear-gradient(145deg, rgba(210,200,255,0.85), rgba(167,139,250,0.7), rgba(124,58,237,0.65))",
          border: "1.5px solid rgba(200,190,255,0.4)",
          boxShadow: `0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(124,58,237,0.25), 0 20px 60px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.25)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: 56, background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)", pointerEvents: "none" }} />
        <ExcalidrawX size={symbolSize} />
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          width: "100%",
          textAlign: "center",
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          zIndex: 45,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800, color: "white", letterSpacing: 6, fontFamily: "system-ui, -apple-system, sans-serif", textShadow: "0 0 30px rgba(255,255,255,0.2), 0 2px 10px rgba(0,0,0,0.5)" }}>
          CLAUDE + EXCALIDRAW
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", marginTop: 10, letterSpacing: 5, fontFamily: "system-ui, -apple-system, sans-serif" }}>
          INSTANT VISUAL DIAGRAMS
        </div>
      </div>

      {/* Lens flare */}
      <div style={{ position: "absolute", left: flareX - 200, top: iconCenterY - 4, width: 400, height: 8, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", opacity: flareOpacity, filter: "blur(3px)", zIndex: 40, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2: Glass Panels with Diagrams (3D perspective)
// ============================================================

// Hierarchy / Org chart diagram drawn with SVG
const HierarchyDiagram: React.FC = () => (
  <svg width="380" height="280" viewBox="0 0 380 280">
    {/* Person icon at top */}
    <circle cx="190" cy="30" r="12" fill="none" stroke="#ffb347" strokeWidth="2" />
    <line x1="190" y1="42" x2="190" y2="65" stroke="#ffb347" strokeWidth="2" />
    <line x1="175" y1="55" x2="205" y2="55" stroke="#ffb347" strokeWidth="2" />
    {/* Top box */}
    <rect x="150" y="70" width="80" height="35" rx="6" fill="none" stroke="#ffb347" strokeWidth="2" />
    {/* Lines down */}
    <line x1="190" y1="105" x2="190" y2="125" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="90" y1="125" x2="290" y2="125" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="90" y1="125" x2="90" y2="140" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="190" y1="125" x2="190" y2="140" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="290" y1="125" x2="290" y2="140" stroke="#ffb347" strokeWidth="1.5" />
    {/* Middle row boxes */}
    <rect x="55" y="140" width="70" height="30" rx="5" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    <rect x="155" y="140" width="70" height="30" rx="5" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    <rect x="255" y="140" width="70" height="30" rx="5" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    {/* Lines to bottom */}
    <line x1="90" y1="170" x2="90" y2="190" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="55" y1="190" x2="125" y2="190" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="55" y1="190" x2="55" y2="205" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="125" y1="190" x2="125" y2="205" stroke="#ffb347" strokeWidth="1.5" />
    {/* Bottom row boxes */}
    <rect x="30" y="205" width="50" height="25" rx="4" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    <rect x="100" y="205" width="50" height="25" rx="4" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    <rect x="230" y="205" width="50" height="25" rx="4" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    <rect x="300" y="205" width="50" height="25" rx="4" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="290" y1="170" x2="290" y2="190" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="255" y1="190" x2="325" y2="190" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="255" y1="190" x2="255" y2="205" stroke="#ffb347" strokeWidth="1.5" />
    <line x1="325" y1="190" x2="325" y2="205" stroke="#ffb347" strokeWidth="1.5" />
  </svg>
);

// Network / node connection diagram
const NetworkDiagram: React.FC = () => (
  <svg width="380" height="280" viewBox="0 0 380 280">
    {/* Center node */}
    <rect x="155" y="110" width="70" height="50" rx="8" fill="rgba(100,200,255,0.15)" stroke="#67e8f9" strokeWidth="2" />
    {/* Top left */}
    <rect x="30" y="30" width="60" height="45" rx="8" fill="rgba(100,200,255,0.1)" stroke="#67e8f9" strokeWidth="1.5" />
    {/* Top right */}
    <rect x="290" y="25" width="60" height="45" rx="8" fill="rgba(100,200,255,0.1)" stroke="#67e8f9" strokeWidth="1.5" />
    {/* Bottom left */}
    <rect x="40" y="200" width="60" height="45" rx="8" fill="rgba(100,200,255,0.1)" stroke="#67e8f9" strokeWidth="1.5" />
    {/* Bottom right */}
    <rect x="280" y="195" width="60" height="45" rx="8" fill="rgba(100,200,255,0.1)" stroke="#67e8f9" strokeWidth="1.5" />
    {/* Mid left */}
    <rect x="15" y="115" width="55" height="40" rx="7" fill="rgba(100,200,255,0.1)" stroke="#67e8f9" strokeWidth="1.5" />
    {/* Mid right */}
    <rect x="310" y="120" width="55" height="40" rx="7" fill="rgba(100,200,255,0.1)" stroke="#67e8f9" strokeWidth="1.5" />
    {/* Connection lines */}
    <line x1="90" y1="52" x2="155" y2="120" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
    <line x1="290" y1="47" x2="225" y2="120" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
    <line x1="70" y1="135" x2="155" y2="135" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
    <line x1="310" y1="140" x2="225" y2="140" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
    <line x1="100" y1="222" x2="155" y2="160" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
    <line x1="280" y1="217" x2="225" y2="160" stroke="rgba(103,232,249,0.5)" strokeWidth="1.5" />
    {/* Dots at connection points */}
    {[[90, 52], [290, 47], [70, 135], [310, 140], [100, 222], [280, 217]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="3" fill="#67e8f9" />
    ))}
  </svg>
);

// Process / arrow flow diagram
const ProcessDiagram: React.FC = () => (
  <svg width="380" height="280" viewBox="0 0 380 280">
    {/* Arrow 1 */}
    <polygon points="30,100 140,100 160,130 140,160 30,160 50,130" fill="none" stroke="#ffb347" strokeWidth="2" />
    {/* Arrow 2 */}
    <polygon points="140,100 250,100 270,130 250,160 140,160 160,130" fill="none" stroke="#67e8f9" strokeWidth="2" />
    {/* Arrow 3 */}
    <polygon points="250,100 360,100 360,160 250,160 270,130" fill="none" stroke="#67e8f9" strokeWidth="2" />
    {/* Loop icon in center of arrow 2 */}
    <path d="M185 120 A 12 12 0 1 1 185 140" fill="none" stroke="#ffb347" strokeWidth="1.5" />
    <polygon points="185,140 181,134 189,134" fill="#ffb347" />
    {/* Chevrons row 2 */}
    <polygon points="80,180 170,180 190,205 170,230 80,230 100,205" fill="none" stroke="#67e8f9" strokeWidth="1.5" opacity="0.6" />
    <polygon points="170,180 260,180 280,205 260,230 170,230 190,205" fill="none" stroke="#ffb347" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

// Glass panel component
const GlassPanel: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  rotateY: number;
  glowColor: string;
  delay: number;
  floatOffset: number;
  slideFrom: "left" | "right" | "center";
}> = ({ children, x, y, width, height, rotateY, glowColor, delay, floatOffset, slideFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 40, mass: 1.4 },
  });

  const floatY = Math.sin(frame * 0.015 + floatOffset) * 8;
  const tiltX = Math.sin(frame * 0.01 + floatOffset * 2) * 2;

  // Slide in from the side so you see the 3D perspective during entrance
  const slideDistance = slideFrom === "left" ? -800 : slideFrom === "right" ? 800 : 0;
  const slideX = interpolate(entrance, [0, 1], [slideDistance, 0]);
  // Start with more extreme rotation and settle into final angle
  const entranceRotateY = slideFrom === "left"
    ? interpolate(entrance, [0, 1], [-45, rotateY])
    : slideFrom === "right"
    ? interpolate(entrance, [0, 1], [45, rotateY])
    : interpolate(entrance, [0, 1], [0, rotateY]);

  return (
    <div
      style={{
        position: "absolute",
        left: x + slideX,
        top: y + floatY,
        width,
        height,
        transform: `perspective(1200px) rotateY(${entranceRotateY}deg) rotateX(${tiltX + 5}deg)`,
        transformOrigin: "center center",
        background: "rgba(255,255,255,0.04)",
        border: `1.5px solid ${glowColor}55`,
        borderRadius: 18,
        boxShadow: `
          0 0 40px ${glowColor}30,
          0 0 80px ${glowColor}15,
          0 30px 60px rgba(0,0,0,0.5),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
        opacity: entrance,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Glass shine */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          background: "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Neon border glow */}
      <div
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 19,
          border: `1px solid ${glowColor}40`,
          boxShadow: `inset 0 0 20px ${glowColor}10`,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
};

// Scene 2: Glass panels
const PanelsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Excalidraw icon floating above center panel
  const iconEntrance = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 60, mass: 0.8 },
  });
  const iconFloat = Math.sin(frame * 0.02) * 6;

  // Slow turntable rotation - gentle continuous turn
  const turntableY = interpolate(frame, [0, 230], [-12, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const turntableX = 8 + Math.sin(frame * 0.012) * 2;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 25% 45%, rgba(255,179,71,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 75% 45%, rgba(103,232,249,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 50%)
          `,
        }}
      />

      {Array.from({ length: 20 }).map((_, i) => (
        <Sparkle key={i} index={i + 40} />
      ))}

      {/* Floor reflection - mirrored gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 250,
          background: "linear-gradient(to top, rgba(255,179,71,0.06) 0%, rgba(103,232,249,0.03) 30%, transparent 100%)",
          pointerEvents: "none",
          filter: "blur(8px)",
        }}
      />

      {/* Turntable container - whole scene rotates gently */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `perspective(2000px) rotateY(${turntableY}deg) rotateX(${turntableX}deg)`,
          transformOrigin: "center 450px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Left panel - Hierarchy (orange glow) - slides in from left */}
        <GlassPanel x={80} y={180} width={480} height={360} rotateY={18} glowColor="#ffb347" delay={5} floatOffset={0} slideFrom="left">
          <HierarchyDiagram />
        </GlassPanel>

        {/* Center panel - Network (cyan glow) - slides up from center */}
        <GlassPanel x={570} y={200} width={480} height={360} rotateY={0} glowColor="#67e8f9" delay={15} floatOffset={1.5} slideFrom="center">
          <NetworkDiagram />
        </GlassPanel>

        {/* Right panel - Process (mixed glow) - slides in from right */}
        <GlassPanel x={1060} y={180} width={480} height={360} rotateY={-18} glowColor="#67e8f9" delay={25} floatOffset={3} slideFrom="right">
          <ProcessDiagram />
        </GlassPanel>

        {/* Excalidraw icon above center panel */}
        <div
          style={{
            position: "absolute",
            left: 960 - 40,
            top: 130 + iconFloat,
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(145deg, rgba(210,200,255,0.8), rgba(167,139,250,0.6), rgba(124,58,237,0.5))",
            border: "1px solid rgba(200,190,255,0.35)",
            boxShadow: `0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(124,58,237,0.2), 0 10px 30px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.2)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${iconEntrance})`,
            opacity: iconEntrance,
          }}
        >
          <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)", pointerEvents: "none" }} />
          <ExcalidrawX size={50} />
        </div>
      </div>{/* end turntable */}

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: "100%",
          textAlign: "center",
          opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          zIndex: 45,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: 4, fontFamily: "system-ui, -apple-system, sans-serif" }}>
          ORG CHARTS &middot; NETWORKS &middot; WORKFLOWS
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================

export const GlassDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const grainSeed = Math.floor(frame * 1.7);

  return (
    <AbsoluteFill style={{ backgroundColor: "#030014" }}>
      {/* Scene 1: Icons (frames 0-240) */}
      <Sequence from={0} durationInFrames={260}>
        <IconsScene />
      </Sequence>

      {/* Scene 2: Glass Panels (frames 220-450) */}
      <Sequence from={220} durationInFrames={230}>
        <PanelsScene />
      </Sequence>

      {/* Vignette (always on) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          zIndex: 50,
          pointerEvents: "none",
        }}
      />

      {/* Film grain (always on) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          zIndex: 51,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${grainSeed}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </AbsoluteFill>
  );
};
