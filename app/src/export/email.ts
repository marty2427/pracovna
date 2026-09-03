import type { DeskConfig } from '@/model/types'
import { material, KOV_BARVY } from '@/model/materials'
import { cutList } from './cutlist'
import { odhadNaMiru } from '@/pricing/odhad'
import { formatRozpeti } from '@/pricing/ceny'
import { SPACE } from '@/model/space'
import { plochaDesky, obvodDesky } from '@/model/constraints'

const HRANA_TEXT: Record<string, string> = {
  rovna: 'rovná, ABS 2 mm',
  srazena: 'rovná s ABS 2 mm a sražením cca 2 mm',
  zkosena: 'zkosená (fazeta pod 45°)',
  radius: 'zaoblená, rádius cca R5',
  naklizek: 'masivní nákližek cca 30 mm, zaoblený',
}

const PODNOZ_TEXT: Record<string, string> = {
  'ram-U': 'kovový rám tvaru U (dvě svislé nohy + horní traverza)',
  'ram-A': 'kovový rám tvaru A (rozbíhavé nohy s příčkou)',
  'ram-H': 'kovový rám tvaru H (svislé nohy se střední příčkou)',
  'ram-trapez': 'kovový rám trapézového tvaru (nohy sbíhavé dolů)',
  'ram-hranaty': 'kovový uzavřený hranatý rám',
  hairpin: 'hairpin nohy (tři ocelové pruty na nohu)',
  'nohy-rovne': 'dřevěné rovné hranaté nohy',
  'nohy-konicke': 'dřevěné kónické nohy',
  'nohy-sikme': 'dřevěné šikmé (rozkročené) nohy',
  bocnice: 'plné dřevěné bočnice',
  kozy: 'dřevěné kozy s příčkou',
  'kontejner-nosny': 'kontejner jako nosný prvek + jeden kovový rám',
  'stavitelny-ram': 'elektricky výškově stavitelný rám (kupuji zvlášť)',
}

export function textEmailu(c: DeskConfig): string {
  const r = c.rozmery
  const jeL = c.tvar === 'L' && r.ramenoBDelka > 0
  const mat = material(c.deska.materialId)
  const { dilce, kovani } = cutList(c)
  const odhad = odhadNaMiru(c)
  const mezera = SPACE.zadniStenaKeGauci - r.ramenoBDelka

  const radky: string[] = []
  radky.push('Předmět: Poptávka — pracovní stůl na míru do rohu obývacího pokoje')
  radky.push('')
  radky.push('Dobrý den,')
  radky.push('')
  radky.push('rád bych vás poprosil o cenovou nabídku na pracovní stůl na míru do rohu obývacího pokoje.')
  radky.push('V příloze posílám technický nákres (půdorys, nárys, bokorys s kótami) a rozpisku dílců.')
  radky.push('')
  radky.push('MÍSTO')
  radky.push(`Stůl přijde do rohu obývacího pokoje. Podél levé stěny mám ${SPACE.levaStenaRun / 10} cm,`)
  radky.push(`podél zadní stěny ${SPACE.zadniStenaKeGauci / 10} cm, pak začíná gauč.`)
  radky.push(`Chci, aby stůl končil ${SPACE.odstupOdHrany / 10} cm od hrany u levé stěny`)
  radky.push(`a ${Math.round(mezera / 10)} cm od gauče, ať to nevypadá namačkaně.`)
  radky.push('')
  radky.push('CO CHCI')
  radky.push(jeL
    ? `Stůl do L. Delší rameno podél levé stěny ${r.ramenoADelka} × ${r.ramenoAHloubka} mm,`
      + ` kratší rameno podél zadní stěny ${r.ramenoBDelka} × ${r.ramenoBHloubka} mm.`
    : `Rovná deska ${r.ramenoADelka} × ${r.ramenoAHloubka} mm podél levé stěny.`)
  radky.push(`Výška horní plochy ${r.vyska} mm (pevná, nepotřebuji polohovací).`)
  radky.push('')
  radky.push('DESKA')
  radky.push(`Materiál: ${mat.nazev}, tloušťka ${c.deska.tloustka} mm.`)
  radky.push(`Hrana: ${HRANA_TEXT[c.deska.hrana]}.`)
  if (c.deska.radiusRohu > 0) radky.push(`Vnější rohy zaoblené R${c.deska.radiusRohu} mm.`)
  if (jeL && c.deska.radiusVnitrni > 0) radky.push(`Vnitřní roh L zaoblený R${c.deska.radiusVnitrni} mm.`)
  radky.push(`Plocha desky ${plochaDesky(c).toFixed(2)} m², obvod ${obvodDesky(c).toFixed(2)} bm.`)
  if (mat.kategorie === 'masiv') {
    radky.push('U masivu prosím o doporučení, jak vyřešit dilataci a jakou povrchovou úpravu zvolit.')
  }
  radky.push('')
  radky.push('PODNOŽ')
  radky.push(`${PODNOZ_TEXT[c.podnoz.typ]}.`)
  if (c.podnoz.material === 'kov') {
    radky.push(`Profil jekl ${c.podnoz.profil}×${c.podnoz.profil} mm, komaxit ${(KOV_BARVY.find((k) => k.barva === c.podnoz.barva)?.nazev ?? c.podnoz.barva).toLowerCase()}.`)
  }
  radky.push(`Odsazení podnože od hrany desky ${c.podnoz.odsazeni} mm.`)
  if (c.podnoz.vyztuha) {
    radky.push('Pod deskou počítám s podélnou výztuhou (jekl), aby se dlouhé rameno neprohýbalo.')
  }
  radky.push('')

  if (c.ulozne.length) {
    radky.push('ÚLOŽNÉ')
    for (const u of c.ulozne) {
      const kde = u.rameno === 'B' && jeL ? 'pod kratším ramenem u gauče' : 'pod hlavní plochou'
      const nazvy: Record<string, string> = {
        'zasuvka-plocha': 'jedna plochá zásuvka pod deskou',
        'zasuvky-2': 'dvě ploché zásuvky pod deskou',
        'kontejner-3': 'pojezdový kontejner se třemi zásuvkami',
        'kontejner-pevny': 'pevný kontejner se třemi zásuvkami',
        skrinka: 'skříňka s dvířky',
        police: 'otevřená police',
        'zadni-panel': 'zadní panel výšky 300 mm',
      }
      radky.push(`- ${nazvy[u.typ] ?? u.typ} ${u.typ === 'zadni-panel' ? '' : kde}`
        + (u.barvaCel ? `, čela v odstínu ${u.barvaCel} (namíchat na vzorek)` : ''))
    }
    radky.push('')
  }

  const d = c.doplnky
  const dop: string[] = []
  if (d.pruchodka === 'kulata') dop.push('kabelová průchodka kulatá ⌀80 mm')
  if (d.pruchodka === 'obdelnikova') dop.push('kabelová průchodka obdélníková 145×55 mm')
  if (d.kabelovaLavka) dop.push('kabelová lávka pod deskou')
  if (d.ledPodsviceni) dop.push('LED podsvícení v zápustném profilu, teplá bílá 2700 K')
  if (d.nastavecMonitor) dop.push('nástavec na monitor 620 × 300 mm')
  if (d.tiskarnaVRohu) dop.push('v rohu L počítám s tiskárnou cca 450 × 400 mm — je potřeba, aby tam bylo místo')
  if (dop.length) {
    radky.push('DOPLŇKY')
    for (const x of dop) radky.push(`- ${x}`)
    radky.push('')
  }

  radky.push('ROZPISKA DÍLCŮ')
  radky.push('(rozměry v mm, délka × šířka × tloušťka)')
  let skupina = ''
  for (const dd of dilce) {
    if (dd.skupina !== skupina) { skupina = dd.skupina; radky.push(`  ${skupina}:`) }
    radky.push(`   ${dd.ks}× ${dd.nazev} — ${dd.delka} × ${dd.sirka} × ${dd.tloustka}, ${dd.material}`
      + (dd.hrany ? `, hrana: ${dd.hrany}` : ''))
  }
  if (kovani.length) {
    radky.push('  Kování a doplňky:')
    for (const k of kovani) radky.push(`   ${k.ks}× ${k.nazev}${k.poznamka ? ` (${k.poznamka})` : ''}`)
  }
  radky.push('')
  radky.push('OTÁZKY')
  radky.push('1) Berete i takhle malou zakázku (jeden stůl)?')
  radky.push('2) Jaká by byla cena a termín?')
  radky.push('3) Vyrábíte desku sami, nebo ji objednáváte naformátovanou? (Kdyby druhá varianta,')
  radky.push('   rád si ji objednám sám, pokud to dává smysl.)')
  radky.push('4) Doporučil byste u téhle sestavy něco udělat jinak?')
  radky.push('')
  radky.push(`Pro představu: podle veřejně dostupných sazeb jsem si to nahrubo spočítal na ${formatRozpeti(odhad.celkem)}.`)
  radky.push('Je to jen orientační odhad, vaše nabídka je pro mě rozhodující.')
  radky.push('')
  radky.push('Děkuji a přeji hezký den,')
  radky.push('')
  return radky.join('\n')
}

export function cutListCsv(c: DeskConfig): string {
  const { dilce, kovani } = cutList(c)
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`
  const radky = ['Skupina;Název;Ks;Délka (mm);Šířka (mm);Tloušťka (mm);Materiál;Hrany;Poznámka']
  for (const d of dilce) {
    radky.push([d.skupina, d.nazev, d.ks, d.delka, d.sirka, d.tloustka, d.material, d.hrany, d.poznamka ?? '']
      .map((x) => esc(String(x))).join(';'))
  }
  for (const k of kovani) {
    radky.push(['Kování', k.nazev, k.ks, '', '', '', '', '', k.poznamka ?? ''].map((x) => esc(String(x))).join(';'))
  }
  return '﻿' + radky.join('\n')
}

export function stahni(obsah: string, jmeno: string, typ: string) {
  const blob = new Blob([obsah], { type: typ })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = jmeno
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
