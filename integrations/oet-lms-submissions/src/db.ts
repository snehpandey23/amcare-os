/**
 * PostgreSQL pool for OET LMS users and sessions.
 * Set DATABASE_URL in .env. If unset, auth/sessions APIs return 503.
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

let pool: pg.Pool | null = null

export function getPool(): pg.Pool | null {
  if (pool != null) return pool
  const url = process.env.DATABASE_URL
  if (!url) return null
  pool = new pg.Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
  })
  return pool
}

export async function initDb(): Promise<void> {
  const p = getPool()
  if (!p) return
  try {
    const schemaPath = join(__dirname, 'database', 'schema.sql')
    const sql = readFileSync(schemaPath, 'utf8')
    await p.query(sql)
  } catch {
    const sql = `
      CREATE TABLE IF NOT EXISTS lms_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'trainee',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_lms_users_email ON lms_users(email);
      CREATE TABLE IF NOT EXISTS lms_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES lms_users(id) ON DELETE CASCADE,
        persona_id VARCHAR(100) NOT NULL,
        persona_name VARCHAR(255) NOT NULL,
        timestamp_ms BIGINT NOT NULL,
        message_count INTEGER NOT NULL,
        empathy_score INTEGER NOT NULL,
        grammar_score INTEGER NOT NULL,
        avg_wpm INTEGER NOT NULL,
        calgary_score INTEGER,
        calgary_max INTEGER,
        transcript_json JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_lms_sessions_user_id ON lms_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_lms_sessions_created_at ON lms_sessions(created_at DESC);
    `
    await p.query(sql)
  }
}

export interface DbUser {
  id: string
  email: string
  password_hash: string
  name: string | null
  role: string
  created_at: Date
}

export interface DbSession {
  id: string
  user_id: string
  persona_id: string
  persona_name: string
  timestamp_ms: number
  message_count: number
  empathy_score: number
  grammar_score: number
  avg_wpm: number
  calgary_score: number | null
  calgary_max: number | null
  transcript_json: unknown
  created_at: Date
}
