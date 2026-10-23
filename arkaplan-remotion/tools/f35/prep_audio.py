#!/usr/bin/env python3
"""turkiye-f35 ses hazırlığı → src/data/f35.audio.json + public/gen/f35_master.wav

Sıra:
 1. Seslendirme (public/voiceover_f35.mp3): atempo=1.05 (perde korunur), 0,45 sn'den uzun sessizlikler 0,25 sn'ye
    iner, -16 LUFS'a normalize edilir.
 2. Kelime zamanları: faster-whisper ya da openai-whisper (yalnızca zamanlama için); metin her zaman
    src/data/f35.ts senaryosundan gelir. Whisper yoksa kelimeler konuşma bölümlerine harf sayısıyla dağıtılır.
 3. Sahne başlangıçları = sahnenin ilk kelimesinden LEAD sn önce; kesmeler en yakın vuruşa (en fazla 3 kare).
    Konuşma kapanış kartından önce biter; toplam süre 60,0 sn'yi asla aşmaz (aşarsa çıkış kodu 1).
 4. Müzik (public/music_f35.mp3): BPM (librosa, yoksa aubio), konuşmada -20 dB, boşlukta -11 dB, iniş 150 ms,
    çıkış 400 ms, başta 0,3 sn fade in, kapanış kartında 1,5 sn fade out. Dosya yoksa uyarı verir, devam eder.
 5. SFX: whoosh (0–0,5 sn), metalik tık (S3 "5 GÜN"), yumuşak kilit (S5 kural kartı). Müziğin altında.
 6. Miks + iki geçişli loudnorm: -14 LUFS, -1 dBTP (AAC 192 kbps / 48 kHz kodlaması render.sh'te).

Kullanım: node tools/f35/data.mjs && python3 tools/f35/prep_audio.py
Ortam: WHISPER_MODEL (varsayılan small), SKIP_WHISPER=1
"""
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
GEN = PUBLIC / 'gen'
SCRIPT = GEN / 'f35_script.json'
MANIFEST = ROOT / 'src/data/f35.audio.json'
SR = 48000
LEAD = 0.12          # sahne kesmesi ilk kelimeden bu kadar önce
VOICE_LUFS = -16.0
MUSIC_LUFS = -16.0
CAPTION_MAX_CHARS = 40
CAPTION_MIN_BREAK = 14

warnings: list[str] = []


def warn(msg):
    warnings.append(msg)
    print('UYARI:', msg)


# ---------------------------------------------------------------------------- ffmpeg yardımcıları

def ff(*args):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-y', *map(str, args)], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(r.stderr[-3000:])
    return r.stderr


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)],
                         capture_output=True, text=True).stdout
    return float(out.strip())


def read_audio(path, channels=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', str(channels), '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, channels) if channels > 1 else a


def write_wav(path, data):
    data = np.asarray(data, dtype=np.float32)
    ch = 1 if data.ndim == 1 else data.shape[1]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-i', '-',
                    '-c:a', 'pcm_f32le', str(path)], input=data.tobytes(), check=True)


def loudness(path):
    log = ff('-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-')
    s = log[log.rfind('Summary'):]
    i = re.search(r'I:\s+(-?[\d.]+|-inf)', s)
    p = re.search(r'Peak:\s+(-?[\d.]+|-inf)', s)
    return (float(i.group(1)) if i and i.group(1) != '-inf' else -70.0,
            float(p.group(1)) if p and p.group(1) != '-inf' else -70.0)


def normalize(src, dst, lufs, channels):
    ff('-i', src, '-af', f'loudnorm=I={lufs}:TP=-2:LRA=20', '-ar', SR, '-ac', channels, '-c:a', 'pcm_f32le', dst)


def db(x):
    return 10 ** (x / 20)


# ---------------------------------------------------------------------------- 1. seslendirme

def silences(path, thr, dmin, total):
    log = ff('-i', path, '-af', f'silencedetect=noise={thr}dB:d={dmin}', '-f', 'null', '-')
    starts = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    if len(ends) < len(starts):
        ends.append(total)
    return [(max(0.0, s), e) for s, e in zip(starts, ends)]


def prep_voice(src, cfg, script_words, scenes):
    """Hızlandırma → kelime zamanları (hızlandırılmış zaman çizgisinde) → korumalı duraklamalar hariç sessizlik
    kısaltma → normalize. Kelime zamanları kesimlerden sonra yeni zaman çizgisine taşınır."""
    tempo = cfg['atempo']
    sil = cfg['silence']
    fast = GEN / 'f35_voice_fast.wav'
    ff('-i', src, '-af', f'atempo={tempo}', '-ar', SR, '-ac', 1, '-c:a', 'pcm_f32le', fast)
    total = duration(fast)
    sils = silences(fast, sil['thresholdDb'], sil['min'], total)
    all_sils = silences(fast, sil['thresholdDb'], 0.12, total)
    speech_fast = []
    t = 0.0
    for s, e in all_sils:
        if s > t + 0.05:
            speech_fast.append((t, s))
        t = e
    if total > t + 0.05:
        speech_fast.append((t, total))

    asr, how = cached_asr(src, tempo)
    if not asr:
        asr, how = whisper_words(fast)
    ratio = None
    if asr:
        times, ratio = align(script_words, asr)
    else:
        times = estimate_from_speech(script_words, scenes, speech_fast)

    # korumalı duraklamalar: alıntıdan ve "Bir dakika"dan sonra
    protect = set(cfg.get('protectPauseAfter', []))
    prot_ends = []
    for w, tm in zip(script_words, times):
        tok = scenes[w['scene']]['tokens'][w['tok']]
        if tok['display'] in protect and w['word'] == tok['spoken'][-1]:
            prot_ends.append(tm[1])
    half = sil['keep'] / 2
    cuts, kept = [], []
    for s, e in sils:
        if any(s - 0.3 <= pe <= s + 0.35 for pe in prot_ends):
            kept.append((round(s, 2), round(e, 2)))
            continue
        a = 0.0 if s <= 0.01 else s + half          # baştaki sessizlik tamamen gider: ilk cümle 0. karede
        b = e if e >= total - 0.01 else e - half    # sondaki sessizlik tamamen gider
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

    v = read_audio(fast)
    keep = np.ones(len(v), dtype=bool)
    for a, b in cuts:
        keep[int(a * SR):int(b * SR)] = False
    trimmed = GEN / 'f35_voice_trim.wav'
    write_wav(trimmed, v[keep])
    out = GEN / 'f35_voice.wav'
    normalize(trimmed, out, VOICE_LUFS, 1)
    speech = [(round(mapt(a), 3), round(mapt(b), 3)) for a, b in speech_fast]
    times = [(mapt(a), mapt(b)) for a, b in times]
    info = {'silencesShortened': len(cuts), 'silenceRemoved': round(total - duration(trimmed), 2), 'protectedPauses': kept,
            'timing': how, 'match': ratio}
    return out, duration(out), speech, times, info


def merge_suffixes(words):
    """Whisper'ın ayırdığı ekleri ("Türkiye" + "'nin", "S" + "-400") önceki kelimeye ekler."""
    out = []
    for w, a, b in words:
        w = w.strip()
        if out and (w[:1] in "'’-" or (w[:1].isdigit() and out[-1][0].endswith('-'))):
            out[-1] = (out[-1][0] + w, out[-1][1], b)
        elif w:
            out.append((w, a, b))
    return out


def cached_asr(src, tempo):
    """public/gen/f35_asr_original.json: orijinal kayıt üzerinde Whisper çıktısı (ör. GitHub Actions'ta üretilmiş).
    Zamanlar atempo ile hızlandırılmış zaman çizgisine bölünür."""
    f = GEN / 'f35_asr_original.json'
    if not f.exists() or os.environ.get('NO_ASR_CACHE'):
        return None, None
    d = json.loads(f.read_text())
    words = merge_suffixes([(w, a / tempo, b / tempo) for w, a, b in d['words']])
    return words, f"{d.get('model', 'whisper')} (önbellek, orijinal kayıt)"


# ---------------------------------------------------------------------------- 2. kelime zamanları

TR_LOWER = str.maketrans({'I': 'ı', 'İ': 'i'})


def norm(w):
    w = w.translate(TR_LOWER).lower()
    w = unicodedata.normalize('NFC', w)
    w = re.sub(r"['’`].*$", '', w)       # ek: "S-400'lerin" → "s-400"
    return re.sub(r'[^\w]', '', w)


def whisper_words(path):
    if os.environ.get('SKIP_WHISPER'):
        return None, 'atlandı (SKIP_WHISPER)'
    model_name = os.environ.get('WHISPER_MODEL', 'small')
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel(model_name, device='auto', compute_type='int8')
        segs, _ = model.transcribe(str(path), language='tr', word_timestamps=True, vad_filter=False, beam_size=5)
        words = merge_suffixes([(w.word.strip(), w.start, w.end) for s in segs for w in (s.words or [])])
        return words, f'faster-whisper {model_name}'
    except ImportError:
        pass
    except Exception as e:  # model indirilemedi vb.
        return None, f'faster-whisper hatası: {e}'
    try:
        import whisper
        model = whisper.load_model(model_name)
        r = model.transcribe(str(path), language='tr', word_timestamps=True)
        words = merge_suffixes([(w['word'].strip(), w['start'], w['end']) for s in r['segments'] for w in s.get('words', [])])
        return words, f'openai-whisper {model_name}'
    except ImportError:
        return None, 'whisper kurulu değil (pip install faster-whisper)'
    except Exception as e:
        return None, f'whisper hatası: {e}'


def flat_spoken(scenes):
    """Senaryodaki her okunuş kelimesi → (sahne, token index)"""
    out = []
    for si, s in enumerate(scenes):
        for ti, tok in enumerate(s['tokens']):
            for w in tok['spoken']:
                out.append({'scene': si, 'tok': ti, 'word': w})
    return out


def align(script_words, asr):
    """Senaryo kelimelerine ASR zamanlarını eşler; eşleşmeyenler komşular arasında harf sayısıyla dağıtılır."""
    a = [norm(w['word']) for w in script_words]
    b = [norm(w[0]) for w in asr]
    times = [None] * len(a)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    matched = 0
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = (asr[blk.b + k][1], asr[blk.b + k][2])
            matched += 1
    # opcodes 'replace': eşit uzunluktaysa birebir, değilse aralığa yay
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'replace' and j2 > j1:
            t0, t1 = asr[j1][1], asr[j2 - 1][2]
            spread(script_words, times, i1, i2, t0, t1)
    fill_gaps(script_words, times)
    return times, matched / max(1, len(a))


def spread(words, times, i1, i2, t0, t1):
    w = [max(1, len(words[i]['word'])) for i in range(i1, i2)]
    tot = sum(w)
    t = t0
    for k, i in enumerate(range(i1, i2)):
        d = (t1 - t0) * w[k] / tot
        times[i] = (t, t + d * 0.92)
        t += d


def fill_gaps(words, times):
    n = len(times)
    i = 0
    while i < n:
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < n and times[j] is None:
            j += 1
        t0 = times[i - 1][1] + 0.03 if i > 0 else 0.0
        t1 = times[j][0] - 0.03 if j < n else t0 + 0.35 * (j - i)
        spread(words, times, i, j, t0, max(t1, t0 + 0.1 * (j - i)))
        i = j


def estimate_from_speech(script_words, scenes, speech):
    """Whisper yoksa: konuşma bölümlerini birleştirip kelimeleri harf sayısıyla dağıtır."""
    total_speech = sum(e - s for s, e in speech)
    weights = [len(w['word']) + 1 for w in script_words]
    tot = sum(weights)
    times = []
    acc = 0.0
    for w in weights:
        a, b = acc, acc + total_speech * w / tot
        acc = b
        times.append((speech_time(speech, a), speech_time(speech, b - 0.02)))
    return times


def speech_time(speech, x):
    for s, e in speech:
        if x <= e - s:
            return s + x
        x -= e - s
    return speech[-1][1]


def estimate_without_voice(scenes):
    """Ses yokken (taslak): kelimeler tahmini sahne aralıklarına dağıtılır."""
    out = []
    for si, s in enumerate(scenes):
        toks = s['tokens']
        if not toks:
            continue
        a, b = s['start'] + (0.0 if si == 0 else 0.15), s['end'] - 0.35
        w = [sum(len(x) for x in t['spoken']) + 1 for t in toks]
        tot = sum(w)
        t = a
        for k, tok in enumerate(toks):
            d = (b - a) * w[k] / tot
            out.append((si, k, t, t + d * 0.9))
            t += d
    return out


# ---------------------------------------------------------------------------- 3. müzik

def detect_bpm(path):
    try:
        import librosa
        y, sr = librosa.load(str(path), sr=22050, mono=True)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
        tempo = float(np.atleast_1d(tempo)[0])
        if len(beats) < 4:
            return None, 0.0, 'librosa: vuruş bulunamadı'
        period, offset = beat_grid(beats)
        return round(60 / period, 2), round(offset, 3), f'librosa (beat_track {tempo:.1f}, ızgara uydurma)'
    except ImportError:
        pass
    try:
        out = subprocess.run(['aubio', 'beat', str(path)], capture_output=True, text=True, check=True).stdout
        period, offset = beat_grid(np.array([float(x) for x in out.split()]))
        return round(60 / period, 2), round(offset, 3), 'aubio beat'
    except Exception as e:
        return None, 0.0, f'BPM bulunamadı ({e})'


def beat_grid(beats):
    """Vuruş zamanlarına doğrusal ızgara uydurur (t = offset + k·period); kaçırılan vuruşlar k'yı atlatır."""
    p0 = float(np.median(np.diff(beats)))
    k = np.round((beats - beats[0]) / p0)
    period, intercept = np.polyfit(k, beats, 1)
    return float(period), float(intercept % period)


def music_bed(src, total, bpm, offset):
    norm_path = GEN / 'f35_music_norm.wav'
    normalize(src, norm_path, MUSIC_LUFS, 2)
    m = read_audio(norm_path, 2)
    need = int((total + 0.2) * SR)
    if len(m) >= need:
        return m[:need], False
    # kısa parça: son tam vuruşta kesip ilk vuruştan döngü (30 ms çapraz geçiş)
    if bpm:
        beat = 60 / bpm
        dur = len(m) / SR
        end = offset + int((dur - 0.5 - offset) / beat) * beat
        a, b = int(offset * SR), int(end * SR)
    else:
        a, b = 0, len(m)
    out = m[:b].copy()
    xf = int(0.03 * SR)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    while len(out) < need:
        seg = m[a:b].copy()
        seg[:xf] = seg[:xf] * ramp + out[-xf:] * (1 - ramp)
        out = np.concatenate([out[:-xf], seg])
    return out[:need], True


def music_envelope(n, speech, scene_bounds, levels, cfg, total, auto=None, starts=None, fps=30):
    """dB cinsinden zarf: konuşmada speech, boşlukta gap; iniş/çıkış rampaları; fade in/out;
    özel otomasyon: piyano girişi (S1) ve S6 kesmesi → S7'de toparlanma."""
    t = np.arange(n) / SR
    gap_db = np.empty(n, dtype=np.float32)
    sp_db = np.empty(n, dtype=np.float32)
    for (a, b), lv in zip(scene_bounds, levels):
        sel = (t >= a) & (t < b)
        gap_db[sel] = lv['gap']
        sp_db[sel] = lv['speech']
    gap_db[t >= scene_bounds[-1][1]] = levels[-1]['gap']
    sp_db[t >= scene_bounds[-1][1]] = levels[-1]['speech']
    # yakın konuşma bölümlerini birleştir (0,25 sn'lik nefeslerde pompalama olmasın)
    merged = []
    for s, e in speech:
        if merged and s - merged[-1][1] < cfg['mergeGap']:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    duck = np.zeros(n, dtype=np.float32)  # 0 = boşluk, 1 = konuşma
    down, up = cfg['duckDownMs'] / 1000, cfg['duckUpMs'] / 1000
    for s, e in merged:
        seg = np.clip((t - s) / down, 0, 1)                 # konuşma başlayınca 150 ms'de iner
        rel = np.clip(1 - (t - e) / up, 0, 1)               # bitince 400 ms'de yükselir
        shape = np.where(t < s, 0, np.where(t <= e, seg, rel))
        duck = np.maximum(duck, shape.astype(np.float32))
    env_db = gap_db + (sp_db - gap_db) * duck
    mult = np.ones(n, dtype=np.float32)
    if auto and starts:
        pi = auto['pianoIntro']
        env_db = np.where(t < pi['seconds'], pi['db'], env_db)
        pt = auto['plotTwist']
        t6, t7 = starts['S6'], starts['S7']
        cut = pt['cutFrames'] / fps
        mult = np.where((t >= t6) & (t < t6 + cut), 1 - (t - t6) / cut, mult)
        mult = np.where((t >= t6 + cut) & (t < t6 + cut + pt['silence']), 0, mult).astype(np.float32)
        env_db = np.where((t >= t6 + cut + pt['silence']) & (t < t7), pt['restartDb'], env_db)
        rec = np.clip((t - t7) / pt['recoverSeconds'], 0, 1)
        sel = (t >= t7) & (t < t7 + pt['recoverSeconds'])
        env_db = np.where(sel, pt['restartDb'] + (env_db - pt['restartDb']) * rec, env_db)
    g = db(env_db) * mult
    fi = np.clip(t / cfg['fadeIn'], 0, 1)
    fo = np.clip((total - t) / cfg['fadeOut'], 0, 1)
    return (g * fi * fo).astype(np.float32), merged


# ---------------------------------------------------------------------------- 5. SFX (sentez)

def synth_sfx(kind):
    """Kısa SFX sentezi (public/sfx/f35_<tür>.wav yoksa). Türler: type, stamp, paper, tape, metal."""
    rng = np.random.default_rng({'type': 1, 'stamp': 2, 'paper': 3, 'tape': 4, 'metal': 5}[kind])

    def tt(sec):
        n = int(sec * SR)
        return n, np.arange(n) / SR

    if kind == 'type':                        # daktilo tuşu: 30 ms klik + gövde rezonansı
        n, t = tt(0.06)
        y = rng.standard_normal(n) * np.exp(-t * 260) * 0.6 + np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 180) * 0.5
        y += np.sin(2 * np.pi * 320 * t) * np.exp(-t * 90) * 0.3
    elif kind == 'stamp':                     # damga: alçak "tok" + kâğıda çarpma
        n, t = tt(0.26)
        y = np.sin(2 * np.pi * (95 - 40 * t) * t) * np.exp(-t * 26)
        y += rng.standard_normal(n) * np.exp(-t * 120) * 0.45
    elif kind == 'paper':                     # takvim yaprakları: titreşimli bant gürültüsü
        n, t = tt(0.55)
        noise = rng.standard_normal(n)
        hp = noise - np.convolve(noise, np.ones(6) / 6, mode='same')
        flutter = (0.5 + 0.5 * np.sin(2 * np.pi * 24 * t)) ** 2
        y = hp * flutter * np.sin(np.pi * np.clip(t / 0.55, 0, 1))
    elif kind == 'tape':                      # bant durması: düşen perdeli akor, sönüm
        n, t = tt(0.6)
        f = 220 * (1 - t / 0.6) ** 2 + 25
        ph = 2 * np.pi * np.cumsum(f) / SR
        y = (np.sin(ph) + 0.5 * np.sin(1.5 * ph) + 0.3 * np.sin(2.01 * ph)) * (1 - t / 0.6) ** 0.7
    else:                                     # metal tık: uyumsuz kısmi sesler, iki vuruş (iki anahtar)
        n, t = tt(0.4)
        y = np.zeros(n)
        for at in (0.0, 0.28):
            k = int(at * SR)
            m = int(0.09 * SR)
            u = np.arange(m) / SR
            y[k:k + m] += sum(np.sin(2 * np.pi * fq * u) * np.exp(-u * dd) * aa
                              for fq, dd, aa in [(2380, 60, 1), (3710, 80, 0.6), (5230, 110, 0.4)])
    y = np.asarray(y, dtype=np.float32)
    return y / (np.max(np.abs(y)) + 1e-9) * 0.9


def type_sequence(times, y):
    """Kelime başına bir daktilo tıkı: tek SFX olayı olarak birleştirilir."""
    t0 = times[0]
    out = np.zeros(int((times[-1] - t0 + 0.2) * SR), dtype=np.float32)
    for t in times:
        k = int((t - t0) * SR)
        out[k:k + len(y)] += y[:len(out) - k]
    return out


def rms_db(x):
    x = x[np.abs(x) > 1e-4] if np.any(np.abs(x) > 1e-4) else x
    return 20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-9)


# ---------------------------------------------------------------------------- yardımcılar

def snap(t, bpm, offset, fps, max_frames):
    if not bpm:
        return t, 0
    beat = 60 / bpm
    n = round((t - offset) / beat)
    s = offset + n * beat
    shift = round((s - t) * fps)
    if abs(shift) <= max_frames and s >= 0:
        return s, shift
    return t, 0


def captions(words):
    """Kelimeleri en fazla iki satırlık parçalara böler (cümle sonu, noktalama ya da 40 harf)."""
    def length(ws):
        return len(' '.join(x['display'] for x in ws))

    def split(ws):
        """Cümle 40 harften uzunsa dengeli iki parçaya böl (noktalamadan sonrası tercih edilir), gerekirse tekrar."""
        if length(ws) <= CAPTION_MAX_CHARS or len(ws) < 2:
            return [ws]
        best, best_cost = 1, 1e9
        for k in range(1, len(ws)):
            a, b = length(ws[:k]), length(ws[k:])
            cost = abs(a - b) - (12 if re.search(r'[,;:]$', ws[k - 1]['display']) else 0)
            if min(a, b) < CAPTION_MIN_BREAK:
                cost += 40
            if cost < best_cost:
                best, best_cost = k, cost
        return split(ws[:best]) + split(ws[best:])

    sentences, cur = [], []
    for w in words:
        if cur and w['scene'] != cur[-1]['scene']:
            sentences.append(cur)
            cur = []
        cur.append(w)
        if re.search(r'[.?!]$', w['display']):
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
    chunks = [c for s in sentences for c in split(s)]
    out = []
    for i, c in enumerate(chunks):
        start = c[0]['start']
        end = c[-1]['end'] + 0.25
        if i + 1 < len(chunks):
            end = min(max(end, c[-1]['end']), chunks[i + 1][0]['start'])
        out.append({'start': round(start, 3), 'end': round(end, 3), 'text': ' '.join(x['display'] for x in c),
                    'words': [[x['display'], round(x['start'], 3), round(x['end'], 3)] for x in c]})
    return out


# ---------------------------------------------------------------------------- ana akış

def main():
    if not SCRIPT.exists():
        sys.exit('public/gen/f35_script.json yok: önce `node tools/f35/data.mjs` çalıştırın')
    d = json.loads(SCRIPT.read_text())
    GEN.mkdir(parents=True, exist_ok=True)
    scenes = d['scenes']
    fps = d['fps']
    cfg = d['audio']
    dur = d['duration']
    ids = [s['id'] for s in scenes]
    voice_src = PUBLIC / d['voiceFile']
    music_src = PUBLIC / d['musicFile']
    man = {'generated': True, 'voice': None, 'music': None, 'master': None, 'wordTiming': None, 'bpm': None,
           'beatOffset': 0.0, 'bpmMethod': None, 'speech': [], 'sceneStarts': {}, 'totalSeconds': None,
           'cues': {}, 'captions': [], 'sfx': [], 'beatShifts': {}, 'masking': [], 'warnings': [], 'stats': {}}

    # --- 1-2. seslendirme ve kelime zamanları
    script_words = flat_spoken(scenes)
    word_times = {}  # (scene, tok) -> (start, end)
    if voice_src.exists():
        vpath, vdur, speech, times, info = prep_voice(voice_src, cfg, script_words, scenes)
        man['voice'] = str(vpath.relative_to(PUBLIC))
        man['speech'] = speech
        man['stats'].update({'voiceOriginal': round(duration(voice_src), 2), 'voiceProcessed': round(vdur, 2),
                             'silencesShortened': info['silencesShortened'], 'silenceRemoved': info['silenceRemoved'],
                             'protectedPauses': info['protectedPauses']})
        if info['match'] is not None:
            man['wordTiming'] = f"{info['timing']}; senaryo eşleşmesi %{round(info['match'] * 100)}"
            man['stats']['asrMatch'] = round(info['match'], 3)
            if info['match'] < 0.6:
                warn(f"Whisper metni senaryoyla yalnızca %{round(info['match'] * 100)} eşleşti: kayıt senaryodan farklı olabilir")
        else:
            man['wordTiming'] = f"tahmini (konuşma bölümlerine dağıtıldı; {info['timing']})"
            warn(f"Kelime zamanları tahmini: {info['timing']}")
        for w, (a, b) in zip(script_words, times):
            k = (w['scene'], w['tok'])
            word_times[k] = (min(a, word_times.get(k, (a, b))[0]), max(b, word_times.get(k, (a, b))[1]))
        speech_end = speech[-1][1] if speech else vdur
    else:
        warn(f'public/{d["voiceFile"]} yok: sessiz taslak, sahne süreleri ve altyazı zamanları tahmini')
        man['wordTiming'] = 'tahmini (seslendirme yok)'
        for si, k, a, b in estimate_without_voice(scenes):
            word_times[(si, k)] = (a, b)
        speech_end = max(b for a, b in word_times.values())
        vdur = None

    # --- 4a. BPM (sahne kesmelerinden önce gerekir)
    bpm, offset = None, 0.0
    if music_src.exists():
        bpm, offset, how = detect_bpm(music_src)
        man['bpm'], man['beatOffset'], man['bpmMethod'] = bpm, offset, how
        if not bpm:
            warn(how)
    else:
        warn(f'public/{d["musicFile"]} yok: müziksiz devam ediliyor (render durmadı); vuruş hizalaması yapılmadı')

    # --- 3. sahne başlangıçları
    starts = {'S1': 0.0}
    for si, s in enumerate(scenes[1:], start=1):
        if not s['tokens']:
            continue
        first = word_times[(si, 0)][0]
        raw = max(starts[ids[si - 1]] + 1.0, first - LEAD)
        snapped, shift = snap(raw, bpm, offset, fps, cfg['beatSnapMaxFrames'])
        if snapped > first:  # kesme kelimeden sonraya kayamaz
            snapped, shift = raw, 0
        starts[s['id']] = round(snapped, 3)
        if shift:
            man['beatShifts'][s['id']] = shift
    end_card = dur['endCard']
    s9 = max(speech_end + 0.35, starts[ids[-2]] + 2.0)
    s9, shift = snap(s9, bpm, offset, fps, cfg['beatSnapMaxFrames'])
    if s9 < speech_end + 0.2:
        s9 = speech_end + 0.35
    if shift:
        man['beatShifts']['S9'] = shift
    total = s9 + end_card
    if total < dur['targetMin']:
        # S8'deki soruyu daha uzun tut (hedef 56 sn)
        s9 += dur['targetMin'] - total
        total = dur['targetMin']
    s9 = round(round(s9 * fps) / fps, 3)
    total = round(s9 + end_card, 3)
    starts['S9'] = s9
    man['sceneStarts'] = starts
    man['totalSeconds'] = total
    man['stats']['speechEnd'] = round(speech_end, 3)
    if total > dur['max']:
        man['warnings'] = warnings + [f'TOPLAM {total} sn > {dur["max"]} sn']
        MANIFEST.write_text(json.dumps(man, ensure_ascii=False, indent=1))
        sys.exit(f'HATA: toplam süre {total} sn, {dur["max"]} sn sınırını aşıyor. Senaryoyu kısaltın.')
    if not (dur['targetMin'] <= total <= dur['targetMax']):
        warn(f'Toplam süre {total} sn, hedef {dur["targetMin"]}–{dur["targetMax"]} sn dışında')

    # --- kelimeler, altyazı, cue'lar
    words = []
    for si, s in enumerate(scenes):
        sent = 0
        hide = set(s.get('hideCaptionSentences') or [])
        for ti, tok in enumerate(s['tokens']):
            a, b = word_times[(si, ti)]
            words.append({'scene': si, 'display': tok['display'], 'start': a, 'end': b, 'hide': sent in hide})
            if re.search(r'[.?!]$', tok['display']):
                sent += 1
    man['words'] = [[ids[w['scene']], w['display'], round(w['start'], 3), round(w['end'], 3)] for w in words]
    man['captions'] = captions([w for w in words if not w['hide']])
    for si, s in enumerate(scenes):
        for name, c in s['cues'].items():
            target = norm(c['word'])
            hit = next((w for w in words if w['scene'] == si and norm(w['display']).startswith(target)), None)
            if hit:
                man['cues'][f"{s['id']}.{name}"] = round(hit['start'] + c.get('offset', 0), 3)
            else:
                man['cues'][f"{s['id']}.{name}"] = round(starts.get(s['id'], s['start']) + c['fallback'], 3)
                warn(f"cue {s['id']}.{name}: '{c['word']}' senaryoda bulunamadı, yedek süre kullanıldı")

    # damgalar, sayaç duruşları ve sert açılışlar en yakın vuruşa (en fazla 3 kare)
    def snapkey(key, t):
        st, sh = snap(t, bpm, offset, fps, cfg['beatSnapMaxFrames'])
        man['cues'][key] = round(st, 3)
        if sh:
            man['beatShifts'][key] = sh

    c = man['cues']
    snapkey('S1.countStop', c['S1.count'] + 12 / fps)       # 6 sayacı 12 karede durur
    for key in ('S1.stamp', 'S3.fiveDays', 'S3.stamp', 'S5.rule', 'S7.stamp', 'S8.keys', 'S2.parts'):
        if key in c:
            snapkey(key, c[key])
    c['S3.flipStart'] = round(c['S3.fiveDays'] - 20 / fps, 3)   # 12 → 17: 5 yaprak × 4 kare

    # --- 5. SFX yerleri (en fazla 8 olay; sayaç whoosh'u sınır nedeniyle çıkarıldı)
    quote_times = [w['start'] for w in words if w['scene'] == 0 and w['hide']]
    sfx_plan = [('type', quote_times[0] if quote_times else 0.0), ('stamp', c.get('S1.stamp')), ('paper', c.get('S3.flipStart')),
                ('stamp', c.get('S3.stamp')), ('stamp', c.get('S5.rule')), ('tape', starts.get('S6')),
                ('stamp', c.get('S7.stamp')), ('metal', c.get('S8.keys'))]
    sfx_plan = [(k, t) for k, t in sfx_plan if t is not None][:cfg['sfx']['maxCount']]

    # --- 4b. müzik yatağı + miks
    n = int(round(total * SR))
    bounds = [(starts[ids[i]], starts[ids[i + 1]] if i + 1 < len(ids) else total) for i in range(len(ids))]
    levels = [s['musicLevel'] for s in scenes]
    mix = np.zeros((n, 2), dtype=np.float32)
    voice = None
    if man['voice']:
        voice = read_audio(PUBLIC / man['voice'])[:n]
        mix[:len(voice)] += voice[:, None]
    music_gain = None
    if music_src.exists():
        bed, looped = music_bed(music_src, total, bpm, offset)
        bed = bed[:n]
        auto = cfg.get('musicAutomation')
        if auto:
            pi = auto['pianoIntro']['seconds']
            piano_src = PUBLIC / d.get('musicPianoFile', '')
            pn = GEN / 'f35_music_piano.wav'
            if d.get('musicPianoFile') and piano_src.exists():
                normalize(piano_src, pn, MUSIC_LUFS, 2)
                man['stats']['pianoIntro'] = 'piyano stem dosyası'
            else:
                # stem yoksa: yatağın alçak geçirenden geçmiş hali (piyano/ped bölgesi)
                write_wav(GEN / 'f35_bed_tmp.wav', bed)
                ff('-i', GEN / 'f35_bed_tmp.wav', '-af', 'highpass=f=120,lowpass=f=1800', '-c:a', 'pcm_f32le', pn)
                man['stats']['pianoIntro'] = 'stem yok: alçak geçiren (120–1800 Hz) yaklaşık'
                warn('S1 piyano girişi: public/' + d.get('musicPianoFile', 'music_f35_piano.mp3') + ' yok, müzik filtrelenerek yaklaşık piyano bölgesi kullanıldı')
            pb = read_audio(pn, 2)[:len(bed)]
            k0, k1 = int((pi - 0.3) * SR), int(pi * SR)
            w = np.ones(len(bed), dtype=np.float32)
            w[k0:k1] = np.linspace(1, 0, k1 - k0)
            w[k1:] = 0
            m = min(len(pb), len(bed))
            bed[:m] = bed[:m] * (1 - w[:m, None]) + pb[:m] * w[:m, None]
        env, merged = music_envelope(len(bed), man['speech'] or [(w['start'], w['end']) for w in words],
                                     bounds, levels, cfg['music'], total, auto, starts, fps)
        music = bed * env[:, None]
        mix[:len(music)] += music
        music_gain = env
        man['music'] = str(music_src.relative_to(PUBLIC))
        man['stats']['musicLooped'] = looped
        write_wav(GEN / 'f35_music_bed.wav', music)
    # SFX: müzik seviyesinin altında (RMS, 3 dB); müzik yoksa konuşmanın 14 dB altında
    # public/sfx/f35_<tür>.wav varsa (ör. motion-showreel/scripts/sfx.mjs çıktısı) o kullanılır, yoksa sentezlenir
    for kind, at in sfx_plan:
        f = PUBLIC / 'sfx' / f'f35_{kind}.wav'
        if f.exists():
            y = read_audio(f)
            origin = 'dosya'
        else:
            f = GEN / f'sfx_{kind}.wav'
            y = synth_sfx(kind)
            write_wav(f, y)
            origin = 'sentez (tools/f35/prep_audio.py)'
        if kind == 'type':
            y = type_sequence(quote_times or [at], y)
        i0 = int(at * SR)
        i1 = min(n, i0 + len(y))
        if music_gain is not None:
            # müziğin o andaki seviyesi ≈ normalize seviye + sahnenin konuşma/boşluk kazancı (fade hariç)
            lv = levels[max(i for i, (a, _) in enumerate(bounds) if a <= at)]
            talking = any(s - 0.05 <= at <= e for s, e in merged)
            ref = MUSIC_LUFS + (lv['speech'] if talking else lv['gap'])
            if auto and at < auto['pianoIntro']['seconds']:
                ref = MUSIC_LUFS + auto['pianoIntro']['db']
            if auto and starts['S6'] - 0.05 <= at < starts['S7']:
                ref = MUSIC_LUFS + auto['plotTwist']['restartDb']
            target = ref + cfg['sfx']['underMusicDb']
        else:
            target = VOICE_LUFS - 14
        g = db(target - rms_db(y))
        mix[i0:i1] += (y[:i1 - i0] * g)[:, None]
        man['sfx'].append({'name': kind, 'at': round(at, 3), 'file': str(f.relative_to(PUBLIC)), 'origin': origin,
                           'levelDb': round(float(target), 1)})

    # müziğin konuşmayı bastırdığı saniyeler (konuşma - müzik < 10 dB)
    if voice is not None and music_gain is not None:
        bedm = read_audio(GEN / 'f35_music_bed.wav', 2)[:, 0]
        for sec in range(int(total)):
            a, b = sec * SR, min(n, (sec + 1) * SR)
            if b > len(voice) or b > len(bedm):
                break
            vs = voice[a:b]
            if np.sqrt(np.mean(vs ** 2)) < 0.01:
                continue
            diff = rms_db(vs) - rms_db(bedm[a:b])
            if diff < 10:
                man['masking'].append({'second': sec, 'voiceMinusMusicDb': round(float(diff), 1)})

    raw_mix = GEN / 'f35_mix.wav'
    write_wav(raw_mix, mix)
    master = GEN / 'f35_master.wav'
    if voice is not None or music_gain is not None:
        two_pass_loudnorm(raw_mix, master, d['audio']['master'])
    else:
        write_wav(master, mix)
        warn('Konuşma ve müzik yok: miks yalnızca SFX içeriyor, loudnorm uygulanmadı')
    man['master'] = str(master.relative_to(PUBLIC))
    I, TP = loudness(master)
    man['stats']['masterLUFS'], man['stats']['masterTruePeak'] = I, TP
    man['warnings'] = warnings
    MANIFEST.write_text(json.dumps(man, ensure_ascii=False, indent=1))
    print(json.dumps({k: man[k] for k in ['voice', 'music', 'wordTiming', 'bpm', 'sceneStarts', 'totalSeconds', 'beatShifts', 'sfx']},
                     ensure_ascii=False, indent=1))
    print('masking:', man['masking'] or 'yok', '| master:', I, 'LUFS', TP, 'dBTP')


def two_pass_loudnorm(src, dst, m):
    target = f"I={m['I']}:TP={m['TP']}:LRA={m['LRA']}"
    log = ff('-i', src, '-af', f'loudnorm={target}:print_format=json', '-f', 'null', '-')
    js = json.loads(log[log.rfind('{'):log.rfind('}') + 1])
    gain = m['I'] - float(js['input_i'])
    pre = src
    # Doğrusal kazanç tepe sınırını aşacaksa önce sınırlayıcı (loudnorm dinamik moda düşmesin)
    if float(js['input_tp']) + gain > m['TP'] - 0.5:
        lim = GEN / 'f35_mix_lim.wav'
        ff('-i', src, '-af', f"volume={gain:.2f}dB,alimiter=limit={db(m['TP'] - 1.5):.4f}:attack=5:release=60:level=disabled,volume={-gain:.2f}dB",
           '-c:a', 'pcm_f32le', lim)
        pre = lim
        log = ff('-i', pre, '-af', f'loudnorm={target}:print_format=json', '-f', 'null', '-')
        js = json.loads(log[log.rfind('{'):log.rfind('}') + 1])
    ff('-i', pre, '-af',
       f"loudnorm={target}:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true:print_format=summary",
       '-ar', SR, '-c:a', 'pcm_f32le', dst)


if __name__ == '__main__':
    main()
