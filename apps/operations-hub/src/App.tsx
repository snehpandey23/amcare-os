import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header>
          <h1>AmCare OS - Operations Hub</h1>
        </header>
        <main>
          <p>Payments, appointments, and integration management.</p>
        </main>
      </div>
    </Router>
  )
}

export default App
