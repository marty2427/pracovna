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
scripts/
  sample_palette.py       vzorkování skutečných pixelů z fotky
  screenshots.mjs         Playwright průlet appkou
app/                      Vite + React + TypeScript + react-three-fiber
```

## Spuštění

```bash
cd app
npm ci
npm run dev        # http://127.0.0.1:5173
npm run build      # -> app/dist
```

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

Zapíše `palette.json` a do `scripts/` uloží kontrolní obrázek s vyznačenými vzorky
a kontaktní list výřezů, na kterém se dá očima ověřit, že vzorek sedí na tom, co má.
Ruční sekce `directions` (barevné směry) se při přepsání zachová.

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
