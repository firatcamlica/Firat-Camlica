// Vuruş başına bir kare: cephe-morph kontak sayfası. Kullanım: node tools/morph_sheet.mjs [9x16|1x1|16x9 ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const ratios = process.argv.slice(2).length ? process.argv.slice(2) : ['9x16', '1x1', '16x9'];
const DEFAULT_BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.BROWSER || (existsSync(DEFAULT_BROWSER) ? DEFAULT_BROWSER : undefined);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const B = 0.5; // 120 BPM
for (const r of ratios) {
  const dir = `out/morph_sheet/${r}`;
  mkdirSync(dir, {recursive: true});
  const comp = await selectComposition({serveUrl, id: `cephe-morph-${r}`, browserExecutable});
  const beats = Math.floor(comp.durationInFrames / comp.fps / B);
  for (let i = 0; i <= beats; i++) {
    const frame = Math.min(comp.durationInFrames - 1, Math.round((i * B + (i === beats ? 0 : 0.42 * B)) * comp.fps));
    await renderStill({composition: comp, serveUrl, output: `${dir}/b${String(i).padStart(2, '0')}.jpg`, frame, browserExecutable, imageFormat: 'jpeg', jpegQuality: 85});
  }
  // İlk ve son kare eşit mi?
  await renderStill({composition: comp, serveUrl, output: `${dir}/first.png`, frame: 0, browserExecutable, imageFormat: 'png'});
  await renderStill({composition: comp, serveUrl, output: `${dir}/last.png`, frame: comp.durationInFrames - 1, browserExecutable, imageFormat: 'png'});
  const cols = r === '16x9' ? 5 : 7;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', `${dir}/b*.jpg`, '-vf', `scale=${r === '16x9' ? 480 : 300}:-1,tile=${cols}x${Math.ceil((beats + 1) / cols)}:padding=6:color=0x333333`, `out/morph_sheet/sheet_${r}.jpg`]);
  console.log('ok', r, beats + 1, 'kare');
}
