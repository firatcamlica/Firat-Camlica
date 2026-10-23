// Kilit ikonu ve kural kartı (yasa maddesi gibi değişmeyen koşullar için).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from './tokens';
import {useCardMotion} from './QuoteCard';
import {keepHyphens} from './ui';

/** `closed` 0 → 1: kilit dili iner (kilitlenme animasyonu) */
export const LockIcon: React.FC<{size: number; color?: string; bg?: string; closed?: number}> = ({size, color = COLORS.cream, bg, closed = 1}) => {
  const lift = (1 - closed) * 7;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {bg ? <circle cx={20} cy={20} r={20} fill={bg} /> : null}
      <path d={`M13 ${18 - lift} V${13 - lift} a7 7 0 0 1 14 0 V${18 - lift}`} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
      <rect x={10} y={17} width={20} height={15} rx={3} fill={color} />
      <circle cx={20} cy={23.5} r={2.2} fill={bg ?? COLORS.black} />
      <rect x={19} y={24} width={2} height={4} rx={1} fill={bg ?? COLORS.black} />
    </svg>
  );
};

export const RuleCard: React.FC<{kicker: string; text: string; footer?: string; width: number; startFrame?: number}> = ({
  kicker,
  text,
  footer,
  width,
  startFrame = 0,
}) => {
  const m = useCardMotion(startFrame);
  const f = useCurrentFrame();
  const closed = interpolate(f, [startFrame + 4, startFrame + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (!m.visible) return null;
  return (
    <div style={{width, opacity: m.opacity, transform: m.transform}}>
      <div style={{background: COLORS.black, borderRadius: 22, padding: '30px 34px 32px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <LockIcon size={64} closed={closed} bg={COLORS.blue} color={COLORS.cream} />
          <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: COLORS.dimDark}}>{kicker}</div>
        </div>
        <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 50, lineHeight: 1.1, letterSpacing: '-0.015em', color: COLORS.cream, marginTop: 22}}>
          {keepHyphens(text)}
        </div>
      </div>
      {footer ? (
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 26, lineHeight: 1.35, color: COLORS.dimLight, marginTop: 20}}>{footer}</div>
      ) : null}
    </div>
  );
};

/** Anahtar ikonu (S8: iki taraf, eşit boyut) */
export const KeyIcon: React.FC<{size: number; color?: string}> = ({size, color = COLORS.cream}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={18} cy={32} r={12} fill="none" stroke={color} strokeWidth={5} />
    <circle cx={18} cy={32} r={4} fill={color} />
    <path d="M30 32 H58 M50 32 V42 M42 32 V39" stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />
  </svg>
);
