#!/usr/bin/env python3
"""3:4 profil ızgarası kırpma kontrolü. Önce: node tools/carousel.mjs <ad> --qa
QA kareleri yalnızca metni şeffaf zemine çizer; kırpılacak kenar şeritlerinde (+8 px pay) metin pikseli aranır."""
import sys
from pathlib import Path
from PIL import Image

name = sys.argv[1] if len(sys.argv) > 1 else 'fransa'
d = Path(__file__).resolve().parent.parent / 'out/carousel' / name / '_kontrol'
W, H = 1080, 1350
cut = int((W - H * 3 / 4) / 2 + 0.999) + 8
bad = 0
for f in sorted(d.glob('qa-*.png')):
    a = Image.open(f).convert('RGBA').getchannel('A')
    box = a.getbbox()
    left = a.crop((0, 0, cut, H)).getbbox()
    right = a.crop((W - cut, 0, W, H)).getbbox()
    ok = not left and not right
    bad += not ok
    span = f'metin x {box[0]}–{box[2]}' if box else 'metin yok'
    print(f"{f.stem[3:]}  {'tamam' if ok else 'TAŞIYOR'}  ({span}; güvenli aralık {cut}–{W - cut})")
sys.exit(1 if bad else 0)
