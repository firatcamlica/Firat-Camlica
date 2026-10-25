// Fransa carousel'ine özgü metinler (veriler src/data/fransa.ts'ten gelir; video etkilenmez).
// Üst etiketler burada büyük harfle yazılır; bileşenlerde büyük harf dönüşümü yok.
import {TEXT} from './fransa';

const strip = (x: string) => x.replace(/^Kaynak:\s*/i, '');

export const CAROUSEL_FR = {
  /** Carousel'de kullanılan fotoğraf yuvaları (PHOTO_SLOTS) */
  photoSlots: ['hook', 's4'] as const,
  /** 13. karedeki kaynak listesi (brief sırası) */
  sources: [
    "franceinfo, La Voix de l'Est",
    'İçişleri Bakanlığı (franceinfo)',
    strip(TEXT.s4.source),
    strip(TEXT.s5.turnout.source),
    strip(TEXT.s5.split.source),
    'CNews, JDD, France 24',
    'CNBC, franceinfo, Wikipedia',
  ],
  unverified: [] as string[],
  cover: {teaser: 'Sonda: 700 süpermarketin buzdolabını kim ısıttı?'},
  spark: {
    kicker: '17 EYL 2026 · CRÉTEIL',
    headline: 'Kıvılcım bir lisede çaktı',
    body: "Saint-Exupéry Lisesi'nde öğretmenler greve çıktı; ertesi gün öğrenciler sokaktaydı.",
    source: "Kaynak: franceinfo, La Voix de l'Est",
  },
  classSize: {
    /** Üst etiket: yabancı özel isimler Türkçe kuralla büyütülmez (I, É korunur) */
    kicker: 'CRÉTEIL · SAINT-EXUPÉRY LİSESİ',
    value: '35+',
    label: 'kişilik sınıflar',
    source: "Kaynak: La Voix de l'Est (17 Eki 2026)",
  },
  turnout: {kicker: '13 EKİ KATILIMI'},
  spread: {kicker: '1 EKİ 2026', source: 'Kaynak: İçişleri Bakanlığı (franceinfo)'},
  /** 09: iki eşit sütun, parti rengi yok (NEUTRAL_LINE) */
  election: {
    kicker: '2027 SEÇİMİNE GİDERKEN',
    headline: 'Aynı sokak, iki okuma.',
    left: {
      title: 'Marine Le Pen · RN',
      quote: 'Kaos ve düzensizlik getirenleri etkisiz hale getirmek gerekiyor.',
      text: 'Hükümeti gevşek buluyor; gençlere ücretsiz ehliyet vaat ediyor.',
      source: 'Kaynak: CNews, 15 Eki 2026 (JDD aktarımı)',
    },
    right: {
      title: 'Jean-Luc Mélenchon · LFI',
      quote: '6 Ekim bir başlangıç noktası.',
      text: 'Hareketi destekliyor, polisin müdahale stratejisini eleştiriyor.',
      source: 'Kaynak: franceinfo, 6 Eki 2026; France 24, 17 Eki 2026',
    },
    common: "Le Pen, LFI'yi şiddeti körüklemekle suçluyor; LFI hareketin kendiliğinden olduğunu savunuyor.",
  },
  question: {kicker: 'SORU'},
  sameWeek1: {
    kicker: "AYNI HAFTA FRANSA'DA",
    disclaimer: 'Lise hareketiyle bağlantısı yok. Faili bilinmiyor.',
    headline: "Bir gecede 700'e yakın süpermarketin buzdolapları ısındı.",
    thermo: {from: 4, to: 50},
    rows: [
      '11 Ekim gecesi · Intermarché, Netto, U, Carrefour, Monoprix, E.Leclerc',
      "Raflar 6 saatte 50 °C'ye çıktı, Normandiya'da bir mağazada 80 °C",
      'Bazı cihazlar yandı, tonlarca gıda imha edildi',
    ],
    source: 'Kaynak: CNBC, franceinfo, Wikipedia (2026 French supermarket refrigerator hack)',
  },
  sameWeek2: {
    kicker: "AYNI HAFTA FRANSA'DA",
    headline: 'Şifre: günün tarihi.',
    login: {user: 'admin', pass: '11102026'},
    points: [
      'Soğutma kontrol cihazları internete açıktı.',
      "Bazı modeller 2016 ve 2021'den beri güncelleme almıyordu; açık 2025'te raporlanmıştı.",
      "Aynı açık 7 Avrupa ülkesinde daha bulundu. Başbakan Lecornu soruşturmayı siber güvenlik ajansı ANSSI'ye verdi.",
    ],
    footnote: 'Uzmanlara göre saldırı o kadar basitti ki faili bir grup genç de olabilir, bir devlet de.',
    source: 'Kaynak: Wikipedia, CNBC, franceinfo',
  },
  end: {
    headline: 'Kaynaklar',
    cta: 'Videonun tamamı profilde',
  },
  caption: {
    /** Kullanıcı ayrıca verecek; aciklama.txt bu metinle birebir değiştirilecek */
    pending: true,
    /** Tek satırlık fotoğraf kredisi (13. kare) */
    photoLine: 'Foto: Aurelio Cárdenas (CC BY 4.0) · Camille Hestaux (CC0)',
  },
};
