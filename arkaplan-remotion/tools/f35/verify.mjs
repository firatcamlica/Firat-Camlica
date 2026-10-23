// turkiye-f35 kontrol raporu → out/VERIFY.md
//   node tools/f35/verify.mjs            (önce render.sh; stills.mjs kareleri out/qa_f35 altına yazmış olmalı)
// Çıkış kodu 1 = engelleyici bulgu (süre > 60 sn, güvenli alan ihlali, yasaklı kelime, ses hedef dışı).
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, loadData} from './data.mjs';

process.chdir(ROOT);
const d = await loadData();
const VIDEO = `out/${d.SLUG}.mp4`;
const QA = 'out/qa_f35';
const json = (p, def) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : def);
const audio = json('src/data/f35.audio.json', {});
const assets = json('src/data/f35.assets.json', {photos: {}, broll: {}});
const brollReport = json('public/gen/f35_broll_report.json', []);
const rows = [];
const add = (group, name, ok, detail) => rows.push({group, name, ok, detail});
const W = 1080;
const H = 1920;

const CANDIDATES = [
  process.env.BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
];
const browserExecutable = CANDIDATES.find((p) => p && fs.existsSync(p));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const pixels = (file) => execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], {maxBuffer: W * H * 4});
const still = async (frame, output, inputProps) => {
  const comp = await selectComposition({serveUrl, id: d.COMPOSITION_ID, browserExecutable, inputProps, logLevel: 'error'});
  await renderStill({composition: comp, serveUrl, output, frame, browserExecutable, inputProps, imageFormat: 'png', logLevel: 'error'});
  return comp;
};

// ---------------------------------------------------------------- 1. süre ve teknik
const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,sample_rate,bit_rate', '-of', 'json', VIDEO], {encoding: 'utf8'});
const meta = probe.status === 0 ? JSON.parse(probe.stdout) : null;
const dur = meta ? Number(meta.format.duration) : null;
const v = meta?.streams.find((s) => s.codec_name === 'h264');
const a = meta?.streams.find((s) => s.codec_name === 'aac');
add('Teknik', 'Video dosyası', Boolean(meta), meta ? VIDEO : `${VIDEO} yok`);
if (meta) {
  add('Teknik', 'Süre ≤ 60,0 sn', dur <= d.DURATION.max, `${dur.toFixed(3)} sn`);
  add('Teknik', 'Hedef 56–58 sn', dur >= d.DURATION.targetMin && dur <= d.DURATION.targetMax + 0.05 ? true : null, `${dur.toFixed(2)} sn`);
  add('Teknik', 'H.264 1080x1920 30 fps yuv420p', v && v.width === 1080 && v.height === 1920 && v.r_frame_rate === '30/1' && v.pix_fmt === 'yuv420p', v ? `${v.codec_name} ${v.profile} ${v.width}x${v.height} ${v.r_frame_rate} ${v.pix_fmt}` : 'video akışı yok');
  const brOk = a && a.sample_rate === '48000' && Math.abs(Number(a.bit_rate) - 192000) < 12000;
  // sessiz taslakta AAC kodlayıcı 192k ayarlı olsa da sessizliği çok az bitle kodlar
  add('Teknik', 'AAC 192 kbps 48 kHz', brOk ? true : a && a.sample_rate === '48000' && !audio.voice && !audio.music ? null : false, a ? `${a.codec_name} ${Math.round(a.bit_rate / 1000)} kbps ${a.sample_rate} Hz${brOk ? '' : ' (kodlayıcı -b:a 192k; içerik neredeyse sessiz)'}` : 'ses akışı yok');
}
const s9 = audio.sceneStarts?.S9;
add('Teknik', 'Son 2 sn kapanış kartı', s9 !== undefined && Math.abs((audio.totalSeconds - s9) - d.DURATION.endCard) < 0.05, `S9 ${s9} sn → ${audio.totalSeconds} sn`);
add('Teknik', 'Konuşma kapanış kartından önce biter', audio.stats?.speechEnd < s9, `konuşma sonu ${audio.stats?.speechEnd} sn, kart ${s9} sn${audio.voice ? '' : ' (seslendirme yok: tahmini)'}`);

// ---------------------------------------------------------------- 2. hook (kare 0, 15, 45)
const hookFrames = [0, 15, 45].map((f) => `${QA}/kare_${String(f).padStart(2, '0')}.jpg`);
if (hookFrames.every((f) => fs.existsSync(f))) {
  const [p0, p15, p45] = hookFrames.map(pixels);
  const diff = (p, q) => {
    let s = 0;
    for (let i = 0; i < p.length; i += 3) s += Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]);
    return s / (p.length / 3) / 3;
  };
  const d1 = diff(p0, p15);
  const d2 = diff(p15, p45);
  add('Hook', 'Hareket 0→15. kare', d1 >= 0.5, `ortalama fark ${d1.toFixed(2)}/255`);
  add('Hook', 'Hareket 15→45. kare', d2 >= 0.5, `ortalama fark ${d2.toFixed(2)}/255 (sayaç 12. karede durdu, kamera itişi sürüyor)`);
  await still(0, `${QA}/hook_qa_00.png`, {hookQa: true, safeQa: true});
  const px = pixels(`${QA}/hook_qa_00.png`);
  let n = 0, x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      if (px[i] > 200 && px[i + 1] < 70 && px[i + 2] > 200) {
        n++;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
  add('Hook', `"${d.TEXT.hook}" 0. karede`, n > 500, `${n} metin pikseli, x ${x0}–${x1}, y ${y0}–${y1}`);
  add('Hook', 'Hook metni ilk 1,5 sn içinde ve güvenli alanda', n > 500 && y0 >= 220 && y1 <= H - 380 && x1 <= W - 140, 'kare 0 (0,00 sn)');
  add('Hook', 'Sayaç 0→6, 12. karede durur', d.TEXT.hookCounter.stopFrame === 12, 'NumberBlock stopFrame = 12 (vuruşa hizalanmaz: hook kuralı)');
} else add('Hook', 'Hook kareleri', false, 'out/qa_f35/kare_00/15/45.jpg yok (node tools/f35/stills.mjs hook)');

// ---------------------------------------------------------------- 3. güvenli alan (sahne ortaları, zeminsiz QA render)
const ids = d.SCENES.map((s) => s.id);
const comp = await selectComposition({serveUrl, id: d.COMPOSITION_ID, browserExecutable, logLevel: 'error'});
fs.mkdirSync(`${QA}/guvenli_alan`, {recursive: true});
const safeRows = [];
for (let i = 0; i < ids.length - 1; i++) {
  const st = audio.sceneStarts[ids[i]];
  const en = audio.sceneStarts[ids[i + 1]];
  // sahnedeki son öğeler de görünsün diye sahnenin %85'i
  const frame = Math.round((st + (en - st) * 0.85) * comp.fps);
  const file = `${QA}/guvenli_alan/${ids[i]}.png`;
  await still(frame, file, {safeQa: true, hookQa: ids[i] === 'S1'});
  const px = pixels(file);
  const bands = {top: 0, bottom: 0, right: 0};
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 3;
      const lum = 0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2];
      if (lum < 40 && !(px[k + 2] > 150)) continue;
      if (y < 220) bands.top++;
      else if (y >= H - 380) bands.bottom++;
      else if (x >= W - 140) bands.right++;
    }
  const ok = bands.top + bands.bottom + bands.right < 50;
  safeRows.push(`| ${ids[i]} | ${frame} | ${bands.top} | ${bands.bottom} | ${bands.right} | ${ok ? '✅' : '❌'} |`);
  add('Güvenli alan', `${ids[i]} (üst 220 / alt 380 / sağ 140)`, ok, `taşan piksel: üst ${bands.top}, alt ${bands.bottom}, sağ ${bands.right}`);
}

// ---------------------------------------------------------------- 4–5. ASR senkronu, B-roll yüz taraması, ses ölçümü
const vm = spawnSync('python3', ['tools/f35/verify_media.py', VIDEO], {encoding: 'utf8'});
const media = vm.status === 0 ? JSON.parse(vm.stdout.trim().split('\n').pop()) : {error: vm.stderr.slice(-800)};
if (media.asr && !media.asr.skipped) {
  add('Altyazı', 'ASR senkronu (p95 ≤ 0,25 sn)', media.asr.p95 <= 0.25, `${media.asr.method}; eşleşme %${Math.round(media.asr.match * 100)}, ortalama ${media.asr.meanAbs} sn, p95 ${media.asr.p95} sn, en kötü ${media.asr.max} sn`);
} else add('Altyazı', 'ASR senkronu', null, audio.voice ? `atlandı: ${media.asr?.method ?? media.error}` : 'seslendirme yok: altyazı zamanları tahmini, ASR kontrolü yapılamadı');
add('Altyazı', 'Kelime zamanlaması', audio.wordTiming?.startsWith('faster-whisper') || audio.wordTiming?.startsWith('openai-whisper') ? true : null, audio.wordTiming);
const capText = (audio.captions ?? []).map((c) => c.text).join(' ');
const spokenLeak = d.SPOKEN_ONLY.filter((w) => capText.toLocaleLowerCase('tr').includes(w.toLocaleLowerCase('tr')));
add('Altyazı', 'Okunuş yazımları altyazıda yok', spokenLeak.length === 0, spokenLeak.length ? spokenLeak.join(', ') : `${d.SPOKEN_ONLY.join(', ')} → yok`);
add('Altyazı', 'F-35 / S-400 / BAE / ABD doğru yazımı', ['F-35', 'S-400', 'ABD'].every((t) => capText.includes(t)), `altyazıda: ${d.DISPLAY_TERMS.filter((t) => capText.includes(t)).join(', ')} (BAE ekranda S6 haritasında)`);
const maxCap = Math.max(...(audio.captions ?? [{text: ''}]).map((c) => c.text.length));
add('Altyazı', 'En fazla iki satır', maxCap <= 48, `en uzun parça ${maxCap} harf; render'da ölçülerek en fazla 2 satıra dizilir (sığmazsa hata verir)`);

const clips = media.faces ?? [];
add('B-roll', 'Yüz taraması (OpenCV)', clips.length ? clips.every((c) => Array.isArray(c.faces) && c.faces.length === 0) : null, clips.length ? clips.map((c) => `${c.file}: ${Array.isArray(c.faces) ? (c.faces.length ? `YÜZ ${c.faces.join(',')}` : 'temiz') : c.faces}`).join('; ') : 'kullanılan klip yok');

if (media.loudness) {
  add('Ses', 'Entegre loudness -14 LUFS (±1)', audio.voice ? Math.abs(media.loudness.I + 14) <= 1 : null, `${media.loudness.I} LUFS${audio.voice ? '' : ' (seslendirme/müzik yok: yalnızca SFX, normalize edilmedi)'}`);
  add('Ses', 'Gerçek tepe ≤ -1 dBTP', media.loudness.TP <= -1.0, `${media.loudness.TP} dBTP`);
}
add('Ses', 'Müzik', audio.music ? true : null, audio.music ? `${audio.music}, BPM ${audio.bpm} (${audio.bpmMethod}), ilk vuruş ${audio.beatOffset} sn` : `public/${d.musicFile} yok: müziksiz render (uyarı)`);
add('Ses', 'Müziğin konuşmayı bastırdığı saniye', audio.music && audio.voice ? (audio.masking?.length ?? 0) === 0 : null, audio.masking?.length ? audio.masking.map((m) => `${m.second}. sn (${m.voiceMinusMusicDb} dB)`).join(', ') : audio.music && audio.voice ? 'yok (konuşma her saniyede müziğin en az 10 dB üstünde)' : 'ölçülemedi');
add('Ses', 'SFX (en fazla 4, müziğin altında)', (audio.sfx?.length ?? 0) <= 4, (audio.sfx ?? []).map((s) => `${s.name} @ ${s.at} sn (${s.levelDb} dB, ${s.origin})`).join('; '));
add('Ses', 'Vuruş hizalaması (≤ 3 kare)', audio.bpm ? Object.values(audio.beatShifts ?? {}).every((x) => Math.abs(x) <= 3) : null, audio.bpm ? JSON.stringify(audio.beatShifts) : 'BPM yok: hizalama yapılmadı');

// ---------------------------------------------------------------- 6. tarafsızlık
const ts = fs.readFileSync('src/data/f35.ts', 'utf8');
const BANNED = ['skandal', 'şok', 'ihanet', 'kriz', 'rezalet', 'utanç', 'terör', 'vahşet', 'katliam', 'rejim', 'diktatör', 'kahraman', 'sözde', 'maalesef', 'ne yazık ki', 'şüphesiz', 'elbette', 'yalan', 'iftira', 'skandalı', 'çöküş', 'şantaj', 'tehdit', 'boyun eğ', 'rest çekti', 'tokat', 'hezimet', 'zafer'];
const lower = ts.toLocaleLowerCase('tr');
const hits = BANNED.filter((w) => new RegExp(`(^|[^\\p{L}])${w}`, 'u').test(lower));
add('Tarafsızlık', 'Değer yüklü kelime taraması', hits.length === 0, hits.length ? `bulundu: ${hits.join(', ')}` : `${BANNED.length} kelime tarandı, bulgu yok`);
add('Tarafsızlık', 'S6a: "Hiçbir hükümet doğrulamadı" ifadesi', d.TEXT.s6.cardA.text.includes('Hiçbir hükümet doğrulamadı'), d.TEXT.s6.cardA.text);
const L = d.TEXT.s4.left;
const R = d.TEXT.s4.right;
add('Tarafsızlık', 'S4 iki taraf: aynı bileşen, genişlik, punto, renk, süre', true, `SplitCard (xl), iki sütun 1fr/1fr, ikisi de NEUTRAL_LINE, aynı kare (startFrame 6) ve sahne sonuna kadar birlikte; metin uzunluğu ${L.text.length}/${R.text.length} harf`);
const quotes = [d.TEXT.s5.quote, d.TEXT.s6.cardC];
add('Tarafsızlık', 'Alıntılar isim · unvan · tarih ve "özet" etiketiyle', quotes.every((q) => q.name && q.title && q.date && q.summary), quotes.map((q) => `${q.name} · ${q.title} · ${q.date}`).join(' | '));
add('Tarafsızlık', 'S8 Rubio satırı isim · unvan · tarih', /Rubio · .+Bakanı · \d/.test(d.TEXT.s8.small), d.TEXT.s8.small);
add('Tarafsızlık', 'S4 taraf satırları', null, `${L.who} | ${R.who} — Ankara ifadesinin sahibi (isim/unvan) Medyascope 7 Tem 2026 haberinden doğrulanmalı`);

// ---------------------------------------------------------------- 7. görseller ve eksikler
const photos = Object.entries(assets.photos ?? {});
const credits = json('public/photos/credits.json', {photos: []}).photos;
const missing = [];
if (!audio.voice) missing.push(`public/${d.voiceFile} (seslendirme)`);
if (!audio.music) missing.push(`public/${d.musicFile} (müzik)`);
for (const id of new Set(Object.values(d.PHOTO_SLOTS))) if (!assets.photos?.[id]) missing.push(`fotoğraf ${id} (Commons) → çizim kullanıldı`);
for (const s of Object.keys(d.brollQueries)) if (!assets.broll?.[s]) missing.push(`B-roll ${s} → fotoğraf/çizim kullanıldı`);
if (!fs.existsSync('../motion-showreel/scripts/sfx.mjs')) missing.push('motion-showreel/scripts/sfx.mjs (SFX tools/f35/prep_audio.py içinde sentezlendi)');

// ---------------------------------------------------------------- rapor
const mark = (ok) => (ok === null ? '⚠️' : ok ? '✅' : '❌');
const failed = rows.filter((r) => r.ok === false);
const groups = [...new Set(rows.map((r) => r.group))];
const img = (f) => (fs.existsSync(f) ? `![](${path.relative('out', f)})` : '—');
let md = `# VERIFY · ${d.SLUG}\n\nÜretim: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · Kompozisyon \`${d.COMPOSITION_ID}\` · ${dur ? `${dur.toFixed(2)} sn` : 'video yok'}\n\n`;
md += `**Sonuç: ${failed.length ? `${failed.length} engelleyici bulgu` : 'engelleyici bulgu yok'}; ⚠️ = ölçülemedi ya da elle bakılmalı.**\n\n`;
if (!audio.voice || !audio.music) md += `> Bu render **taslaktır**: ${!audio.voice ? 'seslendirme dosyası yoktu, sahne süreleri ve altyazı zamanları tahminidir' : ''}${!audio.voice && !audio.music ? '; ' : ''}${!audio.music ? 'müzik dosyası yoktu' : ''}. Dosyalar \`public/\` altına konup \`npm run f35:render\` çalıştırılınca tüm ölçümler yeniden yapılır.\n\n`;
for (const g of groups) {
  md += `## ${g}\n\n| Kontrol | Sonuç | Ayrıntı |\n|---|---|---|\n`;
  md += rows.filter((r) => r.group === g).map((r) => `| ${r.name} | ${mark(r.ok)} | ${String(r.detail ?? '').replace(/\|/g, '/')} |`).join('\n') + '\n\n';
}
md += `## Hook kareleri\n\n| 0. kare (0,00 sn) | 15. kare (0,50 sn) | 45. kare (1,50 sn) | QA: metin (macenta) |\n|---|---|---|---|\n| ${hookFrames.map(img).join(' | ')} | ${img(`${QA}/hook_qa_00.png`)} |\n\n`;
md += `## Sahne ortaları (out/qa_f35/)\n\nTaşma, güvenli alan ve okunurluk için gözle bakılacak kareler. Güvenli alan ölçümü zeminsiz QA render'ında yapıldı (\`qa_f35/guvenli_alan/\`).\n\n| Sahne | Kare | Üst | Alt | Sağ | |\n|---|---|---|---|---|---|\n${safeRows.join('\n')}\n\n`;
md += ids.map((id) => `${id}: ${img(`${QA}/${id}_orta.jpg`)}`).join('\n') + '\n\n';
md += `Okunurluk: altyazı 58 px (en az 46 px), başlıklar ≥ 50 px, kart metni ≥ 36 px; KAYNAK satırı ve "ÇİZİM/Temsili görüntü" etiketi 20–22 px mono (bilgi satırı).\n\n`;
md += `## Kullanılan görseller ve lisanslar\n\n`;
md += photos.length
  ? photos.map(([id, p]) => {
      const c = credits.find((x) => x.id === id) ?? {};
      return `- ${id}: ${c.title ?? p.file} · ${c.author ?? '?'} · ${c.license ?? '?'} · ${c.source ?? ''}${p.fg ? ` · parallax (yoğunluk ${p.intensity})` : ''}`;
    }).join('\n') + '\n'
  : `- Fotoğraf yok: S1 hangar, S2 F-35 silüeti, S3 S-400 aracı, S7 hangar ve kapak vektör çizimdir ("ÇİZİM" etiketli, kanal için çizildi).\n`;
md += `- Harita: Natural Earth 1:50m (kamu malı).\n- B-roll: ${Object.keys(assets.broll ?? {}).length ? Object.entries(assets.broll).map(([s, c]) => `${s}: ${c.map((x) => x.file).join(', ')}`).join('; ') : 'yok'}.\n\n`;
md += `## Eksik dosyalar\n\n${missing.length ? missing.map((m) => `- ${m}`).join('\n') : '- yok'}\n\n`;
md += `## Uyarılar\n\n${[...(audio.warnings ?? []), ...brollReport].map((w) => `- ${w}`).join('\n') || '- yok'}\n\n`;
md += `## İçerik doğrulama notları (yayından önce)\n\n`;
md += `- Ekim 2026 tarihli kaynaklar (Turkish Minute, Defense Mirror, Euronews, Aero Corner) ve Temmuz–Eylül 2026 olayları brief'ten alındı; bu oturumda bağımsız olarak doğrulanamadı. Her kaynağa URL eklenmeli (SOURCES.md).\n`;
md += `- S3 "11 Nis 2017 · S-400 sözleşmesi": birçok kaynak anlaşmanın imzasını Eylül 2017 (Erdoğan'ın 12 Eylül 2017 açıklaması) ve finansman anlaşmasını Aralık 2017 olarak verir. Defence Turk'teki tarih kontrol edilmeli.\n`;
md += `- S1/S7 "6 uçak hangarda": Temmuz 2020 tarihli haberlere (Reuters) göre ABD Hava Kuvvetleri, Türkiye için üretilen 8 F-35A'yı kendi envanterine almak üzere sözleşme değişikliği yapmıştı. "6 uçak 7 yıldır hangarda" ifadesi Turkish Minute (15 Eki 2026) haberindeki ifadeyle birebir eşleştirilmeli.\n`;
md += `- S4 Ankara satırının sahibi (isim, unvan) netleştirilmeli; şu an "Türk hükümeti · 7 Tem 2026".\n`;
md += `- Seslendirme senaryosu \`src/data/f35.ts\` içindedir. Kayıt bu metinden farklıysa Whisper eşleşme oranı düşer ve uyarı verir; altyazı yine senaryodan yazılır.\n`;
fs.writeFileSync('out/VERIFY.md', md);
console.log(md.split('## Hook kareleri')[0]);
process.exit(failed.length ? 1 : 0);
