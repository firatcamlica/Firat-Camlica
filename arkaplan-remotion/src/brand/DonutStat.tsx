// Halka grafik + yüzde + etiket. Karşılaştırmalı kullanımda iki halka aynı boyut ve aynı anda.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from './tokens';
import {DISPLAY, easeOut, useQa, useTheme} from './ui';

export const DonutStat: React.FC<{
  value: number;
  label: string;
  size?: number;
  startFrame?: number;
  durFrames?: number;
  color?: string;
  valueColor?: string;
}> = ({value, label, size = 340, startFrame = 0, durFrames = 27, color = COLORS.blue, valueColor}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const qa = useQa();
  const p = interpolate(frame, [startFrame, startFrame + durFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
  const stroke = size * 0.11;
  const r = size / 2 - stroke / 2 - 2;
  const c = 2 * Math.PI * r;
  const track = th.name === 'dark' ? 'rgba(242,238,230,0.14)' : 'rgba(22,22,22,0.1)';
  return (
    <div style={{width: size, display: 'flex', flexDirection: 'column', alignItems: 'center', visibility: qa ? 'hidden' : 'visible'}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${(c * value * p) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + size * 0.085} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={size * 0.25} letterSpacing="-0.03em" fill={valueColor ?? th.fg}>
          %{Math.round(value * p)}
        </text>
      </svg>
      {label ? <div style={{fontFamily: DISPLAY, fontWeight: 500, fontSize: 34, textAlign: 'center', color: th.fg, marginTop: 18}}>{label}</div> : null}
    </div>
  );
};
