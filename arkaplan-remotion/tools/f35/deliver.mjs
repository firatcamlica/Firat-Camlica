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
const screen = {
  S1: [d.TEXT.hook],
  S2: [`${d.TEXT.s2.counter.value}${d.TEXT.s2.counter.suffix} ${d.TEXT.s2.counter.label}`, d.TEXT.s2.sub],
  S3: [...d.TEXT.s3.events.map((e) => `${e.date} · ${e.text}`), `parantez: ${d.TEXT.s3.bracket.label}`],
  S4: [`${d.TEXT.s4.left.title}: ${d.TEXT.s4.left.text}`, `${d.TEXT.s4.right.title}: ${d.TEXT.s4.right.text}`, d.TEXT.s4.footer],
  S5: [`${d.TEXT.s5.quote.name} · ${d.TEXT.s5.quote.title} · ${d.TEXT.s5.quote.date}: "${d.TEXT.s5.quote.text}" (özet)`, d.TEXT.s5.rule.text, d.TEXT.s5.rule.footer],
  S6: [d.TEXT.s6.cardA.text, d.TEXT.s6.cardB.text, `${d.TEXT.s6.cardC.name} · ${d.TEXT.s6.cardC.title} · ${d.TEXT.s6.cardC.date}: "${d.TEXT.s6.cardC.text}" (özet)`],
  S7: [`${d.TEXT.s7.left.country} · ${d.TEXT.s7.left.value} ${d.TEXT.s7.left.unit} · ${d.TEXT.s7.left.lines.join(' · ')}`, `${d.TEXT.s7.right.country} · ${d.TEXT.s7.right.value} ${d.TEXT.s7.right.unit} · ${d.TEXT.s7.right.lines.join(' · ')}`],
  S8: [d.TEXT.s8.small, d.TEXT.s8.big, d.TEXT.s8.card],
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
at += `## Ses\n\n- Seslendirme: \`public/${d.voiceFile}\` (${audio.voice ? 'kullanıldı' : 'bu render\'da YOK'}), kanalın kendi kaydı.\n`;
at += `- Müzik: \`public/${d.musicFile}\` (${audio.music ? 'kullanıldı' : 'bu render\'da YOK'}). Lisans bilgisini buraya ekleyin.\n`;
at += `- SFX: ${(audio.sfx ?? []).map((s) => `${s.name} (${s.at} sn, ${s.origin})`).join(', ') || 'yok'}.\n\n`;
at += `## Yazı tipi, harita, model\n\n- Bricolage Grotesque, JetBrains Mono: SIL Open Font License 1.1 (@fontsource).\n- Harita: Natural Earth (kamu malı) · world-atlas (ISC).\n`;
at += used.some(([, p]) => p.fg) ? `- Derinlik: Depth Anything V2 Small (Apache 2.0), yerel.\n` : `- Derinlik (parallax): Depth Anything V2 Small (Apache 2.0) — bu render'da kullanılmadı (fotoğraf yok).\n`;
at += `- Çizimler (hangar, F-35 silüeti, S-400 aracı): kanal için çizildi, temsilîdir.\n`;
fs.writeFileSync(out('ATTRIBUTION.md'), at);
console.log(`out/${d.SLUG}.srt (${(audio.captions ?? []).length} altyazı), out/SOURCES.md (${all.length} kaynak), out/ATTRIBUTION.md`);
