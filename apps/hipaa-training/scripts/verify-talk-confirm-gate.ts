/**
 * Talk confirm-before-execute gate — garbled / low-confidence must NOT execute.
 *   cd apps/hipaa-training && npx tsx scripts/verify-talk-confirm-gate.ts
 */
import assert from "node:assert/strict";
import {
  CONFIRM_STT_MIN_CONFIDENCE,
  evaluateConfirmUtterance,
  isConfirmNo,
  isConfirmYes,
  type PendingVoiceAction,
} from "../src/lib/voice-actions";

const pendingShift: PendingVoiceAction = {
  kind: "start_shift",
  workShift: "morning",
  readback: "I heard: start your morning shift. Say yes to confirm, or no to cancel.",
};

function mustNotExecute(
  label: string,
  text: string,
  confidence?: number | null,
  source: "voice" | "button" = "voice",
) {
  const v = evaluateConfirmUtterance(text, { action: pendingShift, confidence, source });
  assert.equal(v.decision, "unclear", `${label}: expected unclear, got ${v.decision}`);
  assert.match(v.message, /didn’t catch that clearly|confirm again/i);
  console.log("OK no-execute:", label);
}

function mustYes(label: string, text: string, confidence?: number | null, source: "voice" | "button" = "voice") {
  const v = evaluateConfirmUtterance(text, { action: pendingShift, confidence, source });
  assert.equal(v.decision, "yes", `${label}: ${JSON.stringify(v)}`);
  console.log("OK yes:", label);
}

function mustNo(label: string, text: string, confidence?: number | null, source: "voice" | "button" = "voice") {
  const v = evaluateConfirmUtterance(text, { action: pendingShift, confidence, source });
  assert.equal(v.decision, "no", `${label}: ${JSON.stringify(v)}`);
  console.log("OK no:", label);
}

// Legacy helpers: exact only (no prefix "ok …")
assert.equal(isConfirmYes("yes"), true);
assert.equal(isConfirmYes("ok"), false);
assert.equal(isConfirmYes("sure"), false);
assert.equal(isConfirmYes("ok india.com is my basic email ID"), false);
assert.equal(isConfirmYes("yes start my shift"), false); // helper is exact-only; evaluate allows anchors
assert.equal(isConfirmNo("no"), true);

// --- Vulnerability: garbled containing ok/sure ---
mustNotExecute("garbled with ok", "ok india.com is my basic email ID", 0.99);
mustNotExecute("garbled sure prefix", "sure india.com is my basic email ID", 0.99);
mustNotExecute("bare ok", "ok", 0.99);
mustNotExecute("bare okay", "okay", 0.99);
mustNotExecute("bare sure", "sure", 0.99);
mustNotExecute("yes + garble URL", "yes india.com is my email", 0.99);

// --- Low confidence even on clean yes ---
mustNotExecute("yes low confidence", "yes", CONFIRM_STT_MIN_CONFIDENCE - 0.1);
mustNotExecute("yes very low", "yes", 0.2);

// --- Unknown confidence (null / 0): exact yes still OK ---
mustYes("exact yes null conf", "yes", null);
mustYes("exact yes zero conf", "yes", 0);
mustYes("go ahead", "go ahead", null);
mustNo("exact no", "no", null);

// --- Anchored confirm ---
mustYes("yes + shift anchor", "yes start morning shift", 0.9);
mustNotExecute("yes without anchor junk", "yes please blah blah random", 0.9);

// --- Button bypasses confidence ---
mustYes("button yes low conf", "yes", 0.1, "button");
mustNo("button no low conf", "no", 0.1, "button");

console.log("\nverify-talk-confirm-gate: PASS");
