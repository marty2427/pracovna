import * as THREE from 'three'
import type { DeskConfig, Hrana } from '@/model/types'

export type Pt = [number, number]

/** mm -> m */
export const m = (mm: number) => mm / 1000

/**
 * Uzavřený obrys se skutečnými kruhovými zaobleními v rozích.
 * Zvládá i vnitřní (konkávní) roh, což L deska potřebuje.
 */
export function roundedShape(pts: Pt[], radii: number[]): THREE.Shape {
  const n = pts.length
  const s = new THREE.Shape()

  type Fillet = { start: Pt; end: Pt; center: Pt; r: number; a0: number; a1: number; cw: boolean } | null

  const filet = (i: number): Fillet => {
    const C = pts[i]
    const A = pts[(i - 1 + n) % n]
    const B = pts[(i + 1) % n]
    let v1: Pt = [A[0] - C[0], A[1] - C[1]]
    let v2: Pt = [B[0] - C[0], B[1] - C[1]]
    const l1 = Math.hypot(v1[0], v1[1])
    const l2 = Math.hypot(v2[0], v2[1])
    if (l1 < 1e-9 || l2 < 1e-9) return null
    v1 = [v1[0] / l1, v1[1] / l1]
    v2 = [v2[0] / l2, v2[1] / l2]

    const dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1]))
    const theta = Math.acos(dot)
    if (theta < 1e-4 || Math.abs(theta - Math.PI) < 1e-4) return null

    let r = radii[i] ?? 0
    if (r <= 1e-6) return null
    let t = r / Math.tan(theta / 2)
    const tmax = Math.min(l1, l2) * 0.49
    if (t > tmax) { t = tmax; r = t * Math.tan(theta / 2) }
    if (r <= 1e-6) return null

    const start: Pt = [C[0] + v1[0] * t, C[1] + v1[1] * t]
    const end: Pt = [C[0] + v2[0] * t, C[1] + v2[1] * t]
    let bis: Pt = [v1[0] + v2[0], v1[1] + v2[1]]
    const bl = Math.hypot(bis[0], bis[1])
    if (bl < 1e-9) return null
    bis = [bis[0] / bl, bis[1] / bl]
    const d = r / Math.sin(theta / 2)
    const center: Pt = [C[0] + bis[0] * d, C[1] + bis[1] * d]

    const a0 = Math.atan2(start[1] - center[1], start[0] - center[0])
    const a1 = Math.atan2(end[1] - center[1], end[0] - center[0])
    const cross = v1[0] * v2[1] - v1[1] * v2[0]
    return { start, end, center, r, a0, a1, cw: cross > 0 }
  }

  const fs = pts.map((_, i) => filet(i))

  const startPt: Pt = fs[0] ? fs[0]!.end : pts[0]
  s.moveTo(startPt[0], startPt[1])

  for (let k = 1; k <= n; k++) {
    const i = k % n
    const f = fs[i]
    if (f) {
      s.lineTo(f.start[0], f.start[1])
      s.absarc(f.center[0], f.center[1], f.r, f.a0, f.a1, f.cw)
    } else {
      s.lineTo(pts[i][0], pts[i][1])
    }
  }
  s.closePath()
  return s
}

/** Parametry zkosení hrany podle zvoleného profilu. Vše v metrech. */
export function hranaProfil(hrana: Hrana, tloustkaM: number) {
  switch (hrana) {
    case 'rovna':    return { size: 0.0008, thickness: 0.0008, segments: 1 }
    case 'srazena':  return { size: 0.0028, thickness: 0.0028, segments: 1 }
    case 'zkosena':  return { size: Math.min(0.014, tloustkaM * 0.38), thickness: Math.min(0.014, tloustkaM * 0.38), segments: 1 }
    case 'radius':   return { size: Math.min(0.009, tloustkaM * 0.34), thickness: Math.min(0.009, tloustkaM * 0.34), segments: 5 }
    case 'naklizek': return { size: Math.min(0.011, tloustkaM * 0.34), thickness: Math.min(0.011, tloustkaM * 0.34), segments: 6 }
  }
}

/**
 * Půdorysný obrys desky v METRECH, v souřadnicích tvaru (x, -z),
 * aby po rotaci -90° kolem X ležel správně v rovině XZ.
 */
export function obrysDesky(c: DeskConfig): { pts: Pt[]; radii: number[] } {
  const { ramenoADelka, ramenoAHloubka, ramenoBDelka, ramenoBHloubka } = c.rozmery
  const LA = m(ramenoADelka), DA = m(ramenoAHloubka)
  const LB = m(ramenoBDelka), DB = m(ramenoBHloubka)
  const rr = m(c.deska.radiusRohu)
  const ri = m(c.deska.radiusVnitrni)
  const P = (x: number, z: number): Pt => [x, -z]

  if (c.tvar !== 'L' || ramenoBDelka <= 0) {
    return {
      pts: [P(0, 0), P(DA, 0), P(DA, LA), P(0, LA)],
      radii: [0, rr * 0.6, rr, rr * 0.6],
    }
  }
  return {
    pts: [P(0, 0), P(LB, 0), P(LB, DB), P(DA, DB), P(DA, LA), P(0, LA)],
    radii: [0, rr * 0.6, rr, ri, rr, rr * 0.6],
  }
}

/** Poloha kabelové průchodky v půdorysu (m), u zadní hrany v místě sezení. */
export function poziceDira(c: DeskConfig): [number, number] {
  const DA = m(c.rozmery.ramenoAHloubka)
  const DB = m(c.rozmery.ramenoBHloubka)
  const LA = m(c.rozmery.ramenoADelka)
  const jeL = c.tvar === 'L' && c.rozmery.ramenoBDelka > 0
  const od = (jeL ? DB : 0) + 0.28
  return [DA - 0.115, od + (LA - od) * 0.42]
}

/** Geometrie desky: obrys + skutečný profil hrany, ležatá v rovině XZ. */
export function geometrieDesky(c: DeskConfig): THREE.ExtrudeGeometry {
  const { pts, radii } = obrysDesky(c)
  const shape = roundedShape(pts, radii)

  // Skutečná díra pro kabelovou průchodku — ne nalepený kroužek.
  if (c.doplnky.pruchodka !== 'zadna') {
    const [hx, hz] = poziceDira(c)
    const hole = new THREE.Path()
    if (c.doplnky.pruchodka === 'kulata') {
      hole.absarc(hx, -hz, 0.0405, 0, Math.PI * 2, true)
    } else {
      const w = 0.135, h = 0.048, r = 0.018
      const pts: Pt[] = [
        [hx - w / 2, -hz - h / 2], [hx + w / 2, -hz - h / 2],
        [hx + w / 2, -hz + h / 2], [hx - w / 2, -hz + h / 2],
      ]
      const hs = roundedShape(pts, [r, r, r, r])
      hole.curves = hs.curves.slice().reverse().map((cv) => { const c2 = cv.clone(); (c2 as any).reverse?.(); return c2 })
      hole.autoClose = true
    }
    shape.holes.push(hole)
  }

  const th = m(c.deska.tloustka)
  const p = hranaProfil(c.deska.hrana, th)
  const depth = Math.max(0.002, th - 2 * p.thickness)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: p.thickness,
    bevelSize: p.size,
    bevelOffset: 0,
    bevelSegments: p.segments,
    curveSegments: 24,
  })
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

/** Zaoblený kvádr — základní stavební prvek korpusů, čel a nohou. */
export function roundedBox(w: number, h: number, d: number, r: number, seg = 3): THREE.ExtrudeGeometry {
  const rr = Math.max(0.0004, Math.min(r, w / 2 - 0.001, h / 2 - 0.001))
  const shape = roundedShape(
    [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]],
    [rr, rr, rr, rr],
  )
  const bev = Math.min(0.0025, d * 0.2, rr * 0.8)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, d - 2 * bev),
    bevelEnabled: true,
    bevelThickness: bev,
    bevelSize: bev,
    bevelSegments: seg,
    curveSegments: 10,
  })
  geo.translate(0, 0, -d / 2 + bev)
  geo.computeVertexNormals()
  return geo
}
