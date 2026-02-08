import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Simulator from './pages/Simulator'
import Personas from './pages/Personas'
import Progress from './pages/Progress'
import Resources from './pages/Resources'
import Export from './pages/Export'
import ActivityRunner from './pages/ActivityRunner'
import Login from './pages/Login'
import AdminReports from './pages/AdminReports'
import './App.css'

function AppContent() {
  const { user, logout } = useAuth()

  return (
    <div className="siya-app">
      <aside className="siya-sidebar">
        <div className="siya-sidebar-header">
          <div className="siya-sidebar-logo">S</div>
          <div className="siya-sidebar-title">SIYA HEALTH</div>
        </div>
        <nav className="siya-sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `siya-nav-item${isActive ? ' active' : ''}`} end>Dashboard</NavLink>
          <NavLink to="/simulator" className={({ isActive }) => `siya-nav-item${isActive ? ' active' : ''}`}>Chat Simulator</NavLink>
          <NavLink to="/personas" className={({ isActive }) => `siya-nav-item${isActive ? ' active' : ''}`}>Select Persona</NavLink>
          <NavLink to="/progress" className={({ isActive }) => `siya-nav-item${isActive ? ' active' : ''}`}>Progress Report</NavLink>
          <NavLink to="/resources" className={({ isActive }) => `siya-nav-item${isActive ? ' active' : ''}`}>Resources</NavLink>
          <NavLink to="/export" className={({ isActive }) => `siya-nav-item${isActive ? ' active' : ''}`}>Export & Share</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/reports" className={({ isActive }) => `siya-nav-item${isActive ? ' active' : ''}`}>All reports</NavLink>
          )}
        </nav>
        <div className="siya-sidebar-section">
          <div className="siya-sidebar-section-title">Account</div>
          {user ? (
            <>
              <span className="siya-nav-item" style={{ cursor: 'default', opacity: 0.9 }} title={user.email}>
                {user.name || user.email}
              </span>
              <button type="button" className="siya-nav-item siya-nav-logout" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="siya-nav-item">Sign in</NavLink>
          )}
        </div>
      </aside>
      <main className="siya-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/simulator/:personaId" element={<Simulator />} />
          <Route path="/personas" element={<Personas />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/export" element={<Export />} />
          <Route path="/practice/chat/:personaId" element={<ActivityRunner />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
