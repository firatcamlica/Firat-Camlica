#!/usr/bin/env bash
# Videoya alttan fon müziği ekler. Video sesliyse müzik konuşma sırasında kendiliğinden kısılır (ducking).
#
# Kullanım:  muzik/muzik_ekle.sh <video.mp4> [cikis.mp4]
# Ayarlar (ortam değişkeni):
#   MUZIK=muzik/demirci_sk_yatak.m4a   fon müziği (-16 LUFS'a normalize edilmiş olmalı)
#   SEVIYE=-14       sesli videoda müziğin konuşmaya göre seviyesi (dB). -14 ≈ müzik -30 LUFS, ses -16 LUFS
#   SESSIZ_SEVIYE=-4 videoda ses yoksa müzik seviyesi (dB). -4 ≈ -20 LUFS: duyulur ama bağırmaz
#   BASLA=0          müziğin kaçıncı saniyesinden başlansın
#   GIRIS=1.5 CIKIS=2.5   fade-in / fade-out süreleri (sn)
# Video müzikten uzunsa müzik başa sarılarak devam eder. Görüntü yeniden kodlanmaz.
set -euo pipefail
cd "$(dirname "$0")/.."

IN="${1:?video yolu gerekli}"
OUT="${2:-${IN%.*}_muzikli.mp4}"
MUZIK="${MUZIK:-muzik/demirci_sk_yatak.m4a}"
SEVIYE="${SEVIYE:--14}"
SESSIZ_SEVIYE="${SESSIZ_SEVIYE:--4}"
BASLA="${BASLA:-0}"
GIRIS="${GIRIS:-1.5}"
CIKIS="${CIKIS:-2.5}"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
FADE_AT=$(python3 -c "print(max(0, $DUR - $CIKIS))")
BED="atrim=start=$BASLA,asetpts=PTS-STARTPTS,atrim=duration=$DUR,aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=$GIRIS,afade=t=out:st=$FADE_AT:d=$CIKIS"

# Sessiz taslaklarda boş ses kanalı olabilir; kanal var mı diye değil, gerçekten ses var mı diye bakılır.
VO_LUFS=-inf
if [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN")" ]; then
  VO_LUFS=$(ffmpeg -hide_banner -i "$IN" -map 0:a:0 -af ebur128 -f null - 2>&1 | awk '/^ *I:/{v=$2} END{print v}')
fi
if python3 -c "import sys; v='$VO_LUFS'; sys.exit(0 if v not in ('','-inf','nan') and float(v) > -50 else 1)"; then
  # Ses -16 LUFS'a çekilir, müzik onun altında kalır ve konuşma geldikçe ~8 dB daha kısılır.
  FILTER="[0:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11,asplit=2[vo][sc];\
[1:a]$BED,volume=${SEVIYE}dB[bed];\
[bed][sc]sidechaincompress=threshold=0.04:ratio=2.5:attack=80:release=600:makeup=1[ducked];\
[vo][ducked]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.89[a]"
else
  FILTER="[1:a]$BED,volume=${SESSIZ_SEVIYE}dB,alimiter=limit=0.89[a]"
fi

ffmpeg -hide_banner -loglevel error -y -i "$IN" -stream_loop -1 -i "$MUZIK" \
  -filter_complex "$FILTER" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 \
  -t "$DUR" -movflags +faststart "$OUT"

LUFS=$(ffmpeg -hide_banner -i "$OUT" -af loudnorm=print_format=summary -f null - 2>&1 | awk '/Input Integrated/{print $3}')
echo "$OUT  (${DUR}s, $LUFS LUFS)"
