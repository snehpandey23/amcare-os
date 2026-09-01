-- Website callback requests from Siya Guide chat (contact-me flow).
-- Not PHI — general contact leads only. Do not store clinical details.

CREATE TABLE IF NOT EXISTS siya_website_callback_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source_url TEXT,
  client_ip TEXT,
  user_agent TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_website_callback_created
  ON siya_website_callback_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_siya_website_callback_email_created
  ON siya_website_callback_requests(email, created_at DESC);
