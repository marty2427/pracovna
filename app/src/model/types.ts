/** Datový model stolu. Vše v MILIMETRECH, barvy jako HEX. */

/** 38 mm je tloušťka kuchyňských pracovních desek (IKEA KARLBY, MÖLLEKULLA, SÄLJAN). */
export type Tloustka = 18 | 25 | 30 | 38 | 40

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

/**
 * Kde stojí monitor a tedy i kde se sedí.
 *   roh      — monitor v rohu L, sedí se na úhlopříčce (klasické rohové pracoviště)
 *   ramenoA  — monitor u levé stěny na dlouhém rameni
 *   ramenoB  — monitor u zadní stěny na kratším rameni
 */
export type MonitorUmisteni = 'roh' | 'ramenoA' | 'ramenoB'

export interface Deska {
  materialId: string
  tloustka: Tloustka
  hrana: Hrana
  /** Zaoblení vnějších rohů desky, mm (0 = ostré). */
  radiusRohu: number
  /** Zaoblení vnitřního rohu L, mm. */
  radiusVnitrni: number
  /**
   * Zaoblení rohu desky u zdi (v rohu místnosti), mm. 0 = deska roh vyplní celý.
   * Větší rádius nechá za monitorem mezeru na kabely a deska nemusí sedět
   * na milimetr do rohu, který stejně nikdy není přesně pravý.
   */
  radiusUZdi: number
  /**
   * Ergonomický výřez v přední hraně v místě sezení (0 = žádný).
   * Kde přesně je, určuje umístění monitoru (doplnky.monitorUmisteni).
   * Přesah desky přes podnož se nastavuje jako `podnoz.odsazeni` — je to
   * tatáž veličina měřená z druhé strany, mít ji dvakrát by se rozešlo.
   */
  vyrez: number
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
  /** Podélná výztuha (jekl) pod deskou — zvýší dovolený rozpon. U bočnic je to zadní výztužný panel. */
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
  /** Kde stojí monitor (a kde se sedí). */
  monitorUmisteni: MonitorUmisteni
  /** Posun monitoru od zdi / z rohu směrem k sedícímu, mm (0 = stojan u zdi). */
  monitorPosun: number
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
}

/** Půdorysný obdélník v mm, souřadnice dle space.ts. */
export interface Rect {
  x0: number; z0: number; x1: number; z1: number
}

/** Bod v půdorysu (mm). */
export type Bod = { x: number; z: number }
