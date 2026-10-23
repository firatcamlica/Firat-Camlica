// Kapak: F-35A fotoğrafı tam kadraj, koyu duoton. Başlık Tanpınar alıntısı (italik serif), altında yazar;
// alt üçte birde sarı "BEKLEMEDE" damgası ve "6 F-35 · 7 YIL". Tüm metin ortadaki 1080x1440 alanda (y 240–1680),
// ayrıca 4:5 kırpmasında (y 285–1635) kalır.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {PHOTO_SLOTS, TEXT} from '../../data/f35';
import {useBrandFonts} from '../../brand/fonts';
import {DuotoneDefs} from '../../brand/Media';
import {Stamp} from '../../brand/Tracking';
import {COLORS, FONTS} from '../../brand/tokens';
import {F35Side} from './illustrations';
import {photo} from './timing';

export const COVER_SAFE = {top: 285, bottom: 1635};

export const CoverF35: React.FC = () => {
  useBrandFonts();
  const p = photo(PHOTO_SLOTS.cover);
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <DuotoneDefs />
      {p ? (
        <Img src={staticFile(p.file)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'url(#duotone-dark)'}} />
      ) : (
        <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 60% 62%, #22305F 0%, #10142A 55%, #0B0D18 100%)'}}>
          <div style={{position: 'absolute', left: -40, top: 1080, transform: 'rotate(-8deg)', opacity: 0.95}}>
            <F35Side width={1240} fill="#05060C" line={COLORS.cream} />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,13,24,0.82) 0%, rgba(11,13,24,0.55) 45%, rgba(11,13,24,0.35) 65%, rgba(11,13,24,0.85) 100%)'}} />
      <div style={{position: 'absolute', left: 80, top: 420, width: 920}}>
        <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 132, lineHeight: 1.04, color: COLORS.cream, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>
          {TEXT.quote.text}
        </div>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 32, letterSpacing: 3, color: COLORS.cream, marginTop: 34, opacity: 0.85}}>{TEXT.quote.author}</div>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1270, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'flex-start'}}>
        <Stamp text={TEXT.stamps.wait} tone="wait" at={-10} rotate={-4} size={84} />
        <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: COLORS.cream}}>{TEXT.cover.kicker}</div>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1560, fontFamily: FONTS.mono, fontWeight: 500, fontSize: 20, color: COLORS.dimDark}}>{p ? p.credit : 'ÇİZİM'}</div>
    </AbsoluteFill>
  );
};
