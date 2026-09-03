import { useMemo } from 'react'
import { useStore } from '@/store'
import { odhadNaMiru } from '@/pricing/odhad'
import { formatRozpeti, formatKc, ZDROJ } from '@/pricing/ceny'
import { KATALOG, jePrazdny, deskyProRozmer, podnozeProTyp, stolyDoProstoru } from '@/pricing/katalog'
import { MAX_RAMENO_A, SPACE } from '@/model/space'

export function Koupit() {
  const config = useStore((s) => s.config)
  const odhad = useMemo(() => odhadNaMiru(config), [config])
  const r = config.rozmery
  const jeL = config.tvar === 'L' && r.ramenoBDelka > 0

  const desky = useMemo(
    () => deskyProRozmer(r.ramenoADelka, r.ramenoAHloubka, config.deska.tloustka).slice(0, 5),
    [r.ramenoADelka, r.ramenoAHloubka, config.deska.tloustka],
  )
  const podnoze = useMemo(() => podnozeProTyp(config.podnoz.typ).slice(0, 5), [config.podnoz.typ])
  const stoly = useMemo(
    () => stolyDoProstoru(MAX_RAMENO_A, r.ramenoAHloubka).slice(0, 6),
    [r.ramenoAHloubka],
  )

  const stavebniceOd = (desky[0]?.cena ?? 0) + (podnoze[0]?.cena ?? 0) * (jeL ? 3 : 2)

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
        <h4>Koupit — stavebnice</h4>
        {jePrazdny() ? (
          <p className="poznamka">
            Katalog dílů se zatím nenaplnil z rešerše. Rozpad ceny na míru výše funguje nezávisle.
          </p>
        ) : (
          <>
            <p className="poznamka">
              Deska z katalogu + podnož. Pro rameno A {Math.round(r.ramenoADelka / 10)} × {Math.round(r.ramenoAHloubka / 10)} cm
              {jeL && ` a rameno B ${Math.round(r.ramenoBDelka / 10)} × ${Math.round(r.ramenoBHloubka / 10)} cm`}.
              {desky.length > 0 && desky[0].chybiHloubka > 0 && (
                <> Nejhlubší deska v katalogu má {Math.round(Math.min(desky[0].delka, desky[0].sirka) / 10)} cm —
                pro hlubší stůl je potřeba deska na míru, nebo hloubku snížit.</>
              )}
            </p>
            <table className="rozpiska">
              <thead><tr><th>Díl</th><th>Kde</th><th className="cislo">Kč</th></tr></thead>
              <tbody>
                {desky.map((d) => (
                  <tr key={d.id} style={d.chybiHloubka > 0 ? { opacity: 0.75 } : undefined}>
                    <td>
                      {d.url ? <a href={d.url} target="_blank" rel="noreferrer">{d.nazev}</a> : d.nazev}
                      <br /><span style={{ color: 'var(--text-3)', fontSize: 10.5 }}>
                        {d.delka > 0 && `${d.delka}×${d.sirka}${d.tloustka ? `×${d.tloustka}` : ''} mm · `}{d.popis}
                        {!d.overeno && ' · neověřeno'}
                      </span>
                      {d.varovani && (
                        <><br /><span style={{ color: 'var(--pozor)', fontSize: 10.5 }}>⚠ {d.varovani}</span></>
                      )}
                      {d.chybiHloubka > 0 && (
                        <><br /><span style={{ color: 'var(--pozor)', fontSize: 10.5 }}>
                          o {Math.round(d.chybiHloubka / 10)} cm mělčí, než chceš — buď zúžit desku, nebo srazit dvě vedle sebe
                        </span></>
                      )}
                    </td>
                    <td>{d.prodejce}</td>
                    <td className="cislo">{formatKc(d.cena)}</td>
                  </tr>
                ))}
                {podnoze.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.nazev}</a> : p.nazev}
                      <br /><span style={{ color: 'var(--text-3)', fontSize: 10.5 }}>{p.popis}{!p.overeno && ' · neověřeno'}</span>
                      {p.varovani && <><br /><span style={{ color: 'var(--pozor)', fontSize: 10.5 }}>⚠ {p.varovani}</span></>}
                    </td>
                    <td>{p.prodejce}</td>
                    <td className="cislo">{formatKc(p.cena)}</td>
                  </tr>
                ))}
                {stavebniceOd > 0 && (
                  <tr className="soucet">
                    <td>Nejlevnější kombinace deska + podnož</td>
                    <td />
                    <td className="cislo">od {formatKc(stavebniceOd)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </section>

      {!jePrazdny() && stoly.length > 0 && (
        <section className="sekce">
          <h4>Koupit — hotový sériový stůl</h4>
          <p className="poznamka">
            Do rohu {SPACE.zadniStenaKeGauci / 10} × {SPACE.levaStenaRun / 10} cm se žádný sériový L stůl
            v tomhle poměru ramen netrefí přesně. Tohle jsou nejbližší kusy, které se do prostoru vejdou.
          </p>
          <table className="rozpiska">
            <thead><tr><th>Model</th><th>Kde</th><th className="cislo">Kč</th></tr></thead>
            <tbody>
              {stoly.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.nazev}</a> : s.nazev}
                    <br /><span style={{ color: 'var(--text-3)', fontSize: 10.5 }}>
                      {s.delka > 0 && `${s.delka}×${s.sirka} mm · `}{s.popis}{!s.overeno && ' · neověřeno'}
                    </span>
                    {s.varovani && <><br /><span style={{ color: 'var(--pozor)', fontSize: 10.5 }}>⚠ {s.varovani}</span></>}
                  </td>
                  <td>{s.prodejce}</td>
                  <td className="cislo">{formatKc(s.cena)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
