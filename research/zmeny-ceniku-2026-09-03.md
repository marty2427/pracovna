# Seznam změn v ceníku — 3. 9. 2026

Formát: `id | pole | stará hodnota | nová hodnota | zdroj`.
Ceny v Kč vč. DPH. „prohlížeč" = vykreslená stránka, ne fetch (u IKEA je to podstatné, viz níže).

---

## Proč se IKEA ověřovala jinak než zbytek

Fetch produktové stránky KARLBY dub 246 vrátil **4 490 Kč**. Vykreslená stránka i výpis kategorie
shodně **3 990 Kč** (jednotková cena 1 621,95/m; 3990 ÷ 2,46 = 1621,95 — sedí na haléř).
IKEA renderuje ceny až JavaScriptem a fetch u ní vrací zastaralá data. **Všechny ceny IKEA
v ceníku jsou proto z vykreslené stránky v prohlížeči.** Čísla, která k IKEA přinesli
fetchovací agenti, jsem přeověřil v prohlížeči položku po položce.

---

## A) Ceny — změněno

| id | pole | stará | nová | zdroj |
|---|---|---|---|---|
| ikea-karlby-dub-246 | cena | 4490 | **3990** | ikea.cz, prohlížeč („Cena 3990,–/2,46 m") |
| ikea-karlby-dub-186 | cena | 3490 | **2990** | ikea.cz, prohlížeč („Cena 2990,–/1,86 m") |
| ikea-karlby-orech-246 | cena | 6990 | **6490** | ikea.cz, prohlížeč („Cena 6490,–/2,46 m") |
| ikea-karlby-orech-186 | cena | 5290 | **4990** | ikea.cz, prohlížeč |
| ikea-saljan-dub-186 | cena | 1690 | **1590** | ikea.cz, prohlížeč („Cena 1590,–/1,86 m") |
| ikea-alex-zasuvkovy-dil | cena | 1790 | **1590** | ikea.cz, prohlížeč („Nová nižší cena", „Cena platná od 1. září 2026") |
| ikea-mittzon-140x60-dub-cerna | cena | 3990 | **4490** | ikea.cz, prohlížeč |
| ikea-mittzon-140x80-dub-bila | cena | 4490 | **4990** | ikea.cz, prohlížeč (spor rozsouzen) |
| ikea-tonstad-140x75-dub | cena | 4990 | **5990** | ikea.cz, prohlížeč |
| ikea-mullsjo-135x70-dub | cena | 3490 | **4990** | ikea.cz, prohlížeč (spor rozsouzen) |
| ikea-anfallare-140x65 | overeno | false | **true** (2490 sedí) | ikea.cz, výpis kategorie |
| ikea-mittzon-160x68 | overeno | false | **true** (2200 sedí) | ikea.cz, prohlížeč |
| ikea-mittzon-140x68 | overeno | false | **true** (1700 sedí) | ikea.cz, prohlížeč |
| hornbach-sparovka-dub-2000x600x18 | cena | 1989 | **2150** | hornbach.cz, 2 signály („1791,67 Kč/m²") |
| hornbach-sparovka-buk-2000x600x18 | cena | 1149 | **1159** | hornbach.cz, 2 signály („965,83 Kč/m²") |
| obi-sparovka-dub-200x40 | cena | 1399 | **1449** | obi.cz („1 449,- Kč*", „1 811,25 Kč/m²") |
| obi-sparovka-dub-120x40 | cena | 899 | **919** | obi.cz (1 signál → overeno zůstává false) |
| obi-sparovka-smrk-200x60x28 | cena | 1799 | **1954,80** | obi.cz („1 629,- Kč/m²") |
| centrum-dreva-dub-2500x630x40 | cena | 13043 | **13 042,59** | centrumdreva.cz, 2 signály |
| alza-tte03-160x80-kastan | cena | 1939 | **2590** | alza.cz |
| ergodesk-corner-160x110 | cena | 2190 | **1898** | kupzidle.cz (1 signál) |
| walteco-hairpin-710-3r-cerna | cena | 459 | **455** | walteco.cz, 2 signály |
| loomah-industry-h20-710 | cena | 1954 | **1686** | loomah.cz, 2 signály |
| induro-industry-h20 | cena | 2200 | **1686** | in-duro.cz, 2 signály |
| induro-industry-h40-par | cena + jednotka | 3388 / sada | **1686 / ks** | in-duro.cz, 2 signály |
| induro-industry-u60 | cena | 1740 | **1799,90** | in-duro.cz, 2 signály |
| drevotrust-neo-s-800x725 | cena | 901 | **900,56** | drevotrust.cz |
| drevotrust-luk-up-seda | cena | 10245 | **10 296,15** | drevotrust.cz (1 signál) |
| alzaergo-et1-essential | cena | 7189 | **7990** | alza.cz (1 signál) |
| alzaergo-et3-essential-cerny | cena | 4359 | **3990** | alza.cz (1 signál) |
| liftor-rise-podnoz | cena | 8999 | **4999** akční (9 999 běžná) | liftor.cz |
| liftor-expert-3seg | cena | 10490 | **8999** akční (14 999 běžná) | liftor.cz, prohlížeč |
| xxxlutz-linea-natura-140x65-masiv | cena | 8999 | **11 999** akční (15 999 běžná) | xxxlutz.cz, 2 signály |
| xxxlutz-xora-140x70-elektricky | cena | 5199 | **7274** akční (9 699 běžná) | xxxlutz.cz (1 signál) |
| sconto-kuba-138x68 | cena | 2399 | **3299** akční (4 499 běžná) | sconto.cz |
| sconto-manager-rohovy-158x130 | cena | 7299 | **5699** akční (9 499 běžná) | sconto.cz |
| bonami-woodman-flow-140x75 | cena | 9949 | **9999** běžná (9 399 akční) | bonami.cz, 2 signály |
| bonami-woodman-flow-140x75 | název | „Woodman Flow" | **TemaHome Flow** | bonami.cz |
| bonami-hubsch-forma-140x70 | cena | 12603 | **13 425** akční (15 469 běžná) | bonami.cz, 2 signály |
| jysk-lintrup-140x60 | cena | 5999 | **4000** akční (5 999 běžná) | jysk.cz |
| jysk-skovlunde-120x60 | cena | 4500 | **4000** akční (5 499 běžná) | jysk.cz |
| jysk-stauning-160x80 | cena | 3299 | **2500** akční (3 299 běžná) | jysk.cz |
| jysk-svaneke-160x80-dub-cerna | cena | 8499 | **5500** akční (6 999 běžná) | jysk.cz |
| jysk-vandborg-120x60 | cena | 1075 | **1000** akční (1 499 běžná) | jysk.cz |
| prochodka-plast-kulata-60-cerna | cena | 188 | **35** | hornbach.cz, 2 signály |
| vesa-rameno-monitoru-plynova-pruzina | cena | 1750 (odhad) | **1290** (AlzaErgo Arm AR1.1) | alza.cz, 2 signály |
| hranova-paska-abs-dyha | cena | 200 | **85** (dřevodekor) / 57 (bílá, černá) | hornbach.cz (1 signál) |

**Sedělo a jen se potvrdilo (overeno: false → true):** ikea-adils-noha-70 (100),
ikea-olov-noha-nastavitelna (250), ikea-spand-noha (200), ikea-krille-noha-koleckem (400),
ikea-hilver-noha-bambus (500), ikea-mittback-koza-briza (1000), ikea-trotten-podnozi-klika (2000),
ikea-mittzon-podnozi-elektr (7300), ikea-lagkapten (999/799/599), ikea-pinnarp-orech-186 (4990),
hornbach-kuchynska-deska-dub-zlaty-4100 (3795), bauhaus-exclusivholz-dub-2200x600x18 (1990),
bauhaus-exclusivholz-smrk-2000x600x28 (1240), hornbach-sparovka-dub-2000x400x18 (1425),
hornbach-stolova-deska-dub-1600x800x26 (2190), hornbach-stolova-deska-dub-2000x800x25 (1590),
sparovky-eu-dub-1600x900x40 (5101), loomah-industry-u40-710 (1686), aluppress-skch-o (2662),
ikea-mittzon-160x80-dub-cerna (5490), ikea-ridspo-140x70-dub (11990), ikea-trotten-160x80-jasan (2490),
xxxlutz-linea-natura-120x65-masiv (4999), xxxlutz-venda-140x60 (5474 akční),
xxxlutz-homin-138x67-dub-wotan (3899 akční), xxxlutz-homin-rohovy-94x120 (3390),
alza-nejby-gianni-148x68 (2679), liftor-l-rohovy (16999).

## B) Označeno k vyřazení (`vyradit: true`)

| id | důvod |
|---|---|
| ikea-mollekulla-dub-246 | Produkt v pevném rozměru už není v CZ sortimentu, URL přesměrovává na kategorii |
| ikea-mollekulla-dub-186 | totéž |
| ikea-skogsa-dub-246 | totéž |
| ikea-skogsa-dub-186 | totéž |
| ikea-ekbacken-vapenec-186 | URL přesměrovává na kategorii laminátových desek |
| ikea-linnmon-200x60 | LINNMON dnes jen 100×60 a 100×45 |
| ikea-linnmon-150x75 | totéž |
| ikea-malskytt-140x60 | není v kategorii Stolní desky (7 položek) |
| ikea-mittcirkel-140x60 | totéž |
| ikea-tillslag-podnozi | není v kategorii Nohy a podstavce (10 položek) |
| ikea-narspel-podnozi | totéž |
| ikea-lerberg-podstavec | vyhledávání na ikea.cz vrací pro „LERBERG" 0 výrobků |
| ikea-malm-140x65-cernohneda | černohnědá varianta zrušena (bílá 140×65 = 4 490 Kč) |
| ikea-alex-132x58-sedotyrkysova | šedotyrkysová zrušena (bílá 3 490, bílé mořidlo/dub 2 990) |
| alza-tte01-140x80-bambus | „Prodej skončil" |
| alza-ultradesk-frag-xxl-160x75 | „Prodej skončil" |
| misterweld-zakladna-loft-jekl80 | e-shop pozastaven („Tento e-shop byl dočasně pozastaven") |
| misterweld-dm-valtek-par-bila | totéž |
| xxxlutz-venda-rohovy-140x117 | produktová URL 404, varianta chybí ve výpisu |
| jysk-kalby-120x60 | *pravděpodobně* — URL padají na kategorii, ne jistota |
| jysk-stavanger-160x80-rucni | *pravděpodobně* — totéž |

Kandidáti na vyřazení, které jsem **nevyřadil**, protože důkaz nestačí: `obi-hairpin-180x710-sada4`
(404, ale zůstává v indexu), `drevotrust-level-lp` černá (zmizela z katalogu).
Reálně nekoupitelné, ale existující: `drevotrust-luk-up-seda`, `aluppress-skch-o`,
`drevotrust-neo-s-800x725` (všechny 0 ks / doprodej).

## C) Opravy popisů a rozměrů (ne ceny)

| id | co bylo špatně |
|---|---|
| alzaergo-et3-essential-cerny | popsán jako **elektrický**, ve skutečnosti je **manuální na kliku** |
| alzaergo-et1-essential | nosnost 125 kg → **100 kg** |
| alzaergo-et2-core | zdvih 730–1230 → **715–1160 mm**; šířka 1000–1600 → **909–1458 mm** |
| alzaergo-et7-heavy-duty-bily | zdvih 665 → **655** mm |
| hornbach-stolova-deska-dub-2000x800x25 | potvrzeno, že to **není masiv**, ale dřevotříska s melaminem |
| hranova-paska-abs-dyha | doplněna šířka **22 mm** — na desku 25–38 mm nestačí |
| bonami-woodman-flow-140x75 | značka „Woodman" → **TemaHome** |

## D) Rozsouzené výhrady kontrolní vrstvy

| výhrada | výsledek |
|---|---|
| „IKEA podnože mají podezřele zaokrouhlené ceny" | **Vyvráceno** — celá kategorie ověřena, ceny jsou skutečně kulaté. Ale tři položky bloku v nabídce vůbec nejsou. |
| „Centrum dřeva je 2× nad srovnatelnými" | **Cena je správná** — je to průběžná lamela (bez cinků), kvalita A/B. Varování zrušeno, zdůvodnění doplněno. |
| „Melgo 760 Kč/sada je jistě cena za kus" | **Varování bylo mylné** — jednotka sedí. Chybná je **výška**: 711 mm Melgo nevede vůbec. |
| „Walteco 459 vs. Melgo 190 Kč/ks" | Obě strany špatně. Walteco je **455 Kč/ks**. Melgo 760 Kč nelze přiřadit reálnému produktu. |
| „Onpira: rozpor rozměrů" | **Rozpor neexistuje** — 75 je průměr sloupu Ø 7,5 cm, ne jekl. |
| „In-duro: nekonzistentní jednotka" | **Vyřešeno** — prodává vše po kusech. Bonus: In-duro a LooMAH mají identický ceník, nejsou nezávislí. |

## E) Nové položky

| id | co | cena |
|---|---|---|
| ikea-karlby-na-miru-dub-4563 | KARLBY deska **na míru**, dub, hloubka 45,1–63,5 cm | 4 000 Kč/m |
| ikea-mollekulla-na-miru-dub-4563 | MÖLLEKULLA na míru (jediná forma, v níž ještě existuje) | 4 400 Kč/m |
| ikea-karlby-na-miru-orech-4563 | KARLBY na míru, ořech | 4 400 Kč/m |
| ikea-inlagg-spojovaci-kovani | **INLÄGG spojovací kování** — spoj ramene A a B | 200 Kč/2 ks |
| ikea-spand-podnozi-ul-prostor | SPÄND podnoží s úložným prostorem | 500 Kč |
| powerton-edge-rohovy-ram | **Powerton ERGO EDGE** rohový rám | 7 853 Kč |
| woooooo-halifax-* (6 ks) | Woooooo desky na míru s cenou za konkrétní rozměr | 4 660 – 7 860 Kč |
| pracujzdrave-rohova-* (3 ks) | Jednodílné rohové desky LUX / DELUX / EXCLUSIVE | 7 139 / 7 986 / 9 559 Kč |

Nejužitečnější z nich jsou **desky na míru** (pro rameno 211 cm odpadá zkracování i olepování
řezané hrany) a **INLÄGG** (spojka dvou desek v rohu L, v ceníku dosud vůbec nebyla).
