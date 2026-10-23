// turkiye-f35 vektör çizimleri. Fotoğraf/B-roll bulunamadığında sahneler bunlara döner.
// Hepsi temsilîdir; ekranda "ÇİZİM" etiketiyle gösterilir.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../../brand/tokens';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Hangar içi (perspektif): kemerli tavan kaburgaları, zemin çizgileri, arkada açık kapı. 3 sn'de %6 itiş. */
export const Hangar: React.FC<{push?: number; dim?: number}> = ({push = 0.06, dim = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = 1 + (f / (3 * fps)) * push;
  const vp = {x: 540, y: 980};
  const ribs = Array.from({length: 9}, (_, i) => 1 - i * 0.105);
  return (
    <AbsoluteFill style={{background: COLORS.black, overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{transform: `scale(${s})`, transformOrigin: `${vp.x}px ${vp.y}px`}}>
        <defs>
          <radialGradient id="hg-door" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.9} />
            <stop offset="45%" stopColor={COLORS.blue} stopOpacity={0.85} />
            <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.15} />
          </radialGradient>
          <linearGradient id="hg-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E2440" />
            <stop offset="100%" stopColor="#0B0D18" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="#0E1120" />
        <polygon points={`-400,1920 1480,1920 ${vp.x + 250},1160 ${vp.x - 250},1160`} fill="url(#hg-floor)" />
        {/* arka duvar ve açık kapı */}
        <rect x={vp.x - 250} y={760} width={500} height={400} fill="#151A30" />
        <rect x={vp.x - 200} y={800} width={400} height={360} fill="url(#hg-door)" />
        {/* zemin ışığı yansıması */}
        <polygon points={`${vp.x - 200},1160 ${vp.x + 200},1160 ${vp.x + 520},1920 ${vp.x - 520},1920`} fill={COLORS.blue} opacity={0.16} />
        {/* tavan kaburgaları */}
        {ribs.map((k, i) => {
          const w = 900 * k + 220;
          const top = vp.y - 1050 * k - 160;
          const base = vp.y + 180 * k + 180;
          return (
            <path
              key={i}
              d={`M${vp.x - w} ${base} L${vp.x - w} ${top + 420 * k} Q${vp.x} ${top - 260 * k} ${vp.x + w} ${top + 420 * k} L${vp.x + w} ${base}`}
              fill="none"
              stroke={COLORS.cream}
              strokeOpacity={0.07 + 0.11 * k}
              strokeWidth={3 + 9 * k}
            />
          );
        })}
        {/* boyuna kirişler ve zemin çizgileri */}
        {[-1, -0.55, 0, 0.55, 1].map((x, i) => (
          <line key={`c${i}`} x1={vp.x + x * 1300} y1={x === 0 ? -200 : 120} x2={vp.x + x * 200} y2={780} stroke={COLORS.cream} strokeOpacity={0.08} strokeWidth={4} />
        ))}
        {[-1.4, -0.8, -0.3, 0.3, 0.8, 1.4].map((x, i) => (
          <line key={`f${i}`} x1={vp.x + x * 900} y1={1920} x2={vp.x + x * 170} y2={1160} stroke={COLORS.cream} strokeOpacity={0.09} strokeWidth={3} />
        ))}
        {/* tavan lambaları */}
        {ribs.slice(1, 7).map((k, i) => (
          <g key={`l${i}`} opacity={0.25 + 0.5 * k}>
            {[-0.45, 0.45].map((x) => (
              <rect key={x} x={vp.x + x * (900 * k + 220) - 40 * k} y={vp.y - 1050 * k - 30 + 120 * k} width={80 * k + 10} height={10 * k + 3} rx={3} fill={COLORS.cream} />
            ))}
          </g>
        ))}
      </svg>
      {dim ? <AbsoluteFill style={{background: `rgba(11,13,24,${dim})`}} /> : null}
    </AbsoluteFill>
  );
};

export type F35Part = 'body' | 'cockpit' | 'gear';

/**
 * F-35 yandan silüet (temsilî). `lit` her parça için 0..1 (mavi yanma).
 * viewBox 0 0 1000 320; burun solda.
 */
export const F35Side: React.FC<{width: number; lit?: Partial<Record<F35Part, number>>; fill?: string; line?: string}> = ({
  width,
  lit = {},
  fill = COLORS.black,
  line = COLORS.cream,
}) => {
  const blue = (k = 0) => (k > 0 ? COLORS.blue : 'transparent');
  return (
    <svg width={width} height={width * 0.32} viewBox="0 0 1000 320" style={{overflow: 'visible'}}>
      {/* arkadaki (eğik) dikey kuyruk */}
      <path d="M800 118 L878 44 L912 44 L906 120 Z" fill={fill} opacity={0.55} />
      {/* gövde */}
      <path
        d="M10 170 C60 150 140 130 230 122 C260 100 300 84 350 82 C400 82 440 96 470 112 L700 118 L762 112 L850 30 L898 30 L886 118 L950 124 L990 131 L990 161 L950 166 L880 172 L700 182 L470 186 L420 181 L330 177 C250 179 120 183 10 170 Z"
        fill={fill}
      />
      {/* yatay stabilizör ve kanat */}
      <path d="M815 150 L975 145 L986 156 L826 163 Z" fill={fill} stroke={line} strokeOpacity={0.25} strokeWidth={2} />
      <path d="M470 166 L765 158 L775 170 L480 179 Z" fill={fill} stroke={line} strokeOpacity={0.3} strokeWidth={2} />
      {/* hava girişi */}
      <path d="M356 128 L424 121 L434 172 L372 174 Z" fill={line} opacity={0.12} />
      {/* panel çizgileri */}
      <g stroke={line} strokeOpacity={0.22} strokeWidth={2} fill="none">
        <path d="M230 124 L330 176" />
        <path d="M480 114 L480 186" />
        <path d="M700 118 L700 182" />
        <path d="M886 120 L880 172" />
      </g>
      {/* orta gövde */}
      <path d="M480 114 L700 118 L700 182 L480 186 Z" fill={blue(lit.body)} opacity={lit.body ?? 0} />
      {/* kokpit (kanopi + ekran) */}
      <path d="M232 122 C262 100 302 86 350 84 C398 84 438 97 466 112 Z" fill={lit.cockpit ? COLORS.blue : line} opacity={lit.cockpit ? 0.25 + 0.75 * lit.cockpit : 0.22} />
      <rect x={300} y={102} width={70} height={14} rx={3} fill={lit.cockpit ? COLORS.cream : 'transparent'} opacity={lit.cockpit ?? 0} />
      {/* iniş takımları */}
      {[
        {x: 300, y0: 177, y1: 246, r: 19},
        {x: 640, y0: 184, y1: 250, r: 23},
      ].map((g) => (
        <g key={g.x}>
          <rect x={g.x - 5} y={g.y0} width={10} height={g.y1 - g.y0} fill={lit.gear ? COLORS.blue : fill} opacity={1} />
          <circle cx={g.x} cy={g.y1 + g.r - 6} r={g.r} fill={lit.gear ? COLORS.blue : fill} />
          <circle cx={g.x} cy={g.y1 + g.r - 6} r={g.r * 0.4} fill={line} opacity={0.5} />
        </g>
      ))}
    </svg>
  );
};

/** Parça konumları (viewBox koordinatı): etiket çizgilerinin çıkış noktası */
export const F35_PART_ANCHORS: Record<F35Part, [number, number]> = {
  cockpit: [330, 92],
  body: [590, 150],
  gear: [640, 270],
};

/** S-400 rampalı araç (yandan, temsilî) */
export const S400Side: React.FC<{width: number; raise?: number}> = ({width, raise = 1}) => {
  const ang = 76 * raise;
  return (
    <svg width={width} height={width * 0.75} viewBox="0 0 1000 750" style={{overflow: 'visible'}}>
      <g fill="rgba(242,238,230,0.16)" stroke="rgba(242,238,230,0.55)" strokeWidth={3}>
        <path d="M60 520 L60 640 L230 640 L230 470 L130 470 Z" />
        <rect x={60} y={600} width={880} height={50} />
        <g transform={`rotate(${ang} 880 590)`}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={340} y={548 + i * 0} width={540} height={42} rx={6} transform={`translate(0 ${-i * 46})`} />
          ))}
          <rect x={320} y={400} width={20} height={200} />
        </g>
        <path d="M600 600 L800 420" />
      </g>
      {[130, 250, 560, 690, 820].map((x) => (
        <g key={x}>
          <circle cx={x} cy={672} r={44} fill="#0E1120" stroke="rgba(242,238,230,0.6)" strokeWidth={4} />
          <circle cx={x} cy={672} r={16} fill="rgba(242,238,230,0.4)" />
        </g>
      ))}
    </svg>
  );
};

/** Sahne geçişinde arka planın yavaşça kararması/aydınlanması için yardımcı */
export const useFade = (from: number, to: number, a = 0, b = 1) => {
  const f = useCurrentFrame();
  return interpolate(f, [from, to], [a, b], clamp);
};
