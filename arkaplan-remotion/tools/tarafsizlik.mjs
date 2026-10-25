#!/usr/bin/env node
// Carousel metinlerinde yüklü/yargılayıcı kelime taraması ve iki taraflı karelerde uzunluk dengesi.
//   node tools/tarafsizlik.mjs fransa
// Alıntılar (quote) taranmaz: tırnak içindeki söz konuşana aittir. Çıkış kodu 1 = engelleyici bulgu.
import fs from 'node:fs';
import path from 'node:path';

const name = process.argv[2] ?? 'fransa';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// Video verisi (carousel'in kullandığı alt küme) + carousel metinleri
const body = ['', '.carousel']
  .map((x) => path.join(root, 'src/data', `${name}${x}.ts`))
  .filter((f) => fs.existsSync(f))
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');

// engel: yazı dilinde kullanılmaz. dikkat: bağlama göre kabul edilebilir, raporda gösterilir.
// İlk sekiz: Mac'teki scripts/carousel.mjs BANNED listesi (videodaki tarafsızlık kuralı)
const BANNED = ['skandal', 'baskı', 'yasakçı', 'şok', 'kriz', 'gizlice', 'ihanet', 'deldi', 'işbirlikçi', 'türban'];
const BLOCK = [...BANNED,
  'terörist', 'terör', 'vandal', 'çapulcu', 'eşkıya', 'haydut', 'provokatör', 'kışkırtıcı', 'katliam', 'vahşet',
  'vahşi', 'skandal', 'rezalet', 'utanç', 'maalesef', 'ne yazık ki', 'şüphesiz', 'elbette', 'haklı olarak',
  'sözde', 'faşist', 'ırkçı', 'diktatör', 'kahraman', 'aşırı sağ', 'aşırı sol', 'radikal', 'popülist',
  'polis şiddeti', 'rejim', 'yağma', 'zorba', 'yalan', 'iftira',
];
// Teknik ad, sıfat değil: "şok bombası" (stun grenade). Yasak listesinden muaf, raporda gösterilir.
const ALLOW = ['şok bombası'];
const WARN = ['isyan', 'kaos', 'öfke', 'şiddet', 'sarsan', 'iddia', 'suçluyor', 'savunuyor', 'haklı'];

const strings = [];
for (const m of body.matchAll(/(\w+):\s*(['"])((?:\\.|(?!\2).)*)\2/g)) strings.push({key: m[1], text: m[3]});
// anahtarsız (dizi içindeki) metinler
const keyed = new Set(strings.map((s) => s.text));
for (const m of body.matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)) {
  if (!keyed.has(m[2]) && /\s/.test(m[2])) { keyed.add(m[2]); strings.push({key: '[]', text: m[2]}); }
}

const lower = (s) => s.toLocaleLowerCase('tr');
let blocked = 0;
const warns = [];
for (const {key, text} of strings) {
  if (key === 'quote' || key === 'source' || key === 'url' || key === 'photoLine') continue;
  const raw = lower(text);
  const t = ALLOW.reduce((acc, a) => acc.replaceAll(a, '§'), raw);
  for (const a of ALLOW) if (raw.includes(a)) warns.push(`muaf "${a}" → ${text}`);
  for (const w of BLOCK) if (new RegExp(`(^|[^\\p{L}])${w}${w.length >= 5 ? '' : '(?![\\p{L}])'}`, 'u').test(t)) { blocked++; console.log(`ENGEL  "${w}" → ${text}`); }
  for (const w of WARN) if (new RegExp(`(^|[^\\p{L}])${w}`, 'u').test(t)) warns.push(`dikkat "${w}" → ${text}`);
}
console.log(`${strings.length} metin tarandı, ${blocked} engel, ${warns.length} dikkat.`);
for (const w of warns) console.log('  ' + w);

// İki taraflı bloklar: left/right uzunluk karşılaştırması
for (const m of body.matchAll(/left:\s*\{([\s\S]*?)\},\s*right:\s*\{([\s\S]*?)\}/g)) {
  const get = (blk, k) => (blk.match(new RegExp(`${k}:\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`)) ?? [])[2] ?? '';
  const row = (k) => [get(m[1], k).length, get(m[2], k).length];
  console.log('\nİki taraf (sol / sağ, karakter):');
  let tl = 0, tr = 0;
  for (const k of ['title', 'quote', 'text']) {
    const [l, r] = row(k);
    tl += l; tr += r;
    console.log(`  ${k.padEnd(6)} ${String(l).padStart(4)} / ${String(r).padStart(4)}`);
  }
  const ratio = Math.max(tl, tr) / Math.min(tl, tr);
  console.log(`  toplam ${String(tl).padStart(4)} / ${String(tr).padStart(4)}  oran ${ratio.toFixed(2)}`);
  const [nl, nr] = row('text');
  if (Math.max(nl, nr) / Math.min(nl, nr) > 1.25) { blocked++; console.log('  ENGEL  açıklama satırları dengesiz (>1.25)'); }
}
process.exit(blocked ? 1 : 0);
