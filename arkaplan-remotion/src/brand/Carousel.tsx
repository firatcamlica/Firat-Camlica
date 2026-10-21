// Carousel karesi (1080x1350, 4:5): marka zemini, filigran, sayfa numarası, fotoğraf kredisi.
// Kart animasyonları bitmiş haliyle çizilsin diye her kare bir pencerenin son karesinden alınır.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND, THEMES, ThemeName} from './tokens';
import {MONO, QaCtx, ThemeCtx, useQa} from './ui';
import {Logo} from './Logo';
import {CreditLine, DuotonePhoto, PhotoCredit} from './Photo';

export const CAROUSEL = {
  width: 1080,
  height: 1350,
  /** 4:5 kırpmada üst/alt güvenli boşluk; yanlarda da aynı kenar boşluğu */
  pad: 80,
  /** Her kare kendi zaman penceresinde render edilir; son karede tüm animasyonlar bitmiştir */
  slideFrames: 400,
};

/** İçerik kutusu: filigranın altından başlar, sayfa satırının üstünde biter */
export const CBOX = {
  left: CAROUSEL.pad,
  width: CAROUSEL.width - CAROUSEL.pad * 2,
  top: CAROUSEL.pad + BRAND.watermark.size + 30,
  bottom: CAROUSEL.height - CAROUSEL.pad - 56,
};

export const CarouselFrame: React.FC<{
  theme: ThemeName;
  index: number;
  total: number;
  photo?: PhotoCredit;
  photoOpacity?: number;
  photoTop?: number;
  children: React.ReactNode;
}> = ({theme, index, total, photo, photoOpacity = 1, photoTop, children}) => {
  const qa = useQa();
  const th = THEMES[theme];
  const onDark = theme === 'dark' || Boolean(photo);
  return (
    <ThemeCtx.Provider value={th}>
      <AbsoluteFill style={{background: qa ? 'transparent' : th.bg}}>
        {photo && <DuotonePhoto photo={photo} opacity={photoOpacity} top={photoTop} />}
        {children}
        {!qa && (
          <div style={{position: 'absolute', right: CAROUSEL.pad, top: CAROUSEL.pad, opacity: BRAND.watermark.opacity}}>
            <Logo size={BRAND.watermark.size} onDark={onDark} />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            right: CAROUSEL.pad,
            bottom: CAROUSEL.pad,
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 26,
            color: onDark ? 'rgba(242,238,230,0.7)' : 'rgba(22,22,22,0.55)',
          }}
        >
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        {photo && <CreditLine photo={photo} left={CAROUSEL.pad} bottom={CAROUSEL.pad + 4} />}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};

/** Kompozisyon karesi → kare sırası */
export const slideAt = (frame: number, count: number) => Math.min(count - 1, Math.floor(frame / CAROUSEL.slideFrames));
/** n. karenin (0 tabanlı) render edileceği kompozisyon karesi */
export const renderFrameFor = (i: number) => i * CAROUSEL.slideFrames + CAROUSEL.slideFrames - 1;

export {QaCtx};
