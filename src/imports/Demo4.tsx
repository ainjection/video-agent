import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

// --- Animated Background ---
// Continuous, smooth motion for a dynamic base layer
const DynamicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Slow continuous rotation and scale
  const rotate = interpolate(frame, [0, 300], [0, 45]);
  const scale = interpolate(frame, [0, 300], [1, 1.2]);

  return (
    <AbsoluteFill className="bg-slate-950 overflow-hidden items-center justify-center">
      <div 
        className="absolute w-[150vw] h-[150vh] flex items-center justify-center"
        style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
      >
        <div className="absolute w-[800px] h-[800px] bg-fuchsia-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[600px] h-[600px] bg-cyan-600/30 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
      </div>
      {/* Noise overlay for premium texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </AbsoluteFill>
  );
};

// --- Scene 1: Welcome ---
const WelcomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Snappy entrance
  const scaleIn = spring({ fps, frame, config: { stiffness: 200, damping: 15 } });
  
  // Continuous slow zoom
  const slowZoom = interpolate(frame, [0, 50], [1, 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fast zoom out and fade at the end
  const exitScale = interpolate(frame, [40, 50], [1, 3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [40, 50], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill className="items-center justify-center" style={{ opacity }}>
      <h1
        className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 font-black text-9xl tracking-tighter"
        style={{ transform: `scale(${scaleIn * slowZoom * exitScale})` }}
      >
        WELCOME
      </h1>
    </AbsoluteFill>
  );
};

// --- Scene 2: Spinning 2 ---
// Exactly 3 seconds (90 frames)
const SpinningTwoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Fade in from previous scene
  const opacityIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  // Fade out to next scene
  const opacityOut = interpolate(frame, [80, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = opacityIn * opacityOut;

  const scale = spring({ fps, frame, config: { damping: 12, stiffness: 150 } });
  
  // Dynamic 3D spin (3 full rotations over 3 seconds)
  const rotateY = interpolate(frame, [0, 90], [0, 1080], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="items-center justify-center" style={{ opacity, perspective: 1000 }}>
      <div
        className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 font-black text-[350px] drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]"
        style={{
          transform: `scale(${scale}) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        2
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 3: Dynamic Glass Panel ---
const GlassRemotionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacityIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const opacityOut = interpolate(frame, [60, 70], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = opacityIn * opacityOut;

  // 3D flip entrance for the glass panel
  const rotateX = spring({ fps, frame, from: 90, to: 0, config: { damping: 14 } });
  const scale = spring({ fps, frame, from: 0.5, to: 1, config: { damping: 14 } });
  
  // Light sweep effect across the glass
  const shimmerTranslate = interpolate(frame, [15, 45], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="items-center justify-center" style={{ opacity, perspective: 1200 }}>
      <div
        className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl px-24 py-16 flex items-center justify-center"
        style={{
          transform: `scale(${scale}) rotateX(${rotateX}deg)`,
        }}
      >
        {/* Shimmer reflection */}
        <div 
          className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[30deg]"
          style={{ transform: `translateX(${shimmerTranslate}%)` }}
        />
        
        <h1 className="text-white font-black text-8xl tracking-[0.2em] drop-shadow-xl relative z-10">
          REMOTION
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 4: Fast Paced Video Agent Demo ---
const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Extremely snappy staggered entrances
  const config = { damping: 12, stiffness: 250 };
  const slideLeft = spring({ fps, frame, from: -200, to: 0, config });
  const slideRight = spring({ fps, frame: frame - 4, from: 200, to: 0, config });
  const scaleDemo = spring({ fps, frame: frame - 10, from: 0, to: 1, config });

  // Continuous subtle pulse on the final word
  const pulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.95, 1.05]);

  return (
    <AbsoluteFill className="items-center justify-center flex-col gap-8" style={{ opacity }}>
      <div className="flex gap-6 items-center overflow-hidden px-10 py-4">
        <span
          className="text-white font-black text-8xl drop-shadow-2xl"
          style={{ transform: `translateX(${slideLeft}px)` }}
        >
          VIDEO
        </span>
        <span
          className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 font-black text-8xl drop-shadow-2xl"
          style={{ transform: `translateX(${slideRight}px)` }}
        >
          AGENT
        </span>
      </div>
      
      <div
        className="bg-white text-slate-950 px-12 py-4 rounded-2xl shadow-[0_0_60px_rgba(255,255,255,0.3)]"
        style={{ transform: `scale(${scaleDemo * (frame > 20 ? pulse : 1)})` }}
      >
        <span className="font-bold text-7xl tracking-[0.4em] ml-[0.4em]">
          DEMO
        </span>
      </div>
    </AbsoluteFill>
  );
};

// --- Main Composition ---
export const DynamicPromo: React.FC = () => {
  // Overlapping sequences for smooth, dynamic transitions
  // Total duration: 240 frames (8 seconds)
  return (
    <AbsoluteFill>
      <DynamicBackground />
      
      {/* S1: 0 to 50 */}
      <Sequence from={0} durationInFrames={50}>
        <WelcomeScene />
      </Sequence>
      
      {/* S2: 40 to 130 (Overlaps S1 by 10 frames, lasts exactly 90 frames / 3s) */}
      <Sequence from={40} durationInFrames={90}>
        <SpinningTwoScene />
      </Sequence>
      
      {/* S3: 120 to 190 (Overlaps S2 by 10 frames) */}
      <Sequence from={120} durationInFrames={70}>
        <GlassRemotionScene />
      </Sequence>
      
      {/* S4: 180 to 240 (Overlaps S3 by 10 frames) */}
      <Sequence from={180} durationInFrames={60}>
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
};