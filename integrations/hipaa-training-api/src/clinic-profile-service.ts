/**
 * Per-user clinic letterhead profile for prescription-generator.
 * One profile per hipaa_training_users row (near-term; not multi-clinic).
 */

import type pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type ClinicProfile = {
  clinicName: string;
  doctorName: string;
  degree: string;
  regNo: string;
  clinicContact: string;
  clinicAddress: string;
  logoDataUrl: string | null;
  signatureDataUrl: string | null;
  updatedAt: string | null;
};

const EMPTY_PROFILE: ClinicProfile = {
  clinicName: "",
  doctorName: "",
  degree: "",
  regNo: "",
  clinicContact: "",
  clinicAddress: "",
  logoDataUrl: null,
  signatureDataUrl: null,
  updatedAt: null,
};

const MAX_DATA_URL_CHARS = 1_800_000; // keep under ~2MB JSON payloads

function rowToProfile(row: Record<string, unknown> | undefined): ClinicProfile {
  if (!row) return { ...EMPTY_PROFILE };
  return {
    clinicName: String(row.clinic_name ?? ""),
    doctorName: String(row.doctor_name ?? ""),
    degree: String(row.degree ?? ""),
    regNo: String(row.reg_no ?? ""),
    clinicContact: String(row.clinic_contact ?? ""),
    clinicAddress: String(row.clinic_address ?? ""),
    logoDataUrl: typeof row.logo_data_url === "string" ? row.logo_data_url : null,
    signatureDataUrl: typeof row.signature_data_url === "string" ? row.signature_data_url : null,
    updatedAt: row.updated_at ? new Date(row.updated_at as string).toISOString() : null,
  };
}

function assertDataUrl(label: string, value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error(`${label} must be a string`);
  if (!value.startsWith("data:image/")) {
    throw new Error(`${label} must be a data:image/... URL`);
  }
  if (value.length > MAX_DATA_URL_CHARS) {
    throw new Error(`${label} is too large (max ~1.5MB). Use a smaller PNG/JPEG.`);
  }
  return value;
}

export async function ensureClinicProfileTables(pool: pg.Pool): Promise<void> {
  try {
    const schemaPath = join(__dirname, "database", "clinic-profile-schema.sql");
    const sql = readFileSync(schemaPath, "utf8");
    await pool.query(sql);
  } catch {
    await pool.query(`
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
    `);
  }
}

export async function getClinicProfile(pool: pg.Pool, userId: string): Promise<ClinicProfile> {
  await ensureClinicProfileTables(pool);
  const r = await pool.query(`SELECT * FROM prescription_clinic_profiles WHERE user_id = $1`, [userId]);
  return rowToProfile(r.rows[0] as Record<string, unknown> | undefined);
}

export type ClinicProfileUpsert = {
  clinicName?: string;
  doctorName?: string;
  degree?: string;
  regNo?: string;
  clinicContact?: string;
  clinicAddress?: string;
  logoDataUrl?: string | null;
  signatureDataUrl?: string | null;
  /** When true, clear logo even if logoDataUrl is omitted */
  clearLogo?: boolean;
  clearSignature?: boolean;
};

export async function upsertClinicProfile(
  pool: pg.Pool,
  userId: string,
  input: ClinicProfileUpsert,
): Promise<ClinicProfile> {
  await ensureClinicProfileTables(pool);
  const existing = await getClinicProfile(pool, userId);

  const clinicName = input.clinicName != null ? String(input.clinicName).trim() : existing.clinicName;
  const doctorName = input.doctorName != null ? String(input.doctorName).trim() : existing.doctorName;
  const degree = input.degree != null ? String(input.degree).trim() : existing.degree;
  const regNo = input.regNo != null ? String(input.regNo).trim() : existing.regNo;
  const clinicContact = input.clinicContact != null ? String(input.clinicContact).trim() : existing.clinicContact;
  const clinicAddress = input.clinicAddress != null ? String(input.clinicAddress).trim() : existing.clinicAddress;

  let logoDataUrl = existing.logoDataUrl;
  if (input.clearLogo) logoDataUrl = null;
  else if (input.logoDataUrl !== undefined) logoDataUrl = assertDataUrl("logoDataUrl", input.logoDataUrl);

  let signatureDataUrl = existing.signatureDataUrl;
  if (input.clearSignature) signatureDataUrl = null;
  else if (input.signatureDataUrl !== undefined) {
    signatureDataUrl = assertDataUrl("signatureDataUrl", input.signatureDataUrl);
  }

  await pool.query(
    `INSERT INTO prescription_clinic_profiles
      (user_id, clinic_name, doctor_name, degree, reg_no, clinic_contact, clinic_address, logo_data_url, signature_data_url, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       clinic_name = EXCLUDED.clinic_name,
       doctor_name = EXCLUDED.doctor_name,
       degree = EXCLUDED.degree,
       reg_no = EXCLUDED.reg_no,
       clinic_contact = EXCLUDED.clinic_contact,
       clinic_address = EXCLUDED.clinic_address,
       logo_data_url = EXCLUDED.logo_data_url,
       signature_data_url = EXCLUDED.signature_data_url,
       updated_at = NOW()`,
    [userId, clinicName, doctorName, degree, regNo, clinicContact, clinicAddress, logoDataUrl, signatureDataUrl],
  );

  return getClinicProfile(pool, userId);
}
