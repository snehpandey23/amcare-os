import { getSuggestedReading } from '../data/dashboardData'

export default function Resources() {
  const resources = getSuggestedReading()

  return (
    <>
      <div className="siya-dash-header">
        <div className="siya-user-greeting">Training Resources</div>
        <div className="siya-user-subtext">Recommended reading and training materials based on your gaps</div>
      </div>
      <div className="siya-resources-list">
        {resources.map((r) => (
          <div key={r.id} className="siya-resource-item">
            <div className="siya-resource-info">
              <h3>{r.title}</h3>
              <p>{r.description}</p>
            </div>
            <a href={r.url ?? '#'} className="siya-resource-btn" target="_blank" rel="noopener noreferrer">Read</a>
          </div>
        ))}
      </div>
    </>
  )
}
