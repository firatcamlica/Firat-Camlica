#!/usr/bin/env python3
"""SKILL.md'ye HOOK adımını ekler: araştırma adımından sonra, seslendirme adımından önce.
İşaretler (HOOK:BAŞLA/BİTİR) varsa bölüm yerinde yenilenir; yoksa seslendirme başlığının önüne eklenir.
Numaralı başlıklar ("## 4. Seslendirme") varsa HOOK o numarayı alır, sonraki aynı seviye başlıklar bir kayar.
Kullanım: insert_hook.py <SKILL.md> <HOOK.md>"""
import re
import shutil
import sys
from pathlib import Path

skill, section = Path(sys.argv[1]), Path(sys.argv[2]).read_text()
text = skill.read_text()
START, END = '<!-- HOOK:BAŞLA', '<!-- HOOK:BİTİR -->'

if START in text:
    a = text.index(START)
    b = text.index(END, a) + len(END)
    old = text[a:b]
    level = re.search(r'^(#+) ', old, re.M).group(1)
    heading = re.search(r'^#+ (.*)$', old, re.M).group(1)
    new = re.sub(r'^## HOOK$', f'{level} {heading}', section.strip(), count=1, flags=re.M)
    out = text[:a] + new + text[b:]
    action = 'yenilendi'
else:
    heads = [(m.start(), m.group(1), m.group(2)) for m in re.finditer(r'^(#{1,4}) (.+)$', text, re.M)]
    voice = next((h for h in heads if re.search(r'seslendirme', h[2], re.I)), None)
    if not voice:
        sys.exit('HATA: "Seslendirme" başlığı bulunamadı; HOOK bölümünü elle, araştırma ile seslendirme arasına ekleyin.')
    research = [h for h in heads if h[0] < voice[0] and re.search(r'araştırma', h[2], re.I)]
    if not research:
        print('UYARI: seslendirmeden önce "Araştırma" başlığı bulunamadı; HOOK seslendirmenin hemen önüne eklendi.')
    pos, level, title = voice
    num = re.match(r'(\d+)([.)])\s+', title)
    heading = f'{num.group(1)}{num.group(2)} HOOK' if num else 'HOOK'
    block = re.sub(r'^## HOOK$', f'{level} {heading}', section.strip(), count=1, flags=re.M) + '\n\n'
    rest = text[pos:]
    if num:
        def bump(m):
            return f'{m.group(1)} {int(m.group(2)) + 1}{m.group(3)} '
        rest = re.sub(rf'^({re.escape(level)}) (\d+)([.)]) ', bump, rest, flags=re.M)
    out = text[:pos] + block + rest
    action = f'eklendi ("{level} {heading}", "{title}" başlığından önce)'

if out != text:
    shutil.copy2(skill, skill.with_suffix('.md.bak'))
    skill.write_text(out)
print(f'HOOK bölümü {action}: {skill}')
