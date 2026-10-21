import React from 'react';
import {C, FONT, MIN_BODY} from './tokens';

export const QuoteCard: React.FC<{quote: string; size?: number; tone?: 'paper' | 'dark'}> = ({
  quote,
  size = 40,
  tone = 'paper',
}) => {
  if (size < MIN_BODY) throw new Error(`Alıntı ${size}px; en az ${MIN_BODY}px olmalı`);
  return (
    <div
      style={{
        background: tone === 'paper' ? C.paper : '#222',
        borderRadius: 18,
        padding: '22px 26px 26px',
        boxShadow: '0 2px 0 rgba(22,22,22,0.06)',
        flex: 1,
      }}
    >
      <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 64, lineHeight: 0.6, height: 34, color: C.gray}}>“</div>
      <div
        style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.16,
          letterSpacing: '-0.01em',
          color: tone === 'paper' ? C.ink : C.cream,
        }}
      >
        {quote}
      </div>
    </div>
  );
};
