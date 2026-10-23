// Teslim metinleri: out/turkiye-f35.srt, out/SOURCES.md, out/ATTRIBUTION.md
//   node tools/f35/deliver.mjs
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, loadData} from './data.mjs';

const d = await loadData();
const read = (p, def) => (fs.existsSync(path.join(ROOT, p)) ? JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')) : def);
const audio = read('src/data/f35.audio.json', {});
const assets = read('src/data/f35.assets.json', {photos: {}, broll: {}});
const photoCredits = read('public/photos/credits.json', {photos: []}).photos;
const clipCredits = read('public/broll/credits.json', {clips: []}).clips;
const out = (f) => path.join(ROOT, 'out', f);
fs.mkdirSync(path.join(ROOT, 'out'), {recursive: true});

// --- SRT -------------------------------------------------------------------
const ts = (t) => {
  const ms = Math.round(t * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const lines = (text) => {
  // en fazla iki satır, dengeli
  if (text.length <= 32) return text;
  const words = text.split(' ');
  let best = 1;
  let cost = Infinity;
  for (let k = 1; k < words.length; k++) {
    const c = Math.abs(words.slice(0, k).join(' ').length - words.slice(k).join(' ').length);
    if (c < cost) [best, cost] = [k, c];
  }
  return `${words.slice(0, best).join(' ')}\n${words.slice(best).join(' ')}`;
};
const srt = (audio.captions ?? []).map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${lines(c.text)}\n`).join('\n');
fs.writeFileSync(out(`${d.SLUG}.srt`), srt);

// --- SOURCES.md --------------------------------------------------------------
const T = d.TEXT;
const screen = {
  S1: [`"${T.quote.text}" — ${T.quote.author} · ${T.quote.work} (edebi epigraf)`, T.hook, `damga: ${T.stamps.wait}`],
  S2: [T.s2.kicker, `${T.s2.counter.value}${T.s2.counter.suffix} ${T.s2.counter.label}`, T.s2.sub, 'ilerleme: SİPARİŞ 2002 ✓ · ÜRETİM 2018 ✓'],
  S3: [T.s3.kicker, T.s3.note, `${T.s3.calendar.from} → ${T.s3.calendar.to} ${T.s3.calendar.month}`, T.s3.big, `damga: ${T.stamps.stopped}`],
  S4: [T.s4.kicker, `${T.s4.left.title}: ${T.s4.left.text}`, `${T.s4.right.title}: ${T.s4.right.text}`, T.s4.footer],
  S5: [T.s5.kicker, `${T.s5.quote.name} · ${T.s5.quote.title} · ${T.s5.quote.date}: "${T.s5.quote.text}" (özet)`, `damga: ${T.stamps.extra}`, T.s5.rule, T.s5.footer],
  S6: [T.s6.wait, ...[T.s6.left, T.s6.right].map((p) => `${p.pkg} · ${p.name} · Konum: ${p.location} · Son güncelleme: ${p.updated} · ${T.stamps.wait} · ${p.note}`)],
  S7: [T.s7.kicker, T.s7.press, T.s7.qatarNote, `damga: ${T.stamps.approval}`, `${T.s7.lavrov.name} · ${T.s7.lavrov.title} · ${T.s7.lavrov.date}: "${T.s7.lavrov.text}" (özet)`],
  S8: [T.s8.kicker, ...T.s8.lines, `anahtarlar: ${T.s8.keys.join(' · ')}`, T.s8.question],
};
const all = [];
let md = `# Kaynaklar · ${d.TITLE}\n\nSlug: \`${d.SLUG}\` · Site: https://arkaplan.pages.dev/#${d.SLUG}\n\n`;
md += `Kaynak adları \`src/data/f35.ts\` içindeki \`source\` alanlarından gelir (site için \`arkaplan/scripts/sync-sources.mjs\` aynı alanları okur). Bağlantılar boş: yayından önce her kaynağa URL eklenmeli.\n\n`;
for (const s of d.SCENES) {
  if (!s.source) continue;
  const names = s.source.replace(/^\s*Kaynak:\s*/i, '').split(';').map((x) => x.trim());
  names.forEach((n) => all.includes(n) || all.push(n));
  md += `## ${s.id} · ${s.name}\n\nEkrandaki iddialar:\n${(screen[s.id] ?? []).map((x) => `- ${x}`).join('\n')}\n\nKaynak: ${names.join(' · ')}\n\n`;
}
md += `## Tüm kaynaklar (${all.length})\n\n| Kaynak | Tarih | URL |\n|---|---|---|\n${all.map((n) => `| ${n.replace(/,\s*\d.*$|,\s*(Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara).*$/, '')} | ${(n.match(/\d{1,2} \S+ 20\d\d|(?:Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara) 20\d\d/) ?? [''])[0]} | |`).join('\n')}\n`;
md += `\n## Alıntı\n\n- Ahmet Hamdi Tanpınar, *Huzur*, 1949, birinci bölüm: "Şark oturup beklemenin yeridir." (edebi epigraf; kişi ya da ülke yorumu olarak sunulmaz)\n`;
md += `\nHarita verisi: Natural Earth 1:50m (kamu malı), world-atlas paketi üzerinden.\n`;
fs.writeFileSync(out('SOURCES.md'), md);

// --- ATTRIBUTION.md ----------------------------------------------------------
const used = Object.entries(assets.photos ?? {});
let at = `# Atıflar · ${d.TITLE}\n\n## Fotoğraflar\n\n`;
if (!used.length) at += `Bu render'da fotoğraf kullanılmadı (Commons erişilemedi ya da uygun lisanslı aday bulunamadı); sahneler vektör çizimle ("ÇİZİM" etiketi) üretildi.\n\n`;
else {
  at += `| Sahne slotu | Dosya | Yazar | Lisans | Kaynak |\n|---|---|---|---|---|\n`;
  for (const [id] of used) {
    const c = photoCredits.find((x) => x.id === id) ?? {};
    const slots = Object.entries(d.PHOTO_SLOTS).filter(([, v]) => v === id).map(([k]) => k).join(', ');
    at += `| ${slots} | ${c.title ?? id} | ${c.author ?? '?'} | [${c.license ?? '?'}](${c.licenseUrl ?? ''}) | ${c.source ?? ''} |\n`;
  }
  at += '\n';
}
const clips = Object.values(assets.broll ?? {}).flat().map((b) => clipCredits.find((c) => c.file === b.file)).filter(Boolean);
at += `## Stok videolar (B-roll)\n\n`;
at += clips.length
  ? `| Sahne | Sorgu | Kaynak sayfa | Yazar | Lisans | İndirme | Yüz kontrolü |\n|---|---|---|---|---|---|---|\n${clips.map((c) => `| ${c.scene} | ${c.query} | ${c.pageUrl} | ${c.author} | [${c.license}](${c.licenseUrl}) | ${c.downloaded} | ${c.faceCheck} |`).join('\n')}\n\n`
  : `Kullanılmadı (PEXELS_API_KEY / PIXABAY_API_KEY yok ya da uygun klip bulunamadı).\n\n`;
at += `## Ses\n\n- Seslendirme: \`public/${d.voiceFile}\` (${audio.voice ? 'kullanıldı' : 'bu render\'da YOK'}), ElevenLabs ile üretildi (ses: Derya), kanalın kaydı.\n`;
at += `- Müzik: \`public/${d.musicFile}\` (${audio.music ? 'kullanıldı' : 'bu render\'da YOK'}). Lisans bilgisini buraya ekleyin.\n`;
at += `- SFX: ${(audio.sfx ?? []).map((s) => `${s.name} (${s.at} sn, ${s.origin})`).join(', ') || 'yok'}.\n\n`;
at += `## Yazı tipi, harita, model\n\n- Bricolage Grotesque, JetBrains Mono, Playfair Display: SIL Open Font License 1.1 (@fontsource).\n- Harita: Natural Earth (kamu malı) · world-atlas (ISC).\n`;
at += used.some(([, p]) => p.fg) ? `- Derinlik: Depth Anything V2 Small (Apache 2.0), yerel.\n` : `- Derinlik (parallax): Depth Anything V2 Small (Apache 2.0) — bu render'da kullanılmadı (fotoğraf yok).\n`;
at += `- Çizimler (F-35 silüeti S2'de; takip ekranı öğeleri): kanal için çizildi, temsilîdir.\n`;
fs.writeFileSync(out('ATTRIBUTION.md'), at);
console.log(`out/${d.SLUG}.srt (${(audio.captions ?? []).length} altyazı), out/SOURCES.md (${all.length} kaynak), out/ATTRIBUTION.md`);
