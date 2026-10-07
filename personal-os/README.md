# Kişisel OS

Hayat verilerini tek yerde toplayan kişisel uygulama: sağlık, zihin, beslenme & spor,
finans ve görevler. Sesli kayıt için Siri Kısayolları + Google Sheets köprüsü içerir.

Canlı sürüm: https://claude.ai/artifact/RoJm5zAjLQ5SgPXKgJBQAG

## Modüller

| Sekme | İçerik | Giriş yolu |
|---|---|---|
| Bugün | Sabah/öğle/akşam check-in (keyif 1–10, ağrı 0–10), Claude ile hızlı giriş, 8 özet kutucuk, 7 günlük keyif/ağrı grafiği | Tek dokunuş, dikte, Siri |
| Sağlık · Beden | Uyku (yatış/kalkış), su, adım, sigara (bırakma hedefi + tasarruf), dışkı (Bristol 1–7) | Dokunuş, Siri, Sağlık senkronu |
| Sağlık · Zihin | Keyif trendi, kişisel zaman (aktiviteye göre), ekran süresi | Dokunuş, ekran görüntüsünden okuma |
| Beslenme & Spor | Kalori/makro planı (Mifflin-St Jeor), yazı ya da fotoğrafla yemek, spor kalorisi bütçeye eklenir | Claude, elle |
| Finans | Hesap bakiyeleri, kart borcu ve limit kullanımı, aylık ödemeler (fatura, kart, abonelik) | Elle; banka API'si yok |
| Görevler | İş / kişisel liste, son tarih, gecikme, 7 günlük tamamlama grafiği | Elle, Claude, Siri |

## Sesli kayıt akışı

```
Siri Kısayolu ──POST──▶ Apps Script web uygulaması ──▶ Google Sheets "Kayıtlar" sekmesi
                                                              │
Kişisel OS ◀── Claude satırları modüllere ayırır ◀── Google Drive bağlayıcısı okur
```

1. `apps-script/Code.gs` dosyasını Sheets → Uzantılar → Apps Script'e yapıştır, `TOKEN`'ı değiştir.
2. Web uygulaması olarak dağıt (Yürütme: Ben, Erişim: Herkes) ve URL'yi kopyala.
3. Uygulamadaki ⚙ Bağlantılar ekranındaki 5 kısayol tarifini kur:
   Kaydet (serbest dikte), Check-in otomasyonu (09:00 / 13:00 / 21:00), Sigara (Arkaya Dokun), Su, Sağlık senkronu (23:30).
4. Uygulamada "Siri kayıtlarını içe aktar" → önizle → kaydet. Aynı satır iki kez aktarılmaz.

Sheets satır biçimi (uzun format): `id | zaman | tarih | modul | alan | deger | not`

## Veri

- claude.ai'de oturum açıkken hesabına özel olarak senkronlanır; tarayıcıda da kopyası tutulur.
- Yedek kodu ile geri yükleme, günlük özetler için CSV dışa aktarma (Sheets'e aktarılabilir).

## Bilinen sınırlar

- iOS, Ekran Süresi verisini Kısayollar'a vermez: ekran görüntüsünü yükle, Claude okusun.
- Uygulama sayfası dışarıya istek atamaz; Siri kayıtları Sheets üzerinden içe aktarılarak gelir.

Genel bir rehberdir, tıbbi tavsiye değildir.
