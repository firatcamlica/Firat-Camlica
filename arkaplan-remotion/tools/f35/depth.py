#!/usr/bin/env python3
"""Parallax için derinlik: Depth Anything V2 Small (Apache 2.0), yerel çalışır; Mac'te MPS varsa onu kullanır.

Her fotoğraf için ön plan katmanı (şeffaf PNG) üretir: public/depth/<id>_fg.png. Kompozisyon arka planı 3 sn'de
%6 iter, ön planı 1,8 kat hızlı iter (src/data/f35.ts → PARALLAX).
Kenarda yırtılma riski (ön plan maskesinin kadraj kenarına geniş temas etmesi ya da çok büyük olması) varsa
yoğunluk 0,5'e, aşırıysa 0,3'e düşürülür ve f35.assets.json'a yazılır.

Kurulum: pip install torch transformers pillow numpy
Kullanım: python3 tools/f35/depth.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
ASSETS = ROOT / 'src/data/f35.assets.json'
MODEL = 'depth-anything/Depth-Anything-V2-Small-hf'


def main():
    assets = json.loads(ASSETS.read_text())
    if not assets['photos']:
        print('Fotoğraf yok (önce tools/f35/fetch_photos.py); derinlik atlandı.')
        return
    try:
        import numpy as np
        import torch
        from PIL import Image, ImageFilter
        from transformers import pipeline
    except ImportError as e:
        print(f'Derinlik atlandı: {e}. Kurulum: pip install torch transformers pillow numpy (parallax düz itişe döner)')
        return
    device = 'mps' if torch.backends.mps.is_available() else ('cuda' if torch.cuda.is_available() else 'cpu')
    pipe = pipeline('depth-estimation', model=MODEL, device=device)
    print(f'{MODEL} · cihaz: {device}')
    (PUBLIC / 'depth').mkdir(exist_ok=True)
    for pid, p in assets['photos'].items():
        img = Image.open(PUBLIC / p['file']).convert('RGB')
        depth = pipe(img)['depth'].resize(img.size)
        d = np.asarray(depth, dtype=np.float32)
        d = (d - d.min()) / (d.max() - d.min() + 1e-6)          # büyük = yakın
        thr = float(np.percentile(d, 72))
        mask = (d > thr).astype(np.uint8) * 255
        m = Image.fromarray(mask).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(10))
        a = np.asarray(m, dtype=np.float32) / 255
        area = float((a > 0.5).mean())
        border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
        touch = float((border > 0.5).mean())
        # derinlik sınırındaki keskinlik: yüksekse ön plan kayınca kenarda boşluk/yırtılma görünür
        gy, gx = np.gradient(d)
        edge = float(np.mean(np.hypot(gx, gy)[(a > 0.2) & (a < 0.8)])) if np.any((a > 0.2) & (a < 0.8)) else 0.0
        if area < 0.03:
            p.pop('fg', None)
            p['intensity'] = 1.0
            print(f'{pid}: ön plan çok küçük (%{area * 100:.0f}), düz itiş')
            continue
        intensity = 1.0
        if touch > 0.3 or area > 0.55 or edge > 0.02:
            intensity = 0.5
        if touch > 0.5 or area > 0.7:
            intensity = 0.3
        rgba = img.copy()
        rgba.putalpha(m)
        out = PUBLIC / 'depth' / f'{pid}_fg.png'
        rgba.save(out)
        p['fg'] = f'depth/{out.name}'
        p['intensity'] = intensity
        p['depthStats'] = {'area': round(area, 3), 'borderTouch': round(touch, 3), 'edge': round(edge, 4)}
        print(f'{pid}: ön plan %{area * 100:.0f}, kenar teması %{touch * 100:.0f}, yoğunluk {intensity}')
    ASSETS.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    sys.exit(main())
