import { useMemo } from 'react'
import type { DeskConfig } from '@/model/types'
import { SPACE, MAX_RAMENO_A, MONITOR } from '@/model/space'
import { kontroly, pracoviste, type Zavaznost, type Mistnost, VYCHOZI_MISTNOST } from '@/model/constraints'
import { podpory } from '@/model/podpory'
import { obrysDeskyBody } from '@/model/obrys'

const BARVA: Record<Zavaznost, string> = { ok: '#4C7F45', pozor: '#C8871F', chyba: '#B33E28' }

/**
 * Půdorys rohu s obrysem dostupného prostoru a kótovanými rezervami.
 * Kreslí se přímo v milimetrech (viewBox je v mm), takže se nic nerozjede,
 * když se změní velikost panelu. Tloušťky čar a písmo se přepočítávají zpět na pixely.
 */
export function FloorPlan({ config, sirka = 400, mistnost = VYCHOZI_MISTNOST }: {
  config: DeskConfig; sirka?: number; mistnost?: Mistnost
}) {
  const r = config.rozmery
  const jeL = config.tvar === 'L' && r.ramenoBDelka > 0

  // kreslený výřez v mm — vlevo je vidět tloušťka zdi a průchod
  const TZ = SPACE.pruchod.tloustkaZdi
  const X0 = -TZ - 130, X1 = 3480
  const Z0 = -700, Z1 = 3520
  const W = X1 - X0, H = Z1 - Z0
  const vyska = Math.round((sirka * H) / W)
  /** převod: kolik mm odpovídá jednomu pixelu na obrazovce */
  const px = (n: number) => (n * W) / sirka

  const k = useMemo(() => kontroly(config, mistnost), [config, mistnost])
  const stav = (id: string) => k.find((x) => x.id === id)?.stav ?? 'ok'

  const mezera = SPACE.zadniStenaKeGauci - r.ramenoBDelka
  const odHrany = SPACE.levaStenaRun - r.ramenoADelka
  const zonaZidle = SPACE.zadniStenaKeGauci - r.ramenoAHloubka
  const pr = pracoviste(config)
  const podp = podpory(config)
  const obrys = useMemo(() => obrysDeskyBody(config, 10), [config])

  const g = SPACE.gauc
  const gx = SPACE.zadniStenaKeGauci
  const leh = mistnost.lehatko
  const pz0 = SPACE.pruchod.odRohu, pz1 = pz0 + SPACE.pruchod.sirka

  // monitor v půdorysu: obdélník hlavy natočený podle umístění
  const rotDeg = -(pr.monitor.rot * 180) / Math.PI
  const ociR = MONITOR.vzdalenost

  const Kota = ({ x1, z1, x2, z2, popis, barva, odsad, svisle = false, tenka = false, t = 0.5 }: {
    x1: number; z1: number; x2: number; z2: number
    popis: string; barva: string; odsad: number; svisle?: boolean; tenka?: boolean
    /** Kde na kótě sedí popisek: 0 = u prvního bodu, 1 = u druhého. */
    t?: number
  }) => {
    const ax = svisle ? x1 + odsad : x1, az = svisle ? z1 : z1 + odsad
    const bx = svisle ? x2 + odsad : x2, bz = svisle ? z2 : z2 + odsad
    const mx = ax + (bx - ax) * t, mz = az + (bz - az) * t
    const sirkaTextu = px(popis.length * 5.4 + 12)
    const vyskaTextu = px(14)
    return (
      <g>
        <line x1={x1} y1={z1} x2={ax} y2={az} stroke={barva} strokeWidth={px(0.6)} strokeDasharray={`${px(3)} ${px(3)}`} opacity={0.6} />
        <line x1={x2} y1={z2} x2={bx} y2={bz} stroke={barva} strokeWidth={px(0.6)} strokeDasharray={`${px(3)} ${px(3)}`} opacity={0.6} />
        <line x1={ax} y1={az} x2={bx} y2={bz} stroke={barva} strokeWidth={px(tenka ? 0.8 : 1.1)} />
        <circle cx={ax} cy={az} r={px(1.6)} fill={barva} />
        <circle cx={bx} cy={bz} r={px(1.6)} fill={barva} />
        <rect x={mx - sirkaTextu / 2} y={mz - vyskaTextu / 2} width={sirkaTextu} height={vyskaTextu}
              rx={vyskaTextu / 2} fill="#FFFDF9" stroke={barva} strokeWidth={px(0.7)} />
        <text x={mx} y={mz + px(3)} textAnchor="middle" fontSize={px(8.6)} fontWeight={600} fill={barva}>{popis}</text>
      </g>
    )
  }

  return (
    <svg width={sirka} height={vyska} viewBox={`${X0} ${Z0} ${W} ${H}`} className="pudorys">
      <defs>
        <pattern id="srafy" width={px(6)} height={px(6)} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2={px(6)} stroke="#D6C5B0" strokeWidth={px(2.2)} />
        </pattern>
        <pattern id="volno" width={px(5)} height={px(5)} patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2={px(5)} stroke="#B7D2B5" strokeWidth={px(1.4)} />
        </pattern>
      </defs>

      <rect x={X0} y={Z0} width={W} height={H} fill="#FBF5EC" />

      {/* STĚNY: levá je metr tlustá stará zeď s průchodem od 236 cm, zadní jen naznačená */}
      <rect x={-TZ} y={-150} width={TZ} height={pz0 + 150} fill="url(#srafy)" stroke="#A08B77" strokeWidth={px(0.8)} />
      <rect x={-TZ} y={pz1} width={TZ} height={Z1 - pz1} fill="url(#srafy)" stroke="#A08B77" strokeWidth={px(0.8)} />
      <rect x={-TZ} y={-150} width={X1 + TZ} height={150} fill="url(#srafy)" stroke="#A08B77" strokeWidth={px(0.8)} />
      {/* průchod: ostění a naznačená podlaha vedlejší místnosti */}
      <rect x={-TZ} y={pz0} width={TZ} height={pz1 - pz0} fill="#F3EBE0" />
      <line x1={-TZ} y1={pz0} x2={0} y2={pz0} stroke="#7A6552" strokeWidth={px(1.6)} />
      <line x1={-TZ} y1={pz1} x2={0} y2={pz1} stroke="#7A6552" strokeWidth={px(1.6)} />
      <text x={-TZ / 2} y={(pz0 + pz1) / 2 + px(3)} textAnchor="middle" fontSize={px(8)} fill="#8A7563"
            transform={`rotate(-90 ${-TZ / 2} ${(pz0 + pz1) / 2})`}>průchod {SPACE.pruchod.sirka / 10} cm</text>
      {/* hrana zdi, od které držíme odstup */}
      <line x1={0} y1={pz0} x2={720} y2={pz0} stroke="#7A6552" strokeWidth={px(1.6)} strokeDasharray={`${px(5)} ${px(3)}`} />
      <text x={330} y={pz0 - px(4)} fontSize={px(8)} fill="#8A7563">hrana zdi</text>

      {/* dostupný roh */}
      <rect x={0} y={0} width={SPACE.zadniStenaKeGauci} height={SPACE.levaStenaRun}
            fill="none" stroke="#C4661F" strokeWidth={px(1)} strokeDasharray={`${px(6)} ${px(4)}`} opacity={0.7} />

      {/* zóna pro odsunutí židle — mezi ramenem A a lehátkem */}
      <rect x={r.ramenoAHloubka} y={jeL ? r.ramenoBHloubka : 0}
            width={Math.max(0, zonaZidle)} height={Math.max(0, Math.min(leh, r.ramenoADelka + 300) - (jeL ? r.ramenoBHloubka : 0))}
            fill="url(#volno)" opacity={0.55} />

      {/* GAUČ DO U: zadní díl + lehátko u stolu + lehátko vzadu */}
      <g>
        <rect x={gx} y={0} width={g.sirka} height={g.hloubka} rx={50} fill="#0F5A78" opacity={0.88} />
        <rect x={gx} y={g.hloubka - 60} width={g.lehatko.sirka} height={leh - g.hloubka + 60} rx={50} fill="#0F5A78" opacity={0.88} />
        <rect x={gx + g.sirka - g.lehatkoVzdalene.sirka} y={g.hloubka - 60} width={g.lehatkoVzdalene.sirka} height={g.lehatkoVzdalene.delka - g.hloubka + 60} rx={50} fill="#0F5A78" opacity={0.88} />
        {/* opěrka lehátka u stolu */}
        <rect x={gx + 20} y={g.hloubka} width={130} height={leh - g.hloubka - 30} rx={30} fill="#0B4760" opacity={0.9} />
        <text x={gx + 1000} y={g.hloubka / 2 + px(4)} fontSize={px(11)} fill="#fff" fontWeight={700}>GAUČ DO U</text>
        <text x={gx + g.lehatko.sirka / 2 + 60} y={(g.hloubka + leh) / 2} fontSize={px(8)} fill="#fff"
              textAnchor="middle" transform={`rotate(-90 ${gx + g.lehatko.sirka / 2 + 60} ${(g.hloubka + leh) / 2})`}>lehátko {Math.round(leh / 10)} cm</text>
      </g>

      {/* DESKA — skutečný obrys včetně zaoblení a výřezu */}
      <polygon points={obrys.map(([x, z]) => `${x},${z}`).join(' ')} fill="#D9AE7E" stroke="#8A5B2E" strokeWidth={px(1.4)} strokeLinejoin="round" />
      {/* podpory */}
      {podp.map((q, i) => (
        <rect key={i} x={q.x - 26} y={q.z - 26} width={52} height={52} fill="#FFFDF9" stroke="#5A4433" strokeWidth={px(1)} />
      ))}

      {/* MONITOR a pásmo 70–100 cm od očí */}
      <g transform={`translate(${pr.monitor.x} ${pr.monitor.z}) rotate(${rotDeg})`}>
        <rect x={-MONITOR.stojan.sirka / 2} y={-MONITOR.obrazovkaOdZadu} width={MONITOR.stojan.sirka} height={MONITOR.stojan.hloubka}
              rx={30} fill="#3A3C40" opacity={0.35} />
        <path d={`M ${-MONITOR.sirka / 2} 42 Q 0 -42 ${MONITOR.sirka / 2} 42`} fill="none" stroke="#1E1F22" strokeWidth={px(3)} strokeLinecap="round" />
        <text x={0} y={-MONITOR.obrazovkaOdZadu - px(4)} textAnchor="middle" fontSize={px(7.5)} fill="#3A3C40">monitor 32"</text>
      </g>
      <g>
        {/* oblouky 70 a 100 cm od očí — kam má padnout obrazovka */}
        {[ociR.min, ociR.max].map((d, i) => {
          const cx = pr.oci.x, cz = pr.oci.z
          const a = Math.atan2(-pr.smer.z, -pr.smer.x)
          const a0 = a - 0.55, a1 = a + 0.55
          const p0 = [cx + d * Math.cos(a0), cz + d * Math.sin(a0)]
          const p1 = [cx + d * Math.cos(a1), cz + d * Math.sin(a1)]
          return <path key={i} d={`M ${p0[0]} ${p0[1]} A ${d} ${d} 0 0 1 ${p1[0]} ${p1[1]}`} fill="none"
                       stroke={BARVA[stav('monitor')]} strokeWidth={px(0.8)} strokeDasharray={`${px(3)} ${px(2)}`} opacity={0.8} />
        })}
        <line x1={pr.oci.x} y1={pr.oci.z} x2={pr.monitor.x} y2={pr.monitor.z} stroke={BARVA[stav('monitor')]} strokeWidth={px(1)} />
        <circle cx={pr.oci.x} cy={pr.oci.z} r={px(2.4)} fill={BARVA[stav('monitor')]} />
        {(() => {
          const mx = (pr.oci.x + pr.monitor.x) / 2, mz = (pr.oci.z + pr.monitor.z) / 2
          const t = `${Math.round(pr.vzdalenost / 10)} cm k obrazovce`
          const w = px(t.length * 5.4 + 12), h = px(14)
          const ox = pr.umisteni === 'ramenoA' ? 0 : -pr.smer.z * 260
          const oz = pr.umisteni === 'ramenoA' ? -260 : pr.umisteni === 'roh' ? 200 : 0
          return (
            <g>
              <rect x={mx + ox - w / 2} y={mz + oz - h / 2} width={w} height={h} rx={h / 2} fill="#FFFDF9" stroke={BARVA[stav('monitor')]} strokeWidth={px(0.7)} />
              <text x={mx + ox} y={mz + oz + px(3)} textAnchor="middle" fontSize={px(8.6)} fontWeight={600} fill={BARVA[stav('monitor')]}>{t}</text>
            </g>
          )
        })()}
      </g>

      {/* židle */}
      <g transform={`translate(${pr.zidle.x} ${pr.zidle.z}) rotate(${rotDeg})`}>
        <circle cx={0} cy={0} r={340} fill="#2C2D2F" opacity={0.12} />
        <rect x={-250} y={-250} width={500} height={500} rx={120} fill="#2C2D2F" opacity={0.45} />
        <rect x={-250} y={-260} width={500} height={90} rx={40} fill="#2C2D2F" opacity={0.7} />
        <text x={0} y={px(3.5)} textAnchor="middle" fontSize={px(8.5)} fill="#fff">židle</text>
      </g>

      {/* KÓTY — levá stěna: celkem 236, rameno A, zbytek k hraně */}
      <Kota x1={0} z1={0} x2={0} z2={pz0} svisle odsad={-600} t={0.22}
            popis={`stěna celkem ${SPACE.levaStenaRun / 10} cm`} barva="#7A6552" tenka />
      <Kota x1={0} z1={0} x2={0} z2={r.ramenoADelka} svisle odsad={-380} t={0.62}
            popis={`stůl ${Math.round(r.ramenoADelka / 10)} cm`} barva="#7A6552" />
      <Kota x1={0} z1={r.ramenoADelka} x2={0} z2={pz0} svisle odsad={-160}
            popis={`${Math.round(odHrany / 10)} cm`} barva={BARVA[stav('rameno-a')]} />
      {/* zadní stěna: celkem 160 ke gauči, rameno B, mezera */}
      <Kota x1={0} z1={0} x2={SPACE.zadniStenaKeGauci} z2={0} odsad={-420} t={0.32}
            popis={`stěna ke gauči ${SPACE.zadniStenaKeGauci / 10} cm`} barva="#7A6552" tenka />
      {jeL && (
        <>
          <Kota x1={0} z1={0} x2={r.ramenoBDelka} z2={0} odsad={-215} t={0.68}
                popis={`stůl ${Math.round(r.ramenoBDelka / 10)} cm`} barva="#7A6552" />
          <Kota x1={r.ramenoBDelka} z1={r.ramenoBHloubka + 30} x2={SPACE.zadniStenaKeGauci} z2={r.ramenoBHloubka + 30} odsad={160}
                popis={`${Math.round(mezera / 10)} cm`} barva={BARVA[stav('mezera-gauc')]} />
        </>
      )}
      <Kota x1={r.ramenoAHloubka} z1={r.ramenoADelka} x2={SPACE.zadniStenaKeGauci} z2={r.ramenoADelka} odsad={290}
            popis={`${Math.round(zonaZidle / 10)} cm na židli`} barva={BARVA[stav('zona-zidle')]} />
      <Kota x1={0} z1={r.ramenoADelka} x2={r.ramenoAHloubka} z2={r.ramenoADelka} odsad={120}
            popis={`${Math.round(r.ramenoAHloubka / 10)} cm`} barva={BARVA[stav('vycnivani')]} />

      <text x={X0 + 40} y={Z0 + px(11)} fontSize={px(8.5)} fill="#8A7563">
        dostupný roh {SPACE.zadniStenaKeGauci / 10} × {SPACE.levaStenaRun / 10} cm · rameno A max {MAX_RAMENO_A / 10} cm · zeď {TZ / 10} cm
      </text>
      <text x={X0 + 40} y={Z1 - px(4)} fontSize={px(8)} fill="#8A7563">
        čtverečky = podpory · šrafovaná zóna = volno pro židli · oblouky = 70 a 100 cm od očí
      </text>
    </svg>
  )
}
