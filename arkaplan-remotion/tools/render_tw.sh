#!/usr/bin/env bash
# twitter-savasi: varlık hazırlığı → Remotion render → ses son işlem → kapaklar ve QA kareleri.
set -euo pipefail
cd "$(dirname "$0")/.."
DEFAULT_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
BROWSER="${BROWSER:-}"
if [ -z "$BROWSER" ] && [ -x "$DEFAULT_BROWSER" ]; then BROWSER="$DEFAULT_BROWSER"; fi
BROWSER_ARGS=()
if [ -n "$BROWSER" ]; then BROWSER_ARGS=(--browser-executable="$BROWSER"); fi
mkdir -p out
python3 tools/prep_tw.py
npx remotion render src/index.ts twitter-savasi out/twitter_savasi_raw.mp4 "${BROWSER_ARGS[@]}" \
  --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency="${CONCURRENCY:-4}" --log=warn
bash tools/finalize_tw.sh out/twitter_savasi_raw.mp4 out/twitter_savasi.mp4
node tools/stills_tw.mjs all
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate,bit_rate -of compact out/twitter_savasi.mp4
