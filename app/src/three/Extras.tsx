import type { DeskConfig } from '@/model/types'
import { m } from './shapes'
import { poziceSezeni } from '@/model/constraints'
import { Box } from './Bar'
import { useKov, usePovrch, useMat } from './useMaterials'

export function Doplnky({ config }: { config: DeskConfig }) {
  const { rozmery, doplnky } = config
  const LA = m(rozmery.ramenoADelka)
  const DA = m(rozmery.ramenoAHloubka)
  const LB = m(rozmery.ramenoBDelka)
  const DB = m(rozmery.ramenoBHloubka)
  const jeL = config.tvar === 'L' && rozmery.ramenoBDelka > 0
  const H = m(rozmery.vyska)
  const podDeskou = H - m(config.deska.tloustka)

  const kov = useKov('#2A2B2C')
  const drevo = usePovrch(config.deska.materialId, { meritko: [0.8, 0.4] })
  const led = useMat('#FFE7C4', 0.4)

  const zOd = (jeL ? DB : 0) + 0.12
  const sez = m(poziceSezeni(config))

  return (
    <group>
      {/* kabelová lávka pod deskou u zadní hrany */}
      {doplnky.kabelovaLavka && (
        <group>
          <Box pos={[0.075, podDeskou - 0.055, (zOd + LA - 0.08) / 2]} size={[0.10, 0.008, LA - 0.08 - zOd]} material={kov} radius={0.002} />
          <Box pos={[0.028, podDeskou - 0.032, (zOd + LA - 0.08) / 2]} size={[0.006, 0.048, LA - 0.08 - zOd]} material={kov} radius={0.002} />
          <Box pos={[0.122, podDeskou - 0.032, (zOd + LA - 0.08) / 2]} size={[0.006, 0.048, LA - 0.08 - zOd]} material={kov} radius={0.002} />
        </group>
      )}

      {/* LED podsvícení — profil + svítící pás */}
      {doplnky.ledPodsviceni && (
        <group>
          <Box pos={[DA - 0.045, podDeskou - 0.011, (zOd + LA - 0.05) / 2]} size={[0.022, 0.016, LA - 0.05 - zOd]} material={kov} radius={0.002} />
          <mesh position={[DA - 0.045, podDeskou - 0.019, (zOd + LA - 0.05) / 2]}>
            <boxGeometry args={[0.016, 0.003, LA - 0.06 - zOd]} />
            <meshStandardMaterial color="#FFE2B0" emissive="#FFCE86" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          {jeL && (
            <>
              <Box pos={[(DA + LB - 0.05) / 2, podDeskou - 0.011, DB - 0.045]} size={[LB - 0.05 - DA, 0.016, 0.022]} material={kov} radius={0.002} />
              <mesh position={[(DA + LB - 0.05) / 2, podDeskou - 0.019, DB - 0.045]}>
                <boxGeometry args={[LB - 0.06 - DA, 0.003, 0.016]} />
                <meshStandardMaterial color="#FFE2B0" emissive="#FFCE86" emissiveIntensity={2.4} toneMapped={false} />
              </mesh>
            </>
          )}
          <pointLight position={[DA - 0.1, podDeskou - 0.10, sez]} intensity={0.30} distance={1.1} color="#FFD8A0" />
        </group>
      )}

      {/* nástavec na monitor — stojí pod monitorem, ne někde vedle */}
      {doplnky.nastavecMonitor && (
        <group>
          <Box pos={[0.30, H + 0.098, sez]} size={[0.32, m(20), 0.62]} material={drevo} radius={0.003} />
          <Box pos={[0.30 - 0.14, H + 0.045, sez]} size={[0.022, 0.09, 0.58]} material={drevo} radius={0.003} />
          <Box pos={[0.30 + 0.14, H + 0.045, sez]} size={[0.022, 0.09, 0.58]} material={drevo} radius={0.003} />
        </group>
      )}
      <group>{led && null}</group>
    </group>
  )
}
