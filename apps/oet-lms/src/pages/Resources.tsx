import { getSuggestedReading } from '../data/dashboardData'

export default function Resources() {
  const resources = getSuggestedReading()

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Training Resources</div>
        <div className="siya-user-subtext">Training materials (static list — not personalized from gap analytics)</div>
      </div>
      <div className="siya-resources-list">
        {resources.map((r) => (
          <div key={r.id} className="siya-resource-item">
            <div className="siya-resource-info">
              <h3>{r.title}</h3>
              <p>{r.description}</p>
            </div>
            <a
              href={r.url && r.url !== '#' ? r.url : undefined}
              className="siya-resource-btn"
              onClick={(e) => {
                if (!r.url || r.url === '#') e.preventDefault()
              }}
              aria-disabled={!r.url || r.url === '#'}
            >
              {!r.url || r.url === '#' ? 'No link yet' : 'Read'}
            </a>
          </div>
        ))}
      </div>
    </>
  )
}
