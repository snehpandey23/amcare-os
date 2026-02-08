import { Link } from 'react-router-dom'
import { PERSONAS } from '../data/personas'

export default function Practice() {
  return (
    <div className="siya-practice">
      <div className="siya-page-header">
        <h1>Chat simulator</h1>
        <p>Choose a patient persona. The conversation responds to what you type—avoid jargon and give clear, specific answers.</p>
      </div>
      <div className="siya-persona-grid">
        {PERSONAS.map((p) => (
          <Link
            key={p.id}
            to={`/practice/chat/${p.id}`}
            className="siya-persona-card"
          >
            <span className="siya-persona-archetype">{p.archetype}</span>
            <h3>{p.name}</h3>
            <p className="siya-persona-short">{p.shortLabel}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
