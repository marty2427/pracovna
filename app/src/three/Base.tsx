import * as THREE from 'three'
import type { DeskConfig } from '@/model/types'
import { m } from './shapes'
import { podpory, jekl } from '@/model/podpory'
import { KOV } from '@/model/materials'
import { Bar, Box } from './Bar'
import { useKov, useMat } from './useMaterials'

type V3 = [number, number, number]

interface RamProps {
  /** Poloha rámu v ose kolmé na jeho rovinu. */
  pozice: number
  /** Střed rámu v ose, ve které se rozprostírá. */
  stred: number
  /** Rám leží v rovině: 'x' = kolmo na rameno A (běží podél X), 'z' = kolmo na rameno B. */
  smer: 'x' | 'z'
  /** Rozteč stojek (šířka rámu) v metrech. */
  rozpeti: number
  vyskaHorni: number
  /** Široká (S) a úzká (U) strana jeklu v metrech. */
  S: number
  U: number
  material: THREE.Material
  plst: THREE.Material
}

const PLST = 0.004

/**
 * Uzavřený obdélníkový rám z jeklu naležato: lyžina leží plochou stranou na
 * zemi, stojky mají širokou stranu v rovině rámu (z místnosti je vidět jen
 * úzká hrana), horní traverza leží naplocho pod deskou. Pod lyžinou jsou jen
 * plstěné podložky — žádné rektifikační nožky, ať to nevypadá jak v kanceláři.
 */
function Ram({ pozice, stred, smer, rozpeti, vyskaHorni, S, U, material, plst }: RamProps) {
  const half = rozpeti / 2
  const at = (offset: number, y: number): V3 =>
    smer === 'x' ? [stred + offset, y, pozice] : [pozice, y, stred + offset]
  // Bar: u svislého hranolu je w rozměr v X a d v Z. U vodorovného podél X je
  // w výška a d rozměr v Z; podél Z je w rozměr v X a d výška.
  const stojkaW = smer === 'x' ? S : U
  const stojkaD = smer === 'x' ? U : S
  const lezatyW = smer === 'x' ? U : S
  const lezatyD = smer === 'x' ? S : U
  const kraj = half + S / 2
  return (
    <group>
      {/* lyžina naplocho na zemi */}
      <Bar a={at(-kraj, PLST + U / 2)} b={at(kraj, PLST + U / 2)} w={lezatyW} d={lezatyD} material={material} />
      {/* stojky */}
      <Bar a={at(-half, PLST + U)} b={at(-half, vyskaHorni - U)} w={stojkaW} d={stojkaD} material={material} />
      <Bar a={at(half, PLST + U)} b={at(half, vyskaHorni - U)} w={stojkaW} d={stojkaD} material={material} />
      {/* horní traverza naplocho pod deskou */}
      <Bar a={at(-kraj, vyskaHorni - U / 2)} b={at(kraj, vyskaHorni - U / 2)} w={lezatyW} d={lezatyD} material={material} />
      {/* plstěné podložky pod konci lyžiny */}
      {[-half, half].map((off, i) => (
        <Box key={i} pos={at(off, PLST / 2)} size={smer === 'x' ? [S * 1.2, PLST, S * 0.9] : [S * 0.9, PLST, S * 1.2]} material={plst} radius={0.001} />
      ))}
    </group>
  )
}

export function Podnoz({ config }: { config: DeskConfig }) {
  const { rozmery, podnoz } = config
  const H = m(rozmery.vyska) - m(config.deska.tloustka)
  const j = jekl(podnoz.profil)
  const S = m(j.sirka)
  const U = m(j.vyska)
  const o = m(podnoz.odsazeni)

  const kov = useKov(KOV.barva)
  const plst = useMat('#2B2724', 0.95)

  // Skutečné podpory včetně rohu a případných mezilehlých.
  const body = podpory(config).map((b) => ({ ...b, x: m(b.x), z: m(b.z) }))

  // Body seskupené do rámů: dvojice sdílející osu tvoří jeden rám.
  const skupiny = ['A', 'B', 'roh', 'mezi', 'meziB'] as const
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

  const jeL = rozmery.ramenoBDelka > 0
  const LA = m(rozmery.ramenoADelka)
  const LB = m(rozmery.ramenoBDelka)
  const DA = m(rozmery.ramenoAHloubka)
  const DB = m(rozmery.ramenoBHloubka)

  return (
    <group>
      {ramy.map((r, i) => (
        <Ram
          key={i} pozice={r.pozice} stred={r.stred} smer={r.smer}
          rozpeti={r.rozpeti} vyskaHorni={H} S={S} U={U} material={kov} plst={plst}
        />
      ))}
      {/* rohová stojka na ploché patce — bez ní visí roh L na vzduchu */}
      {samostatne.map((b, i) => (
        <group key={`s${i}`}>
          <Bar a={[b.x, PLST + U, b.z]} b={[b.x, H - U, b.z]} w={S} d={U} material={kov} />
          <Box pos={[b.x, PLST + U / 2, b.z]} size={[S * 1.6, U, S * 1.6]} material={kov} radius={0.002} />
          <Box pos={[b.x, H - U / 2, b.z]} size={[S * 1.6, U, S * 1.6]} material={kov} radius={0.002} />
          <Box pos={[b.x, PLST / 2, b.z]} size={[S * 1.4, PLST, S * 1.4]} material={plst} radius={0.001} />
        </group>
      ))}
      {/* podélná výztuha pod deskou — stejný jekl nastojato */}
      {podnoz.vyztuha && (
        <group>
          <Bar a={[DA - o, H - S / 2, jeL ? DB - o : o]} b={[DA - o, H - S / 2, LA - o]} w={U} d={S} material={kov} />
          {jeL && (
            <Bar a={[DA - o, H - S / 2, DB - o]} b={[LB - o, H - S / 2, DB - o]} w={S} d={U} material={kov} />
          )}
        </group>
      )}
    </group>
  )
}
