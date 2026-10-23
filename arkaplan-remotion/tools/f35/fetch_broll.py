#!/usr/bin/env python3
"""turkiye-f35 stok videoları (Pexels, Pixabay) → public/broll/ + public/broll/credits.json + f35.assets.json

- Sorgular: src/data/f35.ts → brollQueries; her sorgu için en fazla 3 aday.
- .env: PEXELS_API_KEY, PIXABAY_API_KEY. Anahtar yoksa o kaynak atlanır ve raporda belirtilir.
- Kurallar: tanınabilir yüz, marka logosu, bayrak, askerî tören yok. Yüzler OpenCV ile her 0,25 sn'de
  bir karede aranır (önden + profil); yüz bulunan klip elenir, sıradaki aday denenir. Pixabay etiketlerinde
  yasak kelime (logo, flag, ceremony, soldier…) olan klip elenir. Logo/bayrak için ayrıca gözle kontrol gerekir.
- Klip en fazla 2,5 sn, 1080x1920 kırpılır, ses kaldırılır. Duoton ve %35 opaklık kompozisyonda uygulanır.

Kullanım: node tools/f35/data.mjs && python3 tools/f35/fetch_broll.py
"""
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
SCRIPT = PUBLIC / 'gen/f35_script.json'
OUT = PUBLIC / 'broll'
CREDITS = OUT / 'credits.json'
ASSETS = ROOT / 'src/data/f35.assets.json'
UA = 'arkaplan-remotion/1.0'


def env():
    vals = dict(os.environ)
    f = ROOT / '.env'
    if f.exists():
        for line in f.read_text().splitlines():
            m = re.match(r'\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$', line)
            if m and m.group(1) not in vals:
                vals[m.group(1)] = m.group(2)
    return vals


def get(url, headers=None):
    req = urllib.request.Request(url, headers={'User-Agent': UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def pexels(q, key, n):
    data = json.loads(get('https://api.pexels.com/videos/search?' + urllib.parse.urlencode({'query': q, 'per_page': 15}), {'Authorization': key}))
    out = []
    for v in data.get('videos', []):
        files = sorted([f for f in v['video_files'] if f.get('width') and f['file_type'] == 'video/mp4' and min(f['width'], f['height']) >= 720],
                       key=lambda f: f['width'] * f['height'])
        if not files:
            continue
        out.append({'provider': 'Pexels', 'pageUrl': v['url'], 'author': v['user']['name'], 'license': 'Pexels License',
                    'licenseUrl': 'https://www.pexels.com/license/', 'url': files[0]['link'], 'duration': v['duration'], 'tags': ''})
        if len(out) >= n:
            break
    return out


def pixabay(q, key, n, reject):
    data = json.loads(get('https://pixabay.com/api/videos/?' + urllib.parse.urlencode({'key': key, 'q': q, 'per_page': 20, 'safesearch': 'true'})))
    out = []
    for h in data.get('hits', []):
        tags = h.get('tags', '').lower()
        if any(re.search(rf'\b{t}', tags) for t in reject):
            continue
        v = h['videos'].get('large') or h['videos'].get('medium')
        if not v or not v.get('url'):
            continue
        out.append({'provider': 'Pixabay', 'pageUrl': h['pageURL'], 'author': h.get('user', ''), 'license': 'Pixabay Content License',
                    'licenseUrl': 'https://pixabay.com/service/license-summary/', 'url': v['url'], 'duration': h['duration'], 'tags': tags})
        if len(out) >= n:
            break
    return out


def face_frames(path, step=0.25):
    try:
        import cv2
        cv2.CascadeClassifier
    except (ImportError, AttributeError):
        return None
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    front = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    prof = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
    hits, i, every = [], 0, max(1, int(round(fps * step)))
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if i % every == 0:
            g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            n = len(front.detectMultiScale(g, 1.1, 6, minSize=(36, 36))) + len(prof.detectMultiScale(g, 1.1, 6, minSize=(36, 36)))
            if n:
                hits.append(round(i / fps, 2))
        i += 1
    return hits


def main():
    if not SCRIPT.exists():
        sys.exit('önce: node tools/f35/data.mjs')
    d = json.loads(SCRIPT.read_text())
    rules = d['brollRules']
    keys = env()
    pk, xk = keys.get('PEXELS_API_KEY'), keys.get('PIXABAY_API_KEY')
    report = []
    if not pk:
        report.append('PEXELS_API_KEY yok: Pexels atlandı')
    if not xk:
        report.append('PIXABAY_API_KEY yok: Pixabay atlandı')
    OUT.mkdir(parents=True, exist_ok=True)
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() else {'clips': []}
    assets = json.loads(ASSETS.read_text())
    for scene, queries in d['brollQueries'].items():
        accepted = []
        for q in queries:
            px, pb = [], []
            try:
                if pk:
                    px = pexels(q, pk, rules['perQuery'])
                if xk:
                    pb = pixabay(q, xk, rules['perQuery'], rules['rejectTags'])
            except Exception as e:
                report.append(f'{scene} "{q}": arama hatası {e}')
            # iki kaynağı sırayla karıştır; sorgu başına en fazla 3 aday
            cands = [c for pair in zip(px + [None] * 3, pb + [None] * 3) for c in pair if c][: rules['perQuery']]
            for k, c in enumerate(cands):
                name = f'{scene}_{re.sub(r"[^a-z]+", "-", q.lower()).strip("-")}_{k}'
                raw = OUT / f'{name}.src.mp4'
                out = OUT / f'{name}.mp4'
                try:
                    raw.write_bytes(get(c['url']))
                except Exception as e:
                    report.append(f'{name}: indirilemedi ({e})')
                    continue
                start = 1.0 if c['duration'] > 4 else 0.0
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-i', str(raw), '-t', str(rules['maxSeconds']), '-an',
                                '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30',
                                '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', str(out)], check=True)
                raw.unlink()
                hits = face_frames(out)
                rec = {k2: c[k2] for k2 in ('provider', 'pageUrl', 'author', 'license', 'licenseUrl')}
                rec.update({'scene': scene, 'query': q, 'file': f'broll/{out.name}', 'downloaded': date.today().isoformat(),
                            'seconds': rules['maxSeconds'], 'faceCheck': 'OpenCV yok' if hits is None else ('temiz' if not hits else f'YÜZ {hits}')})
                credits['clips'] = [x for x in credits['clips'] if x.get('file') != rec['file']] + [rec]
                if hits:
                    report.append(f'{name}: yüz bulundu ({hits[:4]} sn) → elendi')
                    out.unlink()
                    rec['rejected'] = True
                    continue
                accepted.append({'file': rec['file'], 'seconds': rules['maxSeconds']})
        if accepted:
            assets['broll'][scene] = accepted
        else:
            assets['broll'].pop(scene, None)
            report.append(f'{scene}: kabul edilen klip yok (sahne fotoğraf/çizimle kalır)')
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + '\n')
    ASSETS.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + '\n')
    (PUBLIC / 'gen/f35_broll_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print('\n'.join(report) or 'B-roll tamam')


if __name__ == '__main__':
    main()
