import { resolveLinks } from './link-registry'
import { isHumanHandoffRequest } from './intents'
import { humanHandoffResponse } from './templates'
import { linksFromRetrieval } from './public-routes'
import { retrievePublicKnowledge } from './retrieval'
import type { GuideLink, GuideResponse } from './types'

export type ConversationContext = {
  /** Recent user messages only (newest last). Never store server-side. */
  priorUserMessages?: string[]
}

type TopicOption = {
  id: string
  /** Match stems / aliases (include common stubs) */
  keys: string[]
  /** Friendly label in “did you mean” */
  label: string
  /** Expanded query to run if chosen / confirmed */
  expandTo: string
  linkIds: string[]
}

/**
 * Small navigation topic index for clarification — not a medical ontology.
 * Incomplete typing (“testost”) and short follow-ups (“check”) resolve here first.
 */
export const TOPIC_OPTIONS: TopicOption[] = [
  {
    id: 'testosterone',
    keys: ['testosterone', 'testost', 'testo', 'low t', 'trt', 'free testosterone', 'shbg'],
    label: "Men's health / testosterone",
    expandTo: 'testosterone mens health',
    linkIds: ['mens_health', 'labs'],
  },
  {
    id: 'thyroid',
    keys: ['thyroid', 'thyro', 'tsh', 'free t4'],
    label: 'Thyroid / TSH labs',
    expandTo: 'thyroid tsh labs',
    linkIds: ['labs_thyroid', 'labs'],
  },
  {
    id: 'a1c',
    keys: ['a1c', 'hba1c', 'blood sugar'],
    label: 'A1c / blood sugar labs',
    expandTo: 'a1c blood sugar labs',
    linkIds: ['labs_a1c', 'labs'],
  },
  {
    id: 'ferritin',
    keys: ['ferritin', 'ferrit', 'iron'],
    label: 'Iron / ferritin labs',
    expandTo: 'ferritin iron labs',
    linkIds: ['labs_iron', 'labs'],
  },
  {
    id: 'adhd',
    keys: ['adhd', 'focus', 'attention'],
    label: 'Adult ADHD care',
    expandTo: 'adhd care',
    linkIds: ['adhd_care', 'adhd_screening'],
  },
  {
    id: 'weight',
    keys: ['weight', 'glp', 'semaglutide', 'ozempic', 'wegovy'],
    label: 'Weight loss / metabolic health',
    expandTo: 'weight loss metabolic health',
    linkIds: ['weight_loss', 'meet_and_greet'],
  },
  {
    id: 'pricing',
    keys: ['pricing', 'price', 'cost', 'fee'],
    label: 'Pricing',
    expandTo: 'pricing',
    linkIds: ['pricing', 'meet_and_greet'],
  },
  {
    id: 'booking',
    keys: ['book', 'booking', 'appointment', 'meet', 'greet'],
    label: 'Book a Meet & Greet',
    expandTo: 'book meet and greet',
    linkIds: ['meet_and_greet'],
  },
  {
    id: 'labs',
    keys: ['labs', 'lab', 'blood test'],
    label: 'Labs & blood tests',
    expandTo: 'labs blood tests',
    linkIds: ['labs', 'meet_and_greet'],
  },
  {
    id: 'providers',
    keys: ['provider', 'doctor', 'clinician', 'care team'],
    label: 'Care team / who you may see',
    expandTo: 'care team providers',
    linkIds: ['providers', 'meet_and_greet'],
  },
]

const FOLLOW_UP_RE =
  /^(check|yes|yeah|yep|yup|that|this|ok|okay|sure|more|please|do it|go ahead|the first|first one|second|that one|this one|continue|same|it)\b/i

export function isFollowUpUtterance(text: string): boolean {
  const t = text.trim()
  if (t.length <= 12 && FOLLOW_UP_RE.test(t)) return true
  if (/^(check|test|see|look( at)?)\s*$/i.test(t)) return true
  return false
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Topics mentioned in prior user turns (for “check” → check testosterone). */
export function inferPriorTopics(priorUserMessages: string[] = []): TopicOption[] {
  const found: TopicOption[] = []
  const seen = new Set<string>()
  for (const msg of [...priorUserMessages].reverse()) {
    for (const topic of matchTopics(msg, { allowPrefix: true })) {
      if (seen.has(topic.id)) continue
      seen.add(topic.id)
      found.push(topic)
      if (found.length >= 3) return found
    }
  }
  return found
}

export function matchTopics(
  text: string,
  opts: { allowPrefix?: boolean } = {},
): TopicOption[] {
  const q = normalize(text)
  if (!q) return []
  const tokens = q.split(' ').filter(Boolean)
  const hits: Array<{ topic: TopicOption; score: number }> = []

  for (const topic of TOPIC_OPTIONS) {
    let score = 0
    for (const key of topic.keys) {
      if (q === key || tokens.includes(key)) score += 10
      else if (q.includes(key) || key.includes(q)) score += 6
      else if (opts.allowPrefix) {
        for (const tok of tokens) {
          if (tok.length >= 3 && key.startsWith(tok) && tok.length < key.length) score += 8
          if (tok.length >= 4 && tok.startsWith(key.slice(0, 4))) score += 3
        }
      }
    }
    if (score > 0) hits.push({ topic, score })
  }

  return hits
    .sort((a, b) => b.score - a.score)
    .map((h) => h.topic)
}

/** Incomplete stub like “testost” that maps to a longer topic key. */
export function isIncompleteStub(text: string): boolean {
  const q = normalize(text)
  if (!q || q.split(' ').length > 2) return false
  if (q.length <= 4) return true
  const topics = matchTopics(q, { allowPrefix: true })
  if (!topics.length) return false
  // stub if query is proper prefix of a key and not an exact key
  return topics.some((topic) =>
    topic.keys.some((key) => key.startsWith(q) && q.length < key.length && q.length >= 3),
  )
}

export function clarifyResponse(opts: {
  message: string
  followUp?: string
  topics?: TopicOption[]
  linkIds?: string[]
  chunks?: ReturnType<typeof retrievePublicKnowledge>
}): GuideResponse {
  let links: GuideLink[] = []
  if (opts.chunks?.length) {
    links = linksFromRetrieval(opts.chunks, { extras: [], limit: 3 })
  }
  if (!links.length && opts.topics?.length) {
    const ids = opts.topics.flatMap((t) => t.linkIds).slice(0, 3)
    links = resolveLinks(ids)
  }
  if (!links.length && opts.linkIds?.length) {
    links = resolveLinks(opts.linkIds)
  }

  return {
    state: 'ambiguous',
    message: opts.message,
    followUp:
      opts.followUp ||
      'Reply with a few more words (for example “check testosterone” or “TSH labs”), or tap an option below.',
    links,
    citations: [],
    refusalCategory: 'none',
  }
}

/**
 * Resolve short / vague turns into either:
 * - an expanded query to continue routing, or
 * - a clarification GuideResponse
 */
export function resolveConversationalQuery(
  userText: string,
  context: ConversationContext = {},
): { kind: 'expand'; query: string } | { kind: 'clarify'; response: GuideResponse } | { kind: 'continue'; query: string } {
  const text = userText.trim()
  const prior = context.priorUserMessages || []
  const priorTopics = inferPriorTopics(prior)

  // “human” / “talk” / “real person” → people contact paths, not article clarify
  if (isHumanHandoffRequest(text)) {
    return { kind: 'clarify', response: humanHandoffResponse() }
  }

  // Follow-up: “check” after talking about testosterone
  if (isFollowUpUtterance(text)) {
    if (priorTopics.length === 1) {
      const topic = priorTopics[0]
      const verb = /check|test|see|look/i.test(text) ? 'check' : ''
      const expanded = [verb, topic.expandTo].filter(Boolean).join(' ')
      return { kind: 'expand', query: expanded }
    }
    if (priorTopics.length > 1) {
      return {
        kind: 'clarify',
        response: clarifyResponse({
          message: `I didn’t quite catch that — did you mean one of these from what we were just talking about?`,
          followUp: 'Tell me which one, or type a fuller phrase like “check testosterone levels”.',
          topics: priorTopics.slice(0, 3),
        }),
      }
    }
    return {
      kind: 'clarify',
      response: clarifyResponse({
        message: `I didn’t quite get that. What would you like to check — a lab topic, a service page, or booking?`,
        followUp: 'Examples: “check testosterone”, “TSH labs”, “ADHD screening”, or “book Meet & Greet”.',
        linkIds: ['labs', 'adhd_screening', 'meet_and_greet'],
      }),
    }
  }

  // Incomplete stub: “testost”
  if (isIncompleteStub(text)) {
    const topics = matchTopics(text, { allowPrefix: true }).slice(0, 3)
    const q = normalize(text)
    // Exact known marker (“tsh”, “a1c”) → route immediately.
    // Prefix aliases (“testost” of “testosterone”) still clarify.
    if (topics.length === 1) {
      const exact = topics[0].keys.some((k) => k === q)
      const isPrefixStub = topics[0].keys.some((k) => k.startsWith(q) && k.length > q.length)
      if (exact && !isPrefixStub) {
        return { kind: 'expand', query: topics[0].expandTo }
      }
    }
    if (topics.length === 1) {
      // Prefix stub (“testost”) — confirm, don’t leap to a random article
      return {
        kind: 'clarify',
        response: clarifyResponse({
          message: `I didn’t fully catch that — did you mean ${topics[0].label}?`,
          followUp: `Reply “yes” or type something like “${topics[0].expandTo}”.`,
          topics,
        }),
      }
    }
    if (topics.length > 1) {
      const labels = topics.map((t) => t.label).join(', or ')
      return {
        kind: 'clarify',
        response: clarifyResponse({
          message: `I’m not sure I understood — did you mean ${labels}?`,
          followUp: 'Type the fuller phrase, or tap a link below.',
          topics,
        }),
      }
    }
    return {
      kind: 'clarify',
      response: clarifyResponse({
        message: `I didn’t understand that yet. Could you type a bit more?`,
        followUp: 'For example: testosterone, thyroid/TSH, ADHD care, labs, or pricing.',
        linkIds: ['mens_health', 'labs_thyroid', 'adhd_care'],
      }),
    }
  }

  return { kind: 'continue', query: text }
}