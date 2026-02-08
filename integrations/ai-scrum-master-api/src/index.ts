import express from 'express'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import FormData from 'form-data'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()

const app = express()
app.use(express.json({ limit: '1mb' }))

const port = parseInt(process.env.AI_SCRUM_MASTER_PORT || '3010')
const appOrigin = process.env.AI_SCRUM_MASTER_WEB_ORIGIN || 'http://localhost:3007'
const zohoAccountsUrl =
  process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com'
const workdriveFileName =
  process.env.ZOHO_WORKDRIVE_FILE_NAME || 'ai-scrum-projects.json'
const zohoCrmModule = process.env.ZOHO_CRM_MODULE || ''
const cookieName = 'asm_session'

const openai = new OpenAI({
  apiKey: process.env.PPLX_API_KEY,
  baseURL: 'https://api.perplexity.ai',
})

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ProjectInfo = {
  name?: string
  description?: string
  timeline?: string
  teamSize?: string
  roles?: string
}

type SavedProject = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  project: ProjectInfo
  messages: ChatMessage[]
  outputs: {
    backlogItems: string[]
    priorityOrder: string[]
    sprintPlan: string[]
    assignments: { role: string; tasks: string[] }[]
  }
}

type SessionData = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  apiDomain: string
  workdriveRootId?: string
  indexFileId?: string
}

const sessionStore = new Map<string, SessionData>()
const stateStore = new Map<string, { sessionId: string; createdAt: number }>()

const buildSystemPrompt = (action: string, project: ProjectInfo) => {
  return [
    'You are an AI Scrum Master for beginners.',
    'Use short, friendly, step-by-step guidance with minimal jargon.',
    'Always reply as valid JSON with these fields:',
    'assistantMessage (string), backlogItems (string[]), priorityOrder (string[]), sprintPlan (string[]), assignments (array of { role, tasks }).',
    `Current action: ${action}. Only populate the fields that match the action; use empty arrays for others.`,
    'Never include markdown or extra keys.',
    `Project name: ${project.name || 'Not provided'}.`,
    `Description: ${project.description || 'Not provided'}.`,
    `Timeline: ${project.timeline || 'Not provided'}.`,
    `Team size: ${project.teamSize || 'Not provided'}.`,
    `Roles: ${project.roles || 'Not provided'}.`,
  ].join(' ')
}

const normalizeArray = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.filter((item) => typeof item === 'string') as string[]
}

const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, item) => {
    const [rawKey, ...rest] = item.trim().split('=')
    if (!rawKey) return acc
    acc[rawKey] = decodeURIComponent(rest.join('='))
    return acc
  }, {})
}

const getSessionId = (req: express.Request, res: express.Response) => {
  const cookies = parseCookies(req.headers.cookie)
  let sessionId = cookies[cookieName]
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    res.setHeader(
      'Set-Cookie',
      `${cookieName}=${encodeURIComponent(
        sessionId,
      )}; Path=/; HttpOnly; SameSite=Lax`,
    )
  }
  return sessionId
}

const getSession = (req: express.Request) => {
  const cookies = parseCookies(req.headers.cookie)
  const sessionId = cookies[cookieName]
  if (!sessionId) return null
  return sessionStore.get(sessionId) || null
}

const setSession = (sessionId: string, data: SessionData) => {
  sessionStore.set(sessionId, data)
}

const requireZohoConfig = () => {
  const missing = []
  if (!process.env.ZOHO_CLIENT_ID) missing.push('ZOHO_CLIENT_ID')
  if (!process.env.ZOHO_CLIENT_SECRET) missing.push('ZOHO_CLIENT_SECRET')
  if (!process.env.ZOHO_REDIRECT_URI) missing.push('ZOHO_REDIRECT_URI')
  return missing
}

const refreshZohoToken = async (session: SessionData) => {
  if (Date.now() < session.expiresAt - 60_000) {
    return session.accessToken
  }
  const response = await axios.post(
    `${zohoAccountsUrl}/oauth/v2/token`,
    null,
    {
      params: {
        refresh_token: session.refreshToken,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      },
    },
  )

  session.accessToken = response.data.access_token
  session.expiresAt = Date.now() + 55 * 60 * 1000
  return session.accessToken
}

const zohoRequest = async <T>(
  session: SessionData,
  method: 'GET' | 'POST' | 'PUT',
  url: string,
  options?: { params?: Record<string, string>; data?: any; headers?: any },
) => {
  const accessToken = await refreshZohoToken(session)
  const response = await axios.request<T>({
    method,
    url: `${session.apiDomain}${url}`,
    params: options?.params,
    data: options?.data,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...(options?.headers || {}),
    },
  })
  return response.data
}

const extractRootFolderId = (payload: any) => {
  const data = payload?.data
  if (Array.isArray(data)) {
    for (const item of data) {
      const rootId =
        item?.attributes?.root_folder_id ||
        item?.attributes?.root_id ||
        item?.root_folder_id ||
        item?.root_id
      if (rootId) return String(rootId)
    }
  }
  return null
}

const ensureWorkdriveRoot = async (session: SessionData) => {
  if (session.workdriveRootId) return session.workdriveRootId
  const payload = await zohoRequest<any>(session, 'GET', '/workdrive/api/v1/users/me')
  const rootId = extractRootFolderId(payload)
  if (!rootId) {
    throw new Error('Unable to determine WorkDrive root folder.')
  }
  session.workdriveRootId = rootId
  return rootId
}

const listWorkdriveFiles = async (session: SessionData, parentId: string) => {
  const payload = await zohoRequest<any>(session, 'GET', '/workdrive/api/v1/files', {
    params: { parent_id: parentId },
  })
  return Array.isArray(payload?.data) ? payload.data : []
}

const downloadWorkdriveFile = async (session: SessionData, fileId: string) => {
  const accessToken = await refreshZohoToken(session)
  const response = await axios.get(`${session.apiDomain}/workdrive/api/v1/download/${fileId}`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  })
  return response.data
}

const uploadWorkdriveFile = async (
  session: SessionData,
  parentId: string,
  content: string,
  fileId?: string,
) => {
  const form = new FormData()
  form.append('content', content, {
    filename: workdriveFileName,
    contentType: 'application/json',
  })
  form.append('parent_id', parentId)
  if (fileId) {
    form.append('file_id', fileId)
    form.append('overwrite', 'true')
  }

  const accessToken = await refreshZohoToken(session)
  const response = await axios.post(
    `${session.apiDomain}/workdrive/api/v1/upload`,
    form,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        ...form.getHeaders(),
      },
    },
  )
  return response.data
}

const ensureIndexFile = async (session: SessionData) => {
  if (session.indexFileId) return session.indexFileId
  const rootId = await ensureWorkdriveRoot(session)
  const files = await listWorkdriveFiles(session, rootId)
  const existing = files.find(
    (file: any) => file?.attributes?.name === workdriveFileName,
  )
  if (existing?.id) {
    session.indexFileId = String(existing.id)
    return session.indexFileId
  }

  const created = await uploadWorkdriveFile(
    session,
    rootId,
    JSON.stringify({ projects: [] }, null, 2),
  )
  const createdId = created?.data?.[0]?.id || created?.data?.id
  if (!createdId) {
    throw new Error('Failed to create WorkDrive index file.')
  }
  session.indexFileId = String(createdId)
  return session.indexFileId
}

const loadProjects = async (session: SessionData) => {
  const fileId = await ensureIndexFile(session)
  const content = await downloadWorkdriveFile(session, fileId)
  if (!content) return []
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content
    return Array.isArray(parsed?.projects) ? parsed.projects : []
  } catch {
    return []
  }
}

const saveProjects = async (session: SessionData, projects: SavedProject[]) => {
  const fileId = await ensureIndexFile(session)
  const rootId = await ensureWorkdriveRoot(session)
  await uploadWorkdriveFile(
    session,
    rootId,
    JSON.stringify({ projects }, null, 2),
    fileId,
  )
}

const maybeSyncCrm = async (session: SessionData, project: SavedProject) => {
  if (!zohoCrmModule) return
  try {
    await zohoRequest(session, 'POST', `/crm/v3/${zohoCrmModule}`, {
      data: {
        data: [
          {
            Name: project.name,
            Description: project.project.description || '',
            Timeline: project.project.timeline || '',
            Team_Size: project.project.teamSize || '',
            Roles: project.project.roles || '',
            Last_Updated: project.updatedAt,
          },
        ],
      },
    })
  } catch (error) {
    console.warn('Zoho CRM sync failed:', error)
  }
}

app.get('/api/zoho/status', (req, res) => {
  const session = getSession(req)
  res.json({ connected: Boolean(session?.refreshToken) })
})

app.get('/api/zoho/auth-url', (req, res) => {
  const missing = requireZohoConfig()
  if (missing.length) {
    return res.status(500).json({
      error: `Missing env vars: ${missing.join(', ')}`,
    })
  }

  const sessionId = getSessionId(req, res)
  const state = crypto.randomUUID()
  stateStore.set(state, { sessionId, createdAt: Date.now() })

  const scope = [
    'WorkDrive.files.ALL',
    'WorkDrive.team.ALL',
    'ZohoCRM.modules.ALL',
  ].join(',')

  const params = new URLSearchParams({
    scope,
    client_id: process.env.ZOHO_CLIENT_ID || '',
    response_type: 'code',
    access_type: 'offline',
    redirect_uri: process.env.ZOHO_REDIRECT_URI || '',
    prompt: 'consent',
    state,
  })

  res.json({ url: `${zohoAccountsUrl}/oauth/v2/auth?${params.toString()}` })
})

app.get('/api/zoho/callback', async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string }
  if (!code || !state) {
    return res.status(400).send('Missing code or state.')
  }

  const storedState = stateStore.get(state)
  if (!storedState) {
    return res.status(400).send('Invalid state.')
  }
  stateStore.delete(state)

  try {
    const tokenResponse = await axios.post(
      `${zohoAccountsUrl}/oauth/v2/token`,
      null,
      {
        params: {
          code,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          redirect_uri: process.env.ZOHO_REDIRECT_URI,
          grant_type: 'authorization_code',
        },
      },
    )

    const accessToken = tokenResponse.data.access_token
    const refreshToken = tokenResponse.data.refresh_token
    const apiDomain =
      tokenResponse.data.api_domain || 'https://www.zohoapis.com'

    if (!refreshToken) {
      return res.status(400).send('No refresh token returned. Re-consent required.')
    }

    setSession(storedState.sessionId, {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 55 * 60 * 1000,
      apiDomain,
    })

    res.redirect(`${appOrigin}?zoho=connected`)
  } catch (error: any) {
    res.status(500).send(error?.message || 'Zoho OAuth failed.')
  }
})

app.get('/api/projects', async (req, res) => {
  const session = getSession(req)
  if (!session) {
    return res.status(401).json({ error: 'Not connected to Zoho.' })
  }

  try {
    const projects = await loadProjects(session)
    res.json({ projects })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load projects.' })
  }
})

app.post('/api/projects', async (req, res) => {
  const session = getSession(req)
  if (!session) {
    return res.status(401).json({ error: 'Not connected to Zoho.' })
  }

  const payload = req.body as Partial<SavedProject>
  const projectName = payload?.project?.name || payload?.name
  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required.' })
  }

  try {
    const projects = await loadProjects(session)
    const now = new Date().toISOString()
    const existingIndex = projects.findIndex((item: SavedProject) => item.id === payload.id)
    const savedProject: SavedProject = {
      id: payload.id || crypto.randomUUID(),
      name: projectName,
      createdAt:
        existingIndex >= 0 ? projects[existingIndex].createdAt : now,
      updatedAt: now,
      project: payload.project || {},
      messages: payload.messages || [],
      outputs: payload.outputs || {
        backlogItems: [],
        priorityOrder: [],
        sprintPlan: [],
        assignments: [],
      },
    }

    if (existingIndex >= 0) {
      projects[existingIndex] = savedProject
    } else {
      projects.push(savedProject)
    }

    await saveProjects(session, projects)
    await maybeSyncCrm(session, savedProject)

    res.json({ project: savedProject, projects })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to save project.' })
  }
})

app.get('/api/projects/:id', async (req, res) => {
  const session = getSession(req)
  if (!session) {
    return res.status(401).json({ error: 'Not connected to Zoho.' })
  }

  try {
    const projects = await loadProjects(session)
    const project = projects.find((item: SavedProject) => item.id === req.params.id)
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' })
    }
    res.json({ project })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load project.' })
  }
})

app.post('/api/chat', async (req, res) => {
  if (!process.env.PPLX_API_KEY) {
    return res.status(500).json({ error: 'Missing PPLX_API_KEY.' })
  }

  const { project, messages, action } = req.body as {
    project?: ProjectInfo
    messages?: ChatMessage[]
    action?: string
  }

  if (!project || !Array.isArray(messages) || !action) {
    return res.status(400).json({ error: 'Invalid request payload.' })
  }

  const normalizedMessages = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .reduce<ChatMessage[]>((acc, message) => {
      const last = acc[acc.length - 1]
      if (last && last.role === message.role) {
        last.content = `${last.content}\n${message.content}`.trim()
      } else {
        acc.push({ role: message.role, content: message.content })
      }
      return acc
    }, [])
    .filter((message) => message.role === 'user' || message.role === 'assistant')

  const chatMessages = [
    { role: 'system' as const, content: buildSystemPrompt(action, project) },
    ...normalizedMessages,
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'sonar',
      messages: chatMessages,
      temperature: 0.2,
    })

    const content = completion.choices[0]?.message?.content || '{}'
    let parsed: any = {}
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = {
        assistantMessage: content,
        backlogItems: [],
        priorityOrder: [],
        sprintPlan: [],
        assignments: [],
      }
    }

    res.json({
      assistantMessage: parsed.assistantMessage || 'Let’s keep moving!',
      backlogItems: normalizeArray(parsed.backlogItems),
      priorityOrder: normalizeArray(parsed.priorityOrder),
      sprintPlan: normalizeArray(parsed.sprintPlan),
      assignments: Array.isArray(parsed.assignments)
        ? parsed.assignments
            .map((assignment) => ({
              role: String(assignment.role || ''),
              tasks: normalizeArray(assignment.tasks),
            }))
            .filter((assignment) => assignment.role)
        : [],
    })
  } catch (error: any) {
    const message = error?.message || 'Perplexity request failed.'
    res.status(500).json({ error: message })
  }
})

app.listen(port, () => {
  console.log(`AI Scrum Master API listening on port ${port}`)
})

export default app
