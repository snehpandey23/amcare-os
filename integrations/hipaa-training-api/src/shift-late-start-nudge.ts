/**
 * Late shift-start nudge — roster start + 1h with no check-in.
 * One-time per roster row (send_bucket = late_start).
 */
import type pg from "pg";
import { randomUUID } from "crypto";
import { ensureShiftRosterTables, matchDeclaredStart } from "./shift-roster-service.js";
import { parseShiftStore } from "./shift-store.js";

export const LATE_START_SEND_BUCKET = "late_start";
/** Minutes after rostered start before nudge fires. */
export const LATE_START_GRACE_MINUTES = 60;
/** Only consider starts within this lookback (avoid ancient roster rows). */
export const LATE_START_LOOKBACK_HOURS = 18;

export type LateStartNudgeCandidate = {
  rosterRowId: string;
  userId: string;
  email: string;
  name: string | null;
  firstName: string;
  shiftStart: string;
  shiftEnd: string | null;
  rawCell: string;
  rosterDate: string;
  minutesLate: number;
  departmentSlug: string | null;
};

export type LateStartRecipient = {
  role: "staff" | "department_lead" | "hr" | "admin";
  email: string;
  userId?: string | null;
  name?: string | null;
};

function firstName(name: string | null, email: string): string {
  const n = (name || "").trim().split(/\s+/)[0];
  if (n) return n;
  return email.split("@")[0] || "there";
}

/**
 * Roster rows where scheduled start was ≥1h ago, still within lookback,
 * user never declared Working (or any matching active start) for that window,
 * and late_start nudge not yet logged.
 */
export async function listLateStartNudgeCandidates(
  pool: pg.Pool,
  at = new Date(),
  opts?: { lookbackHours?: number },
): Promise<LateStartNudgeCandidate[]> {
  await ensureShiftRosterTables(pool);
  const lookbackHours = Math.min(
    168,
    Math.max(1, opts?.lookbackHours ?? LATE_START_LOOKBACK_HOURS),
  );
  const lateAfter = new Date(at.getTime() - LATE_START_GRACE_MINUTES * 60 * 1000);
  const lookbackFrom = new Date(at.getTime() - lookbackHours * 3600 * 1000);

  const r = await pool.query(
    `SELECT r.id, r.user_id, r.roster_date::text AS roster_date, r.shift_start, r.shift_end,
            r.raw_cell, r.shift_label, u.email, u.name,
            COALESCE(p.profile_json->>'department', p.profile_json->>'departmentSlug', NULL) AS dept
     FROM shift_roster r
     JOIN hipaa_training_users u ON u.id = r.user_id AND u.deactivated_at IS NULL
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     WHERE r.is_off = FALSE
       AND r.user_id IS NOT NULL
       AND r.shift_start IS NOT NULL
       AND r.shift_start <= $1::timestamptz
       AND r.shift_start >= $2::timestamptz
       AND NOT EXISTS (
         SELECT 1 FROM shift_roster_reminder_sends s
         WHERE s.roster_row_id = r.id AND s.send_bucket = $3
       )`,
    [lateAfter.toISOString(), lookbackFrom.toISOString(), LATE_START_SEND_BUCKET],
  );

  const out: LateStartNudgeCandidate[] = [];
  for (const row of r.rows) {
    const userId = row.user_id as string;
    const email = String(row.email || "");
    if (!email.includes("@")) continue;
    const shiftStart = row.shift_start
      ? new Date(row.shift_start as string | Date).toISOString()
      : null;
    if (!shiftStart) continue;
    const shiftEnd = row.shift_end
      ? new Date(row.shift_end as string | Date).toISOString()
      : null;

    const prog = await pool.query(`SELECT shift_json FROM hipaa_training_progress WHERE user_id = $1`, [
      userId,
    ]);
    const store = parseShiftStore(prog.rows[0]?.shift_json);
    const matched = matchDeclaredStart(
      store,
      Date.parse(shiftStart),
      shiftEnd ? Date.parse(shiftEnd) : Date.parse(shiftStart) + 8 * 3600000,
      String(row.roster_date).slice(0, 10),
    );
    if (matched) continue;

    // Also skip if currently on Working/Focus with a start after roster start − grace
    if (store.active?.startedAt) {
      const startedMs = Date.parse(store.active.startedAt);
      const rosterMs = Date.parse(shiftStart);
      if (
        !Number.isNaN(startedMs) &&
        startedMs >= rosterMs - 30 * 60 * 1000 &&
        (store.active.presence === "working" ||
          store.active.presence === "focus" ||
          store.active.presence === "break")
      ) {
        continue;
      }
    }

    const minutesLate = Math.round((at.getTime() - Date.parse(shiftStart)) / 60000);
    out.push({
      rosterRowId: String(row.id),
      userId,
      email,
      name: (row.name as string | null) ?? null,
      firstName: firstName(row.name as string | null, email),
      shiftStart,
      shiftEnd,
      rawCell: String(row.raw_cell || ""),
      rosterDate: String(row.roster_date).slice(0, 10),
      minutesLate,
      departmentSlug: row.dept ? String(row.dept).toLowerCase().replace(/\s+/g, "_") : null,
    });
  }
  return out;
}

/** Staff + department lead + HR lead + all admins (deduped). */
export async function resolveLateStartRecipients(
  pool: pg.Pool,
  candidate: LateStartNudgeCandidate,
): Promise<LateStartRecipient[]> {
  const recipients: LateStartRecipient[] = [
    {
      role: "staff",
      email: candidate.email.trim().toLowerCase(),
      userId: candidate.userId,
      name: candidate.name,
    },
  ];

  // Department lead for staff's department (if known)
  if (candidate.departmentSlug) {
    const lead = await pool.query(
      `SELECT u.id, u.email, u.name
       FROM siya_department_leads l
       JOIN hipaa_training_users u ON u.id = l.user_id AND u.deactivated_at IS NULL
       WHERE l.department_slug = $1 AND l.user_id IS NOT NULL
       LIMIT 1`,
      [candidate.departmentSlug],
    );
    if (lead.rows[0]?.email) {
      recipients.push({
        role: "department_lead",
        email: String(lead.rows[0].email).toLowerCase(),
        userId: lead.rows[0].id as string,
        name: lead.rows[0].name as string | null,
      });
    }
  }

  // HR lead seat
  const hr = await pool.query(
    `SELECT u.id, u.email, u.name
     FROM siya_department_leads l
     JOIN hipaa_training_users u ON u.id = l.user_id AND u.deactivated_at IS NULL
     WHERE l.department_slug = 'hr' AND l.user_id IS NOT NULL
     LIMIT 3`,
  );
  for (const row of hr.rows) {
    if (row.email) {
      recipients.push({
        role: "hr",
        email: String(row.email).toLowerCase(),
        userId: row.id as string,
        name: row.name as string | null,
      });
    }
  }
  // Env override for HR inbox
  const hrEnv = process.env.SIYA_HR_EMAIL?.trim().toLowerCase();
  if (hrEnv?.includes("@")) {
    recipients.push({ role: "hr", email: hrEnv, userId: null, name: "HR" });
  }

  // Admins / founder
  const admins = await pool.query(
    `SELECT id, email, name FROM hipaa_training_users
     WHERE role = 'admin' AND deactivated_at IS NULL`,
  );
  for (const row of admins.rows) {
    if (row.email) {
      recipients.push({
        role: "admin",
        email: String(row.email).toLowerCase(),
        userId: row.id as string,
        name: row.name as string | null,
      });
    }
  }

  // Deduplicate by email; keep first role (staff preferred)
  const seen = new Set<string>();
  const out: LateStartRecipient[] = [];
  for (const r of recipients) {
    const e = r.email.trim().toLowerCase();
    if (!e.includes("@") || seen.has(e)) continue;
    seen.add(e);
    out.push({ ...r, email: e });
  }
  return out;
}

export async function markLateStartNudgeSent(
  pool: pg.Pool,
  opts: {
    rosterRowId: string;
    userId: string;
    recipientEmails: string[];
    recipientRoles: string[];
    resendIds: string[];
  },
): Promise<void> {
  await ensureShiftRosterTables(pool);
  // One-time: UNIQUE (roster_row_id, send_bucket=late_start)
  await pool.query(
    `INSERT INTO shift_roster_reminder_sends (id, roster_row_id, user_id, send_bucket, resend_id)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (roster_row_id, send_bucket) DO NOTHING`,
    [
      randomUUID(),
      opts.rosterRowId,
      opts.userId,
      LATE_START_SEND_BUCKET,
      opts.resendIds.filter(Boolean).join(",") || null,
    ],
  );
  // Richer audit log (who/when/roles)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shift_roster_late_start_nudge_log (
      id TEXT PRIMARY KEY,
      roster_row_id TEXT NOT NULL REFERENCES shift_roster(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
      recipient_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
      recipient_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
      resend_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    `INSERT INTO shift_roster_late_start_nudge_log
       (id, roster_row_id, user_id, recipient_emails, recipient_roles, resend_ids)
     VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb)`,
    [
      randomUUID(),
      opts.rosterRowId,
      opts.userId,
      JSON.stringify(opts.recipientEmails),
      JSON.stringify(opts.recipientRoles),
      JSON.stringify(opts.resendIds),
    ],
  );
}

export async function lateStartNudgeAlreadySent(
  pool: pg.Pool,
  rosterRowId: string,
): Promise<boolean> {
  await ensureShiftRosterTables(pool);
  const r = await pool.query(
    `SELECT 1 FROM shift_roster_reminder_sends
     WHERE roster_row_id = $1 AND send_bucket = $2 LIMIT 1`,
    [rosterRowId, LATE_START_SEND_BUCKET],
  );
  return r.rows.length > 0;
}
