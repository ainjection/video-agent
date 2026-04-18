/**
 * AIInjectionIntro.tsx
 * 13-second landscape intro for AI Injection walkthrough videos
 * 1920x1080 @ 30fps — 390 frames
 *
 * TIMELINE
 * ─────────────────────────────────────────────────────────
 * 0-60    (2s)   Channel name flash + glitch hit
 * 60-180  (4s)   Hook title slams in + subtitle
 * 150-360 (7s)   Subscribe lower third animates in/out
 * 360-390 (1s)   Fade to black
 * ─────────────────────────────────────────────────────────
 *
 * Usage: prepend to the walkthrough screen recording with FFmpeg:
 *   ffmpeg -i intro.mp4 -i walkthrough.mp4 -filter_complex concat output.mp4
 */

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { SubscribeLowerThird } from "./SubscribeLowerThird";

// ─── Glitch line overlay ──────────────────────────────────────────────────────
const GlitchLines: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {[0.15, 0.35, 0.55, 0.72, 0.88].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${pos * 100}%`,
            left: i % 2 === 0 ? "-5%" : "5%",
            width: "110%",
            height: `${2 + (i % 3)}px`,
            background: i % 3 === 0 ? "#00ffcc" : i % 3 === 1 ? "#ffffff" : "#c8ff00",
            opacity: 0.35,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ─── Scan line overlay ────────────────────────────────────────────────────────
const ScanLines = () => (
  <AbsoluteFill
    style={{
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      pointerEvents: "none",
    }}
  />
);

// ─── Channel name flash ───────────────────────────────────────────────────────
const ChannelFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, from: 1.4, to: 1, config: { stiffness: 280, damping: 18 } });
  const opacity = interpolate(frame, [0, 8, 45, 60], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const glitchShift = frame < 15 ? Math.sin(frame * 4.7) * 6 : 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ transform: `scale(${scale}) translateX(${glitchShift}px)`, textAlign: "center" }}>
        <div style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 52,
          color: "#00ffcc",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          textShadow: "0 0 30px rgba(0,255,204,0.7), 0 0 60px rgba(0,255,204,0.3)",
        }}>
          AI Injection
        </div>
        <div style={{
          width: "100%",
          height: 2,
          background: "linear-gradient(90deg, transparent, #00ffcc, transparent)",
          marginTop: 8,
          opacity: 0.8,
        }} />
      </div>
      <GlitchLines active={frame < 20} />
    </AbsoluteFill>
  );
};

// ─── Hook title ───────────────────────────────────────────────────────────────
const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main title slams in
  const titleScale = spring({ frame, fps, from: 0.7, to: 1, config: { stiffness: 260, damping: 20 } });
  const titleOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle slides up
  const subY = spring({ frame: frame - 20, fps, from: 40, to: 0, config: { stiffness: 180, damping: 18 } });
  const subOp = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Accent bar grows
  const barW = interpolate(frame, [15, 50], [0, 560], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });

  // Fade out whole card
  const fadeOut = interpolate(frame, [100, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 0, opacity: fadeOut }}>
      <div style={{ transform: `scale(${titleScale})`, opacity: titleOp, textAlign: "center", padding: "0 120px" }}>
        <div style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          color: "#ffffff",
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          textShadow: "0 4px 48px rgba(0,0,0,0.9)",
          textTransform: "uppercase",
        }}>
          Build a Video
        </div>
        <div style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          color: "#c8ff00",
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          textShadow: "0 0 40px rgba(200,255,0,0.4)",
          textTransform: "uppercase",
        }}>
          On Autopilot
        </div>
      </div>

      {/* Accent bar */}
      <div style={{ width: barW, height: 4, background: "linear-gradient(90deg, #c8ff00, #00ffcc)", borderRadius: 2, marginTop: 24 }} />

      {/* Subtitle */}
      <div style={{
        opacity: subOp,
        transform: `translateY(${subY}px)`,
        marginTop: 20,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Arial, sans-serif",
          fontWeight: 600,
          fontSize: 38,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          Full Google Whisk Walkthrough
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Background particles / grid ──────────────────────────────────────────────
const TechGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 30, 340, 390], [0, 0.15, 0.15, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <div style={{
        width: "100%",
        height: "100%",
        backgroundImage: `
          linear-gradient(rgba(0,255,204,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,204,0.15) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }} />
    </AbsoluteFill>
  );
};

// ─── Fade to black ────────────────────────────────────────────────────────────
const FadeToBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#000", opacity }} />;
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const AIInjectionIntro: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#060606" }}>
      {/* Tech grid background */}
      <TechGrid frame={frame} />

      {/* Scan lines */}
      <ScanLines />

      {/* Background music */}
      <Audio src={staticFile("bgm2.mp3")} volume={0.55} />

      {/* Bell sound on subscribe click (frame 210 + 60 offset for subscribe click at frame 63) */}
      <Sequence from={210}>
        <Audio src={staticFile("bell.mp3")} volume={0.8} />
      </Sequence>

      {/* ── Scene 1: Channel flash (0-60) ── */}
      <Sequence from={0} durationInFrames={60}>
        <ChannelFlash />
      </Sequence>

      {/* ── Scene 2: Hook title (60-180) ── */}
      <Sequence from={60} durationInFrames={120}>
        <HookTitle />
      </Sequence>

      {/* ── Scene 3: Subscribe lower third (150-360) ── */}
      <Sequence from={150} durationInFrames={210}>
        <SubscribeLowerThird />
      </Sequence>

      {/* ── Fade to black (360-390) ── */}
      <Sequence from={360} durationInFrames={30}>
        <FadeToBlack />
      </Sequence>
    </AbsoluteFill>
  );
};
