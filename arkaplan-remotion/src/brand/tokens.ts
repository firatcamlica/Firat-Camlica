// arka plan marka tokenları. Değerler arkaplan/site/assets/style.css ile aynıdır.
// Mac'teki ana projede src/brand/tokens.ts zaten varsa onu kullanın; bu dosya bulut kopyasıdır.
export const COLORS = {
  cream: '#F2EEE6',
  black: '#161616',
  blue: '#2348D6',
  white: '#FFFFFF',
  gray: '#A5A29D',
  card: '#EAE5DB',
  cardDark: '#1F1E1D',
  dimDark: 'rgba(242, 238, 230, 0.62)',
  dimLight: 'rgba(22, 22, 22, 0.62)',
  lineDark: 'rgba(242, 238, 230, 0.12)',
  lineLight: 'rgba(22, 22, 22, 0.12)',
};

export const FONTS = {
  sans: '"Bricolage Grotesque", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  /** Edebi alıntılar (epigraf): italik */
  serif: '"Playfair Display", Georgia, serif',
};

/** Durum göstergeleri için ek renkler (yalnızca damga, ilerleme ve durum etiketleri) */
export const STATUS = {
  wait: '#F2A900',
  block: '#E1000F',
};

export type ThemeName = 'light' | 'dark';
export type Theme = {name: ThemeName; bg: string; fg: string; fgDim: string};

export const THEMES: Record<ThemeName, Theme> = {
  light: {name: 'light', bg: COLORS.cream, fg: COLORS.black, fgDim: COLORS.dimLight},
  dark: {name: 'dark', bg: COLORS.black, fg: COLORS.cream, fgDim: COLORS.dimDark},
};

/** Başlık en az 64 px, gövde en az 36 px */
export const MIN = {title: 64, body: 36};

export const SLOGAN = 'Bir dakikada bağlam.';
export const CHANNEL = 'arka plan';
export const SITE = 'arkaplan.pages.dev';

/** Reels dikey video yerleşimi (px). Güvenli alan: üst 220, alt 380, sağ 140. */
export const REELS = {
  width: 1080,
  height: 1920,
  safe: {top: 220, bottom: 380, left: 72, right: 140},
  /** Altyazı bloğunun alt kenarı (alt güvenli alanın hemen üstü) */
  captionBottom: 1920 - 380,
};
export const CONTENT = {
  left: REELS.safe.left,
  top: REELS.safe.top,
  width: REELS.width - REELS.safe.left - REELS.safe.right,
  right: REELS.width - REELS.safe.right,
};

/** Dikey video katmanları (y, px). Altyazı en fazla iki satır: 1372–1540. */
export const LAYOUT = {
  captionBottom: 1540,
  captionTop: 1372,
  /** KAYNAK satırı (altyazının hemen üstü) — CSS bottom değeri */
  sourceBottom: 1920 - 1372 + 14,
  /** "Temsili görüntü" / "ÇİZİM" etiketi — CSS bottom değeri */
  labelBottom: 1920 - 1372 + 54,
  /** Sahne içeriğinin alt sınırı */
  contentBottom: 1290,
};
