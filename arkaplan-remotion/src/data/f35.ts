// turkiye-f35 · "Türkiye'nin 6 Uçağı Neden 7 Yıldır Hangarda"
// Tüm metinler, seslendirme senaryosu, sahne süreleri, rakamlar, kaynaklar, fotoğraf eşleşmeleri,
// stok video sorguları ve müzik seviyeleri bu dosyada durur. Bileşenler ve araçlar (tools/f35) buradan okur.
//
// Seslendirme yazımı: [ekran|okunuş]. Altyazıya ve SRT'ye yalnızca "ekran" tarafı geçer
// ("ef otuz beş", "Emirlikler", "Amerikan" gibi okunuşlar ekrana yazılmaz). Whisper yalnızca kelime zamanı içindir.

export const TODO_SOURCE = 'Kaynak: doğrulanacak';

export const SLUG = 'turkiye-f35';
export const COMPOSITION_ID = 'turkiye-f35';
export const TITLE = "Türkiye'nin 6 Uçağı Neden 7 Yıldır Hangarda";
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Süre kuralları (sn): 60,0 asla aşılmaz; hedef 56–58; son 2 sn marka kapanış kartı. */
export const DURATION = {max: 60, targetMin: 56, targetMax: 58, endCard: 2};

export const voiceFile = 'voiceover_f35.mp3';
export const musicFile = 'music_f35.mp3';

/** Ses son işlem ayarları (tools/f35/prep_audio.py ve mix) */
export const AUDIO_SETTINGS = {
  atempo: 1.05,
  silence: {thresholdDb: -35, min: 0.45, keep: 0.25},
  /** Müzik kazancı (dB): konuşma varken / yokken. Sahne bazında SCENES[].musicLevel ile ezilebilir. */
  music: {speech: -20, gap: -11, duckDownMs: 150, duckUpMs: 400, fadeIn: 0.3, fadeOut: 1.5, mergeGap: 0.8},
  sfx: {underMusicDb: -3, maxCount: 4},
  beatSnapMaxFrames: 3,
  master: {I: -14, TP: -1, LRA: 11, aacBitrate: '192k', sampleRate: 48000},
};

/** Sahne → public/photos/credits.json id. Dosya yoksa sahne çizime (vektör) döner ve raporda eksik yazılır. */
export const PHOTO_SLOTS = {
  hook: 'f35a-usaf',
  s400: 's400-milru',
  cover: 'f35a-usaf',
};

/** Fotoğraf adayları (tools/f35/fetch_photos.py). Yalnızca kamu malı, CC0, CC BY. Portre yok. */
/** `pin`: belirli bir Commons dosyası ("File:....jpg") — verilirse arama yapılmaz. */
export const PHOTO_QUERIES: Record<string, {queries: string[]; note: string; pin?: string}> = {
  'f35a-usaf': {
    queries: ['F-35A hangar', 'F-35A Lightning II shelter', 'F-35A Lightning II flight line', 'F-35A Lightning II parked'],
    note: 'ABD Hava Kuvvetleri F-35A fotoğrafı (kamu malı)',
  },
  's400-milru': {
    queries: ['S-400 Triumf mil.ru', 'S-400 launcher', 'S-400 missile system'],
    note: 'S-400 (mil.ru, CC BY 4.0)',
  },
  eurofighter: {
    queries: ['Eurofighter Typhoon'],
    note: 'Eurofighter Typhoon (yedek; S8 kartında kullanılmıyor)',
  },
};

/** Stok video sorguları (Pexels, Pixabay). Her sorgu için en fazla 3 aday; klip en fazla 2,5 sn. */
export const brollQueries: Record<string, string[]> = {
  S1: ['aircraft hangar interior', 'hangar doors closing'],
  S3: ['radar antenna rotating'],
  S6: ['desert highway aerial', 'city skyline night aerial'],
  S7: ['empty hangar'],
};
export const BROLL_RULES = {
  perQuery: 3,
  maxSeconds: 2.5,
  opacityUnderCard: 0.35,
  label: 'Temsili görüntü',
  rejectTags: ['face', 'person', 'people', 'man', 'woman', 'portrait', 'logo', 'brand', 'flag', 'ceremony', 'parade', 'soldier', 'army', 'military'],
};

/** Parallax (tools/f35/depth.py, Depth Anything V2 Small). 3 sn'de %6 itiş, ön plan 1,8 kat. */
export const PARALLAX = {pushPer3s: 0.06, foregroundRatio: 1.8};

export type SceneId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9';

export type Scene = {
  id: SceneId;
  name: string;
  /** Tahmini başlangıç / bitiş (sn). Gerçek değerler ses işlendikten sonra f35.audio.json'dan gelir. */
  start: number;
  end: number;
  /** Seslendirme metni ([ekran|okunuş] biçiminde). Boşsa sahnede konuşma yok. */
  voice: string;
  /** Sahne içi anlar: seslendirmede o kelimenin başladığı an; ses yoksa sahne başından itibaren saniye. */
  cues: Record<string, {word: string; fallback: number}>;
  musicLevel: {speech: number; gap: number};
  source?: string;
};

const ML = {speech: AUDIO_SETTINGS.music.speech, gap: AUDIO_SETTINGS.music.gap};

export const SCENES: Scene[] = [
  {
    id: 'S1',
    name: 'Hook',
    start: 0,
    end: 4,
    voice: "Türkiye için üretilen altı [F-35|ef otuz beş], yedi yıldır [ABD'de|Amerika'da] bir hangarda bekliyor.",
    cues: {},
    musicLevel: ML,
    source: 'Kaynak: Turkish Minute, 15 Eki 2026',
  },
  {
    id: 'S2',
    name: 'Ortaklık',
    start: 4,
    end: 10.5,
    voice: "Türkiye 2002'den beri programın ortağıydı: 900'den fazla parça üretiyordu, 1,4 milyar dolar ödedi, 100 uçak planlıyordu.",
    cues: {
      parts: {word: '900', fallback: 1.6},
      paid: {word: 'ödedi', fallback: 3.4},
    },
    musicLevel: ML,
    source: 'Kaynak: Pentagon, 17 Tem 2019; Turkish Minute, 15 Eki 2026',
  },
  {
    id: 'S3',
    name: 'Zaman çizelgesi',
    start: 10.5,
    end: 18,
    voice:
      "Nisan 2017'de Rusya ile [S-400|es dört yüz] sözleşmesi imzalandı. 12 Temmuz 2019'da ilk parçalar Mürted'e indi. Beş gün sonra Türkiye programdan çıkarıldı.",
    cues: {
      e1: {word: 'Nisan', fallback: 0.1},
      e2: {word: '12', fallback: 2.6},
      fiveDays: {word: 'Beş', fallback: 5.0},
    },
    musicLevel: ML,
    source: 'Kaynak: Defence Turk, Tem 2026; USNI News, 17 Tem 2019',
  },
  {
    id: 'S4',
    name: 'İki taraf',
    start: 18,
    end: 25,
    voice:
      "Washington'a göre [S-400|es dört yüz] radarı, [F-35'in|ef otuz beşin] görünmezlik verisini Rusya'ya taşıyabilir. Ankara'ya göre sistem NATO ağına entegre edilmeyecek. Aralık 2020'de yaptırım geldi.",
    cues: {
      footer: {word: 'Aralık', fallback: 5.4},
    },
    musicLevel: ML,
    source: 'Kaynak: Pentagon, 17 Tem 2019; Medyascope, 7 Tem 2026; Duvar English, 14 Ara 2020',
  },
  {
    id: 'S5',
    name: 'Trump ve yasa',
    start: 25,
    end: 32,
    voice:
      "7 Temmuz'da [ABD|Amerika] Başkanı Trump, yaptırımın kalkabileceğini ve satışın değerlendirilebileceğini söyledi. Ama yasa açık: [S-400|es dört yüz] Türkiye'deyse [F-35|ef otuz beş] yok.",
    cues: {
      rule: {word: 'Ama', fallback: 3.8},
    },
    musicLevel: ML,
    source: 'Kaynak: Aero Corner, 3 Eki 2026; Euronews, 13 Tem 2026',
  },
  {
    id: 'S6',
    name: 'Körfez ve Moskova',
    start: 32,
    end: 43,
    voice:
      "Temmuz'da Türk basını, [S-400|es dört yüz]'lerin Körfez'e satılacağını yazdı; hiçbir hükümet doğrulamadı. Katar 2018'de bu sistemi almak istemişti. Lavrov'a göre devir ancak Rusya'nın onayıyla olur.",
    cues: {
      cardA: {word: "Temmuz'da", fallback: 0.3},
      cardB: {word: 'Katar', fallback: 5.0},
      cardC: {word: "Lavrov'a", fallback: 7.6},
    },
    musicLevel: ML,
    source: 'Kaynak: Karar, Tem 2026; Doğru Haber, Tem 2026; Hürriyet Daily News, 26 Eyl 2026',
  },
  {
    id: 'S7',
    name: 'Karşılaştırma',
    start: 43,
    end: 51,
    voice:
      "Eylül'de [ABD|Amerika], Suudi Arabistan'a 48 [F-35|ef otuz beş] satışını onayladı; Kongre inceliyor. Türkiye'nin altı uçağı ise hâlâ hangarda.",
    cues: {
      saudi: {word: "Eylül'de", fallback: 0.2},
      turkey: {word: "Türkiye'nin", fallback: 4.6},
    },
    musicLevel: ML,
    source: 'Kaynak: Turkish Minute, 18 Eyl 2026; Defense Mirror, 8 Eki 2026',
  },
  {
    id: 'S8',
    name: 'Sonuç',
    start: 51,
    end: 56,
    voice: "Rubio'ya göre [S-400|es dört yüz] çözülmeden bu yasal olarak mümkün değil. Kilidi kim açar?",
    cues: {
      question: {word: 'Kilidi', fallback: 3.2},
    },
    musicLevel: ML,
    source: 'Kaynak: Euronews, 8 Eki 2026; NTV, 27 Eki 2025',
  },
  {
    id: 'S9',
    name: 'Kapanış kartı',
    start: 56,
    end: 58,
    voice: '',
    cues: {},
    musicLevel: ML,
  },
];

// ---------------------------------------------------------------------------
// Ekran metinleri

export const TEXT = {
  hook: '6 UÇAK · 7 YILDIR HANGARDA',
  hookCounter: {value: 6, stopFrame: 12},

  s2: {
    counter: {value: 900, suffix: '+', label: 'PARÇA'},
    parts: ['ORTA GÖVDE', 'KOKPİT EKRANI', 'İNİŞ TAKIMI'],
    sub: "2002'den beri ortak · 1,4 milyar $ ödeme · 100 uçak planı",
    drawingLabel: 'ÇİZİM',
  },

  s3: {
    kicker: 'ZAMAN ÇİZELGESİ',
    events: [
      {date: '11 Nis 2017', text: 'S-400 sözleşmesi (~2,5 milyar $)'},
      {date: '12 Tem 2019', text: "ilk parçalar Mürted'e"},
      {date: '17 Tem 2019', text: 'programdan çıkarıldı'},
    ],
    bracket: {from: 1, to: 2, label: '5 GÜN'},
  },

  s4: {
    left: {title: 'WASHINGTON', text: "S-400 radarı, F-35'in görünmezlik verisini Rusya'ya taşıyabilir.", who: 'Pentagon · 17 Tem 2019'},
    right: {title: 'ANKARA', text: 'Sistem NATO ağına entegre edilmeyecek.', who: 'Türk hükümeti · 7 Tem 2026'},
    footer: "Aralık 2020 · CAATSA yaptırımı · Pentagon'a göre 9 milyar $ iş payı kaybı",
  },

  s5: {
    quote: {
      name: 'Donald Trump',
      title: 'ABD Başkanı',
      date: '7 Tem 2026, Ankara NATO Zirvesi',
      text: "CAATSA'yı kaldırabilir, Türkiye'ye F-35 satışını değerlendirebiliriz.",
      summary: true,
    },
    rule: {
      kicker: 'ABD YASASI',
      text: "NDAA 2020, Madde 1245: S-400 Türkiye'deyse F-35 transferi yok.",
      footer: '22 Tem 2026 · ABD Dışişleri: şartlar sağlanmadı',
    },
  },

  s6: {
    labels: {turkey: 'TÜRKİYE', uae: 'BAE', qatar: 'KATAR', moscow: 'MOSKOVA'},
    cardA: {kicker: 'TEMMUZ 2026', text: "Türk basını: S-400 Körfez'e satılıyor. Hiçbir hükümet doğrulamadı."},
    cardB: {kicker: '2018', text: "Katar 2018'de S-400'ü Rusya'dan almak istemişti."},
    cardC: {
      name: 'Sergey Lavrov',
      title: 'Rusya Dışişleri Bakanı',
      date: '26 Eyl 2026',
      text: "Devir ancak Rusya'nın onayıyla, dost bir ülkeye ve Ukrayna'ya gitmeme garantisiyle.",
      summary: true,
    },
  },

  s7: {
    left: {country: 'SUUDİ ARABİSTAN', value: 48, unit: 'F-35', lines: ['Eylül 2026 onayı', '24,3 milyar $', 'Kongre incelemesinde']},
    right: {country: 'TÜRKİYE', value: 6, unit: 'F-35', lines: ['hangarda']},
  },

  s8: {
    small: "Marco Rubio · ABD Dışişleri Bakanı · 7 Eki 2026: S-400 çözülmeden yasal olarak mümkün değil.",
    big: 'KİLİDİ KİM AÇAR?',
    card: "Türkiye'nin B planı: 44 Eurofighter · KAAN",
  },

  endCard: {note: `kaynaklar · arkaplan.pages.dev/#${SLUG}`},

  cover: {title: '6 UÇAK 7 YILDIR HANGARDA', kicker: 'TÜRKİYE · F-35'},
};

/** Altyazıda ve SRT'de yazılması zorunlu biçimler; okunuşlar ekrana geçmez. */
export const DISPLAY_TERMS = ['F-35', 'S-400', 'BAE', 'ABD'];
export const SPOKEN_ONLY = ['ef otuz beş', 'es dört yüz', 'Emirlikler', 'Amerikan'];
