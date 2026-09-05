import * as THREE from 'three'
import type { DeskConfig, Ulozne as UlozneT } from '@/model/types'
import { m } from './shapes'
import { Box } from './Bar'
import { usePovrch, useKov, useMat } from './useMaterials'

const SPARA = 0.005   // spára mezi čely — bez ní to vypadá jako jeden blok
const KORPUS = 0.018

/** Čelo zásuvky nebo dvířka s úchytkou. `smer` říká, kterým směrem čelo míří. */
function Celo({ x, y, z, sirka, vyska, smer, material, kovMat, uchyt }: {
  x: number; y: number; z: number
  /** Šířka čela podél jeho vlastní osy (Z pro smer 'x', X pro smer 'z'). */
  sirka: number
  vyska: number
  smer: 'x' | 'z'
  material: THREE.Material
  kovMat: THREE.Material
  uchyt: 'madlo' | 'frezovany' | 'zadny'
}) {
  const tl = 0.019
  const size: [number, number, number] = smer === 'z' ? [sirka, vyska, tl] : [tl, vyska, sirka]
  const ven = tl / 2
  const madloY = y + vyska * 0.5 - Math.min(0.026, vyska * 0.3)

  return (
    <group>
      <Box pos={[x, y, z]} size={size} material={material} radius={0.0015} />
      {uchyt === 'madlo' && (smer === 'z' ? (
        <>
          <Box pos={[x, madloY, z + ven + 0.016]} size={[sirka * 0.42, 0.011, 0.011]} material={kovMat} radius={0.004} />
          <Box pos={[x - sirka * 0.2, madloY, z + ven + 0.008]} size={[0.009, 0.009, 0.017]} material={kovMat} radius={0.002} />
          <Box pos={[x + sirka * 0.2, madloY, z + ven + 0.008]} size={[0.009, 0.009, 0.017]} material={kovMat} radius={0.002} />
        </>
      ) : (
        <>
          <Box pos={[x + ven + 0.016, madloY, z]} size={[0.011, 0.011, sirka * 0.42]} material={kovMat} radius={0.004} />
          <Box pos={[x + ven + 0.008, madloY, z - sirka * 0.2]} size={[0.017, 0.009, 0.009]} material={kovMat} radius={0.002} />
          <Box pos={[x + ven + 0.008, madloY, z + sirka * 0.2]} size={[0.017, 0.009, 0.009]} material={kovMat} radius={0.002} />
        </>
      ))}
      {uchyt === 'frezovany' && (smer === 'z'
        ? <Box pos={[x, y + vyska / 2 - 0.012, z + ven - 0.005]} size={[sirka * 0.5, 0.015, 0.013]} material={kovMat} radius={0.003} />
        : <Box pos={[x + ven - 0.005, y + vyska / 2 - 0.012, z]} size={[0.013, 0.015, sirka * 0.5]} material={kovMat} radius={0.003} />)}
    </group>
  )
}

interface Umisteni {
  /** střed korpusu */
  x: number; z: number
  /** rozměry korpusu */
  sirka: number; hloubka: number
  /** orientace čel: 'z+' = čela míří do místnosti podél Z, 'x+' = podél X */
  celaSmer: 'x' | 'z'
}

function umisti(c: DeskConfig, u: UlozneT): Umisteni {
  const LA = m(c.rozmery.ramenoADelka)
  const DA = m(c.rozmery.ramenoAHloubka)
  const LB = m(c.rozmery.ramenoBDelka)
  const DB = m(c.rozmery.ramenoBHloubka)
  const jeL = c.tvar === 'L' && c.rozmery.ramenoBDelka > 0
  const sirka = 0.42

  if (u.rameno === 'B' && jeL) {
    // pod ramenem B: čela míří do místnosti (+Z)
    const hloubka = Math.max(0.34, DB - 0.06)
    const min = DA + sirka / 2 + 0.04
    const max = LB - sirka / 2 - 0.03
    const x = min + (max - min) * Math.min(Math.max(u.pozice, 0), 1)
    return { x, z: hloubka / 2 + 0.02, sirka, hloubka, celaSmer: 'z' }
  }
  // pod ramenem A: čela míří do místnosti (+X)
  const hloubka = Math.max(0.34, DA - 0.06)
  const min = (jeL ? DB : 0) + sirka / 2 + 0.08
  const max = LA - sirka / 2 - 0.03
  const z = min + (max - min) * Math.min(Math.max(u.pozice, 0), 1)
  return { x: hloubka / 2 + 0.02, z, sirka, hloubka, celaSmer: 'x' }
}

/** Pevný kontejner se třemi zásuvkami — stojí na podlaze, čela v materiálu desky nebo v akcentní barvě. */
function KorpusSeZasuvkami({ c, u, pocet }: { c: DeskConfig; u: UlozneT; pocet: number }) {
  const pojezdovy = false
  // Všechno v jednom dřevě jako deska — žádný jiný odstín na korpusu ani na čelech.
  const mat = usePovrch(c.deska.materialId, { meritko: [0.7, 0.45] })
  const celoMat = usePovrch(c.deska.materialId, { meritko: [0.55, 0.4] })
  const kov = useKov('#1F2021')
  const stin = useMat('#241C15', 0.95)

  const { x, z, sirka, hloubka, celaSmer } = umisti(c, u)
  const H = m(c.rozmery.vyska) - m(c.deska.tloustka)
  const vyskaKorpusu = pojezdovy ? H - 0.055 : H - 0.002
  const yBase = pojezdovy ? 0.055 : 0
  const vnitrni = vyskaKorpusu - 2 * KORPUS
  const hCelo = (vnitrni - (pocet - 1) * SPARA) / pocet

  const W = celaSmer === 'z' ? sirka : hloubka
  const D = celaSmer === 'z' ? hloubka : sirka

  return (
    <group>
      {/* korpus */}
      <Box pos={[x, yBase + vyskaKorpusu / 2, z]} size={[W, vyskaKorpusu, D]} material={mat} radius={0.002} />
      {/* tmavé pozadí za čely — díky němu jsou spáry vidět jako spáry */}
      <Box
        pos={celaSmer === 'z' ? [x, yBase + vyskaKorpusu / 2, z + D / 2 - 0.017] : [x + W / 2 - 0.017, yBase + vyskaKorpusu / 2, z]}
        size={celaSmer === 'z' ? [W - 0.012, vyskaKorpusu - 0.012, 0.004] : [0.004, vyskaKorpusu - 0.012, D - 0.012]}
        material={stin} radius={0.001}
      />
      {/* čela */}
      {Array.from({ length: pocet }).map((_, i) => {
        const y = yBase + KORPUS + hCelo / 2 + i * (hCelo + SPARA)
        return celaSmer === 'z' ? (
          <Celo key={i} x={x} y={y} z={z + D / 2 - 0.008} sirka={W - 0.006} vyska={hCelo}
                smer="z" material={celoMat} kovMat={kov} uchyt="madlo" />
        ) : (
          <Celo key={i} x={x + W / 2 - 0.008} y={y} z={z} sirka={D - 0.006} vyska={hCelo}
                smer="x" material={celoMat} kovMat={kov} uchyt="madlo" />
        )
      })}
      {/* kolečka */}
      {pojezdovy && [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[x + sx * (W / 2 - 0.05), 0.028, z + sz * (D / 2 - 0.05)]} castShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.016, 12]} />
          <meshPhysicalMaterial color="#171717" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function Ulozne({ config }: { config: DeskConfig }) {
  return (
    <group>
      {config.ulozne.map((u, i) => (
        <KorpusSeZasuvkami key={i} c={config} u={u} pocet={3} />
      ))}
    </group>
  )
}
