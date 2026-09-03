import { useMemo, useState } from 'react'
import { useStore } from '@/store'
import { PRESETY, RODINY } from '@/presets'
import { Nahled } from './Nahled'
import { odhadNaMiru } from '@/pricing/odhad'
import { formatRozpeti } from '@/pricing/ceny'
import { kontroly, nejhorsiStav } from '@/model/constraints'
import { material } from '@/model/materials'

const PODNOZ_LABEL: Record<string, string> = {
  'ram-U': 'rám U', 'ram-A': 'rám A', 'ram-H': 'rám H', 'ram-trapez': 'trapéz',
  'ram-hranaty': 'hranatý rám', hairpin: 'hairpin', 'nohy-rovne': 'rovné nohy',
  'nohy-konicke': 'kónické nohy', 'nohy-sikme': 'šikmé nohy', bocnice: 'bočnice',
  kozy: 'kozy', 'kontejner-nosny': 'nese kontejner', 'stavitelny-ram': 'stavitelný rám',
}

const PASMA = [
  { id: 'vse', label: 'Všechny ceny', test: () => true },
  { id: 'do10', label: 'do 10 tis.', test: (s: number) => s < 10000 },
  { id: '10-20', label: '10–20 tis.', test: (s: number) => s >= 10000 && s < 20000 },
  { id: '20-35', label: '20–35 tis.', test: (s: number) => s >= 20000 && s < 35000 },
  { id: 'nad35', label: 'nad 35 tis.', test: (s: number) => s >= 35000 },
]

export function Galerie() {
  const nactiPreset = useStore((s) => s.nactiPreset)
  const [rodina, setRodina] = useState<string>('vse')
  const [pasmo, setPasmo] = useState<string>('vse')

  const data = useMemo(
    () => PRESETY.map((p) => {
      const o = odhadNaMiru(p)
      const k = kontroly(p)
      return { p, odhad: o, stred: (o.celkem.od + o.celkem.do) / 2, stav: nejhorsiStav(k) }
    }),
    [],
  )

  const filtr = PASMA.find((x) => x.id === pasmo)!
  const videt = data.filter((d) => (rodina === 'vse' || d.p.rodina === rodina) && filtr.test(d.stred))

  return (
    <div className="galerie">
      <div className="galerie-hlava">
        <h2>Galerie presetů</h2>
        <p>{PRESETY.length} kompletních kombinací v {RODINY.length} rodinách. Klikni a preset se načte do konfigurátoru, kde ho můžeš dál ladit.</p>
      </div>

      <div className="filtry">
        <button className={rodina === 'vse' ? 'on' : ''} onClick={() => setRodina('vse')}>Všechny rodiny</button>
        {RODINY.map((r) => (
          <button key={r.id} className={rodina === r.id ? 'on' : ''} onClick={() => setRodina(r.id)} title={r.popis}>
            {r.nazev}
          </button>
        ))}
      </div>
      <div className="filtry">
        {PASMA.map((x) => (
          <button key={x.id} className={pasmo === x.id ? 'on' : ''} onClick={() => setPasmo(x.id)}>{x.label}</button>
        ))}
      </div>

      {rodina !== 'vse' && (
        <p className="poznamka" style={{ margin: '0 0 12px' }}>
          {RODINY.find((r) => r.id === rodina)?.popis}
        </p>
      )}

      <div className="mriz">
        {videt.map(({ p, odhad, stav }) => {
          const r = p.rozmery
          const jeL = p.tvar === 'L' && r.ramenoBDelka > 0
          return (
            <button key={p.id} className="karta" onClick={() => nactiPreset(p)}>
              <div className="nahled">
                <Nahled config={p} sirka={260} vyska={168} />
              </div>
              <div className="info">
                <div className="rodina">{RODINY.find((x) => x.id === p.rodina)?.nazev}</div>
                <h4>{p.nazev}</h4>
                <p>{p.popis}</p>
                <div className="cena">
                  na míru {formatRozpeti(odhad.celkem)}
                  {stav === 'chyba' && <span style={{ color: 'var(--chyba)' }}> · nevejde se</span>}
                  {stav === 'pozor' && <span style={{ color: 'var(--pozor)' }}> · na hraně</span>}
                </div>
                <div className="stitky">
                  <span>{jeL ? `${Math.round(r.ramenoADelka / 10)} × ${Math.round(r.ramenoBDelka / 10)} cm` : `${Math.round(r.ramenoADelka / 10)} cm`}</span>
                  <span>{material(p.deska.materialId).kratky}</span>
                  <span>{p.deska.tloustka} mm</span>
                  <span>{PODNOZ_LABEL[p.podnoz.typ]}</span>
                  {p.ulozne.length > 0 && <span>{p.ulozne.map((u) => u.typ).join(' + ')}</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {!videt.length && <p className="poznamka">V tomhle filtru nic není.</p>}
    </div>
  )
}
