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
