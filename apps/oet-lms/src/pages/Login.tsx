import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name.trim() || undefined)
      }
      navigate(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="siya-login-page" data-login-layout="two-panel">
      <div className="siya-login-branding">
        <div className="siya-login-branding-inner">
          <img src="/siya-health-logo.png" alt="Siya Health" className="siya-login-logo" />
          <p className="siya-login-subtitle">Virtual Medical Assistant Chat Simulator</p>
          <p className="siya-login-tagline">Sign in or create an account to save your progress and get personalized feedback.</p>
        </div>
      </div>
      <div className="siya-login-form-panel">
        <div className="siya-login-form-card">
          <div className="siya-login-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Create account
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {error && (
              <>
                <div className="siya-login-error">{error}</div>
                {mode === 'register' && (
                  <p className="siya-login-error-hint">Already have an account? Switch to <button type="button" className="siya-login-error-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</button>.</p>
                )}
              </>
            )}
            {mode === 'register' && (
              <div className="siya-form-group">
                <label>Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}
            <div className="siya-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
              />
            </div>
            <div className="siya-form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder={mode === 'register' ? 'At least 6 characters' : ''}
              />
            </div>
            <button type="submit" className="siya-btn siya-btn-primary siya-login-btn" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="siya-login-hint">
            Anyone can create an account. Your data is stored securely and tied to your email.
          </p>
        </div>
      </div>
    </div>
  )
}
