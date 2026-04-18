import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { HypeReelIntro as HypeReelIntro__1 } from "./Ownthescreen";
import { AnimatedText as AnimatedText__2 } from "../AnimatedText";
import { Comparison as Comparison__3 } from "../Comparison";

export const TimelinePreview: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={240}><HypeReelIntro__1 /></Sequence>
      <Sequence from={240} durationInFrames={90}><AnimatedText__2 {...({"text":"BREAKING NEWS","style":"glitch","backgroundColor":"#0a0a1a","color":"#ffffff","fontSize":80,"fontFamily":"system-ui, sans-serif","position":"center"} as any)} /></Sequence>
      <Sequence from={330} durationInFrames={90}><Comparison__3 {...({"type":"flip","beforeLabel":"Old Way","afterLabel":"New Way","beforeColor":"#ef4444","afterColor":"#22c55e","style":"labeled"} as any)} /></Sequence>
    </AbsoluteFill>
  );
};
