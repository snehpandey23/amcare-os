/**
 * Weekday team messages — usage segments from existing Ask + Practice data.
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { drillCount, summarizeLevelUpProgress, type DrillKey } from "./summarize-progress.js";

const __dir = dirname(fileURLToPath(import.meta.url));
let ensured = false;

export type UsageSegment = "new_ask" | "regular_ask" | "practice_bridge";

export type WeekdayTheme =
  | "motivational_monday"
  | "therapeutic_tuesday"
  | "working_wednesday"
  | "thoughtful_thursday"
  | "feedback_friday";

const ALL_THEMES: WeekdayTheme[] = [
  "motivational_monday",
  "therapeutic_tuesday",
  "working_wednesday",
  "thoughtful_thursday",
  "feedback_friday",
];

const DRILL_KEYS: DrillKey[] = [
  "english",
  "trivia",
  "healthterm",
  "compliance",
  "documentation",
  "map",
  "timezone",
  "typing",
  "billing",
];

export function istDateString(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function weekdayThemeForDate(d = new Date()): WeekdayTheme | null {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(d);
  switch (day) {
    case "Mon":
      return "motivational_monday";
    case "Tue":
      return "therapeutic_tuesday";
    case "Wed":
      return "working_wednesday";
    case "Thu":
      return "thoughtful_thursday";
    case "Fri":
      return "feedback_friday";
    default:
      return null;
  }
}

export function classifyUsageSegment(opts: {
  askTurnsLast30d: number;
  askTurnsLast14d: number;
  practiceLifetime: number;
}): UsageSegment {
  if (opts.askTurnsLast14d >= 1) return "regular_ask";
  if (opts.practiceLifetime >= 1 && opts.askTurnsLast30d === 0) return "practice_bridge";
  return "new_ask";
}

export async function ensureWeekdayMessageTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "team-weekday-message-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

async function countAskTurns(pool: pg.Pool, userId: string, days: number): Promise<number> {
  const { ensureAssistChatTables } = await import("./assist-chat-service.js");
  await ensureAssistChatTables(pool);
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM siya_assist_messages m
     JOIN siya_assist_threads t ON t.id = m.thread_id
     WHERE t.user_id = $1
       AND m.role = 'user'
       AND m.created_at >= NOW() - ($2::text || ' days')::interval`,
    [userId, String(days)],
  );
  return r.rows[0]?.c ?? 0;
}

function practiceLifetimeFromLevelUp(levelUpJson: unknown): number {
  const summary = summarizeLevelUpProgress(levelUpJson as Record<string, unknown> | null);
  const fromLifetime = drillCount(summary.lifetimeDrills, DRILL_KEYS);
  const fromLedger = summary.dayLedger.length;
  return Math.max(fromLifetime, fromLedger > 0 ? 1 : 0);
}

export async function getUserUsageStats(
  pool: pg.Pool,
  userId: string,
): Promise<{
  askTurnsLast14d: number;
  askTurnsLast30d: number;
  practiceLifetime: number;
  segment: UsageSegment;
}> {
  await ensureWeekdayMessageTables(pool);
  const [ask14, ask30, prog] = await Promise.all([
    countAskTurns(pool, userId, 14),
    countAskTurns(pool, userId, 30),
    pool.query(`SELECT level_up_json FROM hipaa_training_progress WHERE user_id = $1`, [userId]),
  ]);
  const practiceLifetime = practiceLifetimeFromLevelUp(prog.rows[0]?.level_up_json);
  const segment = classifyUsageSegment({
    askTurnsLast14d: ask14,
    askTurnsLast30d: ask30,
    practiceLifetime,
  });
  return {
    askTurnsLast14d: ask14,
    askTurnsLast30d: ask30,
    practiceLifetime,
    segment,
  };
}

export type WeekdayRecipient = {
  userId: string;
  email: string;
  firstName: string;
  segment: UsageSegment;
  askTurnsLast14d: number;
  askTurnsLast30d: number;
  practiceLifetime: number;
  alreadySent: boolean;
};

export async function listWeekdayRecipients(
  pool: pg.Pool,
  opts: {
    sendDate: string;
    theme: WeekdayTheme;
    userId?: string;
    includeAlreadySent?: boolean;
  },
): Promise<WeekdayRecipient[]> {
  await ensureWeekdayMessageTables(pool);
  const params: unknown[] = [opts.sendDate, opts.theme];
  let userFilter = "";
  if (opts.userId) {
    params.push(opts.userId);
    userFilter = ` AND u.id = $${params.length}`;
  }

  const r = await pool.query(
    `SELECT u.id, u.email, u.name,
            p.level_up_json,
            (s.id IS NOT NULL) AS already_sent
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     LEFT JOIN siya_weekday_message_sends s
       ON s.user_id = u.id AND s.send_date = $1::date AND s.theme = $2
     WHERE u.deactivated_at IS NULL
       AND u.last_login_at IS NOT NULL
       ${userFilter}
     ORDER BY u.email ASC`,
    params,
  );

  const out: WeekdayRecipient[] = [];
  for (const row of r.rows) {
    if (row.already_sent && !opts.includeAlreadySent) continue;
    const ask14 = await countAskTurns(pool, row.id as string, 14);
    const ask30 = await countAskTurns(pool, row.id as string, 30);
    const practiceLifetime = practiceLifetimeFromLevelUp(row.level_up_json);
    const segment = classifyUsageSegment({
      askTurnsLast14d: ask14,
      askTurnsLast30d: ask30,
      practiceLifetime,
    });
    const name = (row.name as string | null)?.trim() || "";
    const firstName = name.split(/\s+/)[0] || row.email?.toString().split("@")[0] || "there";
    out.push({
      userId: row.id as string,
      email: row.email as string,
      firstName,
      segment,
      askTurnsLast14d: ask14,
      askTurnsLast30d: ask30,
      practiceLifetime,
      alreadySent: Boolean(row.already_sent),
    });
  }
  return out;
}

export async function markWeekdayMessageSent(
  pool: pg.Pool,
  opts: {
    userId: string;
    sendDate: string;
    theme: WeekdayTheme;
    segment: UsageSegment;
    resendId?: string | null;
  },
): Promise<void> {
  await ensureWeekdayMessageTables(pool);
  await pool.query(
    `INSERT INTO siya_weekday_message_sends (id, user_id, send_date, theme, segment, resend_id)
     VALUES ($1, $2, $3::date, $4, $5, $6)
     ON CONFLICT (user_id, send_date, theme) DO NOTHING`,
    [randomUUID(), opts.userId, opts.sendDate, opts.theme, opts.segment, opts.resendId ?? null],
  );
}

export { ALL_THEMES };
