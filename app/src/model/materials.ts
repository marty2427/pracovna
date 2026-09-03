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
  {
    id: 'dub-svetly-masiv', nazev: 'Dub masiv, světlý (olej)', kratky: 'Dub světlý', kategorie: 'masiv',
    barva: K.dub_stavajici, kresbaTmava: '#9A6B42', kresbaSvetla: '#DCB489',
    drevo: true, drsnost: 0.62, lesk: 0.12, tloustky: [18, 25, 30, 40],
    poznamka: 'Tón stávajícího nábytku v místnosti (konferenčák, kontejner).',
  },
  {
    id: 'dub-podlaha-masiv', nazev: 'Dub masiv, mořený do tónu podlahy', kratky: 'Dub jako podlaha', kategorie: 'masiv',
    barva: '#8A4A16', kresbaTmava: '#5E2F08', kresbaSvetla: '#B0692A',
    drevo: true, drsnost: 0.60, lesk: 0.14, tloustky: [18, 25, 30, 40],
    poznamka: 'Namícháno na tón vlysové podlahy.',
  },
  {
    id: 'dub-kourovy-masiv', nazev: 'Dub masiv, kouřový', kratky: 'Dub kouřový', kategorie: 'masiv',
    barva: '#54301A', kresbaTmava: '#33190A', kresbaSvetla: '#7A4C2C',
    drevo: true, drsnost: 0.64, lesk: 0.10, tloustky: [18, 25, 30, 40],
  },
  {
    id: 'jasan-masiv', nazev: 'Jasan masiv', kratky: 'Jasan', kategorie: 'masiv',
    barva: '#D8B98E', kresbaTmava: '#A8845A', kresbaSvetla: '#EFD8B4',
    drevo: true, drsnost: 0.63, lesk: 0.12, tloustky: [18, 25, 30, 40],
  },
  {
    id: 'buk-masiv', nazev: 'Buk masiv', kratky: 'Buk', kategorie: 'masiv',
    barva: '#D6AE86', kresbaTmava: '#B0865C', kresbaSvetla: '#EBCFAF',
    drevo: true, drsnost: 0.60, lesk: 0.14, tloustky: [18, 25, 30, 40],
  },
  {
    id: 'orech-masiv', nazev: 'Ořech masiv', kratky: 'Ořech', kategorie: 'masiv',
    barva: '#5A3A26', kresbaTmava: '#38220F', kresbaSvetla: '#835B3E',
    drevo: true, drsnost: 0.58, lesk: 0.18, tloustky: [18, 25, 30, 40],
  },
  {
    id: 'dyha-dub-svetla', nazev: 'Dýhovaná MDF, dub světlý', kratky: 'Dýha dub', kategorie: 'dyha',
    barva: '#C9975F', kresbaTmava: '#9E7040', kresbaSvetla: '#E2BA88',
    drevo: true, drsnost: 0.55, lesk: 0.22, tloustky: [18, 25, 30, 38],
  },
  {
    id: 'dyha-orech', nazev: 'Dýhovaná MDF, ořech', kratky: 'Dýha ořech', kategorie: 'dyha',
    barva: '#63412A', kresbaTmava: '#3F2716', kresbaSvetla: '#8A6244',
    drevo: true, drsnost: 0.54, lesk: 0.24, tloustky: [18, 25, 38],
  },
  {
    id: 'lamino-dub-svetly', nazev: 'Lamino, dekor světlý dub', kratky: 'Lamino dub sv.', kategorie: 'lamino',
    barva: '#C8A377', kresbaTmava: '#A88356', kresbaSvetla: '#DFC29B',
    drevo: true, drsnost: 0.52, lesk: 0.26, tloustky: [18, 25],
  },
  {
    id: 'lamino-dub-teply', nazev: 'Lamino, dekor teplý dub', kratky: 'Lamino dub teplý', kategorie: 'lamino',
    barva: '#96602F', kresbaTmava: '#6E4319', kresbaSvetla: '#B78450',
    drevo: true, drsnost: 0.52, lesk: 0.26, tloustky: [18, 25],
  },
  {
    id: 'lamino-antracit', nazev: 'Lamino, antracit', kratky: 'Lamino antracit', kategorie: 'lamino',
    barva: '#2B2C2E', drevo: false, drsnost: 0.48, lesk: 0.30, tloustky: [18, 25],
  },
  {
    id: 'lamino-krem', nazev: 'Lamino, krémová', kratky: 'Lamino krém', kategorie: 'lamino',
    barva: '#D8C6B4', drevo: false, drsnost: 0.50, lesk: 0.28, tloustky: [18, 25],
  },
  {
    id: 'hpl-antracit', nazev: 'HPL kompakt, antracit', kratky: 'HPL antracit', kategorie: 'hpl',
    barva: '#232426', drevo: false, drsnost: 0.44, lesk: 0.34, tloustky: [12, 18],
  },
  {
    id: 'lino-seda', nazev: 'Linoleum na nábytek, šedá', kratky: 'Lino šedé', kategorie: 'linoleum',
    barva: '#7C7A74', drevo: false, drsnost: 0.72, lesk: 0.06, tloustky: [19, 25, 30],
    poznamka: 'Forbo Furniture Linoleum na MDF, hrana masivní nákližek nebo ABS.',
  },
  {
    id: 'lino-antracit', nazev: 'Linoleum na nábytek, antracit', kratky: 'Lino antracit', kategorie: 'linoleum',
    barva: '#3A3A3A', drevo: false, drsnost: 0.72, lesk: 0.06, tloustky: [19, 25, 30],
  },
  {
    id: 'lak-petrolej', nazev: 'Lakovaná MDF, petrolej (tón gauče)', kratky: 'Lak petrolej', kategorie: 'lak',
    barva: K.gauc_zaklad, drevo: false, drsnost: 0.45, lesk: 0.35, tloustky: [18, 25],
    poznamka: 'Namícháno na petrolej gauče.',
  },
  {
    id: 'lak-horcicova', nazev: 'Lakovaná MDF, hořčicová (tón obrazu)', kratky: 'Lak hořčicový', kategorie: 'lak',
    barva: K.zluta_obraz, drevo: false, drsnost: 0.45, lesk: 0.35, tloustky: [18, 25],
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
