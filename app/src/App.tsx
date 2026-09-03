import { useStore, type Zalozka } from './store'
import { Scene, type Pohled } from './three/Scene'
import { Configurator } from './ui/Configurator'
import { FloorPlan } from './ui/FloorPlan'
import { Kontroly } from './ui/Kontroly'
import { Galerie } from './ui/Galerie'
import { Koupit } from './ui/Koupit'
import { Export } from './ui/Export'
import { useState } from 'react'

const ZALOZKY: Array<{ id: Zalozka; label: string }> = [
  { id: 'konfigurator', label: 'Konfigurátor' },
  { id: 'galerie', label: 'Galerie presetů' },
  { id: 'koupit', label: 'Koupit / na míru' },
  { id: 'export', label: 'Export poptávky' },
]

const POHLEDY: Pohled[] = ['perspektiva', 'celne', 'bok', 'shora']

export function App() {
  const config = useStore((s) => s.config)
  const zalozka = useStore((s) => s.zalozka)
  const setZalozka = useStore((s) => s.setZalozka)
  const ukazMistnost = useStore((s) => s.ukazMistnost)
  const setUkazMistnost = useStore((s) => s.setUkazMistnost)
  const zpet = useStore((s) => s.zpet)
  const [pohled, setPohled] = useState<Pohled>('perspektiva')

  return (
    <div className="app">
      <header className="hlavicka">
        <div className="znacka">
          <strong>Pracovní stůl do obýváku</strong>
          <span>roh 160 × 236 cm · L deska · pevná výška</span>
        </div>
        <nav>
          {ZALOZKY.map((z) => (
            <button key={z.id} className={z.id === zalozka ? 'on' : ''} onClick={() => setZalozka(z.id)}>
              {z.label}
            </button>
          ))}
        </nav>
        <div className="akce">
          <button onClick={zpet} title="Vrátit poslední změnu">↶ Zpět</button>
        </div>
      </header>

      {zalozka === 'galerie' ? (
        <Galerie />
      ) : (
        <div className="telo">
          <aside className="vlevo">
            {zalozka === 'konfigurator' && <Configurator />}
            {zalozka === 'koupit' && <Koupit />}
            {zalozka === 'export' && <Export />}
          </aside>

          <main className="viewport">
            <Scene config={config} pohled={pohled} ukazMistnost={ukazMistnost} />
            <div className="pohledy">
              {POHLEDY.map((p) => (
                <button key={p} className={p === pohled ? 'on' : ''} onClick={() => setPohled(p)}>{p}</button>
              ))}
              <button className={ukazMistnost ? 'on' : ''} onClick={() => setUkazMistnost(!ukazMistnost)}>
                místnost
              </button>
            </div>
          </main>

          <aside className="vpravo">
            <h3>Půdorys a rezervy</h3>
            <FloorPlan config={config} sirka={400} />
            <Kontroly />
          </aside>
        </div>
      )}
    </div>
  )
}
