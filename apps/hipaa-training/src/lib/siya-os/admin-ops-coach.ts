/**
 * Admin co-pilot: plan the day, priorities, task visibility, lightweight assign-from-chat.
 * Complements KB help desk — does not replace Admin task board UI.
 */

import type { TaskRecord, TaskPriority } from "@/lib/tasks-types";
import { taskIsComplete } from "@/lib/tasks-types";
import type { AdminOpsSnapshot } from "./admin-ops-snapshot";
import { synthesizeAdminOpsAnswer } from "./admin-ops-llm";

export type AdminOpsIntent =
  | { kind: "plan_day" }
  | { kind: "team_pulse" }
  | { kind: "task_status" }
  | { kind: "overdue" }
  | { kind: "create_task"; title: string; assigneeHint: string; priority?: TaskPriority }
  | { kind: "ops_brief" };

export type AdminOpsReply = {
  message: string;
  links: { label: string; href: string }[];
  intent: AdminOpsIntent["kind"];
  mode?: "inform" | "recommend" | "execute";
  pendingTask?: {
    title: string;
    assigneeId: string;
    assigneeLabel: string;
    priority: string;
    dueDate: string;
  };
  taskCreated?: { id: string; title: string };
};

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function detectAdminOpsIntent(message: string): AdminOpsIntent | null {
  const t = message.trim().toLowerCase();
  if (!t) return null;

  const create =
    /(?:assign|create|add|give)\s+(?:a\s+)?task(?:\s+(?:to|for)\s+([^:]+))?[:\s]+(.+)/i.exec(message) ||
    /task\s+for\s+([^:]+):\s*(.+)/i.exec(message);
  if (create) {
    const assigneeHint = (create[1] ?? "me").trim();
    const title = (create[2] ?? create[1]).trim();
    if (title.length >= 3) {
      let priority: TaskPriority | undefined;
      if (/\burgent\b/i.test(message)) priority = "urgent";
      else if (/\bhigh priority\b/i.test(message)) priority = "high";
      return { kind: "create_task", title, assigneeHint, priority };
    }
  }

  if (
    /\b(plan|prioriti[sz]e|focus|my day|run my day|what should i do|morning brief|daily plan)\b/.test(
      t,
    )
  ) {
    return { kind: "plan_day" };
  }
  if (/\b(who('s| is) (on|working|online)|team pulse|who's on shift|coverage)\b/.test(t)) {
    return { kind: "team_pulse" };
  }
  if (/\b(overdue|past due|late tasks|slipping)\b/.test(t)) {
    return { kind: "overdue" };
  }
  if (/\b(task board|open tasks|assignments|track tasks|company tasks|ops status)\b/.test(t)) {
    return { kind: "task_status" };
  }
  if (
    /\b(company ops|run (the )?company|operations (today|brief)|leadership brief|overall ops)\b/.test(
      t,
    )
  ) {
    return { kind: "ops_brief" };
  }

  return null;
}

function sortByPriority(tasks: TaskRecord[]): TaskRecord[] {
  return [...tasks].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      a.dueDate.localeCompare(b.dueDate),
  );
}

function openMyTasks(tasks: TaskRecord[]): TaskRecord[] {
  return tasks.filter((t) => !taskIsComplete(t));
}

function formatTaskLine(t: TaskRecord, showAssignee = false): string {
  const who =
    showAssignee && (t.assigneeName || t.assigneeEmail)
      ? ` → ${t.assigneeName || t.assigneeEmail}`
      : "";
  return `• **${t.title}** (${t.priority}, due ${t.dueDate})${who}`;
}

function resolveAssignee(
  hint: string,
  snapshot: AdminOpsSnapshot,
): { id: string; label: string } | null {
  const h = hint.trim().toLowerCase();
  if (!h || h === "me" || h === "myself" || h === "admin") {
    return {
      id: snapshot.user.id,
      label: snapshot.user.name || snapshot.user.email,
    };
  }
  const byEmail = snapshot.roster.find((m) => m.email.toLowerCase() === h);
  if (byEmail) return { id: byEmail.id, label: byEmail.name || byEmail.email };
  const partial = snapshot.roster.filter(
    (m) =>
      m.email.toLowerCase().includes(h) ||
      (m.name && m.name.toLowerCase().includes(h)) ||
      (m.name && m.name.toLowerCase().split(/\s+/).some((p) => p.startsWith(h))),
  );
  if (partial.length === 1) {
    return { id: partial[0].id, label: partial[0].name || partial[0].email };
  }
  return null;
}

function planDayMessage(snapshot: AdminOpsSnapshot): string {
  const mine = sortByPriority(openMyTasks(snapshot.myTasks));
  const overdue = sortByPriority(snapshot.boardOverdue);
  const live = snapshot.pulse?.live;

  let msg = `**Your ops snapshot** (${snapshot.date})\n\n`;

  if (live) {
    msg += `**Team now:** ${live.working} working · ${live.onBreak} on break · ${live.inFocus} focus · ${live.offShift} off shift\n\n`;
  }

  if (overdue.length) {
    msg += `**Overdue (${overdue.length}) — needs attention:**\n`;
    overdue.slice(0, 8).forEach((t) => {
      msg += `${formatTaskLine(t, true)}\n`;
    });
    if (overdue.length > 8) msg += `_…and ${overdue.length - 8} more on the board._\n`;
    msg += "\n";
  }

  if (mine.length) {
    msg += `**Your priorities today:**\n`;
    mine.slice(0, 6).forEach((t) => {
      msg += `${formatTaskLine(t)}\n`;
    });
  } else {
    msg += `**Your My day:** no open tasks — good time to clear overdue items or assign follow-ups.\n`;
  }

  msg +=
    "\n**Suggested focus:** tackle overdue + urgent first, then your top My day items. Use the task board to reassign or add ad-hoc work.\n";
  msg +=
    "\nAsk me to **assign a task to [name]: [title]**, **who's working**, or any **policy/SOP** question — I'll mix live ops with approved guides.";

  return msg;
}

function teamPulseMessage(snapshot: AdminOpsSnapshot): string {
  const p = snapshot.pulse;
  if (!p) return "I couldn't load team presence. Open **Team** on My day or try again in a moment.";
  let msg = `**Team pulse** (${p.date})\n\n`;
  msg += `Working ${p.live.working} · Break ${p.live.onBreak} · Focus ${p.live.inFocus} · On shift ${p.live.onShift} · Off ${p.live.offShift}\n\n`;
  const active = p.members.filter((m) => m.onShift);
  if (active.length) {
    msg += "**On shift now:**\n";
    for (const m of active.slice(0, 12)) {
      const tasks =
        m.taskTitles.length > 0
          ? ` — ${m.openTasksToday} open: ${m.taskTitles.slice(0, 2).join("; ")}`
          : "";
      msg += `• ${m.name || m.email}${tasks}\n`;
    }
  } else {
    msg += "No one is marked on shift right now. They can tap **Start shift** on My day.\n";
  }
  return msg;
}

function taskStatusMessage(snapshot: AdminOpsSnapshot): string {
  const open = sortByPriority(snapshot.boardOpen);
  const overdue = snapshot.boardOverdue.length;
  let msg = `**Task board:** ${open.length} open/in progress company-wide`;
  if (overdue) msg += ` · **${overdue} overdue**`;
  msg += "\n\n";
  if (open.length) {
    open.slice(0, 10).forEach((t) => {
      msg += `${formatTaskLine(t, true)}\n`;
    });
    if (open.length > 10) msg += `_…${open.length - 10} more on the board._\n`;
  } else {
    msg += "No open tasks on the board.\n";
  }
  return msg;
}

function overdueMessage(snapshot: AdminOpsSnapshot): string {
  const overdue = sortByPriority(snapshot.boardOverdue);
  if (!overdue.length) {
    return "**No overdue tasks** on the board right now. Ask **plan my day** for priorities or **assign task to [person]: [title]** to add work.";
  }
  let msg = `**${overdue.length} overdue task(s):**\n\n`;
  overdue.slice(0, 12).forEach((t) => {
    msg += `${formatTaskLine(t, true)}\n`;
  });
  msg += "\nOpen the task board to reassign dates or mark done.";
  return msg;
}

function opsBriefMessage(snapshot: AdminOpsSnapshot): string {
  return `${planDayMessage(snapshot)}\n\n---\n\n**Board summary:** ${snapshot.boardOpen.length} active · ${snapshot.boardOverdue.length} overdue.`;
}

function defaultLinks(intent: AdminOpsIntent["kind"]): { label: string; href: string }[] {
  const links = [
    { label: "My day", href: "/" },
    { label: "Task board", href: "/admin/tasks" },
    { label: "Team", href: "/team" },
  ];
  if (intent === "team_pulse") return [{ label: "Team", href: "/team" }, ...links.slice(1)];
  return links;
}

export async function runAdminOpsCoach(
  message: string,
  snapshot: AdminOpsSnapshot,
  token: string,
  history: { role: string; content: string }[],
): Promise<AdminOpsReply | null> {
  const intent = detectAdminOpsIntent(message);
  if (!intent) return null;

  if (intent.kind === "create_task") {
    const assignee = resolveAssignee(intent.assigneeHint, snapshot);
    if (!assignee) {
      return {
        intent: intent.kind,
        message:
          `I couldn't match **"${intent.assigneeHint}"** to one teammate. Use their **email** or a unique first name, e.g.\n\n` +
          `**Assign task to alex@company.com: Review chargebacks**\n\n` +
          `**Roster:** ${snapshot.roster
            .slice(0, 8)
            .map((m) => m.name || m.email)
            .join(" · ")}${snapshot.roster.length > 8 ? " …" : ""}`,
        links: defaultLinks("task_status"),
        mode: "inform",
      };
    }
    return {
      intent: intent.kind,
      mode: "recommend",
      message:
        `## Proposed plan\n\n` +
        `**Assign task** to **${assignee.label}**:\n\n` +
        `• **${intent.title}** (${intent.priority ?? "medium"}, due ${snapshot.date})\n\n` +
        `Approve to create this on the task board. They will see it on **My day**.`,
      links: [
        { label: "Task board", href: "/admin/tasks" },
        { label: "My day", href: "/" },
      ],
      pendingTask: {
        title: intent.title,
        assigneeId: assignee.id,
        assigneeLabel: assignee.label,
        priority: intent.priority ?? "medium",
        dueDate: snapshot.date,
      },
    };
  }

  let messageOut: string;
  switch (intent.kind) {
    case "plan_day":
      messageOut = planDayMessage(snapshot);
      break;
    case "team_pulse":
      messageOut = teamPulseMessage(snapshot);
      break;
    case "task_status":
      messageOut = taskStatusMessage(snapshot);
      break;
    case "overdue":
      messageOut = overdueMessage(snapshot);
      break;
    case "ops_brief":
      messageOut = opsBriefMessage(snapshot);
      break;
    default:
      return null;
  }

  const llm = await synthesizeAdminOpsAnswer({
    userMessage: message,
    intent: intent.kind,
    snapshotSummary: messageOut,
    history,
  });
  if (llm) messageOut = llm;

  return {
    intent: intent.kind,
    message: messageOut,
    links: defaultLinks(intent.kind),
  };
}
