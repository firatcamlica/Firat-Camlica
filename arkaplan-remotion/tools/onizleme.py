#!/usr/bin/env python3
"""Kontak sayfası: out/carousel/<ad>/onizleme.png (13 kare, 3:4 ızgara kırpma çizgileriyle)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

name = sys.argv[1] if len(sys.argv) > 1 else 'fransa'
d = Path(__file__).resolve().parent.parent / 'out/carousel' / name
files = sorted(d.glob('[0-9][0-9].png'))
cols, tw = 5, 360
th = tw * 1350 // 1080
gap, head = 16, 34
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw + (cols + 1) * gap, rows * (th + head) + (rows + 1) * gap), '#E4DFD3')
draw = ImageDraw.Draw(sheet)
crop = round((1080 - 1350 * 3 / 4) / 2 * tw / 1080)
for i, f in enumerate(files):
    x = gap + (i % cols) * (tw + gap)
    y = gap + (i // cols) * (th + head + gap)
    draw.text((x, y + 8), f.stem, fill='#161616')
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    sheet.paste(im, (x, y + head))
    for cx in (x + crop, x + tw - crop):  # 3:4 profil ızgarası kırpma sınırı
        for yy in range(y + head, y + head + th, 10):
            draw.line([(cx, yy), (cx, yy + 5)], fill='#E1000F', width=1)
sheet.save(d / 'onizleme.png')
print(d / 'onizleme.png')
