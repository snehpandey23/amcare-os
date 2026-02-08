import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PERSONAS, getPersona, getPersonaShortId } from '../data/personas'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import { evaluateChat, type MessageWithTiming } from '../data/chatEvaluation'
import { evaluatePersonaRubric } from '../data/personaRubric'
import { autoScorePerformance } from '../data/calgaryCambridgeRubric'
import { saveLastTranscript, saveSessionToHistory } from '../data/dashboardData'
import { useAuth } from '../contexts/AuthContext'
import { saveSession as saveSessionApi } from '../api/client'

/** Demo-mode patient replies when chat backend is not connected (real-time practice + feedback). */
const DEMO_PATIENT_REPLIES = [
  "I see. What do you recommend I do next?",
  "That's helpful, thank you. What about side effects?",
  "Okay. How long until I can get my prescription?",
  "I'm still a bit confused. Can you explain that in simpler terms?",
  "Thanks for clarifying. When should I expect to hear back?",
  "What if I can't complete the form by then?",
  "That makes sense. I'll do that.",
  "Is there anything else I need to do on my end?",
  "I understand. I was just hoping to get started sooner.",
  "Fair enough. I'll wait for the next steps.",
]

function getDemoReply(maMessageCount: number): string {
  return DEMO_PATIENT_REPLIES[maMessageCount % DEMO_PATIENT_REPLIES.length]
}

const DEFAULT_PERSONA_ID = 'emma'

export default function Simulator() {
  const { personaId } = useParams<{ personaId?: string }>()
  const [selectedShortId, setSelectedShortId] = useState<string | null>(personaId ?? DEFAULT_PERSONA_ID)
  const [messages, setMessages] = useState<MessageWithTiming[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [demoMode, setDemoMode] = useState(true)
  const [chatEvaluation, setChatEvaluation] = useState<ReturnType<typeof evaluateChat> | null>(null)
  const [rubricResults, setRubricResults] = useState<ReturnType<typeof evaluatePersonaRubric> | null>(null)
  const [calgaryResult, setCalgaryResult] = useState<ReturnType<typeof autoScorePerformance> | null>(null)
  const [responseLatencies, setResponseLatencies] = useState<number[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const typingStartRef = useRef<number | null>(null)

  const persona = selectedShortId ? getPersona(selectedShortId) : null
  const { user } = useAuth()

  const handleToken = (token: string) => {
    setMessages((prev) => {
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
    setMessages((prev) => {
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
    selectedShortId,
    handleToken,
    handleComplete
  )

  // When backend is not available, use demo mode so user can always send and get feedback
  useEffect(() => {
    if (connectionStatus === 'error') setDemoMode(true)
  }, [connectionStatus])

  // Sync URL persona: when personaId in URL changes, update selection and show that persona's opening
  useEffect(() => {
    if (personaId !== undefined && personaId !== selectedShortId) {
      setSelectedShortId(personaId)
      setSubmitted(false)
      setChatEvaluation(null)
      setRubricResults(null)
      setCalgaryResult(null)
      setResponseLatencies([])
      const p = getPersona(personaId)
      setMessages(p ? [{ who: p.name, text: p.openingMessage }] : [])
    }
  }, [personaId, selectedShortId])

  // When we have a persona but no messages (e.g. first load with persona in URL), show opening
  useEffect(() => {
    if (!persona) return
    if (messages.length === 0) {
      setMessages([{ who: persona.name, text: persona.openingMessage }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona?.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectPersona = (shortId: string) => {
    setSelectedShortId(shortId)
    setSubmitted(false)
    setChatEvaluation(null)
    setRubricResults(null)
    setCalgaryResult(null)
    setResponseLatencies([])
    const p = getPersona(shortId)
    setMessages(p ? [{ who: p.name, text: p.openingMessage }] : [])
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || text.length < 3 || !persona) return
    const canSendNow = (connectionStatus === 'connected' || demoMode) && !isStreaming
    if (!canSendNow) return

    const startedAt = typingStartRef.current ?? Date.now()
    const sentAt = Date.now()
    setMessages((prev) => [...prev, { who: 'you', text, startedAt, sentAt }])
    setInput('')
    typingStartRef.current = null
    setIsStreaming(true)

    if (connectionStatus === 'connected') {
      sendMessage(text, startedAt, sentAt)
    } else if (demoMode) {
      const maCount = messages.filter((m) => m.who === 'you').length + 1
      const reply = getDemoReply(maCount)
      const latencyMs = 800 + Math.floor(Math.random() * 1200)
      setTimeout(() => {
        setMessages((prev) => {
          const patientName = persona?.name ?? 'Patient'
          return [...prev, { who: patientName, text: reply }]
        })
        setResponseLatencies((prev) => [...prev, latencyMs])
        setIsStreaming(false)
      }, 1200)
    }
  }

  const handleEndSession = () => {
    if (!persona || messages.length === 0) return
    const evaluation = evaluateChat(messages, responseLatencies)
    const rubric = evaluatePersonaRubric(persona, messages)
    const calgary = autoScorePerformance(messages, { responseLatencies })
    setChatEvaluation(evaluation)
    setRubricResults(rubric)
    setCalgaryResult(calgary)
    saveLastTranscript(persona.name, messages.map((l) => ({ who: l.who, text: l.text })))
    const maCount = messages.filter((m) => m.who === 'you').length
    const record = {
      id: `session-${Date.now()}`,
      personaId: getPersonaShortId(persona),
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
        transcript: messages.map((m) => ({ who: m.who, text: m.text })),
      }).catch(() => { /* ignore */ })
    }
    setSubmitted(true)
  }

  const canSend =
    input.trim().length >= 3 &&
    !!persona &&
    (connectionStatus === 'connected' || demoMode) &&
    !isStreaming

  const maMessages = messages.filter((m) => m.who === 'you') as MessageWithTiming[]
  const liveEval = !submitted && maMessages.length > 0
    ? evaluateChat(messages, responseLatencies)
    : null

  return (
    <>
      <div className="siya-section-title">Chat Simulator</div>
      {demoMode && (
        <div
          className="siya-chat-status"
          style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            background: 'rgba(13,139,139,0.15)',
            color: 'var(--siya-primary)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span>Demo mode: simulated patient replies. Full AI: run from project root: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 }}>npm run dev:oet-lms</code> with <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 }}>PERPLEXITY_API_KEY</code> in <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 }}>integrations/oet-lms-chat/.env</code>.</span>
          <button type="button" className="siya-btn siya-btn-secondary" style={{ flexShrink: 0 }} onClick={() => setDemoMode(false)}>Use live AI when connected</button>
        </div>
      )}
      {(connectionStatus === 'connecting' || (connectionStatus === 'error' && !demoMode)) && (
        <div
          className={`siya-chat-status ${connectionStatus === 'error' ? 'error' : ''}`}
          style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            background: connectionStatus === 'error' ? 'rgba(200,60,60,0.1)' : 'rgba(13,139,139,0.1)',
            color: connectionStatus === 'error' ? 'var(--siya-danger)' : 'var(--siya-primary)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span>
            {connectionStatus === 'connecting' && 'Connecting to chat backend…'}
            {connectionStatus === 'error' && (error || 'Chat backend not connected.')}
          </span>
          {connectionStatus === 'error' && (
            <button type="button" className="siya-btn siya-btn-primary" style={{ flexShrink: 0 }} onClick={() => setDemoMode(true)}>
              Use demo mode — send messages & get feedback now
            </button>
          )}
        </div>
      )}
      <div className="siya-simulator-container">
        <div className="siya-simulator-panel">
          <div className="siya-panel-header">
            <div className="siya-panel-title">Chat with AI Patient</div>
            <div className="siya-panel-subtitle">
              {persona ? `${persona.name}, ${persona.archetype}` : 'Select a persona to start'}
            </div>
          </div>
          <div className="siya-chat-window" id="chat-window">
            {messages.length === 0 && !persona ? (
              <div className="siya-chat-empty">
                <div className="siya-chat-empty-icon">💬</div>
                <div className="siya-chat-empty-text">Select a persona from the right panel to begin the simulation</div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isYou = msg.who === 'you'
                  return (
                    <div
                      key={i}
                      className={`siya-message ${isYou ? 'user' : 'assistant'}`}
                    >
                      <div className="siya-message-avatar" aria-hidden>
                        {isYou ? '👤' : '🧑‍⚕️'}
                      </div>
                      <div className="siya-message-content">
                        <span className="siya-message-sender">{isYou ? 'You' : msg.who}</span>
                        <div className="siya-message-body">
                          {msg.text}
                          {isStreaming && i === messages.length - 1 && !isYou && (
                            <span className="siya-typing-cursor">▋</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="siya-chat-input-area">
            <div className="siya-input-group">
              <input
                type="text"
                className="siya-chat-input"
                placeholder={
                  !persona
                    ? 'Select a scenario on the right to start'
                    : isStreaming
                      ? 'Patient is typing…'
                      : (connectionStatus !== 'connected' && !demoMode)
                        ? 'Click "Use demo mode" above to send, or start chat backend'
                        : 'Type your response (min 3 characters)...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => { if (typingStartRef.current == null) typingStartRef.current = Date.now() }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (canSend) handleSend()
                  }
                }}
                disabled={!persona || isStreaming}
              />
              <button
                type="button"
                className="siya-send-btn"
                onClick={handleSend}
                disabled={!canSend}
                title="Send message"
              >
                ➤
              </button>
            </div>
            {liveEval && (
              <div
                className="siya-live-feedback"
                style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(13,139,139,0.08)',
                  border: '1px solid rgba(13,139,139,0.2)',
                  fontSize: 13,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px 20px',
                  alignItems: 'center',
                }}
              >
                <strong style={{ color: 'var(--siya-primary)' }}>Live feedback</strong>
                <span>Empathy: <strong>{liveEval.empathyScore}%</strong></span>
                <span>Grammar: <strong>{liveEval.grammarScore}%</strong></span>
                <span>Typing: <strong>{liveEval.avgWpm} WPM</strong></span>
                {liveEval.avgResponseLatencyMs != null && (
                  <span>Response time: <strong>{liveEval.latencyQuality ?? `${liveEval.avgResponseLatencyMs}ms`}</strong></span>
                )}
              </div>
            )}
            {persona && messages.length > 0 && !submitted && (
              <button type="button" className="siya-btn siya-btn-secondary" style={{ marginTop: 12 }} onClick={handleEndSession}>
                End session & see full feedback
              </button>
            )}
          </div>
        </div>
        <div className="siya-simulator-panel">
          <div className="siya-panel-header">
            <div className="siya-panel-title">Select Training Scenario</div>
            <div className="siya-panel-subtitle">Practice with different patient personas</div>
          </div>
          <div className="siya-personas-in-panel">
            {PERSONAS.map((p) => {
              const shortId = getPersonaShortId(p)
              const level = { emma: 5, michael: 6, priya: 7, janet: 6, carlos: 5, robert: 8 }[shortId] ?? 5
              const stars = Math.min(6, level)
              return (
                <div
                  key={p.id}
                  className={`siya-persona-card ${selectedShortId === shortId ? 'selected' : ''}`}
                  onClick={() => handleSelectPersona(shortId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectPersona(shortId) }}
                >
                  <div className="siya-persona-badge">Level {level}</div>
                  <div className="siya-persona-name">{p.name}, {p.shortLabel.split('–')[0].trim()}</div>
                  <div className="siya-persona-age">{p.archetype}</div>
                  <div className="siya-persona-description">{p.backstory.slice(0, 120)}…</div>
                  <div style={{ marginTop: 8 }}>
                    {'⭐'.repeat(stars)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {submitted && (
        <div className="siya-chat-feedback" style={{ marginTop: 24 }}>
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

      <p style={{ marginTop: 16 }}>
        <Link to={persona ? `/practice/chat/${getPersonaShortId(persona)}` : '/practice/chat/emma'} className="siya-btn siya-btn-secondary">
          Full practice with persona details →
        </Link>
      </p>
    </>
  )
}
