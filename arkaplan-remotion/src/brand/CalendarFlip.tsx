// Koparmalı takvim: günler `from`dan `to`ya hızla döner, `stop` karesinde durur. Her yaprak 4 kare.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from './tokens';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const CalendarFlip: React.FC<{month: string; from: number; to: number; stop: number; perFlip?: number; width?: number; accent?: string}> = ({
  month,
  from,
  to,
  stop,
  perFlip = 4,
  width = 360,
  accent = COLORS.blue,
}) => {
  const f = useCurrentFrame();
  const steps = to - from;
  const start = stop - steps * perFlip;
  const k = Math.max(0, Math.min(steps, Math.floor((f - start) / perFlip) + 1));
  const day = f < start ? from : from + Math.min(steps, k);
  const inFlip = f >= start && f < stop;
  const phase = inFlip ? ((f - start) % perFlip) / perFlip : 1;
  const prev = day - 1;
  const h = width * 1.12;
  const settle = interpolate(f, [stop, stop + 3, stop + 7], [1, 1.05, 1], clamp);
  const page = (d: number, style?: React.CSSProperties) => (
    <div style={{position: 'absolute', inset: 0, background: COLORS.cream, borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', ...style}}>
      <div style={{height: h * 0.22, background: accent, color: COLORS.cream, fontFamily: FONTS.mono, fontWeight: 700, fontSize: width * 0.075, letterSpacing: 3, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {month}
      </div>
      <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: width * 0.56, lineHeight: `${h * 0.78}px`, textAlign: 'center', color: COLORS.black, letterSpacing: '-0.04em'}}>{d}</div>
    </div>
  );
  return (
    <div style={{position: 'relative', width, height: h, perspective: 900, transform: `scale(${settle})`}}>
      {page(day)}
      {inFlip && prev >= from ? page(prev, {transformOrigin: '50% 0%', transform: `rotateX(${phase * 110}deg)`, opacity: 1 - phase * 0.6}) : null}
    </div>
  );
};
