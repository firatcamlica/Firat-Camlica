import React from 'react';
import {C, FONT} from '../brand';

// --- Fransa haritası (Natural Earth kıyı hattından sadeleştirilmiş, elle örneklendi) ----------
const FR: [number, number][] = [
  [2.37, 51.05], [2.55, 51.09], [3.1, 50.78], [3.7, 50.32], [4.2, 50.27], [4.82, 50.15], [4.85, 49.8],
  [5.4, 49.61], [5.8, 49.55], [6.4, 49.47], [7.0, 49.15], [7.6, 49.08], [8.2, 48.97], [7.8, 48.6],
  [7.6, 48.2], [7.55, 47.6], [7.0, 47.45], [6.95, 47.25], [6.1, 46.6], [6.15, 46.2], [6.8, 46.4],
  [6.8, 45.9], [7.1, 45.25], [6.65, 45.05], [6.95, 44.65], [6.9, 44.2], [7.5, 43.78], [7.0, 43.55],
  [6.6, 43.15], [5.9, 43.08], [5.35, 43.25], [4.8, 43.4], [4.1, 43.55], [3.3, 43.25], [3.05, 42.6],
  [3.17, 42.43], [2.5, 42.35], [1.7, 42.5], [0.7, 42.85], [-0.3, 42.8], [-1.0, 43.05], [-1.78, 43.37],
  [-1.45, 43.6], [-1.25, 44.6], [-1.1, 45.6], [-1.2, 46.0], [-1.8, 46.5], [-2.1, 46.9], [-2.2, 47.27],
  [-3.0, 47.55], [-4.35, 47.8], [-4.6, 48.4], [-4.75, 48.55], [-4.0, 48.7], [-3.0, 48.85], [-2.0, 48.65],
  [-1.5, 48.65], [-1.6, 49.2], [-1.9, 49.7], [-1.25, 49.7], [-1.15, 49.35], [-0.2, 49.3], [0.2, 49.45],
  [1.0, 49.9], [1.6, 50.2], [1.6, 50.75], [2.37, 51.05],
];
const BE: [number, number][] = [
  [2.55, 51.09], [3.4, 51.4], [4.3, 51.35], [5.0, 51.48], [5.85, 51.15], [5.65, 50.8], [6.05, 50.7],
  [6.4, 50.3], [5.8, 49.55], [5.4, 49.61], [4.85, 49.8], [4.82, 50.15], [4.2, 50.27], [3.7, 50.32],
  [3.1, 50.78], [2.55, 51.09],
];
const CITIES: {name: string; lon: number; lat: number; dx?: number; dy?: number}[] = [
  {name: 'Lille', lon: 3.06, lat: 50.63},
  {name: 'Paris', lon: 2.35, lat: 48.86},
  {name: 'Strasbourg', lon: 7.75, lat: 48.58, dx: -150, dy: -20},
  {name: 'Rennes', lon: -1.68, lat: 48.11},
  {name: 'Nantes', lon: -1.55, lat: 47.22},
  {name: 'Lyon', lon: 4.84, lat: 45.76},
  {name: 'Bordeaux', lon: -0.58, lat: 44.84},
  {name: 'Marseille', lon: 5.37, lat: 43.3, dx: -60, dy: 46},
];

export const FranceMap: React.FC<{width: number; t: number}> = ({width, t}) => {
  const lon0 = -5.2;
  const lat0 = 51.6;
  const k = Math.cos((46.5 * Math.PI) / 180);
  const scale = width / ((8.6 - lon0) * k);
  const p = ([lon, lat]: [number, number]) => [(lon - lon0) * k * scale, (lat0 - lat) * scale] as const;
  const path = (pts: [number, number][]) => pts.map((q, i) => `${i ? 'L' : 'M'}${p(q).join(' ')}`).join(' ') + 'Z';
  const h = (lat0 - 42.1) * scale;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`}>
      <path d={path(BE)} fill="#E4DFD3" stroke={C.gray} strokeWidth={2} strokeDasharray="6 6" />
      <text x={p([3.3, 51.05])[0]} y={p([3.3, 51.05])[1]} fontFamily={FONT.mono} fontSize={22} fill={C.gray}>
        Belçika
      </text>
      <path d={path(FR)} fill="#E4DFD3" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      {CITIES.map((c, i) => {
        const [x, y] = p([c.lon, c.lat]);
        const s = Math.min(1, Math.max(0, t * 1.6 - i * 0.08));
        return (
          <g key={c.name} opacity={s}>
            <circle cx={x} cy={y} r={22 * s} fill="none" stroke={C.red} strokeWidth={2.5} opacity={0.65} />
            <circle cx={x} cy={y} r={10} fill={C.blue} stroke={C.white} strokeWidth={2} />
            <text
              x={x + (c.dx ?? 18)}
              y={y + (c.dy ?? 9)}
              fontFamily={FONT.display}
              fontWeight={700}
              fontSize={26}
              fill={C.ink}
            >
              {c.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// --- Créteil konum kartı: Paris, Seine, Marne -----------------------------------------------
export const CreteilMap: React.FC<{width: number; height: number}> = ({width, height}) => (
  <svg width={width} height={height} viewBox="0 0 600 260">
    <rect width="600" height="260" rx="22" fill={C.paper} />
    <ellipse cx="270" cy="105" rx="92" ry="62" fill="#E4DFD3" stroke={C.gray} strokeDasharray="6 6" strokeWidth="2" />
    <path d="M60 60 C 140 70, 180 120, 250 110 S 340 80, 380 150 S 430 220, 520 230" fill="none" stroke={C.blue} strokeWidth="5" />
    <path d="M370 140 C 420 120, 470 130, 560 95" fill="none" stroke={C.blue} strokeWidth="4" opacity="0.7" />
    <circle cx="262" cy="102" r="9" fill={C.ink} />
    <text x="236" y="80" fontFamily={FONT.display} fontWeight={700} fontSize="28" fill={C.ink}>Paris</text>
    <circle cx="372" cy="160" r="16" fill="none" stroke={C.red} strokeWidth="3" />
    <circle cx="372" cy="160" r="8" fill={C.blue} stroke={C.white} strokeWidth="2" />
    <text x="396" y="186" fontFamily={FONT.display} fontWeight={700} fontSize="28" fill={C.ink}>Créteil</text>
  </svg>
);

// --- halka grafik ----------------------------------------------------------------------
export const Donut: React.FC<{pct: number; size: number; t: number}> = ({pct, size, t}) => {
  const r = size / 2 - 22;
  const len = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#DCD6CB" strokeWidth={36} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={C.blue}
        strokeWidth={36}
        strokeDasharray={`${(len * pct * t) / 100} ${len}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily={FONT.display}
        fontWeight={800}
        fontSize={size * 0.26}
        fill={C.red}
      >
        %{Math.round(pct * t)}
      </text>
    </svg>
  );
};

// --- buzdolabı + termometre ------------------------------------------------------------------
export const FridgeThermo: React.FC<{t: number; from: number; to: number}> = ({t, from, to}) => {
  const v = from + (to - from) * t;
  const tubeTop = 40;
  const tubeBottom = 300;
  const fill = (tubeBottom - tubeTop) * ((v - 0) / 60);
  return (
    <svg width={560} height={360} viewBox="0 0 560 360">
      {/* buzdolabı silüeti */}
      <rect x="20" y="10" width="200" height="340" rx="22" fill="none" stroke={C.cream} strokeWidth="6" />
      <line x1="20" y1="120" x2="220" y2="120" stroke={C.cream} strokeWidth="6" />
      <line x1="190" y1="50" x2="190" y2="92" stroke={C.cream} strokeWidth="8" strokeLinecap="round" />
      <line x1="190" y1="150" x2="190" y2="210" stroke={C.cream} strokeWidth="8" strokeLinecap="round" />
      {[170, 230, 290].map((y) => (
        <line key={y} x1="40" y1={y} x2="168" y2={y} stroke={C.cream} strokeWidth="3" opacity="0.35" />
      ))}
      {/* termometre */}
      <rect x="290" y={tubeTop - 20} width="44" height={tubeBottom - tubeTop + 30} rx="22" fill="none" stroke={C.cream} strokeWidth="5" />
      <circle cx="312" cy={tubeBottom + 26} r="32" fill={C.red} stroke={C.cream} strokeWidth="5" />
      <rect x="300" y={tubeBottom - fill} width="24" height={fill + 10} rx="10" fill={C.red} />
      {[0, 20, 40, 60].map((d) => {
        const y = tubeBottom - ((tubeBottom - tubeTop) * d) / 60;
        return (
          <g key={d}>
            <line x1="342" y1={y} x2="358" y2={y} stroke={C.cream} strokeWidth="3" opacity="0.6" />
          </g>
        );
      })}
      <text x="372" y={Math.max(70, tubeBottom - fill + 22)} fontFamily={FONT.display} fontWeight={800} fontSize="76" fill={C.red}>
        {Math.round(v)} °C
      </text>
      <text x="372" y={tubeBottom + 40} fontFamily={FONT.mono} fontSize="24" fill="rgba(241,237,229,0.7)">
        normal: {from} °C
      </text>
    </svg>
  );
};

// --- giriş ekranı -----------------------------------------------------------------------
export const LoginScreen: React.FC<{user: string; pass: string; t: number}> = ({user, pass, t}) => {
  const shown = pass.slice(0, Math.round(pass.length * t));
  const field = (label: string, value: string, y: number) => (
    <g>
      <text x="56" y={y} fontFamily={FONT.mono} fontSize="24" fill={C.gray}>{label}</text>
      <rect x="56" y={y + 14} width="808" height="76" rx="12" fill={C.white} stroke={C.line} strokeWidth="3" />
      <text x="80" y={y + 66} fontFamily={FONT.mono} fontWeight={700} fontSize="38" fill={C.ink}>{value}</text>
    </g>
  );
  return (
    <svg width={920} height={380} viewBox="0 0 920 380">
      <rect x="2" y="2" width="916" height="376" rx="24" fill={C.paper} stroke={C.ink} strokeWidth="4" />
      <rect x="2" y="2" width="916" height="56" rx="24" fill={C.ink} />
      <rect x="2" y="34" width="916" height="24" fill={C.ink} />
      {[40, 72, 104].map((x) => (
        <circle key={x} cx={x} cy="30" r="9" fill={C.cream} opacity="0.5" />
      ))}
      <text x="460" y="39" textAnchor="middle" fontFamily={FONT.mono} fontSize="22" fill={C.cream} opacity="0.8">
        soğutma kontrol paneli
      </text>
      {field('kullanıcı adı', user, 104)}
      {field('şifre', shown, 230)}
    </svg>
  );
};
