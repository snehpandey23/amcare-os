-- Webhook Logs Table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'received',
  task_id UUID,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0
);

-- Indexes for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Appointments Table (if not exists)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_record_id VARCHAR(255) UNIQUE,
  patient_id VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255),
  patient_phone VARCHAR(50),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255),
  provider_name VARCHAR(255),
  appointment_type VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table (if not exists)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_record_id VARCHAR(255) UNIQUE,
  invoice_id VARCHAR(255),
  patient_id VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  payment_date DATE,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient Intake Forms Table (if not exists)
CREATE TABLE IF NOT EXISTS patient_intake_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_record_id VARCHAR(255) UNIQUE,
  patient_id VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255),
  submission_date TIMESTAMP NOT NULL,
  form_type VARCHAR(255) NOT NULL,
  form_data JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  appointment_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table (if not exists)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  patient_id VARCHAR(255),
  patient_name VARCHAR(255),
  appointment_id UUID,
  payment_id UUID,
  form_id UUID,
  zoho_record_id VARCHAR(255),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_zoho_record_id ON tasks(zoho_record_id);

-- Patients Table (if not exists, for intake data updates)
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(255) PRIMARY KEY,
  intake_data JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
