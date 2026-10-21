// "Birinci Twitter Savaşı: Türkler ve Çinliler X'te" (Reels, 1080x1920, 30 fps)
// Tüm metinler, varsayılan sahne süreleri ve kaynaklar burada.
// Ses gelince sahne başlangıçları tools/prep_audio_tw.py tarafından
// twitter-savasi.audio.json dosyasına yazılır ve buradaki varsayılanların yerine geçer.
//
// Kaynak kuralı: her ekran metninin bir `source` alanı var. Doğrulanamayanlar TODO_SOURCE.
// arkaplan sitesine aktarmak için: node scripts/sync-sources.mjs <bu-klasör> twitter-savasi twitter-savasi

export const TODO_SOURCE = 'Kaynak: doğrulanacak';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Güvenli alan (px). Sol kenar için kanalın varsayılan iç boşluğu. */
export const SAFE = {top: 220, bottom: 380, right: 140, left: 72};

export type SceneId = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';

/** Varsayılan sahne başlangıçları (saniye). Son eleman toplam süre. */
export const DEFAULT_STARTS: Record<SceneId, number> = {
  S0: 0,
  S1: 3.5,
  S2: 12,
  S3: 21,
  S4: 31,
  S5: 42,
  S6: 50,
  S7: 60,
};
export const DEFAULT_TOTAL = 65;
/** S7'nin son 2 saniyesi kapanış kartı. */
export const ENDCARD_SECONDS = 2;

export const EVENT_SOURCE = 'Kaynak: Sözcü, Yeni Ankara, Onedio, Mynet (20-21 Eki 2026)';

export const COORDS = {
  istanbul: {name: 'İstanbul', lat: 41.0082, lon: 28.9784},
  pekin: {name: 'Pekin', lat: 39.9042, lon: 116.4074},
  tokyo: {name: 'Tokyo', lat: 35.6762, lon: 139.6503},
  taipei: {name: 'Taipei', lat: 25.033, lon: 121.5654},
};

/** Ülke etiketleri: bayrak yok, yalnızca isim ve ince renk çizgisi. */
export const SIDES = {
  tr: {label: 'TÜRKİYE', color: '#4F7BFF'},
  cn: {label: 'ÇİN', color: '#F2A93B'},
  jp: {label: 'JAPONYA', color: '#C9C3B8'},
  tw: {label: 'TAYVAN', color: '#C9C3B8'},
};

/**
 * Tweet kartları. `file` public/tweets/ altındaki ekran görüntüsüdür. Dosya yoksa (tools/prep_tw.py
 * listesine göre) yalnızca `summary` tipografik kart olarak gösterilir: uydurma tweet, kullanıcı adı
 * ya da arayüz üretilmez.
 * `aspect`: görüntünün yükseklik/genişlik oranı. `crop`: gösterilecek dikey dilim (0-1).
 * `blur`: profil fotoğrafı + kullanıcı adı bölgeleri, görüntüye göre 0-1 kesirleri.
 * `side`: esprinin hangi taraftan geldiği (denge sayımı için).
 */
export type Rect = {x: number; y: number; w: number; h: number};
export type TweetSlot = {
  id: string;
  side: 'tr' | 'cn';
  file: string | null;
  aspect: number;
  crop: {y0: number; y1: number};
  blur: Rect[];
  label: string;
  summary: string;
  /** Kartın altındaki taraf etiketi; verilmezse "ÇİNLİ/TÜRK HESAPLARDAN". */
  tag?: string;
  source: string;
};

// Kullanıcının paylaştığı ekran görüntüsü (19-20 Eki 2026). Tek görüntü iki karta kırpılır:
// alıntılanan Çince paylaşım (Çin tarafı) ve üstteki Türkçe cevap (Türk tarafı).
// Diğer ekran görüntüleri kullanılmadı: etnik karikatür, hakaret içeren metin, gerçek kişinin yüzü
// ya da bu olayla ilgisiz içerik (ayrıntı: teslim raporu).
const SHOT_SED = 'tw_sed_patrick.png';
const SHOT_SED_ASPECT = 1034 / 596;
const SHOT_SED_BLUR: Rect[] = [
  {x: 0, y: 0, w: 0.62, h: 0.09}, // cevap verenin profil fotoğrafı, adı, kullanıcı adı
  {x: 0.01, y: 0.452, w: 0.64, h: 0.042}, // alıntılanan hesabın profil fotoğrafı, adı, kullanıcı adı
];

export const TWEETS: TweetSlot[] = [
  {
    id: '01',
    side: 'cn',
    file: SHOT_SED,
    aspect: SHOT_SED_ASPECT,
    crop: {y0: 0.448, y1: 0.945},
    blur: SHOT_SED_BLUR,
    label: "X'te dolaşan espri (özet)",
    summary: 'Çince bir paylaşım, Türk bayrağının yanına paraşütle inen bir çizgi film karakteri koydu.',
    source: EVENT_SOURCE,
  },
  {
    id: 'cevap',
    side: 'tr',
    file: SHOT_SED,
    aspect: SHOT_SED_ASPECT,
    crop: {y0: 0, y1: 0.448},
    blur: SHOT_SED_BLUR,
    label: "X'te dolaşan espri (özet)",
    summary: 'Bu duvarı kimden korunmak için ördünüz?',
    source: EVENT_SOURCE,
  },
  {
    // Kullanıcının paylaştığı ekran görüntüsü (19 Eki 2026). Paylaşanın hangi taraftan olduğu bilinmiyor;
    // içerik Türkiye'ye gönderme yaptığı için Çin tarafı hanesine sayılır, etiket tarafsız kalır.
    id: 'f35',
    side: 'cn',
    file: 'tw_f35.webp',
    aspect: 924 / 956,
    crop: {y0: 0.155, y1: 0.832},
    blur: [{x: 0, y: 0, w: 0.42, h: 0.125}],
    label: "X'te dolaşan paylaşım",
    summary: "F-35'li karikatür",
    tag: "TÜRKİYE'YE GÖNDERME",
    source: EVENT_SOURCE,
  },
  {
    id: '03',
    side: 'tr',
    file: null,
    aspect: 1,
    crop: {y0: 0, y1: 1},
    blur: [],
    label: "X'te dolaşan espri",
    summary: 'Ortalama bir Türk, aynı anda beş Çinliyle savaşıyor.',
    tag: "ÇİN'E GÖNDERME",
    // Esprinin kendisi X'te dolaşıyor; haber kaynaklarında birebir geçtiği doğrulanmadı.
    source: TODO_SOURCE,
  },
];

export const TEXT = {
  topTag: 'CEPHE RAPORU',

  s0: {
    title: 'Birinci Twitter Savaşı başladı.',
    tag: 'CEPHE: X · 19 EKİM 2026',
    source: EVENT_SOURCE,
  },

  s1: {
    tag: '19 EKİ · İLK ATEŞ',
    tweet: '01',
    replyLabel: 'Türk cevabı:',
    reply: 'cevap',
    source: EVENT_SOURCE,
  },

  s2: {
    tag: 'KARŞI ATAK',
    distance: {
      label: 'ÇİNLİ HESAPLARIN CEVABI',
      prefix: '≈',
      unit: 'km',
      note: 'İstanbul → Pekin, büyük daire mesafesi',
      source: 'Hesaplama: haversine, R = 6.371 km, şehir merkezi koordinatları',
    },
    topicsTitle: 'Çinli hesapların karşılık verdiği başlıklar',
    // Seslendirme "ekonomi, teknoloji, harita" diyor; ekran ona uyar. Haberlerde ekonomi, tarih/coğrafya ve
    // sinema (IMDb puanları) geçiyor, "teknoloji" doğrulanmadı (bkz. TESLIM raporu).
    topics: [
      {id: 'ekonomi', label: 'Ekonomi', source: EVENT_SOURCE},
      {id: 'teknoloji', label: 'Teknoloji', source: TODO_SOURCE},
      {id: 'cografya', label: 'Coğrafya', source: EVENT_SOURCE},
    ],
    source: EVENT_SOURCE,
  },

  s3: {
    newFronts: ['Japon kullanıcılar', 'Tayvanlı kullanıcılar'],
    allianceTitle: 'Hayali ittifak haritası',
    stamp: 'RESMÎ KARŞILIĞI YOK',
    memes: ['f35', '03'],
    source: EVENT_SOURCE,
  },

  s4: {
    freeze: 'Bir dakika...',
    ban: {
      text: "X, Çin anakarasında 2009'dan beri yasak.",
      source: 'Kaynak: Reuters, BBC (Temmuz 2009)',
    },
    question: 'Bu kadar Çinli nereden çıktı?',
    answers: ['VPN ile bağlananlar', 'Çin dışında yaşayan Çince konuşanlar'],
    bot: {
      main: 'Bot iddiaları var.',
      sub: 'Koordineli bir bot ağını gösteren doğrulanmış bir analiz yok.',
      // Bu tartışmaya özgü bot iddialarını aktaran bir haber kaynağı bulunamadı.
      source: TODO_SOURCE,
    },
  },

  s5: {
    tag: 'BAĞLAM',
    title: 'Esprilerin arasında ciddi bir konu: Uygurlar.',
    lines: [
      'BM İnsan Hakları Ofisi (2022): ciddi insan hakları ihlalleri tespit etti.',
      'Çin: raporu reddediyor.',
    ],
    region: 'Sincan Uygur Özerk Bölgesi (Doğu Türkistan)',
    source: 'Kaynak: BM İnsan Hakları Yüksek Komiserliği, Sincan değerlendirmesi (31 Ağu 2022); Çin Cenevre Daimi Temsilciliği yanıtı (31 Ağu 2022)',
  },

  s6: {
    tag: '15 EKİ 2026 · BAKÜ · CICA ZİRVESİ',
    intro: 'Diplomasi ise bambaşka bir yerde.',
    meeting: {
      text: 'Hakan Fidan ve Wang Yi: yatırım, ticaret, Kuşak ve Yol ile Orta Koridor.',
      source: 'Kaynak: Çin Dışişleri Bakanlığı (16 Eki 2026); Euronews (15 Eki 2026)',
    },
    oneChina: {
      text: "Çin'in açıklamasına göre Türkiye Tek Çin ilkesine bağlılığını yineledi.",
      source: 'Kaynak: Çin Dışişleri Bakanlığı (16 Eki 2026)',
    },
    splitLeft: "X'te savaş",
    splitRight: 'Masada iş birliği',
  },

  s7: {
    question: 'Sence bu savaşı kim kazandı?',
    cta: "En iyi meme'i yorumlara bırak.",
    endNote: 'kaynaklar: arkaplan.pages.dev',
  },
};

/** Sitedeki fotoğraf kredileri için (bu videoda stok görüntü yok). */
export const PHOTO_SLOTS = {};

/** Harita verisi kaynağı (sitede "manual" kayıt olarak zaten var). */
export const MAP_SOURCE = 'Natural Earth (harita verisi, kamu malı)';
