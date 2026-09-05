import type { DeskConfig } from '@/model/types'
import { podpory } from '@/model/podpory'
import { material } from '@/model/materials'
import { SPACE, MONITOR } from '@/model/space'
import { obrysDeskyBody } from '@/model/obrys'
import { pracoviste } from '@/model/constraints'

/**
 * Technický nákres pro truhláře: půdorys, nárys, bokorys s kótami.
 * Generuje se ze stejných parametrů jako 3D model, takže nemůže „utéct" od skutečnosti.
 * Rozvržení odpovídá A4 na šířku.
 */

const CARA = '#3A2C20'
const KOTA = '#B0522A'
const TENKA = '#B8A48F'

function Kota({ x1, y1, x2, y2, text, odsad = 0, svisle = false, barva = KOTA }: {
  x1: number; y1: number; x2: number; y2: number; text: string
  odsad?: number; svisle?: boolean; barva?: string
}) {
  const ax = svisle ? x1 + odsad : x1
  const ay = svisle ? y1 : y1 + odsad
  const bx = svisle ? x2 + odsad : x2
  const by = svisle ? y2 : y2 + odsad
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  return (
    <g>
      <line x1={x1} y1={y1} x2={ax} y2={ay} stroke={barva} strokeWidth={0.4} />
      <line x1={x2} y1={y2} x2={bx} y2={by} stroke={barva} strokeWidth={0.4} />
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={barva} strokeWidth={0.6}
            markerStart="url(#sipkaV)" markerEnd="url(#sipkaV)" />
      <text x={svisle ? mx - 3 : mx} y={svisle ? my : my - 3}
            textAnchor={svisle ? 'end' : 'middle'} fontSize={7} fill={barva}
            transform={svisle ? `rotate(-90 ${mx - 3} ${my})` : undefined}>{text}</text>
    </g>
  )
}

export function Vykres({ config, sirka = 1050, vyska = 760 }: {
  config: DeskConfig; sirka?: number; vyska?: number
}) {
  const r = config.rozmery
  const jeL = config.tvar === 'L' && r.ramenoBDelka > 0
  const LA = r.ramenoADelka, DA = r.ramenoAHloubka
  const LB = jeL ? r.ramenoBDelka : 0, DB = jeL ? r.ramenoBHloubka : 0
  const H = r.vyska, T = config.deska.tloustka
  const p = podpory(config)
  const mat = material(config.deska.materialId)
  const pr = pracoviste(config)

  // měřítko: půdorys vlevo, nárys vpravo nahoře, bokorys vpravo dole
  const s = 0.135
  const M = (mm: number) => mm * s

  const obrys = obrysDeskyBody(config, 8)

  // --- půdorys vlevo dole ---
  const px = 92, py = 96
  const poly = obrys.map(([x, z]) => `${px + M(x)},${py + M(z)}`).join(' ')

  // --- nárys (pohled na rameno A z místnosti) vpravo nahoře ---
  const nx = 560, ny = 96
  // --- bokorys vpravo dole ---
  const bx = 560, by = 400

  const pz0 = SPACE.pruchod.odRohu, pz1 = pz0 + SPACE.pruchod.sirka

  return (
    <svg width={sirka} height={vyska} viewBox={`0 0 ${sirka} ${vyska}`} className="vykres"
         style={{ background: '#fff' }}>
      <defs>
        <marker id="sipkaV" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0.5,3 L5.5,1.2 L4.4,3 L5.5,4.8 Z" fill={KOTA} />
        </marker>
        <pattern id="stena" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="5" stroke={TENKA} strokeWidth="1.6" />
        </pattern>
      </defs>

      {/* rámeček a hlavička */}
      <rect x={8} y={8} width={sirka - 16} height={vyska - 16} fill="none" stroke={CARA} strokeWidth={0.8} />
      <text x={22} y={30} fontSize={13} fontWeight={700} fill={CARA}>
        Pracovní stůl do rohu obývacího pokoje — {config.nazev}
      </text>
      <text x={22} y={45} fontSize={8} fill="#6B5747">
        {mat.nazev} · tloušťka {T} mm · hrana {config.deska.hrana} · výška desky {H} mm ·
        {' '}měřítko cca 1:{Math.round(1 / s)} · kóty v mm
      </text>

      {/* ---------- PŮDORYS ---------- */}
      <text x={px} y={py - 30} fontSize={10} fontWeight={600} fill={CARA}>PŮDORYS</text>
      {/* stěny: levá tlustá zeď s průchodem od 2360, zadní naznačená */}
      <rect x={px - 30} y={py - 14} width={30} height={M(pz0) + 14} fill="url(#stena)" stroke={TENKA} strokeWidth={0.5} />
      <rect x={px - 30} y={py + M(pz1)} width={30} height={M(500)} fill="url(#stena)" stroke={TENKA} strokeWidth={0.5} />
      <line x1={px - 30} y1={py + M(pz0)} x2={px} y2={py + M(pz0)} stroke={CARA} strokeWidth={0.8} />
      <line x1={px - 30} y1={py + M(pz1)} x2={px} y2={py + M(pz1)} stroke={CARA} strokeWidth={0.8} />
      <text x={px - 15} y={py + M((pz0 + pz1) / 2)} fontSize={6} fill="#6B5747" textAnchor="middle"
            transform={`rotate(-90 ${px - 15} ${py + M((pz0 + pz1) / 2)})`}>průchod</text>
      <rect x={px - 30} y={py - 14} width={M(SPACE.zadniStenaKeGauci + SPACE.gauc.sirka) + 30} height={14} fill="url(#stena)" stroke={TENKA} strokeWidth={0.5} />
      {/* dostupná zóna */}
      <rect x={px} y={py} width={M(SPACE.zadniStenaKeGauci)} height={M(SPACE.levaStenaRun)}
            fill="none" stroke={TENKA} strokeWidth={0.6} strokeDasharray="4 3" />
      {/* gauč do U */}
      <rect x={px + M(SPACE.zadniStenaKeGauci)} y={py} width={M(SPACE.gauc.sirka)} height={M(SPACE.gauc.hloubka)}
            fill="#E8EEF1" stroke={TENKA} strokeWidth={0.6} />
      <rect x={px + M(SPACE.zadniStenaKeGauci)} y={py + M(SPACE.gauc.hloubka)} width={M(SPACE.gauc.lehatko.sirka)} height={M(SPACE.gauc.lehatko.delka - SPACE.gauc.hloubka)}
            fill="#E8EEF1" stroke={TENKA} strokeWidth={0.6} />
      <text x={px + M(SPACE.zadniStenaKeGauci) + 8} y={py + M(SPACE.gauc.hloubka / 2)} fontSize={7} fill="#6B5747">GAUČ DO U</text>
      <text x={px + M(SPACE.zadniStenaKeGauci) + 8} y={py + M(SPACE.gauc.hloubka + 300)} fontSize={6} fill="#6B5747">lehátko</text>
      {/* deska — skutečný obrys */}
      <polygon points={poly} fill="#F3E4CF" stroke={CARA} strokeWidth={1.1} strokeLinejoin="round" />
      {/* podpory */}
      {p.map((q, i) => (
        <rect key={i} x={px + M(q.x) - 3} y={py + M(q.z) - 3} width={6} height={6}
              fill="none" stroke={CARA} strokeWidth={0.8} />
      ))}
      {/* monitor — čárkovaně, ať truhlář ví, kde bude stát */}
      <g transform={`translate(${px + M(pr.monitor.x)} ${py + M(pr.monitor.z)}) rotate(${-(pr.monitor.rot * 180) / Math.PI})`}>
        <rect x={-M(MONITOR.stojan.sirka / 2)} y={-M(MONITOR.obrazovkaOdZadu)} width={M(MONITOR.stojan.sirka)} height={M(MONITOR.stojan.hloubka)}
              fill="none" stroke={TENKA} strokeWidth={0.5} strokeDasharray="2 1.5" />
        <line x1={-M(MONITOR.sirka / 2)} y1={0} x2={M(MONITOR.sirka / 2)} y2={0} stroke={CARA} strokeWidth={1.2} />
      </g>
      <text x={px + M(pr.monitor.x) + 6} y={py + M(pr.monitor.z) + 12} fontSize={6} fill="#6B5747">monitor 32"</text>
      {/* kóty půdorysu */}
      <Kota x1={px} y1={py} x2={px} y2={py + M(LA)} svisle odsad={-40} text={`${LA}`} />
      <Kota x1={px + M(DA)} y1={py + M(LA)} x2={px} y2={py + M(LA)} odsad={26} text={`${DA}`} />
      {jeL && (
        <>
          <Kota x1={px} y1={py} x2={px + M(LB)} y2={py} odsad={-24} text={`${LB}`} />
          <Kota x1={px + M(LB)} y1={py} x2={px + M(SPACE.zadniStenaKeGauci)} y2={py} odsad={-44}
                text={`${SPACE.zadniStenaKeGauci - LB} mezera ke gauči`} />
          <Kota x1={px + M(LB)} y1={py + M(DB)} x2={px + M(LB)} y2={py} svisle odsad={22} text={`${DB}`} />
        </>
      )}
      <Kota x1={px} y1={py + M(LA)} x2={px} y2={py + M(SPACE.levaStenaRun)} svisle odsad={-62}
            text={`${SPACE.levaStenaRun - LA} od hrany`} />
      {config.deska.radiusUZdi > 0 && (
        <text x={px + 4} y={py + M(config.deska.radiusUZdi) + 8} fontSize={6} fill={KOTA}>R{config.deska.radiusUZdi} u zdi</text>
      )}
      {jeL && config.deska.radiusVnitrni > 0 && (
        <text x={px + M(DA) + 4} y={py + M(DB) + 10} fontSize={6} fill={KOTA}>vnitřní R{config.deska.radiusVnitrni}</text>
      )}

      {/* ---------- NÁRYS ---------- */}
      <text x={nx} y={ny - 30} fontSize={10} fontWeight={600} fill={CARA}>NÁRYS — pohled na rameno A</text>
      <line x1={nx - 20} y1={ny + M(H)} x2={nx + M(LA) + 30} y2={ny + M(H)} stroke={TENKA} strokeWidth={0.8} />
      {/* deska */}
      <rect x={nx} y={ny + M(H - T)} width={M(LA)} height={M(T)} fill="#F3E4CF" stroke={CARA} strokeWidth={1} />
      {/* podpory v tomto pohledu — kreslí se ty na straně místnosti,
          ty u stěny leží přesně za nimi a v pohledu by se překryly */}
      {(() => {
        const ods = config.podnoz.odsazeni
        const vNarysu = p.filter((q) => Math.abs(q.x - (DA - ods)) < 1 || q.skupina === 'roh')
        const sirkaP = config.podnoz.typ === 'bocnice' ? Math.max(25, T) : config.podnoz.profil
        return vNarysu.map((q, i) => (
          <rect key={i} x={nx + M(q.z) - M(sirkaP) / 2} y={ny}
                width={M(sirkaP)} height={M(H - T)}
                fill="#E6E1DA" stroke={CARA} strokeWidth={0.7} strokeDasharray={q.skupina === 'roh' && q.x < DA - ods - 1 ? '2 1.5' : undefined} />
        ))
      })()}
      {/* podélná výztuha pod deskou */}
      {config.podnoz.vyztuha && config.podnoz.typ !== 'stavitelny-ram' && (
        <rect x={nx + M(config.podnoz.odsazeni)} y={ny + M(H - T) - M(config.podnoz.typ === 'bocnice' ? 130 : config.podnoz.profil * 0.55)}
              width={M(LA - 2 * config.podnoz.odsazeni)} height={M(config.podnoz.typ === 'bocnice' ? 130 : config.podnoz.profil * 0.55)}
              fill="none" stroke={TENKA} strokeWidth={0.5} strokeDasharray="3 2" />
      )}
      <Kota x1={nx} y1={ny + M(H)} x2={nx + M(LA)} y2={ny + M(H)} odsad={26} text={`${LA}`} />
      <Kota x1={nx} y1={ny + M(H)} x2={nx} y2={ny + M(H) - M(H)} svisle odsad={-26} text={`${H}`} />
      <Kota x1={nx + M(LA)} y1={ny + M(H - T)} x2={nx + M(LA)} y2={ny + M(H)} svisle odsad={20} text={`${T}`} />

      {/* ---------- BOKORYS ---------- */}
      <text x={bx} y={by - 30} fontSize={10} fontWeight={600} fill={CARA}>BOKORYS — řez ramenem A</text>
      <line x1={bx - 20} y1={by + M(H)} x2={bx + M(DA) + 60} y2={by + M(H)} stroke={TENKA} strokeWidth={0.8} />
      <rect x={bx} y={by + M(H - T)} width={M(DA)} height={M(T)} fill="#F3E4CF" stroke={CARA} strokeWidth={1} />
      {config.podnoz.typ === 'bocnice' ? (
        <>
          <rect x={bx + M(config.podnoz.odsazeni)} y={by}
                width={M(DA - 2 * config.podnoz.odsazeni)} height={M(H - T - 28)}
                fill="#EFEAE3" stroke={CARA} strokeWidth={0.8} />
          <text x={bx + M(DA / 2)} y={by + M(H - T - 8)} fontSize={5.5} fill="#6B5747" textAnchor="middle">stínová spára 28</text>
        </>
      ) : (
        <>
          <rect x={bx + M(config.podnoz.odsazeni)} y={by} width={M(config.podnoz.profil)} height={M(H - T)}
                fill="#E6E1DA" stroke={CARA} strokeWidth={0.7} />
          <rect x={bx + M(DA - config.podnoz.odsazeni - config.podnoz.profil)} y={by}
                width={M(config.podnoz.profil)} height={M(H - T)} fill="#E6E1DA" stroke={CARA} strokeWidth={0.7} />
          {/* horní traverza rámu */}
          <rect x={bx + M(config.podnoz.odsazeni)} y={by}
                width={M(DA - 2 * config.podnoz.odsazeni)} height={M(config.podnoz.profil)}
                fill="#E6E1DA" stroke={CARA} strokeWidth={0.7} />
          {config.podnoz.typ === 'ram-hranaty' && (
            <rect x={bx + M(config.podnoz.odsazeni)} y={by + M(H - T - config.podnoz.profil - 12)}
                  width={M(DA - 2 * config.podnoz.odsazeni)} height={M(config.podnoz.profil)}
                  fill="#E6E1DA" stroke={CARA} strokeWidth={0.7} />
          )}
        </>
      )}
      <Kota x1={bx} y1={by + M(H)} x2={bx + M(DA)} y2={by + M(H)} odsad={26} text={`${DA}`} />
      <Kota x1={bx} y1={by + M(H)} x2={bx} y2={by} svisle odsad={-26} text={`${H - T} světlá`} />
      <Kota x1={bx} y1={by + M(H - T)} x2={bx + M(config.podnoz.odsazeni)} y2={by + M(H - T)} odsad={-16}
            text={`${config.podnoz.odsazeni}`} />

      {/* legenda */}
      <text x={22} y={vyska - 34} fontSize={7} fill="#8A7563">
        Podpory jsou v půdorysu vyznačeny čtverečky. Kóty od hrany a mezera ke gauči vychází z rozměrů
        místa: levá stěna {SPACE.levaStenaRun} mm k hraně průchodu, zadní stěna ke gauči {SPACE.zadniStenaKeGauci} mm.
      </text>
      <text x={22} y={vyska - 24} fontSize={7} fill="#8A7563">
        Monitor {MONITOR.nazev} stojí {pr.umisteni === 'roh' ? 'v rohu' : pr.umisteni === 'ramenoB' ? 'na rameni B' : 'na rameni A'};
        {' '}oči sedícího jsou od obrazovky {Math.round(pr.vzdalenost)} mm.
      </text>
      <text x={22} y={vyska - 14} fontSize={7} fill="#8A7563">
        Vygenerováno konfigurátorem z parametrů modelu — rozměry v nákresu odpovídají rozpisce dílců.
      </text>
    </svg>
  )
}
