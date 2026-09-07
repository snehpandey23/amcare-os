-- Employee of the month nominations (staff portal Feedback).
-- Named nominations only — used for culture recognition + ₹5k gift voucher.

CREATE TABLE IF NOT EXISTS siya_eom_nominations (
  id TEXT PRIMARY KEY,
  month_key VARCHAR(7) NOT NULL,
  nominator_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  nominee_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (month_key, nominator_user_id, nominee_user_id),
  CHECK (char_length(month_key) = 7),
  CHECK (char_length(reason) >= 12)
);

CREATE INDEX IF NOT EXISTS idx_siya_eom_nominations_month
  ON siya_eom_nominations(month_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_siya_eom_nominations_nominator
  ON siya_eom_nominations(nominator_user_id, month_key);

-- Email nudge sends (20th / 25th IST) — one per user per calendar day.
CREATE TABLE IF NOT EXISTS siya_eom_nudge_sends (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  send_date DATE NOT NULL,
  month_key VARCHAR(7) NOT NULL,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, send_date),
  CHECK (char_length(month_key) = 7)
);

CREATE INDEX IF NOT EXISTS idx_siya_eom_nudge_sends_date
  ON siya_eom_nudge_sends(send_date);
