import React from "react";
import { Easing } from "remotion";
import { C, CONTENT_W, CONTENT_X, FONT, Y, trUpper } from "./theme";
import { easeInOut, easeOut, lerp, prog, sf } from "./anim";
import { Boiler, Bolt, Cup, Gauge, Timeline } from "./graphics";

export type Word = { t: string; s: number; e: number };
export type SceneTiming = {
  id: string;
  start: number;
  dur: number;
  words: Word[];
  chunks: { w: number[] }[];
};
export type SceneMeta = {
  id: string;
  kicker: string;
  headline: string[];
  highlight: string;
  year?: number;
  year2?: number;
};

// i. kelimenin sahne içindeki başlangıç karesi (sınır dışıysa son kelime)
const wf = (words: Word[], i: number) => sf(words[Math.min(i, words.length - 1)].s);
const we = (words: Word[], i: number) => sf(words[Math.min(i, words.length - 1)].e);

/* ------------------------------------------------------------------ BAŞLIK */
const Headline: React.FC<{ meta: SceneMeta; frame: number }> = ({ meta, frame }) => {
  const big = meta.id === "hook";
  const maxChars = Math.max(...meta.headline.map((l) => l.length));
  const upper = meta.headline.every((l) => l === l.toLocaleUpperCase("tr-TR"));
  const single = meta.headline.length === 1;
  const fs = Math.min(big ? 118 : single ? 124 : 88, Math.floor(CONTENT_W / (maxChars * (upper ? 0.76 : 0.62))));
  const hl = meta.highlight.split(" ");
  let idx = 0;
  return (
    <div style={{ position: "absolute", left: CONTENT_X, width: CONTENT_W, top: Y.headline, textAlign: "center" }}>
      {meta.headline.map((line, li) => {
        const hasHl = line.includes(meta.highlight);
        return (
          <div key={li} style={{ fontSize: fs, lineHeight: 1.1, fontWeight: 900, color: C.cream, letterSpacing: "-0.01em" }}>
            {line.split(" ").map((w, wi) => {
              const p = prog(frame, 3 + idx * 3, 14);
              idx++;
              const isHl = hasHl && hl.includes(w.replace(/[.,]/g, ""));
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    marginRight: "0.28em",
                    color: isHl ? C.caramel : C.cream,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 40}px)`,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Kicker: React.FC<{ text: string; frame: number }> = ({ text, frame }) => {
  const p = prog(frame, 0, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_X,
        width: CONTENT_W,
        top: Y.kicker,
        textAlign: "center",
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: "0.22em",
        color: C.caramel,
        opacity: p,
        transform: `translateY(${(1 - p) * -16}px)`,
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ ALTYAZI */
export const Subtitles: React.FC<{ scene: SceneTiming; frame: number }> = ({ scene, frame }) => {
  const { words, chunks } = scene;
  let active = -1;
  for (let k = 0; k < chunks.length; k++) {
    const first = words[chunks[k].w[0]];
    const last = words[chunks[k].w[chunks[k].w.length - 1]];
    const nextFirst = k + 1 < chunks.length ? words[chunks[k + 1].w[0]].s : Infinity;
    const start = sf(first.s) - 1;
    const end = Math.min(sf(nextFirst) - 1, sf(last.e + 0.4));
    if (frame >= start && frame < end) active = k;
  }
  if (active < 0) return null;
  const ch = chunks[active];
  const start = sf(words[ch.w[0]].s) - 1;
  const pop = prog(frame, start, 6);
  let curWord = ch.w[0];
  for (const wi of ch.w) if (frame >= sf(words[wi].s)) curWord = wi;
  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_X,
        width: CONTENT_W,
        top: Y.subs,
        height: Y.subsH,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 22px",
          transform: `scale(${lerp(0.9, 1, pop)})`,
          opacity: Math.min(1, pop * 2),
        }}
      >
        {ch.w.map((wi) => {
          const isAct = wi === curWord;
          return (
            <span
              key={wi}
              style={{
                fontSize: 78,
                lineHeight: 1.12,
                fontWeight: 900,
                color: isAct ? C.caramel : C.cream,
                WebkitTextStroke: `14px ${C.bg}`,
                paintOrder: "stroke fill",
                textShadow: "0 6px 18px rgba(0,0,0,0.55)",
                transform: `scale(${isAct ? 1.07 : 1})`,
                display: "inline-block",
              }}
            >
              {trUpper(words[wi].t.replace(/[,.:;]+$/, ""))}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ ÇERÇEVE */
const Shell: React.FC<{ meta: SceneMeta; scene: SceneTiming; frame: number; children: React.ReactNode }> = ({
  meta,
  scene,
  frame,
  children,
}) => {
  const durF = sf(scene.dur);
  const inP = prog(frame, 0, 10);
  const outP = prog(frame, durF - 9, 9, Easing.in(Easing.quad));
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 28 - outP * 18}px)` }}>
        <Kicker text={meta.kicker} frame={frame} />
        <Headline meta={meta} frame={frame} />
        <div style={{ position: "absolute", left: CONTENT_X + 10, width: CONTENT_W - 20, top: Y.zone, height: Y.zoneH }}>{children}</div>
      </div>
      <div style={{ opacity: 1 - outP }}>
        <Subtitles scene={scene} frame={frame} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ ORTAK PARÇALAR */
const YearBlock: React.FC<{ value: number }> = ({ value }) => (
  <div
    style={{
      height: 180,
      textAlign: "center",
      fontSize: 176,
      lineHeight: "180px",
      fontWeight: 900,
      color: C.caramel,
      fontVariantNumeric: "tabular-nums",
      letterSpacing: "-0.02em",
    }}
  >
    {Math.round(value)}
  </div>
);

const Card: React.FC<{ title: string; sub: string; frame: number; at: number }> = ({ title, sub, frame, at }) => {
  const p = prog(frame, at, 14);
  return (
    <div
      style={{
        display: "flex",
        background: C.panel,
        borderRadius: 24,
        overflow: "hidden",
        opacity: p,
        transform: `translateX(${(1 - p) * -60}px)`,
        marginBottom: 22,
      }}
    >
      <div style={{ width: 12, background: C.caramel }} />
      <div style={{ padding: "22px 30px" }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: C.cream }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 500, color: C.mute, marginTop: 6 }}>{sub}</div>
      </div>
    </div>
  );
};

const YearLayout: React.FC<{ year: number; mid: React.ReactNode }> = ({ year, mid }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <YearBlock value={year} />
    <div style={{ height: 385, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>{mid}</div>
    <div style={{ marginTop: 10 }}>
      <Timeline year={year} />
    </div>
  </div>
);

const count = (frame: number, from: number, to: number, start: number, dur = 26) =>
  lerp(from, to, prog(frame, start, dur, easeInOut));

/* ------------------------------------------------------------------ SAHNELER */
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const fill = prog(frame, 8, 40);
  const crema = prog(frame, 36, 24);
  const steam = prog(frame, 44, 20);
  const pop = prog(frame, 0, 16);
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 70, position: "relative", transform: `scale(${lerp(0.92, 1, pop)})` }}>
      <div style={{ position: "absolute", left: 10, top: 110, transform: `rotate(-12deg) scale(${prog(frame, 14, 12)})` }}>
        <Bolt size={110} />
      </div>
      <Cup frame={frame} fill={fill} crema={crema} steam={steam} width={680} />
    </div>
  );
};

const Y1884: React.FC<{ frame: number; scene: SceneTiming }> = ({ frame, scene }) => {
  const w = scene.words;
  const year = count(frame, 1850, 1884, 4);
  const steam = prog(frame, wf(w, 3), 30);
  const stamp = prog(frame, wf(w, 7), 10, Easing.out(Easing.back(2)));
  return (
    <YearLayout
      year={year}
      mid={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: "scale(0.85)", transformOrigin: "top center", height: 290 }}>
            <Boiler frame={frame} steam={steam} />
          </div>
          <div
            style={{
              marginTop: 18,
              border: `7px solid ${C.caramel}`,
              borderRadius: 14,
              padding: "4px 28px",
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: C.caramel,
              opacity: stamp,
              transform: `rotate(-4deg) scale(${lerp(1.8, 1, stamp)})`,
            }}
          >
            PATENT
          </div>
        </div>
      }
    />
  );
};

const Y1901: React.FC<{ frame: number; scene: SceneTiming }> = ({ frame, scene }) => {
  const w = scene.words;
  const sw = wf(w, 4); // "Desiderio" başlangıcı -> 1905
  const year = frame < sw ? count(frame, 1884, 1901, 4) : count(frame, 1901, 1905, sw - 2, 20);
  return (
    <YearLayout
      year={year}
      mid={
        <div style={{ width: "100%" }}>
          <Card title="1901 · Luigi Bezzera" sub="Geliştirilmiş makine, patent başvurusu" frame={frame} at={wf(w, 0)} />
          <Card title="1905 · Desiderio Pavoni" sub="La Pavoni ile ticari satış" frame={frame} at={sw} />
        </div>
      }
    />
  );
};

const Y1948: React.FC<{ frame: number; scene: SceneTiming }> = ({ frame, scene }) => {
  const w = scene.words;
  const year = count(frame, 1905, 1948, 4);
  const fill = prog(frame, wf(w, 6), we(w, 9) - wf(w, 6));
  const crema = prog(frame, wf(w, 10), 24);
  const steam = prog(frame, wf(w, 10), 30);
  return (
    <YearLayout
      year={year}
      mid={
        <div style={{ position: "relative" }}>
          <Cup frame={frame} fill={fill} crema={crema} steam={steam} width={430} />
        </div>
      }
    />
  );
};

const Y1961: React.FC<{ frame: number; scene: SceneTiming }> = ({ frame, scene }) => {
  const w = scene.words;
  const year = count(frame, 1948, 1961, 4);
  const v = 9 * prog(frame, wf(w, 5), we(w, 8) - wf(w, 5), Easing.bezier(0.22, 1, 0.36, 1));
  return <YearLayout year={year} mid={<Gauge value={v} />} />;
};

const Row: React.FC<{
  label: string;
  note: string;
  value: number;
  unit: string;
  ratio: number;
  scale: string;
  frame: number;
  at: number;
}> = ({ label, note, value, unit, ratio, scale, frame, at }) => {
  const p = prog(frame, at, 22);
  const vis = prog(frame, at - 4, 10);
  return (
    <div style={{ height: 138, opacity: vis, transform: `translateY(${(1 - vis) * 24}px)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.cream }}>
          {label} <span style={{ fontSize: 26, fontWeight: 500, color: C.mute }}>{note}</span>
        </div>
        <div style={{ fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontSize: 66, fontWeight: 900, color: C.caramel }}>{Math.round(value * p)}</span>
          <span style={{ fontSize: 34, fontWeight: 700, color: C.cream, marginLeft: 8 }}>{unit}</span>
        </div>
      </div>
      <div style={{ height: 24, borderRadius: 12, background: C.track, marginTop: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${ratio * p * 100}%`, borderRadius: 12, background: `linear-gradient(90deg, #b8691f, ${C.caramel})` }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 24, color: "rgba(243,229,208,0.78)", marginTop: 4 }}>{scale}</div>
    </div>
  );
};

const Recipe: React.FC<{ frame: number; scene: SceneTiming }> = ({ frame, scene }) => {
  const w = scene.words;
  const chip = prog(frame, wf(w, 10) + 10, 12, Easing.out(Easing.back(2)));
  return (
    <div style={{ paddingTop: 10 }}>
      <Row label="Kahve" note="öğütülmüş" value={18} unit="g" ratio={18 / 40} scale="ölçek 0–40 g" frame={frame} at={wf(w, 2)} />
      <Row label="Espresso" note="2 kat" value={36} unit="g" ratio={36 / 40} scale="ölçek 0–40 g" frame={frame} at={wf(w, 5)} />
      <Row label="Süre" note="25–30 sn" value={30} unit="sn" ratio={30 / 60} scale="ölçek 0–60 sn" frame={frame} at={wf(w, 8)} />
      <Row label="Su sıcaklığı" note="90–96 °C" value={93} unit="°C" ratio={93 / 100} scale="ölçek 0–100 °C" frame={frame} at={wf(w, 10)} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <div
          style={{
            background: C.caramel,
            color: C.bg,
            borderRadius: 40,
            padding: "10px 34px",
            fontSize: 38,
            fontWeight: 900,
            opacity: chip,
            transform: `scale(${lerp(0.7, 1, chip)})`,
          }}
        >
          Basınç · 9 bar
        </div>
      </div>
    </div>
  );
};

const Compare: React.FC<{ frame: number; scene: SceneTiming }> = ({ frame, scene }) => {
  const w = scene.words;
  const p1 = prog(frame, wf(w, 0), we(w, 4) - wf(w, 0), easeInOut);
  const p2 = prog(frame, wf(w, 5), Math.max(12, we(w, 7) - wf(w, 5)), easeInOut);
  const badge = prog(frame, wf(w, 8), 14, Easing.out(Easing.back(1.8)));
  const bar = (label: string, p: number, secs: number, color: string, ratio: number, at: number) => {
    const vis = prog(frame, at - 4, 10);
    return (
      <div style={{ marginBottom: 56, opacity: vis }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: C.cream }}>{label}</div>
          <div style={{ fontVariantNumeric: "tabular-nums" }}>
            <span style={{ fontSize: 70, fontWeight: 900, color }}>{Math.round(secs * p)}</span>
            <span style={{ fontSize: 34, fontWeight: 700, color: C.cream, marginLeft: 8 }}>sn</span>
          </div>
        </div>
        <div style={{ height: 74, borderRadius: 18, background: C.track, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${ratio * p * 100}%`, minWidth: p > 0.02 ? 14 : 0, borderRadius: 18, background: color }} />
        </div>
      </div>
    );
  };
  return (
    <div style={{ paddingTop: 50 }}>
      {bar("Fransız presi", p1, 240, "#a98c6c", 1, wf(w, 0))}
      {bar("Espresso", p2, 30, C.caramel, 30 / 240, wf(w, 5))}
      <div
        style={{
          marginTop: 40,
          background: C.caramel,
          color: C.bg,
          borderRadius: 28,
          textAlign: "center",
          padding: "26px 10px",
          fontSize: 64,
          fontWeight: 900,
          opacity: badge,
          transform: `scale(${lerp(0.6, 1, badge)})`,
        }}
      >
        8 kat daha hızlı
      </div>
    </div>
  );
};

const Outro: React.FC<{ frame: number; scene: SceneTiming }> = ({ frame, scene }) => {
  const w = scene.words;
  const pop = prog(frame, 0, 16);
  const cta = prog(frame, wf(w, 5), 14, Easing.out(Easing.back(1.8)));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 0 }}>
      <div style={{ transform: `scale(${lerp(0.92, 1, pop)})`, opacity: pop }}>
        <Cup frame={frame} fill={1} crema={1} steam={1} width={500} />
      </div>
      <div
        style={{
          marginTop: 24,
          background: C.caramel,
          color: C.bg,
          borderRadius: 60,
          padding: "20px 70px",
          fontSize: 54,
          fontWeight: 900,
          opacity: cta,
          transform: `scale(${lerp(0.7, 1, cta)})`,
        }}
      >
        Takip et
      </div>
    </div>
  );
};

export const SceneView: React.FC<{ meta: SceneMeta; scene: SceneTiming; frame: number }> = ({ meta, scene, frame }) => {
  let body: React.ReactNode = null;
  switch (meta.id) {
    case "hook": body = <Hook frame={frame} />; break;
    case "y1884": body = <Y1884 frame={frame} scene={scene} />; break;
    case "y1901": body = <Y1901 frame={frame} scene={scene} />; break;
    case "y1948": body = <Y1948 frame={frame} scene={scene} />; break;
    case "y1961": body = <Y1961 frame={frame} scene={scene} />; break;
    case "recipe": body = <Recipe frame={frame} scene={scene} />; break;
    case "compare": body = <Compare frame={frame} scene={scene} />; break;
    case "outro": body = <Outro frame={frame} scene={scene} />; break;
  }
  return (
    <Shell meta={meta} scene={scene} frame={frame}>
      {body}
    </Shell>
  );
};

export { easeOut };
