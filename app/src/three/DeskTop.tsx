import { useMemo } from 'react'
import type { DeskConfig } from '@/model/types'
import { geometrieDesky, m, poziceDira } from './shapes'
import { usePovrch, useKov } from './useMaterials'
import { Box } from './Bar'

export function DeskTop({ config }: { config: DeskConfig }) {
  const { rozmery, deska, doplnky } = config
  // Geometrie se přepočítá při každé změně, která mění obrys. Dřív tu chyběl
  // výřez, takže se udělal, ale po vypnutí zůstal — deska se nepřekreslila.
  const geo = useMemo(() => geometrieDesky(config), [
    rozmery.ramenoADelka, rozmery.ramenoAHloubka, rozmery.ramenoBDelka, rozmery.ramenoBHloubka,
    deska.tloustka, deska.hrana, deska.radiusRohu, deska.radiusVnitrni, deska.radiusUZdi, deska.vyrez,
    config.tvar, doplnky.pruchodka, doplnky.monitorUmisteni, doplnky.monitorPosun,
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
      {/* kroužek průchodky s víčkem */}
      {doplnky.pruchodka === 'kulata' && (
        <group position={[hx, m(rozmery.vyska), hz]}>
          <mesh position={[0, -0.002, 0]} material={kov} castShadow>
            <cylinderGeometry args={[0.046, 0.046, 0.005, 32]} />
          </mesh>
          <mesh position={[0, 0.002, 0]} material={kov}>
            <cylinderGeometry args={[0.036, 0.036, 0.003, 32]} />
          </mesh>
        </group>
      )}
      {doplnky.pruchodka === 'obdelnikova' && (
        <Box pos={[hx, m(rozmery.vyska) - 0.002, hz]} size={[0.147, 0.005, 0.060]} material={kov} radius={0.002} />
      )}
    </group>
  )
}
