import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Shared constants ──
const AVATAR_SRC = staticFile("avatar.jpg");
const CHANNEL_NAME = "AI Injection";
const SUB_COUNT = "1.79K subscribers";
const YT_RED = "#FF0000";
const GOLD = "#FFD700";
const TWITTER_BLUE = "#1DA1F2";

// ── Cursor SVG ──
const CursorSVG: React.FC<{ pressed?: boolean }> = ({ pressed }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    style={{ filter: pressed ? "brightness(0.7)" : "none" }}
  >
    <path
      d="M5 3l14 8-6 2-4 6z"
      fill="white"
      stroke="black"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Click Ripple ──
const ClickRipple: React.FC<{
  frame: number;
  triggerFrame: number;
  x: number;
  y: number;
}> = ({ frame, triggerFrame, x, y }) => {
  const elapsed = frame - triggerFrame;
  if (elapsed < 0 || elapsed > 15) return null;
  const scale = interpolate(elapsed, [0, 15], [0, 2.5]);
  const opacity = interpolate(elapsed, [0, 15], [0.6, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 20,
        top: y - 20,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.5)",
        transform: `scale(${scale})`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Bell Icon SVG ──
const BellIcon: React.FC<{ color?: string; size?: number }> = ({
  color = "white",
  size = 24,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

// ── YouTube Play Icon ──
const YouTubeIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect width="24" height="24" rx="6" fill={YT_RED} />
    <polygon points="10,7 10,17 17,12" fill="white" />
  </svg>
);

// ── Instagram Icon ──
const InstagramIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#FD5" />
        <stop offset="50%" stopColor="#FF543E" />
        <stop offset="100%" stopColor="#C837AB" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#igGrad)" />
    <circle
      cx="12"
      cy="12"
      r="5"
      fill="none"
      stroke="white"
      strokeWidth="2"
    />
    <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
  </svg>
);

// ── Twitter/X Icon ──
const TwitterIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill={TWITTER_BLUE} />
    <path
      d="M18.24 8.56c-.42.18-.87.31-1.34.37.48-.29.85-.75 1.02-1.3-.45.27-.95.46-1.48.57a2.33 2.33 0 00-3.97 2.12 6.6 6.6 0 01-4.8-2.43 2.33 2.33 0 00.72 3.1c-.38-.01-.74-.12-1.06-.29v.03a2.33 2.33 0 001.87 2.28c-.35.1-.71.11-1.06.04a2.33 2.33 0 002.17 1.62A4.67 4.67 0 017 15.78a6.58 6.58 0 003.57 1.04c4.28 0 6.62-3.55 6.62-6.62l-.01-.3c.46-.33.85-.74 1.16-1.21z"
      fill="white"
      transform="scale(0.85) translate(2.1, 2.1)"
    />
  </svg>
);

// ═══════════════════════════════════════════════════════
// STYLE 1: ClassicYouTube (210 frames / 7 seconds)
// ═══════════════════════════════════════════════════════
export const ClassicYouTube: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card slide up / down
  const slideIn = spring({ frame, fps, from: 120, to: 0, config: { stiffness: 200, damping: 20 } });
  const slideOut = frame > 180 ? spring({ frame: frame - 180, fps, from: 0, to: 120, config: { stiffness: 200, damping: 20 } }) : 0;
  const cardY = slideIn + slideOut;

  // Subscribe click at frame 60
  const subClicked = frame >= 70;
  const subBounce = subClicked
    ? spring({ frame: frame - 70, fps, from: 1.3, to: 1, config: { stiffness: 300, damping: 10 } })
    : 1;

  // Bell click at frame 110
  const bellClicked = frame >= 120;
  const bellWiggle = bellClicked
    ? Math.sin((frame - 120) * 0.8) *
      interpolate(frame - 120, [0, 30], [12, 0], { extrapolateRight: "clamp" })
    : 0;

  // Cursor position
  const cursorX = interpolate(
    frame,
    [30, 54, 56, 94, 96, 120],
    [1200, 1070, 1070, 1180, 1180, 1180],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorY = interpolate(
    frame,
    [30, 54, 56, 94, 96, 120],
    [800, 965, 965, 965, 965, 965],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorVisible = frame >= 30 && frame <= 150;
  const cursorPressed = (frame >= 68 && frame <= 73) || (frame >= 118 && frame <= 123);

  return (
    <AbsoluteFill>
      {/* Sound effects */}
      <Sequence from={70} durationInFrames={10}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={120} durationInFrames={10}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={122} durationInFrames={30}><Audio src={staticFile("bell.mp3")} volume={1} /></Sequence>
      {/* Card */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: `translateX(-50%) translateY(${cardY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(33,33,33,0.95)",
          borderRadius: 8,
          padding: "12px 24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Avatar */}
        <Img
          src={AVATAR_SRC}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "2px solid white",
            objectFit: "cover",
          }}
        />
        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ color: "white", fontWeight: 700, fontSize: 22, fontFamily: "Arial, sans-serif" }}>
            {CHANNEL_NAME}
          </span>
          <span style={{ color: "#aaa", fontSize: 14, fontFamily: "Arial, sans-serif" }}>
            {SUB_COUNT}
          </span>
        </div>
        {/* Subscribe button */}
        <div
          style={{
            marginLeft: 20,
            background: subClicked ? "#606060" : YT_RED,
            color: "white",
            padding: "10px 20px",
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "Arial, sans-serif",
            transform: `scale(${subBounce})`,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {subClicked ? "SUBSCRIBED" : "SUBSCRIBE"}
        </div>
        {/* Bell */}
        <div
          style={{
            marginLeft: 8,
            transform: `rotate(${bellWiggle}deg)`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <BellIcon color={bellClicked ? GOLD : "white"} size={28} />
        </div>
      </div>

      {/* Click ripples */}
      <ClickRipple frame={frame} triggerFrame={70} x={1070} y={965} />
      <ClickRipple frame={frame} triggerFrame={120} x={1180} y={965} />

      {/* Cursor */}
      {cursorVisible && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <CursorSVG pressed={cursorPressed} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// STYLE 2: BigAvatarBanner (240 frames / 8 seconds)
// ═══════════════════════════════════════════════════════
export const BigAvatarBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Avatar slide up from bottom-left
  const avatarY = spring({ frame, fps, from: 300, to: 0, config: { stiffness: 180, damping: 18 } });
  // Banner slide in from top
  const bannerY = spring({ frame: Math.max(0, frame - 10), fps, from: -80, to: 0, config: { stiffness: 180, damping: 18 } });
  // Info bar
  const infoX = spring({ frame: Math.max(0, frame - 15), fps, from: -500, to: 0, config: { stiffness: 160, damping: 18 } });

  // Slide out
  const outY = frame > 200 ? spring({ frame: frame - 200, fps, from: 0, to: 400, config: { stiffness: 200, damping: 20 } }) : 0;

  // Cursor arrives at subscribe at frame 70, clicks at frame 80
  // Cursor arrives at bell at frame 120, clicks at frame 130
  const subClicked = frame >= 80;
  const subBounce = subClicked
    ? spring({ frame: frame - 80, fps, from: 1.3, to: 1, config: { stiffness: 300, damping: 10 } })
    : 1;

  const bellVisible = frame >= 90;
  const bellClicked = frame >= 130;
  const bellScale = bellVisible
    ? spring({ frame: frame - 90, fps, from: 0, to: 1, config: { stiffness: 300, damping: 12 } })
    : 0;
  const bellWiggle = bellClicked
    ? Math.sin((frame - 130) * 0.8) *
      interpolate(frame - 130, [0, 30], [15, 0], { extrapolateRight: "clamp" })
    : 0;

  // Cursor - arrives at button, pauses, then clicks
  const cursorX = interpolate(
    frame,
    [40, 68, 82, 118, 132, 160],
    [400, 250, 250, 380, 380, 380],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorY = interpolate(
    frame,
    [40, 68, 82, 118, 132, 160],
    [700, 820, 820, 780, 780, 780],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorVisible = frame >= 40 && frame <= 170;
  const cursorPressed = (frame >= 78 && frame <= 83) || (frame >= 128 && frame <= 133);

  return (
    <AbsoluteFill>
      {/* Sound effects */}
      <Sequence from={79} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={129} durationInFrames={15}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={131} durationInFrames={30}><Audio src={staticFile("bell.mp3")} volume={1} /></Sequence>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          transform: `translateY(${outY}px)`,
        }}
      >
        {/* Subscribed banner above avatar */}
        <div
          style={{
            transform: `translateY(${bannerY}px) scale(${subBounce})`,
            background: subClicked ? "#606060" : YT_RED,
            color: "white",
            padding: "8px 24px",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 16,
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "fit-content",
          }}
        >
          {subClicked ? "SUBSCRIBED" : "SUBSCRIBE"}
          {bellVisible && (
            <div style={{ transform: `scale(${bellScale}) rotate(${bellWiggle}deg)`, display: "inline-flex" }}>
              <BellIcon color={bellClicked ? GOLD : "white"} size={20} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Large avatar */}
          <Img
            src={AVATAR_SRC}
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: `5px solid ${YT_RED}`,
              objectFit: "cover",
              transform: `translateY(${avatarY}px)`,
            }}
          />
          {/* Info bar */}
          <div
            style={{
              transform: `translateX(${infoX}px)`,
              background: "rgba(0,0,0,0.7)",
              padding: "14px 28px",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ color: "white", fontWeight: 700, fontSize: 24, fontFamily: "Arial, sans-serif" }}>
              {CHANNEL_NAME}
            </span>
            <span style={{ color: "#ccc", fontSize: 14, fontFamily: "Arial, sans-serif" }}>
              Tech tutorials & AI tools
            </span>
          </div>
        </div>
      </div>

      <ClickRipple frame={frame} triggerFrame={90} x={250} y={820} />
      <ClickRipple frame={frame} triggerFrame={140} x={380} y={820} />

      {cursorVisible && (
        <div style={{ position: "absolute", left: cursorX, top: cursorY, pointerEvents: "none", zIndex: 100 }}>
          <CursorSVG pressed={cursorPressed} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// STYLE 3: RedBarStyle (210 frames / 7 seconds)
// ═══════════════════════════════════════════════════════
export const RedBarStyle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bar slides down from top
  const barY = spring({ frame, fps, from: -100, to: 0, config: { stiffness: 200, damping: 18 } });
  // Bar slides back up
  const barOut = frame > 180 ? spring({ frame: frame - 180, fps, from: 0, to: -100, config: { stiffness: 200, damping: 18 } }) : 0;

  // Subscribe click at frame 80
  const subClicked = frame >= 90;

  // Bell click at frame 130
  const bellClicked = frame >= 140;
  const bellWiggle = bellClicked
    ? Math.sin((frame - 140) * 0.8) *
      interpolate(frame - 140, [0, 30], [12, 0], { extrapolateRight: "clamp" })
    : 0;

  // Cursor
  const cursorX = interpolate(
    frame,
    [40, 74, 76, 109, 111, 145],
    [600, 960, 960, 1700, 1700, 1700],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorY = interpolate(
    frame,
    [40, 74, 76, 109, 111, 145],
    [200, 45, 45, 45, 45, 45],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorVisible = frame >= 40 && frame <= 170;
  const cursorPressed = (frame >= 88 && frame <= 93) || (frame >= 138 && frame <= 143);

  const barColor = subClicked ? "#CC0000" : YT_RED;

  return (
    <AbsoluteFill>
      {/* Sound effects */}
      <Sequence from={80} durationInFrames={10}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={130} durationInFrames={10}><Audio src={staticFile("click.mp3")} volume={0.8} /></Sequence>
      <Sequence from={132} durationInFrames={30}><Audio src={staticFile("bell.mp3")} volume={1} /></Sequence>
      {/* Red bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: barColor,
          transform: `translateY(${barY + barOut}px)`,
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        {/* Avatar */}
        <Img
          src={AVATAR_SRC}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid white",
          }}
        />
        {/* Center text */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 24,
            fontFamily: "Arial, sans-serif",
            letterSpacing: 2,
          }}
        >
          {subClicked ? "SUBSCRIBED" : "SUBSCRIBE"}
        </div>
        {/* Bell */}
        <div style={{ transform: `rotate(${bellWiggle}deg)`, display: "flex", alignItems: "center" }}>
          <BellIcon
            color={bellClicked ? GOLD : "white"}
            size={32}
          />
          {bellClicked && (
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 15,
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>

      <ClickRipple frame={frame} triggerFrame={90} x={960} y={45} />
      <ClickRipple frame={frame} triggerFrame={140} x={1700} y={45} />

      {cursorVisible && (
        <div style={{ position: "absolute", left: cursorX, top: cursorY, pointerEvents: "none", zIndex: 100 }}>
          <CursorSVG pressed={cursorPressed} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// STYLE 4: MultiPlatform (300 frames / 10 seconds)
// ═══════════════════════════════════════════════════════
export const MultiPlatform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const platforms = [
    {
      icon: <YouTubeIcon size={36} />,
      name: CHANNEL_NAME,
      handle: "",
      button: "SUBSCRIBE",
      buttonColor: YT_RED,
      delay: 0,
      fromLeft: true,
    },
    {
      icon: <InstagramIcon size={36} />,
      name: CHANNEL_NAME,
      handle: "@aiinjection",
      button: "Follow",
      buttonColor: "#405DE6",
      delay: 30,
      fromLeft: false,
    },
    {
      icon: <TwitterIcon size={36} />,
      name: CHANNEL_NAME,
      handle: "@AIInjection",
      button: "Follow",
      buttonColor: TWITTER_BLUE,
      delay: 60,
      fromLeft: true,
    },
  ];

  // All slide out together at frame 240
  const slideOutX = frame > 240
    ? spring({ frame: frame - 240, fps, from: 0, to: 1, config: { stiffness: 200, damping: 18 } })
    : 0;

  return (
    <AbsoluteFill>
      {platforms.map((p, i) => {
        const inX = spring({
          frame: Math.max(0, frame - p.delay),
          fps,
          from: p.fromLeft ? -700 : 700,
          to: 0,
          config: { stiffness: 180, damping: 18 },
        });
        const outOffset = (p.fromLeft ? -700 : 700) * slideOutX;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 60 + (2 - i) * 80,
              left: p.fromLeft ? 60 : undefined,
              right: p.fromLeft ? undefined : 60,
              transform: `translateX(${inX + outOffset}px)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: "12px 20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              minWidth: 360,
            }}
          >
            {p.icon}
            <Img
              src={AVATAR_SRC}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#222", fontFamily: "Arial, sans-serif" }}>
                {p.name}
              </span>
              {p.handle && (
                <span style={{ fontSize: 13, color: "#666", fontFamily: "Arial, sans-serif" }}>
                  {p.handle}
                </span>
              )}
            </div>
            <div
              style={{
                background: p.buttonColor,
                color: "white",
                padding: "8px 18px",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "Arial, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {p.button}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════
// STYLE 5: SocialIconsBounce (270 frames / 9 seconds)
// ═══════════════════════════════════════════════════════
export const SocialIconsBounce: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    {
      icon: <YouTubeIcon size={48} />,
      label: CHANNEL_NAME,
      action: "Subscribe",
      delay: 0,
    },
    {
      icon: <InstagramIcon size={48} />,
      label: "@aiinjection",
      action: "Follow",
      delay: 40,
    },
    {
      icon: <TwitterIcon size={48} />,
      label: "@AIInjection",
      action: "Follow",
      delay: 80,
    },
  ];

  // All slide down together at frame 220
  const slideOut = frame > 220
    ? spring({ frame: frame - 220, fps, from: 0, to: 400, config: { stiffness: 200, damping: 20 } })
    : 0;

  return (
    <AbsoluteFill>
      {items.map((item, i) => {
        const bounceY = spring({
          frame: Math.max(0, frame - item.delay),
          fps,
          from: 300,
          to: 0,
          config: { stiffness: 250, damping: 14 },
        });

        const cardExpand = spring({
          frame: Math.max(0, frame - item.delay - 20),
          fps,
          from: 0,
          to: 1,
          config: { stiffness: 200, damping: 16 },
        });

        const cardWidth = interpolate(cardExpand, [0, 1], [0, 280]);
        const cardOpacity = interpolate(cardExpand, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 80,
              bottom: 80 + (2 - i) * 90,
              transform: `translateY(${bounceY + slideOut}px)`,
              display: "flex",
              alignItems: "center",
              zIndex: 10 - i,
            }}
          >
            {/* Icon */}
            <div style={{ zIndex: 2, position: "relative" }}>{item.icon}</div>
            {/* Expanding card */}
            <div
              style={{
                marginLeft: -10,
                width: cardWidth,
                opacity: cardOpacity,
                overflow: "hidden",
                background: "rgba(33,33,33,0.92)",
                borderRadius: "0 10px 10px 0",
                padding: cardExpand > 0.1 ? "10px 16px 10px 24px" : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: 16,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  color: "#ccc",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Arial, sans-serif",
                  marginLeft: 12,
                }}
              >
                {item.action}
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
