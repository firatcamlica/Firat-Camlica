# arka plan · Remotion carousel

Instagram carousel kareleri (1080×1350, 4:5). Görsel dil Fransa videosundan (18 Eki 2026) alındı:
Bricolage Grotesque + JetBrains Mono, krem `#F1EDE5`, mavi `#264CCF`, kırmızı `#E1000F`, koyu `#161616`.

```bash
npm install
node tools/carousel.mjs fransa          # out/carousel/fransa/01.png … 13.png (öncekiler _eski/<zaman>/ altına taşınır)
python3 tools/onizleme.py fransa        # out/carousel/fransa/onizleme.png (kırmızı kesikli çizgi = 3:4 ızgara kırpması)
node tools/tarafsizlik.mjs fransa       # kelime taraması + iki taraflı karelerde uzunluk dengesi
node tools/carousel.mjs fransa --qa && python3 tools/kirpma.py fransa   # metin 3:4 kırpmada kalıyor mu
```

- Metinler: `src/data/fransa.ts` → `carousel`. Büyük harfli etiketler orada doğru yazılır; bileşenlerde `text-transform` yok.
- Marka: `src/brand` (`Frame`, `Label`, `Title` ≥64 px, `Body` ≥36 px, `Mark`, `QuoteCard`, `SplitCard`). Boyut alt sınırının altına inen başlık ya da gövde render'ı durdurur.
- `SplitCard` iki tarafı tek ızgarada çizer: aynı genişlik, aynı font, aynı nötr üst çizgi, aynı animasyon; taraf başına renk parametresi yoktur.
- Fotoğraf plakaları (`public/photos`) videodaki karelerden çıkarıldı (bu ortamdan Wikimedia'ya erişim yoktu). Asıl dosyalar elinizdeyse aynı adla değiştirin; `Frame`'deki `photoY` kırpma ofsetini ayarlayın.
- `fransa.ts` yalnızca carousel alanını içerir; `arkaplan/scripts/sync-sources.mjs`'i bu dosyayla çalıştırmayın, video kaynakları silinir. Asıl projedeki `fransa.ts`'e `carousel` alanını taşıyın.
