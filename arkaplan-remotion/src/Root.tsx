import React from 'react';
import {Composition, Still} from 'remotion';
import {FPS, HEIGHT, WIDTH} from './data/twitter-savasi';
import {TwitterSavasi} from './twitter-savasi/TwitterSavasi';
import {CoverTw} from './twitter-savasi/Cover';
import {TOTAL_FRAMES} from './twitter-savasi/timing';
import {loopSeconds, MorphLoop} from './twitter-savasi/MorphLoop';

const LOOP_FRAMES = Math.round(loopSeconds() * 60);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="twitter-savasi" component={TwitterSavasi} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="cover-tw" component={CoverTw} width={1080} height={1920} defaultProps={{ratio: '9x16' as const}} />
    <Still id="cover-tw-4x5" component={CoverTw} width={1080} height={1350} defaultProps={{ratio: '4x5' as const}} />
    <Composition id="cephe-morph-9x16" component={MorphLoop} durationInFrames={LOOP_FRAMES} fps={60} width={1080} height={1920} />
    <Composition id="cephe-morph-1x1" component={MorphLoop} durationInFrames={LOOP_FRAMES} fps={60} width={1080} height={1080} />
    <Composition id="cephe-morph-16x9" component={MorphLoop} durationInFrames={LOOP_FRAMES} fps={60} width={1920} height={1080} />
  </>
);
