import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {useBrandFonts} from '../brand';
import {FPS, SceneId} from '../data/twitter-savasi';
import {S0, S1, S2, S3, S4, S5, S6, S7, sfxCues} from './scenes';
import {AUDIO, SCENES, sceneFrames, STARTS, TOTAL_SECONDS} from './timing';

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {S0, S1, S2, S3, S4, S5, S6, S7};

const db = (x: number) => Math.pow(10, x / 20);

/**
 * Müzik seviyesi (dB), saniye cinsinden:
 * konuşma varken -18, yokken -10; konuşma başlayınca 150 ms'de iner, bitince 400 ms'de çıkar.
 * S5 boyunca -30 (0,5 sn'de iner), S6 başında 1 sn'de geri gelir.
 * Başta 0,3 sn fade in (logo girişi), sonda 1,5 sn fade out.
 */
export const musicDb = (t: number) => {
  let duck = 0;
  for (const [a, b] of AUDIO.speech) {
    if (t < a || t > b + 0.4) continue;
    const v = t <= b ? Math.min(1, (t - a) / 0.15) : 1 - (t - b) / 0.4;
    duck = Math.max(duck, v);
  }
  let level = -10 - 8 * duck;
  const s5 = STARTS.S5;
  const s6 = STARTS.S6;
  if (t >= s5 && t < s6) level = interpolate(t, [s5, s5 + 0.5], [level, -30], {extrapolateRight: 'clamp'});
  if (t >= s6 && t < s6 + 1) level = interpolate(t, [s6, s6 + 1], [-30, level]);
  return level;
};

export const musicGain = (t: number) => {
  const fadeIn = Math.min(1, t / 0.3);
  const fadeOut = Math.min(1, Math.max(0, (TOTAL_SECONDS - t) / 1.5));
  return db(musicDb(t)) * fadeIn * fadeOut;
};

export const TwitterSavasi: React.FC = () => {
  useBrandFonts();
  const cues = sfxCues();
  return (
    <AbsoluteFill style={{background: '#111214'}}>
      {SCENES.map((id) => {
        const {from, duration} = sceneFrames(id);
        const C = SCENE_COMPONENTS[id];
        return (
          <Sequence key={id} from={from} durationInFrames={duration} name={id}>
            <C />
          </Sequence>
        );
      })}
      {AUDIO.voice ? <Audio src={staticFile(AUDIO.voice)} /> : null}
      {AUDIO.music ? <Audio src={staticFile(AUDIO.music)} volume={(f) => musicGain(f / FPS)} /> : null}
      {(['whoosh', 'stamp', 'scratch'] as const).map((k) => {
        const file = AUDIO.sfx[k];
        if (!file) return null;
        return cues[k].map((at, i) => (
          <Sequence key={`${k}${i}`} from={at} durationInFrames={FPS * 2} name={`sfx:${k}`}>
            <Audio src={staticFile(file)} volume={db(k === 'scratch' ? -6 : -9)} />
          </Sequence>
        ));
      })}
    </AbsoluteFill>
  );
};
