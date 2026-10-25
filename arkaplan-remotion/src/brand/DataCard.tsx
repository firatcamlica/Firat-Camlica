import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from './tokens';
import {DISPLAY, MONO, easeOut, useQa, useTheme} from './ui';

export type Bar = {label: string; value: number; display: string; color?: string};

/** Karşılaştırmalı yatay çubuklar (videodaki CompareBars: ilk çubuk gri, ikinci mavi) */
export const CompareBars: React.FC<{width: number; bars: Bar[]; startFrame?: number}> = ({width, bars, startFrame = 0}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const qa = useQa();
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div style={{width, display: 'flex', flexDirection: 'column', gap: 34}}>
      {bars.map((b, i) => {
        const p = interpolate(frame, [startFrame + i * 6, startFrame + i * 6 + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
        return (
          <div key={b.label}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14}}>
              <span style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 38, color: th.fg}}>{b.label}</span>
              <span style={{fontFamily: MONO, fontWeight: 500, fontSize: 40, color: th.fg}}>{b.display}</span>
            </div>
            <div style={{height: 34, background: 'rgba(22,22,22,0.08)', borderRadius: 4, visibility: qa ? 'hidden' : 'visible'}}>
              <div style={{height: '100%', width: `${(b.value / max) * 100 * p}%`, background: b.color ?? (i === 0 ? COLORS.gray : COLORS.blue), borderRadius: 4}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
