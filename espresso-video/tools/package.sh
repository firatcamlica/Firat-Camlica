#!/usr/bin/env bash
# RAW (Remotion çıktısı) -> <OUT> : yuv420p (sınırlı aralık, bt709), H.264 + AAC.
# Ses: VOICE dosyası varsa ve TIMINGS edge modunda üretildiyse onu, yoksa sessiz AAC kanalı ekler.
#   Part 1: tools/package.sh teslim/espresso_tiktok.mp4
#   Part 2: RAW=out/p2_raw.mp4 VOICE=public/voice2/voice.mp3 TIMINGS=src/p2/timings.json tools/package.sh teslim/part2/espresso_part2.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-teslim/espresso_tiktok_taslak_sessiz.mp4}"
VOICE="${VOICE:-public/voice/voice.mp3}"
TIMINGS="${TIMINGS:-src/timings.json}"
if [ -f "$VOICE" ] && grep -q '"source": "edge"' "$TIMINGS"; then
  AUDIO=(-i "$VOICE"); echo "ses: $VOICE"
else
  AUDIO=(-f lavfi -i anullsrc=r=44100:cl=mono); echo "ses: yok (sessiz kanal)"
fi
ffmpeg -y -loglevel error -i "${RAW:-out/video_raw.mp4}" "${AUDIO[@]}" -map 0:v -map 1:a -shortest \
  -vf "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 17 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 160k -ar 44100 -movflags +faststart "$OUT"
