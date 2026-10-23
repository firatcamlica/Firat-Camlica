// Dikey zaman çizelgesi: tarih (mono) + olay (başlık). Olaylar sırayla açılır, eksen aşağı doğru uzar.
// İsteğe bağlı parantez iki olay arasındaki süreyi vurgular (ör. "5 GÜN").
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from './tokens';
import {keepHyphens} from './ui';

export type TimelineEvent = {date: string; text: string};
export type TimelineBracket = {from: number; to: number; label: string; frame: number};

const ease = Easing.out(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Timeline: React.FC<{
  events: TimelineEvent[];
  /** Her olayın açıldığı yerel kare */
  reveal: number[];
  bracket?: TimelineBracket;
  width: number;
  /** Olayların üst kenarı (px, bileşen içinde); parantezli aralık daha geniş tutulur */
  rows?: number[];
  tone?: 'dark' | 'light';
}> = ({events, reveal, bracket, width, rows = [0, 230, 520], tone = 'dark'}) => {
  const f = useCurrentFrame();
  const fg = tone === 'dark' ? COLORS.cream : COLORS.black;
  const dim = tone === 'dark' ? COLORS.dimDark : COLORS.dimLight;
  const axisX = 22;
  const dotY = (i: number) => rows[i] + 22;
  const height = rows[rows.length - 1] + 170;
  const lastShown = reveal.reduce((acc, r, i) => (f >= r ? i : acc), -1);
  const axisTo = lastShown < 0 ? 0 : interpolate(f, [reveal[lastShown], reveal[lastShown] + 10], [lastShown ? dotY(lastShown - 1) : 0, dotY(lastShown)], {...clamp, easing: ease});
  const b = bracket ? interpolate(f, [bracket.frame, bracket.frame + 8], [0, 1], {...clamp, easing: ease}) : 0;
  const pop = bracket ? interpolate(f, [bracket.frame, bracket.frame + 4, bracket.frame + 9], [0.6, 1.12, 1], clamp) : 1;
  return (
    <div style={{position: 'relative', width, height}}>
      <div style={{position: 'absolute', left: axisX - 2, top: 22, width: 4, height: Math.max(0, axisTo - 22), background: tone === 'dark' ? COLORS.lineDark.replace('0.12', '0.4') : COLORS.lineLight}} />
      {events.map((e, i) => {
        const p = interpolate(f, [reveal[i], reveal[i] + 9], [0, 1], {...clamp, easing: ease});
        if (f < reveal[i]) return null;
        const last = i === events.length - 1;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: rows[i], width, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
            <div style={{position: 'absolute', left: axisX - 13, top: 9, width: 26, height: 26, borderRadius: 13, background: last ? COLORS.blue : fg, border: `4px solid ${tone === 'dark' ? COLORS.black : COLORS.cream}`, boxSizing: 'border-box'}} />
            <div style={{marginLeft: 70}}>
              <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 32, letterSpacing: 2, color: dim, textTransform: 'uppercase'}}>{e.date}</div>
              <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 54, lineHeight: 1.06, letterSpacing: '-0.02em', color: fg, marginTop: 8, maxWidth: width - 70 - 120}}>
                {keepHyphens(e.text)}
              </div>
            </div>
          </div>
        );
      })}
      {bracket && f >= bracket.frame ? (
        <>
          <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {(() => {
              const x = width - 18;
              const y0 = dotY(bracket.from);
              const y1 = dotY(bracket.to);
              const mid = (y0 + y1) / 2;
              const len = (y1 - y0) * b;
              return (
                <g stroke={COLORS.blue} strokeWidth={8} fill="none" strokeLinecap="round">
                  <path d={`M${x - 36} ${y0} H${x} V${y0 + len}`} />
                  {b > 0.98 ? <path d={`M${x} ${y1} H${x - 36}`} /> : null}
                  <path d={`M${x} ${mid} H${x + 14}`} opacity={b} />
                </g>
              );
            })()}
          </svg>
          <div
            style={{
              position: 'absolute',
              right: 64,
              top: (dotY(bracket.from) + dotY(bracket.to)) / 2 - 44,
              background: COLORS.blue,
              color: COLORS.cream,
              fontFamily: FONTS.sans,
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              padding: '12px 22px 16px',
              borderRadius: 14,
              transform: `scale(${pop})`,
              transformOrigin: 'right center',
              opacity: b,
            }}
          >
            {bracket.label}
          </div>
        </>
      ) : null}
    </div>
  );
};
