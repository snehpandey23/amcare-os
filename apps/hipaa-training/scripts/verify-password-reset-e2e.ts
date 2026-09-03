/**
 * E2E password reset against production (no local DATABASE_URL/RESEND pull required).
 *
 * Uses authenticated self-test reveal (JWT email must match requested email) to obtain
 * the same reset URL that was emailed via Resend, then exercises reset + reuse rejection.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-password-reset-e2e.ts
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH = (process.env.AUTH_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const EMAIL = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || "").trim().toLowerCase();
const OLD_PASSWORD = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || "").trim();
const NEW_PASSWORD = `Rst!${Date.now().toString(36)}Aa9`;

type Json = Record<string, unknown>;

async function postJson(
  path: string,
  body: unknown,
  token?: string,
): Promise<{ status: number; data: Json }> {
  const res = await fetch(`${AUTH}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Json;
  return { status: res.status, data };
}

async function login(email: string, password: string): Promise<{ ok: boolean; token?: string; error?: string }> {
  const { status, data } = await postJson("/api/auth/login", { email, password });
  if (status === 200 && typeof data.token === "string") return { ok: true, token: data.token };
  return { ok: false, error: String(data.error || status) };
}

async function main() {
  if (!EMAIL || !OLD_PASSWORD) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");

  const evidence: Record<string, unknown> = {
    at: new Date().toISOString(),
    email: EMAIL,
    auth: AUTH,
  };

  try {
    const before = await login(EMAIL, OLD_PASSWORD);
    assert.equal(before.ok, true, `pre-login failed: ${before.error}`);
    evidence.oldPasswordWorksBefore = true;

    // Public forgot — neutral only (no selfTest without auth)
    const publicForgot = await postJson("/api/auth/forgot-password", { email: EMAIL });
    assert.equal(publicForgot.status, 200);
    assert.match(String(publicForgot.data.message || ""), /If that account exists/i);
    assert.equal(publicForgot.data.selfTest, undefined);
    evidence.publicForgotNeutral = true;

    const ghost = await postJson("/api/auth/forgot-password", {
      email: "nobody-reset-test@example.com",
    });
    assert.equal(ghost.status, 200);
    assert.equal(ghost.data.message, publicForgot.data.message);
    evidence.ghostSameMessage = true;

    // Authenticated self-test: Resend send + reveal same link that was emailed
    const forgot = await postJson(
      "/api/auth/forgot-password",
      { email: EMAIL, selfTest: true },
      before.token,
    );
    assert.equal(forgot.status, 200, JSON.stringify(forgot.data));
    assert.match(String(forgot.data.message || ""), /If that account exists/i);
    const selfTest = forgot.data.selfTest as
      | { emailSent?: boolean; resendId?: string; resetUrl?: string; error?: string }
      | undefined;
    assert.ok(selfTest, "expected selfTest payload for own-email automation");
    assert.equal(selfTest.emailSent, true, `Resend did not send: ${selfTest.error}`);
    assert.ok(selfTest.resendId, "expected Resend id");
    assert.ok(selfTest.resetUrl?.includes("/reset-password?token="), selfTest.resetUrl);
    evidence.resendId = selfTest.resendId;
    evidence.resetUrlHost = new URL(selfTest.resetUrl!).origin;

    // Wrong-email self-test must NOT reveal
    const other = await postJson(
      "/api/auth/forgot-password",
      { email: "other-person@siya.health", selfTest: true },
      before.token,
    );
    assert.equal(other.data.selfTest, undefined);
    evidence.otherEmailNoReveal = true;

    const token = new URL(selfTest.resetUrl!).searchParams.get("token");
    assert.ok(token);

    const reset = await postJson("/api/auth/reset-password", { token, newPassword: NEW_PASSWORD });
    assert.equal(reset.status, 200, JSON.stringify(reset.data));
    evidence.resetOk = true;

    const oldAfter = await login(EMAIL, OLD_PASSWORD);
    assert.equal(oldAfter.ok, false, "old password should fail after reset");
    evidence.oldPasswordRejected = true;

    const neu = await login(EMAIL, NEW_PASSWORD);
    assert.equal(neu.ok, true, `new login failed: ${neu.error}`);
    evidence.newPasswordWorks = true;

    const reuse = await postJson("/api/auth/reset-password", {
      token,
      newPassword: `${NEW_PASSWORD}x`,
    });
    assert.ok(reuse.status >= 400, JSON.stringify(reuse.data));
    evidence.reuseRejected = { status: reuse.status, error: reuse.data.error };

    const restore = await postJson(
      "/api/auth/change-password",
      { currentPassword: NEW_PASSWORD, newPassword: OLD_PASSWORD },
      neu.token,
    );
    assert.equal(restore.status, 200, JSON.stringify(restore.data));
    const restored = await login(EMAIL, OLD_PASSWORD);
    assert.equal(restored.ok, true, `restore failed: ${restored.error}`);
    evidence.restoredOriginal = true;
    evidence.pass = true;
  } finally {
    const out = join(__dirname, "../../../.cursor-verify/password-reset-e2e.json");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify(evidence, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
