/**
 * OET LMS Chat – WebSocket server for adaptive patient persona simulator.
 * Streams LLM-generated patient responses token-by-token.
 *
 * Keys (first match wins): OPENAI_API_KEY → AI_GATEWAY_API_KEY → PERPLEXITY_API_KEY
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')

// Load keys from chat .env, then repo root / staff pulls (never overwrite already-set vars).
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(repoRoot, '.env') })
dotenv.config({ path: path.resolve(repoRoot, 'apps/hipaa-training/.env.local') })
dotenv.config({ path: path.resolve(repoRoot, 'apps/hipaa-training/.env.staff-assist.prod') })
dotenv.config()

const hasLlm =
  !!process.env.OPENAI_API_KEY?.trim() ||
  !!process.env.AI_GATEWAY_API_KEY?.trim() ||
  !!process.env.PERPLEXITY_API_KEY?.trim()

if (!hasLlm) {
  console.error(
    '[oet-lms-chat] Set OPENAI_API_KEY (preferred), AI_GATEWAY_API_KEY, or PERPLEXITY_API_KEY in integrations/oet-lms-chat/.env',
  )
  process.exit(1)
}

import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import cors from 'cors'
import express from 'express'
import { getActiveLlmProvider, streamPatientResponse } from './streamHandler.js'

const PORT = parseInt(process.env.OET_LMS_CHAT_PORT || '3007', 10)

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'oet-lms-chat', llm: getActiveLlmProvider() })
})

const httpServer = createServer(app)

const wss = new WebSocketServer({ server: httpServer })

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const payload = JSON.parse(data.toString()) as {
        type: string
        content?: string
        sessionId?: string
        personaId?: string
        typingStartedAt?: number
        typingCompletedAt?: number
      }

      if (payload.type !== 'ma_message' || !payload.content || !payload.sessionId || !payload.personaId) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid payload: need type, content, sessionId, personaId',
          }),
        )
        return
      }

      const maMessageSentTime = Date.now()

      const send = (obj: object) => {
        if (ws.readyState === 1) ws.send(JSON.stringify(obj))
      }

      streamPatientResponse(
        payload.content,
        payload.sessionId,
        payload.personaId,
        maMessageSentTime,
        send,
        payload.typingStartedAt,
        payload.typingCompletedAt,
      )
    } catch (err) {
      console.error('[oet-lms-chat] Message parse error:', err)
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`[oet-lms-chat] WebSocket + HTTP listening on http://localhost:${PORT}`)
  console.log(`[oet-lms-chat] LLM provider (resolved on first request): ${getActiveLlmProvider()}`)
})
