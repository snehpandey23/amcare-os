/**
 * GET /api/oet-chat-health — live chat readiness for the Simulator badge.
 */

import { llmConfigured, resolveLlmClient } from './_lib/llm.js'

export async function GET(): Promise<Response> {
  let provider = 'none'
  let ok = false
  let error: string | undefined

  if (!llmConfigured()) {
    error = 'No LLM env configured'
  } else {
    try {
      const resolved = await resolveLlmClient()
      provider = resolved.provider
      ok = true
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }
  }

  return new Response(
    JSON.stringify({
      ok,
      service: 'oet-lms-patient-chat',
      llm: provider,
      model: process.env.OET_CHAT_MODEL || (ok ? 'default' : null),
      error,
    }),
    {
      status: ok ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
