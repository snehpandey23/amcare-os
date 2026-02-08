/**
 * OET LMS Chat – WebSocket server for adaptive patient persona simulator.
 * Streams LLM-generated patient responses token-by-token.
 * Requires PERPLEXITY_API_KEY or OPENAI_API_KEY (Perplexity preferred).
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

if (!process.env.PERPLEXITY_API_KEY && !process.env.OPENAI_API_KEY) {
  console.error('[oet-lms-chat] Set PERPLEXITY_API_KEY or OPENAI_API_KEY in .env (repo root or integrations/oet-lms-chat/.env)')
  process.exit(1)
}

import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import cors from 'cors'
import express from 'express'
import { streamPatientResponse } from './streamHandler.js'

const PORT = parseInt(process.env.OET_LMS_CHAT_PORT || '3007', 10)
const usePerplexity = !!process.env.PERPLEXITY_API_KEY

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'oet-lms-chat' })
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
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid payload: need type, content, sessionId, personaId' }))
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
        payload.typingCompletedAt
      )
    } catch (err) {
      console.error('[oet-lms-chat] Message parse error:', err)
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`[oet-lms-chat] WebSocket + HTTP listening on http://localhost:${PORT}`)
  console.log(`[oet-lms-chat] LLM provider: ${usePerplexity ? 'Perplexity' : 'OpenAI'}`)
})
