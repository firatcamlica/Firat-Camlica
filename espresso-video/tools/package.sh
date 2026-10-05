#!/usr/bin/env bash
# out/video_raw.mp4 -> teslim/<ad>.mp4 : yuv420p (sınırlı aralık, bt709), H.264 + AAC.
# Ses: voice/voice.mp3 varsa onu, yoksa sessiz AAC kanalı ekler.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-teslim/espresso_tiktok_taslak_sessiz.mp4}"
if [ -f public/voice/voice.mp3 ] && grep -q '"source": "edge"' src/timings.json; then
  AUDIO=(-i public/voice/voice.mp3); AMAP=(-map 0:v -map 1:a)
else
  AUDIO=(-f lavfi -i anullsrc=r=44100:cl=mono); AMAP=(-map 0:v -map 1:a)
fi
ffmpeg -y -loglevel error -i out/video_raw.mp4 "${AUDIO[@]}" "${AMAP[@]}" -shortest \
  -vf "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 17 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 160k -ar 44100 -movflags +faststart "$OUT"
