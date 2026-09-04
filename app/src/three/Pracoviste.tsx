import { useMemo } from 'react'
import * as THREE from 'three'
import type { DeskConfig } from '@/model/types'
import { MONITOR } from '@/model/space'
import { pracoviste } from '@/model/constraints'
import { m, roundedShape } from './shapes'
import { Box, Bar } from './Bar'
import { useMat, useKov, usePovrch } from './useMaterials'

/**
 * Pracoviště: monitor MSI Optix AG321CQR (31,5", 1500R), klávesnice, myš,
 * podložka, reprobedny, nástavec a kancelářská židle. Všechno sleduje
 * umístění monitoru (roh / rameno A / rameno B), které vrací pracoviste().
 */

/** Pás zakřiveného panelu: oblouk poloměru R (střed zakřivení před obrazovkou), tloušťka t, výška h. */
function arcBand(R: number, t: number, theta: number, h: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape()
  const a0 = Math.PI / 2 - theta / 2, a1 = Math.PI / 2 + theta / 2
  s.absarc(0, -R, R + t, a0, a1, false)
  s.absarc(0, -R, R, a1, a0, true)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 28 })
  g.rotateX(-Math.PI / 2)
  g.computeVertexNormals()
  return g
}

/** Zapnutá obrazovka — tmavá plocha s měkkým přechodem, ať to není černá díra. */
function obrazovkaTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 144
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 256, 144)
  grad.addColorStop(0, '#1B2A3A'); grad.addColorStop(0.5, '#10202E'); grad.addColorStop(1, '#0B1219')
  g.fillStyle = grad; g.fillRect(0, 0, 256, 144)
  const r = g.createRadialGradient(150, 60, 4, 150, 60, 150)
  r.addColorStop(0, 'rgba(120,170,210,0.35)'); r.addColorStop(1, 'rgba(120,170,210,0)')
  g.fillStyle = r; g.fillRect(0, 0, 256, 144)
  // lišta dole
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, 134, 256, 10)
  for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(92 + i * 10, 137, 5, 5) }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Klávesnice z výšky: klávesy se kreslí do textury, 2 px = 1 mm. */
function klavesniceTexture(): THREE.CanvasTexture {
  const W = 440, H = 135, S = 2
  const c = document.createElement('canvas')
  c.width = W * S; c.height = H * S
  const g = c.getContext('2d')!
  g.scale(S, S)
  g.fillStyle = '#1B1C1E'; g.fillRect(0, 0, W, H)
  const key = (x: number, y: number, w: number, h: number) => {
    g.fillStyle = '#2E3034'
    g.beginPath(); (g as any).roundRect(x, y, w, h, 2); g.fill()
    g.fillStyle = '#3B3E43'
    g.beginPath(); (g as any).roundRect(x + 1.5, y + 1, w - 3, h - 4, 1.5); g.fill()
  }
  const p = 19, k = 17
  // F-řada
  for (let i = 0; i < 15; i++) key(4 + i * p, 4, k, 11)
  // alfanumerický blok
  const rows: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
  ]
  rows.forEach((r, ri) => {
    let x = 4
    const y = 19 + ri * p
    r.forEach((w) => { key(x, y, w * p - 2, k); x += w * p })
  })
  // navigační blok
  for (let i = 0; i < 3; i++) { key(298 + i * p, 4, k, 11); key(298 + i * p, 19, k, k); key(298 + i * p, 38, k, k) }
  key(298 + p, 76, k, k); for (let i = 0; i < 3; i++) key(298 + i * p, 95, k, k)
  // numerický blok
  for (let r = 0; r < 5; r++) for (let i = 0; i < 4; i++) {
    if (r >= 1 && i === 3 && r % 2 === 0) continue
    key(363 + i * p, 19 + r * p, k, (r >= 1 && i === 3) ? k + p : k)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function Monitor({ x, y, z, rot, stojanMat, panelMat, obrazovka }: {
  x: number; y: number; z: number; rot: number
  stojanMat: THREE.Material; panelMat: THREE.Material; obrazovka: THREE.Material
}) {
  const R = m(MONITOR.zakriveni)
  const theta = 2 * Math.asin(m(MONITOR.sirka) / 2 / R)
  const thetaPanel = 2 * Math.asin(m(MONITOR.panelSirka) / 2 / R)
  const hHlava = m(MONITOR.vyskaHlavy)
  const hPanel = m(MONITOR.panelVyska)
  const yDole = m(MONITOR.stojan.vyskaSpodniHrany)
  const zadni = -m(MONITOR.obrazovkaOdZadu)
  const hl = m(MONITOR.stojan.hloubka)
  const sir = m(MONITOR.stojan.sirka)

  const skorepina = useMemo(() => arcBand(R, 0.028, theta, hHlava), [R, theta, hHlava])
  const panel = useMemo(
    () => new THREE.CylinderGeometry(R - 0.002, R - 0.002, hPanel, 40, 1, true, Math.PI - thetaPanel / 2, thetaPanel),
    [R, hPanel, thetaPanel],
  )

  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {/* podstavec: plochá základna, sedí zadní hranou u zdi */}
      <Box pos={[0, 0.008, zadni + hl / 2]} size={[sir, 0.016, hl]} material={stojanMat} radius={0.03} />
      <mesh position={[0, 0.03, zadni + 0.07]} material={stojanMat} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 0.03, 24]} />
      </mesh>
      {/* sloupek a rameno k hlavě */}
      <Box pos={[0, 0.04 + 0.20, zadni + 0.065]} size={[0.065, 0.40, 0.045]} material={stojanMat} radius={0.008} />
      <Box pos={[0, yDole + hHlava * 0.5, (zadni + 0.065 - 0.03) / 2]} size={[0.06, 0.05, Math.abs(zadni + 0.065) - 0.03]} material={stojanMat} radius={0.006} />
      {/* skořepina hlavy — zakřivená 1500R */}
      <mesh geometry={skorepina} position={[0, yDole, 0]} material={panelMat} castShadow />
      {/* obrazovka — o 2 mm před skořepinou, stejný střed zakřivení */}
      <mesh geometry={panel} position={[0, yDole + hHlava / 2, R - 0.002]} material={obrazovka} />
    </group>
  )
}

function Repro({ x, z, y, rot, korpus, kuzel, cerna }: {
  x: number; z: number; y: number; rot: number
  korpus: THREE.Material; kuzel: THREE.Material; cerna: THREE.Material
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <Box pos={[0, 0.12, 0]} size={[0.15, 0.24, 0.20]} material={korpus} radius={0.004} />
      <Box pos={[0, 0.12, 0.101]} size={[0.14, 0.23, 0.004]} material={cerna} radius={0.003} />
      <mesh position={[0, 0.085, 0.104]} rotation={[Math.PI / 2, 0, 0]} material={kuzel} castShadow>
        <cylinderGeometry args={[0.052, 0.045, 0.008, 28]} />
      </mesh>
      <mesh position={[0, 0.085, 0.108]} rotation={[Math.PI / 2, 0, 0]} material={cerna}>
        <cylinderGeometry args={[0.018, 0.018, 0.006, 20]} />
      </mesh>
      <mesh position={[0, 0.185, 0.104]} rotation={[Math.PI / 2, 0, 0]} material={kuzel}>
        <cylinderGeometry args={[0.02, 0.018, 0.006, 20]} />
      </mesh>
    </group>
  )
}

/** Kancelářská židle s opěrkou hlavy — pětiramenný kříž, plynový píst, bočnice sedáku, loketní opěrky. */
export function Zidle({ x, z, rot, latka, plast, kov, akcent }: {
  x: number; z: number; rot: number
  latka: THREE.Material; plast: THREE.Material; kov: THREE.Material; akcent: THREE.Material
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* kříž a kolečka */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 5
        return (
          <group key={i} rotation={[0, a, 0]}>
            <Bar a={[0, 0.075, 0]} b={[0, 0.045, 0.30]} w={0.05} d={0.032} material={plast} radius={0.006} />
            <group position={[0, 0.032, 0.30]}>
              <Box pos={[0, 0.01, 0]} size={[0.02, 0.03, 0.03]} material={plast} radius={0.004} />
              <mesh rotation={[0, 0, Math.PI / 2]} material={akcent} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.024, 16]} />
              </mesh>
            </group>
          </group>
        )
      })}
      <mesh position={[0, 0.07, 0]} material={plast} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.06, 20]} />
      </mesh>
      {/* plynový píst */}
      <mesh position={[0, 0.21, 0]} material={kov} castShadow>
        <cylinderGeometry args={[0.024, 0.026, 0.24, 16]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} material={plast} castShadow>
        <cylinderGeometry args={[0.036, 0.04, 0.14, 16]} />
      </mesh>
      {/* mechanika a sedák s bočními polstry */}
      <Box pos={[0, 0.415, 0]} size={[0.30, 0.05, 0.30]} material={plast} radius={0.006} />
      <Box pos={[0, 0.48, 0.01]} size={[0.50, 0.095, 0.50]} material={latka} radius={0.03} />
      <Box pos={[-0.215, 0.545, -0.03]} size={[0.075, 0.05, 0.40]} material={latka} radius={0.02} />
      <Box pos={[0.215, 0.545, -0.03]} size={[0.075, 0.05, 0.40]} material={latka} radius={0.02} />
      {/* opěradlo — nakloněné dozadu, s bočními křídly, bederní polštář a opěrka hlavy */}
      <group position={[0, 0.50, -0.235]} rotation={[-0.14, 0, 0]}>
        <Box pos={[0, 0.36, 0]} size={[0.50, 0.66, 0.085]} material={latka} radius={0.035} />
        <Box pos={[0, 0.36, -0.02]} size={[0.44, 0.60, 0.06]} material={akcent} radius={0.02} />
        <group position={[-0.235, 0.34, 0.04]} rotation={[0, 0.32, 0]}>
          <Box pos={[0, 0, 0]} size={[0.065, 0.56, 0.12]} material={latka} radius={0.02} />
        </group>
        <group position={[0.235, 0.34, 0.04]} rotation={[0, -0.32, 0]}>
          <Box pos={[0, 0, 0]} size={[0.065, 0.56, 0.12]} material={latka} radius={0.02} />
        </group>
        <Box pos={[0, 0.20, 0.06]} size={[0.30, 0.13, 0.055]} material={akcent} radius={0.02} />
        <Box pos={[0, 0.72, -0.02]} size={[0.06, 0.14, 0.03]} material={plast} radius={0.004} />
        <Box pos={[0, 0.80, 0.015]} size={[0.30, 0.15, 0.10]} material={latka} radius={0.035} />
      </group>
      {/* loketní opěrky */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box pos={[s * 0.27, 0.62, -0.03]} size={[0.045, 0.22, 0.05]} material={plast} radius={0.006} />
          <Box pos={[s * 0.27, 0.745, 0.0]} size={[0.085, 0.028, 0.27]} material={akcent} radius={0.01} />
        </group>
      ))}
    </group>
  )
}

export function Pracoviste({ config, ukazMereni = true }: { config: DeskConfig; ukazMereni?: boolean }) {
  const p = pracoviste(config)
  const H = m(config.rozmery.vyska)
  const stojanMat = useMat('#232527', 0.55)
  const panelMat = useMat('#1A1B1D', 0.62)
  const obrazovkaTex = useMemo(() => obrazovkaTexture(), [])
  const obrazovka = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: obrazovkaTex, emissive: new THREE.Color('#5E86A8'), emissiveMap: obrazovkaTex, emissiveIntensity: 0.7, roughness: 0.18, metalness: 0.05, side: THREE.DoubleSide, envMapIntensity: 1.2 }),
    [obrazovkaTex],
  )
  const klavesTex = useMemo(() => klavesniceTexture(), [])
  const klavesy = useMemo(() => new THREE.MeshPhysicalMaterial({ map: klavesTex, roughness: 0.75 }), [klavesTex])
  const cerna = useMat('#1E1F22', 0.85)
  const plast = useMat('#2A2C2F', 0.6)
  const akcent = useMat('#3C3F45', 0.7)
  const podlozka = useMat('#26282B', 0.95)
  const latka = useMat('#1B1C1F', 0.9)
  const kov = useKov('#9EA3A8', true)
  const repro = usePovrch('orech-masiv', { meritko: [0.4, 0.3] })
  const kuzel = useMat('#141516', 0.8)
  const drevo = usePovrch(config.deska.materialId, { meritko: [0.8, 0.4] })
  const mereni = useMemo(() => new THREE.MeshBasicMaterial({ color: '#C4661F', transparent: true, opacity: 0.75 }), [])

  const sx = p.smer.x, sz = p.smer.z
  const lx = sz, lz = -sx   // do strany (vpravo od sedícího při pohledu na monitor)
  const bod = (podel: number, stranou: number): [number, number] =>
    [m(p.pocatek.x) + sx * podel + lx * stranou, m(p.pocatek.z) + sz * podel + lz * stranou]

  const hrana = m(p.hranaOdZdi)
  const nastavec = config.doplnky.nastavecMonitor
  const vyskaNastavce = nastavec ? 0.10 : 0
  const yMon = H + vyskaNastavce
  const [mx, mz] = [m(p.monitor.x), m(p.monitor.z)]

  // klávesnice 20 cm za hranou, myš vpravo od ní, podložka pod obojím.
  // Na krátkém rameni B se podložka (80 cm) přitáhne tak, aby nepřečnívala za konec desky.
  const LBmm = m(config.rozmery.ramenoBDelka)
  const stranouPodlozka = p.umisteni === 'ramenoB' ? Math.min(0.10, LBmm - 0.42 - m(p.pocatek.x)) : 0.10
  const [kx, kz] = bod(hrana - 0.20, 0)
  const [myx, myz] = bod(hrana - 0.19, Math.min(0.34, stranouPodlozka + 0.28))
  const [px, pz] = bod(hrana - 0.20, stranouPodlozka)

  // repro: u zdi vedle monitoru; v rohu každá u své stěny, natočené do úhlopříčky.
  // Na rameni se repro drží na desce — když se vedle monitoru nevejde
  // (krátké rameno B), prostě tam není, místo aby visela ve vzduchu.
  const LA = m(config.rozmery.ramenoADelka)
  const LB = m(config.rozmery.ramenoBDelka)
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const reproBody: Array<[number, number, number]> = (() => {
    if (p.umisteni === 'roh') return [[0.14, mz + 0.42, Math.PI / 4], [mx + 0.42, 0.14, Math.PI / 4]]
    const out: Array<[number, number, number]> = []
    for (const s of [-1, 1]) {
      if (p.umisteni === 'ramenoB') {
        const x = clamp(mx + s * 0.55, 0.10, LB - 0.10)
        if (Math.abs(x - mx) >= 0.45) out.push([x, 0.17, 0])
      } else {
        const z = clamp(mz + s * 0.55, 0.10, LA - 0.10)
        if (Math.abs(z - mz) >= 0.45) out.push([0.17, z, Math.PI / 2])
      }
    }
    return out
  })()

  const ociY = 1.18
  const obrazovkaY = yMon + m(MONITOR.stojan.vyskaSpodniHrany) + m(MONITOR.vyskaHlavy) / 2

  // nástavec v rohu je pětiúhelník do rohu, jinak obyčejná deska na dvou lištách
  const rohovyNastavec = useMemo(() => {
    if (!nastavec || p.umisteni !== 'roh') return null
    const a = 0.03, b = 0.78, c = 0.30
    const s = roundedShape([[a, -a], [b, -a], [b, -c], [c, -b], [a, -b]], [0, 0.01, 0.02, 0.02, 0.01])
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [nastavec, p.umisteni])

  return (
    <group>
      {/* nástavec pod monitor */}
      {nastavec && (rohovyNastavec ? (
        <group>
          <mesh geometry={rohovyNastavec} position={[0, H + 0.08, 0]} material={drevo} castShadow receiveShadow />
          <Box pos={[0.06, H + 0.04, 0.42]} size={[0.02, 0.08, 0.70]} material={drevo} radius={0.002} />
          <Box pos={[0.42, H + 0.04, 0.06]} size={[0.70, 0.08, 0.02]} material={drevo} radius={0.002} />
        </group>
      ) : (
        <group position={[mx, H, mz]} rotation={[0, p.monitor.rot, 0]}>
          <Box pos={[0, 0.09, -0.05]} size={[0.66, 0.02, 0.30]} material={drevo} radius={0.003} />
          <Box pos={[-0.31, 0.04, -0.05]} size={[0.02, 0.08, 0.28]} material={drevo} radius={0.002} />
          <Box pos={[0.31, 0.04, -0.05]} size={[0.02, 0.08, 0.28]} material={drevo} radius={0.002} />
        </group>
      ))}

      <Monitor x={mx} y={yMon} z={mz} rot={p.monitor.rot} stojanMat={stojanMat} panelMat={panelMat} obrazovka={obrazovka} />

      {/* podložka, klávesnice, myš */}
      <group position={[px, H, pz]} rotation={[0, p.monitor.rot, 0]}>
        <Box pos={[0, 0.0016, 0]} size={[0.80, 0.003, 0.32]} material={podlozka} radius={0.008} />
      </group>
      <group position={[kx, H + 0.003, kz]} rotation={[0, p.monitor.rot, 0]}>
        <Box pos={[0, 0.013, 0]} size={[0.44, 0.026, 0.135]} material={cerna} radius={0.004} />
        <mesh position={[0, 0.0265, 0]} rotation={[-Math.PI / 2, 0, 0]} material={klavesy}>
          <planeGeometry args={[0.432, 0.128]} />
        </mesh>
      </group>
      <group position={[myx, H + 0.003, myz]} rotation={[0, p.monitor.rot, 0]}>
        <mesh position={[0, 0.014, 0]} scale={[0.032, 0.021, 0.06]} material={plast} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
        <mesh position={[0, 0.033, 0.012]} rotation={[0, 0, Math.PI / 2]} material={akcent}>
          <cylinderGeometry args={[0.006, 0.006, 0.006, 12]} />
        </mesh>
      </group>

      {/* reprobedny */}
      {reproBody.map(([rx, rz, rr], i) => (
        <Repro key={i} x={rx} z={rz} y={H} rot={rr} korpus={repro} kuzel={kuzel} cerna={cerna} />
      ))}

      {/* židle čelem k monitoru */}
      <Zidle x={m(p.zidle.x)} z={m(p.zidle.z)} rot={p.monitor.rot + Math.PI} latka={latka} plast={plast} kov={kov} akcent={akcent} />

      {/* vzdálenost očí od obrazovky — tenká oranžová spojnice v úrovni očí */}
      {ukazMereni && (
        <group>
          <Bar a={[m(p.oci.x), ociY, m(p.oci.z)]} b={[mx + sx * 0.004, obrazovkaY, mz + sz * 0.004]} w={0.006} d={0.006} material={mereni} radius={0.002} />
          <mesh position={[m(p.oci.x), ociY, m(p.oci.z)]} material={mereni}>
            <sphereGeometry args={[0.022, 16, 12]} />
          </mesh>
        </group>
      )}
    </group>
  )
}
