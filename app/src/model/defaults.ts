import type { DeskConfig } from './types'
import { LIMITY } from './space'

export function vychoziKonfigurace(): DeskConfig {
  return {
    id: 'vlastni',
    nazev: 'Vlastní návrh',
    tvar: 'L',
    rozmery: {
      // Na maximum prostoru — uživatel chce roh využít celý.
      ramenoADelka: LIMITY.ramenoADelka.vychozi,
      ramenoAHloubka: LIMITY.ramenoAHloubka.vychozi,
      ramenoBDelka: LIMITY.ramenoBDelka.vychozi,
      ramenoBHloubka: LIMITY.ramenoBHloubka.vychozi,
      vyska: LIMITY.vyska.vychozi,
      mezeraKeGauci: LIMITY.mezeraKeGauci.vychozi,
    },
    deska: {
      // Hlavní doporučení rešerše povrchu: Egger H3157 ST12, 25 mm, ABS 2 mm.
      materialId: 'egger-h3157',
      tloustka: 25,
      hrana: 'srazena',
      radiusRohu: 12,
      // Monitor stojí v rohu, takže se sedí na úhlopříčce a deska se kolem
      // sedícího obtáčí velkým rádiusem vnitřního rohu.
      radiusVnitrni: 320,
      radiusUZdi: 160,
      vyrez: 0,
    },
    podnoz: {
      // Obdélníkový jekl 60 × 30 naležato, černý strukturní komaxit.
      typ: 'ram-hranaty',
      profil: 60,
      odsazeni: 90,
      mezilehlaPodpora: 'auto',
      vyztuha: true,
    },
    ulozne: [{ typ: 'kontejner-pevny', rameno: 'A', pozice: 1.0 }],
    doplnky: {
      monitorUmisteni: 'roh',
      monitorPosun: 0,
    },
  }
}
