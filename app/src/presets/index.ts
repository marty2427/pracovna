import type { DeskConfig, Deska, Podnoz, Ulozne, Doplnky, Rozmery } from '@/model/types'
import { MAX_RAMENO_A } from '@/model/space'

export interface Rodina {
  id: string
  nazev: string
  popis: string
}

/**
 * Presety po rešerši povrchu (research/povrch-desky-2026-09-06.md): JEN L stůl přes
 * celý roh (211 × 148 cm), JEN lamino Egger v dubových dekorech ST12, celý stůl
 * v jedné barvě, podnož hranatý profil nebo plné bočnice, úložné jen pevný kontejner.
 * Rodiny se liší tím, co v místnosti opravdu rozhoduje.
 */
export const RODINY: Rodina[] = [
  { id: 'roh', nazev: 'Monitor v rohu', popis: 'Sedí se na úhlopříčce, deska se kolem tebe obtočí velkým rádiusem. Roh L, který je jinak mrtvý, dělá práci — a 32" monitor tam má na oči nejvíc místa.' },
  { id: 'rameno-a', nazev: 'Monitor u obrazu (rameno A)', popis: 'Klasické sezení čelem k levé stěně. Pro 32" monitor chce deska hloubku 75+ cm, což ubírá ze zóny na židli — ten kompromis je tu vidět.' },
  { id: 'rameno-b', nazev: 'Monitor u gauče (rameno B)', popis: 'Sezení čelem k zadní stěně, gauč po pravé ruce. Rameno B musí být hluboké 75+ cm a monitor se před jeho konec vejde jen tak tak.' },
  { id: 'hranaty', nazev: 'Hranatý rám', popis: 'Tvůj favorit ve variantách: síla jeklu, barva komaxitu, tloušťka desky, odsazení. Jedna konstrukce, jiný výraz.' },
  { id: 'bocnice', nazev: 'Plné bočnice', popis: 'Panely ze stejné tabule jako deska, na stínové spáře, se zadním výztužným panelem. Vypadá to jako jeden kus nábytku.' },
  { id: 'hrany', nazev: 'Hrany lamina', popis: 'Pět stejných stolů, liší se jen hranou: ABS 1 mm, ABS 2 mm, a tři varianty s nalepenou masivní lištou. V konfigurátoru je k tomu řez v měřítku.' },
  { id: 'hloubky', nazev: 'Hloubky ramen', popis: 'Stejný stůl v různých hloubkách. Víc hloubky = dál od monitoru, ale míň místa na židli mezi stolem a lehátkem.' },
  { id: 'kontejner', nazev: 'Kde stojí kontejner', popis: 'Pevný kontejner ze stejného dekoru na konci ramene A, na konci ramene B, uprostřed, nebo vůbec.' },
]

/** Všechny presety jsou na maximum prostoru: 211 × 148 cm. Liší se hloubkou. */
const R = (p: Partial<Rozmery> = {}): Rozmery => ({
  ramenoADelka: MAX_RAMENO_A, ramenoAHloubka: 700,
  ramenoBDelka: 1480, ramenoBHloubka: 600,
  vyska: 750, mezeraKeGauci: 120, ...p,
})

/** Výchozí deska = doporučení rešerše: H3157 Dub Vicenza ST12, 25 mm, ABS 2 mm R2. */
const D = (p: Partial<Deska> = {}): Deska => ({
  materialId: 'egger-h3157', tloustka: 25, hrana: 'srazena',
  radiusRohu: 12, radiusVnitrni: 320, radiusUZdi: 160, vyrez: 0, ...p,
})

const P = (p: Partial<Podnoz> = {}): Podnoz => ({
  typ: 'ram-hranaty', profil: 40, odsazeni: 90, barva: '#1F2021',
  material: 'kov', mezilehlaPodpora: 'auto', vyztuha: true, ...p,
})

/** Plné bočnice — vždy ze stejné tabule jako deska, malé odsazení. */
const PB = (p: Partial<Podnoz> = {}): Podnoz =>
  P({ typ: 'bocnice', material: 'drevo', odsazeni: 60, ...p })

/** Pevný kontejner: pod ramenem A nebo B, posun podél ramene; `null` = bez kontejneru. */
const K = (rameno: Ulozne['rameno'] | null = 'A', pozice = 1.0): Ulozne[] =>
  rameno === null ? [] : [{ typ: 'kontejner-pevny', rameno, pozice }]

const DO = (p: Partial<Doplnky> = {}): Doplnky => ({
  kabelovaLavka: true, ledPodsviceni: false,
  nastavecMonitor: false, zadniPanel: false, monitorUmisteni: 'roh', monitorPosun: 0, ...p,
})

const mk = (v: Omit<DeskConfig, 'tvar'>): DeskConfig => ({ tvar: 'L', ...v })

export const PRESETY: DeskConfig[] = [
  // ---------- MONITOR V ROHU ----------
  mk({ id: 'ro-01', rodina: 'roh', nazev: 'Doporučení rešerše: Vicenza 25 v rohu',
    popis: 'H3157 Dub Vicenza ST12, 25 mm, ABS 2 mm, hranatý rám, kontejner na konci ramene A. Vnitřní roh R320, roh u zdi R160 na kabely. Oči 78 cm od obrazovky.',
    rozmery: R(), deska: D(), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-02', rodina: 'roh', nazev: 'Velký oblouk R400, Kendal přírodní',
    popis: 'Největší možný rádius vnitřního rohu — deska se kolem tebe obtočí, předloktí leží na obou ramenech. Dekor H3170 s jemnými suky. Oči 83 cm od obrazovky.',
    rozmery: R({ ramenoBHloubka: 650 }), deska: D({ materialId: 'egger-h3170', radiusVnitrni: 400, radiusUZdi: 200 }),
    podnoz: P(), ulozne: K('B'), doplnky: DO() }),

  mk({ id: 'ro-03', rodina: 'roh', nazev: 'Roh bez mezery u zdi',
    popis: 'Deska vyplní roh celý. Kabely od monitoru jdou po zdi dolů za nástavcem do kabelové lávky.',
    rozmery: R(), deska: D({ radiusUZdi: 0, radiusVnitrni: 300 }),
    podnoz: P(), ulozne: K('A'), doplnky: DO({ nastavecMonitor: true }) }),

  mk({ id: 'ro-04', rodina: 'roh', nazev: 'Hlubší ramena 75 / 70',
    popis: 'O 5 cm hlubší obě ramena: oči 88 cm od obrazovky, ale zóna na židli klesne na 85 cm.',
    rozmery: R({ ramenoAHloubka: 750, ramenoBHloubka: 700 }), deska: D(),
    podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-05', rodina: 'roh', nazev: 'Mělká ramena 65 / 55',
    popis: 'Nejmělčí deska, která v rohu ještě dá 70 cm na oči. Zóna na židli 95 cm, stůl vyčnívá nejmíň.',
    rozmery: R({ ramenoAHloubka: 650, ramenoBHloubka: 550 }), deska: D({ radiusVnitrni: 360 }),
    podnoz: P({ profil: 35 }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-06', rodina: 'roh', nazev: 'Pracovní deska 38, Kendal koňakový',
    popis: 'Tloušťka 38 mm jako u kuchyňských pracovních desek, dekor H3398 nejblíž tónu podlahy. Rozpon zvládne bez mezilehlé podpory.',
    rozmery: R(), deska: D({ materialId: 'egger-h3398', tloustka: 38, radiusRohu: 18 }),
    podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-07', rodina: 'roh', nazev: 'Thermo černohnědý, bílý rám',
    popis: 'Nejtmavší dekor H1199 a bílý komaxit — rám splyne se stěnou, tmavá deska vypadá, že se vznáší.',
    rozmery: R(), deska: D({ materialId: 'egger-h1199' }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: K('B'), doplnky: DO() }),

  mk({ id: 'ro-08', rodina: 'roh', nazev: 'Tabule 18 mm — levnější roh',
    popis: 'Tabule H3157 18 mm skladem za 3 883 Kč pokryje desku, bočnice i kontejner. Rozpon si vyžádá mezilehlou podporu, přidá se sama.',
    rozmery: R(), deska: D({ tloustka: 18 }),
    podnoz: P({ profil: 35 }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-09', rodina: 'roh', nazev: 'Roh s rohovou poličkou a LED',
    popis: 'Nástavec v rohu je pětiúhelníková polička, monitor stojí na ní. LED pásek pod přední hranou obou ramen. Dekor H3395 Corbridge přírodní.',
    rozmery: R(), deska: D({ materialId: 'egger-h3395' }),
    podnoz: P(), ulozne: K('A'), doplnky: DO({ nastavecMonitor: true, ledPodsviceni: true }) }),

  mk({ id: 'ro-10', rodina: 'roh', nazev: 'Roh na bočnicích ze stejné tabule',
    popis: 'Stejné rohové sezení, ale místo rámu plné bočnice z téže tabule. Rohová podpora je vzadu u zdi, mezi koleny nic není.',
    rozmery: R(), deska: D(), podnoz: PB(),
    ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-11', rodina: 'roh', nazev: 'Belmont hnědý, antracitový rám',
    popis: 'Teplý střední dub H1303 o tón tmavší než podlaha, rám v antracitu místo černé.',
    rozmery: R(), deska: D({ materialId: 'egger-h1303' }),
    podnoz: P({ barva: '#33383B' }), ulozne: K('B'), doplnky: DO() }),

  mk({ id: 'ro-12', rodina: 'roh', nazev: 'Vicenza světlý, zaoblená lišta',
    popis: 'Nejsvětlejší dekor H3165 s masivní lištou zaoblenou R10 a rohy R30. Měkký, obytný tvar bez ostrých linek.',
    rozmery: R(), deska: D({ materialId: 'egger-h3165', hrana: 'radius', radiusRohu: 30 }),
    podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  // ---------- MONITOR U OBRAZU (RAMENO A) ----------
  mk({ id: 'ra-01', rodina: 'rameno-a', nazev: 'Čelem k obrazu, hloubka 75',
    popis: 'Monitor u levé stěny. Aby oči byly aspoň 70 cm od obrazovky, musí mít deska 75 cm — zóna na židli tím klesne na 85 cm.',
    rozmery: R({ ramenoAHloubka: 750 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-02', rodina: 'rameno-a', nazev: 'Hloubka 80 s výřezem pro předloktí',
    popis: 'Deska 80 cm hluboká a v místě sezení výřez 6 cm. Předloktí leží na desce, oči přesně 70 cm od obrazovky.',
    rozmery: R({ ramenoAHloubka: 800 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100, vyrez: 60 }),
    podnoz: P(), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-03', rodina: 'rameno-a', nazev: 'Thermo černohnědý u obrazu',
    popis: 'Nejtmavší dekor proti světlé stěně s obrazem. Hloubka 80, monitor u zdi, kontejner na konci ramene A.',
    rozmery: R({ ramenoAHloubka: 800 }), deska: D({ materialId: 'egger-h1199', radiusVnitrni: 140, radiusUZdi: 80 }),
    podnoz: P({ profil: 45 }), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-04', rodina: 'rameno-a', nazev: 'Pracovní deska 38 na bočnicích, u obrazu',
    popis: 'Deska 38 mm a bočnice ve stejné síle i dekoru H3171. Sedí se u ramene A, kontejner pod ramenem B.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'egger-h3171', tloustka: 38, radiusRohu: 20, radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB(), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-05', rodina: 'rameno-a', nazev: 'Davos přírodní u obrazu',
    popis: 'Dekor H3131 s výraznějšími letokruhy, ABS 2 mm, antracitový rám.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'egger-h3131', radiusRohu: 24, radiusVnitrni: 160, radiusUZdi: 120 }),
    podnoz: P({ barva: '#33383B' }), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-06', rodina: 'rameno-a', nazev: 'U obrazu s nástavcem a LED',
    popis: 'Monitor na nástavci u levé stěny, LED pod přední hranou. Kontejner na konci ramene A vedle sezení.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoA', nastavecMonitor: true, ledPodsviceni: true }) }),

  mk({ id: 'ra-07', rodina: 'rameno-a', nazev: 'Tabule 18 mm u obrazu',
    popis: 'Nejlevnější varianta: tabule 18 mm na hranatém rámu s výztuhou, ABS 1 mm. Mezilehlá podpora se přidá sama.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ tloustka: 18, hrana: 'rovna', radiusRohu: 6, radiusVnitrni: 100, radiusUZdi: 80 }),
    podnoz: P({ profil: 35 }), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  // ---------- MONITOR U GAUČE (RAMENO B) ----------
  mk({ id: 'rb-01', rodina: 'rameno-b', nazev: 'Čelem k zadní stěně, rameno B 75',
    popis: 'Monitor u zadní stěny, gauč po pravé ruce. Rameno B musí být 75 cm hluboké; rameno A zůstává odkládací plocha.',
    rozmery: R({ ramenoBHloubka: 750 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  mk({ id: 'rb-02', rodina: 'rameno-b', nazev: 'U gauče s výřezem, hloubka 80',
    popis: 'Rameno B 80 cm hluboké s výřezem 6 cm v místě sezení. Oči 70 cm od obrazovky.',
    rozmery: R({ ramenoBHloubka: 800 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100, vyrez: 60 }),
    podnoz: P(), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  mk({ id: 'rb-03', rodina: 'rameno-b', nazev: 'U gauče, Tonsberg hnědý na bočnicích',
    popis: 'Šedohnědý dekor H309 s bočnicemi ve stejné barvě, sezení u zadní stěny, kontejner na konci ramene A.',
    rozmery: R({ ramenoBHloubka: 760 }), deska: D({ materialId: 'egger-h309', radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  mk({ id: 'rb-04', rodina: 'rameno-b', nazev: 'U gauče, Kendal koňakový 38',
    popis: 'Pracovní deska 38 mm v tónu vlysů, rameno B 80 hluboké, bílý rám. Monitor u zadní stěny.',
    rozmery: R({ ramenoBHloubka: 800 }), deska: D({ materialId: 'egger-h3398', tloustka: 38, radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  // ---------- HRANATÝ RÁM ----------
  mk({ id: 'hr-01', rodina: 'hranaty', nazev: 'Jekl 50 × 50, deska 38',
    popis: 'Nejmasivnější provedení: silný jekl a pracovní deska 38 mm s masivním nákližkem. Rám je vidět a má být vidět.',
    rozmery: R(), deska: D({ tloustka: 38, hrana: 'naklizek', radiusRohu: 16 }),
    podnoz: P({ profil: 50, odsazeni: 110 }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-02', rodina: 'hranaty', nazev: 'Jekl 30 × 30, subtilní',
    popis: 'Tenký jekl pod deskou 25 mm — rám skoro zmizí, deska dominuje. Výztuha pod deskou nese rozpon.',
    rozmery: R(), deska: D(),
    podnoz: P({ profil: 30, odsazeni: 80 }), ulozne: K('B', 0.95), doplnky: DO() }),

  mk({ id: 'hr-03', rodina: 'hranaty', nazev: 'Antracitový rám, Kendal koňakový',
    popis: 'Antracit (RAL 7016) místo černé — měkčí kontrast k dekoru H3398 v tónu vlysů.',
    rozmery: R(), deska: D({ materialId: 'egger-h3398' }),
    podnoz: P({ barva: '#33383B' }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-04', rodina: 'hranaty', nazev: 'Bílý rám, Baronia světlý',
    popis: 'Bílý komaxit a světlý klidný dekor H1362. Nejméně se hlásí o slovo, vynikne gauč a obraz.',
    rozmery: R(), deska: D({ materialId: 'egger-h1362', radiusRohu: 16 }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-05', rodina: 'hranaty', nazev: 'Nerezový rám, Corbridge šedý',
    popis: 'Kartáčovaný nerez pod šedým dubem H3156. Ladí s kovovými prvky konferenčního stolku.',
    rozmery: R(), deska: D({ materialId: 'egger-h3156' }),
    podnoz: P({ barva: '#B9BCC0', profil: 40 }), ulozne: K('B', 0.95), doplnky: DO() }),

  mk({ id: 'hr-06', rodina: 'hranaty', nazev: 'Jekl 40, deska 38 bez výztuhy',
    popis: 'Pracovní deska 38 mm na rámu bez podélné výztuhy — pod deskou je jen rám. Rozpon je na hraně, kontroly to ukážou.',
    rozmery: R(), deska: D({ tloustka: 38, radiusRohu: 10 }),
    podnoz: P({ vyztuha: false }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-07', rodina: 'hranaty', nazev: 'Jekl 60, velké odsazení',
    popis: 'Rámy zasunuté 18 cm pod desku. Deska přesahuje, stůl vypadá jako plovoucí, nohy nikde nepřekáží.',
    rozmery: R(), deska: D({ radiusRohu: 20 }),
    podnoz: P({ profil: 60, odsazeni: 180 }), ulozne: K('A'), doplnky: DO() }),

  // ---------- PLNÉ BOČNICE ----------
  mk({ id: 'bo-01', rodina: 'bocnice', nazev: 'Bočnice z jedné tabule, Vicenza 25',
    popis: 'Deska i bočnice z jedné tabule H3157, odsazení jen 6 cm — jeden rám, ne deska na nohách. Stínová spára u podlahy.',
    rozmery: R(), deska: D(), podnoz: PB(),
    ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'bo-02', rodina: 'bocnice', nazev: 'Thermo černohnědý 38 na bočnicích',
    popis: 'Nejtmavší dekor v pracovní desce 38 mm s masivním nákližkem, bočnice 38 mm. Vypadá jako jeden kus nábytku.',
    rozmery: R(), deska: D({ materialId: 'egger-h1199', tloustka: 38, hrana: 'naklizek', radiusRohu: 14 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'bo-03', rodina: 'bocnice', nazev: 'Kendal koňakový 38, bočnice stejné síly',
    popis: 'Tloušťka 38 jako u kuchyňských pracovních desek, dekor v tónu podlahy. Stůl se v podlaze rozpustí.',
    rozmery: R(), deska: D({ materialId: 'egger-h3398', tloustka: 38 }),
    podnoz: PB(), ulozne: K('B', 0.95), doplnky: DO() }),

  mk({ id: 'bo-04', rodina: 'bocnice', nazev: 'Kendal olejovaný na bočnicích, monitor u obrazu',
    popis: 'Dekor H3171 v tónu stávajícího nábytku, klasické sezení u ramene A. Panel v místě napojení ramen kryje kolena zprava.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'egger-h3171', radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB(), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'bo-05', rodina: 'bocnice', nazev: 'Bočnice z tabule 18 mm',
    popis: 'Nejlevnější bočnicová varianta: tabule 18 mm na desku i bočnice. Mezilehlý panel si rozpon vyžádá sám.',
    rozmery: R(), deska: D({ tloustka: 18 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'bo-06', rodina: 'bocnice', nazev: 'Davos lanýžově hnědý, kontejner u gauče',
    popis: 'Tlumený hnědý dekor H3133 všude: deska, bočnice i kontejner na konci ramene B vedle lehátka.',
    rozmery: R(), deska: D({ materialId: 'egger-h3133' }),
    podnoz: PB(), ulozne: K('B', 1.0), doplnky: DO() }),

  mk({ id: 'bo-07', rodina: 'bocnice', nazev: 'Tonsberg přírodní, zaoblená lišta',
    popis: 'Šedavý dekor H305 s masivní lištou R10 a rohy R30. Měkčí, obytnější tvar.',
    rozmery: R(), deska: D({ materialId: 'egger-h305', hrana: 'radius', radiusRohu: 30 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  // ---------- HRANY LAMINA ----------
  mk({ id: 'hn-01', rodina: 'hrany', nazev: 'ABS 1 mm',
    popis: 'Tenká páska, skoro pravoúhlá hrana. Nejlevnější, ale spára je zblízka vidět a pod předloktím tlačí.',
    rozmery: R(), deska: D({ hrana: 'rovna', radiusRohu: 6 }), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-02', rodina: 'hrany', nazev: 'ABS 2 mm, R2 — doporučení',
    popis: 'Páska 2 mm ve stejném dekoru, rohy R2, PUR lepidlo bez viditelné spáry. Standard kvalitního lamina.',
    rozmery: R(), deska: D({ hrana: 'srazena' }), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-03', rodina: 'hrany', nazev: 'Masivní lišta se zkosením 45°',
    popis: 'Na čelo nalepená masivní dubová lišta a do ní vyfrézovaný klín shora i zespodu. Deska 25 mm vypadá tenká a ostrá.',
    rozmery: R(), deska: D({ hrana: 'zkosena', radiusRohu: 8 }), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-04', rodina: 'hrany', nazev: 'Masivní lišta zaoblená R10',
    popis: 'Masivní lišta zakulacená nahoře i dole. Nejpříjemnější pod předloktím — k bočnicím sedí nejvíc.',
    rozmery: R(), deska: D({ hrana: 'radius', radiusRohu: 24 }), podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-05', rodina: 'hrany', nazev: 'Masivní nákližek R3',
    popis: 'Lišta 30 mm jen lehce zaoblená: na hraně pravé dřevo, plocha zůstává lamino ST12. Nejdražší hrana.',
    rozmery: R(), deska: D({ hrana: 'naklizek', radiusRohu: 16 }), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  // ---------- HLOUBKY RAMEN ----------
  mk({ id: 'hl-01', rodina: 'hloubky', nazev: 'Hloubky 60 / 55',
    popis: 'Nejmělčí kombinace. Do místnosti vyčnívá jen 60 cm, zóna na židli 100 cm, na oči v rohu přesně 70 cm díky R400.',
    rozmery: R({ ramenoAHloubka: 600, ramenoBHloubka: 550 }), deska: D({ radiusVnitrni: 400 }),
    podnoz: P({ profil: 35 }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hl-02', rodina: 'hloubky', nazev: 'Hloubky 70 / 60',
    popis: 'Doporučený kompromis: oči 78 cm od obrazovky, zóna na židli 90 cm, rameno B unese kontejner i repro.',
    rozmery: R({ ramenoAHloubka: 700, ramenoBHloubka: 600 }), deska: D(),
    podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hl-03', rodina: 'hloubky', nazev: 'Hloubky 75 / 70',
    popis: 'Víc plochy a 88 cm na oči, ale mezi stolem a lehátkem zbude jen 85 cm — na hraně.',
    rozmery: R({ ramenoAHloubka: 750, ramenoBHloubka: 700 }), deska: D(),
    podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hl-04', rodina: 'hloubky', nazev: 'Hloubky 80 / 80',
    popis: 'Maximum. Obrovská plocha, ale 80 cm na židli je minimum a stůl vyčnívá do místnosti. Spíš pro srovnání.',
    rozmery: R({ ramenoAHloubka: 800, ramenoBHloubka: 800 }), deska: D({ radiusVnitrni: 380 }),
    podnoz: P({ profil: 45 }), ulozne: K('A'), doplnky: DO() }),

  // ---------- KDE STOJÍ KONTEJNER ----------
  mk({ id: 'ko-01', rodina: 'kontejner', nazev: 'Kontejner na konci ramene A',
    popis: 'U průchodu, nejdál od sezení v rohu. Zásuvky po ruce, kolena mají celý roh volný.',
    rozmery: R(), deska: D(), podnoz: P(), ulozne: K('A', 1.0), doplnky: DO() }),

  mk({ id: 'ko-02', rodina: 'kontejner', nazev: 'Kontejner na konci ramene B',
    popis: 'Vedle lehátka gauče. Konec ramene B dostane váhu a rameno A zůstane celé volné pro nohy.',
    rozmery: R(), deska: D(), podnoz: P(), ulozne: K('B', 1.0), doplnky: DO() }),

  mk({ id: 'ko-03', rodina: 'kontejner', nazev: 'Kontejner uprostřed ramene A',
    popis: 'Posunutý do půlky ramene A. Při sezení v rohu nepřekáží, zásuvky jsou blíž ruce; na konci ramene zůstane volno pod deskou.',
    rozmery: R(), deska: D(), podnoz: P(), ulozne: K('A', 0.5), doplnky: DO() }),

  mk({ id: 'ko-04', rodina: 'kontejner', nazev: 'Bez kontejneru',
    popis: 'Jen deska a rám, pro srovnání. Nejčistší silueta, nejlevnější, ale věci nemají kam.',
    rozmery: R(), deska: D(), podnoz: P(), ulozne: K(null), doplnky: DO() }),
]

export const presetPodleId = (id: string) => PRESETY.find((p) => p.id === id)
