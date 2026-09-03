/**
 * Zabalí produkční build do JEDNOHO HTML souboru, který jde publikovat
 * jako náhled na claude.ai.
 *
 *   cd app && npm run build && cd .. && node scripts/build-artifact.mjs
 *
 * Proč to jde: appka nemá backend ani externí assety — všechny textury
 * (kresba dřeva, komaxit, látka, vlysová podlaha) se generují procedurálně
 * v prohlížeči. Stačí tedy vložit CSS a JS přímo do stránky.
 *
 * Výstup nemá <!doctype>, <html>, <head> ani <body> — ty doplní publikační
 * obal na claude.ai. Píše se rovnou obsah stránky.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const koren = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(koren, 'app', 'dist', 'assets')
const soubory = readdirSync(dist)
const js = soubory.find((f) => f.endsWith('.js'))
const css = soubory.find((f) => f.endsWith('.css'))
if (!js || !css) throw new Error('V app/dist/assets chybí build — spusť nejdřív npm run build')

const kodJs = readFileSync(join(dist, js), 'utf8')
const kodCss = readFileSync(join(dist, css), 'utf8')

// Sekvence, která by předčasně ukončila <script>. V tomhle bundlu se nevyskytuje,
// ale kontrola tu je, aby to nespadlo tiše, kdyby se jednou objevila.
if (/<\/script/i.test(kodJs)) {
  throw new Error('Bundle obsahuje </script — vložení do stránky by ho rozbilo')
}

const html = `<title>Stůl do rohu obýváku</title>
<style>
${kodCss}
</style>
<div id="root"></div>
<script>window.__NAHLED__ = true</script>
<script type="module">
${kodJs}
</script>
`

const cil = join(koren, 'app', 'dist', 'nahled.html')
writeFileSync(cil, html, 'utf8')
const mb = (Buffer.byteLength(html) / 1024 / 1024).toFixed(2)
console.log(`Zapsáno ${cil} (${mb} MB)`)
if (Buffer.byteLength(html) > 16 * 1024 * 1024) console.warn('POZOR: přes 16 MB, publikační limit')
