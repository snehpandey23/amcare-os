-- HIPAA Training API — users and per-user progress (JSON blob matches apps/hipaa-training ProgressState)
-- Requires PostgreSQL with gen_random_uuid() (e.g. pgcrypto extension enabled on the database).

CREATE TABLE IF NOT EXISTS hipaa_training_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'trainee' CHECK (role IN ('trainee', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hipaa_training_users_email ON hipaa_training_users(email);

CREATE TABLE IF NOT EXISTS hipaa_training_progress (
  user_id UUID PRIMARY KEY REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  course_version VARCHAR(64) NOT NULL,
  progress_json JSONB NOT NULL DEFAULT '{}',
  level_up_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hipaa_training_progress_updated ON hipaa_training_progress(updated_at DESC);

-- Existing deployments: add column if missing
ALTER TABLE hipaa_training_progress ADD COLUMN IF NOT EXISTS level_up_json JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE hipaa_training_progress ADD COLUMN IF NOT EXISTS profile_json JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE hipaa_training_progress ADD COLUMN IF NOT EXISTS shift_json JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS siya_memory_entries (
  id TEXT PRIMARY KEY,
  author_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  source VARCHAR(64) NOT NULL,
  importance SMALLINT NOT NULL DEFAULT 1 CHECK (importance IN (1, 2, 3)),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  department VARCHAR(128),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibility VARCHAR(16) NOT NULL DEFAULT 'org' CHECK (visibility IN ('private', 'org')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_memory_created ON siya_memory_entries(created_at DESC);

CREATE TABLE IF NOT EXISTS siya_constitution_entries (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  half_life_days INT,
  confidence SMALLINT NOT NULL DEFAULT 95,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS siya_decisions (
  id TEXT PRIMARY KEY,
  author_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  decision_text TEXT NOT NULL,
  reason TEXT,
  what_changed TEXT,
  action_hook TEXT,
  owner_name TEXT,
  owner_user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  department VARCHAR(128),
  decision_date DATE,
  importance SMALLINT NOT NULL DEFAULT 2 CHECK (importance IN (1, 2, 3)),
  confidence SMALLINT NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  supersedes_id TEXT REFERENCES siya_decisions(id) ON DELETE SET NULL,
  evidence TEXT,
  lifecycle VARCHAR(32) NOT NULL DEFAULT 'promoted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS siya_knowledge_links (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  rel_type VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_id, to_id, rel_type)
);

CREATE TABLE IF NOT EXISTS siya_laws (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  owner_name TEXT NOT NULL,
  owner_contact TEXT,
  review_date DATE NOT NULL,
  half_life_days INT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  supersedes_id TEXT REFERENCES siya_laws(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_laws_status ON siya_laws(status);
CREATE INDEX IF NOT EXISTS idx_siya_laws_review ON siya_laws(review_date ASC);
