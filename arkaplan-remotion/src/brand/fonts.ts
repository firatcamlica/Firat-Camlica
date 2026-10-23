import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

const FACES: [family: string, file: string, weight: string, range: string, style?: string][] = [
  ['Bricolage Grotesque', 'bricolage-grotesque-latin-500', '500', LATIN],
  ['Bricolage Grotesque', 'bricolage-grotesque-latin-ext-500', '500', LATIN_EXT],
  ['Bricolage Grotesque', 'bricolage-grotesque-latin-800', '800', LATIN],
  ['Bricolage Grotesque', 'bricolage-grotesque-latin-ext-800', '800', LATIN_EXT],
  ['JetBrains Mono', 'jetbrains-mono-latin-500', '500', LATIN],
  ['JetBrains Mono', 'jetbrains-mono-latin-ext-500', '500', LATIN_EXT],
  ['JetBrains Mono', 'jetbrains-mono-latin-700', '700', LATIN],
  ['JetBrains Mono', 'jetbrains-mono-latin-ext-700', '700', LATIN_EXT],
  ['Playfair Display', 'playfair-display-latin-500-italic', '500', LATIN, 'italic'],
  ['Playfair Display', 'playfair-display-latin-ext-500-italic', '500', LATIN_EXT, 'italic'],
];

/** Bricolage Grotesque (500, 800), JetBrains Mono (500, 700), Playfair Display italik 500 (alıntılar); latin + latin-ext. */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender('brand-fonts'));
  useEffect(() => {
    Promise.all(
      FACES.map(([family, file, weight, unicodeRange, style]) =>
        new FontFace(family, `url(${staticFile(`fonts/${style ? file : `${file}-normal`}.woff2`)})`, {weight, unicodeRange, style: style ?? 'normal'}).load(),
      ),
    )
      .then((faces) => {
        faces.forEach((f) => document.fonts.add(f));
        return Promise.all([
          document.fonts.load('800 80px "Bricolage Grotesque"', 'İıŞşĞğÜüÖöÇç'),
          document.fonts.load('500 80px "Bricolage Grotesque"', 'İıŞşĞğÜüÖöÇç'),
          document.fonts.load('500 30px "JetBrains Mono"', 'İıŞşĞğÜüÖöÇç'),
          document.fonts.load('700 30px "JetBrains Mono"', 'İıŞşĞğÜüÖöÇç'),
          document.fonts.load('italic 500 80px "Playfair Display"', 'İıŞşĞğÜüÖöÇç'),
        ]);
      })
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);
};
