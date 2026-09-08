import { MATERIALY } from '@/model/materials'
import { nahledDekoru, useDekoryNacteny } from '@/three/useMaterials'

/**
 * Vzorník dekorů jako u výrobce: dlaždice s kresbou dřeva, pod ní název a kód.
 * Kresba je ta samá, kterou používá 3D model, takže co vidíš tady, uvidíš na stole.
 */
export function VyberDekoru({ hodnota, onChange }: { hodnota: string; onChange: (id: string) => void }) {
  useDekoryNacteny()
  return (
    <div className="dekory">
      {MATERIALY.map((m) => (
        <button key={m.id} type="button" className={m.id === hodnota ? 'on' : ''} onClick={() => onChange(m.id)}
                title={m.nazev + (m.poznamka ? ` — ${m.poznamka}` : '')}>
          <span className="dlazdice" style={{ backgroundImage: `url(${nahledDekoru(m.id)})`, backgroundColor: m.barva }} />
          <span className="nazev">{m.kratky.replace(/ H\d+$/, '')}</span>
          <span className="kod">{m.kod} {m.struktura?.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  )
}
