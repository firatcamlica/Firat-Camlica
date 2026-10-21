# Fon müziği (tüm videolar için)

Sessiz video sıkıcı; bundan sonra her videoya alttan müzik giriyor.

| Dosya | Ne |
|---|---|
| `demirci_sk_yatak.m4a` | "Demirci Sk." kaydının temizlenmiş hali: baştaki 0,55 sn sessizlik atıldı, 40 Hz altı uğultu kesildi, hafif gürültü azaltma, mono → stereo, **-16 LUFS** (iki geçişli loudnorm). 60,8 sn. |
| `muzik_ekle.sh` | Herhangi bir mp4'e müziği alttan ekler. Görüntüye dokunmaz (`-c:v copy`). |

```bash
muzik/muzik_ekle.sh azerbaycan_reels.mp4                 # → azerbaycan_reels_muzikli.mp4
SEVIYE=-12 muzik/muzik_ekle.sh video.mp4 cikis.mp4       # müziği biraz aç
BASLA=10 muzik/muzik_ekle.sh video.mp4                   # müziğe 10. saniyeden gir (daha dolu kısım)
MUZIK=muzik/baska.m4a muzik/muzik_ekle.sh video.mp4      # başka parça
```

## Seviyeler (ölçülmüş)

| Durum | Ses | Müzik | Fark |
|---|---|---|---|
| Videoda seslendirme var, konuşma arası | -16 LUFS | ≈ -33 dB RMS | müzik ~15 dB altta |
| Konuşma sırasında (ducking) | -16 LUFS | ≈ -41 dB RMS | ~8 dB daha kısılır |
| Video sessiz (boş ses kanalı dahil) | — | ≈ -20 LUFS | tek ses müzik |

Videodaki ses -50 LUFS'tan kısıksa sessiz sayılır (Remotion'un sessiz taslakları boş ses kanalı içerir).
Giriş 1,5 sn fade-in, son 2,5 sn fade-out. Video 60,8 sn'den uzunsa parça başa sarar.

## Remotion içinde kullanmak

Render sonrası script yeterli. Doğrudan kompozisyona koymak isterseniz dosyayı `public/muzik/` altına kopyalayıp:

```tsx
import {Audio, interpolate, staticFile, useVideoConfig} from 'remotion';

export const FonMuzik: React.FC = () => {
  const {durationInFrames, fps} = useVideoConfig();
  return (
    <Audio
      src={staticFile('muzik/demirci_sk_yatak.m4a')}
      loop
      volume={(f) =>
        0.2 * // ≈ -14 dB; seslendirme yoksa 0.6
        interpolate(f, [0, 1.5 * fps, durationInFrames - 2.5 * fps, durationInFrames], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
    />
  );
};
```

Bu yolda konuşma altında otomatik kısma (ducking) yoktur; o yüzden script tercih edilir.

> Not: Kayıt telefondan (Sesli Notlar) alınmış; telif hakkı olan bir parçaysa Instagram sesi susturabilir.
> Risk istemiyorsanız aynı parçayı Reels'in kendi müzik kütüphanesinden eklemek daha güvenli.
