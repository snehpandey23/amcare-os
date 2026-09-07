import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchMySessions } from '../api/client'
import {
  getLastTranscript,
  getSessionHistory,
  sendTranscriptToSupervisor,
  type SessionRecord,
} from '../data/dashboardData'

export default function Export() {
  const { user } = useAuth()
  const [showSuccess, setShowSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sendMessage, setSendMessage] = useState('')
  const [sessions, setSessions] = useState<SessionRecord[]>([])

  useEffect(() => {
    if (!user) {
      setSessions(getSessionHistory())
      return
    }
    fetchMySessions()
      .then((s) =>
        setSessions(
          s.map((x) => ({
            id: x.id,
            personaId: x.personaId,
            personaName: x.personaName,
            timestamp: x.timestamp,
            messageCount: x.messageCount,
            empathyScore: x.empathyScore,
            grammarScore: x.grammarScore,
            avgWpm: x.avgWpm,
          })),
        ),
      )
      .catch(() => setSessions(getSessionHistory()))
  }, [user])

  const handleSendToSupervisor = async () => {
    const e = email.trim()
    if (!e) {
      setSendMessage('Enter a supervisor email first.')
      return
    }
    const transcript = getLastTranscript()
    if (!transcript || !transcript.lines.length) {
      setSendMessage('No recent transcript. End a chat session first.')
      return
    }
    setSending(true)
    setSendMessage('')
    try {
      const result = await sendTranscriptToSupervisor(e, transcript)
      setSendMessage(result.message)
      setShowSuccess(result.ok)
      if (result.ok) setTimeout(() => setShowSuccess(false), 3000)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Export &amp; Share</div>
        <div className="siya-user-subtext">
          Send your latest chat transcript to a supervisor. PDF/CSV export and auto supervisor directories are not
          implemented yet.
        </div>
      </div>
      <div className="siya-export-section">
        <div className="siya-export-header">Recent sessions (real only)</div>
        <div className="siya-export-info">
          These are sessions you completed. Fake sample rows are not shown.
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            border: '1px solid var(--border-color)',
          }}
        >
          {sessions.length === 0 ? (
            <p className="siya-chat-small" style={{ margin: 0 }}>
              No sessions yet. Complete a chat in the Simulator to see them here.
            </p>
          ) : (
            sessions.slice(0, 10).map((s) => (
              <div key={s.id} style={{ fontSize: 13, marginBottom: 8 }}>
                <strong>{s.personaName}</strong> — {new Date(s.timestamp).toLocaleString()} · empathy{' '}
                {s.empathyScore}% · grammar {s.grammarScore}% · {s.avgWpm} WPM
              </div>
            ))
          )}
        </div>
        <div className="siya-export-actions">
          <button
            type="button"
            className="siya-btn siya-btn-secondary"
            disabled
            title="Not implemented yet"
          >
            PDF export (not available yet)
          </button>
          <button type="button" className="siya-btn siya-btn-primary" onClick={handleSendToSupervisor} disabled={sending}>
            {sending ? 'Sending…' : 'Email last transcript (stub)'}
          </button>
          <button type="button" className="siya-btn siya-btn-secondary" disabled title="Not implemented yet">
            CSV download (not available yet)
          </button>
        </div>
      </div>
      <div className="siya-export-section">
        <div className="siya-export-header">Supervisor email</div>
        <div style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid var(--border-color)' }}>
          <p className="siya-chat-small">
            Enter the address to receive the last transcript. Delivery requires SMTP on the submissions API; otherwise
            the action is logged as a stub.
          </p>
          <input
            type="email"
            placeholder="supervisor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              fontSize: 13,
              marginTop: 12,
              fontFamily: 'inherit',
            }}
          />
          {sendMessage && <p className="siya-chat-small">{sendMessage}</p>}
        </div>
      </div>
      {showSuccess && (
        <div className="siya-success-message">Request recorded (check stub/SMTP status above).</div>
      )}
    </>
  )
}
