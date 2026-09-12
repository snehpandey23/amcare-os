-- Competency exam attempts — server source of truth (replaces browser-only localStorage)

CREATE TABLE IF NOT EXISTS siya_competency_exam_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  attempt_type VARCHAR(16) NOT NULL CHECK (attempt_type IN ('full', 'isolated')),
  -- isolated section only (null for full sitting)
  section VARCHAR(24),
  subject_label TEXT NOT NULL DEFAULT '',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  points_earned NUMERIC,
  points_possible NUMERIC,
  section_score NUMERIC,
  safety_red_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  safety_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  report_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Full HIPAA MCQ trail (question id, prompt, options, selected vs key, correct)
  hipaa_items_json JSONB,
  -- Writing miss / text trail
  writing_json JSONB,
  -- Chat-sim grammar / relevance / safety trail
  chat_json JSONB,
  item_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  repeated_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competency_exam_attempts_user
  ON siya_competency_exam_attempts (user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_competency_exam_attempts_submitted
  ON siya_competency_exam_attempts (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_competency_exam_attempts_type
  ON siya_competency_exam_attempts (attempt_type, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_competency_exam_attempts_safety
  ON siya_competency_exam_attempts (safety_red_flagged, submitted_at DESC)
  WHERE safety_red_flagged = TRUE;
