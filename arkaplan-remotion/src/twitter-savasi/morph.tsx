// Tek şekilli açılış: bir yüzey vuruş ızgarasında boyut, köşe yarıçapı ve renk değiştirir, içerik yer değiştirir.
// Bir imleç diziyi gerçek tıklama, yazma ve bir sürüklemeyle yürütür.
//
// Kurallar: her şey t'nin (saniye) saf fonksiyonu (draw(t)); CSS geçişi, zamanlayıcı ya da kareler arası durum yok.
// Yaylar kapalı formüllü (ζ = 0,8 → %1,5 aşma); bir değer birden çok kez hedef değiştirirse her değişiklik için
// bir yay toplanır. İçerik, kabı biçim değiştirmeye başladıktan sonra girer, sonraki biçim değişiminden önce çıkar.
// Vurgu rengi (mavi) hiçbir zaman zeminden solmaz: tek bir vurgu öğesi durumdan duruma taşınır.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../brand';
import {COORDS, SIDES} from '../data/twitter-savasi';
import {haversineKm} from './parts';

// --- yay matematiği ------------------------------------------------------------

const TAU = Math.PI * 2;

/** 0 → 1 kapalı formüllü sönümlü yay. */
const spring01 = (dt: number, freq = 2.4, zeta = 0.8) => {
  if (dt <= 0) return 0;
  const w = TAU * freq;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * dt) * (Math.cos(wd * dt) + ((zeta * w) / wd) * Math.sin(wd * dt));
};

type Key = [time: number, value: number];

/** Her hedef değişikliği için bir yay: v(t) = v0 + Σ (vᵢ − vᵢ₋₁)·yay(t − tᵢ). */
const track = (keys: Key[], t: number, freq = 2.4, zeta = 0.8) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring01(t - keys[i][0], freq, zeta);
  return v;
};

/**
 * Yöne duyarlı kenar izi: her değişiklikte hareket yönündeki kenar hızlı, arkadaki yavaş yayla gider;
 * böylece öğe kayarken gerinir. `side` −1 sol/üst kenar, +1 sağ/alt kenar.
 */
const edgeTrack = (keys: Key[], centers: number[], side: -1 | 1, t: number, fast = 4.8, slow = 3.0) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const dir = Math.sign(centers[i] - centers[i - 1]);
    const leading = dir === side;
    v += (keys[i][1] - keys[i - 1][1]) * spring01(t - keys[i][0], dir === 0 ? 2.4 : leading ? fast : slow);
  }
  return v;
};

const bump = (dt: number, width: number) => Math.exp(-((dt / width) ** 2));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

// --- durumlar ------------------------------------------------------------------

type RGB = [number, number, number];
const BLACK: RGB = [22, 22, 22];
const CREAM: RGB = [242, 238, 230];
const DARK: RGB = [31, 30, 29];

type Box = {x: number; y: number; w: number; h: number; r: number};
type State = {
  name: string;
  w: number;
  h: number;
  r: number;
  color: RGB;
  /** Vurgu öğesinin bu durumdaki yeri (şekil merkezine göre). */
  accent: Box;
  /** Kamera odağı ve çerçeveye sığdırılacak kutu. */
  focus?: {x: number; y: number; w: number; h: number};
};

const LOGO: State = {
  name: 'logo',
  w: 300,
  h: 300,
  r: 54,
  color: BLACK,
  accent: {x: 94, y: -94, w: 300, h: 300, r: 54},
  focus: {x: 47, y: -47, w: 394, h: 394},
};

const KM = Math.round(haversineKm(COORDS.istanbul, COORDS.pekin) / 10) * 10;
const VIEWS = 881700; // Çin Seddi/Patrick ekran görüntüsündeki görüntülenme (881,7 B, 20 Eki 2026)
const TYPED = 'başladı';
const MONO_W = 0.6; // JetBrains Mono karakter genişliği / punto

const STATES: State[] = [
  LOGO,
  {name: 'button', w: 780, h: 150, r: 75, color: CREAM, accent: {x: -390 + 75, y: 0, w: 64, h: 64, r: 32}},
  {name: 'field', w: 820, h: 180, r: 28, color: CREAM, accent: {x: -360 + 3, y: 22, w: 6, h: 66, r: 3}},
  {name: 'confirm', w: 820, h: 460, r: 44, color: CREAM, accent: {x: 410 - 60 - 120, y: 230 - 60 - 48, w: 240, h: 96, r: 48}},
  {name: 'loader', w: 280, h: 280, r: 140, color: DARK, accent: {x: 0, y: -84, w: 30, h: 30, r: 15}},
  {name: 'pin', w: 290, h: 290, r: 145, color: CREAM, accent: {x: 0, y: 92, w: 24, h: 24, r: 12}},
  {name: 'globe', w: 720, h: 720, r: 360, color: DARK, accent: {x: 0, y: -262, w: 26, h: 26, r: 13}},
  {name: 'matches', w: 880, h: 460, r: 48, color: CREAM, accent: {x: -330, y: 140, w: 64, h: 64, r: 32}},
  {name: 'tabs', w: 880, h: 190, r: 95, color: DARK, accent: {x: -215, y: 0, w: 400, h: 140, r: 70}},
  LOGO,
];

// --- yerleşim ------------------------------------------------------------------

export type MorphProps = {
  bpm: number;
  /** İlk vuruşun saniyesi; logo bu ana kadar durur. */
  offset: number;
  /** Çerçeve içinde sığdırma kutusu (px) ve merkezi. */
  fitW: number;
  fitH: number;
  cx: number;
  cy: number;
  /** Yükseklik/genişlik büyütme sınırı. */
  maxScale?: number;
};

/** Durum başlangıçları (sn): logo → … → logo. Eşleşme ve sekmeler ikişer vuruş sürer. */
export const morphTimes = (bpm: number, offset: number) => {
  const B = 60 / bpm;
  const at = [0, 0, 1, 2, 3, 4, 5, 6, 8, 10].map((n, i) => (i === 0 ? 0 : offset + n * B));
  return {B, at, end: at[at.length - 1] + B};
};

const colorAt = (t: number, at: number[]) =>
  [0, 1, 2]
    .map((c) => track(STATES.map((s, i) => [at[i], s.color[c]] as Key), t, 2.6))
    .map((v) => Math.round(Math.max(0, Math.min(255, v))));

/** İçerik görünürlüğü: kap biçim değiştirmeye başladıktan sonra girer, sonraki değişimden önce çıkar. */
const presence = (t: number, i: number, at: number[]) => {
  const start = i === 0 ? -1 : at[i] + 0.1;
  const end = i + 1 < at.length ? at[i + 1] - 0.07 : Infinity;
  return Math.min(smooth((t - start) / 0.1), smooth((end - t) / 0.07));
};

export const draw = (t: number, p: MorphProps) => {
  const {B, at} = morphTimes(p.bpm, p.offset);
  const n = STATES.length;
  const keys = (get: (s: State) => number) => STATES.map((s, i) => [at[i], get(s)] as Key);

  // Etkileşim anları
  const clickButton = at[1] + 0.72 * B;
  const typeStart = at[2] + 0.12;
  const clickYes = at[3] + 0.7 * B;
  const dragStart = at[7] + 0.5 * B;
  const dragMove = dragStart + 0.06;
  const dragEnd = dragMove + 0.5;
  const clickTab = at[8] + 0.8 * B;
  const press = (tc: number) => bump(t - tc - 0.04, 0.06);

  // Şekil
  const pressDip = 1 - 0.035 * (press(clickButton) + press(clickYes) + press(clickTab));
  const w = track(keys((s) => s.w), t) * pressDip;
  const h = track(keys((s) => s.h), t) * pressDip;
  const r = Math.min(track(keys((s) => s.r), t), w / 2, h / 2);
  const [cr, cg, cb] = colorAt(t, at);

  // Kamera: her durum çerçeveyi doldursun
  const fit = (s: State) => {
    const f = s.focus ?? {x: 0, y: 0, w: s.w, h: s.h};
    return Math.min(p.fitW / f.w, p.fitH / f.h, p.maxScale ?? 3);
  };
  const cam = track(keys(fit), t, 2.0);
  const camX = track(keys((s) => s.focus?.x ?? 0), t, 2.0);
  const camY = track(keys((s) => s.focus?.y ?? 0), t, 2.0);

  // Geçişlerde kısa bulanıklık
  const blur = at.slice(1).reduce((acc, a) => acc + 5 * bump(t - a - 0.07, 0.07), 0);

  // Vurgu öğesi: durum yerleri + sürükleme + sekme tıklaması. Sol/sağ kenar ayrı yaylarda (gerinme).
  const aBoxes: [number, Box][] = [
    ...STATES.map((st, i): [number, Box] => [at[i] + (i === 0 ? 0 : 0.03), st.accent]),
    [dragMove, {...STATES[7].accent, x: 330}] as [number, Box],
    // İmleç her harfte bir karakter ilerler (JetBrains Mono 60 px → 36 px)
    ...Array.from(TYPED, (_, k): [number, Box] => [typeStart + k * (B / 8) - 0.03, {...STATES[2].accent, x: -357 + (k + 1) * 60 * MONO_W + 5}]),
    [clickTab, {...STATES[8].accent, x: 215}] as [number, Box],
  ].sort((a, b) => a[0] - b[0]);
  const cx = aBoxes.map(([, b]) => b.x);
  const cyv = aBoxes.map(([, b]) => b.y);
  const L = edgeTrack(aBoxes.map(([tt, b]) => [tt, b.x - b.w / 2] as Key), cx, -1, t);
  const R = edgeTrack(aBoxes.map(([tt, b]) => [tt, b.x + b.w / 2] as Key), cx, 1, t);
  const T = edgeTrack(aBoxes.map(([tt, b]) => [tt, b.y - b.h / 2] as Key), cyv, -1, t);
  const Bm = edgeTrack(aBoxes.map(([tt, b]) => [tt, b.y + b.h / 2] as Key), cyv, 1, t);
  const ar = Math.min(track(aBoxes.map(([tt, b]) => [tt, b.r] as Key), t, 3.6), (R - L) / 2, (Bm - T) / 2);
  // Yükleniyor: vurgu noktası halka üzerinde döner; yarıçap yumuşakça açılıp kapanır (sıçrama yok).
  const ok = smooth((t - at[4] - 0.05) / 0.15) * smooth((at[5] - t) / 0.12);
  const ang = (t - at[4]) * TAU * 1.6;
  const accent = {
    x: (L + R) / 2 + Math.sin(ang) * 84 * ok,
    y: (T + Bm) / 2 + (84 - Math.cos(ang) * 84) * ok,
    w: R - L,
    h: Bm - T,
    r: ar,
  };
  // Logo durumunda vurgu karenin arkasında durur (marka logosu); diğer durumlarda önde.
  const accentBehind = t < at[1] + 0.05 || t >= at[n - 1] + 0.1;

  // İmleç (sahne koordinatı)
  const cursorKeysX: Key[] = [
    [0, 760], [at[1] + 0.12, 170], [at[2] + 0.1, 330], [at[3] + 0.2, accentOf(3).x + 40], [at[4] + 0.1, 560],
    [at[7] + 0.12, -330], [dragMove, 330], [at[8] + 0.12, 215], [at[9], 900],
  ];
  const cursorKeysY: Key[] = [
    [0, 980], [at[1] + 0.12, 34], [at[2] + 0.1, 150], [at[3] + 0.2, accentOf(3).y + 22], [at[4] + 0.1, 520],
    [at[7] + 0.12, 150], [dragStart, 150], [at[8] + 0.12, 26], [at[9], 1100],
  ];
  const cur = {x: track(cursorKeysX, t, 2.4), y: track(cursorKeysY, t, 2.4)};
  const clicks = [clickButton, clickYes, clickTab];
  const curScale = 1 - 0.16 * clicks.reduce((a, c) => a + bump(t - c, 0.05), 0) - 0.12 * smooth((t - dragStart) / 0.06) * smooth((dragEnd - t) / 0.06);
  const ripples = clicks.map((c) => ({c, k: (t - c) / 0.4})).filter((x) => x.k > 0 && x.k < 1);

  const vis = (i: number) => presence(t, i, at);
  const state = Math.max(0, at.filter((a) => a <= t).length - 1);

  return {t, B, at, w, h, r, color: `rgb(${cr},${cg},${cb})`, cam, camX, camY, blur, accent, accentBehind, cur, curScale, ripples, vis, state, typeStart, clickTab, p};
};

const accentOf = (i: number) => STATES[i].accent;

// --- içerik --------------------------------------------------------------------

const ink = COLORS.black;
const mono = (size: number, color: string = ink, weight = 700): React.CSSProperties => ({font: `${weight} ${size}px ${FONTS.mono}`, letterSpacing: '0.06em', color});
const sans = (size: number, color: string = ink, weight = 800): React.CSSProperties => ({font: `${weight} ${size}px/1.05 ${FONTS.sans}`, letterSpacing: '-0.02em', color});

const Layer: React.FC<{o: number; children: React.ReactNode; x?: number; y?: number}> = ({o, children, x = 0, y = 0}) =>
  o <= 0.001 ? null : (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, filter: `blur(${(1 - o) * 6}px)`, transform: `translateY(${(1 - o) * 10}px)`}}>{children}</div>
  );

/** Merkezlenmiş kutu: (x, y) merkezi, w genişliği. */
const At: React.FC<{x: number; y: number; w: number; align?: 'left' | 'center' | 'right'; children: React.ReactNode}> = ({x, y, w, align = 'center', children}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: 'translateY(-50%)', textAlign: align, whiteSpace: 'nowrap'}}>{children}</div>
);

const Globe: React.FC<{d: ReturnType<typeof draw>}> = ({d}) => {
  const {t, at} = d;
  const N = 240;
  const fill = smooth((t - at[6] - 0.08) / (at[7] - at[6] - 0.2));
  const dots: React.ReactNode[] = [];
  for (let k = 0; k < N; k++) {
    if (k / N > fill) break;
    const yy = 1 - (2 * (k + 0.5)) / N;
    const rad = Math.sqrt(1 - yy * yy);
    const th = k * 2.399963 + t * 0.7;
    const z = Math.sin(th) * rad;
    if (z < -0.15) continue;
    const pop = smooth((fill - k / N) * N / 6);
    const col = k % 3 === 0 ? SIDES.cn.color : k % 3 === 1 ? SIDES.tr.color : COLORS.cream;
    dots.push(<circle key={k} cx={Math.cos(th) * rad * 330} cy={yy * 330} r={(4 + 4 * (z + 1) / 2) * pop} fill={col} opacity={0.35 + 0.65 * (z + 1) / 2} />);
  }
  // Sayaç 1/8 vuruşta bir basamaklanır: alt karelerde rakamlar üst üste binmez.
  const step = d.B / 8;
  const tq = Math.floor(t / step) * step;
  const count = Math.round(VIEWS * smooth((tq - at[6] - 0.08) / (at[7] - at[6] - 0.15)));
  return (
    <>
      <svg width={720} height={720} viewBox="-360 -360 720 720" style={{position: 'absolute', left: -360, top: -360}}>
        <circle r={330} fill="none" stroke="rgba(242,238,230,0.18)" strokeWidth={2} />
        <ellipse rx={330} ry={110} fill="none" stroke="rgba(242,238,230,0.1)" strokeWidth={2} />
        <ellipse rx={140} ry={330} fill="none" stroke="rgba(242,238,230,0.1)" strokeWidth={2} />
        {dots}
      </svg>
      <At x={0} y={-20} w={640}>
        <div style={{...sans(112, COLORS.cream), fontVariantNumeric: 'tabular-nums', textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>{count.toLocaleString('tr-TR')}</div>
      </At>
      <At x={0} y={70} w={640}>
        <div style={{...mono(26, COLORS.cream), textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>GÖRÜNTÜLENME · TEK BİR TWEET</div>
      </At>
    </>
  );
};

/** Çizim: sahne merkezinde tek şekil, vurgu öğesi, içerik katmanları ve imleç. */
export const MorphStage: React.FC<{d: ReturnType<typeof draw>}> = ({d}) => {
  const {p, w, h, r, color, cam, camX, camY, blur, accent, accentBehind, cur, curScale, ripples, vis, t, at, B} = d;
  const accentEl = (
    <div
      style={{
        position: 'absolute',
        left: accent.x - accent.w / 2,
        top: accent.y - accent.h / 2,
        width: accent.w,
        height: accent.h,
        borderRadius: accent.r,
        background: COLORS.blue,
        filter: blur > 0.2 ? `blur(${blur * 0.6}px)` : undefined,
      }}
    />
  );
  const typed = TYPED.slice(0, Math.max(0, Math.min(TYPED.length, Math.floor((t - d.typeStart) / (B / 8)) + 1)));
  const dragK = clamp01((accent.x + 330) / 660);
  const tabOn = t >= d.clickTab + 0.05 ? 1 : 0;
  return (
    <div style={{position: 'absolute', left: p.cx, top: p.cy, transform: `scale(${cam}) translate(${-camX}px, ${-camY}px)`}}>
      {accentBehind ? accentEl : null}
      <div
        style={{
          position: 'absolute',
          left: -w / 2,
          top: -h / 2,
          width: w,
          height: h,
          borderRadius: r,
          background: color,
          boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
          filter: blur > 0.2 ? `blur(${blur * 0.5}px)` : undefined,
        }}
      />
      {/* 0 / 9 logo: oynat üçgeni */}
      <Layer o={Math.max(vis(0), vis(9))}>
        <svg width={300} height={300} viewBox="0 0 64 64" style={{position: 'absolute', left: -150, top: -150}}>
          <path d="M23,19 L23,45 L46,32 Z" fill={COLORS.cream} stroke={COLORS.cream} strokeWidth={3} strokeLinejoin="round" />
        </svg>
      </Layer>
      {/* 1 buton */}
      <Layer o={vis(1)}>
        <At x={70} y={0} w={620} align="left">
          <div style={sans(54)}>Birinci Twitter Savaşı</div>
        </At>
      </Layer>
      {/* 2 alan: yazma */}
      <Layer o={vis(2)}>
        <At x={-360 + 300} y={-46} w={600} align="left">
          <div style={mono(24, COLORS.dimLight)}>DURUM</div>
        </At>
        <At x={-360 + 330} y={24} w={660} align="left">
          <div style={{...mono(60, ink, 700), letterSpacing: 0, marginLeft: -2}}>{typed}</div>
        </At>
      </Layer>
      {/* 3 "bu mu?" */}
      <Layer o={vis(3)}>
        <At x={-360 + 330} y={-150} w={660} align="left">
          <div style={mono(26, COLORS.dimLight)}>X · 19 EKİM 2026</div>
        </At>
        <At x={-360 + 330} y={-82} w={660} align="left">
          <div style={sans(70)}>Bu savaş mı?</div>
        </At>
        <At x={-360 + 330} y={0} w={660} align="left">
          <div style={sans(38, ink, 500)}>Türk ve Çinli kullanıcılar, X'te</div>
        </At>
        <At x={accentOf(3).x - 230} y={accentOf(3).y} w={160}>
          <div style={sans(36, COLORS.dimLight, 500)}>Hayır</div>
        </At>
      </Layer>
      {/* 4 yükleniyor */}
      <Layer o={vis(4)}>
        <svg width={280} height={280} viewBox="-140 -140 280 280" style={{position: 'absolute', left: -140, top: -140}}>
          <circle r={84} fill="none" stroke="rgba(242,238,230,0.16)" strokeWidth={10} />
        </svg>
        <At x={0} y={0} w={240}>
          <div style={mono(20, COLORS.cream)}>CEPHE</div>
        </At>
      </Layer>
      {/* 5 pin */}
      <Layer o={vis(5)}>
        <At x={0} y={-74} w={240}>
          <div style={mono(24, COLORS.dimLight)}>CEPHE</div>
        </At>
        <At x={0} y={8} w={240}>
          <div style={sans(130)}>X</div>
        </At>
      </Layer>
      {/* 6 küre */}
      <Layer o={vis(6)}>
        <Globe d={d} />
      </Layer>
      {/* 7 eşleşme + sürükleme */}
      <Layer o={vis(7)}>
        <At x={-200} y={-120} w={360}>
          <div style={sans(72)}>Türkler</div>
          <div style={{height: 8, width: 120, margin: '18px auto 0', borderRadius: 4, background: SIDES.tr.color}} />
        </At>
        <At x={0} y={-112} w={120}>
          <div style={mono(34, COLORS.dimLight)}>vs</div>
        </At>
        <At x={200} y={-120} w={360}>
          <div style={sans(72)}>Çinliler</div>
          <div style={{height: 8, width: 120, margin: '18px auto 0', borderRadius: 4, background: SIDES.cn.color}} />
        </At>
        <div style={{position: 'absolute', left: -330, top: 137, width: 660, height: 6, borderRadius: 3, background: 'rgba(22,22,22,0.12)'}} />
        <div style={{position: 'absolute', left: -330, top: 137, width: 660 * dragK, height: 6, borderRadius: 3, background: ink}} />
        <At x={0} y={40} w={700}>
          <div style={mono(26, COLORS.dimLight)}>CEPHE HATTI · {KM.toLocaleString('tr-TR')} KM</div>
        </At>
      </Layer>
      {!accentBehind ? accentEl : null}
      {/* 8 sekmeler: etiketler göstergenin üstünde */}
      <Layer o={vis(8)}>
        <At x={-215} y={0} w={400}>
          <div style={sans(56, tabOn ? COLORS.dimDark : COLORS.cream)}>Türkler</div>
        </At>
        <At x={215} y={0} w={400}>
          <div style={sans(56, tabOn ? COLORS.cream : COLORS.dimDark)}>Çinliler</div>
        </At>
      </Layer>
      <Layer o={vis(3)}>
        <At x={accentOf(3).x} y={accentOf(3).y} w={240}>
          <div style={sans(38, COLORS.cream)}>Evet</div>
        </At>
      </Layer>
      {/* imleç */}
      {ripples.map(({c, k}) => (
        <div
          key={c}
          style={{
            position: 'absolute',
            left: cur.x - 70 * k / cam,
            top: cur.y - 70 * k / cam,
            width: (140 * k) / cam,
            height: (140 * k) / cam,
            borderRadius: '50%',
            border: `${3 / cam}px solid rgba(242,238,230,${0.9 * (1 - k)})`,
          }}
        />
      ))}
      <svg
        width={44}
        height={56}
        viewBox="0 0 22 28"
        style={{position: 'absolute', left: cur.x - 4 / cam, top: cur.y - 2 / cam, transformOrigin: '0 0', transform: `scale(${curScale / cam})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}}
      >
        <path d="M2,2 L2,22 L7.5,17 L11,25 L14.5,23.5 L11,15.8 L18.5,15.8 Z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Zamana bağlı tek giriş noktası: kare → t → draw(t). */
export const Morph: React.FC<MorphProps & {t0?: number}> = ({t0 = 0, ...p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <MorphStage d={draw(f / fps - t0, p)} />;
};
