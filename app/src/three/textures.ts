import * as THREE from 'three'
import { fbm, valueNoise } from './noise'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

export interface WoodOpts {
  base: string
  tmava: string
  svetla: string
  /** Hustota letokruhů napříč kresbou. */
  hustota?: number
  /** Jak moc kresba „vlní“. */
  vlneni?: number
  /** Jak výrazné jsou póry. */
  pory?: number
  seed?: number
  /** Poměr stran textury — dlouhá deska chce protaženou kresbu. */
  w?: number
  h?: number
}

/**
 * Kresba dřeva: letokruhy napříč (osa V), vlákno podél (osa U).
 * Vrací { map, roughnessMap } — drsnost sleduje póry, aby se povrch neleskl jako plast.
 */
export function woodTextures(o: WoodOpts): { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  const W = o.w ?? 768
  const H = o.h ?? 384
  const hustota = o.hustota ?? 5.5
  const vlneni = o.vlneni ?? 1
  const poryAmt = o.pory ?? 1
  const seed = o.seed ?? 3

  const base = hexToRgb(o.base)
  const tmava = hexToRgb(o.tmava)
  const svetla = hexToRgb(o.svetla)

  const cAlb = document.createElement('canvas')
  cAlb.width = W; cAlb.height = H
  const cRgh = document.createElement('canvas')
  cRgh.width = W; cRgh.height = H
  const alb = cAlb.getContext('2d')!
  const rgh = cRgh.getContext('2d')!
  const imgA = alb.createImageData(W, H)
  const imgR = rgh.createImageData(W, H)

  // Střed „katedrály" mimo desku — dává obloučky typické pro plotnu z fládru,
  // ne pravidelné pruhy jako u překližky.
  const cx = -0.35 - (seed % 7) * 0.06
  const cy = 0.5 + ((seed % 5) - 2) * 0.07

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H

      // Turbulence protažená podél vlákna (osa U).
      const turb = (fbm(u * 2.2, v * 11.0, 4, seed) - 0.5) * 2 * vlneni
      const turb2 = (fbm(u * 0.7, v * 3.1, 3, seed + 55) - 0.5) * 2 * vlneni

      // Letokruhy jako soustředné oblouky kolem bodu mimo plochu.
      const dx = (u - cx) * 0.42
      const dy = (v - cy) * 2.6
      const r = Math.sqrt(dx * dx + dy * dy)
      const ring = Math.sin((r * hustota + turb * 0.42 + turb2 * 0.9) * Math.PI * 2)
      let t = clamp01(Math.pow(Math.abs(ring), 0.5))

      // Podélné vlákno — jemné táhlé linky.
      const vlakno = valueNoise(u * 300, v * 22, seed + 91)
      t = clamp01(t * 0.80 + vlakno * 0.20)

      // Velké tónové plochy (běl vs. jádro).
      const plocha = fbm(u * 1.3, v * 2.0, 3, seed + 200)

      let col = mix(tmava, svetla, t)
      col = mix(col, base, 0.40)
      col = mix(col, plocha > 0.52 ? svetla : tmava, Math.abs(plocha - 0.5) * 0.42)

      // Dřeňové paprsky napříč vláknem (dub) — krátké světlé šupinky.
      const paprsek = valueNoise(u * 40, v * 900, seed + 777)
      if (paprsek > 0.93) col = mix(col, svetla, (paprsek - 0.93) / 0.07 * 0.22)

      // Póry: krátké tmavé čárky podél vlákna.
      const por = valueNoise(u * 560, v * 130, seed + 404)
      let poreDark = 0
      if (por > 0.87) poreDark = ((por - 0.87) / 0.13) * 0.32 * poryAmt
      col = mix(col, tmava, poreDark)

      const i = (y * W + x) * 4
      imgA.data[i] = col[0]; imgA.data[i + 1] = col[1]; imgA.data[i + 2] = col[2]; imgA.data[i + 3] = 255

      const rgv = clamp01(0.52 + poreDark * 1.5 + (1 - t) * 0.14)
      const rv = Math.round(rgv * 255)
      imgR.data[i] = rv; imgR.data[i + 1] = rv; imgR.data[i + 2] = rv; imgR.data[i + 3] = 255
    }
  }
  alb.putImageData(imgA, 0, 0)
  rgh.putImageData(imgR, 0, 0)

  const map = new THREE.CanvasTexture(cAlb)
  const rough = new THREE.CanvasTexture(cRgh)
  for (const t of [map, rough]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 8
  }
  map.colorSpace = THREE.SRGBColorSpace
  return { map, rough }
}

/** Jemná struktura komaxitu — aby kov nebyl mrtvě hladký. */
export function komaxitTexture(barva: string, seed = 11): { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  const S = 256
  const base = hexToRgb(barva)
  const cA = document.createElement('canvas'); cA.width = cA.height = S
  const cR = document.createElement('canvas'); cR.width = cR.height = S
  const a = cA.getContext('2d')!, r = cR.getContext('2d')!
  const ia = a.createImageData(S, S), ir = r.createImageData(S, S)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = valueNoise(x * 1.7, y * 1.7, seed)
      const d = (n - 0.5) * 16
      const i = (y * S + x) * 4
      ia.data[i] = clamp01((base[0] + d) / 255) * 255
      ia.data[i + 1] = clamp01((base[1] + d) / 255) * 255
      ia.data[i + 2] = clamp01((base[2] + d) / 255) * 255
      ia.data[i + 3] = 255
      const rv = Math.round((0.62 + n * 0.22) * 255)
      ir.data[i] = ir.data[i + 1] = ir.data[i + 2] = rv
      ir.data[i + 3] = 255
    }
  }
  a.putImageData(ia, 0, 0); r.putImageData(ir, 0, 0)
  const map = new THREE.CanvasTexture(cA), rough = new THREE.CanvasTexture(cR)
  for (const t of [map, rough]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3) }
  map.colorSpace = THREE.SRGBColorSpace
  return { map, rough }
}

/**
 * Vlysová podlaha v rybí kosti (herringbone).
 *
 * Vzor se počítá po pixelech, ne skládáním otočených obrázků — jinak
 * lamely netilují a vzniknou díry. Postup: bod se otočí o 45° do rámu,
 * kde jsou lamely osové, a tam platí jednoduché pravidlo:
 *
 *   buňka (c, j) o rozměru W×W patří VODOROVNÉ lamele, když (c − j) mod 2k < k,
 *   jinak patří SVISLÉ lamele.   (k = délka lamely v násobcích její šířky)
 *
 * Z toho vyjde identita lamely, podélná souřadnice pro kresbu a příčná pro spáru.
 */
export function parketyTexture(
  tmava: string, base: string, svetla: string, seed = 7,
  opts: { k?: number; opakovani?: number; velikost?: number } = {},
): THREE.CanvasTexture {
  const S = opts.velikost ?? 1024
  const k = opts.k ?? 5          // délka lamely = k × šířka
  const n = opts.opakovani ?? 3  // kolik period vzoru se vejde do textury

  // Aby textura BEZEŠVĚ navazovala, musí posun o celou šířku textury
  // odpovídat celému počtu period vzoru. Z podmínky (c−j) mod 2k vyjde:
  const SQ = Math.SQRT1_2
  const Wpx = S / (k * n * Math.SQRT2)
  // Perioda identity lamel — bez ní by na švu skočil odstín.
  const Pa = k * n
  const Pb = n

  const b = hexToRgb(base), d = hexToRgb(tmava), sv = hexToRgb(svetla)
  const spara: [number, number, number] = [d[0] * 0.40, d[1] * 0.38, d[2] * 0.36]

  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')!
  const img = g.createImageData(S, S)

  const pmod = (a: number, mm: number) => ((a % mm) + mm) % mm
  const hashId = (a: number, bb: number) => {
    let h = (a * 73856093) ^ (bb * 19349663) ^ (seed * 83492791)
    h = (h ^ (h >>> 13)) >>> 0
    return (h % 1009) / 1009
  }

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = ((x + y) * SQ) / Wpx
      const v = ((y - x) * SQ) / Wpx
      const cc = Math.floor(u)
      const jj = Math.floor(v)
      const mod = pmod(cc - jj, 2 * k)
      const vodorovna = mod < k

      let podel: number, pric: number, ida: number, idb: number
      if (vodorovna) {
        podel = (u - (cc - mod)) / k
        pric = v - jj
        ida = pmod(jj, Pa)
        idb = pmod(Math.floor((cc - jj) / (2 * k)), Pb)
      } else {
        const e = pmod(jj - cc - 1, 2 * k)
        podel = (v - (jj - e)) / k
        pric = u - cc
        ida = pmod(cc, Pa)
        idb = pmod(Math.floor((jj - cc - 1) / (2 * k)), Pb)
      }

      const r1 = hashId(ida, idb)
      const r2 = hashId(idb * 31 + 5, ida)
      const tonShift = (r1 - 0.5) * 30
      const gu = r2 > 0.5 ? 1 - podel : podel

      const turb = (fbm(gu * 2.1 + ida * 0.37, pric * 6.5 + idb * 0.83, 3, seed) - 0.5) * 1.8
      const ring = Math.sin((pric * 2.3 + turb * 0.85 + r2 * 4.1) * Math.PI * 2)
      let t = clamp01(Math.pow(Math.abs(ring), 0.6))
      t = clamp01(t * 0.76 + valueNoise(gu * 380 + ida * 17, pric * 22, seed + 3) * 0.24)

      let col = mix(d, sv, t)
      col = mix(col, b, 0.45)
      col = [
        clamp01((col[0] + tonShift) / 255) * 255,
        clamp01((col[1] + tonShift * 0.86) / 255) * 255,
        clamp01((col[2] + tonShift * 0.66) / 255) * 255,
      ]

      // spáry — bez nich to není parketa, ale tapeta
      const okrajPric = Math.min(pric, 1 - pric)
      const okrajPodel = Math.min(podel, 1 - podel) * k
      const sila = clamp01(1 - Math.min(okrajPric, okrajPodel) / 0.05)
      if (sila > 0) col = mix(col, spara, sila * 0.8)

      const i = (y * S + x) * 4
      img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2]; img.data[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Jednoduchý látkový povrch (gauč, židle). */
export function latkaTexture(barva: string, seed = 5): { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  const S = 256
  const base = hexToRgb(barva)
  const cA = document.createElement('canvas'); cA.width = cA.height = S
  const cR = document.createElement('canvas'); cR.width = cR.height = S
  const a = cA.getContext('2d')!, r = cR.getContext('2d')!
  const ia = a.createImageData(S, S), ir = r.createImageData(S, S)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const weave = (Math.sin(x * 1.9) * Math.sin(y * 1.9)) * 0.5 + 0.5
      const n = valueNoise(x * 3, y * 3, seed)
      const d = (weave * 0.6 + n * 0.4 - 0.5) * 26
      const i = (y * S + x) * 4
      ia.data[i] = clamp01((base[0] + d) / 255) * 255
      ia.data[i + 1] = clamp01((base[1] + d) / 255) * 255
      ia.data[i + 2] = clamp01((base[2] + d) / 255) * 255
      ia.data[i + 3] = 255
      const rv = Math.round((0.86 + n * 0.1) * 255)
      ir.data[i] = ir.data[i + 1] = ir.data[i + 2] = rv
      ir.data[i + 3] = 255
    }
  }
  a.putImageData(ia, 0, 0); r.putImageData(ir, 0, 0)
  const map = new THREE.CanvasTexture(cA), rough = new THREE.CanvasTexture(cR)
  for (const t of [map, rough]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6) }
  map.colorSpace = THREE.SRGBColorSpace
  return { map, rough }
}
