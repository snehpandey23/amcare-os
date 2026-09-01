-- Peer / lead Feedback Friday (staff portal).
-- giver_user_id is INTERNAL ONLY — never return it on recipient or normal admin inbox views.

CREATE TABLE IF NOT EXISTS siya_team_feedback (
  id TEXT PRIMARY KEY,
  recipient_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  giver_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  target_kind VARCHAR(16) NOT NULL,
  body TEXT NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  -- Snapshot only when anonymous = false; never stored for anonymous rows.
  revealed_display_name TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'delivered',
  reject_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (target_kind IN ('peer', 'lead')),
  CHECK (status IN ('delivered', 'rejected', 'flagged')),
  CHECK (
    (anonymous = TRUE AND revealed_display_name IS NULL)
    OR (anonymous = FALSE AND revealed_display_name IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_siya_team_feedback_recipient
  ON siya_team_feedback(recipient_user_id, created_at DESC)
  WHERE status = 'delivered';

CREATE INDEX IF NOT EXISTS idx_siya_team_feedback_giver
  ON siya_team_feedback(giver_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_siya_team_feedback_flagged
  ON siya_team_feedback(status, created_at DESC)
  WHERE status IN ('flagged', 'rejected');
