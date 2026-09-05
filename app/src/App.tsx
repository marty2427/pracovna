import { useStore, type Zalozka } from './store'
import { Scene, type Pohled } from './three/Scene'
import { Configurator } from './ui/Configurator'
import { FloorPlan } from './ui/FloorPlan'
import { Kontroly } from './ui/Kontroly'
import { Galerie } from './ui/Galerie'
import { Koupit } from './ui/Koupit'
import { Export } from './ui/Export'
import { useState } from 'react'
import { SPACE } from './model/space'
import { plochaDesky, obvodDesky, hmotnost } from './model/constraints'

const ZALOZKY: Array<{ id: Zalozka; label: string }> = [
  { id: 'konfigurator', label: 'Konfigurátor' },
  { id: 'galerie', label: 'Galerie presetů' },
  { id: 'koupit', label: 'Koupit / na míru' },
  { id: 'export', label: 'Export poptávky' },
]

const POHLEDY: Array<{ id: Pohled; label: string }> = [
  { id: 'perspektiva', label: 'Perspektiva' },
  { id: 'celne', label: 'Zepředu' },
  { id: 'bok', label: 'Od gauče' },
  { id: 'pruchod', label: 'Z průchodu' },
  { id: 'obraz', label: 'Skrz stěnu s obrazem' },
  { id: 'shora', label: 'Shora' },
]

export function App() {
  const config = useStore((s) => s.config)
  const zalozka = useStore((s) => s.zalozka)
  const setZalozka = useStore((s) => s.setZalozka)
  const ukazMistnost = useStore((s) => s.ukazMistnost)
  const setUkazMistnost = useStore((s) => s.setUkazMistnost)
  const zpet = useStore((s) => s.zpet)
  const mistnost = useStore((s) => s.mistnost)
  const setMistnost = useStore((s) => s.setMistnost)
  const [pohled, setPohled] = useState<Pohled>('perspektiva')

  return (
    <div className="app">
      <header className="hlavicka">
        <div className="znacka">
          <strong>Pracovní stůl do obýváku</strong>
          <span>roh 160 × 236 cm · L deska · pevná výška · gauč do U · monitor 32"</span>
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

      {zalozka === 'galerie' && <Galerie />}

      {zalozka === 'konfigurator' && (
        <div className="telo">
          <aside className="vlevo"><Configurator /></aside>
          <main className="viewport">
            <Scene config={config} pohled={pohled} ukazMistnost={ukazMistnost} lehatko={mistnost.lehatko} />
            <div className="pohledy">
              {POHLEDY.map((p) => (
                <button key={p.id} data-pohled={p.id} className={p.id === pohled ? 'on' : ''} onClick={() => setPohled(p.id)}>{p.label}</button>
              ))}
              <button className={ukazMistnost ? 'on' : ''} onClick={() => setUkazMistnost(!ukazMistnost)}>místnost</button>
            </div>
            <div className="viewport-info">
              <span>plocha desky <b>{plochaDesky(config).toFixed(2)} m²</b></span>
              <span>hrana <b>{obvodDesky(config).toFixed(2)} bm</b></span>
              <span>hmotnost <b>~{hmotnost(config)} kg</b></span>
            </div>
          </main>
          <aside className="vpravo">
            <h3>Půdorys a rezervy</h3>
            <FloorPlan config={config} sirka={396} mistnost={mistnost} />
            <label className="posuvnik lehatko">
              <span className="radek"><span>Lehátko gauče od zadní stěny</span><output>{Math.round(mistnost.lehatko / 10)} cm</output></span>
              <input type="range" min={SPACE.gauc.lehatko.min} max={SPACE.gauc.lehatko.max} step={50} value={mistnost.lehatko}
                     onChange={(e) => setMistnost({ lehatko: Number(e.target.value) })} />
              <span className="meze"><span>{SPACE.gauc.lehatko.min / 10}</span><em>doměř si to doma, výchozí je odhad</em><span>{SPACE.gauc.lehatko.max / 10}</span></span>
            </label>
            <Kontroly />
          </aside>
        </div>
      )}

      {(zalozka === 'koupit' || zalozka === 'export') && (
        <div className="telo dokument">
          <main className="dokument-obsah">
            {zalozka === 'koupit' ? <Koupit /> : <Export />}
          </main>
          <aside className="vpravo">
            <h3>Náhled</h3>
            <div className="mini3d">
              <Scene config={config} pohled="perspektiva" ukazMistnost={false} efekty={false} />
            </div>
            <h3 style={{ marginTop: 14 }}>Půdorys a rezervy</h3>
            <FloorPlan config={config} sirka={396} mistnost={mistnost} />
            <Kontroly />
          </aside>
        </div>
      )}
    </div>
  )
}
