import React from 'react';
import {C, FONT, MIN_BODY, MIN_TITLE} from './tokens';

type Tone = 'light' | 'dark';
const ink = (tone: Tone) => (tone === 'light' ? C.cream : C.ink);
const muted = (tone: Tone) => (tone === 'light' ? 'rgba(241,237,229,0.72)' : C.gray);

const guard = (kind: string, size: number, min: number) => {
  if (size < min) throw new Error(`${kind} ${size}px; en az ${min}px olmalı`);
};

// Üst etiket: büyük harf data dosyasında yazılır, text-transform kullanılmaz (CRÉTEIL, İ/I doğru kalsın).
export const Label: React.FC<{children: React.ReactNode; tone?: Tone; style?: React.CSSProperties}> = ({
  children,
  tone = 'dark',
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.mono,
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: '0.12em',
      color: muted(tone),
      ...style,
    }}
  >
    {children}
  </div>
);

export const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
  tone?: Tone;
  color?: string;
  style?: React.CSSProperties;
}> = ({children, size = 76, tone = 'dark', color, style}) => {
  guard('Başlık', size, MIN_TITLE);
  return (
    <div
      style={{
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: '-0.02em',
        color: color ?? ink(tone),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Body: React.FC<{
  children: React.ReactNode;
  size?: number;
  tone?: Tone;
  muted?: boolean;
  weight?: number;
  style?: React.CSSProperties;
}> = ({children, size = MIN_BODY, tone = 'dark', muted: m = false, weight = 500, style}) => {
  guard('Gövde', size, MIN_BODY);
  return (
    <div
      style={{
        fontFamily: FONT.display,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.25,
        color: m ? muted(tone) : ink(tone),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Vurgu kutusu. Arkasından gelen ek/kelimeyle arasına çağıran taraf normal boşluk koyar.
export const Mark: React.FC<{children: React.ReactNode; bg?: string; color?: string}> = ({
  children,
  bg = C.blue,
  color = C.white,
}) => (
  <span
    style={{
      background: bg,
      color,
      padding: '0 0.14em 0.04em',
      borderRadius: '0.1em',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
    }}
  >
    {children}
  </span>
);

export const Meta: React.FC<{children: React.ReactNode; tone?: Tone; size?: number; style?: React.CSSProperties}> = ({
  children,
  tone = 'dark',
  size = 22,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.mono,
      fontWeight: 400,
      fontSize: size,
      lineHeight: 1.4,
      color: muted(tone),
      ...style,
    }}
  >
    {children}
  </div>
);

export const Source: React.FC<{children: string; tone?: Tone; style?: React.CSSProperties}> = ({
  children,
  tone,
  style,
}) => (
  <Meta tone={tone} style={style}>
    {children.startsWith('Kaynak') ? children : `Kaynak: ${children}`}
  </Meta>
);
