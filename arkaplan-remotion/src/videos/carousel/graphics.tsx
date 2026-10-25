// 11–12. karelerin çizimleri (düz vektör, logo yok)
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../../brand/tokens';
import {DISPLAY, MONO, easeOut, useQa} from '../../brand/ui';

const useProgress = (start: number, dur: number) =>
  interpolate(useCurrentFrame(), [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});

/** Buzdolabı silüeti + termometre: değer `from` → `to` °C, kırmızı */
export const FridgeThermo: React.FC<{from: number; to: number; height?: number}> = ({from, to, height = 300}) => {
  const qa = useQa();
  const p = useProgress(10, 40);
  const v = from + (to - from) * p;
  const top = 24;
  const bottom = 236;
  const fill = (bottom - top) * (v / 60);
  const ink = COLORS.cream;
  return (
    <svg width={height * (620 / 300)} height={height} viewBox="0 0 620 300" style={{visibility: qa ? 'hidden' : 'visible'}}>
      <rect x="6" y="6" width="170" height="288" rx="20" fill="none" stroke={ink} strokeWidth="6" />
      <line x1="6" y1="100" x2="176" y2="100" stroke={ink} strokeWidth="6" />
      <line x1="150" y1="38" x2="150" y2="74" stroke={ink} strokeWidth="8" strokeLinecap="round" />
      <line x1="150" y1="126" x2="150" y2="176" stroke={ink} strokeWidth="8" strokeLinecap="round" />
      {[150, 200, 250].map((y) => (
        <line key={y} x1="28" y1={y} x2="126" y2={y} stroke={ink} strokeWidth="3" opacity="0.35" />
      ))}
      <rect x="236" y={top - 16} width="40" height={bottom - top + 26} rx="20" fill="none" stroke={ink} strokeWidth="5" />
      <circle cx="256" cy={bottom + 28} r="30" fill={COLORS.red} stroke={ink} strokeWidth="5" />
      <rect x="246" y={bottom - fill} width="20" height={fill + 12} rx="9" fill={COLORS.red} />
      <text x="312" y={Math.max(96, bottom - fill + 30)} fontFamily={DISPLAY} fontWeight={800} fontSize="92" letterSpacing="-0.03em" fill={COLORS.red}>
        {Math.round(v)} °C
      </text>
      <text x="314" y={bottom + 40} fontFamily={MONO} fontWeight={500} fontSize="26" fill="rgba(242,238,230,0.7)">
        olması gereken: {from} °C
      </text>
    </svg>
  );
};

/** Sade giriş ekranı: kullanıcı adı ve şifre alanı */
export const LoginScreen: React.FC<{user: string; pass: string; width: number}> = ({user, pass, width}) => {
  const qa = useQa();
  const p = useProgress(8, 30);
  const typed = pass.slice(0, Math.round(pass.length * p));
  const field = (label: string, value: string, y: number) => (
    <g>
      <text x="40" y={y} fontFamily={MONO} fontWeight={500} fontSize="24" fill="rgba(22,22,22,0.55)">{label}</text>
      <rect x="40" y={y + 14} width="840" height="78" rx="12" fill={COLORS.white} stroke="rgba(22,22,22,0.25)" strokeWidth="3" />
      <text x="66" y={y + 67} fontFamily={MONO} fontWeight={700} fontSize="40" fill={COLORS.black}>{value}</text>
    </g>
  );
  return (
    <svg width={width} height={width * (340 / 920)} viewBox="0 0 920 340" style={{visibility: qa ? 'hidden' : 'visible'}}>
      <rect x="2" y="2" width="916" height="336" rx="22" fill="#FBF9F5" stroke={COLORS.black} strokeWidth="4" />
      <path d="M2 54 V24 a22 22 0 0 1 22 -22 H896 a22 22 0 0 1 22 22 V54 Z" fill={COLORS.black} />
      {[34, 64, 94].map((x) => (
        <circle key={x} cx={x} cy="28" r="8" fill={COLORS.cream} opacity="0.45" />
      ))}
      {field('kullanıcı adı', user, 96)}
      {field('şifre', typed, 214)}
    </svg>
  );
};
