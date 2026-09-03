-- Ask telemetry for Executive Workspace (Knowledge Health) + lead gap digests.
-- Never store verbatim question text here — department + task_label only.

CREATE TABLE IF NOT EXISTS siya_assist_gaps (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL DEFAULT 'General',
  department_slug VARCHAR(64) NOT NULL DEFAULT 'general',
  task_label TEXT NOT NULL DEFAULT '',
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  signal_type VARCHAR(32) NOT NULL DEFAULT 'no_match',
  phi_redacted BOOLEAN NOT NULL DEFAULT FALSE,
  reported_by_user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_status ON siya_assist_gaps(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_dept_status ON siya_assist_gaps(department_slug, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_signal ON siya_assist_gaps(signal_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_reported_by ON siya_assist_gaps(reported_by_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS siya_assist_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helpful BOOLEAN NOT NULL,
  failure_type TEXT,
  department TEXT,
  knowledge_gap BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_assist_feedback_created ON siya_assist_feedback(created_at DESC);

-- One weekly digest email per lead (dedupe).
CREATE TABLE IF NOT EXISTS siya_assist_gap_digest_sends (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  gap_count INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);
