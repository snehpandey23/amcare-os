import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchAdminSessions, fetchAdminUsers, type AdminSessionRecord } from '../api/client'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString()
}

export default function AdminReports() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<AdminSessionRecord[]>([])
  const [users, setUsers] = useState<{ id: string; email: string; name: string | null; role: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') return
    Promise.all([fetchAdminSessions(300), fetchAdminUsers()])
      .then(([s, u]) => {
        setSessions(s)
        setUsers(u)
      })
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [user?.role])

  if (user?.role !== 'admin') {
    return (
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Admin only</div>
        <div className="siya-user-subtext">You must be signed in as an admin to view reports.</div>
        <Link to="/login?redirect=/admin/reports" className="siya-btn siya-btn-primary" style={{ marginTop: 16 }}>
          Sign in
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Loading reports…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Error</div>
        <div className="siya-user-subtext">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">All reports</div>
        <div className="siya-user-subtext">
          Sessions from all users. Data is saved when trainees sign in and end a chat with &quot;End session & see feedback&quot;.
        </div>
      </div>

      <div className="siya-performance-section" style={{ marginBottom: 24 }}>
        <div className="siya-section-title">Users ({users.length})</div>
        <div className="siya-session-list">
          {users.map((u) => (
            <div key={u.id} className="siya-session-row">
              <div className="siya-session-persona">{u.name || u.email}</div>
              <div className="siya-session-meta">{u.email} · {u.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="siya-performance-section">
        <div className="siya-section-title">Recent sessions ({sessions.length})</div>
        <div className="siya-session-list">
          {sessions.map((s) => (
            <div key={s.id} className="siya-session-row">
              <div className="siya-session-persona">{s.personaName}</div>
              <div className="siya-session-meta">
                {s.userEmail} · {formatDate(s.timestamp)} · {s.messageCount} replies
              </div>
              <div className="siya-session-scores">
                Empathy {s.empathyScore}% · Grammar {s.grammarScore}% · {s.avgWpm} WPM
                {s.calgaryScore != null && s.calgaryMax != null && ` · Calgary ${s.calgaryScore}/${s.calgaryMax}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
