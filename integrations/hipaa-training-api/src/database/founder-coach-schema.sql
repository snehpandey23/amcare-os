-- Founder Decision Coach Phase 1 — monthly plan, weekly brief, manual actuals

CREATE TABLE IF NOT EXISTS founder_monthly_plans (
  id TEXT PRIMARY KEY,
  month_key VARCHAR(7) NOT NULL UNIQUE,
  north_star TEXT NOT NULL DEFAULT '',
  time_budget JSONB NOT NULL DEFAULT '{"clinical":25,"usFundraising":25,"indiaAmcare":25,"other":25}'::jsonb,
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  not_doing JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founder_weekly_plans (
  id TEXT PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  month_key VARCHAR(7),
  founder_focus TEXT NOT NULL DEFAULT '',
  can_wait JSONB NOT NULL DEFAULT '[]'::jsonb,
  delegate JSONB NOT NULL DEFAULT '[]'::jsonb,
  observe_only JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Phase 2: free-text priorities + lock snapshot
  priorities_raw TEXT NOT NULL DEFAULT '',
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  locked_snapshot JSONB,
  updated_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent upgrades for existing Phase 1 tables
ALTER TABLE founder_weekly_plans ADD COLUMN IF NOT EXISTS priorities_raw TEXT NOT NULL DEFAULT '';
ALTER TABLE founder_weekly_plans ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE founder_weekly_plans ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL;
ALTER TABLE founder_weekly_plans ADD COLUMN IF NOT EXISTS locked_snapshot JSONB;

CREATE TABLE IF NOT EXISTS founder_weekly_actuals (
  id TEXT PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  ads_tx_cpa NUMERIC,
  ads_tx_conversions INTEGER,
  ads_campaign_edits INTEGER NOT NULL DEFAULT 0,
  india_grants_identified INTEGER,
  india_applications_submitted INTEGER,
  us_intro_contacted INTEGER,
  us_intro_replied INTEGER,
  us_intro_meetings INTEGER,
  notes TEXT,
  updated_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founder_observe_events (
  id TEXT PRIMARY KEY,
  week_start DATE NOT NULL,
  observe_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_observe_week ON founder_observe_events(week_start, created_at DESC);
