import { useState } from 'react'
import { Scene, type Pohled } from './three/Scene'
import { vychoziKonfigurace } from './model/defaults'

export function App() {
  const [config] = useState(vychoziKonfigurace)
  const [pohled, setPohled] = useState<Pohled>('perspektiva')
  return (
    <div className="app">
      <div className="viewport">
        <Scene config={config} pohled={pohled} />
        <div className="pohledy">
          {(['perspektiva', 'celne', 'bok', 'shora'] as Pohled[]).map((p) => (
            <button key={p} className={p === pohled ? 'on' : ''} onClick={() => setPohled(p)}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
