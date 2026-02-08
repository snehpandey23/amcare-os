-- HIPAA-Compliant Audit Logs Table
-- All access to patient data is logged here

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- User Information
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_role VARCHAR(100),
  
  -- Action Information
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  resource_name VARCHAR(255),
  
  -- Patient Information (if applicable)
  patient_id VARCHAR(255),
  patient_name VARCHAR(255),
  
  -- Request Information
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path TEXT,
  request_body JSONB,
  response_status INTEGER,
  
  -- Change Tracking
  changes JSONB,
  metadata JSONB,
  
  -- Severity and Status
  severity VARCHAR(20) NOT NULL DEFAULT 'low',
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  -- Session and Location
  session_id VARCHAR(255),
  location VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries

-- Primary query: Patient access history
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_id ON audit_logs(patient_id, timestamp DESC);

-- User activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, timestamp DESC);

-- Action type queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type, timestamp DESC);

-- Resource type queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type, timestamp DESC);

-- Severity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity, timestamp DESC);

-- Time range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Compound index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_action ON audit_logs(patient_id, action_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date_range ON audit_logs(timestamp, resource_type, action_type);

-- Failed actions
CREATE INDEX IF NOT EXISTS idx_audit_logs_failed ON audit_logs(success, timestamp DESC) WHERE success = false;

-- Critical actions
CREATE INDEX IF NOT EXISTS idx_audit_logs_critical ON audit_logs(severity, timestamp DESC) WHERE severity = 'critical';

-- IP address tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address, timestamp DESC);

-- Session tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_session ON audit_logs(session_id, timestamp DESC);

-- Text search on description
CREATE INDEX IF NOT EXISTS idx_audit_logs_description_search ON audit_logs USING gin(to_tsvector('english', description));

-- Partitioning by month for large datasets (optional, for PostgreSQL 10+)
-- CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- View for common queries
CREATE OR REPLACE VIEW patient_access_summary AS
SELECT 
  patient_id,
  patient_name,
  COUNT(*) as total_accesses,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(timestamp) as first_access,
  MAX(timestamp) as last_access,
  COUNT(*) FILTER (WHERE action_type = 'patient_view') as view_count,
  COUNT(*) FILTER (WHERE action_type = 'patient_update') as update_count,
  COUNT(*) FILTER (WHERE action_type = 'patient_export') as export_count
FROM audit_logs
WHERE patient_id IS NOT NULL
GROUP BY patient_id, patient_name;

-- View for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  user_id,
  user_name,
  user_email,
  user_role,
  COUNT(*) as total_actions,
  COUNT(DISTINCT patient_id) as patients_accessed,
  MIN(timestamp) as first_action,
  MAX(timestamp) as last_action,
  COUNT(*) FILTER (WHERE success = false) as failed_actions
FROM audit_logs
WHERE user_id IS NOT NULL
GROUP BY user_id, user_name, user_email, user_role;

-- Function to get patient access history
CREATE OR REPLACE FUNCTION get_patient_access_history(
  p_patient_id VARCHAR(255),
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMP,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  action_type VARCHAR(100),
  description TEXT,
  ip_address INET,
  severity VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.timestamp,
    al.user_id,
    al.user_name,
    al.action_type,
    al.description,
    al.ip_address,
    al.severity
  FROM audit_logs al
  WHERE al.patient_id = p_patient_id
  ORDER BY al.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to check for suspicious activity
CREATE OR REPLACE FUNCTION check_suspicious_activity(
  p_user_id VARCHAR(255),
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  activity_type VARCHAR(100),
  count BIGINT,
  severity VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.action_type as activity_type,
    COUNT(*) as count,
    al.severity
  FROM audit_logs al
  WHERE al.user_id = p_user_id
    AND al.timestamp >= NOW() - (p_hours || ' hours')::INTERVAL
    AND al.severity IN ('high', 'critical')
  GROUP BY al.action_type, al.severity
  HAVING COUNT(*) > 10
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent deletion (immutability)
CREATE OR REPLACE FUNCTION prevent_audit_log_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be deleted for HIPAA compliance';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_deletion();

-- Trigger to prevent updates (immutability)
CREATE OR REPLACE FUNCTION prevent_audit_log_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.id != NEW.id OR OLD.timestamp != NEW.timestamp OR OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'Audit logs cannot be modified for HIPAA compliance';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_updates();
