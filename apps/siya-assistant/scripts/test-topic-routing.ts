/**
 * Regression: short clinical/lab markers must surface the matching public page,
 * not generic Pricing / Health Guides fallbacks.
 */
import { runSiyaGuide } from '../lib/guide-engine'

process.env.SIYA_GUIDE_DETERMINISTIC = '1'

const cases: Array<{ q: string; mustUrlIncludes: string }> = [
  { q: 'tsh', mustUrlIncludes: '/labs/thyroid' },
  { q: 'online tsh', mustUrlIncludes: '/labs/thyroid' },
  { q: 'thyroid labs', mustUrlIncludes: '/labs/thyroid' },
  { q: 'a1c', mustUrlIncludes: '/labs/a1c' },
  { q: 'ferritin', mustUrlIncludes: '/labs/iron-ferritin' },
  { q: 'fever', mustUrlIncludes: '/primary-urgent-care' },
  { q: 'who will i see', mustUrlIncludes: '/providers' },
]

async function main() {
  let failed = 0
  for (const c of cases) {
    const r = await runSiyaGuide(c.q)
    const urls = r.links.map((l) => l.url).join(' ')
    const ok = urls.includes(c.mustUrlIncludes)
    if (!ok) {
      failed++
      console.error(`FAIL [${c.q}] expected url containing ${c.mustUrlIncludes}`)
      console.error('  links:', r.links.map((l) => l.url))
      console.error('  message:', r.message.slice(0, 120))
    } else {
      console.log(`OK   [${c.q}] → ${r.links[0]?.url}`)
    }
  }

  if (failed) {
    console.error(`\n${failed}/${cases.length} topic-routing failures`)
    process.exit(1)
  }
  console.log(`\nTopic routing: ${cases.length}/${cases.length} passed`)
}

main()
