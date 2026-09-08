import { useStore } from '@/store'
import { LIMITY, SPACE, MAX_RAMENO_A, maxRamenoB, MONITOR } from '@/model/space'
import { jekl } from '@/model/podpory'
import { pracoviste } from '@/model/constraints'
import { Skupina, Posuvnik, Prepinac, Zaskrt, type Volba } from './Ovladace'
import { VyberHrany } from './Hrany'
import { VyberDekoru } from './Dekory'
import type { Tloustka, Rameno, MonitorUmisteni } from '@/model/types'

const MONITOR_VOLBY: Array<Omit<Volba<MonitorUmisteni>, 'meta'>> = [
  { hodnota: 'roh', label: 'V rohu', popis: 'Sedí se na úhlopříčce, deska se kolem tebe obtočí. Využije roh, který je jinak mrtvý.' },
  { hodnota: 'ramenoA', label: 'Rameno A (dlouhé)', popis: 'U levé stěny, čelem ke zdi s obrazem' },
  { hodnota: 'ramenoB', label: 'Rameno B (u gauče)', popis: 'U zadní stěny, gauč po pravé ruce' },
]

export function Configurator() {
  const config = useStore((s) => s.config)
  const nastav = useStore((s) => s.nastav)
  const nastavRozmer = useStore((s) => s.nastavRozmer)
  const r = config.rozmery
  const pr = pracoviste(config)

  // U každého umístění monitoru rovnou vzdálenost očí — ať je vidět, proč roh vyhrává.
  const monitorVolby: Volba<MonitorUmisteni>[] = MONITOR_VOLBY.map((v) => {
    const d = pracoviste({ ...config, doplnky: { ...config.doplnky, monitorUmisteni: v.hodnota } }).vzdalenost
    const ok = d >= MONITOR.vzdalenost.min && d <= MONITOR.vzdalenost.max
    return { ...v, meta: `oči ${Math.round(d / 10)} cm${ok ? '' : ' ✕'}` }
  })
  const j = jekl(config.podnoz.profil)

  // Jediné úložné je pevný kontejner: buď je, nebo není.
  const kontejner = config.ulozne[0]
  const setKontejner = (patch: { zapnuto?: boolean; rameno?: Rameno; pozice?: number }) =>
    nastav((c) => {
      const k = c.ulozne[0] ?? { typ: 'kontejner-pevny' as const, rameno: 'A' as Rameno, pozice: 1.0 }
      if (patch.zapnuto === false) return { ulozne: [] }
      return { ulozne: [{ ...k, ...(patch.rameno ? { rameno: patch.rameno } : {}), ...(patch.pozice !== undefined ? { pozice: patch.pozice } : {}) }] }
    })

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
      </Skupina>

      <Skupina titulek="Deska" popis="Lamino Egger Eurodekor v dubovém dekoru se strukturou ST12: mělká matná struktura, hladký skluz myši, prach se v ní nedrží. Podle rešerše povrchu (research/povrch-desky-2026-09-06.md).">
        <span className="prepinac-label">Dekor Egger ST12 Omnipore Matt — deska i kontejner v jednom</span>
        <VyberDekoru hodnota={config.deska.materialId}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, materialId: v } }))} />
        <Prepinac label="Tloušťka" sloupce={3}
          hodnota={config.deska.tloustka}
          volby={[
            { hodnota: 18 as Tloustka, label: '18 mm' },
            { hodnota: 25 as Tloustka, label: '25 mm' },
            { hodnota: 38 as Tloustka, label: '38 mm' },
          ]}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, tloustka: v } }))} />
        <p className="popis">18 mm je tabule skladem, 25 mm doporučení rešerše (na zakázku), 38 mm formát pracovní desky. Tenčí deska si vyžádá mezilehlé podpory, přidají se samy.</p>
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

      <Skupina titulek="Podnož" popis={`Uzavřený obdélníkový rám z jeklu ${j.sirka} × ${j.vyska} mm naležato: lyžina plochá na zemi, stojky z místnosti vidět jen úzkou hranou, traverza naplocho pod deskou. Černý strukturní komaxit RAL 9005. Na L dva rámy a rohová stojka.`}>
        <Posuvnik label="Profil jeklu" hodnota={config.podnoz.profil} min={40} max={80} krok={10} jednotka="mm" delitel={1}
          napoveda={`${j.sirka} × ${j.vyska} mm; 60 × 30 je běžný standard`}
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, profil: v } }))} />
        <Posuvnik label="Odsazení od hrany desky" hodnota={config.podnoz.odsazeni} min={20} max={250} krok={5} jednotka="mm" delitel={1}
          napoveda="přesah desky přes podnož"
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, odsazeni: v } }))} />
        <Zaskrt label="Podélná výztuha pod deskou" hodnota={config.podnoz.vyztuha}
          popis="Stejný jekl nastojato pod deskou po celé délce. Výrazně prodlouží dovolený rozpon."
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

    </div>
  )
}
