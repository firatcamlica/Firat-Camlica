#!/usr/bin/env python3
"""twitter-savasi için varlıkları hazırlar ve src/data/twitter-savasi.audio.json yazar.

- public/tweets/ altındaki ekran görüntülerini listeler (dosya yoksa kart tipografik kalır).
- public/voiceover_tw.mp3 varsa: atempo (perde korunur; varsayılan 1,08, TEMPO ortam değişkeni), 0,45 sn'den
  uzun sessizlikleri 0,25 sn'ye indirir, -16 LUFS'a normalize eder, public/gen/voice_tw.wav olarak yazar.
  Sahne ve kart zamanları tools/voice_cues_tw.json'dan (orijinal ses zamanı) yeni zamana çevrilir;
  o dosya yoksa paragraf boşluklarından (>= PARA_GAP sn) çıkarılır.
- public/music_tw.mp3 varsa: -16 LUFS'a normalize eder, BPM ve ilk vuruşu bulur, video süresinden kısaysa
  vuruş sınırında döngüye sokar (public/gen/music_tw_bed.wav).
- public/sfx/{whoosh,stamp,scratch}.mp3 varsa listeler.

Kullanım: python3 tools/prep_tw.py
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
MANIFEST = ROOT / 'src/data/twitter-savasi.audio.json'

TEMPO = float(__import__('os').environ.get('TEMPO', '1.08'))
SIL_DB = -35
SIL_MIN = 0.45
SIL_KEEP = 0.25
PARA_GAP = 0.8
SCENE_COUNT = 8
DEFAULT_STARTS = [0, 3.5, 12, 21, 31, 42, 50, 60]
DEFAULT_TOTAL = 65.0
ENDCARD = 2.0
LEAD = 0.1  # sahne, paragrafın ilk sesinden bu kadar önce başlar
NORM = 'loudnorm=I=-16:TP=-2:LRA=11'
CUES_FILE = ROOT / 'tools/voice_cues_tw.json'


def ff(*args, capture=False):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-y', *args], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(r.stderr[-2000:])
    return r.stderr


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)], capture_output=True, text=True).stdout
    return float(out.strip())


def silences(path, total):
    log = ff('-i', str(path), '-af', f'silencedetect=noise={SIL_DB}dB:d={SIL_MIN}', '-f', 'null', '-')
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    if len(ends) < len(starts):
        ends.append(total)
    return list(zip(starts, ends))


def prep_voice(src):
    gen = PUBLIC / 'gen'
    gen.mkdir(exist_ok=True)
    fast = gen / 'voice_tw_fast.wav'
    ff('-i', str(src), '-af', f'atempo={TEMPO}', '-ar', '48000', '-ac', '1', str(fast))
    total = duration(fast)
    sil = silences(fast, total)

    # Her uzun sessizliğin ortasından (len - 0,25) sn kes: başta ve sonda 0,125'er sn kalır.
    half = SIL_KEEP / 2
    cuts = []
    for s, e in sil:
        a = 0.0 if s <= 0.01 else s + half  # baştaki sessizlik tamamen gider
        b = e - half if e < total - 0.01 else e
        if b - a > 0.02:
            cuts.append((a, b))

    def mapt(t):
        shift = 0.0
        for a, b in cuts:
            if t >= b:
                shift += b - a
            elif t > a:
                return a - shift
        return t - shift

    out = gen / 'voice_tw.wav'
    if cuts:
        expr = '+'.join(f'between(t,{a:.3f},{b:.3f})' for a, b in cuts)
        ff('-i', str(fast), '-af', f"aselect='not({expr})',asetpts=N/SR/TB,{NORM}", '-ar', '48000', str(out))
    else:
        ff('-i', str(fast), '-af', NORM, '-ar', '48000', str(out))
    dur = duration(out)

    # Konuşma aralıkları (kısaltılmış zaman çizgisinde).
    speech, t = [], 0.0
    for s, e in sil:
        if s > t + 0.05:
            speech.append((mapt(t), mapt(s)))
        t = e
    if total > t + 0.05:
        speech.append((mapt(t), mapt(total)))

    paras = [mapt(e) for s, e in sil if e - s >= PARA_GAP and s > 0.01 and e < total - 0.01]
    # Orijinal zaman → yeni zaman: önce hızlandırma, sonra kesilen sessizlikler.
    orig_to_new = lambda t: round(mapt(t / TEMPO), 3)
    return 'gen/voice_tw.wav', dur, [(round(a, 3), round(b, 3)) for a, b in speech], paras, orig_to_new, len(cuts)


def scene_starts(voice_dur, paras):
    total = round(voice_dur + ENDCARD + 0.4, 2)
    if len(paras) == SCENE_COUNT - 1:
        starts = [0.0] + [max(0.0, p - LEAD) for p in paras]
        how = 'paragraf başlangıçları'
    else:
        k = (total - ENDCARD) / (DEFAULT_TOTAL - ENDCARD)
        starts = [s * k for s in DEFAULT_STARTS]
        how = f'oranla ölçekleme ({len(paras) + 1} paragraf bulundu, {SCENE_COUNT} bekleniyordu)'
    # S7 en az 3,5 sn (soru + 2 sn kapanış kartı).
    if total - starts[-1] < 3.5:
        total = round(starts[-1] + 3.5, 2)
    return [round(s, 3) for s in starts], total, how


def music_bed(src, total, bpm, offset):
    """Normalize eder; parça videodan kısaysa son tam vuruşta kesip ilk vuruştan devam ettirir (30 ms geçiş)."""
    gen = PUBLIC / 'gen'
    gen.mkdir(exist_ok=True)
    norm = gen / 'music_tw_norm.wav'
    ff('-i', str(src), '-af', NORM, '-ar', '48000', '-ac', '2', str(norm))
    dur = duration(norm)
    out = gen / 'music_tw_bed.wav'
    if dur >= total + 0.5 or not bpm:
        ff('-i', str(norm), '-af', 'apad', '-t', f'{total + 0.5:.3f}', str(out))
        return 'gen/music_tw_bed.wav', 0
    beat = 60 / bpm
    end = offset + int((dur - 1.0 - offset) / beat) * beat  # son tam vuruş (kuyruktaki sönümden önce)
    loop_len = end - offset
    n = int((total + 0.5 - end) / loop_len) + 1
    parts = ['[0]atrim=0:{:.4f},asetpts=PTS-STARTPTS[a0]'.format(end)]
    for i in range(1, n + 1):
        parts.append(f'[0]atrim={offset:.4f}:{end:.4f},asetpts=PTS-STARTPTS[a{i}]')
    chain = '[a0]'
    for i in range(1, n + 1):
        nxt = f'[x{i}]'
        parts.append(f'{chain}[a{i}]acrossfade=d=0.03:c1=tri:c2=tri{nxt}')
        chain = nxt
    parts.append(f'{chain}atrim=0:{total + 0.5:.3f}[out]')
    ff('-i', str(norm), '-filter_complex', ';'.join(parts), '-map', '[out]', str(out))
    return 'gen/music_tw_bed.wav', n


def bpm_of(path):
    sr, hop, n = 22050, 512, 2048
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    if len(x) < sr * 4:
        return None, 0.0
    frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
    mag = np.log1p(np.abs(np.fft.rfft(frames, axis=1)))
    flux = np.maximum(0, np.diff(mag, axis=0)).sum(axis=1)
    flux = flux - np.convolve(flux, np.ones(16) / 16, mode='same')
    flux = np.maximum(flux, 0)
    fps = sr / hop
    ac = np.correlate(flux, flux, mode='full')[len(flux) - 1 :]
    lags = np.arange(len(ac))
    lo, hi = int(fps * 60 / 180), int(fps * 60 / 60)
    bpms = 60 * fps / lags[lo : hi + 1]
    weight = np.exp(-0.5 * (np.log2(bpms / 120) / 0.9) ** 2)  # 120 civarına hafif öncelik
    lag = lo + int(np.argmax(ac[lo : hi + 1] * weight))
    # Parabolik tepe enterpolasyonu: kare çözünürlüğünden (≈ 1 BPM) daha hassas periyot.
    y0, y1, y2 = ac[lag - 1], ac[lag], ac[lag + 1]
    den = y0 - 2 * y1 + y2
    period = lag + (0.5 * (y0 - y2) / den if den else 0.0)
    # İnce ayar: ±%2 periyot ve tüm fazlar içinde, vuruş ızgarasındaki akı toplamını en büyük yapan çift.
    # Uzun parçada küçük BPM hatası birikip 3 karelik hizalama sınırını aşmasın diye gerekli.
    best = (-1.0, period, 0.0)
    for p in np.linspace(period * 0.98, period * 1.02, 161):
        grid = np.arange(0, len(flux) - p - 1, p)
        for o in np.arange(0, p, 0.25):
            sc = flux[np.round(grid + o).astype(int)].sum()
            if sc > best[0]:
                best = (sc, p, o)
    _, period, phase = best
    bpm = 60 * fps / period
    # Akı indeksi i, (i+1). pencereye aittir; vuruş o pencerenin ortasına denk gelir.
    offset = (phase / fps + (hop + n / 2) / sr) % (60 / bpm)
    return round(float(bpm), 2), round(offset, 3)


def main():
    m = {'generated': True, 'voice': None, 'music': None, 'sfx': {}, 'bpm': None, 'beatOffset': 0,
         'sceneStarts': None, 'totalSeconds': None, 'speech': [], 'tweets': [], 'cues': {}}
    notes = []

    tweets = sorted(p.name for p in (PUBLIC / 'tweets').glob('*') if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'})
    m['tweets'] = tweets
    notes.append(f'ekran görüntüleri: {", ".join(tweets) if tweets else "yok (tipografik kartlar)"}')

    voice = PUBLIC / 'voiceover_tw.mp3'
    if voice.exists():
        path, dur, speech, paras, o2n, ncuts = prep_voice(voice)
        if CUES_FILE.exists():
            cf = json.loads(CUES_FILE.read_text())
            starts = [0.0] + [max(0.0, o2n(cf['scenes'][f'S{i}']) - LEAD) for i in range(1, SCENE_COUNT)]
            total = round(max(dur + ENDCARD + 0.3, starts[-1] + 3.5), 2)
            m['cues'] = {k: o2n(v) for k, v in cf['cues'].items()}
            how = f'{CUES_FILE.name} ({len(cf["cues"])} cue)'
        else:
            starts, total, how = scene_starts(dur, paras)
        m.update(voice=path, speech=speech, sceneStarts=[round(s, 3) for s in starts], totalSeconds=total)
        notes.append(f'konuşma: {duration(voice):.2f} → {dur:.2f} sn (atempo {TEMPO}, {ncuts} sessizlik {SIL_KEEP} sn\'ye indi), sahneler: {how}')
        notes.append('sahne başlangıçları: ' + ', '.join(f'S{i} {s:.2f}' for i, s in enumerate(starts)) + f', toplam {total:.2f} sn')
    else:
        notes.append('konuşma: yok (public/voiceover_tw.mp3 bulunamadı), varsayılan zamanlar')

    music = PUBLIC / 'music_tw.mp3'
    if music.exists():
        bpm, off = bpm_of(music)
        total = m['totalSeconds'] or DEFAULT_TOTAL
        bed, loops = music_bed(music, total, bpm, off)
        m['music'] = bed
        m['bpm'], m['beatOffset'] = bpm, off
        notes.append((f'müzik: {duration(music):.1f} sn, BPM ≈ {bpm}, ilk vuruş {off} sn' if bpm else 'müzik: var, BPM bulunamadı (hizalama kapalı)')
                     + (f', {loops} kez vuruş sınırında döngü' if loops else ''))
    else:
        notes.append('müzik: yok (public/music_tw.mp3 bulunamadı)')

    for k in ('whoosh', 'stamp', 'scratch'):
        if (PUBLIC / 'sfx' / f'{k}.mp3').exists():
            m['sfx'][k] = f'sfx/{k}.mp3'
    notes.append(f'ses efektleri: {", ".join(m["sfx"]) or "yok"}')

    MANIFEST.write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n')
    print('\n'.join(notes))


if __name__ == '__main__':
    main()
