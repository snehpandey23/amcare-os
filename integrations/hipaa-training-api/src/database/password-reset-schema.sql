-- Password reset tokens + rate-limit audit (self-service forgot password)
CREATE TABLE IF NOT EXISTS hipaa_password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_ip VARCHAR(64),
  resend_id VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_hipaa_password_reset_user
  ON hipaa_password_reset_tokens (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hipaa_password_reset_expires
  ON hipaa_password_reset_tokens (expires_at)
  WHERE used_at IS NULL;

CREATE TABLE IF NOT EXISTS hipaa_password_reset_rate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized VARCHAR(255) NOT NULL,
  request_ip VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hipaa_password_reset_rate_email
  ON hipaa_password_reset_rate (email_normalized, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hipaa_password_reset_rate_ip
  ON hipaa_password_reset_rate (request_ip, created_at DESC);
