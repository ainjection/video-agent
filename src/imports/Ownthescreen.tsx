import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
} from 'remotion';

// --- Configuration ---
const WORD_DURATION = 15;
const WORDS = [
  { text: 'THINK.', color: '#00FFCC' }, // Neon Cyan
  { text: 'BIGGER.', color: '#FF0055' }, // Hot Pink
  { text: 'MOVE.', color: '#FFDD00' }, // Neon Yellow
  { text: 'FASTER.', color: '#00FFCC' }, // Neon Cyan
];

// --- Subcomponents ---

const SlamWord: React.FC<{ text: string; punchColor: string }> = ({
  text,
  punchColor,
}) => {
  const frame = useCurrentFrame();

  // 1. Aggressive scale: starts huge (5x), slams to 1x at frame 4, then slowly creeps to 1.1x
  const scale = interpolate(frame, [0, 4, WORD_DURATION], [5, 1, 1.1], {
    extrapolateRight: 'clamp',
  });

  // 2. Motion blur: clears up exactly when the scale hits 1x
  const blur = interpolate(frame, [0, 4], [20, 0], {
    extrapolateRight: 'clamp',
  });

  // 3. Camera shake: violent X/Y displacement for 4 frames right after impact
  const isShaking = frame >= 4 && frame <= 7;
  const shakeX = isShaking ? (frame % 2 === 0 ? 20 : -20) : 0;
  const shakeY = isShaking ? (frame % 2 === 0 ? -15 : 15) : 0;

  // 4. Color punch: text flashes the punch color for 3 frames on impact
  const isPunch = frame >= 4 && frame <= 6;
  const color = isPunch ? punchColor : 'white';

  // 5. Background flash: the background flashes the punch color and fades out
  const bgFlashOpacity = interpolate(frame, [4, 12], [0.3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="bg-black overflow-hidden flex items-center justify-center">
      {/* Background Flash */}
      <AbsoluteFill
        style={{
          backgroundColor: punchColor,
          opacity: bgFlashOpacity,
        }}
      />

      {/* Slamming Text */}
      <h1
        className="font-black tracking-tighter uppercase m-0 leading-none text-center"
        style={{
          fontSize: 220,
          color: color,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {text}
      </h1>
    </AbsoluteFill>
  );
};

const FinalStatement: React.FC = () => {
  const frame = useCurrentFrame();

  // Similar slam mechanics, but held longer
  const scale = interpolate(frame, [0, 5, 90], [4, 1, 1.1], {
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(frame, [0, 5], [20, 0], {
    extrapolateRight: 'clamp',
  });

  // Chromatic Aberration (RGB Split) offsets
  const rOffset = interpolate(frame, [0, 12], [40, 0], {
    extrapolateRight: 'clamp',
  });
  const bOffset = interpolate(frame, [0, 12], [-40, 0], {
    extrapolateRight: 'clamp',
  });

  // Fade in a sub-headline after the main impact
  const subtextOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtextY = interpolate(frame, [15, 30], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const TextContent = (
    <div className="text-center leading-[0.85]">
      <div>OWN THE</div>
      <div>SCREEN.</div>
    </div>
  );

  return (
    <AbsoluteFill className="bg-black overflow-hidden flex items-center justify-center">
      <div style={{ transform: `scale(${scale})` }}>
        {/* Red Channel */}
        <div
          className="absolute text-red-600 font-black tracking-tighter"
          style={{
            fontSize: 240,
            filter: `blur(${blur}px)`,
            transform: `translateX(${rOffset}px)`,
            mixBlendMode: 'screen',
          }}
        >
          {TextContent}
        </div>

        {/* Blue Channel */}
        <div
          className="absolute text-blue-600 font-black tracking-tighter"
          style={{
            fontSize: 240,
            filter: `blur(${blur}px)`,
            transform: `translateX(${bOffset}px)`,
            mixBlendMode: 'screen',
          }}
        >
          {TextContent}
        </div>

        {/* Main White Channel */}
        <div
          className="relative text-white font-black tracking-tighter"
          style={{
            fontSize: 240,
            filter: `blur(${blur}px)`,
          }}
        >
          {TextContent}
        </div>

        {/* Subtext */}
        <div
          className="text-white text-center font-bold tracking-widest mt-8"
          style={{
            fontSize: 40,
            opacity: subtextOpacity,
            transform: `translateY(${subtextY}px)`,
            color: '#00FFCC',
          }}
        >
          NO COMPROMISES
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Main Composition ---

export const HypeReelIntro: React.FC = () => {
  return (
    <AbsoluteFill className="bg-black">
      {WORDS.map((item, index) => {
        const startFrame = index * WORD_DURATION;
        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={WORD_DURATION}
          >
            <SlamWord text={item.text} punchColor={item.color} />
          </Sequence>
        );
      })}

      {/* Final sequence starts right after the last word finishes */}
      <Sequence from={WORDS.length * WORD_DURATION}>
        <FinalStatement />
      </Sequence>
    </AbsoluteFill>
  );
};