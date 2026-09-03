# Prompt pro Cowork — doověření rešerše

Tenhle soubor je připravený k **zkopírování do Coworku**. Všechno pod čarou je samotný
prompt; nad čarou je vysvětlení, proč vznikl.

## Proč to potřebuje druhé prostředí

Rešerši i konfigurátor postavil Claude Code v prostředí, kde byl **`WebFetch` blokovaný
egress politikou** — 403 na CONNECT prakticky pro každý hostitel, včetně `ikea.com`,
`jysk.cz` i vyhledávačů. Fungovalo jen fulltextové vyhledávání, které běží serverově
mimo tu proxy.

Prakticky to znamená, že se **nepodařilo otevřít jedinou produktovou stránku**. Ceny
a rozměry v `app/src/pricing/katalog.json` pochází z toho, co vrátilo vyhledávání —
je to použitelné pro rozhodování o konstrukci a řádu ceny, ale ne pro objednávku.

Stav ceníku k 3. 9. 2026:

| Sekce | Položek | Neověřených | S výhradou kontroly |
|---|---|---|---|
| desky | 38 | 6 | 6 |
| podnoze | 33 | 2 | 5 |
| **stoly** | **39** | **39** | 7 |
| **kovani** | **5** | **5** | 1 |
| sluzby | 30 | 13 | 4 |

Sekce `stoly` a `kovani` jsou neověřené celé — u nich má doověření největší přínos.

Třetí kolo rešerše (105 dotazů) mezitím doplnilo sit-stand rámy a pevné podnože
a jeho kritická vrstva zamítla několik čísel jako nepoužitelných do kalkulačky:
akční ceny vydávané za běžné, doporučenou MOC zaměněnou s prodejní cenou, průměr
ze dvou rozporných hodnot a u Liftoru tři různá čísla na dvou produktech.
Detaily jsou v `research/trh.md`, sekce „Třetí kolo rešerše".

---

## PROMPT (odsud kopíruj)

Mám rozdělaný projekt pracovního stolu na míru do rohu obývacího pokoje. Konfigurátor
i rešerše jsou hotové, ale vznikly v prostředí bez přístupu na webové stránky, takže
ceny a kontakty jsou neověřené. Potřebuju je doověřit proti živým stránkám.

### Repozitář

`https://github.com/marty2427/pracovna`, větev `claude/desk-configurator-living-room-a9vnnp`

Relevantní soubory:

- `app/src/pricing/katalog.json` — ceník, který pohání kalkulačku v appce (to je hlavní cíl)
- `research/trh.md` — rešerše trhu, ze které ceník vznikl
- `research/vyrobci.md` — truhláři v Brně a okolí
- `research/_kontrola_ceniku.json` — výhrady kontrolní vrstvy k jednotlivým položkám
- `README.md` — popis projektu

### Projekt v jedné tabulce

| Prvek | Hodnota |
|---|---|
| Umístění | roh obývacího pokoje, byt v Brně |
| Tvar | L deska |
| Rameno A (podél levé stěny) | max **211 cm**, hloubka 55–80 cm |
| Rameno B (podél zadní stěny) | max **148 cm** (160 cm ke gauči − 12 cm mezera), hloubka 45–70 cm |
| Výška | pevná, 75 cm — polohovací není priorita |
| Rozpočet | **5–20 tis. Kč** |
| Funkce | tiskárna v rohu L, zásuvky pod ramenem B |

### Co po tobě chci

Priority jsou seřazené. Když ti dojde čas nebo limity, dodělej priority 1 a 2
a u zbytku napiš, co zbývá — nedokončenou práci prosím přiznej, nedomýšlej ji.

**Priorita 1 — ověřit ceník, který pohání kalkulačku.**

Otevři produktové stránky a ověř cenu, rozměry a dostupnost. Začni těmito položkami,
protože je kalkulačka reálně používá pro rameno A dlouhé 211 cm:

| id v katalogu | co ověřit |
|---|---|
| `ikea-karlby-dub-246` | KARLBY dub dýha 246×63,5×3,8 cm, uvedeno 4 490 Kč |
| `ikea-mollekulla-dub-246` | MÖLLEKULLA dub 246 cm, uvedeno 5 940 Kč — **cena je odhad, ověř ji** |
| `ikea-skogsa-dub-246` | SKOGSÅ dub 246 cm, uvedeno 7 490 Kč |
| `ikea-karlby-orech-246` | KARLBY ořech 246 cm, uvedeno 6 990 Kč |
| `bauhaus-exclusivholz-dub-2200x600x18` | spárovka dub 220×60×1,8 cm, uvedeno 1 990 Kč |
| `hornbach-kuchynska-deska-dub-zlaty-4100` | pracovní deska dub zlatý 38 mm, uvedeno 3 795 Kč |
| `centrum-dreva-dub-2500x630x40` | spárovka dub 250×63×4 cm, uvedeno 13 043 Kč — kontrola říká, že je to **2× nad srovnatelnými**, prověř to |
| `ikea-adils-noha-70`, `ikea-olov-noha-nastavitelna`, `ikea-alex-*` | IKEA nohy a zásuvková jednotka — kontrola upozorňuje, že celý blok má **podezřele zaokrouhlené ceny** |
| `walteco-hairpin-710-3r-cerna` | hairpin noha 710 mm, uvedeno 459 Kč/ks — jiná položka uvádí 190 Kč/ks, jedno z toho je špatně |

Pak projdi **celou sekci `stoly` (39 položek) a `kovani` (5 položek)** — obě jsou
neověřené kompletně. U `stoly` mě zajímají hlavně ty, které se vejdou do 211 cm.

**Formát výstupu:** patch pro `app/src/pricing/katalog.json`. Struktura položky je:

```json
{
  "id": "ikea-karlby-dub-246",
  "nazev": "KARLBY pracovní deska, dub dýha",
  "prodejce": "IKEA",
  "popis": "…",
  "delka": 2460, "sirka": 635, "tloustka": 38,
  "cena": 4490,
  "jednotka": "ks",
  "url": "https://www.ikea.com/cz/cs/p/…",
  "overeno": true,
  "poznamka": "…"
}
```

Rozměry v mm, ceny v Kč včetně DPH, `overeno: true` **jen** když jsi cenu opravdu
viděl na stránce prodejce. Položky, které už neexistují nebo se nedají koupit, označ
k vyřazení. Ke každé změně napiš, jaká byla stará hodnota a jaká je nová.

**Priorita 2 — ověřit kontakty truhlářů.**

V `research/vyrobci.md` je 36 firem z Brna a okolí s telefony a e-maily, které vrátilo
vyhledávání. **Nejsou ověřené proti webům firem.** Projdi je a u každé zkontroluj:

1. Web žije a firma existuje
2. Telefon a e-mail na webu sedí s tím, co je v dokumentu
3. Dělá stoly, nebo jen kuchyně a vestavěné skříně
4. Je někde na webu ceník nebo aspoň cenová indikace

Firmy, u kterých web nežije nebo kontakt nesedí, označ. Naopak když najdeš firmu,
která v seznamu není a evidentně dělá stoly na míru, přidej ji.

**Priorita 3 — dekory a materiály z aktuálních katalogů.**

Deska má ladit s **teplou oranžovo-hnědou vlysovou dubovou podlahou** (naměřený tón
`#83420F`, rozsah `#723608`–`#96521A`) a se světle dubovým nábytkem (`#C69160`).
Barvy jsou navzorkované ze skutečné fotky, jsou v `palette.json`.

Otevři aktuální katalogy a dohledej:

- **Egger** Decorative Collection — čísla dekorů teplých dubů, které k tomu tónu sedí,
  a jaké struktury povrchu k nim existují (ST9, ST12, ST28, ST37, Feelwood)
- **Kronospan** — totéž
- **Forbo Furniture Linoleum** — konkrétní barvy a jejich kódy, kdo to v ČR dodává
- ceny za desku 2800×2070 nebo za m² u českého dodavatele

**Priorita 4 — rozsoudit jeden konkrétní rozpor u sit-stand rámů.**

Tohle téma proběhlo ve třetím kole a je z větší části hotové. Zjistilo se, že
**u ramene 211 cm je limitem rozsah šířky rámu, ne cena** — většina dvousloupových
rámů jde jen do 160–190 cm. Zbývá jedna věc, kterou dva nezávislé průchody
rozhodly různě a kritická vrstva ji označila za nepodloženou:

- Jeden průchod tvrdí, že **Powerton rohový rám** zvládne desku 1100–2200 mm,
  ale v témže řádku uvádí „šířka rámu 1000–1700 mm" — samo si to odporuje.
- Druhý průchod Powerton jako rohové řešení vůbec nezná a tvrdí, že na 211 cm
  dosáhne prakticky **jen Liftor Expert** (110–220 cm).
- **Liftor L** (3 sloupy, desky až 290×100 cm, 16 999 Kč) je jediná ověřená sestava,
  která na 211 × 148 cm rozměrově jde. Cena ale ověřená není — u Liftoru rešerše
  narazila na **tři různá čísla na dvou produktech**.

Otevři stránky Liftoru a Powertonu a rozsuď:

1. Jaká je dnes skutečná cena **Liftor L** a **Liftor Expert**?
2. Zvládne **Powerton rohový rám** rameno 211 cm, nebo ne? Jaký je jeho skutečný
   rozsah šířky u obou ramen?
3. Kolik stojí **rohová deska na míru 211 × 148 cm** u pracuj-zdrave.cz nebo
   woooooo.cz? Odhad z rešerše je 4 000 – 8 000 Kč, což je rozptyl větší než
   celá rezerva do 20 tisíc — jedno konkrétní číslo tuhle otázku uzavře.

### Jak to vrátit

1. **Patch ceníku** — buď rovnou upravený `katalog.json`, nebo seznam změn ve tvaru
   `id | pole | stará hodnota | nová hodnota | zdroj`
2. **Doplněný `research/vyrobci.md`** se sloupcem, jestli je kontakt ověřený
3. **Krátké shrnutí** — kolik položek sedělo, kolik bylo špatně, o kolik se celkově
   posunul odhad ceny sestavy

Když můžeš, udělej to jako commit do té větve. Když ne, stačí soubory nebo text.

### Co nedělej

- **Nepřepisuj konfigurátor v `app/src/`** kromě `pricing/katalog.json` — model, geometrie
  a UI jsou hotové a ověřené průletem přes Playwright
- **Nevymýšlej ceny.** Když se cena nedá ověřit, nech `overeno: false` a napiš proč.
  Neověřená pravda je použitelnější než ověřeně vypadající výmysl
- **Neber ceny z agregátorů** (Heureka, Zboží, Favi) jako ověřené — jen jako vodítko,
  kde hledat originál
- **Nikomu nevolej ani nepiš.** Poptávku pošle uživatel sám, appka mu na to vygeneruje
  nákres i text e-mailu
