import React, { useMemo } from "react";
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

const PRODUCTS = [
  { brand: "Tom Ford", name: "Black Orchid", price: "£85.00", img: staticFile("products/p1.jpg") },
  { brand: "Chanel", name: "Coco Mademoiselle", price: "£85.00", img: staticFile("products/p2.jpg") },
  { brand: "Jimmy Choo", name: "Flash", price: "£32.99", img: staticFile("products/p3.jpg") },
  { brand: "Marc Jacobs", name: "Daisy", price: "£70.00", img: staticFile("products/p4.jpg") },
  { brand: "Rabanne", name: "Invictus Victory", price: "£54.99", img: staticFile("products/p5.jpg") },
  { brand: "Moschino", name: "Toy 2 Bubblegum", price: "£39.99", img: staticFile("products/p6.jpg") },
  { brand: "Dior", name: "Miss Dior", price: "£75.00", img: staticFile("products/p7.jpg") },
  { brand: "Calvin Klein", name: "Eternity", price: "£35.99", img: staticFile("products/p8.jpg") },
  { brand: "Carolina Herrera", name: "Good Girl", price: "£64.99", img: staticFile("products/p9.jpg") },
];

const AVATAR = staticFile("avatar.jpg");
// Neutral gradient background - no image needed
const GOLD = "#FFD700";
const GOLD_GLOW = "rgba(255,215,0,0.6)";

const CARD_W = 260;
const CARD_H = 380;
const ENTRANCE_INTERVAL = 40;
const GRID_SNAP_FRAME = 420;
const SUBSCRIBE_FRAME = 500;
const TOTAL_FRAMES = 720;

// Spread-out positions for dramatic one-at-a-time entrances
const CARD_LAYOUTS = [
  { x: 150,  y: 60,   rot: -8,  entrance: "spinTop" },
  { x: 750,  y: 40,   rot: 5,   entrance: "flipLeft" },
  { x: 1350, y: 70,   rot: -3,  entrance: "rollBottom" },
  { x: 100,  y: 380,  rot: 6,   entrance: "tumbleCorner" },
  { x: 550,  y: 350,  rot: -4,  entrance: "zoomCenter" },
  { x: 1000, y: 370,  rot: 7,   entrance: "spinTop" },
  { x: 250,  y: 650,  rot: -6,  entrance: "flipLeft" },
  { x: 800,  y: 620,  rot: 3,   entrance: "tumbleCorner" },
  { x: 1400, y: 640,  rot: -5,  entrance: "rollBottom" },
];

// Clean 3x3 grid positions (centered on 1920x1080)
const GRID_CELL_W = 310;
const GRID_CELL_H = 430;
const GRID_START_X = (1920 - GRID_CELL_W * 3) / 2;
const GRID_START_Y = (1080 - GRID_CELL_H * 3) / 2;
const GRID_POSITIONS = Array.from({ length: 9 }).map((_, i) => ({
  x: GRID_START_X + (i % 3) * GRID_CELL_W + (GRID_CELL_W - CARD_W) / 2,
  y: GRID_START_Y + Math.floor(i / 3) * GRID_CELL_H + (GRID_CELL_H - CARD_H) / 2,
}));

// Deterministic pseudo-random for camera shake
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Product card component
const ProductCard = ({
  product,
  glow,
}: {
  product: (typeof PRODUCTS)[number];
  glow: number;
}) => (
  <div
    style={{
      width: CARD_W,
      height: CARD_H,
      background: "rgba(20,20,20,0.95)",
      borderRadius: 12,
      position: "relative",
      overflow: "hidden",
      boxShadow:
        glow > 0.3
          ? `0 0 ${40 * glow}px ${GOLD_GLOW}, 0 0 ${80 * glow}px rgba(255,215,0,${0.2 * glow}), 0 8px 30px rgba(0,0,0,0.6)`
          : "0 8px 30px rgba(0,0,0,0.6)",
      border:
        glow > 0.3
          ? `2px solid rgba(255,215,0,${0.5 * glow})`
          : "1px solid rgba(255,215,0,0.15)",
      display: "flex",
      flexDirection: "column" as const,
    }}
  >
    {/* Product image - top 65% */}
    <div
      style={{
        width: "100%",
        height: "65%",
        overflow: "hidden",
        borderRadius: "12px 12px 0 0",
      }}
    >
      <Img
        src={product.img}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `brightness(${0.8 + glow * 0.3})`,
        }}
      />
    </div>

    {/* Product info - bottom 35% */}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px",
        gap: 4,
      }}
    >
      {/* Brand name */}
      <div
        style={{
          color: GOLD,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "sans-serif",
          textTransform: "uppercase" as const,
          letterSpacing: 2,
          textAlign: "center" as const,
        }}
      >
        {product.brand}
      </div>

      {/* Product name */}
      <div
        style={{
          color: "white",
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "sans-serif",
          textAlign: "center" as const,
          lineHeight: 1.2,
        }}
      >
        {product.name}
      </div>

      {/* Price pill */}
      <div
        style={{
          marginTop: 4,
          background: `linear-gradient(135deg, ${GOLD}, #FFA500)`,
          color: "#0f0f0f",
          fontSize: 16,
          fontWeight: 800,
          fontFamily: "sans-serif",
          padding: "4px 16px",
          borderRadius: 20,
        }}
      >
        {product.price}
      </div>
    </div>

    {/* Glow overlay */}
    {glow > 0.2 && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          pointerEvents: "none",
          boxShadow: `inset 0 0 ${25 * glow}px rgba(255,215,0,${0.15 * glow})`,
          border: `1px solid rgba(255,215,0,${0.4 * glow})`,
        }}
      />
    )}
  </div>
);

// Get entrance animation transform
const getEntrance = (
  type: string,
  progress: number
): { transform: string; x: number; y: number } => {
  const inv = 1 - progress;
  switch (type) {
    case "spinTop":
      return {
        transform: `translateY(${inv * -800}px) rotate(${inv * 720}deg) scale(${0.3 + progress * 0.7})`,
        x: 0,
        y: inv * -800,
      };
    case "flipLeft":
      return {
        transform: `translateX(${inv * -1200}px) perspective(800px) rotateY(${inv * 360}deg) scale(${0.4 + progress * 0.6})`,
        x: inv * -1200,
        y: 0,
      };
    case "rollBottom":
      return {
        transform: `translateY(${inv * 900}px) rotate(${inv * -540}deg) scale(${0.3 + progress * 0.7})`,
        x: 0,
        y: inv * 900,
      };
    case "tumbleCorner":
      return {
        transform: `translate(${inv * 1000}px, ${inv * -600}px) rotate(${inv * 450}deg) scale(${0.2 + progress * 0.8})`,
        x: inv * 1000,
        y: inv * -600,
      };
    case "zoomCenter":
      return {
        transform: `scale(${inv * 4 + progress}) rotate(${inv * -180}deg)`,
        x: 0,
        y: 0,
      };
    default:
      return {
        transform: `translateY(${inv * -600}px) rotate(${inv * 360}deg)`,
        x: 0,
        y: inv * -600,
      };
  }
};

// Sound effect per card index
const getSoundForCard = (
  i: number
): { src: string; volume: number } => {
  const group = i % 3;
  if (group === 0) return { src: staticFile("pop.mp3"), volume: 0.6 };
  if (group === 1) return { src: staticFile("click.mp3"), volume: 0.7 };
  return { src: staticFile("bell.mp3"), volume: 0.4 };
};

export const ProductShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Which card is currently the "latest" (most recently arrived)
  const latestCard = Math.min(
    Math.floor(frame / ENTRANCE_INTERVAL),
    PRODUCTS.length - 1
  );

  // Count of landed cards (spring >= 0.9)
  const landedCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < PRODUCTS.length; i++) {
      const entranceStart = i * ENTRANCE_INTERVAL;
      if (frame < entranceStart) break;
      const prog = spring({
        frame: Math.max(0, frame - entranceStart),
        fps,
        config: { stiffness: 60, damping: 11 },
      });
      if (prog >= 0.9) count++;
    }
    return count;
  }, [frame, fps]);

  // Camera shake: accumulate shakes from all card landings
  const cameraShake = useMemo(() => {
    let shakeX = 0;
    let shakeY = 0;
    for (let i = 0; i < PRODUCTS.length; i++) {
      const entranceStart = i * ENTRANCE_INTERVAL;
      if (frame < entranceStart) break;
      const prog = spring({
        frame: Math.max(0, frame - entranceStart),
        fps,
        config: { stiffness: 60, damping: 11 },
      });
      if (prog >= 0.95) {
        const framesSinceLanding = frame - entranceStart;
        const shakeAge = framesSinceLanding - 12;
        if (shakeAge >= 0 && shakeAge < 5) {
          const intensity = 1 - shakeAge / 5;
          const rx = (seededRandom(i * 100 + shakeAge) - 0.5) * 2;
          const ry = (seededRandom(i * 200 + shakeAge) - 0.5) * 2;
          shakeX += rx * 4 * intensity;
          shakeY += ry * 3 * intensity;
        }
      }
    }
    return { x: shakeX, y: shakeY };
  }, [frame, fps]);

  // Grid snap animation
  const isGridPhase = frame >= GRID_SNAP_FRAME;
  const gridProgress = isGridPhase
    ? spring({
        frame: frame - GRID_SNAP_FRAME,
        fps,
        config: { stiffness: 80, damping: 14 },
      })
    : 0;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Sound effects per card */}
      {PRODUCTS.map((_, i) => {
        const snd = getSoundForCard(i);
        return (
          <Sequence
            key={`snd${i}`}
            from={i * ENTRANCE_INTERVAL}
            durationInFrames={15}
          >
            <Audio src={snd.src} volume={snd.volume} />
          </Sequence>
        );
      })}

      {/* Neutral dark gradient background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 40%, #1a1520 0%, #0a0a0f 60%, #050508 100%)",
      }} />
      {/* Subtle shimmer */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.01) * 15}% ${40 + Math.cos(frame * 0.008) * 10}%, rgba(255,215,0,0.04) 0%, transparent 50%)`,
      }} />

      {/* Warm gold overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255,200,80,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Scene container with camera shake */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cameraShake.x}px, ${cameraShake.y}px)`,
        }}
      >
        {/* CARDS */}
        {PRODUCTS.map((product, i) => {
          const entranceStart = i * ENTRANCE_INTERVAL;
          const layout = CARD_LAYOUTS[i];

          if (frame < entranceStart) return null;

          const progress = spring({
            frame: Math.max(0, frame - entranceStart),
            fps,
            config: { stiffness: 60, damping: 11 },
          });

          const entrance = getEntrance(layout.entrance, progress);
          const isLanded = progress >= 0.95;

          // Glow
          const isLatest = i === latestCard && frame >= entranceStart;
          const timeSinceLanding = frame - entranceStart - 25;
          const glow = isLatest
            ? interpolate(
                timeSinceLanding,
                [0, 10, 60],
                [0, 1, 0.3],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            : i === latestCard - 1
              ? 0.2
              : 0;

          // Float after landing (only before grid snap)
          const floatY =
            isLanded && !isGridPhase
              ? Math.sin((frame - entranceStart) * 0.05 + i) * 3
              : 0;

          // Grid snap interpolation
          const gridTarget = GRID_POSITIONS[i];
          const finalX = isGridPhase
            ? interpolate(gridProgress, [0, 1], [layout.x, gridTarget.x])
            : layout.x;
          const finalY = isGridPhase
            ? interpolate(
                gridProgress,
                [0, 1],
                [layout.y + floatY, gridTarget.y]
              )
            : layout.y + floatY;
          const finalRot = isGridPhase
            ? interpolate(gridProgress, [0, 1], [layout.rot, 0])
            : layout.rot;

          // Determine transform
          const cardTransform = isLanded
            ? `rotate(${finalRot * (isGridPhase ? 1 : progress)}deg)`
            : entrance.transform + ` rotate(${layout.rot * progress}deg)`;

          // Shadow beneath card
          const shadowSpread = interpolate(progress, [0, 1], [120, 60]);
          const shadowOpacity = interpolate(progress, [0, 1], [0.05, 0.35]);
          const shadowBlur = interpolate(progress, [0, 1], [20, 8]);

          return (
            <React.Fragment key={i}>
              {/* Motion trail (ghost copies during entrance) */}
              {!isLanded &&
                progress < 0.9 &&
                [0.15, 0.1, 0.05].map((opacity, ti) => {
                  const trailProgress = Math.max(
                    0,
                    progress - (ti + 1) * 0.08
                  );
                  const trailEntrance = getEntrance(
                    layout.entrance,
                    trailProgress
                  );
                  return (
                    <div
                      key={`trail${i}-${ti}`}
                      style={{
                        position: "absolute",
                        left: layout.x,
                        top: layout.y,
                        transform:
                          trailEntrance.transform +
                          ` rotate(${layout.rot * trailProgress}deg)`,
                        opacity,
                        filter: `blur(${2 + ti * 2}px)`,
                        zIndex: 9,
                        pointerEvents: "none" as const,
                      }}
                    >
                      <div
                        style={{
                          width: CARD_W,
                          height: CARD_H,
                          borderRadius: 12,
                          background: "rgba(255,215,0,0.1)",
                          border: "1px solid rgba(255,215,0,0.15)",
                        }}
                      />
                    </div>
                  );
                })}

              {/* Shadow */}
              <div
                style={{
                  position: "absolute",
                  left:
                    (isLanded ? finalX : layout.x) +
                    CARD_W / 2 -
                    shadowSpread / 2,
                  top: (isLanded ? finalY : layout.y) + CARD_H + 5,
                  width: shadowSpread,
                  height: 12,
                  borderRadius: "50%",
                  background: `rgba(0,0,0,${shadowOpacity})`,
                  filter: `blur(${shadowBlur}px)`,
                  zIndex: 9,
                  pointerEvents: "none" as const,
                }}
              />

              {/* Shockwave ring on landing (gold ring) */}
              {progress >= 0.9 &&
                (() => {
                  const shockStart = entranceStart + 12;
                  const shockFrame = frame - shockStart;
                  if (shockFrame >= 0 && shockFrame < 20) {
                    const shockRadius = interpolate(
                      shockFrame,
                      [0, 20],
                      [0, 300]
                    );
                    const shockOpacity = interpolate(
                      shockFrame,
                      [0, 20],
                      [0.6, 0]
                    );
                    const cx =
                      (isLanded ? finalX : layout.x) + CARD_W / 2;
                    const cy =
                      (isLanded ? finalY : layout.y) + CARD_H / 2;
                    return (
                      <div
                        style={{
                          position: "absolute",
                          left: cx - shockRadius,
                          top: cy - shockRadius,
                          width: shockRadius * 2,
                          height: shockRadius * 2,
                          borderRadius: "50%",
                          border: `2px solid ${GOLD}`,
                          opacity: shockOpacity,
                          pointerEvents: "none" as const,
                          zIndex: 50,
                          boxShadow: `0 0 ${shockRadius * 0.3}px rgba(255,215,0,${shockOpacity * 0.3})`,
                        }}
                      />
                    );
                  }
                  return null;
                })()}

              {/* Card */}
              <div
                style={{
                  position: "absolute",
                  left: isLanded ? finalX : layout.x,
                  top: isLanded ? finalY : layout.y,
                  transform: cardTransform,
                  zIndex: 10 + i,
                }}
              >
                <ProductCard product={product} glow={glow} />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Counter removed - not needed for audience */}

      {/* Golden sparkle particles */}
      {Array.from({ length: 25 }).map((_, i) => {
        const speed = 0.3 + (i % 5) * 0.2;
        const px = ((frame * speed + i * 100) % 2100) - 100;
        const py = ((i * 83 + frame * (0.2 + i * 0.03)) % 1200) - 50;
        const size = 1.5 + (i % 3);
        const twinkle =
          0.15 + Math.sin(frame * 0.12 + i * 2) * 0.25;
        return (
          <div
            key={`sparkle${i}`}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `rgba(255,215,100,${twinkle})`,
              boxShadow: `0 0 ${size * 4}px rgba(255,200,80,${twinkle * 0.6})`,
              zIndex: 50,
            }}
          />
        );
      })}

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 55,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Subscribe overlay - frame 620 to 900 */}
      <Sequence
        from={SUBSCRIBE_FRAME}
        durationInFrames={TOTAL_FRAMES - SUBSCRIBE_FRAME}
      >
        <div
          style={{
            position: "absolute",
            bottom: 35,
            left: "50%",
            transform: `translateX(-50%) translateY(${interpolate(
              spring({
                frame: frame - SUBSCRIBE_FRAME,
                fps,
                config: { stiffness: 80, damping: 14 },
              }),
              [0, 1],
              [120, 0]
            )}px) scale(1.5)`,
            display: "flex",
            alignItems: "center",
            gap: 0,
            zIndex: 60,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              overflow: "hidden",
              border: `3px solid ${GOLD}`,
              boxShadow: `0 0 20px ${GOLD_GLOW}`,
              zIndex: 2,
            }}
          >
            <Img
              src={AVATAR}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(20,20,20,0.95)",
              borderRadius: "0 36px 36px 0",
              padding: "10px 22px 10px 46px",
              marginLeft: -32,
              zIndex: 1,
              transform: `scaleX(${spring({
                frame: frame - (SUBSCRIBE_FRAME + 5),
                fps,
                config: { stiffness: 100, damping: 14 },
              })})`,
              transformOrigin: "left",
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                AI Injection
              </div>
              <div style={{ color: "#aaa", fontSize: 13 }}>
                1.79K subscribers
              </div>
            </div>
            <div
              style={{
                padding: "8px 18px",
                borderRadius: 22,
                fontWeight: 700,
                fontSize: 15,
                background:
                  frame >= SUBSCRIBE_FRAME + 40
                    ? "rgba(255,215,0,0.15)"
                    : GOLD,
                color:
                  frame >= SUBSCRIBE_FRAME + 40 ? GOLD : "#0f0f0f",
                border:
                  frame >= SUBSCRIBE_FRAME + 40
                    ? `1px solid ${GOLD}`
                    : "none",
              }}
            >
              {frame >= SUBSCRIBE_FRAME + 40
                ? "Subscribed"
                : "Subscribe"}
            </div>
            <div
              style={{
                transform: `rotate(${
                  frame >= SUBSCRIBE_FRAME + 55
                    ? Math.sin(
                        (frame - (SUBSCRIBE_FRAME + 55)) * 1
                      ) *
                      interpolate(
                        frame - (SUBSCRIBE_FRAME + 55),
                        [0, 25],
                        [15, 0],
                        { extrapolateRight: "clamp" }
                      )
                    : 0
                }deg)`,
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill={
                  frame >= SUBSCRIBE_FRAME + 55 ? GOLD : "white"
                }
                style={{
                  filter:
                    frame >= SUBSCRIBE_FRAME + 55
                      ? `drop-shadow(0 0 8px ${GOLD_GLOW})`
                      : "none",
                }}
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        <Sequence from={40} durationInFrames={15}>
          <Audio src={staticFile("click.mp3")} volume={0.8} />
        </Sequence>
        <Sequence from={55} durationInFrames={15}>
          <Audio src={staticFile("click.mp3")} volume={0.8} />
        </Sequence>
        <Sequence from={57} durationInFrames={30}>
          <Audio src={staticFile("bell.mp3")} volume={1} />
        </Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
