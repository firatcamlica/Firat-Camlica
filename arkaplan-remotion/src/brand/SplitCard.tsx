import React from 'react';
import {useEnter} from './anim';
import {QuoteCard} from './QuoteCard';
import {Body, Meta} from './Text';
import {C, FONT} from './tokens';

export type SplitSide = {title: string; quote: string; note: string; source: string};

// İki eşit sütun. Tarafsızlık için simetri kod düzeyinde sabit: aynı genişlik, aynı font boyutu,
// aynı üst çizgi rengi, aynı anda başlayan ve aynı süren animasyon. Sütun başına renk parametresi yok.
export const SplitCard: React.FC<{
  left: SplitSide;
  right: SplitSide;
  quoteSize?: number;
  noteSize?: number;
  delay?: number;
  duration?: number;
}> = ({left, right, quoteSize = 40, noteSize = 36, delay = 6, duration = 18}) => {
  const enter = useEnter(delay, duration);
  // Tek ızgara, iki sütun, ortak satırlar: alıntı kartları ve açıklamalar iki tarafta aynı yükseklikte başlar.
  const cells = (s: SplitSide, col: number) => [
    <div key={`h${col}`} style={{gridColumn: col, gridRow: 1, ...enter.style}}>
      <div style={{borderTop: `3px solid ${C.ink}`, opacity: 0.85}} />
      <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: '0.02em', color: C.ink, padding: '16px 0 18px'}}>
        {s.title}
      </div>
    </div>,
    <div key={`q${col}`} style={{gridColumn: col, gridRow: 2, display: 'flex', flexDirection: 'column', ...enter.style}}>
      <QuoteCard quote={s.quote} size={quoteSize} />
    </div>,
    <Body key={`n${col}`} size={noteSize} style={{gridColumn: col, gridRow: 3, marginTop: 20, lineHeight: 1.22, ...enter.style}}>
      {s.note}
    </Body>,
    <Meta key={`s${col}`} size={20} style={{gridColumn: col, gridRow: 4, marginTop: 18, ...enter.style}}>
      {s.source}
    </Meta>,
  ];
  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32, alignItems: 'stretch'}}>
      {cells(left, 1)}
      {cells(right, 2)}
    </div>
  );
};
