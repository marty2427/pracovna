import { useMemo } from 'react'
import { useStore } from '@/store'
import { kontroly, plochaDesky, obvodDesky, nejhorsiStav } from '@/model/constraints'
import { odhadNaMiru } from '@/pricing/odhad'
import { formatRozpeti } from '@/pricing/ceny'

/** Rozpočet, který zadal uživatel. */
const ROZPOCET = { od: 5000, do: 20000 }

const IKONA = { ok: '✓', pozor: '!', chyba: '×' } as const

export function Kontroly() {
  const config = useStore((s) => s.config)
  const k = useMemo(() => kontroly(config), [config])
  const celkem = nejhorsiStav(k)
  const odhad = useMemo(() => odhadNaMiru(config), [config])
  const stredCeny = (odhad.celkem.od + odhad.celkem.do) / 2
  const vRozpoctu = odhad.celkem.od <= ROZPOCET.do
  const nadRozpocet = odhad.celkem.od > ROZPOCET.do

  return (
    <div className="kontroly">
      <div className={`souhrn ${celkem}`}>
        {celkem === 'ok' && 'Vejde se do rohu a drží rezervy'}
        {celkem === 'pozor' && 'Vejde se, ale něco je na hraně'}
        {celkem === 'chyba' && 'Takhle to nejde — viz červené řádky'}
      </div>
      <ul>
        {k.map((x) => (
          <li key={x.id} className={x.stav}>
            <span className="znak">{IKONA[x.stav]}</span>
            <span className="telo">
              <b>{x.nazev}</b>
              <em>{x.cil}</em>
              <span>{x.zprava}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mira">
        <span>plocha desky <b>{plochaDesky(config).toFixed(2)} m²</b></span>
        <span>hrana <b>{obvodDesky(config).toFixed(2)} bm</b></span>
      </div>

      <div className={`rozpocet ${nadRozpocet ? 'nad' : vRozpoctu ? 'ok' : 'pozor'}`}>
        <div className="radek">
          <span>Odhad na míru</span>
          <b>{formatRozpeti(odhad.celkem)}</b>
        </div>
        <div className="pruh">
          <div className="pasmo" style={{
            left: `${Math.min(100, (ROZPOCET.od / 60000) * 100)}%`,
            width: `${Math.min(100, ((ROZPOCET.do - ROZPOCET.od) / 60000) * 100)}%`,
          }} />
          <div className="odhad" style={{
            left: `${Math.min(99, (odhad.celkem.od / 60000) * 100)}%`,
            width: `${Math.max(1.5, Math.min(100, ((odhad.celkem.do - odhad.celkem.od) / 60000) * 100))}%`,
          }} />
        </div>
        <p>
          {nadRozpocet
            ? `Tahle sestava je nad tvým pásmem 5–20 tis. Levněji: tenčí deska, lamino nebo dýha místo masivu, jednodušší podnož, míň zásuvek.`
            : vRozpoctu
              ? `Vejde se do tvého pásma 5–20 tis. Kč${stredCeny > ROZPOCET.do ? ' spodní hranicí odhadu' : ''}.`
              : `Pod tvým pásmem — dá se přidat na materiálu.`}
        </p>
      </div>
    </div>
  )
}
