-- Monthly competency sittings (P0) — section attempts + sitting-scoped seen

CREATE TABLE IF NOT EXISTS siya_competency_sittings (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS siya_competency_user_sittings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  sitting_id TEXT NOT NULL REFERENCES siya_competency_sittings(id),
  status VARCHAR(16) NOT NULL CHECK (status IN ('open', 'closed')),
  first_activity_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  section_aggregates JSONB NOT NULL DEFAULT '{}'::jsonb,
  composite_summary JSONB,
  safety_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, sitting_id)
);

CREATE TABLE IF NOT EXISTS siya_competency_section_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  sitting_id TEXT NOT NULL REFERENCES siya_competency_sittings(id),
  section VARCHAR(24) NOT NULL,
  attempt_index INT NOT NULL,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active_sec NUMERIC NOT NULL DEFAULT 0,
  section_score NUMERIC,
  weight NUMERIC NOT NULL,
  item_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  repeated_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  safety_red_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  safety_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  trail_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competency_section_attempts_user_sitting
  ON siya_competency_section_attempts (user_id, sitting_id, section, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_competency_section_attempts_sitting_submitted
  ON siya_competency_section_attempts (sitting_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS siya_competency_seen (
  user_id UUID NOT NULL,
  sitting_id TEXT NOT NULL,
  pool TEXT NOT NULL,
  item_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  repeated BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, sitting_id, pool, item_id, attempt_id)
);

CREATE INDEX IF NOT EXISTS idx_competency_seen_user_sitting_pool
  ON siya_competency_seen (user_id, sitting_id, pool);

-- Legacy full/isolated attempts — optional link to monthly sitting (deprecated for new writes)
ALTER TABLE siya_competency_exam_attempts
  ADD COLUMN IF NOT EXISTS sitting_id TEXT REFERENCES siya_competency_sittings(id);
