/**
 * Provider careers inquiries — validate, rate-limit, persist.
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
let ensured = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ProviderCareersInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  credential: string;
  licensedStates?: string | null;
  message?: string | null;
  sourceUrl?: string | null;
  honeypot?: string | null;
  consent?: boolean;
};

export type ProviderCareersRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  credential: string;
  licensedStates: string | null;
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

export function validateProviderCareersInput(
  raw: unknown,
): { ok: true; data: ProviderCareersInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid request body." };
  const body = raw as Record<string, unknown>;

  if (trim(body.website, 200)) {
    return { ok: false, error: "Unable to submit inquiry." };
  }

  const fullName = trim(body.fullName ?? body.full_name, 120);
  const email = trim(body.email, 254).toLowerCase();
  const phone = trim(body.phone, 40) || null;
  const credential = trim(body.credential, 40);
  const licensedStates = trim(body.licensedStates ?? body.licensed_states, 120) || null;
  const message = trim(body.message, 4000) || null;
  const sourceUrl = trim(body.sourceUrl ?? body.source_url, 500) || null;
  const consent = body.consent === true || body.consent === "true" || body.consent === "on";

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "A valid email is required." };
  if (!credential) return { ok: false, error: "Credential / role is required." };
  if (!consent) return { ok: false, error: "Please confirm you agree to be contacted about opportunities." };

  return {
    ok: true,
    data: { fullName, email, phone, credential, licensedStates, message, sourceUrl, consent },
  };
}

export async function ensureProviderCareersTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "provider-careers-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

export async function countRecentProviderCareersInquiries(
  pool: pg.Pool,
  opts: { clientIp?: string | null; email: string },
): Promise<number> {
  const res = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM siya_provider_careers_inquiries
     WHERE created_at > NOW() - INTERVAL '1 hour'
       AND (email = $1 OR ($2::text IS NOT NULL AND client_ip = $2))`,
    [opts.email, opts.clientIp || null],
  );
  return parseInt(res.rows[0]?.count || "0", 10);
}

function rowToRecord(row: Record<string, unknown>): ProviderCareersRecord {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : null,
    credential: String(row.credential),
    licensedStates: row.licensed_states ? String(row.licensed_states) : null,
    message: row.message ? String(row.message) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    clientIp: row.client_ip ? String(row.client_ip) : null,
    userAgent: row.user_agent ? String(row.user_agent) : null,
    emailSent: Boolean(row.email_sent),
    resendId: row.resend_id ? String(row.resend_id) : null,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function insertProviderCareersInquiry(
  pool: pg.Pool,
  input: ProviderCareersInput,
  meta: { clientIp?: string | null; userAgent?: string | null },
): Promise<ProviderCareersRecord> {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO siya_provider_careers_inquiries (
      id, full_name, email, phone, credential, licensed_states, message,
      source_url, client_ip, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      id,
      input.fullName,
      input.email,
      input.phone,
      input.credential,
      input.licensedStates,
      input.message,
      input.sourceUrl,
      meta.clientIp || null,
      meta.userAgent ? meta.userAgent.slice(0, 500) : null,
    ],
  );
  return rowToRecord(res.rows[0] as Record<string, unknown>);
}

export async function markProviderCareersEmailSent(
  pool: pg.Pool,
  id: string,
  resendId?: string | null,
): Promise<void> {
  await pool.query(
    `UPDATE siya_provider_careers_inquiries SET email_sent = TRUE, resend_id = $2 WHERE id = $1`,
    [id, resendId || null],
  );
}
