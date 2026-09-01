/**
 * PostgreSQL for HIPAA training users and progress.
 */

import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool | null {
  if (pool != null) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  pool = new pg.Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  return pool;
}

export async function initDb(): Promise<void> {
  const p = getPool();
  if (!p) return;
  try {
    const schemaPath = join(__dirname, "database", "schema.sql");
    const sql = readFileSync(schemaPath, "utf8");
    await p.query(sql);
    await p.query(
      `ALTER TABLE hipaa_training_progress ADD COLUMN IF NOT EXISTS level_up_json JSONB NOT NULL DEFAULT '{}'::jsonb`,
    );
    await p.query(
      `ALTER TABLE hipaa_training_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP`,
    );
    await p.query(
      `ALTER TABLE hipaa_training_progress ADD COLUMN IF NOT EXISTS profile_json JSONB NOT NULL DEFAULT '{}'::jsonb`,
    );
    await p.query(
      `ALTER TABLE hipaa_training_progress ADD COLUMN IF NOT EXISTS shift_json JSONB NOT NULL DEFAULT '{}'::jsonb`,
    );
    await p.query(`ALTER TABLE hipaa_training_users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ`);
    const { ensureKnowledgeTables } = await import("./knowledge-service.js");
    await ensureKnowledgeTables(p);
    const { ensureClinicProfileTables } = await import("./clinic-profile-service.js");
    await ensureClinicProfileTables(p);
    const { ensureShiftRosterTables } = await import("./shift-roster-service.js");
    await ensureShiftRosterTables(p);
    const { ensureEmployerInquiryTables } = await import("./employer-inquiry-service.js");
    await ensureEmployerInquiryTables(p);
    const { ensureSiyaCircleSignupTables } = await import("./siya-circle-signup-service.js");
    await ensureSiyaCircleSignupTables(p);
    const { ensureWebsiteCallbackTables } = await import("./website-callback-service.js");
    await ensureWebsiteCallbackTables(p);
    const { ensureProviderCareersTables } = await import("./provider-careers-service.js");
    await ensureProviderCareersTables(p);
  } catch (err) {
    console.warn("[hipaa-training-api] schema file read failed, using inline DDL:", err);
    const sql = `
      CREATE TABLE IF NOT EXISTS hipaa_training_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'trainee',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_hipaa_training_users_email ON hipaa_training_users(email);
      CREATE TABLE IF NOT EXISTS hipaa_training_progress (
        user_id UUID PRIMARY KEY REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
        course_version VARCHAR(64) NOT NULL,
        progress_json JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await p.query(sql);
  }
}
