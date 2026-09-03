import { useMemo } from 'react'
import type { DeskConfig } from '@/model/types'
import { SPACE, MAX_RAMENO_A } from '@/model/space'
import { kontroly, poziceSezeni, type Zavaznost } from '@/model/constraints'

const BARVA: Record<Zavaznost, string> = { ok: '#4E8C4A', pozor: '#D8912C', chyba: '#C0442E' }

/**
 * Půdorys rohu s obrysem dostupného prostoru a kótovanými rezervami.
 * Osy podle model/space.ts: X doprava podél zadní stěny, Z dolů podél levé stěny.
 */
export function FloorPlan({ config, sirka = 460 }: { config: DeskConfig; sirka?: number }) {
  const r = config.rozmery
  const jeL = config.tvar === 'L' && r.ramenoBDelka > 0

  // Kreslený výřez místnosti (mm)
  const VIEW_X = 3200
  const VIEW_Z = 2900
  const PAD = 190
  const scale = (sirka - 2 * PAD) / VIEW_X
  const vyska = VIEW_Z * scale + 2 * PAD
  const X = (mm: number) => PAD + mm * scale
  const Z = (mm: number) => PAD + mm * scale

  const k = useMemo(() => kontroly(config), [config])
  const stav = (id: string) => k.find((x) => x.id === id)?.stav ?? 'ok'

  const mezera = SPACE.zadniStenaKeGauci - r.ramenoBDelka
  const odHrany = SPACE.levaStenaRun - r.ramenoADelka
  const zonaZidle = SPACE.zadniStenaKeGauci - r.ramenoAHloubka
  const sez = poziceSezeni(config)

  // Obrys desky
  const body = jeL
    ? [[0, 0], [r.ramenoBDelka, 0], [r.ramenoBDelka, r.ramenoBHloubka],
       [r.ramenoAHloubka, r.ramenoBHloubka], [r.ramenoAHloubka, r.ramenoADelka], [0, r.ramenoADelka]]
    : [[0, 0], [r.ramenoAHloubka, 0], [r.ramenoAHloubka, r.ramenoADelka], [0, r.ramenoADelka]]
  const poly = body.map(([x, z]) => `${X(x)},${Z(z)}`).join(' ')

  const Kota = ({ x1, z1, x2, z2, popis, barva, odsad = 0, svisle = false }: {
    x1: number; z1: number; x2: number; z2: number
    popis: string; barva: string; odsad?: number; svisle?: boolean
  }) => {
    const ax = X(x1) + (svisle ? odsad : 0)
    const az = Z(z1) + (svisle ? 0 : odsad)
    const bx = X(x2) + (svisle ? odsad : 0)
    const bz = Z(z2) + (svisle ? 0 : odsad)
    const mx = (ax + bx) / 2
    const mz = (az + bz) / 2
    return (
      <g>
        <line x1={ax} y1={az} x2={bx} y2={bz} stroke={barva} strokeWidth={1.3} markerStart="url(#sipka)" markerEnd="url(#sipka)" />
        <line x1={X(x1)} y1={Z(z1)} x2={ax} y2={az} stroke={barva} strokeWidth={0.6} strokeDasharray="3 3" opacity={0.65} />
        <line x1={X(x2)} y1={Z(z2)} x2={bx} y2={bz} stroke={barva} strokeWidth={0.6} strokeDasharray="3 3" opacity={0.65} />
        <rect x={mx - popis.length * 3.3 - 5} y={mz - 9} width={popis.length * 6.6 + 10} height={18} rx={9} fill="#FFFDF9" stroke={barva} strokeWidth={0.9} />
        <text x={mx} y={mz + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={barva}>{popis}</text>
      </g>
    )
  }

  return (
    <svg width={sirka} height={vyska} viewBox={`0 0 ${sirka} ${vyska}`} className="pudorys">
      <defs>
        <marker id="sipka" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0.5,3.5 L6,1 L4.6,3.5 L6,6 Z" fill="currentColor" />
        </marker>
        <pattern id="srafy" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#C9B7A9" strokeWidth="2.4" />
        </pattern>
        <pattern id="volno" width="6" height="6" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#B7D2B5" strokeWidth="1.6" />
        </pattern>
      </defs>

      {/* podlaha */}
      <rect x={X(-260)} y={Z(-260)} width={(VIEW_X + 260) * scale} height={(VIEW_Z + 260) * scale} fill="#F7F0E6" />

      {/* stěny */}
      <rect x={X(-160)} y={Z(-160)} width={160 * scale} height={(VIEW_Z + 160) * scale} fill="url(#srafy)" stroke="#A08B77" strokeWidth={1} />
      <rect x={X(-160)} y={Z(-160)} width={(VIEW_X + 160) * scale} height={160 * scale} fill="url(#srafy)" stroke="#A08B77" strokeWidth={1} />

      {/* dostupná zóna 236 x 160 */}
      <rect x={X(0)} y={Z(0)} width={SPACE.zadniStenaKeGauci * scale} height={SPACE.levaStenaRun * scale}
            fill="none" stroke="#C86A24" strokeWidth={1.2} strokeDasharray="7 4" opacity={0.75} />

      {/* zóna pro odsunutí židle */}
      <rect x={X(r.ramenoAHloubka)} y={Z(jeL ? r.ramenoBHloubka : 0)}
            width={Math.max(0, zonaZidle) * scale}
            height={Math.max(0, r.ramenoADelka - (jeL ? r.ramenoBHloubka : 0)) * scale}
            fill="url(#volno)" opacity={0.5} />

      {/* gauč */}
      <rect x={X(SPACE.zadniStenaKeGauci)} y={Z(0)} width={1500 * scale} height={SPACE.gauc.hloubka * scale}
            rx={10 * scale} fill="#0F5A78" opacity={0.85} />
      <text x={X(SPACE.zadniStenaKeGauci + 420)} y={Z(SPACE.gauc.hloubka / 2) + 4} fontSize={12} fill="#fff" fontWeight={600}>GAUČ</text>

      {/* hrana, od které držíme 25 cm */}
      <line x1={X(-120)} y1={Z(SPACE.levaStenaRun)} x2={X(760)} y2={Z(SPACE.levaStenaRun)} stroke="#A08B77" strokeWidth={2} />
      <text x={X(300)} y={Z(SPACE.levaStenaRun) + 16} fontSize={10} fill="#8A7563">hrana</text>

      {/* deska */}
      <polygon points={poly} fill="#C69160" stroke="#8A5B2E" strokeWidth={1.6} />
      {config.doplnky.tiskarnaVRohu && jeL && (
        <rect x={X(60)} y={Z(60)} width={450 * scale} height={400 * scale} fill="#3A3A3C" opacity={0.55} rx={3} />
      )}

      {/* židle */}
      <g>
        <circle cx={X(r.ramenoAHloubka + 330)} cy={Z(sez)} r={330 * scale} fill="#2C2D2F" opacity={0.16} />
        <circle cx={X(r.ramenoAHloubka + 330)} cy={Z(sez)} r={235 * scale} fill="#2C2D2F" opacity={0.55} />
        <text x={X(r.ramenoAHloubka + 330)} y={Z(sez) + 4} textAnchor="middle" fontSize={10} fill="#fff">židle</text>
      </g>

      {/* KÓTY */}
      <g color={BARVA[stav('rameno-a')]}>
        <Kota x1={0} z1={r.ramenoADelka} x2={0} z2={SPACE.levaStenaRun} svisle odsad={-52}
              popis={`${Math.round(odHrany / 10)} cm`} barva={BARVA[stav('rameno-a')]} />
      </g>
      <g color="#8A7563">
        <Kota x1={0} z1={0} x2={0} z2={r.ramenoADelka} svisle odsad={-118}
              popis={`rameno A ${Math.round(r.ramenoADelka / 10)} cm`} barva="#8A7563" />
      </g>
      {jeL && (
        <>
          <g color="#8A7563">
            <Kota x1={0} z1={0} x2={r.ramenoBDelka} z2={0} odsad={-56}
                  popis={`rameno B ${Math.round(r.ramenoBDelka / 10)} cm`} barva="#8A7563" />
          </g>
          <g color={BARVA[stav('mezera-gauc')]}>
            <Kota x1={r.ramenoBDelka} z1={0} x2={SPACE.zadniStenaKeGauci} z2={0} odsad={-118}
                  popis={`${Math.round(mezera / 10)} cm ke gauči`} barva={BARVA[stav('mezera-gauc')]} />
          </g>
        </>
      )}
      <g color={BARVA[stav('zona-zidle')]}>
        <Kota x1={r.ramenoAHloubka} z1={r.ramenoADelka} x2={SPACE.zadniStenaKeGauci} z2={r.ramenoADelka} odsad={64}
              popis={`${Math.round(zonaZidle / 10)} cm na židli`} barva={BARVA[stav('zona-zidle')]} />
      </g>
      <g color={BARVA[stav('vycnivani')]}>
        <Kota x1={0} z1={r.ramenoADelka} x2={r.ramenoAHloubka} z2={r.ramenoADelka} odsad={26}
              popis={`${Math.round(r.ramenoAHloubka / 10)} cm`} barva={BARVA[stav('vycnivani')]} />
      </g>

      <text x={X(0)} y={Z(-190)} fontSize={10} fill="#8A7563">
        dostupný roh {SPACE.zadniStenaKeGauci / 10} × {SPACE.levaStenaRun / 10} cm · rameno A max {MAX_RAMENO_A / 10} cm
      </text>
    </svg>
  )
}
