-- Siya Health Build-Out Program tracker (Rebecca Master Tracker)
-- PLANNING / IN-PROGRESS — not approved knowledge.
-- Apply when DATABASE_URL is available:
--   psql "$DATABASE_URL" -f build-out-tracker-schema.sql
--   psql "$DATABASE_URL" -f ../../../../docs/siyaos-knowledge-base/build-out-program/build-out-tracker-seed.sql

CREATE TABLE IF NOT EXISTS siya_build_out_tracker_items (
  id TEXT PRIMARY KEY,
  workstream TEXT NOT NULL,
  sheet_row INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started',
  target_date DATE,
  notes TEXT,
  gap_class TEXT NOT NULL CHECK (gap_class IN ('Have it', 'Partial', 'Missing')),
  existing_ref TEXT,
  placeholder_path TEXT,
  audit_rationale TEXT,
  audit_method TEXT,
  audit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_build_out_tracker_workstream
  ON siya_build_out_tracker_items (workstream);
CREATE INDEX IF NOT EXISTS idx_build_out_tracker_gap
  ON siya_build_out_tracker_items (gap_class);
CREATE INDEX IF NOT EXISTS idx_build_out_tracker_priority
  ON siya_build_out_tracker_items (priority);
