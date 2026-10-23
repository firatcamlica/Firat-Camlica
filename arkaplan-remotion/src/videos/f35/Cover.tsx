// Kapak: başlık ortadaki 1080x1440 alanın (y 240–1680) içinde; 4:5 (y 285–1635) kırpmasında da tam görünür.
// Zemin F-35A fotoğrafı (koyu duoton); fotoğraf yoksa F-35 çizimi.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {PHOTO_SLOTS, TEXT} from '../../data/f35';
import {useBrandFonts} from '../../brand/fonts';
import {Logo} from '../../brand/Logo';
import {DuotoneDefs} from '../../brand/Media';
import {CHANNEL, COLORS, FONTS} from '../../brand/tokens';
import {F35Side} from './illustrations';
import {photo} from './timing';

export const COVER_SAFE = {top: 285, bottom: 1635};

export const CoverF35: React.FC = () => {
  useBrandFonts();
  const p = photo(PHOTO_SLOTS.cover);
  const [l1, l2] = ['6 UÇAK', TEXT.cover.title.replace(/^6 UÇAK\s*/, '')];
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <DuotoneDefs />
      {p ? (
        <Img src={staticFile(p.file)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'url(#duotone-dark)'}} />
      ) : (
        <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 60% 62%, #22305F 0%, #10142A 55%, #0B0D18 100%)'}}>
          <div style={{position: 'absolute', left: -40, top: 1080, transform: 'rotate(-8deg)', transformOrigin: 'left center', opacity: 0.95}}>
            <F35Side width={1240} fill="#05060C" line={COLORS.cream} />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,13,24,0.86) 0%, rgba(11,13,24,0.5) 48%, rgba(11,13,24,0.15) 70%, rgba(11,13,24,0.7) 100%)'}} />
      <div style={{position: 'absolute', left: 72, top: COVER_SAFE.top + 60, width: 900}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <Logo size={64} />
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 38, color: COLORS.cream}}>{CHANNEL}</div>
        </div>
        <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: COLORS.dimDark, marginTop: 56}}>{TEXT.cover.kicker}</div>
        <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 168, lineHeight: 0.94, letterSpacing: '-0.04em', color: COLORS.cream, marginTop: 20}}>
          <span style={{background: COLORS.blue, padding: '0 18px', borderRadius: 18, display: 'inline-block'}}>{l1}</span>
          <div style={{marginTop: 18}}>{l2}</div>
        </div>
      </div>
      {!p ? (
        <div style={{position: 'absolute', left: 72, bottom: 1920 - COVER_SAFE.bottom + 40, fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: COLORS.dimDark}}>
          ÇİZİM
        </div>
      ) : (
        <div style={{position: 'absolute', left: 72, bottom: 1920 - COVER_SAFE.bottom + 40, fontFamily: FONTS.mono, fontWeight: 500, fontSize: 22, color: COLORS.dimDark}}>{p.credit}</div>
      )}
    </AbsoluteFill>
  );
};
