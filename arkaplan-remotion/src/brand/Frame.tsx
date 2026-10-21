import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {LogoMark} from './Logo';
import {useQa} from './qa';
import {C, H, PAD, W} from './tokens';

type Bg = 'cream' | 'dark' | 'photo';

export const Frame: React.FC<{
  bg: Bg;
  photo?: string;
  photoY?: number; // 1080x1920 fotoğraf plakasında kırpmanın üst kenarı
  shade?: number;
  children: React.ReactNode;
}> = ({bg, photo, photoY = 285, shade = 0.35, children}) => {
  const qa = useQa();
  const base = bg === 'cream' ? C.cream : bg === 'dark' ? C.dark : C.blueDeep;
  return (
    <AbsoluteFill style={{width: W, height: H, background: qa ? 'transparent' : base, overflow: 'hidden'}}>
      {bg === 'photo' && photo && !qa ? (
        <>
          <Img
            src={staticFile(`photos/${photo}.jpg`)}
            style={{position: 'absolute', left: 0, top: -photoY, width: 1080, height: 1920}}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, rgba(10,14,40,${shade * 0.6}) 0%, rgba(10,14,40,${shade}) 45%, rgba(10,12,28,${Math.min(0.92, shade + 0.45)}) 100%)`,
            }}
          />
        </>
      ) : null}
      {!qa ? <LogoMark size={56} style={{position: 'absolute', top: 64, right: PAD}} /> : null}
      <AbsoluteFill style={{padding: `${PAD + 66}px ${PAD}px ${PAD - 8}px`, display: 'flex', flexDirection: 'column'}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Çizimler QA modunda gizlenir; metin taraması yalnızca yazıya bakar.
export const Graphic: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const qa = useQa();
  return <div style={{...style, visibility: qa ? 'hidden' : 'visible'}}>{children}</div>;
};

export const Spacer: React.FC = () => <div style={{flex: 1}} />;
