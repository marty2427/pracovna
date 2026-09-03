import { useMemo } from 'react'
import * as THREE from 'three'
import { woodTextures, komaxitTexture } from './textures'
import { material as findMaterial, type Material } from '@/model/materials'

/** Cache textur — generování je drahé, konfigurace se mění často. */
const cacheWood = new Map<string, { map: THREE.CanvasTexture; rough: THREE.CanvasTexture }>()
const cacheKomaxit = new Map<string, { map: THREE.CanvasTexture; rough: THREE.CanvasTexture }>()

function woodFor(mat: Material) {
  const key = mat.id
  let t = cacheWood.get(key)
  if (!t) {
    t = woodTextures({
      base: mat.barva,
      tmava: mat.kresbaTmava ?? mat.barva,
      svetla: mat.kresbaSvetla ?? mat.barva,
      hustota: 7,
      vlneni: 1.05,
      seed: (key.length * 13) % 97,
    })
    cacheWood.set(key, t)
  }
  return t
}

function komaxitFor(barva: string) {
  let t = cacheKomaxit.get(barva)
  if (!t) { t = komaxitTexture(barva); cacheKomaxit.set(barva, t) }
  return t
}

export interface PovrchOpts {
  /** Kolik metrů skutečné plochy odpovídá jednomu opakování textury. */
  meritko?: [number, number]
  /** Otočení kresby o 90°, aby vlákno běželo podél delší strany. */
  otocit?: boolean
}

/** Materiál dřeva / dekoru desky nebo korpusu. */
export function usePovrch(materialId: string, opts: PovrchOpts = {}): THREE.MeshPhysicalMaterial {
  const mat = findMaterial(materialId)
  const meritko = opts.meritko ?? [1.6, 0.55]
  const otocit = opts.otocit ?? false

  return useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(mat.barva),
      roughness: mat.drsnost,
      metalness: 0,
      clearcoat: mat.lesk,
      clearcoatRoughness: 0.35,
      envMapIntensity: 0.85,
    })
    if (mat.drevo) {
      const { map, rough } = woodFor(mat)
      const mapC = map.clone(); mapC.needsUpdate = true
      const roughC = rough.clone(); roughC.needsUpdate = true
      for (const t of [mapC, roughC]) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.center.set(0.5, 0.5)
        t.rotation = otocit ? Math.PI / 2 : 0
        t.repeat.set(1 / meritko[0], 1 / meritko[1])
        t.anisotropy = 8
      }
      mapC.colorSpace = THREE.SRGBColorSpace
      m.map = mapC
      m.roughnessMap = roughC
      m.color = new THREE.Color('#ffffff')
    }
    return m
  }, [mat.id, mat.barva, mat.drevo, mat.drsnost, mat.lesk, meritko[0], meritko[1], otocit])
}

/** Materiál kovové podnože (komaxit / nerez). */
export function useKov(barva: string, nerez = false): THREE.MeshPhysicalMaterial {
  return useMemo(() => {
    const { map, rough } = komaxitFor(barva)
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(nerez ? '#ffffff' : '#ffffff'),
      map: map.clone(),
      roughnessMap: rough.clone(),
      roughness: nerez ? 0.28 : 0.62,
      metalness: nerez ? 0.85 : 0.25,
      envMapIntensity: nerez ? 1.4 : 0.9,
      clearcoat: nerez ? 0.2 : 0.08,
    })
    if (m.map) { m.map.needsUpdate = true; m.map.colorSpace = THREE.SRGBColorSpace }
    if (m.roughnessMap) m.roughnessMap.needsUpdate = true
    return m
  }, [barva, nerez])
}

/** Jednoduchý matný materiál (plast, guma, lak bez kresby). */
export function useMat(barva: string, drsnost = 0.7, metalnost = 0): THREE.MeshPhysicalMaterial {
  return useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(barva), roughness: drsnost, metalness: metalnost, envMapIntensity: 0.8,
    }),
    [barva, drsnost, metalnost],
  )
}
