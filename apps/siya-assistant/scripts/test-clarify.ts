import { runSiyaGuide } from '../lib/guide-engine'

process.env.SIYA_GUIDE_DETERMINISTIC = '1'

async function main() {
  let failed = 0

  const stub = await runSiyaGuide('testost')
  if (stub.state !== 'ambiguous' || !/didn.|mean|sure/i.test(stub.message)) {
    console.error('FAIL testost should clarify, got', stub.state, stub.message)
    failed++
  } else console.log('OK testost clarifies:', stub.message.slice(0, 100))

  const follow = await runSiyaGuide('check', { priorUserMessages: ['testost'] })
  const urls = follow.links.map((l) => l.url).join(' ')
  if (!/mens-health|labs/i.test(urls) && follow.state === 'ambiguous' && !/testosterone|Men/i.test(follow.message + (follow.followUp || ''))) {
    // expanded path should hit mens health verified OR clarify with testosterone
    console.error('FAIL check after testost', follow)
    failed++
  } else console.log('OK check+testost →', follow.state, follow.links.map((l) => l.id).join(','))

  const checkAlone = await runSiyaGuide('check')
  if (checkAlone.state !== 'ambiguous') {
    console.error('FAIL bare check should clarify', checkAlone)
    failed++
  } else console.log('OK bare check clarifies')

  if (failed) process.exit(1)
  console.log('\nClarify routing: passed')
}

main()