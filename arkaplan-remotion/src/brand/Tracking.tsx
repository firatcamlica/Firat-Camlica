// "Takip ekranı" teması: ızgaralı koyu zemin, sarı-siyah uyarı şeridi, durum damgası, dört adımlı ilerleme çubuğu,
// takip kartı ve bekleme gün sayacı. Hiçbir gerçek kargo firmasının, kurumun ya da belgenin arayüzünü taklit etmez:
// yalnızca kanalın paleti, fontları ve iki durum rengi (bekleme sarısı, engel kırmızısı) kullanılır.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, CONTENT, FONTS, REELS, STATUS} from './tokens';
import {keepHyphens} from './ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

export const TRACK_BG = '#10131F';
export const TRACK_CARD = '#181D2E';

/** İnce ızgaralı koyu zemin */
export const GridBackground: React.FC<{children?: React.ReactNode; step?: number}> = ({children, step = 60}) => (
  <AbsoluteFill
    style={{
      background: TRACK_BG,
      backgroundImage: `linear-gradient(rgba(242,238,230,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(242,238,230,0.045) 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Kenarlarda ince sarı-siyah uyarı şeridi (üst ve alt kenar; güvenli alanın dışında, süs) */
export const HazardStripes: React.FC<{height?: number; opacity?: number}> = ({height = 12, opacity = 0.9}) => {
  const bg = `repeating-linear-gradient(-45deg, ${STATUS.wait} 0 14px, ${COLORS.black} 14px 28px)`;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height, background: bg, opacity}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height, background: bg, opacity}} />
    </>
  );
};

/** Ekran üst etiketi (JetBrains Mono): "DURUM GÜNCELLEMESİ", "TAKİP: TR-F35" */
export const TrackKicker: React.FC<{children: React.ReactNode; top?: number; color?: string}> = ({children, top = 290, color = COLORS.dimDark}) => (
  <div style={{position: 'absolute', left: CONTENT.left, top, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 26, letterSpacing: 4, color, display: 'flex', alignItems: 'center', gap: 12}}>
    <span style={{width: 12, height: 12, borderRadius: 6, background: STATUS.wait, display: 'inline-block'}} />
    {children}
  </div>
);

export type StampTone = 'wait' | 'block';

/** Damga: kalın çerçeve, ±4° eğik, 6 karede "bas ve otur" (1,5 → 0,94 → 1). `at` yerel kare. */
export const Stamp: React.FC<{text: string; tone: StampTone; at: number; rotate?: number; size?: number; style?: React.CSSProperties}> = ({
  text,
  tone,
  at,
  rotate = -4,
  size = 56,
  style,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const color = tone === 'wait' ? STATUS.wait : STATUS.block;
  const scale = interpolate(f, [at, at + 3, at + 6], [1.5, 0.94, 1], clamp);
  const o = interpolate(f, [at, at + 2], [0, 1], clamp);
  return (
    <div
      style={{
        display: 'inline-block',
        border: `${Math.round(size * 0.11)}px solid ${color}`,
        borderRadius: size * 0.16,
        padding: `${size * 0.14}px ${size * 0.34}px ${size * 0.1}px`,
        color,
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity: o * 0.95,
        background: 'rgba(16,19,31,0.55)',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export type Step = {label: string; state: 'done' | 'fail' | 'unknown'};

/**
 * Dört adımlı ilerleme çubuğu. `at`ta dolmaya başlar: ilk iki adım hızla ✓, TESLİMAT'a doğru iki kez takılır ve
 * durur, sonra ✗. `upTo` = 2 ise yalnızca ilk iki adım (S2). `flashAt` verilirse TESLİMAT bir an yeşile döner gibi olur.
 * `still` = true: animasyonsuz son durum (takip kartı içinde).
 */
export const ProgressSteps: React.FC<{
  steps: Step[];
  width: number;
  at?: number;
  upTo?: 2 | 4;
  flashAt?: number;
  still?: boolean;
  compact?: boolean;
}> = ({steps, width, at = 0, upTo = 4, flashAt, still, compact}) => {
  const f = useCurrentFrame();
  const local = still ? 999 : f - at;
  // dolum (adım birimi): 0 → 1 (6 kare), 1 → 1 (2 karede ✓), takılma: 1 → 1,55 → 1,3 → 1,6 → 1,4 (dur)
  const fill =
    upTo === 2
      ? interpolate(local, [0, 8, 14], [0, 0.6, 1], clamp)
      : interpolate(local, [0, 8, 14, 22, 26, 34, 38], [0, 0.6, 1, 1.55, 1.3, 1.6, 1.4], clamp);
  const failShown = upTo === 4 && local >= 40;
  const flash = flashAt !== undefined ? interpolate(f, [flashAt, flashAt + 3, flashAt + 9, flashAt + 14], [0, 1, 1, 0], clamp) : 0;
  const dot = compact ? 34 : 50;
  const gap = (width - dot) / (steps.length - 1);
  const y = dot / 2;
  const segLen = gap;
  return (
    <div style={{position: 'relative', width, height: dot + (compact ? 52 : 64)}}>
      <div style={{position: 'absolute', left: dot / 2, top: y - 3, width: width - dot, height: 6, background: 'rgba(242,238,230,0.14)', borderRadius: 3}} />
      <div style={{position: 'absolute', left: dot / 2, top: y - 3, width: Math.max(0, fill * segLen), height: 6, background: COLORS.blue, borderRadius: 3}} />
      {steps.map((s, i) => {
        const reached = i === 0 ? local >= 0 : fill >= i - 0.001;
        let state: 'done' | 'fail' | 'unknown' | 'pending' = 'pending';
        if (i < 2 && reached) state = 'done';
        if (i === 2 && failShown) state = s.state;
        if (i === 3 && failShown) state = s.state;
        if (upTo === 2 && i >= 2) state = 'pending';
        const green = i === 2 && flash > 0;
        const bg =
          green ? `rgba(46,158,91,${0.35 + 0.65 * flash})` : state === 'done' ? COLORS.blue : state === 'fail' ? STATUS.block : state === 'unknown' ? 'rgba(242,238,230,0.18)' : TRACK_BG;
        const mark = green && flash > 0.5 ? '✓' : state === 'done' ? '✓' : state === 'fail' ? '✗' : state === 'unknown' ? '?' : '';
        return (
          <div key={s.label} style={{position: 'absolute', left: i * gap, top: 0, width: dot, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div
              style={{
                width: dot,
                height: dot,
                borderRadius: dot / 2,
                background: bg,
                border: `3px solid ${state === 'pending' && !green ? 'rgba(242,238,230,0.35)' : 'transparent'}`,
                boxSizing: 'border-box',
                color: COLORS.cream,
                fontFamily: FONTS.sans,
                fontWeight: 800,
                fontSize: dot * 0.56,
                lineHeight: `${dot - 6}px`,
                textAlign: 'center',
              }}
            >
              {mark}
            </div>
            <div
              style={{
                position: 'absolute',
                top: dot + 10,
                whiteSpace: 'nowrap',
                left: i === 0 ? 0 : i === steps.length - 1 ? undefined : '50%',
                right: i === steps.length - 1 ? 0 : undefined,
                transform: i === 0 || i === steps.length - 1 ? undefined : 'translateX(-50%)',
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: compact ? 16 : 20,
                letterSpacing: 1,
                color: state === 'fail' ? STATUS.block : COLORS.dimDark,
              }}
            >
              {compact ? s.label.split(' ').map((x, k) => <div key={k} style={{textAlign: i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center'}}>{x}</div>) : s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Takip kartı: paket adı, konum, son güncelleme, durum damgası, ilerleme çubuğu. Yan yana kullanımda aynı genişlik. */
export const TrackingCard: React.FC<{
  pkg: string;
  name: string;
  location: string;
  updated: string;
  status: {text: string; tone: StampTone};
  steps: Step[];
  note?: string;
  noteAt?: number;
  width: number;
  height: number;
  at?: number;
}> = ({pkg, name, location, updated, status, steps, note, noteAt = 0, width, height, at = 0}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 8], [0, 1], {...clamp, easing: ease});
  if (f < at) return null;
  const row = (k: string, v: string) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <span style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 18, letterSpacing: 2, color: COLORS.dimDark}}>{k}</span>
      <span style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 32, color: COLORS.cream}}>{v}</span>
    </div>
  );
  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        background: TRACK_CARD,
        border: '2px solid rgba(242,238,230,0.14)',
        borderRadius: 20,
        padding: '22px 22px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: STATUS.wait}}>{pkg}</div>
      <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 42, lineHeight: 1.05, color: COLORS.cream}}>{keepHyphens(name)}</div>
      {row('KONUM', location)}
      {row('SON GÜNCELLEME', updated)}
      <div style={{height: 70, display: 'flex', alignItems: 'center'}}>
        <Stamp text={status.text} tone={status.tone} at={at + 8} size={34} rotate={-3} />
      </div>
      <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 19, lineHeight: 1.35, color: COLORS.cream, minHeight: 52, opacity: note && f >= noteAt ? interpolate(f, [noteAt, noteAt + 6], [0, 1], clamp) : 0}}>
        {note ?? ''}
      </div>
      <div style={{marginTop: 'auto'}}>
        <ProgressSteps steps={steps} width={width - 44} still compact />
      </div>
    </div>
  );
};

/** Bekleme gün sayacı: sağ üst köşe, güvenli alan içinde. `frozen` iken yanıp sönen nokta durur. */
export const DayCounter: React.FC<{label: string; value: number; frozen?: boolean; tone?: 'dark' | 'light'; opacity?: number}> = ({
  label,
  value,
  frozen,
  tone = 'dark',
  opacity = 1,
}) => {
  const f = useCurrentFrame();
  const blink = frozen ? 1 : Math.floor(f / 15) % 2 === 0 ? 1 : 0.25;
  return (
    <div
      style={{
        position: 'absolute',
        right: REELS.safe.right,
        top: REELS.safe.top + 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: FONTS.mono,
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: 2,
        color: tone === 'dark' ? COLORS.cream : COLORS.black,
        background: tone === 'dark' ? 'rgba(16,19,31,0.8)' : 'rgba(242,238,230,0.9)',
        border: `2px solid ${STATUS.wait}`,
        borderRadius: 8,
        padding: '6px 12px',
        opacity,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{width: 10, height: 10, borderRadius: 5, background: frozen ? STATUS.block : STATUS.wait, opacity: blink}} />
      {label}: {value} GÜN
    </div>
  );
};

/** Gün farkı (UTC, takvim günü) */
export const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
