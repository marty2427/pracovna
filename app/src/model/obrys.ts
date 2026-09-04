import type { DeskConfig } from './types'
import { MONITOR } from './space'

/**
 * Půdorysný obrys desky v MILIMETRECH, bez závislosti na three.js, aby ho
 * mohly sdílet kontroly, půdorys, výkres i 3D model. Jeden zdroj pravdy —
 * když se obrys změní tady, změní se všude.
 */

export type Pt = [number, number]  // [x, z]

export interface Obrys {
  pts: Pt[]
  /** Poloměr zaoblení v každém vrcholu (0 = ostrý). */
  radii: number[]
}

/** Kde se sedí u ramene A — střed volné části ramene (osa Z), mm. */
export function poziceSezeniA(c: DeskConfig): number {
  const { ramenoADelka, ramenoBHloubka } = c.rozmery
  const jeL = c.tvar === 'L' && c.rozmery.ramenoBDelka > 0
  const od = jeL ? ramenoBHloubka + 250 : 250
  return od + (ramenoADelka - od) / 2
}

/**
 * Kde se sedí u ramene B — střed volné části ramene (osa X), mm.
 * Rameno B je krátké, takže se sezení drží tak, aby se 71 cm široký monitor
 * ještě vešel před konec desky u gauče.
 */
export function poziceSezeniB(c: DeskConfig): number {
  const { ramenoAHloubka, ramenoBDelka } = c.rozmery
  const od = ramenoAHloubka + 250
  const stred = od + Math.max(0, ramenoBDelka - od) / 2
  const maxX = ramenoBDelka - MONITOR.sirka / 2 - 40
  return Math.max(Math.min(stred, maxX), Math.min(od, maxX))
}

/**
 * Obrys desky. Pořadí vrcholů: od rohu u zdi podél zadní stěny (rameno B),
 * kolem vnitřního rohu, podél přední hrany ramene A zpět ke zdi.
 *
 * Výřez v přední hraně (deska.vyrez) se dělá jen tam, kde se opravdu sedí —
 * u ramene A nebo B podle umístění monitoru. V rohu je „výřezem" velký
 * rádius vnitřního rohu: deska se kolem sedícího obtočí, to je u rohových
 * pracovišť standard.
 */
export function obrysBody(c: DeskConfig): Obrys {
  const { ramenoADelka: LA, ramenoAHloubka: DA, ramenoBDelka: LB, ramenoBHloubka: DB } = c.rozmery
  const rr = c.deska.radiusRohu
  const ri = c.deska.radiusVnitrni
  const rz = c.deska.radiusUZdi
  const jeL = c.tvar === 'L' && LB > 0
  const um = c.doplnky.monitorUmisteni
  const v = c.deska.vyrez
  const pul = 300  // poloviční šířka výřezu podél hrany

  // výřez u ramene A (přední hrana x = DA, běží po Z)
  const vyrezA: Pt[] = []
  const vyrezARadii: number[] = []
  if (v > 0 && (um === 'ramenoA' || !jeL)) {
    const sez = poziceSezeniA(c)
    vyrezA.push([DA, sez - pul], [DA - v, sez], [DA, sez + pul])
    vyrezARadii.push(v * 2.4, 420, v * 2.4)
  }

  if (!jeL) {
    return {
      pts: [[0, 0], [DA, 0], ...vyrezA, [DA, LA], [0, LA]],
      radii: [rz, rr * 0.6, ...vyrezARadii, rr, rr * 0.6],
    }
  }

  // výřez u ramene B (přední hrana z = DB, běží po X od LB k DA)
  const vyrezB: Pt[] = []
  const vyrezBRadii: number[] = []
  if (v > 0 && um === 'ramenoB') {
    const sez = poziceSezeniB(c)
    if (sez + pul < LB - 40 && sez - pul > DA + 40) {
      vyrezB.push([sez + pul, DB], [sez, DB - v], [sez - pul, DB])
      vyrezBRadii.push(v * 2.4, 420, v * 2.4)
    }
  }

  return {
    pts: [[0, 0], [LB, 0], [LB, DB], ...vyrezB, [DA, DB], ...vyrezA, [DA, LA], [0, LA]],
    radii: [rz, rr * 0.6, rr, ...vyrezBRadii, ri, ...vyrezARadii, rr, rr * 0.6],
  }
}

/**
 * Nahradí zaoblené vrcholy oblouky ze vzorkovaných bodů. Stejná matematika
 * jako v three/shapes.ts (tečná délka t = r / tan(θ/2), střed na ose úhlu),
 * jen bez three.js — výsledek je obyčejný mnohoúhelník pro SVG a výpočty.
 */
export function vyhladObrys(o: Obrys, seg = 10): Pt[] {
  const { pts, radii } = o
  const n = pts.length
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const C = pts[i], A = pts[(i - 1 + n) % n], B = pts[(i + 1) % n]
    let r = radii[i] ?? 0
    let v1: Pt = [A[0] - C[0], A[1] - C[1]]
    let v2: Pt = [B[0] - C[0], B[1] - C[1]]
    const l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1])
    if (r <= 1e-6 || l1 < 1e-9 || l2 < 1e-9) { out.push(C); continue }
    v1 = [v1[0] / l1, v1[1] / l1]; v2 = [v2[0] / l2, v2[1] / l2]
    const dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1]))
    const theta = Math.acos(dot)
    if (theta < 1e-4 || Math.abs(theta - Math.PI) < 1e-4) { out.push(C); continue }
    let t = r / Math.tan(theta / 2)
    const tmax = Math.min(l1, l2) * 0.49
    if (t > tmax) { t = tmax; r = t * Math.tan(theta / 2) }
    const start: Pt = [C[0] + v1[0] * t, C[1] + v1[1] * t]
    const end: Pt = [C[0] + v2[0] * t, C[1] + v2[1] * t]
    let bis: Pt = [v1[0] + v2[0], v1[1] + v2[1]]
    const bl = Math.hypot(bis[0], bis[1])
    bis = [bis[0] / bl, bis[1] / bl]
    const d = r / Math.sin(theta / 2)
    const cen: Pt = [C[0] + bis[0] * d, C[1] + bis[1] * d]
    const a0 = Math.atan2(start[1] - cen[1], start[0] - cen[0])
    let a1 = Math.atan2(end[1] - cen[1], end[0] - cen[0])
    // oblouk mezi tečnými body je vždy kratší než půlkruh — jdeme kratší cestou
    let da = a1 - a0
    while (da > Math.PI) da -= 2 * Math.PI
    while (da < -Math.PI) da += 2 * Math.PI
    for (let k = 0; k <= seg; k++) {
      const a = a0 + (da * k) / seg
      out.push([cen[0] + r * Math.cos(a), cen[1] + r * Math.sin(a)])
    }
  }
  return out
}

/** Vyhlazený obrys desky (mm) — na kreslení a měření. */
export function obrysDeskyBody(c: DeskConfig, seg = 10): Pt[] {
  return vyhladObrys(obrysBody(c), seg)
}

/**
 * Nejvzdálenější průsečík paprsku s obrysem (vzdálenost od `od` ve směru `smer`).
 * Paprsek od zdi směrem do místnosti tak najde přední hranu desky, ať už je
 * v ní výřez, zaoblení nebo cokoli. null = paprsek desku netrefí.
 */
export function prusecikSHranou(poly: Pt[], od: Pt, smer: Pt): number | null {
  let best: number | null = null
  const n = poly.length
  for (let i = 0; i < n; i++) {
    const p = poly[i], q = poly[(i + 1) % n]
    const ex = q[0] - p[0], ez = q[1] - p[1]
    const den = smer[0] * ez - smer[1] * ex
    if (Math.abs(den) < 1e-9) continue
    const wx = p[0] - od[0], wz = p[1] - od[1]
    const t = (wx * ez - wz * ex) / den
    const u = (wx * smer[1] - wz * smer[0]) / den
    if (t >= 0 && u >= -1e-9 && u <= 1 + 1e-9) best = best === null ? t : Math.max(best, t)
  }
  return best
}

/** Je bod uvnitř obrysu (i s oblouky)? */
export function bodVObrysu(poly: Pt[], b: Pt): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j]
    if ((zi > b[1]) !== (zj > b[1]) && b[0] < ((xj - xi) * (b[1] - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}
