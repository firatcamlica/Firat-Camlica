import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoInterpolate, geoMercator, geoPath, GeoProjection} from 'd3-geo';
import {feature} from 'topojson-client';
import type {FeatureCollection, Geometry} from 'geojson';
import topo from './countries-110m.json';
import {COLORS, FONTS, Logo} from '../brand';
import {COORDS, SAFE, SIDES, TweetSlot, WIDTH} from '../data/twitter-savasi';
import {AUDIO} from './timing';

export const RED = '#E1000F';
export const WAR_BG = '#111214';
export const CONTENT_W = WIDTH - SAFE.left - SAFE.right;

const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const fade = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
export const fadeOut = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// --- harita ------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COUNTRIES = feature(topo as any, (topo as any).objects.countries) as unknown as FeatureCollection<Geometry, {name: string}>;
const HIGHLIGHT: Record<string, keyof typeof SIDES> = {'792': 'tr', '156': 'cn', '392': 'jp', '158': 'tw'};

export type Camera = {lon: number; lat: number; scale: number};
type LonLat = [number, number];
export const ll = (c: {lon: number; lat: number}): LonLat => [c.lon, c.lat];

export const makeProjection = (cam: Camera, cy = 900): GeoProjection =>
  geoMercator().center([cam.lon, cam.lat]).scale(cam.scale).translate([WIDTH / 2, cy]);

export const lerpCam = (f: number, keys: [number, Camera][]): Camera => {
  const frames = keys.map((k) => k[0]);
  const pick = (k: keyof Camera) =>
    interpolate(f, frames, keys.map((x) => x[1][k]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return {lon: pick('lon'), lat: pick('lat'), scale: pick('scale')};
};

/** Koyu zeminde ızgara + ülke sınırları. `highlight`: hangi tarafların ince renk çizgisi alacağı. */
export const WarMap: React.FC<{
  cam: Camera;
  highlight?: (keyof typeof SIDES)[];
  dim?: number;
  cy?: number;
  bg?: string;
  children?: (p: GeoProjection) => React.ReactNode;
}> = ({cam, highlight = ['tr', 'cn'], dim = 1, cy = 900, bg = WAR_BG, children}) => {
  const f = useCurrentFrame();
  const proj = makeProjection(cam, cy);
  const path = geoPath(proj);
  const gridShift = (f * 0.6) % 60;
  return (
    <AbsoluteFill style={{background: bg}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: dim}}>
        <defs>
          <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${gridShift})`}>
            <path d="M60 0H0V60" fill="none" stroke="rgba(242,238,230,0.06)" strokeWidth={1.5} />
          </pattern>
          <radialGradient id="vig" cx="50%" cy="47%" r="70%">
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#grid)" />
        {COUNTRIES.features.map((c, i) => {
          const side = HIGHLIGHT[String(c.id)];
          const on = side && highlight.includes(side);
          return (
            <path
              key={i}
              d={path(c) ?? ''}
              fill={on ? `${SIDES[side].color}1F` : 'rgba(242,238,230,0.035)'}
              stroke={on ? SIDES[side].color : 'rgba(242,238,230,0.22)'}
              strokeWidth={on ? 2.4 : 1}
            />
          );
        })}
        {children?.(proj)}
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Büyük daire üzerinde noktalar (d3 geoInterpolate). */
export const greatCircle = (a: LonLat, b: LonLat, n = 64): LonLat[] => {
  const i = geoInterpolate(a, b);
  return Array.from({length: n + 1}, (_, k) => i(k / n) as LonLat);
};

/** İki nokta arasında büyük daire mesafesi (haversine, km). */
export const haversineKm = (a: {lat: number; lon: number}, b: {lat: number; lon: number}) => {
  const R = 6371;
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Projeksiyon üzerinde ilerleyen ok. `progress` 0-1; uçta yanıp sönen ok başı. */
export const RouteArrow: React.FC<{
  proj: GeoProjection;
  pts: LonLat[];
  progress: number;
  color: string;
  dashed?: boolean;
  width?: number;
  head?: boolean;
}> = ({proj, pts, progress, color, dashed, width = 6, head = true}) => {
  const f = useCurrentFrame();
  if (progress <= 0) return null;
  const n = Math.max(2, Math.ceil(progress * (pts.length - 1)) + 1);
  const xy = pts.slice(0, n).map((p) => proj(p) as [number, number]);
  const d = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const [x1, y1] = xy[xy.length - 2];
  const [x2, y2] = xy[xy.length - 1];
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const blink = Math.floor(f / 6) % 2 === 0 ? 1 : 0.35;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '18 14' : undefined} strokeDashoffset={dashed ? -f * 2 : 0} />
      {head ? (
        <path d="M0,-18 L30,0 L0,18 Z" fill={color} opacity={blink} transform={`translate(${x2},${y2}) rotate(${ang})`} />
      ) : null}
    </g>
  );
};

/** Hedef işareti: nişangah + nabız halkası. */
export const Target: React.FC<{x: number; y: number; color: string; label?: string; appear?: number; labelSide?: 'left' | 'right'}> = ({
  x,
  y,
  color,
  label,
  appear = 1,
  labelSide = 'right',
}) => {
  const f = useCurrentFrame();
  const pulse = (f % 30) / 30;
  if (appear <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${0.6 + 0.4 * appear})`} opacity={appear}>
      <circle r={22 + pulse * 40} fill="none" stroke={color} strokeWidth={3} opacity={1 - pulse} />
      <circle r={20} fill="none" stroke={color} strokeWidth={3} />
      <circle r={5} fill={color} />
      <path d="M-34 0H-24M24 0H34M0 -34V-24M0 24V34" stroke={color} strokeWidth={3} />
      {label ? (
        <text
          x={labelSide === 'right' ? 44 : -44}
          y={10}
          textAnchor={labelSide === 'right' ? 'start' : 'end'}
          fill={COLORS.cream}
          style={{font: `700 30px ${FONTS.mono}`, letterSpacing: '0.04em'}}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

// --- tipografi ve kartlar -------------------------------------------------------

/** Üst şerit: logo + "CEPHE RAPORU" + sahne etiketi, yanıp sönen kırmızı nokta. */
export const TopTag: React.FC<{tag: string; light?: boolean; appear?: number; noBlink?: boolean}> = ({tag, light, appear = 1, noBlink}) => {
  const f = useCurrentFrame();
  const color = light ? COLORS.black : COLORS.cream;
  const typed = Math.round(tag.length * Math.min(1, appear * 1.2));
  return (
    <div style={{position: 'absolute', left: SAFE.left, top: SAFE.top, right: SAFE.right, display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, appear * 3)}}>
      <Logo size={56} stroke={light ? undefined : 'rgba(242,238,230,0.55)'} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, font: `700 26px ${FONTS.mono}`, letterSpacing: '0.12em', color: light ? COLORS.dimLight : COLORS.dimDark}}>
          {noBlink ? null : <span style={{width: 14, height: 14, borderRadius: 7, background: RED, opacity: Math.floor(f / 10) % 2 ? 0.25 : 1}} />}
          {light ? 'ARKA PLAN' : 'CEPHE RAPORU'}
        </div>
        <div style={{font: `700 32px ${FONTS.mono}`, letterSpacing: '0.06em', color, whiteSpace: 'nowrap'}}>
          {tag.slice(0, typed)}
          {typed < tag.length ? <span style={{opacity: 0.6}}>▍</span> : null}
        </div>
      </div>
    </div>
  );
};

/** Alt kaynak satırı (güvenli alanın hemen üstü). */
export const SourceLine: React.FC<{text: string; light?: boolean; appear?: number}> = ({text, light, appear = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.left,
      right: SAFE.right,
      bottom: SAFE.bottom + 8,
      font: `500 26px/1.35 ${FONTS.mono}`,
      color: light ? COLORS.dimLight : COLORS.dimDark,
      opacity: appear,
    }}
  >
    {text}
  </div>
);

/** Kırmızı çerçeveli, hafif eğik damga. `t`: damga anından itibaren kare. */
export const Stamp: React.FC<{text: string; t: number; rotate?: number; size?: number}> = ({text, t, rotate = -7, size = 64}) => {
  const {fps} = useVideoConfig();
  if (t < 0) return null;
  const s = interpolate(spring({frame: t, fps, config: {damping: 14, stiffness: 260, mass: 0.6}}), [0, 1], [2.2, 1]);
  const o = interpolate(t, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        transform: `rotate(${rotate}deg) scale(${s})`,
        opacity: o,
        border: `8px solid ${RED}`,
        outline: `3px solid ${RED}`,
        outlineOffset: 6,
        color: RED,
        padding: '14px 28px',
        font: `700 ${size}px/1.05 ${FONTS.mono}`,
        letterSpacing: '0.04em',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        background: 'rgba(17,18,20,0.88)',
        mixBlendMode: 'normal',
        maskImage: 'repeating-linear-gradient(115deg, #000 0 9px, rgba(0,0,0,0.82) 9px 12px)',
        WebkitMaskImage: 'repeating-linear-gradient(115deg, #000 0 9px, rgba(0,0,0,0.82) 9px 12px)',
      }}
    >
      {text}
    </div>
  );
};

/** Hafif eğik giren kart (±4°), arkada küçük gölge. `t`: girişten itibaren kare. */
export const TiltCard: React.FC<{
  t: number;
  dir?: 1 | -1;
  exitAt?: number;
  width?: number;
  light?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({t, dir = 1, exitAt, width = CONTENT_W, light = true, children, style}) => {
  const {fps} = useVideoConfig();
  if (t < 0) return null;
  const sp = spring({frame: t, fps, config: {damping: 16, stiffness: 170}});
  const rot = interpolate(sp, [0, 1], [4 * dir, 1.4 * dir]);
  const y = interpolate(sp, [0, 1], [140, 0]);
  const out = exitAt != null ? fade(t, exitAt, exitAt + 7) : 0;
  return (
    <div
      style={{
        width,
        transform: `translate(${out * -160 * dir}px, ${y}px) rotate(${rot - out * 6 * dir}deg)`,
        opacity: Math.min(1, sp * 2) * (1 - out),
        background: light ? COLORS.cream : COLORS.cardDark,
        color: light ? COLORS.black : COLORS.cream,
        borderRadius: 18,
        boxShadow: '0 18px 40px rgba(0,0,0,0.45), 0 4px 10px rgba(0,0,0,0.35)',
        padding: '40px 44px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SideTag: React.FC<{side: keyof typeof SIDES; text?: string}> = ({side, text}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, font: `700 26px ${FONTS.mono}`, letterSpacing: '0.08em', color: 'inherit', opacity: 0.8}}>
    <span style={{width: 44, height: 6, borderRadius: 3, background: SIDES[side].color}} />
    {text ?? `${SIDES[side].label} TARAFI`}
  </div>
);

/** public/tweets/ altında gerçekten bulunan dosyalar (tools/prep_tw.py yazar). */
export const hasShot = (slot: TweetSlot) => !!slot.file && AUDIO.tweets.includes(slot.file);

/**
 * Ekran görüntüsünün dikey dilimi. Profil/kullanıcı adı bölgeleri, görüntünün bulanık kopyası
 * o bölgeye kırpılarak örtülür; bulanıklık kenarları taşmasın diye kopya ayrıca koyulaştırılır.
 */
export const BlurredShot: React.FC<{slot: TweetSlot; width: number}> = ({slot, width}) => {
  const src = staticFile(`tweets/${slot.file}`);
  const fullH = width * slot.aspect;
  const top = slot.crop.y0 * fullH;
  const h = (slot.crop.y1 - slot.crop.y0) * fullH;
  return (
    <div style={{position: 'relative', width, height: h, borderRadius: 12, overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: -top, width, height: fullH}}>
        <Img src={src} style={{width, height: fullH, display: 'block'}} />
        {slot.blur.map((r, i) => (
          <div
            key={i}
            data-blur-region
            style={{position: 'absolute', left: r.x * width, top: r.y * fullH, width: r.w * width, height: r.h * fullH, overflow: 'hidden'}}
          >
            <Img
              src={src}
              style={{position: 'absolute', left: -r.x * width, top: -r.y * fullH, width, height: fullH, filter: 'blur(18px) brightness(0.85)', transform: 'scale(1.02)'}}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/** Tweet kartı: ekran görüntüsü varsa (bulanıklaştırılmış) onu, yoksa düz tipografik özet kartını gösterir. */
export const TweetCard: React.FC<{slot: TweetSlot; t: number; dir?: 1 | -1; exitAt?: number; maxShotH?: number; compact?: boolean}> = ({
  slot,
  t,
  dir = 1,
  exitAt,
  maxShotH = 980,
  compact,
}) => {
  const shot = hasShot(slot);
  const inner = CONTENT_W - 64;
  const sliceH = (slot.crop.y1 - slot.crop.y0) * inner * slot.aspect;
  const w = sliceH > maxShotH ? inner * (maxShotH / sliceH) : inner;
  return (
    <TiltCard t={t} dir={dir} exitAt={exitAt} style={shot ? {padding: '28px 32px'} : compact ? {padding: '28px 36px'} : undefined}>
      <div style={{display: 'inline-block', font: `700 28px ${FONTS.mono}`, letterSpacing: '0.04em', padding: '8px 14px', border: `2px solid ${COLORS.black}`, borderRadius: 8, marginBottom: shot || compact ? 18 : 28}}>
        {shot ? "X'te dolaşan paylaşım" : slot.label}
      </div>
      {shot ? (
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <BlurredShot slot={slot} width={w} />
        </div>
      ) : (
        <div style={{font: `800 ${compact ? 50 : 64}px/1.12 ${FONTS.sans}`, letterSpacing: '-0.015em'}}>{slot.summary}</div>
      )}
      <div style={{marginTop: shot || compact ? 18 : 30}}>
        <SideTag side={slot.side} text={slot.tag ?? (slot.side === 'cn' ? 'ÇİNLİ HESAPLARDAN' : 'TÜRK HESAPLARDAN')} />
      </div>
    </TiltCard>
  );
};

/** Kelime kelime gelen büyük başlık. */
export const WordByWord: React.FC<{text: string; t: number; size: number; every?: number; color?: string; align?: 'left' | 'center'}> = ({
  text,
  t,
  size,
  every = 5,
  color = COLORS.cream,
  align = 'left',
}) => (
  <div style={{font: `800 ${size}px/1.02 ${FONTS.sans}`, letterSpacing: '-0.02em', color, textAlign: align}}>
    {text.split(' ').map((w, i) => {
      const k = t - i * every;
      const o = interpolate(k, [0, 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      const y = interpolate(k, [0, 6], [40, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
      return (
        <span key={i} style={{display: 'inline-block', opacity: o, transform: `translateY(${y}px)`, marginRight: size * 0.25}}>
          {w}
        </span>
      );
    })}
  </div>
);

// --- basit vektörler ----------------------------------------------------------

/** Çin Seddi'nin sade silüeti: sırt çizgisi boyunca dişli duvar ve üç kule. */
export const WallSilhouette: React.FC<{width: number; draw: number; color?: string}> = ({width, draw, color = COLORS.cream}) => {
  const H = 360;
  const ridge = (x: number) => 230 - 70 * Math.sin((x / width) * Math.PI * 1.6 + 0.4) - 30 * Math.sin((x / width) * Math.PI * 4.2);
  const step = 6;
  const top: string[] = [];
  for (let x = 0; x <= width; x += step) top.push(`${x},${ridge(x).toFixed(1)}`);
  const wall = `M${top.join(' L')} L${width},${H} L0,${H} Z`;
  const merlons: React.ReactNode[] = [];
  for (let x = 6; x < width; x += 26) merlons.push(<rect key={x} x={x} y={ridge(x) - 16} width={14} height={18} fill={color} />);
  const towers = [0.18, 0.52, 0.84].map((p) => {
    const x = p * width;
    const y = ridge(x);
    return (
      <g key={p}>
        <rect x={x - 34} y={y - 72} width={68} height={80} fill={color} />
        <rect x={x - 40} y={y - 84} width={80} height={14} fill={color} />
        <rect x={x - 10} y={y - 54} width={20} height={26} rx={10} fill={WAR_BG} />
      </g>
    );
  });
  return (
    <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="wall-draw">
          <rect x={0} y={-120} width={width * draw} height={H + 200} />
        </clipPath>
      </defs>
      <g clipPath="url(#wall-draw)" opacity={0.9}>
        <path d={wall} fill={color} opacity={0.18} />
        <path d={`M${top.join(' L')}`} fill="none" stroke={color} strokeWidth={10} strokeLinejoin="round" />
        {merlons}
        {towers}
      </g>
    </svg>
  );
};

export const TopicIcon: React.FC<{id: string; size: number; color: string}> = ({id, size, color}) => {
  const s = {fill: 'none', stroke: color, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {id === 'ekonomi' ? (
        <g {...s}>
          <path d="M14 86H88" />
          <path d="M24 86V62M44 86V48M64 86V56M84 86V30" strokeWidth={10} />
          <path d="M18 46L42 28L58 38L84 14M70 14H84V28" />
        </g>
      ) : id === 'teknoloji' ? (
        <g {...s}>
          <rect x={26} y={26} width={48} height={48} rx={6} />
          <rect x={40} y={40} width={20} height={20} />
          <path d="M38 14V26M50 14V26M62 14V26M38 74V86M50 74V86M62 74V86M14 38H26M14 50H26M14 62H26M74 38H86M74 50H86M74 62H86" />
        </g>
      ) : id === 'sinema' ? (
        <g {...s}>
          <rect x={14} y={40} width={72} height={46} rx={4} />
          <path d="M14 40L80 22L84 34L18 52" />
          <path d="M30 36L38 48M50 30L58 42M68 26L74 36" />
        </g>
      ) : (
        <g {...s}>
          <circle cx={50} cy={50} r={36} />
          <ellipse cx={50} cy={50} rx={15} ry={36} />
          <path d="M14 50H86M20 32H80M20 68H80" />
        </g>
      )}
    </svg>
  );
};

/** Üstten görünüşte boş toplantı masası. */
export const TableIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 200 160">
    <rect x={40} y={40} width={120} height={80} rx={40} fill="none" stroke={color} strokeWidth={7} />
    {[60, 100, 140].map((x) => (
      <g key={x}>
        <rect x={x - 14} y={8} width={28} height={20} rx={7} fill={color} />
        <rect x={x - 14} y={132} width={28} height={20} rx={7} fill={color} />
      </g>
    ))}
    <rect x={6} y={66} width={20} height={28} rx={7} fill={color} />
    <rect x={174} y={66} width={20} height={28} rx={7} fill={color} />
  </svg>
);

export {COORDS};
