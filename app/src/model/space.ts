/**
 * Rozměry místa v obývacím pokoji. Vše v MILIMETRECH.
 *
 * Souřadnice (pohled shora, počátek v rohu místnosti):
 *   +X  podél ZADNÍ stěny, směrem ke gauči
 *   +Z  podél LEVÉ stěny, směrem do místnosti (ke kameře na fotce)
 *   +Y  nahoru
 *
 *              X →
 *        ROH ┌──────────────── zadní stěna ────────────────────
 *          Z │ ┌──────── rameno B ────────┐ mezera ┌───────────────────────┐
 *          ↓ │ │ monitor v rohu           │◄──────►│  GAUČ do U (zadní díl) │
 *            │ ├────────────┐             │        ├────────┐              ├──┐
 *            │ │  rameno A  │                      │lehátko │              │  │
 *            │ │  (hlavní)  │      ⊙ židle         │u stolu │              │  │
 *            │ └────────────┘                      └────────┘              └──┘
 *         levá stěna
 *            │
 *            ╪  hrana stěny (236 cm) — začátek průchodu ve zdi
 *            ║  průchod
 */

export const SPACE = {
  /** Běh levé stěny od rohu směrem do místnosti — končí hranou průchodu. */
  levaStenaRun: 2360,
  /** Odstup konce ramene A od hrany průchodu. */
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

  /**
   * Gauč do U. Zadní díl leží podél zadní stěny od `zadniStenaKeGauci` dál,
   * a na obou koncích pokračuje lehátkem do místnosti. To bližší lehátko
   * stojí hned vedle konce ramene B a táhne se podél stolu — vedle gauče
   * tedy NENÍ volno na křeslo ani na nic jiného.
   */
  gauc: {
    /** Hloubka zadního dílu (sedák + opěrka) od zadní stěny. */
    hloubka: 950,
    /** Celková šířka podél zadní stěny. */
    sirka: 3300,
    /** Lehátko u stolu: šířka podél zadní stěny a jak daleko od ní sahá (výchozí; jde přenastavit v půdorysu). */
    lehatko: { sirka: 1000, delka: 2000, min: 1000, max: 2600 },
    /** Lehátko na vzdáleném konci. */
    lehatkoVzdalene: { sirka: 900, delka: 1700 },
    vyskaSedaku: 430,
    vyskaOperky: 720,
  },

  /**
   * Průchod ve staré tlusté zdi — začíná přesně na hraně, od které držíme
   * odstup 25 cm. Dveře v něm nejsou, je to jen otvor s ostěním.
   */
  pruchod: {
    odRohu: 2360,
    sirka: 900,
    vyska: 2100,
    /** Tloušťka zdi podle uživatele ("metr tlustá zeď"). */
    tloustkaZdi: 1000,
  },
} as const

/** Maximální délka ramene A (podél levé stěny). */
export const MAX_RAMENO_A = SPACE.levaStenaRun - SPACE.odstupOdHrany // 2110

/** Maximální délka ramene B pro danou mezeru ke gauči. */
export function maxRamenoB(mezera: number): number {
  return SPACE.zadniStenaKeGauci - mezera
}

/** Rozsahy posuvníků — tvrdě ořezané tímto rohem. */
export const LIMITY = {
  ramenoADelka: { min: 1200, max: MAX_RAMENO_A, krok: 10, vychozi: MAX_RAMENO_A },
  ramenoBDelka: { min: 900, max: maxRamenoB(SPACE.mezeraKeGauci.idealniOd), krok: 10, vychozi: 1480 },
  ramenoAHloubka: { min: 550, max: 800, krok: 10, vychozi: 700 },
  ramenoBHloubka: { min: 450, max: 800, krok: 10, vychozi: 600 },
  vyska: { min: 700, max: 780, krok: 5, vychozi: 750 },
  mezeraKeGauci: { min: 80, max: 250, krok: 5, vychozi: 120 },
  radiusUZdi: { min: 0, max: 400, krok: 10 },
  monitorPosun: { min: 0, max: 300, krok: 10 },
} as const

/**
 * Monitor uživatele: MSI Optix AG321CQR, 31,5" (80 cm) zakřivený 1500R, 16:9.
 * Rozměry panelu plynou z úhlopříčky (697 × 392 mm aktivní plocha); rám a
 * stojan jsou typické pro tuhle řadu — výrobce je na webu nezveřejňuje tak,
 * aby šly ověřit bez vykreslené stránky. Hmotnost se stojanem 6,59 kg
 * (displayspecifications.com).
 */
export const MONITOR = {
  nazev: 'MSI Optix AG321CQR 31,5"',
  /** Šířka a výška hlavy včetně rámečku. */
  sirka: 709,
  vyskaHlavy: 420,
  /** Aktivní plocha. */
  panelSirka: 697,
  panelVyska: 392,
  /** Poloměr zakřivení. */
  zakriveni: 1500,
  /** Půdorys stojanu (podstavec) a výška spodní hrany panelu nad deskou. */
  stojan: { sirka: 480, hloubka: 270, vyskaSpodniHrany: 110 },
  /**
   * Vzdálenost roviny obrazovky od zadní hrany podstavce. Když stojan stojí
   * u zdi, obrazovka je takhle daleko od zdi.
   */
  obrazovkaOdZadu: 190,
  /** Doporučená vzdálenost očí od obrazovky pro 32" QHD — uživatelovo pásmo. */
  vzdalenost: { min: 700, max: 1000, idealni: 850 },
  /** Kde má oči člověk sedící u desky: kousek za přední hranou. */
  ociZaHranou: 150,
} as const

/**
 * Dosah výškově stavitelných rámů — ověřeno proti stránkám výrobců
 * (research/doovereni-2026-09-03.md). Naprostá většina dvousloupových rámů
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
