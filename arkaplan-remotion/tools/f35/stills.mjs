// QA kareleri ve kapaklar (turkiye-f35).
//   node tools/f35/stills.mjs [qa|hook|covers|all]
// qa:     out/qa_f35/S1_orta.jpg … S9_orta.jpg (her sahnenin ortası)
// hook:   out/qa_f35/kare_00.jpg, kare_15.jpg, kare_45.jpg
// covers: out/cover_turkiye-f35.jpg (1080x1920), _4x5 (1080x1350), _3x4_onizleme (1080x1440) — merkez kırpma
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

const mode = process.argv[2] ?? 'all';
const CANDIDATES = [
  process.env.BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
];
const browserExecutable = CANDIDATES.find((p) => p && existsSync(p));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
mkdirSync('out/qa_f35', {recursive: true});

const shot = async (id, frame, out) => {
  const comp = await selectComposition({serveUrl, id, browserExecutable, logLevel: 'error'});
  await renderStill({composition: comp, serveUrl, output: out, frame, browserExecutable, imageFormat: 'jpeg', jpegQuality: 90, logLevel: 'error'});
  console.log('ok', out, `kare ${frame}`);
};

if (mode === 'qa' || mode === 'all') {
  const audio = JSON.parse(readFileSync('src/data/f35.audio.json', 'utf8'));
  const ids = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'];
  const comp = await selectComposition({serveUrl, id: 'turkiye-f35', browserExecutable, logLevel: 'error'});
  const total = comp.durationInFrames / comp.fps;
  const starts = ids.map((id) => audio.sceneStarts?.[id]);
  for (let i = 0; i < ids.length; i++) {
    const a = starts[i];
    const b = i + 1 < ids.length ? starts[i + 1] : total;
    await shot('turkiye-f35', Math.min(comp.durationInFrames - 1, Math.round(((a + b) / 2) * comp.fps)), `out/qa_f35/${ids[i]}_orta.jpg`);
  }
  // S8 son 2 sn (alıntı + soru)
  await shot('turkiye-f35', Math.round((audio.sceneStarts.S9 - 1.0) * comp.fps), `out/qa_f35/S8_soru.jpg`);
  // ek: kart/vurgu anları (son durum)
  for (const [name, key, plus] of [['S1_damga', 'S1.stamp', 0.6], ['S3_5gun', 'S3.stamp', 0.6], ['S5_kural', 'S5.law', 1.2], ['S6_kartlar', 'S6.note', 0.8], ['S7_onay', 'S7.stamp', 1.0], ['S8_anahtar', 'S8.keys', 2.0]]) {
    const t = audio.cues?.[key];
    if (t !== undefined) await shot('turkiye-f35', Math.round((t + plus) * comp.fps), `out/qa_f35/${name}.jpg`);
  }
}
if (mode === 'hook' || mode === 'all') {
  for (const fr of [0, 15, 45]) await shot('turkiye-f35', fr, `out/qa_f35/kare_${String(fr).padStart(2, '0')}.jpg`);
}
if (mode === 'covers' || mode === 'all') {
  const full = 'out/cover_turkiye-f35.jpg';
  await shot('cover-turkiye-f35', 0, full);
  const crop = (h, out) => {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', full, '-vf', `crop=1080:${h}:0:${(1920 - h) / 2}`, '-q:v', '2', out]);
    console.log('ok', out);
  };
  crop(1350, 'out/cover_turkiye-f35_4x5.jpg');
  crop(1440, 'out/cover_turkiye-f35_3x4_onizleme.jpg');
}
