import { useMemo } from 'react'
import { useStore } from '@/store'
import { umisteniMonitoru } from '@/model/constraints'
import { kontroly, plochaDesky, obvodDesky, nejhorsiStav } from '@/model/constraints'
import { odhadNaMiru } from '@/pricing/odhad'
import { formatRozpeti } from '@/pricing/ceny'

/** Rozpočet, který zadal uživatel. */
const ROZPOCET = { od: 5000, do: 20000 }

const IKONA = { ok: '✓', pozor: '!', chyba: '×' } as const
const STAV = { ok: 'splněno', pozor: 'na hraně', chyba: 'chyba' } as const

export function Kontroly() {
  const config = useStore((s) => s.config)
  const nastav = useStore((s) => s.nastav)
  const mistnost = useStore((s) => s.mistnost)
  const k = useMemo(() => kontroly(config, mistnost), [config, mistnost])
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
        {k.map((x) => {
          // Opravná tlačítka: když je jasné, co chybu odstraní, ať to jde jedním klikem.
          let oprava: { text: string; akce: () => void } | null = null
          if (x.id === 'rozpon' && x.stav !== 'ok') {
            oprava = !config.podnoz.vyztuha
              ? { text: 'Přidat výztuhu', akce: () => nastav((c) => ({ podnoz: { ...c.podnoz, vyztuha: true } })) }
              : config.podnoz.mezilehlaPodpora !== 'ano'
                ? { text: 'Přidat mezilehlou podporu', akce: () => nastav((c) => ({ podnoz: { ...c.podnoz, mezilehlaPodpora: 'ano' } })) }
                : null
          }
          if (x.id === 'monitor' && x.stav !== 'ok' && umisteniMonitoru(config) !== 'roh') {
            oprava = { text: 'Monitor do rohu', akce: () => nastav((c) => ({ doplnky: { ...c.doplnky, monitorUmisteni: 'roh' } })) }
          }
          if (x.id === 'zona-zidle' && x.stav !== 'ok' && config.rozmery.ramenoAHloubka > 700) {
            oprava = { text: 'Hloubku ramene A na 70', akce: () => nastav((c) => ({ rozmery: { ...c.rozmery, ramenoAHloubka: 700 } })) }
          }
          return (
            <li key={x.id} className={x.stav}>
              <span className="znak">{IKONA[x.stav]}</span>
              <span className="telo">
                <b>{x.nazev}</b>
                <em>{x.cil}</em>
                <span>{x.zprava}</span>
                {oprava && <button type="button" className="oprava" onClick={oprava.akce}>{oprava.text}</button>}
              </span>
              <span className="stav">{STAV[x.stav]}</span>
            </li>
          )
        })}
      </ul>
      <div className="mira">
        <span>plocha desky <b>{plochaDesky(config).toFixed(2)} m²</b></span>
        <span>hrana <b>{obvodDesky(config).toFixed(2)} bm</b></span>
      </div>

      <div className={`rozpocet ${nadRozpocet ? 'nad' : vRozpoctu ? 'ok' : 'pozor'}`}>
        <div className="radek">
          <span>Odhad na míru</span>
          <span><b>{Math.round(stredCeny / 100) * 100 >= 1000 ? `${Math.round(stredCeny / 1000)} tis. Kč` : formatRozpeti(odhad.celkem)}</b><span className="rozpeti">rozpětí {formatRozpeti(odhad.celkem)}</span></span>
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
        <div className="osa"><span>0</span><span>5 tis.</span><span>rozpočet 5–20 tis.</span><span>25</span><span>60 tis.</span></div>
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
