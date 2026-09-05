import data from './katalog.json'

export interface KatalogPolozka {
  id: string
  nazev: string
  prodejce: string
  popis: string
  delka: number
  sirka: number
  tloustka: number
  cena: number
  jednotka: string
  url: string
  overeno: boolean
  poznamka: string
  /** Výhrada z kontroly ceníku, pokud nějaká je. */
  varovani?: string
}

export interface Katalog {
  meta: { zdroj: string; stav: string; datum?: string; kontrola?: string; odstraneno?: string }
  desky: KatalogPolozka[]
  podnoze: KatalogPolozka[]
  stoly: KatalogPolozka[]
  kovani: KatalogPolozka[]
  sluzby: KatalogPolozka[]
}

export const KATALOG = data as unknown as Katalog

export const jePrazdny = () =>
  KATALOG.desky.length + KATALOG.podnoze.length + KATALOG.stoly.length === 0

export interface DeskaNalez extends KatalogPolozka {
  /** O kolik mm je deska mělčí, než je potřeba (0 = stačí). */
  chybiHloubka: number
}

/**
 * Desky z katalogu k požadovanému rozměru.
 * Vrací i desky, které jsou kratší na hloubku — u nich je uvedeno o kolik,
 * protože nejhlubší běžně prodávaná deska má kolem 63 cm a stůl hluboký 70 cm
 * se z katalogu prostě nesloží. To je informace, ne důvod schovat výsledek.
 */
export function deskyProRozmer(delka: number, hloubka: number, tloustka?: number): DeskaNalez[] {
  return KATALOG.desky
    .filter((d) => {
      const dl = Math.max(d.delka, d.sirka)
      if (!dl || d.cena <= 0) return false
      if (dl < delka - 40) return false
      if (tloustka && d.tloustka && Math.abs(d.tloustka - tloustka) > 14) return false
      return true
    })
    .map((d) => ({ ...d, chybiHloubka: Math.max(0, hloubka - Math.min(d.delka, d.sirka)) }))
    .sort((a, b) => a.chybiHloubka - b.chybiHloubka || a.cena - b.cena)
}

const JE_ROHOVY = /rohov|\bL\b|corner|L-?stůl|L stůl/i

/**
 * Sériové ROHOVÉ stoly, které se vejdou do prostoru. Rovné stoly (íčka) se
 * nenabízejí vůbec — uživatel je vyloučil.
 */
export function rohoveStolyDoProstoru(maxA: number, maxB: number): KatalogPolozka[] {
  return KATALOG.stoly
    .filter((s) => JE_ROHOVY.test(s.nazev + ' ' + s.popis))
    .filter((s) => {
      const dl = Math.max(s.delka, s.sirka), sir = Math.min(s.delka, s.sirka)
      return dl > 0 && s.cena > 0 && dl <= maxA && sir <= maxB
    })
    .sort((a, b) => b.delka * b.sirka - a.delka * a.sirka)
}

/** Rohové desky vcelku (L z jednoho kusu), které pokryjí obě ramena. */
export function rohoveDeskyVcelku(delkaA: number, delkaB: number): KatalogPolozka[] {
  return KATALOG.desky
    .filter((d) => JE_ROHOVY.test(d.nazev + ' ' + d.popis) && d.cena > 0)
    .filter((d) => Math.max(d.delka, d.sirka) >= delkaA - 40 && Math.min(d.delka, d.sirka) >= delkaB - 40)
    .sort((a, b) => a.cena - b.cena)
}

/** Desky pro dvoudílné L — vynechá rohové desky vcelku, ty jdou zvlášť. */
export function deskyProRameno(delka: number, hloubka: number, tloustka?: number): DeskaNalez[] {
  return deskyProRozmer(delka, hloubka, tloustka).filter((d) => !JE_ROHOVY.test(d.nazev + ' ' + d.popis))
}

/** Podnože vhodné k danému typu. */
export function podnozeProTyp(typ: string): KatalogPolozka[] {
  const klice: Record<string, RegExp> = {
    hairpin: /hairpin/i,
    'nohy-rovne': /noha|nohy|adils|olov|krille|sandsberg|lerberg/i,
    'nohy-konicke': /kónick|konick|noha|nohy|olov/i,
    'nohy-sikme': /noha|nohy|šikm/i,
    'stavitelny-ram': /stavitel|flexispot|alzaergo|sit-?stand|elektric|trotten|rodulf/i,
    kozy: /koz|mittback|trestl/i,
    'kontejner-nosny': /alex|zásuvk|kontejner/i,
  }
  const re = klice[typ] ?? /rám|ram |podnož|jekl|utespelare|trotten/i
  return KATALOG.podnoze
    .filter((p) => p.cena > 0 && re.test(p.nazev + ' ' + p.popis))
    .sort((a, b) => a.cena - b.cena)
}
