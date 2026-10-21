#!/usr/bin/env node
// Carousel karelerini PNG olarak çıkarır.
//   node tools/carousel.mjs fransa            → out/carousel/fransa/01.png … 13.png
//   node tools/carousel.mjs fransa --qa       → out/carousel/fransa/_kontrol/qa-XX.png (yalnızca metin, şeffaf zemin)
// Önceki kareler silinmez, out/carousel/<ad>/_eski/<zaman>/ altına taşınır.
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const name = process.argv[2] ?? 'fransa';
const qa = process.argv.includes('--qa');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'out/carousel', name);
const SLIDE_FRAMES = 45;

const browser = process.env.BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(browser) ? browser : null;

fs.mkdirSync(outDir, {recursive: true});
if (!qa) {
  const old = fs.readdirSync(outDir).filter((f) => /^\d\d\.png$/.test(f) || f === 'onizleme.png');
  if (old.length) {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const dest = path.join(outDir, '_eski', stamp);
    fs.mkdirSync(dest, {recursive: true});
    for (const f of old) fs.renameSync(path.join(outDir, f), path.join(dest, f));
    console.log(`${old.length} eski dosya taşındı → ${path.relative(root, dest)}`);
  }
}

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {qa};
const composition = await selectComposition({serveUrl, id: `${name}-carousel`, inputProps, browserExecutable});
const count = composition.durationInFrames / SLIDE_FRAMES;
const target = qa ? path.join(outDir, '_kontrol') : outDir;
fs.mkdirSync(target, {recursive: true});

for (let i = 0; i < count; i++) {
  const file = path.join(target, `${qa ? 'qa-' : ''}${String(i + 1).padStart(2, '0')}.png`);
  await renderStill({
    serveUrl,
    composition,
    inputProps,
    frame: i * SLIDE_FRAMES + SLIDE_FRAMES - 1,
    output: file,
    imageFormat: 'png',
    browserExecutable,
    overwrite: true,
  });
  console.log(path.relative(root, file));
}
