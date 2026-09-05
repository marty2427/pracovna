import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SPACE } from '@/model/space'
import { PALETA } from '@/model/materials'
import { parketyTexture, latkaTexture } from './textures'
import { m } from './shapes'
import { Box } from './Bar'
import { useMat, useKov } from './useMaterials'
import type { DeskConfig } from '@/model/types'
import { Pracoviste } from './Pracoviste'

const R = (n: string) => (PALETA.regions as any[]).find((x) => x.name === n)

/** Podlaha, stěny s průchodem, gauč do U a pracoviště — kvůli měřítku a odstupům. */
export function Room({ config, lehatko = SPACE.gauc.lehatko.delka, ukazNabytek = true }: {
  config: DeskConfig; lehatko?: number; ukazNabytek?: boolean
}) {
  const podlahaR = R('podlaha_vlysy')
  const koberecR = R('koberec_celek')
  const parkety = useMemo(() => {
    const t = parketyTexture(podlahaR.dark, podlahaR.base, podlahaR.light)
    for (const tx of [t.map, t.rough, t.normal]) {
      // 3.8 opakování na 5.2 m podlahy -> šířka vlysu cca 6.5 cm jako na fotce
      tx.repeat.set(3.8 * (6.4 / 5.2), 3.8)
      // Otočení o 90°. Dlaždice je čtvercová a bezešvá v obou osách, takže
      // otočení o pravý úhel švy nerozbije.
      tx.center.set(0.5, 0.5)
      tx.rotation = Math.PI / 2
    }
    return t
  }, [podlahaR.dark, podlahaR.base, podlahaR.light])

  const podlahaMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      map: parkety.map, roughnessMap: parkety.rough, normalMap: parkety.normal,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 1, clearcoat: 0.45, clearcoatRoughness: 0.4, clearcoatRoughnessMap: parkety.rough,
      envMapIntensity: 0.8,
    }),
    [parkety],
  )
  // Stěna: neutrální světlý tón mezi naměřeným osvětleným a zastíněným místem.
  const stenaMat = useMat('#E4DAD0', 0.95)
  const osteniMat = useMat('#D9CEC2', 0.95)
  // Gauč: mezi naměřeným základem (#043A53) a osvětlenou částí (#3E6A84).
  const gaucTex = useMemo(() => latkaTexture('#0F5A78'), [])
  const gaucMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      map: gaucTex.map, roughnessMap: gaucTex.rough, normalMap: gaucTex.normal, normalScale: new THREE.Vector2(0.6, 0.6),
      roughness: 0.95, sheen: 0.7, sheenRoughness: 0.6, sheenColor: new THREE.Color('#4FA8C8'), envMapIntensity: 0.5,
    }),
    [gaucTex],
  )
  const koberecMat = useMat(koberecR?.base ?? '#4A4744', 1)
  const kov = useKov('#9EA3A8', true)

  // Stěny jsou vidět zevnitř místnosti. Když kamera vyjede ven (za levou stěnu
  // s obrazem, nebo za zadní stěnu ke gauči), stěna zmizí a stůl zůstane vidět —
  // stejně jako to už dělá tenká zadní stěna díky jednostrannému materiálu.
  const levaRef = useRef<THREE.Group>(null)
  const zadniRef = useRef<THREE.Group>(null)
  useFrame(({ camera }) => {
    if (levaRef.current) levaRef.current.visible = camera.position.x > -0.05
    if (zadniRef.current) zadniRef.current.visible = camera.position.z > -0.05
  })

  // Rozsah podlahy: od průchodu (x < 0) až za gauč, od zadní stěny do místnosti.
  const X0 = -m(SPACE.pruchod.tloustkaZdi) - 1.4, X1 = 5.6
  const Z0 = -0.6, Z1 = 4.6
  const T = m(SPACE.pruchod.tloustkaZdi)
  const pz0 = m(SPACE.pruchod.odRohu), pz1 = pz0 + m(SPACE.pruchod.sirka)
  const pv = m(SPACE.pruchod.vyska)
  const VYS = m(SPACE.vyskaStropu)

  const gaucX = m(SPACE.zadniStenaKeGauci)
  const gaucD = m(SPACE.gauc.hloubka)
  const gaucW = m(SPACE.gauc.sirka)
  const lehW = m(SPACE.gauc.lehatko.sirka)
  const lehL = m(lehatko)
  const lehW2 = m(SPACE.gauc.lehatkoVzdalene.sirka)
  const lehL2 = m(SPACE.gauc.lehatkoVzdalene.delka)
  const sed = m(SPACE.gauc.vyskaSedaku)
  const op = m(SPACE.gauc.vyskaOperky)

  return (
    <group>
      {/* podlaha — sahá i do průchodu a kousek za něj */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(X0 + X1) / 2, 0, (Z0 + Z1) / 2]} receiveShadow material={podlahaMat}>
        <planeGeometry args={[X1 - X0, Z1 - Z0]} />
      </mesh>

      {/* LEVÁ STĚNA — stará tlustá zeď. Končí hranou v 236 cm, kde začíná průchod.
          Celá skupina zmizí, když se kamera dostane za ni (x < 0). */}
      <group ref={levaRef}>
        <Box pos={[-T / 2, VYS / 2, (Z0 + pz0) / 2]} size={[T, VYS, pz0 - Z0]} material={stenaMat} radius={0.002} />
        {/* překlad nad průchodem */}
        <Box pos={[-T / 2, (pv + VYS) / 2, (pz0 + pz1) / 2]} size={[T, VYS - pv, pz1 - pz0]} material={osteniMat} radius={0.002} />
        {/* zeď za průchodem */}
        <Box pos={[-T / 2, VYS / 2, (pz1 + Z1) / 2]} size={[T, VYS, Z1 - pz1]} material={stenaMat} radius={0.002} />
        {/* vedlejší místnost za průchodem — tmavší stěna, ať je vidět, že se tam dá projít */}
        <mesh rotation={[0, Math.PI / 2, 0]} position={[X0 + 0.02, VYS / 2, (Z0 + Z1) / 2]} material={osteniMat}>
          <planeGeometry args={[Z1 - Z0, VYS]} />
        </mesh>
        <Box pos={[0.008, 0.035, (Z0 + pz0) / 2]} size={[0.016, 0.07, pz0 - Z0]} material={stenaMat} radius={0.002} />
        <Box pos={[0.008, 0.035, (pz1 + Z1) / 2]} size={[0.016, 0.07, Z1 - pz1]} material={stenaMat} radius={0.002} />
      </group>

      {/* ZADNÍ STĚNA (z = 0) — zmizí, když je kamera za ní (z < 0) */}
      <group ref={zadniRef}>
        <mesh position={[(X1 - T) / 2, VYS / 2, -0.01]} receiveShadow material={stenaMat}>
          <planeGeometry args={[X1 + T, VYS]} />
        </mesh>
        <Box pos={[X1 / 2, 0.035, 0.008]} size={[X1, 0.07, 0.016]} material={stenaMat} radius={0.002} />
      </group>

      {ukazNabytek && (
        <group>
          {/* KOBEREC uvnitř U */}
          <Box pos={[gaucX + lehW + (gaucW - lehW - lehW2) / 2, 0.004, gaucD + 1.05]} size={[gaucW - lehW - lehW2 - 0.2, 0.008, 2.1]} material={koberecMat} radius={0.003} />

          {/* GAUČ DO U — zadní díl podél zadní stěny od 160 cm, lehátka na obou koncích do místnosti. */}
          <group>
            {/* zadní díl: sokl, sedáky, opěrky */}
            <Box pos={[gaucX + gaucW / 2, 0.135, gaucD / 2]} size={[gaucW, 0.19, gaucD - 0.04]} material={gaucMat} radius={0.018} />
            {[0.2, 1.0, 1.8, 2.6, gaucW - 0.2].map((dx, i) => (
              <group key={i}>
                <mesh position={[gaucX + dx, 0.022, gaucD - 0.14]} material={kov} castShadow>
                  <cylinderGeometry args={[0.013, 0.013, 0.044, 10]} />
                </mesh>
                <mesh position={[gaucX + dx, 0.022, 0.14]} material={kov} castShadow>
                  <cylinderGeometry args={[0.013, 0.013, 0.044, 10]} />
                </mesh>
              </group>
            ))}
            {(() => {
              // sedáky mezi lehátky, s viditelnými spárami
              const od = gaucX + lehW, doX = gaucX + gaucW - lehW2
              const n = Math.max(2, Math.round((doX - od) / 0.72))
              const w = (doX - od) / n
              return Array.from({ length: n }).map((_, i) => (
                <group key={`s${i}`}>
                  <Box pos={[od + w * (i + 0.5), sed - 0.07, gaucD / 2 + 0.06]} size={[w - 0.02, 0.14, gaucD - 0.30]} material={gaucMat} radius={0.045} />
                  <Box pos={[od + w * (i + 0.5), op - 0.20, 0.155]} size={[w - 0.02, 0.36, 0.20]} material={gaucMat} radius={0.05} />
                  {/* hlavová opěrka, nastavitelná jako na fotce */}
                  <Box pos={[od + w * (i + 0.5), op + 0.09, 0.19]} size={[w * 0.72, 0.16, 0.10]} material={gaucMat} radius={0.04} />
                </group>
              ))
            })()}
            {/* horní hrana zádové opěry přes celou šířku */}
            <Box pos={[gaucX + gaucW / 2, op - 0.02, 0.14]} size={[gaucW - 0.04, 0.08, 0.20]} material={gaucMat} radius={0.04} />

            {/* LEHÁTKO U STOLU — od zadní stěny do místnosti, bok k desce; vedle není místo na nic */}
            <Box pos={[gaucX + lehW / 2, 0.135, gaucD + (lehL - gaucD) / 2]} size={[lehW - 0.02, 0.19, lehL - gaucD]} material={gaucMat} radius={0.018} />
            <Box pos={[gaucX + lehW / 2 + 0.06, sed - 0.07, gaucD / 2 + (lehL - gaucD / 2) / 2 - 0.05]} size={[lehW - 0.16, 0.14, lehL - 0.20]} material={gaucMat} radius={0.045} />
            {/* boční opěrka lehátka — ta strana, co je 12 cm od stolu */}
            <Box pos={[gaucX + 0.075, 0.395, lehL / 2 + 0.02]} size={[0.15, 0.40, lehL - 0.08]} material={gaucMat} radius={0.055} />
            {/* váleček na lehátku */}
            <mesh position={[gaucX + lehW / 2 + 0.05, sed + 0.09, 0.30]} rotation={[0, 0, Math.PI / 2]} material={gaucMat} castShadow>
              <cylinderGeometry args={[0.085, 0.085, lehW - 0.32, 18]} />
            </mesh>
            {[0.3, lehL - 0.2].map((dz, i) => (
              <mesh key={`ln${i}`} position={[gaucX + 0.14, 0.022, dz]} material={kov} castShadow>
                <cylinderGeometry args={[0.013, 0.013, 0.044, 10]} />
              </mesh>
            ))}

            {/* LEHÁTKO NA VZDÁLENÉM KONCI */}
            <Box pos={[gaucX + gaucW - lehW2 / 2, 0.135, gaucD + (lehL2 - gaucD) / 2]} size={[lehW2 - 0.02, 0.19, lehL2 - gaucD]} material={gaucMat} radius={0.018} />
            <Box pos={[gaucX + gaucW - lehW2 / 2 - 0.06, sed - 0.07, gaucD / 2 + (lehL2 - gaucD / 2) / 2 - 0.05]} size={[lehW2 - 0.16, 0.14, lehL2 - 0.20]} material={gaucMat} radius={0.045} />
            <Box pos={[gaucX + gaucW - 0.075, 0.395, lehL2 / 2 + 0.02]} size={[0.15, 0.40, lehL2 - 0.08]} material={gaucMat} radius={0.055} />
            <mesh position={[gaucX + gaucW - lehW2 / 2 - 0.05, sed + 0.09, 0.30]} rotation={[0, 0, Math.PI / 2]} material={gaucMat} castShadow>
              <cylinderGeometry args={[0.085, 0.085, lehW2 - 0.32, 18]} />
            </mesh>
          </group>

          {/* PRACOVIŠTĚ: monitor, klávesnice, myš, repro, židle */}
          <Pracoviste config={config} />
        </group>
      )}
    </group>
  )
}
