import { useMemo, useRef, useState } from 'react'
import { useStore } from '@/store'
import { Vykres } from '@/export/Vykres'
import { textEmailu, cutListCsv, stahni } from '@/export/email'
import { odhadNaMiru } from '@/pricing/odhad'
import { formatRozpeti } from '@/pricing/ceny'

export function Export() {
  const config = useStore((s) => s.config)
  const [zkopirovano, setZkopirovano] = useState(false)
  const svgRef = useRef<HTMLDivElement>(null)

  const email = useMemo(() => textEmailu(config), [config])
  const odhad = useMemo(() => odhadNaMiru(config), [config])
  const jmeno = (config.nazev || 'stul').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')

  const svgText = () => {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return ''
    const klon = svg.cloneNode(true) as SVGElement
    klon.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(klon)
  }

  const stahniVse = () => {
    stahni(svgText(), `${jmeno}-nakres.svg`, 'image/svg+xml;charset=utf-8')
    setTimeout(() => stahni(cutListCsv(config), `${jmeno}-rozpiska.csv`, 'text/csv;charset=utf-8'), 250)
    setTimeout(() => stahni(email, `${jmeno}-poptavka.txt`, 'text/plain;charset=utf-8'), 500)
  }

  const tisk = () => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!doctype html><html lang="cs"><head><meta charset="utf-8">
      <title>Poptávka — ${config.nazev}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font: 11px/1.5 system-ui, sans-serif; color: #3A2C20; }
        svg { width: 100%; height: auto; }
        pre { white-space: pre-wrap; font: 10px/1.45 ui-monospace, monospace; page-break-before: always; }
        h2 { font-size: 13px; margin: 14px 0 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { border-bottom: 1px solid #ddd; padding: 3px 5px; text-align: left; }
      </style></head><body>
      ${svgText()}
      <h2>Rozpiska dílců</h2>
      <table><thead><tr><th>Ks</th><th>Dílec</th><th>Rozměr (mm)</th><th>Materiál</th><th>Hrana</th></tr></thead><tbody>
      ${odhad.dilce.map((d) => `<tr><td>${d.ks}×</td><td>${d.nazev}</td><td>${d.delka} × ${d.sirka} × ${d.tloustka}</td><td>${d.material}</td><td>${d.hrany}</td></tr>`).join('')}
      </tbody></table>
      <h2>Kování</h2>
      <table><tbody>${odhad.kovani.map((k) => `<tr><td>${k.ks}×</td><td>${k.nazev}${k.poznamka ? ` — ${k.poznamka}` : ''}</td></tr>`).join('')}</tbody></table>
      <pre>${email.replace(/[<>&]/g, (m) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m]!))}</pre>
      </body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 400)
  }

  return (
    <div className="panel">
      <section className="sekce">
        <h4>Export poptávky</h4>
        <p className="poznamka">
          Vygeneruje technický nákres s kótami, rozpisku dílců a hotový text e‑mailu pro truhláře.
          Nákres se kreslí ze stejných parametrů jako 3D model, takže nemůže „utéct" od skutečnosti.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <button className="tlacitko" onClick={stahniVse}>Stáhnout nákres, rozpisku i e‑mail</button>
          <button className="tlacitko druhotne" onClick={tisk}>Tisk / PDF</button>
          <button
            className="tlacitko druhotne"
            onClick={() => {
              navigator.clipboard?.writeText(email).then(() => {
                setZkopirovano(true)
                setTimeout(() => setZkopirovano(false), 2000)
              })
            }}
          >
            {zkopirovano ? 'Zkopírováno ✓' : 'Zkopírovat e‑mail'}
          </button>
        </div>
      </section>

      <section className="sekce">
        <h4>Technický nákres</h4>
        <div ref={svgRef} style={{ overflowX: 'auto', border: '1px solid var(--linka)', borderRadius: 10, background: '#fff' }}>
          <Vykres config={config} sirka={1050} vyska={760} />
        </div>
      </section>

      <section className="sekce">
        <h4>Text e‑mailu</h4>
        <textarea
          readOnly
          value={email}
          style={{
            width: '100%', height: 340, font: '11px/1.5 ui-monospace, monospace',
            border: '1px solid var(--linka)', borderRadius: 9, padding: 10,
            background: 'var(--krem)', color: 'var(--text)', resize: 'vertical',
          }}
        />
      </section>

      <section className="sekce">
        <h4>Orientační cena</h4>
        <p style={{ fontSize: 15, fontWeight: 700, margin: '4px 0' }}>{formatRozpeti(odhad.celkem)}</p>
        <p className="poznamka">
          Odhad z veřejných sazeb, ne nabídka. Práce {odhad.hodiny.od.toFixed(1)}–{odhad.hodiny.do.toFixed(1)} h.
        </p>
      </section>
    </div>
  )
}
