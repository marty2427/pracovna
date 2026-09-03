/**
 * Playwright průlet appkou.
 *
 *   node scripts/screenshots.mjs                     # záložky + výchozí konfigurace
 *   node scripts/screenshots.mjs --presety           # projede všechny presety v galerii
 *   node scripts/screenshots.mjs --pohledy a,b,c
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const má = (n) => process.argv.includes(`--${n}`)

const URL = arg('url', 'http://127.0.0.1:5173')
const OUT = arg('out', 'screenshots')
const POHLEDY = (arg('pohledy', 'perspektiva,bok') || '').split(',').filter(Boolean)
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: má('presety') ? 1180 : 1600, height: má('presety') ? 720 : 940 }, deviceScaleFactor: 1 })
const chyby = []
page.on('console', (m) => { if (m.type() === 'error' && !/favicon/i.test(m.text())) chyby.push(m.text()) })
page.on('pageerror', (e) => chyby.push(String(e)))

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => { const c = document.querySelector('canvas'); return c && c.width > 0 }, { timeout: 60000 })
await page.waitForTimeout(3000)

const snap = async (jmeno) => {
  await page.screenshot({ path: join(OUT, `${jmeno}.png`), timeout: 120000, animations: 'disabled' })
  console.log('  ' + jmeno + '.png')
}

if (má('presety')) {
  const OD = Number(arg('od', '0'))
  await page.getByRole('button', { name: 'Galerie presetů' }).click()
  await page.waitForTimeout(900)
  if (OD === 0) await snap('galerie')
  const karty = await page.locator('.karta').count()
  console.log(`presetů v galerii: ${karty}, začínám od ${OD}`)
  const selhalo = []
  for (let i = OD; i < karty; i++) {
    await page.getByRole('button', { name: 'Galerie presetů' }).click()
    await page.waitForTimeout(350)
    const karta = page.locator('.karta').nth(i)
    const nazev = (await karta.locator('h4').innerText()).trim()
    await karta.click()
    await page.waitForTimeout(1800)
    const jm = `preset-${String(i + 1).padStart(2, '0')}-${nazev.toLowerCase().replace(/[^a-z0-9]+/gi, '-').slice(0, 34)}`
    // jen 3D náhled, ne celá stránka — 58 celostránkových PNG je zbytečně moc dat
    try {
      await page.locator('.viewport').screenshot({ path: join(OUT, `${jm}.png`), timeout: 60000, animations: 'disabled' })
      console.log('  ' + jm + '.png')
    } catch (e) {
      selhalo.push(`${i}: ${nazev} — ${String(e).split('\n')[0]}`)
      console.log('  ! selhalo ' + jm)
    }
  }
  if (selhalo.length) console.log('\nNEVYKRESLENO:\n  ' + selhalo.join('\n  '))
} else {
  for (const p of POHLEDY) {
    const b = page.locator('.pohledy button', { hasText: new RegExp(`^${p}$`, 'i') })
    if (await b.count()) { await b.first().click(); await page.waitForTimeout(1400) }
    await snap(`ui-konfigurator-${p}`)
  }
  for (const [zal, jm] of [['Galerie presetů', 'ui-galerie'], ['Koupit / na míru', 'ui-koupit'], ['Export poptávky', 'ui-export']]) {
    await page.getByRole('button', { name: zal }).click()
    await page.waitForTimeout(1600)
    await snap(jm)
  }
}

console.log(chyby.length ? '\nCHYBY:\n  ' + [...new Set(chyby)].slice(0, 10).join('\n  ') : '\nKonzole čistá.')
await browser.close()
