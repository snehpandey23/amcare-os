/**
 * Employee of the month — staff nominations with reason (Feedback page).
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
let ensured = false;

export const EOM_PRIZE_COPY =
  "₹5,000 Amazon voucher or a preferred gift voucher of the same value";

export type EomNomineeOption = {
  id: string;
  name: string | null;
  email: string;
};

export type EomMyNomination = {
  id: string;
  nomineeUserId: string;
  nomineeName: string | null;
  nomineeEmail: string;
  reason: string;
  createdAt: string;
  isSelf: boolean;
};

export type EomMonthStatus = {
  monthKey: string;
  monthLabel: string;
  prizeCopy: string;
  nudgeDay: boolean;
  hasNominatedThisMonth: boolean;
  myNominations: EomMyNomination[];
  nominees: EomNomineeOption[];
};

function istParts(now = new Date()): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

export function currentEomMonthKey(now = new Date()): string {
  const { year, month } = istParts(now);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function isEomNudgeDay(now = new Date()): boolean {
  const { day } = istParts(now);
  return day === 20 || day === 25;
}

export function eomMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function ensureEomNominationTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "eom-nominations-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

export function assessEomReason(reason: string): { ok: true; text: string } | { ok: false; reason: string } {
  const t = reason.replace(/\s+/g, " ").trim();
  if (t.length < 20) {
    return { ok: false, reason: "Say a bit more — what did they do that stood out? (about one short sentence)" };
  }
  if (t.length > 800) {
    return { ok: false, reason: "Keep the reason under 800 characters." };
  }
  return { ok: true, text: t };
}

async function listActiveStaff(pool: pg.Pool): Promise<EomNomineeOption[]> {
  const r = await pool.query<{ id: string; name: string | null; email: string }>(
    `SELECT id::text AS id, name, email
     FROM hipaa_training_users
     WHERE deactivated_at IS NULL
     ORDER BY COALESCE(NULLIF(TRIM(name), ''), email) ASC
     LIMIT 200`,
  );
  return r.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
  }));
}

export async function getEomMonthStatus(
  pool: pg.Pool,
  nominatorUserId: string,
  monthKey = currentEomMonthKey(),
): Promise<EomMonthStatus> {
  await ensureEomNominationTables(pool);
  const mine = await pool.query<{
    id: string;
    nominee_user_id: string;
    reason: string;
    created_at: Date;
    name: string | null;
    email: string;
  }>(
    `SELECT n.id, n.nominee_user_id::text AS nominee_user_id, n.reason, n.created_at,
            u.name, u.email
     FROM siya_eom_nominations n
     JOIN hipaa_training_users u ON u.id = n.nominee_user_id
     WHERE n.month_key = $1 AND n.nominator_user_id = $2::uuid
     ORDER BY n.created_at DESC`,
    [monthKey, nominatorUserId],
  );

  const nominees = await listActiveStaff(pool);
  // Include self for self-nomination
  const myNominations: EomMyNomination[] = mine.rows.map((row) => ({
    id: row.id,
    nomineeUserId: row.nominee_user_id,
    nomineeName: row.name,
    nomineeEmail: row.email,
    reason: row.reason,
    createdAt: row.created_at.toISOString(),
    isSelf: row.nominee_user_id === nominatorUserId,
  }));

  return {
    monthKey,
    monthLabel: eomMonthLabel(monthKey),
    prizeCopy: EOM_PRIZE_COPY,
    nudgeDay: isEomNudgeDay(),
    hasNominatedThisMonth: myNominations.length > 0,
    myNominations,
    nominees,
  };
}

export async function submitEomNomination(
  pool: pg.Pool,
  opts: {
    nominatorUserId: string;
    nomineeUserId: string;
    reason: string;
    monthKey?: string;
  },
): Promise<{ ok: true; nomination: EomMyNomination } | { ok: false; reason: string }> {
  await ensureEomNominationTables(pool);
  const monthKey = opts.monthKey || currentEomMonthKey();
  const assessed = assessEomReason(opts.reason);
  if (!assessed.ok) return assessed;

  if (!opts.nomineeUserId) {
    return { ok: false, reason: "Pick who you’re nominating." };
  }

  const nominee = await pool.query<{ id: string; name: string | null; email: string }>(
    `SELECT id::text AS id, name, email FROM hipaa_training_users
     WHERE id = $1::uuid AND deactivated_at IS NULL`,
    [opts.nomineeUserId],
  );
  if (!nominee.rows[0]) {
    return { ok: false, reason: "That teammate isn’t on the active roster." };
  }

  const count = await pool.query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM siya_eom_nominations
     WHERE month_key = $1 AND nominator_user_id = $2::uuid`,
    [monthKey, opts.nominatorUserId],
  );
  if ((count.rows[0]?.n ?? 0) >= 5) {
    return { ok: false, reason: "You’ve already nominated 5 people this month — that’s the max." };
  }

  const id = randomUUID();
  try {
    await pool.query(
      `INSERT INTO siya_eom_nominations (id, month_key, nominator_user_id, nominee_user_id, reason)
       VALUES ($1, $2, $3::uuid, $4::uuid, $5)`,
      [id, monthKey, opts.nominatorUserId, opts.nomineeUserId, assessed.text],
    );
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return { ok: false, reason: "You already nominated that person this month. Pick someone else, or edit isn’t available yet." };
    }
    throw err;
  }

  const row = nominee.rows[0];
  return {
    ok: true,
    nomination: {
      id,
      nomineeUserId: row.id,
      nomineeName: row.name,
      nomineeEmail: row.email,
      reason: assessed.text,
      createdAt: new Date().toISOString(),
      isSelf: row.id === opts.nominatorUserId,
    },
  };
}

export type EomNudgeRecipient = {
  userId: string;
  email: string;
  firstName: string;
  hasNominatedThisMonth: boolean;
  alreadySent: boolean;
};

export function istDateString(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Staff who should get the 20th/25th nomination email nudge.
 * Skips deactivated users, those with no login, and anyone who already nominated this month
 * (unless includeAlreadyNominated).
 */
export async function listEomNudgeRecipients(
  pool: pg.Pool,
  opts: {
    sendDate: string;
    monthKey?: string;
    includeAlreadySent?: boolean;
    includeAlreadyNominated?: boolean;
    userId?: string;
  },
): Promise<EomNudgeRecipient[]> {
  await ensureEomNominationTables(pool);
  const monthKey = opts.monthKey || opts.sendDate.slice(0, 7);
  const params: unknown[] = [opts.sendDate, monthKey];
  let userFilter = "";
  if (opts.userId) {
    params.push(opts.userId);
    userFilter = ` AND u.id = $${params.length}::uuid`;
  }

  const r = await pool.query<{
    id: string;
    email: string;
    name: string | null;
    has_nominated: boolean;
    already_sent: boolean;
  }>(
    `SELECT u.id::text AS id, u.email, u.name,
            EXISTS (
              SELECT 1 FROM siya_eom_nominations n
              WHERE n.month_key = $2 AND n.nominator_user_id = u.id
            ) AS has_nominated,
            (s.id IS NOT NULL) AS already_sent
     FROM hipaa_training_users u
     LEFT JOIN siya_eom_nudge_sends s
       ON s.user_id = u.id AND s.send_date = $1::date
     WHERE u.deactivated_at IS NULL
       AND u.last_login_at IS NOT NULL
       ${userFilter}
     ORDER BY u.email ASC`,
    params,
  );

  const out: EomNudgeRecipient[] = [];
  for (const row of r.rows) {
    if (row.already_sent && !opts.includeAlreadySent) continue;
    if (row.has_nominated && !opts.includeAlreadyNominated) continue;
    const name = (row.name || "").trim();
    const firstName = name.split(/\s+/)[0] || row.email.split("@")[0] || "there";
    out.push({
      userId: row.id,
      email: row.email,
      firstName,
      hasNominatedThisMonth: Boolean(row.has_nominated),
      alreadySent: Boolean(row.already_sent),
    });
  }
  return out;
}

export async function markEomNudgeSent(
  pool: pg.Pool,
  opts: {
    userId: string;
    sendDate: string;
    monthKey?: string;
    resendId?: string | null;
  },
): Promise<void> {
  await ensureEomNominationTables(pool);
  const monthKey = opts.monthKey || opts.sendDate.slice(0, 7);
  await pool.query(
    `INSERT INTO siya_eom_nudge_sends (id, user_id, send_date, month_key, resend_id)
     VALUES ($1, $2::uuid, $3::date, $4, $5)
     ON CONFLICT (user_id, send_date) DO NOTHING`,
    [randomUUID(), opts.userId, opts.sendDate, monthKey, opts.resendId ?? null],
  );
}

/** Admin / founder — tally for a month (no anonymous; named nominators for accountability). */
export async function listEomNominationsForMonth(
  pool: pg.Pool,
  monthKey = currentEomMonthKey(),
): Promise<{
  monthKey: string;
  monthLabel: string;
  prizeCopy: string;
  totals: { nomineeUserId: string; nomineeName: string | null; nomineeEmail: string; count: number }[];
  nominations: {
    id: string;
    nominatorName: string | null;
    nominatorEmail: string;
    nomineeName: string | null;
    nomineeEmail: string;
    reason: string;
    createdAt: string;
  }[];
}> {
  await ensureEomNominationTables(pool);
  const rows = await pool.query<{
    id: string;
    reason: string;
    created_at: Date;
    nominator_name: string | null;
    nominator_email: string;
    nominee_user_id: string;
    nominee_name: string | null;
    nominee_email: string;
  }>(
    `SELECT n.id, n.reason, n.created_at,
            g.name AS nominator_name, g.email AS nominator_email,
            n.nominee_user_id::text AS nominee_user_id,
            u.name AS nominee_name, u.email AS nominee_email
     FROM siya_eom_nominations n
     JOIN hipaa_training_users g ON g.id = n.nominator_user_id
     JOIN hipaa_training_users u ON u.id = n.nominee_user_id
     WHERE n.month_key = $1
     ORDER BY n.created_at DESC`,
    [monthKey],
  );

  const tally = new Map<string, { nomineeUserId: string; nomineeName: string | null; nomineeEmail: string; count: number }>();
  for (const row of rows.rows) {
    const cur = tally.get(row.nominee_user_id);
    if (cur) cur.count += 1;
    else {
      tally.set(row.nominee_user_id, {
        nomineeUserId: row.nominee_user_id,
        nomineeName: row.nominee_name,
        nomineeEmail: row.nominee_email,
        count: 1,
      });
    }
  }

  return {
    monthKey,
    monthLabel: eomMonthLabel(monthKey),
    prizeCopy: EOM_PRIZE_COPY,
    totals: [...tally.values()].sort((a, b) => b.count - a.count || (a.nomineeName || a.nomineeEmail).localeCompare(b.nomineeName || b.nomineeEmail)),
    nominations: rows.rows.map((row) => ({
      id: row.id,
      nominatorName: row.nominator_name,
      nominatorEmail: row.nominator_email,
      nomineeName: row.nominee_name,
      nomineeEmail: row.nominee_email,
      reason: row.reason,
      createdAt: row.created_at.toISOString(),
    })),
  };
}
