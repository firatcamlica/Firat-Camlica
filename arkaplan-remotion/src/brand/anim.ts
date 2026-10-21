import {Easing, interpolate, useCurrentFrame} from 'remotion';

export const ENTER = 18;

// Kare içi giriş animasyonu; carousel karesi animasyon bittikten sonra çekilir.
export const useEnter = (delay = 0, duration = ENTER) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return {t, style: {opacity: t, transform: `translateY(${(1 - t) * 24}px)`}};
};
