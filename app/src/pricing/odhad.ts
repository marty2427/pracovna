import type { DeskConfig } from '@/model/types'
import { material, KOV_BARVY } from '@/model/materials'
import { cutList, plochaPodleMaterialu, type Dilec } from '@/export/cutlist'
import { plochaDesky, obvodDesky } from '@/model/constraints'
import {
  MATERIAL_M2, DREVINA_KOEF, HRANA_BM, HODINOVKA, POVRCH_M2, PODNOZ_KOV, UKONY,
  hodinyPrace, plus, scal, rozpeti, type Rozpeti,
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
  const cenaHrany = scal(HRANA_BM[c.deska.hrana], bm)
  radky.push({
    nazev: 'Hrana',
    detail: `${{ rovna: 'ABS 0,8 mm', srazena: 'ABS 2 mm se sražením', zkosena: 'frézované zkosení', radius: 'frézovaný rádius', naklizek: 'masivní nákližek' }[c.deska.hrana]} · ${bm.toFixed(2)} bm`,
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

  // --- podnož ---
  if (c.podnoz.material === 'kov' || c.podnoz.typ === 'stavitelny-ram') {
    const p = PODNOZ_KOV[c.podnoz.typ] ?? rozpeti(3000, 8000)
    const pocetRamu = c.tvar === 'L' && c.rozmery.ramenoBDelka > 0 ? 1.6 : 1
    radky.push({
      nazev: c.podnoz.typ === 'stavitelny-ram' ? 'Stavitelný rám (hotový výrobek)' : 'Kovová podnož na míru',
      detail: c.podnoz.typ === 'stavitelny-ram'
        ? 'elektrický rám, 2 sloupy, nosnost 70 kg'
        : `jekl ${c.podnoz.profil}×${c.podnoz.profil}, ${(KOV_BARVY.find((k) => k.barva === c.podnoz.barva)?.nazev ?? 'komaxit').toLowerCase()}, ${c.tvar === 'L' ? 'rámy na obě ramena + rohová noha' : 'dva rámy'}`,
      cena: scal(p, pocetRamu),
    })
  } else {
    const drevoDilce = dilce.filter((d) => d.skupina === 'Podnož')
    const m2 = [...plochaPodleMaterialu(drevoDilce).values()].reduce((a, b) => a + b, 0)
    const matP = material(c.podnoz.materialId ?? c.deska.materialId)
    radky.push({
      nazev: 'Dřevěná podnož — materiál',
      detail: `${matP.nazev} · ${m2.toFixed(2)} m² dílců`,
      cena: scal((MATERIAL_M2[matP.kategorie] ?? MATERIAL_M2.masiv)(30), m2 * odpad),
    })
  }

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

  // --- doplňky ---
  const d = c.doplnky
  if (d.kabelovaLavka) {
    radky.push({ nazev: 'Kabelová lávka', detail: 'plechový žlab pod deskou', cena: UKONY.kabelovaLavka })
  }
  if (d.ledPodsviceni) {
    const bmLed = (c.rozmery.ramenoADelka + (c.tvar === 'L' ? c.rozmery.ramenoBDelka : 0)) / 1000
    radky.push({
      nazev: 'LED podsvícení',
      detail: `zápustný profil + pásek 2700 K + zdroj · ${bmLed.toFixed(1)} bm`,
      cena: scal(UKONY.ledMetr, bmLed),
    })
  }

  // --- práce ---
  const hodiny = hodinyPrace({
    jeL: c.tvar === 'L' && c.rozmery.ramenoBDelka > 0,
    pocetZasuvek: pocetVysuvu,
    maSkrinku: false,
    maPolici: false,
    maPanel: false,
    maNastavec: d.nastavecMonitor,
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
