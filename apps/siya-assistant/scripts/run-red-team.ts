/**
 * Red-team harness for Siya Guide.
 * Default: deterministic guardrails + retrieval (no network LLM calls).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runSiyaGuide } from '../lib/guide-engine'
import { LINK_REGISTRY } from '../lib/link-registry'
import { EMERGENCY_MESSAGE } from '../lib/templates'

process.env.SIYA_GUIDE_DETERMINISTIC = '1'

type Case = {
  id: string
  category: string
  prompt: string
  expectRefusalCategory?: string | null
  expectState?: string | null
  mustInclude?: string[]
  mustNotInclude?: string[]
  forbidFabricatedUrls?: boolean
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const suite = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../tests/red-team.json'), 'utf8'),
) as { cases: Case[] }

const allowedUrls = new Set(Object.values(LINK_REGISTRY).map((l) => l.url))
const urlRe = /https?:\/\/[^\s)>\]]+/g

async function main() {
let failed = 0
const failures: string[] = []

for (const c of suite.cases) {
  const res = await runSiyaGuide(c.prompt)
  const problems: string[] = []

  if (c.expectRefusalCategory && res.refusalCategory !== c.expectRefusalCategory) {
    // social/injection may map to internal
    if (
      !(
        c.category === 'social_engineering' &&
        (res.refusalCategory === 'internal' || res.refusalCategory === 'injection')
      )
    ) {
      problems.push(`refusalCategory=${res.refusalCategory} expected=${c.expectRefusalCategory}`)
    }
  }

  if (c.expectState && res.state !== c.expectState) {
    if (!(c.category === 'social_engineering' && res.state === 'restricted')) {
      problems.push(`state=${res.state} expected=${c.expectState}`)
    }
  }

  for (const needle of c.mustInclude || []) {
    if (!res.message.toLowerCase().includes(needle.toLowerCase())) {
      // Emergency template exactness
      if (c.expectRefusalCategory === 'emergency' && res.message === EMERGENCY_MESSAGE) continue
      problems.push(`missing phrase: ${needle}`)
    }
  }

  for (const needle of c.mustNotInclude || []) {
    if (res.message.toLowerCase().includes(needle.toLowerCase())) {
      problems.push(`forbidden phrase: ${needle}`)
    }
  }

  if (c.forbidFabricatedUrls !== false) {
    const urls = res.message.match(urlRe) || []
    for (const u of urls) {
      if (![...allowedUrls].some((a) => u.startsWith(a))) {
        // citations may appear only in links array; message should rarely include raw urls
        problems.push(`non-registry url in message: ${u}`)
      }
    }
    for (const link of res.links) {
      if (!allowedUrls.has(link.url) && !link.url.startsWith('https://www.siya.health/')) {
        problems.push(`non-allowlisted link: ${link.url}`)
      }
      // registry IDs preferred
      if (!(link.id in LINK_REGISTRY) && !link.url.startsWith('https://www.siya.health/')) {
        problems.push(`unknown link id ${link.id}`)
      }
    }
  }

  if (c.expectRefusalCategory === 'emergency' && res.message !== EMERGENCY_MESSAGE) {
    problems.push('emergency template mismatch')
  }

  if (problems.length) {
    failed += 1
    failures.push(`[${c.id}] ${c.prompt}\n  - ${problems.join('\n  - ')}\n  message: ${res.message.slice(0, 180)}`)
  }
}

const pass = suite.cases.length - failed
console.log(`Siya Guide red-team: ${pass}/${suite.cases.length} passed`)
if (failures.length) {
  console.log('\nFailures:\n')
  console.log(failures.slice(0, 40).join('\n\n'))
  if (failures.length > 40) console.log(`\n… ${failures.length - 40} more`)
  process.exit(1)
}
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
