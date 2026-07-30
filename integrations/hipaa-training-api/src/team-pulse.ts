import type pg from "pg";
import { buildLiveTeamRoster, istDateLabel } from "./shift-dashboard.js";

export type TeamPulseMember = {
  id: string;
  name: string | null;
  email: string;
  onShift: boolean;
  presence: "working" | "break" | "focus" | null;
  openTasksToday: number;
  taskTitles: string[];
};

export type TeamPulsePayload = {
  date: string;
  timezone: string;
  generatedAt: string;
  live: {
    working: number;
    onBreak: number;
    inFocus: number;
    onShift: number;
    offShift: number;
  };
  members: TeamPulseMember[];
};

function normalizePresence(raw: string | null): "working" | "break" | "focus" | null {
  if (raw === "break" || raw === "focus") return raw;
  if (raw === "working" || raw === "available") return "working";
  return raw ? "working" : null;
}

function presenceSortKey(m: TeamPulseMember): number {
  if (!m.onShift) return 4;
  if (m.presence === "focus") return 0;
  if (m.presence === "working") return 1;
  if (m.presence === "break") return 2;
  return 3;
}

/** Shared team board — presence + today's open tasks (all signed-in staff). */
export async function buildTeamPulse(pool: pg.Pool): Promise<TeamPulsePayload> {
  const opsDate = istDateLabel(new Date());
  const { ensureTaskTablesReady } = await import("./task-service.js");
  await ensureTaskTablesReady(pool);
  const { maybeSyncKnowledgeWorkToDailyBoard } = await import("./knowledge-sync-throttle.js");
  await maybeSyncKnowledgeWorkToDailyBoard(pool, opsDate);

  const liveMembers = await buildLiveTeamRoster(pool);
  const taskRows = await pool.query(
    `SELECT t.assignee_id, t.title, t.status
     FROM siya_tasks t
     JOIN hipaa_training_users u ON u.id = t.assignee_id
     WHERE t.due_date = $1::date AND u.deactivated_at IS NULL
     ORDER BY t.priority DESC, t.due_time NULLS LAST, t.created_at ASC`,
    [opsDate],
  );

  const tasksByUser = new Map<string, { open: string[]; openCount: number }>();
  for (const row of taskRows.rows) {
    const uid = row.assignee_id as string;
    const status = row.status as string;
    let bucket = tasksByUser.get(uid);
    if (!bucket) {
      bucket = { open: [], openCount: 0 };
      tasksByUser.set(uid, bucket);
    }
    if (status !== "done" && status !== "cancelled") {
      bucket.openCount += 1;
      if (bucket.open.length < 4) bucket.open.push(row.title as string);
    }
  }

  const members: TeamPulseMember[] = liveMembers.map((m) => {
    const tasks = tasksByUser.get(m.id);
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      onShift: m.onShift,
      presence: m.onShift ? normalizePresence(m.presence) : null,
      openTasksToday: tasks?.openCount ?? 0,
      taskTitles: tasks?.open ?? [],
    };
  });

  members.sort((a, b) => {
    const d = presenceSortKey(a) - presenceSortKey(b);
    if (d !== 0) return d;
    const an = (a.name ?? a.email).toLowerCase();
    const bn = (b.name ?? b.email).toLowerCase();
    return an.localeCompare(bn);
  });

  const onShift = members.filter((m) => m.onShift).length;
  const onBreak = members.filter((m) => m.onShift && m.presence === "break").length;
  const inFocus = members.filter((m) => m.onShift && m.presence === "focus").length;
  const working = members.filter((m) => m.onShift && m.presence === "working").length;

  return {
    date: opsDate,
    timezone: "Asia/Kolkata",
    generatedAt: new Date().toISOString(),
    live: {
      working,
      onBreak,
      inFocus,
      onShift,
      offShift: members.length - onShift,
    },
    members,
  };
}
