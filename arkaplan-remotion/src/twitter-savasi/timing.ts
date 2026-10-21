import audio from '../data/twitter-savasi.audio.json';
import {DEFAULT_STARTS, DEFAULT_TOTAL, FPS, SceneId} from '../data/twitter-savasi';

export type AudioManifest = {
  generated: boolean;
  voice: string | null;
  music: string | null;
  sfx: Partial<Record<'whoosh' | 'stamp' | 'scratch', string>>;
  bpm: number | null;
  beatOffset: number;
  sceneStarts: number[] | null;
  totalSeconds: number | null;
  speech: [number, number][];
  /** public/tweets/ altında bulunan dosya adları. */
  tweets: string[];
  /** Seslendirmeye bağlı anahtar anlar (mutlak saniye), "S3.stamp" gibi. */
  cues?: Record<string, number>;
};

export const AUDIO = audio as unknown as AudioManifest;

export const SCENES: SceneId[] = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];

/** Sahne başlangıçları (sn): ses varsa paragraf başlangıçları, yoksa varsayılanlar. */
export const STARTS: Record<SceneId, number> = Object.fromEntries(
  SCENES.map((id, i) => [id, AUDIO.sceneStarts?.[i] ?? DEFAULT_STARTS[id]]),
) as Record<SceneId, number>;

export const TOTAL_SECONDS = AUDIO.totalSeconds ?? DEFAULT_TOTAL;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

const defaultEnd = (i: number) => (i + 1 < SCENES.length ? DEFAULT_STARTS[SCENES[i + 1]] : DEFAULT_TOTAL);
const actualEnd = (i: number) => (i + 1 < SCENES.length ? STARTS[SCENES[i + 1]] : TOTAL_SECONDS);

export const sceneFrames = (id: SceneId) => {
  const i = SCENES.indexOf(id);
  const from = Math.round(STARTS[id] * FPS);
  return {from, duration: Math.round(actualEnd(i) * FPS) - from};
};

/**
 * Sahne içi saat: data dosyasındaki varsayılan yerel saniyeleri, sahnenin gerçek uzunluğuna
 * orantılı olarak kareye çevirir. Ses yokken oran 1'dir.
 */
export const sceneClock = (id: SceneId) => {
  const i = SCENES.indexOf(id);
  const ratio = (actualEnd(i) - STARTS[id]) / (defaultEnd(i) - DEFAULT_STARTS[id]);
  return (localSeconds: number) => Math.round(localSeconds * ratio * FPS);
};

/**
 * Mutlak kareyi en yakın müzik vuruşuna hizalar; fark 3 kareden büyükse dokunmaz.
 * BPM bilinmiyorsa kare aynen döner.
 */
export const snapToBeat = (absFrame: number, maxShift = 3) => {
  if (!AUDIO.bpm) return absFrame;
  const beat = (60 / AUDIO.bpm) * FPS;
  const off = AUDIO.beatOffset * FPS;
  const n = Math.round((absFrame - off) / beat);
  const snapped = Math.round(off + n * beat);
  return Math.abs(snapped - absFrame) <= maxShift ? snapped : absFrame;
};

/** Sahne içi yerel kareyi vuruşa hizalar (sahne başlangıcı hesaba katılarak). */
export const snapLocal = (id: SceneId, localFrame: number) => {
  const from = sceneFrames(id).from;
  return snapToBeat(from + localFrame) - from;
};
