// Altyazı: büyük, en fazla iki satır, alt güvenli alanın hemen üstünde. Metin data dosyasındaki senaryodan gelir
// (okunuş yazımları ekrana geçmez); zamanlar f35.audio.json'daki kelime zamanlarıdır. O an söylenen kelime krem,
// henüz söylenmeyenler soluk.
import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, CONTENT, FONTS, LAYOUT} from './tokens';

export type CaptionChunk = {start: number; end: number; text: string; words: [string, number, number][]};

export const CAPTION_FONT = 58;
export const CAPTION_LINE = 1.12;
const PAD_X = 26;
const PAD_Y = 16;

let canvas: HTMLCanvasElement | null = null;
const measure = (s: string, size: number) => {
  canvas ??= document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `800 ${size}px ${FONTS.sans}`;
  return ctx.measureText(s).width;
};

/** Kelimeleri satırlara böler; iki satıra sığmazsa puntoyu küçültür (en az 46 px). */
export const layoutCaption = (words: string[], maxW: number) => {
  for (let size = CAPTION_FONT; size >= 46; size -= 2) {
    const lines: string[][] = [];
    for (const w of words) {
      const last = lines[lines.length - 1];
      if (last && measure([...last, w].join(' '), size) <= maxW) last.push(w);
      else lines.push([w]);
    }
    if (lines.length <= 2) {
      // iki satırı dengele: ikinci satır çok kısaysa bir kelime aşağı al
      if (lines.length === 2 && lines[1].length === 1 && lines[0].length > 2) {
        const moved = lines[0].pop()!;
        lines[1].unshift(moved);
        if (measure(lines[1].join(' '), size) > maxW) lines[1].shift(), lines[0].push(moved);
      }
      return {size, lines};
    }
  }
  throw new Error(`Altyazı iki satıra sığmıyor: "${words.join(' ')}"`);
};

export const Captions: React.FC<{chunks: CaptionChunk[]; hideAfter?: number}> = ({chunks, hideAfter}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunk = chunks.find((c) => t >= c.start && t < c.end);
  const maxW = CONTENT.width - PAD_X * 2;
  const layout = useMemo(() => (chunk ? layoutCaption(chunk.words.map((w) => w[0]), maxW) : null), [chunk, maxW]);
  if (!chunk || !layout || (hideAfter !== undefined && t >= hideAfter)) return null;
  let k = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: CONTENT.left,
        width: CONTENT.width,
        bottom: 1920 - LAYOUT.captionBottom,
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <div
        style={{
          background: 'rgba(22,22,22,0.9)',
          borderRadius: 14,
          padding: `${PAD_Y}px ${PAD_X}px`,
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: layout.size,
          lineHeight: CAPTION_LINE,
          letterSpacing: '-0.01em',
        }}
      >
        {layout.lines.map((line, i) => (
          <div key={i}>
            {line.map((w, j) => {
              const [, ws] = chunk.words[k++];
              return (
                <span key={j} style={{color: t >= ws ? COLORS.cream : 'rgba(242,238,230,0.55)'}}>
                  {w}
                  {j < line.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Sahnenin kaynak satırı: altta küçük mono, "KAYNAK: …" */
export const SourceLine: React.FC<{text?: string; tone?: 'dark' | 'light'; opacity?: number}> = ({text, tone = 'dark', opacity = 1}) => {
  if (!text) return null;
  const clean = text.replace(/^\s*Kaynak:\s*/i, '').replace(/;\s*/g, ' · ');
  return (
    <div
      style={{
        position: 'absolute',
        left: CONTENT.left,
        width: CONTENT.width,
        bottom: LAYOUT.sourceBottom,
        fontFamily: FONTS.mono,
        fontWeight: 500,
        fontSize: 20,
        lineHeight: 1.3,
        letterSpacing: 1,
        color: tone === 'dark' ? COLORS.dimDark : COLORS.dimLight,
        opacity,
      }}
    >
      KAYNAK: {clean.toLocaleUpperCase('tr-TR')}
    </div>
  );
};
