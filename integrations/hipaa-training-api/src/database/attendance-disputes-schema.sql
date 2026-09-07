-- Attendance day disputes (hours reporting accuracy — not payroll/wage)

CREATE TABLE IF NOT EXISTS siya_attendance_day_disputes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL,
  staff_note TEXT,
  resolution_note TEXT,
  corrected_working_minutes INTEGER,
  corrected_break_minutes INTEGER,
  corrected_focus_minutes INTEGER,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attendance_day_dispute UNIQUE (user_id, attendance_date),
  CONSTRAINT chk_attendance_dispute_status CHECK (
    status IN ('under_review', 'resolved_stands', 'resolved_corrected')
  )
);

CREATE INDEX IF NOT EXISTS idx_attendance_disputes_status
  ON siya_attendance_day_disputes(status, attendance_date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_disputes_user
  ON siya_attendance_day_disputes(user_id, attendance_date DESC);
