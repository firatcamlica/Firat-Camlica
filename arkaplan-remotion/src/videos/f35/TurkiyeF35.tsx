import React from 'react';
import {AbsoluteFill, Audio, Sequence, getInputProps, getRemotionEnvironment, staticFile, useCurrentFrame} from 'remotion';
import {SCENES, SceneId, TEXT} from '../../data/f35';
import {Captions} from '../../brand/Captions';
import {EndCard} from '../../brand/EndCard';
import {useBrandFonts} from '../../brand/fonts';
import {DuotoneDefs} from '../../brand/Media';
import {DayCounter, HazardStripes} from '../../brand/Tracking';
import {COLORS} from '../../brand/tokens';
import {S1, S2, S3, S4, S5, S6, S7, S8} from './scenes';
import {AUDIO, dayCounterAt, sceneFrames, startOf} from './timing';

const COMPONENTS: Record<SceneId, React.FC> = {S1, S2, S3, S4, S5, S6, S7, S8, S9: () => <EndCard />};

/** Köşedeki bekleme sayacı ve kenar şeridi: sahne geçişlerinde kaybolmaz */
const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const qa = Boolean((getInputProps() as {safeQa?: boolean}).safeQa);
  const end = f >= sceneFrames('S9').from;
  const d = dayCounterAt(f);
  return (
    <>
      {!end && !qa ? <HazardStripes /> : null}
      {d.visible ? <DayCounter label={TEXT.dayCounter} value={d.value} frozen={d.frozen} tone={end ? 'light' : 'dark'} /> : null}
    </>
  );
};

/**
 * turkiye-f35 · "Şark Oturup Beklemenin Yeridir" · 1080x1920, 30 fps. Render sessizdir; ses (konuşma + müzik + SFX,
 * -14 LUFS) tools/f35/render.sh içinde eklenir. Studio'da önizleme için hazır master miks çalınır.
 */
export const TurkiyeF35: React.FC = () => {
  useBrandFonts();
  const studio = getRemotionEnvironment().isStudio;
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <DuotoneDefs />
      {SCENES.map((s) => {
        const {from, duration} = sceneFrames(s.id);
        const C = COMPONENTS[s.id];
        return (
          <Sequence key={s.id} from={from} durationInFrames={duration} name={`${s.id} · ${s.name}`}>
            <C />
          </Sequence>
        );
      })}
      <Overlay />
      <Captions chunks={AUDIO.captions ?? []} hideAfter={startOf('S9')} />
      {studio && AUDIO.master ? <Audio src={staticFile(AUDIO.master)} /> : null}
    </AbsoluteFill>
  );
};
