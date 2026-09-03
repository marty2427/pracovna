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
}

export interface Katalog {
  meta: { zdroj: string; stav: string; datum?: string }
  desky: KatalogPolozka[]
  podnoze: KatalogPolozka[]
  stoly: KatalogPolozka[]
  kovani: KatalogPolozka[]
  sluzby: KatalogPolozka[]
}

export const KATALOG = data as unknown as Katalog

export const jePrazdny = () =>
  KATALOG.desky.length + KATALOG.podnoze.length + KATALOG.stoly.length === 0

/** Desky, které pokryjí požadovaný rozměr (delší strana >= délka, kratší >= hloubka). */
export function deskyProRozmer(delka: number, hloubka: number, tloustka?: number): KatalogPolozka[] {
  return KATALOG.desky
    .filter((d) => {
      const dl = Math.max(d.delka, d.sirka), sir = Math.min(d.delka, d.sirka)
      if (!dl || !sir) return false
      if (dl < delka - 40 || sir < hloubka - 40) return false
      if (tloustka && d.tloustka && Math.abs(d.tloustka - tloustka) > 12) return false
      return true
    })
    .sort((a, b) => a.cena - b.cena)
}

/** Sériové stoly, které se vejdou do prostoru. */
export function stolyDoProstoru(maxDelka: number, maxHloubka: number): KatalogPolozka[] {
  return KATALOG.stoly
    .filter((s) => {
      const dl = Math.max(s.delka, s.sirka), sir = Math.min(s.delka, s.sirka)
      return dl > 0 && dl <= maxDelka && (sir === 0 || sir <= maxHloubka)
    })
    .sort((a, b) => b.delka - a.delka)
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
  return KATALOG.podnoze.filter((p) => re.test(p.nazev + ' ' + p.popis)).sort((a, b) => a.cena - b.cena)
}
