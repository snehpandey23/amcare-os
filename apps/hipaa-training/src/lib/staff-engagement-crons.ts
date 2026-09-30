/**
 * Feature-level off switch for scheduled staff engagement mail.
 * Set to false and restore the schedules in vercel.siya-staff-assist.json
 * (and vercel.json) to turn the jobs back on. Per-user notification prefs
 * are a separate mechanism and are not this flag.
 *
 * Previous schedules (UTC), kept here so re-enable is a copy:
 * - /api/cron/weekday-team-messages        30 3 * * 1-5
 * - /api/cron/lead-gap-digests             0 12 * * 1
 * - /api/cron/shift-roster-reminders       0 1 * * *   and  30 13 * * *
 * - /api/cron/shift-late-start-nudges      15 1 * * *  and  45 13 * * *
 * - /api/cron/eom-nomination-nudges        30 3 20,25 * *
 */
export const STAFF_ENGAGEMENT_CRONS_DISABLED = true;

export function staffEngagementCronDisabledResponse(job: string): Response {
  console.info(`[cron/${job}] disabled at feature level — not running`);
  return Response.json({
    ok: true,
    disabled: true,
    job,
    reason: "This staff engagement cron is turned off. No recipients are loaded and no email is sent.",
  });
}
