#!/usr/bin/env bash
# turkiye-f35: veri → varlıklar → ses → Remotion render → mux (H.264 + AAC) → altyazı/kaynak/atıf → kapak + QA → VERIFY
#   bash tools/f35/render.sh            (SKIP_ASSETS=1: fotoğraf/B-roll/derinlik adımlarını atla)
set -euo pipefail
cd "$(dirname "$0")/../.."
for p in "${BROWSER:-}" /opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell; do
  if [ -n "$p" ] && [ -x "$p" ]; then BROWSER="$p"; break; fi
done
BROWSER_ARGS=()
if [ -n "${BROWSER:-}" ]; then BROWSER_ARGS=(--browser-executable="$BROWSER"); fi
mkdir -p out

node tools/f35/data.mjs
if [ -z "${SKIP_ASSETS:-}" ]; then
  python3 tools/f35/fetch_photos.py || echo "UYARI: fotoğraf adımı başarısız, çizimlerle devam"
  python3 tools/f35/fetch_broll.py || echo "UYARI: B-roll adımı başarısız, devam"
  python3 tools/f35/depth.py || echo "UYARI: derinlik adımı başarısız, düz itişle devam"
fi
[ -f public/music_f35.mp3 ] || echo "UYARI: public/music_f35.mp3 yok — müziksiz render (durdurulmadı)"
python3 tools/f35/prep_audio.py          # toplam > 60 sn ise burada durur

npx remotion render src/index.ts turkiye-f35 out/f35_raw.mp4 "${BROWSER_ARGS[@]}" \
  --codec=h264 --crf=14 --muted --concurrency="${CONCURRENCY:-4}" --log=warn

ffmpeg -v error -y -i out/f35_raw.mp4 -i public/gen/f35_master.wav -map 0:v -map 1:a \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart out/turkiye-f35.mp4
rm -f out/f35_raw.mp4

node tools/f35/deliver.mjs
node tools/f35/stills.mjs all
node tools/f35/verify.mjs || echo "VERIFY: engelleyici bulgu var (out/VERIFY.md)"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,bit_rate -of compact out/turkiye-f35.mp4
