import * as THREE from 'three'
import { normalZVysky } from './textures'

/**
 * Skutečné obrázky dekorů (skeny desek od Eggeru) místo procedurální kresby.
 *
 * Odkud se berou: `app/public/dekory/manifest.json` + JPG soubory, které vyrobí
 * `scripts/dekory_prepare.py` z originálů v `research/dekory-raw/`. V jednosouborovém
 * náhledu (artifact) je totéž vložené jako data URL do `window.__DEKORY__`.
 *
 * Když obrázek chybí, 3D i vzorník spadnou zpátky na procedurální kresbu —
 * appka tedy funguje i bez jediného staženého souboru.
 */

export interface DekorObrazek {
  /** URL (cesta nebo data URL) obrázku pro 3D texturu. */
  url: string
  /** URL menší verze pro vzorník v UI (může být stejná). */
  nahled: string
  /** Kolik mm skutečné desky obrázek zabírá — kvůli měřítku kresby na stole. */
  sirkaMm: number
  vyskaMm: number
  /** Je sken bezešvý? Když ne, textura se zrcadlí, aby na 2 m desce nebyl vidět šev. */
  bezesvy?: boolean
  zdroj?: string
}

type Manifest = Record<string, DekorObrazek>

declare global {
  interface Window { __DEKORY__?: { manifest: Record<string, Omit<DekorObrazek, 'url' | 'nahled'> & { soubor: string; nahledSoubor?: string }>; data: Record<string, string> } }
}

let manifest: Manifest | null = null
let nacitani: Promise<Manifest> | null = null
const posluchaci = new Set<() => void>()

/** Načte manifest (jednou). Vrací prázdný objekt, když nic není. */
export function nactiManifest(): Promise<Manifest> {
  if (manifest) return Promise.resolve(manifest)
  if (nacitani) return nacitani
  nacitani = (async () => {
    let m: Manifest = {}
    try {
      const vlozene = typeof window !== 'undefined' ? window.__DEKORY__ : undefined
      if (vlozene) {
        for (const [kod, z] of Object.entries(vlozene.manifest)) {
          const url = vlozene.data[kod]
          if (url) m[kod] = { url, nahled: url, sirkaMm: z.sirkaMm, vyskaMm: z.vyskaMm, bezesvy: z.bezesvy, zdroj: z.zdroj }
        }
      } else {
        const r = await fetch('/dekory/manifest.json', { cache: 'no-cache' })
        if (r.ok) {
          const j = (await r.json()) as Record<string, { soubor: string; nahledSoubor?: string; sirkaMm: number; vyskaMm: number; bezesvy?: boolean; zdroj?: string }>
          for (const [kod, z] of Object.entries(j)) {
            m[kod] = { url: `/dekory/${z.soubor}`, nahled: `/dekory/${z.nahledSoubor ?? z.soubor}`, sirkaMm: z.sirkaMm, vyskaMm: z.vyskaMm, bezesvy: z.bezesvy, zdroj: z.zdroj }
          }
        }
      }
    } catch { m = {} }
    manifest = m
    posluchaci.forEach((f) => f())
    return m
  })()
  return nacitani
}

/** Synchronní dotaz — před načtením manifestu vrací undefined. */
export function obrazekDekoru(kod?: string): DekorObrazek | undefined {
  if (!kod || !manifest) return undefined
  return manifest[kod]
}

export function priNacteniManifestu(f: () => void): () => void {
  posluchaci.add(f)
  return () => { posluchaci.delete(f) }
}

export interface TexturaDekoru {
  map: THREE.Texture
  normal: THREE.Texture
  sirkaMm: number
  vyskaMm: number
  bezesvy: boolean
}

const cacheTextur = new Map<string, Promise<TexturaDekoru | null>>()

/** Načte obrázek dekoru jako texturu + normálovou mapu odvozenou z jasu. Cachuje se. */
export function nactiTexturu(kod: string): Promise<TexturaDekoru | null> {
  let p = cacheTextur.get(kod)
  if (p) return p
  p = (async () => {
    const m = await nactiManifest()
    const z = m[kod]
    if (!z) return null
    const img = await new Promise<HTMLImageElement | null>((res) => {
      const i = new Image()
      i.crossOrigin = 'anonymous'
      i.onload = () => res(i)
      i.onerror = () => res(null)
      i.src = z.url
    })
    if (!img) return null

    const map = new THREE.Texture(img)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    map.needsUpdate = true

    // Normálová mapa z jasu: tmavší póry a letokruhy jako mírné prohlubně.
    // Zmenšeno na max 1024 px, ať výpočet netrvá — reliéf je stejně jemný.
    const W = Math.min(1024, img.naturalWidth)
    const H = Math.round(W * img.naturalHeight / img.naturalWidth)
    const c = document.createElement('canvas')
    c.width = W; c.height = H
    const g = c.getContext('2d')!
    g.drawImage(img, 0, 0, W, H)
    const d = g.getImageData(0, 0, W, H).data
    const h = new Float32Array(W * H)
    for (let i = 0; i < W * H; i++) h[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255
    const normal = normalZVysky(h, W, H, 1.2)

    for (const t of [map, normal]) {
      t.wrapS = t.wrapT = z.bezesvy ? THREE.RepeatWrapping : THREE.MirroredRepeatWrapping
    }
    return { map, normal, sirkaMm: z.sirkaMm, vyskaMm: z.vyskaMm, bezesvy: !!z.bezesvy }
  })()
  cacheTextur.set(kod, p)
  return p
}
