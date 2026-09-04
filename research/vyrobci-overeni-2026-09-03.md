# Ověření kontaktů truhlářských firem proti živým webům

Ověřeno 3. 9. 2026. Zdroj: `/tmp/pracovna/research/vyrobci.md`.

**Metodika a její meze.** Primární signál je vlastní web firmy (WebFetch). Kde web nešel načíst,
je použit katalogový zápis (Firmy.cz, ČESKÉSTAVBY) — ten je **slabší signál** a je vždy takto označen.
Značná část českých webů v tomto prostředí fetcher odmítá (timeout na `robots.txt`, HTTP 429, neplatný
certifikát); to **neznamená, že firma zanikla**. Rozlišení je ve sloupci "web žije" a v poznámce.
`curl` nebyl použitelný — egress politika ho na tyto hostitele nepustí.

**Nikomu nebylo voláno ani psáno.** Žádný e-mail, žádný kontaktní formulář, žádná poptávka.
Čteny jen veřejné stránky.

Legenda sloupce "web žije": **ano** = stránka načtena a je to funkční web firmy ·
**nedostupné** = WebFetch stránku nedostal, ale firma prokazatelně existuje (katalog / jiný signál) ·
**ne** = doména nerozkládá nebo zápis zrušen.

## A) Truhláři v Brně

| Firma | Web žije | Telefon v dokumentu | Telefon na webu | Sedí? | E-mail v dokumentu | E-mail na webu | Sedí? | Dělá stoly? | Ceník na webu | Poznámka |
|---|---|---|---|---|---|---|---|---|---|---|
| Truhlářství Mareček | nedostupné | 777 691 154 | neověřeno | ? | jiri@truhlarstvi-marecek.cz | neověřeno | ? | pravděpodobně ano (dle dokumentu má sekce Stoly a Kancelářské stoly vč. L) | neověřeno | Server opakovaně vrací **HTTP 429** — tedy odpovídá, jen odmítá fetcher. Web žije, kontakty se ověřit nepodařilo. Nutno ověřit ručně v prohlížeči. |
| Stolařství a truhlářství Marek Antoš | nedostupné | 737 131 396 | 737 131 396 *(Firmy.cz)* | ano | info@stolarstvi-brno.cz | info@stolarstvi-brno.cz *(Firmy.cz)* | ano | **ano** — katalog uvádí "beds, **tables**, dressers, flooring, staircases" | neuveden | Vlastní web `stolarstvi-brno.cz` vrací 403/timeout. Katalogový zápis (slabší signál) potvrzuje adresu Šámalova 1130/62 i oba kontakty. |
| Truhlářství Marušák | **ano** | 777 798 918 | 777 798 918, 775 309 421 | ano | info@truhlarstvi-marusak.cz | info@truhlarstvi-marusak.cz | ano | ano — "Kancelářský nábytek… Vytvoříme pro vás dokonalý pracovní prostor na míru", "Rostoucí stoly na míru" | ne, jen "Nezávazná poptávka" | Web našel navíc druhé číslo 775 309 421. Adresa Vídeňská 297/99, Brno-střed. |
| Truhlářství Jánský & Effenberger | **ano** | 603 755 589, 775 628 893 | 603 755 589 (Effenberger), 775 628 893 (Jánský) | ano | info@truhlari-brno.cz | info@truhlari-brno.cz | ano | na kontaktní stránce stoly nezmíněny; dokument cituje profil "po malé skříňky" | ne — "Chcete nezávaznou cenovou kalkulaci?" | Kontakty sedí přesně. Adresa Rybkova 23. Profil na drobné kusy z webu přímo nepotvrzen. |
| Roháč & Fejta | nedostupné | 777 136 944 | **543 211 839** *(Firmy.cz)* | **ne** | info@rohac-fejta.cz | info@rohac-fejta.cz *(Firmy.cz)* | ano | dle dokumentu stoly + kancelářský nábytek; z webu neověřeno | neověřeno | Oba weby (`rohac-fejta.cz`, `brno-truhlarstvi.cz`) fetcher nedostal. Katalog uvádí jiné (pevné) číslo a **řeší spor o adresu: Železná 762/16a, Brno-Horní Heršpice**, ne Pisárecká. Mobil z dokumentu katalog nepotvrzuje. |
| Truhlářství Kužel | **ano** | 773 217 572 | 773 217 572 | ano | rkuzel@seznam.cz | rkuzel@seznam.cz | ano | stoly neuvádí; profil "atypické truhlářství, interiér na klíč, dřevovýroba, schodiště" | **stránka /cenik/ existuje, ale je prázdná — "Stránka v úpravě"** | Kontakty sedí. Adresa provozovny Zaoralova 3036/1b. |
| HT WOOD, s.r.o. | **ano** | 773 203 257 | 773 203 257, 775 333 302 | ano | htwood@htwood.cz | htwood@htwood.cz | ano | **ano** — web má kategorii "**Stoly / Židle**" v sekci bytových interiérů | ne | Kontakty sedí, web našel druhé číslo. Truhlářství + tesařství + kovářství (podnož pod desku pod jednou střechou). IČO 29263999. |
| Truhlářství v Brně (TEAK BRNO) | nedostupné | 777 733 010 | 777 733 010 *(Firmy.cz)* | ano | teakbrno@gmail.com | teakbrno@gmail.com *(Firmy.cz)* | ano | katalog: "kitchens, furniture, beds, doors, pergolas, fences, staircases" — stoly nejmenovány | neověřeno | `truhlarstvivbrne.cz` fetcher nedostal, ale **žije příbuzný web `teakbrno.cz`** (rozcestník: "zakázková výroba nábytku a pokládka zámkové dlažby"). Firma prokazatelně funguje. |
| BM nábytek | **ano** | 777 635 633, 777 635 632 | 777 635 633 (Sobotka), 777 635 632 (Šalling) | ano | bmnabytek@seznam.cz | bmnabytek@seznam.cz | ano | neuvádí — jen "Zakázková výroba nábytku na míru" | ne | Kontakty sedí přesně. Poděbradova 95, Královo Pole. |
| KLVAŇA – nábytek, s.r.o. | **ano** | 777 840 398, 775 940 398 | 777 840 398, 775 940 398 | ano | info@klvana-nabytek.cz | info@klvana-nabytek.cz, reklamace@klvana-nabytek.cz | ano | **ne** — "Specializujeme se na zakázkovou výrobu nábytku a kuchyní na míru" + "kompletní realizace interiérů"; stoly nejmenují | ne | Kontakty sedí. Potvrzuje domněnku dokumentu, že jde spíš o celé interiéry. |
| SAS nábytek | nedostupné | 777 493 143 | 777 493 143 *(Firmy.cz)* | ano | pavel@sasnabytek.cz | pavel@sasnabytek.cz *(Firmy.cz)* | ano | dle dokumentu vlastní sekce "Stoly na míru"; z webu neověřeno | neověřeno | Web `sasnabytek.cz` fetcher opakovaně nedostal (timeout), ale je v indexu a Firmy.cz má aktuální zápis (Lány 161/34, Bohunice, "85letá rodinná tradice"). Kontakty katalog potvrzuje **přesně**. |
| BN Interier (Petr Barák) | nedostupné | 777 909 633 | 777 909 633 *(Firmy.cz)* | ano | petr.barak@bninterier.cz | petr.barak@bninterier.cz *(Firmy.cz)* | ano | katalog: "výroba a montáž nábytku" + grafický návrh; stoly nejmenuje | neověřeno | Web nedostupný pro fetcher. Katalog uvádí dílnu **Kachlíkova 1102/14** (dokument má 1065/12 — číslo popisné se liší). |
| JV Stolařství (Ing. Josef Vašek) | nedostupné | 549 211 174 (dílna), 602 957 211 | 602 957 211 *(Firmy.cz)* | částečně | jvstolarstvi@iol.cz | jvstolarstvi@iol.cz *(Firmy.cz)* | ano | **ano** — katalog doslova: "vyrábím **stoly z masivu**, dýhované materiály, kuchyně, atypické interiéry" | neověřeno | Vlastní web nemá (dokument odkazoval na katalogový portál). Pevná linka 549 211 174 v katalogu není. Košinova 1414/103. |
| Truhlářství Hornet Wood | **ano** | 737 847 142 | 737 847 142 | ano | hornet-wood@email.cz | hornet-wood@email.cz | ano | neuvádí — jen sekce "Výroba" a "Restaurování" | ne | Kontakty sedí. Křenová 19. |
| ESTETICO, s.r.o. | nedostupné | 544 120 511; elsnerova 732 623 134 | 544 120 511, 544 120 526 *(ČESKÉSTAVBY)* | částečně | elsnerova@estetico.cz | **info@estetico.cz** *(ČESKÉSTAVBY)* | **ne** | katalog: "nábytkové sestavy a interiérové celky", zakázková výroba, lakování; dokument uvádí sekci Atypický nábytek | neověřeno | Web `estetico.cz` fetcher nedostal. Katalog uvádí adresu **Holasice 75, 664 61** (dokument má Holzova 730/14, Brno-Líšeň) — sídlo vs. provoz. Osobní e-mail paní Elsnerové z dokumentu se ověřit nepodařilo. IČO 26947625. |
| Home Interier Design s.r.o. | nedostupné | 774 918 302 | 774 918 302 *(Firmy.cz)* | ano | info@home-interier.cz | info@home-interier.cz *(Firmy.cz)* | ano | katalog: "navrhujeme, vyrábíme a montujeme nábytek od kuchyní po dětské pokoje a firemní nábytek", vlastní výroba v Brně | neověřeno | `kuchyne-brno.eu` fetcher nedostal. Katalog potvrzuje oba kontakty i adresu **Cejl 58/72**. |
| IRIDIUM, spol. s r.o. | **ano** | 777 239 079, 541 241 808 | 541 241 808, 777 239 079, 777 896 652, 777 689 403, 777 689 405, 541 241 088 | ano | obchod@iridium.cz | obchod@iridium.cz (+ faktury@, sekretariat@, vyroba@ a jmenné) | ano | jen obecně "Zakázková výroba"; stoly nejmenuje, těžiště skříně | ne na webu; **ceny na e-shopu iridium-eshop.cz** | Kontakty sedí. Poděbradova 106. |
| Skříně na míru, s.r.o. | **ano** | 541 225 757, 602 717 743, 602 746 790 | 541 225 757, 602 717 743 (Dvořák), 602 746 790 (Růžička), 606 085 486 (Zourková) | ano | info@skrinenamiru.cz | info@skrinenamiru.cz + jmenné adresy | ano | **ne** — o stolech na webu ani zmínka; "navrhnout, vyrobit a zrealizovat váš nábytek", těžiště skříně a kuchyně | ne | Kontakty sedí, web našel čtvrté číslo. Táborská 114. Pro jeden stůl nevhodné. |
| ZETO group s.r.o. | nedostupné | 511 140 196/197, 730 413 187 | 730 413 187 *(Firmy.cz)* | částečně | objednavky@zeto.cz | objednavky@zeto.cz *(Firmy.cz)* | ano | **ano, ale jinak** — formátování a olepování dílců + zakázková výroba nábytku vč. kancelářského | dokument cituje veřejný ceník služeb (450 Kč/m², 590 Kč/h, hrany 12–35 Kč/bm) — **z webu se teď ověřit nepodařilo** | **Pozor:** katalogový zápis pro Jílkova 191, Brno-Židenice vrací **HTTP 410 (zrušen)**; aktivní zápis má adresu **Vídeňská 264/120b, Brno-Přízřenice**. Adresa v dokumentu je zřejmě zastaralá — ověřit před cestou. |
| JN Interier ČR, s.r.o. | **ano** | 545 175 481, 724 996 333 | 545 175 481, 724 996 333 (pobočka Brno) | ano | brno@jninterier.cz | brno@jninterier.cz (+ info@ a další pobočky) | ano | **ne** — "kuchyně na míru" a "vestavěné skříně"; o stolech nic | ne | Kontakty sedí. Centrála je v Brandýse nad Labem, Brno je pobočka v IBC. Showroom, ne dílna na jeden atyp. |
| Truhlářství mistr M, s.r.o. | **ne** | 776 557 912 | na webu nenalezeno | ? | info@mistrM.cz | na webu nenalezeno | ? | portály uvádějí i "stoly", ale nelze ověřit | ne | **Vyřadit.** Firmy.cz vede firmu na adrese **K Papírně 171/32, Plzeň-Bukovec** (IČO 29117488) a zápis je označen jako **neaktivní**. Není to brněnská firma. Nejasnost z dokumentu je tím rozhodnuta. |

## B) Brno-venkov a okolí do ~40 km

| Firma | Web žije | Telefon v dokumentu | Telefon na webu | Sedí? | E-mail v dokumentu | E-mail na webu | Sedí? | Dělá stoly? | Ceník na webu | Poznámka |
|---|---|---|---|---|---|---|---|---|---|---|
| FRAMAB (Troubsko/Bratčice) | nedostupné | 731 586 023 | 731 586 023 *(Firmy.cz)* | ano | framab@seznam.cz | framab@seznam.cz *(Firmy.cz)* | ano | katalog: "kompletní atypické interiéry vč. kuchyní, skříní, dětských pokojů, obývacích pokojů, ložnic, koupelen, **kanceláří**"; stoly nejmenovány | neověřeno | Web `framab.cz` fetcher nedostal. Katalog potvrzuje kontakty i sídlo Bratčice 9. Dokument zmiňuje 3D vizualizace zdarma. |
| Commodo (Židlochovice) | **ano** | 732 833 279 | 732 833 279 | ano | stanek@commodo.cz | stanek@commodo.cz | ano | **spíš ne** — "vestavěné skříně, šatny, TV stěny, koupelnový nábytek" a "další atypická řešení"; samostatný stůl v nabídce není | ne | Kontakty sedí. Web navíc uvádí **sídlo Sobotovice 238**, provozovna Nádražní 92, Židlochovice. **Pozor:** stejné telefonní číslo má v dokumentu i Nábytek Staněk — viz níže. |
| Truhlářství Milan Kuchyňka (Lukovany) | **ano** | 737 678 786 | 737 678 786 | ano | info@truhlarstvi-kuchynka.cz | info@truhlarstvi-kuchynka.cz | ano | **ne** — výčet na webu: "kuchyně z lamina i masívu, vestavné a šatní skříně, kancelářský nábytek, nábytek do ložnice, police a regály, schody a schodiště". Stoly ve výčtu nejsou. | ne — "na základě konzultace zhotovíme návrh a cenovou nabídku" | Kontakty sedí. Lukovany 9. |
| Šimek interiér s.r.o. (Hvozdec) | **ano** (na `simekinterier.cz`) | 775 654 287, 606 436 835 | 775 654 287 | ano (druhé číslo neověřeno) | info@simek-interier.cz | **info@simekinterier.cz** | **ne** | **ano** — "Pokud jste si nevybrali z našich standardních rozměrů, rádi vám **stůl** nebo jiný kousek upravíme **na centimetr přesně** podle vašeho přání"; e-shop má sekci Pracovní stoly | ceny stolů na míru neuvedeny (dokument zmiňuje ceny jen u jídelních stolů) | **Dvě domény:** `simek-interier.cz` (v dokumentu, fetcher nedostal) a `simekinterier.cz` (žije). Živý web uvádí e-mail **bez pomlčky** — adresa v dokumentu může být neplatná. Profilově nejbližší firma zadání. |
| Válka stolařství (Ořechov) | nedostupné | 728 453 971 | neověřeno | ? | info@valkastolarstvi.cz | neověřeno | ? | neověřeno | neověřeno | Web `valkastolarstvi.cz` **běží jen na HTTP; HTTPS má neplatný certifikát** (fetcher skončil na `CERTIFICATE_VERIFY_FAILED`). Stránky /kontakt a /partneri jsou v indexu → **web žije, jen je technicky zanedbaný**. Firma nezanikla. |
| Truhlářství Radim Sladký (Budkovice) | nedostupné | 728 297 007 | 728 297 007 *(Firmy.cz)* | ano | sladky.radim@seznam.cz | sladky.radim@seznam.cz *(Firmy.cz)* | ano | dokument uvádí sekci "kancelářský nábytek na míru"; katalog: "zakázková truhlářská výroba", kuchyně, skříně | neověřeno | Web fetcher nedostal, katalog potvrzuje oba kontakty i adresu Budkovice 3. |
| MHM WOOD Interiéry, s.r.o. (Křtiny) | **ano** | 606 732 442, 607 874 405 | 606 732 442 (Holík), 607 874 405 (Střechová) | ano | mhm.interier@gmail.com | mhm.interier@gmail.com | ano | neuvádí — jen "Design interiérů", konkrétní produkty nespecifikovány | ne — formulář na cenovou nabídku | Kontakty sedí přesně. Březina 111, Křtiny. |
| Truhlářství Vysloužil (Drásov) | **ano** | 777 203 908 | 777 203 908 (p. Vysloužil) | ano | portaas@volny.cz | portaas@volny.cz | ano | neuvádí explicitně — "téměř libovolný kus nábytku do interiéru" na zakázku; stoly ve výčtu nejsou | ne — "nábytek naceníme" až po zaměření | Kontakty sedí a potvrzuje je i Firmy.cz (Drásov 377). Pozn.: `/kontakt` vrací 404, kontakty jsou na `/nabytek-na-miru-2`. |
| Potrusil s.r.o. (Šlapanice) | **ano** | 736 484 420, 723 305 071 | 602 594 153 (Po–Ne 7–20), 736 484 420 (studio), 723 305 071 (kancelářský nábytek) | ano | info@potrusil.cz | info@potrusil.cz | ano | **ne** — "Vybavení kanceláří, prodejen i pečovatelských domovů"; stoly na míru nejmenuje | ne | Kontakty sedí, web našel třetí číslo. Hybešova 1647/51. Orientace na celé provozy — pro jeden stůl nejspíš drahé. |
| KLASIK CZ s.r.o. (Zastávka) | nedostupné | 546 429 411 | 546 429 411 *(Firmy.cz)* | ano | info@klasikcz.eu | info@klasikcz.eu *(Firmy.cz)* | ano | **ne** — katalog potvrzuje varování z dokumentu: "nábytek z masivního **akátu** pro interiér i exteriér, pivní sety, židle, terasové materiály" | neověřeno | Kontakty katalog potvrzuje. Zahradní nábytek, ne interiérový pracovní stůl. |
| FERSTO, s.r.o. (Kuřim) | nedostupné | 608 831 800, 541 102 211 | **774 831 839** *(Firmy.cz)* | **ne** | info@fersto.cz | **tomslatina@fersto.cz** *(Firmy.cz)* | **ne** | katalog: "navrhování a výroba nábytku a interiérů na míru", CNC výroba, kompaktní desky | neověřeno | Web `fersto.cz` fetcher nedostal, ale je v indexu a portfolio-stránky žijí → **firma existuje**. Katalog má **jiný telefon, jiný e-mail i jiné číslo popisné** (Blanenská 240/51 vs. 257 v dokumentu). Kontakt v dokumentu je nespolehlivý. |
| Truhlářství Vašíček / Kuřimské Jestřábí | **ne** | 732 498 921 | na webu nenalezeno | ? | stolarstvivasicek@seznam.cz | na webu nenalezeno | ? | neověřeno | neověřeno | **Doména `interiervasicek.cz` nerozkládá** — opakovaně `Name or service not known` na `www.` i apex. To je DNS selhání, ne blokace fetcheru. Firma jako taková existovat může (živnostník), ale web je pryč. |
| BM Truhlářství – Martin Blažek (Šlapanice) | **ano** | 773 928 206 | 773 928 206 | ano | blazek.klik@seznam.cz | blazek.klik@seznam.cz | ano | nepřímo ano — "**Atypický nábytek**: Jakýkoliv další typ nábytku dle Vašich přání a potřeb" | ne | Kontakty sedí. Web upřesňuje adresu: **Ponětovská 33, Šlapanice u Brna**. |
| Nábytek Staněk (Šlapanice) | **ne** | 732 833 279 | na webu nenalezeno | ? | sta.martin@email.cz | na webu nenalezeno | ? | neověřeno | neověřeno | **Doména `nabytek-stanek.cz` nerozkládá** (NXDOMAIN na `www.` i apex), přestože URL je ještě ve vyhledávacím indexu — typický obraz expirované domény. Navíc **telefon je identický s firmou Commodo** (732 833 279), což je v dokumentu skoro jistě chyba přenosu. |
| Straka Truhlářství (Tišnov) | nedostupné | kontakt na webu | neověřeno | ? | neuveden | neověřeno | ? | dle dokumentu masiv, dýha, velkoplošné materiály | neověřeno | Web fetcher nedostal a **Firmy.cz zápis pro Straku v Tišnově se nenašel** (jsou tam Strakové z Třebovic, Klatov, Topolan — jiné firmy). Existence firmy tedy nezávisle nepotvrzena. Nižší priorita. |
| LINEA, stolařské výrobní družstvo (Olomučany) | **ano** | 516 417 127, 606 721 660 | 606 721 660, 724 859 434, 602 109 340 | částečně | info@linea-blansko.cz | info@linea-blansko.cz (+ s.machan@, pokorny@) | ano | **ano** — web má v menu "Nábytek pro bydlení → **Stoly**" i sekci referencí Stoly | ne — "nezávazná poptávka" | Mobil sedí, **pevná linka 516 417 127 na webu není** (nahrazena jinými čísly). Adresa Olomučany 255. Specialista na přírodní dýhu. |
| M&M stolařství s.r.o. (Doubravice n. Svit.) | nedostupné | 777 215 424 | 777 215 424 *(Firmy.cz)* | ano | michalsimak@seznam.cz | michalsimak@seznam.cz *(Firmy.cz)* | ano | **ano** — "Vyrábíme zakázkový nábytek z masivu, lamina a dýhy" + kancelářský nábytek | neověřeno | Web `stolarstvi-mm.cz` fetcher nedostal. Katalog uvádí jako web **`luxmasiv.cz`** a adresu Klemov 282 — firma zřejmě jede pod druhou značkou. Kontakty sedí. |
| Truhlářství Kleveta (Blansko) | nedostupné | kontakt na webu | neověřeno | ? | neuveden | neověřeno | ? | dle dokumentu zakázkový interiérový nábytek | neověřeno | Web fetcher nedostal a **Firmy.cz zápis se nenašel**. Existence nezávisle nepotvrzena. Nízká priorita. |
| Nábytek – interiéry Vybíhal (Doubravice) | **ano** | nezjištěno | **776 712 370** | doplněno | nezjištěno | **poptavka@nabytek-vybihal.cz** | doplněno | **ne** — "kuchyně na míru", "nábytek do obývacího pokoje, vestavěné skříně", "nábytek do dětského pokoje"; stoly nejmenuje | ne | Dokument kontakt neměl — **web ho doplnil**. Adresa Klemov 297, Doubravice nad Svitavou. |
| STOMM s.r.o. (Boskovice) | nedostupné | 774 214 124 | 774 214 124 *(Firmy.cz)* | ano | martinkozousek@stomm.cz | martinkozousek@stomm.cz *(Firmy.cz)* | ano | katalog: "výroba kuchyní a ložnicového nábytku na zakázku"; dokument uvádí lamino/dýha/masiv/MDF | neověřeno | Web fetcher nedostal. Katalog potvrzuje oba kontakty i adresu Havlíčkova 1598/63. |
| Stolařství JUST (Blučina) | **ano** | 605 805 418, 736 639 317 | 530 502 315 (tel./fax), 605 805 418, 736 639 317 | ano | just-stolarstvi@seznam.cz | **stolarstvi@just-stolarstvi.cz** | **ne** | neuvádí — "zakázková výroba interiérů", "individuální přístup ke každé zakázce" | ne | Telefony sedí (web přidává pevnou linku), ale **e-mail v dokumentu je jiný než na webu**. Adresa **Sokolská 387, Blučina** (dokument správně opravil dřívější Židlochovice). |
| Truhlářství Moudrý (Hodějice) | **ano** | 777 457 441 | 777 457 441 | ano | nezjištěno | **marekstolarstvi@seznam.cz** | doplněno | **ano** — "zakázkové výrobě kuchyňských linek a vestavných skříní ale rádi vám na vaše přání zhotovíme i koupelnový nábytek, kanceláře, **stoly**, obývací stěny a jiný atypický nábytek" | ne, ale "**prvotní konzultace a kalkulace ceny ZDARMA**" | Telefon sedí, **e-mail doplněn z webu**. Adresa Hodějice 396. Jeden z mála webů, kde jsou stoly jmenovitě. |
| Truhlářství CERAMI (Vyškov) | **ano** | 777 858 184, 774 349 730 | 777 858 184 (Červeňák), 774 349 730 (Salajka) | ano | info@truhlarstvicerami.cz | info@truhlarstvicerami.cz | ano | **ano** — "Kuchyně, šatní skříně, **stoly**, kanceláře a další podle vašich představ" | ne | Kontakty sedí přesně. **Fyzická adresa na webu chybí** — jen "Vyškov, Brno a okolí". |
| Nábytek Skalka (Vyškov/Slavkov) | nedostupné | 739 618 277 | neověřeno | ? | skalkalubos@seznam.cz | neověřeno | ? | dle dokumentu truhlářské práce, nábytek na míru | neověřeno | Web fetcher nedostal a **Firmy.cz zápis se nenašel**. Existence nezávisle nepotvrzena. |
| ALSTAV-Nelly (Pohořelice) | **ano** | kontakt přes web | **607 603 202** | doplněno | neuveden | **na webu nenalezeno** | — | **ne** — "Zakázková výroba nábytku" a "Kuchyně na míru"; stoly nejmenuje | ne — jen slogan "Příznivé ceny" | Web na Wix žije. **Telefon doplněn**, e-mail se na webu nepodařilo najít. Fyzická adresa na webu není. |
| Malá dílna (Brno-Královo Pole) | **ano** | nezjištěno | **605 482 930** (objednávky), **605 298 560** (technické dotazy) | doplněno | nezjištěno | **info@maladilna.net** | doplněno | **ano** — v menu "Zakázková výroba → **Stoly**"; "Naší specialitou je zakázková výroba" | ne | Dokument kontakt neměl — **web doplnil obě čísla i e-mail**. Adresa na kontaktní stránce chybí (dokument uvádí Křižíkova 70). Masiv + epoxid. |

---

## Označit jako problematické

**Web nežije (doména nebo zápis mrtvý):**

1. **Truhlářství Vašíček / Kuřimské Jestřábí** — `interiervasicek.cz` nerozkládá (NXDOMAIN na `www.` i apex, opakovaně). Není to blokace fetcheru, je to DNS. Kontakt z dokumentu (732 498 921, stolarstvivasicek@seznam.cz) nelze proti ničemu ověřit.
2. **Nábytek Staněk (Šlapanice)** — `nabytek-stanek.cz` nerozkládá (NXDOMAIN), přestože URL je ještě ve vyhledávacím indexu. Navíc **telefon 732 833 279 je v dokumentu duplicitní s firmou Commodo** — jedna z těch dvou hodnot je chybná, a protože Commodo si ho potvrdilo na živém webu, chybný je záznam u Staňka.
3. **Truhlářství mistr M, s.r.o.** — Firmy.cz vede firmu v **Plzni-Bukovci** (IČO 29117488) a **zápis je označen jako neaktivní**. Není brněnská a pravděpodobně nefunguje. Ze seznamu vyřadit.

**Kontakt nesedí s webem:**

4. **FERSTO, s.r.o. (Kuřim)** — nejhorší nesoulad v seznamu. Dokument: 608 831 800 / 541 102 211, info@fersto.cz, Blanenská 257. Firmy.cz: **774 831 839, tomslatina@fersto.cz, Blanenská 240/51**. Liší se telefon, e-mail i číslo popisné.
5. **Roháč & Fejta** — dokument má mobil 777 136 944; Firmy.cz uvádí **543 211 839**. E-mail sedí. Katalog zároveň řeší spor o adresu ve prospěch **Železná 762/16a, Brno-Horní Heršpice**.
6. **Šimek interiér** — živý web `simekinterier.cz` uvádí **info@simekinterier.cz** (bez pomlčky), dokument má info@simek-interier.cz. Firma jede na dvou doménách; e-mail z dokumentu nemusí doručovat.
7. **Stolařství JUST** — web uvádí **stolarstvi@just-stolarstvi.cz**, dokument má just-stolarstvi@seznam.cz.
8. **ESTETICO** — osobní e-mail elsnerova@estetico.cz se ověřit nepodařilo; katalog dává **info@estetico.cz** a adresu **Holasice 75**, ne Holzova v Líšni.
9. **ZETO group** — **adresa v dokumentu je zastaralá.** Katalogový zápis pro Jílkova 191, Brno-Židenice vrací HTTP 410 (zrušen); aktivní zápis je na **Vídeňská 264/120b, Brno-Přízřenice**. Pevné linky 511 140 196/197 katalog neuvádí, jen mobil 730 413 187.
10. **LINEA Blansko** — pevná linka 516 417 127 z dokumentu na webu není; web uvádí 606 721 660, 724 859 434, 602 109 340.
11. **BN Interier** — číslo popisné dílny se liší: dokument Kachlíkova 1065/12, katalog Kachlíkova 1102/14.
12. **M&M stolařství** — kontakty sedí, ale katalog uvádí jako firemní web **luxmasiv.cz**, ne stolarstvi-mm.cz z dokumentu.

**Existence firmy nezávisle nepotvrzena** (web fetcher nedostal *a* katalogový zápis se nenašel — nelze říct, zda firma funguje):

13. **Straka Truhlářství (Tišnov)**
14. **Truhlářství Kleveta (Blansko)**
15. **Nábytek Skalka (Vyškov)**

**Web žije, ale kontakty se ověřit nepodařilo** (firma prokazatelně existuje — neoznačovat jako mrtvou):

16. **Truhlářství Mareček** — server vrací HTTP 429, tedy odpovídá. Vzhledem k tomu, že je to profilově jeden z nejlepších kandidátů (sekce Stoly i Kancelářské stoly vč. L), **ověřit ručně v prohlížeči**.
17. **Válka stolařství** — web běží jen na HTTP, HTTPS má neplatný certifikát. Stránky jsou v indexu.

---

## Nově nalezené

| Firma | Kde | Kontakt | Proč sem patří | Zdroj |
|---|---|---|---|---|
| **MTINTERIER – nábytek na míru s.r.o.** | Nebovidská 762/32a, 664 47 Střelice (~12 km od Brna) | 605 703 685, info@mtinterier.cz | Katalogový zápis jmenovitě uvádí "**jídelní stoly**" a "**kancelářský nábytek**" jako samostatné položky sortimentu vedle kuchyní a skříní — tedy stoly jsou standardní produkt, ne výjimka. Malá s.r.o. blízko Brna. | [Firmy.cz – MTINTERIER Střelice](https://www.firmy.cz/detail/12903664-mtinterier-nabytek-na-miru-s-r-o-strelice.html) *(katalog — slabší signál, vlastní web firma nemá, jen Facebook)* |
| **Luxmasiv** | Doubravice nad Svitavou (~30 km) | viz M&M stolařství: 777 215 424, michalsimak@seznam.cz | Není to nová firma, ale **druhá značka M&M stolařství** — katalog vede `luxmasiv.cz` jako jejich web. Užitečné vědět, pokud `stolarstvi-mm.cz` nereaguje. | [Firmy.cz – M&M stolařství](https://www.firmy.cz/detail/13194261-m-m-stolarstvi-s-r-o-doubravice-nad-svitavou.html) *(katalog)* |

**Prověřeno a nezařazeno** (narazil jsem na ně, ale kritérium "evidentně dělá stoly" nesplnily):
Stolařství Bouček (Brno-Židenice) — zápis označen jako **neaktivní**; Stolařství DOFEK (Brno-Štýřice, 603 164 240) a Vlastimil Štrubl – Truhlářství (Brno-Žebětín, 602 721 704) — obě firmy fungují, ale ani jedna stoly v sortimentu nejmenuje.

---

## Co z toho plyne pro poptávku jednoho L stolu

Firmy, kde je **na webu nebo v katalogu jmenovitě doloženo, že dělají stoly**, a kontakt sedí:
Truhlářství Moudrý (Hodějice), Truhlářství CERAMI (Vyškov), HT WOOD (Brno-Ponava), LINEA Blansko,
Šimek interiér (pozor na e-mail), JV Stolařství (Brno-Královo Pole), Marek Antoš (Brno-Židenice),
M&M stolařství, Malá dílna (Brno).
K nim patří **Truhlářství Mareček**, který profilově sedí nejlíp ze všech, ale jeho kontakty se ověřit nepodařilo.

Potvrdilo se i zjištění zdrojového dokumentu, že **žádná z firem nezveřejňuje ceník**. Nejblíž tomu je
Truhlářství Kužel, které má na webu stránku „Ceník" — ale ta je prázdná s poznámkou „Stránka v úpravě".
Jediné veřejné ceny v celém seznamu jsou u služeb (ZETO – řezání a olepování), ne u hotových výrobků.
