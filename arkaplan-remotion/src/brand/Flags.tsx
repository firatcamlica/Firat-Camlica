// Küçük ülke bayrakları (harita etiketleri için). Oranlar resmî tanımlara yakın, sadeleştirilmiş çizim.
import React from 'react';

const star = (cx: number, cy: number, r: number, rot = 0) =>
  Array.from({length: 10}, (_, i) => {
    const a = rot + (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.382;
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  }).join(' ');

const FLAGS: Record<string, {ratio: number; node: React.ReactNode}> = {
  // Türkiye 2:3 — kırmızı zemin, ay-yıldız
  TR: {
    ratio: 1.5,
    node: (
      <>
        <rect width={30} height={20} fill="#E30A17" />
        <circle cx={10} cy={10} r={5} fill="#FFF" />
        <circle cx={11.25} cy={10} r={4} fill="#E30A17" />
        <polygon points={star(16.1, 10, 2.5, -Math.PI / 2)} fill="#FFF" />
      </>
    ),
  },
  // Katar 11:28 — bordo zemin, direk tarafında 9 dişli beyaz şerit
  QA: {
    ratio: 28 / 11,
    node: (
      <>
        <rect width={28} height={11} fill="#8A1538" />
        <polygon
          fill="#FFF"
          points={`0,0 ${Array.from({length: 9}, (_, i) => `7,${(i * 11) / 9} 9.5,${((i + 0.5) * 11) / 9}`).join(' ')} 7,11 0,11`}
        />
      </>
    ),
  },
  // Birleşik Arap Emirlikleri 1:2 — kırmızı dikey şerit, yeşil/beyaz/siyah
  AE: {
    ratio: 2,
    node: (
      <>
        <rect width={24} height={4} fill="#00732F" />
        <rect y={4} width={24} height={4} fill="#FFF" />
        <rect y={8} width={24} height={4} fill="#000" />
        <rect width={6} height={12} fill="#FF0000" />
      </>
    ),
  },
  // Rusya 2:3 — beyaz/mavi/kırmızı
  RU: {
    ratio: 1.5,
    node: (
      <>
        <rect width={30} height={20 / 3} fill="#FFF" />
        <rect y={20 / 3} width={30} height={20 / 3} fill="#0039A6" />
        <rect y={40 / 3} width={30} height={20 / 3} fill="#D52B1E" />
      </>
    ),
  },
};

const VIEW: Record<string, string> = {TR: '0 0 30 20', QA: '0 0 28 11', AE: '0 0 24 12', RU: '0 0 30 20'};

export const Flag: React.FC<{code: keyof typeof FLAGS | string; height?: number}> = ({code, height = 26}) => {
  const f = FLAGS[code];
  if (!f) return null;
  return (
    <svg width={height * f.ratio} height={height} viewBox={VIEW[code]} preserveAspectRatio="none" style={{display: 'block', borderRadius: 3, boxShadow: '0 0 0 1.5px rgba(242,238,230,0.5)'}}>
      {f.node}
    </svg>
  );
};
