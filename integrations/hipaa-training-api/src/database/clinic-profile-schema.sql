-- Per-user clinic letterhead for apps/prescription-generator
CREATE TABLE IF NOT EXISTS prescription_clinic_profiles (
  user_id UUID PRIMARY KEY REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  clinic_name VARCHAR(255) NOT NULL DEFAULT '',
  doctor_name VARCHAR(255) NOT NULL DEFAULT '',
  degree VARCHAR(255) NOT NULL DEFAULT '',
  reg_no VARCHAR(128) NOT NULL DEFAULT '',
  clinic_contact VARCHAR(64) NOT NULL DEFAULT '',
  clinic_address TEXT NOT NULL DEFAULT '',
  logo_data_url TEXT,
  signature_data_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
