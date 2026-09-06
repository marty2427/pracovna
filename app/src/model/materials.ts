import palette from '@repo/palette.json'

export type MaterialKategorie = 'masiv' | 'dyha' | 'lamino' | 'hpl' | 'linoleum' | 'lak'

export interface Material {
  id: string
  /** Kód dekoru výrobce (Egger H3157). */
  kod?: string
  /** Struktura povrchu (ST12 Omnipore Matt). */
  struktura?: string
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


/**
 * Barvy dřevin vychází z naměřených hodnot z fotky (palette.json),
 * aby dekory seděly do téhle konkrétní místnosti.
 */
/**
 * Jen dekory Egger Eurodekor ve struktuře ST12 Omnipore Matt — mělká matná
 * struktura, kterou rešerše povrchu (research/povrch-desky-2026-09-06.md)
 * doporučila kvůli myši, prachu a údržbě. Patnáct dubů z Egger kolekce, nic jiného.
 * Barvy jsou odhad ze vzorníku; skutečný odstín ověř na fyzickém vzorku (Kili, Démos, JAF).
 */
export const MATERIALY: Material[] = [
  {
    id: 'egger-h193', kod: 'H193', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H193 ST12 Dub špalíček', kratky: 'špalíček H193', kategorie: 'lamino',
    barva: '#C8BEA5', kresbaTmava: '#A69A7F', kresbaSvetla: '#DDD5C0',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    hustota: 14,
    vlneni: 2.2,
    pory: 0.3,
    poznamka: 'Čelní dřevo skládané ze špalíčků — světlý, béžově šedý, zcela jiná kresba než ostatní.',
  },
  {
    id: 'egger-h305', kod: 'H305', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H305 ST12 Dub Tonsberg přírodní', kratky: 'Tonsberg přírodní H305', kategorie: 'lamino',
    barva: '#B7A78F', kresbaTmava: '#93826A', kresbaSvetla: '#CFC2AE',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Šedavě béžový dub s jemnou kresbou.',
  },
  {
    id: 'egger-h309', kod: 'H309', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H309 ST12 Dub Tonsberg hnědý', kratky: 'Tonsberg hnědý H309', kategorie: 'lamino',
    barva: '#7C6249', kresbaTmava: '#59432F', kresbaSvetla: '#98806A',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Střední šedohnědý dub.',
  },
  {
    id: 'egger-h1199', kod: 'H1199', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H1199 ST12 Dub Thermo černohnědý', kratky: 'Thermo černohnědý H1199', kategorie: 'lamino',
    barva: '#2F2521', kresbaTmava: '#1B1411', kresbaSvetla: '#473A33',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Nejtmavší z výběru, skoro černý. Kontrast ke světlým stěnám, ladí s černým rámem.',
  },
  {
    id: 'egger-h1303', kod: 'H1303', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H1303 ST12 Dub Belmont hnědý', kratky: 'Belmont hnědý H1303', kategorie: 'lamino',
    barva: '#7F6248', kresbaTmava: '#5D4531', kresbaSvetla: '#9B7F68',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Teplý střední hnědý dub, o tón tmavší než podlaha.',
  },
  {
    id: 'egger-h1362', kod: 'H1362', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H1362 ST12 Dub Baronia světlý', kratky: 'Baronia světlý H1362', kategorie: 'lamino',
    barva: '#C7B69C', kresbaTmava: '#A6957A', kresbaSvetla: '#DED2BE',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Světlý, klidný, lehce šedavý.',
  },
  {
    id: 'egger-h3131', kod: 'H3131', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3131 ST12 Dub Davos přírodní', kratky: 'Davos přírodní H3131', kategorie: 'lamino',
    barva: '#C2AE93', kresbaTmava: '#9F8A6C', kresbaSvetla: '#D9CAB2',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    vlneni: 1.3,
    poznamka: 'Přírodní dub s výraznějšími letokruhy.',
  },
  {
    id: 'egger-h3133', kod: 'H3133', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3133 ST12 Dub Davos lanýžově hnědý', kratky: 'Davos lanýžově hnědý H3133', kategorie: 'lamino',
    barva: '#8C7058', kresbaTmava: '#6A523F', kresbaSvetla: '#A88E75',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    vlneni: 1.3,
    poznamka: 'Lanýžově hnědý, tlumený.',
  },
  {
    id: 'egger-h3156', kod: 'H3156', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3156 ST12 Dub Corbridge šedý', kratky: 'Corbridge šedý H3156', kategorie: 'lamino',
    barva: '#A5907A', kresbaTmava: '#847158', kresbaSvetla: '#BFAD98',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Šedý dub — chladnější, k černému kovu.',
  },
  {
    id: 'egger-h3157', kod: 'H3157', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3157 ST12 Dub Vicenza', kratky: 'Vicenza H3157', kategorie: 'lamino',
    barva: '#C8AF89', kresbaTmava: '#A88E67', kresbaSvetla: '#DFCCAC',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Hlavní doporučení rešerše: jemně šedý, výrazná ale ne hluboká kresba. Tabule 18 mm skladem u Dřevo Trust.',
  },
  {
    id: 'egger-h3165', kod: 'H3165', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3165 ST12 Dub Vicenza světlý', kratky: 'Vicenza světlý H3165', kategorie: 'lamino',
    barva: '#D8C7A9', kresbaTmava: '#B8A587', kresbaSvetla: '#E9DFCA',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Nejsvětlejší z výběru, skandinávský tón.',
  },
  {
    id: 'egger-h3170', kod: 'H3170', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3170 ST12 Dub Kendal přírodní', kratky: 'Kendal přírodní H3170', kategorie: 'lamino',
    barva: '#CCB38E', kresbaTmava: '#AB9068', kresbaSvetla: '#E1CFB2',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    pory: 0.8,
    poznamka: 'Přírodní dub s jemnými suky, druhá volba rešerše.',
  },
  {
    id: 'egger-h3171', kod: 'H3171', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3171 ST12 Dub Kendal olejovaný', kratky: 'Kendal olejovaný H3171', kategorie: 'lamino',
    barva: '#C8A36E', kresbaTmava: '#A5814C', kresbaSvetla: '#DCC199',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    pory: 0.8,
    poznamka: 'Teplejší „olejovaný" tón — nejblíž stávajícímu nábytku v místnosti.',
  },
  {
    id: 'egger-h3395', kod: 'H3395', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3395 ST12 Dub Corbridge přírodní', kratky: 'Corbridge přírodní H3395', kategorie: 'lamino',
    barva: '#C69E69', kresbaTmava: '#A37B46', kresbaSvetla: '#DCBD92',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    poznamka: 'Zlatavý přírodní dub.',
  },
  {
    id: 'egger-h3398', kod: 'H3398', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3398 ST12 Dub Kendal koňakový', kratky: 'Kendal koňakový H3398', kategorie: 'lamino',
    barva: '#B47F49', kresbaTmava: '#8E5D2D', kresbaSvetla: '#CD9C6A',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    pory: 0.8,
    poznamka: 'Koňakový, nejblíž tónu vlysové podlahy.',
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
