# arkaplan-remotion · turkiye-f35

"Türkiye'nin 6 Uçağı Neden 7 Yıldır Hangarda" Reels'i (1080x1920, 30 fps, en fazla 60,0 sn, hedef 56–58 sn).

```bash
npm install
npm run f35:render     # veri → fotoğraf/B-roll/derinlik → ses → render → mux → SRT/kaynak/atıf → kapaklar + QA → VERIFY
npm run studio         # Remotion Studio (hazır master miks çalar)
SKIP_ASSETS=1 npm run f35:render   # fotoğraf/B-roll adımlarını atla
```

## Dosyalar

| Yol | Ne |
|---|---|
| `src/data/f35.ts` | **Tüm içerik**: senaryo (`[ekran\|okunuş]`), sahne süreleri, ekran metinleri, rakamlar, `source`, `PHOTO_SLOTS`, `PHOTO_QUERIES`, `brollQueries`, `musicFile`, sahne bazında `musicLevel` |
| `src/data/f35.audio.json` | Üretilir (`tools/f35/prep_audio.py`): sahne başlangıçları, kelime/altyazı zamanları, cue'lar, BPM, SFX, maskeleme |
| `src/data/f35.assets.json` | Üretilir: kullanılan fotoğraf, derinlik katmanı ve B-roll dosyaları |
| `src/videos/f35/` | Kompozisyon (`turkiye-f35`), sahneler, kapak, vektör çizimler |
| `src/brand/` | Marka bileşenleri (aşağıda) |
| `tools/f35/` | Hat: `data.mjs`, `fetch_photos.py`, `fetch_broll.py`, `depth.py`, `prep_audio.py`, `render.sh`, `deliver.mjs`, `stills.mjs`, `verify.mjs`, `verify_media.py` |
| `out/` | Teslim: `turkiye-f35.mp4`, `.srt`, üç kapak, `ATTRIBUTION.md`, `SOURCES.md`, `VERIFY.md`, `qa_f35/` |

## Girdi dosyaları (public/, repoya girmez)

- `public/voiceover_f35.mp3` — kanalın kaydı. `atempo=1.05`, 0,45 sn'den uzun sessizlikler 0,25 sn'ye iner; sahne zamanları bu işlenmiş sesten hesaplanır.
- `public/music_f35.mp3` — yoksa uyarı verir, render durmaz.
- `public/sfx/f35_{whoosh,tick,lock}.wav` — isteğe bağlı (ör. `motion-showreel/scripts/sfx.mjs` çıktısı). Yoksa `prep_audio.py` sentezler.
- `.env` → `PEXELS_API_KEY`, `PIXABAY_API_KEY` (yoksa B-roll atlanır).
- Kelime zamanları için: `pip install faster-whisper` (yoksa tahmini dağıtım). Derinlik için: `pip install torch transformers pillow` (Mac'te MPS kullanılır).
- BPM: `pip install librosa` (yoksa `aubio`). Yüz taraması: `pip install opencv-python-headless`.

## Marka bileşenleri

Mevcut: `Hook`, `SplitCard`, `QuoteCard` (`summary` → "özet" etiketi eklendi), `DonutStat`, `Logo`, `EndCard`, `tokens`.
Yeni (yeniden kullanılabilir): `Timeline` (dikey çizelge + süre parantezi), `RegionMap` (Natural Earth; vurgu, kesikli ok + uç etiketi, kilitli bağlantı),
`Captions` + `SourceLine`, `NumberBlock` (hook sayacı stili), `Lock` (`LockIcon`, `RuleCard`), `Media` (`DuotoneDefs`, `ParallaxPhoto`, `BrollClip`, `MediaLabel`).
`Hook` artık `background: {kind: 'node'}` ve `centerCounter` (0'dan sayıp `stopFrame`'de duran sayaç) kabul eder.

## Mac'teki projeye aktarma

Bu klasör bulutta kuruldu; Mac'teki projenin `src/brand` dosyaları buradakilerden farklıysa **onları koruyun** ve yalnızca şunları ekleyin:
`src/data/f35.ts`, `src/data/f35.audio.json`, `src/data/f35.assets.json`, `src/videos/f35/`, `tools/f35/`, yeni brand dosyaları
(`Timeline`, `RegionMap`, `Captions`, `NumberBlock`, `Lock`, `Media`) ve `Hook`/`QuoteCard`/`SplitCard`'daki ekler (`centerCounter`, `summary`, `size="xl"`).
`Root.tsx`'e `turkiye-f35` kompozisyonunu ve `cover-turkiye-f35` still'ini ekleyin. Diğer videoların dosyalarına dokunulmadı.

Siteye ekleme: `node scripts/sync-sources.mjs <bu-klasör> f35 turkiye-f35` (arkaplan reposu).
