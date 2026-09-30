/**
 * Kill-switch for scheduled staff team mail (Resend Free daily-cap protection).
 *
 * When STAFF_TEAM_MAIL_PAUSED=true:
 * - Weekday culture, EOM nudges, weekly gap digests → dry_run (no Resend)
 * - Late-start OBSERVER copies (lead/HR/admin) → skipped (no Resend)
 *
 * Never pauses:
 * - Website lead-capture (Circle, callback, careers, employer inquiry)
 * - Shift-roster reminders (primary staff)
 * - Late-start PRIMARY staff nudge
 * - SOP / task / feedback / password transactional mail
 */

export function isStaffTeamMailPaused(): boolean {
  const raw = (process.env.STAFF_TEAM_MAIL_PAUSED || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

/** Force dry_run for culture / EOM / gap-digest team blast when paused. */
export function applyTeamMailPauseMode<T extends string>(
  mode: T,
  dryRunValue: T = "dry_run" as T,
): { mode: T; teamMailPaused: boolean } {
  if (isStaffTeamMailPaused()) {
    return { mode: dryRunValue, teamMailPaused: true };
  }
  return { mode, teamMailPaused: false };
}

/**
 * Late-start: staff primary always eligible; observer roles blocked when paused.
 */
export function isLateStartObserverRole(role: string): boolean {
  return role === "department_lead" || role === "hr" || role === "admin";
}

export function shouldSendLateStartRecipient(role: string): boolean {
  if (role === "staff") return true;
  if (isLateStartObserverRole(role) && isStaffTeamMailPaused()) return false;
  return true;
}
