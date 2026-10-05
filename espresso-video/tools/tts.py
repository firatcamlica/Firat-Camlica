#!/usr/bin/env python3
"""Seslendirme + zamanlama üretici.

  python3 tools/tts.py --mode estimate   # ağ gerekmez; tahmini kelime zamanlaması (sessiz taslak)
  python3 tools/tts.py --mode edge       # edge-tts (speech.platform.bing.com erişimi gerekir)
  python3 tools/tts.py --mode edge --voice tr-TR-EmelNeural

Çıktı: src/timings.json  (Remotion bunu okur)
       public/voice/voice.mp3 (yalnızca edge modu; sahne ofsetli, loudnorm uygulanmış tek ses katmanı)
"""
import argparse, asyncio, json, math, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
LEAD, TAIL = 0.30, 0.60          # sahne içinde konuşmadan önce / sonra boşluk (sn)
MIN_SCENE, MAX_SCENE = 4.0, 8.0

TOKEN_RE = re.compile(r"\[([^|\]]+)\|([^\]]+)\]([,.:;!?]?)|(\S+)")


def parse_speech(markup: str):
    """'[ekran|okunuş]' işaretlemesini {d, s} jetonlarına ayırır (d: altyazı, s: seslendirme)."""
    toks = []
    for m in TOKEN_RE.finditer(markup):
        if m.group(4):
            toks.append({"d": m.group(4), "s": m.group(4)})
        else:
            p = m.group(3) or ""
            toks.append({"d": m.group(1) + p, "s": m.group(2) + p})
    return toks


def spoken_text(toks):
    return " ".join(t["s"] for t in toks)


def n_spoken(tok):
    return len(re.sub(r"[,.:;!?]", "", tok["s"]).split())


# ---------------------------------------------------------------- zamanlama
def estimate_boundaries(toks):
    """Ağsız tahmin: kelime uzunluğuna göre süre + noktalamada duraklama (hız +%10 sonrası)."""
    t, out = 0.0, []
    for tok in toks:
        for w in re.sub(r"[,.:;!?]", "", tok["s"]).split():
            dur = 0.08 + 0.05 * len(w)
            out.append((t, t + dur))
            t += dur
        last = tok["s"][-1]
        t += {",": 0.14, ":": 0.14, ";": 0.14, ".": 0.30, "!": 0.30, "?": 0.30}.get(last, 0.0)
    return out


def align(toks, bounds):
    """Okunuş kelimelerinin zamanlarını altyazı jetonlarına eşler.

    bounds: [(start, end), ...] saniye. Sayı jeton toplamıyla uyuşmazsa
    karakter uzunluğuyla orantılı dağıtım yapar.
    """
    total = sum(n_spoken(t) for t in toks)
    words = []
    if len(bounds) == total:
        i = 0
        for tok in toks:
            n = n_spoken(tok)
            words.append({"t": tok["d"], "s": bounds[i][0], "e": bounds[i + n - 1][1]})
            i += n
    else:
        t0, t1 = bounds[0][0], bounds[-1][1]
        weights = [max(1, len(t["s"])) for t in toks]
        acc, tw = 0, sum(weights)
        for tok, w in zip(toks, weights):
            s = t0 + (t1 - t0) * acc / tw
            acc += w
            words.append({"t": tok["d"], "s": s, "e": t0 + (t1 - t0) * acc / tw})
    return words


def chunk(words, max_words=3, max_chars=16):
    """TikTok altyazı grupları: en çok 3 kelime, noktalamada kırılır."""
    chunks, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        chars = sum(len(words[j]["t"]) for j in cur) + len(cur) - 1
        nxt = words[i + 1]["t"] if i + 1 < len(words) else None
        brk = (
            nxt is None
            or len(cur) >= max_words
            or w["t"][-1] in ",.:;!?"
            or chars + 1 + len(nxt) > max_chars
        )
        if brk:
            chunks.append({"w": cur})
            cur = []
    return chunks


# ---------------------------------------------------------------- edge-tts
async def edge_scene(text, voice, rate, mp3_path):
    import edge_tts

    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    audio, bounds = bytearray(), []
    async for ch in comm.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            s = ch["offset"] / 1e7
            bounds.append((s, s + ch["duration"] / 1e7))
    Path(mp3_path).write_bytes(bytes(audio))
    return bounds


def probe_duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def build_voice_track(scenes, voice_dir, out_path):
    """Sahne mp3'lerini ofsetle yerleştirir, -16 LUFS'a normalize eder."""
    inputs, filt, labels = [], [], []
    for i, sc in enumerate(scenes):
        inputs += ["-i", str(voice_dir / f"{sc['id']}.mp3")]
        ms = int(round((sc["start"] + LEAD) * 1000))
        filt.append(f"[{i}:a]adelay={ms}|{ms}[a{i}]")
        labels.append(f"[a{i}]")
    filt.append("".join(labels) + f"amix=inputs={len(scenes)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7[out]")
    subprocess.run(
        ["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]",
         "-ar", "44100", "-ac", "1", "-b:a", "192k", str(out_path)],
        check=True, capture_output=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["estimate", "edge"], default="estimate")
    ap.add_argument("--voice")
    ap.add_argument("--rate")
    a = ap.parse_args()

    script = json.loads((ROOT / "script.json").read_text(encoding="utf-8"))
    voice = a.voice or script["voice"]
    rate = a.rate or script["rate"]
    voice_dir = ROOT / "public" / "voice"
    voice_dir.mkdir(parents=True, exist_ok=True)

    scenes, t = [], 0.0
    for sc in script["scenes"]:
        toks = parse_speech(sc["speech"])
        if a.mode == "edge":
            bounds = asyncio.run(edge_scene(spoken_text(toks), voice, rate, voice_dir / f"{sc['id']}.mp3"))
            vo_dur = probe_duration(voice_dir / f"{sc['id']}.mp3")
            if bounds:
                vo_dur = max(vo_dur, bounds[-1][1])
        else:
            bounds = estimate_boundaries(toks)
            vo_dur = bounds[-1][1]
        words = align(toks, bounds)
        for w in words:
            w["s"] = round(w["s"] + LEAD, 3)
            w["e"] = round(w["e"] + LEAD, 3)
        dur = min(MAX_SCENE, max(MIN_SCENE, LEAD + vo_dur + TAIL))
        if LEAD + vo_dur + 0.25 > MAX_SCENE:
            print(f"UYARI: '{sc['id']}' sahnesi 8 sn'yi aşıyor ({LEAD + vo_dur:.2f} sn) - metni kısaltın.", file=sys.stderr)
        scenes.append({"id": sc["id"], "start": round(t, 3), "dur": round(dur, 3),
                       "words": words, "chunks": chunk(words)})
        t += dur

    out = {"fps": FPS, "source": a.mode, "voice": voice if a.mode == "edge" else None,
           "rate": rate, "total": round(t, 3), "scenes": scenes}
    (ROOT / "src" / "timings.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    if a.mode == "edge":
        build_voice_track(scenes, voice_dir, voice_dir / "voice.mp3")
    status = "OK" if 40 <= t <= 50 else "UYARI: süre 40-50 sn dışında"
    print(f"mod={a.mode} toplam={t:.2f} sn  [{status}]")
    for s in scenes:
        print(f"  {s['id']:8s} {s['start']:6.2f}  süre {s['dur']:.2f}  kelime {len(s['words'])}")


if __name__ == "__main__":
    main()
