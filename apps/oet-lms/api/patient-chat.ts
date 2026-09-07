/**
 * POST /api/patient-chat — stream persona patient replies (NDJSON).
 * Body: { personaId, sessionId?, messages: [{ role: 'user'|'assistant', content }], maMessage? }
 * If maMessage omitted, last user message in messages is used.
 */

import { getPersona } from '../src/data/personas.js'
import { buildSystemPrompt } from './_lib/prompt.js'
import { resolveLlmClient } from './_lib/llm.js'

export const config = {
  maxDuration: 60,
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type Body = {
  personaId?: string
  sessionId?: string
  messages?: ChatMessage[]
  /** Latest MA line (optional if already last user message in messages). */
  content?: string
  maMessageSentTime?: number
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

export async function POST(request: Request): Promise<Response> {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return json(400, { type: 'error', message: 'Invalid JSON body' })
  }

  const personaId = body.personaId?.trim()
  if (!personaId) {
    return json(400, { type: 'error', message: 'personaId required' })
  }

  const personaResolved = getPersona(personaId)
  if (!personaResolved) {
    return json(400, { type: 'error', message: 'Unknown personaId' })
  }

  const history = Array.isArray(body.messages) ? body.messages.filter((m) => m?.content && m.role) : []
  let maMessage = body.content?.trim()
  if (!maMessage) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') {
        maMessage = history[i].content
        break
      }
    }
  }
  if (!maMessage) {
    return json(400, { type: 'error', message: 'content or user message required' })
  }

  // History for the model: prior turns only (exclude the latest user line if duplicated).
  let prior = history
  if (prior.length && prior[prior.length - 1]?.role === 'user' && prior[prior.length - 1]?.content === maMessage) {
    prior = prior.slice(0, -1)
  }

  const turns = prior.filter((m) => m.role === 'user').length
  const systemPrompt = buildSystemPrompt(personaResolved, turns, prior)
  const maMessageSentTime = body.maMessageSentTime ?? Date.now()

  let client
  let provider
  let model
  try {
    const resolved = await resolveLlmClient()
    client = resolved.client
    provider = resolved.provider
    model = resolved.model
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return json(503, { type: 'error', message })
  }

  const encoder = new TextEncoder()
  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`))
      }

      let fullResponse = ''
      let firstTokenTime: number | undefined

      try {
        const openaiMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...prior.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: maMessage },
        ]

        const completion = await client.chat.completions.create({
          model,
          messages: openaiMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 150,
        })

        for await (const chunk of completion) {
          const token = chunk.choices?.[0]?.delta?.content ?? ''
          if (token) {
            if (firstTokenTime == null) firstTokenTime = Date.now()
            fullResponse += token
            send({
              type: 'patient_token',
              token,
              elapsedMs: Date.now() - startTime,
            })
          }
        }

        send({
          type: 'patient_complete',
          fullResponse,
          totalTimeMs: Date.now() - startTime,
          responseLatencyMs: firstTokenTime != null ? firstTokenTime - maMessageSentTime : undefined,
          provider,
          model,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('[oet-lms] patient-chat stream error:', message)
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      ...corsHeaders(),
    },
  })
}
