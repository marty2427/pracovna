import type { DeskConfig, Deska, Podnoz, Ulozne, Doplnky, Rozmery } from '@/model/types'
import { MAX_RAMENO_A } from '@/model/space'

export interface Rodina {
  id: string
  nazev: string
  popis: string
}

export const RODINY: Rodina[] = [
  { id: 'truhlar', nazev: 'Truhlářský masiv', popis: 'Silná masivní deska, masivní nákližek, dřevěné bočnice a traverzy. Nejdražší, ale vypadá to jako nábytek, ne jako sestava dílů.' },
  { id: 'skandi', nazev: 'Skandinávský / IKEA hack', popis: 'Dýhovaná nebo lamino deska z katalogu na kónických nohách nebo zásuvkové jednotce. Nejlevnější cesta k slušnému vzhledu.' },
  { id: 'industrial', nazev: 'Industriál kov + masiv', popis: 'Jeklové rámy v černém komaxitu pod silnou dřevěnou deskou. Nejsilnější vazba na černé rámy fotek a židli v místnosti.' },
  { id: 'kontejner', nazev: 'S kontejnerem', popis: 'Zásuvky pod ramenem B. Kontejner buď stojí vedle, nebo přímo nese desku.' },
  { id: 'panel', nazev: 'Se zadním panelem', popis: 'Zadní panel a police nad ramenem B. Schová kabely a udělá ze stolu uzavřený celek.' },
  { id: 'plovouci', nazev: 'Minimalistický plovoucí', popis: 'Tenká deska, subtilní podnož, LED podsvícení. Stůl se v místnosti co nejmíň hlásí o slovo.' },
  { id: 'kompakt', nazev: 'Kompaktní do rohu', popis: 'Kratší ramena a mělčí deska. Když nechceš zabrat celý roh.' },
  { id: 'rovna', nazev: 'Rovná deska', popis: 'Bez ramene B, jen běh podél levé stěny. Alternativa, kdyby sis L rozmyslel.' },
  { id: 'polohovatelny', nazev: 'Kancelářský polohovatelný', popis: 'Elektricky stavitelné rámy. Zvolil sis pevnou výšku, takže je to tu jen pro srovnání.' },
]

const R = (p: Partial<Rozmery> = {}): Rozmery => ({
  ramenoADelka: 2110, ramenoAHloubka: 700,
  ramenoBDelka: 1480, ramenoBHloubka: 550,
  vyska: 750, mezeraKeGauci: 120, ...p,
})

const D = (p: Partial<Deska> = {}): Deska => ({
  materialId: 'dub-svetly-masiv', tloustka: 30, hrana: 'srazena',
  radiusRohu: 12, radiusVnitrni: 90, vyrez: 0, ...p,
})

const P = (p: Partial<Podnoz> = {}): Podnoz => ({
  typ: 'ram-U', profil: 40, odsazeni: 90, barva: '#1F2021',
  material: 'kov', mezilehlaPodpora: 'auto', vyztuha: true, ...p,
})

const U = (typ: Ulozne['typ'], rameno: Ulozne['rameno'] = 'B', pozice = 0.85, extra: Partial<Ulozne> = {}): Ulozne[] =>
  typ === 'nic' ? [] : [{ typ, rameno, pozice, ...extra }]

const DO = (p: Partial<Doplnky> = {}): Doplnky => ({
  kabelovaLavka: true, pruchodka: 'kulata', ledPodsviceni: false,
  nastavecMonitor: false, zadniPanel: false, tiskarnaVRohu: true, ...p,
})

type Vstup = Omit<DeskConfig, 'tvar'> & { tvar?: DeskConfig['tvar'] }
const mk = (v: Vstup): DeskConfig => ({ tvar: 'L', ...v })

export const PRESETY: DeskConfig[] = [
  // ---------- TRUHLÁŘSKÝ MASIV ----------
  mk({ id: 'tr-01', rodina: 'truhlar', nazev: 'Dubová deska 40 na bočnicích',
    popis: 'Spárovka 40 mm s masivním nákližkem, plné dubové bočnice. Nejtěžší a nejtišší varianta.',
    rozmery: R(), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 40, hrana: 'naklizek', radiusRohu: 20, radiusVnitrni: 140 }),
    podnoz: P({ typ: 'bocnice', material: 'drevo', materialId: 'dub-svetly-masiv', profil: 40, odsazeni: 140 }),
    ulozne: U('kontejner-pevny'), doplnky: DO({ pruchodka: 'obdelnikova' }) }),

  mk({ id: 'tr-02', rodina: 'truhlar', nazev: 'Jasan 40 na kozách',
    popis: 'Jasanová deska na dřevěných kozách s příčkou. Odkazuje na truhlářský ponk.',
    rozmery: R({ ramenoBDelka: 1400 }), deska: D({ materialId: 'jasan-masiv', tloustka: 40, hrana: 'zkosena', radiusRohu: 16, radiusVnitrni: 120 }),
    podnoz: P({ typ: 'kozy', material: 'drevo', materialId: 'jasan-masiv', profil: 55, odsazeni: 180 }),
    ulozne: U('zasuvka-plocha', 'A', 0.35), doplnky: DO() }),

  mk({ id: 'tr-03', rodina: 'truhlar', nazev: 'Kouřový dub, kónické nohy',
    popis: 'Tmavší mořený dub na kónických nohách. Stůl se opticky odsadí od podlahy.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv', tloustka: 30, hrana: 'radius', radiusRohu: 24, radiusVnitrni: 160, vyrez: 110 }),
    podnoz: P({ typ: 'nohy-konicke', material: 'drevo', materialId: 'dub-kourovy-masiv', profil: 60, odsazeni: 110 }),
    ulozne: U('kontejner-3'), doplnky: DO({ ledPodsviceni: true }) }),

  mk({ id: 'tr-04', rodina: 'truhlar', nazev: 'Ořech 30 se zásuvkou',
    popis: 'Ořechová deska, plochá zásuvka pod hlavní plochou na drobnosti.',
    rozmery: R({ ramenoAHloubka: 720 }), deska: D({ materialId: 'orech-masiv', tloustka: 30, hrana: 'srazena', radiusRohu: 10, radiusVnitrni: 100 }),
    podnoz: P({ typ: 'nohy-rovne', material: 'drevo', materialId: 'orech-masiv', profil: 65, odsazeni: 100 }),
    ulozne: U('zasuvka-plocha', 'A', 0.4), doplnky: DO({ nastavecMonitor: true }) }),

  mk({ id: 'tr-05', rodina: 'truhlar', nazev: 'Dub v tónu podlahy',
    popis: 'Deska mořená do tónu vlysů — stůl se v podlaze rozpustí a roh vypadá větší.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 40, hrana: 'naklizek', radiusRohu: 18, radiusVnitrni: 130 }),
    podnoz: P({ typ: 'bocnice', material: 'drevo', materialId: 'dub-podlaha-masiv', odsazeni: 150 }),
    ulozne: U('skrinka', 'B', 0.9), doplnky: DO() }),

  mk({ id: 'tr-06', rodina: 'truhlar', nazev: 'Buk 30, šikmé nohy',
    popis: 'Buková deska na rozkročených nohách. Světlý, obytný, ne kancelářský.',
    rozmery: R({ ramenoADelka: 2000 }), deska: D({ materialId: 'buk-masiv', tloustka: 30, hrana: 'radius', radiusRohu: 30, radiusVnitrni: 180, vyrez: 125 }),
    podnoz: P({ typ: 'nohy-sikme', material: 'drevo', materialId: 'buk-masiv', profil: 55, odsazeni: 120 }),
    ulozne: U('police', 'B', 0.85), doplnky: DO({ kabelovaLavka: false }) }),

  // ---------- SKANDINÁVSKÝ / IKEA HACK ----------
  mk({ id: 'sk-01', rodina: 'skandi', nazev: 'Dýhovaná deska na kónických nohách',
    popis: 'Dýhovaná MDF 25 mm a kónické nohy. Nejjednodušší cesta ke skandinávskému vzhledu.',
    rozmery: R({ ramenoAHloubka: 650 }), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25, hrana: 'srazena', radiusRohu: 14, radiusVnitrni: 110 }),
    podnoz: P({ typ: 'nohy-konicke', material: 'drevo', materialId: 'dub-svetly-masiv', profil: 50, odsazeni: 90 }),
    ulozne: U('kontejner-3'), doplnky: DO({ ledPodsviceni: false }) }),

  mk({ id: 'sk-02', rodina: 'skandi', nazev: 'Deska na zásuvkové jednotce',
    popis: 'Klasický IKEA hack: deska položená na zásuvkové jednotce a jednom rámu.',
    rozmery: R({ ramenoBDelka: 1420 }), deska: D({ materialId: 'lamino-dub-svetly', tloustka: 25, hrana: 'rovna', radiusRohu: 8, radiusVnitrni: 80 }),
    podnoz: P({ typ: 'kontejner-nosny', profil: 35, odsazeni: 70 }),
    ulozne: U('kontejner-pevny', 'B', 0.9), doplnky: DO() }),

  mk({ id: 'sk-03', rodina: 'skandi', nazev: 'Bílé nohy, světlá deska',
    popis: 'Bílá podnož a světlý dekor. Nejvíc splyne se stěnou, nejmíň se hlásí o pozornost.',
    rozmery: R({ ramenoAHloubka: 620 }), deska: D({ materialId: 'lamino-dub-svetly', tloustka: 25, hrana: 'srazena', radiusRohu: 10, radiusVnitrni: 90 }),
    podnoz: P({ typ: 'ram-U', barva: '#E8E6E1', profil: 35, odsazeni: 80 }),
    ulozne: U('zasuvky-2', 'A', 0.3), doplnky: DO() }),

  mk({ id: 'sk-04', rodina: 'skandi', nazev: 'Bambusová deska, hairpin',
    popis: 'Tenká deska na hairpin nohách. Vzdušné a levné, ale unese míň.',
    rozmery: R({ ramenoADelka: 1900, ramenoAHloubka: 600 }), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25, hrana: 'radius', radiusRohu: 20, radiusVnitrni: 120 }),
    podnoz: P({ typ: 'hairpin', profil: 12, odsazeni: 80 }),
    ulozne: U('nic'), doplnky: DO({ kabelovaLavka: true }) }),

  mk({ id: 'sk-05', rodina: 'skandi', nazev: 'Světlá deska, dřevěné rovné nohy',
    popis: 'Nejjednodušší poctivá varianta: deska a čtyři hranaté nohy.',
    rozmery: R(), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 25, hrana: 'srazena', radiusRohu: 12, radiusVnitrni: 100 }),
    podnoz: P({ typ: 'nohy-rovne', material: 'drevo', materialId: 'dub-svetly-masiv', profil: 60, odsazeni: 100 }),
    ulozne: U('kontejner-3', 'B', 0.8), doplnky: DO() }),

  mk({ id: 'sk-06', rodina: 'skandi', nazev: 'Krémová deska, dubové nohy',
    popis: 'Krémová deska v tónu stěn, dubové nohy. Stůl ustoupí, vynikne gauč a obraz.',
    rozmery: R({ ramenoAHloubka: 660 }), deska: D({ materialId: 'lamino-krem', tloustka: 25, hrana: 'srazena', radiusRohu: 16, radiusVnitrni: 110 }),
    podnoz: P({ typ: 'nohy-konicke', material: 'drevo', materialId: 'dub-svetly-masiv', profil: 52, odsazeni: 95 }),
    ulozne: U('police', 'B', 0.88), doplnky: DO() }),

  // ---------- INDUSTRIÁL ----------
  mk({ id: 'in-01', rodina: 'industrial', nazev: 'Jekl U + masiv 40',
    popis: 'Černý U rám z jeklu 40×40 pod dubovou spárovkou 40 mm. Tvrdý kontrast, jasná konstrukce.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 40, hrana: 'srazena', radiusRohu: 8, radiusVnitrni: 90 }),
    podnoz: P({ typ: 'ram-U', profil: 40, odsazeni: 110 }), ulozne: U('kontejner-3'),
    doplnky: DO({ pruchodka: 'obdelnikova' }) }),

  mk({ id: 'in-02', rodina: 'industrial', nazev: 'Rám A, kouřový dub',
    popis: 'Áčkový rám — nohy se rozbíhají, takže stůl stojí pevněji a působí lehčeji.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv', tloustka: 30, hrana: 'srazena', radiusRohu: 10, radiusVnitrni: 100 }),
    podnoz: P({ typ: 'ram-A', profil: 35, odsazeni: 130 }), ulozne: U('zasuvky-2', 'A', 0.35), doplnky: DO() }),

  mk({ id: 'in-03', rodina: 'industrial', nazev: 'Rám H, antracit',
    popis: 'H rám s příčkou v polovině výšky. Nejtužší z rámových variant.',
    rozmery: R(), deska: D({ materialId: 'orech-masiv', tloustka: 30, hrana: 'zkosena', radiusRohu: 6, radiusVnitrni: 80 }),
    podnoz: P({ typ: 'ram-H', barva: '#33383B', profil: 40, odsazeni: 120 }),
    ulozne: U('kontejner-pevny'), doplnky: DO({ ledPodsviceni: true }) }),

  mk({ id: 'in-04', rodina: 'industrial', nazev: 'Trapézový rám',
    popis: 'Nohy se sbíhají dolů. Zabírá míň podlahy, ale drží šířku pod deskou.',
    rozmery: R({ ramenoAHloubka: 680 }), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 30, hrana: 'srazena', radiusRohu: 12, radiusVnitrni: 100 }),
    podnoz: P({ typ: 'ram-trapez', profil: 40, odsazeni: 100 }), ulozne: U('kontejner-3'), doplnky: DO() }),

  mk({ id: 'in-05', rodina: 'industrial', nazev: 'Hranatý uzavřený profil',
    popis: 'Uzavřený obdélníkový rám. Nejvíc „dílenský" a nejlevnější na výrobu u zámečníka.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 30, hrana: 'rovna', radiusRohu: 4, radiusVnitrni: 70 }),
    podnoz: P({ typ: 'ram-hranaty', profil: 30, odsazeni: 90 }), ulozne: U('police', 'B', 0.85), doplnky: DO() }),

  mk({ id: 'in-06', rodina: 'industrial', nazev: 'Kov + linoleum',
    popis: 'Antracitové linoleum na MDF v černém rámu. Matné, nelesklé, příjemné na psaní.',
    rozmery: R({ ramenoAHloubka: 700 }), deska: D({ materialId: 'lino-antracit', tloustka: 25, hrana: 'naklizek', radiusRohu: 10, radiusVnitrni: 100 }),
    podnoz: P({ typ: 'ram-U', profil: 40, odsazeni: 110 }), ulozne: U('kontejner-3'),
    doplnky: DO({ ledPodsviceni: true, pruchodka: 'obdelnikova' }) }),

  // ---------- S KONTEJNEREM ----------
  mk({ id: 'ko-01', rodina: 'kontejner', nazev: 'Pojezdový kontejner u gauče',
    popis: 'Tři zásuvky na kolečkách pod ramenem B, dá se vytáhnout ven.',
    rozmery: R(), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 30 }), podnoz: P({ typ: 'ram-U' }),
    ulozne: U('kontejner-3', 'B', 0.9), doplnky: DO() }),

  mk({ id: 'ko-02', rodina: 'kontejner', nazev: 'Kontejner nese desku',
    popis: 'Deska leží přímo na kontejneru — o dvě nohy míň a víc úložného.',
    rozmery: R(), deska: D({ materialId: 'lamino-dub-teply', tloustka: 25, hrana: 'srazena' }),
    podnoz: P({ typ: 'kontejner-nosny', profil: 40, odsazeni: 80 }),
    ulozne: U('kontejner-pevny', 'B', 0.92), doplnky: DO() }),

  mk({ id: 'ko-03', rodina: 'kontejner', nazev: 'Kontejner pod hlavní plochou',
    popis: 'Zásuvky pod ramenem A po ruce, rameno B zůstane volné pro tiskárnu.',
    rozmery: R(), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 30 }), podnoz: P({ typ: 'ram-U' }),
    ulozne: U('kontejner-3', 'A', 0.75), doplnky: DO() }),

  mk({ id: 'ko-04', rodina: 'kontejner', nazev: 'Kontejner s petrolejovými čely',
    popis: 'Dřevěný korpus, čela v petroleji gauče. Barevná vazba na zbytek místnosti.',
    rozmery: R(), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 30 }), podnoz: P({ typ: 'ram-U' }),
    ulozne: U('kontejner-3', 'B', 0.88, { barvaCel: '#0F5A78' }), doplnky: DO() }),

  mk({ id: 'ko-05', rodina: 'kontejner', nazev: 'Kontejner s hořčicovými čely',
    popis: 'Čela v hořčicové z obrazu a koberce. Malá plocha, výrazný efekt.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 30 }), podnoz: P({ typ: 'ram-A', profil: 35 }),
    ulozne: U('kontejner-3', 'B', 0.88, { barvaCel: '#C58114' }), doplnky: DO() }),

  mk({ id: 'ko-06', rodina: 'kontejner', nazev: 'Skříňka s dvířky',
    popis: 'Místo zásuvek dvířka — levnější a schová i vyšší věci.',
    rozmery: R(), deska: D({ materialId: 'lamino-dub-svetly', tloustka: 25 }), podnoz: P({ typ: 'ram-U', barva: '#E8E6E1' }),
    ulozne: U('skrinka', 'B', 0.9), doplnky: DO() }),

  // ---------- SE ZADNÍM PANELEM ----------
  mk({ id: 'pa-01', rodina: 'panel', nazev: 'Zadní panel po obou ramenech',
    popis: 'Panel podél obou stěn schová kabely a odděluje pracovní zónu od obývací.',
    rozmery: R(), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 30 }), podnoz: P({ typ: 'ram-U' }),
    ulozne: [{ typ: 'zadni-panel', rameno: 'A', pozice: 0.5 }], doplnky: DO({ zadniPanel: true, ledPodsviceni: true }) }),

  mk({ id: 'pa-02', rodina: 'panel', nazev: 'Panel + nástavec na monitor',
    popis: 'Monitor výš, pod ním místo na klávesnici. Ergonomicky nejlepší z galerie.',
    rozmery: R({ ramenoAHloubka: 720 }), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 30 }),
    podnoz: P({ typ: 'ram-H', profil: 40 }),
    ulozne: [{ typ: 'zadni-panel', rameno: 'A', pozice: 0.5 }], doplnky: DO({ nastavecMonitor: true, zadniPanel: true }) }),

  mk({ id: 'pa-03', rodina: 'panel', nazev: 'Panel a police nad ramenem B',
    popis: 'Otevřená police nad tiskárnou. Roh se využije do výšky.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 30 }), podnoz: P({ typ: 'ram-U' }),
    ulozne: [{ typ: 'police', rameno: 'B', pozice: 0.85 }], doplnky: DO({ zadniPanel: true }) }),

  mk({ id: 'pa-04', rodina: 'panel', nazev: 'Panel v krému, deska dub',
    popis: 'Panel v barvě stěny zmizí, deska zůstane dřevěná.',
    rozmery: R(), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 25 }), podnoz: P({ typ: 'ram-U', barva: '#E8E6E1' }),
    ulozne: [{ typ: 'zadni-panel', rameno: 'A', pozice: 0.5, materialId: 'lamino-krem' }], doplnky: DO({ zadniPanel: true }) }),

  mk({ id: 'pa-05', rodina: 'panel', nazev: 'Panel + LED + lávka',
    popis: 'Všechny doplňky najednou: panel, kabelová lávka, průchodka i podsvícení.',
    rozmery: R(), deska: D({ materialId: 'orech-masiv', tloustka: 30, hrana: 'radius' }), podnoz: P({ typ: 'ram-hranaty', profil: 35 }),
    ulozne: [{ typ: 'zadni-panel', rameno: 'A', pozice: 0.5 }],
    doplnky: DO({ zadniPanel: true, ledPodsviceni: true, pruchodka: 'obdelnikova', nastavecMonitor: true }) }),

  // ---------- MINIMALISTICKÝ PLOVOUCÍ ----------
  mk({ id: 'pl-01', rodina: 'plovouci', nazev: 'Tenká deska 18, úzký rám',
    popis: 'Nejtenčí možná deska na subtilním rámu. Pod stolem prosvítá podlaha.',
    rozmery: R({ ramenoAHloubka: 620 }), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 18, hrana: 'zkosena', radiusRohu: 10, radiusVnitrni: 90 }),
    podnoz: P({ typ: 'ram-hranaty', profil: 25, odsazeni: 120, vyztuha: true }),
    ulozne: U('nic'), doplnky: DO({ ledPodsviceni: true, kabelovaLavka: true }) }),

  mk({ id: 'pl-02', rodina: 'plovouci', nazev: 'Plovoucí s podsvícením',
    popis: 'LED profil po celé délce. Ve večerním obýváku stůl působí, že se vznáší.',
    rozmery: R({ ramenoAHloubka: 640 }), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 25, hrana: 'zkosena', radiusRohu: 14, radiusVnitrni: 110, vyrez: 95 }),
    podnoz: P({ typ: 'ram-U', profil: 25, odsazeni: 140 }), ulozne: U('zasuvka-plocha', 'A', 0.4),
    doplnky: DO({ ledPodsviceni: true }) }),

  mk({ id: 'pl-03', rodina: 'plovouci', nazev: 'Hairpin, tenká deska',
    popis: 'Tři tenké pruty na nohu. Nejvzdušnější varianta v galerii.',
    rozmery: R({ ramenoADelka: 1850, ramenoAHloubka: 600, ramenoBDelka: 1300 }),
    deska: D({ materialId: 'jasan-masiv', tloustka: 25, hrana: 'radius', radiusRohu: 25, radiusVnitrni: 150 }),
    podnoz: P({ typ: 'hairpin', profil: 12, odsazeni: 90 }), ulozne: U('nic'), doplnky: DO({ kabelovaLavka: false }) }),

  mk({ id: 'pl-04', rodina: 'plovouci', nazev: 'Bílá na bílé',
    popis: 'Krémová deska, bílá podnož. Stůl se ztratí ve stěně.',
    rozmery: R({ ramenoAHloubka: 620 }), deska: D({ materialId: 'lamino-krem', tloustka: 25, hrana: 'zkosena', radiusRohu: 14, radiusVnitrni: 110 }),
    podnoz: P({ typ: 'ram-U', barva: '#E8E6E1', profil: 30, odsazeni: 120 }), ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'pl-05', rodina: 'plovouci', nazev: 'Kompakt 18 mm na nerezu',
    popis: 'HPL kompakt — nejtenčí deska, která ještě unese rozpon. Nerezová podnož.',
    rozmery: R({ ramenoAHloubka: 620 }), deska: D({ materialId: 'hpl-antracit', tloustka: 18, hrana: 'zkosena', radiusRohu: 8, radiusVnitrni: 80 }),
    podnoz: P({ typ: 'ram-hranaty', barva: '#B9BCC0', profil: 25, odsazeni: 120 }), ulozne: U('nic'), doplnky: DO({ ledPodsviceni: true }) }),

  // ---------- KOMPAKTNÍ DO ROHU ----------
  mk({ id: 'km-01', rodina: 'kompakt', nazev: 'Krátká ramena 160 + 110',
    popis: 'Nezabírá celý roh. Zbyde místo na skříňku nebo rostlinu.',
    rozmery: R({ ramenoADelka: 1600, ramenoBDelka: 1100, ramenoAHloubka: 620, ramenoBHloubka: 500 }),
    deska: D({ materialId: 'dub-svetly-masiv', tloustka: 25 }), podnoz: P({ typ: 'ram-U', profil: 35, odsazeni: 80 }),
    ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO() }),

  mk({ id: 'km-02', rodina: 'kompakt', nazev: 'Mělká deska 55 cm',
    popis: 'Jen 55 cm hloubky. Nechá maximum volné podlahy pro židli.',
    rozmery: R({ ramenoAHloubka: 550, ramenoBHloubka: 470 }),
    deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25 }), podnoz: P({ typ: 'ram-U', profil: 30, odsazeni: 70 }),
    ulozne: U('zasuvka-plocha', 'A', 0.4), doplnky: DO({ nastavecMonitor: true }) }),

  mk({ id: 'km-03', rodina: 'kompakt', nazev: 'Jen rameno B krátké',
    popis: 'Plné rameno A, ale kratší B — mezi stolem a gaučem zůstane víc vzduchu.',
    rozmery: R({ ramenoBDelka: 1050 }), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 30 }),
    podnoz: P({ typ: 'ram-U' }), ulozne: U('kontejner-3', 'B', 0.9), doplnky: DO() }),

  mk({ id: 'km-04', rodina: 'kompakt', nazev: 'Kompakt na hairpinech',
    popis: 'Malá deska na tenkých nohách. Nejmenší vizuální stopa v místnosti.',
    rozmery: R({ ramenoADelka: 1500, ramenoBDelka: 1000, ramenoAHloubka: 580, ramenoBHloubka: 470 }),
    deska: D({ materialId: 'jasan-masiv', tloustka: 25, hrana: 'radius', radiusRohu: 24, radiusVnitrni: 140 }),
    podnoz: P({ typ: 'hairpin', profil: 12, odsazeni: 70 }), ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'km-05', rodina: 'kompakt', nazev: 'Kompakt s policí',
    popis: 'Otevřená police místo kontejneru — levnější a opticky lehčí.',
    rozmery: R({ ramenoADelka: 1700, ramenoBDelka: 1150, ramenoAHloubka: 600 }),
    deska: D({ materialId: 'lamino-dub-svetly', tloustka: 25 }), podnoz: P({ typ: 'nohy-konicke', material: 'drevo', materialId: 'dub-svetly-masiv', profil: 48, odsazeni: 80 }),
    ulozne: U('police', 'B', 0.85), doplnky: DO() }),

  mk({ id: 'km-06', rodina: 'kompakt', nazev: 'Kompakt s velkou mezerou ke gauči',
    popis: 'Mezera ke gauči 25 cm. Když chceš mít mezi stolem a gaučem viditelnou pauzu.',
    rozmery: R({ ramenoBDelka: 1350, mezeraKeGauci: 250 }), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 30 }),
    podnoz: P({ typ: 'ram-A', profil: 35 }), ulozne: U('kontejner-3', 'B', 0.85), doplnky: DO() }),

  // ---------- ROVNÁ DESKA ----------
  mk({ id: 'ro-01', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná 211 na U rámu',
    popis: 'Jen běh podél levé stěny. Roh u gauče zůstane volný.',
    rozmery: R({ ramenoBDelka: 0 }), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 30 }),
    podnoz: P({ typ: 'ram-U' }), ulozne: U('kontejner-3', 'A', 0.85), doplnky: DO({ tiskarnaVRohu: false }) }),

  mk({ id: 'ro-02', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná na bočnicích',
    popis: 'Plné bočnice po stranách, jako současný stůl v místnosti.',
    rozmery: R({ ramenoBDelka: 0 }), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 40, hrana: 'naklizek' }),
    podnoz: P({ typ: 'bocnice', material: 'drevo', materialId: 'dub-podlaha-masiv', odsazeni: 130 }),
    ulozne: U('zasuvky-2', 'A', 0.3), doplnky: DO({ tiskarnaVRohu: false }) }),

  mk({ id: 'ro-03', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná mělká 55',
    popis: 'Úzká deska podél stěny. Nejvíc volné podlahy v místnosti.',
    rozmery: R({ ramenoBDelka: 0, ramenoAHloubka: 550 }), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25 }),
    podnoz: P({ typ: 'ram-hranaty', profil: 25, odsazeni: 100 }), ulozne: U('nic'),
    doplnky: DO({ tiskarnaVRohu: false, nastavecMonitor: true }) }),

  mk({ id: 'ro-04', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná na kozách',
    popis: 'Dvě kozy a deska. Nejrychleji rozebratelné řešení.',
    rozmery: R({ ramenoBDelka: 0 }), deska: D({ materialId: 'jasan-masiv', tloustka: 40, hrana: 'zkosena' }),
    podnoz: P({ typ: 'kozy', material: 'drevo', materialId: 'jasan-masiv', profil: 55, odsazeni: 170 }),
    ulozne: U('nic'), doplnky: DO({ tiskarnaVRohu: false }) }),

  mk({ id: 'ro-05', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná s kontejnerem u gauče',
    popis: 'Deska podél stěny, kontejner na konci u gauče.',
    rozmery: R({ ramenoBDelka: 0 }), deska: D({ materialId: 'lamino-dub-teply', tloustka: 25 }),
    podnoz: P({ typ: 'kontejner-nosny', odsazeni: 80 }), ulozne: U('kontejner-pevny', 'A', 0.9),
    doplnky: DO({ tiskarnaVRohu: false }) }),

  // ---------- POLOHOVATELNÝ ----------
  mk({ id: 'po-01', rodina: 'polohovatelny', nazev: 'Stavitelný rám, L deska',
    popis: 'Elektrický rám pod L deskou. Pozor: rám omezí, kam se vejde kontejner.',
    rozmery: R({ ramenoADelka: 1900, ramenoBDelka: 1400 }), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 25 }),
    podnoz: P({ typ: 'stavitelny-ram', profil: 60, odsazeni: 120, vyztuha: false }),
    ulozne: U('nic'), doplnky: DO({ kabelovaLavka: true }) }),

  mk({ id: 'po-02', rodina: 'polohovatelny', tvar: 'rovna', nazev: 'Stavitelný, rovná deska',
    popis: 'Nejobvyklejší sit-stand sestava: rám plus deska 180 × 70.',
    rozmery: R({ ramenoBDelka: 0, ramenoADelka: 1800 }), deska: D({ materialId: 'dyha-dub-svetla', tloustka: 25 }),
    podnoz: P({ typ: 'stavitelny-ram', profil: 60, odsazeni: 110, vyztuha: false }),
    ulozne: U('nic'), doplnky: DO({ tiskarnaVRohu: false, kabelovaLavka: true }) }),

  mk({ id: 'po-03', rodina: 'polohovatelny', nazev: 'Stavitelný v bílé',
    popis: 'Bílý rám a světlá deska. Nejmíň kancelářský vzhled ze sit-stand variant.',
    rozmery: R({ ramenoADelka: 1900, ramenoBDelka: 1350 }), deska: D({ materialId: 'lamino-dub-svetly', tloustka: 25 }),
    podnoz: P({ typ: 'stavitelny-ram', barva: '#E8E6E1', profil: 60, odsazeni: 110, vyztuha: false }),
    ulozne: U('nic'), doplnky: DO() }),

  mk({ id: 'po-04', rodina: 'polohovatelny', nazev: 'Stavitelný s nástavcem',
    popis: 'Rám plus nástavec na monitor. Ve stoje i v sedu správná výška očí.',
    rozmery: R({ ramenoADelka: 1900, ramenoBDelka: 1400, ramenoAHloubka: 720 }),
    deska: D({ materialId: 'orech-masiv', tloustka: 25 }),
    podnoz: P({ typ: 'stavitelny-ram', profil: 60, odsazeni: 110, vyztuha: false }),
    ulozne: U('nic'), doplnky: DO({ nastavecMonitor: true }) }),

  // ---------- DOPLŇKOVÉ VARIANTY ----------
  mk({ id: 'tr-07', rodina: 'truhlar', nazev: 'Dub 40 s velkým vnitřním rádiusem',
    popis: 'Vnitřní roh zaoblený R260. Loket nenarazí do hrany a roh se líp uklízí.',
    rozmery: R(), deska: D({ materialId: 'dub-svetly-masiv', tloustka: 40, hrana: 'naklizek', radiusRohu: 30, radiusVnitrni: 260, vyrez: 110 }),
    podnoz: P({ typ: 'nohy-rovne', material: 'drevo', materialId: 'dub-svetly-masiv', profil: 70, odsazeni: 120 }),
    ulozne: U('kontejner-pevny'), doplnky: DO() }),

  mk({ id: 'sk-07', rodina: 'skandi', nazev: 'Teplý dub, černé kónické nohy',
    popis: 'Lamino v teplém dubu a černé nohy. Levné, ale vazba na černé rámy fotek drží.',
    rozmery: R({ ramenoAHloubka: 640 }), deska: D({ materialId: 'lamino-dub-teply', tloustka: 25, hrana: 'srazena', radiusRohu: 12 }),
    podnoz: P({ typ: 'nohy-konicke', material: 'kov', profil: 45, odsazeni: 85 }),
    ulozne: U('zasuvky-2', 'A', 0.35), doplnky: DO() }),

  mk({ id: 'in-07', rodina: 'industrial', nazev: 'Šedé linoleum, nerezový rám',
    popis: 'Šedé linoleum na MDF a nerezový rám. Studenější, ale k chromové lampě to sedí.',
    rozmery: R(), deska: D({ materialId: 'lino-seda', tloustka: 25, hrana: 'naklizek', radiusRohu: 10 }),
    podnoz: P({ typ: 'ram-U', barva: '#B9BCC0', profil: 35, odsazeni: 100 }),
    ulozne: U('kontejner-3'), doplnky: DO({ pruchodka: 'obdelnikova' }) }),

  mk({ id: 'in-08', rodina: 'industrial', nazev: 'Silný jekl 60, deska 40',
    popis: 'Nejmasivnější varianta: jekl 60 a spárovka 40. Unese cokoliv, ale je vidět.',
    rozmery: R(), deska: D({ materialId: 'dub-kourovy-masiv', tloustka: 40, hrana: 'srazena', radiusRohu: 6 }),
    podnoz: P({ typ: 'ram-hranaty', profil: 60, odsazeni: 130 }), ulozne: U('kontejner-pevny'), doplnky: DO() }),

  mk({ id: 'ko-07', rodina: 'kontejner', nazev: 'Zásuvka pod deskou + police',
    popis: 'Plochá zásuvka pod hlavní plochou a police u gauče. Rozdělené úložné.',
    rozmery: R(), deska: D({ materialId: 'jasan-masiv', tloustka: 30 }), podnoz: P({ typ: 'ram-A', profil: 35 }),
    ulozne: [{ typ: 'zasuvka-plocha', rameno: 'A', pozice: 0.4 }, { typ: 'police', rameno: 'B', pozice: 0.88 }],
    doplnky: DO() }),

  mk({ id: 'pl-06', rodina: 'plovouci', nazev: 'Tenká deska, kónické kovové nohy',
    popis: 'Kónické nohy z komaxitu pod 18mm deskou. Skoro nic tam nestojí.',
    rozmery: R({ ramenoAHloubka: 600, ramenoADelka: 1950 }),
    deska: D({ materialId: 'lamino-dub-svetly', tloustka: 18, hrana: 'zkosena', radiusRohu: 16, radiusVnitrni: 120 }),
    podnoz: P({ typ: 'nohy-konicke', material: 'kov', profil: 40, odsazeni: 100 }),
    ulozne: U('nic'), doplnky: DO({ ledPodsviceni: true }) }),

  mk({ id: 'km-07', rodina: 'kompakt', nazev: 'Rohové minimum 140 + 95',
    popis: 'Nejmenší varianta, která ještě unese monitor a tiskárnu. Zbytek rohu zůstane volný.',
    rozmery: R({ ramenoADelka: 1400, ramenoBDelka: 950, ramenoAHloubka: 600, ramenoBHloubka: 470 }),
    deska: D({ materialId: 'dub-svetly-masiv', tloustka: 25, radiusRohu: 18, radiusVnitrni: 120 }),
    podnoz: P({ typ: 'ram-U', profil: 30, odsazeni: 70 }), ulozne: U('zasuvka-plocha', 'A', 0.45), doplnky: DO() }),

  mk({ id: 'pa-06', rodina: 'panel', nazev: 'Panel, police a kontejner',
    popis: 'Maximum úložného: panel, police nad ramenem B a kontejner pod ním.',
    rozmery: R(), deska: D({ materialId: 'dub-podlaha-masiv', tloustka: 30 }), podnoz: P({ typ: 'ram-H', profil: 40 }),
    ulozne: [{ typ: 'zadni-panel', rameno: 'A', pozice: 0.5 }, { typ: 'kontejner-3', rameno: 'B', pozice: 0.9 }],
    doplnky: DO({ zadniPanel: true, ledPodsviceni: true }) }),

  mk({ id: 'ro-06', rodina: 'rovna', tvar: 'rovna', nazev: 'Rovná na hairpinech',
    popis: 'Nejlehčí rovná varianta. Do obýváku působí spíš jako konzolový stolek.',
    rozmery: R({ ramenoBDelka: 0, ramenoADelka: 1800, ramenoAHloubka: 580 }),
    deska: D({ materialId: 'jasan-masiv', tloustka: 25, hrana: 'radius', radiusRohu: 24 }),
    podnoz: P({ typ: 'hairpin', profil: 12, odsazeni: 80 }), ulozne: U('nic'),
    doplnky: DO({ tiskarnaVRohu: false }) }),
]

// pojistka: žádný preset nesmí přesáhnout prostor
for (const p of PRESETY) {
  if (p.rozmery.ramenoADelka > MAX_RAMENO_A) {
    throw new Error(`Preset ${p.id} má rameno A ${p.rozmery.ramenoADelka} > ${MAX_RAMENO_A}`)
  }
}

export const PRESETY_MAP = new Map(PRESETY.map((p) => [p.id, p]))
