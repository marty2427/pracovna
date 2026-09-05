/**
 * Sazby pro kalkulaci ceny na míru.
 *
 * VŠECHNA ČÍSLA POCHÁZÍ Z research/trh.md, sekce "Orientační cenová pásma".
 * Uvádím je jako ROZPĚTÍ od–do včetně DPH, protože tak je rešerše uvádí —
 * jednočíselná cena by budila dojem přesnosti, kterou tahle data nemají.
 */

export interface Rozpeti { od: number; do: number }
export const rozpeti = (od: number, doo: number): Rozpeti => ({ od, do: doo })
export const scal = (r: Rozpeti, k: number): Rozpeti => ({ od: r.od * k, do: r.do * k })
export const plus = (...rs: Rozpeti[]): Rozpeti =>
  rs.reduce((a, b) => ({ od: a.od + b.od, do: a.do + b.do }), { od: 0, do: 0 })
export const stred = (r: Rozpeti) => (r.od + r.do) / 2

export const ZDROJ = 'research/trh.md — sekce Orientační cenová pásma (3b–3f)'

/** Cena materiálu desky za m², vč. DPH. Klíč = kategorie materiálu + tloušťka. */
export const MATERIAL_M2: Record<string, (t: number) => Rozpeti> = {
  lamino: (t) => (t <= 18 ? rozpeti(425, 725) : rozpeti(850, 1570)),
  dyha: (t) => scal(rozpeti(1450, 3025), t >= 30 ? 1.25 : 1),
  masiv: (t) => {
    if (t <= 20) return rozpeti(1600, 2700)
    if (t <= 27) return rozpeti(2180, 3630)
    if (t <= 32) return rozpeti(2600, 4400)
    return rozpeti(3630, 6050)
  },
  hpl: () => rozpeti(3025, 5445),
  linoleum: () => rozpeti(2200, 4200),   // MDF + Forbo, dopočet — v rešerši není samostatná položka
  lak: () => rozpeti(1500, 3000),
}

/** Příplatek za dřevinu proti dubu. */
export const DREVINA_KOEF: Record<string, number> = {
  'dub-svetly-masiv': 1, 'dub-podlaha-masiv': 1.05, 'dub-medovy-masiv': 1.05,
  'dub-rustikal-masiv': 0.85, 'dub-kourovy-masiv': 1.1, 'dub-tmavy-masiv': 1.1,
  'lamino-dub-sherman': 1.35, // Feelwood ST32 je nejdražší z ověřených dekorů
}

/** Olepení / opracování hrany za bm, vč. DPH. */
export const HRANA_BM: Record<string, Rozpeti> = {
  rovna: rozpeti(24, 48),        // ABS 0,8
  srazena: rozpeti(36, 73),      // ABS 2 mm se zaoblením
  zkosena: rozpeti(60, 145),     // frézované zkosení
  radius: rozpeti(73, 182),      // frézovaný rádius / dýhovaná hrana
  naklizek: rozpeti(182, 484),   // nalepená masivní lišta + broušení
}

/** Hodinová sazba truhlářské dílny v Brně, vč. DPH. */
export const HODINOVKA = rozpeti(665, 970)

/** Povrchová úprava za m², vč. DPH. */
export const POVRCH_M2 = {
  olej: rozpeti(363, 847),
  lak: rozpeti(605, 1210),
}

/** Kovová podnož na míru u zámečníka, vč. DPH — podle složitosti. */
export const PODNOZ_KOV: Record<string, Rozpeti> = {
  'ram-U': rozpeti(4000, 9000),
  'ram-A': rozpeti(4500, 10000),
  'ram-H': rozpeti(4500, 10000),
  'ram-trapez': rozpeti(4500, 10000),
  'ram-hranaty': rozpeti(3500, 8000),
  hairpin: rozpeti(1800, 4500),
  'nohy-rovne': rozpeti(1500, 4000),
  'nohy-konicke': rozpeti(2000, 5000),
  'nohy-sikme': rozpeti(2200, 5500),
  'stavitelny-ram': rozpeti(6000, 15000),
  'kontejner-nosny': rozpeti(2500, 6000),
  bocnice: rozpeti(0, 0),   // dřevo, počítá se jako plocha materiálu
  kozy: rozpeti(0, 0),
}

/** Jednorázové úkony, vč. DPH. */
export const UKONY = {
  vyrezProchodka: rozpeti(120, 365),
  materialProchodka: rozpeti(73, 303),
  kabelovaLavka: rozpeti(605, 2420),
  ledMetr: rozpeti(280, 620),      // profil + pásek + zdroj, za bm
  vyrezAtypicky: rozpeti(605, 3025),
  doprava: rozpeti(300, 800),
  montaz: rozpeti(800, 2500),
  vysuvSada: rozpeti(450, 1400),   // plnovýsuv s tlumením za zásuvku
  pant: rozpeti(90, 260),
  uchytka: rozpeti(60, 320),
  kolecko: rozpeti(45, 160),
  patka: rozpeti(25, 90),
}

/** Odhad hodin práce podle složitosti sestavy. */
export function hodinyPrace(opts: {
  jeL: boolean
  pocetZasuvek: number
  maSkrinku: boolean
  maPolici: boolean
  maPanel: boolean
  maNastavec: boolean
  hranaNarocna: boolean
  masiv: boolean
}): Rozpeti {
  let od = 2.5, doo = 5
  if (opts.jeL) { od += 1.5; doo += 3 }              // spoj ramen a vnitřní roh
  od += opts.pocetZasuvek * 0.7; doo += opts.pocetZasuvek * 1.4
  if (opts.maSkrinku) { od += 1.5; doo += 3 }
  if (opts.maPolici) { od += 1; doo += 2 }
  if (opts.maPanel) { od += 1; doo += 2.5 }
  if (opts.maNastavec) { od += 1; doo += 2 }
  if (opts.hranaNarocna) { od += 1; doo += 2.5 }
  if (opts.masiv) { od += 1.5; doo += 3.5 }          // dilatace, broušení, olej
  return rozpeti(od, doo)
}

export function formatKc(n: number): string {
  return Math.round(n).toLocaleString('cs-CZ') + ' Kč'
}

export function formatRozpeti(r: Rozpeti): string {
  if (r.od === r.do) return formatKc(r.od)
  const zaokrouhli = (v: number) => Math.round(v / 100) * 100
  return `${zaokrouhli(r.od).toLocaleString('cs-CZ')} – ${zaokrouhli(r.do).toLocaleString('cs-CZ')} Kč`
}
