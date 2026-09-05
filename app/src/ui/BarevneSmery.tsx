import { useState } from 'react'
import { useStore } from '@/store'
import { PALETA } from '@/model/materials'
import type { DeskConfig } from '@/model/types'

interface Smer {
  id: string
  nazev: string
  deska: string
  podnoz: string
  detail: string
  proc: string
  pozor: string
  material_hint: string
  odvozeno_z: string[]
}

/** Jak se barevný směr promítne do konfigurace. */
const APLIKACE: Record<string, (c: DeskConfig) => Partial<DeskConfig>> = {
  'shoda-podlaha': (c) => ({
    deska: { ...c.deska, materialId: 'dub-podlaha-masiv' },
    podnoz: { ...c.podnoz, material: 'kov', barva: '#1F2021' },
  }),
  'o-ton-tmavsi': (c) => ({
    deska: { ...c.deska, materialId: 'dub-kourovy-masiv' },
    podnoz: { ...c.podnoz, material: 'kov', barva: '#1F2021' },
  }),
  'o-ton-svetlejsi': (c) => ({
    deska: { ...c.deska, materialId: 'dub-svetly-masiv' },
    podnoz: { ...c.podnoz, material: 'drevo', materialId: 'dub-svetly-masiv' },
  }),
  // Černá deska vypadla (uživatel chce jen dřevo) — kontrast dělá tmavý ořech s černým rámem.
  'kontrast-cerna': (c) => ({
    deska: { ...c.deska, materialId: 'orech-masiv' },
    podnoz: { ...c.podnoz, material: 'kov', barva: '#1F2021' },
  }),
  'kov-drevo': (c) => ({
    deska: { ...c.deska, materialId: 'dub-podlaha-masiv' },
    podnoz: { ...c.podnoz, material: 'kov', barva: '#1F2021', typ: c.podnoz.typ.startsWith('ram') ? c.podnoz.typ : 'ram-hranaty' },
  }),
  // Neutrál: nejsvětlejší dřevo (jasan) s bílým rámem místo krémového lamina.
  neutral: (c) => ({
    deska: { ...c.deska, materialId: 'jasan-masiv' },
    podnoz: { ...c.podnoz, material: 'kov', barva: '#E8E6E1' },
  }),
  'akcent-gauc-obraz': (c) => ({
    deska: { ...c.deska, materialId: 'dub-svetly-masiv' },
    podnoz: { ...c.podnoz, material: 'kov', barva: '#1F2021' },
    ulozne: c.ulozne.length
      ? c.ulozne.map((u, i) => (i === 0 ? { ...u, barvaCel: '#0F5A78' } : u))
      : [{ typ: 'kontejner-pevny' as const, rameno: 'A' as const, pozice: 1.0, barvaCel: '#0F5A78' }],
  }),
}

export function BarevneSmery() {
  const nastav = useStore((s) => s.nastav)
  const [otevreny, setOtevreny] = useState<string | null>(null)
  const smery = ((PALETA as any).directions ?? []) as Smer[]
  const meta = (PALETA as any).meta ?? {}

  if (!smery.length) return null

  return (
    <section className="skupina">
      <h3>Barevné směry</h3>
      <p className="popis">
        Odvozené ze skutečných pixelů z fotky místnosti ({meta.image}
        {meta.source === 'sampled' ? ', navzorkováno' : ''}). Klikni a aplikuje se na stůl.
      </p>
      <div className="smery">
        {smery.map((s) => (
          <div key={s.id} className={`smer ${otevreny === s.id ? 'otevreny' : ''}`}>
            <button className="smer-hlava" onClick={() => setOtevreny(otevreny === s.id ? null : s.id)}>
              <span className="vzorky">
                <i style={{ background: s.deska }} title={`deska ${s.deska}`} />
                <i style={{ background: s.podnoz }} title={`podnož ${s.podnoz}`} />
                <i style={{ background: s.detail }} title={`detail ${s.detail}`} />
              </span>
              <span className="smer-nazev">{s.nazev}</span>
              <span className="sipka">{otevreny === s.id ? '▾' : '▸'}</span>
            </button>
            {otevreny === s.id && (
              <div className="smer-telo">
                <p><b>Proč sem sedí:</b> {s.proc}</p>
                <p><b>Na co pozor:</b> {s.pozor}</p>
                <p className="odvozeno">Materiál: {s.material_hint}</p>
                <p className="odvozeno">Odvozeno z: {s.odvozeno_z.join(' · ')}</p>
                <button
                  className="tlacitko"
                  onClick={() => { const f = APLIKACE[s.id]; if (f) nastav(f) }}
                >
                  Použít na stůl
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
