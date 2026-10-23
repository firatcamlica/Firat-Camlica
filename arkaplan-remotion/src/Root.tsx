import React from 'react';
import {Composition, Still} from 'remotion';
import {COMPOSITION_ID, FPS, HEIGHT, WIDTH} from './data/f35';
import {CoverF35} from './videos/f35/Cover';
import {TurkiyeF35} from './videos/f35/TurkiyeF35';
import {TOTAL_FRAMES} from './videos/f35/timing';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id={COMPOSITION_ID} component={TurkiyeF35} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="cover-turkiye-f35" component={CoverF35} width={1080} height={1920} />
  </>
);
