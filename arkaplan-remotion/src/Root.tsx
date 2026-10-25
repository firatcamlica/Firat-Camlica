import React from 'react';
import {Composition} from 'remotion';
import {CAROUSEL} from './brand/Carousel';
import {ensureFonts} from './brand/fonts';
import {PhotoCredit} from './brand/Photo';
import {FRANSA_SLIDE_COUNT, FransaCarousel} from './videos/carousel/FransaCarousel';
import {AZERBAYCAN_SLIDE_COUNT, AzerbaycanCarousel} from './videos/carousel/AzerbaycanCarousel';

// public/photos/credits.json'un carousel'de kullanılan kısmı
const PHOTOS: PhotoCredit[] = [
  {id: 'perpignan-castillet', author: 'Aurelio Cárdenas', license: 'CC BY 4.0', place: 'Perpignan'},
  {id: 'poubelle-fumee', author: 'Camille Hestaux', license: 'CC0'},
];

const Fransa: React.FC<{qa?: boolean}> = ({qa}) => {
  ensureFonts();
  return <FransaCarousel photos={PHOTOS} qa={qa} />;
};

const Azerbaycan: React.FC<{qa?: boolean}> = ({qa}) => {
  ensureFonts();
  return <AzerbaycanCarousel qa={qa} />;
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="fransa-carousel"
      component={Fransa}
      width={CAROUSEL.width}
      height={CAROUSEL.height}
      fps={30}
      durationInFrames={FRANSA_SLIDE_COUNT * CAROUSEL.slideFrames}
      defaultProps={{qa: false}}
    />
    <Composition
      id="azerbaycan-carousel"
      component={Azerbaycan}
      width={CAROUSEL.width}
      height={CAROUSEL.height}
      fps={30}
      durationInFrames={AZERBAYCAN_SLIDE_COUNT * CAROUSEL.slideFrames}
      defaultProps={{qa: false}}
    />
  </>
);
