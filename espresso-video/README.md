# Espresso'nun tarihi — TikTok videosu (Remotion)

1080×1920, 30 fps, H.264 + AAC. Tüm görseller kodla çizilmiş vektördür.

## Durum
`teslim/` altındaki video **sessiz taslaktır**: seslendirme (edge-tts) bu ortamda `speech.platform.bing.com`
adresine ağ erişimi olmadığı için üretilemedi. Altyazı zamanlaması şimdilik **tahminîdir**.
Gerçek sesle bitirmek için aşağıdaki "Gerçek sesle bitirme" adımları yeterlidir.

## Gerçek sesle bitirme (edge-tts erişimi olan bir makinede)
```bash
cd espresso-video
npm install
pip install edge-tts pillow
# iki sesi dinleyip seçin: tr-TR-AhmetNeural / tr-TR-EmelNeural
python3 tools/tts.py --mode edge --voice tr-TR-AhmetNeural   # src/timings.json + public/voice/voice.mp3 (-16 LUFS)
tools/render.sh                                              # out/video_raw.mp4
tools/package.sh teslim/espresso_tiktok.mp4                  # yuv420p/bt709, H.264 + AAC (sesi içerir)
python3 tools/build_assets.py teslim                         # SRT + senaryo.md (kelime zamanlamalı)
```
`public/voice/voice.mp3` seslendirme katmanıdır (müzik içermez); TikTok'ta müziği siz ekleyin.
Süre 40–50 sn dışına çıkarsa `tts.py` uyarır; `script.json` içindeki `rate` ya da metni ayarlayın.

## Dosyalar
- `script.json` — tek kaynak: seslendirme (`[ekran|okunuş]` işaretlemesi) ve ekran metinleri
- `tools/tts.py` — seslendirme + kelime zamanlaması (`--mode estimate|edge`)
- `tools/qa.mjs` — her sahneden kalite kontrol karesi (`EspressoDebug` güvenli alanı kırmızı gösterir)
- `tools/cover.mjs` — kapak görseli
- `src/` — Remotion bileşenleri
- `teslim/` — teslimat dosyaları

## Notlar
- Remotion, şirketler için lisans koşulları içerir (bireyler/küçük ekipler ücretsiz): https://www.remotion.dev/license
- Güvenli alan: üst 150, sağ 160, alt 320 px dışına metin konmadı (otomatik piksel taramasıyla doğrulandı).

---

# Part 2 — Modern çağ (EY, basınç profili, WDT)

"Stripe/Vercel" estetiği: siyah zemin üstünde hareketli kehribar/pas mesh gradient'ler, nokta ızgarası,
cam paneller (`backdrop-filter: blur(24px)`), Inter + Space Grotesk. Tüm girişler yay fiziğiyle
(mass 0.5, damping 12, stiffness 120); sahne geçişleri zoom-in ve whip-pan.

```bash
python3 tools/tts.py --mode edge --script script2.json --timings src/p2/timings.json --voice-dir public/voice2
COMP=Part2 RAW=out/p2_raw.mp4 tools/render.sh
RAW=out/p2_raw.mp4 tools/package.sh teslim/part2/espresso_part2.mp4
python3 tools/build_assets.py teslim/part2 script2.json src/p2/timings.json espresso_part2_altyazi.srt
node tools/cover.mjs Cover2 teslim/part2/kapak_part2.png
node tools/qa.mjs Part2Debug out/qa2 src/p2/timings.json   # güvenli alan işaretli QA kareleri
```
Not: `package.sh` sesi `public/voice/voice.mp3`ten alır; Part 2 için gerçek sesle paketlerken
`public/voice2/voice.mp3` yolunu kullanacak şekilde betikteki ses yolunu değiştirin.
