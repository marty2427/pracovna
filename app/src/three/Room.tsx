import { useMemo } from 'react'
import * as THREE from 'three'
import { SPACE } from '@/model/space'
import { PALETA } from '@/model/materials'
import { parketyTexture, latkaTexture } from './textures'
import { m } from './shapes'
import { Box } from './Bar'
import { useMat, useKov, usePovrch } from './useMaterials'
import type { DeskConfig } from '@/model/types'

const R = (n: string) => (PALETA.regions as any[]).find((x) => x.name === n)

/** Podlaha, stěny, gauč, židle, tiskárna a monitor — kvůli měřítku a odstupům. */
export function Room({ config, ukazNabytek = true }: { config: DeskConfig; ukazNabytek?: boolean }) {
  const podlahaR = R('podlaha_vlysy')
  const parkety = useMemo(() => {
    const t = parketyTexture(podlahaR.dark, podlahaR.base, podlahaR.light)
    // 3.8 opakování na 5.2 m podlahy -> šířka vlysu cca 6.5 cm jako na fotce
    t.repeat.set(3.8, 3.8)
    return t
  }, [podlahaR.dark, podlahaR.base, podlahaR.light])

  const podlahaMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: parkety, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.5, envMapIntensity: 0.7 }),
    [parkety],
  )
  // Stěna: neutrální světlý tón mezi naměřeným osvětleným a zastíněným místem.
  const stenaMat = useMat('#E4DAD0', 0.95)
  // Gauč: mezi naměřeným základem (#043A53) a osvětlenou částí (#3E6A84).
  const gaucTex = useMemo(() => latkaTexture('#0F5A78'), [])
  const gaucMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: gaucTex.map, roughnessMap: gaucTex.rough, roughness: 0.92, sheen: 0.6, sheenColor: new THREE.Color('#4FA8C8'), envMapIntensity: 0.5 }),
    [gaucTex],
  )
  const cerna = useMat('#1E1F20', 0.72)
  const plast = useMat('#2A2C2E', 0.55)
  const kov = useKov('#9EA3A8', true)
  const tiskarnaMat = useMat('#232527', 0.6)
  const drevo = usePovrch(config.deska.materialId, { meritko: [0.6, 0.4] })

  const RX = 5.2, RZ = 5.0
  const gaucX = m(SPACE.zadniStenaKeGauci)
  const gaucD = m(SPACE.gauc.hloubka)

  const DA = m(config.rozmery.ramenoAHloubka)
  const DB = m(config.rozmery.ramenoBHloubka)
  const LA = m(config.rozmery.ramenoADelka)
  const jeL = config.tvar === 'L' && config.rozmery.ramenoBDelka > 0
  const H = m(config.rozmery.vyska)

  return (
    <group>
      {/* podlaha */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[RX / 2 - 0.6, 0, RZ / 2 - 0.6]} receiveShadow material={podlahaMat}>
        <planeGeometry args={[RX, RZ]} />
      </mesh>
      {/* levá stěna (x = 0) */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.01, 1.35, RZ / 2 - 0.6]} receiveShadow material={stenaMat}>
        <planeGeometry args={[RZ, 2.7]} />
      </mesh>
      {/* zadní stěna (z = 0) */}
      <mesh position={[RX / 2 - 0.6, 1.35, -0.01]} receiveShadow material={stenaMat}>
        <planeGeometry args={[RX, 2.7]} />
      </mesh>
      {/* soklová lišta */}
      <Box pos={[0.008, 0.035, RZ / 2 - 0.6]} size={[0.016, 0.07, RZ]} material={stenaMat} radius={0.002} />
      <Box pos={[RX / 2 - 0.6, 0.035, 0.008]} size={[RX, 0.07, 0.016]} material={stenaMat} radius={0.002} />

      {ukazNabytek && (
        <group>
          {/* GAUČ — začíná 160 cm od rohu podél zadní stěny.
              Skládaný z korpusu, samostatných sedáků a opěrek, aby to nebyl modrý kvádr. */}
          <group>
            {/* korpus / sokl */}
            <Box pos={[gaucX + 1.18, 0.135, gaucD / 2]} size={[2.36, 0.19, gaucD - 0.04]} material={gaucMat} radius={0.018} />
            {/* nožky */}
            {[0.16, 0.86, 1.56, 2.22].map((dx, i) => (
              <group key={i}>
                <mesh position={[gaucX + dx, 0.022, gaucD - 0.14]} material={kov} castShadow>
                  <cylinderGeometry args={[0.013, 0.013, 0.044, 10]} />
                </mesh>
                <mesh position={[gaucX + dx, 0.022, 0.14]} material={kov} castShadow>
                  <cylinderGeometry args={[0.013, 0.013, 0.044, 10]} />
                </mesh>
              </group>
            ))}
            {/* sedáky — tři, s viditelnými spárami */}
            {[0, 1, 2].map((i) => (
              <Box key={`s${i}`}
                pos={[gaucX + 0.42 + i * 0.755, 0.30, gaucD / 2 + 0.055]}
                size={[0.735, 0.14, gaucD - 0.30]} material={gaucMat} radius={0.045} />
            ))}
            {/* opěrky zad */}
            {[0, 1, 2].map((i) => (
              <Box key={`o${i}`}
                pos={[gaucX + 0.42 + i * 0.755, 0.50, 0.155]}
                size={[0.735, 0.34, 0.20]} material={gaucMat} radius={0.05} />
            ))}
            {/* horní hrana zádové opěry */}
            <Box pos={[gaucX + 1.18, 0.665, 0.14]} size={[2.34, 0.10, 0.20]} material={gaucMat} radius={0.048} />
            {/* boční opěrka vlevo — ta, co je 12 cm od stolu */}
            <Box pos={[gaucX + 0.075, 0.395, gaucD / 2]} size={[0.15, 0.40, gaucD - 0.06]} material={gaucMat} radius={0.055} />
            {/* lenoška vpravo */}
            <Box pos={[gaucX + 2.60, 0.28, gaucD / 2 + 0.30]} size={[0.80, 0.30, gaucD + 0.55]} material={gaucMat} radius={0.04} />
            <Box pos={[gaucX + 2.60, 0.45, 0.155]} size={[0.78, 0.30, 0.20]} material={gaucMat} radius={0.05} />
          </group>

          {/* ŽIDLE */}
          <Zidle x={DA + 0.50} z={(jeL ? DB : 0) + (LA - (jeL ? DB : 0)) * 0.5} cerna={cerna} plast={plast} kov={kov} />

          {/* TISKÁRNA v rohu L */}
          {config.doplnky.tiskarnaVRohu && jeL && (
            <group>
              <Box pos={[Math.min(DA, 0.52) * 0.62 + 0.10, H + 0.075, DB * 0.5]} size={[0.44, 0.15, 0.36]} material={tiskarnaMat} radius={0.008} />
              <Box pos={[Math.min(DA, 0.52) * 0.62 + 0.10, H + 0.162, DB * 0.5 - 0.02]} size={[0.40, 0.03, 0.30]} material={tiskarnaMat} radius={0.006} />
              <Box pos={[Math.min(DA, 0.52) * 0.62 + 0.10, H + 0.152, DB * 0.5 + 0.175]} size={[0.30, 0.012, 0.05]} material={useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#101112', roughness: 0.3 }), [])} radius={0.002} />
            </group>
          )}

          {/* MONITOR na hlavní ploše */}
          <group position={[0.20, H, (jeL ? DB : 0) + (LA - (jeL ? DB : 0)) * 0.5]}>
            <Box pos={[0, 0.012, 0]} size={[0.20, 0.018, 0.26]} material={plast} radius={0.006} />
            <Box pos={[0.005, 0.13, 0]} size={[0.05, 0.24, 0.06]} material={plast} radius={0.008} />
            <group rotation={[0, Math.PI / 2, 0]}>
              <Box pos={[0, 0.40, -0.03]} size={[0.62, 0.37, 0.016]} material={plast} radius={0.004} />
              <mesh position={[0, 0.402, -0.020]}>
                <planeGeometry args={[0.60, 0.345]} />
                <meshStandardMaterial color="#0B0D10" roughness={0.22} metalness={0.1} />
              </mesh>
            </group>
          </group>

          {/* klávesnice */}
          <Box pos={[DA * 0.55, H + 0.009, (jeL ? DB : 0) + (LA - (jeL ? DB : 0)) * 0.5]} size={[0.14, 0.016, 0.40]} material={cerna} radius={0.003} />
          {/* hrneček, ať je vidět měřítko */}
          <mesh position={[DA * 0.66, H + 0.045, (jeL ? DB : 0) + (LA - (jeL ? DB : 0)) * 0.5 - 0.34]} castShadow material={drevo}>
            <cylinderGeometry args={[0.041, 0.035, 0.09, 20]} />
          </mesh>
        </group>
      )}
    </group>
  )
}

function Zidle({ x, z, cerna, plast, kov }: {
  x: number; z: number
  cerna: THREE.Material; plast: THREE.Material; kov: THREE.Material
}) {
  const paprsky = [0, 1, 2, 3, 4]
  return (
    <group position={[x, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
      {paprsky.map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <Box pos={[0, 0.055, 0.16]} size={[0.035, 0.022, 0.30]} material={plast} radius={0.006} />
            <mesh position={[0, 0.028, 0.30]} castShadow material={cerna}>
              <cylinderGeometry args={[0.028, 0.028, 0.048, 12]} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.20, 0]} castShadow material={kov}>
        <cylinderGeometry args={[0.028, 0.034, 0.26, 16]} />
      </mesh>
      <Box pos={[0, 0.44, 0]} size={[0.47, 0.075, 0.45]} material={cerna} radius={0.024} />
      <group rotation={[-0.16, 0, 0]}>
        <Box pos={[0, 0.71, -0.22]} size={[0.44, 0.46, 0.035]} material={cerna} radius={0.03} />
      </group>
      <Box pos={[-0.26, 0.58, -0.02]} size={[0.035, 0.20, 0.16]} material={plast} radius={0.012} />
      <Box pos={[0.26, 0.58, -0.02]} size={[0.035, 0.20, 0.16]} material={plast} radius={0.012} />
      <Box pos={[-0.26, 0.665, 0.0]} size={[0.06, 0.022, 0.24]} material={cerna} radius={0.010} />
      <Box pos={[0.26, 0.665, 0.0]} size={[0.06, 0.022, 0.24]} material={cerna} radius={0.010} />
    </group>
  )
}
