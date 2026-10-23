#!/usr/bin/env bash
# Hook whoosh'unu hazırlar: motion-showreel/scripts/sfx.mjs ile üretilmiş sesi 0,5 sn'ye kırpar,
# son 60 ms'de söndürür, iki geçişli loudnorm ile -18 LUFS / -1 dBTP'ye getirir (48 kHz stereo WAV).
# Kullanım: tools/hook_sfx.sh <sfx.mjs çıktısı> [public/sfx/hook_whoosh.wav]
set -euo pipefail
IN="$1"; OUT="${2:-public/sfx/hook_whoosh.wav}"
mkdir -p "$(dirname "$OUT")"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
# loudnorm 0,4 sn'lik bloklarla ölçer; kısa ses için ölçümü 4 kez tekrarlanmış kopyada yapıp kazancı oradan alıyoruz
ffmpeg -v error -y -i "$IN" -t 0.5 -af "afade=t=out:st=0.44:d=0.06,aresample=48000" -ac 2 "$TMP/cut.wav"
ffmpeg -v error -y -stream_loop 3 -i "$TMP/cut.wav" -c copy "$TMP/loop.wav"
I=$(ffmpeg -hide_banner -nostdin -i "$TMP/loop.wav" -af ebur128 -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}')
TP=$(ffmpeg -hide_banner -nostdin -i "$TMP/loop.wav" -af ebur128=peak=true -f null - 2>&1 | awk '/True peak/{f=1} f&&/Peak:/{print $2; exit}')
GAIN=$(python3 -c "i=float('$I');tp=float('$TP');g=-18-i;print(round(min(g,-1-tp),2))")
ffmpeg -v error -y -i "$TMP/cut.wav" -af "volume=${GAIN}dB" -c:a pcm_s16le "$OUT"
echo "whoosh: ölçülen $I LUFS, tepe $TP dBTP → kazanç ${GAIN} dB → $OUT"
