#!/usr/bin/env bash
# cephe-morph döngüsü: üç en-boy oranı paralel, 60 fps, 6 alt kareli hareket bulanıklığı, H.264 + yuv420p.
set -euo pipefail
cd "$(dirname "$0")/.."
DEFAULT_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
ARGS=(--codec=h264 --pixel-format=yuv420p --crf=16 --log=error --concurrency="${CONCURRENCY:-1}")
[ -x "$DEFAULT_BROWSER" ] && ARGS+=(--browser-executable="$DEFAULT_BROWSER")
mkdir -p out
npx remotion bundle src/index.ts --out-dir=out/bundle --log=error >/dev/null
for r in 9x16 1x1 16x9; do
  npx remotion render out/bundle "cephe-morph-$r" "out/cephe_morph_$r.mp4" "${ARGS[@]}" &
done
wait
# Remotion'ın JPEG kareleri tam aralık (yuvj420p) verir; ffmpeg'den geçirip yayın aralığı yuv420p yap.
for r in 9x16 1x1 16x9; do
  ffmpeg -v error -y -i "out/cephe_morph_$r.mp4" -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
    -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -color_range tv -movflags +faststart -an "out/cephe_morph_${r}_tv.mp4" &&
    mv "out/cephe_morph_${r}_tv.mp4" "out/cephe_morph_$r.mp4" &
done
wait
for r in 9x16 1x1 16x9; do
  ffprobe -v error -show_entries stream=width,height,r_frame_rate,pix_fmt,codec_name:format=duration -of compact "out/cephe_morph_$r.mp4"
done
