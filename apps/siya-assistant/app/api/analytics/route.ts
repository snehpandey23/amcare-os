import { emitGuideEvent } from '@/lib/analytics'
import type { AnalyticsEventName } from '@/lib/types'

const ALLOWED = new Set<AnalyticsEventName>([
  'chat_opened',
  'service_link_clicked',
  'screening_link_clicked',
  'secure_chat_handoff',
  'booking_handoff',
  'bot_refusal_category',
  'quick_action_clicked',
])

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = body?.name as AnalyticsEventName
    if (!ALLOWED.has(name)) {
      return Response.json({ ok: false }, { status: 400 })
    }
    // Explicitly drop any free-text fields.
    emitGuideEvent(name, {
      linkId: typeof body?.linkId === 'string' ? body.linkId.slice(0, 64) : undefined,
      actionId: typeof body?.actionId === 'string' ? body.actionId.slice(0, 64) : undefined,
      refusalCategory:
        typeof body?.refusalCategory === 'string' ? body.refusalCategory.slice(0, 32) : undefined,
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}
