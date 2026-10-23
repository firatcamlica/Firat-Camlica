// DEMO KOPYASI: Mac projesine kopyalamayın; oradaki src/brand/Logo.tsx kullanılır.
import React from 'react';
import {COLORS} from './tokens';

/** Kanal logosu: arkada mavi, önde siyah kare ve oynat üçgeni (site/assets/logo.svg ile aynı geometri). */
export const Logo: React.FC<{size: number; merge?: number; stroke?: string}> = ({size, merge = 1, stroke}) => {
  const off = 20 * merge;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <rect x={8 + off} y={28 - off} width={64} height={64} rx={11.52} fill={COLORS.blue} />
      <rect x={8} y={28} width={64} height={64} rx={11.52} fill={COLORS.black} stroke={stroke} strokeWidth={stroke ? 1.6 : 0} />
      <path d="M31,47 L31,73 L54,60 Z" fill={COLORS.cream} stroke={COLORS.cream} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
};
