// Fransa videosunun verisinden carousel'in kullandığı alt küme. Asıl dosya Mac'teki projede
// (src/data/fransa.ts); değerler 18–19 Eki carousel karelerinden ve oturum kaydından alındı.
export const TODO_SOURCE = 'Kaynak: doğrulanacak';
export const ACCENT = '#E1000F';

export const PHOTO_SLOTS = {
  hook: 'perpignan-castillet',
  s4: 'poubelle-fumee',
};

export const TEXT = {
  s0: {
    kicker: 'EYLÜL-EKİM 2026 · FRANSA',
    headline: "Fransa'yı sarsan isyan bir sınıfta başladı.",
    accentWord: 'sınıfta',
  },
  s2: {
    counterLabel: 'etkilenen lise',
    footer: "Fransa'da yaklaşık 3.700 lise var.",
    steps: [{date: '30 EYL', value: 323}, {date: '1 EKİ', value: 1027}],
  },
  s4: {
    detentions: {value: 5060, label: 'gözaltı'},
    minors: {text: "yüzde 87'si reşit değil"},
    event: 'Lens: 15 yaşında bir öğrenci polis bombasıyla elini kaybetti.',
    eventNote: 'Hükümet şok bombası kullanımını durdurdu.',
    source: 'Kaynak: Fransa Adalet Bakanlığı, Başbakanlık (Reuters); BBC',
  },
  s5: {
    turnout: {
      title: 'Rakamlar bile tartışmalı.',
      bars: [
        {label: 'Bakanlık', value: 161500, display: '161.500'},
        {label: 'Sendikalar', value: 480000, display: '480.000'},
      ],
      source: 'Kaynak: Bakanlık, sendikalar',
    },
    split: {ring: 62, ringLabel: "Fransızların yüzde 62'si hareketi haklı buluyor", source: 'Kaynak: Le Figaro anketi'},
  },
  s6: {question: 'Sınıftan çıkan öfke sandığa da taşınacak mı?', note: '2027 cumhurbaşkanlığı seçimi'},
};
