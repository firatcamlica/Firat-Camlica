import React from 'react';
import {Sequence} from 'remotion';
import {QaContext, ensureFonts} from '../brand';
import {FRANSA_SLIDES} from './FransaSlides';

export const SLIDE_FRAMES = 45;
export const STILL_OFFSET = SLIDE_FRAMES - 1; // tüm girişler bitmiş hâli

export const FransaCarousel: React.FC<{qa?: boolean}> = ({qa = false}) => {
  ensureFonts();
  return (
    <QaContext.Provider value={qa}>
      {FRANSA_SLIDES.map((Slide, i) => (
        <Sequence key={i} from={i * SLIDE_FRAMES} durationInFrames={SLIDE_FRAMES}>
          <Slide />
        </Sequence>
      ))}
    </QaContext.Provider>
  );
};
