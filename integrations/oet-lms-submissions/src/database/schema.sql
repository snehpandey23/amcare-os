-- OET LMS users (trainees and admins)
CREATE TABLE IF NOT EXISTS lms_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'trainee',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lms_users_email ON lms_users(email);
CREATE INDEX IF NOT EXISTS idx_lms_users_role ON lms_users(role);

-- OET LMS session reports (one row per "End session")
CREATE TABLE IF NOT EXISTS lms_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES lms_users(id) ON DELETE CASCADE,
  persona_id VARCHAR(100) NOT NULL,
  persona_name VARCHAR(255) NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  message_count INTEGER NOT NULL,
  empathy_score INTEGER NOT NULL,
  grammar_score INTEGER NOT NULL,
  avg_wpm INTEGER NOT NULL,
  calgary_score INTEGER,
  calgary_max INTEGER,
  transcript_json JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lms_sessions_user_id ON lms_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_created_at ON lms_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lms_sessions_timestamp_ms ON lms_sessions(timestamp_ms DESC);
