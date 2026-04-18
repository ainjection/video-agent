import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { BigHeadline } from './blocks/BigHeadline';
import { GradientBG } from './blocks/GradientBG';

export type ScriptScene = {
  text: string;
  audio: string;
  durationInFrames: number;
};

export type ScriptRunnerProps = {
  scenes?: ScriptScene[];
  fontSize?: number;
  textColor?: string;
  bgColors?: string[];
};

export const ScriptRunner: React.FC<ScriptRunnerProps> = ({
  scenes = [],
  fontSize = 140,
  textColor = '#ffffff',
  bgColors = ['#0f172a', '#1e293b'],
}) => {
  let frameCursor = 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <GradientBG colors={bgColors} angle={135} animated={true} />
      {scenes.map((s, i) => {
        const from = frameCursor;
        frameCursor += s.durationInFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={s.durationInFrames}>
            <BigHeadline text={s.text} fontSize={fontSize} color={textColor} />
            <Audio src={staticFile(s.audio)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
