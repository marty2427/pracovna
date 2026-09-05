import { useMemo } from 'react'
import { useStore } from '@/store'
import { odhadNaMiru } from '@/pricing/odhad'
import { formatRozpeti, formatKc, ZDROJ } from '@/pricing/ceny'
import { KATALOG, jePrazdny, deskyProRameno, rohoveDeskyVcelku, podnozeProTyp, rohoveStolyDoProstoru, type KatalogPolozka, type DeskaNalez } from '@/pricing/katalog'
import { MAX_RAMENO_A, SPACE } from '@/model/space'

function Radek({ p, chybi }: { p: KatalogPolozka; chybi?: number }) {
  return (
    <tr style={chybi ? { opacity: 0.75 } : undefined}>
      <td>
        {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.nazev}</a> : p.nazev}
        <br /><span style={{ color: 'var(--text-3)', fontSize: 10.5 }}>
          {p.delka > 0 && `${p.delka}×${p.sirka}${p.tloustka ? `×${p.tloustka}` : ''} mm · `}{p.popis}
          {!p.overeno && ' · neověřeno'}
        </span>
        {p.varovani && <><br /><span style={{ color: 'var(--pozor)', fontSize: 10.5 }}>⚠ {p.varovani}</span></>}
        {!!chybi && (
          <><br /><span style={{ color: 'var(--pozor)', fontSize: 10.5 }}>
            o {Math.round(chybi / 10)} cm mělčí, než chceš — buď zúžit desku, nebo srazit dvě vedle sebe
          </span></>
        )}
      </td>
      <td>{p.prodejce}</td>
      <td className="cislo">{formatKc(p.cena)}</td>
    </tr>
  )
}

export function Koupit() {
  const config = useStore((s) => s.config)
  const odhad = useMemo(() => odhadNaMiru(config), [config])
  const r = config.rozmery

  // Dvoudílné L: deska pro rameno A v plné délce, deska pro rameno B jen na
  // část za ramenem A (v rohu se překrývají).
  const delkaB = r.ramenoBDelka - r.ramenoAHloubka
  const deskyA = useMemo<DeskaNalez[]>(
    () => deskyProRameno(r.ramenoADelka, r.ramenoAHloubka, config.deska.tloustka).slice(0, 4),
    [r.ramenoADelka, r.ramenoAHloubka, config.deska.tloustka],
  )
  const deskyB = useMemo<DeskaNalez[]>(
    () => deskyProRameno(delkaB, r.ramenoBHloubka, config.deska.tloustka).slice(0, 3),
    [delkaB, r.ramenoBHloubka, config.deska.tloustka],
  )
  const vcelku = useMemo(() => rohoveDeskyVcelku(r.ramenoADelka, r.ramenoBDelka).slice(0, 4), [r.ramenoADelka, r.ramenoBDelka])
  const podnoze = useMemo(() => podnozeProTyp(config.podnoz.typ).slice(0, 4), [config.podnoz.typ])
  const stoly = useMemo(() => rohoveStolyDoProstoru(MAX_RAMENO_A, SPACE.zadniStenaKeGauci), [])

  const bocnice = config.podnoz.typ === 'bocnice'
  const cenaPodnozi = bocnice ? 0 : (podnoze[0]?.cena ?? 0) * 3
  const dvoudilne = (deskyA[0]?.cena ?? 0) + (deskyB[0]?.cena ?? 0)
  const jednodilne = vcelku[0]?.cena ?? 0
  const nejlevnejsiDeska = [dvoudilne, jednodilne].filter((x) => x > 0).sort((a, b) => a - b)[0] ?? 0

  return (
    <div className="panel">
      <section className="sekce">
        <h4>Na míru — rozpad ceny</h4>
        <table className="rozpiska">
          <thead>
            <tr><th>Položka</th><th className="cislo">Kč</th></tr>
          </thead>
          <tbody>
            {odhad.radky.map((x, i) => (
              <tr key={i}>
                <td><b>{x.nazev}</b><br /><span style={{ color: 'var(--text-3)', fontSize: 10.5 }}>{x.detail}</span></td>
                <td className="cislo">{formatRozpeti(x.cena)}</td>
              </tr>
            ))}
            <tr className="soucet">
              <td>Celkem u truhláře</td>
              <td className="cislo">{formatRozpeti(odhad.celkem)}</td>
            </tr>
          </tbody>
        </table>
        <p className="poznamka" style={{ marginTop: 8 }}>
          Sazby pochází z {ZDROJ}. Jsou to rozpětí, ne nabídka — skutečná cena se pozná až z poptávky.
          Kontakty na truhláře v Brně jsou v <code>research/vyrobci.md</code>.
        </p>
      </section>

      <section className="sekce">
        <h4>Koupit — stavebnice L stolu</h4>
        {jePrazdny() ? (
          <p className="poznamka">
            Katalog dílů se zatím nenaplnil z rešerše. Rozpad ceny na míru výše funguje nezávisle.
          </p>
        ) : (
          <>
            <p className="poznamka">
              Jen díly na L: rohová deska vcelku, nebo dvě desky sražené v rohu, a k tomu podnož.
              Rameno A {Math.round(r.ramenoADelka / 10)} × {Math.round(r.ramenoAHloubka / 10)} cm,
              rameno B {Math.round(r.ramenoBDelka / 10)} × {Math.round(r.ramenoBHloubka / 10)} cm
              (za ramenem A zbývá {Math.round(delkaB / 10)} cm).
            </p>
            <table className="rozpiska">
              <thead><tr><th>Díl</th><th>Kde</th><th className="cislo">Kč</th></tr></thead>
              <tbody>
                <tr><td colSpan={3} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)' }}>Rohová deska vcelku</td></tr>
                {vcelku.length ? vcelku.map((d) => <Radek key={d.id} p={d} />) : (
                  <tr><td colSpan={3} className="poznamka">V katalogu není rohová deska, která by pokryla {Math.round(r.ramenoADelka / 10)} × {Math.round(r.ramenoBDelka / 10)} cm.</td></tr>
                )}
                <tr><td colSpan={3} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)' }}>Nebo dvě desky: rameno A</td></tr>
                {deskyA.map((d) => <Radek key={d.id} p={d} chybi={d.chybiHloubka} />)}
                <tr><td colSpan={3} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)' }}>… a rameno B ({Math.round(delkaB / 10)} × {Math.round(r.ramenoBHloubka / 10)} cm)</td></tr>
                {deskyB.map((d) => <Radek key={d.id} p={d} chybi={d.chybiHloubka} />)}
                <tr><td colSpan={3} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)' }}>Podnož (na L potřebuješ 2 rámy + rohovou nohu, tedy 3 ks)</td></tr>
                {bocnice ? (
                  <tr><td colSpan={3} className="poznamka">Plné bočnice se nekupují hotové — dělá je truhlář ze stejného materiálu jako desku. Cena je v rozpadu nahoře.</td></tr>
                ) : podnoze.map((p) => <Radek key={p.id} p={p} />)}
                {nejlevnejsiDeska > 0 && (
                  <tr className="soucet">
                    <td>Nejlevnější kombinace deska + podnož</td>
                    <td />
                    <td className="cislo">od {formatKc(nejlevnejsiDeska + cenaPodnozi)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </section>

      {!jePrazdny() && (
        <section className="sekce">
          <h4>Koupit — hotový rohový stůl</h4>
          <p className="poznamka">
            Rovné stoly tu nejsou, chceš jen L. Sériový rohový stůl na {MAX_RAMENO_A / 10} × {Math.round((SPACE.zadniStenaKeGauci - SPACE.mezeraKeGauci.doporuceno) / 10)} cm
            nikdo nevyrábí — tohle jsou všechny rohové kusy z rešerše, a všechny jsou o dost menší než tvůj roh.
          </p>
          {stoly.length ? (
            <table className="rozpiska">
              <thead><tr><th>Model</th><th>Kde</th><th className="cislo">Kč</th></tr></thead>
              <tbody>{stoly.map((s) => <Radek key={s.id} p={s} />)}</tbody>
            </table>
          ) : <p className="poznamka">V katalogu není žádný rohový stůl.</p>}
        </section>
      )}

      <section className="sekce">
        <h4>Rozpiska dílců</h4>
        <table className="rozpiska">
          <thead><tr><th>Ks</th><th>Dílec</th><th>Rozměr (mm)</th></tr></thead>
          <tbody>
            {odhad.dilce.map((d, i) => (
              <tr key={i}>
                <td className="cislo">{d.ks}×</td>
                <td>{d.nazev}<br /><span style={{ color: 'var(--text-3)', fontSize: 10.5 }}>{d.material} · {d.hrany}</span></td>
                <td className="cislo">{d.delka} × {d.sirka} × {d.tloustka}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {odhad.kovani.length > 0 && (
          <>
            <h4 style={{ marginTop: 12 }}>Kování a doplňky</h4>
            <table className="rozpiska">
              <tbody>
                {odhad.kovani.map((k, i) => (
                  <tr key={i}><td className="cislo">{k.ks}×</td><td>{k.nazev}{k.poznamka && <span style={{ color: 'var(--text-3)' }}> — {k.poznamka}</span>}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="poznamka" style={{ marginTop: 8 }}>
          Katalog: {KATALOG.meta.stav}. {KATALOG.meta.odstraneno}.
          {KATALOG.meta.kontrola && <><br />Kontrola ceníku: {KATALOG.meta.kontrola}</>}
        </p>
      </section>
    </div>
  )
}
