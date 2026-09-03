import { SPACE, MAX_RAMENO_A, maxRamenoB, TISKARNA } from './space'
import type { DeskConfig, Rect } from './types'
import { material } from './materials'
import { podpory, skutecnyRozpon, dovolenyRozpon, MAX_ROZPON, maxRozponMat } from './podpory'

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

/** Kde uživatel sedí — střed volné části ramene A (osa Z), mm. */
export function poziceSezeni(c: DeskConfig): number {
  const { ramenoADelka, ramenoBHloubka } = c.rozmery
  const od = c.tvar === 'L' ? ramenoBHloubka + 250 : 250
  return od + (ramenoADelka - od) / 2
}

export function kontroly(c: DeskConfig): Kontrola[] {
  const r = c.rozmery
  const out: Kontrola[] = []

  // 1) Délka ramene A vs. běh levé stěny
  const zbyvaOdHrany = SPACE.levaStenaRun - r.ramenoADelka
  out.push({
    id: 'rameno-a',
    nazev: 'Konec ramene A od hrany',
    hodnota: zbyvaOdHrany,
    jednotka: 'mm',
    cil: `≥ ${SPACE.odstupOdHrany} mm`,
    stav: zbyvaOdHrany < SPACE.odstupOdHrany - 1 ? 'chyba'
        : zbyvaOdHrany < SPACE.odstupOdHrany + 50 ? 'ok' : 'ok',
    zprava:
      zbyvaOdHrany < SPACE.odstupOdHrany
        ? `Rameno A je o ${SPACE.odstupOdHrany - zbyvaOdHrany} mm delší, než dovoluje odstup ${SPACE.odstupOdHrany} mm od hrany.`
        : `Od hrany zbývá ${Math.round(zbyvaOdHrany / 10)} cm. Maximum délky je ${MAX_RAMENO_A / 10} cm.`,
  })

  // 2) Mezera ke gauči
  if (c.tvar === 'L') {
    const mezera = SPACE.zadniStenaKeGauci - r.ramenoBDelka
    const { idealniOd, idealniDo } = SPACE.mezeraKeGauci
    out.push({
      id: 'mezera-gauc',
      nazev: 'Mezera ke gauči',
      hodnota: mezera,
      jednotka: 'mm',
      cil: `${idealniOd}–${idealniDo} mm`,
      stav: mezera < 80 ? 'chyba' : mezera < idealniOd || mezera > 250 ? 'pozor' : 'ok',
      zprava:
        mezera < 80
          ? `Jen ${Math.round(mezera / 10)} cm ke gauči — stůl bude vypadat namačkaně.`
          : mezera > 250
            ? `${Math.round(mezera / 10)} cm ke gauči je zbytečně velká díra, rameno B může být delší.`
            : `${Math.round(mezera / 10)} cm ke gauči — přesně v pásmu, které jsi chtěl.`,
    })
  }

  // 3) Zóna pro odsunutí židle
  const zona = SPACE.zadniStenaKeGauci - r.ramenoAHloubka
  out.push({
    id: 'zona-zidle',
    nazev: 'Volno na odsunutí židle',
    hodnota: zona,
    jednotka: 'mm',
    cil: `≥ ${SPACE.zonaZidle.doporuceno} mm`,
    stav: zona < SPACE.zonaZidle.min ? 'chyba' : zona < SPACE.zonaZidle.doporuceno ? 'pozor' : 'ok',
    zprava:
      zona < SPACE.zonaZidle.min
        ? `Jen ${Math.round(zona / 10)} cm od hrany desky — židle se pořádně neodsune.`
        : zona < SPACE.zonaZidle.doporuceno
          ? `${Math.round(zona / 10)} cm od hrany desky. Jde to, ale pohodlné je ${SPACE.zonaZidle.doporuceno / 10} cm.`
          : `${Math.round(zona / 10)} cm volné podlahy před stolem — na odsunutí židle pohodlné.`,
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

  // 5) Tiskárna v rohu
  if (c.doplnky.tiskarnaVRohu) {
    const hloubkaRohu = c.tvar === 'L' ? r.ramenoBHloubka : r.ramenoAHloubka
    out.push({
      id: 'tiskarna',
      nazev: 'Místo na tiskárnu v rohu',
      hodnota: hloubkaRohu,
      jednotka: 'mm',
      cil: `≥ ${TISKARNA.hloubka + 60} mm`,
      stav: hloubkaRohu < TISKARNA.hloubka + 60 ? 'pozor' : 'ok',
      zprava:
        hloubkaRohu < TISKARNA.hloubka + 60
          ? `Hloubka ${Math.round(hloubkaRohu / 10)} cm je na A4 multifunkci (${TISKARNA.hloubka / 10} cm) těsná.`
          : `Roh unese A4 multifunkci ${TISKARNA.sirka / 10}×${TISKARNA.hloubka / 10} cm s rezervou.`,
    })
  }

  // 6) Rozpon desky bez podpory
  const rozpon = skutecnyRozpon(c)
  const max = dovolenyRozpon(c)
  const pocetPodpor = podpory(c).length
  const maMezilehlou = podpory(c).some((q) => q.skupina === 'mezi')
  out.push({
    id: 'rozpon',
    nazev: 'Rozpon desky bez podpory',
    hodnota: rozpon,
    jednotka: 'mm',
    cil: `≤ ${max} mm`,
    stav: rozpon > max ? 'chyba' : rozpon > max * 0.9 ? 'pozor' : 'ok',
    zprava:
      rozpon > max
        ? `${Math.round(rozpon / 10)} cm mezi podporami je na ${material(c.deska.materialId).nazev} ${c.deska.tloustka} mm moc. Zesil desku, zapni výztuhu, nebo přidej mezilehlou podporu.`
        : `${Math.round(rozpon / 10)} cm mezi podporami, limit pro tuhle desku je ${Math.round(max / 10)} cm`
          + (c.podnoz.vyztuha ? ' (včetně podélné výztuhy)' : '')
          + `. Podpor celkem ${pocetPodpor}` + (maMezilehlou ? ', z toho jedna mezilehlá.' : '.'),
  })

  // 7) Prostor pro nohy pod deskou
  const svetlaVyska = r.vyska - c.deska.tloustka - (c.ulozne.some((u) => u.typ === 'zasuvka-plocha') ? 80 : 0)
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
