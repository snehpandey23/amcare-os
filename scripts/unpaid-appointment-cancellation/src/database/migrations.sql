-- Database tables for unpaid appointment cancellation tracking

-- Table for tracking script execution results
CREATE TABLE IF NOT EXISTS unpaid_appointment_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  appointments_checked INTEGER NOT NULL DEFAULT 0,
  unpaid_found INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_failed INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT false,
  duration_ms INTEGER NOT NULL,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying by timestamp
CREATE INDEX IF NOT EXISTS idx_unpaid_checks_timestamp ON unpaid_appointment_checks(timestamp DESC);

-- Index for querying by success status
CREATE INDEX IF NOT EXISTS idx_unpaid_checks_success ON unpaid_appointment_checks(success, timestamp DESC);

-- Table for tracking cancellation messages
CREATE TABLE IF NOT EXISTS cancellation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id VARCHAR(255) NOT NULL,
  patient_id VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  contact_method VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for cancellation messages
CREATE INDEX IF NOT EXISTS idx_cancellation_messages_appointment ON cancellation_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_messages_patient ON cancellation_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_messages_status ON cancellation_messages(status, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_cancellation_messages_sent_at ON cancellation_messages(sent_at DESC);

-- Table for tracking unpaid appointments
CREATE TABLE IF NOT EXISTS unpaid_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id VARCHAR(255) UNIQUE NOT NULL,
  zoho_record_id VARCHAR(255),
  patient_id VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  payment_status VARCHAR(50) NOT NULL,
  days_until_appointment INTEGER,
  found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for unpaid appointments
CREATE INDEX IF NOT EXISTS idx_unpaid_appointments_patient ON unpaid_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_unpaid_appointments_date ON unpaid_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_unpaid_appointments_status ON unpaid_appointments(payment_status, appointment_date);
CREATE INDEX IF NOT EXISTS idx_unpaid_appointments_zoho ON unpaid_appointments(zoho_record_id);
CREATE INDEX IF NOT EXISTS idx_unpaid_appointments_resolved ON unpaid_appointments(resolved_at) WHERE resolved_at IS NULL;
