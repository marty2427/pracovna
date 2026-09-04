/**
 * Rozměry místa v obývacím pokoji. Vše v MILIMETRECH.
 *
 * Souřadnice (pohled shora, počátek v rohu místnosti):
 *   +X  podél ZADNÍ stěny, směrem ke gauči
 *   +Z  podél LEVÉ stěny, směrem do místnosti (ke kameře na fotce)
 *   +Y  nahoru
 *
 *              X →
 *        ROH ┌──────────────── zadní stěna ──────────
 *          Z │ ┌──────── rameno B ────────┐  mezera  ┌──────
 *          ↓ │ │  tiskárna v rohu         │ ◄──────► │ GAUČ
 *            │ ├────────────┐             │          └──────
 *            │ │  rameno A  │
 *            │ │  (hlavní)  │      ⊙ židle
 *            │ └────────────┘
 *         levá stěna
 */

export const SPACE = {
  /** Běh levé stěny od rohu směrem do místnosti. */
  levaStenaRun: 2360,
  /** Odstup konce ramene A od hrany (průchod / konec stěny). */
  odstupOdHrany: 250,
  /** Běh zadní stěny od rohu ke gauči. */
  zadniStenaKeGauci: 1600,
  /** Světlá výška místnosti. */
  vyskaStropu: 2800,

  /** Mezera mezi koncem ramene B a gaučem — požadavek uživatele. */
  mezeraKeGauci: { min: 100, max: 250, doporuceno: 120, idealniOd: 100, idealniDo: 150 },

  /**
   * Volná podlaha, kterou potřebuje kancelářská židle na odsunutí a vstání.
   * Průchod se nezapočítává — uživatel potvrdil, že se kolem stolu nikam nechodí.
   * Kdyby zóna sloužila i jako průchod, chtělo by to o 60-75 cm víc.
   */
  zonaZidle: { min: 800, doporuceno: 900 },

  /** Gauč: zabírá X od zadniStenaKeGauci dál, hloubka v ose Z. */
  gauc: { hloubka: 950 },
} as const

/** Maximální délka ramene A (podél levé stěny). */
export const MAX_RAMENO_A = SPACE.levaStenaRun - SPACE.odstupOdHrany // 2110

/** Maximální délka ramene B pro danou mezeru ke gauči. */
export function maxRamenoB(mezera: number): number {
  return SPACE.zadniStenaKeGauci - mezera
}

/** Rozsahy posuvníků — tvrdě ořezané tímto rohem. */
export const LIMITY = {
  ramenoADelka: { min: 1200, max: MAX_RAMENO_A, krok: 10, vychozi: 2110 },
  ramenoBDelka: { min: 0, max: maxRamenoB(SPACE.mezeraKeGauci.idealniOd), krok: 10, vychozi: 1480 },
  ramenoAHloubka: { min: 550, max: 800, krok: 10, vychozi: 700 },
  ramenoBHloubka: { min: 450, max: 700, krok: 10, vychozi: 550 },
  vyska: { min: 700, max: 780, krok: 5, vychozi: 750 },
  mezeraKeGauci: { min: 80, max: 250, krok: 5, vychozi: 120 },
} as const

/** Minimální hloubka ramene B, aby se na něj vešla běžná A4 multifunkce. */
export const TISKARNA = { sirka: 450, hloubka: 400, vyska: 260 }

/**
 * Dosah výškově stavitelných rámů — ověřeno proti stránkám výrobců
 * (scripts/_doovereni_2026-09-03.md). Naprostá většina dvousloupových rámů
 * má traverzu roztažitelnou jen do 1600-1700 mm. U dlouhého ramene tak není
 * limitem cena, ale rozměr.
 */
export const STAVITELNY_RAM = {
  /** Běžný dvousloupový rám: AlzaErgo ET1 (1000-1700), IKEA MITTZON (1200/1400/1600). */
  bezneMax: 1700,
  /** Nejdelší ověřený dvousloupový rám: Liftor Expert, desky do 2200 x 1000 mm. */
  nejdelsiDvousloupovy: 2200,
  /**
   * Rohová sestava: pozor, tady je snadné se splést.
   * Liftor L uvádí desky až 2900 x 1000 mm, ale JEN pro rovné uspořádání 180°.
   * Pro roh 90° výrobce sám uvádí desky 1300-1900 x 600-800 mm.
   * Powerton ERGO EDGE zvládne první rameno do 2200 mm, ale druhé jen do 1100 mm.
   * Rohová polohovací sestava pro 2110 + 1480 mm tedy na trhu ověřená není.
   */
  rohovaSestava: 1900,
  /** Nejdelší druhé rameno, které rohová sestava podpoří (Powerton ERGO EDGE). */
  rohovaSestavaDruheRameno: 1100,
}

/**
 * Nejdelší ověřená PEVNÁ podnož: ALUPRESS SKCH-O, roztažitelná 1340-1820 mm.
 * Ověřeno proti stránce prodejce.
 */
export const PEVNA_PODNOZ_MAX = 1820
