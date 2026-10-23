# arka plan · hook kuralı

Her Arka Plan videosunun ilk 3 saniyesi için kalıcı kural: skill adımı, Remotion bileşeni ve kalite kapısı.
Fransa videosunun kompozisyonuna, verisine ve Root'una dokunulmaz; kurulum yalnızca yeni dosya ekler.

```
skill/HOOK.md            ← video-preprod SKILL.md'ye eklenen "HOOK" adımı (araştırma → HOOK → seslendirme)
skill/insert_hook.py     ← bölümü doğru yere ekler / yerinde yeniler (işaretli blok, .bak yedeği)
remotion/src/brand/Hook.tsx   ← bileşen (Mac projesine kopyalanan tek kaynak dosya)
remotion/tools/hook_sfx.sh    ← sfx.mjs whoosh'unu 0,5 sn / -18 LUFS yapar
remotion/tools/hook_gate.mjs  ← 0., 15., 45. kare + metin/hareket/ses kontrolü → RAPOR.md
remotion/VERIFY.hook.md       ← VERIFY.md'ye eklenen kapı bölümü
remotion/src/demo, Root.tsx   ← yalnızca demo (kopyalanmaz)
ornek_rapor/                  ← iki demo kompozisyonun kapı raporu
kur.sh                        ← hepsini Mac'e kurar
```

## Mac'e kurulum

```bash
export PATH="$HOME/.local/share/node-v22.23.3-darwin-arm64/bin:$PATH"
# 1) whoosh'u motion-showreel ile üretin (sfx.mjs'in kendi kullanımına göre), sonra:
WHOOSH=~/projeler/motion-showreel/<whoosh-çıktısı>.wav bash arkaplan-hook/kur.sh ~/Desktop/ArkaPlan/remotion
```

`kur.sh` sırasıyla:
1. `~/projeler/video-skills/video-preprod/SKILL.md`: HOOK adımını "Seslendirme" başlığının önüne ekler
   (numaralı başlıklarda HOOK o numarayı alır, sonrakiler bir kayar; eski dosya `SKILL.md.bak`).
2. Skill klasörünü `~/.claude/skills/video-preprod/` altına kopyalar.
3. Remotion projesine `src/brand/Hook.tsx`, `tools/hook_gate.mjs`, `tools/hook_sfx.sh` kopyalar;
   `WHOOSH` verildiyse `public/sfx/hook_whoosh.wav` üretir.
4. Bulduğu her `VERIFY.md`'ye (Remotion kökü, skill klasörü, video-skills kökü) hook kapısını ekler; yoksa Remotion kökünde oluşturur.
5. `tsc --noEmit` çalıştırır.

Tekrar çalıştırmak güvenli: işaretli bloklar yerinde yenilenir. Fransa carousel şablonunun kopyasında
denendi: `src/` altında yalnızca `Hook.tsx` eklendi, diğer dosyaların özeti değişmedi, `tsc` temiz.

## Bileşen

```tsx
import {Hook, hookFrames, hookMusicDb} from '../brand/Hook';

<Sequence from={0} durationInFrames={hookFrames(fps)} name="hook">
  <Hook text={TEXT.hook.screen} background={{kind: 'photo', src: 'photos/x.jpg', credit: 'Foto: …'}} />
  {/* ya da background={{kind: 'counter', value: 5060, suffix: ''}} */}
</Sequence>
// müzik: volume={(f) => musicGain(f / fps) * db(hookMusicDb(f / fps))}
```

| Kural | Nasıl sağlanıyor |
|---|---|
| Süre 3 sn | `hookFrames(fps)` = 90 kare (30 fps) |
| Metin 0. karede, fade yok | opaklık hep 1; yalnızca ölçek 0,86 → 1, 6 kare |
| Arka planda hareket | Ken Burns 1,04 → 1,16 ya da 0'dan 1,8 sn'de sayan rakam (tam sayı zorunlu) |
| Whoosh ilk 0,5 sn | 15 karelik `Sequence`, son 3 karede söner; `hookMusicDb` müziği o sürede 8 dB indirir |
| ≤ 10 kelime, ondalık yok | `checkHookText` uymayan metinde render'ı durdurur ("3.700" binlik sayılır, "86,7" ondalık) |
| ≥ 88 px, güvenli alan | 140 → 88 px arası sığan en büyük punto; sığmazsa hata. Bölge x 72–940, y 325–1260 |
| Altyazı ve 4:5 | Bölge altyazı üstünden (varsayılan 1300, `subtitleTop`) ve 4:5 kırpmadan (y 285–1635) 40 px içeride |
| Filigran 0. kareden | `<Watermark />` (kompozisyonda ortak filigran varsa `watermark={false}`) |

Metin alanı (1080×1920):

```
  0 ┌──────────────────────────┐
220 │ ── Reels üst arayüzü ──  │  filigran 236
285 │ ┄┄ 4:5 kapak üst kenarı  │
325 │ ┌──────── hook ────────┐ │
    │ │  metin (≥ 88 px)     │ │  x 72–940
    │ │  [sayaç: altta]      │ │
1260│ └──────────────────────┘ │
1300│ ── altyazı bloğu ──      │
1540│ ── Reels alt arayüzü ──  │
1635│ ┄┄ 4:5 kapak alt kenarı  │
1920└──────────────────────────┘
```

## Kapı

```bash
node tools/hook_gate.mjs <id> --video out/<video>.mp4 --music public/<müzik> --music-db <hook sırasında dB>
```

Demo sonuçları (`ornek_rapor/`, sentetik müzik ve whoosh ile):

| Kontrol | foto | sayaç |
|---|---|---|
| Metin 0. karede | ✅ 93.733 px | ✅ 65.009 px |
| Metin y aralığı (güvenli 325–1260) | 543–1042 | 348–677 |
| Hareket 0→15 / 15→45 (eşik 0,5) | 16,2 / 2,5 | 11,8 / 3,1 |
| Whoosh | -18 LUFS | -18 LUFS |
| Render ilk 1,5 sn tepe | -8,7 dB | -8,7 dB |

Yerelde deneme: `cd remotion && npm install && node tools/hook_gate.mjs hook-demo-foto`
(önce `bash tools/hook_sfx.sh <whoosh>` ile `public/sfx/hook_whoosh.wav` üretin; ses dosyaları repoya girmez).
