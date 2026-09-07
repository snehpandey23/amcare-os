/**
 * LLM streaming handler: OpenAI → Vercel AI Gateway → Perplexity (last resort).
 * Emits patient_token then patient_complete. Captures response latency.
 */

import OpenAI from 'openai'
import { buildDynamicSystemPrompt } from './promptEngine.js'
import { getOrCreateState, updateState } from './dialogueState.js'

type LlmProvider = 'openai' | 'gateway' | 'perplexity'

let openaiClient: OpenAI | null = null
let activeProvider: LlmProvider | null = null

function resolveProvider(): { provider: LlmProvider; apiKey: string; baseURL?: string } {
  const openaiKey = process.env.OPENAI_API_KEY?.trim()
  if (openaiKey) {
    return { provider: 'openai', apiKey: openaiKey }
  }

  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim()
  if (gatewayKey) {
    return {
      provider: 'gateway',
      apiKey: gatewayKey,
      baseURL: process.env.AI_GATEWAY_BASE_URL?.trim() || 'https://ai-gateway.vercel.sh/v1',
    }
  }

  const pplx = process.env.PERPLEXITY_API_KEY?.trim()
  if (pplx) {
    return {
      provider: 'perplexity',
      apiKey: pplx,
      baseURL: 'https://api.perplexity.ai/v2',
    }
  }

  throw new Error(
    'No LLM key found. Set OPENAI_API_KEY (preferred), AI_GATEWAY_API_KEY, or PERPLEXITY_API_KEY in integrations/oet-lms-chat/.env',
  )
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const resolved = resolveProvider()
    activeProvider = resolved.provider
    openaiClient = new OpenAI({
      apiKey: resolved.apiKey,
      baseURL: resolved.baseURL,
    })
    console.log(`[oet-lms-chat] LLM provider: ${resolved.provider}`)
  }
  return openaiClient
}

const MAX_TOKENS = 150

function getModel(): string {
  if (process.env.OET_CHAT_MODEL?.trim()) return process.env.OET_CHAT_MODEL.trim()
  const provider = activeProvider || resolveProvider().provider
  if (provider === 'openai') {
    return process.env.SIYA_WORKFORCE_OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  }
  if (provider === 'gateway') {
    // Gateway OpenAI-compatible ids are often bare model names on /v1
    return process.env.SIYA_WORKFORCE_OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  }
  return 'sonar'
}

export function getActiveLlmProvider(): string {
  try {
    return activeProvider || resolveProvider().provider
  } catch {
    return 'none'
  }
}

export async function streamPatientResponse(
  maMessage: string,
  sessionId: string,
  personaId: string,
  maMessageSentTime: number,
  send: (obj: object) => void,
  typingStartedAt?: number,
  typingCompletedAt?: number
): Promise<void> {
  const state = await getOrCreateState(sessionId, personaId)
  if (!state) {
    send({ type: 'error', message: 'Invalid persona or session' })
    return
  }

  const systemPrompt = buildDynamicSystemPrompt(state)

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...state.conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: maMessage },
  ]

  let fullResponse = ''
  let firstTokenTime: number | undefined
  const startTime = Date.now()

  try {
    const openai = getOpenAIClient()
    const stream = await openai.chat.completions.create({
      model: getModel(),
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
    })

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content ?? ''
      if (token) {
        if (firstTokenTime == null) firstTokenTime = Date.now()
        fullResponse += token
        const elapsedMs = Date.now() - startTime
        send({
          type: 'patient_token',
          token,
          elapsedMs,
        })
      }
    }

    const totalTimeMs = Date.now() - startTime
    const responseLatencyMs =
      firstTokenTime != null ? firstTokenTime - maMessageSentTime : undefined

    await updateState(sessionId, maMessage, fullResponse, typingStartedAt, typingCompletedAt)

    send({
      type: 'patient_complete',
      fullResponse,
      totalTimeMs,
      responseLatencyMs,
      provider: getActiveLlmProvider(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[oet-lms-chat] stream error:', message)
    send({ type: 'error', message })
  }
}
