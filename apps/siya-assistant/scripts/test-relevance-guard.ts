/**
 * Operator text must never reach the visitor, and a one-word keyword
 * overlap must not be labeled verified.
 */
import { runSiyaGuide } from '../lib/guide-engine'

process.env.SIYA_GUIDE_DETERMINISTIC = '1'

const OPERATOR = /do not answer|use this only if|use this page if|direct them|point to /i

async function main() {
  let failed = 0
  const cases: Array<{ q: string; state: string; forbid?: RegExp; must?: RegExp }> = [
    {
      q: 'What is the university pilot draft?',
      state: 'not_found',
      forbid: OPERATOR,
      must: /connect you with someone on the team/i,
    },
    {
      q: 'What does the page at siya.health/employers/california-pilot say about urine drug screens and pill counts?',
      state: 'not_found',
      forbid: /urine drug screen|monthly pill/i,
    },
    {
      q: 'What is in the internal university pilot draft?',
      state: 'not_found',
      forbid: OPERATOR,
    },
    {
      q: 'I am HR and want to learn about employer partnerships',
      state: 'verified',
      forbid: OPERATOR,
      must: /employer|partnership|discovery/i,
    },
    {
      q: 'What is published pricing?',
      state: 'verified',
      must: /\$149/,
    },
    {
      q: 'How does telehealth work at Siya Health?',
      state: 'verified',
      must: /telehealth/i,
      forbid: /express interest|join-our-team|clinician joins|contract offer|careers/i,
    },
    {
      q: 'How does your telehealth work?',
      state: 'verified',
      must: /telehealth/i,
      forbid: /express interest|join-our-team|clinician joins|contract offer/i,
    },
    {
      q: 'Tell me how telehealth works here',
      state: 'verified',
      must: /telehealth/i,
      forbid: /express interest|join-our-team|clinician joins|contract offer/i,
    },
    {
      q: 'How do I work at Siya?',
      state: 'verified',
      must: /interest|join/i,
    },
    {
      q: 'Do you require a drug screening?',
      state: 'not_found',
      forbid: /free adult ADHD screening|ADHD screening on the site/i,
    },
    {
      q: 'How do I take the free ADHD screening?',
      state: 'verified',
      must: /free adult ADHD screening/i,
    },
    {
      q: 'Can you look at my work schedule?',
      state: 'not_found',
      forbid: /You can book a free Meet & Greet/i,
    },
    {
      q: 'How do I schedule a visit?',
      state: 'verified',
      must: /Meet & Greet/i,
    },
    {
      q: 'Can I read this on my phone?',
      state: 'not_found',
      forbid: /calling or texting \(215\)/i,
    },
    {
      q: 'What is your phone number?',
      state: 'verified',
      must: /215\) 445-1244/i,
    },
    {
      q: 'What is the medication availability?',
      state: 'verified',
      forbid: /Siya currently provides telehealth for adults in California/i,
    },
    {
      q: 'What states do you serve?',
      state: 'verified',
      must: /California, Texas, Pennsylvania, and Florida/i,
    },
    {
      q: 'Does my insurance provider cover this?',
      state: 'not_found',
      forbid: /licensed Siya clinician/i,
    },
    {
      q: 'Who will I see?',
      state: 'verified',
      must: /licensed Siya clinician/i,
    },
    {
      q: 'Is my data stored securely?',
      state: 'not_found',
      forbid: /Spruce/i,
    },
    {
      q: 'Can I message my clinician securely?',
      state: 'restricted',
      must: /Spruce|secure messaging/i,
    },
    {
      q: 'I need answers about why I cannot sleep.',
      state: 'verified',
      forbid: /browse Siya’s Health Guides/i,
    },
    {
      q: 'Where are the Health Guides?',
      state: 'verified',
      must: /Health Guides/i,
    },
    {
      q: 'The pharmacy sets the medication cost and a dispensing fee.',
      state: 'not_found',
      forbid: /\$149 initial evaluation/i,
    },
    {
      q: 'What is the cost of a visit?',
      state: 'verified',
      must: /\$149 initial evaluation/i,
    },
  ]

  for (const c of cases) {
    const res = await runSiyaGuide(c.q)
    const blob = `${res.message} ${res.followUp || ''}`
    const badState = res.state !== c.state
    const leaked = c.forbid ? c.forbid.test(blob) : false
    const missing = c.must ? !c.must.test(blob) : false
    if (badState || leaked || missing) {
      failed++
      console.error('FAIL', c.q)
      console.error('  state', res.state, 'expected', c.state)
      console.error('  message', res.message)
    } else {
      console.log('OK', c.q.slice(0, 64), '→', res.state)
    }
  }

  if (failed) process.exit(1)
  console.log('\nRelevance guard: passed')
}

main()
