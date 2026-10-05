export const C = {
  bg: "#1a0f0a",
  cream: "#f3e5d0",
  caramel: "#e0903e",
  panel: "#2a1a12",
  track: "#3a2519",
  coffee: "#4a2614",
  mute: "rgba(243,229,208,0.78)",
} as const;

export const W = 1080;
export const H = 1920;
// TikTok arayüzünün kapattığı bölgeler: üst 150, sağ 160, alt 320 px
export const SAFE = { top: 150, right: 160, bottom: 320, left: 60 };
export const CONTENT_X = SAFE.left;
export const CONTENT_W = W - SAFE.right - SAFE.left; // 860
export const CX = CONTENT_X + CONTENT_W / 2; // 490
export const FONT = "Montserrat, sans-serif";

// Dikey yerleşim (px)
export const Y = {
  progress: 160,
  kicker: 196,
  headline: 250,
  zone: 520, // grafik alanı başlangıcı
  zoneH: 710, // 520..1230
  subs: 1285, // altyazı alanı 1285..1535
  subsH: 250,
};

export const trUpper = (s: string) => s.toLocaleUpperCase("tr-TR");
