-- Provider recruitment / careers inquiries (siya.health /join-our-team).
-- Not PHI — professional contact leads only.

CREATE TABLE IF NOT EXISTS siya_provider_careers_inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  credential TEXT NOT NULL,
  licensed_states TEXT,
  message TEXT,
  source_url TEXT,
  client_ip TEXT,
  user_agent TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_provider_careers_created
  ON siya_provider_careers_inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_siya_provider_careers_email_created
  ON siya_provider_careers_inquiries(email, created_at DESC);
