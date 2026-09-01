/**
 * Website callback requests from Siya Guide — validate, rate-limit, persist.
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
let ensured = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WebsiteCallbackInput = {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  sourceUrl?: string | null;
  honeypot?: string | null;
  consent?: boolean;
};

export type WebsiteCallbackRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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

export function validateWebsiteCallbackInput(
  raw: unknown,
): { ok: true; data: WebsiteCallbackInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid request body." };
  const body = raw as Record<string, unknown>;

  if (trim(body.website, 200)) {
    return { ok: false, error: "Unable to submit request." };
  }

  const name = trim(body.name, 120);
  const email = trim(body.email, 254).toLowerCase();
  const phone = trim(body.phone, 40) || null;
  const message = trim(body.message, 2000) || null;
  const sourceUrl = trim(body.sourceUrl ?? body.source_url, 500) || null;
  const consent = body.consent === true || body.consent === "true" || body.consent === "on";

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "A valid email is required." };
  if (!consent) return { ok: false, error: "Please confirm we may contact you." };

  return { ok: true, data: { name, email, phone, message, sourceUrl, consent } };
}

export async function ensureWebsiteCallbackTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "website-callback-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

export async function countRecentWebsiteCallbacks(
  pool: pg.Pool,
  opts: { clientIp?: string | null; email: string },
): Promise<number> {
  const res = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM siya_website_callback_requests
     WHERE created_at > NOW() - INTERVAL '1 hour'
       AND (email = $1 OR ($2::text IS NOT NULL AND client_ip = $2))`,
    [opts.email, opts.clientIp || null],
  );
  return parseInt(res.rows[0]?.count || "0", 10);
}

function rowToRecord(row: Record<string, unknown>): WebsiteCallbackRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : null,
    message: row.message ? String(row.message) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    clientIp: row.client_ip ? String(row.client_ip) : null,
    userAgent: row.user_agent ? String(row.user_agent) : null,
    emailSent: Boolean(row.email_sent),
    resendId: row.resend_id ? String(row.resend_id) : null,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function insertWebsiteCallback(
  pool: pg.Pool,
  input: WebsiteCallbackInput,
  meta: { clientIp?: string | null; userAgent?: string | null },
): Promise<WebsiteCallbackRecord> {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO siya_website_callback_requests (
      id, name, email, phone, message, source_url, client_ip, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      id,
      input.name,
      input.email,
      input.phone,
      input.message,
      input.sourceUrl,
      meta.clientIp || null,
      meta.userAgent ? meta.userAgent.slice(0, 500) : null,
    ],
  );
  return rowToRecord(res.rows[0] as Record<string, unknown>);
}

export async function markWebsiteCallbackEmailSent(
  pool: pg.Pool,
  id: string,
  resendId?: string | null,
): Promise<void> {
  await pool.query(
    `UPDATE siya_website_callback_requests SET email_sent = TRUE, resend_id = $2 WHERE id = $1`,
    [id, resendId || null],
  );
}
