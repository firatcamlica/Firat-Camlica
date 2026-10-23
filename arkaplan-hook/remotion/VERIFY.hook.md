<!-- HOOK-VERIFY:BAŞLA (arkaplan-hook/remotion/VERIFY.hook.md; kur.sh yeniden yazar) -->
## Hook kapısı: ilk 1,5 sn içinde metin, hareket ve ses var mı?

Komut (render sonrası):

```bash
node tools/hook_gate.mjs <kompozisyon-id> --video out/<video>.mp4 --music public/<müzik> --music-db <hook sırasında müzik dB>
```

Araç 0., 15. ve 45. kareyi `out/hook_qa/<id>/` altına çeker ve `RAPOR.md` yazar. Rapor teslim notuna eklenir.

| Kontrol | Ölçüt |
|---|---|
| Metin | 0. karede hook metni var (QA karesinde macenta piksel) |
| Güvenli alan | Metin x 72–940, y 220–1540 (Reels arayüzü) |
| 4:5 kapak | Metin y 285–1635 (ortadan 1350 px kırpma) |
| Altyazı | Metnin alt kenarı altyazı bloğunun üstünde (varsayılan 1300) |
| Punto | ≥ 88 px (`Hook.tsx` 88 px'te sığmayan metinde render'ı durdurur) |
| Hareket | 0→15 ve 15→45 kare arasında ortalama piksel farkı ≥ 0,5 |
| Ses | Whoosh -18 ± 2 LUFS; hook sırasında müzikten en az 3 LU yüksek; render'ın ilk 1,5 sn tepe seviyesi > -40 dB |
| Sıra (elle) | 0. karede logo animasyonu/kanal girişi yok; filigran 0. karede görünüyor |

Herhangi bir ❌ varsa video teslim edilmez.
<!-- HOOK-VERIFY:BİTİR -->
