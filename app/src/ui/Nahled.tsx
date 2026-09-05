import { useMemo } from 'react'
import type { DeskConfig } from '@/model/types'
import { material } from '@/model/materials'
import { podpory } from '@/model/podpory'
import { obrysDeskyBody } from '@/model/obrys'

/**
 * Izometrický náhled generovaný ze stejných parametrů jako 3D model.
 * Proč SVG a ne WebGL: v galerii je 58 karet a 58 canvasů by prohlížeč položilo.
 * Tohle je ostré, okamžité a tiskne se to.
 */

const COS30 = Math.cos(Math.PI / 6)
const SIN30 = 0.5

function ztmav(hex: string, k: number): string {
  const h = hex.replace('#', '')
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return '#' + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * k))).toString(16).padStart(2, '0')).join('')
}

export function Nahled({ config, sirka = 260, vyska = 172 }: {
  config: DeskConfig; sirka?: number; vyska?: number
}) {
  const g = useMemo(() => {
    const r = config.rozmery
    const jeL = config.tvar === 'L' && r.ramenoBDelka > 0
    const LA = r.ramenoADelka, DA = r.ramenoAHloubka
    const LB = jeL ? r.ramenoBDelka : 0, DB = jeL ? r.ramenoBHloubka : 0
    const H = r.vyska, T = config.deska.tloustka

    const iso = (x: number, y: number, z: number): [number, number] => [
      (x - z) * COS30,
      (x + z) * SIN30 - y,
    ]

    // skutečný obrys se zaoblením rohů, obloukem v rohu i výřezem — ať náhled odpovídá modelu
    const obrys: Array<[number, number]> = obrysDeskyBody(config, 5)

    const top = obrys.map(([x, z]) => iso(x, H, z))
    const bot = obrys.map(([x, z]) => iso(x, H - T, z))

    const podp = podpory(config)
    const mat = material(config.deska.materialId)
    const barvaDesky = mat.barva
    const barvaHrany = ztmav(barvaDesky, 0.78)
    const barvaPodnoze = config.podnoz.material === 'kov'
      ? config.podnoz.barva
      : material(config.podnoz.materialId ?? config.deska.materialId).barva

    // rozsah pro scale
    const vse = [...top, ...bot, ...podp.map((p) => iso(p.x, 0, p.z))]
    const xs = vse.map((p) => p[0]), ys = vse.map((p) => p[1])
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const pad = 14
    const s = Math.min((sirka - 2 * pad) / (maxX - minX), (vyska - 2 * pad) / (maxY - minY))
    const ox = pad - minX * s + (sirka - 2 * pad - (maxX - minX) * s) / 2
    const oy = pad - minY * s + (vyska - 2 * pad - (maxY - minY) * s) / 2
    const T2 = (p: [number, number]): [number, number] => [p[0] * s + ox, p[1] * s + oy]

    return { obrys, top: top.map(T2), bot: bot.map(T2), podp, iso, T2, H, T, DA, DB, LA, LB, jeL,
             barvaDesky, barvaHrany, barvaPodnoze, s, config }
  }, [config, sirka, vyska])

  const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`
  const profil = Math.max(2.2, g.config.podnoz.profil * g.s)

  return (
    <svg width={sirka} height={vyska} viewBox={`0 0 ${sirka} ${vyska}`} className="nahled">
      {/* stín na podlaze */}
      <polygon
        points={g.obrys.map(([x, z]) => pt(g.T2(g.iso(x, 0, z)))).join(' ')}
        fill="#000" opacity={0.07}
      />

      {/* plné bočnice jako plocha, ne jako čára */}
      {(g.config.podnoz.typ === 'bocnice') && (() => {
        const sk = ['A', 'B', 'mezi'] as const
        return sk.map((s2) => {
          const gg = g.podp.filter((q) => q.skupina === s2)
          if (gg.length < 2) return null
          const hy = g.H - g.T
          const rohy = [
            g.T2(g.iso(gg[0].x, 0, gg[0].z)), g.T2(g.iso(gg[1].x, 0, gg[1].z)),
            g.T2(g.iso(gg[1].x, hy, gg[1].z)), g.T2(g.iso(gg[0].x, hy, gg[0].z)),
          ]
          return <polygon key={s2} points={rohy.map(pt).join(' ')} fill={ztmav(g.barvaPodnoze, 0.88)}
                          stroke={ztmav(g.barvaPodnoze, 0.6)} strokeWidth={0.6} />
        })
      })()}

      {/* nohy a rámy */}
      {g.config.podnoz.typ !== 'bocnice' && g.podp.map((p, i) => {
        const a = g.T2(g.iso(p.x, 0, p.z))
        const b = g.T2(g.iso(p.x, g.H - g.T, p.z))
        return (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
                stroke={g.barvaPodnoze} strokeWidth={profil} strokeLinecap="butt" opacity={0.95} />
        )
      })}
      {/* horní traverza rámu naznačená spojnicí podpor */}
      {g.config.podnoz.typ !== 'bocnice' && g.podp.length > 1 && g.podp.slice(1).map((p, i) => {
        const q = g.podp[i]
        if (q.skupina !== p.skupina) return null
        const a = g.T2(g.iso(q.x, g.H - g.T - g.config.podnoz.profil / 2, q.z))
        const b = g.T2(g.iso(p.x, g.H - g.T - g.config.podnoz.profil / 2, p.z))
        return <line key={`t${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
                     stroke={g.barvaPodnoze} strokeWidth={profil * 0.8} opacity={0.9} />
      })}

      {/* úložné jako blok */}
      {g.config.ulozne.map((u, i) => {
        const jeB = u.rameno === 'B' && g.jeL
        const sirkaK = 420
        const x = jeB ? g.DA + sirkaK / 2 + 40 + (g.LB - g.DA - sirkaK - 80) * u.pozice : g.DA / 2
        const z = jeB ? g.DB / 2 : (g.jeL ? g.DB : 0) + sirkaK / 2 + 60 + (g.LA - (g.jeL ? g.DB : 0) - sirkaK - 120) * u.pozice
        const w = jeB ? sirkaK : g.DA - 80
        const d = jeB ? g.DB - 80 : sirkaK
        const vys = g.H - g.T - 40
        const rohy: Array<[number, number]> = [
          [x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2],
        ]
        const hy = g.H - g.T
        const barva = (u as any).barvaCel ?? material(u.materialId ?? g.config.deska.materialId).barva
        return (
          <g key={`u${i}`}>
            <polygon points={rohy.map(([a, b]) => pt(g.T2(g.iso(a, hy - vys, b)))).join(' ')} fill={ztmav(barva, 0.7)} />
            {[[1, 2], [2, 3]].map(([m, n], k) => (
              <polygon key={k}
                points={[g.T2(g.iso(rohy[m][0], hy, rohy[m][1])), g.T2(g.iso(rohy[n][0], hy, rohy[n][1])),
                         g.T2(g.iso(rohy[n][0], hy - vys, rohy[n][1])), g.T2(g.iso(rohy[m][0], hy - vys, rohy[m][1]))]
                  .map(pt).join(' ')}
                fill={ztmav(barva, k === 0 ? 0.86 : 0.72)} />
            ))}
            <polygon points={rohy.map(([a, b]) => pt(g.T2(g.iso(a, hy, b)))).join(' ')} fill={barva} />
          </g>
        )
      })}

      {/* boční plochy desky (tloušťka) */}
      {g.top.map((_, i) => {
        const j = (i + 1) % g.top.length
        return (
          <polygon key={`h${i}`}
            points={[g.top[i], g.top[j], g.bot[j], g.bot[i]].map(pt).join(' ')}
            fill={g.barvaHrany} />
        )
      })}
      {/* horní plocha */}
      <polygon points={g.top.map(pt).join(' ')} fill={g.barvaDesky} stroke={ztmav(g.barvaDesky, 0.62)} strokeWidth={0.6} />
    </svg>
  )
}
