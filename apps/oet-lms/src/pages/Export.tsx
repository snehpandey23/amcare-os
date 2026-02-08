import { useState } from 'react'
import { getLastTranscript, sendTranscriptToSupervisor } from '../data/dashboardData'

export default function Export() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendToSupervisor = async () => {
    const e = email.trim() || 'supervisor@siyadiag.com'
    setSending(true)
    try {
      const transcript = getLastTranscript() ?? { personaName: 'Last chat', lines: [] }
      await sendTranscriptToSupervisor(e, transcript)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Export & Share Performance</div>
        <div className="siya-user-subtext">Send your chat transcripts and performance reports to supervisors</div>
      </div>
      <div className="siya-export-section">
        <div className="siya-export-header">📊 Export Recent Sessions</div>
        <div className="siya-export-info">Select sessions to include in your report. Supervisors will receive transcripts, scoring breakdown, and improvement recommendations.</div>
        <div style={{ background: 'white', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Recent Sessions</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
            <span>Emma - Jan 29, 2:45 PM - Score: 82%</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, marginTop: 8 }}>
            <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
            <span>Michael - Jan 28, 11:30 AM - Score: 88%</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, marginTop: 8 }}>
            <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
            <span>Dr. Priya - Jan 27, 3:15 PM - Score: 92%</span>
          </label>
        </div>
        <div className="siya-export-actions">
          <button type="button" className="siya-btn siya-btn-primary" onClick={() => alert('PDF export would generate a professional report.')}>
            📄 Export as PDF
          </button>
          <button type="button" className="siya-btn siya-btn-primary" onClick={handleSendToSupervisor} disabled={sending}>
            {sending ? 'Sending…' : '📧 Send to Supervisor'}
          </button>
          <button type="button" className="siya-btn siya-btn-secondary" onClick={() => alert('CSV download would include session data.')}>
            📊 Download CSV
          </button>
        </div>
      </div>
      <div className="siya-export-section">
        <div className="siya-export-header">👥 Supervisor Email Addresses</div>
        <div style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <input type="checkbox" defaultChecked style={{ marginRight: 8 }} />
              <strong>Direct Supervisor</strong> - supervisor@siyadiag.com
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <input type="checkbox" style={{ marginRight: 8 }} />
              <strong>Training Manager</strong> - training@siyadiag.com
            </label>
            <label style={{ display: 'block' }}>
              <input type="checkbox" style={{ marginRight: 8 }} />
              <strong>Medical Director</strong> - medical@siyadiag.com
            </label>
          </div>
          <input
            type="text"
            placeholder="Add custom email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 13, marginTop: 12, fontFamily: 'inherit' }}
          />
        </div>
      </div>
      {showSuccess && (
        <div className="siya-success-message">✅ Report sent successfully to your supervisor!</div>
      )}
    </>
  )
}
