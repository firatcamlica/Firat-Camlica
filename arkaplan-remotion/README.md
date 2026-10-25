# arka plan · Fransa carousel (13 kare)

Bu klasör, Mac'teki Remotion projesinin (`scratch-2026-10-18-876791`, "Yemen Husiler bilgi videosu" oturumu)
carousel kısmının bulutta yeniden kurulmuş kopyasıdır. Bileşen adları, API'ler, ölçüler ve kare düzeni o oturumun
kaydındaki dosyalardan alındı: `src/brand/Carousel.tsx`, `SplitCard.tsx`, `QuoteCard.tsx`, `DonutStat.tsx`,
`src/videos/carousel/shared.tsx`, `FransaCarousel.tsx`, `src/data/fransa.carousel.ts`.

```bash
npm install
node tools/carousel.mjs fransa                               # 01.png … 13.png (öncekiler _eski/<zaman>/ altına)
python3 tools/onizleme.py fransa                             # onizleme.png (tek satır) + izgara_onizleme.png (3:4)
node tools/tarafsizlik.mjs fransa                            # yasaklı kelime + iki taraf uzunluk dengesi
node tools/carousel.mjs fransa --qa && python3 tools/kirpma.py fransa   # metin 3:4 kırpmada kalıyor mu
```

## Mac'teki projeye aktarma

Brand dosyalarının çoğunu (tokens, ui, Logo, Photo, DataCard) **kopyalamayın**; buradakiler yaklaşık kopyalardır.
Aktarılacaklar:

| Dosya | Ne yapılacak |
|---|---|
| `src/data/fransa.carousel.ts` | Yeni anahtarlar: `cover.teaser`, `election`, `sameWeek1`, `sameWeek2`, `caption.photoLine`; `sources` 7 satır |
| `src/videos/carousel/FransaCarousel.tsx` | 09, 11, 12 eklendi, 01'e teaser; `FRANSA_SLIDE_COUNT = 13`. `resolvePhotos` importunu `../fransa/context`'ten geri alın |
| `src/videos/carousel/graphics.tsx` | Yeni (buzdolabı + termometre, giriş ekranı) |
| `src/videos/carousel/shared.tsx` | `EndSlide`: `photoCredits[]` yerine tek satır `photoLine` |
| `src/brand/SplitCard.tsx` | `SplitSide.quote?` ve `NEUTRAL_LINE`; satırlar ortak ızgarada (alıntılar aynı hizada) |
| `src/brand/QuoteCard.tsx` | `QuoteLine` dışa açıldı (SplitCard sütununda kullanılıyor) |
| `scripts/carousel.mjs` | `fransa.count: 10 → 13` |

`Headline` bileşeni metni küçük harfe çevirir (Mac'teki kareler böyle); üst etiketler data dosyasında büyük harfle yazılır.
Fotoğraf plakaları (`public/photos`) videodan çıkarıldı; Mac'te asıl dosyalar ve `credits.json` kullanılır.

## Azerbaycan carousel (11 kare)

"Tek millet, iki devlet" videosunun (`azerbaycan_basortusu.mp4`) kareleri + 25 Eki 2026 gelişmesi (Oktay Saral'ın görevden ayrılışı, 09. kare).
Metinler `src/data/azerbaycan.carousel.ts`, kareler `src/videos/carousel/AzerbaycanCarousel.tsx`, uçuş kartı ve zaman çizelgesi `azGraphics.tsx`.

```bash
node tools/carousel.mjs azerbaycan && python3 tools/onizleme.py azerbaycan
node tools/tarafsizlik.mjs azerbaycan
node tools/carousel.mjs azerbaycan --qa && python3 tools/kirpma.py azerbaycan
```

Videoda "doğrulanacak" kalan iki bilgi carousel'de kaynaklandı: hava sahası kuralı ve Herzog uçuşu (Middle East Eye, Flightradar24),
37 gözaltı (Azerbaycan İçişleri Bakanlığı, Medyascope). Saral'ın açıklama tarihi kaynaklarda 12 ve 13 Eki; 13 Eki (Serbestiyet) kullanıldı.
`CarouselFrame` yeni `bg` alanı alır (lacivert koyu kareler); `EndSlide` boş `photoLine` ile fotoğraf satırını gizler.
