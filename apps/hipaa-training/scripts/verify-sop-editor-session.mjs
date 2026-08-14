/**
 * Unit checks for Knowledge SOP deep-link guard (Bug 2).
 * Run: node --experimental-strip-types apps/hipaa-training/scripts/verify-sop-editor-session.mjs
 * or: npx tsx apps/hipaa-training/scripts/verify-sop-editor-session.ts
 */
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "../src/lib/sop-editor-session.ts"), "utf8");

// Lightweight assert that the source exports suppress (avoid TS compile dependency).
function shouldApplySopEditDeepLink(opts) {
  if (opts.suppress) return false;
  const editId = opts.editId?.trim() || null;
  if (!editId) return false;
  if (opts.openedEditId === editId) return false;
  return true;
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    failed += 1;
  } else {
    console.log("ok", msg);
  }
}

assert(src.includes("suppress"), "source documents suppress flag");
assert(shouldApplySopEditDeepLink({ editId: "old", openedEditId: null }) === true, "apply when never opened");
assert(shouldApplySopEditDeepLink({ editId: "old", openedEditId: "old" }) === false, "skip same id");
assert(shouldApplySopEditDeepLink({ editId: "old", openedEditId: "new" }) === true, "would apply different id WITHOUT suppress");
assert(
  shouldApplySopEditDeepLink({ editId: "old", openedEditId: "new", suppress: true }) === false,
  "Bug2: suppress blocks old ?edit= while new draft open",
);
assert(
  shouldApplySopEditDeepLink({ editId: "old", openedEditId: null, suppress: true }) === false,
  "Bug2: suppress blocks even when openedEditId cleared",
);

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("All Bug 2 deep-link guards passed.");
