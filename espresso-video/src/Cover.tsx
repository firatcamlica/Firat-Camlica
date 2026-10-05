import React from "react";
import { AbsoluteFill } from "remotion";
import { C, CONTENT_W, CONTENT_X, FONT } from "./theme";
import { useFonts } from "./Fonts";
import { Backdrop, Debug } from "./Espresso";
import { Bolt, Cup } from "./graphics";

export const Cover: React.FC<{ debug?: boolean }> = ({ debug }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: C.bg }}>
      <Backdrop frame={0} />
      <div style={{ position: "absolute", left: CONTENT_X, width: CONTENT_W, top: 190, textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "0.24em", color: C.caramel }}>KISA TARİH · 1884–1961</div>
        <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 1.0, color: C.caramel, marginTop: 34, letterSpacing: "-0.02em" }}>ESPRESSO</div>
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.1, color: C.cream, marginTop: 26 }}>
          LÜKS DEĞİL,
          <br />
          <span style={{ color: C.caramel }}>HIZ</span> İÇİN
          <br />
          İCAT EDİLDİ
        </div>
      </div>
      <div style={{ position: "absolute", left: CONTENT_X, width: CONTENT_W, top: 900, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: -20, top: 40, transform: "rotate(-12deg)" }}>
            <Bolt size={120} />
          </div>
          <Cup frame={20} fill={1} crema={1} steam={1} width={620} />
        </div>
      </div>
      {debug && <Debug />}
    </AbsoluteFill>
  );
};
