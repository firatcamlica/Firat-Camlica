# arkaplan-remotion · twitter-savasi

"Birinci Twitter Savaşı: Türkler ve Çinliler X'te" Reels'i (1080x1920, 30 fps).

```bash
npm install
npm run tw:render      # prep (ses, BPM, cue) → render → loudnorm → kapaklar + QA kareleri
npm run studio         # Remotion Studio
```

- Metinler, süreler, kaynaklar: `src/data/twitter-savasi.ts`
- Seslendirme cue'ları (orijinal ses zamanı): `tools/voice_cues_tw.json`
- Ses: `public/voiceover_tw.mp3`, `public/music_tw.mp3`, isteğe bağlı `public/sfx/{whoosh,stamp,scratch}.mp3`
- Ekran görüntüleri: `public/tweets/` (dosya yoksa kart tipografik kalır)
- Teslim dosyaları ve rapor: `çin_arkaplan/`
