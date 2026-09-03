/**
 * Local unit smoke for password-reset helpers (no network).
 *   npx tsx apps/hipaa-training/scripts/smoke-password-reset-unit.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const API_ROOT = join(__dirname, "../../../integrations/hipaa-training-api");
const svc = readFileSync(join(API_ROOT, "src/password-reset-service.ts"), "utf8");
const schema = readFileSync(join(API_ROOT, "src/database/password-reset-schema.sql"), "utf8");
const index = readFileSync(join(API_ROOT, "src/index.ts"), "utf8");
const login = readFileSync(join(__dirname, "../src/app/login/page.tsx"), "utf8");
const forgot = readFileSync(join(__dirname, "../src/app/forgot-password/page.tsx"), "utf8");
const reset = readFileSync(join(__dirname, "../src/app/reset-password/page.tsx"), "utf8");
const shell = readFileSync(join(__dirname, "../src/components/training/ClientShell.tsx"), "utf8");
const edit = readFileSync(join(__dirname, "../src/components/admin/TeamMemberEditPanel.tsx"), "utf8");

assert.match(svc, /PASSWORD_RESET_TTL_MS = 45/);
assert.match(svc, /PASSWORD_RESET_EMAIL_LIMIT = 3/);
assert.match(svc, /PASSWORD_RESET_IP_LIMIT = 10/);
assert.match(svc, /If that account exists, we sent a link/);
assert.match(svc, /sha256/);
assert.match(schema, /hipaa_password_reset_tokens/);
assert.match(schema, /hipaa_password_reset_rate/);
assert.match(index, /\/api\/auth\/forgot-password/);
assert.match(index, /\/api\/auth\/reset-password/);
assert.match(login, /Forgot password\?/);
assert.match(forgot, /Send reset link/);
assert.match(forgot, /If an account exists/);
assert.match(forgot, /requestForgotPassword/);
assert.match(reset, /resetPasswordWithToken/);
assert.match(reset, /Choose a new password/);
assert.match(shell, /forgot-password/);
assert.match(shell, /reset-password/);
assert.match(edit, /emergency \/ break-glass only/);

console.log("smoke-password-reset-unit: OK");
