#!/usr/bin/env python3
"""turkiye-f35 fotoğrafları: Wikimedia Commons'tan, yalnızca kamu malı / CC0 / CC BY (SA yok).

- Adaylar src/data/f35.ts → PHOTO_QUERIES (node tools/f35/data.mjs ile public/gen/f35_script.json'a aktarılır).
  `pin` alanı verilirse ("File:...jpg") arama yapılmaz, o dosya kullanılır.
- Kişilik hakkı kısıtı (personality rights) olanlar ve büyük yüz içerenler (OpenCV, yüz genişliği > %8) elenir:
  gerçek kişi portresi kullanılmaz.
- Ekim 2026'da yüklenmiş "depo/storage" fotoğrafları, lisans alanı ve lisans bağlantısı açık değilse elenir.
- Krediler public/photos/credits.json'a (başka videoların kayıtları korunarak) id bazında yazılır;
  src/data/f35.assets.json → photos güncellenir.

Kullanım: node tools/f35/data.mjs && python3 tools/f35/fetch_photos.py
Not: DVIDS araması API anahtarı gerektirir ve bu sürümde yok; DVIDS'teki ABD Hava Kuvvetleri fotoğraflarının
çoğu Commons'ta da kamu malı olarak bulunur.
"""
import html
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
SCRIPT = PUBLIC / 'gen/f35_script.json'
CREDITS = PUBLIC / 'photos/credits.json'
ASSETS = ROOT / 'src/data/f35.assets.json'
API = 'https://commons.wikimedia.org/w/api.php'
UA = 'arkaplan-remotion/1.0 (https://github.com/firatcamlica/Firat-Camlica; video credits)'
MIN_WIDTH = 1600
FACE_MAX = 0.08

LICENSE_URLS = {
    'cc0': 'https://creativecommons.org/publicdomain/zero/1.0/',
    'public domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
}


def get(url, params=None):
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def strip(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()


def license_ok(meta):
    short = strip(meta.get('LicenseShortName', {}).get('value', ''))
    low = short.lower()
    if 'sa' in re.split(r'[\s\-]', low) or 'share' in low or 'nc' in re.split(r'[\s\-]', low) or 'nd' in re.split(r'[\s\-]', low):
        return None
    if low.startswith('public domain') or low.startswith('pd') or low == 'cc0' or low.startswith('cc0'):
        return short
    if re.match(r'^cc by \d', low):
        return short
    return None


def license_url(short, meta):
    url = strip(meta.get('LicenseUrl', {}).get('value', ''))
    if url:
        return url
    low = short.lower()
    m = re.match(r'cc by (\d\.\d)', low)
    if m:
        return f'https://creativecommons.org/licenses/by/{m.group(1)}/'
    return LICENSE_URLS['cc0' if low.startswith('cc0') else 'public domain']


def faces(data):
    try:
        import cv2
        import numpy as np
    except ImportError:
        return None
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    found = casc.detectMultiScale(img, scaleFactor=1.1, minNeighbors=6, minSize=(40, 40))
    return [int(w) / img.shape[1] for (_, _, w, _) in found]


def candidates(query, pin=None):
    params = {'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime|timestamp', 'iiurlwidth': 2400}
    if pin:
        params['titles'] = pin
    else:
        params.update({'generator': 'search', 'gsrsearch': f'{query} filetype:bitmap', 'gsrnamespace': 6, 'gsrlimit': 25})
    data = json.loads(get(API, params))
    pages = sorted(data.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
    return pages


def pick(pid, spec, log):
    queries = [None] if spec.get('pin') else spec['queries']
    for q in queries:
        for page in candidates(q, spec.get('pin')):
            info = (page.get('imageinfo') or [{}])[0]
            meta = info.get('extmetadata', {})
            title = page.get('title', '')
            why = None
            short = license_ok(meta)
            restr = strip(meta.get('Restrictions', {}).get('value', '')).lower()
            if info.get('mime') not in ('image/jpeg', 'image/png'):
                why = 'biçim'
            elif not short:
                why = f"lisans ({strip(meta.get('LicenseShortName', {}).get('value', '')) or '?'})"
            elif 'personality' in restr:
                why = 'kişilik hakkı kısıtı'
            elif info.get('width', 0) < MIN_WIDTH:
                why = f"genişlik {info.get('width')}"
            elif info.get('timestamp', '').startswith('2026-10') and re.search(r'storage|depo|stored|fort worth', title + strip(meta.get('ImageDescription', {}).get('value', '')), re.I) and not strip(meta.get('LicenseUrl', {}).get('value', '')) and not short.lower().startswith('public domain'):
                why = 'Ekim 2026 depo fotoğrafı, lisans bağlantısı yok'
            if why:
                log.append(f'  - {title}: elendi ({why})')
                continue
            url = info.get('thumburl') or info['url']
            data = get(url)
            fs = faces(data)
            if fs and max(fs) > FACE_MAX:
                log.append(f'  - {title}: elendi (yüz %{round(max(fs) * 100)})')
                continue
            author = strip(meta.get('Artist', {}).get('value', '')) or 'bilinmiyor'
            return {
                'id': pid,
                'title': title,
                'author': author[:120],
                'license': short,
                'licenseUrl': license_url(short, meta),
                'source': info.get('descriptionurl', ''),
                'place': '',
                'date': strip(meta.get('DateTimeOriginal', {}).get('value', ''))[:10],
                'downloaded': date.today().isoformat(),
                'faceCheck': 'yok' if fs == [] else ('OpenCV yok' if fs is None else f'küçük yüz(ler) %{round(max(fs) * 100)}'),
            }, data
    return None, None


def main():
    if not SCRIPT.exists():
        sys.exit('önce: node tools/f35/data.mjs')
    d = json.loads(SCRIPT.read_text())
    needed = sorted(set(d['photoSlots'].values()))
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() else {'photos': []}
    assets = json.loads(ASSETS.read_text())
    (PUBLIC / 'photos').mkdir(parents=True, exist_ok=True)
    missing = []
    for pid in needed:
        spec = d['photoQueries'].get(pid)
        if not spec:
            missing.append(f'{pid}: PHOTO_QUERIES kaydı yok')
            continue
        out = PUBLIC / 'photos' / f'{pid}.jpg'
        log = []
        try:
            rec, data = pick(pid, spec, log)
        except Exception as e:  # ağ yok vb.
            rec, data = None, None
            log.append(f'  ! {e}')
        print(f'{pid}:', rec['title'] if rec else 'BULUNAMADI')
        print('\n'.join(log[:12]))
        if not rec:
            if out.exists() and any(c.get('id') == pid for c in credits['photos']):
                print('  mevcut dosya ve kredi kullanılıyor')
                rec = next(c for c in credits['photos'] if c['id'] == pid)
            else:
                missing.append(pid)
                assets['photos'].pop(pid, None)
                continue
        else:
            import subprocess
            tmp = out.with_suffix('.src')
            tmp.write_bytes(data)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-vf', "scale='min(2400,iw)':-2", '-q:v', '2', str(out)], check=True)
            tmp.unlink()
            credits['photos'] = [c for c in credits['photos'] if c.get('id') != pid] + [rec]
        entry = assets['photos'].get(pid, {})
        entry.update({'file': f'photos/{pid}.jpg', 'credit': f"Foto: {rec['author']} / {rec['license']}"})
        assets['photos'][pid] = entry
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + '\n')
    ASSETS.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + '\n')
    if missing:
        print('EKSİK (sahne çizime döner):', ', '.join(missing))


if __name__ == '__main__':
    main()
