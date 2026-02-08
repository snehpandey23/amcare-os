import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header>
          <h1>AmCare OS - Patient Management</h1>
        </header>
        <main>
          <p>Patient tracking, secure messaging, and form management.</p>
        </main>
      </div>
    </Router>
  )
}

export default App
