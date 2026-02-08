/**
 * Dialogue state store.
 * In-memory when REDIS_URL is not set; Redis when REDIS_URL is set.
 */

import type { DialogueState } from './types.js'
import { getPersona } from './personas.js'

const SESSION_TTL_SEC = 3600 // 1 hour

const stateMap = new Map<string, { state: DialogueState; expiresAt: number }>()

type RedisClient = import('ioredis').default

let redis: RedisClient | null = null

async function initRedis(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL
  if (!url) return null
  try {
    const mod = await import('ioredis')
    const Redis = (mod as unknown as { default: new (url: string, opts?: object) => RedisClient }).default
    const client = new Redis(url, { maxRetriesPerRequest: 3 })
    client.on('error', (err: Error) => console.error('[oet-lms-chat] Redis error:', err))
    client.on('connect', () => console.log('[oet-lms-chat] Redis connected'))
    redis = client
    return client
  } catch (err) {
    console.warn('[oet-lms-chat] Redis init failed, using in-memory:', err)
    return null
  }
}

const redisInit = initRedis()

interface SerializableState {
  sessionId: string
  personaId: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  conversationTurns: number
  startTime: number
  assessmentData?: { maResponseTimes: number[]; maTypingSpeeds: number[]; responseLatencies: number[] }
}

function toSerializable(state: DialogueState): SerializableState {
  return {
    sessionId: state.sessionId,
    personaId: state.personaId,
    conversationHistory: state.conversationHistory,
    conversationTurns: state.conversationTurns,
    startTime: state.startTime,
    assessmentData: state.assessmentData,
  }
}

function fromSerializable(s: SerializableState): DialogueState | null {
  const persona = getPersona(s.personaId)
  if (!persona) return null
  return {
    ...s,
    persona,
    assessmentData: s.assessmentData ?? { maResponseTimes: [], maTypingSpeeds: [], responseLatencies: [] },
  }
}

function cleanupExpired(): void {
  const now = Date.now()
  for (const [id, entry] of stateMap.entries()) {
    if (entry.expiresAt < now) stateMap.delete(id)
  }
}

setInterval(cleanupExpired, 5 * 60 * 1000)

export async function getOrCreateState(sessionId: string, personaId: string): Promise<DialogueState | null> {
  const persona = getPersona(personaId)
  if (!persona) return null

  const r = await redisInit
  if (r) {
    try {
      const key = `dialogue_session:${sessionId}`
      const raw = await r.get(key)
      if (raw) {
        const s = JSON.parse(raw) as SerializableState
        if (s.personaId === personaId) {
          return fromSerializable(s)
        }
      }
    } catch {
      // fall through to create new
    }
  } else {
    const entry = stateMap.get(sessionId)
    if (entry) {
      if (entry.expiresAt < Date.now()) {
        stateMap.delete(sessionId)
      } else if (entry.state.personaId === personaId) {
        return entry.state
      }
    }
  }

  const state: DialogueState = {
    sessionId,
    personaId,
    persona,
    conversationHistory: [],
    conversationTurns: 0,
    startTime: Date.now(),
    assessmentData: { maResponseTimes: [], maTypingSpeeds: [], responseLatencies: [] },
  }

  if (r) {
    try {
      const key = `dialogue_session:${sessionId}`
      await r.setex(key, SESSION_TTL_SEC, JSON.stringify(toSerializable(state)))
    } catch (err) {
      console.warn('[oet-lms-chat] Redis set failed:', err)
    }
  } else {
    stateMap.set(sessionId, { state, expiresAt: Date.now() + SESSION_TTL_SEC * 1000 })
  }
  return state
}

export async function getState(sessionId: string): Promise<DialogueState | null> {
  const r = await redisInit
  if (r) {
    try {
      const key = `dialogue_session:${sessionId}`
      const raw = await r.get(key)
      if (raw) return fromSerializable(JSON.parse(raw) as SerializableState)
      return null
    } catch {
      return null
    }
  }
  const entry = stateMap.get(sessionId)
  if (!entry || entry.expiresAt < Date.now()) return null
  return entry.state
}

export async function updateState(
  sessionId: string,
  maMessage: string,
  patientResponse: string,
  responseLatencyMs?: number,
  typingStartedAt?: number,
  typingCompletedAt?: number
): Promise<DialogueState | null> {
  const state = await getState(sessionId)
  if (!state) return null

  state.conversationHistory.push({ role: 'user', content: maMessage })
  state.conversationHistory.push({ role: 'assistant', content: patientResponse })
  state.conversationTurns += 1

  if (responseLatencyMs != null && state.assessmentData) {
    state.assessmentData.responseLatencies.push(responseLatencyMs)
  }
  if (typingStartedAt != null && typingCompletedAt != null && state.assessmentData) {
    const words = maMessage.trim().split(/\s+/).filter(Boolean).length
    const durationMinutes = (typingCompletedAt - typingStartedAt) / 60000
    const wpm = durationMinutes > 0 ? Math.round(words / durationMinutes) : 0
    state.assessmentData.maTypingSpeeds.push(wpm)
  }

  const r = await redisInit
  if (r) {
    try {
      const key = `dialogue_session:${sessionId}`
      await r.setex(key, SESSION_TTL_SEC, JSON.stringify(toSerializable(state)))
    } catch (err) {
      console.warn('[oet-lms-chat] Redis update failed:', err)
    }
  } else {
    const entry = stateMap.get(sessionId)
    if (entry) entry.expiresAt = Date.now() + SESSION_TTL_SEC * 1000
  }

  return state
}
