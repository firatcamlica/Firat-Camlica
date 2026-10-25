#!/usr/bin/env python3
"""out/carousel/<ad>/onizleme.png: kareler tek satırda yan yana (Mac'teki scripts/contact_sheet.py ile aynı düzen).
out/carousel/<ad>/izgara_onizleme.png: profil ızgarasındaki 3:4 kırpılmış hâl, 3 sütun."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

name = sys.argv[1] if len(sys.argv) > 1 else 'fransa'
d = Path(__file__).resolve().parent.parent / 'out/carousel' / name
files = sorted(d.glob('[0-9][0-9].png'))

W, H, GAP, PAD = 432, 540, 24, 32  # her kare 1080x1350'nin %40'ı
sheet = Image.new('RGB', (PAD * 2 + len(files) * W + (len(files) - 1) * GAP, PAD * 2 + H), (230, 226, 218))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
    x = PAD + i * (W + GAP)
    sheet.paste(im, (x, PAD))
    ImageDraw.Draw(sheet).rectangle([x - 1, PAD - 1, x + W, PAD + H], outline=(22, 22, 22))
sheet.save(d / 'onizleme.png', optimize=True)

cw = round(1350 * 3 / 4)
cut = (1080 - cw) // 2
tw, th, g = 300, 400, 4
cols = 3
rows = (len(files) + cols - 1) // cols
grid = Image.new('RGB', (cols * tw + (cols - 1) * g, rows * th + (rows - 1) * g), (255, 255, 255))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').crop((cut, 0, cut + cw, 1350)).resize((tw, th), Image.LANCZOS)
    grid.paste(im, ((i % cols) * (tw + g), (i // cols) * (th + g)))
grid.save(d / 'izgara_onizleme.png', optimize=True)
print(d / 'onizleme.png', d / 'izgara_onizleme.png')
