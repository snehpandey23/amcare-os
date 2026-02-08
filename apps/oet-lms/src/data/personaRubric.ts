/**
 * Assessment rubric evaluation for persona-based chats.
 * Phase 1: simple heuristics (keywords, timeline presence) to suggest whether MA met each criterion.
 * Phase 2+: GPT or trainer can replace this with full scoring.
 */

import type { Persona } from './personas'

export interface RubricItemResult {
  criterion: string
  /** Simple auto-check: true if heuristics suggest criterion may be met. */
  suggestedMet: boolean
  /** Short hint for trainer/MA. */
  hint: string
}

/** Concatenate all MA messages (as the trainer would see the conversation). */
function maTextOnly(messages: { who: string; text: string }[]): string {
  return messages
    .filter((m) => m.who === 'you')
    .map((m) => m.text || '')
    .join(' ')
    .toLowerCase()
}

/** Check if text contains something like a timeline (number + day/week/hour). */
function hasTimeline(text: string): boolean {
  return /\d+\s*(day|week|hour|minute|month)|(next|this)\s*(week|friday|monday)|(in|within)\s*\d+/i.test(text)
}

/** Check if text mentions agreement/consent/sign (CSA). */
function mentionsAgreementOrConsent(text: string): boolean {
  return /agreement|consent|sign|csa|controlled substance/i.test(text)
}

/** Check if text has concrete next steps (numbers, steps, dates). */
function hasConcreteNextSteps(text: string): boolean {
  return /\d|step|first|then|today|tomorrow|schedule|form|link|call|email/i.test(text) && text.split(/\s+/).length >= 8
}

/** Check if text explains in simple (non-jargon) terms: short sentences, common words. */
function seemsPlainLanguage(text: string): boolean {
  const jargon = /neuropsychological|comprehensive evaluation|pathophysiology|dopamine|prefrontal cortex|chemical imbalance/i
  return !jargon.test(text)
}

/** Check if text addresses cost/payment. */
function mentionsCostOrPayment(text: string): boolean {
  return /cost|price|pay|payment|fee|\$|dollar|afford/i.test(text)
}

/** Check if text acknowledges skepticism or concern. */
function acknowledgesConcern(text: string): boolean {
  return /understand|hear|valid|reasonable|makes sense|appreciate|respect/i.test(text)
}

/**
 * Returns rubric results for this persona and the MA's messages.
 * suggestedMet is a heuristic only; trainer/MA should still review.
 */
export function evaluatePersonaRubric(
  persona: Persona,
  messages: { who: string; text: string }[]
): RubricItemResult[] {
  const text = maTextOnly(messages)
  const results: RubricItemResult[] = []

  for (const criterion of persona.assessmentRubric) {
    const c = criterion.toLowerCase()
    let suggestedMet = false
    let hint = 'Review your conversation against this criterion.'

    if (c.includes('consent') && c.includes('agreement')) {
      suggestedMet = mentionsAgreementOrConsent(text)
      hint = suggestedMet ? 'You mentioned agreement/consent.' : 'Did you clearly explain and get consent for the controlled substance agreement?'
    } else if (c.includes('neuropsych') && (c.includes('functional') || c.includes('jargon'))) {
      suggestedMet = seemsPlainLanguage(text) && /test|testing|focus|attention|how you do/i.test(text)
      hint = suggestedMet ? 'You used plain language about testing.' : 'Did you explain neuropsych testing in functional terms, not medical jargon?'
    } else if (c.includes('timeline') || c.includes('specific timeline') || c.includes('alternative')) {
      suggestedMet = hasTimeline(text)
      hint = suggestedMet ? 'You gave a timeline or timeframe.' : 'Did you provide a specific timeline or offer an alternative (e.g. expedited testing)?'
    } else if (c.includes('respected') && c.includes('not judged')) {
      suggestedMet = !/assess you properly|we need to evaluate/i.test(text) && text.length > 50
      hint = 'Did the patient leave feeling respected, not judged?'
    } else if (c.includes('time constraint') || c.includes('first exchange')) {
      suggestedMet = hasConcreteNextSteps(text) || /10 minute|quick|short|brief/i.test(text)
      hint = suggestedMet ? 'You acknowledged time or gave clear next steps.' : 'Did you respect their time in the first exchange?'
    } else if (c.includes('next steps') && c.includes('dates')) {
      suggestedMet = hasConcreteNextSteps(text) || hasTimeline(text)
      hint = suggestedMet ? 'You gave specific next steps or dates.' : 'Did you give specific next steps (dates, forms, schedule)?'
    } else if (c.includes('testing') && c.includes('psychological')) {
      suggestedMet = !/mental health|psychological|in your head/i.test(text)
      hint = suggestedMet ? 'You explained testing without implying psychological cause.' : 'Did you explain ADHD testing without implying it\'s "in their head"?'
    } else if (c.includes('methodology') || c.includes('framework')) {
      suggestedMet = /protocol|process|we use|assessment|test/i.test(text) && text.length > 80
      hint = suggestedMet ? 'You addressed process or protocol.' : 'Did you answer their methodology/protocol question directly?'
    } else if (c.includes('sleep') || c.includes('differential')) {
      suggestedMet = /sleep|rule out|differential|both/i.test(text)
      hint = suggestedMet ? 'You addressed sleep or differential.' : 'Did you address their specific concern (e.g. sleep apnea)?'
    } else if (c.includes('observations') || c.includes('perspective first')) {
      suggestedMet = /\?|what have you|notice|observe|changes/i.test(text)
      hint = suggestedMet ? 'You asked for their perspective or observations.' : 'Did you ask their observations before giving clinical info?'
    } else if (c.includes('medication safety') || c.includes('validat')) {
      suggestedMet = acknowledgesConcern(text) && /watch|monitor|side effect|safe|dose/i.test(text)
      hint = suggestedMet ? 'You acknowledged concerns and addressed safety.' : 'Did you validate their medication safety concerns?'
    } else if (c.includes('cost') || c.includes('payment plan')) {
      suggestedMet = mentionsCostOrPayment(text)
      hint = suggestedMet ? 'You addressed cost or payment.' : 'Did you clearly state total cost or payment plan?'
    } else if (c.includes('medically necessary') || c.includes('not optional')) {
      suggestedMet = /required|necessary|need to|protocol/i.test(text)
      hint = suggestedMet ? 'You clarified what\'s required.' : 'Did you explain what tests are medically necessary?'
    } else if (c.includes('one contact')) {
      suggestedMet = /one person|single contact|reach out to me|your contact|call me|email me/i.test(text)
      hint = suggestedMet ? 'You gave a single point of contact.' : 'Did you give one clear contact person?'
    } else if (c.includes('skepticism') && c.includes('reasonable')) {
      suggestedMet = acknowledgesConcern(text)
      hint = suggestedMet ? 'You acknowledged their perspective.' : 'Did you acknowledge their skepticism as reasonable?'
    } else if (c.includes('functional') && c.includes('neurological')) {
      suggestedMet = seemsPlainLanguage(text) && /focus|attention|work|daily|function/i.test(text)
      hint = suggestedMet ? 'You used functional language.' : 'Did you explain ADHD in functional terms, not neuroscience?'
    } else if (c.includes('telehealth')) {
      suggestedMet = /video|telehealth|remote|online|call/i.test(text)
      hint = suggestedMet ? 'You addressed how assessment is done.' : 'Did you address why assessment can be done via telehealth?'
    }

    results.push({ criterion, suggestedMet, hint })
  }

  return results
}
