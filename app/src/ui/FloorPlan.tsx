import { useMemo } from 'react'
import type { DeskConfig } from '@/model/types'
import { SPACE, MAX_RAMENO_A } from '@/model/space'
import { kontroly, poziceSezeni, type Zavaznost } from '@/model/constraints'
import { podpory } from '@/model/podpory'

const BARVA: Record<Zavaznost, string> = { ok: '#4C7F45', pozor: '#C8871F', chyba: '#B33E28' }

/**
 * Půdorys rohu s obrysem dostupného prostoru a kótovanými rezervami.
 * Kreslí se přímo v milimetrech (viewBox je v mm), takže se nic nerozjede,
 * když se změní velikost panelu. Tloušťky čar a písmo se přepočítávají zpět na pixely.
 */
export function FloorPlan({ config, sirka = 400 }: { config: DeskConfig; sirka?: number }) {
  const r = config.rozmery
  const jeL = config.tvar === 'L' && r.ramenoBDelka > 0

  // kreslený výřez v mm
  const X0 = -820, X1 = 3520
  const Z0 = -720, Z1 = 3120
  const W = X1 - X0, H = Z1 - Z0
  const vyska = Math.round((sirka * H) / W)
  /** převod: kolik mm odpovídá jednomu pixelu na obrazovce */
  const px = (n: number) => (n * W) / sirka

  const k = useMemo(() => kontroly(config), [config])
  const stav = (id: string) => k.find((x) => x.id === id)?.stav ?? 'ok'

  const mezera = SPACE.zadniStenaKeGauci - r.ramenoBDelka
  const odHrany = SPACE.levaStenaRun - r.ramenoADelka
  const zonaZidle = SPACE.zadniStenaKeGauci - r.ramenoAHloubka
  const sez = poziceSezeni(config)
  const podp = podpory(config)

  const body: Array<[number, number]> = jeL
    ? [[0, 0], [r.ramenoBDelka, 0], [r.ramenoBDelka, r.ramenoBHloubka],
       [r.ramenoAHloubka, r.ramenoBHloubka], [r.ramenoAHloubka, r.ramenoADelka], [0, r.ramenoADelka]]
    : [[0, 0], [r.ramenoAHloubka, 0], [r.ramenoAHloubka, r.ramenoADelka], [0, r.ramenoADelka]]

  const Kota = ({ x1, z1, x2, z2, popis, barva, odsad, svisle = false }: {
    x1: number; z1: number; x2: number; z2: number
    popis: string; barva: string; odsad: number; svisle?: boolean
  }) => {
    const ax = svisle ? x1 + odsad : x1, az = svisle ? z1 : z1 + odsad
    const bx = svisle ? x2 + odsad : x2, bz = svisle ? z2 : z2 + odsad
    const mx = (ax + bx) / 2, mz = (az + bz) / 2
    const sirkaTextu = px(popis.length * 5.6 + 12)
    const vyskaTextu = px(15)
    return (
      <g>
        <line x1={x1} y1={z1} x2={ax} y2={az} stroke={barva} strokeWidth={px(0.6)} strokeDasharray={`${px(3)} ${px(3)}`} opacity={0.6} />
        <line x1={x2} y1={z2} x2={bx} y2={bz} stroke={barva} strokeWidth={px(0.6)} strokeDasharray={`${px(3)} ${px(3)}`} opacity={0.6} />
        <line x1={ax} y1={az} x2={bx} y2={bz} stroke={barva} strokeWidth={px(1.1)} />
        <circle cx={ax} cy={az} r={px(1.7)} fill={barva} />
        <circle cx={bx} cy={bz} r={px(1.7)} fill={barva} />
        <rect x={mx - sirkaTextu / 2} y={mz - vyskaTextu / 2} width={sirkaTextu} height={vyskaTextu}
              rx={vyskaTextu / 2} fill="#FFFDF9" stroke={barva} strokeWidth={px(0.7)} />
        <text x={mx} y={mz + px(3.2)} textAnchor="middle" fontSize={px(9)} fontWeight={600} fill={barva}>{popis}</text>
      </g>
    )
  }

  return (
    <svg width={sirka} height={vyska} viewBox={`${X0} ${Z0} ${W} ${H}`} className="pudorys">
      <defs>
        <pattern id="srafy" width={px(6)} height={px(6)} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2={px(6)} stroke="#CFBBA4" strokeWidth={px(2.2)} />
        </pattern>
        <pattern id="volno" width={px(5)} height={px(5)} patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2={px(5)} stroke="#B7D2B5" strokeWidth={px(1.4)} />
        </pattern>
      </defs>

      <rect x={X0} y={Z0} width={W} height={H} fill="#FBF5EC" />

      {/* stěny */}
      <rect x={-150} y={-150} width={150} height={Z1 + 150} fill="url(#srafy)" stroke="#A08B77" strokeWidth={px(0.8)} />
      <rect x={-150} y={-150} width={X1 + 150} height={150} fill="url(#srafy)" stroke="#A08B77" strokeWidth={px(0.8)} />

      {/* dostupný roh */}
      <rect x={0} y={0} width={SPACE.zadniStenaKeGauci} height={SPACE.levaStenaRun}
            fill="none" stroke="#C4661F" strokeWidth={px(1)} strokeDasharray={`${px(6)} ${px(4)}`} opacity={0.7} />

      {/* zóna pro odsunutí židle */}
      <rect x={r.ramenoAHloubka} y={jeL ? r.ramenoBHloubka : 0}
            width={Math.max(0, zonaZidle)} height={Math.max(0, r.ramenoADelka - (jeL ? r.ramenoBHloubka : 0))}
            fill="url(#volno)" opacity={0.55} />

      {/* gauč */}
      <rect x={SPACE.zadniStenaKeGauci} y={0} width={1750} height={SPACE.gauc.hloubka}
            rx={60} fill="#0F5A78" opacity={0.88} />
      <text x={SPACE.zadniStenaKeGauci + 500} y={SPACE.gauc.hloubka / 2 + px(4)} fontSize={px(11)} fill="#fff" fontWeight={700}>GAUČ</text>

      {/* hrana, od které držíme odstup */}
      <line x1={-150} y1={SPACE.levaStenaRun} x2={900} y2={SPACE.levaStenaRun} stroke="#A08B77" strokeWidth={px(2)} />
      <text x={330} y={SPACE.levaStenaRun + px(13)} fontSize={px(8.5)} fill="#8A7563">hrana</text>

      {/* deska */}
      <polygon points={body.map(([x, z]) => `${x},${z}`).join(' ')} fill="#D9AE7E" stroke="#8A5B2E" strokeWidth={px(1.4)} />
      {config.doplnky.tiskarnaVRohu && jeL && (
        <g>
          <rect x={60} y={60} width={450} height={400} fill="#3A3A3C" opacity={0.5} rx={20} />
          <text x={285} y={280} textAnchor="middle" fontSize={px(8)} fill="#fff">tiskárna</text>
        </g>
      )}
      {/* podpory */}
      {podp.map((q, i) => (
        <rect key={i} x={q.x - 26} y={q.z - 26} width={52} height={52} fill="#FFFDF9" stroke="#5A4433" strokeWidth={px(1)} />
      ))}

      {/* židle */}
      <circle cx={r.ramenoAHloubka + 340} cy={sez} r={340} fill="#2C2D2F" opacity={0.14} />
      <circle cx={r.ramenoAHloubka + 340} cy={sez} r={240} fill="#2C2D2F" opacity={0.5} />
      <text x={r.ramenoAHloubka + 340} y={sez + px(3.5)} textAnchor="middle" fontSize={px(8.5)} fill="#fff">židle</text>

      {/* KÓTY */}
      <Kota x1={0} z1={0} x2={0} z2={r.ramenoADelka} svisle odsad={-420}
            popis={`rameno A ${Math.round(r.ramenoADelka / 10)} cm`} barva="#7A6552" />
      <Kota x1={0} z1={r.ramenoADelka} x2={0} z2={SPACE.levaStenaRun} svisle odsad={-175}
            popis={`${Math.round(odHrany / 10)} cm`} barva={BARVA[stav('rameno-a')]} />
      {jeL && (
        <>
          <Kota x1={0} z1={0} x2={r.ramenoBDelka} z2={0} odsad={-215}
                popis={`rameno B ${Math.round(r.ramenoBDelka / 10)} cm`} barva="#7A6552" />
          <Kota x1={r.ramenoBDelka} z1={0} x2={SPACE.zadniStenaKeGauci} z2={0} odsad={-420}
                popis={`${Math.round(mezera / 10)} cm ke gauči`} barva={BARVA[stav('mezera-gauc')]} />
        </>
      )}
      <Kota x1={r.ramenoAHloubka} z1={r.ramenoADelka} x2={SPACE.zadniStenaKeGauci} z2={r.ramenoADelka} odsad={290}
            popis={`${Math.round(zonaZidle / 10)} cm na židli`} barva={BARVA[stav('zona-zidle')]} />
      <Kota x1={0} z1={r.ramenoADelka} x2={r.ramenoAHloubka} z2={r.ramenoADelka} odsad={120}
            popis={`${Math.round(r.ramenoAHloubka / 10)} cm`} barva={BARVA[stav('vycnivani')]} />

      <text x={X0 + 40} y={Z0 + px(11)} fontSize={px(8.5)} fill="#8A7563">
        dostupný roh {SPACE.zadniStenaKeGauci / 10} × {SPACE.levaStenaRun / 10} cm · rameno A max {MAX_RAMENO_A / 10} cm
      </text>
      <text x={X0 + 40} y={Z1 - px(4)} fontSize={px(8)} fill="#8A7563">
        čtverečky = podpory · šrafovaná zóna = volno pro židli
      </text>
    </svg>
  )
}
