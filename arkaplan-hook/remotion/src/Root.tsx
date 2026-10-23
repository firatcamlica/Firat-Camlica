import React from 'react';
import {Composition} from 'remotion';
import {HookProps} from './brand/Hook';
import {HookDemo} from './demo/HookDemo';

const PHOTO: HookProps = {
  text: 'Örnek hook: fotoğraf yavaşça yakınlaşıyor',
  background: {kind: 'photo', src: 'demo/foto.jpg', credit: 'Demo fotoğraf', focus: [0.5, 0.4]},
};
const COUNTER: HookProps = {
  text: 'Örnek hook: rakam arka planda sayıyor',
  background: {kind: 'counter', value: 1027},
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="hook-demo-foto" component={HookDemo} durationInFrames={150} fps={30} width={1080} height={1920} defaultProps={PHOTO} />
    <Composition id="hook-demo-sayac" component={HookDemo} durationInFrames={150} fps={30} width={1080} height={1920} defaultProps={COUNTER} />
  </>
);
