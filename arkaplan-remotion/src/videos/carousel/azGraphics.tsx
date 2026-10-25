// Azerbaycan carousel'inin çizimleri: uçuş kartı (06) ve zaman çizelgesi (10). Videodaki kartlarla aynı dil.
import React from 'react';
import {COLORS} from '../../brand/tokens';
import {DISPLAY, MONO, useQa} from '../../brand/ui';

/** Uçuş kartı: üstte siyah şerit, altında güzergâh ve sefer satırı (videodaki "UÇUŞ KARTI") */
export const FlightCard: React.FC<{from: string; to: string; date: string; code: string; type: string; width: number}> = ({
  from,
  to,
  date,
  code,
  type,
  width,
}) => {
  const label: React.CSSProperties = {fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: 'rgba(22,22,22,0.55)'};
  const value: React.CSSProperties = {fontFamily: MONO, fontWeight: 700, fontSize: 36, color: COLORS.black};
  return (
    <div style={{width, borderRadius: 18, overflow: 'hidden', background: COLORS.cream}}>
      <div style={{display: 'flex', justifyContent: 'space-between', background: COLORS.black, padding: '14px 28px', fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: 3, color: COLORS.cream}}>
        <span>UÇUŞ KARTI</span>
        <span>{date}</span>
      </div>
      <div style={{padding: '24px 28px 26px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 58, color: COLORS.black}}>
          <span>{from}</span>
          <span style={{fontSize: 40, color: COLORS.blue}}>----→</span>
          <span>{to}</span>
        </div>
        <div style={{height: 2, background: 'rgba(22,22,22,0.14)', margin: '20px 0 16px'}} />
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <div style={label}>SEFER</div>
            <div style={value}>{code}</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={label}>TÜR</div>
            <div style={value}>{type}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Yatay zaman çizelgesi: noktalar eşit aralıklı, son nokta vurgulu */
export const Timeline: React.FC<{items: {date: string; text: string}[]; width: number; onDark?: boolean}> = ({items, width, onDark = true}) => {
  const qa = useQa();
  const ink = onDark ? COLORS.cream : COLORS.black;
  const dim = onDark ? 'rgba(242,238,230,0.7)' : 'rgba(22,22,22,0.6)';
  const col = width / items.length;
  return (
    <div style={{width, position: 'relative'}}>
      <div style={{position: 'absolute', left: 14, right: col - 14, top: 13, height: 3, background: dim, visibility: qa ? 'hidden' : 'visible'}} />
      <div style={{display: 'flex'}}>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <div key={it.date} style={{width: col, paddingRight: 18, boxSizing: 'border-box'}}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: last ? COLORS.red : ink,
                  boxShadow: last ? `0 0 0 6px rgba(225,0,15,0.25)` : undefined,
                  position: 'relative',
                  visibility: qa ? 'hidden' : 'visible',
                }}
              />
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: last ? COLORS.red : dim, marginTop: 18}}>{it.date}</div>
              <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 36, lineHeight: 1.12, color: ink, marginTop: 8}}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
