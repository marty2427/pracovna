import { useState } from 'react'
import { useStore } from '@/store'
import { LIMITY, SPACE, MAX_RAMENO_A, maxRamenoB, MONITOR } from '@/model/space'
import { MATERIALY, KOV_BARVY } from '@/model/materials'
import { pracoviste } from '@/model/constraints'
import { UKONY, formatRozpeti, scal } from '@/pricing/ceny'
import { Skupina, Posuvnik, Prepinac, Zaskrt, type Volba } from './Ovladace'
import { BarevneSmery } from './BarevneSmery'
import { VyberHrany } from './Hrany'
import type { PodnozTyp, Tloustka, Rameno, MonitorUmisteni } from '@/model/types'

/** Ikony podnoží — čárová kresba boku stolu. */
const IkonaHranaty = (
  <svg viewBox="0 0 120 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
    <rect x="4" y="6" width="112" height="7" fill="currentColor" opacity=".18" />
    <path d="M4 6h112v7H4z" />
    <path d="M18 13v33M46 13v33M18 46h28M18 17h28M74 13v33M102 13v33M74 46h28M74 17h28" />
    <path d="M16 49h4M44 49h4M72 49h4M100 49h4" strokeWidth="3" />
  </svg>
)
const IkonaBocnice = (
  <svg viewBox="0 0 120 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
    <rect x="4" y="6" width="112" height="7" fill="currentColor" opacity=".18" />
    <path d="M4 6h112v7H4z" />
    <rect x="12" y="13" width="7" height="32" fill="currentColor" opacity=".18" />
    <rect x="101" y="13" width="7" height="32" fill="currentColor" opacity=".18" />
    <path d="M12 13v32h7V13M101 13v32h7V13" />
    <path d="M19 19h82" strokeDasharray="3 3" />
    <path d="M13 48h5M102 48h5" strokeWidth="3" />
  </svg>
)

/** Podnože, které sedí do stylu místnosti — zbytek je schovaný za přepínačem. */
const PODNOZE_HLAVNI: Volba<PodnozTyp>[] = [
  { hodnota: 'ram-hranaty', label: 'Hranatý profil', meta: 'jekl 40 × 40, práškovaný komaxit — tvůj favorit', ikona: IkonaHranaty },
  { hodnota: 'bocnice', label: 'Plné bočnice', meta: 'panely stejné síly jako deska, na stínové spáře', ikona: IkonaBocnice },
]
const PODNOZE_OSTATNI: Volba<PodnozTyp>[] = [
  { hodnota: 'ram-U', label: 'Rám U' },
  { hodnota: 'ram-A', label: 'Rám A' },
  { hodnota: 'ram-H', label: 'Rám H' },
  { hodnota: 'ram-trapez', label: 'Rám trapéz' },
  { hodnota: 'hairpin', label: 'Hairpin' },
  { hodnota: 'nohy-rovne', label: 'Nohy rovné' },
  { hodnota: 'nohy-konicke', label: 'Nohy kónické' },
  { hodnota: 'nohy-sikme', label: 'Nohy šikmé' },
  { hodnota: 'kozy', label: 'Kozy' },
  { hodnota: 'stavitelny-ram', label: 'Stavitelný rám' },
]

const MONITOR_VOLBY: Array<Omit<Volba<MonitorUmisteni>, 'meta'>> = [
  { hodnota: 'roh', label: 'V rohu', popis: 'Sedí se na úhlopříčce, deska se kolem tebe obtočí. Využije roh, který je jinak mrtvý.' },
  { hodnota: 'ramenoA', label: 'Rameno A (dlouhé)', popis: 'U levé stěny, čelem ke zdi s obrazem' },
  { hodnota: 'ramenoB', label: 'Rameno B (u gauče)', popis: 'U zadní stěny, gauč po pravé ruce' },
]

export function Configurator() {
  const config = useStore((s) => s.config)
  const nastav = useStore((s) => s.nastav)
  const nastavRozmer = useStore((s) => s.nastavRozmer)
  const [ostatniPodnoze, setOstatniPodnoze] = useState(false)
  const r = config.rozmery
  const pr = pracoviste(config)

  // U každého umístění monitoru rovnou vzdálenost očí — ať je vidět, proč roh vyhrává.
  const monitorVolby: Volba<MonitorUmisteni>[] = MONITOR_VOLBY.map((v) => {
    const d = pracoviste({ ...config, doplnky: { ...config.doplnky, monitorUmisteni: v.hodnota } }).vzdalenost
    const ok = d >= MONITOR.vzdalenost.min && d <= MONITOR.vzdalenost.max
    return { ...v, meta: `oči ${Math.round(d / 10)} cm${ok ? '' : ' ✕'}` }
  })
  const bmLed = (r.ramenoADelka + r.ramenoBDelka) / 1000

  // Jediné úložné je pevný kontejner: buď je, nebo není.
  const kontejner = config.ulozne[0]
  const setKontejner = (patch: { zapnuto?: boolean; rameno?: Rameno; pozice?: number }) =>
    nastav((c) => {
      const k = c.ulozne[0] ?? { typ: 'kontejner-pevny' as const, rameno: 'A' as Rameno, pozice: 1.0 }
      if (patch.zapnuto === false) return { ulozne: [] }
      return { ulozne: [{ ...k, ...(patch.rameno ? { rameno: patch.rameno } : {}), ...(patch.pozice !== undefined ? { pozice: patch.pozice } : {}) }] }
    })

  // Jen dřevo a dřevěné dekory — barevné laky, lino a HPL vypadly na přání uživatele.
  const materialyVolby: Volba<string>[] = MATERIALY.filter((m) => m.drevo).map((m) => ({
    hodnota: m.id, label: m.kratky, popis: m.nazev + (m.poznamka ? ` — ${m.poznamka}` : ''), barva: m.barva,
  }))

  const podnozVolby = ostatniPodnoze ? [...PODNOZE_HLAVNI, ...PODNOZE_OSTATNI] : PODNOZE_HLAVNI
  const podnozMimo = !podnozVolby.some((v) => v.hodnota === config.podnoz.typ)

  return (
    <div className="panel">
      <Skupina titulek="Rozměry" popis={`L stůl přes celý roh ${SPACE.zadniStenaKeGauci / 10} × ${SPACE.levaStenaRun / 10} cm. Posuvníky nepustí přes limit prostoru; výchozí je maximum.`}>
        <Posuvnik
          label="Rameno A — délka" hodnota={r.ramenoADelka}
          min={LIMITY.ramenoADelka.min} max={MAX_RAMENO_A}
          napoveda={`max ${MAX_RAMENO_A / 10} cm = 25 cm od hrany průchodu`}
          onChange={(v) => nastavRozmer('ramenoADelka', v)}
        />
        <Posuvnik
          label="Rameno A — hloubka" hodnota={r.ramenoAHloubka}
          min={LIMITY.ramenoAHloubka.min} max={LIMITY.ramenoAHloubka.max}
          napoveda="kolik vyčnívá do místnosti"
          onChange={(v) => nastavRozmer('ramenoAHloubka', v)}
        />
        <Posuvnik
          label="Rameno B — délka" hodnota={r.ramenoBDelka}
          min={LIMITY.ramenoBDelka.min} max={maxRamenoB(r.mezeraKeGauci)}
          napoveda={`max ${Math.round(maxRamenoB(r.mezeraKeGauci) / 10)} cm podle mezery ke gauči`}
          onChange={(v) => nastavRozmer('ramenoBDelka', v)}
        />
        <Posuvnik
          label="Rameno B — hloubka" hodnota={r.ramenoBHloubka}
          min={LIMITY.ramenoBHloubka.min} max={LIMITY.ramenoBHloubka.max}
          napoveda="s monitorem v rohu pomáhá 60+"
          onChange={(v) => nastavRozmer('ramenoBHloubka', v)}
        />
        <Posuvnik
          label="Mezera ke gauči" hodnota={r.mezeraKeGauci}
          min={LIMITY.mezeraKeGauci.min} max={LIMITY.mezeraKeGauci.max} krok={5}
          napoveda="chtěl jsi 10–15 cm"
          onChange={(v) => nastavRozmer('mezeraKeGauci', v)}
        />
        <Posuvnik
          label="Výška desky" hodnota={r.vyska}
          min={LIMITY.vyska.min} max={LIMITY.vyska.max} krok={5}
          napoveda="standard 75 cm"
          onChange={(v) => nastavRozmer('vyska', v)}
        />
      </Skupina>

      <Skupina titulek="Pracoviště" popis={`${MONITOR.nazev}, zakřivený 1500R. Oči mají být ${MONITOR.vzdalenost.min / 10}–${MONITOR.vzdalenost.max / 10} cm od obrazovky — teď ${Math.round(pr.vzdalenost / 10)} cm.`}>
        <Prepinac label="Kde stojí monitor" sloupce={1} hodnota={config.doplnky.monitorUmisteni}
          volby={monitorVolby}
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, monitorUmisteni: v } }))} />
        <Posuvnik label="Posun monitoru od zdi" hodnota={config.doplnky.monitorPosun}
          min={LIMITY.monitorPosun.min} max={LIMITY.monitorPosun.max} krok={LIMITY.monitorPosun.krok} jednotka="mm" delitel={1}
          napoveda="0 = stojan opřený o zeď / v rohu"
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, monitorPosun: v } }))} />
        <Zaskrt label="Nástavec na monitor" hodnota={config.doplnky.nastavecMonitor}
          popis="Zvedne obrazovku o 10 cm; v rohu je to rohová polička."
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, nastavecMonitor: v } }))} />
      </Skupina>

      <BarevneSmery />

      <Skupina titulek="Deska">
        <Prepinac label="Materiál / dekor" sloupce={2} hodnota={config.deska.materialId}
          volby={materialyVolby}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, materialId: v } }))} />
        <Prepinac label="Tloušťka" sloupce={5}
          hodnota={config.deska.tloustka}
          volby={[18, 25, 30, 38, 40].map((t) => ({ hodnota: t as Tloustka, label: `${t} mm` }))}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, tloustka: v } }))} />
        <VyberHrany hodnota={config.deska.hrana} tloustka={config.deska.tloustka}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, hrana: v } }))} />
        <Posuvnik label="Zaoblení vnějších rohů" hodnota={config.deska.radiusRohu}
          min={0} max={80} krok={2} jednotka="mm" delitel={1}
          napoveda="rohy desky při pohledu shora"
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, radiusRohu: v } }))} />
        <Posuvnik label="Zaoblení vnitřního rohu" hodnota={config.deska.radiusVnitrni}
          min={0} max={400} krok={10} jednotka="mm" delitel={1}
          napoveda={pr.umisteni === 'roh' ? 'v rohu je tohle „výřez": deska se kolem tebe obtočí' : 'pod loktem to poznáš'}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, radiusVnitrni: v } }))} />
        <Posuvnik label="Zaoblení rohu u zdi" hodnota={config.deska.radiusUZdi}
          min={LIMITY.radiusUZdi.min} max={LIMITY.radiusUZdi.max} krok={LIMITY.radiusUZdi.krok} jednotka="mm" delitel={1}
          napoveda="víc = mezera na kabely za monitorem"
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, radiusUZdi: v } }))} />
        {pr.umisteni !== 'roh' && (
          <Posuvnik label="Výřez v přední hraně" hodnota={config.deska.vyrez}
            min={0} max={160} krok={5} jednotka="mm" delitel={1}
            napoveda={`hrana ustoupí v místě sezení (${pr.umisteni === 'ramenoB' ? 'rameno B' : 'rameno A'})`}
            onChange={(v) => nastav((c) => ({ deska: { ...c.deska, vyrez: v } }))} />
        )}
      </Skupina>

      <Skupina titulek="Podnož" popis="Do stylu místnosti sedí hranatý profil a plné bočnice. Ostatní typy jsou jen pro srovnání.">
        <Prepinac sloupce={2} velke={!ostatniPodnoze} hodnota={config.podnoz.typ}
          volby={podnozMimo ? [...podnozVolby, { hodnota: config.podnoz.typ, label: config.podnoz.typ }] : podnozVolby}
          onChange={(v) => nastav((c) => ({
            podnoz: {
              ...c.podnoz, typ: v,
              material: v.startsWith('nohy') || v === 'bocnice' || v === 'kozy' ? 'drevo' : 'kov',
              odsazeni: v === 'bocnice' ? Math.min(c.podnoz.odsazeni, 100) : c.podnoz.odsazeni,
            },
          }))} />
        <Zaskrt label="Ukázat i ostatní typy podnoží" hodnota={ostatniPodnoze} onChange={setOstatniPodnoze} />
        {config.podnoz.material === 'kov' && (
          <Prepinac label="Barva kovu" sloupce={2} hodnota={config.podnoz.barva}
            volby={KOV_BARVY.map((k) => ({ hodnota: k.barva, label: k.nazev.replace(/ \(.*/, ''), barva: k.barva }))}
            onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, barva: v } }))} />
        )}
        {config.podnoz.material === 'drevo' && (
          <Prepinac label="Dřevo podnože" sloupce={2} hodnota={config.podnoz.materialId ?? config.deska.materialId}
            volby={materialyVolby}
            onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, materialId: v } }))} />
        )}
        {config.podnoz.typ !== 'bocnice' && (
          <Posuvnik label="Profil" hodnota={config.podnoz.profil} min={20} max={80} krok={5} jednotka="mm" delitel={1}
            onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, profil: v } }))} />
        )}
        <Posuvnik label="Odsazení od hrany desky" hodnota={config.podnoz.odsazeni} min={20} max={250} krok={5} jednotka="mm" delitel={1}
          napoveda="přesah desky přes podnož"
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, odsazeni: v } }))} />
        <Zaskrt label={config.podnoz.typ === 'bocnice' ? 'Zadní výztužný panel' : 'Podélná výztuha pod deskou'} hodnota={config.podnoz.vyztuha}
          popis={config.podnoz.typ === 'bocnice' ? 'Panel mezi bočnicemi vzadu u zdi. Zpevní rám a schová kabely.' : 'Jekl pod deskou po celé délce. Výrazně prodlouží dovolený rozpon.'}
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, vyztuha: v } }))} />
        <Prepinac label="Mezilehlá podpora" sloupce={3} hodnota={config.podnoz.mezilehlaPodpora}
          volby={[
            { hodnota: 'auto' as const, label: 'Automaticky', popis: 'Přidá se, jen když je rozpon moc velký' },
            { hodnota: 'ano' as const, label: 'Vždy' },
            { hodnota: 'ne' as const, label: 'Nikdy' },
          ]}
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, mezilehlaPodpora: v } }))} />
      </Skupina>

      <Skupina titulek="Kontejner" popis="Pevný kontejner se třemi zásuvkami, stojí na podlaze pod deskou. Jiné úložné nechceš, tak tu jiné není.">
        <Zaskrt label="Pevný kontejner se třemi zásuvkami" hodnota={!!kontejner}
          onChange={(v) => setKontejner({ zapnuto: v })} />
        {kontejner && (
          <>
            <Prepinac label="Pod kterým ramenem" sloupce={2} hodnota={kontejner.rameno}
              volby={[
                { hodnota: 'A' as Rameno, label: 'Rameno A (hlavní)' },
                { hodnota: 'B' as Rameno, label: 'Rameno B (u gauče)' },
              ]}
              onChange={(v) => setKontejner({ rameno: v })} />
            <Posuvnik label="Posun podél ramene" hodnota={Math.round(kontejner.pozice * 100)}
              min={0} max={100} krok={5} jednotka="%" delitel={1}
              napoveda="0 = u rohu, 100 = na konci ramene"
              onChange={(v) => setKontejner({ pozice: v / 100 })} />
          </>
        )}
      </Skupina>

      <Skupina titulek="Doplňky">
        <Zaskrt label="Kabelová lávka pod deskou" hodnota={config.doplnky.kabelovaLavka}
          popis="Plechový žlab pod zadní hranou, do kterého se schová prodlužovačka a kabely."
          cena={`+ ${formatRozpeti(UKONY.kabelovaLavka)}`}
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, kabelovaLavka: v } }))} />
        <Zaskrt label="LED podsvícení pod přední hranou" hodnota={config.doplnky.ledPodsviceni}
          cena={`+ ${formatRozpeti(scal(UKONY.ledMetr, bmLed))}`}
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, ledPodsviceni: v } }))} />
      </Skupina>
    </div>
  )
}
