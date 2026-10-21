import React from 'react';
import {C} from './tokens';

// arka plan simgesi: koyu oynat kutusu, arkasında mavi kare
export const LogoMark: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 64, style}) => {
  const s = size;
  return (
    <svg width={s * 1.14} height={s * 1.14} viewBox="0 0 114 114" style={style}>
      <rect x="34" y="0" width="80" height="80" rx="14" fill={C.blue} />
      <rect x="0" y="30" width="84" height="84" rx="16" fill={C.ink} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      <path d="M32 52 L32 92 L64 72 Z" fill={C.cream} />
    </svg>
  );
};
