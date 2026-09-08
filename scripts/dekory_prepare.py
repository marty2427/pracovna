#!/usr/bin/env python3
"""
Připraví obrázky dekorů pro konfigurátor.

  python3 scripts/dekory_prepare.py                # research/dekory-raw -> app/public/dekory

Vstup: research/dekory-raw/*.jpg|png|tif s kódem dekoru v názvu (H3157), volitelně
research/dekory-raw/rozmery.json s rozměry v mm a příznakem bezešvosti.
Výstup: app/public/dekory/<KOD>.jpg (max 2048 px, pro 3D), <KOD>_m.jpg (1024 px, pro vzorník
a jednosouborový náhled) a manifest.json.
"""
import json, re, sys
from pathlib import Path
from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # skeny tabule mají desítky Mpx

KOREN = Path(__file__).resolve().parent.parent
RAW = KOREN / 'research' / 'dekory-raw'
OUT = KOREN / 'app' / 'public' / 'dekory'
OUT.mkdir(parents=True, exist_ok=True)

rozmery = {}
rj = RAW / 'rozmery.json'
if rj.exists():
    rozmery = json.loads(rj.read_text(encoding='utf-8'))

manifest = {}
for f in sorted(RAW.iterdir()):
    if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'):
        continue
    m = re.search(r'(H\d{3,4})', f.name.upper())
    if not m:
        print(f'  ? {f.name}: v názvu není kód dekoru, přeskakuji')
        continue
    kod = m.group(1)
    im = Image.open(f)
    im = im.convert('RGB')
    r = rozmery.get(kod, {})
    # Kresba (léta) v konfigurátoru běží podél šířky obrázku. Skeny Egger jsou
    # tabule na výšku s léty svisle, proto se otáčí naležato a prohodí se i mm.
    letaSvisle = bool(r.get('letaSvisle', im.size[1] > im.size[0]))
    if letaSvisle:
        im = im.transpose(Image.ROTATE_90)
        if 'sirkaMm' in r and 'vyskaMm' in r:
            r = {**r, 'sirkaMm': r['vyskaMm'], 'vyskaMm': r['sirkaMm']}
    w, h = im.size
    # velká verze pro 3D
    s = 2048 / max(w, h)
    velka = im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
    velka.save(OUT / f'{kod}.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
    # menší pro vzorník a artifact
    s2 = 1024 / max(w, h)
    mala = im.resize((round(w * s2), round(h * s2)), Image.LANCZOS) if s2 < 1 else im
    mala.save(OUT / f'{kod}_m.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
    # Bez údaje o rozměru se počítá s celou tabulí Egger 2800 × 2070 mm (sken desky).
    manifest[kod] = {
        'soubor': f'{kod}.jpg',
        'nahledSoubor': f'{kod}_m.jpg',
        'sirkaMm': int(r.get('sirkaMm') or 2800),
        'vyskaMm': int(r.get('vyskaMm') or 2070),
        'bezesvy': bool(r.get('bezesvy', False)),
        'zdroj': r.get('zdroj', f.name),
    }
    print(f'  {kod}: {w}x{h}{" (otočeno naležato)" if letaSvisle else ""} -> {velka.size[0]}x{velka.size[1]} / {mala.size[0]}x{mala.size[1]}  ({manifest[kod]["sirkaMm"]}x{manifest[kod]["vyskaMm"]} mm)')

(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'manifest: {len(manifest)} dekorů -> {OUT / "manifest.json"}')
if not manifest:
    sys.exit('V research/dekory-raw nic není.')
