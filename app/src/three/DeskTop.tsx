import { useMemo } from 'react'
import type { DeskConfig } from '@/model/types'
import { geometrieDesky, m, poziceDira } from './shapes'
import { usePovrch, useKov } from './useMaterials'
import { Box } from './Bar'

export function DeskTop({ config }: { config: DeskConfig }) {
  const { rozmery, deska } = config
  const geo = useMemo(() => geometrieDesky(config), [
    rozmery.ramenoADelka, rozmery.ramenoAHloubka, rozmery.ramenoBDelka, rozmery.ramenoBHloubka,
    deska.tloustka, deska.hrana, deska.radiusRohu, deska.radiusVnitrni, config.tvar,
    config.doplnky.pruchodka,
  ])

  // Kresba běží podél delšího ramene.
  const dlouhe = Math.max(rozmery.ramenoADelka, rozmery.ramenoBDelka) / 1000
  const mat = usePovrch(deska.materialId, { meritko: [Math.max(1.1, dlouhe * 0.55), 0.42], otocit: true })
  const kov = useKov('#2A2B2C')

  const y = m(rozmery.vyska) - m(deska.tloustka)
  const [hx, hz] = poziceDira(config)

  return (
    <group>
      <mesh geometry={geo} position={[0, y, 0]} material={mat} castShadow receiveShadow />
      {/* kroužek průchodky */}
      {config.doplnky.pruchodka === 'kulata' && (
        <mesh position={[hx, m(rozmery.vyska) - 0.002, hz]} material={kov} castShadow>
          <cylinderGeometry args={[0.046, 0.046, 0.005, 32]} />
        </mesh>
      )}
      {config.doplnky.pruchodka === 'obdelnikova' && (
        <Box pos={[hx, m(rozmery.vyska) - 0.002, hz]} size={[0.147, 0.005, 0.060]} material={kov} radius={0.002} />
      )}
    </group>
  )
}
