# Part 2 — Kaynaklar ve doğrulama

**Doğrulama düzeyi:** Bilgiler web aramasıyla, birden fazla bağımsız kaynağın özetleri karşılaştırılarak kontrol edildi.

## Gemini promptunda düzeltilen bilgi hataları

| Promptta | Sorun | Videoda |
|---|---|---|
| "%20'lik Altın Çıkarım Oranı" ve "TDS %20 sayacı" | Bu iki ölçüm karıştırılmış. **Çıkarım oranı (EY)**, kuru kahvenin suda çözünen yüzdesidir; ideal aralık yaklaşık **%18–22**. **TDS** ise fincandaki çözünmüş madde yoğunluğudur; espresso için yaklaşık **%8–12**. "TDS %20" espresso için yanlıştır. | Sayaç **EY %20** gösterir. Formül gerçek değerlerle kurulur: **EY = TDS × içecek ÷ doz = %10 × 36 g ÷ 18 g = %20**. Bu, Part 1'deki 18 g → 36 g reçetesiyle tutarlıdır. |
| "Eskiden basınç 9 barda sabitti" | Eksik. Kaldıraçlı makineler zaten **düşen** bir basınç eğrisi çiziyordu. Sabit 9 bar, pompalı makinelerin (E61, 1961) özelliğidir. | "**Pompalar** yıllarca 9 barda sabit çalıştı." Ayarlanabilir modern profil anlayışı Slayer ile (2009 civarı) yaygınlaştı. |
| "Mükemmel espresso … kimyadır" | Kısmen doğru. Kanallanma ve basınç profili temelde **fizik** (akış, direnç) konusudur. | "Ölçülebilir bir **bilim**." |
| Basınç grafiği | Tek bir "doğru" profil yoktur. | Grafikte "**ÖRNEK PROFİL**" yazar. Değerler (yaklaşık 2 bar ıslatma → 9 bar zirve → yaklaşık 6 bar) temsilîdir. |

## Doğrulanan bilgiler
- **EY formülü ve aralıklar:** EY = (içecek ağırlığı × TDS) ÷ doz. %18'in altı ekşi ve az çıkmış, %22'nin üstü acı ve aşırı çıkmış tat verir. Espresso TDS'i yaklaşık %8–12'dir. TDS, refraktometreyle ölçülür.
- **Kanallanma:** Su en az dirençli yolu seçer. Puck'ta yoğunluk farkı olursa su bir kanal açar; kanaldaki telve aşırı, geri kalanı az çıkar.
- **WDT (Weiss Distribution Technique):** John Weiss, Aralık 2005'te Home-Barista forumunda tanıttı. Telveyi ince iğneyle karıştırıp topakları dağıtma tekniğidir. Modern aletlerde iğne çapı yaklaşık **0,1–0,5 mm**'dir; 1 mm'den kalın iğneler ters etki yapar.
- **Basınç profilleme:** Slayer, kaldıraçlı makinelerin yay basıncını ölçüp profil olarak çizdi ve 2009'da düşük basınçlı ön ıslatma ile değişken basınç sunan makinesini çıkardı. Decent Espresso gibi makineler tarihî profilleri yeniden üretebiliyor.
- **"Üçüncü Dalga":** Terimi Trish Rothgeb 2002'de Roasters Guild bülteninde (The Flamekeeper) kullandı. Timothy Castle ise 1999/2000'de benzer bir ifade kullanmıştı. Bu bilgi videoda geçmiyor, açıklama metninde var.

## Kaynak bağlantıları
- Refraktometre ve TDS — https://kaffeemacher.de/en/blogs/kaffeewissen/refractometer-and-tds
- Çıkarım oranını anlamak — https://completehomebarista.com/faqs/brewing-methods/espresso-technique/understanding-extraction-yield/
- EY sözlüğü — https://know.coffeeparts.com.au/glossary/extraction-yield-ey
- Refraktometri rehberi — https://codeblackcoffee.com.au/blogs/coffee-notes/barista-guides-refractometry
- WDT ve John Weiss röportajı — https://dailycoffeenews.com/2022/12/14/what-is-wdt-in-espresso-we-talked-to-its-creator-john-weiss
- WDT gerçekten gerekli mi — https://clivecoffee.com/blogs/learn/do-you-really-need-wdt
- Barista Hustle, WDT — https://www.baristahustle.com/?p=345144
- Kanallanma — https://clivecoffee.com/blogs/learn/what-causes-channeling-in-espresso-how-to-fix-it
- Slayer, brew pressure — https://slayerespresso.com/slayer-leveraging-brew-pressure/
- Decent Espresso, basınç profilinin tada etkisi — https://decentespresso.com/blog/new_video_how_pressure_profiling_changes_flavor
- Basınç profilleme rehberi — https://completehomebarista.com/guides/pressure-profiling/
- Third-wave coffee — https://en.wikipedia.org/wiki/Third-wave_coffee

## Fontlar
- **Inter** (metin) ve **Space Grotesk** (rakamlar), değişken yazı tipleri, `@fontsource-variable` paketlerinden alındı. Lisans: SIL OFL 1.1. Latin ve Latin-Ext alt kümeleri kullanıldı, Türkçe karakterler tam destekleniyor.
