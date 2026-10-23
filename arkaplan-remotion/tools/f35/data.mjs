// src/data/f35.ts dosyasını Node'da okur (esbuild ile TS → JS) ve seslendirme metnini kelimelere ayırır.
//   node tools/f35/data.mjs            → public/gen/f35_script.json (Python araçları bunu okur)
import {transformSync} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const loadData = async () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/f35.ts'), 'utf8');
  const {code} = transformSync(src, {loader: 'ts', format: 'esm'});
  const tmp = path.join(ROOT, 'public/gen/.f35_data.mjs');
  fs.mkdirSync(path.dirname(tmp), {recursive: true});
  fs.writeFileSync(tmp, code);
  return import(`${pathToFileURL(tmp).href}?t=${Date.now()}`);
};

/**
 * "[F-35|ef otuz beş], yedi" → [{display:'F-35,', spoken:['ef','otuz','beş']}, {display:'yedi', spoken:['yedi']}]
 * Noktalama ekran kelimesine yapışık kalır; okunuş tarafı küçük harfe çevrilmez (hizalamada normalize edilir).
 */
export const tokenize = (voice) => {
  const out = [];
  const re = /\[([^\]|]+)\|([^\]]+)\]([^\s]*)|(\S+)/g;
  let m;
  while ((m = re.exec(voice))) {
    if (m[4] !== undefined) out.push({display: m[4], spoken: [m[4]]});
    else out.push({display: m[1] + m[3], spoken: (m[2] + m[3]).split(/\s+/)});
  }
  return out;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const d = await loadData();
  const scenes = d.SCENES.map((s) => ({...s, tokens: tokenize(s.voice)}));
  const out = {
    fps: d.FPS,
    duration: d.DURATION,
    audio: d.AUDIO_SETTINGS,
    voiceFile: d.voiceFile,
    musicFile: d.musicFile,
    musicPianoFile: d.musicPianoFile,
    publishDate: d.publishDate,
    waitStart: d.WAIT_START,
    scenes,
    displayTerms: d.DISPLAY_TERMS,
    spokenOnly: d.SPOKEN_ONLY,
    photoSlots: d.PHOTO_SLOTS,
    photoQueries: d.PHOTO_QUERIES,
    brollQueries: d.brollQueries,
    brollRules: d.BROLL_RULES,
    parallax: d.PARALLAX,
  };
  fs.writeFileSync(path.join(ROOT, 'public/gen/f35_script.json'), JSON.stringify(out, null, 2));
  console.log(`public/gen/f35_script.json: ${scenes.length} sahne, ${scenes.reduce((a, s) => a + s.tokens.length, 0)} kelime`);
}
