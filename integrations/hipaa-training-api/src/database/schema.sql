-- HIPAA Training API — users and per-user progress (JSON blob matches apps/hipaa-training ProgressState)
-- Requires PostgreSQL with gen_random_uuid() (e.g. pgcrypto extension enabled on the database).

CREATE TABLE IF NOT EXISTS hipaa_training_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'trainee' CHECK (role IN ('trainee', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hipaa_training_users_email ON hipaa_training_users(email);

CREATE TABLE IF NOT EXISTS hipaa_training_progress (
  user_id UUID PRIMARY KEY REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  course_version VARCHAR(64) NOT NULL,
  progress_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hipaa_training_progress_updated ON hipaa_training_progress(updated_at DESC);
