import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CXX, GROTESK, INTER, P, SUB_TOP, ZW, ZX, amberText, glass, sp } from "./theme";

export type Word = { t: string; s: number; e: number };
export type SceneTiming = { id: string; start: number; dur: number; words: Word[]; chunks: { w: number[] }[] };
export type Meta2 = { id: string; kicker: string; headline: string[]; highlight: string; transition?: "zoom" | "whip" };

export const f30 = (s: number) => Math.round(s * 30);
export const wf = (sc: SceneTiming, i: number) => f30(sc.words[Math.min(i, sc.words.length - 1)].s);
export const we = (sc: SceneTiming, i: number) => f30(sc.words[Math.min(i, sc.words.length - 1)].e);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ------------------------------------------------------------- ARKA PLAN */
// Saf siyah zemin + köşelerden süzülen büyük, bulanık kehribar/pas mesh gradient'ler + nokta ızgarası.
export const Backdrop2: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const blob = (color: string, x: number, y: number, size: number, op: number) => (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, ${color}00 68%)`,
        opacity: op,
        filter: "blur(40px)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: P.bg, overflow: "hidden" }}>
      {blob(P.amberHi, 120 + Math.sin(t * 0.35) * 90, 260 + Math.cos(t * 0.3) * 80, 1150, 0.5)}
      {blob(P.rust, 1000 + Math.cos(t * 0.28) * 90, 1500 + Math.sin(t * 0.32) * 110, 1250, 0.55)}
      {blob(P.amber, 760 + Math.sin(t * 0.22 + 2) * 120, 820 + Math.cos(t * 0.25) * 140, 900, 0.22)}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1.4px, transparent 1.8px)",
          backgroundSize: "36px 36px",
          backgroundPosition: `${(frame * 0.3) % 36}px 0px`,
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 45% 48%, black 20%, transparent 80%)",
          maskImage: "radial-gradient(ellipse 70% 60% at 45% 48%, black 20%, transparent 80%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- BAŞLIK */
export const Header: React.FC<{ meta: Meta2; frame: number; delay?: number }> = ({ meta, frame, delay = 2 }) => {
  const chip = sp(frame, delay);
  const maxChars = Math.max(...meta.headline.map((l) => l.length));
  const fs = Math.min(94, Math.floor(ZW / (maxChars * 0.56)));
  const hl = meta.highlight.split(" ");
  let k = 0;
  return (
    <>
      <div style={{ position: "absolute", top: 188, left: ZX, width: ZW, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            ...glass(40),
            padding: "10px 26px 10px 22px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: chip,
            transform: `translateY(${(1 - chip) * -24}px) scale(${0.85 + 0.15 * chip})`,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: P.amberHi, boxShadow: `0 0 ${10 + 6 * Math.sin(frame / 5)}px ${P.amberHi}` }} />
          <div style={{ fontFamily: GROTESK, fontWeight: 600, fontSize: 26, letterSpacing: "0.16em", color: P.white }}>{meta.kicker}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 268, left: ZX, width: ZW, textAlign: "center", fontFamily: INTER }}>
        {meta.headline.map((line, li) => (
          <div key={li} style={{ fontSize: fs, lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.035em", color: P.white }}>
            {line.split(" ").map((w, wi) => {
              const s = sp(frame, delay + 4 + k++ * 2.5);
              const isHl = hl.includes(w.replace(/[.,]/g, ""));
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    marginRight: "0.24em",
                    opacity: clamp01(s * 1.4),
                    transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + 0.3 * s})`,
                    ...(isHl ? amberText : {}),
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------- GEÇİŞ */
export const OV = 10; // geçiş örtüşmesi (kare)
export const Transition: React.FC<{
  frame: number;
  dur: number;
  inType?: "zoom" | "whip";
  outType?: "zoom" | "whip";
  children: React.ReactNode;
}> = ({ frame, dur, inType, outType, children }) => {
  let tx = 0;
  let sc = 1;
  let op = 1;
  let blur = 0;
  if (inType && frame < OV + 12) {
    const s = sp(frame, 0, { mass: 0.6, damping: 14, stiffness: 140 });
    if (inType === "whip") {
      tx += (1 - s) * 1100;
      blur += Math.max(0, 1 - frame / 6) * 18;
    } else {
      sc *= Math.min(1, 0.62 + 0.38 * s); // yay taşması güvenli alana itmesin
      op *= clamp01(frame / 6);
      blur += Math.max(0, 1 - frame / 7) * 10;
    }
  }
  if (outType && frame >= dur) {
    const t = interpolate(frame, [dur, dur + OV], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
    if (outType === "whip") {
      tx += -1100 * t;
      blur += t * 18;
    } else {
      sc *= 1 + 1.6 * t;
      op *= 1 - t;
      blur += t * 12;
    }
  }
  return (
    <AbsoluteFill style={{ transform: `translateX(${tx}px) scale(${sc})`, transformOrigin: "490px 860px", opacity: op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- ALTYAZI */
// Merkez-alt; söylenen kelime %15 büyüyüp geri oturur ve beyazdan neon sarıya döner.
export const Subtitles2: React.FC<{ scenes: SceneTiming[]; frame: number }> = ({ scenes, frame }) => {
  type C = { words: Word[]; start: number; end: number };
  const chunks: C[] = [];
  for (const sc of scenes) {
    sc.chunks.forEach((ch, k) => {
      const ws = ch.w.map((i) => ({ ...sc.words[i], s: sc.start + sc.words[i].s, e: sc.start + sc.words[i].e }));
      const next = sc.chunks[k + 1];
      const nextS = next ? sc.start + sc.words[next.w[0]].s : Infinity;
      chunks.push({ words: ws, start: f30(ws[0].s) - 1, end: Math.min(f30(nextS) - 1, f30(ws[ws.length - 1].e + 0.4)) });
    });
  }
  const ch = chunks.find((c) => frame >= c.start && frame < c.end);
  if (!ch) return null;
  const enter = sp(frame, ch.start, { mass: 0.4, damping: 11, stiffness: 180 });
  let cur = 0;
  ch.words.forEach((w, i) => {
    if (frame >= f30(w.s)) cur = i;
  });
  return (
    <div style={{ position: "absolute", left: ZX, width: ZW, top: SUB_TOP, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 36px",
          transform: `translateY(${(1 - enter) * 30}px) scale(${0.88 + 0.12 * enter})`,
          opacity: clamp01(enter * 1.5),
        }}
      >
        {ch.words.map((w, i) => {
          const act = i === cur;
          const ws = f30(w.s);
          const pop = act ? interpolate(frame - ws, [0, 4, 11], [1, 1.15, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: INTER,
                fontWeight: 800,
                fontSize: 74,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: act ? P.neon : P.white,
                transform: `scale(${pop})`,
                WebkitTextStroke: "10px rgba(0,0,0,0.55)",
                paintOrder: "stroke fill",
                textShadow: act ? `0 0 28px rgba(253,224,71,0.55), 0 6px 22px rgba(0,0,0,0.6)` : "0 6px 22px rgba(0,0,0,0.6)",
              }}
            >
              {w.t.replace(/[,.:;]+$/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- İLERLEME */
export const Progress2: React.FC<{ frame: number; total: number }> = ({ frame, total }) => (
  <div style={{ position: "absolute", left: ZX, width: ZW, top: 158, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${clamp01(frame / total) * 100}%`, background: `linear-gradient(90deg, ${P.amberHi}, ${P.rust})`, boxShadow: `0 0 12px ${P.amberHi}` }} />
  </div>
);

export { CXX };
