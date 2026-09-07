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
  /** 0 = katedrální fládr, 1 = rovné vlákno. */
  rovnost?: number
  /** Kontrast kresby 0–1. */
  kontrast?: number
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
    barva: '#C7BFA8', kresbaTmava: '#ADA48C', kresbaSvetla: '#D9D2BD',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    hustota: 16,
    vlneni: 0.4,
    pory: 0.2,
    rovnost: 0.95,
    kontrast: 0.65,
    poznamka: 'Čelní dřevo skládané ze špalíčků — světlý, béžově šedý, zcela jiná kresba než ostatní.',
  },
  {
    id: 'egger-h305', kod: 'H305', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H305 ST12 Dub Tonsberg přírodní', kratky: 'Tonsberg přírodní H305', kategorie: 'lamino',
    barva: '#BCB09C', kresbaTmava: '#9E917C', kresbaSvetla: '#D0C6B4',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.85,
    kontrast: 0.75,
    poznamka: 'Šedavě béžový dub s jemnou kresbou.',
  },
  {
    id: 'egger-h309', kod: 'H309', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H309 ST12 Dub Tonsberg hnědý', kratky: 'Tonsberg hnědý H309', kategorie: 'lamino',
    barva: '#7E6C58', kresbaTmava: '#60503F', kresbaSvetla: '#978672',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.85,
    kontrast: 0.75,
    poznamka: 'Střední šedohnědý dub.',
  },
  {
    id: 'egger-h1199', kod: 'H1199', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H1199 ST12 Dub Thermo černohnědý', kratky: 'Thermo černohnědý H1199', kategorie: 'lamino',
    barva: '#3A2D27', kresbaTmava: '#241B17', kresbaSvetla: '#4E403A',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.8,
    kontrast: 0.65,
    poznamka: 'Nejtmavší z výběru, skoro černý. Kontrast ke světlým stěnám, ladí s černým rámem.',
  },
  {
    id: 'egger-h1303', kod: 'H1303', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H1303 ST12 Dub Belmont hnědý', kratky: 'Belmont hnědý H1303', kategorie: 'lamino',
    barva: '#8A6E55', kresbaTmava: '#6B5342', kresbaSvetla: '#A48A72',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.8,
    kontrast: 0.75,
    poznamka: 'Teplý střední hnědý dub, o tón tmavší než podlaha.',
  },
  {
    id: 'egger-h1362', kod: 'H1362', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H1362 ST12 Dub Baronia světlý', kratky: 'Baronia světlý H1362', kategorie: 'lamino',
    barva: '#CEC0A8', kresbaTmava: '#B4A58C', kresbaSvetla: '#DED3C0',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.85,
    kontrast: 0.65,
    poznamka: 'Světlý, klidný, lehce šedavý.',
  },
  {
    id: 'egger-h3131', kod: 'H3131', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3131 ST12 Dub Davos přírodní', kratky: 'Davos přírodní H3131', kategorie: 'lamino',
    barva: '#C5B59B', kresbaTmava: '#A69478', kresbaSvetla: '#D8CBB5',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.55,
    vlneni: 1.2,
    kontrast: 0.90,
    poznamka: 'Přírodní dub s výraznějšími letokruhy.',
  },
  {
    id: 'egger-h3133', kod: 'H3133', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3133 ST12 Dub Davos lanýžově hnědý', kratky: 'Davos lanýžově hnědý H3133', kategorie: 'lamino',
    barva: '#8B7560', kresbaTmava: '#6E5A47', kresbaSvetla: '#A38E79',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.55,
    vlneni: 1.2,
    kontrast: 0.85,
    poznamka: 'Lanýžově hnědý, tlumený.',
  },
  {
    id: 'egger-h3156', kod: 'H3156', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3156 ST12 Dub Corbridge šedý', kratky: 'Corbridge šedý H3156', kategorie: 'lamino',
    barva: '#A79785', kresbaTmava: '#8B7B68', kresbaSvetla: '#BBAD9C',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.75,
    kontrast: 0.75,
    poznamka: 'Šedý dub — chladnější, k černému kovu.',
  },
  {
    id: 'egger-h3157', kod: 'H3157', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3157 ST12 Dub Vicenza', kratky: 'Vicenza H3157', kategorie: 'lamino',
    barva: '#CDB48E', kresbaTmava: '#B0976F', kresbaSvetla: '#DDCAAA',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.7,
    kontrast: 0.85,
    poznamka: 'Hlavní doporučení rešerše: jemně šedý, výrazná ale ne hluboká kresba. Tabule 18 mm skladem u Dřevo Trust.',
  },
  {
    id: 'egger-h3165', kod: 'H3165', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3165 ST12 Dub Vicenza světlý', kratky: 'Vicenza světlý H3165', kategorie: 'lamino',
    barva: '#DDCFB4', kresbaTmava: '#C2B394', kresbaSvetla: '#E9DFCB',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.7,
    kontrast: 0.70,
    poznamka: 'Nejsvětlejší z výběru, skandinávský tón.',
  },
  {
    id: 'egger-h3170', kod: 'H3170', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3170 ST12 Dub Kendal přírodní', kratky: 'Kendal přírodní H3170', kategorie: 'lamino',
    barva: '#D1B58C', kresbaTmava: '#B39566', kresbaSvetla: '#E0CDAE',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.6,
    pory: 0.8,
    kontrast: 0.85,
    poznamka: 'Přírodní dub s jemnými suky, druhá volba rešerše.',
  },
  {
    id: 'egger-h3171', kod: 'H3171', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3171 ST12 Dub Kendal olejovaný', kratky: 'Kendal olejovaný H3171', kategorie: 'lamino',
    barva: '#CFA872', kresbaTmava: '#AE884F', kresbaSvetla: '#DFC29A',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.6,
    pory: 0.8,
    kontrast: 0.90,
    poznamka: 'Teplejší „olejovaný" tón — nejblíž stávajícímu nábytku v místnosti.',
  },
  {
    id: 'egger-h3395', kod: 'H3395', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3395 ST12 Dub Corbridge přírodní', kratky: 'Corbridge přírodní H3395', kategorie: 'lamino',
    barva: '#D1A66C', kresbaTmava: '#B08548', kresbaSvetla: '#E0C193',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.7,
    kontrast: 0.85,
    poznamka: 'Zlatavý přírodní dub.',
  },
  {
    id: 'egger-h3398', kod: 'H3398', struktura: 'ST12 Omnipore Matt',
    nazev: 'Egger H3398 ST12 Dub Kendal koňakový', kratky: 'Kendal koňakový H3398', kategorie: 'lamino',
    barva: '#B58553', kresbaTmava: '#946635', kresbaSvetla: '#CBA072',
    drevo: true, drsnost: 0.58, lesk: 0.06, tloustky: [18, 25, 38],
    rovnost: 0.6,
    pory: 0.8,
    kontrast: 0.90,
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
