import { useMemo } from 'react'
import * as THREE from 'three'
import { roundedBox } from './shapes'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Hranol mezi dvěma body — základ všech rámů a nohou.
 * Má sražené hrany, takže na něm světlo vytvoří lesklou linku
 * a nevypadá jako plochý kvádr.
 */
export function Bar({
  a, b, w, d, material, radius = 0.0015,
}: {
  a: [number, number, number]
  b: [number, number, number]
  /** Šířka průřezu v ose X (m). */
  w: number
  /** Hloubka průřezu v ose Z (m). */
  d: number
  material: THREE.Material
  radius?: number
}) {
  const { geo, pos, quat } = useMemo(() => {
    const va = new THREE.Vector3(...a)
    const vb = new THREE.Vector3(...b)
    const dir = new THREE.Vector3().subVectors(vb, va)
    const len = Math.max(dir.length(), 0.001)
    // roundedBox(w, h, d) -> průřez w×d, délka h podél osy Y, vystředěno
    const geo = roundedBox(w, len, d, radius, 2)
    const pos = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5)
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize())
    return { geo, pos, quat }
  }, [a[0], a[1], a[2], b[0], b[1], b[2], w, d, radius])

  return <mesh geometry={geo} position={pos} quaternion={quat} material={material} castShadow receiveShadow />
}

/** Kvádr se sraženými hranami na dané pozici (korpusy, čela, police). */
export function Box({
  pos, size, material, radius = 0.002,
}: {
  pos: [number, number, number]
  /** [šířka X, výška Y, hloubka Z] v metrech */
  size: [number, number, number]
  material: THREE.Material
  radius?: number
}) {
  const geo = useMemo(() => roundedBox(size[0], size[1], size[2], radius, 2), [size[0], size[1], size[2], radius])
  return <mesh geometry={geo} position={pos} material={material} castShadow receiveShadow />
}
