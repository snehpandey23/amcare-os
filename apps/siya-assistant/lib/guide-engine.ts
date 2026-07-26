import { generateObject } from 'ai'
import { z } from 'zod'
import { ALLOWED_LINK_IDS, resolveLinks } from './link-registry'
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
  clinicalResponse,
  emergencyResponse,
  internalResponse,
  notFoundResponse,
  privacyResponse,
} from './templates'
import type { GuideResponse, RetrievedChunk } from './types'

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

function fromRetrievalFallback(chunks: RetrievedChunk[], query: string): GuideResponse {
  if (!hasConfidentRetrieval(chunks)) return notFoundResponse()

  const top = chunks[0]
  const pageLinks = linksFromRetrieval(chunks, { extras: ['meet_and_greet'], limit: 3 })

  // Weak / contested matches → ask, don’t guess
  const contested =
    chunks.length >= 2 &&
    Math.abs(chunks[0].score - chunks[1].score) < 2.5 &&
    !isStrongPageHit(chunks)

  if (contested || (chunks[0].score < 8 && (isIncompleteStub(query) || query.trim().split(/\s+/).length <= 1))) {
    const optionLinks = linksFromRetrieval(chunks.slice(0, 3), { extras: [], limit: 3 })
    return clarifyResponse({
      message:
        'I don’t want to guess — a few public pages might be related. Which is closest to what you meant?',
      followUp: 'Or type a fuller phrase (for example “check testosterone” or “TSH labs”).',
      chunks: chunks.slice(0, 3),
      linkIds: optionLinks.length ? undefined : ['labs', 'mens_health', 'meet_and_greet'],
    })
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
  }
}

async function llmGroundedAnswer(userText: string, chunks: RetrievedChunk[]): Promise<GuideResponse | null> {
  // Default: retrieval-only. Enable LLM only with SIYA_GUIDE_DETERMINISTIC=0 (explicit opt-in).
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
  const guard = classifyInputGuards(userText)
  if (guard.kind === 'blocked') {
    if (guard.category === 'emergency') return emergencyResponse()
    if (guard.category === 'phi') return privacyResponse()
    if (guard.category === 'injection' || guard.category === 'internal') return internalResponse()
    if (guard.category === 'clinical') {
      if (/adderall|vyvanse|ritalin|stimulant|prescribe/i.test(userText)) {
        return {
          ...clinicalResponse(['adhd_care', 'adhd_screening', 'meet_and_greet']),
          message:
            'Treatment decisions are made individually after an appropriate medical evaluation. I can’t confirm whether a particular medication would be prescribed.',
          followUp:
            'I can show ADHD care info, the free screening, or a Meet & Greet. If you need a private clinical conversation before paying, ask me about Spruce messaging.',
        }
      }
      return clinicalResponse()
    }
    return notFoundResponse()
  }

  const conversational = resolveConversationalQuery(userText, context)
  if (conversational.kind === 'clarify') {
    return conversational.response
  }

  const query = conversational.query

  const intent = matchDeterministicIntent(query)
  if (intent) return intent.response

  const chunks = retrievePublicKnowledge(query, 5)
  const llm = await llmGroundedAnswer(query, chunks)
  if (llm) return llm

  return fromRetrievalFallback(chunks, query)
}