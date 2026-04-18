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

const AVATARS = [
  staticFile("images/avatar_12440.jpg"),
  staticFile("images/avatar_12769.jpg"),
  staticFile("images/avatar_14072.jpg"),
  staticFile("images/avatar_14465.jpg"),
  staticFile("images/avatar_16057.jpg"),
  staticFile("images/avatar_22299.jpg"),
  staticFile("images/avatar_26945.jpg"),
  staticFile("images/avatar_31842.jpg"),
  staticFile("images/avatar_6489.jpg"),
  staticFile("images/avatar_7761.jpg"),
  staticFile("images/avatar_8590.jpg"),
  staticFile("images/avatar_9443.jpg"),
];

const CHANNEL_NAMES = [
  "Sarah Lifestyle", "Tech Review Pro", "Gaming Elite", "Fitness Hub",
  "Travel Diaries", "Cooking Master", "Music Daily", "Fashion Week",
  "DIY Projects", "Pet Lovers", "Book Club", "Photo Tips",
  "Movie Talk", "Science Fun", "Art Studio", "Car Culture",
  "Dance Moves", "Comedy Hour", "News Flash", "Sport Zone",
];

const BG = "#1a2a2a";
const YT_RED = "#FF0000";
const GOLD = "#FFD700";

const CELL_W = 880;
const CELL_H = 460;
const GAP = 40;
const GRID_X = (1920 - CELL_W * 2 - GAP) / 2;
const GRID_Y = (1080 - CELL_H * 2 - GAP) / 2;

const cellPos = (idx: number) => ({
  x: GRID_X + (idx % 2) * (CELL_W + GAP),
  y: GRID_Y + Math.floor(idx / 2) * (CELL_H + GAP),
});

/* ---- Individual style renderers ---- */

const CircleAvatar: React.FC<{ src: string; size: number; border?: string }> = ({
  src, size, border,
}) => (
  <Img src={src} style={{
    width: size, height: size, borderRadius: "50%", objectFit: "cover",
    border: border || "3px solid #fff",
    flexShrink: 0,
  }} />
);

const SubButton: React.FC<{
  text?: string; bg?: string; color?: string; radius?: number; px?: number; py?: number; outline?: boolean;
}> = ({ text = "SUBSCRIBE", bg = YT_RED, color = "#fff", radius = 4, px = 20, py = 8, outline }) => (
  <div style={{
    background: outline ? "transparent" : bg,
    color: outline ? bg : color,
    border: outline ? `2px solid ${bg}` : "none",
    padding: `${py}px ${px}px`,
    borderRadius: radius,
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  }}>{text}</div>
);

const BellIcon: React.FC<{ color?: string; size?: number }> = ({ color = GOLD, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const YTIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={YT_RED}>
    <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
  </svg>
);

/* Each style is a function(localFrame, fps, styleIdx) => JSX */
type StyleFn = (f: number, fps: number, idx: number) => React.ReactNode;

const avatar = (idx: number) => AVATARS[idx % AVATARS.length];
const chName = (idx: number) => CHANNEL_NAMES[idx];

const enterSpring = (f: number, fps: number, delay = 0) =>
  spring({ frame: Math.max(0, f - delay), fps, config: { stiffness: 120, damping: 14 } });

const styles: StyleFn[] = [
  // Style 1: White card, avatar left, name center, red SUBSCRIBE right, bell far right
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "#fff", borderRadius: 12, padding: "16px 24px",
        transform: `translateX(${(1 - s) * -200}px)`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={56} border="3px solid #ddd" />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#222", flex: 1 }}>{chName(i)}</span>
        <SubButton />
        <BellIcon />
      </div>
    );
  },
  // Style 2: Avatar with red ring, name below, grey SUBSCRIBED, gold bell
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        transform: `scale(${s})`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={72} border={`4px solid ${YT_RED}`} />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{chName(i)}</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SubButton text="SUBSCRIBED" bg="#666" />
          <BellIcon color={GOLD} />
        </div>
      </div>
    );
  },
  // Style 3: Red banner bar
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: YT_RED, borderRadius: 8, padding: "14px 24px",
        transform: `translateY(${(1 - s) * 100}px)`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={52} border="3px solid #fff" />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", flex: 1 }}>{chName(i)}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>SUBSCRIBE</span>
        <BellIcon color="#fff" />
      </div>
    );
  },
  // Style 4: Dark card with like/dislike + subscribe pill
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "#222", borderRadius: 12, padding: "14px 20px",
        transform: `translateX(${(1 - s) * 200}px)`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={50} border="2px solid #555" />
        <span style={{ fontSize: 18, fontWeight: 600, color: "#fff", flex: 1 }}>{chName(i)}</span>
        <span style={{ fontSize: 22, cursor: "pointer" }}>👍</span>
        <span style={{ fontSize: 22, cursor: "pointer" }}>👎</span>
        <SubButton radius={20} px={18} py={8} />
      </div>
    );
  },
  // Style 5: Large avatar with colored bg circle, name+sub below
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        transform: `scale(${s})`, opacity: s,
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "linear-gradient(135deg, #ff6b6b, #c44dff)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CircleAvatar src={avatar(i)} size={80} border="3px solid #fff" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{chName(i)}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <SubButton text="SUBSCRIBED" bg="#444" />
          <BellIcon />
        </div>
      </div>
    );
  },
  // Style 6: Minimal dark pill
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "#111", borderRadius: 50, padding: "10px 24px 10px 10px",
        transform: `translateY(${(1 - s) * -80}px)`, opacity: s,
      }}>
        <YTIcon size={24} />
        <CircleAvatar src={avatar(i)} size={40} border="2px solid #333" />
        <span style={{ fontSize: 17, fontWeight: 600, color: "#fff" }}>{chName(i)}</span>
      </div>
    );
  },
  // Style 7: White card red left border accent
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "#fff", borderRadius: 8, padding: "14px 20px",
        borderLeft: `5px solid ${YT_RED}`,
        transform: `translateX(${(1 - s) * -200}px)`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={52} border="2px solid #eee" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#222" }}>{chName(i)}</div>
          <div style={{ fontSize: 13, color: "#888" }}>Daily uploads & more</div>
        </div>
        <SubButton />
      </div>
    );
  },
  // Style 8: Avatar floating above name banner ribbon
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        transform: `scale(${s})`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={70} border="3px solid #fff" />
        <div style={{
          marginTop: -18,
          background: YT_RED, borderRadius: 6, padding: "22px 36px 10px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{chName(i)}</div>
        </div>
      </div>
    );
  },
  // Style 9: Full width white bar with stats
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "#fff", borderRadius: 8, padding: "12px 18px",
        transform: `translateY(${(1 - s) * 60}px)`, opacity: s,
        width: "90%",
      }}>
        <CircleAvatar src={avatar(i)} size={44} border="2px solid #ddd" />
        <span style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>{chName(i)}</span>
        <span style={{ fontSize: 13, color: "#888" }}>1.2M subs</span>
        <span style={{ fontSize: 13, color: "#888" }}>👍 45K</span>
        <span style={{ fontSize: 13, color: "#888" }}>👎 1.2K</span>
        <div style={{ flex: 1 }} />
        <SubButton px={14} py={6} />
        <BellIcon size={22} />
      </div>
    );
  },
  // Style 10: Glassmorphism card
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 16, padding: "16px 24px",
        transform: `scale(${s})`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={56} border="2px solid rgba(255,255,255,0.4)" />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", flex: 1 }}>{chName(i)}</span>
        <SubButton bg="rgba(255,0,0,0.85)" radius={8} />
      </div>
    );
  },
  // Style 11: Split card - left avatar, right dark with name+sub
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", borderRadius: 12, overflow: "hidden",
        transform: `translateX(${(1 - s) * 200}px)`, opacity: s,
        width: 360, height: 120,
      }}>
        <Img src={avatar(i)} style={{ width: 140, height: 120, objectFit: "cover" }} />
        <div style={{
          flex: 1, background: "#1a1a1a", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "0 16px", gap: 8,
        }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{chName(i)}</span>
          <SubButton px={14} py={6} />
        </div>
      </div>
    );
  },
  // Style 12: Circular frame with decorations
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        transform: `scale(${s})`, opacity: s,
      }}>
        <div style={{ position: "relative" }}>
          <CircleAvatar src={avatar(i)} size={80} border={`4px solid ${GOLD}`} />
          <span style={{ position: "absolute", top: -6, right: -6, fontSize: 18 }}>💎</span>
          <span style={{ position: "absolute", bottom: -6, left: -6, fontSize: 18 }}>💎</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{chName(i)}</span>
      </div>
    );
  },
  // Style 13: Red gradient card
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "linear-gradient(135deg, #ff0000, #cc0000)",
        borderRadius: 12, padding: "16px 24px",
        transform: `translateY(${(1 - s) * 80}px)`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={56} border="3px solid #fff" />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", flex: 1 }}>{chName(i)}</span>
        <SubButton text="SUBSCRIBE" bg="transparent" color="#fff" outline />
      </div>
    );
  },
  // Style 14: Gaming style, bold angles, neon
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "#0d0d0d",
        border: "2px solid #39ff14",
        borderRadius: 4, padding: "14px 20px",
        transform: `skewX(-3deg) translateX(${(1 - s) * -180}px)`, opacity: s,
        boxShadow: "0 0 20px rgba(57,255,20,0.3)",
      }}>
        <CircleAvatar src={avatar(i)} size={52} border="3px solid #39ff14" />
        <span style={{ fontSize: 20, fontWeight: 900, color: "#39ff14", flex: 1, textTransform: "uppercase" }}>{chName(i)}</span>
        <span style={{ fontSize: 16, fontWeight: 900, color: "#39ff14", letterSpacing: 2, textShadow: "0 0 10px #39ff14" }}>SUBSCRIBE</span>
      </div>
    );
  },
  // Style 15: Simple thumb + SUBSCRIBED + bell row
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 18,
        transform: `translateY(${(1 - s) * 60}px)`, opacity: s,
      }}>
        <span style={{ fontSize: 32 }}>👍</span>
        <SubButton text="SUBSCRIBED" bg="#666" radius={4} />
        <BellIcon color={GOLD} size={32} />
      </div>
    );
  },
  // Style 16: Rounded white card with typing channel name
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    const name = chName(i);
    const visibleChars = Math.min(name.length, Math.floor(interpolate(f, [15, 60], [0, name.length], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })));
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "#fff", borderRadius: 50, padding: "12px 24px 12px 12px",
        transform: `scale(${s})`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={48} border="2px solid #eee" />
        <span style={{ fontSize: 18, fontWeight: 700, color: "#222", minWidth: 140 }}>
          {name.slice(0, visibleChars)}<span style={{ opacity: f % 16 < 8 ? 1 : 0, color: "#222" }}>|</span>
        </span>
        <SubButton radius={20} px={16} py={7} />
      </div>
    );
  },
  // Style 17: Portrait style, larger avatar rect
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        borderRadius: 12, overflow: "hidden",
        transform: `translateY(${(1 - s) * 100}px)`, opacity: s,
        width: 200,
      }}>
        <Img src={avatar(i)} style={{ width: 200, height: 140, objectFit: "cover" }} />
        <div style={{
          width: "100%", background: "rgba(0,0,0,0.7)", padding: "8px 0", textAlign: "center",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{chName(i)}</span>
        </div>
        <div style={{ width: "100%", background: YT_RED, padding: "8px 0", textAlign: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>SUBSCRIBE</span>
        </div>
      </div>
    );
  },
  // Style 18: Neon outline dark card
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "#111", borderRadius: 12, padding: "16px 24px",
        border: `2px solid ${YT_RED}`,
        boxShadow: `0 0 24px rgba(255,0,0,0.4), inset 0 0 24px rgba(255,0,0,0.1)`,
        transform: `scale(${s})`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={56} border={`3px solid ${YT_RED}`} />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", flex: 1 }}>{chName(i)}</span>
        <SubButton />
      </div>
    );
  },
  // Style 19: Stacked centered
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        transform: `translateY(${(1 - s) * -80}px)`, opacity: s,
      }}>
        <CircleAvatar src={avatar(i)} size={72} border="3px solid #fff" />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{chName(i)}</span>
        <SubButton radius={6} />
        <BellIcon />
      </div>
    );
  },
  // Style 20: Multi-social stack
  (f, fps, i) => {
    const s = enterSpring(f, fps);
    const row = (icon: string, label: string, bg: string, delay: number) => {
      const rs = enterSpring(f, fps, delay);
      return (
        <div key={label} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: bg, borderRadius: 8, padding: "8px 18px",
          transform: `translateX(${(1 - rs) * 120}px)`, opacity: rs,
        }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{label}</span>
        </div>
      );
    };
    return (
      <div style={{
        display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch",
        transform: `scale(${s})`, opacity: s,
      }}>
        {row("▶", "Subscribe on YouTube", YT_RED, 0)}
        {row("📷", "Follow on Instagram", "#C13584", 6)}
        {row("🐦", "Follow on Twitter", "#1DA1F2", 12)}
      </div>
    );
  },
];

/* ---- Main component ---- */

export const FiverrShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const INTRO_END = 35;
  const PAGE_DUR = 75;
  const PAGES = 5;
  const CONTENT_END = INTRO_END + PAGES * PAGE_DUR; // 410
  // Outro: 410-500

  const currentPage = Math.floor(
    Math.max(0, Math.min(frame - INTRO_END, PAGES * PAGE_DUR - 1)) / PAGE_DUR
  );

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>

      {/* Pop sound at each page transition */}
      {[0, 1, 2, 3, 4].map((p) => (
        <Sequence key={`pop-${p}`} from={INTRO_END + p * PAGE_DUR} durationInFrames={15}>
          <Audio src={staticFile("pop.mp3")} volume={0.7} />
        </Sequence>
      ))}

      {/* ===== INTRO (0-60) ===== */}
      <Sequence from={0} durationInFrames={INTRO_END}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${spring({ frame, fps, config: { stiffness: 100, damping: 14 } })})`,
            textAlign: "center",
          }}>
            <h1 style={{
              fontSize: 68, fontWeight: 900, color: "#fff", letterSpacing: -2, margin: 0,
              textShadow: "0 0 60px rgba(255,0,0,0.4)",
            }}>
              SUBSCRIBE BUTTON ANIMATIONS
            </h1>
            <p style={{
              fontSize: 30, color: "#aaa", marginTop: 14, fontWeight: 500,
              opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              20 Premium Styles
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== GRID PAGES with varied transitions ===== */}
      {Array.from({ length: PAGES }).map((_, pageIdx) => {
        const pageStart = INTRO_END + pageIdx * PAGE_DUR;
        const transitionType = pageIdx % 5; // 0=roll-in, 1=carousel, 2=flip, 3=scatter, 4=zoom-spin
        return (
          <Sequence key={`page-${pageIdx}`} from={pageStart} durationInFrames={PAGE_DUR}>
            <AbsoluteFill>
              {/* Flash transition */}
              {(() => {
                const localF = frame - pageStart;
                const flash = localF < 3 ? interpolate(localF, [0, 1, 3], [0.8, 0.4, 0], { extrapolateRight: "clamp" }) : 0;
                return flash > 0 ? (
                  <div style={{
                    position: "absolute", inset: 0, background: "#fff",
                    opacity: flash, zIndex: 100, pointerEvents: "none",
                  }} />
                ) : null;
              })()}

              {/* Divider lines - fade in */}
              {(() => {
                const lineOp = interpolate(frame - pageStart, [5, 15], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <>
                    <div style={{ position: "absolute", left: 1920 / 2 - 1, top: GRID_Y, width: 2, height: CELL_H * 2 + GAP, background: `rgba(255,255,255,${lineOp})` }} />
                    <div style={{ position: "absolute", left: GRID_X, top: 1080 / 2 - 1, width: CELL_W * 2 + GAP, height: 2, background: `rgba(255,255,255,${lineOp})` }} />
                  </>
                );
              })()}

              {/* 4 cells with varied entrance animations */}
              {[0, 1, 2, 3].map((cellIdx) => {
                const styleIdx = pageIdx * 4 + cellIdx;
                const pos = cellPos(cellIdx);
                const localFrame = frame - pageStart;
                const styleFn = styles[styleIdx];
                if (!styleFn) return null;

                const delay = cellIdx * 4;
                const s = spring({ frame: Math.max(0, localFrame - delay), fps, config: { stiffness: 120, damping: 14 } });

                // Different entrance per page type
                let cellTransform = "";
                let cellOpacity = s;

                if (transitionType === 0) {
                  // Roll in from sides
                  const dir = cellIdx % 2 === 0 ? -1 : 1;
                  const tx = interpolate(s, [0, 1], [dir * 600, 0]);
                  const rot = interpolate(s, [0, 1], [dir * 30, 0]);
                  cellTransform = `translateX(${tx}px) rotate(${rot}deg)`;
                } else if (transitionType === 1) {
                  // Carousel - rotate in from bottom with 3D perspective
                  const ty = interpolate(s, [0, 1], [400, 0]);
                  const rotX = interpolate(s, [0, 1], [60, 0]);
                  cellTransform = `perspective(1000px) translateY(${ty}px) rotateX(${rotX}deg)`;
                } else if (transitionType === 2) {
                  // Flip in
                  const rotY = interpolate(s, [0, 1], [180, 0]);
                  cellTransform = `perspective(800px) rotateY(${rotY}deg)`;
                } else if (transitionType === 3) {
                  // Scatter - fly in from random positions
                  const angles = [[-500, -300], [500, -300], [-500, 300], [500, 300]];
                  const [ax, ay] = angles[cellIdx];
                  const tx = interpolate(s, [0, 1], [ax, 0]);
                  const ty = interpolate(s, [0, 1], [ay, 0]);
                  const rot = interpolate(s, [0, 1], [(cellIdx - 2) * 40, 0]);
                  cellTransform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${0.3 + s * 0.7})`;
                } else {
                  // Zoom spin
                  const sc = interpolate(s, [0, 1], [0.1, 1]);
                  const rot = interpolate(s, [0, 1], [360, 0]);
                  cellTransform = `scale(${sc}) rotate(${rot}deg)`;
                }

                return (
                  <div
                    key={cellIdx}
                    style={{
                      position: "absolute",
                      left: pos.x,
                      top: pos.y,
                      width: CELL_W,
                      height: CELL_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      transform: cellTransform,
                      opacity: cellOpacity,
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 12, left: 16,
                      fontSize: 28, fontWeight: 900, color: "#fff",
                      opacity: 0.7, zIndex: 10,
                    }}>
                      #{styleIdx + 1}
                    </span>
                    {styleFn(localFrame, fps, styleIdx)}
                  </div>
                );
              })}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* ===== OUTRO (660-750) ===== */}
      <Sequence from={CONTENT_END} durationInFrames={500 - CONTENT_END}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {(() => {
            const localF = frame - CONTENT_END;
            const s = spring({ frame: localF, fps, config: { stiffness: 100, damping: 12 } });
            return (
              <div style={{
                textAlign: "center",
                transform: `scale(${s})`,
                opacity: s,
              }}>
                <h1 style={{
                  fontSize: 80, fontWeight: 900, color: "#fff", margin: 0,
                  textShadow: "0 0 40px rgba(255,0,0,0.5)",
                }}>
                  ORDER NOW
                </h1>
                <p style={{
                  fontSize: 28, color: GOLD, marginTop: 16, fontWeight: 600,
                  opacity: interpolate(localF, [10, 25], [0, 1], { extrapolateRight: "clamp" }),
                }}>
                  Custom Subscribe Animations for Your Channel
                </p>
                <div style={{
                  marginTop: 30,
                  opacity: interpolate(localF, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
                }}>
                  <SubButton text="GET STARTED" bg={YT_RED} radius={8} px={40} py={16} />
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
