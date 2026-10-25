// arka plan marka tokenları. Mac'teki projeden (src/brand/tokens.ts) karelerle eşleştirilerek yeniden kuruldu.
export const COLORS = {
  cream: '#F2EEE6',
  black: '#161616',
  blue: '#2348D6',
  red: '#E1000F',
  gray: '#A5A29D',
  white: '#FFFFFF',
  navy: '#151D38',
};

export const ACCENT = COLORS.red;

export type ThemeName = 'light' | 'dark';
export type Theme = {name: ThemeName; bg: string; fg: string; fgDim: string};

export const THEMES: Record<ThemeName, Theme> = {
  light: {name: 'light', bg: COLORS.cream, fg: COLORS.black, fgDim: 'rgba(22,22,22,0.55)'},
  dark: {name: 'dark', bg: COLORS.black, fg: COLORS.cream, fgDim: 'rgba(242,238,230,0.7)'},
};

export const BRAND = {
  handle: '@arkaplan',
  watermark: {size: 58, opacity: 0.9},
};

/** Başlık en az 64 px, gövde en az 36 px (carousel kuralı) */
export const MIN = {title: 64, body: 36};
