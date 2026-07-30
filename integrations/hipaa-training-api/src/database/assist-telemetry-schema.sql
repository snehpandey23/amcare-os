-- Ask telemetry for Executive Workspace (Knowledge Health). No PHI in question text.

CREATE TABLE IF NOT EXISTS siya_assist_gaps (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL DEFAULT 'General',
  task_label TEXT NOT NULL DEFAULT '',
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_status ON siya_assist_gaps(status, created_at DESC);

CREATE TABLE IF NOT EXISTS siya_assist_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helpful BOOLEAN NOT NULL,
  failure_type TEXT,
  department TEXT,
  knowledge_gap BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_assist_feedback_created ON siya_assist_feedback(created_at DESC);
