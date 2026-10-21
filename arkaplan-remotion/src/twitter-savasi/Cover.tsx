import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONTS, Logo, useBrandFonts} from '../brand';
import {COORDS, SIDES} from '../data/twitter-savasi';
import {greatCircle, ll, RouteArrow, Stamp, Target, WarMap} from './parts';

const ROUTE = greatCircle(ll(COORDS.istanbul), ll(COORDS.pekin), 80);

/** Kapak: 1080x1920 (Reels) ve 1080x1350 (4:5, site kartı). */
export const CoverTw: React.FC<{ratio: '9x16' | '4x5'}> = ({ratio}) => {
  useBrandFonts();
  const tall = ratio === '9x16';
  const cy = tall ? 760 : 470;
  const titleTop = tall ? 1010 : 720;
  const half = Math.floor(ROUTE.length / 2);
  return (
    <AbsoluteFill>
      <WarMap cam={{lon: 72, lat: 39, scale: tall ? 520 : 480}} cy={cy}>
        {(p) => {
          const [ix, iy] = p(ll(COORDS.istanbul)) ?? [0, 0];
          const [bx, by] = p(ll(COORDS.pekin)) ?? [0, 0];
          return (
            <>
              <RouteArrow proj={p} pts={ROUTE.slice(0, half - 2)} progress={1} color={SIDES.tr.color} width={8} />
              <RouteArrow proj={p} pts={[...ROUTE].reverse().slice(0, half - 2)} progress={1} color={SIDES.cn.color} width={8} />
              <Target x={ix} y={iy} color={SIDES.tr.color} label={SIDES.tr.label} />
              <Target x={bx} y={by} color={SIDES.cn.color} label={SIDES.cn.label} labelSide="left" />
            </>
          );
        }}
      </WarMap>
      <div style={{position: 'absolute', left: 72, top: tall ? 230 : 70, display: 'flex', alignItems: 'center', gap: 18}}>
        <Logo size={64} stroke="rgba(242,238,230,0.55)" />
        <div style={{font: `700 30px ${FONTS.mono}`, letterSpacing: '0.12em', color: COLORS.dimDark}}>CEPHE RAPORU · X</div>
      </div>
      <div style={{position: 'absolute', left: 72, right: tall ? 140 : 72, top: titleTop}}>
        <div style={{font: `800 ${tall ? 100 : 96}px/1 ${FONTS.sans}`, letterSpacing: '-0.025em', color: COLORS.cream}}>
          Birinci Twitter
          <br />
          Savaşı
        </div>
        <div style={{font: `500 ${tall ? 54 : 46}px/1.2 ${FONTS.sans}`, color: COLORS.cream, marginTop: 22}}>Türkler ve Çinliler X'te</div>
        <div style={{marginTop: tall ? 46 : 30, display: 'inline-block', marginLeft: 8}}>
          <Stamp text="19 EKİM 2026" t={30} rotate={-5} size={tall ? 42 : 36} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 72, bottom: tall ? 400 : 60, font: `700 28px ${FONTS.mono}`, color: COLORS.dimDark, letterSpacing: '0.06em'}}>
        arka plan · bir dakikada bağlam
      </div>
    </AbsoluteFill>
  );
};
