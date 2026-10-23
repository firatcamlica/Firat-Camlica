// Bölge haritası (Natural Earth 1:50m, world-atlas). Ülke vurgusu, kesikli oklar (uçta etiket, ör. "?"),
// ince bağlantı çizgisi (ortasında ikon, ör. kilit) ve şehir/ülke etiketleri. Tüm öğeler kareye bağlı açılır.
import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import type {FeatureCollection, Geometry} from 'geojson';
import world from 'world-atlas/countries-50m.json';
import {COLORS, FONTS} from './tokens';
import {LockIcon} from './Lock';

type LonLat = [number, number];
export type MapArrow = {from: LonLat; to: LonLat; frame: number; endLabel?: string; bend?: number; /** etiketin uca göre konumu (px) */ labelOffset?: [number, number]};
export type MapLink = {from: LonLat; to: LonLat; frame: number; icon?: 'lock'};
export type MapLabel = {at: LonLat; text: string; frame: number; dx?: number; dy?: number; strong?: boolean; dot?: boolean};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

const countries = feature(world as never, (world as never as {objects: {countries: never}}).objects.countries) as unknown as FeatureCollection<Geometry, {name: string}>;

export const RegionMap: React.FC<{
  width: number;
  height: number;
  bounds: [LonLat, LonLat];
  /** world-atlas ülke kimlikleri (ISO 3166 sayısal): mavi dolgu */
  highlight?: string[];
  /** ince krem kontur */
  outline?: string[];
  arrows?: MapArrow[];
  links?: MapLink[];
  labels?: MapLabel[];
  /** yavaş itiş (0..1 arası ölçek artışı, sahne boyunca) */
  push?: number;
  pushFrames?: number;
}> = ({width, height, bounds, highlight = [], outline = [], arrows = [], links = [], labels = [], push = 0.04, pushFrames = 300}) => {
  const f = useCurrentFrame();
  const projection = useMemo(
    () =>
      geoMercator().fitExtent(
        [
          [0, 0],
          [width, height],
        ],
        {type: 'MultiPoint', coordinates: bounds},
      ),
    [width, height, bounds],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const shapes = useMemo(
    () => countries.features.map((c) => ({id: String(c.id), d: path(c) ?? ''})).filter((c) => c.d),
    [path],
  );
  const P = (p: LonLat) => projection(p) as [number, number];
  const s = 1 + interpolate(f, [0, pushFrames], [0, push], clamp);

  const curve = (a: [number, number], b: [number, number], bend: number, t: number) => {
    const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend;
    const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
    const pts: [number, number][] = [];
    const n = 40;
    for (let i = 0; i <= Math.round(n * t); i++) {
      const u = i / n;
      pts.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u ** 2 * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u ** 2 * b[1]]);
    }
    return pts;
  };

  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden', borderRadius: 18}}>
      <svg width={width} height={height} style={{transform: `scale(${s})`, transformOrigin: '50% 50%'}}>
        <rect width={width} height={height} fill="#10131F" />
        {shapes.map((c) => (
          <path
            key={c.id + c.d.length}
            d={c.d}
            fill={highlight.includes(c.id) ? COLORS.blue : 'rgba(242,238,230,0.13)'}
            stroke={outline.includes(c.id) ? COLORS.cream : 'rgba(242,238,230,0.28)'}
            strokeWidth={outline.includes(c.id) ? 2.5 : 1}
          />
        ))}
        {links.map((l, i) => {
          const a = P(l.from);
          const b = P(l.to);
          const t = interpolate(f, [l.frame, l.frame + 14], [0, 1], {...clamp, easing: ease});
          if (t <= 0) return null;
          return (
            <line key={`l${i}`} x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * t} y2={a[1] + (b[1] - a[1]) * t} stroke={COLORS.cream} strokeWidth={2.5} opacity={0.85} />
          );
        })}
        {arrows.map((ar, i) => {
          const a = P(ar.from);
          const b = P(ar.to);
          const t = interpolate(f, [ar.frame, ar.frame + 18], [0, 1], {...clamp, easing: ease});
          if (t <= 0) return null;
          const pts = curve(a, b, ar.bend ?? 0.18, t);
          const [x1, y1] = pts[pts.length - 1];
          const [x0, y0] = pts[Math.max(0, pts.length - 3)];
          const ang = Math.atan2(y1 - y0, x1 - x0);
          const head = 18;
          return (
            <g key={`a${i}`}>
              <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={COLORS.cream} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" />
              {t > 0.97 ? (
                <path
                  d={`M${x1} ${y1} L${x1 - head * Math.cos(ang - 0.45)} ${y1 - head * Math.sin(ang - 0.45)} M${x1} ${y1} L${x1 - head * Math.cos(ang + 0.45)} ${y1 - head * Math.sin(ang + 0.45)}`}
                  stroke={COLORS.cream}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      {/* HTML katmanı: ikonlar ve etiketler aynı ölçekle */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '50% 50%'}}>
        {links.map((l, i) => {
          if (!l.icon) return null;
          const a = P(l.from);
          const b = P(l.to);
          const o = interpolate(f, [l.frame + 10, l.frame + 18], [0, 1], clamp);
          const closed = interpolate(f, [l.frame + 14, l.frame + 20], [0, 1], clamp);
          return (
            <div key={`i${i}`} style={{position: 'absolute', left: (a[0] + b[0]) / 2 - 30, top: (a[1] + b[1]) / 2 - 30, opacity: o}}>
              <LockIcon size={60} bg={COLORS.blue} color={COLORS.cream} closed={closed} />
            </div>
          );
        })}
        {arrows.map((ar, i) => {
          if (!ar.endLabel) return null;
          const b = P(ar.to);
          const o = interpolate(f, [ar.frame + 16, ar.frame + 22], [0, 1], clamp);
          return (
            <div
              key={`q${i}`}
              style={{
                position: 'absolute',
                left: b[0] + (ar.labelOffset?.[0] ?? 10),
                top: b[1] + (ar.labelOffset?.[1] ?? -78),
                opacity: o,
                width: 54,
                height: 54,
                borderRadius: 27,
                background: COLORS.cream,
                color: COLORS.black,
                fontFamily: FONTS.sans,
                fontWeight: 800,
                fontSize: 40,
                lineHeight: '54px',
                textAlign: 'center',
              }}
            >
              {ar.endLabel}
            </div>
          );
        })}
        {labels.map((lb, i) => {
          const p = P(lb.at);
          const o = interpolate(f, [lb.frame, lb.frame + 8], [0, 1], clamp);
          return (
            <div key={`t${i}`} style={{position: 'absolute', left: p[0], top: p[1], opacity: o}}>
              {lb.dot ? <div style={{position: 'absolute', left: -7, top: -7, width: 14, height: 14, borderRadius: 7, background: COLORS.cream}} /> : null}
              <div
                style={{
                  position: 'absolute',
                  left: lb.dx ?? 14,
                  top: lb.dy ?? -14,
                  whiteSpace: 'nowrap',
                  fontFamily: FONTS.mono,
                  fontWeight: lb.strong ? 700 : 500,
                  fontSize: lb.strong ? 30 : 26,
                  letterSpacing: 2,
                  color: COLORS.cream,
                  textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                }}
              >
                {lb.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
