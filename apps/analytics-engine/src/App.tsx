import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'

type WeeklyEntry = {
  id: string
  weekOf: string
  impressions: number
  posts: number
  engagementRate: number
  linkClicks: number
  leads: number
}

type Targets = {
  impressions: number
  posts: number
  engagementRate: number
  linkClicks: number
  leads: number
}

type Weights = {
  impressions: number
  posts: number
  engagementRate: number
  linkClicks: number
  leads: number
}

const STORAGE_KEY = 'marketing-os-weekly-entries'
const TARGETS_KEY = 'marketing-os-targets'

const defaultTargets: Targets = {
  impressions: 5000,
  posts: 5,
  engagementRate: 3,
  linkClicks: 200,
  leads: 10,
}

const defaultWeights: Weights = {
  impressions: 0.2,
  posts: 0.25,
  engagementRate: 0.2,
  linkClicks: 0.15,
  leads: 0.2,
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const calculateScore = (entry: WeeklyEntry, targets: Targets, weights: Weights) => {
  const normalized = {
    impressions: entry.impressions / Math.max(targets.impressions, 1),
    posts: entry.posts / Math.max(targets.posts, 1),
    engagementRate: entry.engagementRate / Math.max(targets.engagementRate, 0.1),
    linkClicks: entry.linkClicks / Math.max(targets.linkClicks, 1),
    leads: entry.leads / Math.max(targets.leads, 1),
  }

  const weighted =
    weights.impressions * clamp(normalized.impressions, 0, 1.5) +
    weights.posts * clamp(normalized.posts, 0, 1.5) +
    weights.engagementRate * clamp(normalized.engagementRate, 0, 1.5) +
    weights.linkClicks * clamp(normalized.linkClicks, 0, 1.5) +
    weights.leads * clamp(normalized.leads, 0, 1.5)

  return Math.round(clamp(weighted, 0, 1.5) * 100)
}

const scoreStatus = (score: number) => {
  if (score >= 85) return 'On Track'
  if (score >= 70) return 'At Risk'
  return 'Off Track'
}

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const headerAliases: Record<string, keyof Omit<WeeklyEntry, 'id'>> = {
  weekof: 'weekOf',
  week: 'weekOf',
  date: 'weekOf',
  weekstart: 'weekOf',
  impressions: 'impressions',
  impr: 'impressions',
  posts: 'posts',
  postcount: 'posts',
  engagementrate: 'engagementRate',
  engagement: 'engagementRate',
  linkclicks: 'linkClicks',
  clicks: 'linkClicks',
  linkclick: 'linkClicks',
  leads: 'leads',
  bookings: 'leads',
}

const parseCsv = (content: string) => {
  const rows: string[][] = []
  let current: string[] = []
  let value = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    const next = content[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      value += '"'
      i += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      current.push(value)
      value = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1
      }
      current.push(value)
      if (current.some((cell) => cell.trim() !== '')) {
        rows.push(current)
      }
      current = []
      value = ''
      continue
    }

    value += char
  }

  if (value.length > 0 || current.length > 0) {
    current.push(value)
    if (current.some((cell) => cell.trim() !== '')) {
      rows.push(current)
    }
  }

  return rows
}

function App() {
  const [entries, setEntries] = useState<WeeklyEntry[]>([])
  const [targets, setTargets] = useState<Targets>(defaultTargets)
  const [formData, setFormData] = useState<WeeklyEntry>({
    id: '',
    weekOf: '',
    impressions: 0,
    posts: 0,
    engagementRate: 0,
    linkClicks: 0,
    leads: 0,
  })
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error'
    message: string
  }>({ type: 'idle', message: '' })

  useEffect(() => {
    const storedEntries = localStorage.getItem(STORAGE_KEY)
    const storedTargets = localStorage.getItem(TARGETS_KEY)

    if (storedEntries) {
      try {
        setEntries(JSON.parse(storedEntries) as WeeklyEntry[])
      } catch {
        setEntries([])
      }
    }

    if (storedTargets) {
      try {
        setTargets(JSON.parse(storedTargets) as Targets)
      } catch {
        setTargets(defaultTargets)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets))
  }, [targets])

  const latestEntry = entries[0]

  const latestScore = useMemo(() => {
    if (!latestEntry) return 0
    return calculateScore(latestEntry, targets, defaultWeights)
  }, [latestEntry, targets])

  const averageScore = useMemo(() => {
    if (entries.length === 0) return 0
    const total = entries
      .slice(0, 4)
      .reduce((sum, entry) => sum + calculateScore(entry, targets, defaultWeights), 0)
    return Math.round(total / Math.min(entries.length, 4))
  }, [entries, targets])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.weekOf) return

    const newEntry: WeeklyEntry = {
      ...formData,
      id: crypto.randomUUID(),
    }

    setEntries((current) => [newEntry, ...current])
    setFormData({
      id: '',
      weekOf: '',
      impressions: 0,
      posts: 0,
      engagementRate: 0,
      linkClicks: 0,
      leads: 0,
    })
  }

  const handleTargetChange = (key: keyof Targets, value: string) => {
    const parsedValue = Number(value)
    if (Number.isNaN(parsedValue)) return
    setTargets((current) => ({ ...current, [key]: parsedValue }))
  }

  const handleEntryChange = (key: keyof Omit<WeeklyEntry, 'id'>, value: string) => {
    const parsedValue = key === 'weekOf' ? value : Number(value)
    setFormData((current) => ({ ...current, [key]: parsedValue }))
  }

  const handleCsvImport = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length < 2) {
        setImportStatus({ type: 'error', message: 'CSV has no data rows.' })
        return
      }

      const headers = rows[0].map((header) => normalizeHeader(header))
      const headerMap = headers.map((header) => headerAliases[header]).filter(Boolean)

      if (!headerMap.includes('weekOf')) {
        setImportStatus({
          type: 'error',
          message: 'CSV must include a week/date column (e.g., "weekOf" or "date").',
        })
        return
      }

      const newEntries: WeeklyEntry[] = []
      let skipped = 0

      rows.slice(1).forEach((row) => {
        const entry: WeeklyEntry = {
          id: crypto.randomUUID(),
          weekOf: '',
          impressions: 0,
          posts: 0,
          engagementRate: 0,
          linkClicks: 0,
          leads: 0,
        }

        row.forEach((cell, index) => {
          const key = headerMap[index]
          if (!key) return
          if (key === 'weekOf') {
            entry.weekOf = cell.trim()
            return
          }
          const parsed = Number(cell)
          entry[key] = Number.isNaN(parsed) ? 0 : parsed
        })

        if (!entry.weekOf) {
          skipped += 1
          return
        }
        newEntries.push(entry)
      })

      if (newEntries.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'No valid rows found. Ensure week/date values are present.',
        })
        return
      }

      setEntries((current) => {
        const merged = new Map(current.map((entry) => [entry.weekOf, entry]))
        newEntries.forEach((entry) => {
          merged.set(entry.weekOf, entry)
        })
        return Array.from(merged.values()).sort((a, b) =>
          b.weekOf.localeCompare(a.weekOf),
        )
      })

      setImportStatus({
        type: 'success',
        message: `Imported ${newEntries.length} rows${skipped ? `, skipped ${skipped}` : ''}.`,
      })
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'CSV import failed. Please check the file format.',
      })
    }
  }

  const downloadTemplate = () => {
    const template = [
      'weekOf,impressions,posts,engagementRate,linkClicks,leads',
      '2026-02-24,5000,5,3.2,200,10',
    ].join('\n')
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'marketing-os-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const statusLabel = latestEntry ? scoreStatus(latestScore) : 'No Data'
  const statusClass = statusLabel.toLowerCase().replace(/\s+/g, '-')

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div>
            <h1>Siya Health Marketing OS</h1>
            <p>Local dashboard to stay on track with weekly marketing momentum.</p>
          </div>
          <span className="badge">Local Only</span>
        </header>
        <main className="app-main">
          <section className="score-card">
            <div>
              <h2>On-Track Score</h2>
              <p className="score-value">{latestScore}</p>
              <p className={`score-status score-status--${statusClass}`}>{statusLabel}</p>
              <div className="score-progress">
                <div
                  className="score-bar"
                  style={{ width: `${clamp(latestScore, 0, 100)}%` }}
                />
              </div>
              <p className="score-note">
                4-week average: <strong>{averageScore}</strong>
              </p>
            </div>
            <div className="score-details">
              <h3>Latest Week Snapshot</h3>
              {latestEntry ? (
                <ul>
                  <li>
                    Week of <strong>{latestEntry.weekOf}</strong>
                  </li>
                  <li>
                    Impressions: <strong>{latestEntry.impressions}</strong>
                  </li>
                  <li>
                    Posts: <strong>{latestEntry.posts}</strong>
                  </li>
                  <li>
                    Engagement rate:{' '}
                    <strong>{formatPercent(latestEntry.engagementRate)}</strong>
                  </li>
                  <li>
                    Link clicks: <strong>{latestEntry.linkClicks}</strong>
                  </li>
                  <li>
                    Leads/bookings: <strong>{latestEntry.leads}</strong>
                  </li>
                </ul>
              ) : (
                <p className="empty-state">Add your first week to see a snapshot.</p>
              )}
            </div>
          </section>

          <section className="grid">
            <div className="panel">
              <h3>Weekly Targets</h3>
              <p className="panel-note">
                Adjust targets as your weekly goals shift. Score uses these targets.
              </p>
              <div className="panel-grid">
                <label>
                  Impressions
                  <input
                    type="number"
                    min="0"
                    value={targets.impressions}
                    onChange={(event) => handleTargetChange('impressions', event.target.value)}
                  />
                </label>
                <label>
                  Posts
                  <input
                    type="number"
                    min="0"
                    value={targets.posts}
                    onChange={(event) => handleTargetChange('posts', event.target.value)}
                  />
                </label>
                <label>
                  Engagement rate (%)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={targets.engagementRate}
                    onChange={(event) =>
                      handleTargetChange('engagementRate', event.target.value)
                    }
                  />
                </label>
                <label>
                  Link clicks
                  <input
                    type="number"
                    min="0"
                    value={targets.linkClicks}
                    onChange={(event) => handleTargetChange('linkClicks', event.target.value)}
                  />
                </label>
                <label>
                  Leads / bookings
                  <input
                    type="number"
                    min="0"
                    value={targets.leads}
                    onChange={(event) => handleTargetChange('leads', event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="panel">
              <h3>Enter Weekly Performance</h3>
              <p className="panel-note">
                Enter numbers once per week. Data is stored locally in your browser.
              </p>
              <form className="panel-grid" onSubmit={handleSubmit}>
                <label>
                  Week of
                  <input
                    type="date"
                    value={formData.weekOf}
                    onChange={(event) => handleEntryChange('weekOf', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Impressions
                  <input
                    type="number"
                    min="0"
                    value={formData.impressions}
                    onChange={(event) => handleEntryChange('impressions', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Posts
                  <input
                    type="number"
                    min="0"
                    value={formData.posts}
                    onChange={(event) => handleEntryChange('posts', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Engagement rate (%)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.engagementRate}
                    onChange={(event) =>
                      handleEntryChange('engagementRate', event.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  Link clicks
                  <input
                    type="number"
                    min="0"
                    value={formData.linkClicks}
                    onChange={(event) => handleEntryChange('linkClicks', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Leads / bookings
                  <input
                    type="number"
                    min="0"
                    value={formData.leads}
                    onChange={(event) => handleEntryChange('leads', event.target.value)}
                    required
                  />
                </label>
                <button className="primary" type="submit">
                  Save week
                </button>
              </form>
              <div className="import-block">
                <div>
                  <h4>Import CSV</h4>
                  <p className="panel-note">
                    Use a CSV with headers like weekOf, impressions, posts, engagementRate,
                    linkClicks, leads.
                  </p>
                </div>
                <div className="import-actions">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => handleCsvImport(event.target.files?.[0] ?? null)}
                  />
                  <button className="secondary" type="button" onClick={downloadTemplate}>
                    Download template
                  </button>
                </div>
                {importStatus.type !== 'idle' && (
                  <p className={`import-status import-status--${importStatus.type}`}>
                    {importStatus.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="panel history">
            <div className="panel-header">
              <h3>Weekly History</h3>
              <span>{entries.length} weeks tracked</span>
            </div>
            {entries.length === 0 ? (
              <p className="empty-state">No weeks tracked yet.</p>
            ) : (
              <div className="table">
                <div className="table-row table-head">
                  <span>Week</span>
                  <span>Score</span>
                  <span>Impressions</span>
                  <span>Posts</span>
                  <span>Engagement</span>
                  <span>Clicks</span>
                  <span>Leads</span>
                </div>
                {entries.map((entry) => {
                  const score = calculateScore(entry, targets, defaultWeights)
                  return (
                    <div className="table-row" key={entry.id}>
                      <span>{entry.weekOf}</span>
                      <span className="score-pill">{score}</span>
                      <span>{entry.impressions}</span>
                      <span>{entry.posts}</span>
                      <span>{formatPercent(entry.engagementRate)}</span>
                      <span>{entry.linkClicks}</span>
                      <span>{entry.leads}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </Router>
  )
}

export default App
