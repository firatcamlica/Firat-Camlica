#!/usr/bin/env python3
"""Ahmet ve Emel seslerinden aynı kanca cümlesini üretir; karşılaştırıp script*.json'daki "voice" alanını seçin."""
import asyncio, sys
from pathlib import Path
import edge_tts

TEXT = "Espresso lüks için değil, hız için icat edildi. İtalyanlar espressoyu icat etti; bilim onu yeniden yazdı."
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "teslim/ses_ornekleri")


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for v in ("tr-TR-AhmetNeural", "tr-TR-EmelNeural"):
        await edge_tts.Communicate(TEXT, v, rate="+8%").save(str(OUT / f"{v}.mp3"))
        print("yazıldı", OUT / f"{v}.mp3")


asyncio.run(main())
