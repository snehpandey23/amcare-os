/**
 * LLM streaming handler: OpenAI or Perplexity (OpenAI-compatible).
 * Emits patient_token then patient_complete. Captures response latency.
 */

import OpenAI from 'openai'
import { buildDynamicSystemPrompt } from './promptEngine.js'
import { getOrCreateState, getState, updateState } from './dialogueState.js'

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey || !apiKey.trim()) {
      throw new Error('PERPLEXITY_API_KEY or OPENAI_API_KEY must be set in .env')
    }
    const usePerplexity = !!process.env.PERPLEXITY_API_KEY
    openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: usePerplexity ? 'https://api.perplexity.ai/v2' : undefined,
    })
  }
  return openaiClient
}

const MAX_TOKENS = 150

function getModel(): string {
  const usePerplexity = !!process.env.PERPLEXITY_API_KEY
  return process.env.OET_CHAT_MODEL || (usePerplexity ? 'sonar' : 'gpt-4o-mini')
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
          isComplete: false,
        })
      }
    }

    const totalTimeMs = Date.now() - startTime
    const responseLatencyMs = firstTokenTime != null ? firstTokenTime - maMessageSentTime : undefined

    send({
      type: 'patient_complete',
      fullResponse,
      totalTimeMs,
      responseLatencyMs,
      firstTokenTime,
      isComplete: true,
    })

    await updateState(
      sessionId,
      maMessage,
      fullResponse,
      responseLatencyMs,
      typingStartedAt,
      typingCompletedAt
    )
  } catch (err) {
    console.error('[oet-lms-chat] Stream error:', err)
    send({
      type: 'error',
      message: err instanceof Error ? err.message : 'Failed to generate patient response',
    })
  }
}
