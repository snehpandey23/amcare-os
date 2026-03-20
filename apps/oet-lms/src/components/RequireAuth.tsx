import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Protects routes so only signed-in users see the app.
 * Redirects to /login with return URL for personalized UI and feedback.
 */
export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="siya-loading" style={{ padding: 48, textAlign: 'center', color: 'var(--siya-primary)' }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    const redirect = location.pathname + location.search
    return <Navigate to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} replace />
  }

  return <Outlet />
}
