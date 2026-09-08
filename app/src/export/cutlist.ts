import type { DeskConfig } from '@/model/types'
import { material, KOV } from '@/model/materials'
import { podpory, jekl } from '@/model/podpory'

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

  const lamino = mat.kategorie === 'lamino'
  const hranaPopis = {
    rovna: 'ABS 1 mm ve stejném dekoru',
    srazena: 'ABS 2 mm ve stejném dekoru, rohy R2, PUR lepidlo',
    zkosena: lamino ? 'masivní dubová lišta 30 mm, zkosení 45° shora i zespodu' : 'zkosení 45°',
    radius: lamino ? `masivní dubová lišta 30 mm, zaoblení R${Math.max(3, Math.round(t * 0.3))}` : `zaoblení R${Math.max(3, Math.round(t * 0.3))}`,
    naklizek: 'masivní nákližek 30 mm, zaoblení R3',
  }[c.deska.hrana]

  // --- DESKA ---
  // L se dělá ze dvou dílů spojených v rohu; jeden kus na formát 2800x2070 nevyjde
  // ekonomicky a u masivu se stejně lepí z lamel.
  dilce.push({
    skupina: 'Deska', nazev: 'Deska — rameno A (hlavní plocha)', ks: 1,
    delka: r.ramenoADelka, sirka: r.ramenoAHloubka, tloustka: t,
    material: mat.nazev,
    hrany: `${hranaPopis} — čelní a boční hrana; zadní hrana k stěně bez úpravy`,
    poznamka: [c.deska.radiusRohu > 0 ? `vnější rohy R${c.deska.radiusRohu}` : '', c.deska.radiusUZdi > 0 ? `roh u zdi R${c.deska.radiusUZdi}` : '', c.deska.vyrez > 0 ? `výřez v přední hraně ${c.deska.vyrez} mm v místě sezení` : ''].filter(Boolean).join(', ') || undefined,
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

  // --- PODNOŽ: uzavřené obdélníkové rámy z jeklu naležato ---
  const H = r.vyska - t
  const p = podpory(c)
  const j = jekl(c.podnoz.profil)
  const jeklText = `jekl ${j.sirka}×${j.vyska}×2`
  const komaxit = `ocel, komaxit ${KOV.nazev.toLowerCase()}`
  const skupiny = new Set(p.filter((q) => q.skupina !== 'roh').map((q) => q.skupina))
  let stojky = 0, ramy = 0, delkaRamu = 0
  for (const s of skupiny) {
    const g = p.filter((q) => q.skupina === s)
    if (g.length >= 2) {
      stojky += 2
      ramy += 1
      delkaRamu = Math.max(delkaRamu,
        Math.abs(g[0].z - g[1].z) < 1 ? Math.abs(g[0].x - g[1].x) : Math.abs(g[0].z - g[1].z))
    }
  }
  const roh = p.filter((q) => q.skupina === 'roh').length
  dilce.push({
    skupina: 'Podnož', nazev: `Stojka — ${jeklText}, široká strana v rovině rámu`, ks: stojky + roh,
    delka: H - 2 * j.vyska - 4, sirka: j.sirka, tloustka: j.vyska,
    material: komaxit, hrany: 'zabroušené svary, zaslepeno',
  })
  dilce.push({
    skupina: 'Podnož', nazev: `Lyžina na zemi — ${jeklText} naplocho`, ks: ramy,
    delka: Math.round(delkaRamu + j.sirka), sirka: j.sirka, tloustka: j.vyska,
    material: komaxit, hrany: 'svařeno se stojkami, zespodu plstěné podložky',
  })
  dilce.push({
    skupina: 'Podnož', nazev: `Horní traverza — ${jeklText} naplocho`, ks: ramy,
    delka: Math.round(delkaRamu + j.sirka), sirka: j.sirka, tloustka: j.vyska,
    material: komaxit, hrany: 'svařeno se stojkami, předvrtáno pro vruty',
  })
  if (roh) {
    dilce.push({
      skupina: 'Podnož', nazev: `Patka a hlava rohové stojky — ${jeklText} naplocho`, ks: roh * 2,
      delka: Math.round(j.sirka * 1.6), sirka: Math.round(j.sirka * 1.6), tloustka: j.vyska,
      material: komaxit, hrany: 'svařeno',
    })
  }
  kovani.push({ nazev: 'Plstěná podložka pod lyžinu, samolepicí', ks: ramy * 2 + roh })
  kovani.push({ nazev: 'Vrut do desky 5×30 s podložkou', ks: (stojky + roh) * 2 })

  if (c.podnoz.vyztuha) {
    const delkaA = r.ramenoADelka - 2 * c.podnoz.odsazeni
    dilce.push({
      skupina: 'Podnož', nazev: `Podélná výztuha — ${jeklText} nastojato`,
      ks: jeL ? 2 : 1, delka: Math.round(delkaA), sirka: j.vyska, tloustka: j.sirka,
      material: komaxit,
      hrany: 'předvrtáno pro vruty po 300 mm',
      poznamka: 'bez ní by se deska na dlouhém rameni prohnula',
    })
  }

  // --- ÚLOŽNÉ: pevný kontejner se třemi zásuvkami ---
  for (const u of c.ulozne) {
    const matU = mat.nazev
    const hlU = (u.rameno === 'B' && jeL ? r.ramenoBHloubka : r.ramenoAHloubka) - 60
    const vys = H - 2
    dilce.push({ skupina: 'Úložné', nazev: 'Kontejner — bok', ks: 2, delka: vys, sirka: hlU, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
    dilce.push({ skupina: 'Úložné', nazev: 'Kontejner — dno a víko', ks: 2, delka: 420 - 2 * KORPUS_TL, sirka: hlU, tloustka: KORPUS_TL, material: matU, hrany: 'ABS 1 mm přední hrana' })
    dilce.push({ skupina: 'Úložné', nazev: 'Kontejner — záda', ks: 1, delka: vys - 20, sirka: 420 - 20, tloustka: 4, material: 'HDF', hrany: 'bez úpravy' })
    const hCelo = Math.round((vys - 2 * KORPUS_TL - 2 * 5) / 3)
    dilce.push({ skupina: 'Úložné', nazev: 'Čelo zásuvky', ks: 3, delka: 420 - 6, sirka: hCelo, tloustka: 19, material: matU, hrany: 'ABS 1 mm po obvodu' })
    dilce.push({ skupina: 'Úložné', nazev: 'Dno zásuvky', ks: 3, delka: 420 - 2 * KORPUS_TL - 26, sirka: hlU - 40, tloustka: 16, material: matU, hrany: 'ABS 0,8 mm' })
    kovani.push({ nazev: 'Plnovýsuv s tlumením, délka 450 mm, nosnost 30 kg', ks: 3, poznamka: 'Blum TANDEMBOX antaro nebo Hettich InnoTech' })
    kovani.push({ nazev: 'Úchytka madlo 128 mm', ks: 3 })
    kovani.push({ nazev: 'Rektifikační patka M8', ks: 4, poznamka: 'kontejner stojí na podlaze, vlysy nejsou v rovině' })
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
