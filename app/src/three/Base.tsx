import * as THREE from 'three'
import type { DeskConfig } from '@/model/types'
import { m, roundedBox } from './shapes'
import { podpory } from '@/model/podpory'
import { Bar, Box } from './Bar'
import { useKov, usePovrch, useMat } from './useMaterials'
import { useMemo } from 'react'

type V3 = [number, number, number]

interface RamProps {
  /** Poloha rámu v ose kolmé na jeho rovinu. */
  pozice: number
  /** Střed rámu v ose, ve které se rozprostírá. */
  stred: number
  /** Rám leží v rovině: 'x' = kolmo na rameno A (běží podél X), 'z' = kolmo na rameno B. */
  smer: 'x' | 'z'
  /** Rozteč nohou (šířka rámu) v metrech. */
  rozpeti: number
  vyskaHorni: number
  profil: number
  material: THREE.Material
  typ: DeskConfig['podnoz']['typ']
}

/**
 * Kovový rám. Každý typ má jinou siluetu, ne jen jinou barvu:
 *   U   ⊓ svislé nohy + horní traverza + krátké patky
 *   A   nohy do A s příčkou
 *   H   svislé nohy spojené příčkou v polovině výšky
 *   trapéz  nohy sbíhavé dolů
 *   hranatý  uzavřený obdélník (horní i spodní traverza po celé šířce)
 */
function Ram({ pozice, stred, smer, rozpeti, vyskaHorni, profil, material, typ }: RamProps) {
  const p = profil
  const y0 = 0.012            // výška patky
  const y1 = vyskaHorni - p / 2
  const half = rozpeti / 2
  const at = (offset: number, y: number): V3 =>
    smer === 'x' ? [stred + offset, y, pozice] : [pozice, y, stred + offset]

  const patkaW = smer === 'x' ? p * 2.2 : p
  const patkaD = smer === 'x' ? p : p * 2.2

  switch (typ) {
    case 'ram-A':
      return (
        <group>
          <Bar a={at(-half * 0.35, y1)} b={at(-half, y0)} w={p} d={p} material={material} />
          <Bar a={at(half * 0.35, y1)} b={at(half, y0)} w={p} d={p} material={material} />
          <Bar a={at(-half * 0.35, y1)} b={at(half * 0.35, y1)} w={p} d={p} material={material} />
          <Bar a={at(-half * 0.62, y1 * 0.42)} b={at(half * 0.62, y1 * 0.42)} w={p * 0.7} d={p * 0.7} material={material} />
          <Box pos={at(-half, y0 / 2)} size={[patkaW, y0, patkaD]} material={material} />
          <Box pos={at(half, y0 / 2)} size={[patkaW, y0, patkaD]} material={material} />
        </group>
      )
    case 'ram-H':
      return (
        <group>
          <Bar a={at(-half, y0)} b={at(-half, y1)} w={p} d={p} material={material} />
          <Bar a={at(half, y0)} b={at(half, y1)} w={p} d={p} material={material} />
          <Bar a={at(-half, y1 * 0.5)} b={at(half, y1 * 0.5)} w={p * 0.8} d={p * 0.8} material={material} />
          <Bar a={at(-half, y1)} b={at(half, y1)} w={p} d={p} material={material} />
          <Box pos={at(-half, y0 / 2)} size={[patkaW * 1.4, y0, patkaD * 1.4]} material={material} />
          <Box pos={at(half, y0 / 2)} size={[patkaW * 1.4, y0, patkaD * 1.4]} material={material} />
        </group>
      )
    case 'ram-trapez':
      return (
        <group>
          <Bar a={at(-half, y1)} b={at(-half * 0.55, y0)} w={p} d={p} material={material} />
          <Bar a={at(half, y1)} b={at(half * 0.55, y0)} w={p} d={p} material={material} />
          <Bar a={at(-half, y1)} b={at(half, y1)} w={p} d={p} material={material} />
          <Box pos={at(-half * 0.55, y0 / 2)} size={[patkaW, y0, patkaD]} material={material} />
          <Box pos={at(half * 0.55, y0 / 2)} size={[patkaW, y0, patkaD]} material={material} />
        </group>
      )
    case 'ram-hranaty':
      return (
        <group>
          <Bar a={at(-half, y0 + p / 2)} b={at(-half, y1)} w={p} d={p} material={material} />
          <Bar a={at(half, y0 + p / 2)} b={at(half, y1)} w={p} d={p} material={material} />
          <Bar a={at(-half, y1)} b={at(half, y1)} w={p} d={p} material={material} />
          <Bar a={at(-half, y0 + p / 2)} b={at(half, y0 + p / 2)} w={p} d={p} material={material} />
        </group>
      )
    case 'ram-U':
    default:
      return (
        <group>
          <Bar a={at(-half, y0)} b={at(-half, y1)} w={p} d={p} material={material} />
          <Bar a={at(half, y0)} b={at(half, y1)} w={p} d={p} material={material} />
          <Bar a={at(-half, y1)} b={at(half, y1)} w={p} d={p} material={material} />
          <Box pos={at(-half, y0 / 2)} size={[patkaW * 1.6, y0, patkaD * 1.6]} material={material} />
          <Box pos={at(half, y0 / 2)} size={[patkaW * 1.6, y0, patkaD * 1.6]} material={material} />
        </group>
      )
  }
}

/** Hairpin — tenké ocelové pruty rozbíhající se z patky. */
function Hairpin({ x, z, vyska, material, tloustka = 0.011 }: {
  x: number; z: number; vyska: number; material: THREE.Material; tloustka?: number
}) {
  const rozevreni = vyska * 0.16
  const geo = useMemo(() => new THREE.CylinderGeometry(tloustka / 2, tloustka / 2, 1, 10), [tloustka])
  const noha = (dx: number, dz: number) => {
    const a = new THREE.Vector3(x, vyska, z)
    const b = new THREE.Vector3(x + dx, 0.004, z + dz)
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
    return (
      <mesh geometry={geo} position={mid} quaternion={q} scale={[1, len, 1]} material={material} castShadow receiveShadow />
    )
  }
  return (
    <group>
      {noha(rozevreni, rozevreni * 0.5)}
      {noha(-rozevreni * 0.35, -rozevreni * 0.9)}
      {noha(-rozevreni * 0.35, rozevreni * 0.9)}
      <mesh position={[x, 0.004, z]} castShadow receiveShadow material={material}>
        <cylinderGeometry args={[0.026, 0.028, 0.008, 16]} />
      </mesh>
    </group>
  )
}

/** Dřevěná noha — rovná, kónická nebo šikmá (skandi). */
function DrevenaNoha({ x, z, vyska, typ, material, profil, sklonX = 0, sklonZ = 0 }: {
  x: number; z: number; vyska: number
  typ: 'rovne' | 'konicke' | 'sikme'
  material: THREE.Material; profil: number
  sklonX?: number; sklonZ?: number
}) {
  const geo = useMemo(() => {
    if (typ === 'konicke') {
      const g = new THREE.CylinderGeometry(profil * 0.5, profil * 0.26, vyska, 14)
      g.translate(0, vyska / 2, 0)
      return g
    }
    const g = roundedBox(profil, vyska, profil, profil * 0.14, 2)
    g.translate(0, vyska / 2, 0)
    return g
  }, [typ, profil, vyska])

  const rot: V3 = typ === 'sikme' ? [sklonZ, 0, -sklonX] : [0, 0, 0]
  return <mesh geometry={geo} position={[x, 0, z]} rotation={rot} material={material} castShadow receiveShadow />
}

export function Podnoz({ config }: { config: DeskConfig }) {
  const { rozmery, podnoz } = config
  const H = m(rozmery.vyska) - m(config.deska.tloustka)
  const p = m(podnoz.profil)
  const o = m(podnoz.odsazeni)

  const kov = useKov(podnoz.barva, podnoz.barva === '#B9BCC0')
  const drevo = usePovrch(podnoz.materialId ?? 'dub-svetly-masiv', { meritko: [0.5, 0.4] })
  const mat = podnoz.material === 'kov' ? kov : drevo
  const guma = useMat('#141414', 0.9)

  // Skutečné podpory včetně vnitřního rohu a případné mezilehlé.
  const body = podpory(config).map((b) => ({ ...b, x: m(b.x), z: m(b.z) }))
  const typ = podnoz.typ

  // Body seskupené do rámů: dvojice sdílející osu tvoří jeden rám.
  const skupiny = ['A', 'B', 'roh', 'mezi'] as const
  const ramy: Array<{ smer: 'x' | 'z'; pozice: number; rozpeti: number; stred: number }> = []
  const samostatne: Array<{ x: number; z: number }> = []

  for (const s of skupiny) {
    const g = body.filter((b) => b.skupina === s)
    if (g.length >= 2) {
      const stejneZ = Math.abs(g[0].z - g[1].z) < 1e-6
      if (stejneZ) {
        const xs = g.map((b) => b.x)
        ramy.push({ smer: 'x', pozice: g[0].z, rozpeti: Math.max(...xs) - Math.min(...xs), stred: (Math.min(...xs) + Math.max(...xs)) / 2 })
      } else {
        const zs = g.map((b) => b.z)
        ramy.push({ smer: 'z', pozice: g[0].x, rozpeti: Math.max(...zs) - Math.min(...zs), stred: (Math.min(...zs) + Math.max(...zs)) / 2 })
      }
    } else {
      for (const b of g) samostatne.push({ x: b.x, z: b.z })
    }
  }

  const jeL = config.tvar === 'L' && rozmery.ramenoBDelka > 0
  const LA = m(rozmery.ramenoADelka)
  const DA = m(rozmery.ramenoAHloubka)
  const DB = m(rozmery.ramenoBHloubka)

  // --- tenké nohy: hairpin ---
  if (typ === 'hairpin') {
    return (
      <group>
        {body.map((b, i) => (
          <Hairpin key={i} x={b.x} z={b.z} vyska={H} material={kov} tloustka={Math.max(0.009, p * 0.28)} />
        ))}
      </group>
    )
  }

  // --- dřevěné / hranaté nohy ---
  if (typ === 'nohy-rovne' || typ === 'nohy-konicke' || typ === 'nohy-sikme') {
    const t = typ === 'nohy-rovne' ? 'rovne' : typ === 'nohy-konicke' ? 'konicke' : 'sikme'
    return (
      <group>
        {body.map((b, i) => (
          <DrevenaNoha
            key={i} x={b.x} z={b.z} vyska={H} typ={t} material={mat}
            profil={Math.max(p, 0.045)}
            sklonX={b.x > DA / 2 ? 0.06 : -0.06}
            sklonZ={b.z > LA / 2 ? 0.06 : -0.06}
          />
        ))}
      </group>
    )
  }

  // --- plné bočnice ---
  if (typ === 'bocnice') {
    const tl = Math.max(m(18), p * 0.5)
    return (
      <group>
        {ramy.map((r, i) => (
          <group key={i}>
            {r.smer === 'x'
              ? <Box pos={[r.stred, H / 2, r.pozice]} size={[r.rozpeti + tl, H, tl]} material={mat} radius={0.003} />
              : <Box pos={[r.pozice, H / 2, r.stred]} size={[tl, H, r.rozpeti + tl]} material={mat} radius={0.003} />}
            {r.smer === 'x'
              ? <Box pos={[r.stred, 0.004, r.pozice]} size={[r.rozpeti - 0.02, 0.008, tl * 0.7]} material={guma} radius={0.001} />
              : <Box pos={[r.pozice, 0.004, r.stred]} size={[tl * 0.7, 0.008, r.rozpeti - 0.02]} material={guma} radius={0.001} />}
          </group>
        ))}
        {samostatne.map((b, i) => (
          <Box key={`s${i}`} pos={[b.x, H / 2, b.z]} size={[tl, H, tl * 2.4]} material={mat} radius={0.003} />
        ))}
      </group>
    )
  }

  // --- kozy ---
  if (typ === 'kozy') {
    return (
      <group>
        {ramy.map((r, i) => (
          <Koza key={i} smer={r.smer} pozice={r.pozice} stred={r.stred} rozpeti={r.rozpeti} vyska={H} profil={p} material={mat} />
        ))}
        {samostatne.map((b, i) => (
          <DrevenaNoha key={`s${i}`} x={b.x} z={b.z} vyska={H} typ="rovne" material={mat} profil={p} />
        ))}
      </group>
    )
  }

  // --- výškově stavitelný rám ---
  if (typ === 'stavitelny-ram') {
    return (
      <group>
        {ramy.map((r, i) => (
          <group key={i}>
            <Box
              pos={r.smer === 'x' ? [r.stred, 0.022, r.pozice] : [r.pozice, 0.022, r.stred]}
              size={r.smer === 'x' ? [r.rozpeti + 0.08, 0.044, 0.07] : [0.07, 0.044, r.rozpeti + 0.08]}
              material={kov} radius={0.006}
            />
            <Box
              pos={r.smer === 'x' ? [r.stred, H * 0.30, r.pozice] : [r.pozice, H * 0.30, r.stred]}
              size={[0.082, H * 0.58, 0.082]} material={kov} radius={0.005}
            />
            <Box
              pos={r.smer === 'x' ? [r.stred, H * 0.68, r.pozice] : [r.pozice, H * 0.68, r.stred]}
              size={[0.068, H * 0.52, 0.068]} material={kov} radius={0.005}
            />
            <Box
              pos={r.smer === 'x' ? [r.stred, H - 0.018, r.pozice] : [r.pozice, H - 0.018, r.stred]}
              size={r.smer === 'x' ? [r.rozpeti * 0.8, 0.036, 0.09] : [0.09, 0.036, r.rozpeti * 0.8]}
              material={kov} radius={0.004}
            />
          </group>
        ))}
        {/* třetí sloup u vnitřního rohu — bez něj by roh L visel na vzduchu */}
        {samostatne.map((b, i) => (
          <group key={`rs${i}`}>
            <Box pos={[b.x, 0.022, b.z]} size={[0.30, 0.044, 0.07]} material={kov} radius={0.006} />
            <Box pos={[b.x, H * 0.30, b.z]} size={[0.082, H * 0.58, 0.082]} material={kov} radius={0.005} />
            <Box pos={[b.x, H * 0.68, b.z]} size={[0.068, H * 0.52, 0.068]} material={kov} radius={0.005} />
            <Box pos={[b.x, H - 0.018, b.z]} size={[0.22, 0.036, 0.09]} material={kov} radius={0.004} />
          </group>
        ))}
      </group>
    )
  }

  // --- kontejner jako nosný prvek: rám jen na konci ramene A, zbytek nese korpus ---
  const jenA = typ === 'kontejner-nosny'

  // --- rámové varianty ---
  return (
    <group>
      {ramy.filter((r) => !jenA || r.smer === 'x').map((r, i) => (
        <Ram
          key={i} pozice={r.pozice} stred={r.stred} smer={r.smer}
          rozpeti={r.rozpeti} vyskaHorni={H} profil={p} material={mat} typ={typ}
        />
      ))}
      {/* vnitřní roh L nese jedna noha — bez ní visí celý roh na vzduchu */}
      {samostatne.map((b, i) => (
        <group key={`s${i}`}>
          <Bar a={[b.x, 0.012, b.z]} b={[b.x, H - p / 2, b.z]} w={p} d={p} material={mat} />
          <Box pos={[b.x, 0.006, b.z]} size={[p * 1.9, 0.012, p * 1.9]} material={mat} radius={0.002} />
        </group>
      ))}
      {/* podélná výztuha pod deskou */}
      {podnoz.vyztuha && (
        <group>
          <Bar
            a={[DA - o, H - p * 0.55, (jeL ? DB - o : o)]}
            b={[DA - o, H - p * 0.55, LA - o]}
            w={p * 0.55} d={p * 0.85} material={mat}
          />
          {jeL && (
            <Bar
              a={[DA - o, H - p * 0.55, DB - o]}
              b={[m(rozmery.ramenoBDelka) - o, H - p * 0.55, DB - o]}
              w={p * 0.85} d={p * 0.55} material={mat}
            />
          )}
        </group>
      )}
    </group>
  )
}

function Koza({ smer, pozice, stred, rozpeti, vyska, profil, material }: {
  smer: 'x' | 'z'; pozice: number; stred: number; rozpeti: number
  vyska: number; profil: number; material: THREE.Material
}) {
  const rozevreni = vyska * 0.2
  const half = rozpeti / 2
  const at = (offset: number, y: number): V3 =>
    smer === 'x' ? [stred + offset, y, pozice] : [pozice, y, stred + offset]
  return (
    <group>
      <Bar a={at(-half * 0.28, vyska)} b={at(-half - rozevreni * 0.35, 0.006)} w={profil} d={profil} material={material} />
      <Bar a={at(half * 0.28, vyska)} b={at(half + rozevreni * 0.35, 0.006)} w={profil} d={profil} material={material} />
      <Bar a={at(-half * 0.28, vyska)} b={at(half * 0.28, vyska)} w={profil} d={profil} material={material} />
      <Bar a={at(-half * 0.72, vyska * 0.36)} b={at(half * 0.72, vyska * 0.36)} w={profil * 0.62} d={profil * 0.62} material={material} />
    </group>
  )
}
