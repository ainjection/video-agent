import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  random,
} from 'remotion';

const PARTICLE_COUNT = 100;

export const AIInjectionIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Generate deterministic particles
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: random(`x-${i}`) * width,
      y: random(`y-${i}`) * height,
      size: random(`size-${i}`) * 4 + 2,
      speedY: random(`speedY-${i}`) * 2 + 0.5,
      speedX: (random(`speedX-${i}`) - 0.5) * 1,
      opacity: random(`opacity-${i}`) * 0.4 + 0.1,
    }));
  }, [width, height]);

  // Spring animation for the text entrance
  const textScale = spring({
    fps,
    frame: frame - 15, // Delay the entrance slightly
    config: { damping: 12, mass: 0.8 },
  });

  // Fade in the text
  const textOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Create a neon flicker effect during the entrance
  const isFlickering = frame > 15 && frame < 35;
  const flickerOpacity = isFlickering && random(`flicker-${frame}`) > 0.5 ? 0.4 : 1;

  // Subtle floating effect for the text after it lands
  const floatY = Math.sin(frame * 0.05) * 10;

  return (
    <AbsoluteFill className="bg-zinc-950 overflow-hidden">
      {/* Radial gradient vignette to make the center pop */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, #09090b 100%)',
          zIndex: 1,
        }}
      />

      {/* Particles Layer */}
      <AbsoluteFill style={{ zIndex: 0 }}>
        {particles.map((p) => {
          // Calculate movement
          const currentY = p.y - frame * p.speedY;
          const currentX = p.x + frame * p.speedX;
          
          // Wrap particles around the screen
          const wrappedY = ((currentY % height) + height) % height;
          const wrappedX = ((currentX % width) + width) % width;

          return (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: wrappedX,
                top: wrappedY,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                backgroundColor: '#39ff14',
                boxShadow: '0 0 10px #39ff14',
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Typography Layer */}
      <AbsoluteFill className="items-center justify-center" style={{ zIndex: 2 }}>
        <h1
          className="text-8xl md:text-9xl font-black uppercase tracking-tighter"
          style={{
            color: '#39ff14',
            opacity: textOpacity * flickerOpacity,
            transform: `scale(${textScale}) translateY(${floatY}px)`,
            textShadow: `
              0 0 10px rgba(57, 255, 20, 0.7), 
              0 0 20px rgba(57, 255, 20, 0.5), 
              0 0 40px rgba(57, 255, 20, 0.3), 
              0 0 80px rgba(57, 255, 20, 0.2)
            `,
          }}
        >
          AI Injection
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};