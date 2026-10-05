#!/usr/bin/env bash
# Kullanım: tools/render.sh  -> out/video_raw.mp4 (Remotion çıktısı)
set -euo pipefail
cd "$(dirname "$0")/.."
BROWSER="${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}"
npx remotion render src/index.ts Espresso out/video_raw.mp4 \
  --browser-executable="$BROWSER" --codec=h264 --crf=18 --pixel-format=yuv420p \
  --concurrency=4 --log=warn
