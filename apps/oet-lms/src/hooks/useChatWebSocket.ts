/**
 * Patient chat via HTTP NDJSON stream (Vercel serverless + local Vite proxy).
 * Replaces the old WebSocket-only path for production.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function chatApiBase(): string {
  const origin = (import.meta.env.VITE_CHAT_HTTP_ORIGIN as string | undefined)?.replace(/\/$/, '')
  return origin || ''
}

function healthUrl(): string {
  return `${chatApiBase()}/api/oet-chat-health`
}

function patientChatUrl(): string {
  return `${chatApiBase()}/api/patient-chat`
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type ChatHistoryLine = { who: string; text: string }

export interface UseChatWebSocketResult {
  sendMessage: (
    content: string,
    typingStartedAt?: number,
    typingCompletedAt?: number,
    history?: ChatHistoryLine[],
  ) => void
  connectionStatus: ConnectionStatus
  error: string | null
  lastResponseLatencyMs: number | null
}

function toLlmHistory(history: ChatHistoryLine[] | undefined): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!history?.length) return []
  return history
    .filter((l) => l.text?.trim())
    .map((l) => ({
      role: (l.who === 'you' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: l.text,
    }))
}

export function useChatWebSocket(
  personaId: string | null,
  onToken: (token: string) => void,
  onComplete: (fullResponse: string, responseLatencyMs?: number) => void,
): UseChatWebSocketResult {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [lastResponseLatencyMs, setLastResponseLatencyMs] = useState<number | null>(null)
  const sessionIdRef = useRef<string>(generateSessionId())
  const abortRef = useRef<AbortController | null>(null)

  const onTokenRef = useRef(onToken)
  const onCompleteRef = useRef(onComplete)
  onTokenRef.current = onToken
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!personaId) {
      setConnectionStatus('disconnected')
      setError(null)
      return
    }

    sessionIdRef.current = generateSessionId()
    setConnectionStatus('connecting')
    setError(null)

    let cancelled = false
    const probe = async () => {
      try {
        const res = await fetch(healthUrl(), { method: 'GET' })
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
        if (cancelled) return
        if (res.ok && data.ok) {
          setConnectionStatus('connected')
          setError(null)
        } else {
          setConnectionStatus('error')
          setError(data.error || 'Live chat API not ready')
        }
      } catch {
        if (cancelled) return
        setConnectionStatus('error')
        setError('Cannot reach live chat API (/api/oet-chat-health)')
      }
    }

    void probe()
    return () => {
      cancelled = true
      abortRef.current?.abort()
    }
  }, [personaId])

  const sendMessage = useCallback(
    (
      content: string,
      typingStartedAt?: number,
      typingCompletedAt?: number,
      history?: ChatHistoryLine[],
    ) => {
      if (!personaId || !content.trim()) return

      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac

      const maMessageSentTime = typingCompletedAt ?? Date.now()
      const messages = toLlmHistory(history)
      // Ensure latest MA line is present as user
      if (!messages.length || messages[messages.length - 1]?.content !== content) {
        messages.push({ role: 'user', content })
      }

      void (async () => {
        try {
          const res = await fetch(patientChatUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ac.signal,
            body: JSON.stringify({
              personaId,
              sessionId: sessionIdRef.current,
              content,
              messages,
              maMessageSentTime,
              typingStartedAt,
              typingCompletedAt,
            }),
          })

          if (!res.ok || !res.body) {
            const errBody = (await res.json().catch(() => ({}))) as { message?: string }
            setError(errBody.message || `Chat API error (${res.status})`)
            onCompleteRef.current('', undefined)
            return
          }

          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue
              try {
                const data = JSON.parse(trimmed) as {
                  type: string
                  token?: string
                  fullResponse?: string
                  responseLatencyMs?: number
                  message?: string
                }
                if (data.type === 'patient_token' && data.token) {
                  onTokenRef.current(data.token)
                } else if (data.type === 'patient_complete') {
                  onCompleteRef.current(data.fullResponse || '', data.responseLatencyMs)
                  if (data.responseLatencyMs != null) {
                    setLastResponseLatencyMs(data.responseLatencyMs)
                  }
                } else if (data.type === 'error') {
                  setError(data.message || 'Chat error')
                  onCompleteRef.current('', undefined)
                }
              } catch {
                setError('Invalid stream chunk from chat API')
              }
            }
          }
        } catch (err) {
          if (ac.signal.aborted) return
          const message = err instanceof Error ? err.message : String(err)
          setError(message)
          onCompleteRef.current('', undefined)
        }
      })()
    },
    [personaId],
  )

  return { sendMessage, connectionStatus, error, lastResponseLatencyMs }
}

/** @deprecated alias — same HTTP hook */
export const usePatientChat = useChatWebSocket
