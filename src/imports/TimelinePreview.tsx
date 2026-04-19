import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { AnimatedText as AnimatedText__1 } from "../AnimatedText";
import { Comparison as Comparison__2 } from "../Comparison";

export const TimelinePreview: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}><AnimatedText__1 {...({"text":"BREAKING NEWS","style":"glitch","backgroundColor":"#0a0a1a","color":"#ffffff","fontSize":80,"fontFamily":"system-ui, sans-serif","position":"center"} as any)} /></Sequence>
      <Sequence from={90} durationInFrames={90}><Comparison__2 {...({"type":"flip","beforeLabel":"Old Way","afterLabel":"New Way","beforeColor":"#ef4444","afterColor":"#22c55e","style":"labeled"} as any)} /></Sequence>
    </AbsoluteFill>
  );
};
