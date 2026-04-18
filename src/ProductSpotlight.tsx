import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
  Audio,
  Img,
} from "remotion";

// ── Zod Props Schema ──
export const productSpotlightSchema = z.object({
  channelName: z.string().default("AI Injection"),
  subscriberCount: z.string().default("1.79K subscribers"),
  product1Brand: z.string().default("Tom Ford"),
  product1Name: z.string().default("Black Orchid"),
  product1Price: z.string().default("£85.00"),
  product2Brand: z.string().default("Chanel"),
  product2Name: z.string().default("Coco Mademoiselle"),
  product2Price: z.string().default("£85.00"),
  product3Brand: z.string().default("Jimmy Choo"),
  product3Name: z.string().default("Flash"),
  product3Price: z.string().default("£32.99"),
  product4Brand: z.string().default("Marc Jacobs"),
  product4Name: z.string().default("Daisy"),
  product4Price: z.string().default("£70.00"),
  product5Brand: z.string().default("Rabanne"),
  product5Name: z.string().default("Invictus Victory"),
  product5Price: z.string().default("£54.99"),
  product6Brand: z.string().default("Moschino"),
  product6Name: z.string().default("Toy 2 Bubblegum"),
  product6Price: z.string().default("£39.99"),
  product7Brand: z.string().default("Dior"),
  product7Name: z.string().default("Miss Dior"),
  product7Price: z.string().default("£75.00"),
  product8Brand: z.string().default("Calvin Klein"),
  product8Name: z.string().default("Eternity"),
  product8Price: z.string().default("£35.99"),
  product9Brand: z.string().default("Carolina Herrera"),
  product9Name: z.string().default("Good Girl"),
  product9Price: z.string().default("£64.99"),
});

type Props = z.infer<typeof productSpotlightSchema>;

const DEFAULT_PRODUCTS = [
  { brand: "Tom Ford", name: "Black Orchid", price: "£85.00", image: staticFile("products/p1.jpg") },
  { brand: "Chanel", name: "Coco Mademoiselle", price: "£85.00", image: staticFile("products/p2.jpg") },
  { brand: "Jimmy Choo", name: "Flash", price: "£32.99", image: staticFile("products/p3.jpg") },
  { brand: "Marc Jacobs", name: "Daisy", price: "£70.00", image: staticFile("products/p4.jpg") },
  { brand: "Rabanne", name: "Invictus Victory", price: "£54.99", image: staticFile("products/p5.jpg") },
  { brand: "Moschino", name: "Toy 2 Bubblegum", price: "£39.99", image: staticFile("products/p6.jpg") },
  { brand: "Dior", name: "Miss Dior", price: "£75.00", image: staticFile("products/p7.jpg") },
  { brand: "Calvin Klein", name: "Eternity", price: "£35.99", image: staticFile("products/p8.jpg") },
  { brand: "Carolina Herrera", name: "Good Girl", price: "£64.99", image: staticFile("products/p9.jpg") },
];

const CARD_W = 320;
const CARD_H = 460;
const FRAMES_PER_PRODUCT = 80;

// ── Sparkle particles ──
const SPARKLES = Array.from({ length: 15 }, (_, i) => ({
  x: Math.sin(i * 2.4) * 800 + 960,
  y: Math.cos(i * 3.1) * 400 + 540,
  delay: i * 0.3,
  size: 2 + (i % 3),
  speed: 0.8 + (i % 4) * 0.3,
}));

// ── Particle burst seeds ──
const BURST_PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  return {
    dx: Math.cos(angle) * (80 + (i % 3) * 40),
    dy: Math.sin(angle) * (80 + (i % 3) * 40),
    size: 2 + (i % 3),
  };
});

// ── Golden shimmer dots ──
const SHIMMER_DOTS = Array.from({ length: 30 }, (_, i) => ({
  x: (i * 137.5) % 1920,
  y: (i * 89.3) % 1080,
  phase: i * 0.7,
}));

const getEntrance = (
  localFrame: number,
  productIndex: number,
  fps: number
) => {
  const variant = productIndex % 5;
  const progress = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const sp = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 20 });

  switch (variant) {
    case 0: // zoom spin from center
      return {
        transform: `scale(${interpolate(progress, [0, 1], [0, 1])}) rotate(${interpolate(progress, [0, 1], [360, 0])}deg)`,
        opacity: interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
      };
    case 1: // flip in from right
      return {
        transform: `perspective(1200px) translateX(${interpolate(sp, [0, 1], [1200, 0])}px) rotateY(${interpolate(sp, [0, 1], [180, 0])}deg)`,
        opacity: interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
      };
    case 2: // drop from top with bounce
      return {
        transform: `translateY(${interpolate(sp, [0, 1], [-800, 0])}px)`,
        opacity: interpolate(progress, [0, 0.15], [0, 1], { extrapolateRight: "clamp" }),
      };
    case 3: // slide and rotate from left
      return {
        transform: `translateX(${interpolate(sp, [0, 1], [-1000, 0])}px) rotate(${interpolate(sp, [0, 1], [-30, 0])}deg)`,
        opacity: interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
      };
    case 4: // scale up from behind
      return {
        transform: `scale(${interpolate(sp, [0, 1], [3, 1])})`,
        opacity: interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
      };
    default:
      return {};
  }
};

const getExit = (localFrame: number, productIndex: number, fps: number) => {
  const variant = productIndex % 5;
  const exitLocal = localFrame - 55;
  const progress = interpolate(exitLocal, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  switch (variant) {
    case 0: // shrink and spin out
      return {
        transform: `scale(${interpolate(progress, [0, 1], [1, 0])}) rotate(${interpolate(progress, [0, 1], [0, -360])}deg)`,
        opacity: interpolate(progress, [0.7, 1], [1, 0], { extrapolateLeft: "clamp" }),
      };
    case 1: // fly out left
      return {
        transform: `translateX(${interpolate(progress, [0, 1], [0, -1500])}px) rotate(${interpolate(progress, [0, 1], [0, -20])}deg)`,
        opacity: interpolate(progress, [0.8, 1], [1, 0], { extrapolateLeft: "clamp" }),
      };
    case 2: // fall down
      return {
        transform: `translateY(${interpolate(progress, [0, 1], [0, 1000])}px) rotate(${interpolate(progress, [0, 1], [0, 15])}deg)`,
        opacity: interpolate(progress, [0.8, 1], [1, 0], { extrapolateLeft: "clamp" }),
      };
    case 3: // zoom away
      return {
        transform: `scale(${interpolate(progress, [0, 1], [1, 3])})`,
        opacity: interpolate(progress, [0, 1], [1, 0]),
      };
    case 4: // flip out right
      return {
        transform: `perspective(1200px) translateX(${interpolate(progress, [0, 1], [0, 1500])}px) rotateY(${interpolate(progress, [0, 1], [0, -180])}deg)`,
        opacity: interpolate(progress, [0.8, 1], [1, 0], { extrapolateLeft: "clamp" }),
      };
    default:
      return {};
  }
};

const ProductCard: React.FC<{
  product: (typeof PRODUCTS)[number];
  localFrame: number;
  productIndex: number;
  fps: number;
  mini?: boolean;
}> = ({ product, localFrame, productIndex, fps, mini }) => {
  const scale = mini ? 0.8 : 1;
  const floatY =
    !mini && localFrame >= 15 && localFrame <= 55
      ? Math.sin(((localFrame - 15) / 40) * Math.PI * 2) * 3
      : 0;

  let animStyle: React.CSSProperties = {};
  if (!mini) {
    if (localFrame < 20) {
      animStyle = getEntrance(localFrame, productIndex, fps);
    } else if (localFrame >= 55 && localFrame < 75) {
      animStyle = getExit(localFrame, productIndex, fps);
    } else if (localFrame >= 75) {
      animStyle = { opacity: 0 };
    }
  }

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(20,20,20,0.95)",
        border: "1px solid rgba(255,215,0,0.4)",
        display: "flex",
        flexDirection: "column",
        transform: `scale(${scale}) translateY(${floatY}px)`,
        ...animStyle,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "65%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
        }}
      >
        <Img
          src={product.image}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#FFD700",
            fontSize: 16,
            textTransform: "uppercase",
            letterSpacing: 2,
            fontFamily: "sans-serif",
            fontWeight: 500,
          }}
        >
          {product.brand}
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "sans-serif",
            textAlign: "center",
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            color: "#000",
            fontSize: 18,
            fontWeight: 700,
            padding: "4px 18px",
            borderRadius: 20,
            fontFamily: "sans-serif",
          }}
        >
          {product.price}
        </div>
      </div>
    </div>
  );
};

export const ProductSpotlight: React.FC<Props> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build products from props
  const PRODUCTS = DEFAULT_PRODUCTS.map((p, i) => ({
    ...p,
    brand: (props as any)[`product${i + 1}Brand`] || p.brand,
    name: (props as any)[`product${i + 1}Name`] || p.name,
    price: (props as any)[`product${i + 1}Price`] || p.price,
  }));
  const channelName = props.channelName || "AI Injection";
  const subscriberCount = props.subscriberCount || "1.79K subscribers";

  // ── Determine which product is showing ──
  const productIndex = Math.min(
    Math.floor(frame / FRAMES_PER_PRODUCT),
    PRODUCTS.length - 1
  );
  const localFrame = frame - productIndex * FRAMES_PER_PRODUCT;
  const inProductPhase = frame < 720;

  // ── Final grid phase ──
  const inFinalPhase = frame >= 720;
  const finalLocal = frame - 720;

  // ── Brand typewriter text ──
  const brandText = PRODUCTS[productIndex]?.brand || "";
  const typeProgress = interpolate(localFrame, [5, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibleChars = Math.floor(typeProgress * brandText.length);

  // ── Price pill ──
  const priceSlide = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 12, stiffness: 100 },
    durationInFrames: 10,
  });

  // ── Spotlight pulse ──
  const spotlightSize =
    300 +
    Math.sin(frame * 0.08) * 30 +
    interpolate(localFrame, [0, 20], [0, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }) *
      200;

  // ── Particle burst ──
  const burstProgress =
    localFrame >= 15
      ? interpolate(localFrame, [15, 35], [0, 1], { extrapolateRight: "clamp" })
      : 0;

  // ── Final grid spring ──
  const gridSpring = inFinalPhase
    ? spring({ frame: finalLocal, fps, config: { damping: 14, stiffness: 80 }, durationInFrames: 25 })
    : 0;

  // ── Subscribe overlay ──
  const subSlide = inFinalPhase
    ? spring({
        frame: Math.max(0, finalLocal - 40),
        fps,
        config: { damping: 12, stiffness: 100 },
        durationInFrames: 20,
      })
    : 0;

  // ── Flash transition ──
  const flashOpacity =
    inProductPhase && localFrame >= 75
      ? interpolate(localFrame, [75, 77, 80], [0.4, 0, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0a0810 0%, #050508 100%)",
      }}
    >
      {/* ── Golden shimmer dots ── */}
      {SHIMMER_DOTS.map((dot, i) => {
        const shimmerOp =
          0.03 +
          Math.sin(frame * 0.02 + dot.phase) * 0.03 +
          Math.sin(frame * 0.035 + dot.phase * 2) * 0.02;
        const driftX = Math.sin(frame * 0.005 + dot.phase) * 20;
        const driftY = Math.cos(frame * 0.007 + dot.phase) * 15;
        return (
          <div
            key={`shimmer-${i}`}
            style={{
              position: "absolute",
              left: dot.x + driftX,
              top: dot.y + driftY,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#FFD700",
              opacity: shimmerOp,
            }}
          />
        );
      })}

      {/* ── Gold sparkles ── */}
      {SPARKLES.map((sp, i) => {
        const twinkle =
          0.15 +
          Math.sin(frame * sp.speed * 0.1 + sp.delay) * 0.15 +
          Math.cos(frame * 0.07 + i) * 0.1;
        const sx = sp.x + Math.sin(frame * 0.01 + sp.delay) * 40;
        const sy = sp.y + Math.cos(frame * 0.013 + sp.delay) * 30;
        return (
          <div
            key={`sparkle-${i}`}
            style={{
              position: "absolute",
              left: sx,
              top: sy,
              width: sp.size,
              height: sp.size,
              borderRadius: "50%",
              background: "#FFD700",
              opacity: Math.max(0, twinkle),
              boxShadow: `0 0 ${sp.size * 2}px rgba(255,215,0,0.5)`,
            }}
          />
        );
      })}

      {/* ── Individual product phase ── */}
      {inProductPhase && (
        <>
          {/* Spotlight glow behind card - hide during exit */}
          {localFrame >= 0 && localFrame < 55 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: spotlightSize * 2,
                height: spotlightSize * 2,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}

          {/* Brand name typewriter - fade out before exit */}
          {localFrame >= 5 && localFrame < 55 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -${CARD_H / 2 + 50}px)`,
                color: "#FFD700",
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: 4,
                textTransform: "uppercase",
                fontFamily: "sans-serif",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {brandText.slice(0, visibleChars)}
              {visibleChars < brandText.length && (
                <span
                  style={{
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                    marginLeft: 2,
                  }}
                >
                  |
                </span>
              )}
            </div>
          )}

          {/* Card */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <ProductCard
              product={PRODUCTS[productIndex]}
              localFrame={localFrame}
              productIndex={productIndex}
              fps={fps}
            />
          </div>

          {/* Reflection - hide during exit */}
          {localFrame >= 5 && localFrame < 55 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: `calc(50% + ${CARD_H / 2 + 5}px)`,
                transform: "translateX(-50%) scaleY(-0.25)",
                transformOrigin: "top center",
                opacity: 0.15,
                filter: "blur(3px)",
                pointerEvents: "none",
              }}
            >
              <ProductCard
                product={PRODUCTS[productIndex]}
                localFrame={20}
                productIndex={productIndex}
                fps={fps}
              />
            </div>
          )}

          {/* Price pill (slides up below card) */}
          {localFrame >= 10 && localFrame < 55 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: `calc(50% + ${CARD_H / 2 + 15}px)`,
                transform: `translateX(-50%) translateY(${interpolate(
                  priceSlide,
                  [0, 1],
                  [40, 0]
                )}px)`,
                opacity: priceSlide,
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "#000",
                fontSize: 20,
                fontWeight: 700,
                padding: "6px 24px",
                borderRadius: 24,
                fontFamily: "sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {PRODUCTS[productIndex].price}
            </div>
          )}

          {/* Particle burst on entrance */}
          {localFrame >= 15 && localFrame < 35 && (
            <>
              {BURST_PARTICLES.map((p, i) => (
                <div
                  key={`burst-${i}`}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${p.dx * burstProgress}px)`,
                    top: `calc(50% + ${p.dy * burstProgress}px)`,
                    width: p.size,
                    height: p.size,
                    borderRadius: "50%",
                    background: "#FFD700",
                    opacity: interpolate(burstProgress, [0, 0.3, 1], [0, 1, 0]),
                    boxShadow: "0 0 6px rgba(255,215,0,0.6)",
                  }}
                />
              ))}
            </>
          )}

          {/* Product number removed */}

          {/* Flash transition */}
          {flashOpacity > 0 && (
            <AbsoluteFill
              style={{
                background: "#fff",
                opacity: flashOpacity,
              }}
            />
          )}
        </>
      )}

      {/* ── Final grid + subscribe phase ── */}
      {inFinalPhase && (
        <>
          {/* 3x3 grid */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "45%",
              transform: "translate(-50%, -50%)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              opacity: gridSpring,
            }}
          >
            {PRODUCTS.map((product, i) => {
              const stagger = spring({
                frame: Math.max(0, finalLocal - i * 2),
                fps,
                config: { damping: 14, stiffness: 100 },
                durationInFrames: 20,
              });
              return (
                <div
                  key={i}
                  style={{
                    transform: `scale(${stagger * 0.8})`,
                    opacity: stagger,
                  }}
                >
                  <ProductCard
                    product={product}
                    localFrame={30}
                    productIndex={i}
                    fps={fps}
                    mini
                  />
                </div>
              );
            })}
          </div>

          {/* Subscribe overlay */}
          {finalLocal >= 40 && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: `translateX(-50%) translateY(${interpolate(
                  subSlide,
                  [0, 1],
                  [200, 0]
                )}px) scale(1.5)`,
                opacity: subSlide,
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "rgba(15,15,15,0.95)",
                padding: "14px 28px",
                borderRadius: "16px 16px 0 0",
                border: "1px solid rgba(255,215,0,0.3)",
                borderBottom: "none",
              }}
            >
              <Img
                src={staticFile("avatar.jpg")}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "2px solid #FFD700",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "sans-serif",
                  }}
                >
                  {channelName}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    fontFamily: "sans-serif",
                  }}
                >
                  {subscriberCount}
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "#000",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "6px 18px",
                  borderRadius: 20,
                  fontFamily: "sans-serif",
                  marginLeft: 8,
                }}
              >
                Subscribe
              </div>
              <div style={{ fontSize: 20, marginLeft: 4 }}>🔔</div>
            </div>
          )}
        </>
      )}

      {/* ── Audio ── */}
      {PRODUCTS.map((_, i) => {
        const startFrame = i * FRAMES_PER_PRODUCT;
        const soundFile = i % 2 === 0 ? "pop.mp3" : "click.mp3";
        return (
          <Sequence key={`sound-${i}`} from={startFrame} durationInFrames={30}>
            <Audio src={staticFile(soundFile)} volume={0.7} />
          </Sequence>
        );
      })}

      {/* Bell on subscribe */}
      <Sequence from={760} durationInFrames={50}>
        <Audio src={staticFile("bell.mp3")} volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};
