import type { DeskConfig } from '@/model/types'
import { material } from '@/model/materials'
import { podpory } from '@/model/podpory'

export interface Dilec {
  skupina: 'Deska' | 'Podnož' | 'Úložné' | 'Doplňky'
  nazev: string
  ks: number
  /** mm */
  delka: number
  sirka: number
  tloustka: number
  material: string
  /** Které hrany olepit / opracovat. */
  hrany: string
  poznamka?: string
}

export interface Kovani {
  nazev: string
  ks: number
  poznamka?: string
}

const KORPUS_TL = 18

export function cutList(c: DeskConfig): { dilce: Dilec[]; kovani: Kovani[] } {
  const r = c.rozmery
  const jeL = c.tvar === 'L' && r.ramenoBDelka > 0
  const mat = material(c.deska.materialId)
  const t = c.deska.tloustka
  const dilce: Dilec[] = []
  const kovani: Kovani[] = []

  const hranaPopis = {
    rovna: 'ABS 2 mm', srazena: 'ABS 2 mm + sražení 2 mm', zkosena: 'zkosení 45°',
    radius: `zaoblení R${Math.max(3, Math.round(t * 0.3))}`, naklizek: 'masivní nákližek 30 mm',
  }[c.deska.hrana]

  // --- DESKA ---
  // L se dělá ze dvou dílů spojených v rohu; jeden kus na formát 2800x2070 nevyjde
  // ekonomicky a u masivu se stejně lepí z lamel.
  dilce.push({
    skupina: 'Deska', nazev: 'Deska — rameno A (hlavní plocha)', ks: 1,
    delka: r.ramenoADelka, sirka: r.ramenoAHloubka, tloustka: t,
    material: mat.nazev,
    hrany: `${hranaPopis} — čelní a boční hrana; zadní hrana k stěně bez úpravy`,
    poznamka: c.deska.radiusRohu > 0 ? `vnější rohy R${c.deska.radiusRohu}` : undefined,
  })
  if (jeL) {
    dilce.push({
      skupina: 'Deska', nazev: 'Deska — rameno B (u gauče)', ks: 1,
      delka: Math.max(0, r.ramenoBDelka - r.ramenoAHloubka), sirka: r.ramenoBHloubka, tloustka: t,
      material: mat.nazev,
      hrany: `${hranaPopis} — čelní hrana a hrana ke gauči`,
      poznamka: `spoj s ramenem A na sraz, vnitřní roh R${c.deska.radiusVnitrni}`,
    })
    kovani.push({ nazev: 'Spojka desek do drážky (excentr nebo lamelo)', ks: 4, poznamka: 'spoj ramene A a B v rohu' })
  }

  // --- PODNOŽ ---
  const H = r.vyska - t
  const p = podpory(c)
  const typ = c.podnoz.typ
  const profil = c.podnoz.profil

  if (typ === 'bocnice') {
    const skupiny = new Set(p.map((q) => q.skupina))
    for (const s of skupiny) {
      const g = p.filter((q) => q.skupina === s)
      if (g.length >= 2) {
        const podelX = Math.abs(g[0].z - g[1].z) < 1
        const sirkaP = podelX
          ? Math.abs(g[0].x - g[1].x) + KORPUS_TL
          : Math.abs(g[0].z - g[1].z) + KORPUS_TL
        dilce.push({
          skupina: 'Podnož', nazev: `Bočnice ${s === 'A' ? 'u konce ramene A' : s === 'B' ? 'u gauče' : 'mezilehlá'}`,
          ks: 1, delka: H, sirka: sirkaP, tloustka: KORPUS_TL + 6,
          material: material(c.podnoz.materialId ?? c.deska.materialId).nazev,
          hrany: 'ABS 2 mm po obvodu, viditelné hrany',
        })
      }
    }
    kovani.push({ nazev: 'Srovnávací patky M8', ks: 8 })
  } else if (typ.startsWith('nohy') || typ === 'hairpin') {
    dilce.push({
      skupina: 'Podnož',
      nazev: typ === 'hairpin' ? 'Hairpin noha (ocelový prut)' : `Noha ${typ === 'nohy-konicke' ? 'kónická' : typ === 'nohy-sikme' ? 'šikmá' : 'rovná'}`,
      ks: p.length, delka: H, sirka: Math.max(profil, 45), tloustka: Math.max(profil, 45),
      material: c.podnoz.material === 'kov' ? `ocel, komaxit ${c.podnoz.barva}` : material(c.podnoz.materialId ?? c.deska.materialId).nazev,
      hrany: typ === 'nohy-konicke' ? 'soustružené, kónické zúžení na 26 mm' : 'sražené hrany 2 mm',
    })
    kovani.push({ nazev: 'Kotevní deska nohy + vruty', ks: p.length })
  } else if (typ === 'stavitelny-ram') {
    kovani.push({ nazev: 'Elektricky stavitelný rám (2 sloupy, nosnost min. 70 kg)', ks: jeL ? 2 : 1, poznamka: 'kupuje se hotový, nevyrábí truhlář' })
  } else if (typ === 'kozy') {
    dilce.push({
      skupina: 'Podnož', nazev: 'Koza — noha', ks: 8, delka: Math.round(H * 1.06), sirka: profil, tloustka: profil,
      material: material(c.podnoz.materialId ?? c.deska.materialId).nazev, hrany: 'sražení 2 mm',
    })
    dilce.push({
      skupina: 'Podnož', nazev: 'Koza — příčka', ks: 4, delka: 420, sirka: Math.round(profil * 0.7), tloustka: Math.round(profil * 0.7),
      material: material(c.podnoz.materialId ?? c.deska.materialId).nazev, hrany: 'sražení 2 mm',
    })
  } else {
    // kovové rámy
    const skupiny = new Set(p.filter((q) => q.skupina !== 'roh').map((q) => q.skupina))
    let nohy = 0, traverzy = 0, delkaTraverzy = 0
    for (const s of skupiny) {
      const g = p.filter((q) => q.skupina === s)
      if (g.length >= 2) {
        nohy += 2
        traverzy += 1
        delkaTraverzy = Math.max(delkaTraverzy,
          Math.abs(g[0].z - g[1].z) < 1 ? Math.abs(g[0].x - g[1].x) : Math.abs(g[0].z - g[1].z))
      }
    }
    const roh = p.filter((q) => q.skupina === 'roh').length
    dilce.push({
      skupina: 'Podnož', nazev: `Noha — jekl ${profil}×${profil}×2`, ks: nohy + roh,
      delka: H - 15, sirka: profil, tloustka: profil,
      material: `ocel, komaxit ${c.podnoz.barva}`, hrany: 'zabroušené svary, zaslepeno',
    })
    dilce.push({
      skupina: 'Podnož', nazev: `Horní traverza — jekl ${profil}×${profil}×2`, ks: traverzy,
      delka: Math.round(delkaTraverzy), sirka: profil, tloustka: profil,
      material: `ocel, komaxit ${c.podnoz.barva}`, hrany: 'svařeno s nohami',
    })
    if (typ === 'ram-H') {
      dilce.push({
        skupina: 'Podnož', nazev: 'Střední příčka', ks: traverzy, delka: Math.round(delkaTraverzy),
        sirka: Math.round(profil * 0.8), tloustka: Math.round(profil * 0.8),
        material: `ocel, komaxit ${c.podnoz.barva}`, hrany: 'svařeno',
      })
    }
    if (typ === 'ram-hranaty') {
      dilce.push({
        skupina: 'Podnož', nazev: 'Spodní traverza', ks: traverzy, delka: Math.round(delkaTraverzy),
        sirka: profil, tloustka: profil, material: `ocel, komaxit ${c.podnoz.barva}`, hrany: 'svařeno',
      })
    }
    kovani.push({ nazev: 'Srovnávací patka M10 do jeklu', ks: nohy + roh })
    kovani.push({ nazev: 'Vrut do desky 5×30 s podložkou', ks: (nohy + roh) * 2 })
  }

  if (c.podnoz.vyztuha && typ !== 'stavitelny-ram') {
    const delkaA = r.ramenoADelka - 2 * c.podnoz.odsazeni
    dilce.push({
      skupina: 'Podnož', nazev: `Podélná výztuha — jekl ${Math.round(profil * 0.85)}×${Math.round(profil * 0.55)}×2`,
      ks: jeL ? 2 : 1, delka: Math.round(delkaA), sirka: Math.round(profil * 0.85), tloustka: Math.round(profil * 0.55),
      material: `ocel, komaxit ${c.podnoz.barva}`,
      hrany: 'předvrtáno pro vruty po 300 mm',
      poznamka: 'bez ní by se deska na dlouhém rameni prohnula',
    })
  }

  // --- ÚLOŽNÉ ---
  for (const u of c.ulozne) {
    const matU = material(u.materialId ?? c.deska.materialId).nazev
    const hlU = (u.rameno === 'B' && jeL ? r.ramenoBHloubka : r.ramenoAHloubka) - 60
    if (u.typ === 'kontejner-3' || u.typ === 'kontejner-pevny') {
      const vys = u.typ === 'kontejner-3' ? H - 55 : H - 2
      dilce.push({ skupina: 'Úložné', nazev: 'Kontejner — bok', ks: 2, delka: vys, sirka: hlU, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
      dilce.push({ skupina: 'Úložné', nazev: 'Kontejner — dno a víko', ks: 2, delka: 420 - 2 * KORPUS_TL, sirka: hlU, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
      dilce.push({ skupina: 'Úložné', nazev: 'Kontejner — záda', ks: 1, delka: vys - 20, sirka: 420 - 20, tloustka: 4, material: 'HDF', hrany: 'bez úpravy' })
      const hCelo = Math.round((vys - 2 * KORPUS_TL - 2 * 5) / 3)
      dilce.push({ skupina: 'Úložné', nazev: 'Čelo zásuvky', ks: 3, delka: 420 - 6, sirka: hCelo, tloustka: 19, material: u.barvaCel ? `lakovaná MDF ${u.barvaCel}` : matU, hrany: 'ABS 1 mm po obvodu' })
      dilce.push({ skupina: 'Úložné', nazev: 'Dno zásuvky', ks: 3, delka: 420 - 2 * KORPUS_TL - 26, sirka: hlU - 40, tloustka: 16, material: matU, hrany: 'ABS 0,8 mm' })
      kovani.push({ nazev: 'Plnovýsuv s tlumením, délka 450 mm, nosnost 30 kg', ks: 3, poznamka: 'Blum TANDEMBOX antaro nebo Hettich InnoTech' })
      kovani.push({ nazev: 'Úchytka madlo 128 mm', ks: 3 })
      if (u.typ === 'kontejner-3') kovani.push({ nazev: 'Kolečko s brzdou ⌀50', ks: 4 })
    } else if (u.typ === 'zasuvka-plocha' || u.typ === 'zasuvky-2') {
      const n = u.typ === 'zasuvky-2' ? 2 : 1
      dilce.push({ skupina: 'Úložné', nazev: 'Plochá zásuvka — bok', ks: 2 * n, delka: hlU - 20, sirka: 60, tloustka: 16, material: matU, hrany: 'ABS 0,8 mm' })
      dilce.push({ skupina: 'Úložné', nazev: 'Plochá zásuvka — čelo', ks: n, delka: Math.round(560 / n) - 6, sirka: 62, tloustka: 19, material: u.barvaCel ? `lakovaná MDF ${u.barvaCel}` : matU, hrany: 'ABS 1 mm po obvodu' })
      dilce.push({ skupina: 'Úložné', nazev: 'Plochá zásuvka — dno', ks: n, delka: Math.round(560 / n) - 40, sirka: hlU - 40, tloustka: 10, material: 'překližka', hrany: 'bez úpravy' })
      kovani.push({ nazev: 'Podstavný výsuv 450 mm pod desku', ks: n })
      kovani.push({ nazev: 'Úchytka madlo 96 mm', ks: n })
    } else if (u.typ === 'skrinka') {
      dilce.push({ skupina: 'Úložné', nazev: 'Skříňka — bok', ks: 2, delka: H - 2, sirka: hlU, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
      dilce.push({ skupina: 'Úložné', nazev: 'Skříňka — dno, police, víko', ks: 3, delka: 420 - 2 * KORPUS_TL, sirka: hlU, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
      dilce.push({ skupina: 'Úložné', nazev: 'Dvířka', ks: 1, delka: 420 - 6, sirka: H - 20, tloustka: 19, material: matU, hrany: 'ABS 1 mm po obvodu' })
      kovani.push({ nazev: 'Pant s tlumením 110°', ks: 2 })
      kovani.push({ nazev: 'Úchytka', ks: 1 })
    } else if (u.typ === 'police') {
      dilce.push({ skupina: 'Úložné', nazev: 'Police — bok', ks: 2, delka: H - 2, sirka: hlU, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
      dilce.push({ skupina: 'Úložné', nazev: 'Police — polička', ks: 2, delka: 420 - 2 * KORPUS_TL, sirka: hlU - 20, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
      dilce.push({ skupina: 'Úložné', nazev: 'Police — záda', ks: 1, delka: H - 10, sirka: 420 - 2 * KORPUS_TL, tloustka: 10, material: matU, hrany: 'bez úpravy' })
    } else if (u.typ === 'zadni-panel') {
      dilce.push({
        skupina: 'Úložné', nazev: 'Zadní panel — rameno A', ks: 1,
        delka: r.ramenoADelka - 60, sirka: 300, tloustka: KORPUS_TL,
        material: material(u.materialId ?? c.deska.materialId).nazev, hrany: 'ABS 1 mm po obvodu',
      })
      if (jeL) {
        dilce.push({
          skupina: 'Úložné', nazev: 'Zadní panel — rameno B', ks: 1,
          delka: r.ramenoBDelka - r.ramenoBHloubka - 40, sirka: 300, tloustka: KORPUS_TL,
          material: material(u.materialId ?? c.deska.materialId).nazev, hrany: 'ABS 1 mm po obvodu',
        })
      }
      kovani.push({ nazev: 'Úhelník pro kotvení panelu k desce', ks: jeL ? 8 : 5 })
    }
  }

  // --- DOPLŇKY ---
  const d = c.doplnky
  if (d.kabelovaLavka) kovani.push({ nazev: 'Kabelová lávka pod desku 600 mm', ks: jeL ? 2 : 1 })
  if (d.pruchodka === 'kulata') kovani.push({ nazev: 'Kabelová průchodka kulatá ⌀80 mm', ks: 1, poznamka: 'otvor ⌀80, vyfrézuje truhlář' })
  if (d.pruchodka === 'obdelnikova') kovani.push({ nazev: 'Kabelová průchodka obdélníková 145×55 mm', ks: 1, poznamka: 'výřez 145×55' })
  if (d.ledPodsviceni) {
    kovani.push({ nazev: 'LED profil zápustný + difuzor', ks: jeL ? 2 : 1, poznamka: `celkem cca ${Math.round((r.ramenoADelka + (jeL ? r.ramenoBDelka : 0)) / 1000 * 10) / 10} bm` })
    kovani.push({ nazev: 'LED pásek 2700 K, 24 V, 9,6 W/m + zdroj', ks: 1 })
  }
  if (d.nastavecMonitor) {
    dilce.push({
      skupina: 'Doplňky', nazev: 'Nástavec na monitor — deska', ks: 1, delka: 620, sirka: 300, tloustka: 20,
      material: mat.nazev, hrany: `${hranaPopis} po obvodu`,
    })
    dilce.push({
      skupina: 'Doplňky', nazev: 'Nástavec na monitor — bok', ks: 2, delka: 580, sirka: 90, tloustka: 20,
      material: mat.nazev, hrany: 'ABS 1 mm',
    })
  }

  return { dilce, kovani }
}

/** Plocha dílců podle materiálu, m². */
export function plochaPodleMaterialu(dilce: Dilec[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const d of dilce) {
    const m2 = (d.delka * d.sirka * d.ks) / 1e6
    out.set(d.material, (out.get(d.material) ?? 0) + m2)
  }
  return out
}
