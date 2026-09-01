/**
 * Proxy callback requests to the shared website-leads API (auth API).
 */
import { sanitizeInput } from '@/lib/guardrails'

export const maxDuration = 15

const LEADS_API =
  process.env.WEBSITE_LEADS_API_URL?.replace(/\/$/, '') ||
  'https://siya-staff-auth-api.vercel.app'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = {
      name: sanitizeInput(String(body?.name || '')),
      email: sanitizeInput(String(body?.email || '')).toLowerCase(),
      phone: sanitizeInput(String(body?.phone || '')),
      message: sanitizeInput(String(body?.message || '')),
      consent: body?.consent === true || body?.consent === 'true' || body?.consent === 'on',
      website: sanitizeInput(String(body?.website || '')),
      sourceUrl: sanitizeInput(String(body?.sourceUrl || body?.source_url || '')),
    }

    if (payload.website) {
      return Response.json({ error: 'Unable to submit request.' }, { status: 400 })
    }
    if (!payload.name || !payload.email) {
      return Response.json({ error: 'Name and email are required.' }, { status: 400 })
    }
    if (!payload.consent) {
      return Response.json({ error: 'Please confirm we may contact you.' }, { status: 400 })
    }

    const res = await fetch(`${LEADS_API}/api/public/website-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return Response.json(
        { error: (data as { error?: string }).error || 'Unable to submit request.' },
        { status: res.status },
      )
    }
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Unable to submit request.' }, { status: 500 })
  }
}
