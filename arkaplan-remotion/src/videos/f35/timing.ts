import audio from '../../data/f35.audio.json';
import assets from '../../data/f35.assets.json';
import {DURATION, FPS, SCENES, SceneId} from '../../data/f35';

export type Caption = {start: number; end: number; text: string; words: [string, number, number][]};
export type AudioManifest = {
  generated: boolean;
  master: string | null;
  bpm: number | null;
  beatOffset: number;
  sceneStarts: Partial<Record<SceneId, number>>;
  totalSeconds: number | null;
  cues: Record<string, number>;
  captions: Caption[];
};
export type PhotoAsset = {file: string; credit: string; fg?: string; intensity?: number};
export type BrollAsset = {file: string; seconds: number};
export type AssetManifest = {photos: Record<string, PhotoAsset>; broll: Record<string, BrollAsset[]>};

export const AUDIO = audio as unknown as AudioManifest;
export const ASSETS = assets as unknown as AssetManifest;

const ids = SCENES.map((s) => s.id);
export const startOf = (id: SceneId) => AUDIO.sceneStarts?.[id] ?? SCENES.find((s) => s.id === id)!.start;
export const TOTAL_SECONDS = Math.min(DURATION.max, AUDIO.totalSeconds ?? SCENES[SCENES.length - 1].end);
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

/** Sahnenin mutlak kare aralığı */
export const sceneFrames = (id: SceneId) => {
  const i = ids.indexOf(id);
  const from = Math.round(startOf(id) * FPS);
  const to = i + 1 < ids.length ? Math.round(startOf(ids[i + 1]) * FPS) : TOTAL_FRAMES;
  return {from, duration: to - from};
};

/** Sahne içi kare: seslendirmedeki cue anı; yoksa data dosyasındaki yedek saniye */
export const cueLocal = (id: SceneId, name: string) => {
  const abs = AUDIO.cues?.[`${id}.${name}`];
  const scene = SCENES.find((s) => s.id === id)!;
  const sec = abs !== undefined ? abs - startOf(id) : scene.cues[name]?.fallback ?? 0;
  return Math.max(0, Math.round(sec * FPS));
};

/** Mutlak kareyi en yakın müzik vuruşuna hizalar; fark 3 kareden büyükse dokunmaz. */
export const snapToBeat = (absFrame: number, maxShift = 3) => {
  if (!AUDIO.bpm) return absFrame;
  const beat = (60 / AUDIO.bpm) * FPS;
  const off = AUDIO.beatOffset * FPS;
  const snapped = Math.round(off + Math.round((absFrame - off) / beat) * beat);
  return Math.abs(snapped - absFrame) <= maxShift ? snapped : absFrame;
};

/** Sahne içi yerel kareyi vuruşa hizalar */
export const snapLocal = (id: SceneId, localFrame: number) => {
  const {from} = sceneFrames(id);
  return snapToBeat(from + localFrame) - from;
};

export const photo = (id: string | undefined) => (id ? ASSETS.photos?.[id] : undefined);
export const broll = (scene: SceneId) => ASSETS.broll?.[scene]?.[0];
