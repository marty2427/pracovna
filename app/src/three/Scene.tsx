import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows, SoftShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { DeskConfig } from '@/model/types'
import { DeskTop } from './DeskTop'
import { Podnoz } from './Base'
import { Ulozne } from './Storage'
import { Doplnky } from './Extras'
import { Room } from './Room'
import { m } from './shapes'

export type Pohled = 'perspektiva' | 'celne' | 'bok' | 'pruchod' | 'shora'

/**
 * Kamery. Perspektiva stojí dál a výš, aby židle nezakrývala roh, a ze strany
 * průchodu, takže je vidět i hrana tlusté zdi. „Od gauče" se dívá přes lehátko,
 * „z průchodu" stojí v otvoru ve zdi a kouká podél ramene A.
 */
const POHLEDY: Record<Pohled, [number, number, number]> = {
  perspektiva: [3.0, 2.35, 4.1],
  celne: [2.1, 1.35, 4.2],
  bok: [2.55, 1.85, 2.75],
  pruchod: [0.95, 1.65, 3.95],
  shora: [0.75, 4.8, 1.2],
}

/** Přepínání pohledů — v R3F se prop `camera` po mountu neaplikuje, musí se to udělat ručně. */
function Kamera({ pohled, cil }: { pohled: Pohled; cil: [number, number, number] }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3; update: () => void } | null

  useEffect(() => {
    const p = POHLEDY[pohled]
    camera.position.set(p[0], p[1], p[2])
    if (controls) {
      controls.target.set(cil[0], cil[1], cil[2])
      controls.update()
    } else {
      camera.lookAt(cil[0], cil[1], cil[2])
    }
  }, [pohled, camera, controls, cil[0], cil[1], cil[2]])

  return null
}

export function Stul({ config }: { config: DeskConfig }) {
  return (
    <group>
      <DeskTop config={config} />
      <Podnoz config={config} />
      <Ulozne config={config} />
      <Doplnky config={config} />
    </group>
  )
}

export function Scene({
  config, pohled = 'perspektiva', ukazMistnost = true, lehatko, onReady,
}: {
  config: DeskConfig
  pohled?: Pohled
  ukazMistnost?: boolean
  /** Délka lehátka gauče u stolu (mm) — z nastavení místnosti. */
  lehatko?: number
  onReady?: () => void
}) {
  const LA = m(config.rozmery.ramenoADelka)
  const LB = m(config.rozmery.ramenoBDelka)
  const stred: [number, number, number] = [
    Math.max(0.35, LB * 0.38),
    0.48,
    Math.max(0.45, LA * 0.40),
  ]

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      camera={{ position: POHLEDY[pohled], fov: 38, near: 0.05, far: 60 }}
      onCreated={({ gl }) => { gl.toneMappingExposure = 0.92; onReady?.() }}
    >
      <color attach="background" args={['#F4EDE3']} />
      <fog attach="fog" args={['#F0E7DA', 9, 22]} />
      <SoftShadows size={22} samples={8} focus={0.75} />

      {/* Denní světlo z okna vpravo, jako na fotce. */}
      <hemisphereLight args={['#FFF4E6', '#7A5B42', 0.32]} />
      <directionalLight
        position={[5.2, 4.4, 3.0]}
        intensity={1.45}
        color="#FFF1DC"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-2.5, 3.0, -1.5]} intensity={0.26} color="#DCE6F2" />
      <pointLight position={[1.2, 2.3, 1.4]} intensity={0.16} color="#FFE9CC" />

      <Suspense fallback={null}>
        {/* Prostředí se skládá ze světelných ploch přímo ve scéně — žádné HDRI
            ze sítě, takže appka funguje i offline a build je bez externích assetů. */}
        <Environment resolution={256} frames={1} environmentIntensity={0.34}>
          <color attach="background" args={['#8C7B68']} />
          {/* okno vpravo — velký chladnější zdroj */}
          <Lightformer form="rect" intensity={5.5} color="#EAF1FB" position={[6, 2.4, 2.2]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 4, 1]} />
          {/* teplý odraz od podlahy */}
          <Lightformer form="rect" intensity={1.5} color="#C98A4A" position={[1, -2, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 8, 1]} />
          {/* strop */}
          <Lightformer form="rect" intensity={2.2} color="#FFF6EA" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[9, 9, 1]} />
          {/* protisvětlo pro obrysy */}
          <Lightformer form="rect" intensity={1.1} color="#FFE8CC" position={[-4, 2, -3]} rotation={[0, Math.PI / 3, 0]} scale={[4, 3, 1]} />
        </Environment>
        <group position={[0, 0, 0]}>
          {ukazMistnost && <Room config={config} lehatko={lehatko} />}
          <Stul config={config} />
          {!ukazMistnost && (
            <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={7} blur={2.2} far={2.4} resolution={1024} color="#4A2E16" />
          )}
        </group>
      </Suspense>

      <Kamera pohled={pohled} cil={stred} />
      <OrbitControls
        target={stred}
        enablePan
        minDistance={0.9}
        maxDistance={11}
        maxPolarAngle={Math.PI / 2.06}
        makeDefault
      />
    </Canvas>
  )
}
