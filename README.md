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
  doovereni-*.md          doověření cen proti živým stránkám prodejců
  vyrobci-overeni-*.md     doověření kontaktů truhlářů proti jejich webům
  dekory-*.md              dekory Egger a Kronospan k tónu podlahy
  zmeny-ceniku-*.md        seznam změn v ceníku s odůvodněním
  _raw*.json               rešerše strojově čitelně, po tématech
  _kontrola_*.json         výhrady kontrolní vrstvy k položkám ceníku
  PROMPT-COWORK.md        zadání pro doověření (už proběhlo)
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

**Pozn. k náhledu:** pokud tenhle repozitář vznikal v Claude Code na webu, dev server
tam běžel uvnitř izolovaného kontejneru na `127.0.0.1` a z prohlížeče se na něj nedalo
dostat, protože do kontejneru nevede příchozí síť.

Appka se ale dá zabalit do jednoho HTML souboru a publikovat jako náhled:

```bash
cd app && npm run build && cd ..
node scripts/build-artifact.mjs     # -> app/dist/nahled.html
```

Jde to proto, že appka nemá backend ani externí assety — všechny textury se generují
procedurálně v prohlížeči. V náhledu nefunguje stahování souborů (sandbox to blokuje),
appka to pozná podle `window.__NAHLED__` a příslušná tlačítka vypne.

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

**Doověření proběhlo 3. 9. 2026** v prostředí, které stránky otevírat umí.
Stav ceníku: **147 položek, 91 ověřených proti živé stránce prodejce**, 21 položek
vyřazeno, protože se v nabídce už nevyskytují.

Dvě věci z doověření stojí za zmínku:

- **IKEA renderuje ceny až JavaScriptem.** Fetch produktové stránky KARLBY vracel
  4 490 Kč, vykreslená stránka 3 990 Kč. Všechny ceny IKEA jsou proto z vykreslené stránky.
- **Rohová polohovací sestava pro 211 × 148 cm na trhu není.** Liftor L uvádí desky
  až 290 cm, ale jen pro rovné uspořádání — pro roh 90° zvládne ramena do 190 cm.
  Powerton ERGO EDGE zvládne první rameno do 220 cm, druhé jen do 110 cm.
