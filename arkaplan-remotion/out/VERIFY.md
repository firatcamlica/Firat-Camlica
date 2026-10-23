# VERIFY · turkiye-f35

Üretim: 2026-10-23 20:55 UTC · Kompozisyon `turkiye-f35` · 57.97 sn

**Sonuç: engelleyici bulgu yok; ⚠️ = ölçülemedi ya da elle bakılmalı.**

> Bu render **taslaktır**: seslendirme dosyası yoktu, sahne süreleri ve altyazı zamanları tahminidir; müzik dosyası yoktu. Dosyalar `public/` altına konup `npm run f35:render` çalıştırılınca tüm ölçümler yeniden yapılır.

## Teknik

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
| Video dosyası | ✅ | out/turkiye-f35.mp4 |
| Süre ≤ 60,0 sn | ✅ | 57.967 sn |
| Hedef 56–58 sn | ✅ | 57.97 sn |
| H.264 1080x1920 30 fps yuv420p | ✅ | h264 High 1080x1920 30/1 yuv420p |
| AAC 192 kbps 48 kHz | ⚠️ | aac 5 kbps 48000 Hz (kodlayıcı -b:a 192k; içerik neredeyse sessiz) |
| Son 2 sn kapanış kartı | ✅ | S9 55.967 sn → 57.967 sn |
| Konuşma kapanış kartından önce biter | ✅ | konuşma sonu 55.617 sn, kart 55.967 sn (seslendirme yok: tahmini) |

## Hook

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
| Hareket 0→15. kare | ✅ | ortalama fark 9.62/255 |
| Hareket 15→45. kare | ✅ | ortalama fark 4.57/255 (sayaç 12. karede durdu, kamera itişi sürüyor) |
| "6 UÇAK · 7 YILDIR HANGARDA" 0. karede | ✅ | 34445 metin pikseli, x 76–775, y 355–506 |
| Hook metni ilk 1,5 sn içinde ve güvenli alanda | ✅ | kare 0 (0,00 sn) |
| Sayaç 0→6, 12. karede durur | ✅ | NumberBlock stopFrame = 12 (vuruşa hizalanmaz: hook kuralı) |

## Güvenli alan

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
| S1 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |
| S2 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |
| S3 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |
| S4 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |
| S5 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |
| S6 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |
| S7 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |
| S8 (üst 220 / alt 380 / sağ 140) | ✅ | taşan piksel: üst 0, alt 0, sağ 0 |

## Altyazı

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
| ASR senkronu | ⚠️ | seslendirme yok: altyazı zamanları tahmini, ASR kontrolü yapılamadı |
| Kelime zamanlaması | ⚠️ | tahmini (seslendirme yok) |
| Okunuş yazımları altyazıda yok | ✅ | ef otuz beş, es dört yüz, Emirlikler, Amerikan → yok |
| F-35 / S-400 / BAE / ABD doğru yazımı | ✅ | altyazıda: F-35, S-400, ABD (BAE ekranda S6 haritasında) |
| En fazla iki satır | ✅ | en uzun parça 39 harf; render'da ölçülerek en fazla 2 satıra dizilir (sığmazsa hata verir) |

## B-roll

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
| Yüz taraması (OpenCV) | ⚠️ | kullanılan klip yok |

## Ses

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
| Entegre loudness -14 LUFS (±1) | ⚠️ | -28.3 LUFS (seslendirme/müzik yok: yalnızca SFX, normalize edilmedi) |
| Gerçek tepe ≤ -1 dBTP | ✅ | -12.1 dBTP |
| Müzik | ⚠️ | public/music_f35.mp3 yok: müziksiz render (uyarı) |
| Müziğin konuşmayı bastırdığı saniye | ⚠️ | ölçülemedi |
| SFX (en fazla 4, müziğin altında) | ✅ | whoosh @ 0.02 sn (-30 dB, sentez (tools/f35/prep_audio.py)); tick @ 15.54 sn (-30 dB, sentez (tools/f35/prep_audio.py)); lock @ 29.47 sn (-30 dB, sentez (tools/f35/prep_audio.py)) |
| Vuruş hizalaması (≤ 3 kare) | ⚠️ | BPM yok: hizalama yapılmadı |

## Tarafsızlık

| Kontrol | Sonuç | Ayrıntı |
|---|---|---|
| Değer yüklü kelime taraması | ✅ | 28 kelime tarandı, bulgu yok |
| S6a: "Hiçbir hükümet doğrulamadı" ifadesi | ✅ | Türk basını: S-400 Körfez'e satılıyor. Hiçbir hükümet doğrulamadı. |
| S4 iki taraf: aynı bileşen, genişlik, punto, renk, süre | ✅ | SplitCard (xl), iki sütun 1fr/1fr, ikisi de NEUTRAL_LINE, aynı kare (startFrame 6) ve sahne sonuna kadar birlikte; metin uzunluğu 64/38 harf |
| Alıntılar isim · unvan · tarih ve "özet" etiketiyle | ✅ | Donald Trump · ABD Başkanı · 7 Tem 2026, Ankara NATO Zirvesi / Sergey Lavrov · Rusya Dışişleri Bakanı · 26 Eyl 2026 |
| S8 Rubio satırı isim · unvan · tarih | ✅ | Marco Rubio · ABD Dışişleri Bakanı · 7 Eki 2026: S-400 çözülmeden yasal olarak mümkün değil. |
| S4 taraf satırları | ⚠️ | Pentagon · 17 Tem 2019 / Türk hükümeti · 7 Tem 2026 — Ankara ifadesinin sahibi (isim/unvan) Medyascope 7 Tem 2026 haberinden doğrulanmalı |

## Hook kareleri

| 0. kare (0,00 sn) | 15. kare (0,50 sn) | 45. kare (1,50 sn) | QA: metin (macenta) |
|---|---|---|---|
| ![](qa_f35/kare_00.jpg) | ![](qa_f35/kare_15.jpg) | ![](qa_f35/kare_45.jpg) | ![](qa_f35/hook_qa_00.png) |

## Sahne ortaları (out/qa_f35/)

Taşma, güvenli alan ve okunurluk için gözle bakılacak kareler. Güvenli alan ölçümü zeminsiz QA render'ında yapıldı (`qa_f35/guvenli_alan/`).

| Sahne | Kare | Üst | Alt | Sağ | |
|---|---|---|---|---|---|
| S1 | 103 | 0 | 0 | 0 | ✅ |
| S2 | 287 | 0 | 0 | 0 | ✅ |
| S3 | 507 | 0 | 0 | 0 | ✅ |
| S4 | 719 | 0 | 0 | 0 | ✅ |
| S5 | 929 | 0 | 0 | 0 | ✅ |
| S6 | 1241 | 0 | 0 | 0 | ✅ |
| S7 | 1495 | 0 | 0 | 0 | ✅ |
| S8 | 1657 | 0 | 0 | 0 | ✅ |

S1: ![](qa_f35/S1_orta.jpg)
S2: ![](qa_f35/S2_orta.jpg)
S3: ![](qa_f35/S3_orta.jpg)
S4: ![](qa_f35/S4_orta.jpg)
S5: ![](qa_f35/S5_orta.jpg)
S6: ![](qa_f35/S6_orta.jpg)
S7: ![](qa_f35/S7_orta.jpg)
S8: ![](qa_f35/S8_orta.jpg)
S9: ![](qa_f35/S9_orta.jpg)

Okunurluk: altyazı 58 px (en az 46 px), başlıklar ≥ 50 px, kart metni ≥ 36 px; KAYNAK satırı ve "ÇİZİM/Temsili görüntü" etiketi 20–22 px mono (bilgi satırı).

## Kullanılan görseller ve lisanslar

- Fotoğraf yok: S1 hangar, S2 F-35 silüeti, S3 S-400 aracı, S7 hangar ve kapak vektör çizimdir ("ÇİZİM" etiketli, kanal için çizildi).
- Harita: Natural Earth 1:50m (kamu malı).
- B-roll: yok.

## Eksik dosyalar

- public/voiceover_f35.mp3 (seslendirme)
- public/music_f35.mp3 (müzik)
- fotoğraf f35a-usaf (Commons) → çizim kullanıldı
- fotoğraf s400-milru (Commons) → çizim kullanıldı
- B-roll S1 → fotoğraf/çizim kullanıldı
- B-roll S3 → fotoğraf/çizim kullanıldı
- B-roll S6 → fotoğraf/çizim kullanıldı
- B-roll S7 → fotoğraf/çizim kullanıldı
- motion-showreel/scripts/sfx.mjs (SFX tools/f35/prep_audio.py içinde sentezlendi)

## Uyarılar

- public/voiceover_f35.mp3 yok: sessiz taslak, sahne süreleri ve altyazı zamanları tahmini
- public/music_f35.mp3 yok: müziksiz devam ediliyor (render durmadı); vuruş hizalaması yapılmadı
- Konuşma ve müzik yok: miks yalnızca SFX içeriyor, loudnorm uygulanmadı
- PEXELS_API_KEY yok: Pexels atlandı
- PIXABAY_API_KEY yok: Pixabay atlandı
- S1: kabul edilen klip yok (sahne fotoğraf/çizimle kalır)
- S3: kabul edilen klip yok (sahne fotoğraf/çizimle kalır)
- S6: kabul edilen klip yok (sahne fotoğraf/çizimle kalır)
- S7: kabul edilen klip yok (sahne fotoğraf/çizimle kalır)

## İçerik doğrulama notları (yayından önce)

- Ekim 2026 tarihli kaynaklar (Turkish Minute, Defense Mirror, Euronews, Aero Corner) ve Temmuz–Eylül 2026 olayları brief'ten alındı; bu oturumda bağımsız olarak doğrulanamadı. Her kaynağa URL eklenmeli (SOURCES.md).
- S3 "11 Nis 2017 · S-400 sözleşmesi": birçok kaynak anlaşmanın imzasını Eylül 2017 (Erdoğan'ın 12 Eylül 2017 açıklaması) ve finansman anlaşmasını Aralık 2017 olarak verir. Defence Turk'teki tarih kontrol edilmeli.
- S1/S7 "6 uçak hangarda": Temmuz 2020 tarihli haberlere (Reuters) göre ABD Hava Kuvvetleri, Türkiye için üretilen 8 F-35A'yı kendi envanterine almak üzere sözleşme değişikliği yapmıştı. "6 uçak 7 yıldır hangarda" ifadesi Turkish Minute (15 Eki 2026) haberindeki ifadeyle birebir eşleştirilmeli.
- S4 Ankara satırının sahibi (isim, unvan) netleştirilmeli; şu an "Türk hükümeti · 7 Tem 2026".
- Seslendirme senaryosu `src/data/f35.ts` içindedir. Kayıt bu metinden farklıysa Whisper eşleşme oranı düşer ve uyarı verir; altyazı yine senaryodan yazılır.
