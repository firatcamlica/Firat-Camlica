import React from 'react';
import {AbsoluteFill, Audio, Sequence, getRemotionEnvironment, staticFile} from 'remotion';
import {SCENES, SceneId, TEXT} from '../../data/f35';
import {Captions} from '../../brand/Captions';
import {EndCard} from '../../brand/EndCard';
import {useBrandFonts} from '../../brand/fonts';
import {DuotoneDefs} from '../../brand/Media';
import {COLORS} from '../../brand/tokens';
import {S1, S2, S3, S4, S5, S6, S7, S8} from './scenes';
import {AUDIO, sceneFrames, startOf} from './timing';

const COMPONENTS: Record<SceneId, React.FC> = {
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9: () => <EndCard note={TEXT.endCard.note} />,
};

/**
 * turkiye-f35 · 1080x1920, 30 fps. Render sessizdir; ses (konuşma + müzik + SFX, -14 LUFS) tools/f35/render.sh
 * içinde eklenir. Studio'da önizleme için hazır master miks çalınır.
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
      <Captions chunks={AUDIO.captions ?? []} hideAfter={startOf('S9')} />
      {studio && AUDIO.master ? <Audio src={staticFile(AUDIO.master)} /> : null}
    </AbsoluteFill>
  );
};
