# Doověření cen a kontaktů proti živým stránkám — 3. 9. 2026

Tenhle soubor je záznam doověřovacího kola. Ceník `app/src/pricing/katalog.json` je podle něj
upravený; tady je zdůvodnění a to, co se do ceníku nevešlo.

## Metoda a její meze

- **IKEA se ověřovala výhradně ve vykresleném prohlížeči, ne fetchem.** Důvod: fetch produktové
  stránky KARLBY dub 246 vrátil 4 490 Kč, zatímco vykreslená stránka i výpis kategorie shodně
  3 990 Kč. IKEA renderuje ceny až JavaScriptem a fetch u ní vrací zastaralá data. Všechny ceny
  IKEA v ceníku jsou proto z vykreslené stránky.
- U ostatních prodejců platilo pravidlo **dvou nezávislých signálů na doméně prodejce**
  (produktová stránka + výpis kategorie / vyhledávání na téže doméně). Kde byl jen jeden signál,
  zůstává `overeno: false` a je to v poznámce napsané.
- **Žádná cena nepochází z agregátoru.** Heureka, Zboží.cz ani Favi nebyly použity jako ověření,
  jen výjimečně jako vodítko, kde hledat originál.
- Ceny jsou v Kč **včetně DPH**. Kde prodejce uvádí primárně cenu bez DPH (Centrum dřeva,
  Pracuj zdravě, Woooooo, velkoobchody plošných materiálů), je to v poznámce uvedeno.
- **Nikomu nebylo voláno ani psáno.** Žádný e-mail, žádný poptávkový formulář.

## Co zůstalo neověřené a proč

| Oblast | Proč |
|---|---|
| ASKO (5 položek) | asko-nabytek.cz renderuje ceny až JS; přes fetch v HTML nejsou. URL jsou platné, ceny nepotvrzené ani nevyvrácené. |
| Dřevoobchod K&C spárovka 40 mm | Produktové stránky vracejí jen navigaci, kategorie 404. |
| OBI hairpin 180×710 | Produktová stránka opakovaně 404, v kategorii nábytkových noh se nezobrazuje. Ostatní stránky OBI se načetly, takže nejde o plošné blokování. |
| ZLKL pevná podnož 755 mm | Produktová stránka 404; v kategorii je jen konferenční podnož 720 mm za jinou cenu. |
| DŘEVO TRUST LEVEL černá | Černá varianta z katalogu zmizela (404); šedá ověřena na 1 900,31 Kč, ale 0 ks skladem. |
| Walteco sady 4 ks (černá i bílá) | Dva signály na téže doméně se rozcházejí přesně o 124 Kč (produkt 1 535 / 1 695, kategorie 1 659 / 1 819). Neoznačeno za ověřené. Ceny za KUS se naopak shodují. |
| Bonami Sign 120×60 | Výpis vrací pro tutéž variantu při různých načteních čtyři různé ceny (3 561 / 3 582 / 3 709 / 4 674). |
| Frézovaný otvor, kabelový žlab | Truhlářská a zámečnická práce na zakázku — nemá veřejnou katalogovou cenu. Cenu dá až poptávka, kterou jsem podle zadání neposílal. |
| Rohová deska 211×148 na míru | Viz priorita 4 níže — konkrétní cena pro tento rozměr veřejně není. |
| Česká cena Forbo Desktop | Žádný z českých dodavatelů ji nezveřejňuje. |

---

## Priorita 1 — ceník

### Rozsouzené výhrady kontrolní vrstvy

**„Blok IKEA podnoží má podezřele zaokrouhlené ceny" — VYVRÁCENO.**
Celá kategorie „Nohy a podstavce" (10 položek) ověřena na vykreslené stránce. Ceny jsou
skutečně kulaté: ADILS 100, SPÄND noha 200, KRILLE 400, HILVER 500, SPÄND podnoží 500,
OLOV 250, MITTBACK 1 000, INLÄGG 200/2 ks. IKEA prostě má kulaté ceny.
Podezření bylo liché — ale v témže bloku se našly tři položky, které v nabídce vůbec nejsou
(TILLSLAG, NÄRSPEL, LERBERG), takže kontrola měla pravdu, že tam něco nesedí. Jen jinak.

**Centrum dřeva 13 043 Kč, „2× nad srovnatelnými" — CENA JE SPRÁVNÁ.**
Produktová stránka i kategorie shodně 13 042,59 Kč/ks (10 779 bez DPH). Vyšší cenu vysvětluje
kvalita: prodejce uvádí **„průběžná lamela"** (bez cinkových spojů) a **„kvalita A/B"**. To je
jiný produkt než cinkované spárovky, se kterými ji kontrola srovnávala. Varování zrušeno,
zdůvodnění doplněno do poznámky. Háček je jinde: položka je „Na dotaz", není běžně skladem.

**Hairpin nohy 459 vs. 190 Kč/ks — obě strany sporu byly špatně.**
Walteco není 459 Kč, ale **455 Kč/ks** (dva shodné signály). U Melga bylo mylné samo varování:
jednotka „sada 4 ks" je správná, Melgo sady čtyř noh za 790–960 Kč skutečně prodává. Chybná je
**výška** — 711 mm Melgo vůbec nevede, jejich sortiment jsou palcové řady 40,6 / 50,8 / 55,9 /
76,2 / 86,4 / 91,4 cm. Cenu 760 Kč tedy nelze přiřadit žádnému reálnému produktu.

**Onpira rozpor rozměrů — rozpor neexistuje.** Číslo 75 je průměr sloupu Ø 7,5 cm, ne jekl.

**In-duro „nekonzistentní jednotka" — vyřešeno.** In-duro prodává všechno po kusech, ne po
párech. Navíc: In-duro a LooMAH mají identický katalog i ceník, nejsou to dva nezávislí dodavatelé.

### Co z ceníku vypadlo

Z českého sortimentu IKEA zmizelo víc, než rešerše tušila. Kategorie „Dřevěné pracovní desky"
má dnes **jen 4 položky**: KARLBY dub, KARLBY ořech, HOLMARED bambus, PINNARP ořech.

- **MÖLLEKULLA a SKOGSÅ v pevných rozměrech (186 i 246 cm) už neexistují.** Všechny čtyři
  položky přesměrovávají na kategorii. Tím padá i odhad 5 940 Kč za MÖLLEKULLA 246 — takový
  kus se koupit nedá. MÖLLEKULLA přežívá jen jako deska na míru za 4 400 Kč/m.
- Dál vypadly: EKBACKEN vápenec 186, LINNMON 200×60 i 150×75, MÅLSKYTT 140×60,
  MITTCIRKEL 140×60, TILLSLAG podnoží, NÄRSPEL podnoží, LERBERG (vyhledávání na ikea.cz
  vrací pro „LERBERG" 0 výrobků), MALM 140×65 černohnědá, ALEX 132×58 šedotyrkysová.
- Mimo IKEA: **celý e-shop misterweld.cz je pozastavený** (2 položky), AlzaErgo TTE-01 bambus
  „Prodej skončil", Ultradesk Frag XXL „Prodej skončil", XXXLutz Venda rohový dub San Remo 404.
- Pravděpodobně vyřazené, ale bez jistoty: JYSK KALBY a STAVANGER (URL padají na kategorii).

### Co se do ceníku naopak přidalo

- **IKEA desky na míru.** KARLBY dub 4 000 Kč/m, MÖLLEKULLA dub a KARLBY ořech 4 400 Kč/m,
  hloubková pásma 30–45 / 45,1–63,5 / 63,6–125 cm. Pro rameno A 211 cm to znamená, že se
  nemusí nic zkracovat ani olepovat řezaná hrana — deska přijde na míru. Stojí to ale zhruba
  dvojnásobek: 2,11 m × 4 000 = 8 440 Kč proti 3 990 Kč za pevnou desku 246 cm.
- **IKEA INLÄGG spojovací kování, 200 Kč/2 ks.** Přímo řeší spoj ramene A a ramene B, když se
  L skládá ze dvou desek. V ceníku to dosud vůbec nebylo.
- **IKEA SPÄND podnoží s úložným prostorem, 500 Kč.**
- **Woooooo.cz — šest desek s cenou za konkrétní rozměr.** Jediný nalezený dodavatel, který má
  ceny zakázkových desek veřejně v konfigurátoru (viz priorita 4).
- **Pracuj zdravě — tři třídy jednodílné rohové desky** (LUX / DELUX / EXCLUSIVE).
- **Powerton ERGO EDGE rohový rám, 7 853 Kč** (viz priorita 4).

---

## Priorita 4 — rozsouzení sporu o sit-stand rámy

### Liftor L: cena sedí, ale rozměrově na tenhle roh NEVYHOVUJE

Cena **16 999 Kč** ověřena, skladem 5+, jako jediný model Liftoru bez slevy.

Zásadní zjištění, které rešerše minula: **rozměr 290×100 cm platí jen pro rovné uspořádání 180°.**
Výrobce na produktové stránce uvádí doslova:

> Pro 90° uspořádání jsou vhodné desky 130–190 × 60–80 cm, pro 120° 110–180 × 60–80 cm,
> pro 180° 170–290 × 60–100 cm.

Rameno A 211 cm je nad limitem 190 cm pro 90° roh. Liftor L tedy **není** ověřená sestava, která
by na 211 × 148 cm rozměrově šla — v rohové konfiguraci na to nestačí. Tvrzení z rešerše padá.

### Liftor Expert: 8 999 Kč akčně, a na rameno A skutečně dosáhne

Běžná cena **14 999 Kč**, aktuálně **8 999 Kč**. Pozor: akční banner na webu říká
„Jen do 1.9. **3.9.** nebo do vyprodání zásob" — akce končí dnes.

Rešerše uváděla u Expertu tři různá čísla; správně je 14 999 běžně / 8 999 akčně. Číslo 10 490 Kč
neodpovídá ničemu, co je dnes na webu.

Rozsah potvrzen: **„Pro desky o rozměru až 220 × 100 cm"**, zdvih 61–126 cm, 150 kg, 2 motory.
Na rameno A 211 cm dosáhne — je to ale rovný dvousloupový rám, řeší jen rameno A, ne L.

Pro srovnání, ostatní rámy v ceníku na 211 cm nedosáhnou: Liftor Rise (desky do 180×80),
IKEA TROTTEN (120/160), IKEA MITTZON (120/140/160), AlzaErgo ET1 a ET1 NewGen (rám 100–170),
AlzaErgo ET2 Core (909–1458 mm), AlzaErgo ET3 (86–133 cm, a navíc není elektrický, je na kliku).

### Powerton rohový rám: rozpor je na webu výrobce, ne v rešerši

Rám **existuje** — je to Powerton ERGO EDGE, prodává ho pracuj-zdrave.cz za **7 853 Kč s DPH**
(6 490 bez DPH). Druhý průchod rešerše, který ho vůbec neznal, se mýlil.

Rozpor v prvním průchodu ale **není chyba přenosu** — obě čísla takhle uvádí sám Powerton,
ve stejné tabulce, na powerton.eu i u prodejce:

| Parametr | Hodnota |
|---|---|
| Rozsah šířky rámu | 1000–1700 mm |
| Navrhovaná velikost stolní desky | 1100–2200 × 600–1100 mm |
| Výškový rozsah | 620–1280 mm |
| Nosnost | 125 kg |

Fyzikálně to smysl dává: rám se roztahuje na 100–170 cm a deska přes něj smí přesahovat
až do 220 cm. Rozpor je zdánlivý.

**Pro tenhle projekt to ale nestačí.** Druhý rozměr podporované desky je **600–1100 mm**, což je
u rohového rámu druhé rameno. **Rameno B 148 cm je nad limitem 110 cm.** Rameno A 211 cm by
prošlo (do 220), rameno B ne. Potvrzuje to i sériová deska, kterou k rámu prodávají:
rohová deska **160×110-60 cm** za 3 624 Kč — tedy přesně na horní hranici 110 cm.

**Odpověď: Powerton rohový rám rameno A 211 cm zvládne, rameno B 148 cm ne.**

### Rohová deska 211 × 148 cm na míru: jedno číslo to neuzavře

Zadání čekalo, že to uzavře jedno konkrétní číslo. Neuzavře, a je poctivější to říct rovnou:
**ani jeden z obou dodavatelů cenu pro tenhle rozměr veřejně neuvádí.**

**pracuj-zdrave.cz** má jednodílné rohové desky frézované na CNC z jednoho kusu, „libovolný
rozměr dle požadavků", ale na produktové stránce stojí:

> Konfigurator cen jednotlivých rozměrů připravujeme, pro přesné nacenění nás kontaktujte.

Ceníkové ceny podle dekorové třídy (vč. DPH, zakázková výroba 2–3 týdny):

| Třída | Cena | Dubové dekory ve třídě |
|---|---|---|
| Powerton sériová 160×110-60×1,8 | 3 624 Kč | — (skladem, ale na 211×148 nedosahuje) |
| LUX | 7 139 Kč | Akácie Lakeland, Buk Bavaria, bříza, červený calvados |
| DELUX | 7 986 Kč | **Dub Corbridge, Dub Craft zlatý, Dub Craft tabákový**, Dub Craft bílý/šedý |
| SPECIAL EDITION | 8 349 Kč | Cappuccino, Carbon marine wood, hnědá zemitá |
| EXCLUSIVE | 9 559 Kč | **Dub Halifax přírodní / tabákový / bílý / cínový** |

Důležité omezení z jejich webu: **tloušťku 18 mm doporučují jen do délky cca 1 600 mm**, takže
pro rameno 211 cm je nutná tloušťka 25 nebo 36 mm. Příplatek za 36 mm je 2 178 Kč, zaoblené
rohy od 1 682 Kč, břišní výřez 2 045 Kč.

**woooooo.cz** má naopak veřejný konfigurátor s cenou za konkrétní rozměr — jenže dělá
**obdélníkové** desky, ne jednodílné L. Ceny, dub Halifax přírodní, vč. DPH:

| Rozměr | 18 mm | 36 mm |
|---|---|---|
| 1400 × 700 | 4 660 Kč | 5 870 Kč |
| 1600 × 700 | 4 960 Kč | 6 240 Kč |
| 2000 × 700 | 5 540 Kč | 6 970 Kč |
| 2200 × 700 | 5 830 Kč | 7 340 Kč |
| 2200 × 800 | 6 260 Kč | 7 860 Kč |

Příplatky: hrana v jiné barvě +300, průchodka +300, zaoblený roh +600/roh, břišní výřez +1 490,
výztuž proti prohnutí +1 500 Kč. Atypický rozměr (2110 / 1480 mm) dělají na dotaz. Pracují
výhradně s materiály Egger a Kronospan, což se hodí k prioritě 3.

**Závěr k odhadu rešerše 4 000 – 8 000 Kč: je podstřelený.**

- Jednodílná L deska (pracuj-zdrave, DELUX, teplý dub, 25 mm): **7 986 Kč ceníkově**,
  ale to je cena třídy, ne rozměru — pro 211×148 může být příplatek. Horní hranice odhadu.
- L složená ze dvou obdélníků (woooooo, 2200×700 + 1400×700): **10 490 Kč v 18 mm**
  (+ 2× výztuž 1 500 = 13 490 Kč, protože 18 mm nad 1 600 mm se prohýbá) nebo
  **13 210 Kč v 36 mm**. Plus spojka desek.

Reálné pásmo je tedy spíš **8 000 – 13 500 Kč**, ne 4 000 – 8 000 Kč. Jedno tvrdé číslo dá až
poptávka — tu podle zadání neposílám, appka na ni vygeneruje nákres i text.

---

## Priorita 3 — dekory a materiály

Podrobně v `research/_dekory_2026-09-03.md`. Nejdůležitější:

- **Barevnou shodu s #83420F nelze z webu změřit.** Náhledy dekorů jsou rendery zpracované pro
  web, jejich pixelová hodnota není kolorimetricky platná. Všechna tvrzení o shodě jsou vizuální
  odhad. Egger i Kronospan posílají A4 vzorky — bez nich to nejde uzavřít.
- **Egger jede kolekci Decorative Collection 26+** (od února 2026, nahradila 24+). Struktura je
  u Eggeru vázaná na dekor, ne volně kombinovatelná.
- **Nejblíž podlaze:** Kronospan **K536 RW/PE Amber Baroque Oak** — jediný dekor, který
  výrobce sám řadí do **oranžové**. 3 041 Kč/deska 2800×2070 s DPH u DŘEVO TRUST.
- **Klidnější alternativa:** Egger **H3398 ST12** (i ST9) Dub Kendal koňakový, 3 776 Kč u Kili.
- **Blíž nábytku:** Egger **H3303 ST10** Dub Hamilton přírodní 3 702 Kč, nebo Kronospan
  **K358 PW** Honey Castello Oak 3 055 Kč.
- **Feelwood:** ověřený je **H1344 ST32 Feelwood Vintage** Dub Sherman koňakově hnědý —
  nejsytější z Eggerů, ale +47 % proti H3303 (5 440 Kč u Kili).
- **Názvy struktur ST9, ST19, ST22, ST28, ST37, ST38 se ověřit nepodařilo** (stránka Eggeru se
  seznamem struktur vracela 404/500), proto ve výstupu nejsou. Ověřené názvy: ST10 Deepskin
  Rough, ST12 Omnipore Matt, ST32 Feelwood Vintage, ST17 Omnipore Oiled, ST71.
- **Forbo Desktop:** aktuální řada 24 odstínů, 2 mm, šíře 1,83 m. K tomuhle interiéru
  4002 leather, 4001 clay, 4008 brick, 4007 macadamia, 4176 mushroom, 4011 taupe.
  ČR: MOUCAL (marmoleumlinoleum.cz), PODLAHY BRASED, DOBRÉ PODLAHY; Ostermann vede jen
  sladěné hrany. **Českou cenu nikdo nezveřejňuje** — jediný ověřený záchyt je německý
  Bricoflor 57,95 €/m² vč. MwSt, což na českou cenu nepřepočítávám.
