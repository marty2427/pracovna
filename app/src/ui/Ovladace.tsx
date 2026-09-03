import type { ReactNode } from 'react'

export function Skupina({ titulek, popis, children }: { titulek: string; popis?: string; children: ReactNode }) {
  return (
    <section className="skupina">
      <h3>{titulek}</h3>
      {popis && <p className="popis">{popis}</p>}
      {children}
    </section>
  )
}

export function Posuvnik({
  label, hodnota, min, max, krok = 10, jednotka = 'cm', delitel = 10, onChange, napoveda,
}: {
  label: string; hodnota: number; min: number; max: number; krok?: number
  jednotka?: string; delitel?: number; napoveda?: string
  onChange: (v: number) => void
}) {
  return (
    <label className="posuvnik">
      <span className="radek">
        <span>{label}</span>
        <output>{Math.round(hodnota / delitel)} {jednotka}</output>
      </span>
      <input
        type="range" min={min} max={max} step={krok} value={hodnota}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="meze">
        <span>{Math.round(min / delitel)}</span>
        {napoveda && <em>{napoveda}</em>}
        <span>{Math.round(max / delitel)}</span>
      </span>
    </label>
  )
}

export interface Volba<T extends string | number> {
  hodnota: T
  label: string
  popis?: string
  barva?: string
}

export function Prepinac<T extends string | number>({
  label, hodnota, volby, onChange, sloupce = 2,
}: {
  label?: string; hodnota: T; volby: Volba<T>[]; sloupce?: number
  onChange: (v: T) => void
}) {
  return (
    <div className="prepinac">
      {label && <span className="prepinac-label">{label}</span>}
      <div className="prepinac-mriz" style={{ gridTemplateColumns: `repeat(${sloupce}, minmax(0, 1fr))` }}>
        {volby.map((v) => (
          <button
            key={String(v.hodnota)}
            className={v.hodnota === hodnota ? 'on' : ''}
            onClick={() => onChange(v.hodnota)}
            title={v.popis}
            type="button"
          >
            {v.barva && <i className="tecka" style={{ background: v.barva }} />}
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Zaskrt({ label, hodnota, onChange, popis }: {
  label: string; hodnota: boolean; popis?: string; onChange: (v: boolean) => void
}) {
  return (
    <label className="zaskrt" title={popis}>
      <input type="checkbox" checked={hodnota} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
