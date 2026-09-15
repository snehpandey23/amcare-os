/**
 * Smoke: login ?next= deep-link sanitizer.
 *   npx tsx apps/hipaa-training/scripts/smoke-login-next.ts
 */
import assert from "node:assert/strict";
import { safeInternalNextPath } from "../src/lib/login-next";

assert.equal(safeInternalNextPath("/learn/practice#typing"), "/learn/practice#typing");
assert.equal(
  safeInternalNextPath(encodeURIComponent("/learn/practice?category=language#typing")),
  "/learn/practice?category=language#typing",
);
assert.equal(safeInternalNextPath("/module/intro"), "/module/intro");
assert.equal(safeInternalNextPath("https://evil.example/phish"), null);
assert.equal(safeInternalNextPath("//evil.example"), null);
assert.equal(safeInternalNextPath("/login"), null);
assert.equal(safeInternalNextPath("/login?next=/learn"), null);
assert.equal(safeInternalNextPath("javascript:alert(1)"), null);
assert.equal(safeInternalNextPath(""), null);
assert.equal(safeInternalNextPath(null), null);

console.log("smoke-login-next: OK");
