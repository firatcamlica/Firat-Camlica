// turkiye-f35 · "Şark Oturup Beklemenin Yeridir"
// Türkiye'nin F-35 dosyası, "kargo takip ekranı" parodisiyle. Açılış ve kapak: Ahmet Hamdi Tanpınar, Huzur (1949).
// Tüm metinler, seslendirme senaryosu, sahne süreleri, rakamlar, kaynaklar, fotoğraf eşleşmeleri, stok video
// sorguları, müzik seviyeleri ve yayın tarihi bu dosyada durur. Bileşenler ve araçlar (tools/f35) buradan okur.
//
// Seslendirme yazımı: [ekran|okunuş]. Altyazıya ve SRT'ye yalnızca "ekran" tarafı geçer
// ("Emirlikler", "Amerika'da" gibi okunuşlar ekrana yazılmaz). Whisper yalnızca kelime zamanı içindir.
// Senaryo, public/voiceover_f35.mp3 kaydıyla (ElevenLabs, 23 Eki 2026) kelimesi kelimesine eşleşir.

export const TODO_SOURCE = 'Kaynak: doğrulanacak';

export const SLUG = 'turkiye-f35';
export const COMPOSITION_ID = 'turkiye-f35';
export const TITLE = 'Şark Oturup Beklemenin Yeridir';
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Yayın tarihi: gün sayacının bitişi (YYYY-AA-GG). Yayından önce güncelleyin. */
export const publishDate = '2026-10-24';
/** Bekleyişin başlangıcı: Türkiye'nin F-35 programından çıkarılması */
export const WAIT_START = '2019-07-17';

/** Süre kuralları (sn): 60,0 asla aşılmaz; hedef 56–58; son 2 sn marka kapanış kartı. */
export const DURATION = {max: 60, targetMin: 56, targetMax: 58, endCard: 2};

export const voiceFile = 'voiceover_f35.mp3';
export const musicFile = 'music_f35.mp3';
/** İsteğe bağlı: müziğin yalnızca piyano kanalı (stem). Yoksa S1 açılışında müzik alçak geçirenle yumuşatılır. */
export const musicPianoFile = 'music_f35_piano.mp3';

/** Ses son işlem ayarları (tools/f35/prep_audio.py) */
export const AUDIO_SETTINGS = {
  atempo: 1.05,
  silence: {thresholdDb: -35, min: 0.45, keep: 0.25},
  /** Bu kelimelerden sonraki duraklamaya dokunulmaz (alıntı ve "Bir dakika") */
  protectPauseAfter: ['yeridir.', 'dakika.'],
  /** Müzik kazancı (dB): konuşma varken / yokken. Sahne bazında SCENES[].musicLevel ile ezilir. */
  music: {speech: -20, gap: -11, duckDownMs: 150, duckUpMs: 400, fadeIn: 0.3, fadeOut: 1.5, mergeGap: 0.8},
  /** Özel müzik otomasyonu */
  musicAutomation: {
    /** S1'in ilk 3,5 sn'si yalnızca piyano, -16 dB */
    pianoIntro: {seconds: 3.5, db: -16},
    /** S6 başında 2 karede kesilir, 1,2 sn sessizlik, sonra -28 dB; S7 başında 1 sn'de normale döner */
    plotTwist: {cutFrames: 2, silence: 1.2, restartDb: -28, recoverSeconds: 1},
  },
  sfx: {underMusicDb: -3, maxCount: 8},
  beatSnapMaxFrames: 3,
  master: {I: -14, TP: -1, LRA: 11, aacBitrate: '192k', sampleRate: 48000},
};

/** Sahne → public/photos/credits.json id. Dosya yoksa sahne çizime döner ve raporda eksik yazılır. */
export const PHOTO_SLOTS = {
  hook: 'f35a-usaf',
  s400: 's400-milru',
  cover: 'f35a-usaf',
};

/** Fotoğraf adayları (tools/f35/fetch_photos.py). Yalnızca kamu malı, CC0, CC BY. Portre yok.
 *  `pin`: belirli bir Commons dosyası ("File:....jpg") — verilirse arama yapılmaz. */
export const PHOTO_QUERIES: Record<string, {queries: string[]; note: string; pin?: string}> = {
  'f35a-usaf': {
    queries: ['F-35A hangar', 'F-35A Lightning II shelter', 'F-35A Lightning II flight line', 'F-35A Lightning II parked'],
    note: 'Hangar içinde/önünde duran F-35A (ABD Hava Kuvvetleri, kamu malı); yoksa apronda',
    pin: 'File:Vermont Participates in Air Defender 2023 (7933625).jpg',
  },
  's400-milru': {
    queries: ['"S-400" Triumf', 'Триумф С-400', 'S-400 Triumf launcher', 'S-400 SAM'],
    note: 'S-400 (mil.ru, CC BY 4.0)',
  },
};

/** Stok video sorguları (Pexels, Pixabay). Her sorgu için en fazla 3 aday; klip en fazla 2,5 sn. */
export const brollQueries: Record<string, string[]> = {
  S3: ['calendar pages flipping'],
  S6: ['warehouse empty dark'],
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
  /** Varsayılan başlangıç / bitiş (sn). Gerçek değerler ses işlendikten sonra f35.audio.json'dan gelir. */
  start: number;
  end: number;
  /** Seslendirme metni ([ekran|okunuş] biçiminde). Boşsa sahnede konuşma yok. */
  voice: string;
  /** Altyazısı gösterilmeyecek cümleler (sahne içi sıra, 0'dan) */
  hideCaptionSentences?: number[];
  /** Sahne içi anlar: seslendirmede o kelimenin başladığı an (+offset sn); ses yoksa sahne başından saniye. */
  cues: Record<string, {word: string; fallback: number; offset?: number}>;
  musicLevel: {speech: number; gap: number};
  source?: string;
};

const ML = {speech: AUDIO_SETTINGS.music.speech, gap: AUDIO_SETTINGS.music.gap};

export const SCENES: Scene[] = [
  {
    id: 'S1',
    name: 'Kanca',
    start: 0,
    end: 7,
    voice: "Şark oturup beklemenin yeridir. Türkiye'nin 6 savaş uçağı 7 yıldır [ABD'de|Amerika'da] bekliyor.",
    hideCaptionSentences: [0],
    cues: {
      count: {word: "Türkiye'nin", fallback: 3.5},
      stamp: {word: 'bekliyor.', fallback: 5.5},
    },
    musicLevel: ML,
    source: 'Kaynak: Ahmet Hamdi Tanpınar, Huzur, 1949; Defense Mirror, 8 Eki 2026',
  },
  {
    id: 'S2',
    name: 'Ortaklık',
    start: 7,
    end: 13.5,
    voice: "Oysa Türkiye alıcı değil, ortaktı. Uçağın 900'den fazla parçasını Türk fabrikaları üretiyordu.",
    cues: {
      parts: {word: "900'den", fallback: 3.0},
      progress: {word: 'üretiyordu.', fallback: 5.0},
    },
    musicLevel: ML,
    source: 'Kaynak: Pentagon, 17 Tem 2019; Turkish Minute, 15 Eki 2026',
  },
  {
    id: 'S3',
    name: 'Teslimat durdu',
    start: 13.5,
    end: 19.5,
    voice: "Sonra Rusya'dan [S-400|es dört yüz] geldi. 5 gün sonra Türkiye programın dışındaydı.",
    cues: {
      fiveDays: {word: '5', fallback: 2.6},
      stamp: {word: 'dışındaydı.', fallback: 4.4},
    },
    musicLevel: ML,
    source: 'Kaynak: Defence Turk, Tem 2026; USNI News, 17 Tem 2019',
  },
  {
    id: 'S4',
    name: 'Gerekçe',
    start: 19.5,
    end: 25.5,
    voice: "Washington'a göre radar, sırları Rusya'ya taşıyabilirdi. Ankara'ya göre sistem NATO'ya bağlanmayacaktı.",
    cues: {
      footer: {word: "Ankara'ya", fallback: 3.4, offset: 1.4},
    },
    musicLevel: ML,
    source: 'Kaynak: Pentagon, 17 Tem 2019; Medyascope, 7 Tem 2026; Duvar English, 14 Ara 2020',
  },
  {
    id: 'S5',
    name: 'Yeni güncelleme',
    start: 25.5,
    end: 33.5,
    voice: 'Bu yaz Trump kapıyı araladı. Ama yasa net. [S-400|es dört yüz] varsa [F-35|ef otuz beş] yok.',
    cues: {
      progress: {word: 'araladı.', fallback: 1.6},
      rule: {word: 'Ama', fallback: 3.4},
      law: {word: 'S-400', fallback: 3.0},
    },
    musicLevel: ML,
    source: 'Kaynak: Aero Corner, 3 Eki 2026; Euronews, 13 Tem 2026',
  },
  {
    id: 'S6',
    name: 'Plot twist',
    start: 33.5,
    end: 42,
    voice: "Bir dakika. Bekleyen ikinci bir paket var. Ankara'daki [S-400|es dört yüz]'ler. Raporlara göre hiç devreye alınmadılar.",
    cues: {
      cards: {word: 'Bekleyen', fallback: 1.6},
      note: {word: 'Raporlara', fallback: 4.6},
    },
    musicLevel: ML,
    source: 'Kaynak: Chatham House, Tem 2026; Defense Mirror, 8 Eki 2026',
  },
  {
    id: 'S7',
    name: 'Devir talebi',
    start: 42,
    end: 48.5,
    voice: "Çözüm onları satmak. [BAE|Emirlikler] ve Katar'ın adı geçti. Ama satış Moskova'nın onayına bağlı.",
    cues: {
      routes: {word: 'Çözüm', fallback: 0.1},
      press: {word: 'BAE', fallback: 1.6},
      stamp: {word: 'Ama', fallback: 3.6},
    },
    musicLevel: ML,
    source: 'Kaynak: Karar, Tem 2026; Doğru Haber, Tem 2026; Hürriyet Daily News, 26 Eyl 2026',
  },
  {
    id: 'S8',
    name: 'Hâlâ beklemede',
    start: 48.5,
    end: 56,
    voice: "İki paket de hâlâ bekliyor. Anahtarlar Washington'da ve Moskova'da.",
    cues: {
      keys: {word: 'Anahtarlar', fallback: 1.8},
    },
    musicLevel: ML,
    source: 'Kaynak: Turkish Minute, 18 Eyl 2026; Euronews, 8 Eki 2026',
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

export type StepState = 'done' | 'fail' | 'unknown';
export const STEPS: {label: string; state: StepState}[] = [
  {label: 'SİPARİŞ 2002', state: 'done'},
  {label: 'ÜRETİM 2018', state: 'done'},
  {label: 'TESLİMAT', state: 'fail'},
  {label: 'TESLİM', state: 'unknown'},
];

export const TEXT = {
  trackingId: 'TAKİP: TR-F35',
  quote: {text: 'Şark oturup beklemenin yeridir.', author: 'Ahmet Hamdi Tanpınar', work: 'Huzur (1949)'},
  hook: '6 UÇAK · 7 YILDIR HANGARDA',
  hookCounter: {value: 6, frames: 12},
  stamps: {
    wait: 'BEKLEMEDE',
    stopped: 'TESLİMAT DURDU · 17 TEM 2019',
    extra: 'EK ŞART',
    approval: 'ONAY BEKLENİYOR',
  },
  dayCounter: 'BEKLEME',

  s2: {
    kicker: 'DURUM GÜNCELLEMESİ · 2002',
    counter: {value: 900, suffix: '+', label: 'PARÇA · TÜRK FABRİKALARI'},
    parts: ['ORTA GÖVDE', 'KOKPİT EKRANI', 'İNİŞ TAKIMI'],
    sub: 'Ortak ülke · 1,4 milyar $ ödeme · 100 uçak planı',
    drawingLabel: 'ÇİZİM',
  },

  s3: {
    kicker: '12 TEM 2019 · MÜRTED',
    note: 'S-400 sözleşmesi 2017 · ~2,5 milyar $',
    calendar: {month: 'TEMMUZ 2019', from: 12, to: 17},
    big: '5 GÜN',
  },

  s4: {
    kicker: 'DURDURMA GEREKÇESİ',
    left: {title: 'WASHINGTON', text: "S-400 radarı, F-35'in görünmezlik verisini Rusya'ya taşıyabilir.", who: 'Pentagon · 17 Tem 2019'},
    right: {title: 'ANKARA', text: 'Sistem NATO ağına entegre edilmeyecek.', who: 'Türk hükümeti · 7 Tem 2026'},
    footer: "Aralık 2020 · CAATSA yaptırımı · Pentagon'a göre 9 milyar $ iş payı kaybı",
  },

  s5: {
    kicker: 'DURUM GÜNCELLEMESİ · 7 TEM 2026 · ANKARA',
    quote: {
      name: 'Donald Trump',
      title: 'ABD Başkanı',
      date: '7 Tem 2026',
      text: "CAATSA'yı kaldırabilir, F-35 satışını değerlendirebiliriz.",
      summary: true,
    },
    rule: "ABD yasası (NDAA 2020, Madde 1245): S-400 Türkiye'deyse F-35 transferi yok.",
    footer: '22 Tem 2026 · ABD Dışişleri: şartlar sağlanmadı',
  },

  s6: {
    wait: 'Bir dakika...',
    kicker: 'İKİ PAKET',
    left: {pkg: 'PAKET 1', name: 'F-35 (6 adet)', location: 'ABD', updated: '8 Eki 2026', note: "Türkiye'ye teslim edilmedi."},
    right: {pkg: 'PAKET 2', name: 'S-400', location: 'Ankara', updated: 'Tem 2026', note: 'Raporlara göre hiç devreye alınmadı.'},
  },

  s7: {
    kicker: 'DEVİR TALEBİ · TEMMUZ 2026',
    labels: {turkey: 'TÜRKİYE', uae: 'BAE', qatar: 'KATAR', moscow: 'MOSKOVA'},
    press: "Türk basını: S-400 Körfez'e satılıyor. Hiçbir hükümet doğrulamadı.",
    qatarNote: "Katar 2018'de S-400'ü Rusya'dan almak istemişti.",
    lavrov: {
      name: 'Sergey Lavrov',
      title: 'Rusya Dışişleri Bakanı',
      date: '26 Eyl 2026',
      text: "Devir ancak Rusya'nın onayıyla, dost bir ülkeye ve Ukrayna'ya gitmeme garantisiyle.",
      summary: true,
    },
  },

  s8: {
    kicker: 'DURUM: HÂLÂ BEKLEMEDE',
    lines: ["Bu arada: Suudi Arabistan'a 48 F-35 onayı · Eyl 2026", 'Marco Rubio · ABD Dışişleri Bakanı · 7 Eki 2026: S-400 çözülmeden yasal olarak mümkün değil.'],
    keys: ['WASHINGTON', 'MOSKOVA'],
    question: 'Sence önce hangi kilit açılır?',
  },

  cover: {kicker: '6 F-35 · 7 YIL'},
};

/** Altyazıda ve SRT'de yazılması zorunlu biçimler; okunuşlar ekrana geçmez. */
export const DISPLAY_TERMS = ['F-35', 'S-400', 'BAE'];
export const SPOKEN_ONLY = ['ef otuz beş', 'es dört yüz', 'Emirlikler', 'Amerika'];
