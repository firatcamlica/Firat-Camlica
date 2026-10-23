// Marka duoton görsel katmanları: fotoğraf (parallax), stok video (B-roll) ve etiketler.
// Duoton: gölgeler siyah (#161616), orta tonlar mavi (#2348D6), ışıklar krem (#F2EEE6). Tek SVG filtresiyle
// fotoğraf ve videoya aynı işlem uygulanır.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS, LAYOUT, REELS} from './tokens';

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const table = (k: 0 | 1 | 2, dark: boolean) => {
  const stops = dark ? [hex('#0B0D18'), hex(COLORS.blue), hex(COLORS.cream)] : [hex(COLORS.black), hex(COLORS.blue), hex(COLORS.cream)];
  const mids = dark ? [0, 0.62, 1] : [0, 0.5, 1];
  // 0..1 arası 9 noktada doğrusal geçiş
  return Array.from({length: 9}, (_, i) => {
    const x = i / 8;
    const j = x <= mids[1] ? 0 : 1;
    const t = (x - mids[j]) / (mids[j + 1] - mids[j]);
    return (stops[j][k] + (stops[j + 1][k] - stops[j][k]) * t).toFixed(3);
  }).join(' ');
};

/** Kompozisyonda bir kez çizilir; `filter: url(#duotone-dark)` ile kullanılır */
export const DuotoneDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    {(['dark', 'light'] as const).map((m) => (
      <filter key={m} id={`duotone-${m}`} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={table(0, m === 'dark')} />
          <feFuncG type="table" tableValues={table(1, m === 'dark')} />
          <feFuncB type="table" tableValues={table(2, m === 'dark')} />
        </feComponentTransfer>
      </filter>
    ))}
  </svg>
);

/**
 * Parallax fotoğraf: 3 sn'de %6 itiş; `fg` (Depth Anything ön plan maskesi, şeffaf PNG) varsa ön plan
 * arka plandan `ratio` kat hızlı büyür. `intensity` < 1 ise (kenarda yırtılma) itiş azaltılır.
 */
export const ParallaxPhoto: React.FC<{
  src: string;
  fg?: string;
  push?: number;
  ratio?: number;
  intensity?: number;
  focus?: [number, number];
  dim?: number;
}> = ({src, fg, push = 0.06, ratio = 1.8, intensity = 1, focus = [0.5, 0.5], dim = 0.35}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = (f / (3 * fps)) * push * intensity;
  const origin = `${focus[0] * 100}% ${focus[1] * 100}%`;
  const style = (s: number): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${s})`,
    transformOrigin: origin,
    filter: 'url(#duotone-dark)',
  });
  return (
    <AbsoluteFill style={{background: COLORS.black, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={style(1.02 + p)} />
      {fg ? <Img src={staticFile(fg)} style={style(1.02 + p * ratio)} /> : null}
      <AbsoluteFill style={{background: `rgba(11,13,24,${dim})`}} />
    </AbsoluteFill>
  );
};

/** Stok klip: en fazla 2,5 sn, duoton, sessiz, veri kartının altında %35 opaklık, "Temsili görüntü" etiketi */
export const BrollClip: React.FC<{src: string; maxSeconds?: number; opacity?: number; label?: string}> = ({
  src,
  maxSeconds = 2.5,
  opacity = 0.35,
  label = 'Temsili görüntü',
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = Math.round(maxSeconds * fps);
  if (f >= end) return null;
  const o = interpolate(f, [0, 6, end - 8, end], [0, opacity, opacity, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: o}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'url(#duotone-dark)'}} />
      </AbsoluteFill>
      <MediaLabel text={label} opacity={Math.min(1, o / opacity)} />
    </AbsoluteFill>
  );
};

/** Sol alt köşe etiketi ("Temsili görüntü", "TEMSİLÎ ÇİZİM", "ÇİZİM"); altyazı bloğunun üstünde */
export const MediaLabel: React.FC<{text: string; opacity?: number; bottom?: number; tone?: 'dark' | 'light'}> = ({
  text,
  opacity = 1,
  bottom = LAYOUT.labelBottom,
  tone = 'dark',
}) => (
  <div
    style={{
      position: 'absolute',
      left: REELS.safe.left,
      bottom,
      fontFamily: FONTS.mono,
      fontWeight: 500,
      fontSize: 22,
      letterSpacing: 2,
      color: tone === 'dark' ? COLORS.dimDark : COLORS.dimLight,
      opacity,
      textTransform: 'uppercase',
    }}
  >
    {text}
  </div>
);
