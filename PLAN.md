# PLAN — konfigurátor pracovního stolu do obýváku

Stav: **čeká na schválení**. Dokud plán neschválíš, nepíšu kód aplikace.
(Rešerše trhu běží na pozadí — je to markdown, ne kód, a je nezávislá na tvých odpovědích.)

> **v2 — opraveno podle tvého upřesnění.** První verze četla prostor jako jeden rovný běh
> se gaučem na konci. Špatně. Je to **L do rohu**.

---

## 1. Geometrie prostoru

### Tvoje zadání
- z rohu místnosti **směrem ke mně: 236 cm** → to je běh **levé stěny**
- z rohu místnosti **ke gauči: 160 cm** → to je běh **zadní stěny**
- mezi gaučem a stolem **mezera 10–15 cm**, ať to nevypadá namačkaně
- **průchod není potřeba**, nikdo se kolem neprochází
- **stůl do L**: velká plocha vlevo, menší plocha na tiskárnu a šuplíky naproti

### Půdorys (pohled shora)

```
              ROH
               ╔════════════ ZADNÍ  STĚNA ════════════════════
               ║                                              
               ║  ◄────────────── 160 cm ─────────────────►   
               ║ ┌──────────────────────────┐  10–15 ┌────────
               ║ │   RAMENO B   ≤ 148 cm    │   cm   │        
    ▲          ║ │   tiskárna + šuplíky     │ ◄────► │  GAUČ  
    │          ║ └────────────┬─────────────┘        │        
    │          ║ │            │                      └────────
    │          ║ │  RAMENO A  │                               
  236 cm       ║ │  ≤ 236 cm  │      ⊙ židle                  
  (levá        ║ │            │                               
   stěna)      ║ │  hlavní    │                               
    │      L   ║ │  pracovní  │                               
    │      E   ║ │  plocha    │                               
    │      V   ║ │            │                               
    ▼      Á   ║ └────────────┘                               
               ║                                              
           S   ║        ▼  směrem ke mně (ke kameře)          
           T   ║                                              
           Ě   ║                                              
           N   ║                                              
           A   ║                                              
```

### Z toho plynou tvrdé limity
| Prvek | Limit | Odkud |
|---|---|---|
| **Rameno A** (levá stěna, hlavní plocha) | délka ≤ **236 cm** | běh levé stěny, konec je do volné místnosti |
| **Rameno B** (zadní stěna, tiskárna + šuplíky) | délka ≤ **145–150 cm** | 160 cm k gauči − mezera 10–15 cm |
| **Mezera ke gauči** | **10–15 cm** | tvůj požadavek, parametr s výchozí hodnotou 12 cm |
| Hloubka ramene A | 60–80 cm | ergonomie (z rešerše) |
| Hloubka ramene B | ≥ 45 cm | musí unést tiskárnu (běžná A4 MFP má cca 40×45 cm) |
| Výška | ~75 cm, pevná | tvoje volba |

### Co budu hlídat a kreslit jako rezervu
Průchod odpadá, takže rezervy jsou tři a všechny se týkají toho, aby stůl nepůsobil namačkaně:

| # | Rezerva | Cíl | Semafor |
|---|---|---|---|
| 1 | **Konec ramene B → gauč** | 10–15 cm | < 8 červená · 8–10 oranžová · 10–15 zelená · > 25 „zbytečně krátké" |
| 2 | **Odsunutí židle** z vnitřního rohu L | ≥ 100 cm volné podlahy | < 85 červená · 85–100 oranžová · ≥ 100 zelená |
| 3 | **Vyčnívání do místnosti** — jak daleko sahá hrana ramene A od levé stěny | co nejmenší při zachování funkce | zobrazím v cm, ať to nepřeženu |

Půdorys ukáže obrys rohu 236 × 160 cm, obrys L stolu, kružnici židle, hranu gauče
a všechny tři kóty s barevným semaforem — živě při každé změně posuvníku.

### Co se tím mění oproti v1
- Tvar **L je výchozí a hlavní**, ne okrajová varianta. Rovná deska zůstane v konfigurátoru
  jako alternativa, ale většina presetů bude L.
- **Rameno B má funkci**: tiskárna nahoře, šuplíky dole. To je pevné zadání, ne volitelný doplněk.
- Osa „strana úložného (levá/pravá)" se mění na **orientaci L** (roh vlevo‑vzadu je tvůj případ,
  ale zrcadlení nechám, ať je vidět i druhá varianta).
- Zóna průchodu z modelu mizí, zůstává jen zóna židle.

**Potvrď prosím tenhle půdorys** — pokud sedí, jedu dál.

---

## 2. `photo.jpg` — proč ho nemůžu nahrát sám a jak ho tam dostaneš

**Nemůžu.** Fotku vidím jen jako obrázek vykreslený ve zprávě — nedostanu se k jejím bajtům,
takže ji neumím uložit jako soubor. Kdybych „photo.jpg" vyrobil sám, byla by to jiná fotka
než tvoje, a vzorkování pixelů by bylo k ničemu.

Branch `claude/desk-configurator-living-room-a9vnnp` je už na GitHubu, takže je kam nahrávat.

### Varianta A — přes web GitHubu (nejrychlejší, jde i z mobilu)
1. Otevři <https://github.com/marty2427/pracovna/tree/claude/desk-configurator-living-room-a9vnnp>
2. Zkontroluj, že nahoře vlevo v přepínači větví svítí `claude/desk-configurator-living-room-a9vnnp`
3. **Add file** → **Upload files**
4. Přetáhni fotku a **přejmenuj ji na `photo.jpg`** (na velikosti nezáleží, klidně originál z foťáku)
5. Dole zvol **Commit directly to the `claude/desk-configurator-living-room-a9vnnp` branch**
6. **Commit changes**

### Varianta B — z příkazové řádky
```bash
git clone https://github.com/marty2427/pracovna
cd pracovna
git checkout claude/desk-configurator-living-room-a9vnnp
cp /cesta/k/tvojí/fotce.jpg photo.jpg
git add photo.jpg
git commit -m "Přidána fotka místa"
git push
```

### Varianta C — nemáš to teď po ruce
Řekni „jeď na vizuální paletu". Paletu odvodím z toho, co na fotce vidím, každou hodnotu
označím `"source": "visual"` a napíšu `scripts/sample-palette.mjs`, který po doplnění fotky
kdykoliv přepíše `palette.json` skutečně navzorkovanými pixely (`"source": "sampled"`).
Aplikace čte jen ten JSON, takže výměna palety je bezbolestná.

Až fotku nahraješ, napiš mi to — udělám `git pull` a spustím vzorkování.

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
- **ROZMĚRY** — posuvníky pro **délku ramene A** (≤ 236 cm), **délku ramene B** (≤ 160 − mezera ke gauči),
  **hloubku ramene A** (60–80), **hloubku ramene B** (45–70), **výšku** (72–78); rozsahy z rešerše,
  **tvrdě ořezané tvým rohem**. Posuvník pro mezeru ke gauči (8–25 cm, výchozí 12).
  Když nějaký limit překročíš, posuvník se zarazí a půdorys řekne proč.

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

| Rodina | Čím se liší | Tvar |
|---|---|---|
| Truhlářský masiv | 40 mm dub/jasan, masivní nákližek, plné bočnice, dřevěná traverza | L |
| Skandinávský / IKEA hack | dýhovaná deska + kónické dřevěné nohy, Alex jako nosný prvek | L |
| Industriál kov + masiv | jekl rámy A/U/H/trapéz, silný masiv 30–40 mm, černý komaxit | L |
| S kontejnerem | pojezdový / pevný kontejner pod ramenem B, 2–3 zásuvky | L |
| Se zadním panelem | zadní panel, police nad ramenem B, kabelová lávka, nástavec na monitor | L |
| Minimalistický „plovoucí" | tenká deska, skryté konzoly / úzký rám, LED podsvícení | L |
| Kompaktní do rohu | kratší ramena, mělčí deska — když nechceš zabrat celý roh | L |
| Rovná deska (alternativa) | jeden běh podél levé stěny, kdyby sis to rozmyslel | rovná |
| Kancelářský polohovatelný | sit‑stand rámy — malá rodina, zadání je vyžaduje, tvoje volba je pevná výška | L i rovná |

Většina presetů je **L**, protože to je tvůj případ. Rovné a polohovatelné zůstávají
jako doplněk, ať máš srovnání.

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
4. automatické kontroly navíc: žádný preset neporušuje roh (rameno A ≤ 236, rameno B ≤ 160 − mezera,
   mezera ke gauči 10–15 cm, zóna pro odsunutí židle ≥ 100 cm),
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
photo.jpg                      ← nahraj podle sekce 2
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

1. **Potvrdit půdorys v sekci 1** — rameno A ≤ 236 cm podél levé stěny, rameno B ≤ ~148 cm
   podél zadní stěny s mezerou 10–15 cm ke gauči, tiskárna a šuplíky na rameni B.
2. **`photo.jpg`** — nahraj podle návodu v sekci 2, nebo řekni „jeď na vizuální paletu".
3. **Schválit plán** (nebo mi říct, co změnit).
