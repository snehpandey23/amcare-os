-- Siya Assist v2 — per-user chat threads (staff help desk).
-- Content is staff operational Q&A only; never paste patient PHI.

CREATE TABLE IF NOT EXISTS siya_assist_threads (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_assist_threads_user_updated
  ON siya_assist_threads(user_id, updated_at DESC)
  WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS siya_assist_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES siya_assist_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (role IN ('user', 'assistant'))
);

CREATE INDEX IF NOT EXISTS idx_siya_assist_messages_thread
  ON siya_assist_messages(thread_id, created_at ASC);
