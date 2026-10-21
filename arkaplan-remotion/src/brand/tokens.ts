// arka plan marka renkleri (videodaki karelerden örneklendi)
export const C = {
  cream: '#F1EDE5',
  paper: '#FBFAF7',
  ink: '#161616',
  dark: '#161616',
  blue: '#264CCF',
  blueDeep: '#14206B',
  red: '#E1000F',
  gray: '#8F8A83',
  line: '#D8D2C6',
  white: '#FFFFFF',
};

export const W = 1080;
export const H = 1350;
// Instagram profil ızgarası 4:5 kareyi 3:4'e kırpar: 1350 * 3/4 = 1012.5 px genişlik, iki yandan ~34 px gider.
export const GRID_CROP = Math.ceil((W - (H * 3) / 4) / 2);
export const PAD = 76;

export const MIN_TITLE = 64;
export const MIN_BODY = 36;

export const FONT = {
  display: "'Bricolage Grotesque Variable', sans-serif",
  mono: "'JetBrains Mono', monospace",
};
