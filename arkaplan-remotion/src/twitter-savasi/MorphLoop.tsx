import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {useBrandFonts} from '../brand';
import {Morph, morphTimes} from './morph';
import {WAR_BG} from './parts';

/** Tek başına döngü: 120 BPM ızgara, son kare = ilk kare. 60 fps, 6 alt kareli hareket bulanıklığı. */
export const LOOP_BPM = 120;
export const LOOP_OFFSET = 0.5;
export const loopSeconds = () => {
  const {at, B} = morphTimes(LOOP_BPM, LOOP_OFFSET);
  return at[at.length - 1] + 1.5 * B;
};

export const MorphLoop: React.FC = () => {
  useBrandFonts();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: WAR_BG,
        backgroundImage: 'linear-gradient(rgba(242,238,230,0.05) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(242,238,230,0.05) 1.5px, transparent 1.5px)',
        backgroundSize: '60px 60px',
        backgroundPosition: 'center',
      }}
    >
      <CameraMotionBlur samples={6} shutterAngle={180}>
        <AbsoluteFill>
          <Morph bpm={LOOP_BPM} offset={LOOP_OFFSET} fitW={width * 0.8} fitH={height * (width > height ? 0.72 : 0.62)} cx={width / 2} cy={height / 2} maxScale={(Math.min(width, height) / 1080) * 2.4} />
        </AbsoluteFill>
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
