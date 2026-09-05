import { SPACE, MAX_RAMENO_A, maxRamenoB, STAVITELNY_RAM, PEVNA_PODNOZ_MAX, MONITOR } from './space'
import type { DeskConfig, Rect, Bod, MonitorUmisteni } from './types'
import { material } from './materials'
import { podpory, skutecnyRozpon, dovolenyRozpon, MAX_ROZPON, maxRozponMat } from './podpory'
import { obrysDeskyBody, prusecikSHranou, poziceSezeniA, poziceSezeniB, type Pt } from './obrys'

export type Zavaznost = 'ok' | 'pozor' | 'chyba'

export interface Kontrola {
  id: string
  nazev: string
  hodnota: number
  jednotka: string
  cil: string
  stav: Zavaznost
  zprava: string
}

/** Co o místnosti není v konfiguraci stolu, ale ovlivňuje kontroly. */
export interface Mistnost {
  /** Jak daleko od zadní stěny sahá lehátko gauče u stolu (mm). */
  lehatko: number
}
export const VYCHOZI_MISTNOST: Mistnost = { lehatko: SPACE.gauc.lehatko.delka }

/** Půdorysné obdélníky desky (rameno A a rameno B). */
export function pudorys(c: DeskConfig): { a: Rect; b: Rect | null } {
  const { ramenoADelka, ramenoAHloubka, ramenoBDelka, ramenoBHloubka } = c.rozmery
  const a: Rect = { x0: 0, z0: 0, x1: ramenoAHloubka, z1: ramenoADelka }
  const b: Rect | null =
    c.tvar === 'L' && ramenoBDelka > 0
      ? { x0: 0, z0: 0, x1: ramenoBDelka, z1: ramenoBHloubka }
      : null
  return { a, b }
}

/** Plocha desky v m² (bez dvojího započtení rohu). */
export function plochaDesky(c: DeskConfig): number {
  const { a, b } = pudorys(c)
  const pa = (a.x1 - a.x0) * (a.z1 - a.z0)
  if (!b) return pa / 1e6
  const pb = (b.x1 - b.x0) * (b.z1 - b.z0)
  const prekryv = Math.min(a.x1, b.x1) * Math.min(a.z1, b.z1)
  return (pa + pb - prekryv) / 1e6
}

/**
 * Obvod desky v bm (pro cenu olepení hrany).
 * Obvod L o ramenech LA/LB a hloubkách DA/DB vyjde přesně na 2*(LA+LB) —
 * schodovité zalomení se v součtu vykrátí.
 */
export function obvodDesky(c: DeskConfig): number {
  const { ramenoADelka, ramenoAHloubka, ramenoBDelka } = c.rozmery
  if (c.tvar !== 'L' || ramenoBDelka <= 0) return (2 * (ramenoADelka + ramenoAHloubka)) / 1000
  return (2 * (ramenoADelka + ramenoBDelka)) / 1000
}

/** Viditelná hrana v bm — bez stran, které leží u stěny. */
export function viditelnaHrana(c: DeskConfig): number {
  const { ramenoADelka, ramenoAHloubka, ramenoBDelka } = c.rozmery
  if (c.tvar !== 'L' || ramenoBDelka <= 0) return (ramenoADelka + 2 * ramenoAHloubka) / 1000
  return (ramenoADelka + ramenoBDelka) / 1000
}

/** Kde uživatel sedí u ramene A (osa Z), mm — zpětná kompatibilita. */
export const poziceSezeni = poziceSezeniA

/** Skutečné umístění monitoru: u rovné desky nemá „roh" ani „rameno B" smysl. */
export function umisteniMonitoru(c: DeskConfig): MonitorUmisteni {
  const jeL = c.tvar === 'L' && c.rozmery.ramenoBDelka > 0
  return jeL ? c.doplnky.monitorUmisteni : 'ramenoA'
}

export interface Pracoviste {
  umisteni: MonitorUmisteni
  /** Střed obrazovky v půdorysu (mm) a natočení: úhel normály obrazovky (směr k divákovi) kolem osy Y. */
  monitor: Bod & { rot: number }
  /** Jednotkový směr od zdi k sedícímu. */
  smer: Bod
  /** Odkud paprsek vychází (bod na zdi / v rohu). */
  pocatek: Bod
  /** Přední hrana desky před sedícím. */
  hrana: Bod
  /** Oči sedícího. */
  oci: Bod
  /** Střed židle. */
  zidle: Bod
  /** Vzdálenost očí od obrazovky, mm. */
  vzdalenost: number
  /** Vzdálenost obrazovky od počátku (zdi / rohu) ve směru paprsku. */
  monitorOdZdi: number
  /** Přední hrana desky od počátku ve směru paprsku. */
  hranaOdZdi: number
}

/**
 * Kde stojí monitor, kde se sedí a jak daleko jsou oči od obrazovky.
 * Počítá se z opravdového obrysu desky, takže výřez, zaoblení vnitřního rohu
 * i roh u zdi se do vzdálenosti promítnou.
 */
export function pracoviste(c: DeskConfig): Pracoviste {
  const um = umisteniMonitoru(c)
  const posun = c.doplnky.monitorPosun
  const poly = obrysDeskyBody(c)

  let pocatek: Pt, smer: Pt, monitorOdZdi: number, rot: number
  if (um === 'roh') {
    const s = Math.SQRT1_2
    pocatek = [0, 0]; smer = [s, s]
    // Podstavec 480 mm široký natočený o 45°: jeho zadní rohy leží na
    // b/√2 ∓ 240/√2 od stěn, takže zadní hrana musí být aspoň 240 mm
    // (= polovina šířky podstavce) od rohu po úhlopříčce.
    const zadniHranaPodstavce = MONITOR.stojan.sirka / 2
    monitorOdZdi = zadniHranaPodstavce + MONITOR.obrazovkaOdZadu + posun
    rot = Math.PI / 4
  } else if (um === 'ramenoB') {
    pocatek = [poziceSezeniB(c), 0]; smer = [0, 1]
    monitorOdZdi = MONITOR.obrazovkaOdZadu + posun
    rot = 0
  } else {
    pocatek = [0, poziceSezeniA(c)]; smer = [1, 0]
    monitorOdZdi = MONITOR.obrazovkaOdZadu + posun
    rot = Math.PI / 2
  }

  const hranaOdZdi = prusecikSHranou(poly, pocatek, smer) ?? c.rozmery.ramenoAHloubka
  const at = (t: number): Bod => ({ x: pocatek[0] + smer[0] * t, z: pocatek[1] + smer[1] * t })
  const oci = at(hranaOdZdi + MONITOR.ociZaHranou)
  return {
    umisteni: um,
    monitor: { ...at(monitorOdZdi), rot },
    smer: { x: smer[0], z: smer[1] },
    pocatek: { x: pocatek[0], z: pocatek[1] },
    hrana: at(hranaOdZdi),
    oci,
    zidle: at(hranaOdZdi + 360),
    vzdalenost: hranaOdZdi + MONITOR.ociZaHranou - monitorOdZdi,
    monitorOdZdi,
    hranaOdZdi,
  }
}

/** Kolik zbývá od krajů obrazovky ke stěnám při monitoru v rohu (mm). */
export function odstupObrazovkyOdSten(c: DeskConfig): number {
  const p = pracoviste(c)
  if (p.umisteni !== 'roh') return Infinity
  // Zakřivený panel: kraje jsou o sagitu blíž k divákovi než střed.
  const pul = MONITOR.sirka / 2
  const sagita = MONITOR.zakriveni - Math.sqrt(MONITOR.zakriveni ** 2 - pul ** 2)
  const okraj = pul * Math.SQRT1_2
  const dopredu = (p.monitorOdZdi + sagita) * Math.SQRT1_2
  return dopredu - okraj
}

export function kontroly(c: DeskConfig, mistnost: Mistnost = VYCHOZI_MISTNOST): Kontrola[] {
  const r = c.rozmery
  const out: Kontrola[] = []
  const jeL = c.tvar === 'L' && r.ramenoBDelka > 0

  // 1) Délka ramene A vs. běh levé stěny
  const zbyvaOdHrany = SPACE.levaStenaRun - r.ramenoADelka
  out.push({
    id: 'rameno-a',
    nazev: 'Konec ramene A od hrany průchodu',
    hodnota: zbyvaOdHrany,
    jednotka: 'mm',
    cil: `≥ ${SPACE.odstupOdHrany} mm`,
    stav: zbyvaOdHrany < SPACE.odstupOdHrany - 1 ? 'chyba' : 'ok',
    zprava:
      zbyvaOdHrany < SPACE.odstupOdHrany
        ? `Rameno A je o ${SPACE.odstupOdHrany - zbyvaOdHrany} mm delší, než dovoluje odstup ${SPACE.odstupOdHrany} mm od hrany.`
        : `Od hrany průchodu zbývá ${Math.round(zbyvaOdHrany / 10)} cm (stěna má ${SPACE.levaStenaRun / 10} cm, maximum délky je ${MAX_RAMENO_A / 10} cm).`,
  })

  // 2) Mezera ke gauči — lehátko gauče stojí vedle konce ramene B po celé jeho hloubce
  if (jeL) {
    const mezera = SPACE.zadniStenaKeGauci - r.ramenoBDelka
    const { idealniOd, idealniDo } = SPACE.mezeraKeGauci
    out.push({
      id: 'mezera-gauc',
      nazev: 'Mezera k lehátku gauče',
      hodnota: mezera,
      jednotka: 'mm',
      cil: `${idealniOd}–${idealniDo} mm`,
      stav:
        mezera < 80 ? 'chyba'
        : mezera < idealniOd ? 'pozor'
        : mezera <= idealniDo ? 'ok'
        : mezera <= 300 ? 'ok' : 'pozor',
      zprava:
        mezera < 80
          ? `Jen ${Math.round(mezera / 10)} cm ke gauči — stůl bude vypadat namačkaně.`
          : mezera < idealniOd
            ? `${Math.round(mezera / 10)} cm ke gauči, těsně pod pásmem ${idealniOd / 10}–${idealniDo / 10} cm, které jsi chtěl.`
            : mezera <= idealniDo
              ? `${Math.round(mezera / 10)} cm mezi koncem ramene B a bokem lehátka — přesně v pásmu, které jsi chtěl.`
              : mezera <= 300
                ? `${Math.round(mezera / 10)} cm ke gauči, víc než pásmo ${idealniOd / 10}–${idealniDo / 10} cm. Není to chyba, jen rameno B může být delší.`
                : `${Math.round(mezera / 10)} cm ke gauči je zbytečně velká díra — rameno B může být o ${Math.round((mezera - idealniDo) / 10)} cm delší.`,
    })
  }

  // 3) Zóna pro odsunutí židle: mezi přední hranou ramene A a bokem lehátka gauče
  const zona = SPACE.zadniStenaKeGauci - r.ramenoAHloubka
  const lehatkoKryje = mistnost.lehatko >= pracoviste(c).zidle.z
  out.push({
    id: 'zona-zidle',
    nazev: 'Volno na odsunutí židle',
    hodnota: zona,
    jednotka: 'mm',
    cil: `≥ ${SPACE.zonaZidle.doporuceno} mm`,
    stav: zona < SPACE.zonaZidle.min ? 'chyba' : zona < SPACE.zonaZidle.doporuceno ? 'pozor' : 'ok',
    zprava:
      zona < SPACE.zonaZidle.min
        ? `Jen ${Math.round(zona / 10)} cm mezi hranou ramene A a lehátkem gauče — židle se pořádně neodsune.`
        : zona < SPACE.zonaZidle.doporuceno
          ? `${Math.round(zona / 10)} cm mezi hranou ramene A a lehátkem gauče. Jde to, ale pohodlné je ${SPACE.zonaZidle.doporuceno / 10} cm.`
          : `${Math.round(zona / 10)} cm volné podlahy mezi hranou ramene A a lehátkem gauče` + (lehatkoKryje ? ' — lehátko sahá až za místo sezení, takže tohle je opravdu celá šířka.' : '.'),
  })

  // 4) Vyčnívání ramene A do místnosti
  out.push({
    id: 'vycnivani',
    nazev: 'Vyčnívání do místnosti',
    hodnota: r.ramenoAHloubka,
    jednotka: 'mm',
    cil: '600–750 mm',
    stav: r.ramenoAHloubka > 780 ? 'pozor' : 'ok',
    zprava:
      r.ramenoAHloubka > 780
        ? `Hloubka ${Math.round(r.ramenoAHloubka / 10)} cm už zbytečně ubírá místnosti.`
        : `Deska sahá ${Math.round(r.ramenoAHloubka / 10)} cm od levé stěny.`,
  })

  // 5) Vzdálenost očí od monitoru
  const pr = pracoviste(c)
  const d = pr.vzdalenost
  const { min, max } = MONITOR.vzdalenost
  const kde = pr.umisteni === 'roh' ? 'v rohu' : pr.umisteni === 'ramenoB' ? 'na rameni B' : 'na rameni A'
  const okrajeOdSten = odstupObrazovkyOdSten(c)
  const podstavecVDire = pr.umisteni === 'roh'
    && c.deska.radiusUZdi > (MONITOR.stojan.sirka / 2 + c.doplnky.monitorPosun) * Math.SQRT1_2 + (MONITOR.stojan.sirka / 2) * Math.SQRT1_2 - 40
  let stavM: Zavaznost = d >= min && d <= max ? 'ok' : d >= min - 80 && d <= max + 100 ? 'pozor' : 'chyba'
  if (pr.umisteni === 'roh' && okrajeOdSten < 25) stavM = 'chyba'
  if (podstavecVDire && stavM === 'ok') stavM = 'pozor'
  const tip =
    d < min
      ? (pr.umisteni === 'roh'
          ? ` Zvětši zaoblení vnitřního rohu (deska se kolem tebe obtočí a odsune tě) nebo prohlub ramena.`
          : ` Buď hlubší deska (na ${Math.round((r.ramenoAHloubka + (min - d)) / 10)} cm), nebo monitor do rohu — tam vychází úhlopříčka delší.`)
      : d > max
        ? ` Přisuň monitor posuvníkem „posun monitoru", nebo zmenši hloubku.`
        : ''
  out.push({
    id: 'monitor',
    nazev: `Oči od monitoru (${MONITOR.nazev.replace(/ .*/, '')} 32", ${kde})`,
    hodnota: d,
    jednotka: 'mm',
    cil: `${min}–${max} mm`,
    stav: stavM,
    zprava:
      `Oči ${Math.round(d / 10)} cm od obrazovky` +
      (d >= min && d <= max ? ' — v pásmu 70–100 cm, které chceš.' : d < min ? ' — příliš blízko.' : ' — dál, než chceš.') +
      tip +
      (pr.umisteni === 'roh'
        ? (okrajeOdSten < 25
            ? ` Kraje obrazovky by narazily do stěn (${Math.round(okrajeOdSten)} mm) — posuň monitor dopředu.`
            : ` Kraje 71 cm široké obrazovky jsou ${Math.round(okrajeOdSten / 10)} cm od stěn.`)
        : '') +
      (podstavecVDire ? ' Zaoblení rohu u zdi je tak velké, že podstavec monitoru přesahuje nad mezeru — zmenši ho nebo posuň monitor dopředu.' : ''),
  })

  // 6) Dosah podnože — u dlouhého ramene je limitem rozměr rámu, ne cena
  const nejdelsiRameno = Math.max(r.ramenoADelka, jeL ? r.ramenoBDelka : 0)
  if (c.podnoz.typ === 'stavitelny-ram') {
    const druheRamenoPresahuje = jeL && r.ramenoBDelka > STAVITELNY_RAM.rohovaSestavaDruheRameno
    const nadRohovouSestavu = jeL && nejdelsiRameno > STAVITELNY_RAM.rohovaSestava
    const stav: Zavaznost =
      nejdelsiRameno <= STAVITELNY_RAM.bezneMax && !druheRamenoPresahuje ? 'ok'
      : (jeL && (nadRohovouSestavu || druheRamenoPresahuje)) ? 'chyba'
      : nejdelsiRameno <= STAVITELNY_RAM.nejdelsiDvousloupovy ? 'pozor' : 'chyba'
    out.push({
      id: 'dosah-ramu',
      nazev: 'Dosah stavitelného rámu',
      hodnota: nejdelsiRameno,
      jednotka: 'mm',
      cil: jeL
        ? `roh 90°: ramena do ${STAVITELNY_RAM.rohovaSestava} a ${STAVITELNY_RAM.rohovaSestavaDruheRameno} mm`
        : `běžné rámy do ${STAVITELNY_RAM.bezneMax} mm`,
      stav,
      zprava:
        stav === 'chyba' && jeL
          ? `Rohovou polohovací sestavu na ${Math.round(r.ramenoADelka / 10)} × ${Math.round(r.ramenoBDelka / 10)} cm se nepodařilo najít na trhu. `
            + `Liftor L uvádí desky až 290 cm, ale jen pro rovné uspořádání — pro roh 90° zvládne ramena do ${STAVITELNY_RAM.rohovaSestava / 10} cm. `
            + `Powerton ERGO EDGE zvládne první rameno do 220 cm, ale druhé jen do ${STAVITELNY_RAM.rohovaSestavaDruheRameno / 10} cm.`
          : stav === 'pozor'
            ? `Rameno ${Math.round(nejdelsiRameno / 10)} cm je nad dosahem běžných rámů (do ${STAVITELNY_RAM.bezneMax / 10} cm). Dosáhne na něj jen Liftor Expert, a to jen jako rovný stůl.`
            : `Rameno ${Math.round(nejdelsiRameno / 10)} cm zvládne běžný dvousloupový rám (AlzaErgo ET1, IKEA MITTZON).`,
    })
  } else if (c.podnoz.typ !== 'bocnice' && c.podnoz.typ !== 'kozy' && !c.podnoz.typ.startsWith('nohy') && c.podnoz.typ !== 'hairpin') {
    const potrebaDvou = nejdelsiRameno > PEVNA_PODNOZ_MAX
    out.push({
      id: 'dosah-podnoze',
      nazev: 'Dosah hotové podnože',
      hodnota: nejdelsiRameno,
      jednotka: 'mm',
      cil: `hotové podnože do ${PEVNA_PODNOZ_MAX} mm`,
      stav: 'ok',
      zprava: potrebaDvou
        ? `Nejdelší hotová pevná podnož jde do ${PEVNA_PODNOZ_MAX / 10} cm. Na rameno ${Math.round(nejdelsiRameno / 10)} cm proto počítej se dvěma, nebo s rámem svařeným na míru.`
        : `Rameno ${Math.round(nejdelsiRameno / 10)} cm pokryje jedna hotová podnož.`,
    })
  }

  // 7) Rozpon desky bez podpory
  const rozpon = skutecnyRozpon(c)
  const maxR = dovolenyRozpon(c)
  const pods = podpory(c)
  const maMezilehlou = pods.some((q) => q.skupina === 'mezi')
  const rohVzadu = jeL && pr.umisteni === 'roh'
  out.push({
    id: 'rozpon',
    nazev: 'Rozpon desky bez podpory',
    hodnota: rozpon,
    jednotka: 'mm',
    cil: `≤ ${maxR} mm`,
    stav: rozpon > maxR ? 'chyba' : rozpon > maxR * 0.9 ? 'pozor' : 'ok',
    zprava:
      rozpon > maxR
        ? `${Math.round(rozpon / 10)} cm mezi podporami je na ${material(c.deska.materialId).nazev} ${c.deska.tloustka} mm moc. Zesil desku, zapni výztuhu, nebo přidej mezilehlou podporu.`
        : `${Math.round(rozpon / 10)} cm mezi podporami, limit pro tuhle desku je ${Math.round(maxR / 10)} cm`
          + (c.podnoz.vyztuha ? ' (včetně podélné výztuhy)' : '')
          + `. Podpor celkem ${pods.length}`
          + (maMezilehlou ? ', z toho jedna mezilehlá' : '')
          + (rohVzadu ? '; rohová podpora je vzadu v rohu místnosti, aby nestála mezi koleny.' : '.'),
  })

  // 8) Prostor pro nohy pod deskou
  const svetlaVyska = r.vyska - c.deska.tloustka
  out.push({
    id: 'legroom',
    nazev: 'Světlá výška pod deskou',
    hodnota: svetlaVyska,
    jednotka: 'mm',
    cil: '≥ 650 mm',
    stav: svetlaVyska < 620 ? 'chyba' : svetlaVyska < 650 ? 'pozor' : 'ok',
    zprava:
      svetlaVyska < 650
        ? `${Math.round(svetlaVyska / 10)} cm pod deskou — na kolena málo (norma chce aspoň 65 cm).`
        : `${Math.round(svetlaVyska / 10)} cm volné výšky pod deskou.`,
  })

  return out
}

/** Objemová hmotnost podle kategorie materiálu, kg/m³ (dub ~700, MDF s dýhou ~740, DTD lamino ~650). */
const HUSTOTA: Record<string, number> = { masiv: 700, dyha: 740, lamino: 650, hpl: 1400, linoleum: 750, lak: 740 }

/** Orientační hmotnost sestavy v kg: deska + podnož + kontejner. Truhlář to potřebuje kvůli dopravě a montáži. */
export function hmotnost(c: DeskConfig): number {
  const mat = material(c.deska.materialId)
  const deska = plochaDesky(c) * (c.deska.tloustka / 1000) * (HUSTOTA[mat.kategorie] ?? 700)
  const H = (c.rozmery.vyska - c.deska.tloustka) / 1000
  let podnoz: number
  if (c.podnoz.typ === 'bocnice') {
    const tl = Math.max(25, c.deska.tloustka) / 1000
    const matP = material(c.deska.materialId)
    podnoz = podpory(c).length * 0.5 * (c.rozmery.ramenoAHloubka / 1000) * H * tl * (HUSTOTA[matP.kategorie] ?? 700)
  } else {
    // ocelový jekl: hmotnost na metr ≈ obvod × stěna 2 mm × 7850 kg/m³
    const metry = podpory(c).length * H + (c.rozmery.ramenoAHloubka / 1000) * 2 + (c.rozmery.ramenoBHloubka / 1000) * 2 + (c.podnoz.vyztuha ? (c.rozmery.ramenoADelka + c.rozmery.ramenoBDelka) / 1000 : 0)
    podnoz = metry * 4 * (c.podnoz.profil / 1000) * 0.002 * 7850
  }
  const kontejner = c.ulozne.length * 24
  return Math.round(deska + podnoz + kontejner)
}

export function nejhorsiStav(k: Kontrola[]): Zavaznost {
  if (k.some((x) => x.stav === 'chyba')) return 'chyba'
  if (k.some((x) => x.stav === 'pozor')) return 'pozor'
  return 'ok'
}

/** Ořízne konfiguraci na limity prostoru. */
export function orizniNaProstor(c: DeskConfig): DeskConfig {
  const r = { ...c.rozmery }
  r.ramenoADelka = Math.min(r.ramenoADelka, MAX_RAMENO_A)
  r.mezeraKeGauci = Math.max(SPACE.mezeraKeGauci.min, Math.min(r.mezeraKeGauci, SPACE.mezeraKeGauci.max))
  if (c.tvar === 'L') r.ramenoBDelka = Math.min(r.ramenoBDelka, maxRamenoB(r.mezeraKeGauci))
  return { ...c, rozmery: r }
}

/** Znovu vystaveno kvůli zpětné kompatibilitě UI. */
export { MAX_ROZPON, maxRozponMat }
