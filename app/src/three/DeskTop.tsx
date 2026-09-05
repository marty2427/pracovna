import { useMemo } from 'react'
import type { DeskConfig } from '@/model/types'
import { geometrieDesky, m } from './shapes'
import { usePovrch } from './useMaterials'

export function DeskTop({ config }: { config: DeskConfig }) {
  const { rozmery, deska, doplnky } = config
  // Geometrie se přepočítá při každé změně, která mění obrys. Dřív tu chyběl
  // výřez, takže se udělal, ale po vypnutí zůstal — deska se nepřekreslila.
  const geo = useMemo(() => geometrieDesky(config), [
    rozmery.ramenoADelka, rozmery.ramenoAHloubka, rozmery.ramenoBDelka, rozmery.ramenoBHloubka,
    deska.tloustka, deska.hrana, deska.radiusRohu, deska.radiusVnitrni, deska.radiusUZdi, deska.vyrez,
    config.tvar, doplnky.monitorUmisteni, doplnky.monitorPosun,
  ])

  // Kresba běží podél delšího ramene.
  const dlouhe = Math.max(rozmery.ramenoADelka, rozmery.ramenoBDelka) / 1000
  const mat = usePovrch(deska.materialId, { meritko: [Math.max(1.1, dlouhe * 0.55), 0.42], otocit: true })

  const y = m(rozmery.vyska) - m(deska.tloustka)
  return <mesh geometry={geo} position={[0, y, 0]} material={mat} castShadow receiveShadow />
}
