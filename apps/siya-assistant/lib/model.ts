import { gateway } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export function hasLiveModel(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY)
}

/**
 * Prefer Vercel AI Gateway when AI_GATEWAY_API_KEY is set.
 * Fall back to OpenAI when OPENAI_API_KEY is set (local try).
 */
export function getChatModel() {
  if (process.env.AI_GATEWAY_API_KEY) {
    return gateway(process.env.SIYA_ASSISTANT_MODEL || 'openai/gpt-4.1-mini')
  }

  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
    return openai(process.env.SIYA_ASSISTANT_MODEL || 'gpt-4.1-mini')
  }

  throw new Error(
    'Missing AI_GATEWAY_API_KEY or OPENAI_API_KEY. Copy .env.example → .env.local',
  )
}