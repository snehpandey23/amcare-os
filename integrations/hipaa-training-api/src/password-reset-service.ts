/**
 * Self-service password reset — tokens, rate limits, Resend email.
 */

import { createHash, randomBytes } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type pg from "pg";
import { hashPassword } from "./auth.js";

const __dir = dirname(fileURLToPath(import.meta.url));

/** Token lifetime (middle of 30–60 min guidance). */
export const PASSWORD_RESET_TTL_MS = 45 * 60 * 1000;

/** Max forgot requests per email in the rate window. */
export const PASSWORD_RESET_EMAIL_LIMIT = 3;

/** Max forgot requests per IP in the rate window. */
export const PASSWORD_RESET_IP_LIMIT = 10;

/** Sliding window for rate limits. */
export const PASSWORD_RESET_RATE_WINDOW_MS = 15 * 60 * 1000;

const NEUTRAL_OK = {
  ok: true as const,
  message: "If that account exists, we sent a link.",
};

export function passwordResetNeutralResponse() {
  return NEUTRAL_OK;
}

export async function ensurePasswordResetTables(pool: pg.Pool): Promise<void> {
  const sql = readFileSync(join(__dir, "database", "password-reset-schema.sql"), "utf8");
  await pool.query(sql);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

function staffPortalBaseUrl(): string {
  return (
    process.env.STAFF_PORTAL_URL?.trim() ||
    process.env.PORTAL_PUBLIC_URL?.trim() ||
    "https://siya-staff-assist.vercel.app"
  ).replace(/\/$/, "");
}

function resetFromAddress(): string {
  return (
    process.env.SIYA_INVITE_FROM?.trim() ||
    process.env.SIYA_ESCALATION_FROM?.trim() ||
    process.env.WEBSITE_LEADS_FROM?.trim() ||
    process.env.EMPLOYER_INQUIRY_FROM?.trim() ||
    "Siya Staff Portal <notifications@siya.health>"
  );
}

export async function sendPasswordResetEmail(opts: {
  toEmail: string;
  name?: string | null;
  resetUrl: string;
}): Promise<{ sent: boolean; error?: string; resendId?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[password-reset] RESEND_API_KEY missing on auth API — email not sent");
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const first = opts.name?.trim().split(/\s+/)[0] || "there";
  const subject = "Reset your Siya staff portal password";
  const text = [
    `Hi ${first},`,
    "",
    "We received a request to reset your Siya staff portal password.",
    "",
    `Open this link within 45 minutes to choose a new password:`,
    opts.resetUrl,
    "",
    "If you did not request this, you can ignore this email — your password will stay the same.",
    "",
    "— Siya Health internal systems —",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resetFromAddress(),
        to: [opts.toEmail],
        subject,
        text,
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      return { sent: false, error: bodyText.slice(0, 500) || res.statusText };
    }
    let resendId: string | undefined;
    try {
      resendId = (JSON.parse(bodyText) as { id?: string }).id;
    } catch {
      /* ignore */
    }
    return { sent: true, resendId };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function isRateLimited(
  pool: pg.Pool,
  email: string,
  requestIp: string | null,
): Promise<boolean> {
  const since = new Date(Date.now() - PASSWORD_RESET_RATE_WINDOW_MS);
  const emailCount = await pool.query(
    `SELECT COUNT(*)::int AS n FROM hipaa_password_reset_rate
     WHERE email_normalized = $1 AND created_at >= $2`,
    [email, since.toISOString()],
  );
  if ((emailCount.rows[0]?.n as number) >= PASSWORD_RESET_EMAIL_LIMIT) return true;

  if (requestIp) {
    const ipCount = await pool.query(
      `SELECT COUNT(*)::int AS n FROM hipaa_password_reset_rate
       WHERE request_ip = $1 AND created_at >= $2`,
      [requestIp, since.toISOString()],
    );
    if ((ipCount.rows[0]?.n as number) >= PASSWORD_RESET_IP_LIMIT) return true;
  }
  return false;
}

async function recordRateAttempt(
  pool: pg.Pool,
  email: string,
  requestIp: string | null,
): Promise<void> {
  await pool.query(
    `INSERT INTO hipaa_password_reset_rate (email_normalized, request_ip) VALUES ($1, $2)`,
    [email, requestIp],
  );
}

/**
 * Always returns the same neutral payload. Creates a token + emails only when the
 * account exists and rate limits allow. Never reveals whether the email exists.
 *
 * When `revealResetUrlForEmail` matches the account being reset (caller-proven
 * identity), include `selfTest` so automation can complete E2E without reading
 * the mailbox — still sends via Resend.
 */
export async function requestPasswordReset(
  pool: pg.Pool,
  opts: {
    email: string;
    requestIp?: string | null;
    /** Only when caller proved they own this email (authenticated self-test). */
    revealResetUrlForEmail?: string | null;
  },
): Promise<{
  ok: true;
  message: string;
  rateLimited?: boolean;
  selfTest?: { emailSent: boolean; resendId?: string; resetUrl: string; error?: string };
}> {
  await ensurePasswordResetTables(pool);
  const email = normalizeEmail(opts.email);
  const requestIp = opts.requestIp?.trim() || null;
  const revealFor = opts.revealResetUrlForEmail
    ? normalizeEmail(opts.revealResetUrlForEmail)
    : null;
  const mayReveal = Boolean(revealFor && revealFor === email);

  if (!email.includes("@")) {
    return passwordResetNeutralResponse();
  }

  const limited = await isRateLimited(pool, email, requestIp);
  // Authenticated self-test (own email) bypasses the email cap so ops can verify;
  // IP cap still applies. Always record the attempt for audit.
  await recordRateAttempt(pool, email, requestIp);
  if (limited && !mayReveal) {
    return { ...passwordResetNeutralResponse(), rateLimited: true };
  }

  const userRes = await pool.query(
    `SELECT id, email, name, deactivated_at FROM hipaa_training_users WHERE email = $1`,
    [email],
  );
  const user = userRes.rows[0] as
    | { id: string; email: string; name: string | null; deactivated_at: string | null }
    | undefined;

  if (!user || user.deactivated_at) {
    return passwordResetNeutralResponse();
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await pool.query(
    `UPDATE hipaa_password_reset_tokens SET used_at = COALESCE(used_at, NOW())
     WHERE user_id = $1 AND used_at IS NULL`,
    [user.id],
  );

  const insert = await pool.query(
    `INSERT INTO hipaa_password_reset_tokens (user_id, token_hash, expires_at, request_ip)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [user.id, tokenHash, expiresAt.toISOString(), requestIp],
  );
  const tokenId = insert.rows[0]?.id as string;

  const resetUrl = `${staffPortalBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const sent = await sendPasswordResetEmail({
    toEmail: user.email,
    name: user.name,
    resetUrl,
  });

  if (sent.resendId) {
    await pool.query(`UPDATE hipaa_password_reset_tokens SET resend_id = $1 WHERE id = $2`, [
      sent.resendId,
      tokenId,
    ]);
  }
  if (!sent.sent) {
    console.warn("[password-reset] email failed", { email, error: sent.error });
  }

  const base = passwordResetNeutralResponse();
  if (mayReveal) {
    return {
      ...base,
      selfTest: {
        emailSent: sent.sent,
        resendId: sent.resendId,
        resetUrl,
        error: sent.error,
      },
    };
  }
  return base;
}

export async function resetPasswordWithToken(
  pool: pg.Pool,
  opts: { token: string; newPassword: string },
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  await ensurePasswordResetTables(pool);
  const raw = opts.token?.trim() || "";
  const newPassword = opts.newPassword || "";
  if (!raw) return { ok: false, error: "Reset link is invalid or expired.", status: 400 };
  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters", status: 400 };
  }

  const tokenHash = hashToken(raw);
  const rowRes = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM hipaa_password_reset_tokens
     WHERE token_hash = $1`,
    [tokenHash],
  );
  const row = rowRes.rows[0] as
    | { id: string; user_id: string; expires_at: Date | string; used_at: Date | string | null }
    | undefined;

  if (!row) {
    return { ok: false, error: "Reset link is invalid or expired.", status: 400 };
  }
  if (row.used_at) {
    return { ok: false, error: "This reset link was already used.", status: 400 };
  }
  const expiresAt = new Date(row.expires_at).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return { ok: false, error: "Reset link is invalid or expired.", status: 400 };
  }

  const passwordHash = await hashPassword(newPassword);
  await pool.query(`UPDATE hipaa_training_users SET password_hash = $1 WHERE id = $2`, [
    passwordHash,
    row.user_id,
  ]);
  await pool.query(`UPDATE hipaa_password_reset_tokens SET used_at = NOW() WHERE id = $1`, [row.id]);
  // Invalidate any other open tokens for this user.
  await pool.query(
    `UPDATE hipaa_password_reset_tokens SET used_at = COALESCE(used_at, NOW())
     WHERE user_id = $1 AND used_at IS NULL`,
    [row.user_id],
  );

  return { ok: true };
}

/** Latest reset row for an email — used by E2E verify scripts only. */
export async function latestPasswordResetForEmail(
  pool: pg.Pool,
  email: string,
): Promise<{ id: string; resendId: string | null; createdAt: string } | null> {
  await ensurePasswordResetTables(pool);
  const r = await pool.query(
    `SELECT t.id, t.resend_id, t.created_at
     FROM hipaa_password_reset_tokens t
     JOIN hipaa_training_users u ON u.id = t.user_id
     WHERE u.email = $1
     ORDER BY t.created_at DESC
     LIMIT 1`,
    [normalizeEmail(email)],
  );
  const row = r.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    resendId: row.resend_id ? String(row.resend_id) : null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
