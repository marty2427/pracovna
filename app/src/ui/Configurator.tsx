import { useStore } from '@/store'
import { LIMITY, SPACE, MAX_RAMENO_A, maxRamenoB } from '@/model/space'
import { MATERIALY, KOV_BARVY } from '@/model/materials'
import { Skupina, Posuvnik, Prepinac, Zaskrt, type Volba } from './Ovladace'
import { BarevneSmery } from './BarevneSmery'
import type { Hrana, PodnozTyp, Tloustka, UlozneTyp, Rameno } from '@/model/types'

const HRANY: Volba<Hrana>[] = [
  { hodnota: 'rovna', label: 'Rovná', popis: 'ABS 1–2 mm, ostrá hrana' },
  { hodnota: 'srazena', label: 'Sražená', popis: 'Fazetka 2–3 mm, nejběžnější' },
  { hodnota: 'zkosena', label: 'Zkosená', popis: 'Velké zkosení, deska působí tenčeji' },
  { hodnota: 'radius', label: 'Zaoblená', popis: 'R3–R8, příjemná pod předloktím' },
  { hodnota: 'naklizek', label: 'Masivní nákližek', popis: 'Nalepený masiv 20–40 mm, jen u dýhy a lamina' },
]

const PODNOZE: Volba<PodnozTyp>[] = [
  { hodnota: 'ram-U', label: 'Rám U' },
  { hodnota: 'ram-A', label: 'Rám A' },
  { hodnota: 'ram-H', label: 'Rám H' },
  { hodnota: 'ram-trapez', label: 'Rám trapéz' },
  { hodnota: 'ram-hranaty', label: 'Hranatý profil' },
  { hodnota: 'hairpin', label: 'Hairpin' },
  { hodnota: 'nohy-rovne', label: 'Nohy rovné' },
  { hodnota: 'nohy-konicke', label: 'Nohy kónické' },
  { hodnota: 'nohy-sikme', label: 'Nohy šikmé' },
  { hodnota: 'bocnice', label: 'Plné bočnice' },
  { hodnota: 'kozy', label: 'Kozy' },
  { hodnota: 'kontejner-nosny', label: 'Nese kontejner' },
  { hodnota: 'stavitelny-ram', label: 'Stavitelný rám' },
]

const ULOZNE: Volba<UlozneTyp>[] = [
  { hodnota: 'nic', label: 'Nic' },
  { hodnota: 'zasuvka-plocha', label: '1 plochá zásuvka' },
  { hodnota: 'zasuvky-2', label: '2 zásuvky' },
  { hodnota: 'kontejner-3', label: 'Pojezdový kontejner' },
  { hodnota: 'kontejner-pevny', label: 'Pevný kontejner' },
  { hodnota: 'skrinka', label: 'Skříňka s dvířky' },
  { hodnota: 'police', label: 'Otevřená police' },
  { hodnota: 'zadni-panel', label: 'Zadní panel' },
]

export function Configurator() {
  const config = useStore((s) => s.config)
  const nastav = useStore((s) => s.nastav)
  const nastavRozmer = useStore((s) => s.nastavRozmer)
  const r = config.rozmery
  const jeL = config.tvar === 'L'

  const ulozne0 = config.ulozne[0] ?? { typ: 'nic' as UlozneTyp, rameno: 'B' as Rameno, pozice: 0.85 }
  const setUlozne = (patch: Partial<typeof ulozne0>) =>
    nastav((c) => ({
      ulozne: patch.typ === 'nic' ? [] : [{ ...ulozne0, ...patch } as any],
      podnoz: { ...c.podnoz },
    }))

  const materialyVolby: Volba<string>[] = MATERIALY.map((m) => ({
    hodnota: m.id, label: m.kratky, popis: m.nazev + (m.poznamka ? ` — ${m.poznamka}` : ''), barva: m.barva,
  }))

  return (
    <div className="panel">
      <Skupina titulek="Rozměry" popis={`Roh ${SPACE.zadniStenaKeGauci / 10} × ${SPACE.levaStenaRun / 10} cm. Posuvníky nepustí přes limit prostoru.`}>
        <Prepinac
          label="Tvar"
          hodnota={config.tvar}
          volby={[{ hodnota: 'L' as const, label: 'L do rohu' }, { hodnota: 'rovna' as const, label: 'Rovná deska' }]}
          onChange={(v) => nastav({ tvar: v })}
        />
        <Posuvnik
          label="Rameno A — délka" hodnota={r.ramenoADelka}
          min={LIMITY.ramenoADelka.min} max={MAX_RAMENO_A}
          napoveda={`max ${MAX_RAMENO_A / 10} cm`}
          onChange={(v) => nastavRozmer('ramenoADelka', v)}
        />
        <Posuvnik
          label="Rameno A — hloubka" hodnota={r.ramenoAHloubka}
          min={LIMITY.ramenoAHloubka.min} max={LIMITY.ramenoAHloubka.max}
          napoveda="kolik vyčnívá do místnosti"
          onChange={(v) => nastavRozmer('ramenoAHloubka', v)}
        />
        {jeL && (
          <>
            <Posuvnik
              label="Rameno B — délka" hodnota={r.ramenoBDelka}
              min={0} max={maxRamenoB(r.mezeraKeGauci)}
              napoveda={`max ${Math.round(maxRamenoB(r.mezeraKeGauci) / 10)} cm`}
              onChange={(v) => nastavRozmer('ramenoBDelka', v)}
            />
            <Posuvnik
              label="Rameno B — hloubka" hodnota={r.ramenoBHloubka}
              min={LIMITY.ramenoBHloubka.min} max={LIMITY.ramenoBHloubka.max}
              napoveda="tiskárna chce aspoň 46 cm"
              onChange={(v) => nastavRozmer('ramenoBHloubka', v)}
            />
            <Posuvnik
              label="Mezera ke gauči" hodnota={r.mezeraKeGauci}
              min={LIMITY.mezeraKeGauci.min} max={LIMITY.mezeraKeGauci.max} krok={5}
              napoveda="chtěl jsi 10–15 cm"
              onChange={(v) => nastavRozmer('mezeraKeGauci', v)}
            />
          </>
        )}
        <Posuvnik
          label="Výška desky" hodnota={r.vyska}
          min={LIMITY.vyska.min} max={LIMITY.vyska.max} krok={5}
          napoveda="standard 75 cm"
          onChange={(v) => nastavRozmer('vyska', v)}
        />
      </Skupina>

      <BarevneSmery />

      <Skupina titulek="Deska">
        <Prepinac label="Materiál / dekor" sloupce={2} hodnota={config.deska.materialId}
          volby={materialyVolby}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, materialId: v } }))} />
        <Prepinac label="Tloušťka" sloupce={4}
          hodnota={config.deska.tloustka}
          volby={[18, 25, 30, 40].map((t) => ({ hodnota: t as Tloustka, label: `${t} mm` }))}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, tloustka: v } }))} />
        <Prepinac label="Hrana" sloupce={2} hodnota={config.deska.hrana} volby={HRANY}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, hrana: v } }))} />
        <Posuvnik label="Zaoblení vnějších rohů" hodnota={config.deska.radiusRohu}
          min={0} max={80} krok={2} jednotka="mm" delitel={1}
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, radiusRohu: v } }))} />
        <Posuvnik label="Výřez v přední hraně" hodnota={config.deska.vyrez}
          min={0} max={130} krok={5} jednotka="mm" delitel={1}
          napoveda="hrana ustoupí v místě sezení"
          onChange={(v) => nastav((c) => ({ deska: { ...c.deska, vyrez: v } }))} />
        {jeL && (
          <Posuvnik label="Zaoblení vnitřního rohu" hodnota={config.deska.radiusVnitrni}
            min={0} max={260} krok={5} jednotka="mm" delitel={1}
            napoveda="pod loktem to poznáš"
            onChange={(v) => nastav((c) => ({ deska: { ...c.deska, radiusVnitrni: v } }))} />
        )}
      </Skupina>

      <Skupina titulek="Podnož">
        <Prepinac sloupce={2} hodnota={config.podnoz.typ} volby={PODNOZE}
          onChange={(v) => nastav((c) => ({
            podnoz: {
              ...c.podnoz, typ: v,
              material: v.startsWith('nohy') || v === 'bocnice' || v === 'kozy' ? 'drevo' : 'kov',
            },
          }))} />
        <Prepinac label="Barva kovu" sloupce={2} hodnota={config.podnoz.barva}
          volby={KOV_BARVY.map((k) => ({ hodnota: k.barva, label: k.nazev.replace(/ \(.*/, ''), barva: k.barva }))}
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, barva: v } }))} />
        <Posuvnik label="Profil" hodnota={config.podnoz.profil} min={20} max={80} krok={5} jednotka="mm" delitel={1}
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, profil: v } }))} />
        <Posuvnik label="Odsazení od hrany desky" hodnota={config.podnoz.odsazeni} min={20} max={250} krok={5} jednotka="mm" delitel={1}
          napoveda="přesah desky přes podnož"
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, odsazeni: v } }))} />
        <Zaskrt label="Podélná výztuha pod deskou" hodnota={config.podnoz.vyztuha}
          popis="Jekl pod deskou po celé délce. Výrazně prodlouží dovolený rozpon."
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, vyztuha: v } }))} />
        <Prepinac label="Mezilehlá podpora" sloupce={3} hodnota={config.podnoz.mezilehlaPodpora}
          volby={[
            { hodnota: 'auto' as const, label: 'Automaticky', popis: 'Přidá se, jen když je rozpon moc velký' },
            { hodnota: 'ano' as const, label: 'Vždy' },
            { hodnota: 'ne' as const, label: 'Nikdy' },
          ]}
          onChange={(v) => nastav((c) => ({ podnoz: { ...c.podnoz, mezilehlaPodpora: v } }))} />
      </Skupina>

      <Skupina titulek="Úložné">
        <Prepinac sloupce={2} hodnota={ulozne0.typ} volby={ULOZNE}
          onChange={(v) => setUlozne({ typ: v })} />
        {ulozne0.typ !== 'nic' && ulozne0.typ !== 'zadni-panel' && (
          <>
            <Prepinac label="Pod kterým ramenem" sloupce={2} hodnota={ulozne0.rameno}
              volby={[
                { hodnota: 'A' as Rameno, label: 'Rameno A (hlavní)' },
                { hodnota: 'B' as Rameno, label: 'Rameno B (u gauče)' },
              ]}
              onChange={(v) => setUlozne({ rameno: v })} />
            <Posuvnik label="Posun podél ramene" hodnota={Math.round(ulozne0.pozice * 100)}
              min={0} max={100} krok={5} jednotka="%" delitel={1}
              napoveda="0 = u rohu, 100 = na konci"
              onChange={(v) => setUlozne({ pozice: v / 100 })} />
          </>
        )}
      </Skupina>

      <Skupina titulek="Doplňky">
        <Zaskrt label="Kabelová lávka pod deskou" hodnota={config.doplnky.kabelovaLavka}
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, kabelovaLavka: v } }))} />
        <Prepinac label="Kabelová průchodka" sloupce={3} hodnota={config.doplnky.pruchodka}
          volby={[
            { hodnota: 'zadna' as const, label: 'Žádná' },
            { hodnota: 'kulata' as const, label: 'Kulatá 80' },
            { hodnota: 'obdelnikova' as const, label: 'Obdélníková' },
          ]}
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, pruchodka: v } }))} />
        <Zaskrt label="LED podsvícení" hodnota={config.doplnky.ledPodsviceni}
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, ledPodsviceni: v } }))} />
        <Zaskrt label="Nástavec na monitor" hodnota={config.doplnky.nastavecMonitor}
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, nastavecMonitor: v } }))} />
        <Zaskrt label="Tiskárna v rohu" hodnota={config.doplnky.tiskarnaVRohu}
          popis="Roh L je jinak mrtvá plocha — tiskárna tam sedí dobře."
          onChange={(v) => nastav((c) => ({ doplnky: { ...c.doplnky, tiskarnaVRohu: v } }))} />
      </Skupina>
    </div>
  )
}
