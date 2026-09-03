import type { DeskConfig } from './types'
import { material } from './materials'

/**
 * Maximální rozpon desky bez podpory podle materiálu a tloušťky (mm).
 * Kritérium průhybu L/300 při běžném zatížení pracovní desky.
 * Hodnoty se doplňují z rešerše (research/trh.md, sekce ergonomie a statika).
 */
export const MAX_ROZPON: Record<string, Record<number, number>> = {
  lamino:   { 18: 650,  25: 950,  30: 1100, 40: 1400 },
  dyha:     { 18: 600,  25: 900,  30: 1050, 38: 1250, 40: 1300 },
  masiv:    { 18: 750,  25: 1050, 30: 1250, 40: 1700 },
  hpl:      { 12: 850,  18: 1150, 25: 1500 },
  linoleum: { 19: 620,  25: 900,  30: 1050 },
  lak:      { 18: 600,  25: 900,  30: 1050, 40: 1300 },
}

export function maxRozpon(materialId: string, tloustka: number): number {
  const m = material(materialId)
  const tab = MAX_ROZPON[m.kategorie] ?? MAX_ROZPON.lamino
  const klice = Object.keys(tab).map(Number).sort((a, b) => a - b)
  const klic = klice.reduce((best, k) => (k <= tloustka ? k : best), klice[0])
  return tab[klic]
}



export interface Podpora {
  /** Půdorysná poloha v mm. */
  x: number
  z: number
  /** Rám, jehož je součástí: 'A' = na konci ramene A, 'B' = na konci ramene B, 'roh', 'mezi'. */
  skupina: 'A' | 'B' | 'roh' | 'mezi'
}

export function maxRozponMat(materialId: string, tloustka: number): number {
  const m = material(materialId)
  const tab = MAX_ROZPON[m.kategorie] ?? MAX_ROZPON.lamino
  const klice = Object.keys(tab).map(Number).sort((a, b) => a - b)
  const klic = klice.reduce((best, k) => (k <= tloustka ? k : best), klice[0])
  return tab[klic]
}

/** Dovolený rozpon s ohledem na podélnou výztuhu pod deskou. */
export function dovolenyRozpon(c: DeskConfig): number {
  const zaklad = maxRozponMat(c.deska.materialId, c.deska.tloustka)
  // Jekl přilepený/přišroubovaný pod deskou po celé délce funguje jako nosník
  // a rozpon výrazně prodlouží. Držím konzervativní násobek 1,55.
  return c.podnoz.vyztuha ? Math.round(zaklad * 1.55) : zaklad
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
