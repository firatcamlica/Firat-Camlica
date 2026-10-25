// Carousel kareleri için ortak yerleşimler — yalnızca src/brand bileşenleri ve tokenları
import React from 'react';
import {BRAND, COLORS, MIN} from '../../brand/tokens';
import {DISPLAY, Headline, Kicker, MONO, useTheme} from '../../brand/ui';
import {Logo} from '../../brand/Logo';
import {CBOX} from '../../brand/Carousel';

/** İçerik kutusu: dikeyde ortalanmış */
export const Stage: React.FC<{children: React.ReactNode; align?: 'center' | 'top' | 'bottom'}> = ({children, align = 'center'}) => (
  <div
    style={{
      position: 'absolute',
      left: CBOX.left,
      width: CBOX.width,
      top: CBOX.top,
      height: CBOX.bottom - CBOX.top,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: align === 'center' ? 'center' : align === 'top' ? 'flex-start' : 'flex-end',
    }}
  >
    {children}
  </div>
);

/** Gövde: en az 36 px */
export const BodyText: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
  children,
  color,
  size = 42,
  style,
}) => {
  if (size < MIN.body) throw new Error(`Gövde ${size}px; en az ${MIN.body}px`);
  const th = useTheme();
  return <div style={{fontFamily: DISPLAY, fontWeight: 500, fontSize: size, lineHeight: 1.2, color: color ?? th.fg, ...style}}>{children}</div>;
};

/** Kaynak satırı (JetBrains Mono, kart altında) */
export const Source: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const th = useTheme();
  return <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 26, lineHeight: 1.35, color: th.fgDim, marginTop: 26, ...style}}>{children}</div>;
};

/** Büyük sayı (bitmiş sayaç durumu) */
export const BigNumber: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color, size = 260}) => {
  const th = useTheme();
  return <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 0.92, letterSpacing: '-0.03em', color: color ?? th.fg}}>{children}</div>;
};

/** Kelime vurgulu başlık: vurgu kelime renkli ya da mavi kutuda. Kutu ile sonraki kelime arasında normal boşluk. */
export const AccentHeadline: React.FC<{text: string; accent: string; mode: 'color' | 'box'; color?: string; size?: number}> = ({
  text,
  accent,
  mode,
  color,
  size = 112,
}) => {
  const words = text.toLocaleLowerCase('tr-TR').split(' ');
  const a = accent.toLocaleLowerCase('tr-TR').replace(/[.,]/g, '');
  return (
    <Headline size={size} color={color} style={{lineHeight: 1.0}}>
      {words.map((w, i) => {
        const hit = w.replace(/[.,]/g, '') === a;
        const style: React.CSSProperties | undefined = !hit
          ? undefined
          : mode === 'color'
            ? {color: COLORS.red}
            : {background: COLORS.blue, color: COLORS.cream, borderRadius: 14, padding: '0 14px 6px', display: 'inline-block'};
        return (
          <React.Fragment key={i}>
            <span style={style}>{w}</span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </Headline>
  );
};

/** Son kare: kaynak listesi + tek satır foto kredisi + "Videonun tamamı profilde" */
export const EndSlide: React.FC<{headline: string; sources: string[]; photoLine: string; cta: string}> = ({headline, sources, photoLine, cta}) => {
  const th = useTheme();
  return (
    <Stage align="top">
      <Headline size={84}>{headline}</Headline>
      <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12}}>
        {sources.map((s) => (
          <div key={s} style={{fontFamily: DISPLAY, fontWeight: 500, fontSize: 40, lineHeight: 1.15, color: th.fg}}>
            · {s}
          </div>
        ))}
      </div>
      {photoLine ? <div style={{marginTop: 26, fontFamily: MONO, fontWeight: 500, fontSize: 22, whiteSpace: 'nowrap', color: th.fgDim}}>{photoLine}</div> : null}
      <div style={{flex: 1}} />
      <div style={{display: 'flex', alignItems: 'center', gap: 24, background: COLORS.blue, borderRadius: 24, padding: '28px 32px'}}>
        <Logo size={88} onDark />
        <div>
          <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, lineHeight: 1.0, letterSpacing: '-0.02em', color: COLORS.cream}}>
            {cta.toLocaleLowerCase('tr-TR')}
          </div>
          <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 30, color: COLORS.cream, marginTop: 8}}>{BRAND.handle}</div>
        </div>
      </div>
    </Stage>
  );
};

export {Kicker};
