#!/usr/bin/env python3
"""
Navzorkuje SKUTEČNÉ barvy pixelů z fotky místnosti a zapíše palette.json.

  python3 scripts/sample_palette.py [--image photo.png] [--overlay] [--sheet]

Nic neodhaduje. Tři způsoby vzorkování, všechny nad skutečnými pixely:

  1) FLAT   — v zadané oblasti najde nejhomogennější plošku (nejnižší směrodatná
              odchylka barvy) a vezme její medián. Tím se sám vyhne hranám,
              spárám a předmětům ležícím na povrchu, takže výsledek je barva
              materiálu, ne náhodného pixelu.
  2) EXTREME— medián nejtmavších / nejsvětlejších N % pixelů oblasti.
              Používá se tam, kde je cíl malý a tmavý (černý rám obrazu).
  3) KMEANS — rozloží oblast na k dominantních barev (barevný obraz, koberec).

K tomu tonální rozsah oblastí (p10/p50/p90) pro generování textur dřeva
a k-means dominantních barev celého snímku.

Závislosti: Pillow, numpy   (pip install Pillow numpy)
"""
import argparse, json, colorsys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

# Souřadnice jsou v pixelech referenční fotky; skript je přepočítá na jinou velikost.
REF_W, REF_H = 1448, 1086

# --- FLAT: (jméno, role, x0, y0, x1, y1, poloměr plošky) ------------------------
FLAT = [
    ("podlaha_slunce",     "podlaha",  200,  920,  400, 1010, 10),
    ("podlaha_stred",      "podlaha",  560,  960,  760, 1060, 10),
    ("podlaha_stin",       "podlaha",  300,  850,  420,  900,  7),
    ("podlaha_vpravo",     "podlaha", 1000, 1020, 1300, 1080,  8),

    ("stena_zadni_svetla", "stena",   1100,  180, 1250,  260, 12),
    ("stena_zadni_stred",  "stena",    480,  260,  620,  340, 12),
    ("stena_leva_stin",    "stena",    195,  220,  260,  300, 10),
    ("stena_leva_dole",    "stena",     30,  480,   80,  560,  8),
    ("strop",              "strop",    600,   40,  800,   90, 10),

    ("gauc_svetlo",        "gauc",     860,  480, 1010,  530,  8, "light"),
    ("gauc_stred",         "gauc",     760,  590,  900,  640,  8),
    ("gauc_stin",          "gauc",     700,  628,  830,  652,  6),
    ("gauc_chaise",        "gauc",    1250,  600, 1350,  650,  8),
    ("gauc_oprerka",       "gauc",     980,  480, 1050,  515,  6),

    ("dub_deska",          "dub",      185,  552,  278,  582,  6, "light"),
    ("dub_bocnice",        "dub",      140,  660,  240,  760, 12),
    ("dub_kontejner",      "dub",      525,  585,  600,  620,  8),
    ("dub_konferencak",    "dub",     1090,  668, 1180,  695,  6),

    ("cerna_zidle",        "kov",      380,  570,  430,  620,  6),
    ("cerna_monitor",      "kov",      300,  430,  400,  480, 10),
    ("chrom_lampa",        "kov",     1182,  382, 1192,  420,  2),

    ("koberec_krem",       "textil",   660,  830,  760,  880, 10),
    ("koberec_seda",       "textil",  1180,  800, 1290,  860, 10),
    ("koberec_zluta",      "textil",   760,  720,  830,  750,  6),
    ("koberec_tmava",      "textil",   808,  776,  892,  826,  7, "light"),
    ("zavesy_krem",        "textil",  1268,  200, 1332,  340, 10, "light"),
    ("deka_krem",          "textil",  1095,  565, 1200,  630,  8, "light"),
    ("polstar_bezovy",     "textil",   720,  530,  790,  580,  8),
]

# --- EXTREME: (jméno, role, x0, y0, x1, y1, 'dark'|'light', podíl) -------------
EXTREME = [
    ("cerna_ram_fotky",  "kov",  630, 250, 1070, 415, "dark", 0.01),
    ("bila_pasparta",    "kov",  650, 270, 1060, 400, "light", 0.05),
]

# --- KMEANS: (jméno, role, x0, y0, x1, y1, k) ---------------------------------
KMEANS_REGIONS = [
    ("obraz", "akcent", 96, 232, 168, 424, 5),
]

# --- tonální rozsah oblastí (p10 / p50 / p90 podle jasu) ----------------------
REGIONS = [
    ("podlaha_vlysy", "podlaha", 150,  900,  600, 1080),
    ("podlaha_celek", "podlaha", 120,  700, 1420, 1080),
    ("gauc_celek",    "gauc",    760,  555, 1045,  645),
    ("stena_celek",   "stena",   400,  150, 1100,  380),
    ("dub_nabytek",   "dub",     500,  558,  608,  700),
    ("koberec_celek", "textil",  620,  720, 1300,  900),
]


def to_hex(rgb):
    return "#{:02X}{:02X}{:02X}".format(*(int(round(max(0, min(255, c)))) for c in rgb))


def srgb_to_linear(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def rgb_to_lab(rgb):
    rgb = np.asarray(rgb, dtype=float).reshape(-1, 3)
    m = np.array([[0.4124564, 0.3575761, 0.1804375],
                  [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]])
    xyz = srgb_to_linear(rgb) @ m.T / np.array([0.95047, 1.0, 1.08883])
    eps, kappa = 216 / 24389, 24389 / 27
    f = np.where(xyz > eps, np.cbrt(xyz), (kappa * xyz + 16) / 116)
    return np.stack([116 * f[:, 1] - 16,
                     500 * (f[:, 0] - f[:, 1]),
                     200 * (f[:, 1] - f[:, 2])], axis=1)


def hsl(rgb):
    r, g, b = [c / 255.0 for c in rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return {"h": round(h * 360, 1), "s": round(s * 100, 1), "l": round(l * 100, 1)}


def entry(name, role, rgb, extra=None):
    rgb = [int(round(float(c))) for c in rgb]
    d = {"name": name, "role": role, "hex": to_hex(rgb), "rgb": rgb,
         "lab": [round(float(v), 2) for v in rgb_to_lab(rgb)[0]], "hsl": hsl(rgb)}
    if extra:
        d.update(extra)
    return d


def kmeans(data, k, iters=40, seed=7):
    rng = np.random.default_rng(seed)
    centers = [data[rng.integers(len(data))]]
    for _ in range(k - 1):
        d = np.min(((data[:, None, :] - np.array(centers)[None, :, :]) ** 2).sum(2), axis=1)
        s = d.sum()
        centers.append(data[rng.choice(len(data), p=(d / s) if s > 0 else None)])
    centers = np.array(centers, dtype=float)
    labels = np.zeros(len(data), dtype=int)
    for _ in range(iters):
        new = ((data[:, None, :] - centers[None, :, :]) ** 2).sum(2).argmin(1)
        if (new == labels).all():
            break
        labels = new
        for i in range(k):
            sel = data[labels == i]
            if len(sel):
                centers[i] = sel.mean(0)
    return centers, labels


def flattest_patch(arr, box, r, stride=None, prefer=None):
    """Najde v oblasti plošku s nejnižší barevnou odchylkou -> barva materiálu.

    prefer='light'/'dark': ze všech plošek, které jsou skoro stejně homogenní
    (do 1.6x nejlepšího skóre), vybere tu nejsvětlejší/nejtmavší. Tím se vzorek
    netrefí do stínu nebo záhybu, ale do vlastní barvy povrchu.
    """
    x0, y0, x1, y1 = box
    stride = stride or max(2, r)
    cands = []
    for cy in range(y0 + r, y1 - r + 1, stride):
        for cx in range(x0 + r, x1 - r + 1, stride):
            blk = arr[cy - r:cy + r + 1, cx - r:cx + r + 1].reshape(-1, 3).astype(float)
            med = np.median(blk, axis=0)
            cands.append((float(blk.std(axis=0).mean()), cx, cy, med,
                          float(med @ np.array([0.2126, 0.7152, 0.0722]))))
    if not cands:
        return None
    best = min(c[0] for c in cands)
    if prefer:
        pool = [c for c in cands if c[0] <= best * 1.6 + 0.5]
        pick = max(pool, key=lambda c: c[4]) if prefer == "light" else min(pool, key=lambda c: c[4])
    else:
        pick = min(cands, key=lambda c: c[0])
    return pick[:4]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", default="photo.png")
    ap.add_argument("--out", default="palette.json")
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--sheet", action="store_true", help="kontaktní list výřezů")
    ap.add_argument("--clusters", type=int, default=14)
    args = ap.parse_args()

    img_path = ROOT / args.image
    if not img_path.exists():
        raise SystemExit(f"Fotka nenalezena: {img_path}")

    im = Image.open(img_path).convert("RGB")
    W, H = im.size
    arr = np.asarray(im, dtype=np.uint8)
    sx, sy = W / REF_W, H / REF_H

    def scale(b):
        return (int(round(b[0] * sx)), int(round(b[1] * sy)),
                int(round(b[2] * sx)), int(round(b[3] * sy)))

    samples = []

    # 1) FLAT
    for item in FLAT:
        name, role, x0, y0, x1, y1, r = item[:7]
        prefer = item[7] if len(item) > 7 else None
        box = scale((x0, y0, x1, y1))
        rr = max(1, int(round(r * min(sx, sy))))
        score, cx, cy, med = flattest_patch(arr, box, rr, prefer=prefer)
        samples.append(entry(name, role, med, {
            "method": "flat", "x": cx, "y": cy, "patch": rr,
            "u": round(cx / W, 5), "v": round(cy / H, 5),
            "search_box": list(box), "variance": round(score, 2),
            "prefer": prefer,
        }))

    # 2) EXTREME
    for name, role, x0, y0, x1, y1, which, frac in EXTREME:
        bx0, by0, bx1, by1 = scale((x0, y0, x1, y1))
        blk = arr[by0:by1, bx0:bx1].reshape(-1, 3).astype(float)
        lum = blk @ np.array([0.2126, 0.7152, 0.0722])
        idx = np.argsort(lum)
        n = max(1, int(frac * len(idx)))
        sel = blk[idx[:n]] if which == "dark" else blk[idx[-n:]]
        samples.append(entry(name, role, np.median(sel, axis=0), {
            "method": f"extreme:{which}", "fraction": frac,
            "search_box": [bx0, by0, bx1, by1], "pixels": int(n),
        }))

    # 3) KMEANS oblastí
    for name, role, x0, y0, x1, y1, k in KMEANS_REGIONS:
        bx0, by0, bx1, by1 = scale((x0, y0, x1, y1))
        blk = arr[by0:by1, bx0:bx1].reshape(-1, 3).astype(float)
        centers, labels = kmeans(blk, k)
        counts = np.bincount(labels, minlength=k)
        for i in np.argsort(-counts):
            samples.append(entry(f"{name}_{i+1}", role, centers[i], {
                "method": "kmeans", "share": round(float(counts[i] / counts.sum()), 4),
                "search_box": [bx0, by0, bx1, by1],
            }))

    # tonální rozsah oblastí
    regions = []
    for name, role, x0, y0, x1, y1 in REGIONS:
        bx0, by0, bx1, by1 = scale((x0, y0, x1, y1))
        blk = arr[by0:by1, bx0:bx1].reshape(-1, 3).astype(float)
        lum = blk @ np.array([0.2126, 0.7152, 0.0722])
        idx = np.argsort(lum)

        def band(q, w=0.02):
            lo, hi = max(0, int((q - w) * len(idx))), min(len(idx), int((q + w) * len(idx)))
            return np.median(blk[idx[lo:hi]], axis=0)

        regions.append({
            "name": name, "role": role, "box": [bx0, by0, bx1, by1],
            "dark": to_hex(band(0.10)), "base": to_hex(band(0.50)),
            "light": to_hex(band(0.90)), "mean": to_hex(blk.mean(0)),
            "contrast": round(float((band(0.90) - band(0.10)).mean()), 1),
        })

    # dominantní barvy celého snímku
    small = im.resize((240, max(1, int(240 * H / W))), Image.LANCZOS)
    data = np.asarray(small, dtype=float).reshape(-1, 3)
    centers, labels = kmeans(data, args.clusters)
    counts = np.bincount(labels, minlength=args.clusters)
    clusters = [entry(f"cluster_{i}", "dominant", centers[i],
                      {"share": round(float(counts[i] / counts.sum()), 4)})
                for i in np.argsort(-counts)]

    out = {
        "meta": {
            "source": "sampled",
            "image": args.image,
            "image_size": [W, H],
            "methods": {
                "flat": "medián nejhomogennější plošky v oblasti (vyhne se hranám a předmětům)",
                "extreme": "medián nejtmavších/nejsvětlejších N % pixelů oblasti",
                "kmeans": "dominantní barvy oblasti",
            },
            "script": "scripts/sample_palette.py",
        },
        "samples": samples,
        "regions": regions,
        "clusters": clusters,
    }

    out_path = ROOT / args.out
    if out_path.exists():
        try:
            prev = json.loads(out_path.read_text(encoding="utf-8"))
            if "directions" in prev:
                out["directions"] = prev["directions"]
        except Exception:
            pass
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Zapsáno {out_path}  ({len(samples)} vzorků, {len(regions)} oblastí, {len(clusters)} shluků)")

    located = [s for s in samples if "x" in s]

    if args.overlay:
        ov = im.copy()
        d = ImageDraw.Draw(ov)
        for item in FLAT:
            d.rectangle(scale(item[2:6]), outline=(0, 255, 255), width=1)
        for s in located:
            x, y, r = s["x"], s["y"], s["patch"]
            d.rectangle([x - r, y - r, x + r, y + r], outline=(255, 0, 255), width=3)
            d.rectangle([x + r + 4, y - 13, x + r + 40, y + 13], fill=tuple(s["rgb"]),
                        outline=(0, 0, 0), width=2)
            d.text((x + r + 46, y - 6), s["name"], fill=(255, 0, 255))
        ov.save(ROOT / "scripts" / "_palette_overlay.png")
        print("Kontrolní obrázek: scripts/_palette_overlay.png")

    if args.sheet:
        T, Z, COLS = 96, 2, 6
        CW, CH = T * Z, T * Z + 34
        rows = (len(located) + COLS - 1) // COLS
        sheet = Image.new("RGB", (COLS * CW, rows * CH), (24, 24, 28))
        sd = ImageDraw.Draw(sheet)
        for i, s in enumerate(located):
            x0, y0 = s["x"] - T // 2, s["y"] - T // 2
            crop = im.crop((x0, y0, x0 + T, y0 + T)).resize((T * Z, T * Z), Image.NEAREST)
            cd = ImageDraw.Draw(crop)
            c, r = T * Z // 2, max(2, s["patch"]) * Z
            cd.rectangle([c - r, c - r, c + r, c + r], outline=(255, 0, 255), width=2)
            gx, gy = (i % COLS) * CW, (i // COLS) * CH
            sheet.paste(crop, (gx, gy))
            sd.rectangle([gx, gy + T * Z, gx + 40, gy + T * Z + 34], fill=tuple(s["rgb"]))
            sd.text((gx + 46, gy + T * Z + 4), s["name"], fill=(240, 240, 240))
            sd.text((gx + 46, gy + T * Z + 18),
                    f"{s['hex']}  L*{s['lab'][0]:.0f} var{s.get('variance', 0):.0f}",
                    fill=(150, 150, 160))
        sheet.save(ROOT / "scripts" / "_contact_sheet.png")
        print("Kontaktní list: scripts/_contact_sheet.png")


if __name__ == "__main__":
    main()
