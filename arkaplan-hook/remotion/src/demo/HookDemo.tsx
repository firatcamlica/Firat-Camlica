// DEMO: Hook'un bir kompozisyonda nasıl sıralandığını gösterir. Metinler örnektir, veri değildir.
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Hook, HookProps, hookFrames, Watermark} from '../brand/Hook';
import {COLORS} from '../brand/tokens';
import './fonts';

export const HookDemo: React.FC<HookProps> = (props) => {
  const {fps, durationInFrames} = useVideoConfig();
  const h = hookFrames(fps);
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      {/* 1) Hook her zaman 0. karede başlar; logo/kanal girişi bundan önce gelmez */}
      <Sequence from={0} durationInFrames={h} name="hook">
        <Hook {...props} watermark={false} />
      </Sequence>
      {/* 2) Videonun geri kalanı (yer tutucu) */}
      <Sequence from={h} name="S1">
        <AbsoluteFill style={{background: COLORS.cream}} />
      </Sequence>
      {/* 3) Ortak filigran: 0. kareden sona kadar */}
      <Sequence from={0} durationInFrames={durationInFrames} name="filigran">
        <Watermark />
      </Sequence>
    </AbsoluteFill>
  );
};
