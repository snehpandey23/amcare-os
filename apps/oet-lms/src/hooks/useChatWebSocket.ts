/**
 * WebSocket hook for adaptive patient chat simulator.
 * Connects to oet-lms-chat backend, sends ma_message, receives streaming patient_token and patient_complete.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const getWsUrl = (): string => {
  const envWs = import.meta.env.VITE_CHAT_WS_ORIGIN as string | undefined
  if (envWs) return envWs
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/chat-ws`
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface UseChatWebSocketResult {
  sendMessage: (content: string, typingStartedAt?: number, typingCompletedAt?: number) => void
  connectionStatus: ConnectionStatus
  error: string | null
  lastResponseLatencyMs: number | null
}

export function useChatWebSocket(
  personaId: string | null,
  onToken: (token: string) => void,
  onComplete: (fullResponse: string, responseLatencyMs?: number) => void
): UseChatWebSocketResult {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [lastResponseLatencyMs, setLastResponseLatencyMs] = useState<number | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const sessionIdRef = useRef<string>(generateSessionId())

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

    setConnectionStatus('connecting')
    setError(null)
    const wsUrl = getWsUrl()
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionStatus('connected')
      setError(null)
    }

    ws.onclose = (event) => {
      wsRef.current = null
      setConnectionStatus('error')
      if (event.code !== 1000) {
        setError('Connection closed. Is the chat backend running? Set OPENAI_API_KEY and run: npm run dev --workspace=integrations/oet-lms-chat')
      }
    }

    ws.onerror = () => {
      setConnectionStatus('error')
      setError('WebSocket error. Check that OPENAI_API_KEY is set and the chat backend is running.')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'patient_token' && data.token) {
          onTokenRef.current(data.token)
        } else if (data.type === 'patient_complete') {
          onCompleteRef.current(data.fullResponse || '', data.responseLatencyMs)
          if (data.responseLatencyMs != null) {
            setLastResponseLatencyMs(data.responseLatencyMs)
          }
        } else if (data.type === 'error') {
          setError(data.message || 'Unknown error')
        }
      } catch {
        setError('Invalid message from server')
      }
    }

    return () => {
      ws.close(1000)
      wsRef.current = null
      setConnectionStatus('disconnected')
    }
  }, [personaId])

  const sendMessage = useCallback(
    (content: string, typingStartedAt?: number, typingCompletedAt?: number) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN || !personaId) return

      ws.send(
        JSON.stringify({
          type: 'ma_message',
          content,
          sessionId: sessionIdRef.current,
          personaId,
          typingStartedAt,
          typingCompletedAt,
        })
      )
    },
    [personaId]
  )

  return { sendMessage, connectionStatus, error, lastResponseLatencyMs }
}
