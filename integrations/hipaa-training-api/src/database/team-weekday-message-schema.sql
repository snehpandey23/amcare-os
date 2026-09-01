-- Weekday team message send log (Mon–Fri Resend). One row per user per IST send_date + theme.

CREATE TABLE IF NOT EXISTS siya_weekday_message_sends (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  send_date DATE NOT NULL,
  theme VARCHAR(32) NOT NULL,
  segment VARCHAR(32) NOT NULL,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, send_date, theme)
);

CREATE INDEX IF NOT EXISTS idx_siya_weekday_message_sends_date
  ON siya_weekday_message_sends(send_date DESC, theme);
