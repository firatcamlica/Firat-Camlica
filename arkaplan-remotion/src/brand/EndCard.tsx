import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Logo} from './Logo';
import {CHANNEL, COLORS, FONTS, SLOGAN} from './tokens';

/** Kanalın kapanış kartı: logo, kanal adı, slogan. */
export const EndCard: React.FC<{note?: string}> = ({note}) => {
  const f = useCurrentFrame();
  const merge = interpolate(f, [0, 14], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const o = interpolate(f, [6, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: COLORS.cream, alignItems: 'center', justifyContent: 'center', color: COLORS.black}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, marginTop: -80}}>
        <Logo size={220} merge={merge} />
        <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 128, letterSpacing: '-0.02em', lineHeight: 1, opacity: o}}>
          {CHANNEL}
        </div>
        <div style={{fontFamily: FONTS.sans, fontWeight: 500, fontSize: 52, opacity: o}}>{SLOGAN}</div>
        {note ? (
          <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.06em', color: COLORS.blue, opacity: o, marginTop: 16, textTransform: 'uppercase'}}>
            {note}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
