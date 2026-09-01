-- Public employer / B2B partnership inquiries (siya.health /employers).
-- Not PHI — business contact leads only.

CREATE TABLE IF NOT EXISTS siya_employer_inquiries (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  employee_count TEXT,
  states TEXT,
  message TEXT,
  source_url TEXT,
  client_ip TEXT,
  user_agent TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_employer_inquiries_created
  ON siya_employer_inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_siya_employer_inquiries_email_created
  ON siya_employer_inquiries(email, created_at DESC);
