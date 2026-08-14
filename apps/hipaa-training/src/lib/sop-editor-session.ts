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
