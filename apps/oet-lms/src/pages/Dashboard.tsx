import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchMySessions } from '../api/client'
import {
  getPracticeSuggestions,
  getLastTranscript,
  getSessionHistory,
  sendTranscriptToSupervisor,
  summarizeSessionStats,
  type SessionRecord,
} from '../data/dashboardData'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [supervisorEmail, setSupervisorEmail] = useState('')
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sendMessage, setSendMessage] = useState('')
  const [showSendModal, setShowSendModal] = useState(false)
  const [apiSessions, setApiSessions] = useState<SessionRecord[]>([])
  const [loadingSessions, setLoadingSessions] = useState(!!user)

  const tasks = getPracticeSuggestions()

  useEffect(() => {
    if (!user) {
      setApiSessions([])
      setLoadingSessions(false)
      return
    }
    setLoadingSessions(true)
    fetchMySessions()
      .then((s) =>
        setApiSessions(
          s.map((x) => ({
            id: x.id,
            personaId: x.personaId,
            personaName: x.personaName,
            timestamp: x.timestamp,
            messageCount: x.messageCount,
            empathyScore: x.empathyScore,
            grammarScore: x.grammarScore,
            avgWpm: x.avgWpm,
            calgaryScore: x.calgaryScore ?? undefined,
            calgaryMax: x.calgaryMax ?? undefined,
          })),
        ),
      )
      .catch(() => setApiSessions([]))
      .finally(() => setLoadingSessions(false))
  }, [user])

  const sessions: SessionRecord[] = useMemo(() => {
    if (user && apiSessions.length > 0) return apiSessions
    return getSessionHistory()
  }, [user, apiSessions])

  const stats = summarizeSessionStats(sessions)

  const handleSendTranscript = async () => {
    const email = supervisorEmail.trim()
    if (!email) {
      setSendMessage("Please enter your supervisor's email.")
      setSendStatus('error')
      return
    }
    setSendStatus('sending')
    setSendMessage('')
    const transcript = getLastTranscript()
    if (!transcript) {
      setSendStatus('error')
      setSendMessage('No recent chat transcript found. End a session first.')
      return
    }
    try {
      const result = await sendTranscriptToSupervisor(email, transcript)
      setSendStatus(result.ok ? 'sent' : 'error')
      setSendMessage(result.message)
    } catch {
      setSendStatus('error')
      setSendMessage('Something went wrong. Try again.')
    }
  }

  return (
    <>
      <div className="siya-dash-header">
        <img src="/siya-health-logo.png" alt="Siya Health" className="siya-dash-logo" />
        <div className="siya-user-greeting">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'there'}
        </div>
        <div className="siya-user-subtext">
          MA Chat Simulator — practice difficult patient scenarios. Scores come only from sessions you
          complete (empathy / grammar heuristics + WPM). Aggregate trend analytics are not available yet.
        </div>
      </div>

      <div className="siya-metrics-grid">
        <div className="siya-metric-card">
          <div className="siya-metric-icon">💬</div>
          <div className="siya-metric-label">Sessions completed</div>
          <div className="siya-metric-value">
            {loadingSessions ? '…' : stats.totalSessions}
          </div>
          <div className="siya-metric-subtext">
            {stats.totalSessions === 0
              ? 'No saved sessions yet — finish a chat to record one'
              : user
                ? 'From your account (or this browser)'
                : 'Saved in this browser'}
          </div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">❤️</div>
          <div className="siya-metric-label">Avg empathy (heuristic)</div>
          <div className="siya-metric-value">
            {loadingSessions ? '…' : stats.avgEmpathy != null ? `${stats.avgEmpathy}%` : '—'}
          </div>
          <div className="siya-metric-subtext">Phrase-match score from completed sessions only</div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">⌨️</div>
          <div className="siya-metric-label">Avg typing speed</div>
          <div className="siya-metric-value">
            {loadingSessions ? '…' : stats.avgWpm != null ? `${stats.avgWpm} WPM` : '—'}
          </div>
          <div className="siya-metric-subtext">From timed MA replies in completed sessions</div>
        </div>
      </div>

      <div className="siya-section-title">
        <span>🎯</span>
        Suggested practice (not personalized analytics)
      </div>
      <div className="siya-tasks-grid">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="siya-task-card"
            onClick={() => navigate(t.action === 'priya' ? '/resources' : `/simulator/${t.action}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(t.action === 'priya' ? '/resources' : `/simulator/${t.action}`)
            }}
            role="button"
            tabIndex={0}
          >
            <div className={`siya-task-priority ${t.priority}`}>
              {t.priority === 'high' ? 'Suggested' : t.priority === 'medium' ? 'Suggested' : 'Optional'}
            </div>
            <div className="siya-task-title">{t.title}</div>
            <div className="siya-task-description">{t.description}</div>
            <span className="siya-task-action">
              {t.action === 'priya' ? 'Review Resources →' : 'Practice Now →'}
            </span>
          </div>
        ))}
      </div>

      <div className="siya-performance-section">
        <div className="siya-performance-chart">
          <div className="siya-section-title">Performance over time</div>
          <p className="siya-chat-small" style={{ marginBottom: 0 }}>
            Not available yet — we do not invent weekly charts. When week-over-week aggregates ship, they will
            appear here from real session data. See <strong>Progress Report</strong> for your completed sessions.
          </p>
        </div>
        <div className="siya-performance-stats">
          <div className="siya-section-title">Quick stats (real sessions only)</div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Total sessions</div>
            <div className="siya-stat-value">{loadingSessions ? '…' : stats.totalSessions}</div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Avg grammar (heuristic)</div>
            <div className="siya-stat-value">
              {loadingSessions ? '…' : stats.avgGrammar != null ? `${stats.avgGrammar}%` : '—'}
            </div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Personas practiced</div>
            <div className="siya-stat-value">
              {loadingSessions ? '…' : `${stats.byPersona.length}/6`}
            </div>
          </div>
        </div>
      </div>

      <div className="siya-section-title">
        <span>⚠️</span>
        Gaps &amp; areas for improvement
      </div>
      <p className="siya-chat-small" style={{ marginBottom: 16 }}>
        Automatic gap detection is not available yet. After a session, use the on-screen rubric feedback. Do not
        treat this page as a personalized coaching plan.
      </p>

      <div style={{ marginTop: 24 }}>
        <button type="button" className="siya-btn siya-btn-primary" onClick={() => setShowSendModal(true)}>
          📧 Send transcript to supervisor
        </button>
      </div>

      {showSendModal && (
        <div className="siya-modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="siya-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="siya-modal-title">Send transcript to supervisor</h3>
            <p className="siya-modal-content">
              Enter your supervisor&apos;s email. Your most recent chat transcript will be used. Email delivery is
              still a stub unless SMTP is configured on the submissions API.
            </p>
            <input
              type="email"
              placeholder="supervisor@example.com"
              value={supervisorEmail}
              onChange={(e) => setSupervisorEmail(e.target.value)}
            />
            {sendMessage && (
              <p
                style={{
                  color: sendStatus === 'error' ? 'var(--siya-danger)' : 'var(--siya-success)',
                  marginBottom: 12,
                }}
              >
                {sendMessage}
              </p>
            )}
            <div className="siya-modal-actions">
              <button
                type="button"
                className="siya-btn siya-btn-primary"
                onClick={handleSendTranscript}
                disabled={sendStatus === 'sending'}
              >
                {sendStatus === 'sending' ? 'Sending…' : 'Send'}
              </button>
              <button type="button" className="siya-btn siya-btn-secondary" onClick={() => setShowSendModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
