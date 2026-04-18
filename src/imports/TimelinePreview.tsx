import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { AnimatedText as AnimatedText__1 } from "../AnimatedText";

export const TimelinePreview: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}><AnimatedText__1 {...({"text":"BREAKING NEWS","style":"glitch","backgroundColor":"#0a0a1a","color":"#ffffff","fontSize":80,"fontFamily":"system-ui, sans-serif","position":"center"} as any)} /></Sequence>
      <Sequence from={90} durationInFrames={128}><AnimatedText__1 {...({"text":"Build Faster Ship Smarter","style":"word-by-word","backgroundColor":"#0a0a1a","color":"#ffffff","fontSize":64,"fontFamily":"system-ui, sans-serif","position":"center"} as any)} /></Sequence>
      <Sequence from={218} durationInFrames={102}><AnimatedText__1 {...({"text":"Welcome to the Future","style":"typewriter","backgroundColor":"#0a0a1a","color":"#ffffff","fontSize":72,"fontFamily":"system-ui, sans-serif","position":"center"} as any)} /></Sequence>
    </AbsoluteFill>
  );
};
