import { useMemo } from 'react'
import { useStore } from '@/store'
import { kontroly, plochaDesky, obvodDesky, nejhorsiStav } from '@/model/constraints'

const IKONA = { ok: '✓', pozor: '!', chyba: '×' } as const

export function Kontroly() {
  const config = useStore((s) => s.config)
  const k = useMemo(() => kontroly(config), [config])
  const celkem = nejhorsiStav(k)

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
    </div>
  )
}
