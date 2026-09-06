import type { Hrana } from '@/model/types'
import { HRANA_BM, formatRozpeti } from '@/pricing/ceny'

/**
 * Vysvětlivka profilů hran. Řez přední hranou desky z boku, v měřítku:
 * deska běží doleva, vpravo je hrana, kterou máš pod předloktím.
 * Truhlář to kreslí přesně takhle — a tady je to velké, aby byl rozdíl vidět.
 */

export interface HranaInfo {
  id: Hrana
  nazev: string
  kratce: string
  jakVypada: string
  kdeSeHodi: string
}

/**
 * Texty pro LAMINO — všechny dekory v nabídce jsou Egger ST12. U lamina se hrana
 * dělá páskou ABS; zkosení a velký rádius jdou jen přes nalepenou masivní lištu,
 * jinak by se odkryla dřevotříska.
 */
export const HRANY_INFO: HranaInfo[] = [
  {
    id: 'rovna', nazev: 'ABS 1 mm', kratce: 'tenká páska, ostrá hrana',
    jakVypada: 'Na čelo se nalepí tenká plastová páska 1 mm v barvě dekoru. Hrana zůstane skoro pravoúhlá, spára je zblízka vidět. Vypadá jako skříň z obchodu.',
    kdeSeHodi: 'Nejlevnější, ale pod předloktím tlačí a spára chytá špínu. Do obýváku bych ji nedával.',
  },
  {
    id: 'srazena', nazev: 'ABS 2 mm, R2', kratce: 'doporučení rešerše',
    jakVypada: 'Páska ABS 2 mm ve stejném dekoru (Egger ji k H3157 vyrábí), rohy strojově zaoblené na R2, lepená PUR lepidlem — spára není vidět. Zblízka jemně zakulacená linka, z metru jedna plocha.',
    kdeSeHodi: 'Standard kvalitního lamina a hlavní doporučení rešerše. Odolná vlhkosti, nezdraží, sedí ke každému dekoru.',
  },
  {
    id: 'zkosena', nazev: 'Zkosená (nákližek)', kratce: 'masivní lišta + zkosení 45°',
    jakVypada: 'U lamina jde zkosení jen přes nalepenou masivní dubovou lištu, do které se vyfrézuje klín shora i zespodu. Čelo se zúží na pár milimetrů, deska vypadá tenká.',
    kdeSeHodi: 'Designový prvek k hranatému rámu. Lišta z masivu ale bude mít jinou kresbu než dekor — ladí barvou, ne přesně.',
  },
  {
    id: 'radius', nazev: 'Zaoblená (nákližek)', kratce: 'masivní lišta + R10',
    jakVypada: 'Stejný princip: na čelo přijde masivní dubová lišta a ta se zaoblí rádiusem kolem 10 mm nahoře i dole. Měkká hrana bez ostré linky.',
    kdeSeHodi: 'Nejpříjemnější pod předloktím. K bočnicím a světlým dekorům; lišta z masivu ladí barvou, ne přesně kresbou.',
  },
  {
    id: 'naklizek', nazev: 'Masivní nákližek', kratce: 'lišta 20–40 mm, R3',
    jakVypada: 'Masivní dubová lišta 20–40 mm nalepená na čelo, jen lehce zaoblená. Na hraně vidíš pravé dřevo, plocha zůstává lamino ST12.',
    kdeSeHodi: 'Když má hrana snést rány a vypadat jako masiv. Cena nejvyšší, truhlář ji musí brousit a olejovat.',
  },
]

const DESKA = '#D9AE7E', DESKA_TMAVA = '#B98A55', OBRYS = '#6B4A2A', JADRO = '#E8D9C2', ABS = '#8C6A48'

/** Body profilu v mm: šířka řezu W, tloušťka t, hrana vpravo (x = W). Vrací SVG path a poznámky. */
function profil(hrana: Hrana, t: number, W: number): { d: string; poznamky: Array<{ x: number; y: number; text: string }>; naklizekOd?: number; abs?: number } {
  const z = Math.min(14, t * 0.38)             // velké zkosení
  const r = Math.min(9, t * 0.34)              // rádius
  const n = 30                                 // šířka masivní lišty
  const A = (x: number, y: number, rr: number, sweep = 1) => `A ${rr} ${rr} 0 0 ${sweep} ${x} ${y}`
  switch (hrana) {
    case 'rovna':
      return { d: `M 0 0 H ${W} V ${t} H 0 Z`, poznamky: [{ x: W, y: t / 2, text: 'ABS 1 mm' }], abs: 1 }
    case 'srazena':
      return {
        d: `M 0 0 H ${W - 2} ${A(W, 2, 2)} V ${t - 2} ${A(W - 2, t, 2)} H 0 Z`,
        poznamky: [{ x: W, y: 2, text: 'ABS 2 mm, R2' }],
        abs: 2,
      }
    case 'zkosena':
      return {
        d: `M 0 0 H ${W - z} L ${W} ${z} V ${t - z} L ${W - z} ${t} H 0 Z`,
        poznamky: [{ x: W - z / 2, y: z / 2, text: `zkosení ${z.toFixed(0)} mm` }, { x: W - n, y: 0, text: 'masivní lišta' }],
        naklizekOd: W - n,
      }
    case 'radius':
      return {
        d: `M 0 0 H ${W - r} ${A(W, r, r)} V ${t - r} ${A(W - r, t, r)} H 0 Z`,
        poznamky: [{ x: W, y: r, text: `R${r.toFixed(0)}` }, { x: W - n, y: 0, text: 'masivní lišta' }],
        naklizekOd: W - n,
      }
    case 'naklizek':
      return {
        d: `M 0 0 H ${W - 3} ${A(W, 3, 3)} V ${t - 3} ${A(W - 3, t, 3)} H 0 Z`,
        poznamky: [{ x: W - n, y: 0, text: 'lepený spoj' }, { x: W - n / 2, y: t / 2, text: `masiv ${n} mm` }],
        naklizekOd: W - n,
      }
  }
}

/** Řez hranou. `velky` přidá kóty a popisky. */
export function ProfilHrany({ hrana, tloustka, sirka = 300, vyska = 150, velky = false }: {
  hrana: Hrana; tloustka: number; sirka?: number; vyska?: number; velky?: boolean
}) {
  const W = velky ? 90 : 46
  const t = tloustka
  const okrajL = velky ? 74 : 8, okrajR = velky ? 64 : 8, okrajV = velky ? 46 : 10
  const s = Math.min((sirka - okrajL - okrajR) / W, (vyska - 2 * okrajV) / t)
  const ox = okrajL, oy = (vyska - t * s) / 2
  const { d, poznamky, naklizekOd, abs } = profil(hrana, t, W)
  // path v mm -> px
  const dPx = d.replace(/([MLHVAZ])\s*([^MLHVAZ]*)/g, (_m, cmd: string, args: string) => {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (cmd === 'H') return `H ${(ox + nums[0] * s).toFixed(1)} `
    if (cmd === 'V') return `V ${(oy + nums[0] * s).toFixed(1)} `
    if (cmd === 'A') return `A ${(nums[0] * s).toFixed(1)} ${(nums[1] * s).toFixed(1)} ${nums[2]} ${nums[3]} ${nums[4]} ${(ox + nums[5] * s).toFixed(1)} ${(oy + nums[6] * s).toFixed(1)} `
    if (cmd === 'Z') return 'Z '
    return `${cmd} ${(ox + nums[0] * s).toFixed(1)} ${(oy + nums[1] * s).toFixed(1)} `
  })
  const clipId = `hr-${hrana}-${velky ? 'v' : 'm'}`

  return (
    <svg width={sirka} height={vyska} viewBox={`0 0 ${sirka} ${vyska}`} className="profil-hrany">
      <defs>
        <clipPath id={clipId}><path d={dPx} /></clipPath>
        <pattern id={`${clipId}-jadro`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.9" fill="#B9A58A" />
        </pattern>
      </defs>
      {/* deska: kresba dřeva podélně, u nákližku je vlevo dýhované jádro */}
      <path d={dPx} fill={DESKA} stroke={OBRYS} strokeWidth={velky ? 1.6 : 1} strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        {/* lamino: dřevotřískové jádro s tenkým dekorem nahoře a dole; masivní lišta má kresbu */}
        <rect x={ox - 5} y={oy + 1.2} width={(naklizekOd ?? W) * s + 5} height={t * s - 2.4} fill={JADRO} />
        <rect x={ox - 5} y={oy + 1.2} width={(naklizekOd ?? W) * s + 5} height={t * s - 2.4} fill={`url(#${clipId}-jadro)`} />
        {naklizekOd !== undefined && (
          <>
            {[0.22, 0.48, 0.71, 0.9].map((k) => (
              <line key={k} x1={ox + naklizekOd * s} y1={oy + t * s * k} x2={ox + W * s + 5} y2={oy + t * s * k} stroke={DESKA_TMAVA} strokeWidth={0.8} opacity={0.55} />
            ))}
            <line x1={ox + naklizekOd * s} y1={oy} x2={ox + naklizekOd * s} y2={oy + t * s} stroke={OBRYS} strokeWidth={1} strokeDasharray="3 2" />
          </>
        )}
        {abs !== undefined && (
          <rect x={ox + W * s - Math.max(1.5, abs * s)} y={oy} width={Math.max(1.5, abs * s)} height={t * s} fill={ABS} />
        )}
      </g>
      {/* naznačení, že deska pokračuje doleva */}
      <line x1={ox - 6} y1={oy} x2={ox - 6} y2={oy + t * s} stroke="#fff" strokeWidth={5} />
      {velky && (
        <g fontSize={10} fill="#6B5747">
          {/* kóta tloušťky */}
          <line x1={ox - 28} y1={oy} x2={ox - 28} y2={oy + t * s} stroke="#B0522A" strokeWidth={0.8} />
          <line x1={ox - 34} y1={oy} x2={ox - 22} y2={oy} stroke="#B0522A" strokeWidth={0.8} />
          <line x1={ox - 34} y1={oy + t * s} x2={ox - 22} y2={oy + t * s} stroke="#B0522A" strokeWidth={0.8} />
          <text x={ox - 32} y={oy + t * s / 2 + 3.5} textAnchor="end" fill="#B0522A" fontWeight={600}>{t} mm</text>
          <text x={ox + 2} y={oy - 6} fill="#97826E" fontSize={9}>horní plocha</text>
          <text x={ox + 4} y={oy + t * s + 14} fill="#97826E">spodní strana</text>
          <text x={ox + W * s + 6} y={oy + t * s / 2 + 3.5} fill="#97826E">← předloktí</text>
          {poznamky.map((pz, i) => {
            const lx = Math.max(70, Math.min(sirka - 62, ox + pz.x * s))
            const ly = oy - 12 - i * 13
            return (
              <g key={i}>
                <line x1={ox + pz.x * s} y1={oy + pz.y * s} x2={lx} y2={ly + 3} stroke="#B0522A" strokeWidth={0.7} />
                <text x={lx} y={ly} textAnchor="middle" fill="#B0522A">{pz.text}</text>
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}

/** Výběr hrany s velkým řezem a vysvětlením. */
export function VyberHrany({ hodnota, tloustka, onChange }: {
  hodnota: Hrana; tloustka: number; onChange: (h: Hrana) => void
}) {
  const info = HRANY_INFO.find((h) => h.id === hodnota) ?? HRANY_INFO[1]
  return (
    <div className="hrany">
      <span className="prepinac-label">Hrana desky — řez z boku, v měřítku (lamino: tečkované jádro, ABS páska nebo masivní lišta)</span>
      <div className="hrany-velky">
        <ProfilHrany hrana={hodnota} tloustka={tloustka} sirka={300} vyska={150} velky />
      </div>
      <div className="hrany-vyber">
        {HRANY_INFO.map((h) => (
          <button key={h.id} type="button" className={h.id === hodnota ? 'on' : ''} onClick={() => onChange(h.id)} title={h.kratce}>
            <ProfilHrany hrana={h.id} tloustka={tloustka} sirka={52} vyska={40} />
            <span>{h.nazev}</span>
          </button>
        ))}
      </div>
      <div className="hrany-text">
        <p><b>Jak to vypadá:</b> {info.jakVypada}</p>
        <p><b>Kde se hodí:</b> {info.kdeSeHodi}</p>
        <p className="odvozeno">Cena olepení či frézování: {formatRozpeti(HRANA_BM[hodnota])} za běžný metr hrany.</p>
      </div>
    </div>
  )
}
