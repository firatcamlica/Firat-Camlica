import React from 'react';
import {Composition} from 'remotion';
import {H, W} from './brand';
import {FransaCarousel, SLIDE_FRAMES} from './carousel/FransaCarousel';
import {FRANSA_SLIDES} from './carousel/FransaSlides';

export const Root: React.FC = () => (
  <Composition
    id="fransa-carousel"
    component={FransaCarousel}
    width={W}
    height={H}
    fps={30}
    durationInFrames={FRANSA_SLIDES.length * SLIDE_FRAMES}
    defaultProps={{qa: false}}
  />
);
