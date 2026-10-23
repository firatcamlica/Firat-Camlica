import React, {useEffect, useMemo, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Easing,
  getInputProps,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Logo} from './Logo';
import {COLORS} from './tokens';

/**
 * Hook: videonun ilk 3 saniyesi. Kurallar (video-preprod SKILL.md, HOOK adımı):
 * - Metin 0. karede ekranda; fade yok, yalnızca 6 karelik ölçek girişi.
 * - Arka planda fotoğrafa Ken Burns yakınlaşması ya da sayan rakam (ilk kareden itibaren hareket).
 * - İlk 0,5 sn'de whoosh (public/sfx/hook_whoosh.wav, tools/hook_sfx.sh ile -18 LUFS).
 * - Metin güvenli alanda, en az 88 px, altyazı bloğunun üstünde ve 4:5 kapak kırpmasının içinde.
 * - Logo animasyonu ya da kanal girişi hook'tan önce gelmez; filigran 0. kareden görünür.
 */
export const HOOK_SECONDS = 3;
export const HOOK_POP_FRAMES = 6;
export const HOOK_SFX_SECONDS = 0.5;
export const HOOK_MIN_FONT = 88;
export const HOOK_MAX_WORDS = 10;
export const hookFrames = (fps: number) => Math.round(HOOK_SECONDS * fps);

/** 1080x1920 ölçüleri (px). Reels arayüzü, 4:5 kapak kırpması (ortadan 1350 px) ve altyazı bloğu. */
export const HOOK_LAYOUT = {
  width: 1080,
  height: 1920,
  ui: {top: 220, bottom: 380, left: 72, right: 140},
  crop45: {top: 285, bottom: 1635},
  /** Altyazı bloğunun üst kenarı; proje farklıysa `subtitleTop` ile verin. */
  subtitleTop: 1300,
  gap: 40,
};

export const hookTextZone = (subtitleTop = HOOK_LAYOUT.subtitleTop) => {
  const {ui, crop45, gap, width} = HOOK_LAYOUT;
  const top = Math.max(ui.top, crop45.top) + gap;
  const bottom = Math.min(subtitleTop, crop45.bottom) - gap;
  return {left: ui.left, right: width - ui.right, top, bottom, width: width - ui.right - ui.left, height: bottom - top};
};

const SANS = '"Bricolage Grotesque", "Bricolage Grotesque Variable", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const LINE = 1.02;
const TRACK = -0.025;
const easeOut = Easing.out(Easing.cubic);

/** Ekran metni kuralları: en fazla 10 kelime, ondalık yok (Türkçe: virgül ondalık, nokta binlik). */
export const checkHookText = (text: string) => {
  const errors: string[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length > HOOK_MAX_WORDS) errors.push(`${words.length} kelime; en fazla ${HOOK_MAX_WORDS}`);
  if (/\d,\d/.test(text) || /\d\.(\d{1,2}|\d{4,})(?!\d)/.test(text)) errors.push('ondalık sayı var; rakamı yuvarlayın');
  return errors;
};

export type HookBackground =
  | {kind: 'photo'; src: string; credit?: string; /** yakınlaşma merkezi, 0-1 */ focus?: [number, number]; zoom?: number}
  | {kind: 'counter'; value: number; prefix?: string; suffix?: string};

export type HookProps = {
  text: string;
  background: HookBackground;
  /** public/ altındaki whoosh; null yalnızca sessiz taslak içindir (kapı geçmez). */
  sfx?: string | null;
  subtitleTop?: number;
  /** Kompozisyonda 0. kareden görünen ortak filigran varsa false. */
  watermark?: boolean;
};

const formatTr = (n: number) => n.toLocaleString('tr-TR', {maximumFractionDigits: 0});

let canvas: HTMLCanvasElement | null = null;
const measure = (s: string, size: number) => {
  canvas ??= document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `800 ${size}px ${SANS}`;
  ctx.letterSpacing = `${size * TRACK}px`;
  return ctx.measureText(s).width;
};

/** Bölgeye sığan en büyük punto (140 → 88) ve satırlar; 88 px'te sığmazsa hata. */
const fitText = (text: string, maxW: number, maxH: number) => {
  const words = text.trim().split(/\s+/);
  for (let size = 140; size >= HOOK_MIN_FONT; size -= 2) {
    if (words.some((w) => measure(w, size) > maxW)) continue;
    const lines: string[] = [];
    for (const w of words) {
      const last = lines[lines.length - 1];
      if (last !== undefined && measure(`${last} ${w}`, size) <= maxW) lines[lines.length - 1] = `${last} ${w}`;
      else lines.push(w);
    }
    if (lines.length * size * LINE <= maxH) return {size, lines};
  }
  throw new Error(`Hook metni ${HOOK_MIN_FONT} px'te güvenli alana sığmıyor: "${text}"`);
};

const useFontsReady = (text: string) => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('hook-font'));
  useEffect(() => {
    document.fonts
      .load(`800 100px ${SANS}`, text)
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle, text]);
  return ready;
};

const KenBurns: React.FC<{bg: Extract<HookBackground, {kind: 'photo'}>; frames: number}> = ({bg, frames}) => {
  const f = useCurrentFrame();
  const [fx, fy] = bg.focus ?? [0.5, 0.45];
  const scale = interpolate(f, [0, frames], [1.04, 1.04 + (bg.zoom ?? 0.12)], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(bg.src)}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,14,40,0.55) 0%, rgba(10,14,40,0.35) 45%, rgba(10,14,40,0.8) 100%)'}} />
    </AbsoluteFill>
  );
};

type Box = {left: number; top: number; width: number; height: number};

/** Sayan rakam metnin altındaki boşluğu doldurur (metnin arkasına binmez); 0'dan 1,8 sn'de hedefe sayar. */
const Counter: React.FC<{bg: Extract<HookBackground, {kind: 'counter'}>; box: Box}> = ({bg, box}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!Number.isInteger(bg.value)) throw new Error(`Sayan rakam tam sayı olmalı: ${bg.value}`);
  const v = Math.round(interpolate(f, [0, Math.round(1.8 * fps)], [0, bg.value], {extrapolateRight: 'clamp', easing: easeOut}));
  const label = `${bg.prefix ?? ''}${formatTr(bg.value)}${bg.suffix ?? ''}`;
  const size = Math.floor(Math.min(box.height / 1.05, box.width / (label.length * 0.6), 420));
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <div
        style={{
          position: 'absolute',
          left: box.left,
          top: box.top + box.height - size * 1.05,
          font: `800 ${size}px/1.05 ${SANS}`,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
          color: COLORS.blue,
        }}
      >
        {bg.prefix}
        {formatTr(v)}
        {bg.suffix}
      </div>
    </AbsoluteFill>
  );
};

export const Watermark: React.FC = () => (
  <div style={{position: 'absolute', left: HOOK_LAYOUT.ui.left, top: HOOK_LAYOUT.ui.top + 16, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.9}}>
    <Logo size={58} />
    <div style={{font: `800 34px/1 ${SANS}`, letterSpacing: '-0.02em', color: COLORS.cream}}>arka plan</div>
  </div>
);

/** Müzik kanalına eklenecek dB: whoosh süresince müzik 8 dB iner, 0,2 sn'de geri gelir. */
export const hookMusicDb = (t: number) => interpolate(t, [0, HOOK_SFX_SECONDS, HOOK_SFX_SECONDS + 0.2], [-8, -8, 0], {extrapolateRight: 'clamp'});

/** Kompozisyonda `<Sequence from={0} durationInFrames={hookFrames(fps)}>` içinde, her şeyden önce kullanılır. */
export const Hook: React.FC<HookProps> = ({text, background, sfx = 'sfx/hook_whoosh.wav', subtitleTop, watermark = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const qa = Boolean((getInputProps() as {hookQa?: boolean}).hookQa);
  const errors = checkHookText(text);
  if (errors.length) throw new Error(`Hook metni kurala uymuyor (${errors.join('; ')}): "${text}"`);

  const zone = hookTextZone(subtitleTop);
  const ready = useFontsReady(text);
  // Sayaçta metin bölgenin üst %55'inde kalır; alt kısım rakama ayrılır
  const textMaxH = background.kind === 'counter' ? Math.floor(zone.height * 0.55) : zone.height;
  const layout = useMemo(() => (ready ? fitText(text, zone.width, textMaxH) : null), [ready, text, zone.width, textMaxH]);
  const frames = hookFrames(fps);
  const sfxFrames = Math.round(HOOK_SFX_SECONDS * fps);
  const textH = layout ? layout.lines.length * layout.size * LINE : 0;
  const pop = interpolate(f, [0, HOOK_POP_FRAMES], [0.86, 1], {extrapolateRight: 'clamp', easing: easeOut});

  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      {qa ? null : background.kind === 'photo' ? (
        <KenBurns bg={background} frames={frames} />
      ) : layout ? (
        <Counter bg={background} box={{left: zone.left, top: zone.top + textH + 40, width: zone.width, height: zone.height - textH - 40}} />
      ) : null}
      {layout ? (
        <div
          style={{
            position: 'absolute',
            left: zone.left,
            top: zone.top,
            width: zone.width,
            height: zone.height,
            display: 'flex',
            alignItems: background.kind === 'counter' ? 'flex-start' : 'center',
          }}
        >
          <div
            style={{
              font: `800 ${layout.size}px/${LINE} ${SANS}`,
              letterSpacing: `${TRACK}em`,
              color: qa ? '#FF00FF' : COLORS.cream,
              textShadow: qa ? 'none' : '0 4px 28px rgba(0,0,0,0.55)',
              transform: `scale(${pop})`,
              transformOrigin: 'left center',
            }}
          >
            {layout.lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      ) : null}
      {!qa && background.kind === 'photo' && background.credit ? (
        <div style={{position: 'absolute', left: zone.left, top: zone.bottom + 8, font: `500 20px ${MONO}`, color: 'rgba(242,238,230,0.72)'}}>
          {background.credit}
        </div>
      ) : null}
      {watermark && !qa ? <Watermark /> : null}
      {sfx ? (
        <Sequence from={0} durationInFrames={sfxFrames} name="sfx:hook-whoosh">
          <Audio src={staticFile(sfx)} volume={(i) => interpolate(i, [0, sfxFrames - 3, sfxFrames], [1, 1, 0], {extrapolateRight: 'clamp'})} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
