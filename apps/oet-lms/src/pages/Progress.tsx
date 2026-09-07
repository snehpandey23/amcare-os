import { useState, useEffect, useMemo } from 'react'
import { getSessionHistory, summarizeSessionStats } from '../data/dashboardData'
import { useAuth } from '../contexts/AuthContext'
import { fetchMySessions } from '../api/client'

interface SessionDisplay {
  id: string
  personaName: string
  timestamp: number
  messageCount: number
  empathyScore: number
  grammarScore: number
  avgWpm: number
  calgaryScore?: number | null
  calgaryMax?: number | null
}

function formatSessionDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  if (diff < 60 * 60 * 1000) return `${Math.round(diff / 60000)} min ago`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / (60 * 60 * 1000))} hrs ago`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.round(diff / (24 * 60 * 60 * 1000))} days ago`
  return d.toLocaleDateString()
}

export default function Progress() {
  const { user } = useAuth()
  const [apiSessions, setApiSessions] = useState<SessionDisplay[]>([])
  const [loading, setLoading] = useState(!!user)

  const localHistory = getSessionHistory()

  useEffect(() => {
    if (!user) {
      setApiSessions([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetchMySessions()
      .then((s) =>
        setApiSessions(
          s.map((x) => ({
            id: x.id,
            personaName: x.personaName,
            timestamp: x.timestamp,
            messageCount: x.messageCount,
            empathyScore: x.empathyScore,
            grammarScore: x.grammarScore,
            avgWpm: x.avgWpm,
            calgaryScore: x.calgaryScore,
            calgaryMax: x.calgaryMax,
          })),
        ),
      )
      .catch(() => setApiSessions([]))
      .finally(() => setLoading(false))
  }, [user])

  const sessionHistory =
    user && apiSessions.length > 0
      ? apiSessions
      : localHistory.map((s) => ({
          id: s.id,
          personaName: s.personaName,
          timestamp: s.timestamp,
          messageCount: s.messageCount,
          empathyScore: s.empathyScore,
          grammarScore: s.grammarScore,
          avgWpm: s.avgWpm,
          calgaryScore: s.calgaryScore,
          calgaryMax: s.calgaryMax,
        }))

  const stats = useMemo(
    () =>
      summarizeSessionStats(
        sessionHistory.map((s) => ({
          id: s.id,
          personaId: s.personaName,
          personaName: s.personaName,
          timestamp: s.timestamp,
          messageCount: s.messageCount,
          empathyScore: s.empathyScore,
          grammarScore: s.grammarScore,
          avgWpm: s.avgWpm,
          calgaryScore: s.calgaryScore ?? undefined,
          calgaryMax: s.calgaryMax ?? undefined,
        })),
      ),
    [sessionHistory],
  )

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Your Progress Report</div>
        <div className="siya-user-subtext">
          Only sessions you completed appear here. Fake improvement %, streaks, and hours are not shown.
        </div>
      </div>

      <div className="siya-performance-section" style={{ marginBottom: 24 }}>
        <div className="siya-section-title">Recent sessions {user && '(saved to your account when API is up)'}</div>
        {loading ? (
          <p className="siya-chat-small">Loading…</p>
        ) : sessionHistory.length === 0 ? (
          <p className="siya-chat-small">
            No sessions yet. Open <strong>Chat Simulator</strong>, practice, then tap{' '}
            <strong>End session &amp; see feedback</strong>.
          </p>
        ) : (
          <>
            <p className="siya-chat-small" style={{ marginBottom: 12 }}>
              Empathy / grammar are heuristic scores (not LanguageTool or human clinical review). Clinical accuracy
              is not scored automatically.
            </p>
            <div className="siya-session-list">
              {sessionHistory.slice(0, 20).map((s) => (
                <div key={s.id} className="siya-session-row">
                  <div className="siya-session-persona">{s.personaName}</div>
                  <div className="siya-session-meta">
                    {formatSessionDate(s.timestamp)} · {s.messageCount} replies
                  </div>
                  <div className="siya-session-scores">
                    Empathy {s.empathyScore}% · Grammar {s.grammarScore}% · {s.avgWpm} WPM
                    {s.calgaryScore != null && s.calgaryMax != null && ` · Calgary ${s.calgaryScore}/${s.calgaryMax}`}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="siya-metrics-grid">
        <div className="siya-metric-card">
          <div className="siya-metric-icon">💬</div>
          <div className="siya-metric-label">Sessions completed</div>
          <div className="siya-metric-value">{loading ? '…' : stats.totalSessions}</div>
          <div className="siya-metric-subtext">Real count only</div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">❤️</div>
          <div className="siya-metric-label">Avg empathy</div>
          <div className="siya-metric-value">
            {loading ? '…' : stats.avgEmpathy != null ? `${stats.avgEmpathy}%` : '—'}
          </div>
          <div className="siya-metric-subtext">Heuristic phrase match</div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">⌨️</div>
          <div className="siya-metric-label">Avg WPM</div>
          <div className="siya-metric-value">
            {loading ? '…' : stats.avgWpm != null ? String(stats.avgWpm) : '—'}
          </div>
          <div className="siya-metric-subtext">From timed replies</div>
        </div>
      </div>

      <div className="siya-performance-section">
        <div className="siya-performance-stats">
          <div className="siya-section-title">By persona (from your sessions)</div>
          {stats.byPersona.length === 0 ? (
            <p className="siya-chat-small">No persona breakdown yet.</p>
          ) : (
            stats.byPersona.map((item) => (
              <div key={item.label}>
                <div className="siya-stat-item">
                  <div className="siya-stat-label">{item.label}</div>
                  <div className="siya-stat-value">
                    {item.sessions} session{item.sessions === 1 ? '' : 's'} · avg empathy {item.avgEmpathy}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="siya-performance-chart">
          <div className="siya-section-title">Not tracked yet</div>
          <p className="siya-chat-small">
            Practice hours, streaks, “goal completion,” and week-over-week improvement charts are not implemented.
            Those numbers will not appear until they can be computed from real data.
          </p>
        </div>
      </div>
    </>
  )
}
