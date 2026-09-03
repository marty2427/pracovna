/**
 * Playwright průlet appkou: udělá screenshoty 3D náhledu (a půdorysu, až bude)
 * pro sadu konfigurací nebo pro všechny presety.
 *
 *   node scripts/screenshots.mjs [--url http://127.0.0.1:5173] [--preset <id>|all] [--out screenshots]
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}

const URL = arg('url', 'http://127.0.0.1:5173')
const OUT = arg('out', 'screenshots')
const ONLY = arg('preset', null)
const POHLEDY = (arg('pohledy', 'perspektiva,celne,bok') || '').split(',').filter(Boolean)

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })

const chyby = []
page.on('console', (msg) => { if (msg.type() === 'error') chyby.push(msg.text()) })
page.on('pageerror', (e) => chyby.push(String(e)))

const cil = ONLY ? `${URL}/?preset=${encodeURIComponent(ONLY)}` : URL
await page.goto(cil, { waitUntil: 'networkidle' })
// počkat, až se scéna aspoň jednou vykreslí
await page.waitForFunction(() => {
  const c = document.querySelector('canvas')
  return c && c.width > 0 && c.height > 0
}, { timeout: 30000 })
await page.waitForTimeout(2500)

const jmeno = ONLY ? ONLY.replace(/[^a-z0-9-]/gi, '_') : 'vychozi'

for (const p of POHLEDY) {
  const btn = page.locator(`.pohledy button`, { hasText: new RegExp(`^${p}$`, 'i') })
  if (await btn.count()) { await btn.first().click(); await page.waitForTimeout(1200) }
  await page.screenshot({ path: join(OUT, `${jmeno}__${p}.png`), timeout: 120000, animations: "disabled" })
  console.log(`  ${join(OUT, `${jmeno}__${p}.png`)}`)
}

if (chyby.length) {
  console.log('\nCHYBY V KONZOLI:')
  for (const c of [...new Set(chyby)].slice(0, 12)) console.log('  ! ' + c)
} else {
  console.log('\nKonzole čistá.')
}
await browser.close()
