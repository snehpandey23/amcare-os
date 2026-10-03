-- Per-user admin/lead observer notification preferences (default ON when absent).
CREATE TABLE IF NOT EXISTS siya_notification_prefs (
  user_id UUID PRIMARY KEY REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  prefs_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
