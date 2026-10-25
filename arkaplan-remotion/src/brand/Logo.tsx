import React from 'react';
import {COLORS} from './tokens';

// Logo: koyu oynat karesi, arkasında sağ üstte mavi kare
export const Logo: React.FC<{size: number; onDark?: boolean}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x="22" y="4" width="38" height="38" rx="7" fill={COLORS.blue} />
    <rect x="4" y="18" width="42" height="42" rx="8" fill="#3A3A3A" />
    <path d="M19 30 L19 48 L34 39 Z" fill={COLORS.white} />
  </svg>
);
