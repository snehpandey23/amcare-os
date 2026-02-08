import { useState, useEffect } from 'react'
import { getSessionHistory } from '../data/dashboardData'
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

const BY_PERSONA = [
  { label: 'Emma (Fast-Tracker)', value: 75 },
  { label: 'Michael (Burnt-Out Parent)', value: 88 },
  { label: 'Dr. Priya (Researcher)', value: 92 },
  { label: 'Janet (Defensive Parent)', value: 80 },
  { label: 'Carlos (Uninsured)', value: 85 },
  { label: 'Robert (Skeptic)', value: 68 },
]

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
      .then((s) => setApiSessions(s.map((x) => ({ id: x.id, personaName: x.personaName, timestamp: x.timestamp, messageCount: x.messageCount, empathyScore: x.empathyScore, grammarScore: x.grammarScore, avgWpm: x.avgWpm, calgaryScore: x.calgaryScore, calgaryMax: x.calgaryMax }))))
      .finally(() => setLoading(false))
  }, [user])

  const sessionHistory = user && apiSessions.length > 0 ? apiSessions : localHistory.map((s) => ({ id: s.id, personaName: s.personaName, timestamp: s.timestamp, messageCount: s.messageCount, empathyScore: s.empathyScore, grammarScore: s.grammarScore, avgWpm: s.avgWpm, calgaryScore: s.calgaryScore, calgaryMax: s.calgaryMax }))

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Your Progress Report</div>
        <div className="siya-user-subtext">Detailed breakdown of your performance across all scenarios</div>
      </div>

      {(loading || sessionHistory.length > 0) && (
        <div className="siya-performance-section" style={{ marginBottom: 24 }}>
          <div className="siya-section-title">Recent Sessions {user && '(saved to your account)'}</div>
          {loading ? (
            <p className="siya-chat-small">Loading…</p>
          ) : (
            <>
              <p className="siya-chat-small" style={{ marginBottom: 12 }}>End a chat with &quot;End session & see feedback&quot; to record it here. Sign in to sync across devices.</p>
              <div className="siya-session-list">
                {sessionHistory.slice(0, 10).map((s) => (
                  <div key={s.id} className="siya-session-row">
                    <div className="siya-session-persona">{s.personaName}</div>
                    <div className="siya-session-meta">{formatSessionDate(s.timestamp)} · {s.messageCount} replies</div>
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
      )}

      <div className="siya-metrics-grid">
        <div className="siya-metric-card">
          <div className="siya-metric-icon">📈</div>
          <div className="siya-metric-label">Overall Improvement</div>
          <div className="siya-metric-value">+18%</div>
          <div className="siya-metric-subtext">From first session to now</div>
          <div className="siya-stat-bar">
            <div className="siya-stat-bar-fill" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">🎯</div>
          <div className="siya-metric-label">Goal Completion Rate</div>
          <div className="siya-metric-value">78%</div>
          <div className="siya-metric-subtext">Successful appointment scheduling</div>
          <div className="siya-stat-bar">
            <div className="siya-stat-bar-fill" style={{ width: '78%' }} />
          </div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">🔥</div>
          <div className="siya-metric-label">Current Streak</div>
          <div className="siya-metric-value">7 days</div>
          <div className="siya-metric-subtext">Keep practicing to extend it</div>
          <div className="siya-stat-bar">
            <div className="siya-stat-bar-fill" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
      <div className="siya-performance-section">
        <div className="siya-performance-stats">
          <div className="siya-section-title">Performance by Persona</div>
          {BY_PERSONA.map((item) => (
            <div key={item.label}>
              <div className="siya-stat-item">
                <div className="siya-stat-label">{item.label}</div>
                <div className="siya-stat-value">{item.value}%</div>
              </div>
              <div className="siya-stat-bar">
                <div className="siya-stat-bar-fill" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="siya-performance-chart">
          <div className="siya-section-title">Key Metrics</div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Total Practice Hours</div>
            <div className="siya-stat-value">12.5 hrs</div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Sessions Completed</div>
            <div className="siya-stat-value">{sessionHistory.length > 0 ? sessionHistory.length : '24'}</div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Average Session Length</div>
            <div className="siya-stat-value">6:45 min</div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Consistency (Last 7 Days)</div>
            <div className="siya-stat-value">100%</div>
          </div>
        </div>
      </div>
    </>
  )
}
