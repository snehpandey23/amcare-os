/** v1 task ledger vocabulary — do not add ad-hoc action strings. */
export type TaskActivityEvent =
  | "created"
  | "status_changed"
  | "checklist_updated"
  | "assigned"
  | "deleted";

/** Phase 2 (not wired until product asks): blocked | skipped | reopened */

export type TemplateActivityEvent = "created" | "updated" | "activated" | "deactivated";

export type ActivitySource = "cron" | "admin_ui" | "staff_ui" | "api" | "system";

export function isTaskActivityEvent(value: string): value is TaskActivityEvent {
  return (
    value === "created" ||
    value === "status_changed" ||
    value === "checklist_updated" ||
    value === "assigned" ||
    value === "deleted"
  );
}

export function isTemplateActivityEvent(value: string): value is TemplateActivityEvent {
  return value === "created" || value === "updated" || value === "activated" || value === "deactivated";
}
