#!/usr/bin/env bash
# Videoya alttan fon müziği ekler. Video sesliyse müzik konuşmanın arkasında kalır:
# konuşma frekanslarında (1-4 kHz) oyulur ve konuşma geldikçe yumuşakça kısılır (ducking).
#
# Kullanım:  muzik/muzik_ekle.sh <video.mp4> [cikis.mp4]
# Ayarlar (ortam değişkeni):
#   MUZIK=muzik/demirci_sk_yatak.m4a   fon müziği (-16 LUFS'a normalize edilmiş olmalı)
#   SEVIYE=-15       sesli videoda müzik seviyesi (dB). -15 ≈ müzik -37 LUFS, konuşmanın ~21 dB altında
#   SESSIZ_SEVIYE=-8 videoda ses yoksa müzik seviyesi (dB). -8 ≈ -24 LUFS
#   BASLA=0          müziğin kaçıncı saniyesinden başlansın
#   GIRIS=1.5 CIKIS=2.5   fade-in / fade-out süreleri (sn)
# Video müzikten uzunsa parça TEKRAR (11.) saniyesinden 3 sn çapraz geçişle devam eder (sessiz giriş atlanır). Görüntü yeniden kodlanmaz.
set -euo pipefail
cd "$(dirname "$0")/.."

IN="${1:?video yolu gerekli}"
OUT="${2:-${IN%.*}_muzikli.mp4}"
MUZIK="${MUZIK:-muzik/demirci_sk_yatak.m4a}"
SEVIYE="${SEVIYE:--15}"
SESSIZ_SEVIYE="${SESSIZ_SEVIYE:--8}"
BASLA="${BASLA:-0}"
GIRIS="${GIRIS:-1.5}"
CIKIS="${CIKIS:-2.5}"
XF=3
TEKRAR="${TEKRAR:-11}"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
MDUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MUZIK")
FADE_AT=$(python3 -c "print(max(0, $DUR - $CIKIS))")
# Gereken tekrar sayısı: her ek kopya XF kadar üst üste biner.
N=$(python3 -c "import math; print(max(1, 1 + math.ceil(max(0, $DUR + $BASLA - $MDUR) / ($MDUR - $TEKRAR - $XF))))")

# Müzik girişleri 1..N; tekrarlar sessiz girişi atlayıp TEKRAR saniyesinden başlar ve
# çapraz geçişle tek parça yatağa dönüştürülür.
INPUTS=(); LOOP=""; PREV="[1:a]"
for ((i = 1; i <= N; i++)); do INPUTS+=(-i "$MUZIK"); done
for ((i = 2; i <= N; i++)); do
  LOOP+="[$i:a]atrim=start=$TEKRAR,asetpts=PTS-STARTPTS[r$i];$PREV[r$i]acrossfade=d=$XF:c1=qsin:c2=qsin[l$i];"
  PREV="[l$i]"
done
BED="${LOOP}${PREV}atrim=start=$BASLA,asetpts=PTS-STARTPTS,atrim=duration=$DUR,aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=$GIRIS,afade=t=out:st=$FADE_AT:d=$CIKIS"

# Sessiz taslaklarda boş ses kanalı olabilir; kanal var mı diye değil, gerçekten ses var mı diye bakılır.
VO_LUFS=-inf
if [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN")" ]; then
  VO_LUFS=$(ffmpeg -hide_banner -i "$IN" -map 0:a:0 -af ebur128 -f null - 2>&1 | awk '/^ *I:/{v=$2} END{print v}')
fi
if python3 -c "import sys; v='$VO_LUFS'; sys.exit(0 if v not in ('','-inf','nan') and float(v) > -50 else 1)"; then
  # Ses -16 LUFS'a çekilir. Müzik 2 kHz çevresinde 5 dB oyulur, konuşmada ~5 dB daha kısılır;
  # uzun release (1,5 sn) cümle aralarındaki kısa nefeslerde müziğin pompalamasını önler.
  FILTER="[0:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,asplit=2[vo][sc];\
${BED},equalizer=f=2000:t=q:w=0.8:g=-5,volume=${SEVIYE}dB[bed];\
[bed][sc]sidechaincompress=threshold=0.05:ratio=2:attack=150:release=1500:makeup=1[ducked];\
[vo][ducked]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.89[a]"
else
  FILTER="${BED},volume=${SESSIZ_SEVIYE}dB,alimiter=limit=0.89[a]"
fi

ffmpeg -hide_banner -loglevel error -y -i "$IN" "${INPUTS[@]}" \
  -filter_complex "$FILTER" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 \
  -t "$DUR" -movflags +faststart "$OUT"

LUFS=$(ffmpeg -hide_banner -i "$OUT" -af loudnorm=print_format=summary -f null - 2>&1 | awk '/Input Integrated/{print $3}')
echo "$OUT  (${DUR}s, $LUFS LUFS)"
