/** Datový model stolu. Vše v MILIMETRECH, barvy jako HEX. */

export type Tloustka = 18 | 25 | 30 | 40

/** Profil hrany desky. */
export type Hrana =
  | 'rovna'      // ABS 1–2 mm, ostrá
  | 'srazena'    // sražení 2–3 mm (fazetka)
  | 'zkosena'    // zkosení 45° přes většinu tloušťky
  | 'radius'     // zaoblení R3–R8
  | 'naklizek'   // masivní nákližek 20–40 mm, zaoblený

export type Tvar = 'L' | 'rovna'

export type PodnozTyp =
  | 'ram-A' | 'ram-U' | 'ram-H' | 'ram-trapez' | 'ram-hranaty'
  | 'hairpin'
  | 'nohy-rovne' | 'nohy-konicke' | 'nohy-sikme'
  | 'bocnice' | 'kozy'
  | 'kontejner-nosny'
  | 'stavitelny-ram'

export type UlozneTyp =
  | 'nic' | 'zasuvka-plocha' | 'zasuvky-2' | 'kontejner-3'
  | 'kontejner-pevny' | 'skrinka' | 'police' | 'zadni-panel'

export type Rameno = 'A' | 'B'

export interface Deska {
  materialId: string
  tloustka: Tloustka
  hrana: Hrana
  /** Zaoblení vnějších rohů desky, mm (0 = ostré). */
  radiusRohu: number
  /** Zaoblení vnitřního rohu L, mm. */
  radiusVnitrni: number
  /** Ergonomický výřez v místě sezení (0 = žádný). */
  vyrez: number
  /** Přesah desky přes podnož, mm. */
  presah: { predni: number; zadni: number; bocni: number }
}

export interface Podnoz {
  typ: PodnozTyp
  /** Rozměr profilu / tloušťka nohy, mm. */
  profil: number
  /** Odsazení podnože od hrany desky, mm. */
  odsazeni: number
  barva: string
  /** 'kov' mění materiálový vzhled na komaxit, 'drevo' na dřevo. */
  material: 'kov' | 'drevo'
  materialId?: string
  /**
   * Mezilehlá podpora uprostřed dlouhého ramene A.
   * 'auto' ji přidá, jen když by rozpon překročil limit materiálu.
   */
  mezilehlaPodpora: 'auto' | 'ano' | 'ne'
  /** Podélná výztuha (jekl) pod deskou — zvýší dovolený rozpon. */
  vyztuha: boolean
}

export interface Ulozne {
  typ: UlozneTyp
  rameno: Rameno
  /** Zarovnání podél ramene: 0 = u rohu, 1 = na konci. */
  pozice: number
  materialId?: string
  /** Barva čel — když se liší od korpusu (akcent). */
  barvaCel?: string
}

export interface Doplnky {
  kabelovaLavka: boolean
  pruchodka: 'zadna' | 'kulata' | 'obdelnikova'
  ledPodsviceni: boolean
  nastavecMonitor: boolean
  zadniPanel: boolean
  /** Tiskárna v rohu L — zadání uživatele. */
  tiskarnaVRohu: boolean
}

export interface Rozmery {
  /** Délka ramene A podél levé stěny (hlavní pracovní plocha). */
  ramenoADelka: number
  /** Hloubka ramene A od levé stěny. */
  ramenoAHloubka: number
  /** Délka ramene B podél zadní stěny (směrem ke gauči). */
  ramenoBDelka: number
  /** Hloubka ramene B od zadní stěny. */
  ramenoBHloubka: number
  /** Výška horní plochy desky. */
  vyska: number
  /** Mezera mezi koncem ramene B a gaučem. */
  mezeraKeGauci: number
}

export interface DeskConfig {
  id: string
  nazev: string
  rodina?: string
  popis?: string
  tvar: Tvar
  rozmery: Rozmery
  deska: Deska
  podnoz: Podnoz
  ulozne: Ulozne[]
  doplnky: Doplnky
  /** Zrcadlení celé sestavy (roh vpravo místo vlevo). */
  zrcadlit: boolean
}

/** Půdorysný obdélník v mm, souřadnice dle space.ts. */
export interface Rect {
  x0: number; z0: number; x1: number; z1: number
}
