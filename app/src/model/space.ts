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

  /** Volná podlaha, kterou potřebuje kancelářská židle na odsunutí a vstání. */
  zonaZidle: { min: 850, doporuceno: 1000 },

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
