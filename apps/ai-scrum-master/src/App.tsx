import { useEffect, useState } from 'react'
import './App.css'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ProjectInfo = {
  name: string
  description: string
  timeline: string
  teamSize: string
  roles: string
}

type Assignment = {
  role: string
  tasks: string[]
}

type ScrumResponse = {
  assistantMessage: string
  backlogItems?: string[]
  priorityOrder?: string[]
  sprintPlan?: string[]
  assignments?: Assignment[]
}

type SavedProjectSummary = {
  id: string
  name: string
  updatedAt: string
}

const defaultProject: ProjectInfo = {
  name: '',
  description: '',
  timeline: '',
  teamSize: '',
  roles: '',
}

const actionLabels: Record<string, string> = {
  nextStep: 'Give me the next step.',
  backlog: 'Generate a beginner-friendly backlog for this project.',
  prioritize: 'Prioritize the backlog with reasons.',
  sprint: 'Create a 1-2 week sprint plan.',
  assignments: 'Assign tasks to roles with clear ownership.',
}

function App() {
  const apiBaseUrl = import.meta.env.VITE_AI_SCRUM_API_URL || ''
  const [project, setProject] = useState<ProjectInfo>(defaultProject)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [backlogItems, setBacklogItems] = useState<string[]>([])
  const [priorityOrder, setPriorityOrder] = useState<string[]>([])
  const [sprintPlan, setSprintPlan] = useState<string[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [zohoConnected, setZohoConnected] = useState(false)
  const [projects, setProjects] = useState<SavedProjectSummary[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const projectSummary = [project.name, project.description]
    .filter(Boolean)
    .join(' - ')

  const handleProjectChange = (field: keyof ProjectInfo, value: string) => {
    setProject((prev) => ({ ...prev, [field]: value }))
  }

  const outputsPayload = () => ({
    backlogItems,
    priorityOrder,
    sprintPlan,
    assignments,
  })

  const refreshProjects = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/projects`, {
        credentials: 'include',
      })
      if (!response.ok) {
        return
      }
      const data = (await response.json()) as { projects: SavedProjectSummary[] }
      setProjects(data.projects || [])
    } catch {
      // Ignore refresh errors.
    }
  }

  const checkZohoStatus = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/zoho/status`, {
        credentials: 'include',
      })
      if (!response.ok) {
        setZohoConnected(false)
        return
      }
      const data = (await response.json()) as { connected: boolean }
      setZohoConnected(Boolean(data.connected))
      if (data.connected) {
        await refreshProjects()
      }
    } catch {
      setZohoConnected(false)
    }
  }

  const connectZoho = async () => {
    setError('')
    try {
      const response = await fetch(`${apiBaseUrl}/api/zoho/auth-url`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Unable to start Zoho login.')
      }
      const data = (await response.json()) as { url: string }
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Zoho login failed.')
    }
  }

  const saveProject = async () => {
    if (!zohoConnected) {
      setError('Connect to Zoho before saving.')
      return
    }
    if (!project.name.trim()) {
      setError('Project name is required to save.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const response = await fetch(`${apiBaseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: activeProjectId || undefined,
          name: project.name,
          project,
          messages,
          outputs: outputsPayload(),
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to save project.')
      }
      const data = (await response.json()) as {
        project: SavedProjectSummary
        projects: SavedProjectSummary[]
      }
      setActiveProjectId(data.project.id)
      setProjects(data.projects || [])
    } catch (err: any) {
      setError(err.message || 'Failed to save project.')
    } finally {
      setSaving(false)
    }
  }

  const loadProject = async (projectId: string) => {
    setError('')
    try {
      const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to load project.')
      }
      const data = (await response.json()) as {
        project: {
          id: string
          name: string
          project: ProjectInfo
          messages: ChatMessage[]
          outputs: {
            backlogItems: string[]
            priorityOrder: string[]
            sprintPlan: string[]
            assignments: Assignment[]
          }
        }
      }
      setActiveProjectId(data.project.id)
      setProject(data.project.project)
      setMessages(data.project.messages || [])
      setBacklogItems(data.project.outputs?.backlogItems || [])
      setPriorityOrder(data.project.outputs?.priorityOrder || [])
      setSprintPlan(data.project.outputs?.sprintPlan || [])
      setAssignments(data.project.outputs?.assignments || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load project.')
    }
  }

  const resetProject = () => {
    setActiveProjectId(null)
    setProject(defaultProject)
    setMessages([])
    setBacklogItems([])
    setPriorityOrder([])
    setSprintPlan([])
    setAssignments([])
  }

  useEffect(() => {
    checkZohoStatus()
  }, [])

  const buildUserMessage = (action: keyof typeof actionLabels, custom?: string) => {
    if (custom && custom.trim().length > 0) {
      return custom.trim()
    }
    return actionLabels[action]
  }

  const sendRequest = async (
    action: keyof typeof actionLabels,
    customMessage?: string,
  ) => {
    if (!project.name.trim() && !project.description.trim()) {
      setError('Add at least a project name or description first.')
      return
    }

    const userMessage = buildUserMessage(action, customMessage)
    const nextMessages = [...messages, { role: 'user', content: userMessage }]

    setMessages(nextMessages)
    setInputMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project,
          messages: nextMessages,
          action,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Request failed.')
      }

      const data = (await response.json()) as ScrumResponse
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.assistantMessage },
      ])

      if (data.backlogItems?.length) {
        setBacklogItems(data.backlogItems)
      }
      if (data.priorityOrder?.length) {
        setPriorityOrder(data.priorityOrder)
      }
      if (data.sprintPlan?.length) {
        setSprintPlan(data.sprintPlan)
      }
      if (data.assignments?.length) {
        setAssignments(data.assignments)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>AI Scrum Master</h1>
          <p>Step-by-step agile guidance for first-time teams.</p>
        </div>
        <div className="project-summary">
          <span>Project:</span>
          <strong>{projectSummary || 'Not set yet'}</strong>
        </div>
      </header>

      <section className="panel project-panel">
        <h2>Project setup</h2>
        <div className="project-actions">
          <button onClick={saveProject} disabled={saving}>
            {saving ? 'Saving...' : 'Save to WorkDrive'}
          </button>
          <button onClick={resetProject} disabled={saving}>
            New project
          </button>
          {activeProjectId && (
            <span className="project-pill">Saved</span>
          )}
        </div>
        <div className="grid">
          <label>
            Project name
            <input
              value={project.name}
              onChange={(event) => handleProjectChange('name', event.target.value)}
              placeholder="AI onboarding guide"
            />
          </label>
          <label>
            Timeline
            <input
              value={project.timeline}
              onChange={(event) =>
                handleProjectChange('timeline', event.target.value)
              }
              placeholder="4 weeks, MVP in 2 sprints"
            />
          </label>
          <label>
            Team size
            <input
              value={project.teamSize}
              onChange={(event) =>
                handleProjectChange('teamSize', event.target.value)
              }
              placeholder="3 people"
            />
          </label>
          <label>
            Roles
            <input
              value={project.roles}
              onChange={(event) =>
                handleProjectChange('roles', event.target.value)
              }
              placeholder="Product owner, Designer, Developer"
            />
          </label>
        </div>
        <label className="full-width">
          Description
          <textarea
            value={project.description}
            onChange={(event) =>
              handleProjectChange('description', event.target.value)
            }
            placeholder="What are you building and why?"
          />
        </label>
      </section>

      <section className="panel storage-panel">
        <h2>Zoho WorkDrive storage</h2>
        <div className="storage-row">
          <div className="storage-status">
            <span>Status:</span>
            <strong>{zohoConnected ? 'Connected' : 'Not connected'}</strong>
          </div>
          <div className="storage-actions">
            <button onClick={connectZoho} disabled={zohoConnected}>
              Connect Zoho
            </button>
            <button onClick={refreshProjects} disabled={!zohoConnected}>
              Refresh list
            </button>
          </div>
        </div>
        <div className="projects-list">
          {projects.length === 0 ? (
            <p className="muted">No saved projects yet.</p>
          ) : (
            <ul>
              {projects.map((saved) => (
                <li key={saved.id}>
                  <div>
                    <strong>{saved.name}</strong>
                    <span>{new Date(saved.updatedAt).toLocaleString()}</span>
                  </div>
                  <button onClick={() => loadProject(saved.id)}>
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel actions-panel">
        <h2>Guided actions</h2>
        <div className="actions">
          <button onClick={() => sendRequest('nextStep')} disabled={loading}>
            Next step
          </button>
          <button onClick={() => sendRequest('backlog')} disabled={loading}>
            Generate backlog
          </button>
          <button onClick={() => sendRequest('prioritize')} disabled={loading}>
            Prioritize backlog
          </button>
          <button onClick={() => sendRequest('sprint')} disabled={loading}>
            Create sprint plan
          </button>
          <button onClick={() => sendRequest('assignments')} disabled={loading}>
            Assign tasks
          </button>
        </div>
      </section>

      <section className="panel chat-panel">
        <h2>Chat</h2>
        <div className="chat-window">
          {messages.length === 0 && (
            <div className="chat-placeholder">
              Ask for a next step, backlog, or sprint plan to get started.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-bubble ${message.role}`}
            >
              <strong>{message.role === 'user' ? 'You' : 'Scrum Master'}</strong>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            placeholder="Ask a question or give more details..."
          />
          <button
            onClick={() => sendRequest('nextStep', inputMessage)}
            disabled={loading || !inputMessage.trim()}
          >
            Send
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Thinking...</div>}
      </section>

      <section className="panel output-panel">
        <h2>Outputs</h2>
        <div className="output-grid">
          <div>
            <h3>Backlog</h3>
            {backlogItems.length === 0 ? (
              <p className="muted">No backlog yet.</p>
            ) : (
              <ul>
                {backlogItems.map((item, index) => (
                  <li key={`backlog-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3>Priority order</h3>
            {priorityOrder.length === 0 ? (
              <p className="muted">No priorities yet.</p>
            ) : (
              <ol>
                {priorityOrder.map((item, index) => (
                  <li key={`priority-${index}`}>{item}</li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <h3>Sprint plan</h3>
            {sprintPlan.length === 0 ? (
              <p className="muted">No sprint plan yet.</p>
            ) : (
              <ul>
                {sprintPlan.map((item, index) => (
                  <li key={`sprint-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3>Assignments</h3>
            {assignments.length === 0 ? (
              <p className="muted">No assignments yet.</p>
            ) : (
              <div className="assignments">
                {assignments.map((assignment, index) => (
                  <div key={`assignment-${index}`} className="assignment-card">
                    <strong>{assignment.role}</strong>
                    <ul>
                      {assignment.tasks.map((task, taskIndex) => (
                        <li key={`task-${index}-${taskIndex}`}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
