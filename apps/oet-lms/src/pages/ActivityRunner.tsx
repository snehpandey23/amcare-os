import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPersona } from '../data/personas'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import { saveLastTranscript, saveSessionToHistory } from '../data/dashboardData'
import { useAuth } from '../contexts/AuthContext'
import { saveSession as saveSessionApi } from '../api/client'
import { evaluatePersonaRubric } from '../data/personaRubric'
import { evaluateChat, type MessageWithTiming } from '../data/chatEvaluation'
import { autoScorePerformance } from '../data/calgaryCambridgeRubric'

export default function ActivityRunner() {
  const { personaId } = useParams<{ personaId: string }>()
  const persona = personaId ? getPersona(personaId) : null
  const { user } = useAuth()

  const [chatLines, setChatLines] = useState<MessageWithTiming[]>([])
  const [chatInput, setChatInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [chatEvaluation, setChatEvaluation] = useState<ReturnType<typeof evaluateChat> | null>(null)
  const [rubricResults, setRubricResults] = useState<ReturnType<typeof evaluatePersonaRubric> | null>(null)
  const [calgaryResult, setCalgaryResult] = useState<ReturnType<typeof autoScorePerformance> | null>(null)
  const [responseLatencies, setResponseLatencies] = useState<number[]>([])
  const typingStartRef = useRef<number | null>(null)

  const handleToken = (token: string) => {
    setChatLines((prev) => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      const patientName = persona?.name ?? 'Patient'
      if (last?.who === patientName) {
        updated[updated.length - 1] = { ...last, text: last.text + token }
      } else {
        updated.push({ who: patientName, text: token })
      }
      return updated
    })
  }

  const handleComplete = (fullResponse: string, responseLatencyMs?: number) => {
    setChatLines((prev) => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      const patientName = persona?.name ?? 'Patient'
      if (last?.who === patientName && fullResponse) {
        updated[updated.length - 1] = { ...last, text: fullResponse }
      } else if (fullResponse && last?.who === 'you') {
        updated.push({ who: patientName, text: fullResponse })
      }
      return updated
    })
    if (responseLatencyMs != null) {
      setResponseLatencies((prev) => [...prev, responseLatencyMs])
    }
    setIsStreaming(false)
  }

  const { sendMessage, connectionStatus, error } = useChatWebSocket(
    personaId ?? null,
    handleToken,
    handleComplete
  )

  // Show opening message when we have persona and no messages yet
  useEffect(() => {
    if (!persona) return
    if (chatLines.length === 0) {
      setChatLines([{ who: persona.name, text: persona.openingMessage }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona?.id])

  if (!persona) {
    return (
      <div className="siya-page">
        <p>Persona not found.</p>
        <Link to="/personas" className="siya-btn siya-btn-secondary">← Back to Personas</Link>
      </div>
    )
  }

  const handleChatSend = () => {
    const text = chatInput.trim()
    if (!text || text.length < 3) return
    if (connectionStatus !== 'connected' || isStreaming) return

    const startedAt = typingStartRef.current ?? Date.now()
    const sentAt = Date.now()

    setChatLines((prev) => [...prev, { who: 'you', text, startedAt, sentAt }])
    setChatInput('')
    typingStartRef.current = null
    setIsStreaming(true)
    sendMessage(text, startedAt, sentAt)
  }

  const handleChatSubmit = () => {
    const evaluation = chatLines.length > 0 ? evaluateChat(chatLines, responseLatencies) : null
    const rubric = chatLines.length > 0 ? evaluatePersonaRubric(persona, chatLines) : null
    const calgary = chatLines.length > 0 ? autoScorePerformance(chatLines, { responseLatencies }) : null
    setChatEvaluation(evaluation)
    setRubricResults(rubric)
    setCalgaryResult(calgary)
    if (chatLines.length > 0) {
      saveLastTranscript(persona.name, chatLines.map((l) => ({ who: l.who, text: l.text })))
      const maCount = chatLines.filter((l) => l.who === 'you').length
      if (evaluation) {
        const record = {
          id: `session-${Date.now()}`,
          personaId: personaId ?? '',
          personaName: persona.name,
          timestamp: Date.now(),
          messageCount: maCount,
          empathyScore: evaluation.empathyScore,
          grammarScore: evaluation.grammarScore,
          avgWpm: evaluation.avgWpm,
          calgaryScore: calgary?.totalScore,
          calgaryMax: calgary?.maxTotalScore,
        }
        saveSessionToHistory(record)
        if (user) {
          saveSessionApi({
            personaId: record.personaId,
            personaName: record.personaName,
            timestamp: record.timestamp,
            messageCount: record.messageCount,
            empathyScore: record.empathyScore,
            grammarScore: record.grammarScore,
            avgWpm: record.avgWpm,
            calgaryScore: record.calgaryScore,
            calgaryMax: record.calgaryMax,
            transcript: chatLines.map((l) => ({ who: l.who, text: l.text })),
          }).catch(() => { /* ignore */ })
        }
      }
    }
    setSubmitted(true)
  }

  const canSendChat =
    chatInput.trim().length >= 3 &&
    connectionStatus === 'connected' &&
    !isStreaming

  return (
    <div className="siya-page siya-chat-runner">
      <Link to="/personas" className="siya-back">
        ← Back to Personas
      </Link>
      <h1 className="siya-chat-title">{persona.archetype}: {persona.name}</h1>
      <p className="siya-chat-subtitle">{persona.shortLabel}</p>

      {(connectionStatus === 'connecting' || connectionStatus === 'error') && (
        <div
          style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            background: connectionStatus === 'error' ? 'rgba(200,60,60,0.1)' : 'rgba(13,139,139,0.1)',
            color: connectionStatus === 'error' ? 'var(--siya-danger)' : 'var(--siya-primary)',
            fontSize: 14,
          }}
        >
          {connectionStatus === 'connecting' && 'Connecting to chat backend…'}
          {connectionStatus === 'error' && (error || 'Connection failed. Run: npm run dev --workspace=integrations/oet-lms-chat (requires OPENAI_API_KEY)')}
        </div>
      )}

      <div className="siya-chat-card">
        <p className="siya-chat-instruction">
          Live simulation: the patient responds to what you type. Read the persona below. Avoid jargon and stock phrases. Aim for at least 10 back-and-forth replies.
        </p>
        <div className="siya-chat-context">
          <div className="siya-chat-context-row">
            <strong>Demographic snapshot</strong>
            <p>{persona.demographicSnapshot}</p>
          </div>
          <div className="siya-chat-context-row">
            <strong>Backstory</strong>
            <p style={{ whiteSpace: 'pre-wrap' }}>{persona.backstory}</p>
          </div>
          <div className="siya-chat-context-row">
            <strong>Frustration triggers</strong>
            <p className="siya-chat-small">Phrases that escalate: {persona.frustrationTriggers.slice(0, 6).join(', ')}{persona.frustrationTriggers.length > 6 ? '…' : ''}</p>
          </div>
          <div className="siya-chat-context-row">
            <strong>Communication preferences</strong>
            <p>What lands: {persona.communicationPreferences.whatLands.join(' ')}</p>
            <p className="siya-chat-small">What doesn&apos;t: {persona.communicationPreferences.whatDoesnt.join(', ')}</p>
          </div>
          <div className="siya-chat-context-row">
            <strong>Hidden context</strong>
            <p style={{ fontStyle: 'italic' }}>{persona.hiddenContext}</p>
          </div>
          <div className="siya-chat-context-row">
            <strong>Common MA mistakes</strong>
            <ul>
              {persona.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="siya-chat-context-row">
            <strong>Patient message (start of chat)</strong>
            <p>{persona.openingMessage}</p>
          </div>
        </div>
        <div className="siya-chat-thread">
          {chatLines.map((line, i) => (
            <div key={i} className={`siya-chat-bubble ${line.who === 'you' ? 'siya-chat-you' : 'siya-chat-them'}`}>
              <strong>{line.who}</strong>
              <div className="siya-message-body">
                {line.text}
                {isStreaming && i === chatLines.length - 1 && line.who !== 'you' && (
                  <span className="siya-typing-cursor">▋</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="siya-chat-input-wrap">
          <input
            type="text"
            className="siya-chat-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => { if (typingStartRef.current == null) typingStartRef.current = Date.now() }}
            placeholder="Type your reply (min 3 characters)..."
            onKeyDown={(e) => { if (e.key === 'Enter' && canSendChat) handleChatSend() }}
            disabled={connectionStatus !== 'connected' || isStreaming}
          />
          <button type="button" className="siya-btn siya-btn-primary" onClick={handleChatSend} disabled={!canSendChat}>
            Send
          </button>
        </div>
        <button type="button" className="siya-btn siya-btn-secondary" onClick={handleChatSubmit}>
          End chat & see metrics
        </button>
        {submitted && (
          <div className="siya-chat-feedback">
            <h3>Session Summary</h3>
            {chatEvaluation ? (
              <div className="siya-session-summary">
                <p><strong>Timing:</strong> {chatEvaluation.messageCount} MA messages · Avg response latency: {chatEvaluation.avgResponseLatencyMs != null ? `${chatEvaluation.avgResponseLatencyMs}ms (${chatEvaluation.latencyQuality})` : '—'}</p>
                <p><strong>Empathy:</strong> {chatEvaluation.empathyScore}% · <strong>Grammar:</strong> {chatEvaluation.grammarScore}%{chatEvaluation.grammarErrorCount != null && chatEvaluation.grammarErrorCount > 0 && ` (${chatEvaluation.grammarErrorCount} issues, ${chatEvaluation.grammarSeverity})`} · <strong>Typing speed:</strong> {chatEvaluation.avgWpm} WPM</p>
                <p className="siya-chat-small"><strong>Accuracy:</strong> {chatEvaluation.accuracyNote}</p>
              </div>
            ) : (
              <p>Send at least one reply to see metrics.</p>
            )}
            {calgaryResult && (
              <>
                <h3>Communication Skills (Calgary-Cambridge)</h3>
                <p className="siya-chat-small">Score: {calgaryResult.totalScore}/{calgaryResult.maxTotalScore}</p>
                <div className="siya-calgary-domains">
                  {Object.entries(calgaryResult.domains).map(([domainId, skills]) => {
                    const domainScore = Object.values(skills).reduce((a, s) => a + s.score, 0)
                    const domainMax = Object.values(skills).reduce((a, s) => a + s.maxScore, 0)
                    return (
                      <div key={domainId} className="siya-calgary-domain">
                        <strong>{domainId.replace(/_/g, ' ')}:</strong> {domainScore}/{domainMax}
                      </div>
                    )
                  })}
                </div>
                {calgaryResult.recommendations.length > 0 && (
                  <div className="siya-recommendations">
                    <strong>Recommendations:</strong>
                    <ul>
                      {calgaryResult.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {rubricResults && rubricResults.length > 0 && (
              <>
                <h3>Persona Assessment Rubric</h3>
                <p className="siya-chat-small">Review your conversation against each criterion.</p>
                <ul className="siya-rubric-list">
                  {rubricResults.map((r, i) => (
                    <li key={i}>
                      <span className="siya-rubric-icon">{r.suggestedMet ? '✅' : '⚪'}</span>
                      <div className="siya-rubric-text">
                        <strong>{r.criterion}</strong>
                        <span>{r.hint}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
