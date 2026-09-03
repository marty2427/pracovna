# PLAN — konfigurátor pracovního stolu do obýváku

Stav: **čeká na schválení**. Dokud plán neschválíš, nepíšu kód aplikace.
(Rešerše trhu už běží na pozadí — je to markdown, ne kód, a je nezávislá na tvých odpovědích.)

---

## 1. Co už vím

### Tvoje odpovědi
| Otázka | Odpověď | Co z toho plyne |
|---|---|---|
| Umístění | **Podél levé stěny** (ta s barevným obrazem) | Hlavní běh stolu = levá stěna |
| Rezerva | **15 cm mezera mezi koncem stolu a gaučem**, jako na fotce | Gauč je na KONCI stolu, ne před ním |
| Výška | **Pevná ~75 cm** | Sit-stand rámy jdou do vedlejší role |
| Rozpočet | **5–20 tis. Kč** | Těžiště = stavebnice a lepší sériové kusy |

### Tvoje odpověď mi opravila geometrii
Ptal jsem se na mezeru mezi **přední hranou** stolu a gaučem. Odpověděl jsi na mezeru mezi
**koncem** stolu a gaučem. To je jiná osa a je to důležité — beru to takto:

```
                     ZADNÍ STĚNA
   ┌─────────────────────────────────────────────────────────┐
 L │                                                          │
 E │   ┌──────────────────────────────────┐  15 cm  ┌────────
 V │   │          DESKA STOLU             │◄──────►│  GAUČ
 Á │   │          max. 221 cm             │         │
   │   └──────────────────────────────────┘         └────────
 S │   ▲                                                      
 T │   │ hloubka desky 55–80 cm                               
 Ě │   ▼                                                      
 N │   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                   
 A │     REZERVA: židle + průchod                             
   │   │      160 − hloubka desky         │                   
   │   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘                   
   │                                                          │
   └─────────────────────────────────────────────────────────┘
       ◄────────────── 236 cm běh levé stěny ──────────────►
```

- **osa X (délka stolu)** — podél levé stěny, k dispozici **236 cm**;
  konec stolu musí zůstat **15 cm** od gauče → **max. šířka desky 221 cm**
- **osa Y (hloubka do místnosti)** — od levé stěny **160 cm** volno;
  deska ubere 55–80 cm, zbytek je zóna pro židli + průchod
- **osa Z** — 280 cm ke stropu; reálně neomezuje nic kromě nástavce/police

**Prosím potvrď tenhle nákres při schvalování plánu.** Pokud jsou ta dvě čísla jinak
(např. 160 cm není hloubka do místnosti, ale něco jiného), je to oprava dvou konstant,
ne přepis appky — celý model je parametrický.

### Rezerva, kterou budu hlídat a kreslit
Zadání říká „nesmí být namáčknutý na gauč ani vystrčený zbytečně do místnosti".
Půdorys proto bude živě vyhodnocovat **dvě** rezervy:

| Rezerva | Osa | Cíl | Semafor |
|---|---|---|---|
| **Ke gauči** (konec desky → gauč) | X | ≥ 15 cm | < 10 červená / 10–15 oranžová / ≥ 15 zelená |
| **Za židlí** (hrana desky → gauč/koberec) | Y | ≥ 90 cm | < 80 červená / 80–95 oranžová / ≥ 95 zelená |

Čísla pro zónu za židlí (odsunutí kancelářské židle a vstání, průchod bokem)
podepře rešerše ergonomie — dosadím ověřené hodnoty, ne odhad.
Při hloubce desky 70 cm vychází zóna 90 cm, což je ten rozumný kompromis.

### Co jsem vyčetl z fotky
Vlysová (rybí kost) dubová podlaha v teplém oranžovo‑hnědém tónu · teplé bílé stěny ·
petrolejový (teal) rohový gauč · světle dubový stávající nábytek (stůl s plnou bočnicí,
kontejner, konferenčák) · černé kovové akcenty (rámy fotek, židle, lampička) ·
žlutý akcent (obraz, koberec) · chrom (stojací lampa) · krémové závěsy.

---

## 2. Jeden problém, který musíš vzít na vědomí

**`photo.jpg` v repozitáři není** — repo je úplně prázdné (žádný commit). Fotku vidím
jen jako přílohu ve zprávě, takže z ní nemůžu programově navzorkovat pixely.

Jak to vyřeším, aby to neblokovalo:

1. Napíšu `scripts/sample-palette.mjs` — skript, který z `photo.jpg` navzorkuje
   **skutečné pixely** na pojmenovaných souřadnicích (podlaha ve světle / podlaha ve stínu /
   stěna osvětlená / stěna ve stínu / gauč světlo / gauč stín / dub stávajícího stolu /
   koberec / obraz / kov) a udělá k tomu k‑means shluk dominantních barev celého snímku.
2. Do `palette.json` zapíšu paletu **odvozenou z fotky vizuálně**, a každou hodnotu označím
   `"source": "visual"`.
3. **Jakmile do repa přidáš `photo.jpg`**, spustím skript a `palette.json` se přepíše
   skutečnými hodnotami se `"source": "sampled"`. Aplikace na tom nezávisí — čte jen ten JSON.

👉 **Ideálně přidej `photo.jpg` do repa** (nebo mi řekni „jeď na vizuální paletu"), a já
to při schvalování plánu rovnou dořeším.

---

## 3. Fáze 1 — Rešerše trhu  ⏳ BĚŽÍ

Rozdělena na 11 paralelních subagentů, každý s druhým ověřovacím průchodem
(kontrola názvů modelů, rozměrů a cen proti živým stránkám) a závěrečným kritikem úplnosti:

| # | Téma | Ověření |
|---|---|---|
| 1 | IKEA CZ — hotové stoly (Mittzon, Bekant, Trotten, Idåsen, Malm, Micke, Utespelare, Fredde…) | ✔ |
| 2 | JYSK / XXXLutz / Kika / Sconto | ✔ |
| 3 | Asko / Alza / Nábytek IDEA / Bonami / další CZ e‑shopy | ✔ |
| 4 | Stavebnice: desky (Karlby, Lagkapten, Linnmon, spárovky z hobbymarketů) + podnože (Alex, Adils, Olov, hairpin, jekl) | ✔ |
| 5 | Polohovatelné rámy (Flexispot, AlzaErgo, IKEA, Ergotrend…) | ✔ |
| 6 | Materiály: masiv, dýhovaná MDF, lamino Egger/Kronospan (konkrétní dekory), HPL, Forbo linoleum, hrany | — |
| 7 | Konstrukce a kování: typy podnoží, jekl profily, Blum/Hettich zásuvky, kabelové lávky, průchodky, LED | — |
| 8 | Ergonomie a statika: ČSN EN 527, výšky, legroom, zóna za židlí, **max. rozpon desky bez podpory** | ✔ |
| 9 | Cenová pásma sériově vs. na míru + služby „deska na míru" (Demos, Kili, Hornbach…) | ✔ |
| 10 | Truhláři **Brno** — přímé vyhledávání | ✔ |
| 11 | Truhláři **okolí Brna** + katalogy (Firmy.cz, Biano, Fler) | — |

**Výstup:** `research/trh.md` (body a–e ze zadání) a `research/vyrobci.md` (truhláři),
oba s odkazy na zdroje. Mezery, které se nepodaří ověřit, budou v dokumentu označené —
nebudu si vymýšlet čísla.

---

## 4. Fáze 2 — Barvy z fotky

**`palette.json`** — struktura:
```jsonc
{
  "meta": { "source": "sampled" | "visual", "image": "photo.jpg" },
  "samples": [ { "name": "podlaha_svetlo", "x": 0, "y": 0, "hex": "#…", "lab": [..] } ],
  "clusters": [ { "hex": "#…", "share": 0.18, "role": "podlaha" } ],
  "directions": [ /* 6 barevných směrů */ ]
}
```

Šest směrů pro desku, každý s odůvodněním vůči tomuhle konkrétnímu interiéru:

1. **Shoda s podlahou** — teplý dub v tónu vlysů; stůl splyne, místnost působí větší
2. **O tón tmavší** — kouřový/tmavý dub; stůl se odsadí od podlahy, ale zůstane v dřevěné rodině
3. **O tón světlejší** — světlý dub / jasan, jako stávající nábytek a konferenčák; sjednotí to zónu
4. **Kontrast** — čerň / antracit / grafit; stůl jako záměrný objekt, rýmuje se s rámy fotek a židlí
5. **Kov + dřevo** — černý ocelový rám + dřevěná deska; nejsilnější vazba na industriální akcenty v místnosti
6. **Neutrál** — krémová / světle šedá / šalvějová; ustoupí do stěny, nechá vyniknout gauč a obraz

(+ zvážím sedmý: **akcent v tónu gauče nebo obrazu** — petrolej nebo hořčicová jako barva
zásuvek/boků. Přidám jen pokud po navzorkování dá barevně smysl.)

---

## 5. Fáze 3 — Parametrický 3D konfigurátor

### Stack
`Vite` + `React 19` + `TypeScript` + `@react-three/fiber` + `@react-three/drei` + `zustand` (stav) + `three`.
Bez backendu, statický build.

### Datový model
Jeden typ `DeskConfig`; **geometrie se generuje z parametrů**, žádný ručně modelovaný stůl.

```ts
type DeskConfig = {
  size:      { width; depth; height; }                       // mm
  top:       { material; thickness: 18|25|30|40; shape: 'rect'|'rounded'|'L'|'cutout';
               edge: 'straight'|'chamfer'|'bevel'|'solid-lipping'|'radius';
               overhang: { left; right; front; back } }
  base:      { kind: 'frame-A'|'frame-U'|'frame-H'|'frame-trapez'|'frame-box'|'hairpin'
                    |'wood-straight'|'wood-taper'|'wood-splay'|'panel-gable'|'trestle'
                    |'pedestal-support'|'sit-stand'; finish; profile; inset }
  storage:   { kind: 'none'|'slim-drawer'|'two-drawers'|'pedestal-3'|'fixed-pedestal'
                    |'door-cabinet'|'open-shelf'|'back-panel'; side: 'left'|'right' }
  extras:    { cableTray; grommet; ledUnderglow; monitorRiser; backPanel }
}
```

### Osy konfigurace (přesně dle zadání)
- **DESKA** — materiál/dekor (z palety + z rešerše: dub/jasan/ořech masiv, dýha, lamino dekory, linoleum),
  tloušťka 18/25/30/40, tvar rovná / zaoblené rohy / L / s výřezem, hrana rovná / sražená / zkosená /
  masivní nákližek, přesah přes podnož (samostatně vlevo/vpravo/vpředu/vzadu)
- **PODNOŽ** — kovový rám A / U / H / trapéz / hranatý profil, hairpin, dřevěné nohy rovné / kónické / šikmé,
  plné bočnice, kozy, kontejner jako nosný prvek, výškově stavitelný rám
- **ÚLOŽNÉ** — nic / 1 plochá zásuvka / 2 zásuvky / pojezdový kontejner 3 zásuvky / pevný kontejner /
  skříňka s dvířky / otevřená police / zadní panel — **strana levá ⇄ pravá přepínatelná**
- **DOPLŇKY** — kabelová lávka, průchodka, LED podsvícení, nástavec na monitor
- **ROZMĚRY** — posuvníky šířka / hloubka / výška; rozsahy z rešerše, **tvrdě ořezané tvým prostorem**
  (šířka ≤ 221 cm, hloubka tak, aby zóna za židlí nespadla pod limit)

### Aby to vypadalo jako nábytek, ne slepené kvádry
- **hrany a fazety** — každá hrana desky má reálný profil (sražení / zkosení / R2–R3 / nákližek),
  ne ostrý kvádr; generuji přes `Shape` + `ExtrudeGeometry` s bevelem
- **materiály** — PBR: dřevo s procedurálně generovanou texturou kresby (canvas → `CanvasTexture`,
  žádné externí assety), správný `roughness`/`clearcoat` pro olej vs. lak, komaxit kovu s mikrodrsností
- **světlo** — `Environment` (studio HDRI z drei) + směrové světlo + `SoftShadows` + `ContactShadows`
  pod stolem; bez kontaktního stínu vypadá cokoli jako nalepené
- **detaily, které dělají nábytek** — spáry mezi zásuvkami, úchytky/frézované úchopy, srovnávací patky,
  zaoblení rohů podnože, tloušťka bočnic, mírné sražení nohou
- **kontext scény** — kus podlahy s vlysovým vzorem v barvě z palety, stěna, naznačený gauč
  a kancelářská židle, aby byl vidět měřítko a odstupy

### UI
- levý panel: přepínače + posuvníky, seskupené podle os
- střed: **živý 3D náhled** s orbit ovládáním (`OrbitControls`), presety kamery (perspektiva / čelně / z boku / shora)
- pravý/spodní panel: **půdorys** — obrys dostupného prostoru 236 × 160 cm, obrys stolu,
  kružnice židle, gauč, **kótované rezervy** s barevným semaforem
- styl: krémovo‑oranžová paleta jako tvoje ostatní React nástroje

### Presety — min. 50, v 9 rodinách
Rodiny (dle zadání) — každá 5–7 kusů, reálně odlišná **konstrukcí**, ne jen barvou:

| Rodina | Čím se liší |
|---|---|
| Skandinávský / IKEA hack | dýhovaná deska + kónické dřevěné nohy, Alex jako nosný prvek |
| Industriál kov + masiv | jekl rámy A/U/H/trapéz, silný masiv 30–40 mm, černý komaxit |
| Minimalistický „plovoucí" | tenká deska, skryté konzoly / úzký rám, podsvícení, žádné nohy vpředu |
| Truhlářský masiv | 40 mm dub/jasan, masivní nákližek, plné bočnice, dřevěná traverza |
| Kancelářský polohovatelný | sit‑stand rámy (menší zastoupení — chceš pevnou výšku, ale zadání to vyžaduje) |
| Kompaktní do malého prostoru | 120–150 cm, mělká deska 50–55 cm, zóna za židlí max |
| S kontejnerem | pojezdový / pevný kontejner, 2–3 zásuvky, levá i pravá varianta |
| Rohový | L deska, výřez, zaoblený vnitřní roh |
| Se zadním panelem | zadní panel, police, kabelová lávka, nástavec na monitor |

**Galerie:** náhledy vykreslím jako **generované SVG bokorysy/axonometrie ze stejných parametrů** —
ostré, okamžité, nezatíží prohlížeč 50 WebGL plátny. Klik → preset se načte do konfigurátoru a dál se ladí.
Filtry: rodina / cenové pásmo / typ podnože / úložné / vejde se do prostoru.

---

## 6. Fáze 4 — Napojení na realitu

U každého presetu dvě karty:

**KOUPIT** — buď konkrétní sériový produkt (model + obchod + cena + odkaz),
nebo stavebnicová varianta jako rozpiska: `deska X (obchod, cena)` + `podnož Y (obchod, cena)` +
`kování/doplňky` + **součet**. Vše z čísel z Fáze 1, nic vymyšleného.

**NA MÍRU** — cut list: každý dílec s rozměrem, materiálem, tloušťkou, olepením hran (které strany),
+ odhad ceny materiálu (m²/bm z rešerše) a práce (hodinová sazba × odhad hodin), rozpětí od–do.

**Tlačítko „Export poptávky"** vygeneruje jeden soubor s:
- **technickým nákresem** — půdorys, nárys, bokorys, kótované (generované jako SVG ze stejných parametrů)
- **rozpiskou dílců**
- **hotovým textem e‑mailu pro truhláře** (co chci, rozměry, materiál, povrch, kování, termín, dotaz na cenu)

Formát: samostatná tisknutelná HTML stránka → PDF přes `window.print()`, plus `.svg` nákres
a `.csv` cut list ke stažení. (Běží to jako normální web na Cloudflare Pages, takže stahování funguje.)

**`research/vyrobci.md`** — truhláři Brno a okolí: název, web, kontakt, specializace,
zda berou malé zakázky. Cíl 25–35 firem ze dvou nezávislých vyhledávacích úhlů.

---

## 7. Kontrola kvality — Playwright

Nespoléhám na to, že to „asi vypadá dobře":
1. skript projede **všech 50+ presetů**, u každého udělá screenshot 3D náhledu i půdorysu
2. screenshoty si prohlédnu a hledám: slepené kvádry, plovoucí díly, chybějící stín,
   proříznuté geometrie, deska bez podpory v nemožném rozponu, židle v kolizi
3. iteruji, dokud to nevypadá jako nábytek
4. automatické kontroly navíc: žádný preset neporušuje prostor (šířka ≤ 221, rezerva za židlí ≥ limit),
   rozpon desky bez podpory ≤ hodnota z rešerše pro daný materiál a tloušťku,
   každý preset má vyplněné KOUPIT i NA MÍRU

---

## 8. Nasazení

Statický build (`vite build` → `dist/`), připravený pro **Cloudflare Pages**:
build command `npm run build`, output `dist`, SPA fallback přes `_redirects`,
`wrangler.toml` pro případný `wrangler pages deploy`. Bez runtime závislostí a bez externích assetů.

---

## 9. Struktura repozitáře

```
PLAN.md
palette.json
photo.jpg                      ← prosím doplň
research/
  trh.md
  vyrobci.md
scripts/
  sample-palette.mjs           # vzorkování skutečných pixelů
  screenshots.mjs              # Playwright průlet presety
app/
  src/
    model/     desk.ts, geometry/*, materials/*, constraints.ts
    presets/   families/*.ts   # 50+ presetů
    pricing/   catalog.ts      # produkty a ceny z rešerše
    export/    drawing.tsx, cutlist.ts, email.ts
    ui/        Configurator, FloorPlan, Gallery, PresetCard, Export
```

---

## 10. Pořadí prací po schválení

1. Dokončit rešerši → `research/trh.md`, `research/vyrobci.md`
2. `palette.json` (+ skript pro skutečné vzorkování)
3. Kostra appky + parametrický model desky a podnoží + materiály a světlo
4. Půdorys s rezervami
5. Katalog dílů a cen z rešerše
6. 50+ presetů v 9 rodinách + galerie
7. KOUPIT / NA MÍRU / Export poptávky
8. Playwright průlet, iterace vzhledu
9. Build pro Cloudflare Pages, commit a push na `claude/desk-configurator-living-room-a9vnnp`

---

## 11. Co potřebuju od tebe

1. **Potvrdit nákres geometrie v sekci 1** (osa X = 236 cm podél levé stěny, konec 15 cm od gauče;
   osa Y = 160 cm hloubka do místnosti). Nebo mi ta čísla oprav.
2. **Rozhodnout o `photo.jpg`** — přidáš ho do repa, nebo mám jet na vizuální paletu?
3. **Schválit plán** (nebo mi řekni, co změnit).
