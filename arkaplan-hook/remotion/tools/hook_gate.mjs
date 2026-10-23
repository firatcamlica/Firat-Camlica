// Hook kalite kapısı (VERIFY.md → "İlk 1,5 sn"): 0., 15. ve 45. kareyi çeker, metin/hareket/ses kontrolünü raporlar.
// Kullanım:
//   node tools/hook_gate.mjs <kompozisyon-id> [--video out/x.mp4] [--sfx public/sfx/hook_whoosh.wav]
//                            [--music public/music.mp3 --music-db -10] [--subtitle-top 1300]
// --music-db: hook sırasında müziğe uygulanan toplam kazanç (kompozisyondaki seviye + hookMusicDb, ör. -10 + -8 = -18).
// Çıktı: out/hook_qa/<id>/kare_00.jpg, kare_15.jpg, kare_45.jpg, qa_00.png, RAPOR.md. Çıkış kodu 1 = kapı geçmedi.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const id = args[0];
if (!id || id.startsWith('--')) {
  console.error('kullanım: node tools/hook_gate.mjs <kompozisyon-id> [--video …] [--sfx …] [--music … --music-db …]');
  process.exit(2);
}
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i > 0 ? args[i + 1] : d;
};
const sfx = opt('sfx', 'public/sfx/hook_whoosh.wav');
const video = opt('video');
const music = opt('music');
const musicDb = Number(opt('music-db', '0'));
const subtitleTop = Number(opt('subtitle-top', '1300'));

const DEFAULT_BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.BROWSER || (existsSync(DEFAULT_BROWSER) ? DEFAULT_BROWSER : undefined);
const dir = `out/hook_qa/${id}`;
mkdirSync(dir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id, browserExecutable, logLevel: 'error'});
const {width: W, height: H, fps} = comp;
const FRAMES = [0, 15, 45];

const still = async (frame, output, inputProps = {}) => {
  const c = await selectComposition({serveUrl, id, browserExecutable, inputProps, logLevel: 'error'});
  const fmt = output.endsWith('.png') ? {imageFormat: 'png'} : {imageFormat: 'jpeg', jpegQuality: 90};
  await renderStill({composition: c, serveUrl, output, frame, browserExecutable, inputProps, logLevel: 'error', ...fmt});
};
// Ham RGB (W*H*3) — ek bağımlılık yerine ffmpeg ile çözülür
const pixels = (file) => execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], {maxBuffer: W * H * 4});

for (const fr of FRAMES) {
  await still(fr, `${dir}/kare_${String(fr).padStart(2, '0')}.jpg`);
  console.log('ok', `${dir}/kare_${String(fr).padStart(2, '0')}.jpg`);
}
// QA karesi: Hook metni macenta, zemin/filigran gizli
await still(0, `${dir}/qa_00.png`, {...comp.props, hookQa: true});

const rows = [];
const add = (name, ok, detail) => rows.push({name, ok, detail});

// 1) Metin 0. karede ve güvenli alanda
{
  const px = pixels(`${dir}/qa_00.png`);
  let n = 0, x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      if (px[i] > 200 && px[i + 1] < 70 && px[i + 2] > 200) {
        n++;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  add('Metin 0. karede var', n > 500, `${n} metin pikseli`);
  if (n > 500) {
    const ui = {top: 220, bottom: H - 380, left: 72, right: W - 140};
    const crop = {top: (H - 1350) / 2, bottom: (H + 1350) / 2};
    add('Reels güvenli alanı', x0 >= ui.left && x1 <= ui.right && y0 >= ui.top && y1 <= ui.bottom, `metin x ${x0}–${x1}, y ${y0}–${y1}; alan x ${ui.left}–${ui.right}, y ${ui.top}–${ui.bottom}`);
    add('4:5 kapak kırpması', y0 >= crop.top && y1 <= crop.bottom, `metin y ${y0}–${y1}; kırpma y ${crop.top}–${crop.bottom}`);
    add('Altyazı bloğuyla çakışma yok', y1 < subtitleTop, `metin alt ${y1} < altyazı üst ${subtitleTop}`);
  }
}

// 2) Hareket: 0→15 ve 15→45 arasında ortalama piksel farkı
{
  const [a, b, c] = FRAMES.map((fr) => pixels(`${dir}/kare_${String(fr).padStart(2, '0')}.jpg`));
  const diff = (p, q) => {
    let s = 0;
    for (let i = 0; i < p.length; i += 3) s += Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]);
    return s / (p.length / 3) / 3;
  };
  const d1 = diff(a, b), d2 = diff(b, c);
  add('Hareket (0→15 kare)', d1 >= 0.5, `ortalama fark ${d1.toFixed(2)} / 255 (eşik 0,5)`);
  add('Hareket (15→45 kare)', d2 >= 0.5, `ortalama fark ${d2.toFixed(2)} / 255 (eşik 0,5)`);
}

// 3) Ses
const loud = (file, extra = []) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...extra, '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], {encoding: 'utf8'});
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary'));
  return {I: Number(s.match(/I:\s+(-?[\d.]+)/)?.[1]), peak: Number(s.match(/Peak:\s+(-?[\d.]+)/)?.[1])};
};
if (existsSync(sfx)) {
  // kısa ses: ebur128 0,4 sn'lik bloklarla ölçtüğü için 4 kez döngülenmiş kopya ölçülür
  const {I, peak} = loud(sfx, ['-stream_loop', '3']);
  add('Whoosh -18 LUFS civarı', Math.abs(I + 18) <= 2, `${I} LUFS, tepe ${peak} dBTP (hedef -18 ± 2)`);
  if (music) {
    const m = loud(music);
    const eff = m.I + musicDb;
    add('Whoosh müziğin üstünde', I >= eff + 3, `whoosh ${I} LUFS, hook sırasında müzik ${eff.toFixed(1)} LUFS (${m.I} ${musicDb >= 0 ? '+' : ''}${musicDb} dB); en az 3 LU fark`);
  } else add('Whoosh müziğin üstünde', null, '--music verilmedi; ölçülmedi');
} else add('Whoosh dosyası', false, `${sfx} yok (tools/hook_sfx.sh ile üretin)`);
if (video) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-t', '1.5', '-i', video, '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'});
  const max = Number(r.stderr.match(/max_volume:\s+(-?[\d.]+)/)?.[1] ?? -91);
  add('Ses ilk 1,5 sn içinde (render)', max > -40, `tepe ${max} dB (eşik -40 dB)`);
} else add('Ses ilk 1,5 sn içinde (render)', null, '--video verilmedi; yalnızca whoosh dosyası ölçüldü');

const mark = (ok) => (ok === null ? '⚠️ ölçülmedi' : ok ? '✅' : '❌');
const failed = rows.filter((r) => r.ok === false).length;
const md = `# Hook kapısı · ${id}

${fps} fps, ${W}x${H}. Kareler: 0 (0,00 sn), 15 (${(15 / fps).toFixed(2).replace('.', ',')} sn), 45 (${(45 / fps).toFixed(2).replace('.', ',')} sn).

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
${rows.map((r) => `| ${r.name} | ${mark(r.ok)} | ${r.detail} |`).join('\n')}

**${failed ? `GEÇMEDİ (${failed} hata)` : 'GEÇTİ'}**

| 0. kare | 15. kare | 45. kare | QA (metin) |
|---|---|---|---|
| ![](kare_00.jpg) | ![](kare_15.jpg) | ![](kare_45.jpg) | ![](qa_00.png) |

Elle bakılacak: 0. karede logo animasyonu ya da kanal girişi yok; filigran 0. karede görünüyor.
`;
writeFileSync(`${dir}/RAPOR.md`, md);
console.log(md);
process.exit(failed ? 1 : 0);
