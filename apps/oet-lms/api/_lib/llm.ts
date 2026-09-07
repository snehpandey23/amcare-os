/**
 * Resolve LLM credentials for OET patient chat.
 * Prefer OpenAI key → AI Gateway API key → Vercel OIDC (prod) → Perplexity.
 */

import OpenAI from 'openai'

export type LlmProvider = 'openai' | 'gateway' | 'gateway-oidc' | 'perplexity' | 'none'

const GATEWAY_BASE = 'https://ai-gateway.vercel.sh/v1'

export async function resolveLlmClient(): Promise<{
  client: OpenAI
  provider: LlmProvider
  model: string
}> {
  const openaiKey = process.env.OPENAI_API_KEY?.trim()
  if (openaiKey) {
    return {
      client: new OpenAI({ apiKey: openaiKey }),
      provider: 'openai',
      model: process.env.OET_CHAT_MODEL?.trim() || process.env.SIYA_WORKFORCE_OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    }
  }

  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim()
  if (gatewayKey) {
    return {
      client: new OpenAI({
        apiKey: gatewayKey,
        baseURL: process.env.AI_GATEWAY_BASE_URL?.trim() || GATEWAY_BASE,
      }),
      provider: 'gateway',
      model: process.env.OET_CHAT_MODEL?.trim() || 'anthropic/claude-sonnet-5',
    }
  }

  // Production on Vercel: OIDC (same pattern as staff Assist — no Mac key paste).
  if (process.env.VERCEL === '1') {
    try {
      const { getVercelOidcToken } = await import('@vercel/oidc')
      const token = await getVercelOidcToken()
      if (token) {
        return {
          client: new OpenAI({
            apiKey: token,
            baseURL: process.env.AI_GATEWAY_BASE_URL?.trim() || GATEWAY_BASE,
          }),
          provider: 'gateway-oidc',
          model: process.env.OET_CHAT_MODEL?.trim() || 'anthropic/claude-sonnet-5',
        }
      }
    } catch (err) {
      console.warn('[oet-lms] OIDC token unavailable', err instanceof Error ? err.message : err)
    }
  }

  const pplx = process.env.PERPLEXITY_API_KEY?.trim()
  if (pplx) {
    return {
      client: new OpenAI({
        apiKey: pplx,
        baseURL: 'https://api.perplexity.ai/v2',
      }),
      provider: 'perplexity',
      model: process.env.OET_CHAT_MODEL?.trim() || 'sonar',
    }
  }

  throw new Error(
    'No LLM configured. On Vercel set AI_GATEWAY_API_KEY (or rely on OIDC). Locally set AI_GATEWAY_API_KEY or OPENAI_API_KEY.',
  )
}

export function llmConfigured(): boolean {
  return !!(
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.VERCEL === '1' ||
    process.env.PERPLEXITY_API_KEY?.trim()
  )
}
