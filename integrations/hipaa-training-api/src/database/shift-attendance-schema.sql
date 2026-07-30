-- Append-only shift / attendance ledger (operations; not clinical)

CREATE TABLE IF NOT EXISTS siya_shift_attendance_events (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  event_type VARCHAR(32) NOT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'staff_ui',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_attendance_user_time ON siya_shift_attendance_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shift_attendance_created ON siya_shift_attendance_events(created_at DESC);
