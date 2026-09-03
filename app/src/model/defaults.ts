import type { DeskConfig } from './types'
import { LIMITY } from './space'

export function vychoziKonfigurace(): DeskConfig {
  return {
    id: 'vlastni',
    nazev: 'Vlastní návrh',
    tvar: 'L',
    rozmery: {
      ramenoADelka: LIMITY.ramenoADelka.vychozi,
      ramenoAHloubka: LIMITY.ramenoAHloubka.vychozi,
      ramenoBDelka: LIMITY.ramenoBDelka.vychozi,
      ramenoBHloubka: LIMITY.ramenoBHloubka.vychozi,
      vyska: LIMITY.vyska.vychozi,
      mezeraKeGauci: LIMITY.mezeraKeGauci.vychozi,
    },
    deska: {
      materialId: 'dub-svetly-masiv',
      tloustka: 30,
      hrana: 'srazena',
      radiusRohu: 12,
      radiusVnitrni: 90,
      vyrez: 0,
      presah: { predni: 40, zadni: 0, bocni: 40 },
    },
    podnoz: {
      typ: 'ram-U',
      profil: 40,
      odsazeni: 90,
      barva: '#1F2021',
      material: 'kov',
      mezilehlaPodpora: 'auto',
      vyztuha: true,
    },
    ulozne: [{ typ: 'kontejner-3', rameno: 'B', pozice: 0.85 }],
    doplnky: {
      kabelovaLavka: true,
      pruchodka: 'kulata',
      ledPodsviceni: false,
      nastavecMonitor: false,
      zadniPanel: false,
      tiskarnaVRohu: true,
    },
  }
}
