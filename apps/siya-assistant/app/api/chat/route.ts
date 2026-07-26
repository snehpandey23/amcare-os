import { checkRateLimit, sanitizeInput } from '@/lib/guardrails'
import { runSiyaGuide } from '@/lib/guide-engine'
import { emitGuideEvent } from '@/lib/analytics'
import { OPENING_MESSAGE } from '@/lib/templates'
import { resolveLinks } from '@/lib/link-registry'

export const maxDuration = 30

function clientKey(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon'
  )
}

export async function GET() {
  return Response.json({
    name: 'Siya Guide',
    version: 1,
    openingMessage: OPENING_MESSAGE,
    mode: 'public-navigation',
  })
}

export async function POST(req: Request) {
  try {
    if (!checkRateLimit(clientKey(req))) {
      return Response.json(
        {
          state: 'restricted',
          message:
            'You’ve reached the temporary message limit. Please try again later, or call/text (215) 445-1244 / book a Meet & Greet.',
          links: resolveLinks(['call_siya', 'meet_and_greet']),
          citations: [],
          refusalCategory: 'unsupported',
        },
        { status: 429 },
      )
    }

    const body = await req.json()
    const raw =
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.text === 'string'
          ? body.text
          : ''

    const message = sanitizeInput(raw)
    if (!message) {
      return Response.json({ error: 'message required' }, { status: 400 })
    }

    // Ephemeral client context only — not logged, not persisted.
    const priorUserMessages = Array.isArray(body?.priorUserMessages)
      ? body.priorUserMessages
          .filter((m: unknown) => typeof m === 'string')
          .map((m: string) => sanitizeInput(m))
          .filter(Boolean)
          .slice(-4)
      : []

    const result = await runSiyaGuide(message, { priorUserMessages })

    if (result.analyticsEvent) {
      emitGuideEvent(result.analyticsEvent, {
        state: result.state,
        refusalCategory: result.refusalCategory,
      })
    } else if (result.refusalCategory !== 'none') {
      emitGuideEvent('bot_refusal_category', { refusalCategory: result.refusalCategory })
    }

    return Response.json({
      state: result.state,
      message: result.message,
      followUp: result.followUp || null,
      links: result.links,
      citations: result.citations,
      refusalCategory: result.refusalCategory,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed'
    console.error('[siya-guide]', message)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}