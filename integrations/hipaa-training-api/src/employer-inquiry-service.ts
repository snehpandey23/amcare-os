/**
 * Employer B2B partnership inquiries — validate, rate-limit, persist.
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
let ensured = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = {
  companyName: 200,
  contactName: 120,
  email: 254,
  phone: 40,
  employeeCount: 40,
  states: 120,
  message: 4000,
  sourceUrl: 500,
  userAgent: 500,
};

export type EmployerInquiryInput = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  employeeCount?: string | null;
  states?: string | null;
  message?: string | null;
  sourceUrl?: string | null;
  honeypot?: string | null;
  consent?: boolean;
};

export type EmployerInquiryRecord = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  employeeCount: string | null;
  states: string | null;
  message: string | null;
  sourceUrl: string | null;
  clientIp: string | null;
  userAgent: string | null;
  emailSent: boolean;
  resendId: string | null;
  createdAt: string;
};

function trim(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function validateEmployerInquiryInput(raw: unknown): { ok: true; data: EmployerInquiryInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid request body." };
  const body = raw as Record<string, unknown>;

  if (trim(body.website, 200)) {
    return { ok: false, error: "Unable to submit inquiry." };
  }

  const companyName = trim(body.companyName ?? body.company_name, MAX.companyName);
  const contactName = trim(body.contactName ?? body.contact_name, MAX.contactName);
  const email = trim(body.email, MAX.email).toLowerCase();
  const phone = trim(body.phone, MAX.phone) || null;
  const employeeCount = trim(body.employeeCount ?? body.employee_count, MAX.employeeCount) || null;
  const states = trim(body.states, MAX.states) || null;
  const message = trim(body.message, MAX.message) || null;
  const sourceUrl = trim(body.sourceUrl ?? body.source_url, MAX.sourceUrl) || null;
  const consent = body.consent === true || body.consent === "true" || body.consent === "on";

  if (!companyName) return { ok: false, error: "Company name is required." };
  if (!contactName) return { ok: false, error: "Contact name is required." };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "A valid work email is required." };
  if (!consent) return { ok: false, error: "Please confirm you agree to be contacted about partnership options." };

  return {
    ok: true,
    data: { companyName, contactName, email, phone, employeeCount, states, message, sourceUrl, consent },
  };
}

export async function ensureEmployerInquiryTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "employer-inquiry-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

export async function countRecentEmployerInquiries(
  pool: pg.Pool,
  opts: { clientIp?: string | null; email: string },
): Promise<number> {
  const res = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM siya_employer_inquiries
     WHERE created_at > NOW() - INTERVAL '1 hour'
       AND (email = $1 OR ($2::text IS NOT NULL AND client_ip = $2))`,
    [opts.email, opts.clientIp || null],
  );
  return parseInt(res.rows[0]?.count || "0", 10);
}

function rowToRecord(row: Record<string, unknown>): EmployerInquiryRecord {
  return {
    id: String(row.id),
    companyName: String(row.company_name),
    contactName: String(row.contact_name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : null,
    employeeCount: row.employee_count ? String(row.employee_count) : null,
    states: row.states ? String(row.states) : null,
    message: row.message ? String(row.message) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    clientIp: row.client_ip ? String(row.client_ip) : null,
    userAgent: row.user_agent ? String(row.user_agent) : null,
    emailSent: Boolean(row.email_sent),
    resendId: row.resend_id ? String(row.resend_id) : null,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function insertEmployerInquiry(
  pool: pg.Pool,
  input: EmployerInquiryInput,
  meta: { clientIp?: string | null; userAgent?: string | null },
): Promise<EmployerInquiryRecord> {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO siya_employer_inquiries (
      id, company_name, contact_name, email, phone, employee_count, states, message,
      source_url, client_ip, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      id,
      input.companyName,
      input.contactName,
      input.email,
      input.phone,
      input.employeeCount,
      input.states,
      input.message,
      input.sourceUrl,
      meta.clientIp || null,
      meta.userAgent ? meta.userAgent.slice(0, MAX.userAgent) : null,
    ],
  );
  return rowToRecord(res.rows[0] as Record<string, unknown>);
}

export async function markEmployerInquiryEmailSent(
  pool: pg.Pool,
  id: string,
  resendId?: string | null,
): Promise<void> {
  await pool.query(
    `UPDATE siya_employer_inquiries SET email_sent = TRUE, resend_id = $2 WHERE id = $1`,
    [id, resendId || null],
  );
}

export async function listEmployerInquiries(
  pool: pg.Pool,
  opts: { limit?: number; offset?: number } = {},
): Promise<EmployerInquiryRecord[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);
  const res = await pool.query(
    `SELECT * FROM siya_employer_inquiries ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return res.rows.map((row) => rowToRecord(row as Record<string, unknown>));
}
