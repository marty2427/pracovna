# Konfigurátor pracovního stolu do obývacího pokoje

Parametrický 3D konfigurátor pracovního stolu do konkrétního rohu konkrétního obývacího pokoje
(fotka je v `photo.png`). Není to obecný nástroj — rozměry místa, barvy i limity jsou z tohohle bytu.

## Prostor, pro který to je

```
              ROH
               ╔════════════ ZADNÍ  STĚNA ════════════════════
               ║  ◄────────────── 160 cm ─────────────────►
               ║ ┌──────────────────────────┐  10–15 ┌────────
    ▲          ║ │   RAMENO B   ≤ 148 cm    │   cm   │  GAUČ
    │          ║ │   tiskárna v rohu        │ ◄────► │
  236 cm       ║ └────────────┬─────────────┘        └────────
  (levá        ║ │            │
   stěna)      ║ │  RAMENO A  │      ⊙ židle
    │          ║ │  ≤ 211 cm  │
    ▼          ║ └────────────┘
               ║        ▼  směrem do místnosti
```

| Prvek | Limit | Odkud |
|---|---|---|
| Rameno A (levá stěna, hlavní plocha) | ≤ **211 cm** | 236 cm běh stěny − 25 cm od hrany |
| Rameno B (zadní stěna, ke gauči) | ≤ **148 cm** | 160 cm − mezera 10–15 cm ke gauči |
| Volno na odsunutí židle | ≥ 90 cm | 160 cm − hloubka ramene A |
| Výška | 75 cm, pevná | volba zadavatele |
| Rozpočet | 5–20 tis. Kč | volba zadavatele |

Průchod se nezapočítává — kolem stolu se nikam nechodí.

## Co v repozitáři je

```
photo.png                 fotka místa (zdroj barev)
palette.json              navzorkované barvy + 7 barevných směrů
PLAN.md                   plán projektu a jeho revize
research/
  trh.md                  rešerše trhu (sériové stoly, stavebnice, materiály,
                          kování, ergonomie, statika, cenová pásma)
  vyrobci.md              truhláři v Brně a okolí — kontakty a specializace
  _raw.json, _raw2.json   tytéž rešerše strojově čitelně, po tématech;
                          z nich se generuje ceník v appce
  _kontrola_ceniku.json   výhrady kontroly k jednotlivým položkám ceníku
  PROMPT-COWORK.md        zadání pro doověření cen a kontaktů v prostředí,
                          které umí otevírat webové stránky
scripts/
  sample_palette.py       vzorkování skutečných pixelů z fotky
  screenshots.mjs         Playwright průlet appkou
app/                      Vite + React + TypeScript + react-three-fiber
```

## Spuštění

Appka je čistě klientská, takže stačí statický server. Žádný backend, žádné API klíče.

```bash
git clone https://github.com/marty2427/pracovna
cd pracovna/app
npm ci
npm run dev        # http://127.0.0.1:5173
npm run build      # -> app/dist
```

**Pozn.:** pokud tenhle repozitář vznikal v Claude Code na webu, dev server tam běžel
uvnitř izolovaného kontejneru na `127.0.0.1` — z prohlížeče se na něj nedalo dostat,
protože do kontejneru nevede příchozí síť. Odtud jen screenshoty. Živě to uvidíš
buď po spuštění lokálně podle návodu výše, nebo po nasazení na Cloudflare Pages.

## Nasazení na Cloudflare Pages

Přes Git integraci v dashboardu:

| Nastavení | Hodnota |
|---|---|
| Build command | `cd app && npm ci && npm run build` |
| Build output directory | `app/dist` |
| Root directory | `/` |
| Node version | `22` |

Nebo z příkazové řádky:

```bash
cd app && npm ci && npm run build
npx wrangler pages deploy app/dist --project-name konfigurator-stolu
```

`app/public/_redirects` řeší SPA fallback, `app/public/_headers` cachování assetů.
Appka nemá backend ani externí assety — všechny textury se generují procedurálně v prohlížeči.

## Vzorkování barev z fotky

```bash
pip install Pillow numpy
python3 scripts/sample_palette.py --overlay --sheet
```

Zapíše `palette.json` a do `scripts/` uloží dva kontrolní obrázky:

- `_palette_overlay.png` — fotka s vyznačenými hledacími oblastmi a nalezenými ploškami
- `_contact_sheet.png` — kontaktní list zvětšených výřezů se změřenou barvou u každého

Na nich se dá očima ověřit, že vzorek sedí na tom, co má — což je jediný způsob,
jak poznat, že skript nevzorkoval stín místo materiálu. Oba jsou v repozitáři
právě proto, aby to šlo zkontrolovat bez spouštění skriptu.

Ruční sekce `directions` (barevné směry) se při přepsání `palette.json` zachová.

## Screenshoty přes Playwright

```bash
npm ci                                  # v kořeni repozitáře
node scripts/screenshots.mjs            # záložky
node scripts/screenshots.mjs --presety  # projede všechny presety v galerii
```

## Poznámka k datům

Rešerše vznikla v prostředí, kde **nešlo otevírat webové stránky** (`WebFetch` blokovaný
egress politikou) — fungovalo jen fulltextové vyhledávání. Ceny a rozměry proto pochází
z výsledků vyhledávání, ne z produktových stránek. Položky, které se nepodařilo ověřit,
jsou v dokumentech i v appce označené. **Před objednáním si čísla ověř u prodejce.**

Stav ceníku: 145 položek, z toho 80 označených jako ověřené. Sekce `stoly` (39 položek)
a `kovani` (5 položek) jsou neověřené celé — u nich má doověření největší přínos.

Na doověření v prostředí, které weby otevírat umí, je připravené zadání
v `research/PROMPT-COWORK.md`.
