#!/usr/bin/env python3
"""timings.json + script.json -> altyazı (.srt) ve senaryo.md"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "teslim"
DEST.mkdir(parents=True, exist_ok=True)

SCRIPT = sys.argv[2] if len(sys.argv) > 2 else "script.json"
TIMINGS = sys.argv[3] if len(sys.argv) > 3 else "src/timings.json"
SRT_NAME = sys.argv[4] if len(sys.argv) > 4 else "espresso_tiktok_altyazi.srt"
script = json.loads((ROOT / SCRIPT).read_text(encoding="utf-8"))
tm = json.loads((ROOT / TIMINGS).read_text(encoding="utf-8"))
PART2 = SCRIPT != "script.json"

VISUAL = {
    "hook": "Cam fincan hızla dolar, crema katmanı ve buhar belirir; şimşek simgesi.",
    "y1884": "Yıl sayacı 1850→1884; vektör buhar kazanı, 'PATENT' damgası; zaman çizgisi.",
    "y1901": "Yıl sayacı 1884→1901→1905; iki bilgi kartı (Bezzera, Pavoni); zaman çizgisi.",
    "y1948": "Yıl sayacı →1948; fincan dolar, crema katmanı kalınlaşır, buhar çıkar; zaman çizgisi.",
    "y1961": "Yıl sayacı →1961; 0→9 bar basınç göstergesi, ibre ve yay animasyonu; zaman çizgisi.",
    "recipe": "Sayaçlı 4 çubuk: 18 g, 36 g, 30 sn, 93 °C (ölçek notlarıyla) + '9 bar' etiketi.",
    "compare": "Yatay çubuk grafik: Fransız presi 240 sn, espresso 30 sn; sonda '8 kat daha hızlı'.",
    "outro": "Dolu fincan, buhar, 'Takip et' düğmesi.",
}
if PART2:
    VISUAL = {
        "hook": "Parlayan kehribar damla düşer; çarpınca halkalar yayılır, nokta ızgarası radyal olarak yanar, dönen HUD halkası ve '2.0', veri çipleri yayla patlar.",
        "ey": "Cam panelde 220 partikül; lazer soldan sağa tarar, tam %20'si (44 adet) kehribar parlar. EY sayacı %20'ye akar; %18-22 ideal aralık çubuğunda imleç.",
        "formula": "Kelimelerle senkron cam kartlar: TDS %10 × 36 g ÷ 18 g = %20 (yeşil parlayan sonuç kartı).",
        "pressure": "Neon grafik: önce kesikli 'klasik pompa · sabit 9 bar', sonra parlayan uçlu örnek profil eğrisi (ıslatma ~2 bar → zirve 9 bar → ~6 bara düşüş), canlı bar/sn göstergesi.",
        "wdt": "Kesitte dağınık telve; su kanala yığılır ('kanal'). WDT iğneleri geçer, partiküller yayla ızgaraya oturur; eşit akış çizgileri.",
        "outro": "Veri çipleri merkeze çekilir (implosion), vektör fincan yayla girer; buhar yerine yükselen sayılar; '+ Takip et'.",
    }


def ts(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# ---- SRT
lines, n = [], 1
for sc in tm["scenes"]:
    ws, chs = sc["words"], sc["chunks"]
    for k, ch in enumerate(chs):
        first, last = ws[ch["w"][0]], ws[ch["w"][-1]]
        s = sc["start"] + first["s"]
        nxt = sc["start"] + ws[chs[k + 1]["w"][0]]["s"] if k + 1 < len(chs) else sc["start"] + sc["dur"]
        e = min(nxt - 0.04, sc["start"] + last["e"] + 0.35)
        text = " ".join(ws[i]["t"] for i in ch["w"])
        lines += [str(n), f"{ts(s)} --> {ts(e)}", text, ""]
        n += 1
(DEST / SRT_NAME).write_text("\n".join(lines), encoding="utf-8")

# ---- senaryo.md
est = tm["source"] == "estimate"
md = ["# Espresso Part 2 — Modern Çağ (Senaryo)" if PART2 else "# Espresso'nun Tarihi — TikTok Senaryosu", ""]
md.append(f"Toplam süre: **{tm['total']:.1f} sn** · 1080×1920 · 30 fps · "
          f"seslendirme: {'tahmini zamanlama (TTS henüz çalıştırılmadı)' if est else tm['voice'] + ', hız ' + tm['rate']}")
md += ["", "Konuşma metninde `[ekran|okunuş]` gösterimi: altyazıda ilk, seslendirmede ikinci biçim kullanılır "
       "(örn. *crema* altyazıda yazılır, Türkçe sese *krema* okutulur).", ""]
md += ["| # | Sahne | Süre | Başlangıç |", "|---|---|---|---|"]
for i, sc in enumerate(tm["scenes"], 1):
    md.append(f"| {i} | {sc['id']} | {sc['dur']:.1f} sn | {sc['start']:.1f} sn |")
md.append("")
for i, (meta, sc) in enumerate(zip(script["scenes"], tm["scenes"]), 1):
    md += [f"## Sahne {i} — {meta['kicker']}  ({sc['start']:.1f}–{sc['start'] + sc['dur']:.1f} sn)", ""]
    md.append(f"- **Seslendirme:** {meta['speech']}")
    screen = " / ".join(meta["headline"])
    if "year" in meta:
        yrs = str(meta["year"]) + (f" → {meta['year2']}" if "year2" in meta else "")
        screen = f"{yrs} · {screen}"
    md.append(f"- **Ekran metni:** {meta['kicker']} · {screen}")
    md.append(f"- **Görsel:** {VISUAL[meta['id']]}")
    md.append("")
md += [] if PART2 else ["## Bilerek videoya konmayanlar", "",
       "- *Bezzera'nın makineyi fabrika işçileri için hızlandırmak amacıyla icat ettiği* anlatısı: güvenilir kaynakta doğrulanamadı.",
       "- *Moriondo'nun makinesi ilk espresso makinesidir* iddiası: tartışmalı (toplu demleyiciydi); bu yüzden yalnızca 'toplu kahve makinesi patenti' denir.",
       "- Pavoni'nin Bezzera patentini **satın aldığı yıl**: kaynaklara göre 1902/1903/1905 arasında değişiyor; yalnızca '1905'te ticari satış' kullanıldı.",
       "- 'Espresso'nun *hızlı/ekspres* anlamından geldiği iddiası: tartışmalı. Kelime 'sıkılarak çıkarılmış' anlamına gelir (açıklamada yer alır).", ""]
(DEST / "senaryo.md").write_text("\n".join(md), encoding="utf-8")
print("yazıldı:", DEST, "—", n - 1, "altyazı satırı")
