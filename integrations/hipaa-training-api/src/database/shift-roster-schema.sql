-- MA shift roster (scheduled shifts). Times stored as timestamptz; source timezone is IST.

CREATE TABLE IF NOT EXISTS shift_roster (
  id TEXT PRIMARY KEY,
  roster_date DATE NOT NULL,
  person_key TEXT NOT NULL,
  user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  shift_start TIMESTAMPTZ,
  shift_end TIMESTAMPTZ,
  shift_label TEXT,
  raw_cell TEXT NOT NULL,
  is_off BOOLEAN NOT NULL DEFAULT FALSE,
  source_file TEXT,
  source_sheet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_roster_date ON shift_roster(roster_date);
CREATE INDEX IF NOT EXISTS idx_shift_roster_user_date ON shift_roster(user_id, roster_date);
CREATE INDEX IF NOT EXISTS idx_shift_roster_start ON shift_roster(shift_start)
  WHERE is_off = FALSE AND shift_start IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_shift_roster_slot
  ON shift_roster (roster_date, person_key, COALESCE(shift_label, ''), COALESCE(shift_start, 'epoch'::timestamptz));

CREATE TABLE IF NOT EXISTS shift_roster_reminder_sends (
  id TEXT PRIMARY KEY,
  roster_row_id TEXT NOT NULL REFERENCES shift_roster(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  send_bucket TEXT NOT NULL,
  resend_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (roster_row_id, send_bucket)
);
