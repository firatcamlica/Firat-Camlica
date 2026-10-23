// "İki taraf" denge kartı: iki eşit sütun, aynı genişlik, aynı punto, aynı animasyon.
// Sıra kronolojiktir: önce karar veren / önce konuşan taraf solda.
// Başlıktaki ince üst çizgi tarafın rengini taşır (ülke rengi ya da nötr gri).
// Satırlar iki sütunda ortak ızgarada: alıntılar ve açıklamalar aynı hizadan başlar.
import React from 'react';
import {COLORS} from './tokens';
import {DISPLAY, MONO, keepHyphens} from './ui';
import {QuoteLine, useCardMotion} from './QuoteCard';

export type SplitSide = {title: string; text: string; who: string; lineColor: string; quote?: string};

/** Siyasi taraflar için: parti rengi yerine iki tarafta aynı nötr çizgi */
export const NEUTRAL_LINE = 'rgba(22,22,22,0.35)';

const SIZES = {
  xl: {pad: 32, title: 50, quote: 46, text: 48, who: 26, line: 10, gap: 24, radius: 24, textLh: 1.12},
  large: {pad: 28, title: 40, quote: 40, text: 40, who: 26, line: 8, gap: 24, radius: 22, textLh: 1.14},
  small: {pad: 22, title: 36, quote: 38, text: 36, who: 22, line: 6, gap: 18, radius: 18, textLh: 1.18},
};

export const SplitCard: React.FC<{
  left: SplitSide;
  right: SplitSide;
  size?: 'xl' | 'large' | 'small';
  width: number;
  startFrame?: number;
  until?: number;
  footer?: React.ReactNode;
  columnBg?: string;
  style?: React.CSSProperties;
}> = ({left, right, size = 'large', width, startFrame = 0, until, footer, columnBg = COLORS.white, style}) => {
  const m = useCardMotion(startFrame, until);
  if (!m.visible) return null;
  const s = SIZES[size];
  const hasQuote = Boolean(left.quote || right.quote);
  const rows = hasQuote ? ['line', 'title', 'quote', 'text', 'who'] : ['line', 'title', 'text', 'who'];
  const cell = (col: 1 | 2, row: string, side: SplitSide): React.ReactNode => {
    const r = rows.indexOf(row) + 1;
    const base: React.CSSProperties = {gridColumn: col, gridRow: r, background: columnBg, paddingLeft: s.pad, paddingRight: s.pad};
    if (row === 'line')
      return <div key={row + col} style={{gridColumn: col, gridRow: r, height: s.line, background: side.lineColor, borderRadius: `${s.radius}px ${s.radius}px 0 0`}} />;
    if (row === 'title')
      return (
        <div key={row + col} style={{...base, paddingTop: s.pad - 4, fontFamily: DISPLAY, fontWeight: 800, fontSize: s.title, lineHeight: 1.05, letterSpacing: '-0.015em', color: COLORS.black}}>
          {side.title}
        </div>
      );
    if (row === 'quote')
      return (
        <div key={row + col} style={{...base, paddingTop: 18}}>
          {side.quote ? <QuoteLine text={side.quote} size={s.quote} /> : null}
        </div>
      );
    if (row === 'text')
      return (
        <div key={row + col} style={{...base, paddingTop: 18, fontFamily: DISPLAY, fontWeight: 500, fontSize: s.text, lineHeight: s.textLh, color: COLORS.black}}>
          {keepHyphens(side.text)}
        </div>
      );
    return (
      <div
        key={row + col}
        style={{...base, paddingTop: 18, paddingBottom: s.pad, fontFamily: MONO, fontWeight: 500, fontSize: s.who, lineHeight: 1.3, color: 'rgba(22,22,22,0.62)', borderRadius: `0 0 ${s.radius}px ${s.radius}px`}}
      >
        {side.who}
      </div>
    );
  };
  return (
    <div style={{width, opacity: m.opacity, transform: m.transform, ...style}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: s.gap}}>
        {rows.map((row) => [cell(1, row, left), cell(2, row, right)])}
      </div>
      {footer}
    </div>
  );
};
