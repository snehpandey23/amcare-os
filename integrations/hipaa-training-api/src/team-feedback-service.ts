/**
 * Feedback Friday — peer/lead feedback with per-submission anonymity.
 * Recipient-facing DTOs must never include giver identity when anonymous.
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
let ensured = false;

export type FeedbackTargetKind = "peer" | "lead";
export type FeedbackStatus = "delivered" | "rejected" | "flagged";

/** What the recipient (and normal admin inbox views) may see. */
export type RecipientFacingFeedback = {
  id: string;
  body: string;
  targetKind: FeedbackTargetKind;
  createdAt: string;
  attribution:
    | { mode: "named"; displayName: string }
    | { mode: "anonymous" };
};

/** Abuse-investigation only — never use for recipient UI. */
export type ModerationFeedback = RecipientFacingFeedback & {
  status: FeedbackStatus;
  rejectReason: string | null;
  giver: { userId: string; email: string; name: string | null };
  recipient: { userId: string; email: string; name: string | null };
};

export type DirectoryPerson = {
  id: string;
  name: string | null;
  email: string;
  kind: FeedbackTargetKind;
  leadDepartments?: string[];
};

const HARASS =
  /\b(kill\s+yourself|kys|die\s+bitch|fuck\s+you|stupid\s+(bitch|whore|cunt)|rape\s+you|go\s+die)\b|[^\w](cunt|nigg[ae]r|retard)[^\w]/i;

const PROFANITY_HEAVY =
  /\b(fuck+|shit+|asshole|motherfuck|bastard|whore|slut)\b/i;

export function assessFeedbackBody(body: string): { ok: true } | { ok: false; reason: string } {
  const t = body.replace(/\s+/g, " ").trim();
  if (t.length < 8) return { ok: false, reason: "Write a little more so it’s useful feedback (a short sentence is enough)." };
  if (t.length > 2000) return { ok: false, reason: "Please keep feedback under 2000 characters." };
  if (HARASS.test(` ${t} `)) {
    return { ok: false, reason: "That reads as harassment, not feedback. Please rephrase to something constructive." };
  }
  // Heavy profanity alone → flag path handled by caller; still block pure insults
  if (PROFANITY_HEAVY.test(t) && t.split(/\s+/).length < 6) {
    return { ok: false, reason: "That looks like an insult, not feedback. Add what you’d like them to try differently." };
  }
  return { ok: true };
}

export async function ensureTeamFeedbackTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "team-feedback-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

function rowToRecipientFacing(row: Record<string, unknown>): RecipientFacingFeedback {
  const anonymous = Boolean(row.anonymous);
  const attribution: RecipientFacingFeedback["attribution"] = anonymous
    ? { mode: "anonymous" }
    : { mode: "named", displayName: String(row.revealed_display_name || "A teammate") };
  return {
    id: String(row.id),
    body: String(row.body || ""),
    targetKind: row.target_kind === "lead" ? "lead" : "peer",
    createdAt: new Date(row.created_at as string).toISOString(),
    attribution,
  };
}

/** Fail-closed: strip any accidental giver fields from a plain object. */
export function assertNoGiverLeak(payload: unknown, giverEmail?: string, giverName?: string): void {
  const s = JSON.stringify(payload);
  if (/giverUserId|giver_user_id|"giver"\s*:/i.test(s)) {
    throw new Error("Recipient payload must not include giver identity fields");
  }
  if (giverEmail && s.toLowerCase().includes(giverEmail.toLowerCase())) {
    throw new Error("Recipient payload must not include giver email");
  }
  if (giverName && giverName.trim().length >= 3 && s.toLowerCase().includes(giverName.trim().toLowerCase())) {
    throw new Error("Recipient payload must not include giver name");
  }
}

export async function listFeedbackDirectory(
  pool: pg.Pool,
  viewerUserId: string,
): Promise<{ peers: DirectoryPerson[]; leads: DirectoryPerson[] }> {
  await ensureTeamFeedbackTables(pool);
  const { listDepartmentLeads } = await import("./sop-service.js");
  const leads = await listDepartmentLeads(pool);
  const leadByUser = new Map<string, string[]>();
  for (const l of leads) {
    if (!l.userId) continue;
    const arr = leadByUser.get(l.userId) || [];
    arr.push(l.department);
    leadByUser.set(l.userId, arr);
  }

  const r = await pool.query(
    `SELECT id, name, email FROM hipaa_training_users
     WHERE deactivated_at IS NULL AND id <> $1
     ORDER BY COALESCE(name, email) ASC`,
    [viewerUserId],
  );

  const peers: DirectoryPerson[] = [];
  const leadPeople: DirectoryPerson[] = [];
  const seenLead = new Set<string>();

  for (const row of r.rows) {
    const id = row.id as string;
    const person: DirectoryPerson = {
      id,
      name: (row.name as string) ?? null,
      email: row.email as string,
      kind: "peer",
    };
    peers.push(person);
    const depts = leadByUser.get(id);
    if (depts?.length && !seenLead.has(id)) {
      seenLead.add(id);
      leadPeople.push({
        ...person,
        kind: "lead",
        leadDepartments: depts,
      });
    }
  }

  return { peers, leads: leadPeople };
}

export async function submitTeamFeedback(
  pool: pg.Pool,
  opts: {
    giverUserId: string;
    recipientUserId: string;
    targetKind: FeedbackTargetKind;
    body: string;
    anonymous: boolean;
  },
): Promise<
  | { ok: true; status: "delivered"; feedback: RecipientFacingFeedback }
  | { ok: false; status: "rejected"; reason: string }
> {
  await ensureTeamFeedbackTables(pool);
  if (opts.giverUserId === opts.recipientUserId) {
    return { ok: false, status: "rejected", reason: "Pick a teammate — you can’t send feedback to yourself." };
  }

  const assessed = assessFeedbackBody(opts.body);
  if (!assessed.ok) {
    return { ok: false, status: "rejected", reason: assessed.reason };
  }

  const recip = await pool.query(
    `SELECT id FROM hipaa_training_users WHERE id = $1 AND deactivated_at IS NULL`,
    [opts.recipientUserId],
  );
  if (!recip.rows[0]) {
    return { ok: false, status: "rejected", reason: "That teammate isn’t available." };
  }

  if (opts.targetKind === "lead") {
    const { listDepartmentLeads } = await import("./sop-service.js");
    const leads = await listDepartmentLeads(pool);
    const isLead = leads.some((l) => l.userId === opts.recipientUserId);
    if (!isLead) {
      return { ok: false, status: "rejected", reason: "That person isn’t listed as a department lead. Choose Peer, or pick someone from Leads." };
    }
  }

  let revealed: string | null = null;
  if (!opts.anonymous) {
    const g = await pool.query(`SELECT name, email FROM hipaa_training_users WHERE id = $1`, [opts.giverUserId]);
    const name = (g.rows[0]?.name as string | null) || null;
    const email = (g.rows[0]?.email as string) || "";
    revealed = (name && name.trim()) || email.split("@")[0] || "A teammate";
  }

  const id = `tfb-${randomUUID()}`;
  const body = opts.body.replace(/\s+/g, " ").trim();

  const ins = await pool.query(
    `INSERT INTO siya_team_feedback
       (id, recipient_user_id, giver_user_id, target_kind, body, anonymous, revealed_display_name, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'delivered')
     RETURNING *`,
    [id, opts.recipientUserId, opts.giverUserId, opts.targetKind, body, opts.anonymous, revealed],
  );

  const facing = rowToRecipientFacing(ins.rows[0] as Record<string, unknown>);
  if (opts.anonymous) {
    const g = await pool.query(`SELECT name, email FROM hipaa_training_users WHERE id = $1`, [opts.giverUserId]);
    assertNoGiverLeak(facing, g.rows[0]?.email as string | undefined, g.rows[0]?.name as string | undefined);
  }

  return { ok: true, status: "delivered", feedback: facing };
}

export async function listInboxForRecipient(
  pool: pg.Pool,
  recipientUserId: string,
): Promise<RecipientFacingFeedback[]> {
  await ensureTeamFeedbackTables(pool);
  const r = await pool.query(
    `SELECT id, body, target_kind, anonymous, revealed_display_name, created_at
     FROM siya_team_feedback
     WHERE recipient_user_id = $1 AND status = 'delivered'
     ORDER BY created_at DESC
     LIMIT 100`,
    [recipientUserId],
  );
  return r.rows.map((row) => rowToRecipientFacing(row as Record<string, unknown>));
}

export async function getFeedbackForModeration(
  pool: pg.Pool,
  id: string,
): Promise<ModerationFeedback | null> {
  await ensureTeamFeedbackTables(pool);
  const r = await pool.query(
    `SELECT f.*,
            g.email AS giver_email, g.name AS giver_name,
            r.email AS recipient_email, r.name AS recipient_name
     FROM siya_team_feedback f
     JOIN hipaa_training_users g ON g.id = f.giver_user_id
     JOIN hipaa_training_users r ON r.id = f.recipient_user_id
     WHERE f.id = $1`,
    [id],
  );
  const row = r.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const facing = rowToRecipientFacing(row);
  return {
    ...facing,
    status: (row.status as FeedbackStatus) || "delivered",
    rejectReason: (row.reject_reason as string) || null,
    giver: {
      userId: String(row.giver_user_id),
      email: String(row.giver_email),
      name: (row.giver_name as string) ?? null,
    },
    recipient: {
      userId: String(row.recipient_user_id),
      email: String(row.recipient_email),
      name: (row.recipient_name as string) ?? null,
    },
  };
}
