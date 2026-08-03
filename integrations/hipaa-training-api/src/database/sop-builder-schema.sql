-- AI-assisted operational SOP builder (siya_sop_templates) + checklist feedback

CREATE TABLE IF NOT EXISTS sop_builder_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  transcript_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_material_refs JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft_json JSONB,
  status VARCHAR(24) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sop_builder_sessions_user ON sop_builder_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sop_builder_sessions_status ON sop_builder_sessions(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS sop_feedback (
  id TEXT PRIMARY KEY,
  sop_template_id TEXT NOT NULL REFERENCES siya_sop_templates(id) ON DELETE CASCADE,
  checklist_item_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sop_feedback_template ON sop_feedback(sop_template_id, resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sop_feedback_unresolved ON sop_feedback(resolved, created_at DESC) WHERE resolved = FALSE;
