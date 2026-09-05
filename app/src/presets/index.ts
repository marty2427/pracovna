import type { DeskConfig, Deska, Podnoz, Ulozne, Doplnky, Rozmery } from '@/model/types'
import { MAX_RAMENO_A } from '@/model/space'

export interface Rodina {
  id: string
  nazev: string
  popis: string
}

/**
 * Presety po zúžení zadání: JEN L stůl přes celý roh (211 × 148 cm), jen dřevo,
 * podnož hranatý profil nebo plné bočnice, úložné jen pevný kontejner.
 * Rodiny se liší tím, co v místnosti opravdu rozhoduje — kde stojí monitor,
 * jaká podnož, jaká hrana, jak hluboká ramena, kde stojí kontejner.
 */
export const RODINY: Rodina[] = [
  { id: 'roh', nazev: 'Monitor v rohu', popis: 'Sedí se na úhlopříčce, deska se kolem tebe obtočí velkým rádiusem. Roh L, který je jinak mrtvý, dělá práci — a 32" monitor tam má na oči nejvíc místa.' },
  { id: 'rameno-a', nazev: 'Monitor u obrazu (rameno A)', popis: 'Klasické sezení čelem k levé stěně. Pro 32" monitor chce deska hloubku 75+ cm, což ubírá ze zóny na židli — ten kompromis je tu vidět.' },
  { id: 'rameno-b', nazev: 'Monitor u gauče (rameno B)', popis: 'Sezení čelem k zadní stěně, gauč po pravé ruce. Rameno B musí být hluboké 75+ cm a monitor se před jeho konec vejde jen tak tak.' },
  { id: 'hranaty', nazev: 'Hranatý rám', popis: 'Tvůj favorit ve variantách: síla jeklu, barva komaxitu, tloušťka desky, odsazení. Jedna konstrukce, jiný výraz.' },
  { id: 'bocnice', nazev: 'Plné bočnice', popis: 'Silné panely ve stejné tloušťce jako deska, na stínové spáře, se zadním výztužným panelem. Vypadá to jako jeden kus nábytku.' },
  { id: 'hrany', nazev: 'Profily hran', popis: 'Pět stejných stolů, liší se jen hranou desky. V konfigurátoru je k tomu řez v měřítku — tady to vidíš na celém stole.' },
  { id: 'hloubky', nazev: 'Hloubky ramen', popis: 'Stejný stůl v různých hloubkách. Víc hloubky = dál od monitoru, ale míň místa na židli mezi stolem a lehátkem.' },
  { id: 'kontejner', nazev: 'Kde stojí kontejner', popis: 'Pevný kontejner se třemi zásuvkami na konci ramene A, na konci ramene B, nebo s čely v akcentní barvě.' },
]

/** Všechny presety jsou na maximum prostoru: 211 × 148 cm. Liší se hloubkou. */
const R = (p: Partial<Rozmery> = {}): Rozmery => ({
  ramenoADelka: MAX_RAMENO_A, ramenoAHloubka: 700,
  ramenoBDelka: 1480, ramenoBHloubka: 600,
  vyska: 750, mezeraKeGauci: 120, ...p,
})

const D = (p: Partial<Deska> = {}): Deska => ({
  materialId: 'dub-svetly-masiv', tloustka: 30, hrana: 'srazena',
  radiusRohu: 12, radiusVnitrni: 320, radiusUZdi: 160, vyrez: 0, ...p,
})

const P = (p: Partial<Podnoz> = {}): Podnoz => ({
  typ: 'ram-hranaty', profil: 40, odsazeni: 90, barva: '#1F2021',
  material: 'kov', mezilehlaPodpora: 'auto', vyztuha: true, ...p,
})

/** Plné bočnice — vždy ze stejného dřeva jako deska, malé odsazení. */
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
  mk({ id: 'ro-01', rodina: 'roh', nazev: 'Rohové pracoviště, dub 30',
    popis: 'Výchozí bod: dub 30 mm na hranatém rámu, vnitřní roh R320, roh u zdi R160 na kabely, kontejner na konci ramene A. Oči 78 cm od obrazovky.',
    rozmery: R(), deska: D(), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-02', rodina: 'roh', nazev: 'Velký oblouk R400',
    popis: 'Největší možný rádius vnitřního rohu — deska se kolem tebe obtočí, předloktí leží na obou ramenech. Oči 83 cm od obrazovky.',
    rozmery: R({ ramenoBHloubka: 650 }), deska: D({ radiusVnitrni: 400, radiusUZdi: 200 }),
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

  mk({ id: 'ro-06', rodina: 'roh', nazev: 'Tmavý dub 40 s nákližkem',
    popis: 'Tmavě mořený dub 40 mm s masivním nákližkem. Nejtěžší deska v galerii — rozpon zvládne i bez výztuhy.',
    rozmery: R(), deska: D({ materialId: 'dub-tmavy-masiv', tloustka: 40, hrana: 'naklizek', radiusRohu: 18, radiusVnitrni: 340 }),
    podnoz: P({ vyztuha: false }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-07', rodina: 'roh', nazev: 'Kouřový dub, bílý rám',
    popis: 'Tmavší deska a bílý komaxit — rám splyne se stěnou, deska vypadá, že se vznáší.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv' }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: K('B'), doplnky: DO() }),

  mk({ id: 'ro-08', rodina: 'roh', nazev: 'Dýha dub 25 — levnější roh',
    popis: 'Dýhovaná MDF 25 mm místo masivu. Na dlouhé rameno si sama přidá mezilehlou podporu.',
    rozmery: R(), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25 }),
    podnoz: P({ profil: 35 }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-09', rodina: 'roh', nazev: 'Roh s rohovou poličkou a LED',
    popis: 'Nástavec v rohu je pětiúhelníková polička, monitor stojí na ní. LED pásek pod přední hranou obou ramen.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv' }),
    podnoz: P(), ulozne: K('A'), doplnky: DO({ nastavecMonitor: true, ledPodsviceni: true }) }),

  mk({ id: 'ro-10', rodina: 'roh', nazev: 'Roh na dubových bočnicích',
    popis: 'Stejné rohové sezení, ale místo rámu plné dubové bočnice. Rohová podpora je vzadu u zdi, mezi koleny nic není.',
    rozmery: R(), deska: D(), podnoz: PB(),
    ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'ro-11', rodina: 'roh', nazev: 'Dub v tónu podlahy, antracitový rám',
    popis: 'Deska mořená do tónu vlysů, rám v antracitu místo černé. Stůl se v podlaze rozpustí, roh vypadá větší.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv' }),
    podnoz: P({ barva: '#33383B' }), ulozne: K('B'), doplnky: DO() }),

  mk({ id: 'ro-12', rodina: 'roh', nazev: 'Medový dub se zaoblenými hranami',
    popis: 'Teplý medový dub, zaoblená hrana R10 a rohy R30. Měkký, obytný tvar bez ostrých linek.',
    rozmery: R(), deska: D({ materialId: 'dub-medovy-masiv', hrana: 'radius', radiusRohu: 30 }),
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

  mk({ id: 'ra-03', rodina: 'rameno-a', nazev: 'Tmavý dub 30 u obrazu',
    popis: 'Tmavě mořený dub proti světlé stěně s obrazem. Hloubka 80, monitor u zdi, kontejner na konci ramene A.',
    rozmery: R({ ramenoAHloubka: 800 }), deska: D({ materialId: 'dub-tmavy-masiv', radiusVnitrni: 140, radiusUZdi: 80 }),
    podnoz: P({ profil: 45 }), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-04', rodina: 'rameno-a', nazev: 'Medový dub 40 na bočnicích, u obrazu',
    popis: 'Medový dub 40 mm s bočnicemi ve stejné síle a barvě. Sedí se u ramene A, kontejner pod ramenem B.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'dub-medovy-masiv', tloustka: 40, hrana: 'radius', radiusRohu: 20, radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB(), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-05', rodina: 'rameno-a', nazev: 'Rustikální dub 30 u obrazu',
    popis: 'Sukatý rustikální dub v tónu podlahy, zaoblená hrana, antracitový rám.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'dub-rustikal-masiv', hrana: 'radius', radiusRohu: 24, radiusVnitrni: 160, radiusUZdi: 120 }),
    podnoz: P({ barva: '#33383B' }), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-06', rodina: 'rameno-a', nazev: 'U obrazu s nástavcem a LED',
    popis: 'Monitor na nástavci u levé stěny, LED pod přední hranou. Kontejner na konci ramene A vedle sezení.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoA', nastavecMonitor: true, ledPodsviceni: true }) }),

  mk({ id: 'ra-07', rodina: 'rameno-a', nazev: 'Lamino dub Sherman 25 u obrazu',
    popis: 'Egger H1344 Feelwood: lamino nejblíž tónu podlahy, na hranatém rámu s výztuhou. Mezilehlá podpora se přidá sama.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'lamino-dub-sherman', tloustka: 25, hrana: 'rovna', radiusRohu: 6, radiusVnitrni: 100, radiusUZdi: 80 }),
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

  mk({ id: 'rb-03', rodina: 'rameno-b', nazev: 'U gauče, tmavý dub na bočnicích',
    popis: 'Tmavý dub 30 s bočnicemi ve stejné barvě, sezení u zadní stěny, kontejner na konci ramene A.',
    rozmery: R({ ramenoBHloubka: 760 }), deska: D({ materialId: 'dub-tmavy-masiv', radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  mk({ id: 'rb-04', rodina: 'rameno-b', nazev: 'U gauče, dub podlaha 38',
    popis: 'Deska 38 mm v tónu vlysů, rameno B 80 hluboké, bílý rám. Monitor u zadní stěny.',
    rozmery: R({ ramenoBHloubka: 800 }), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 38, radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: K('A'), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  // ---------- HRANATÝ RÁM ----------
  mk({ id: 'hr-01', rodina: 'hranaty', nazev: 'Jekl 50 × 50, dub 40',
    popis: 'Nejmasivnější provedení: silný jekl a deska 40 mm s nákližkem. Rám je vidět a má být vidět.',
    rozmery: R(), deska: D({ tloustka: 40, hrana: 'naklizek', radiusRohu: 16 }),
    podnoz: P({ profil: 50, odsazeni: 110 }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-02', rodina: 'hranaty', nazev: 'Jekl 30 × 30, subtilní',
    popis: 'Tenký jekl pod deskou 30 mm — rám skoro zmizí, deska dominuje. Výztuha pod deskou nese rozpon.',
    rozmery: R(), deska: D(),
    podnoz: P({ profil: 30, odsazeni: 80 }), ulozne: K('B', 0.95), doplnky: DO() }),

  mk({ id: 'hr-03', rodina: 'hranaty', nazev: 'Antracitový rám, dub v tónu podlahy',
    popis: 'Antracit (RAL 7016) místo černé — měkčí kontrast k mořenému dubu v tónu vlysů.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv' }),
    podnoz: P({ barva: '#33383B' }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-04', rodina: 'hranaty', nazev: 'Bílý rám, medový dub',
    popis: 'Bílý komaxit a teplý medový dub. Nejméně se hlásí o slovo, vynikne gauč a obraz.',
    rozmery: R(), deska: D({ materialId: 'dub-medovy-masiv', radiusRohu: 16 }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-05', rodina: 'hranaty', nazev: 'Nerezový rám, kouřový dub',
    popis: 'Kartáčovaný nerez pod tmavou deskou. Ladí s kovovými prvky konferenčního stolku.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv' }),
    podnoz: P({ barva: '#B9BCC0', profil: 40 }), ulozne: K('B', 0.95), doplnky: DO() }),

  mk({ id: 'hr-06', rodina: 'hranaty', nazev: 'Jekl 40, deska 40 bez výztuhy',
    popis: 'Masiv 40 mm unese rozpon i bez podélné výztuhy — pod deskou je jen rám, nic navíc.',
    rozmery: R(), deska: D({ tloustka: 40, hrana: 'zkosena', radiusRohu: 10 }),
    podnoz: P({ vyztuha: false }), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hr-07', rodina: 'hranaty', nazev: 'Jekl 60, velké odsazení',
    popis: 'Rámy zasunuté 18 cm pod desku. Deska přesahuje, stůl vypadá jako plovoucí, nohy nikde nepřekáží.',
    rozmery: R(), deska: D({ radiusRohu: 20 }),
    podnoz: P({ profil: 60, odsazeni: 180 }), ulozne: K('A'), doplnky: DO() }),

  // ---------- PLNÉ BOČNICE ----------
  mk({ id: 'bo-01', rodina: 'bocnice', nazev: 'Dubové bočnice, deska 30',
    popis: 'Deska i bočnice z dubu 30 mm, odsazení jen 6 cm — jeden rám, ne deska na nohách. Stínová spára u podlahy.',
    rozmery: R(), deska: D(), podnoz: PB(),
    ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'bo-02', rodina: 'bocnice', nazev: 'Tmavý dub 40 na bočnicích',
    popis: 'Silný tmavě mořený dub s nákližkem, bočnice 40 mm. Vypadá jako jeden kus nábytku, ne jako sestava.',
    rozmery: R(), deska: D({ materialId: 'dub-tmavy-masiv', tloustka: 40, hrana: 'naklizek', radiusRohu: 14 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'bo-03', rodina: 'bocnice', nazev: 'Dub v tónu podlahy, deska 38',
    popis: 'Tloušťka 38 jako u kuchyňských pracovních desek — bočnice stejné síly. Stůl se v podlaze rozpustí.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 38 }),
    podnoz: PB(), ulozne: K('B', 0.95), doplnky: DO() }),

  mk({ id: 'bo-04', rodina: 'bocnice', nazev: 'Medový dub na bočnicích, monitor u obrazu',
    popis: 'Bočnice s klasickým sezením u ramene A. Panel v místě napojení ramen kryje kolena zprava.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'dub-medovy-masiv', radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB(), ulozne: K('B', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'bo-05', rodina: 'bocnice', nazev: 'Dýhované bočnice, deska 25',
    popis: 'Dýhovaná MDF 25 mm na desce i bočnicích — levnější, mezilehlý panel si rozpon vyžádá sám.',
    rozmery: R(), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'bo-06', rodina: 'bocnice', nazev: 'Kouřový dub, bočnice i kontejner u gauče',
    popis: 'Tmavý kouřový dub všude: deska, bočnice i kontejner na konci ramene B vedle lehátka.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv' }),
    podnoz: PB(), ulozne: K('B', 1.0), doplnky: DO() }),

  mk({ id: 'bo-07', rodina: 'bocnice', nazev: 'Rustikální dub, zaoblené hrany',
    popis: 'Sukatý dub 30 se zaoblenou hranou R10 a rohy R30. Měkčí, obytnější tvar.',
    rozmery: R(), deska: D({ materialId: 'dub-rustikal-masiv', hrana: 'radius', radiusRohu: 30 }),
    podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  // ---------- PROFILY HRAN ----------
  mk({ id: 'hn-01', rodina: 'hrany', nazev: 'Hrana rovná (ABS)',
    popis: 'Pravoúhlá hrana s nalepenou páskou. Nejlevnější, nejtvrdší, nejvíc „z obchodu". Na dubu 30 mm působí jako lamino.',
    rozmery: R(), deska: D({ hrana: 'rovna', radiusRohu: 6 }), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-02', rodina: 'hrany', nazev: 'Hrana sražená (fazetka)',
    popis: 'Rohy hrany zbroušené o 2–3 mm. Neutrální standard, z metru nepoznáš, zblízka nekouše.',
    rozmery: R(), deska: D({ hrana: 'srazena' }), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-03', rodina: 'hrany', nazev: 'Hrana zkosená 45°',
    popis: 'Velký klín shora i zespodu, čelo se zúží na pár milimetrů. Deska 30 mm vypadá tenká a ostrá, sedí k hranatému rámu.',
    rozmery: R(), deska: D({ hrana: 'zkosena', radiusRohu: 8 }), podnoz: P(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-04', rodina: 'hrany', nazev: 'Hrana zaoblená R10',
    popis: 'Zakulacená nahoře i dole. Nejpříjemnější pod předloktím, nejobytnější — k bočnicím sedí nejvíc.',
    rozmery: R(), deska: D({ hrana: 'radius', radiusRohu: 24 }), podnoz: PB(), ulozne: K('A'), doplnky: DO() }),

  mk({ id: 'hn-05', rodina: 'hrany', nazev: 'Masivní nákližek na dýze',
    popis: 'Dýhovaná deska s nalepeným pruhem masivu na čele. Na hraně vidíš pravé dřevo, cena je mezi dýhou a masivem.',
    rozmery: R(), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25, hrana: 'naklizek', radiusRohu: 16 }), podnoz: P({ profil: 35 }), ulozne: K('A'), doplnky: DO() }),

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
