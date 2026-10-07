import type React from "react";
import { spring } from "remotion";

export const P = {
  bg: "#050507",
  white: "#FAFAFA",
  silver: "#A1A1AA",
  amber: "#F59E0B",
  amberHi: "#FFB020",
  rust: "#E05D36",
  neon: "#FDE047",
  green: "#34D399",
  water: "#60A5FA",
  dim: "#52525B",
} as const;

export const INTER = "Inter, sans-serif";
export const GROTESK = "'Space Grotesk', Inter, sans-serif";

// TikTok güvenli alanı: üst 150, sağ 160, alt 320 -> içerik x 70..910 (840 px), merkez x=490
export const ZX = 70;
export const ZW = 840;
export const CXX = 490;
export const ZONE_TOP = 480;
export const ZONE_H = 820; // 480..1300
export const SUB_TOP = 1330; // altyazı 1330..1560

export const SPR = { mass: 0.5, damping: 12, stiffness: 120 };

/** Fizik tabanlı yay (mass .5, damping 12, stiffness 120). delay öncesi 0. */
export const sp = (frame: number, delay = 0, config = SPR) =>
  frame < delay ? 0 : spring({ frame: frame - delay, fps: 30, config });

export const amberText = {
  background: `linear-gradient(92deg, ${P.amberHi}, ${P.rust})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

export const glass = (radius = 28): React.CSSProperties => ({
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderTop: "1px solid rgba(255,255,255,0.38)",
  borderRadius: radius,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
});

/** Deterministik rastgele (mulberry32). */
export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
