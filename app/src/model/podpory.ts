import type { DeskConfig } from './types'
import { material } from './materials'

/**
 * Maximální rozpon stolové desky bez podpory (mm) podle materiálu a tloušťky.
 *
 * ODKUD TA ČÍSLA JSOU (research/trh.md, sekce statika desky):
 * Výchozí je publikovaná tabulka rozponů POLIC při knižní zátěži (~195 kg/m²)
 * s kritériem průhybu L/180. Ta se přepočítala na STŮL dvěma kroky:
 *
 *   1) Stůl nese reálně 20-50 kg/m², ne 195 — ze vzorce δ = 5wL⁴/(384EI) plyne
 *      při 4-5× menší zátěži rozpon delší zhruba 1,45×.
 *   2) U stolu je ale potřeba přísnější kritérium průhybu: L/300 místo L/180,
 *      protože se na desku kouká zblízka, člověk se o ni opírá a na prohnuté
 *      desce je vidět i monitor. To rozpon zase zkrátí na 0,84×.
 *
 * Součin obou kroků je 1,22 — tolik činí přepočet police → stůl.
 * Mezi tloušťkami se interpoluje podle L ∝ t^(3/4) (průhyb klesá s t³).
 *
 * Zdroje: Composite Panel Association Technical Bulletin (DTD/MDF, L/240),
 * Sizemarker a Jon Eakes (tabulky rozponů polic), Sagulator/Woodbin
 * (kritéria průhybu), ČSN EN 527-2 (zkouška 1000 N svisle).
 * Podrobně i s odkazy v research/trh.md.
 */
export const MAX_ROZPON: Record<string, Record<number, number>> = {
  lamino:   { 18: 800,  25: 1100, 30: 1250, 38: 1450, 40: 1500 },
  dyha:     { 18: 900,  25: 1150, 30: 1300, 38: 1550, 40: 1600 },
  masiv:    { 18: 1100, 25: 1450, 27: 1500, 30: 1650, 38: 1930, 40: 2000 },
  hpl:      { 12: 800,  18: 1150, 25: 1500 },
  linoleum: { 19: 870,  25: 1100, 30: 1250, 38: 1450 },
  lak:      { 18: 900,  25: 1150, 30: 1300, 38: 1550, 40: 1600 },
}

export interface Podpora {
  /** Půdorysná poloha v mm. */
  x: number
  z: number
  /** Rám, jehož je součástí: 'A' = konec ramene A, 'B' = konec ramene B, 'roh' = vnitřní roh L, 'mezi' = mezilehlá. */
  skupina: 'A' | 'B' | 'roh' | 'mezi'
}

export function maxRozponMat(materialId: string, tloustka: number): number {
  const m = material(materialId)
  const tab = MAX_ROZPON[m.kategorie] ?? MAX_ROZPON.lamino
  const klice = Object.keys(tab).map(Number).sort((a, b) => a - b)
  const klic = klice.reduce((best, k) => (k <= tloustka ? k : best), klice[0])
  return tab[klic]
}

/**
 * Dovolený rozpon s ohledem na podélnou výztuhu pod deskou.
 *
 * Násobek 1,5 je KONZERVATIVNÍ ODHAD, ne hodnota z rešerše — kolik jekl
 * pod deskou skutečně přidá, závisí na tom, jak je s deskou spojený
 * (lepený spoj působí jako spřažený nosník a přidá výrazně víc než
 * šroubovaný, který nese převážně samostatně). Truhlář to spočítá přesněji.
 */
export function dovolenyRozpon(c: DeskConfig): number {
  const zaklad = maxRozponMat(c.deska.materialId, c.deska.tloustka)
  return c.podnoz.vyztuha ? Math.round(zaklad * 1.5) : zaklad
}

/**
 * Kde stůl reálně stojí. U L desky nestačí podpory na koncích ramen —
 * bez podpory u vnitřního rohu je celý roh na vzduchu.
 */
export function podpory(c: DeskConfig): Podpora[] {
  const { ramenoADelka: LA, ramenoAHloubka: DA, ramenoBDelka: LB, ramenoBHloubka: DB } = c.rozmery
  const o = c.podnoz.odsazeni
  const jeL = c.tvar === 'L' && LB > 0
  const nosnyKontejner = c.podnoz.typ === 'kontejner-nosny'

  if (!jeL) {
    const p: Podpora[] = [
      { x: o, z: LA - o, skupina: 'A' },
      { x: DA - o, z: LA - o, skupina: 'A' },
      { x: o, z: o, skupina: 'B' },
      { x: DA - o, z: o, skupina: 'B' },
    ]
    if (potrebaMezilehle(c, LA - 2 * o)) {
      p.push({ x: o, z: LA / 2, skupina: 'mezi' }, { x: DA - o, z: LA / 2, skupina: 'mezi' })
    }
    return p
  }

  const p: Podpora[] = [
    { x: o, z: LA - o, skupina: 'A' },
    { x: DA - o, z: LA - o, skupina: 'A' },
    { x: DA - o, z: DB - o, skupina: 'roh' },     // vnitřní roh L
  ]
  if (!nosnyKontejner) {
    p.push({ x: LB - o, z: DB - o, skupina: 'B' }, { x: LB - o, z: o, skupina: 'B' })
  }

  // Rozpon podél ramene A mezi rohovou podporou a koncem ramene
  const rozponA = (LA - o) - (DB - o)
  if (potrebaMezilehle(c, rozponA)) {
    const zStred = (DB - o + LA - o) / 2
    p.push({ x: o, z: zStred, skupina: 'mezi' }, { x: DA - o, z: zStred, skupina: 'mezi' })
  }
  return p
}

function potrebaMezilehle(c: DeskConfig, rozpon: number): boolean {
  if (c.podnoz.mezilehlaPodpora === 'ne') return false
  if (c.podnoz.mezilehlaPodpora === 'ano') return true
  return rozpon > dovolenyRozpon(c)
}

/** Největší skutečný rozpon mezi podporami, měřeno podél ramen. */
export function skutecnyRozpon(c: DeskConfig): number {
  const p = podpory(c)
  const { ramenoAHloubka: DA, ramenoBHloubka: DB } = c.rozmery
  const jeL = c.tvar === 'L' && c.rozmery.ramenoBDelka > 0

  // podél ramene A: podpory na straně místnosti (x ~ DA - o)
  const podelA = p.filter((q) => Math.abs(q.x - (DA - c.podnoz.odsazeni)) < 1).map((q) => q.z).sort((a, b) => a - b)
  // podél ramene B: podpory na straně místnosti (z ~ DB - o)
  const podelB = jeL
    ? p.filter((q) => Math.abs(q.z - (DB - c.podnoz.odsazeni)) < 1).map((q) => q.x).sort((a, b) => a - b)
    : []

  const maxMezera = (arr: number[]) =>
    arr.length < 2 ? (arr.length === 1 ? arr[0] : 0) : Math.max(...arr.slice(1).map((v, i) => v - arr[i]))

  return Math.max(maxMezera(podelA), maxMezera(podelB))
}
