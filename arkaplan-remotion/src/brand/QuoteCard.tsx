// Tipografik alıntı kartı: alıntı (en fazla 15 kelime), altında isim · unvan · tarih.
// Özetlenmiş alıntılarda köşede "özet" etiketi. Giriş: 8 karelik yumuşak yukarı kayma.
// İki tarafın kartları birebir aynı bileşen ve animasyonla kullanılmalıdır.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, MIN} from './tokens';
import {DISPLAY, MONO, easeOut, useTheme} from './ui';

export const CARD_ENTER_FRAMES = 8;
export const CARD_EXIT_FRAMES = 6;
export const QUOTE_MAX_WORDS = 15;

export const quoteWordCount = (text: string) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/** Kart giriş/çıkış: 8 kare yukarı kayma + opaklık; `until` verilirse 6 karede söner */
export const useCardMotion = (startFrame: number, until?: number) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [startFrame, startFrame + CARD_ENTER_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  const exit =
    until === undefined
      ? 1
      : interpolate(frame, [until - CARD_EXIT_FRAMES, until], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {opacity: enter * exit, transform: `translateY(${(1 - enter) * 48}px)`, visible: frame >= startFrame && (until === undefined || frame < until)};
};

/** Yalnızca alıntı satırı (tırnak + metin). SplitCard sütunu içinde, isim sütun başlığında olduğunda kullanılır. */
export const QuoteLine: React.FC<{text: string; size: number}> = ({text, size}) => {
  if (size < MIN.body) throw new Error(`Alıntı ${size}px; en az ${MIN.body}px`);
  return (
    <div style={{display: 'flex', gap: 10}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 2, lineHeight: 0.8, color: COLORS.blue, marginTop: 2}}>“</div>
      <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.015em', color: COLORS.black}}>{text}</div>
    </div>
  );
};

export const QuoteCard: React.FC<{
  text: string;
  name: string;
  title: string;
  date: string;
  summary?: boolean;
  kicker?: string;
  startFrame?: number;
  until?: number;
  size?: 'large' | 'small';
  width: number;
  style?: React.CSSProperties;
}> = ({text, name, title, date, kicker, startFrame = 0, until, size = 'large', width, style}) => {
  const th = useTheme();
  const m = useCardMotion(startFrame, until);
  if (!m.visible) return null;
  const big = size === 'large';
  return (
    <div
      style={{
        width,
        boxSizing: 'border-box',
        background: th.name === 'dark' ? COLORS.cream : COLORS.white,
        borderRadius: 22,
        padding: big ? '34px 38px 34px' : '24px 30px 26px',
        opacity: m.opacity,
        transform: m.transform,
        ...style,
      }}
    >
      <div style={{fontFamily: MONO, fontWeight: 500, fontSize: big ? 28 : 24, letterSpacing: 3, color: 'rgba(22,22,22,0.55)', minHeight: 34}}>{kicker ?? ''}</div>
      <div style={{marginTop: big ? 10 : 6}}>
        <QuoteLine text={text} size={big ? 54 : 42} />
      </div>
      <div style={{height: 2, background: 'rgba(22,22,22,0.12)', margin: big ? '26px 0 18px' : '18px 0 12px'}} />
      <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: big ? 38 : 34, lineHeight: 1.1, color: COLORS.black}}>{name}</div>
      <div style={{fontFamily: MONO, fontWeight: 500, fontSize: big ? 26 : 24, color: 'rgba(22,22,22,0.65)', marginTop: 8}}>
        {title} · {date}
      </div>
    </div>
  );
};
