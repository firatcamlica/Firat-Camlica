#!/usr/bin/env bash
# Kullanım: COMP=Espresso RAW=out/video_raw.mp4 tools/render.sh
# BROWSER verilmezse ve bulut ortamındaki Chromium yoksa Remotion kendi tarayıcısını indirir (GitHub Actions).
set -euo pipefail
cd "$(dirname "$0")/.."
DEFAULT_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
BROWSER="${BROWSER:-}"
if [ -z "$BROWSER" ] && [ -x "$DEFAULT_BROWSER" ]; then BROWSER="$DEFAULT_BROWSER"; fi
BROWSER_ARGS=()
if [ -n "$BROWSER" ]; then BROWSER_ARGS=(--browser-executable="$BROWSER"); fi
npx remotion render src/index.ts "${COMP:-Espresso}" "${RAW:-out/video_raw.mp4}" \
  "${BROWSER_ARGS[@]}" --codec=h264 --crf=18 --pixel-format=yuv420p \
  --concurrency="${CONCURRENCY:-4}" --log=warn "$@"
