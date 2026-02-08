import { useNavigate } from 'react-router-dom'
import { PERSONAS, getPersonaShortId } from '../data/personas'

const LEVEL: Record<string, number> = { emma: 5, michael: 6, priya: 7, janet: 6, carlos: 5, robert: 8 }

export default function Personas() {
  const navigate = useNavigate()

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Training Scenarios</div>
        <div className="siya-user-subtext">Master 6 different patient personas to become an expert medical assistant</div>
      </div>
      <div className="siya-personas-grid">
        {PERSONAS.map((p) => {
          const shortId = getPersonaShortId(p)
          const level = LEVEL[shortId] ?? 5
          const stars = Math.min(6, level)
          return (
            <div
              key={p.id}
              className="siya-persona-card"
              onClick={() => navigate(`/simulator/${shortId}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/simulator/${shortId}`) }}
              role="button"
              tabIndex={0}
            >
              <div className="siya-persona-badge">Level {level}</div>
              <div className="siya-persona-name">{p.name}, {p.shortLabel.split('–')[0].trim()}</div>
              <div className="siya-persona-age">{p.archetype}</div>
              <div className="siya-persona-description">{p.backstory.slice(0, 140)}…</div>
              <div style={{ marginTop: 12 }}>{'⭐'.repeat(stars)}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}
