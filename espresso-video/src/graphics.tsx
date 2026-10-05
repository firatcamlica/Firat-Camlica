import React from "react";
import { C, FONT } from "./theme";
import { lerp } from "./anim";

/* ------------------------------------------------------------------ FİNCAN */
// viewBox 600x560. Cam fincan: sıvı seviyesi (fill) ve crema katmanı görünür.
const BODY = "M100,240 L500,240 C500,400 440,480 300,480 C160,480 100,400 100,240 Z";

export const Cup: React.FC<{
  frame: number;
  fill: number; // 0..1 dolum
  crema: number; // 0..1 crema kalınlığı
  steam: number; // 0..1 buhar yoğunluğu
  width: number; // px
}> = ({ frame, fill, crema, steam, width }) => {
  const top = lerp(480, 262, fill);
  const cremaH = 38 * crema;
  const strands = [
    { x: 225, ph: 0 },
    { x: 300, ph: 2.1 },
    { x: 375, ph: 4.2 },
  ];
  return (
    <svg width={width} height={(width * 560) / 600} viewBox="0 0 600 560" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="cupClip">
          <path d={BODY} />
        </clipPath>
        <linearGradient id="coffeeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a2f17" />
          <stop offset="1" stopColor="#2a1409" />
        </linearGradient>
        <linearGradient id="cremaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2b56e" />
          <stop offset="1" stopColor="#c8782f" />
        </linearGradient>
      </defs>
      {/* tabak */}
      <ellipse cx="300" cy="498" rx="255" ry="32" fill={C.panel} stroke={C.cream} strokeWidth="6" />
      <ellipse cx="300" cy="492" rx="130" ry="14" fill="rgba(0,0,0,0.35)" />
      {/* kulp */}
      <path d="M498,285 C595,272 595,392 468,412" fill="none" stroke={C.cream} strokeWidth="20" strokeLinecap="round" />
      {/* gövde */}
      <path d={BODY} fill="rgba(243,229,208,0.07)" />
      <g clipPath="url(#cupClip)">
        {fill > 0.001 && (
          <>
            <rect x="90" y={top} width="420" height="260" fill="url(#coffeeG)" />
            {crema > 0.001 && <rect x="90" y={top} width="420" height={cremaH + 12} fill="url(#cremaG)" />}
            <ellipse cx="300" cy={top} rx="215" ry="15" fill={crema > 0.05 ? "#f5c386" : "#6a3a1d"} />
          </>
        )}
      </g>
      <path d={BODY} fill="none" stroke={C.cream} strokeWidth="9" strokeLinejoin="round" />
      <ellipse cx="300" cy="240" rx="200" ry="24" fill="none" stroke={C.cream} strokeWidth="9" />
      {/* buhar */}
      {steam > 0.01 &&
        strands.map((s, k) => {
          const pts: string[] = [];
          for (let i = 0; i <= 20; i++) {
            const y = 205 - i * 9;
            const x = s.x + Math.sin(frame * 0.11 + i * 0.42 + s.ph) * (8 + i * 1.1);
            pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y}`);
          }
          return (
            <path
              key={k}
              d={pts.join(" ")}
              fill="none"
              stroke={C.cream}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray="70 46"
              strokeDashoffset={-frame * 2.2 - k * 30}
              opacity={steam * 0.55}
            />
          );
        })}
    </svg>
  );
};

/* ------------------------------------------------------------------ GÖSTERGE */
// 0-9 bar, 220° tarama. Açı 12 yönünden saat yönünde ölçülür.
const A0 = -110;
const A1 = 110;
const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;
};
const arc = (cx: number, cy: number, r: number, d0: number, d1: number) => {
  const [x0, y0] = pt(cx, cy, r, d0);
  const [x1, y1] = pt(cx, cy, r, d1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
};

export const Gauge: React.FC<{ value: number; max?: number }> = ({ value, max = 9 }) => {
  const cx = 250;
  const cy = 235;
  const r = 185;
  const ang = lerp(A0, A1, value / max);
  const done = value >= max - 0.05;
  const [nx, ny] = pt(cx, cy, r - 28, ang);
  return (
    <svg width={500} height={420} viewBox="0 0 500 420">
      <path d={arc(cx, cy, r, A0, A1)} fill="none" stroke={C.track} strokeWidth="26" strokeLinecap="round" />
      {value > 0.02 && (
        <path d={arc(cx, cy, r, A0, ang)} fill="none" stroke={C.caramel} strokeWidth="26" strokeLinecap="round" />
      )}
      {Array.from({ length: max + 1 }, (_, i) => {
        const a = lerp(A0, A1, i / max);
        const [x0, y0] = pt(cx, cy, r - 24, a);
        const [x1, y1] = pt(cx, cy, r - 40, a);
        const [tx, ty] = pt(cx, cy, r + 38, a);
        return (
          <g key={i}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.cream} strokeWidth="4" opacity="0.7" />
            <text x={tx} y={ty + 10} textAnchor="middle" fill={C.cream} fontFamily={FONT} fontWeight={700} fontSize="30" opacity="0.85">
              {i}
            </text>
          </g>
        );
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.cream} strokeWidth="9" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="16" fill={C.caramel} stroke={C.cream} strokeWidth="5" />
      <text x={cx} y={cy + 118} textAnchor="middle" fill={done ? C.caramel : C.cream} fontFamily={FONT} fontWeight={900} fontSize="112" style={{ fontVariantNumeric: "tabular-nums" }}>
        {done ? "9" : value.toFixed(1).replace(".", ",")}
      </text>
      <text x={cx} y={cy + 168} textAnchor="middle" fill={C.mute} fontFamily={FONT} fontWeight={700} fontSize="38" letterSpacing="6">
        BAR
      </text>
    </svg>
  );
};

/* ------------------------------------------------------------------ ZAMAN ÇİZGİSİ */
export const MILESTONES = [1884, 1901, 1905, 1948, 1961];
const T0 = 1878;
const T1 = 1968;

export const Timeline: React.FC<{ year: number }> = ({ year }) => {
  const w = 840;
  const y = 80;
  const x = (yr: number) => ((yr - T0) / (T1 - T0)) * w;
  const cur = Math.min(Math.max(year, T0), T1);
  return (
    <svg width={w} height={150} viewBox={`0 0 ${w} 150`}>
      <line x1={0} y1={y} x2={w} y2={y} stroke={C.track} strokeWidth="10" strokeLinecap="round" />
      <line x1={0} y1={y} x2={x(cur)} y2={y} stroke={C.caramel} strokeWidth="10" strokeLinecap="round" />
      {Array.from({ length: 10 }, (_, i) => T0 + 2 + i * 9).map((t) => (
        <line key={t} x1={x(t)} y1={y - 9} x2={x(t)} y2={y + 9} stroke={C.cream} strokeWidth="2" opacity="0.25" />
      ))}
      {MILESTONES.map((m, i) => {
        const passed = year >= m - 0.5;
        const up = i % 2 === 1;
        return (
          <g key={m} opacity={passed ? 1 : 0.6}>
            <circle cx={x(m)} cy={y} r={passed ? 12 : 10} fill={passed ? C.caramel : C.bg} stroke={passed ? C.cream : C.cream} strokeWidth="4" />
            <text x={x(m)} y={up ? y - 32 : y + 52} textAnchor="middle" fill={passed ? C.cream : C.mute} fontFamily={FONT} fontWeight={800} fontSize="30">
              {m}
            </text>
          </g>
        );
      })}
      <circle cx={x(cur)} cy={y} r="9" fill={C.cream} />
    </svg>
  );
};

/* ------------------------------------------------------------------ KAZAN (1884) */
export const Boiler: React.FC<{ frame: number; steam: number }> = ({ frame, steam }) => {
  const puffs = [0, 1, 2];
  return (
    <svg width={520} height={340} viewBox="0 0 520 340">
      {/* ayaklar */}
      <rect x="110" y="270" width="18" height="50" fill={C.cream} />
      <rect x="392" y="270" width="18" height="50" fill={C.cream} />
      {/* gövde + kubbe */}
      <rect x="80" y="130" width="360" height="150" rx="40" fill={C.panel} stroke={C.cream} strokeWidth="8" />
      <path d="M200,130 C200,70 320,70 320,130" fill={C.panel} stroke={C.cream} strokeWidth="8" />
      {/* perçinler */}
      {[130, 190, 250, 310, 370].map((cx) => (
        <circle key={cx} cx={cx} cy={250} r="7" fill={C.caramel} />
      ))}
      {/* manometre */}
      <circle cx="140" cy="190" r="36" fill={C.bg} stroke={C.caramel} strokeWidth="7" />
      <line x1="140" y1="190" x2={140 + 24 * Math.sin(0.9 + steam * 0.9)} y2={190 - 24 * Math.cos(0.9 + steam * 0.9)} stroke={C.cream} strokeWidth="5" strokeLinecap="round" />
      {/* musluk */}
      <path d="M440,200 L490,200 L490,250" fill="none" stroke={C.cream} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      {/* buhar */}
      {puffs.map((p) => {
        const t = ((frame * 0.03 + p / 3) % 1);
        return (
          <circle key={p} cx={260 + Math.sin(frame * 0.1 + p * 2) * 18} cy={70 - t * 60} r={10 + t * 16} fill={C.cream} opacity={steam * (1 - t) * 0.5} />
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ ŞİMŞEK */
export const Bolt: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 100 140">
    <polygon points="58,0 10,78 44,78 34,140 90,54 54,54" fill={C.caramel} stroke={C.cream} strokeWidth="4" strokeLinejoin="round" />
  </svg>
);
