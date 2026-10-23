#!/usr/bin/env python3
"""VERIFY için ölçümler (JSON, stdout): final MP4 ses ölçümü, ASR ile altyazı senkronu, B-roll yüz taraması.
Kullanım: python3 tools/f35/verify_media.py out/turkiye-f35.mp4
"""
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import prep_audio as pa  # noqa: E402
from fetch_broll import face_frames  # noqa: E402

ROOT = HERE.parents[1]
video = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'out/turkiye-f35.mp4')
res = {'loudness': None, 'asr': None, 'faces': [], 'probe': None}

if video.exists():
    log = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', str(video), '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    s = log[log.rfind('Summary'):]
    g = lambda k: (lambda m: float(m.group(1)) if m else None)(re.search(k + r':\s+(-?[\d.]+)', s))
    res['loudness'] = {'I': g('I'), 'LRA': g('LRA'), 'TP': g('Peak')}
    res['probe'] = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                                              'format=duration,bit_rate:stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,sample_rate,bit_rate,channels,color_range',
                                              '-of', 'json', str(video)], capture_output=True, text=True).stdout)

man = json.loads((ROOT / 'src/data/f35.audio.json').read_text())
script = json.loads((ROOT / 'public/gen/f35_script.json').read_text())
if man.get('voice') and video.exists():
    wav = ROOT / 'public/gen/f35_verify16k.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-vn', '-ac', '1', '-ar', '16000', str(wav)], check=True)
    cache = ROOT / 'public/gen/f35_asr_final.json'
    if cache.exists():
        c = json.loads(cache.read_text())
        asr, how = pa.merge_suffixes([tuple(w) for w in c['words']]), f"{c.get('model', 'whisper')} (final MP4, GitHub Actions)"
    else:
        asr, how = pa.whisper_words(wav)
    if asr:
        words = pa.flat_spoken(script['scenes'])
        times, ratio = pa.align(words, asr)
        first = {}
        for w, t in zip(words, times):
            first.setdefault((w['scene'], w['tok']), t[0])
        # manifestteki altyazı kelimeleri sahne/token sırasıyla aynı
        expect = [(si, ti) for si, s in enumerate(script['scenes']) for ti, _ in enumerate(s['tokens'])]
        # tüm ekran kelimeleri (altyazıda gizlenen alıntı dahil), senaryo sırasıyla
        cap_words = [[w[1], w[2], w[3]] for w in man['words']]
        diffs = []
        for key, cw in zip(expect, cap_words):
            if key in first:
                diffs.append({'word': cw[0], 'caption': cw[1], 'asr': round(first[key], 3), 'diff': round(cw[1] - first[key], 3)})
        ad = sorted(abs(d['diff']) for d in diffs)
        res['asr'] = {'method': how, 'match': round(ratio, 3), 'n': len(ad), 'meanAbs': round(sum(ad) / len(ad), 3) if ad else None,
                      'p95': ad[int(0.95 * (len(ad) - 1))] if ad else None, 'max': ad[-1] if ad else None,
                      'worst': sorted(diffs, key=lambda d: -abs(d['diff']))[:5]}
    else:
        res['asr'] = {'method': how, 'skipped': True}

assets = json.loads((ROOT / 'src/data/f35.assets.json').read_text())
for scene, clips in assets.get('broll', {}).items():
    for c in clips:
        f = ROOT / 'public' / c['file']
        res['faces'].append({'scene': scene, 'file': c['file'], 'faces': face_frames(f) if f.exists() else 'dosya yok'})
print(json.dumps(res, ensure_ascii=False))
