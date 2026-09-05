import palette from '@repo/palette.json'

export type MaterialKategorie = 'masiv' | 'dyha' | 'lamino' | 'hpl' | 'linoleum' | 'lak'

export interface Material {
  id: string
  nazev: string
  /** Krátký popisek do přepínače, ať se varianty nesloučí. */
  kratky: string
  kategorie: MaterialKategorie
  /** Základní barva povrchu. */
  barva: string
  /** Tmavší a světlejší tón pro kresbu dřeva. */
  kresbaTmava?: string
  kresbaSvetla?: string
  /** true = generovat kresbu dřeva. */
  drevo: boolean
  /** Drsnost povrchu pro PBR (0 = zrcadlo, 1 = matné). */
  drsnost: number
  /** Čirý lak navrch (0 = olej/mat, 1 = vysoký lesk). */
  lesk: number
  /** Dostupné tloušťky. */
  tloustky: number[]
  /** Parametry kresby dřeva (viz woodTextures): hustota letokruhů, vlnění, výraznost pórů. */
  hustota?: number
  vlneni?: number
  pory?: number
  /** Orientační cena za m² desky včetně DPH (doplňuje se z rešerše). */
  cenaM2?: number
  poznamka?: string
}

const K = (palette as any).key_colors as Record<string, string>

/**
 * Barvy dřevin vychází z naměřených hodnot z fotky (palette.json),
 * aby dekory seděly do téhle konkrétní místnosti.
 */
export const MATERIALY: Material[] = [
  // ---- masiv (6) ----
  {
    id: 'dub-svetly-masiv', nazev: 'Dub masiv přírodní, olej', kratky: 'Dub přírodní', kategorie: 'masiv',
    barva: K.dub_stavajici, kresbaTmava: '#9A6B42', kresbaSvetla: '#DCB489',
    drevo: true, drsnost: 0.62, lesk: 0.12, tloustky: [18, 25, 30, 40],
    poznamka: 'Tón stávajícího nábytku v místnosti (konferenčák, kontejner).',
  },
  {
    id: 'dub-podlaha-masiv', nazev: 'Dub masiv mořený do tónu podlahy', kratky: 'Dub jako podlaha', kategorie: 'masiv',
    barva: '#8A4A16', kresbaTmava: '#5E2F08', kresbaSvetla: '#B0692A',
    drevo: true, drsnost: 0.60, lesk: 0.14, tloustky: [18, 25, 30, 40],
    poznamka: 'Namícháno na tón vlysové podlahy (#83420F z fotky).',
  },
  {
    id: 'dub-medovy-masiv', nazev: 'Dub masiv medový (teplý olej)', kratky: 'Dub medový', kategorie: 'masiv',
    barva: '#B8823F', kresbaTmava: '#8C5A24', kresbaSvetla: '#DCAE6E',
    drevo: true, drsnost: 0.60, lesk: 0.14, tloustky: [18, 25, 30, 40],
    poznamka: 'Mezi přírodním dubem a podlahou — teplý zlatý tón.',
  },
  {
    id: 'dub-rustikal-masiv', nazev: 'Dub masiv rustikální, sukatý (tón podlahy)', kratky: 'Dub rustikální', kategorie: 'masiv',
    barva: '#96541C', kresbaTmava: '#552A08', kresbaSvetla: '#C48A48',
    drevo: true, drsnost: 0.66, lesk: 0.10, tloustky: [25, 30, 40],
    hustota: 9, vlneni: 1.5, pory: 1.7,
    poznamka: 'Výraznější kresba a suky, jakost B/C. Levnější než průběžná lamela.',
  },
  {
    id: 'dub-kourovy-masiv', nazev: 'Dub masiv kouřový', kratky: 'Dub kouřový', kategorie: 'masiv',
    barva: '#54301A', kresbaTmava: '#33190A', kresbaSvetla: '#7A4C2C',
    drevo: true, drsnost: 0.64, lesk: 0.10, tloustky: [18, 25, 30, 40],
  },
  {
    id: 'dub-tmavy-masiv', nazev: 'Dub masiv mořený tmavý (kávový)', kratky: 'Dub tmavý', kategorie: 'masiv',
    barva: '#4A2D18', kresbaTmava: '#2C180A', kresbaSvetla: '#6E4529',
    drevo: true, drsnost: 0.62, lesk: 0.16, tloustky: [18, 25, 30, 40],
    poznamka: 'Nejtmavší dub — kontrast ke světlým stěnám, ladí s černým rámem.',
  },
  // ---- dýha (2) ----
  {
    id: 'dyha-dub-svetla', nazev: 'Dýhovaná MDF, dub přírodní', kratky: 'Dýha dub', kategorie: 'dyha',
    barva: '#C9975F', kresbaTmava: '#9E7040', kresbaSvetla: '#E2BA88',
    drevo: true, drsnost: 0.55, lesk: 0.22, tloustky: [18, 25, 30, 38],
  },
  {
    id: 'dyha-dub-kourova', nazev: 'Dýhovaná MDF, dub kouřový', kratky: 'Dýha dub kouřový', kategorie: 'dyha',
    barva: '#6B4426', kresbaTmava: '#46280F', kresbaSvetla: '#8E6440',
    drevo: true, drsnost: 0.54, lesk: 0.24, tloustky: [18, 25, 38],
  },
  // ---- lamino (2) — dekory z rešerše dekorů (research/dekory-2026-09-03.md) ----
  {
    id: 'lamino-dub-hamilton', nazev: 'Lamino Egger H3303 ST10, dub Hamilton přírodní', kratky: 'Lamino Hamilton', kategorie: 'lamino',
    barva: '#C4A078', kresbaTmava: '#A07E55', kresbaSvetla: '#DBBF9A',
    drevo: true, drsnost: 0.52, lesk: 0.26, tloustky: [18, 25],
    poznamka: 'Nejuniverzálnější světlý dub v Eggeru, struktura ST10 Deepskin Rough.',
  },
  {
    id: 'lamino-dub-sherman', nazev: 'Lamino Egger H1344 ST32, dub Sherman koňakový', kratky: 'Lamino Sherman', kategorie: 'lamino',
    barva: '#8E5A2A', kresbaTmava: '#6A3E14', kresbaSvetla: '#B07C47',
    drevo: true, drsnost: 0.58, lesk: 0.18, tloustky: [18, 25],
    hustota: 8, vlneni: 1.3, pory: 1.4,
    poznamka: 'Nejblíž sytosti podlahy; Feelwood ST32 má synchronní strukturu, hmatově blízko vlysu.',
  },
]

export const MATERIAL_MAP = new Map(MATERIALY.map((m) => [m.id, m]))
export const material = (id: string): Material => MATERIAL_MAP.get(id) ?? MATERIALY[0]

/** Barvy komaxitu a kovu pro podnože. */
export const KOV_BARVY = [
  { id: 'cerna-struktura', nazev: 'Černá struktura (RAL 9005)', barva: '#1F2021' },
  { id: 'antracit', nazev: 'Antracit (RAL 7016)', barva: '#33383B' },
  { id: 'bila', nazev: 'Bílá (RAL 9016)', barva: '#E8E6E1' },
  { id: 'nerez', nazev: 'Nerez / chrom', barva: '#B9BCC0' },
]

export const PALETA = palette as any
