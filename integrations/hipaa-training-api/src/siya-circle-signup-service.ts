/**
 * Siya Circle newsletter signup — validate, rate-limit, persist.
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
let ensured = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SiyaCircleSignupInput = {
  firstName: string;
  email: string;
  topics?: string | null;
  sourceUrl?: string | null;
  honeypot?: string | null;
  consent?: boolean;
};

export type SiyaCircleSignupRecord = {
  id: string;
  firstName: string;
  email: string;
  topics: string | null;
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

export function validateSiyaCircleSignupInput(
  raw: unknown,
): { ok: true; data: SiyaCircleSignupInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid request body." };
  const body = raw as Record<string, unknown>;

  if (trim(body.website, 200)) {
    return { ok: false, error: "Unable to submit signup." };
  }

  const firstName = trim(body.firstName ?? body.first_name, 80);
  const email = trim(body.email, 254).toLowerCase();
  let topics: string | null = null;
  if (Array.isArray(body.topics)) {
    topics = body.topics.map((t) => trim(t, 40)).filter(Boolean).join(", ") || null;
  } else {
    topics = trim(body.topics, 200) || null;
  }
  const sourceUrl = trim(body.sourceUrl ?? body.source_url, 500) || null;
  const consent = body.consent === true || body.consent === "true" || body.consent === "on";

  if (!firstName) return { ok: false, error: "First name is required." };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "A valid email is required." };
  if (!consent) return { ok: false, error: "Please confirm you agree to receive Siya Circle emails." };

  return { ok: true, data: { firstName, email, topics, sourceUrl, consent } };
}

export async function ensureSiyaCircleSignupTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "siya-circle-signup-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

export async function countRecentSiyaCircleSignups(
  pool: pg.Pool,
  opts: { clientIp?: string | null; email: string },
): Promise<number> {
  const res = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM siya_circle_signups
     WHERE created_at > NOW() - INTERVAL '1 hour'
       AND (email = $1 OR ($2::text IS NOT NULL AND client_ip = $2))`,
    [opts.email, opts.clientIp || null],
  );
  return parseInt(res.rows[0]?.count || "0", 10);
}

function rowToRecord(row: Record<string, unknown>): SiyaCircleSignupRecord {
  return {
    id: String(row.id),
    firstName: String(row.first_name),
    email: String(row.email),
    topics: row.topics ? String(row.topics) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    clientIp: row.client_ip ? String(row.client_ip) : null,
    userAgent: row.user_agent ? String(row.user_agent) : null,
    emailSent: Boolean(row.email_sent),
    resendId: row.resend_id ? String(row.resend_id) : null,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function insertSiyaCircleSignup(
  pool: pg.Pool,
  input: SiyaCircleSignupInput,
  meta: { clientIp?: string | null; userAgent?: string | null },
): Promise<SiyaCircleSignupRecord> {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO siya_circle_signups (
      id, first_name, email, topics, source_url, client_ip, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
    [
      id,
      input.firstName,
      input.email,
      input.topics,
      input.sourceUrl,
      meta.clientIp || null,
      meta.userAgent ? meta.userAgent.slice(0, 500) : null,
    ],
  );
  return rowToRecord(res.rows[0] as Record<string, unknown>);
}

export async function markSiyaCircleSignupEmailSent(
  pool: pg.Pool,
  id: string,
  resendId?: string | null,
): Promise<void> {
  await pool.query(
    `UPDATE siya_circle_signups SET email_sent = TRUE, resend_id = $2 WHERE id = $1`,
    [id, resendId || null],
  );
}
