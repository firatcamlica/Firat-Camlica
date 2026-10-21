// QA kareleri ve kapaklar.
// Kullanım: node tools/stills_tw.mjs [qa|covers|all] [ek-kare-saniyeleri...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const mode = process.argv[2] ?? 'all';
const extra = process.argv.slice(3).map(Number);
const DEFAULT_BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.BROWSER || (existsSync(DEFAULT_BROWSER) ? DEFAULT_BROWSER : undefined);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

if (mode === 'qa' || mode === 'all') {
  mkdirSync('out/qa_tw', {recursive: true});
  const comp = await selectComposition({serveUrl, id: 'twitter-savasi', browserExecutable});
  const audio = JSON.parse((await import('node:fs')).readFileSync('src/data/twitter-savasi.audio.json', 'utf8'));
  const def = [0, 3.5, 12, 21, 31, 42, 50, 60, 65];
  const starts = audio.sceneStarts ? [...audio.sceneStarts, audio.totalSeconds] : def;
  const shots = starts.slice(0, -1).map((s, i) => [`S${i}_orta`, (s + starts[i + 1]) / 2]);
  extra.forEach((s) => shots.push([`t${s.toFixed(1)}`, s]));
  for (const [name, sec] of shots) {
    const frame = Math.min(comp.durationInFrames - 1, Math.round(sec * comp.fps));
    const out = `out/qa_tw/${name}.jpg`;
    await renderStill({composition: comp, serveUrl, output: out, frame, browserExecutable, imageFormat: 'jpeg', jpegQuality: 88});
    console.log('ok', out, `kare ${frame}`);
  }
}
if (mode === 'covers' || mode === 'all') {
  for (const [id, out] of [
    ['cover-tw', 'out/cover_tw.jpg'],
    ['cover-tw-4x5', 'out/cover_tw_4x5.jpg'],
  ]) {
    const comp = await selectComposition({serveUrl, id, browserExecutable});
    await renderStill({composition: comp, serveUrl, output: out, browserExecutable, imageFormat: 'jpeg', jpegQuality: 92});
    console.log('ok', out);
  }
}
