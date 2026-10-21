import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {continueRender, delayRender} from 'remotion';

let started = false;

// CSS @font-face dosyaları tembel yüklenir; kare çekilmeden önce hepsini zorla yükle.
export const ensureFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('fontlar');
  Promise.all([
    document.fonts.load("800 64px 'Bricolage Grotesque Variable'", 'ğüşıöçİ'),
    document.fonts.load("500 36px 'Bricolage Grotesque Variable'", 'ğüşıöçİ'),
    document.fonts.load("400 24px 'JetBrains Mono'", 'ğüşıöçİÉ'),
    document.fonts.load("500 24px 'JetBrains Mono'", 'ğüşıöçİÉ'),
    document.fonts.load("700 24px 'JetBrains Mono'", 'ğüşıöçİÉ'),
  ])
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle));
};
