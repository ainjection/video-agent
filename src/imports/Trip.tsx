import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { ParticleField, BigHeadline, TypewriterText, SpinningText, CallToAction } from '../blocks';

export const Trip: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90} layout="none"><AbsoluteFill><ParticleField {...({"color":"#00e676","background":"#050507"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={0} durationInFrames={60} layout="none"><AbsoluteFill><BigHeadline {...({"text":"Global Journey","slideFrom":"top","fontSize":100,"color":"#ffffff"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={60} durationInFrames={30} layout="none"><AbsoluteFill><TypewriterText {...({"text":"Los Angeles","charsPerSecond":10,"fontSize":70,"color":"#ffffff"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={90} durationInFrames={60} layout="none"><AbsoluteFill><ParticleField {...({"color":"#00e676","background":"#050507"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={90} durationInFrames={60} layout="none"><AbsoluteFill><SpinningText {...({"text":"Connecting Coasts","rotationsPerSecond":0.2,"fontSize":90,"color":"#ffffff"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={150} durationInFrames={60} layout="none"><AbsoluteFill><ParticleField {...({"color":"#00e676","background":"#050507"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={150} durationInFrames={30} layout="none"><AbsoluteFill><BigHeadline {...({"text":"New York","slideFrom":"left","fontSize":100,"color":"#ffffff"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={180} durationInFrames={30} layout="none"><AbsoluteFill><SpinningText {...({"text":"Across the Atlantic","rotationsPerSecond":0.2,"fontSize":80,"color":"#ffffff"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={210} durationInFrames={60} layout="none"><AbsoluteFill><ParticleField {...({"color":"#00e676","background":"#050507"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={210} durationInFrames={30} layout="none"><AbsoluteFill><BigHeadline {...({"text":"Paris","slideFrom":"right","fontSize":100,"color":"#ffffff"} as any)} /></AbsoluteFill></Sequence>
      <Sequence from={240} durationInFrames={30} layout="none"><AbsoluteFill><CallToAction {...({"text":"Explore More","subtext":"Your next destination awaits!","buttonText":"Plan Trip","accentColor":"#00e676","textColor":"#ffffff","bgColor":"#0a0a0a"} as any)} /></AbsoluteFill></Sequence>
    </AbsoluteFill>
  );
};
