import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows, SoftShadows } from '@react-three/drei'
import { EffectComposer, N8AO, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import type { DeskConfig } from '@/model/types'
import { DeskTop } from './DeskTop'
import { Podnoz } from './Base'
import { Ulozne } from './Storage'
import { Doplnky } from './Extras'
import { Room } from './Room'
import { m } from './shapes'

// Plošné světlo (okno) potřebuje jednorázově nahrát LUT tabulky.
RectAreaLightUniformsLib.init()

export type Pohled = 'perspektiva' | 'celne' | 'bok' | 'pruchod' | 'shora'

/**
 * Kamery. Objektiv je delší (34°), takže stojí o kus dál než dřív — kratší
 * ohnisko deformovalo roh a nábytek vypadal jako z hračkářství.
 * Perspektiva stojí dál a výš, aby židle nezakrývala roh, a ze strany
 * průchodu, takže je vidět i hrana tlusté zdi. „Od gauče" se dívá přes lehátko,
 * „z průchodu" stojí u zdi vedle otvoru a kouká podél ramene A.
 */
const POHLEDY: Record<Pohled, [number, number, number]> = {
  perspektiva: [3.3, 2.55, 4.5],
  celne: [2.3, 1.45, 4.6],
  bok: [2.8, 2.0, 3.0],
  pruchod: [1.0, 1.8, 4.35],
  shora: [0.77, 5.3, 1.25],
}
const FOV = 34

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

/**
 * Post-processing: kontaktní zastínění (N8AO) je to, co dělí „slepené kostky"
 * od nábytku — ztmaví styk desky se zdí, nohy s podlahou, polštáře gauče.
 * K tomu lehký bloom jen na svítící obrazovku a jemná vinětace jako u objektivu.
 */
function Efekty() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO aoRadius={0.4} intensity={2.4} distanceFalloff={0.5} quality="medium" halfRes color="#1a0e06" />
      <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.35} intensity={0.35} mipmapBlur radius={0.6} />
      <Vignette eskil={false} offset={0.22} darkness={0.5} />
    </EffectComposer>
  )
}

export function Scene({
  config, pohled = 'perspektiva', ukazMistnost = true, lehatko, efekty = true, onReady,
}: {
  config: DeskConfig
  pohled?: Pohled
  ukazMistnost?: boolean
  /** Délka lehátka gauče u stolu (mm) — z nastavení místnosti. */
  lehatko?: number
  /** Post-processing (AO, bloom, vinětace). Malý náhled ho nepotřebuje. */
  efekty?: boolean
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
      dpr={[1, 1.5]}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      camera={{ position: POHLEDY[pohled], fov: FOV, near: 0.05, far: 60 }}
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.08; onReady?.() }}
    >
      <color attach="background" args={['#F4EDE3']} />
      <fog attach="fog" args={['#F0E7DA', 10, 24]} />
      <SoftShadows size={28} samples={10} focus={0.7} />

      {/* Denní světlo z okna vpravo, jako na fotce: ostré slunce dělá stíny,
          plošné světlo v okně dělá měkké přisvětlení a odlesky ve dřevě. */}
      <hemisphereLight args={['#FFF4E6', '#7A5B42', 0.28]} />
      <directionalLight
        position={[5.2, 4.4, 3.0]}
        intensity={1.25}
        color="#FFF1DC"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <rectAreaLight args={['#EAF1FB', 5.5, 2.4, 2.0]} position={[5.4, 1.7, 2.3]} rotation={[0, -Math.PI / 2, 0]} />
      <directionalLight position={[-2.5, 3.0, -1.5]} intensity={0.18} color="#DCE6F2" />
      <pointLight position={[1.2, 2.3, 1.4]} intensity={0.12} color="#FFE9CC" />

      <Suspense fallback={null}>
        {/* Prostředí se skládá ze světelných ploch přímo ve scéně — žádné HDRI
            ze sítě, takže appka funguje i offline a build je bez externích assetů. */}
        <Environment resolution={256} frames={1} environmentIntensity={0.44}>
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
        {efekty && <Efekty />}
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
