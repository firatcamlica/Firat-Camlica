import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Debug } from "../Espresso";
import { useFontsP2 } from "./fonts";
import { Backdrop2, Header, Meta2, OV, Progress2, SceneTiming, Subtitles2, Transition } from "./layers";
import { EY, Formula, Hook2, Outro2, Pressure, WDT } from "./Scenes2";
import { INTER, P, ZONE_H, ZONE_TOP, ZW, ZX, amberText, glass } from "./theme";
import script from "../../script2.json";
import timings from "./timings.json";

const SCENES = timings.scenes as SceneTiming[];
const METAS = script.scenes as Meta2[];
export const TOTAL2 = Math.round(timings.total * 30);

const BODY: Record<string, React.FC<{ frame: number; sc: SceneTiming }>> = {
  hook: Hook2,
  ey: EY,
  formula: Formula,
  pressure: Pressure,
  wdt: WDT,
  outro: Outro2,
};

const SceneBlock: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const sc = SCENES[i];
  const meta = METAS[i];
  const dur = Math.round(sc.dur * 30);
  const Body = BODY[meta.id];
  return (
    <Transition frame={frame} dur={dur} inType={i > 0 ? METAS[i - 1].transition : undefined} outType={i < SCENES.length - 1 ? meta.transition : undefined}>
      <Header meta={meta} frame={frame} delay={meta.id === "hook" ? 0 : 3} />
      <div style={{ position: "absolute", left: ZX, top: ZONE_TOP, width: ZW, height: ZONE_H }}>
        <Body frame={frame} sc={sc} />
      </div>
    </Transition>
  );
};

export const Part2: React.FC<{ debug?: boolean }> = ({ debug }) => {
  useFontsP2();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: P.bg, fontFamily: INTER }}>
      <Backdrop2 frame={frame} />
      {SCENES.map((sc, i) => {
        const from = Math.round(sc.start * 30);
        const dur = Math.round(sc.dur * 30) + (i < SCENES.length - 1 ? OV : 0);
        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} layout="none">
            <SceneBlock i={i} />
          </Sequence>
        );
      })}
      <Subtitles2 scenes={SCENES} frame={frame} />
      <Progress2 frame={frame} total={TOTAL2} />
      {debug && <Debug />}
    </AbsoluteFill>
  );
};

export const Cover2: React.FC<{ debug?: boolean }> = ({ debug }) => {
  useFontsP2();
  const meta = { ...METAS[3] };
  return (
    <AbsoluteFill style={{ background: P.bg, fontFamily: INTER }}>
      <Backdrop2 frame={40} />
      <div style={{ position: "absolute", left: ZX, width: ZW, top: 196, display: "flex", justifyContent: "center" }}>
        <div style={{ ...glass(40), padding: "12px 30px", fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: P.white }}>PART 2 · MODERN ÇAĞ</div>
      </div>
      <div style={{ position: "absolute", left: ZX, width: ZW, top: 290, textAlign: "center", fontWeight: 800, fontSize: 112, lineHeight: 1.02, letterSpacing: "-0.04em", color: P.white }}>
        <span style={amberText}>Bilim</span>
        <br />
        espressoyu
        <br />
        yeniden yazdı
      </div>
      <div style={{ position: "absolute", left: ZX, top: 700, width: ZW, height: 720 }}>
        <Pressure frame={400} sc={{ ...SCENES[3], words: SCENES[3].words.map(() => ({ t: "", s: 0, e: 0.1 })) }} />
      </div>
      {debug && <Debug />}
      <span style={{ display: "none" }}>{meta.id}</span>
    </AbsoluteFill>
  );
};
