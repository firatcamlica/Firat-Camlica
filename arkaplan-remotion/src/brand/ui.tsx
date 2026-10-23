import React, {createContext, useContext} from 'react';
import {Easing} from 'remotion';
import {FONTS, MIN, THEMES, Theme} from './tokens';

export const DISPLAY = FONTS.sans;
export const MONO = FONTS.mono;
export const easeOut = Easing.out(Easing.cubic);

export const ThemeCtx = createContext<Theme>(THEMES.light);
export const useTheme = () => useContext(ThemeCtx);

/** QA: zemin, fotoğraf ve çizim gizlenir; yalnızca metin çizilir (3:4 kırpma taraması) */
export const QaCtx = createContext(false);
export const useQa = () => useContext(QaCtx);

export const formatTr = (n: number, digits = 0) =>
  n.toLocaleString('tr-TR', {minimumFractionDigits: digits, maximumFractionDigits: digits});

/** Üst etiket. Büyük harf veri dosyasında yazılır; burada dönüştürme yok (CRÉTEIL, İ/I doğru kalır). */
export const Kicker: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color, style}) => {
  const th = useTheme();
  return (
    <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 28, letterSpacing: 3, color: color ?? th.fgDim, ...style}}>{children}</div>
  );
};

/** Başlıklar marka kuralı gereği küçük harf (tr-TR); metin olmayan çocuklar olduğu gibi kalır */
export const Headline: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({
  children,
  size = 96,
  color,
  style,
}) => {
  if (size < MIN.title) throw new Error(`Başlık ${size}px; en az ${MIN.title}px`);
  const th = useTheme();
  return (
    <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.025em', color: color ?? th.fg, ...style}}>
      {typeof children === 'string' ? children.toLocaleLowerCase('tr-TR') : children}
    </div>
  );
};

/** Tireli terimler (F-35, S-400) satır sonunda bölünmesin: kelimeyi nowrap span'e alır */
export const keepHyphens = (text: string): React.ReactNode =>
  text.split(/(\S*\S-\S+)/g).map((part, i) => (/\S-\S/.test(part) ? <span key={i} style={{whiteSpace: 'nowrap'}}>{part}</span> : part));
