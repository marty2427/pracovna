import type { DeskConfig, Deska, Podnoz, Ulozne, Doplnky, Rozmery } from '@/model/types'
import { MAX_RAMENO_A } from '@/model/space'

export interface Rodina {
  id: string
  nazev: string
  popis: string
}

/**
 * Presety po zúžení zadání: JEN dřevo a dřevěné dekory, podnož jen hranatý
 * profil nebo plné bočnice. Rodiny se liší tím, co v místnosti opravdu
 * rozhoduje — kde stojí monitor, jaká podnož, kolik úložného, jak velký stůl.
 */
export const RODINY: Rodina[] = [
  { id: 'roh', nazev: 'Monitor v rohu', popis: 'Sedí se na úhlopříčce, deska se kolem tebe obtočí velkým rádiusem. Roh L, který je jinak mrtvý, dělá práci — a 32" monitor tam má na oči nejvíc místa.' },
  { id: 'rameno-a', nazev: 'Monitor u obrazu (rameno A)', popis: 'Klasické sezení čelem k levé stěně. Pro 32" monitor chce deska hloubku 75+ cm, což ubírá ze zóny na židli — ten kompromis je tu vidět.' },
  { id: 'rameno-b', nazev: 'Monitor u gauče (rameno B)', popis: 'Sezení čelem k zadní stěně, gauč po pravé ruce. Rameno B musí být hluboké 75+ cm, takže je to spíš druhý stůl než hlavní plocha.' },
  { id: 'hranaty', nazev: 'Hranatý rám', popis: 'Tvůj favorit ve variantách: síla jeklu, barva komaxitu, tloušťka desky, odsazení. Jedna konstrukce, jiný výraz.' },
  { id: 'bocnice', nazev: 'Plné bočnice', popis: 'Silné panely ve stejné tloušťce jako deska, na stínové spáře, se zadním výztužným panelem. Ne bočnice z kancelářského stolu z 90. let.' },
  { id: 'ulozne', nazev: 'Zásuvky a kontejnery', popis: 'Kam s věcmi: pojezdový nebo pevný kontejner, ploché zásuvky, skříňka, police, zadní panel.' },
  { id: 'kompakt', nazev: 'Kompaktní 160–200', popis: 'Kratší rameno A, mělčí deska. Když nechceš zabrat celý roh — pořád se sedí v rohu u monitoru.' },
  { id: 'rovna', nazev: 'Rovná deska', popis: 'Bez ramene B, jen běh podél levé stěny. Alternativa, kdyby sis L rozmyslel.' },
]

/**
 * Výchozí rozměry presetů. Záměrně NEJSOU na maximu prostoru (211 × 148 cm) —
 * stůl nemusí roh vyplnit celý a kratší deska je levnější i lehčí na pohled.
 * Presety, které maximum opravdu využívají, si délku nastaví samy.
 */
const R = (p: Partial<Rozmery> = {}): Rozmery => ({
  ramenoADelka: 2000, ramenoAHloubka: 700,
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

/** Plné bočnice ze stejného dřeva jako deska, malé odsazení. */
const PB = (materialId: string, p: Partial<Podnoz> = {}): Podnoz =>
  P({ typ: 'bocnice', material: 'drevo', materialId, odsazeni: 60, ...p })

const U = (typ: Ulozne['typ'], rameno: Ulozne['rameno'] = 'A', pozice = 0.9, extra: Partial<Ulozne> = {}): Ulozne[] =>
  typ === 'nic' ? [] : [{ typ, rameno, pozice, ...extra }]

const DO = (p: Partial<Doplnky> = {}): Doplnky => ({
  kabelovaLavka: true, pruchodka: 'zadna', ledPodsviceni: false,
  nastavecMonitor: false, zadniPanel: false, monitorUmisteni: 'roh', monitorPosun: 0, ...p,
})

type Vstup = Omit<DeskConfig, 'tvar'> & { tvar?: DeskConfig['tvar'] }
const mk = (v: Vstup): DeskConfig => ({ tvar: 'L', ...v })

export const PRESETY: DeskConfig[] = [
  // ---------- MONITOR V ROHU ----------
  mk({ id: 'ro-01', rodina: 'roh', nazev: 'Rohové pracoviště, dub 30',
    popis: 'Výchozí bod: dub 30 mm na hranatém rámu, vnitřní roh R320, roh u zdi R160 na kabely. Oči vychází 78 cm od obrazovky.',
    rozmery: R(), deska: D(), podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'ro-02', rodina: 'roh', nazev: 'Velký oblouk R400',
    popis: 'Největší možný rádius vnitřního rohu — deska se kolem tebe obtočí, předloktí leží na obou ramenech. Oči 83 cm od obrazovky.',
    rozmery: R({ ramenoBHloubka: 650 }), deska: D({ radiusVnitrni: 400, radiusUZdi: 200 }),
    podnoz: P(), ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'ro-03', rodina: 'roh', nazev: 'Roh bez mezery u zdi, s průchodkou',
    popis: 'Deska vyplní roh celý; kabely od monitoru jdou dolů kulatou průchodkou za stojanem.',
    rozmery: R(), deska: D({ radiusUZdi: 0, radiusVnitrni: 300 }),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO({ pruchodka: 'kulata' }) }),

  mk({ id: 'ro-04', rodina: 'roh', nazev: 'Hlubší ramena 75 / 70',
    popis: 'O 5 cm hlubší obě ramena: oči 88 cm od obrazovky, ale zóna na židli klesne na 85 cm.',
    rozmery: R({ ramenoAHloubka: 750, ramenoBHloubka: 700 }), deska: D(),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'ro-05', rodina: 'roh', nazev: 'Mělká ramena 65 / 55',
    popis: 'Nejmělčí deska, která v rohu ještě dá 70 cm na oči. Zóna na židli 95 cm, stůl vyčnívá nejmíň.',
    rozmery: R({ ramenoAHloubka: 650, ramenoBHloubka: 550 }), deska: D({ radiusVnitrni: 360 }),
    podnoz: P({ profil: 35 }), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO() }),

  mk({ id: 'ro-06', rodina: 'roh', nazev: 'Roh na maximum 211 × 148',
    popis: 'Rameno A až na 25 cm od hrany průchodu. Nejvíc plochy, nejdelší rozpon — proto masiv 30 s výztuhou.',
    rozmery: R({ ramenoADelka: MAX_RAMENO_A }), deska: D(),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.92), doplnky: DO() }),

  mk({ id: 'ro-07', rodina: 'roh', nazev: 'Roh 180 cm',
    popis: 'Rameno A jen 180 cm — od hrany průchodu zbude 56 cm a stůl je na pohled lehčí. V rohu se sedí stejně pohodlně.',
    rozmery: R({ ramenoADelka: 1800 }), deska: D(),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'ro-08', rodina: 'roh', nazev: 'Ořech 40 s nákližkem',
    popis: 'Tmavý ořech 40 mm s masivním nákližkem. Nejtěžší a nejdražší deska v galerii — ale rozpon zvládne i bez výztuhy.',
    rozmery: R(), deska: D({ materialId: 'orech-masiv', tloustka: 40, hrana: 'naklizek', radiusRohu: 18, radiusVnitrni: 340 }),
    podnoz: P({ vyztuha: false }), ulozne: U('kontejner-pevny', 'A', 0.95), doplnky: DO() }),

  mk({ id: 'ro-09', rodina: 'roh', nazev: 'Kouřový dub, bílý rám',
    popis: 'Tmavší deska a bílý komaxit — rám splyne se stěnou, deska vypadá, že se vznáší.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv' }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'ro-10', rodina: 'roh', nazev: 'Dýha dub 25 — levnější roh',
    popis: 'Dýhovaná MDF 25 mm místo masivu. Na dlouhé rameno si sama přidá mezilehlou podporu.',
    rozmery: R(), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25, hrana: 'srazena' }),
    podnoz: P({ profil: 35 }), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO() }),

  mk({ id: 'ro-11', rodina: 'roh', nazev: 'Roh s rohovou poličkou a LED',
    popis: 'Nástavec v rohu je pětiúhelníková polička, monitor stojí na ní. LED pásek pod přední hranou obou ramen.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv' }),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO({ nastavecMonitor: true, ledPodsviceni: true }) }),

  mk({ id: 'ro-12', rodina: 'roh', nazev: 'Roh na dubových bočnicích',
    popis: 'Stejné rohové sezení, ale místo rámu plné dubové bočnice. Rohová podpora je vzadu u zdi, mezi koleny nic není.',
    rozmery: R(), deska: D(), podnoz: PB('dub-svetly-masiv'),
    ulozne: U('kontejner-pevny', 'A', 0.95), doplnky: DO() }),

  // ---------- MONITOR U OBRAZU (RAMENO A) ----------
  mk({ id: 'ra-01', rodina: 'rameno-a', nazev: 'Čelem k obrazu, hloubka 75',
    popis: 'Monitor u levé stěny. Aby oči byly aspoň 70 cm od obrazovky, musí mít deska 75 cm — zóna na židli tím klesne na 85 cm.',
    rozmery: R({ ramenoAHloubka: 750 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-02', rodina: 'rameno-a', nazev: 'Hloubka 80 s výřezem pro předloktí',
    popis: 'Deska 80 cm hluboká a v místě sezení výřez 6 cm. Předloktí leží na desce, oči přesně 70 cm od obrazovky.',
    rozmery: R({ ramenoAHloubka: 800 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100, vyrez: 60 }),
    podnoz: P(), ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-03', rodina: 'rameno-a', nazev: 'Ořech 30 u obrazu',
    popis: 'Tmavý ořech proti světlé stěně s obrazem. Hloubka 80, monitor u zdi.',
    rozmery: R({ ramenoAHloubka: 800 }), deska: D({ materialId: 'orech-masiv', radiusVnitrni: 140, radiusUZdi: 80 }),
    podnoz: P({ profil: 45 }), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-04', rodina: 'rameno-a', nazev: 'Jasan 40 na bočnicích, u obrazu',
    popis: 'Světlý jasan 40 mm s bočnicemi ve stejné síle. Sedí se u ramene A, kontejner pod ramenem B.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'jasan-masiv', tloustka: 40, hrana: 'radius', radiusRohu: 20, radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB('jasan-masiv'), ulozne: U('kontejner-pevny', 'B', 0.9), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-05', rodina: 'rameno-a', nazev: 'U obrazu, zásuvky na konci ramene',
    popis: 'Dvě ploché zásuvky až na konci ramene A, mimo kolena. Police pod ramenem B na tiskárnu nebo šanony.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-06', rodina: 'rameno-a', nazev: 'Buk 30 u obrazu',
    popis: 'Teplý buk, zaoblená hrana. Světlá, obytná varianta.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'buk-masiv', hrana: 'radius', radiusRohu: 24, radiusVnitrni: 160, radiusUZdi: 120 }),
    podnoz: P({ barva: '#33383B' }), ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-07', rodina: 'rameno-a', nazev: 'U obrazu na 211 cm',
    popis: 'Nejdelší rameno A a monitor u zdi. Sezení uprostřed dlouhé desky, po obou stranách metr plochy.',
    rozmery: R({ ramenoADelka: MAX_RAMENO_A, ramenoAHloubka: 760 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'ra-08', rodina: 'rameno-a', nazev: 'Lamino teplý dub 25 u obrazu',
    popis: 'Nejlevnější deska v galerii na hranatém rámu s výztuhou. Mezilehlá podpora se přidá sama.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'lamino-dub-teply', tloustka: 25, hrana: 'rovna', radiusRohu: 6, radiusVnitrni: 100, radiusUZdi: 80 }),
    podnoz: P({ profil: 35 }), ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  // ---------- MONITOR U GAUČE (RAMENO B) ----------
  mk({ id: 'rb-01', rodina: 'rameno-b', nazev: 'Čelem k zadní stěně, rameno B 75',
    popis: 'Monitor u zadní stěny, gauč po pravé ruce. Rameno B musí být 75 cm hluboké; rameno A zůstává odkládací plocha.',
    rozmery: R({ ramenoBHloubka: 750 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100 }),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  mk({ id: 'rb-02', rodina: 'rameno-b', nazev: 'U gauče s výřezem, hloubka 80',
    popis: 'Rameno B 80 cm hluboké s výřezem 6 cm v místě sezení. Oči 70 cm od obrazovky.',
    rozmery: R({ ramenoBHloubka: 800 }), deska: D({ radiusVnitrni: 120, radiusUZdi: 100, vyrez: 60 }),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  mk({ id: 'rb-03', rodina: 'rameno-b', nazev: 'U gauče, ořechové bočnice',
    popis: 'Ořech 30 na ořechových bočnicích, sezení u zadní stěny.',
    rozmery: R({ ramenoBHloubka: 760 }), deska: D({ materialId: 'orech-masiv', radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB('orech-masiv'), ulozne: U('kontejner-pevny', 'A', 0.95), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  mk({ id: 'rb-04', rodina: 'rameno-b', nazev: 'U gauče, rameno B kratší a hluboké',
    popis: 'Rameno B jen 130 cm, zato 80 cm hluboké — ke gauči zbude 30 cm a rameno A dostane víc prostoru pro kolena.',
    rozmery: R({ ramenoBDelka: 1300, ramenoBHloubka: 800, mezeraKeGauci: 250 }), deska: D({ radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: P(), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO({ monitorUmisteni: 'ramenoB' }) }),

  // ---------- HRANATÝ RÁM ----------
  mk({ id: 'hr-01', rodina: 'hranaty', nazev: 'Jekl 50 × 50, dub 40',
    popis: 'Nejmasivnější provedení: silný jekl a deska 40 mm s nákližkem. Rám je vidět a má být vidět.',
    rozmery: R(), deska: D({ tloustka: 40, hrana: 'naklizek', radiusRohu: 16 }),
    podnoz: P({ profil: 50, odsazeni: 110 }), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'hr-02', rodina: 'hranaty', nazev: 'Jekl 30 × 30, subtilní',
    popis: 'Tenký jekl pod deskou 30 mm — rám skoro zmizí, deska dominuje. Výztuha pod deskou nese rozpon.',
    rozmery: R(), deska: D(),
    podnoz: P({ profil: 30, odsazeni: 80 }), ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'hr-03', rodina: 'hranaty', nazev: 'Antracitový rám, dub v tónu podlahy',
    popis: 'Antracit (RAL 7016) místo černé — měkčí kontrast k mořenému dubu v tónu vlysů.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv' }),
    podnoz: P({ barva: '#33383B' }), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'hr-04', rodina: 'hranaty', nazev: 'Bílý rám, jasan',
    popis: 'Bílý komaxit a nejsvětlejší dřevo. Nejméně se hlásí o slovo, vynikne gauč a obraz.',
    rozmery: R(), deska: D({ materialId: 'jasan-masiv', radiusRohu: 16 }),
    podnoz: P({ barva: '#E8E6E1' }), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO() }),

  mk({ id: 'hr-05', rodina: 'hranaty', nazev: 'Nerezový rám, kouřový dub',
    popis: 'Kartáčovaný nerez pod tmavou deskou. Ladí s kovovými prvky konferenčního stolku.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv' }),
    podnoz: P({ barva: '#B9BCC0', profil: 40 }), ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'hr-06', rodina: 'hranaty', nazev: 'Jekl 40, deska 40 bez výztuhy',
    popis: 'Masiv 40 mm unese rozpon i bez podélné výztuhy — pod deskou je jen rám, nic navíc.',
    rozmery: R(), deska: D({ tloustka: 40, hrana: 'zkosena', radiusRohu: 10 }),
    podnoz: P({ vyztuha: false }), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'hr-07', rodina: 'hranaty', nazev: 'Jekl 60, velké odsazení',
    popis: 'Rámy zasunuté 18 cm pod desku. Deska přesahuje, stůl vypadá jako plovoucí, nohy nikde nepřekáží.',
    rozmery: R(), deska: D({ radiusRohu: 20 }),
    podnoz: P({ profil: 60, odsazeni: 180 }), ulozne: U('nic'), doplnky: DO() }),

  // ---------- PLNÉ BOČNICE ----------
  mk({ id: 'bo-01', rodina: 'bocnice', nazev: 'Dubové bočnice, deska 30',
    popis: 'Deska i bočnice z dubu 30 mm, odsazení jen 6 cm — jeden rám, ne deska na nohách. Stínová spára u podlahy.',
    rozmery: R(), deska: D(), podnoz: PB('dub-svetly-masiv'),
    ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'bo-02', rodina: 'bocnice', nazev: 'Ořech 40 na bočnicích',
    popis: 'Silný ořech s nákližkem, bočnice 40 mm. Vypadá jako jeden kus nábytku, ne jako sestava.',
    rozmery: R(), deska: D({ materialId: 'orech-masiv', tloustka: 40, hrana: 'naklizek', radiusRohu: 14 }),
    podnoz: PB('orech-masiv'), ulozne: U('kontejner-pevny', 'A', 0.95), doplnky: DO() }),

  mk({ id: 'bo-03', rodina: 'bocnice', nazev: 'Dub v tónu podlahy, deska 38',
    popis: 'Tloušťka 38 jako u kuchyňských pracovních desek — bočnice stejné síly. Stůl se v podlaze rozpustí.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 38 }),
    podnoz: PB('dub-podlaha-masiv'), ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'bo-04', rodina: 'bocnice', nazev: 'Jasanové bočnice, monitor u obrazu',
    popis: 'Bočnice s klasickým sezením u ramene A. Panel v místě napojení ramen kryje kolena zprava.',
    rozmery: R({ ramenoAHloubka: 760 }), deska: D({ materialId: 'jasan-masiv', radiusVnitrni: 140, radiusUZdi: 100 }),
    podnoz: PB('jasan-masiv'), ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'bo-05', rodina: 'bocnice', nazev: 'Dýhované bočnice, deska 25',
    popis: 'Dýhovaná MDF 25 mm na desce i bočnicích — levnější, mezilehlý panel si rozpon vyžádá sám.',
    rozmery: R(), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25 }),
    podnoz: PB('dyha-dub-svetla'), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO() }),

  mk({ id: 'bo-06', rodina: 'bocnice', nazev: 'Bočnice s pevným kontejnerem',
    popis: 'Pevný kontejner na konci ramene A zapadne mezi bočnice — uzavřený celek.',
    rozmery: R(), deska: D(), podnoz: PB('dub-svetly-masiv'),
    ulozne: U('kontejner-pevny', 'A', 1.0), doplnky: DO() }),

  mk({ id: 'bo-07', rodina: 'bocnice', nazev: 'Buk, zaoblené hrany',
    popis: 'Buk 30 se zaoblenou hranou R8 a rohy R30. Měkčí, obytnější tvar.',
    rozmery: R(), deska: D({ materialId: 'buk-masiv', hrana: 'radius', radiusRohu: 30 }),
    podnoz: PB('buk-masiv'), ulozne: U('nic'), doplnky: DO() }),

  // ---------- ZÁSUVKY A KONTEJNERY ----------
  mk({ id: 'ul-01', rodina: 'ulozne', nazev: 'Pojezdový kontejner pod ramenem A',
    popis: 'Tři zásuvky na kolečkách na konci ramene A. Dá se vytáhnout, když je potřeba víc místa na nohy.',
    rozmery: R(), deska: D(), podnoz: P(),
    ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'ul-02', rodina: 'ulozne', nazev: 'Pevný kontejner u gauče',
    popis: 'Pevný kontejner na konci ramene B — hned vedle lehátka gauče, mimo sezení v rohu.',
    rozmery: R(), deska: D(), podnoz: P(),
    ulozne: U('kontejner-pevny', 'B', 0.95), doplnky: DO() }),

  mk({ id: 'ul-03', rodina: 'ulozne', nazev: 'Dvě ploché zásuvky pod deskou',
    popis: 'Ploché zásuvky na drobnosti na konci ramene A. Berou 8 cm výšky pod deskou, kolena mají pořád 64 cm.',
    rozmery: R(), deska: D(), podnoz: P(),
    ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO() }),

  mk({ id: 'ul-04', rodina: 'ulozne', nazev: 'Skříňka s dvířky u gauče',
    popis: 'Uzavřená skříňka pod ramenem B na tiskárnu nebo papír. Dvířka s frézovaným úchytem.',
    rozmery: R(), deska: D(), podnoz: P(),
    ulozne: U('skrinka', 'B', 0.95), doplnky: DO() }),

  mk({ id: 'ul-05', rodina: 'ulozne', nazev: 'Otevřená police pod ramenem B',
    popis: 'Dvě police pod ramenem B na šanony a knihy. Bez čel, nejlevnější úložné.',
    rozmery: R(), deska: D(), podnoz: P(),
    ulozne: U('police', 'B', 0.95), doplnky: DO() }),

  mk({ id: 'ul-06', rodina: 'ulozne', nazev: 'Zadní panel po obou stěnách',
    popis: 'Nízký panel podél obou stěn schová kabely a zásuvky na stěně. Deska pak nemusí sedět přesně ke zdi.',
    rozmery: R(), deska: D({ radiusUZdi: 0 }), podnoz: P(),
    ulozne: U('zadni-panel', 'A', 0), doplnky: DO() }),

  // ---------- KOMPAKTNÍ ----------
  mk({ id: 'km-01', rodina: 'kompakt', nazev: '180 × 148 v rohu',
    popis: 'Rameno A 180 cm. Od hrany průchodu zbude 56 cm, sezení v rohu je stejné.',
    rozmery: R({ ramenoADelka: 1800 }), deska: D(), podnoz: P(),
    ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO() }),

  mk({ id: 'km-02', rodina: 'kompakt', nazev: '180 × 130, mělčí',
    popis: 'Kratší obě ramena a mělčí deska 65 / 55. Ke gauči zbude 30 cm, zóna na židli 95 cm.',
    rozmery: R({ ramenoADelka: 1800, ramenoBDelka: 1300, ramenoAHloubka: 650, ramenoBHloubka: 550, mezeraKeGauci: 250 }),
    deska: D({ radiusVnitrni: 360 }), podnoz: P({ profil: 35 }),
    ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'km-03', rodina: 'kompakt', nazev: '200 × 148, hloubka 60 / 55',
    popis: 'Plná délka, ale mělká deska — do místnosti vyčnívá jen 60 cm. V rohu vyjde na oči přesně 70 cm — díky velkému rádiusu R400.',
    rozmery: R({ ramenoAHloubka: 600, ramenoBHloubka: 550 }), deska: D({ radiusVnitrni: 400 }),
    podnoz: P({ profil: 35 }), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO() }),

  mk({ id: 'km-04', rodina: 'kompakt', nazev: '160 × 148 minimum',
    popis: 'Nejkratší rameno A, které ještě dává smysl. Od hrany průchodu zbude 76 cm.',
    rozmery: R({ ramenoADelka: 1600 }), deska: D(), podnoz: P({ profil: 35 }),
    ulozne: U('nic'), doplnky: DO() }),

  // ---------- ROVNÁ DESKA ----------
  mk({ id: 'rv-01', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná 200 × 75 u obrazu',
    popis: 'Bez ramene B. Monitor u levé stěny, deska 75 cm hluboká kvůli vzdálenosti očí.',
    rozmery: R({ ramenoBDelka: 0, ramenoAHloubka: 750 }), deska: D({ radiusVnitrni: 0, radiusUZdi: 60 }),
    podnoz: P(), ulozne: U('kontejner-3', 'A', 0.9), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),

  mk({ id: 'rv-02', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná 211 × 80 s výřezem',
    popis: 'Nejdelší rovná deska, 80 cm hluboká, s výřezem v místě sezení. Bočnice z dubu.',
    rozmery: R({ ramenoADelka: MAX_RAMENO_A, ramenoBDelka: 0, ramenoAHloubka: 800 }), deska: D({ radiusVnitrni: 0, radiusUZdi: 60, vyrez: 60 }),
    podnoz: PB('dub-svetly-masiv'), ulozne: U('zasuvky-2', 'A', 1.0), doplnky: DO({ monitorUmisteni: 'ramenoA' }) }),
]

export const presetPodleId = (id: string) => PRESETY.find((p) => p.id === id)
