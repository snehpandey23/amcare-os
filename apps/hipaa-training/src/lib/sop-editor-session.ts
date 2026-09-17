/**
 * Guard for Knowledge SOP editor deep-link (?edit=id).
 * Without this, every sops list refresh re-calls openEdit(editId) and can replace
 * a newly generated/edited draft in the modal with an older SOP from the URL.
 */
export function shouldApplySopEditDeepLink(opts: {
  editId: string | null | undefined;
  /** Last editId we already opened via deep link (null = never). */
  openedEditId: string | null;
  /**
   * When true, never apply deep-link (active editor / submit handshake).
   * Prevents ?edit=<old> from clobbering a new draft after create+load().
   */
  suppress?: boolean;
}): boolean {
  if (opts.suppress) return false;
  const editId = opts.editId?.trim() || null;
  if (!editId) return false;
  if (opts.openedEditId === editId) return false;
  return true;
}

/**
 * Deep-link for guided Knowledge SOP draft (?new=1&department=&purpose=).
 * Used by My Day create_sop tasks — must open SopDraftGuide, not the checklist builder.
 */
export function parseSopNewDraftDeepLink(searchParams: {
  get(name: string): string | null;
}): { department: string; purpose: string } | null {
  const flag = (searchParams.get("new") || "").trim().toLowerCase();
  if (flag !== "1" && flag !== "true" && flag !== "yes") return null;
  const department = (searchParams.get("department") || "").trim();
  if (!department) return null;
  const purpose = (searchParams.get("purpose") || "").trim().replace(/ — unassigned$/, "");
  return { department, purpose };
}

/** One-shot guard so ?new= does not re-open the guide on every list refresh. */
export function shouldApplySopNewDraftDeepLink(opts: {
  hasNewParam: boolean;
  /** Fingerprint of the last ?new= we already opened (null = never). */
  openedNewKey: string | null;
  newKey: string | null;
  suppress?: boolean;
}): boolean {
  if (opts.suppress) return false;
  if (!opts.hasNewParam || !opts.newKey) return false;
  if (opts.openedNewKey === opts.newKey) return false;
  return true;
}

/** Build My Day → Knowledge SOP guided-draft URL (create_sop tasks only). */
export function knowledgeSopNewDraftHref(opts: { department: string; purpose: string }): string {
  const q = new URLSearchParams();
  q.set("new", "1");
  q.set("department", opts.department);
  if (opts.purpose.trim()) q.set("purpose", opts.purpose.trim());
  return `/memory/knowledge/sops?${q.toString()}`;
}

/** Snapshot of last DB-persisted editor fields (null = never saved this session). */
export type SopEditorSavedSnapshot = {
  title: string;
  body: string;
  department: string;
  reviewDate: string;
};

export const SOP_UNSAVED_LEAVE_MSG =
  "You have an unsaved SOP draft — are you sure you want to leave without saving? Your work will be lost.";

export const SOP_NEW_DRAFT_SAVE_HINT =
  "Not saved yet — click Save draft or your work will be lost if you leave this page.";

/** True when the open editor has content that is not yet persisted. */
export function isSopEditorDirty(opts: {
  editorOpen: boolean;
  title: string;
  body: string;
  department: string;
  reviewDate: string;
  saved: SopEditorSavedSnapshot | null;
}): boolean {
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
