import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getRecommendedTasks,
  getProgressOverTime,
  getGapsIdentified,
  getLastTranscript,
  sendTranscriptToSupervisor,
} from '../data/dashboardData'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [supervisorEmail, setSupervisorEmail] = useState('')
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sendMessage, setSendMessage] = useState('')
  const [showSendModal, setShowSendModal] = useState(false)

  const tasks = getRecommendedTasks()
  const progress = getProgressOverTime()
  const gaps = getGapsIdentified()
  const maxScore = Math.max(...progress.map((p) => p.avgRubricScore), 1)

  const handleSendTranscript = async () => {
    const email = supervisorEmail.trim()
    if (!email) {
      setSendMessage('Please enter your supervisor\'s email.')
      setSendStatus('error')
      return
    }
    setSendStatus('sending')
    setSendMessage('')
    const transcript = getLastTranscript() ?? {
      personaName: 'Last chat',
      lines: [{ who: 'Patient', text: 'Sample.' }, { who: 'you', text: 'Sample.' }],
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
          Your dashboard and feedback are personalized for you. Keep practicing to master difficult patient scenarios.
        </div>
      </div>

      <div className="siya-metrics-grid">
        <div className="siya-metric-card">
          <div className="siya-metric-icon">📊</div>
          <div className="siya-metric-label">Overall Score</div>
          <div className="siya-metric-value">82%</div>
          <div className="siya-metric-subtext">↑ 8% from last week</div>
          <div className="siya-stat-bar">
            <div className="siya-stat-bar-fill" style={{ width: '82%' }} />
          </div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">✅</div>
          <div className="siya-metric-label">Appointment Conversion</div>
          <div className="siya-metric-value">78%</div>
          <div className="siya-metric-subtext">Patients who scheduled appointments</div>
          <div className="siya-stat-bar">
            <div className="siya-stat-bar-fill" style={{ width: '78%' }} />
          </div>
        </div>
        <div className="siya-metric-card">
          <div className="siya-metric-icon">😊</div>
          <div className="siya-metric-label">Patient Satisfaction</div>
          <div className="siya-metric-value">85%</div>
          <div className="siya-metric-subtext">Average satisfaction rating</div>
          <div className="siya-stat-bar">
            <div className="siya-stat-bar-fill" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      <div className="siya-section-title">
        <span>🎯</span>
        Recommended Training Tasks (Based on Your Performance)
      </div>
      <div className="siya-tasks-grid">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="siya-task-card"
            onClick={() => navigate(t.action === 'priya' ? '/resources' : `/simulator/${t.action}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(t.action === 'priya' ? '/resources' : `/simulator/${t.action}`) }}
            role="button"
            tabIndex={0}
          >
            <div className={`siya-task-priority ${t.priority}`}>
              {t.priority === 'high' ? 'High Priority' : t.priority === 'medium' ? 'Medium Priority' : 'Development Area'}
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
          <div className="siya-section-title">Performance Over Time</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {progress.map((p) => (
              <div key={p.week}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{p.week}</span>
                  <span style={{ color: 'var(--siya-primary)', fontWeight: 600 }}>{p.avgRubricScore}% · {p.chatsCompleted} chats</span>
                </div>
                <div className="siya-stat-bar">
                  <div className="siya-stat-bar-fill" style={{ width: `${(p.avgRubricScore / maxScore) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="siya-performance-stats">
          <div className="siya-section-title">Quick Stats</div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Total Sessions</div>
            <div className="siya-stat-value">12</div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Avg. Duration</div>
            <div className="siya-stat-value">6.5 min</div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Persona Mastered</div>
            <div className="siya-stat-value">3/6</div>
          </div>
          <div className="siya-stat-item">
            <div className="siya-stat-label">Best Performer</div>
            <div className="siya-stat-value">Dr. Priya</div>
          </div>
        </div>
      </div>

      <div className="siya-section-title">
        <span>⚠️</span>
        Gaps & Areas for Improvement
      </div>
      <div className="siya-gaps-grid">
        {gaps.map((g) => (
          <div key={g.id} className="siya-gap-item">
            <div className="siya-gap-title">{g.label}</div>
            <div className="siya-gap-description">{g.description}</div>
            <div className="siya-gap-suggestion">💡 {g.suggestedAction}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="siya-btn siya-btn-primary"
          onClick={() => setShowSendModal(true)}
        >
          📧 Send transcript to supervisor
        </button>
      </div>

      {showSendModal && (
        <div className="siya-modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="siya-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="siya-modal-title">Send transcript to supervisor</h3>
            <p className="siya-modal-content">Enter your supervisor&apos;s email. Your most recent chat transcript will be sent.</p>
            <input
              type="email"
              placeholder="supervisor@example.com"
              value={supervisorEmail}
              onChange={(e) => setSupervisorEmail(e.target.value)}
            />
            {sendMessage && (
              <p style={{ color: sendStatus === 'error' ? 'var(--siya-danger)' : 'var(--siya-success)', marginBottom: 12 }}>{sendMessage}</p>
            )}
            <div className="siya-modal-actions">
              <button type="button" className="siya-btn siya-btn-primary" onClick={handleSendTranscript} disabled={sendStatus === 'sending'}>
                {sendStatus === 'sending' ? 'Sending…' : 'Send'}
              </button>
              <button type="button" className="siya-btn siya-btn-secondary" onClick={() => setShowSendModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
