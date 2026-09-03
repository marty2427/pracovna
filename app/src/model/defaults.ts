import type { DeskConfig } from './types'
import { LIMITY } from './space'

export function vychoziKonfigurace(): DeskConfig {
  return {
    id: 'vlastni',
    nazev: 'Vlastní návrh',
    tvar: 'L',
    rozmery: {
      // Záměrně ne na maximu — 200 cm místo 211. Od hrany zbyde 36 cm místo 25
      // a v pracovní ploše je to rozdíl, který nepoznáš.
      ramenoADelka: 2000,
      ramenoAHloubka: LIMITY.ramenoAHloubka.vychozi,
      // Rameno B zůstává na maximu — mezera ke gauči má být 10-15 cm,
      // zkracovat se má rameno A, které jde do volné místnosti.
      ramenoBDelka: 1480,
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
      tiskarnaVRohu: false,
    },
  }
}
