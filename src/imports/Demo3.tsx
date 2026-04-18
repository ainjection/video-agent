import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

// --- Scene 1: Welcome ---
const WelcomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Simple spring pop-in
  const scale = spring({ fps, frame, config: { damping: 12 } });
  
  // Fade out at the end
  const opacity = interpolate(frame, [45, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill className="items-center justify-center bg-slate-950" style={{ opacity }}>
      <h1
        className="text-white font-black text-9xl tracking-tighter"
        style={{ transform: `scale(${scale})` }}
      >
        WELCOME
      </h1>
    </AbsoluteFill>
  );
};

// --- Scene 2: Spinning 2 ---
const SpinningTwoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({ fps, frame, config: { damping: 14 } });
  
  // Spins continuously over 90 frames (3 seconds)
  const rotateY = interpolate(frame, [0, 90], [0, 1080], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at the end
  const opacity = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="items-center justify-center bg-slate-950" style={{ opacity }}>
      <div
        className="text-cyan-400 font-black text-[350px]"
        style={{
          transform: `scale(${scale}) rotateY(${rotateY}deg)`,
        }}
      >
        2
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 3: Remotion Fake Glass Effect ---
const GlassRemotionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const slideUp = spring({
    fps,
    frame,
    from: 100,
    to: 0,
    config: { damping: 14 },
  });
  
  // Fade out at the end
  const opacity = interpolate(frame, [50, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="items-center justify-center bg-slate-950" style={{ opacity }}>
      {/* Fake glass: semi-transparent bg + border, NO backdrop-blur to prevent crashes */}
      <div
        className="bg-white/10 border border-white/20 rounded-3xl px-20 py-12 flex items-center justify-center"
        style={{
          transform: `translateY(${slideUp}px)`,
        }}
      >
        <h1 className="text-white font-black text-8xl tracking-widest">
          REMOTION
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 4: Video Agent Demo ---
const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Staggered spring animations
  const scale1 = spring({ fps, frame, config: { damping: 12 } });
  const scale2 = spring({ fps, frame: frame - 8, config: { damping: 12 } });

  // Clamp scale2 to use safely as opacity
  const safeOpacity = interpolate(scale2, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="items-center justify-center bg-slate-950 flex-col gap-8">
      <div
        className="text-white font-black text-8xl"
        style={{ transform: `scale(${scale1})` }}
      >
        VIDEO AGENT
      </div>
      <div
        className="bg-white text-slate-950 px-8 py-4 rounded-xl"
        style={{ transform: `scale(${scale2})`, opacity: safeOpacity }}
      >
        <span className="font-bold text-6xl tracking-[0.3em] ml-[0.3em]">
          DEMO
        </span>
      </div>
    </AbsoluteFill>
  );
};

// --- Main Composition ---
export const SimpleFastPromo: React.FC = () => {
  return (
    <AbsoluteFill className="bg-slate-950">
      {/* Scene 1: 2 Seconds (60 frames) */}
      <Sequence from={0} durationInFrames={60}>
        <WelcomeScene />
      </Sequence>
      
      {/* Scene 2: 3 Seconds (90 frames) */}
      <Sequence from={60} durationInFrames={90}>
        <SpinningTwoScene />
      </Sequence>
      
      {/* Scene 3: 2 Seconds (60 frames) */}
      <Sequence from={150} durationInFrames={60}>
        <GlassRemotionScene />
      </Sequence>
      
      {/* Scene 4: 2.5 Seconds (75 frames) */}
      <Sequence from={210} durationInFrames={75}>
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
};