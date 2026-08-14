import { generateObject } from 'ai'
import { z } from 'zod'
import { ALLOWED_LINK_IDS, resolveLinks, LINK_REGISTRY } from './link-registry'
import { isStrongPageHit, linksFromRetrieval, publicPageLink } from './public-routes'
import {
  classifyInputGuards,
  scrubOutputText,
} from './guardrails'
import { matchDeterministicIntent } from './intents'
import { formatChunksForPrompt } from './knowledge'
import { getChatModel, hasLiveModel } from './model'
import { hasConfidentRetrieval, retrievePublicKnowledge } from './retrieval'
import { SYSTEM_PROMPT } from './system-prompt'
import {
  type ConversationContext,
  clarifyResponse,
  isIncompleteStub,
  resolveConversationalQuery,
} from './clarify'
import {
  clinicalEscalationResponse,
  clinicalResponse,
  emergencyResponse,
  internalResponse,
  notFoundResponse,
  outOfServiceStateResponse,
  privacyResponse,
} from './templates'
import {
  linksForAnswer,
  resolveAnswer,
  type EntityAnswer,
} from './entities'
import {
  isStateAvailabilityQuestion,
  isSupportedServiceStateMention,
  matchUnsupportedState,
} from './service-states'
import type { GuideResponse, RetrievedChunk } from './types'

/**
 * Siya Guide v1 runtime:
 *
 *   User message
 *     → Safety and privacy filter
 *     → Clarify (bounded)
 *     → Public Knowledge API (entity resolve)
 *     → Approved answer blocks + registry CTAs
 *     → Navigation intents / public-kb fallback (bounded)
 *     → Response
 *
 * The model may phrase when explicitly opted in. It does not choose clinical
 * routing, canonical ownership, or CTAs.
 */

const ResponseSchema = z.object({
  state: z.enum(['verified', 'ambiguous', 'not_found', 'restricted']),
  message: z.string().min(1).max(900),
  linkIds: z
    .array(z.string())
    .max(3)
    .transform((ids) => ids.filter((id) => ALLOWED_LINK_IDS.includes(id))),
  citationIds: z.array(z.string()).max(3).optional(),
})

function citationsFromChunks(chunks: RetrievedChunk[]) {
  const out = []
  for (const c of chunks.slice(0, 3)) {
    const link = publicPageLink(c.path || c.url, c.title.split('|')[0].trim())
    if (link) out.push(link)
  }
  return out
}

/** Render a Public Knowledge API answer into a Guide response. */
export function responseFromEntityAnswer(answer: EntityAnswer): GuideResponse {
  const blocks = answer.approved_answer_blocks.map((b) => b.text).filter(Boolean)
  const message =
    blocks.join(' ') ||
    `${answer.name} is covered on Siya Health’s published resources. Open the canonical page for the full guide.`

  const canonical = LINK_REGISTRY[answer.entity]
    ? { id: answer.entity, label: LINK_REGISTRY[answer.entity].label, url: LINK_REGISTRY[answer.entity].url }
    : { id: answer.entity, label: answer.name, url: answer.canonical_url }

  const links = linksForAnswer(answer, 3)
  const followUp =
    answer.intent === 'symptom'
      ? 'Want the fatigue guide, primary care, or a Meet & Greet?'
      : answer.intent === 'screening'
        ? 'Ready to take the screening, or prefer ADHD care / pricing first?'
        : 'Want the canonical page, a related guide, or a Meet & Greet?'

  return {
    state: 'verified',
    message: scrubOutputText(message),
    followUp,
    links,
    citations: [canonical].filter((l) => Boolean(l.url)),
    refusalCategory: 'none',
    entity: answer.entity,
    intent: answer.intent,
    care_pathway: answer.care_pathway,
    safety_class: answer.safety_class,
    primary_cta_id: answer.primary_cta.id,
    analyticsEvent: 'entity_resolved',
  }
}

function fromRetrievalFallback(chunks: RetrievedChunk[], query: string): GuideResponse {
  if (!hasConfidentRetrieval(chunks)) return notFoundResponse()

  const top = chunks[0]
  const pageLinks = linksFromRetrieval(chunks, { extras: ['meet_and_greet'], limit: 3 })

  const contested =
    chunks.length >= 2 &&
    Math.abs(chunks[0].score - chunks[1].score) < 2.5 &&
    !isStrongPageHit(chunks)

  // Mid-confidence or contested → clarify or not-found — never bluff a verified answer.
  if (contested || chunks[0].score < 10) {
    if (chunks[0].score >= 8 && (contested || isIncompleteStub(query) || query.trim().split(/\s+/).length <= 2)) {
      const optionLinks = linksFromRetrieval(chunks.slice(0, 3), { extras: [], limit: 3 })
      return clarifyResponse({
        message:
          "I don't want to guess — a few public pages might be related. Which is closest to what you meant?",
        followUp: 'Or type a fuller phrase (for example “ADHD pricing” or “labs in Texas”).',
        chunks: chunks.slice(0, 3),
        linkIds: optionLinks.length ? undefined : ['meet_and_greet', 'call_siya', 'pricing'],
      })
    }
    return notFoundResponse()
  }

  if (
    chunks.length >= 2 &&
    Math.abs(chunks[0].score - chunks[1].score) < 1.5 &&
    !isStrongPageHit(chunks)
  ) {
    return clarifyResponse({
      message: 'A few published pages look relevant — which one did you mean?',
      followUp: 'Tap an option, or add a few more words so I can narrow it down.',
      chunks: chunks.slice(0, 3),
    })
  }

  const topicHint = top.path.startsWith('/labs')
    ? 'Want the labs hub too, or a Meet & Greet if you’re deciding next steps?'
    : 'Want that page, a Meet & Greet, or our call/text number?'

  return {
    state: 'verified',
    message: top.summary,
    followUp: topicHint,
    links: pageLinks,
    citations: citationsFromChunks([top]),
    refusalCategory: 'none',
    safety_class: 'navigation',
    analyticsEvent: 'entity_fallback',
  }
}

async function llmGroundedAnswer(userText: string, chunks: RetrievedChunk[]): Promise<GuideResponse | null> {
  // Default: deterministic. Enable LLM only with SIYA_GUIDE_DETERMINISTIC=0.
  if (!hasLiveModel() || process.env.SIYA_GUIDE_DETERMINISTIC !== '0') return null
  if (!hasConfidentRetrieval(chunks)) return null

  try {
    const { object } = await generateObject({
      model: getChatModel(),
      schema: ResponseSchema,
      system: SYSTEM_PROMPT,
      prompt: [
        'APPROVED LINK IDS (use only these in linkIds):',
        ALLOWED_LINK_IDS.join(', '),
        '',
        'APPROVED SOURCES (only factual basis allowed):',
        formatChunksForPrompt(chunks, 5),
        '',
        `Visitor message: ${userText}`,
        '',
        'If the visitor message is incomplete or ambiguous, set state=ambiguous and ask a short clarifying question.',
        'Answer using only APPROVED SOURCES. If insufficient, use state=not_found.',
        'Do not invent clinical advice, doses, diagnoses, or URLs.',
      ].join('\n'),
      temperature: 0.2,
      maxOutputTokens: 350,
    })

    const message = scrubOutputText(object.message)
    const wantsPrivateChannel =
      /\b(private|spruce|secure (medical )?chat|before (i |we )?pay|share .{0,20}medical)\b/i.test(
        userText,
      )
    const filteredIds = wantsPrivateChannel
      ? object.linkIds
      : object.linkIds.filter((id) => id !== 'secure_chat' && id !== 'spruce_practice')
    const links = resolveLinks(filteredIds)
    const citations = citationsFromChunks(
      chunks.filter((c) => (object.citationIds || []).includes(c.id)).concat(chunks).slice(0, 3),
    )

    if (object.state === 'not_found' || !message) {
      return notFoundResponse()
    }

    return {
      state: object.state,
      message,
      followUp:
        object.state === 'ambiguous'
          ? 'Tell me a bit more, or tap the closest option.'
          : 'If you’d like, tell me whether you want a page link, a Meet & Greet, or a way to contact the team.',
      links: links.length ? links : fromRetrievalFallback(chunks, userText).links,
      citations,
      refusalCategory: object.state === 'restricted' ? 'unsupported' : 'none',
      safety_class: object.state === 'restricted' ? 'restricted' : 'navigation',
      analyticsEvent: 'entity_fallback',
    }
  } catch (err) {
    console.error('[siya-guide] llm failed, using retrieval fallback', err)
    return null
  }
}

export async function runSiyaGuide(
  userText: string,
  context: ConversationContext = {},
): Promise<GuideResponse> {
  // 1. Safety and privacy filter (code-controlled)
  const guard = classifyInputGuards(userText)
  if (guard.kind === 'blocked') {
    if (guard.category === 'emergency') return emergencyResponse()
    if (guard.category === 'phi') return privacyResponse()
    if (guard.category === 'injection' || guard.category === 'internal') return internalResponse()
    if (guard.category === 'clinical') {
      if (/\b(increase|decrease|change|stop|taper|dose|mg|medication)\b/i.test(userText)) {
        return clinicalEscalationResponse()
      }
      if (/adderall|vyvanse|ritalin|stimulant|prescribe/i.test(userText)) {
        return {
          ...clinicalResponse(['adhd_care', 'meet_and_greet', 'call_siya']),
          message:
            'Treatment decisions are made individually after an appropriate medical evaluation. I can’t confirm whether a particular medication would be prescribed.',
          followUp:
            'I can show ADHD care info or a Meet & Greet. For a private clinical conversation before paying, ask about Spruce messaging.',
        }
      }
      return clinicalResponse()
    }
    return notFoundResponse()
  }

  // 2. Bounded clarify for stubs / follow-ups
  const conversational = resolveConversationalQuery(userText, context)
  if (conversational.kind === 'clarify') {
    return conversational.response
  }

  const query = conversational.query

  // 3. Out-of-service states — before entity/intent so NY etc. never get the CA/TX/PA/FL blurb.
  const unsupported = matchUnsupportedState(query)
  if (
    unsupported &&
    (!isSupportedServiceStateMention(query) || isStateAvailabilityQuestion(query))
  ) {
    return outOfServiceStateResponse(unsupported.name)
  }

  // 4. Public Knowledge API — entity resolve (source of truth for routing + CTA)
  const entityAnswer = resolveAnswer(query)
  if (entityAnswer) {
    return responseFromEntityAnswer(entityAnswer)
  }

  // 5. Navigation intents (still registry-backed; do not invent URLs)
  const intent = matchDeterministicIntent(query)
  if (intent) {
    return {
      ...intent.response,
      safety_class: intent.response.safety_class ?? 'navigation',
      analyticsEvent: intent.response.analyticsEvent ?? 'entity_fallback',
    }
  }

  // 6. Bounded public-kb retrieval (approved summaries only — never scrape HTML)
  const chunks = retrievePublicKnowledge(query, 5)
  const llm = await llmGroundedAnswer(query, chunks)
  if (llm) return llm

  return fromRetrievalFallback(chunks, query)
}
