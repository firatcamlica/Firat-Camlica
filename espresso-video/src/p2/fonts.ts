import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { LATIN, LATIN_EXT } from "../Fonts";

/** Inter + Space Grotesk (değişken), latin + latin-ext: Türkçe karakterler tam. */
export const useFontsP2 = () => {
  const [handle] = useState(() => delayRender("fonts-p2"));
  useEffect(() => {
    const faces = (
      [
        ["Inter", "inter"],
        ["Space Grotesk", "space-grotesk"],
      ] as const
    ).flatMap(([family, file]) => [
      new FontFace(family, `url(${staticFile(`fonts/${file}-latin-wght-normal.woff2`)})`, { weight: "300 900", unicodeRange: LATIN }),
      new FontFace(family, `url(${staticFile(`fonts/${file}-latin-ext-wght-normal.woff2`)})`, { weight: "300 900", unicodeRange: LATIN_EXT }),
    ]);
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        return Promise.all(
          ["500 40px Inter", "800 40px Inter", "700 40px 'Space Grotesk'"].map((f) => document.fonts.load(f, "İıŞşĞğÜüÖöÇç%0123")),
        );
      })
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);
};
