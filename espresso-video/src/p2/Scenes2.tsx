import React from "react";
import { Easing, interpolate } from "remotion";
import { GROTESK, INTER, P, ZW, amberText, glass, rng, sp } from "./theme";
import { SceneTiming, clamp01, we, wf } from "./layers";

type SP = { frame: number; sc: SceneTiming };
const durF = (sc: SceneTiming) => Math.round(sc.dur * 30);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const trNum = (v: number, d = 1) => v.toFixed(d).replace(".", ",");

const Chip: React.FC<{ children: React.ReactNode; s: number; style?: React.CSSProperties }> = ({ children, s, style }) => (
  <div
    style={{
      ...glass(40),
      position: "absolute",
      padding: "10px 22px",
      fontFamily: GROTESK,
      fontWeight: 700,
      fontSize: 30,
      color: P.white,
      whiteSpace: "nowrap",
      opacity: clamp01(s * 1.4),
      transform: `scale(${0.5 + 0.5 * s})`,
      ...style,
    }}
  >
    {children}
  </div>
);

/* =============================================================== 1. KANCA */
// Parlayan damla düşer, çarpar; ekran dijital arayüze dönüşür.
export const Hook2: React.FC<SP> = ({ frame }) => {
  const IMP = 20; // çarpma karesi
  const cx = ZW / 2;
  const cy = 430; // bölge içi çarpma noktası (mutlak y ≈ 910)
  const fall = clamp01(frame / IMP);
  const dropY = lerp(-120, cy - 70, fall * fall);
  const after = frame - IMP;
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 15; r++)
    for (let c = 0; c < 16; c++) {
      const x = 26 + c * 52.5;
      const y = 40 + r * 54;
      const d = Math.hypot(x - cx, y - cy);
      const front = after * 34;
      const lit = after > 0 && d < front;
      const glow = lit ? Math.max(0, 1 - (front - d) / 260) : 0;
      dots.push(
        <circle key={`${r}-${c}`} cx={x} cy={y} r={lit ? 3.2 + glow * 3 : 2} fill={glow > 0.15 ? P.amberHi : lit ? "rgba(250,250,250,0.55)" : "rgba(250,250,250,0.12)"} />,
      );
    }
  const hudS = sp(frame, IMP + 2);
  const chips = [
    { t: "9 bar", x: 40, y: 150 },
    { t: "93 °C", x: 600, y: 120 },
    { t: "TDS %10", x: 20, y: 600 },
    { t: "EY %20", x: 590, y: 610 },
    { t: "18 g → 36 g", x: 270, y: 735 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={ZW} height={820} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {dots}
        {after > 0 &&
          [0, 1, 2].map((k) => {
            const rr = Math.max(0, (after - k * 5) * 16);
            return <circle key={k} cx={cx} cy={cy} r={rr} fill="none" stroke={P.amberHi} strokeWidth={3} opacity={clamp01(1 - rr / 520) * 0.9} />;
          })}
        {after > 0 && (
          <g transform={`translate(${cx},${cy}) rotate(${frame * 1.2}) scale(${hudS})`} opacity={0.85}>
            <circle r={170} fill="none" stroke="rgba(250,250,250,0.35)" strokeWidth={1.5} />
            <circle r={150} fill="none" stroke={P.amberHi} strokeWidth={3} strokeDasharray="6 14" />
            {Array.from({ length: 36 }, (_, i) => (
              <line key={i} x1={0} y1={-188} x2={0} y2={i % 3 === 0 ? -204 : -196} stroke="rgba(250,250,250,0.6)" strokeWidth={2} transform={`rotate(${i * 10})`} />
            ))}
          </g>
        )}
      </svg>
      {frame < IMP + 3 && (
        <svg width={120} height={160} viewBox="0 0 120 160" style={{ position: "absolute", left: cx - 60, top: dropY, filter: `drop-shadow(0 0 28px ${P.amberHi})`, opacity: frame < IMP ? 1 : 1 - (frame - IMP) / 3 }}>
          <defs>
            <radialGradient id="dropG" cx="40%" cy="62%" r="60%">
              <stop offset="0" stopColor="#FFE3A3" />
              <stop offset="0.45" stopColor={P.amberHi} />
              <stop offset="1" stopColor={P.rust} />
            </radialGradient>
          </defs>
          <path d="M60,6 C60,6 104,70 104,104 A44,44 0 0 1 16,104 C16,70 60,6 60,6 Z" fill="url(#dropG)" />
          <ellipse cx="44" cy="96" rx="9" ry="16" fill="rgba(255,255,255,0.55)" />
        </svg>
      )}
      {after > 0 && (
        <div style={{ position: "absolute", left: cx - 120, top: cy - 60, width: 240, textAlign: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: 92, color: P.white, opacity: hudS, transform: `scale(${0.6 + 0.4 * hudS})`, textShadow: `0 0 30px ${P.amberHi}` }}>
          2.0
        </div>
      )}
      {chips.map((c, i) => (
        <Chip key={c.t} s={sp(frame, IMP + 6 + i * 4)} style={{ left: c.x, top: c.y + Math.sin((frame + i * 20) / 18) * 6 }}>
          {c.t}
        </Chip>
      ))}
    </div>
  );
};

/* =============================================================== 2. ÇIKARIM ORANI */
// Lazer taraması: dokunduğu partiküllerin tam %20'si "çözünen" olarak kehribar parlar.
const EY_COLS = 20;
const EY_ROWS = 11;
const EY_N = EY_COLS * EY_ROWS; // 220
const EY_PARTS = (() => {
  const r = rng(7);
  const arr = Array.from({ length: EY_N }, (_, i) => {
    const c = i % EY_COLS;
    const row = Math.floor(i / EY_COLS);
    return { x: 42 + c * 39.6 + (r() - 0.5) * 14, y: 46 + row * 30 + (r() - 0.5) * 12, rad: 5 + r() * 3, k: r() };
  });
  // tam %20'sini (44 adet) çözünen olarak işaretle
  const order = arr.map((p, i) => ({ i, k: p.k })).sort((a, b) => a.k - b.k);
  const sol = new Set(order.slice(0, Math.round(EY_N * 0.2)).map((o) => o.i));
  return arr.map((p, i) => ({ ...p, sol: sol.has(i) }));
})();

export const EY: React.FC<SP> = ({ frame, sc }) => {
  const a = wf(sc, 3);
  const b = Math.max(a + 30, we(sc, 8) - 4);
  const lx = interpolate(frame, [a, b], [-20, 860], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const scanned = EY_PARTS.filter((p) => p.sol && p.x < lx).length;
  const ey = (scanned / EY_N) * 100;
  const done = lx >= 850;
  const panel = sp(frame, 2);
  const lower = sp(frame, 8);
  const mx = (Math.max(14, Math.min(26, ey < 1 ? 14 : ey)) - 14) / 12;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ ...glass(28), position: "absolute", left: 0, top: 0, width: ZW, height: 400, overflow: "hidden", opacity: panel, transform: `scale(${0.9 + 0.1 * panel})` }}>
        <svg width={ZW} height={400}>
          <defs>
            <linearGradient id="laser" x1="0" x2="1">
              <stop offset="0" stopColor={P.amberHi} stopOpacity="0" />
              <stop offset="0.85" stopColor={P.amberHi} stopOpacity="0.35" />
              <stop offset="1" stopColor="#fff" stopOpacity="1" />
            </linearGradient>
          </defs>
          {EY_PARTS.map((p, i) => {
            const hit = p.x < lx;
            const fresh = hit ? clamp01(1 - (lx - p.x) / 160) : 0;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={p.rad + (hit && p.sol ? 2 + fresh * 4 : 0)}
                fill={!hit ? P.dim : p.sol ? P.amberHi : "rgba(250,250,250,0.42)"}
                style={hit && p.sol ? { filter: `drop-shadow(0 0 ${6 + fresh * 10}px ${P.amberHi})` } : undefined}
              />
            );
          })}
          {lx > 0 && lx < 850 && (
            <>
              <rect x={lx - 120} y={0} width={120} height={360} fill="url(#laser)" opacity={0.5} />
              <rect x={lx - 2} y={0} width={4} height={360} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${P.amberHi})` }} />
            </>
          )}
          <g fontFamily={INTER} fontSize={22} fontWeight={600}>
            <circle cx={36} cy={378} r={7} fill={P.amberHi} />
            <text x={52} y={385} fill={P.white}>çözünen ~%20</text>
            <circle cx={240} cy={378} r={7} fill="rgba(250,250,250,0.42)" />
            <text x={256} y={385} fill={P.silver}>kalan kahve</text>
          </g>
        </svg>
      </div>
      <div style={{ position: "absolute", top: 430, left: 0, width: ZW, opacity: lower, transform: `translateY(${(1 - lower) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 30, color: P.silver, lineHeight: 1.3 }}>
            Çıkarım oranı
            <br />
            <span style={{ fontFamily: GROTESK, color: P.white }}>EY</span>
          </div>
          <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 168, lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", color: P.white }}>
            <span style={amberText}>%</span>
            {done ? "20" : trNum(ey)}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 26, height: 34, borderRadius: 17, overflow: "hidden", display: "flex" }}>
          <div style={{ flex: 4, background: "rgba(224,93,54,0.35)" }} />
          <div style={{ flex: 4, background: "rgba(52,211,153,0.55)" }} />
          <div style={{ flex: 4, background: "rgba(224,93,54,0.35)" }} />
        </div>
        <div style={{ position: "absolute", top: 214, left: mx * ZW - 14, width: 28, height: 44, borderRadius: 8, background: P.white, boxShadow: `0 0 18px ${P.white}` }} />
        <div style={{ display: "flex", marginTop: 14, fontFamily: INTER, fontWeight: 600, fontSize: 24, color: P.silver }}>
          <div style={{ flex: 4 }}>az · ekşi</div>
          <div style={{ flex: 4, textAlign: "center", color: P.green }}>%18–22 ideal</div>
          <div style={{ flex: 4, textAlign: "right" }}>aşırı · acı</div>
        </div>
      </div>
    </div>
  );
};

/* =============================================================== 3. FORMÜL */
const Tile: React.FC<{ s: number; label: string; sub: string; value: string; big?: boolean }> = ({ s, label, sub, value, big }) => (
  <div
    style={{
      ...glass(26),
      height: big ? 160 : 116,
      padding: "0 34px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      opacity: clamp01(s * 1.4),
      transform: `translateY(${(1 - s) * 50}px) scale(${0.85 + 0.15 * s})`,
      ...(big ? { border: `1px solid ${P.green}`, boxShadow: `0 0 50px rgba(52,211,153,0.35), inset 0 1px 0 rgba(255,255,255,0.3)` } : {}),
    }}
  >
    <div>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: big ? 38 : 34, color: P.white }}>{label}</div>
      <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 23, color: P.silver, marginTop: 2 }}>{sub}</div>
    </div>
    <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: big ? 110 : 76, letterSpacing: "-0.03em", color: big ? P.green : P.white, textShadow: big ? `0 0 30px rgba(52,211,153,0.6)` : undefined }}>
      {value}
    </div>
  </div>
);
const Op: React.FC<{ s: number; ch: string }> = ({ s, ch }) => (
  <div style={{ height: 56, textAlign: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: 50, lineHeight: "56px", opacity: s, ...amberText }}>{ch}</div>
);

export const Formula: React.FC<SP> = ({ frame, sc }) => {
  const t1 = wf(sc, 2);
  const t2 = wf(sc, 4);
  const t3 = wf(sc, 7);
  const t4 = wf(sc, 10);
  return (
    <div style={{ position: "absolute", inset: 0, paddingTop: 10 }}>
      <Tile s={sp(frame, t1 - 3)} label="TDS" sub="fincandaki çözünmüş madde" value="%10" />
      <Op s={sp(frame, t2 - 5)} ch="×" />
      <Tile s={sp(frame, t2 - 3)} label="İçecek" sub="fincandaki espresso" value="36 g" />
      <Op s={sp(frame, t3 - 5)} ch="÷" />
      <Tile s={sp(frame, t3 - 3)} label="Kahve" sub="öğütülmüş doz" value="18 g" />
      <Op s={sp(frame, t4 - 6)} ch="=" />
      <Tile s={sp(frame, t4 - 3)} label="Çıkarım (EY)" sub="ideal aralık %18–22" value="%20" big />
    </div>
  );
};

/* =============================================================== 4. BASINÇ PROFİLİ */
// Örnek profil: yavaş ıslatma ~2 bar → zirve 9 bar → yumuşak düşüş ~6 bar (30 sn)
const smooth = (x: number) => x * x * (3 - 2 * x);
const profile = (t: number) => {
  if (t < 1) return 2 * t;
  if (t < 7) return 2;
  if (t < 10) return 2 + 7 * smooth((t - 7) / 3);
  if (t < 13) return 9;
  return 9 - 3 * smooth(Math.min(1, (t - 13) / 17));
};
const classic = (t: number) => (t < 1.5 ? 9 * smooth(t / 1.5) : 9);
const PX0 = 86;
const PX1 = 800;
const PY0 = 470; // 0 bar
const PBAR = 44; // px / bar
const px = (t: number) => PX0 + (t / 30) * (PX1 - PX0);
const py = (b: number) => PY0 - b * PBAR;
const pathTo = (fn: (t: number) => number, tEnd: number) => {
  const pts: string[] = [];
  const n = Math.max(2, Math.round(tEnd * 6));
  for (let i = 0; i <= n; i++) {
    const t = (tEnd * i) / n;
    pts.push(`${i ? "L" : "M"}${px(t).toFixed(1)},${py(fn(t)).toFixed(1)}`);
  }
  return pts.join(" ");
};

export const Pressure: React.FC<SP> = ({ frame, sc }) => {
  const panel = sp(frame, 2);
  const cEnd = interpolate(frame, [wf(sc, 0), we(sc, 5)], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const k0 = wf(sc, 6);
  const k1 = Math.max(k0 + 10, we(sc, 11));
  const k2 = Math.max(k1 + 8, we(sc, 12));
  const k3 = Math.max(k2 + 10, durF(sc) - 6);
  const tEnd = interpolate(frame, [k0, k1, k2, k3], [0, 7, 12, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar = profile(tEnd);
  const head = frame >= k0;
  const lab = (t: number) => sp(frame, interpolate(t, [0, 7, 12, 30], [k0, k1, k2, k3]));
  return (
    <div style={{ ...glass(30), position: "absolute", left: 0, top: 0, width: ZW, height: 650, opacity: panel, transform: `scale(${0.9 + 0.1 * panel})` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 30px 0" }}>
        <div style={{ fontFamily: GROTESK, fontWeight: 600, fontSize: 24, letterSpacing: "0.14em", color: P.silver }}>ÖRNEK PROFİL</div>
        <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 40, color: P.white, fontVariantNumeric: "tabular-nums", opacity: head ? 1 : 0.35 }}>
          <span style={amberText}>{trNum(head ? bar : 0)}</span> bar · {Math.round(tEnd)} sn
        </div>
      </div>
      <svg width={ZW} height={600} style={{ position: "absolute", top: 80, left: 0 }}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.amberHi} stopOpacity="0.35" />
            <stop offset="1" stopColor={P.amberHi} stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        {[0, 3, 6, 9].map((b) => (
          <g key={b}>
            <line x1={PX0} x2={PX1} y1={py(b)} y2={py(b)} stroke="rgba(255,255,255,0.10)" strokeWidth={1.5} />
            <text x={PX0 - 18} y={py(b) + 9} textAnchor="end" fontFamily={GROTESK} fontWeight={600} fontSize={26} fill={P.silver}>{b}</text>
          </g>
        ))}
        {[0, 10, 20, 30].map((t) => (
          <text key={t} x={px(t)} y={PY0 + 44} textAnchor="middle" fontFamily={GROTESK} fontWeight={600} fontSize={24} fill={P.silver}>{t} sn</text>
        ))}
        <text x={PX0 - 18} y={py(10) + 2} textAnchor="end" fontFamily={INTER} fontWeight={600} fontSize={22} fill={P.silver}>bar</text>
        {/* klasik sabit 9 bar */}
        {cEnd > 0 && <path d={pathTo(classic, cEnd)} fill="none" stroke="rgba(250,250,250,0.55)" strokeWidth={4} strokeDasharray="12 10" />}
        {cEnd > 4 && (
          <text x={px(Math.min(cEnd, 30))} y={py(9) - 18} textAnchor="end" fontFamily={INTER} fontWeight={700} fontSize={24} fill={P.white} opacity={0.8}>
            klasik pompa · sabit 9 bar
          </text>
        )}
        {/* profil */}
        {head && tEnd > 0.05 && (
          <>
            <path d={`${pathTo(profile, tEnd)} L${px(tEnd)},${PY0} L${PX0},${PY0} Z`} fill="url(#area)" />
            <path d={pathTo(profile, tEnd)} fill="none" stroke={P.amberHi} strokeWidth={16} opacity={0.45} filter="url(#glow)" />
            <path d={pathTo(profile, tEnd)} fill="none" stroke={P.amberHi} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={px(tEnd)} cy={py(bar)} r={14 + 8 * ((frame % 20) / 20)} fill="none" stroke="#fff" strokeWidth={2} opacity={1 - (frame % 20) / 20} />
            <circle cx={px(tEnd)} cy={py(bar)} r={10} fill="#fff" style={{ filter: `drop-shadow(0 0 12px ${P.amberHi})` }} />
          </>
        )}
        <g fontFamily={INTER} fontWeight={700} fontSize={26}>
          <text x={px(1.8)} y={py(2) + 40} textAnchor="start" fill={P.white} opacity={lab(3.5)}>yavaş ıslatma</text>
          <text x={px(11.5)} y={py(9) + 54} textAnchor="middle" fill={P.white} opacity={lab(10.5)}>zirve</text>
          <text x={px(23)} y={py(profile(23)) + 56} textAnchor="middle" fill={P.white} opacity={lab(20)}>yumuşak düşüş</text>
        </g>
      </svg>
    </div>
  );
};

/* =============================================================== 5. WDT */
const W_COLS = 16;
const W_ROWS = 8;
const BX0 = 60;
const BX1 = 780;
const BY0 = 250;
const BY1 = 560;
const CHX = 520; // kanal x
const WDT_PARTS = (() => {
  const r = rng(11);
  const centers = [
    [180, 330],
    [330, 470],
    [420, 300],
    [650, 360],
    [700, 500],
  ];
  const cols = ["#8B5A3C", "#A0673F", "#6B3E25", "#B07A4A"];
  return Array.from({ length: W_COLS * W_ROWS }, (_, i) => {
    const c = i % W_COLS;
    const row = Math.floor(i / W_COLS);
    const gx = BX0 + 30 + c * ((BX1 - BX0 - 60) / (W_COLS - 1));
    const gy = BY0 + 26 + row * ((BY1 - BY0 - 52) / (W_ROWS - 1));
    let x = gx + (r() - 0.5) * 40;
    let y = gy + (r() - 0.5) * 34;
    const cc = centers[Math.floor(r() * centers.length)];
    x = lerp(x, cc[0], 0.35);
    y = lerp(y, cc[1], 0.35);
    if (Math.abs(x - CHX) < 40) x = CHX + Math.sign(x - CHX || 1) * (40 + r() * 20);
    return { gx, gy, x, y, col: cols[Math.floor(r() * cols.length)] };
  });
})();

export const WDT: React.FC<SP> = ({ frame, sc }) => {
  const panel = sp(frame, 2);
  const n0 = wf(sc, 9);
  const NS = 42; // iğne süpürme süresi
  const needleX = interpolate(frame, [n0, n0 + NS], [BX0 - 40, BX1 + 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const sweeping = frame >= n0 && frame <= n0 + NS + 4;
  const even = sp(frame, n0 + NS - 4);
  const chaos = 1 - clamp01((frame - (n0 + NS - 8)) / 10);
  const chipK = sp(frame, wf(sc, 7) - 2);
  const flow = (frame * 6) % 60;
  return (
    <div style={{ ...glass(30), position: "absolute", left: 0, top: 0, width: ZW, height: 690, opacity: panel, transform: `scale(${0.9 + 0.1 * panel})`, overflow: "hidden" }}>
      <svg width={ZW} height={690}>
        <defs>
          <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.water} stopOpacity="0.9" />
            <stop offset="1" stopColor={P.water} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <text x={BX0} y={70} fontFamily={GROTESK} fontWeight={600} fontSize={24} letterSpacing="3" fill={P.silver}>SU ↓</text>
        {/* üstten gelen su damlaları */}
        {Array.from({ length: 12 }, (_, i) => {
          const sx = BX0 + 40 + i * 58;
          const ph = ((frame * 2.2 + i * 17) % 60) / 60;
          const x = lerp(sx, CHX, ph * ph * chaos); // kaos: damlalar kanala yönelir; WDT sonrası düz iner
          return <ellipse key={i} cx={x} cy={100 + ph * 140} rx={5} ry={9} fill={P.water} opacity={0.75 * (1 - ph * 0.4)} />;
        })}
        {/* sepet */}
        <path d={`M${BX0},${BY0 - 20} L${BX0},${BY1} Q${BX0},${BY1 + 24} ${BX0 + 24},${BY1 + 24} L${BX1 - 24},${BY1 + 24} Q${BX1},${BY1 + 24} ${BX1},${BY1} L${BX1},${BY0 - 20}`} fill="rgba(255,255,255,0.03)" stroke="rgba(250,250,250,0.35)" strokeWidth={3} />
        {/* eşit akış çizgileri */}
        {even > 0.02 &&
          Array.from({ length: 13 }, (_, i) => {
            const x = BX0 + 40 + i * ((BX1 - BX0 - 80) / 12);
            return <line key={i} x1={x} x2={x} y1={BY0} y2={BY1 + 30} stroke={P.water} strokeWidth={4} strokeDasharray="18 22" strokeDashoffset={-flow} opacity={0.5 * clamp01(even)} />;
          })}
        {/* kanal */}
        {chaos > 0.01 && (
          <g opacity={chaos}>
            <rect x={CHX - 12} y={BY0 - 10} width={24} height={BY1 - BY0 + 90} rx={12} fill="url(#wat)" style={{ filter: `drop-shadow(0 0 18px ${P.water})` }} />
            <line x1={CHX} x2={CHX} y1={BY0} y2={BY1 + 80} stroke="#fff" strokeWidth={4} strokeDasharray="14 18" strokeDashoffset={-flow * 2} />
          </g>
        )}
        {/* partiküller */}
        {WDT_PARTS.map((p, i) => {
          const pass = n0 + ((p.x - (BX0 - 40)) / (BX1 - BX0 + 80)) * NS;
          const s = sp(frame, pass);
          return <circle key={i} cx={lerp(p.x, p.gx, s)} cy={lerp(p.y, p.gy, s)} r={11} fill={p.col} stroke="rgba(0,0,0,0.35)" strokeWidth={1.5} />;
        })}
        {/* WDT iğneleri */}
        {sweeping && (
          <g transform={`translate(${needleX},0)`}>
            <rect x={-46} y={BY0 - 96} width={92} height={40} rx={12} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
            {[-28, -14, 0, 14, 28].map((dx) => (
              <line key={dx} x1={dx} x2={dx} y1={BY0 - 56} y2={BY1 - 6} stroke="#E4E4E7" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 6px #fff)" }} />
            ))}
          </g>
        )}
      </svg>
      <Chip s={chipK * (1 - sp(frame, n0 - 4))} style={{ left: CHX + 40, top: 110, borderColor: P.water }}>
        <span style={{ color: P.water }}>●</span> kanal
      </Chip>
      <Chip s={sp(frame, n0 + 2) * (sweeping ? 1 : 0.0001)} style={{ left: 40, top: 610, fontSize: 26 }}>
        WDT iğnesi · 0,1–0,5 mm
      </Chip>
      <Chip s={even} style={{ left: 40, top: 610, fontSize: 28, borderColor: P.green }}>
        <span style={{ color: P.green }}>●</span> eşit yoğunluk · eşit akış
      </Chip>
    </div>
  );
};

/* =============================================================== 6. KAPANIŞ */
export const Outro2: React.FC<SP> = ({ frame, sc }) => {
  const cx = ZW / 2;
  const cupTop = 250;
  const imp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const items = [
    { t: "EY %20", x: 30, y: 40 },
    { t: "9 bar", x: 640, y: 20 },
    { t: "TDS %10", x: 0, y: 520 },
    { t: "WDT", x: 680, y: 560 },
    { t: "93 °C", x: 330, y: 0 },
  ];
  const cup = sp(frame, 12);
  const cta = sp(frame, wf(sc, 7) - 2);
  const steam = ["%20", "9 bar", "93°", "1:2", "18 g", "30 sn"];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {imp < 1 &&
        items.map((it) => (
          <div
            key={it.t}
            style={{
              ...glass(40),
              position: "absolute",
              left: lerp(it.x, cx - 60, imp),
              top: lerp(it.y, cupTop + 160, imp),
              padding: "10px 22px",
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 30,
              color: P.white,
              opacity: 1 - imp,
              transform: `scale(${1 - imp})`,
            }}
          >
            {it.t}
          </div>
        ))}
      <div style={{ position: "absolute", left: cx - 330, top: cupTop - 40, width: 660, height: 560, background: `radial-gradient(circle at 50% 55%, rgba(255,176,32,${0.35 * cup}), transparent 65%)` }} />
      <svg width={520} height={440} viewBox="0 0 520 440" style={{ position: "absolute", left: cx - 260, top: cupTop, transform: `scale(${0.4 + 0.6 * cup})`, opacity: clamp01(cup * 1.5), overflow: "visible" }}>
        <defs>
          <linearGradient id="liq2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7A3E1C" />
            <stop offset="1" stopColor="#2A1208" />
          </linearGradient>
          <linearGradient id="crema2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD08A" />
            <stop offset="1" stopColor={P.amber} />
          </linearGradient>
          <clipPath id="cup2">
            <path d="M80,90 L440,90 C440,250 380,330 260,330 C140,330 80,250 80,90 Z" />
          </clipPath>
        </defs>
        <ellipse cx={260} cy={360} rx={230} ry={30} fill="rgba(255,255,255,0.05)" stroke="rgba(250,250,250,0.6)" strokeWidth={3} />
        <path d="M436,130 C520,120 520,240 410,262" fill="none" stroke={P.white} strokeWidth={14} strokeLinecap="round" />
        <g clipPath="url(#cup2)">
          <rect x={60} y={112} width={400} height={240} fill="url(#liq2)" />
          <rect x={60} y={112} width={400} height={34} fill="url(#crema2)" />
          <ellipse cx={260} cy={112} rx={190} ry={14} fill="#FFE2B0" />
        </g>
        <path d="M80,90 L440,90 C440,250 380,330 260,330 C140,330 80,250 80,90 Z" fill="rgba(255,255,255,0.06)" stroke={P.white} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={260} cy={90} rx={180} ry={20} fill="none" stroke={P.white} strokeWidth={7} />
      </svg>
      {cup > 0.5 &&
        steam.map((s, i) => {
          const ph = ((frame - 14 + i * 11) % 66) / 66;
          if (frame - 14 + i * 11 < 0) return null;
          return (
            <div
              key={s}
              style={{
                position: "absolute",
                left: cx - 60 + [-170, 150, -60, 60, -230, 220][i] + Math.sin(i * 2.1 + frame / 14) * 14,
                top: cupTop + 30 - ph * 190,
                width: 120,
                textAlign: "center",
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 32,
                color: i % 2 ? P.white : P.amberHi,
                opacity: Math.sin(ph * Math.PI) * 0.9,
                textShadow: `0 0 14px ${P.amberHi}`,
              }}
            >
              {s}
            </div>
          );
        })}
      <div style={{ position: "absolute", top: 690, left: 0, width: ZW, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            ...glass(60),
            padding: "22px 54px",
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 46,
            color: P.white,
            border: `1.5px solid ${P.amberHi}`,
            boxShadow: `0 0 40px rgba(255,176,32,0.45), inset 0 1px 0 rgba(255,255,255,0.4)`,
            opacity: clamp01(cta * 1.4),
            transform: `scale(${0.6 + 0.4 * cta})`,
          }}
        >
          <span style={amberText}>+</span> Takip et
        </div>
      </div>
    </div>
  );
};
