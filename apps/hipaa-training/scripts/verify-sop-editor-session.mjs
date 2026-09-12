/**
 * Unit checks for Knowledge SOP deep-link guard (Bug 2) + unsaved-draft leave guards.
 * Run: node apps/hipaa-training/scripts/verify-sop-editor-session.mjs
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "../src/lib/sop-editor-session.ts"), "utf8");
const workspace = readFileSync(join(__dirname, "../src/components/sops/SopWorkspace.tsx"), "utf8");

function shouldApplySopEditDeepLink(opts) {
  if (opts.suppress) return false;
  const editId = opts.editId?.trim() || null;
  if (!editId) return false;
  if (opts.openedEditId === editId) return false;
  return true;
}

function isSopEditorDirty(opts) {
  if (!opts.editorOpen) return false;
  const hasContent = opts.title.trim().length > 0 || opts.body.trim().length > 0;
  if (!hasContent) return false;
  if (!opts.saved) return true;
  return (
    opts.title !== opts.saved.title ||
    opts.body !== opts.saved.body ||
    opts.department !== opts.saved.department ||
    opts.reviewDate !== opts.saved.reviewDate
  );
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

assert(src.includes("SOP_UNSAVED_LEAVE_MSG"), "leave message exported");
assert(src.includes("SOP_NEW_DRAFT_SAVE_HINT"), "new-draft save hint exported");
assert(src.includes("isSopEditorDirty"), "dirty helper exported");

assert(
  isSopEditorDirty({
    editorOpen: true,
    title: "AI title",
    body: "AI body",
    department: "Clinical Operations",
    reviewDate: "",
    saved: null,
  }) === true,
  "unsaved AI draft is dirty",
);
assert(
  isSopEditorDirty({
    editorOpen: true,
    title: "AI title",
    body: "AI body",
    department: "Clinical Operations",
    reviewDate: "",
    saved: {
      title: "AI title",
      body: "AI body",
      department: "Clinical Operations",
      reviewDate: "",
    },
  }) === false,
  "auto-saved draft is clean",
);
assert(
  isSopEditorDirty({
    editorOpen: true,
    title: "AI title",
    body: "edited body",
    department: "Clinical Operations",
    reviewDate: "",
    saved: {
      title: "AI title",
      body: "AI body",
      department: "Clinical Operations",
      reviewDate: "",
    },
  }) === true,
  "post-save edits are dirty",
);
assert(
  isSopEditorDirty({
    editorOpen: false,
    title: "AI title",
    body: "AI body",
    department: "Clinical Operations",
    reviewDate: "",
    saved: null,
  }) === false,
  "closed editor is not dirty",
);
assert(
  isSopEditorDirty({
    editorOpen: true,
    title: "",
    body: "   ",
    department: "Clinical Operations",
    reviewDate: "",
    saved: null,
  }) === false,
  "empty editor is not dirty",
);

assert(workspace.includes("createSop({"), "workspace still creates SOPs");
assert(workspace.includes("Draft auto-saved"), "auto-save notice after generate");
assert(workspace.includes("beforeunload"), "beforeunload leave guard");
assert(workspace.includes("requestCloseEditor"), "Cancel uses confirm close");
assert(workspace.includes("SOP_NEW_DRAFT_SAVE_HINT"), "explicit unsaved hint in UI");
assert(workspace.includes("SOP_UNSAVED_LEAVE_MSG"), "confirm uses shared leave message");
assert(
  /createSop\(\{[\s\S]*?aiDrafted:\s*true[\s\S]*?\}\)/.test(workspace),
  "generate path auto-saves with aiDrafted",
);

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("All SOP editor session + unsaved-draft guards passed.");
