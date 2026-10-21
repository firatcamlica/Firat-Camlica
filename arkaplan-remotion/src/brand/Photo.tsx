import React from 'react';
import {Img, staticFile} from 'remotion';
import {MONO, useQa} from './ui';

export type PhotoCredit = {id: string; author: string; license: string; place?: string};

export const creditText = (p: PhotoCredit) => `Foto: ${p.author} / ${p.license}${p.place ? ` · ${p.place}` : ''}`;

/** Mavi duoton fotoğraf. Plakalar zaten duoton (1080x1920); `top` dikey kırpma ofseti. */
export const DuotonePhoto: React.FC<{photo: PhotoCredit; opacity?: number; top?: number}> = ({photo, opacity = 1, top = 285}) => {
  const qa = useQa();
  if (qa) return null;
  return (
    <>
      <Img src={staticFile(`photos/${photo.id}.jpg`)} style={{position: 'absolute', left: 0, top: -top, width: 1080, height: 1920, opacity}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,40,0) 40%, rgba(10,14,40,0.55) 100%)'}} />
    </>
  );
};

export const CreditLine: React.FC<{photo: PhotoCredit; left: number; bottom: number}> = ({photo, left, bottom}) => (
  <div style={{position: 'absolute', left, bottom, fontFamily: MONO, fontWeight: 500, fontSize: 20, color: 'rgba(242,238,230,0.72)'}}>
    {creditText(photo)}
  </div>
);
