-- Chat review log + shift handoff notes (operations coordination)

CREATE TABLE IF NOT EXISTS chat_reviews (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  patient_identifier TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  error_notes TEXT NOT NULL DEFAULT '',
  status VARCHAR(16) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chat_reviews_user_date ON chat_reviews(user_id, review_date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_reviews_status ON chat_reviews(status, review_date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_reviews_date ON chat_reviews(review_date DESC);

CREATE TABLE IF NOT EXISTS shift_handoffs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  shift_end_event_id TEXT REFERENCES siya_shift_attendance_events(id) ON DELETE SET NULL,
  handoff_date DATE NOT NULL,
  chats_handled_count INTEGER,
  pending_followups JSONB NOT NULL DEFAULT '[]'::jsonb,
  scheduled_items_today TEXT,
  general_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_handoffs_date ON shift_handoffs(handoff_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shift_handoffs_user ON shift_handoffs(user_id, created_at DESC);

ALTER TABLE shift_handoffs ADD COLUMN IF NOT EXISTS calls_made_count INTEGER;
ALTER TABLE shift_handoffs ADD COLUMN IF NOT EXISTS calls_received_count INTEGER;
