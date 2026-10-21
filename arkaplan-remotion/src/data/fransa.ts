// Fransa lise hareketi. Bu dosya yalnızca carousel alanını içerir; video verisi Mac'teki projede.
// Büyük harfli etiketler burada doğru yazılır (CRÉTEIL, LİSESİ); bileşenlerde text-transform yok.

export const TODO_SOURCE = 'Kaynak: doğrulanacak';

export const PHOTO_SLOTS = {
  kapak: 'perpignan-castillet',
  kivilcim: 'grenoble-champollion',
  gozalti: 'poubelle-fumee',
};

// Kaynaklar karesindeki tek satırlık kredi
export const PHOTO_CREDIT_LINE =
  'Foto: Aurelio Cárdenas CC BY 4.0 · David.Monniaux CC BY-SA 4.0 · Camille Hestaux CC0';

export const PHOTO_CREDITS: Record<string, string> = {
  'perpignan-castillet': 'Aurelio Cárdenas / CC BY 4.0 · Perpignan',
  'grenoble-champollion': 'David.Monniaux / CC BY-SA 4.0 · Grenoble (temsili)',
  'poubelle-fumee': 'Camille Hestaux / CC0',
};

export const fransa = {
  slug: 'fransa-lise',
  carousel: {
    kapak: {
      label: 'EYLÜL-EKİM 2026 · FRANSA',
      title: ["fransa'yı sarsan isyan bir polis kurşunuyla değil, öğretmensiz bir ", 'sınıfta', ' başladı.'],
      teaser: 'Sonda: 700 süpermarketin buzdolabını kim ısıttı?',
    },
    kivilcim: {
      label: 'CRÉTEIL · SAINT-EXUPÉRY LİSESİ',
      chips: ['17 EYL 2026 · öğretmen grevi', '18 EYL · öğrenciler sokakta'],
      title: 'Öğretmenler greve çıktı. Ertesi gün öğrenciler sokaktaydı.',
      source: "franceinfo, La Voix de l'Est",
    },
    sinif: {
      label: 'GREVİN ARKASINDA',
      number: '35+',
      unit: 'kişilik sınıflar',
      also: 'Parcoursup stresi · yıpranmış binalar · eksik hemşire ve rehber personeli',
      source: "franceinfo, La Voix de l'Est",
    },
    liseler: {
      label: 'ETKİLENEN LİSE',
      number: '1.027',
      steps: [
        {date: '30 EYL', value: '323'},
        {date: '1 EKİ', value: '1.027'},
      ],
      title: 'Bir haftada 10 lise, iki haftada 1.027.',
      note: "Fransa'da yaklaşık 3.700 lise var. Dalga Belçika'ya kadar uzandı.",
      source: 'İçişleri Bakanlığı (franceinfo)',
    },
    gozalti: {
      label: 'GÖZALTI',
      number: '5.060',
      unit: 'gözaltı',
      sub: "yüzde 87'si reşit değil",
      source: 'Fransa Adalet Bakanlığı, Başbakanlık (Reuters); BBC',
    },
    lens: {
      label: 'LENS',
      title: 'Lens: 15 yaşında bir öğrenci polis bombasıyla elini kaybetti.',
      sub: 'Hükümet şok bombası kullanımını durdurdu.',
      source: 'Fransa Adalet Bakanlığı, Başbakanlık (Reuters); BBC',
    },
    rakamlar: {
      label: '13 EKİM KATILIMI',
      title: 'Rakamlar bile tartışmalı.',
      bars: [
        {name: 'Bakanlık', value: 161500, text: '161.500'},
        {name: 'Sendikalar', value: 480000, text: '480.000'},
      ],
      note: 'Aynı gün için iki sayı: aradaki fark yaklaşık 3 kat.',
      source: 'Bakanlık, sendikalar',
    },
    anket: {
      label: 'KAMUOYU',
      pct: 62,
      title: "Fransızların yüzde 62'si hareketi haklı buluyor.",
      source: 'Le Figaro anketi',
    },
    sandik: {
      label: '2027 SEÇİMİNE GİDERKEN',
      title: 'Aynı sokak, iki okuma.',
      left: {
        title: 'Marine Le Pen · RN',
        quote: 'Kaos ve düzensizlik getirenleri etkisiz hale getirmek gerekiyor.',
        note: 'Hükümeti gevşek buluyor; gençlere ücretsiz ehliyet vaat ediyor.',
        source: 'Kaynak: CNews, 15 Eki 2026 (JDD aktarımı)',
      },
      right: {
        title: 'Jean-Luc Mélenchon · LFI',
        quote: '6 Ekim bir başlangıç noktası.',
        note: 'Hareketi destekliyor, polisin müdahale stratejisini eleştiriyor.',
        source: 'Kaynak: franceinfo, 6 Eki 2026; France 24, 17 Eki 2026',
      },
      common: "Le Pen, LFI'yi şiddeti körüklemekle suçluyor; LFI hareketin kendiliğinden olduğunu savunuyor.",
    },
    soru: {
      label: '2027 CUMHURBAŞKANLIĞI SEÇİMİ',
      before: 'sınıftan çıkan öfke',
      mark: 'sandığa',
      after: 'da taşınacak mı?',
    },
    hafta1: {
      label: "AYNI HAFTA FRANSA'DA",
      disclaimer: 'Lise hareketiyle bağlantısı yok. Faili bilinmiyor.',
      title: "Bir gecede 700'e yakın süpermarketin buzdolapları ısındı.",
      thermo: {from: 4, to: 50},
      rows: [
        '11 Ekim gecesi · Intermarché, Netto, U, Carrefour, Monoprix, E.Leclerc',
        "Raflar 6 saatte 50 °C'ye çıktı, Normandiya'da bir mağazada 80 °C",
        'Bazı cihazlar yandı, tonlarca gıda imha edildi',
      ],
      source: 'Kaynak: CNBC, franceinfo, Wikipedia (2026 French supermarket refrigerator hack)',
    },
    hafta2: {
      label: "AYNI HAFTA FRANSA'DA",
      title: 'Şifre: günün tarihi.',
      login: {user: 'admin', pass: '11102026'},
      points: [
        'Soğutma kontrol cihazları internete açıktı.',
        "Bazı modeller 2016 ve 2021'den beri güncelleme almıyordu; açık 2025'te raporlanmıştı.",
        "Aynı açık 7 Avrupa ülkesinde daha bulundu. Başbakan Lecornu soruşturmayı siber güvenlik ajansı ANSSI'ye verdi.",
      ],
      footnote: 'Uzmanlara göre saldırı o kadar basitti ki faili bir grup genç de olabilir, bir devlet de.',
      source: 'Kaynak: Wikipedia, CNBC, franceinfo',
    },
    kaynaklar: {
      label: 'KAYNAKLAR',
      list: [
        "franceinfo, La Voix de l'Est",
        'İçişleri Bakanlığı (franceinfo)',
        'Fransa Adalet Bakanlığı, Başbakanlık (Reuters); BBC',
        'Bakanlık, sendikalar',
        'Le Figaro anketi',
        'CNews, JDD, France 24',
        'CNBC, franceinfo, Wikipedia',
      ],
      links: 'Bağlantılar: arkaplan.pages.dev/#fransa-lise',
      cta: 'Videonun tamamı profilde',
    },
  },
};
