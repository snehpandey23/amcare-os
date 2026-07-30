-- Daily Tasks & SOP checklists (operational; not Knowledge-layer SOPs)

CREATE TABLE IF NOT EXISTS siya_sop_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  recurrence VARCHAR(32) NOT NULL,
  recurrence_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  assigned_to_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS siya_sop_templates_active ON siya_sop_templates(active);
CREATE INDEX IF NOT EXISTS siya_sop_templates_assignee ON siya_sop_templates(assigned_to_user_id);

CREATE TABLE IF NOT EXISTS siya_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  task_type VARCHAR(16) NOT NULL,
  source_sop_template_id TEXT REFERENCES siya_sop_templates(id) ON DELETE SET NULL,
  assignee_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'todo',
  priority VARCHAR(16) NOT NULL DEFAULT 'medium',
  due_date DATE NOT NULL,
  due_time TIME,
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES hipaa_training_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_tasks_assignee_due ON siya_tasks(assignee_id, due_date);
CREATE INDEX IF NOT EXISTS idx_siya_tasks_status ON siya_tasks(status, due_date);

CREATE TABLE IF NOT EXISTS siya_task_activity_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES siya_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  action VARCHAR(32) NOT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'system',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_task_activity_task ON siya_task_activity_logs(task_id, created_at DESC);

CREATE TABLE IF NOT EXISTS siya_sop_template_activity_logs (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES siya_sop_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  action VARCHAR(32) NOT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'api',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siya_template_activity ON siya_sop_template_activity_logs(template_id, created_at DESC);
