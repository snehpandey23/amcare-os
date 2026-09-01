-- Public Siya Circle newsletter signups (siya.health /siya-circle).
-- Not PHI — marketing contact leads only.

CREATE TABLE IF NOT EXISTS siya_circle_signups (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  topics TEXT,
  source_url TEXT,
  client_ip TEXT,
  user_agent TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_circle_signups_created
  ON siya_circle_signups(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_siya_circle_signups_email_created
  ON siya_circle_signups(email, created_at DESC);
