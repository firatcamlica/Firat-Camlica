import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, CONTENT_W, CONTENT_X, FONT, SAFE, W, H, Y } from "./theme";
import { useFonts } from "./Fonts";
import { SceneMeta, SceneTiming, SceneView } from "./Scenes";
import script from "../script.json";
import timings from "./timings.json";

export const TOTAL_FRAMES = Math.round(timings.total * timings.fps);

export const Backdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = Math.sin(frame / 90) * 30;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(900px 900px at ${470 + drift}px 880px, rgba(224,144,62,0.17), rgba(224,144,62,0) 70%), radial-gradient(700px 500px at 900px 100px, rgba(243,229,208,0.05), rgba(243,229,208,0) 70%), ${C.bg}`,
      }}
    >
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={490} cy={880} r={430 + drift / 3} fill="none" stroke={C.cream} strokeOpacity={0.045} strokeWidth={3} />
        <circle cx={490} cy={880} r={600 - drift / 3} fill="none" stroke={C.cream} strokeOpacity={0.03} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", left: CONTENT_X, width: CONTENT_W, top: Y.progress, height: 8, borderRadius: 4, background: "rgba(243,229,208,0.16)" }}>
    <div style={{ height: "100%", width: `${Math.min(1, frame / TOTAL_FRAMES) * 100}%`, borderRadius: 4, background: C.caramel }} />
  </div>
);

export const Debug: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: SAFE.top, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 0, top: H - SAFE.bottom, width: W, height: SAFE.bottom, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: W - SAFE.right, top: 0, width: SAFE.right, height: H, background: "rgba(255,0,0,0.25)" }} />
  </AbsoluteFill>
);

export const Espresso: React.FC<{ debug?: boolean }> = ({ debug }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const metas = script.scenes as SceneMeta[];
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: C.bg }}>
      <Backdrop frame={frame} />
      {(timings.scenes as SceneTiming[]).map((sc, i) => (
        <Sequence key={sc.id} from={Math.round(sc.start * fps)} durationInFrames={Math.round(sc.dur * fps)} layout="none">
          <SceneSeq meta={metas[i]} scene={sc} from={Math.round(sc.start * fps)} />
        </Sequence>
      ))}
      <ProgressBar frame={frame} />
      {timings.source === "edge" && <Audio src={staticFile("voice/voice.mp3")} />}
      {debug && <Debug />}
    </AbsoluteFill>
  );
};

const SceneSeq: React.FC<{ meta: SceneMeta; scene: SceneTiming; from: number }> = ({ meta, scene }) => {
  const local = useCurrentFrame();
  return <SceneView meta={meta} scene={scene} frame={local} />;
};
