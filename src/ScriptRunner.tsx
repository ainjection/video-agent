import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  BigHeadline,
  TextReveal,
  WordByWord,
  BlurIn,
  Glitch,
  SplitHeadline,
  TypewriterText,
  TypingCode,
  CountUp,
  GradientBG,
  ParticleField,
  SolidColor,
} from './blocks';

const BLOCK_MAP: Record<string, React.ComponentType<any>> = {
  BigHeadline,
  TextReveal,
  WordByWord,
  BlurIn,
  Glitch,
  SplitHeadline,
  TypewriterText,
  TypingCode,
  CountUp,
};

const BG_MAP: Record<string, React.ComponentType<any>> = {
  GradientBG,
  ParticleField,
  SolidColor,
};

export type ScriptScene = {
  text: string;
  audio: string;
  durationInFrames: number;
  // NEW: per-scene block + props so each sentence can use a different look.
  block?: string;
  blockProps?: Record<string, unknown>;
  // Optional per-scene background override.
  bg?: string;
  bgProps?: Record<string, unknown>;
};

export type ScriptRunnerProps = {
  scenes?: ScriptScene[];
  fontSize?: number;
  textColor?: string;
  bgColors?: string[];
  defaultBlock?: string;
};

export const ScriptRunner: React.FC<ScriptRunnerProps> = ({
  scenes = [],
  fontSize = 140,
  textColor = '#ffffff',
  bgColors = ['#0f172a', '#1e293b'],
  defaultBlock = 'BigHeadline',
}) => {
  let frameCursor = 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <GradientBG colors={bgColors} angle={135} animated={true} />
      {scenes.map((s, i) => {
        const from = frameCursor;
        frameCursor += s.durationInFrames;
        const Block = BLOCK_MAP[s.block || defaultBlock] || BigHeadline;
        const blockProps = { text: s.text, fontSize, color: textColor, ...(s.blockProps || {}) };
        const Bg = s.bg ? BG_MAP[s.bg] : null;
        return (
          <Sequence key={i} from={from} durationInFrames={s.durationInFrames}>
            {Bg ? <Bg {...(s.bgProps || {})} /> : null}
            <Block {...blockProps} />
            <Audio src={staticFile(s.audio)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
