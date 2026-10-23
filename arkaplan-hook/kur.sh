#!/usr/bin/env bash
# Hook kuralını Mac'e kurar (tekrar çalıştırılabilir; her adım yerinde yenilenir).
#   bash kur.sh [remotion-klasörü]
# Ortam değişkenleri:
#   SKILL_DIR  video-preprod skill klasörü (varsayılan ~/projeler/video-skills/video-preprod)
#   WHOOSH     motion-showreel/scripts/sfx.mjs ile üretilmiş whoosh dosyası (verilirse -18 LUFS'e normalize edilip kopyalanır)
# Dokunmadığı yerler: src/data/*, src/videos/*, Root.tsx, mevcut kompozisyonlar (Fransa dahil).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="${SKILL_DIR:-$HOME/projeler/video-skills/video-preprod}"
SKILL_COPY="$HOME/.claude/skills/video-preprod"
REMOTION="${1:-$HOME/Desktop/ArkaPlan/remotion}"
sync_skill() { mkdir -p "$SKILL_COPY"; cp -R "$SKILL_DIR/." "$SKILL_COPY/"; rm -f "$SKILL_COPY/SKILL.md.bak"; }

echo "1) SKILL: $SKILL_DIR/SKILL.md"
[ -f "$SKILL_DIR/SKILL.md" ] || { echo "HATA: $SKILL_DIR/SKILL.md yok (SKILL_DIR=... ile verin)"; exit 1; }
python3 "$HERE/skill/insert_hook.py" "$SKILL_DIR/SKILL.md" "$HERE/skill/HOOK.md"

echo "2) Kopya: $SKILL_COPY"
sync_skill
diff -q "$SKILL_DIR/SKILL.md" "$SKILL_COPY/SKILL.md" && echo "   SKILL.md eşit"

echo "3) Remotion: $REMOTION"
[ -d "$REMOTION/src/brand" ] || { echo "HATA: $REMOTION/src/brand yok"; exit 1; }
for f in Logo.tsx tokens.ts; do [ -f "$REMOTION/src/brand/$f" ] || { echo "HATA: src/brand/$f yok (Hook.tsx bunu kullanır)"; exit 1; }; done
grep -q "cream" "$REMOTION/src/brand/tokens.ts" && grep -q "blue" "$REMOTION/src/brand/tokens.ts" || { echo "HATA: tokens.ts'de COLORS.cream/blue yok"; exit 1; }
for f in src/brand/Hook.tsx tools/hook_gate.mjs tools/hook_sfx.sh; do
  mkdir -p "$REMOTION/$(dirname "$f")"
  if [ -f "$REMOTION/$f" ] && ! cmp -s "$HERE/remotion/$f" "$REMOTION/$f"; then cp "$REMOTION/$f" "$REMOTION/$f.bak"; echo "   yedek: $f.bak"; fi
  cp "$HERE/remotion/$f" "$REMOTION/$f"; echo "   kopyalandı: $f"
done
chmod +x "$REMOTION/tools/hook_sfx.sh"
mkdir -p "$REMOTION/public/sfx"
if [ -n "${WHOOSH:-}" ]; then (cd "$REMOTION" && bash tools/hook_sfx.sh "$WHOOSH"); fi
[ -f "$REMOTION/public/sfx/hook_whoosh.wav" ] || echo "   NOT: public/sfx/hook_whoosh.wav yok. sfx.mjs ile whoosh üretip: WHOOSH=<dosya> bash kur.sh"

echo "4) VERIFY.md"
TARGETS=()
for c in "$REMOTION/VERIFY.md" "$SKILL_DIR/VERIFY.md" "$(dirname "$SKILL_DIR")/VERIFY.md"; do [ -f "$c" ] && TARGETS+=("$c"); done
[ ${#TARGETS[@]} -gt 0 ] || { TARGETS=("$REMOTION/VERIFY.md"); printf '# VERIFY\n' > "$REMOTION/VERIFY.md"; echo "   VERIFY.md yoktu; oluşturuldu"; }
for v in "${TARGETS[@]}"; do
  python3 - "$v" "$HERE/remotion/VERIFY.hook.md" <<'PY'
import sys
from pathlib import Path
p, sec = Path(sys.argv[1]), Path(sys.argv[2]).read_text().strip()
t = p.read_text()
S, E = '<!-- HOOK-VERIFY:BAŞLA', '<!-- HOOK-VERIFY:BİTİR -->'
if S in t:
    a = t.index(S); b = t.index(E, a) + len(E)
    t = t[:a] + sec + t[b:]
else:
    t = t.rstrip() + '\n\n' + sec + '\n'
p.write_text(t)
print(f'   kapı eklendi/yenilendi: {p}')
PY
done
sync_skill   # VERIFY.md skill klasöründeyse kopyaya da geçsin

echo "5) Tip kontrolü"
(cd "$REMOTION" && npx tsc --noEmit && echo "   tsc temiz") || echo "   tsc hata verdi; çıktıya bakın"
echo "Bitti. Yeni videoda: <Sequence from={0} durationInFrames={hookFrames(fps)}><Hook text={TEXT.hook.screen} background={…} /></Sequence>"
