import type { DeskConfig } from '@/model/types'
import { material, KOV } from '@/model/materials'
import { jekl } from '@/model/podpory'
import { cutList, plochaPodleMaterialu, type Dilec } from '@/export/cutlist'
import { plochaDesky, obvodDesky } from '@/model/constraints'
import {
  MATERIAL_M2, DREVINA_KOEF, HRANA_BM, HODINOVKA, POVRCH_M2, PODNOZ_KOV, UKONY,
  hodinyPrace, plus, scal, type Rozpeti,
} from './ceny'

export interface RadekCeny {
  nazev: string
  detail: string
  cena: Rozpeti
}

export interface Odhad {
  radky: RadekCeny[]
  celkem: Rozpeti
  hodiny: Rozpeti
  dilce: Dilec[]
  kovani: { nazev: string; ks: number; poznamka?: string }[]
}

export function odhadNaMiru(c: DeskConfig): Odhad {
  const { dilce, kovani } = cutList(c)
  const mat = material(c.deska.materialId)
  const radky: RadekCeny[] = []

  // --- deska ---
  const plocha = plochaDesky(c)
  const odpad = 1.2 // prořez +20 %, rešerše uvádí +15–30 %
  const zaklad = (MATERIAL_M2[mat.kategorie] ?? MATERIAL_M2.lamino)(c.deska.tloustka)
  const koef = DREVINA_KOEF[c.deska.materialId] ?? 1
  const cenaDesky = scal(zaklad, plocha * odpad * koef)
  radky.push({
    nazev: 'Materiál desky',
    detail: `${mat.nazev}, ${c.deska.tloustka} mm · ${plocha.toFixed(2)} m² + 20 % prořez`,
    cena: cenaDesky,
  })

  // --- hrana ---
  const bm = obvodDesky(c)
  // U lamina jde zkosení i velký rádius jen přes nalepenou masivní lištu — cena jako nákližek.
  const presListu = mat.kategorie === 'lamino' && (c.deska.hrana === 'zkosena' || c.deska.hrana === 'radius')
  const cenaHrany = scal(HRANA_BM[presListu ? 'naklizek' : c.deska.hrana], bm)
  radky.push({
    nazev: 'Hrana',
    detail: `${{ rovna: 'ABS 1 mm', srazena: 'ABS 2 mm ve stejném dekoru, R2, PUR lepidlo', zkosena: presListu ? 'masivní lišta + zkosení 45°' : 'frézované zkosení', radius: presListu ? 'masivní lišta + rádius R10' : 'frézovaný rádius', naklizek: 'masivní nákližek' }[c.deska.hrana]} · ${bm.toFixed(2)} bm`,
    cena: cenaHrany,
  })

  // --- povrchová úprava u masivu a dýhy ---
  if (mat.kategorie === 'masiv' || mat.kategorie === 'dyha') {
    radky.push({
      nazev: 'Povrchová úprava',
      detail: `tvrdý voskový olej, 2 vrstvy oboustranně · ${plocha.toFixed(2)} m²`,
      cena: scal(POVRCH_M2.olej, plocha),
    })
  }

  // --- podnož: uzavřený obdélníkový rám z jeklu naležato, vždy kov ---
  const j = jekl(c.podnoz.profil)
  radky.push({
    nazev: 'Kovová podnož na míru',
    detail: `jekl ${j.sirka}×${j.vyska} naležato, ${KOV.nazev.toLowerCase()}, rámy na obě ramena + rohová stojka`,
    cena: scal(PODNOZ_KOV['ram-hranaty'], c.rozmery.ramenoBDelka > 0 ? 1.6 : 1),
  })

  // --- úložné ---
  const ulozneDilce = dilce.filter((d) => d.skupina === 'Úložné')
  if (ulozneDilce.length) {
    const m2 = [...plochaPodleMaterialu(ulozneDilce).values()].reduce((a, b) => a + b, 0)
    radky.push({
      nazev: 'Úložné — materiál korpusů a čel',
      detail: `${m2.toFixed(2)} m² dílců`,
      cena: scal(MATERIAL_M2.lamino(18), m2 * odpad),
    })
  }

  // --- kování ---
  const pocetVysuvu = kovani.filter((k) => /výsuv/i.test(k.nazev)).reduce((a, k) => a + k.ks, 0)
  const pocetPantu = kovani.filter((k) => /pant/i.test(k.nazev)).reduce((a, k) => a + k.ks, 0)
  const pocetUchytek = kovani.filter((k) => /úchytka/i.test(k.nazev)).reduce((a, k) => a + k.ks, 0)
  const pocetKolecek = kovani.filter((k) => /kolečko/i.test(k.nazev)).reduce((a, k) => a + k.ks, 0)
  const pocetPatek = kovani.filter((k) => /patka/i.test(k.nazev)).reduce((a, k) => a + k.ks, 0)
  const kovaniCena = plus(
    scal(UKONY.vysuvSada, pocetVysuvu),
    scal(UKONY.pant, pocetPantu),
    scal(UKONY.uchytka, pocetUchytek),
    scal(UKONY.kolecko, pocetKolecek),
    scal(UKONY.patka, pocetPatek),
  )
  if (kovaniCena.do > 0) {
    radky.push({
      nazev: 'Kování',
      detail: [pocetVysuvu && `${pocetVysuvu}× plnovýsuv`, pocetPantu && `${pocetPantu}× pant`,
               pocetUchytek && `${pocetUchytek}× úchytka`, pocetKolecek && `${pocetKolecek}× kolečko`,
               pocetPatek && `${pocetPatek}× patka`].filter(Boolean).join(', '),
      cena: kovaniCena,
    })
  }

  // --- práce ---
  const hodiny = hodinyPrace({
    jeL: c.tvar === 'L' && c.rozmery.ramenoBDelka > 0,
    pocetZasuvek: pocetVysuvu,
    maSkrinku: false,
    maPolici: false,
    maPanel: false,
    hranaNarocna: c.deska.hrana === 'naklizek' || c.deska.hrana === 'radius',
    masiv: mat.kategorie === 'masiv',
  })
  radky.push({
    nazev: 'Práce truhláře',
    detail: `${hodiny.od.toFixed(1)}–${hodiny.do.toFixed(1)} h × ${HODINOVKA.od}–${HODINOVKA.do} Kč/h (sazba dílny v Brně)`,
    cena: { od: hodiny.od * HODINOVKA.od, do: hodiny.do * HODINOVKA.do },
  })
  radky.push({ nazev: 'Doprava a montáž', detail: 'Brno a okolí', cena: plus(UKONY.doprava, UKONY.montaz) })

  return { radky, celkem: plus(...radky.map((r) => r.cena)), hodiny, dilce, kovani }
}
