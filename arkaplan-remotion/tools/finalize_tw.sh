#!/usr/bin/env bash
# Remotion çıktısının sesini iki geçişli loudnorm ile -14 LUFS / -1 dBTP'ye getirir,
# AAC 192 kbps 48 kHz olarak yazar. Video, Remotion'ın tam aralıklı yuvj420p çıktısından yayın aralığı yuv420p'ye çevrilir. Ses yoksa sessiz AAC iz ekler (platform uyumu için).
# Kullanım: tools/finalize_tw.sh <girdi.mp4> <çıktı.mp4>
set -euo pipefail
IN="$1"; OUT="$2"
VENC=(-vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -color_range tv)
HAS_AUDIO=$(python3 -c "import json;m=json.load(open('src/data/twitter-savasi.audio.json'));print(1 if (m.get('voice') or m.get('music') or m.get('sfx')) else 0)")
if [ "$HAS_AUDIO" = "0" ]; then
  ffmpeg -v error -y -i "$IN" -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a "${VENC[@]}" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
  echo "ses: yok, sessiz AAC iz eklendi (loudnorm uygulanmadı)"
  exit 0
fi
TARGET="I=-14:TP=-1:LRA=11"
JSON=$(ffmpeg -hide_banner -nostdin -i "$IN" -vn -af "loudnorm=$TARGET:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$JSON" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -map 0:v -map 0:a "${VENC[@]}" \
  -af "loudnorm=$TARGET:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
ffmpeg -hide_banner -nostdin -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | sed -n "/Summary/,\$p" | grep -E "I:|Peak:" | sed "s/^ */ölçüm: /"
