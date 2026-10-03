/**
 * Per-user notification preferences (admin/lead observer copies).
 *
 * Defaults: ON when no row exists — preserves current behavior.
 *
 * v1 keys:
 * - late_start_observer — lead/HR/admin copies of late-start nudges (never staff primary)
 * - gap_digest — weekly knowledge-gap digest for department leads
 *
 * Explicitly NOT toggleable in v1:
 * - SOP submitted for review (essential to reviewer role)
 * - Founder-instant gap email (env inbox SIYA_ESCALATION_TO — no clean per-user map)
 *
 * FUTURE (do not build in this slice): personal "don't email me when I'm assigned a task"
 * preference — that would suppress a *primary* assignee notice, not an observer copy.
 * Separate feature / mechanism from A+B observer prefs.
 */

import type pg from "pg";

export const NOTIFICATION_PREF_KEYS = ["late_start_observer", "gap_digest"] as const;
export type NotificationPrefKey = (typeof NOTIFICATION_PREF_KEYS)[number];

export type NotificationPrefs = Record<NotificationPrefKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  late_start_observer: true,
  gap_digest: true,
};

export type NotificationPrefCatalogItem = {
  key: NotificationPrefKey;
  label: string;
  description: string;
};

export const NOTIFICATION_PREF_CATALOG: NotificationPrefCatalogItem[] = [
  {
    key: "late_start_observer",
    label: "Staff late-start alerts (your copy)",
    description:
      "Email when someone on your team is overdue to check in. Does not control whether that staff member still gets their own nudge.",
  },
  {
    key: "gap_digest",
    label: "Weekly knowledge-gap digest",
    description:
      "Monday email listing open Notify-owner / knowledge gaps for departments you lead.",
  },
];

let ensured = false;

export async function ensureNotificationPrefsTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_notification_prefs (
      user_id UUID PRIMARY KEY REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
      prefs_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  ensured = true;
}

function coercePrefs(raw: unknown): NotificationPrefs {
  const out: NotificationPrefs = { ...DEFAULT_NOTIFICATION_PREFS };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  const obj = raw as Record<string, unknown>;
  for (const key of NOTIFICATION_PREF_KEYS) {
    if (typeof obj[key] === "boolean") out[key] = obj[key];
  }
  return out;
}

export async function getNotificationPrefs(
  pool: pg.Pool,
  userId: string,
): Promise<NotificationPrefs> {
  await ensureNotificationPrefsTables(pool);
  const r = await pool.query(`SELECT prefs_json FROM siya_notification_prefs WHERE user_id = $1`, [
    userId,
  ]);
  if (!r.rows[0]) return { ...DEFAULT_NOTIFICATION_PREFS };
  return coercePrefs(r.rows[0].prefs_json);
}

/** Default ON — missing userId or missing row means enabled. */
export async function isNotificationPrefEnabled(
  pool: pg.Pool,
  userId: string | null | undefined,
  key: NotificationPrefKey,
): Promise<boolean> {
  if (!userId) return true;
  const prefs = await getNotificationPrefs(pool, userId);
  return prefs[key] !== false;
}

export async function setNotificationPrefs(
  pool: pg.Pool,
  userId: string,
  patch: Partial<NotificationPrefs>,
): Promise<NotificationPrefs> {
  await ensureNotificationPrefsTables(pool);
  const current = await getNotificationPrefs(pool, userId);
  const next: NotificationPrefs = { ...current };
  for (const key of NOTIFICATION_PREF_KEYS) {
    if (typeof patch[key] === "boolean") next[key] = patch[key]!;
  }
  await pool.query(
    `INSERT INTO siya_notification_prefs (user_id, prefs_json, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       prefs_json = EXCLUDED.prefs_json,
       updated_at = NOW()`,
    [userId, JSON.stringify(next)],
  );
  return next;
}

export async function userIsDepartmentLead(pool: pg.Pool, userId: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM siya_department_leads WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  return r.rows.length > 0;
}

/** Which toggles apply to this account (admin/lead observer surface). */
export async function applicableNotificationPrefKeys(
  pool: pg.Pool,
  userId: string,
  role: string,
): Promise<NotificationPrefKey[]> {
  const keys: NotificationPrefKey[] = [];
  const isAdmin = role === "admin";
  const isLead = await userIsDepartmentLead(pool, userId);
  if (isAdmin || isLead) keys.push("late_start_observer");
  if (isLead) keys.push("gap_digest");
  return keys;
}

export type NotificationPrefsApiResponse = {
  prefs: NotificationPrefs;
  applicable: NotificationPrefKey[];
  catalog: NotificationPrefCatalogItem[];
  /** Keys that exist but are intentionally not user-toggleable. */
  locked: { key: string; reason: string }[];
  /** Future ideas logged; not built. */
  deferred: { key: string; note: string }[];
};

export async function buildNotificationPrefsResponse(
  pool: pg.Pool,
  userId: string,
  role: string,
): Promise<NotificationPrefsApiResponse> {
  const prefs = await getNotificationPrefs(pool, userId);
  const applicable = await applicableNotificationPrefKeys(pool, userId, role);
  return {
    prefs,
    applicable,
    catalog: NOTIFICATION_PREF_CATALOG.filter((c) => applicable.includes(c.key)),
    locked: [
      {
        key: "sop_review",
        reason: "SOP review requests stay on for reviewers — not toggleable.",
      },
    ],
    deferred: [
      {
        key: "task_assigned_personal",
        note: "Future: personal opt-out of emails when you are the task assignee (primary notice, not observer copy).",
      },
      {
        key: "founder_instant_gap",
        note: "v1 out of scope — founder-instant gaps go to SIYA_ESCALATION_TO env inbox, not a mapped portal user.",
      },
    ],
  };
}
