// Azerbaycan carousel'i: "tek millet, iki devlet" videosunun (azerbaycan_basortusu.mp4) kareleri + 25 Eki gelişmesi.
// Üst etiketler burada büyük harfle yazılır; bileşenlerde büyük harf dönüşümü yok.
// Saral'ın açıklama tarihi kaynaklarda 12 ve 13 Eki olarak geçiyor; Serbestiyet (25 Eki) 13 Eki diyor.

export const CAROUSEL_AZ = {
  sources: [
    'Medyascope, Reuters (309 sayılı karar, 12 Eki eylemleri)',
    'Azerbaycan İçişleri Bakanlığı (37 gözaltı)',
    'Azerbaycan Anayasası md. 18 ve 48',
    'Middle East Eye, Flightradar24 (Herzog uçuşu)',
    'Hürriyet Daily News (CICA zirvesi)',
    'SIPRI Arms Transfers Database',
    'Kpler tanker verisi (Baird Maritime aktarımı)',
    'Serbestiyet, Talat Atilla (25 Eki)',
    'Cumhurbaşkanlığı İletişim Başkanlığı (21 Eki)',
  ],
  unverified: [] as string[],
  cover: {
    kicker: 'EKİM 2026 · BAKÜ · ANKARA',
    headline: "Tek millet, iki devlet. Bir okul kapısı Bakü ile Ankara'yı karşı karşıya getirdi.",
    accent: 'kapısı',
    teaser: "Sonda: bugün Ankara'da bir görevden ayrılış",
  },
  rule: {
    kicker: 'AZERBAYCAN · OKUL KIYAFETİ KURALI',
    cardKicker: '309 SAYILI KARAR · 21 EYL 2026',
    cardText: 'Laik eğitim ilkesine uygun olmayan ek kıyafet yasaktır.',
    headline: "Metinde 'başörtüsü' kelimesi geçmiyor.",
    body: 'Ama bazı okullarda başörtülü öğrenciler kapıda kalıyor.',
    source: 'Kaynak: Medyascope, Reuters',
  },
  protest: {
    kicker: '6–12 EKİ 2026',
    step: '6 Ekim: kural öğretmenleri de kapsadı.',
    value: '37',
    label: 'gözaltı',
    body: "12 Ekim'de Bakü'de okul önlerindeki eylemlerin ardından.",
    source: 'Kaynak: Azerbaycan İçişleri Bakanlığı (Medyascope)',
  },
  /** 04: iki eşit sütun, aynı nötr çizgi */
  sides: {
    kicker: 'İKİ TARAF',
    headline: 'Aynı kural, iki okuma.',
    left: {
      title: "Bakü'nün gerekçesi",
      text: 'Yasak yalnızca okulda; okul dışında başörtüsü serbest. Amaç ortak kıyafet düzeni.',
      source: 'Zahid Oruc, Milli Meclis İnsan Hakları Komitesi Başkanı',
    },
    right: {
      title: 'Eleştirenlerin gerekçesi',
      text: 'Mesele eğitim hakkı: başörtülü öğrenciler ve öğretmenler okul kapısında kalıyor.',
      source: 'Veliler, öğretmenler, hak savunucuları',
    },
    common: 'Anayasa md. 18: din ile devlet ayrı, eğitim laik. Aynı anayasa md. 48: inanç özgürlüğü güvence altında.',
    source: 'Kaynak: Azerbaycan Anayasası',
  },
  /** 05: Ankara → Bakü, iki alıntı aynı bileşenle */
  exchange: {
    kicker: 'ANKARA → BAKÜ',
    a: {text: 'Başörtüsü engel değil, inancın gereğidir.', name: 'Oktay Saral', title: 'Cumhurbaşkanı Başdanışmanı', date: '13 Eki 2026'},
    b: {
      text: "'Bir millet, iki devlet' iç işlere müdahaleye gerekçe olamaz.",
      name: 'Yeni Azerbaycan Partisi (YAP)',
      title: 'Azerbaycan iktidar partisi, özet',
      date: '13 Eki 2026',
    },
  },
  flight: {
    kicker: 'BİR KATMAN DAHA',
    rule: "Türkiye, İsrail devlet uçaklarına hava sahasını kapalı tutuyor.",
    card: {from: 'TEL AVİV', to: 'BAKÜ', date: '14 EKİ', code: 'AZAL J222', type: 'tarifeli yolcu seferi'},
    headline: "Herzog Bakü'ye Azerbaycan Hava Yolları'nın tarifeli uçağıyla geldi.",
    body: "Ticari uçuşlar yasağın kapsamında değil. Uçak Türkiye üzerinden geçti; bir Türk yetkiliye göre Ankara'ya haber verilmedi.",
    source: 'Kaynak: Middle East Eye, Flightradar24',
  },
  cica: {
    kicker: '15 EKİ · CICA ZİRVESİ, BAKÜ',
    headline: 'Herzog konuşurken Türkiye, İran, Kuveyt, Pakistan ve Filistin heyetleri salonu terk etti.',
    body: "Erdoğan zirveye katılmadı; Türkiye'yi Dışişleri Bakanı Hakan Fidan temsil etti.",
    source: 'Kaynak: Hürriyet Daily News, Serbestiyet',
  },
  arms: {
    kicker: 'SİLAH VE PETROL',
    headline: 'Bağımlılık iki yönlü.',
    left: {value: 69, label: "Azerbaycan'ın silah ithalatında İsrail'in payı"},
    right: {value: 17, label: "İsrail'in silah ihracatında Azerbaycan'ın payı"},
    note: "Petrol de öyle: İsrail'in 2025 petrol ithalatının %46'sı Azerbaycan'dan, Türkiye'deki Ceyhan limanından yükleniyor.",
    source: 'Kaynak: SIPRI (silah, 2016–2020); Kpler (petrol, 2025)',
  },
  /** 10: bugünün gelişmesi (tek kare) */
  today: {
    kicker: 'BUGÜN · 25 EKİ 2026',
    headline: 'Oktay Saral görevden ayrıldı.',
    quote: 'Sayın Cumhurbaşkanımız göreve getirdi, kendisinin talimatıyla ayrıldım. Kimseye kırgınlığım yok.',
    who: 'Oktay Saral · Talat Atilla\'ya',
    answer: 'Azerbaycan’la ilgili açıklamalarınız nedeniyle mi? “Evet, öyle görünüyor.”',
    timeline: [
      {date: '13 EKİ', text: 'Saral, yasağı eleştirdi'},
      {date: '20 EKİ', text: 'MEE: Bakü görevden alınmasını istedi'},
      {date: '25 EKİ', text: 'Saral görevden ayrıldı'},
    ],
    source: 'Kaynak: Serbestiyet (Talat Atilla), Middle East Eye (Ragıp Soylu, 20 Eki)',
  },
  question: {
    kicker: 'SORU',
    text: 'Okul kapısındaki tartışma zirve masasına da gelecek mi?',
    accent: 'zirve',
    note: "30 Eki · Ankara · Türk Devletleri Teşkilatı zirvesi. Erdoğan 21 Ekim'de Aliyev'i davet etti.",
  },
  end: {headline: 'Kaynaklar', cta: 'Videonun tamamı profilde'},
  caption: {photoLine: ''},
};
