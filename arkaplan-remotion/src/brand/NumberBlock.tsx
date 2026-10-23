// Büyük sayı bloğu: mavi kare içinde krem rakam. Hook sayacı ve video içindeki geri dönüşler (ör. "6") aynı stilde.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from './tokens';

const fmt = (n: number) => n.toLocaleString('tr-TR', {maximumFractionDigits: 0});

/** 0'dan `value`'ya sayar, `stopFrame`'de durur (yerel kare). `startFrame` öncesinde 0 gösterir. */
export const useCount = (value: number, stopFrame: number, startFrame = 0) => {
  const f = useCurrentFrame();
  return Math.round(
    interpolate(f, [startFrame, Math.max(startFrame + 1, stopFrame)], [0, value], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }),
  );
};

export const NumberBlock: React.FC<{
  value: number;
  stopFrame: number;
  startFrame?: number;
  size: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({value, stopFrame, startFrame = 0, size, suffix = '', style}) => {
  const v = useCount(value, stopFrame, startFrame);
  const f = useCurrentFrame();
  // durduğu karede küçük bir "oturma" vuruşu
  const settle = interpolate(f, [stopFrame, stopFrame + 3, stopFrame + 8], [1, 1.06, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const digits = String(value).length + suffix.length;
  return (
    <div
      style={{
        background: COLORS.blue,
        borderRadius: size * 0.09,
        minWidth: size,
        height: size,
        padding: `0 ${size * 0.12}px`,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${settle})`,
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: digits > 2 ? size * 0.62 : size * 0.86,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
          color: COLORS.cream,
          marginTop: -size * 0.04,
        }}
      >
        {fmt(v)}
        {suffix}
      </span>
    </div>
  );
};
