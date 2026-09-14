/**
 * Smoke — Listening estimate unavailable reasons show distinct UI labels.
 *
 *   npx tsx apps/hipaa-training/scripts/smoke-listening-estimate-labels.ts
 * Live (optional):
 *   source scripts/agent-qa-env.sh && LISTENING_ESTIMATE_LIVE=1 npx tsx ...
 */
import assert from "node:assert/strict";
import {
  ESTIMATE_UNAVAILABLE_LABEL,
  resolveListeningPartialReason,
  type EstimateUnavailableReason,
} from "../src/lib/competency-exam/estimate-unavailable";
import { scoreListeningProviderMessage } from "../src/lib/competency-exam/writing-score";

function detailFor(text: string, unavailableReason: EstimateUnavailableReason | null, llmEstimate: number | null) {
  const scored = scoreListeningProviderMessage({ text, llmEstimate });
  const reason = resolveListeningPartialReason({
    unavailableReason,
    substanceOk: scored.substance.ok,
    llmEstimate,
  });
  return {
    score: scored.score,
    reason,
    label: reason ? ESTIMATE_UNAVAILABLE_LABEL[reason] : null,
    detail: reason
      ? `Provider message · ${scored.det.wordCount} words · ${ESTIMATE_UNAVAILABLE_LABEL[reason]}`
      : `Provider message · ${scored.det.wordCount} words`,
  };
}

// (1) Near-empty / too short
const short = detailFor("a b c d e f", "too_short", null);
assert.equal(short.reason, "too_short");
assert.match(short.detail, /too short for full evaluation/i);
assert.ok((short.score ?? 100) <= 12);
console.log("PASS\ttoo_short\t", short.detail, `score=${short.score}`);

// (2) PHI-style phrase — reason wins even if also short
const phi = detailFor("Patient called about refill.", "phi_blocked", null);
assert.equal(phi.reason, "phi_blocked");
assert.match(phi.detail, /flagged content pattern|please rephrase/i);
assert.doesNotMatch(phi.detail, /LLM unavailable/i);
console.log("PASS\tphi_blocked\t", phi.detail, `score=${phi.score}`);

// (3) Service failure on substantive text
const goodText =
  "Hi Dr. Smith — John Doe left a voicemail that his refill runs out before travel. I called twice with no answer. Could you please advise on a bridge supply to his pharmacy on file?";
const fail = detailFor(goodText, "llm_failed", null);
assert.equal(fail.reason, "llm_failed");
assert.match(fail.detail, /Evaluation service temporarily unavailable/i);
assert.doesNotMatch(fail.detail, /LLM unavailable/i);
console.log("PASS\tllm_failed\t", fail.detail, `score=${fail.score}`);

// Substantive + successful estimate → no partial reason
const ok = detailFor(goodText, null, 85);
assert.equal(ok.reason, null);
assert.doesNotMatch(ok.detail, /unavailable|too short|flagged/i);
console.log("PASS\tfull_estimate\t", ok.detail, `score=${ok.score}`);

async function live() {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  const STAFF = (process.env.COMPETENCY_EXAM_BASE_URL || "https://www.siyahealth.net").replace(/\/$/, "");
  const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD");
  const loginRes = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = (await loginRes.json()) as { token?: string };
  if (!login.token) throw new Error("login failed");

  async function estimate(text: string) {
    const res = await fetch(`${STAFF}/api/competency-exam/estimate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${login.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Voicemail. Write provider message.", text, part: "escalation" }),
    });
    const raw = await res.text();
    try {
      return JSON.parse(raw) as {
        estimate?: number | null;
        unavailableReason?: string | null;
        note?: string;
      };
    } catch {
      throw new Error(`estimate non-JSON HTTP ${res.status}: ${raw.slice(0, 200)}`);
    }
  }

  const a = await estimate("a b c d e f");
  assert.equal(a.unavailableReason, "too_short");
  assert.equal(a.estimate, null);
  console.log("PASS\tlive_too_short\t", a.unavailableReason, a.note?.slice(0, 80));

  const b = await estimate("Patient called about refill.");
  assert.equal(b.unavailableReason, "phi_blocked");
  assert.equal(b.estimate, null);
  console.log("PASS\tlive_phi\t", b.unavailableReason, b.note?.slice(0, 80));

  const c = await estimate(goodText);
  // After deploy: either numeric estimate or llm_failed — not too_short/phi
  if (typeof c.estimate === "number") {
    assert.equal(c.unavailableReason ?? null, null);
    console.log("PASS\tlive_good\t", `estimate=${c.estimate}`);
  } else {
    assert.ok(c.unavailableReason === "llm_failed" || c.unavailableReason === "llm_disabled" || c.unavailableReason === "parse_failed");
    console.log("PASS\tlive_good_null\t", c.unavailableReason);
  }
}

if (process.env.LISTENING_ESTIMATE_LIVE === "1") {
  live().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.log("OK\tlocal label smoke (set LISTENING_ESTIMATE_LIVE=1 after staff deploy for live API)");
}
