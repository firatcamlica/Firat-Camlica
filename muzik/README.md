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

## Seviyeler (Azerbaycan başörtüsü videosunda ölçüldü)

| | Seviye |
|---|---|
| Konuşma | -16 LUFS (videodaki ses buna normalize edilir; ham hali -23,3 idi) |
| Müzik, konuşma sırasında | ≈ -37,5 LUFS → konuşmanın **~20 dB altında** |
| Müzik, cümle aralarında | ≈ -35,4 LUFS (yalnızca ~2 dB açılır, pompalama yok) |
| Video sessizse | ≈ -24 LUFS, tek ses müzik |
| Toplam çıkış | ≈ -15 LUFS (Reels için uygun) |

Müzik konuşmanın arkasında kalsın diye: 2 kHz çevresi 5 dB oyulur (konuşmanın anlaşılırlık bandı),
konuşmada yumuşak ducking (oran 2, attack 150 ms, release 1,5 sn). Müzik hâlâ yüksek gelirse `SEVIYE=-18`,
duyulmazsa `SEVIYE=-12`.

Videodaki ses -50 LUFS'tan kısıksa sessiz sayılır (Remotion'un sessiz taslakları boş ses kanalı içerir).
Giriş 1,5 sn fade-in, son 2,5 sn fade-out. Parçanın ilk ~8 saniyesi kendiliğinden yavaş açılır;
müziğin hemen dolu girmesi için `BASLA=8`. Video 60,8 sn'den uzunsa parça 11. saniyesinden (sessiz giriş atlanarak)
3 sn çapraz geçişle devam eder.

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
        0.18 * // ≈ -15 dB; seslendirme yoksa 0.4
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
