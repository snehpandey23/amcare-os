/**
 * My Day create_sop → Knowledge SOP guided-draft deep link (not checklist builder).
 *
 *   npx tsx apps/hipaa-training/scripts/smoke-sop-create-sop-myday-route.ts
 */
import assert from "node:assert/strict";
import {
  knowledgeSopNewDraftHref,
  parseSopNewDraftDeepLink,
  shouldApplySopNewDraftDeepLink,
} from "../src/lib/sop-editor-session";

// --- Before (bug): create_sop went to checklist builder ---
const BEFORE_BUG = (purpose: string) =>
  `/memory/knowledge/sop-builder?topic=${encodeURIComponent(purpose)}`;

// --- After (fix): create_sop opens Department SOPs guided draft ---
const purpose = "Late cancel fee exception path";
const department = "Clinical Operations";
const afterHref = knowledgeSopNewDraftHref({ department, purpose });

assert.ok(!afterHref.includes("sop-builder"), afterHref);
assert.ok(afterHref.startsWith("/memory/knowledge/sops?"), afterHref);
assert.match(afterHref, /[?&]new=1/);
assert.match(afterHref, /department=Clinical(\+|%20)Operations/);
assert.ok(afterHref.includes("purpose="), afterHref);

const params = new URLSearchParams(afterHref.split("?")[1]);
const parsed = parseSopNewDraftDeepLink({ get: (k) => params.get(k) });
assert.ok(parsed);
assert.equal(parsed!.department, department);
assert.equal(parsed!.purpose, purpose);

assert.equal(
  shouldApplySopNewDraftDeepLink({
    hasNewParam: true,
    openedNewKey: null,
    newKey: `${department}::${purpose}`,
  }),
  true,
);
assert.equal(
  shouldApplySopNewDraftDeepLink({
    hasNewParam: true,
    openedNewKey: `${department}::${purpose}`,
    newKey: `${department}::${purpose}`,
  }),
  false,
);

console.log("BEFORE (buggy My Day create_sop href):");
console.log(" ", BEFORE_BUG(purpose));
console.log("AFTER (fixed My Day create_sop href):");
console.log(" ", afterHref);
console.log("Parsed deep link → openCreate(department, purpose):", parsed);
console.log("smoke-sop-create-sop-myday-route: OK");
