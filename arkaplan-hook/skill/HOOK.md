<!-- HOOK:BAŞLA (arkaplan-hook/skill/HOOK.md; elle düzenlemeyin, kur.sh yeniden yazar) -->
## HOOK

Araştırmadan sonra, seslendirme metninden önce. Arka Plan'ın her videosunda uygulanır.

1. **Üç seçenek yaz.** Her video için tam üç hook:
   - **Çelişki:** iki doğru bilginin yan yana durunca şaşırttığı an.
   - **Veri şoku:** tek bir rakam ve onu büyük kılan karşılaştırma.
   - **Sahne:** izleyiciyi tek bir yere ve ana koyan görüntü.

   Her seçenek: ekranda **en fazla 10 kelime**, seslendirmede **en fazla 2 cümle**.
2. **Yalnızca ✅ veri.** Hook yalnızca araştırma tablosunda ✅ işaretli verileri kullanır.
   Rakamlar yuvarlanır, ondalık yok ("yüzde 87", "5 binden fazla"; "%86,7" ya da "5.063" değil).
   Doğrulanmamış (⚠️/❓) bilgi hook'a giremez.
3. **Karşılık satırı.** Her seçeneğin altına: `karşılık: <sahne no> — <hook'un açtığı sorunun cevabı>`.
   Karşılığı olmayan hook listeye girmez; yerine yenisi yazılır.
4. **Tarafsızlık ve kelime taraması hook için de geçerli.** Üç seçenek de yasaklı/yüklü kelime
   listesinden geçer (`tools/tarafsizlik.mjs`); "şok", "skandal", "kriz" gibi kelimeler hook'ta da yasaktır.
   Hook metni `src/data/<video>.ts` içinde `TEXT.hook` alanında durur, böylece tarama onu da kapsar.
5. **Sıra ve onay.**
   - `OZET.md` dosyasında hook seçenekleri **en üstte** durur (aşağıdaki biçimde).
   - Kullanıcı bir seçeneği seçmeden `seslendirme.md` **yazılmaz**.
   - Seçilen hook'un seslendirme cümlesi `seslendirme.md`'nin **ilk cümlesidir**; ekran metni
     Remotion'da `src/brand/Hook.tsx` ile ilk 3 saniyede gösterilir (logo/kanal girişi hook'tan önce gelmez).

`OZET.md` başı:

```markdown
## Hook seçenekleri (birini seçin)

**A · Çelişki**
ekran: <en fazla 10 kelime>
ses: <en fazla 2 cümle>
veri: <✅ satırları>
karşılık: S<n> — <cevap>

**B · Veri şoku**
ekran: …
ses: …
veri: …
karşılık: …

**C · Sahne**
ekran: …
ses: …
veri: …
karşılık: …

tarama: tarafsızlık ✅ · kelime ✅ · ondalık yok ✅ · kelime sayısı ✅
```

Kontrol listesi (hook teslim edilmeden):
- [ ] 3 seçenek: çelişki, veri şoku, sahne
- [ ] Ekranda ≤ 10 kelime, seslendirmede ≤ 2 cümle
- [ ] Yalnızca ✅ veri; rakamlar yuvarlak, ondalık yok
- [ ] Her seçeneğin karşılık satırı var ve sahnesi gerçekten o soruyu cevaplıyor
- [ ] Tarafsızlık + kelime taraması temiz
- [ ] OZET.md'de en üstte; kullanıcı seçti; seçilen hook seslendirmenin ilk cümlesi
<!-- HOOK:BİTİR -->
