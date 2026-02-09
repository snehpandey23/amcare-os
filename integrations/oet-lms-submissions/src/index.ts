/**
 * OET LMS Submissions API – simulator recordings, auth, and session reports.
 * - POST /api/submit-simulator: recordings → email to supervisor
 * - POST /api/auth/register, POST /api/auth/login, GET /api/auth/me (requires DATABASE_URL, JWT_SECRET)
 * - GET /api/sessions (my), POST /api/sessions (save), GET /api/admin/sessions (all reports)
 */

import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'
import { getPool, initDb } from './db.js'
import { hashPassword, comparePassword, signToken } from './auth.js'
import { requireAuth, requireAdmin, type AuthRequest } from './middleware.js'

const SUPERVISOR_EMAIL = process.env.LMS_SUPERVISOR_EMAIL || 'concierge1@siya.health'
const PORT = parseInt(process.env.OET_LMS_SUBMISSIONS_PORT || '3006', 10)

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^audio\//.test(file.mimetype) || /\.(webm|ogg|mp3|wav|m4a)$/i.test(file.originalname)
    cb(null, !!ok)
  },
})

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  const hasDb = !!getPool()
  res.json({ ok: true, service: 'oet-lms-submissions', database: hasDb ? 'connected' : 'not configured' })
})

// ----- Auth & sessions (require DATABASE_URL) -----
app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
  const pool = getPool()
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured. Set DATABASE_URL.' })
  }
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string }
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  try {
    const passwordHash = await hashPassword(password)
    const result = await pool.query(
      `INSERT INTO lms_users (email, password_hash, name, role) VALUES ($1, $2, $3, 'trainee') RETURNING id, email, name, role, created_at`,
      [email.trim().toLowerCase(), passwordHash, (name && typeof name === 'string' ? name.trim() : null) || null]
    )
    const row = result.rows[0]
    const token = signToken({ userId: row.id, email: row.email, role: row.role })
    return res.status(201).json({ token, user: { id: row.id, email: row.email, name: row.name, role: row.role } })
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : ''
    if (code === '23505') {
      return res.status(400).json({ error: 'Email already registered. Sign in instead.' })
    }
    if (code === '42P01' || code === 'ECONNREFUSED' || code === 'ENOTFOUND' || (err instanceof Error && err.message?.includes('connect'))) {
      console.error('[oet-lms-submissions] Register DB error:', err)
      return res.status(503).json({ error: 'Database not ready. Check DATABASE_URL and server logs.' })
    }
    console.error('[oet-lms-submissions] Register error:', err)
    return res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  const pool = getPool()
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured. Set DATABASE_URL.' })
  }
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password required' })
  }
  const result = await pool.query(
    'SELECT id, email, password_hash, name, role FROM lms_users WHERE email = $1',
    [email.trim().toLowerCase()]
  )
  const row = result.rows[0]
  if (!row || !(await comparePassword(password, row.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = signToken({ userId: row.id, email: row.email, role: row.role })
  return res.json({ token, user: { id: row.id, email: row.email, name: row.name, role: row.role } })
})

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res: express.Response) => {
  const pool = getPool()
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured.' })
  }
  const { userId } = req.user!
  pool.query('SELECT id, email, name, role, created_at FROM lms_users WHERE id = $1', [userId])
    .then((r) => {
      const row = r.rows[0]
      if (!row) return res.status(401).json({ error: 'User not found' })
      return res.json({ id: row.id, email: row.email, name: row.name, role: row.role })
    })
    .catch(() => res.status(500).json({ error: 'Server error' }))
})

app.get('/api/sessions', requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool()
  if (!pool) return res.status(503).json({ error: 'Database not configured.' })
  const { userId } = req.user!
  const result = await pool.query(
    `SELECT id, user_id, persona_id, persona_name, timestamp_ms, message_count, empathy_score, grammar_score, avg_wpm, calgary_score, calgary_max, created_at
     FROM lms_sessions WHERE user_id = $1 ORDER BY timestamp_ms DESC LIMIT 100`,
    [userId]
  )
  const sessions = result.rows.map((r) => ({
    id: r.id,
    personaId: r.persona_id,
    personaName: r.persona_name,
    timestamp: r.timestamp_ms,
    messageCount: r.message_count,
    empathyScore: r.empathy_score,
    grammarScore: r.grammar_score,
    avgWpm: r.avg_wpm,
    calgaryScore: r.calgary_score,
    calgaryMax: r.calgary_max,
    createdAt: r.created_at,
  }))
  return res.json(sessions)
})

app.post('/api/sessions', requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool()
  if (!pool) return res.status(503).json({ error: 'Database not configured.' })
  const { userId } = req.user!
  const body = req.body as {
    personaId?: string
    personaName?: string
    timestamp?: number
    messageCount?: number
    empathyScore?: number
    grammarScore?: number
    avgWpm?: number
    calgaryScore?: number
    calgaryMax?: number
    transcript?: unknown
  }
  if (!body.personaId || !body.personaName || body.messageCount == null) {
    return res.status(400).json({ error: 'personaId, personaName, messageCount required' })
  }
  const result = await pool.query(
    `INSERT INTO lms_sessions (user_id, persona_id, persona_name, timestamp_ms, message_count, empathy_score, grammar_score, avg_wpm, calgary_score, calgary_max, transcript_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, created_at`,
    [
      userId,
      body.personaId,
      body.personaName,
      body.timestamp ?? Date.now(),
      body.messageCount,
      body.empathyScore ?? 0,
      body.grammarScore ?? 0,
      body.avgWpm ?? 0,
      body.calgaryScore ?? null,
      body.calgaryMax ?? null,
      body.transcript ? JSON.stringify(body.transcript) : null,
    ]
  )
  const row = result.rows[0]
  return res.status(201).json({ id: row.id, createdAt: row.created_at })
})

app.get('/api/admin/sessions', requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool()
  if (!pool) return res.status(503).json({ error: 'Database not configured.' })
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 200, 500)
  const result = await pool.query(
    `SELECT s.id, s.user_id, s.persona_id, s.persona_name, s.timestamp_ms, s.message_count, s.empathy_score, s.grammar_score, s.avg_wpm, s.calgary_score, s.calgary_max, s.created_at,
            u.email AS user_email, u.name AS user_name
     FROM lms_sessions s JOIN lms_users u ON s.user_id = u.id
     ORDER BY s.timestamp_ms DESC LIMIT $1`,
    [limit]
  )
  const sessions = result.rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userEmail: r.user_email,
    userName: r.user_name,
    personaId: r.persona_id,
    personaName: r.persona_name,
    timestamp: r.timestamp_ms,
    messageCount: r.message_count,
    empathyScore: r.empathy_score,
    grammarScore: r.grammar_score,
    avgWpm: r.avg_wpm,
    calgaryScore: r.calgary_score,
    calgaryMax: r.calgary_max,
    createdAt: r.created_at,
  }))
  return res.json(sessions)
})

app.get('/api/admin/users', requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool()
  if (!pool) return res.status(503).json({ error: 'Database not configured.' })
  const result = await pool.query('SELECT id, email, name, role, created_at FROM lms_users ORDER BY created_at DESC')
  return res.json(result.rows)
})

// ----- Submit simulator (recordings email) -----
app.post(
  '/api/submit-simulator',
  upload.array('recordings', 10),
  async (req: express.Request, res: express.Response) => {
    const files = (req.files as Express.Multer.File[]) || []
    const activityId = (req.body?.activityId as string) || 'unknown'
    const scenarioId = (req.body?.scenarioId as string) || 'unknown'
    const scenarioTitle = (req.body?.scenarioTitle as string) || 'Simulator submission'
    const learnerId = (req.body?.learnerId as string) || 'anonymous'
    const timestamp = new Date().toISOString()

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    })

    const attachments = files.map((f, i) => ({
      filename: `recording_${i}.webm`,
      content: f.buffer,
      contentType: f.mimetype,
    }))

    const body = [
      `OET LMS – Patient Simulator submission`,
      ``,
      `Activity: ${activityId}`,
      `Scenario: ${scenarioTitle} (${scenarioId})`,
      `Learner: ${learnerId}`,
      `Submitted: ${timestamp}`,
      `Recordings: ${files.length} file(s) attached.`,
      ``,
      `Review for clarity, empathy, accuracy, and use of American English.`,
    ].join('\n')

    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('[oet-lms-submissions] SMTP not configured; logging submission only.')
        console.log(JSON.stringify({ activityId, scenarioId, scenarioTitle, learnerId, timestamp, fileCount: files.length }))
        return res.status(200).json({
          ok: true,
          message: 'Submission logged (email skipped: set SMTP_HOST, SMTP_USER, SMTP_PASS to send to supervisor).',
        })
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: SUPERVISOR_EMAIL,
        subject: `[OET LMS] Simulator submission – ${scenarioTitle} – ${timestamp.slice(0, 10)}`,
        text: body,
        attachments,
      })

      res.status(200).json({ ok: true, message: 'Submission sent to supervisor.' })
    } catch (err) {
      console.error('[oet-lms-submissions] Send failed:', err)
      res.status(500).json({ ok: false, error: 'Failed to send to supervisor.' })
    }
  }
)

async function start() {
  if (getPool()) {
    try {
      await initDb()
      console.log('[oet-lms-submissions] Database initialized (lms_users, lms_sessions)')
    } catch (err) {
      console.error('[oet-lms-submissions] Database init failed:', err)
    }
  } else {
    console.warn('[oet-lms-submissions] DATABASE_URL not set; auth and sessions APIs will return 503')
  }
  app.listen(PORT, () => {
    console.log(`[oet-lms-submissions] Listening on http://localhost:${PORT}; supervisor = ${SUPERVISOR_EMAIL}`)
  })
}
start()
