import type pg from "pg";
import { buildTeamPulse } from "./team-pulse.js";
import { ensureAssistTelemetryTables, countOpenGapsSince, countNegativeFeedbackSince } from "./assist-telemetry.js";

export type BriefingConfidence = "high" | "medium" | "low";

export type ExecutiveCardMeta = {
  confidence: BriefingConfidence;
  freshnessSeconds: number;
  evidenceCount: number;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
};

export type ExecutiveBriefingPayload = {
  generatedAt: string;
  greetingName: string | null;
  cards: {
    teamCoverage: ExecutiveCardMeta & {
      working: number;
      focus: number;
      onBreak: number;
      onShift: number;
    };
    overdueWork: ExecutiveCardMeta & {
      total: number;
      critical: number;
      boardHref: string;
    };
    knowledgeHealth: ExecutiveCardMeta & {
      unansweredQuestions: number;
      negativeResponses: number;
      pendingPromotions: number;
    };
    needsAttention: ExecutiveCardMeta & {
      total: number;
      groups: { label: string; items: string[] }[];
    };
  };
};

function weekAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function isExecutiveUser(email: string, role: string): boolean {
  const list = process.env.SIYA_EXECUTIVE_USER_EMAILS?.trim();
  if (list) {
    const allowed = list.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    return allowed.includes(email.trim().toLowerCase());
  }
  return role === "admin";
}

export async function buildExecutiveBriefing(
  pool: pg.Pool,
  user: { email: string; name: string | null },
): Promise<ExecutiveBriefingPayload> {
  const t0 = Date.now();
  await ensureAssistTelemetryTables(pool);
  const { ensureTaskTablesReady, getTaskBoard } = await import("./task-service.js");
  await ensureTaskTablesReady(pool);

  const pulse = await buildTeamPulse(pool);
  const freshnessSeconds = Math.max(0, Math.round((Date.now() - new Date(pulse.generatedAt).getTime()) / 1000));

  const overdueTasks = await getTaskBoard(pool, { overdue: true });
  const critical = overdueTasks.filter((t) => t.priority === "urgent" || t.priority === "high").length;

  const sinceWeek = weekAgo();
  const unansweredQuestions = await countOpenGapsSince(pool, sinceWeek);
  const negativeResponses = await countNegativeFeedbackSince(pool, sinceWeek);

  const sopPending = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_sops WHERE status = 'pending_review'`,
  );
  const sopCount = sopPending.rows[0]?.c ?? 0;

  let memoryPromotions = 0;
  try {
    const mem = await pool.query(
      `SELECT COUNT(*)::int AS c FROM siya_memory_entries
       WHERE source = 'decision' AND importance >= 2
       AND created_at >= $1`,
      [sinceWeek],
    );
    memoryPromotions = mem.rows[0]?.c ?? 0;
  } catch {
    memoryPromotions = 0;
  }
  const pendingPromotions = sopCount + memoryPromotions;

  const oldOverdue = overdueTasks.filter((t) => {
    const due = new Date(t.dueDate);
    return due < daysAgo(7);
  });

  const trainingRows = await pool.query(
    `SELECT u.id, p.progress
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     WHERE u.deactivated_at IS NULL`,
  );
  let trainingOutstanding = 0;
  for (const row of trainingRows.rows) {
    const progress = row.progress as { modulesCompleted?: string[] } | null;
    const done = progress?.modulesCompleted?.length ?? 0;
    if (done < 1) trainingOutstanding += 1;
  }

  const knowledgeGroups: { label: string; items: string[] }[] = [];
  const knowledgeItems: string[] = [];
  if (sopCount) knowledgeItems.push(`${sopCount} SOP review${sopCount === 1 ? "" : "s"}`);
  if (memoryPromotions) knowledgeItems.push(`${memoryPromotions} recorded decision${memoryPromotions === 1 ? "" : "s"} to review`);
  if (knowledgeItems.length) knowledgeGroups.push({ label: "Knowledge", items: knowledgeItems });

  const opsItems: string[] = [];
  if (oldOverdue.length) opsItems.push(`${oldOverdue.length} overdue > 7 days`);
  const unassignedHigh = overdueTasks.filter((t) => t.priority === "urgent").length;
  if (unassignedHigh) opsItems.push(`${unassignedHigh} critical overdue item${unassignedHigh === 1 ? "" : "s"}`);
  if (opsItems.length) knowledgeGroups.push({ label: "Operations", items: opsItems });

  const peopleItems: string[] = [];
  if (trainingOutstanding) peopleItems.push(`${trainingOutstanding} training not started`);
  if (peopleItems.length) knowledgeGroups.push({ label: "People", items: peopleItems });

  const attentionTotal = knowledgeItems.length + opsItems.length + peopleItems.length;

  const gapConfidence: BriefingConfidence =
    unansweredQuestions + negativeResponses > 0 ? "medium" : negativeResponses === 0 && unansweredQuestions === 0 ? "high" : "low";

  const topDept =
    unansweredQuestions > 0
      ? "Reimbursement and internal workflows are common themes — review open gaps in Ask."
      : "No open gaps logged this week — keep monitoring 👎 feedback.";

  return {
    generatedAt: new Date().toISOString(),
    greetingName: user.name?.trim().split(/\s+/)[0] ?? null,
    cards: {
      teamCoverage: {
        working: pulse.live.working,
        focus: pulse.live.inFocus,
        onBreak: pulse.live.onBreak,
        onShift: pulse.live.onShift,
        confidence: "high",
        freshnessSeconds,
        evidenceCount: pulse.members.length,
        whatHappened: `${pulse.live.working} working, ${pulse.live.inFocus} in focus, ${pulse.live.onBreak} on break.`,
        whyItMatters: "Coverage is the first question every morning: can the team carry today’s work?",
        recommendedAction:
          pulse.live.offShift > pulse.live.onShift
            ? "Open Team and nudge anyone expected on shift to tap Start shift."
            : "Scan Team for uneven task load before assigning new work.",
      },
      overdueWork: {
        total: overdueTasks.length,
        critical,
        boardHref: "/admin/tasks?overdue=1",
        confidence: "high",
        freshnessSeconds,
        evidenceCount: overdueTasks.length,
        whatHappened: `${overdueTasks.length} task${overdueTasks.length === 1 ? "" : "s"} overdue${critical ? ` (${critical} critical).` : "."}`,
        whyItMatters: "Overdue work compounds — clients and teammates wait on judgment, not more tools.",
        recommendedAction:
          critical > 0
            ? "Review critical overdue items on the task board before creating new assignments."
            : "Clear the oldest overdue tasks or re-date with owners in Admin → Tasks.",
      },
      knowledgeHealth: {
        unansweredQuestions,
        negativeResponses,
        pendingPromotions,
        confidence: gapConfidence,
        freshnessSeconds,
        evidenceCount: unansweredQuestions + negativeResponses + pendingPromotions,
        whatHappened: `${unansweredQuestions} unanswered question${unansweredQuestions === 1 ? "" : "s"} and ${negativeResponses} 👎 response${negativeResponses === 1 ? "" : "s"} this week.`,
        whyItMatters: topDept,
        recommendedAction:
          unansweredQuestions > 0
            ? "Open Ask → Knowledge mode and review reimbursement / workflow SOPs for gaps."
            : "Review pending SOP promotions in Admin → SOP review.",
      },
      needsAttention: {
        total: attentionTotal,
        groups: knowledgeGroups,
        confidence: attentionTotal ? "medium" : "high",
        freshnessSeconds,
        evidenceCount: attentionTotal,
        whatHappened:
          attentionTotal > 0
            ? `${attentionTotal} item${attentionTotal === 1 ? "" : "s"} need your judgment across knowledge, ops, and people.`
            : "No queued judgment items detected from current signals.",
        whyItMatters: "Leadership time belongs on judgment, not object hunting in five admin screens.",
        recommendedAction:
          sopCount > 0
            ? "Start with SOP reviews — they unlock safer answers for the whole team."
            : oldOverdue.length > 0
              ? "Triage overdue > 7 days before approving new work in Ask."
              : "Ask: “What needs my attention?” for a conversational walkthrough.",
      },
    },
  };
}
