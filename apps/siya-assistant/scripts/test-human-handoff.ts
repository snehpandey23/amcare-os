import { runSiyaGuide } from '../lib/guide-engine'

process.env.SIYA_GUIDE_DETERMINISTIC = '1'

async function main() {
  let failed = 0
  const cases = ['human', 'talk', 'i want human being', 'real person', 'speak to someone']
  for (const prompt of cases) {
    const res = await runSiyaGuide(prompt)
    const blob = `${res.message} ${(res.followUp || '')} ${res.links.map((l) => l.id).join(',')}`
    const ok =
      res.state === 'verified' &&
      /215|call|text|email|spruce|human/i.test(blob) &&
      res.links.some((l) => ['call_siya', 'text_siya', 'email_siya', 'spruce_practice', 'meet_and_greet'].includes(l.id))
    if (!ok) {
      console.error('FAIL', prompt, res.state, res.message.slice(0, 160), res.links.map((l) => l.id))
      failed++
    } else {
      console.log('OK', prompt, '→', res.links.map((l) => l.id).join(','))
    }
  }
  if (failed) process.exit(1)
  console.log('\nHuman handoff: passed')
}

main()
