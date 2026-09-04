/**
 * Admin co-pilot: plan the day, priorities, task visibility, lightweight assign-from-chat.
 * Complements KB help desk — does not replace Admin task board UI.
 */

import type { TaskRecord, TaskPriority } from "@/lib/tasks-types";
import { taskIsComplete } from "@/lib/tasks-types";
import type { AdminOpsSnapshot } from "./admin-ops-snapshot";
import { synthesizeAdminOpsAnswer } from "./admin-ops-llm";
import { isStaffWorkplaceConcernQuery } from "./flows";
import { isOpsTestAccount } from "@/lib/ops-dashboard-view";

/** Staff how-to: patient asks for manager — must not steal into Daily Plan. */
export function isPatientManagerRequestQuery(message: string): boolean {
  const t = message.trim().toLowerCase();
  return (
    /\b(patient|caller|they|he|she).{0,40}\b(want|wants|ask|asked|asking|request|requested).{0,30}\b(manager|supervisor)\b/.test(
      t,
    ) ||
    /\b(speak|talk|transfer).{0,20}\b(to\s+)?(a\s+)?(manager|supervisor)\b/.test(t) ||
    /\bask(ed|ing)?\s+for\s+(a\s+)?(manager|supervisor)\b/.test(t)
  );
}

/** Naming / chrome questions about My day — must not steal into Daily Plan. */
export function isMyDayNamingQuery(message: string): boolean {
  const t = message.trim().toLowerCase();
  return (
    /\bwhy\s+(do\s+you\s+|did\s+you\s+|is\s+it\s+|we\s+)?(call|name|label)\s+(it\s+)?my\s+day\b/.test(t) ||
    /\bwhy\s+(is|was)\s+(it\s+)?called\s+my\s+day\b/.test(t) ||
    /\bwhat\s+(does|is)\s+my\s+day\s+mean\b/.test(t) ||
    /\bwhy\s+my\s+day\b/.test(t) ||
    /\b(meaning|name)\s+of\s+my\s+day\b/.test(t)
  );
}

export type AdminOpsIntent =
  | { kind: "plan_day" }
  | { kind: "team_pulse" }
  | { kind: "task_status" }
  | { kind: "overdue" }
  | { kind: "create_task"; title: string; assigneeHint: string; priority?: TaskPriority }
  | { kind: "ops_brief" }
  /** Staff usage / engagement metrics → Ops dashboard Section A (not live presence). */
  | { kind: "ops_engagement" };

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

/** Informal dictation → presence matching (r→are, loggin→logging). */
export function normalizePresenceAskText(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .replace(/\bloggin\b/g, "logging")
    .replace(/\br\b/g, "are")
    .replace(/\s+/g, " ")
    .trim();
}

const PRESENCE_STATUS =
  "(?:working|online|present|here|active|around|available|logged\\s*in|logging\\s*in|log\\s*in|on(?:\\s+the)?\\s+(?:clock|shift|floor)|currently\\s+working)";

/** Live who’s-on / online / logged-in asks (Team pulse). */
export function isTeamPulseAsk(message: string): boolean {
  const t = normalizePresenceAskText(message);
  if (!t) return false;
  if (/\b(team\s*pulse|coverage)\b/.test(t)) return true;
  // Short status labels (not org-chart / usage analytics).
  if (/\b(?:my\s+)?team\s+status\b/.test(t)) return true;
  if (/\b(?:my\s+)?team\s+(?:roster|presence)\b/.test(t)) return true;
  // "who all in my team" / "who all in my team are currently working"
  if (/\bwho\s+all\b[\s\S]{0,48}\bin\s+(?:my\s+)?team\b/.test(t)) return true;
  // "who's on my team" / "who's on my team right now"
  if (/\bwho(?:'s|’s| is| are)\s+on\s+(?:my\s+)?team\b/.test(t)) return true;
  // who / who all / who's … online|working|logged in|… (allow words between "all" and is/are)
  if (
    (/\bwho(?:'s|’s)?\s+(?:all\s+)?(?:is|are)\b[\s\S]{0,48}\b/.test(t) ||
      /\bwho\s+all\b[\s\S]{0,48}\b(?:is|are)\b[\s\S]{0,40}\b/.test(t)) &&
    new RegExp(`\\b${PRESENCE_STATUS}\\b`).test(t)
  ) {
    return true;
  }
  if (/\bwho(?:'s|’s| is| are)\b[\s\S]{0,40}\b(?:logged|logging)\s*in\b/.test(t)) return true;
  if (/\b(working right now|present today|on the clock|who(?:'s|’s| is) here)\b/.test(t)) return true;
  if (/\bwho(?:'s|’s| is) on(?: the)? (shift|floor|clock)\b/.test(t)) return true;
  if (/\b(?:anyone|anybody|people|staff|everyone)\b[\s\S]{0,24}\b(?:online|working|logged\s*in|present)\b/.test(t)) {
    return true;
  }
  if (/\b(?:online|logged\s*in|working)\s+(?:right\s+)?now\b/.test(t) && /\bwho\b/.test(t)) return true;
  return false;
}

/**
 * Team usage / engagement / “who’s using the OS” → Ops dashboard Section A
 * (not thumbs chrome, not live Team pulse).
 */
export function isOpsEngagementAsk(message: string): boolean {
  const t = message.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return false;
  // How-to “how do I use the OS” is not engagement analytics.
  if (/\bhow\s+(do\s+i|to|can\s+i)\s+use\b/.test(t)) return false;
  if (/\bthumbs?\s*(up|down)?\b/.test(t) && !/\b(team|staff|engagement|usage|ops)\b/.test(t)) return false;

  const osOrPortal = /\b(os|siya\s*os|portal|staff\s*(?:app|portal)|assist|siya\s*assist)\b/.test(t);
  const usageVerb =
    /\b(who(?:'s|’s| is| are)?\s+using|using|used|usage|adoption|how\s+often|engagement)\b/.test(t) ||
    /\bwho\s+all\b[\s\S]{0,40}\b(used|using|have\s+used)\b/.test(t) ||
    /\bwho\s+(has|have)\s+used\b/.test(t);
  const windowHint = /\b(last|past|this)\s+week\b|\b(7|fourteen|14|30)\s*days?\b|\brecently\b/.test(t);
  const problemsFacing =
    /\b(what\s+)?problems?\b/.test(t) && /\b(facing|have|having|they)\b/.test(t);
  const teamUsageLabel = /\b(staff|team)\s+(engagement|usage|adoption)\b/.test(t);
  const opsSectionA =
    /\bops\b/.test(t) && /\b(engagement|usage|section\s*a|dashboard)\b/.test(t);

  if (teamUsageLabel || opsSectionA) return true;
  if (osOrPortal && usageVerb) return true;
  if (osOrPortal && windowHint && /\bwho\b/.test(t)) return true;
  if (osOrPortal && problemsFacing) return true;
  if (usageVerb && problemsFacing && /\b(team|staff|people|they)\b/.test(t)) return true;
  if (/\bhow\s+often\b/.test(t) && /\b(staff|team|people|using|ask|turns?)\b/.test(t)) return true;
  return false;
}

/**
 * Ambiguous: tool login bookmarks vs who’s currently online.
 * With presence thread context → Team pulse; otherwise ask which meaning.
 */
export function isAmbiguousStaffLoginDashboardQuery(message: string): boolean {
  const t = normalizePresenceAskText(message);
  if (!t || t.length > 160) return false;
  const wantsView = /\b(dashboard|view|screen|page|see|show|check)\b/.test(t);
  const loginish = /\b(login|log\s*in|logged|logging|sign(?:ing)?\s*in|online|presence)\b/.test(t);
  const staffish = /\b(staff|team|people|everyone|employees?|roster)\b/.test(t);
  return wantsView && loginish && staffish;
}

/** Recent turns were about who’s online / on shift. */
export function historySuggestsPresenceTopic(
  history: { role: string; content: string }[],
): boolean {
  const recent = history.slice(-8);
  for (const h of recent) {
    if (h.role === "user" && (isTeamPulseAsk(h.content) || isAmbiguousStaffLoginDashboardQuery(h.content))) {
      return true;
    }
    if (
      h.role === "assistant" &&
      /\b(team pulse|on shift|who.?s online|working right now|team presence|open \*\*team\*\*|live presence)\b/i.test(
        h.content,
      )
    ) {
      return true;
    }
  }
  return false;
}

/** Short / typo continuation after a presence ask — stay on Team pulse, don’t restart as name lookup. */
export function isPresenceTopicContinuation(
  message: string,
  history: { role: string; content: string }[],
): boolean {
  if (!historySuggestsPresenceTopic(history)) return false;
  const t = normalizePresenceAskText(message);
  if (!t || t.length > 100) return false;
  if (isTeamPulseAsk(message) || isAmbiguousStaffLoginDashboardQuery(message)) return true;
  if (/\b(online|logged?\s*in|logging\s*in|log\s*in|working|present|active|around|pulse|on\s+shift)\b/.test(t)) {
    return true;
  }
  // "who is loggin in" style after presence — status words, not a person name
  if (/^who\s+is\s+/.test(t) && /\b(loggin|logging|logged|online|working|present|here|active)\b/.test(t)) {
    return true;
  }
  return false;
}

export function detectAdminOpsIntent(
  message: string,
  history: { role: string; content: string }[] = [],
): AdminOpsIntent | null {
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

  // Day-start / “what first” — staff path lists My day (not Marketing SOP dumps).
  // Never steal workplace / people concerns, patient→manager how-tos, or “why call it My day” naming.
  if (
    !isStaffWorkplaceConcernQuery(message) &&
    !isPatientManagerRequestQuery(message) &&
    !isMyDayNamingQuery(message) &&
    (
    /\b(plan|prioriti[sz]e|run my day|morning brief|daily plan)\b/.test(t) ||
    /\bwhat\s+(should|shall)\s+i\s+(do|work\s+on|focus\s+on)\b/.test(t) ||
    /\bwhat\s+(do\s+i|should\s+i|shall\s+i)\s+(do\s+)?first\b/.test(t) ||
    /\bwhat\s+should\s+my\s+job\b/.test(t) ||
    /\b(what'?s|whats)\s+my\s+job\s+(today|now)\b/.test(t) ||
    /\bmy\s+job\s+today\b/.test(t) ||
    /\bwhat\s+should\s+i\s+work\s+on\b/.test(t) ||
    /\bstart\s+(my\s+)?(work\s+)?day\b/.test(t) ||
    (/\bmy day\b/.test(t) && !/\b(personalize|personalisation|onboarding|onboard|call|name|mean|why)\b/.test(t))
  )) {
    return { kind: "plan_day" };
  }
  // Usage / engagement analytics BEFORE presence — "who's using the OS" is Ops, not Team pulse.
  if (isOpsEngagementAsk(message)) {
    return { kind: "ops_engagement" };
  }
  // Live presence / shift — hard Team pulse path (never Founder Talk portal LLM).
  // Match natural asks + typo/slang ("who all r online", "who is loggin in") + thread continuations.
  if (isTeamPulseAsk(message) || isPresenceTopicContinuation(message, history)) {
    return { kind: "team_pulse" };
  }
  // Presence-thread + "dashboard for login of staff" → stay on pulse (not Workplace links).
  if (isAmbiguousStaffLoginDashboardQuery(message) && historySuggestsPresenceTopic(history)) {
    return { kind: "team_pulse" };
  }
  if (/\b(overdue|past due|late tasks|slipping)\b/.test(t)) {
    return { kind: "overdue" };
  }
  // Personal + board visibility (staff get My day list; admins get board via snapshot).
  if (
    /\b(task board|open tasks|assignments|track tasks|company tasks|ops status)\b/.test(t) ||
    /\bwhere\s+(are|is)\s+(my|the)\s+tasks?\b/.test(t) ||
    /\b(do\s+i\s+have|have\s+i\s+got|any)\s+.{0,24}\btasks?\b/.test(t) ||
    /\btasks?\s+assigned(\s+to\s+me)?\b/.test(t) ||
    /\b(my|today'?s)\s+tasks?\b/.test(t) ||
    /\bwhat\s+tasks?\s+(do\s+i\s+have|are\s+assigned)\b/.test(t) ||
    /\bare\s+these\s+(my\s+)?tasks?\b/.test(t)
  ) {
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
  const mine = openMyTasks(snapshot.myTasks);
  if (mine.length) {
    msg += `\n**Your My day (${snapshot.date}):**\n`;
    sortByPriority(mine)
      .slice(0, 8)
      .forEach((t) => {
        msg += `${formatTaskLine(t)}\n`;
      });
  }
  return msg;
}

/** Staff (non-admin) — list today’s assigned tasks; never invent a company board. */
export function staffMyTasksReply(
  date: string,
  tasks: TaskRecord[],
): AdminOpsReply {
  const open = sortByPriority(openMyTasks(tasks));
  let message: string;
  if (!open.length) {
    message = [
      `**Your My day (${date}):** no open tasks assigned right now.`,
      "",
      "Your checklist lives on **My day** (this home), above Ask — leave **Focus** if you don’t see it.",
      "Admins assign work from the **Task board**; you check items off here when they’re done.",
    ].join("\n");
  } else {
    message =
      `**Your My day (${date}):** ${open.length} open task(s)\n\n` +
      open
        .slice(0, 12)
        .map((t) => formatTaskLine(t))
        .join("\n") +
      (open.length > 12 ? `\n_…${open.length - 12} more on My day._` : "") +
      "\n\nCheck them off on the **My day** checklist (above Ask). **Focus** hides that panel until you leave Focus.";
  }
  return {
    intent: "task_status",
    message,
    links: [{ label: "My day", href: "/" }],
    mode: "inform",
  };
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

/** Live roster answer for “who used the OS last week” (+ Ops link for Ask detail). */
export function opsEngagementMessage(snapshot: AdminOpsSnapshot, windowDays = 7): string {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const active = snapshot.roster
    .filter((m) => !m.deactivatedAt)
    .filter((m) => !isOpsTestAccount(m.email))
    .map((m) => {
      const raw = m.lastLoginAt;
      const ms = raw ? Date.parse(raw) : NaN;
      return {
        label: (m.name && m.name.trim()) || m.email,
        email: m.email,
        lastLoginAt: Number.isFinite(ms) ? ms : null,
      };
    })
    .filter((m) => m.lastLoginAt != null && m.lastLoginAt! >= cutoff)
    .sort((a, b) => (b.lastLoginAt ?? 0) - (a.lastLoginAt ?? 0));

  const fmt = (ms: number) =>
    new Date(ms).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!active.length) {
    return [
      `**Portal logins (last ${windowDays} days, IST):** no non-test accounts have a recorded login in that window.`,
      "",
      "Open **Ops → Section A · Staff engagement** for Ask turns and practice activity (not the same as login).",
    ].join("\n");
  }

  const lines = active.slice(0, 20).map((m) => `• **${m.label}** — last login ${fmt(m.lastLoginAt!)} IST`);
  const more =
    active.length > 20 ? `\n…and **${active.length - 20}** more (see Ops dashboard).` : "";

  return [
    `**Who used the staff portal in the last ${windowDays} days** (login signal; QA/test accounts hidden):`,
    "",
    `**${active.length}** people:`,
    ...lines,
    more,
    "",
    "For **Ask turns / engagement segments**, open **Ops → Section A · Staff engagement** (thumbs 👍/👎 are not team usage).",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/** Pointer only — used when we can’t load the admin roster. */
export function opsEngagementPointerMessage(): string {
  return [
    "For **who’s using the portal**, **how often**, and related staff signals, open the **Ops dashboard**.",
    "",
    "**Section A · Staff engagement** shows Ask activity and engagement by person (admin sees the full team table).",
    "",
    "That’s the right place for usage/engagement — not the 👍/👎 buttons (those only log whether a single Assist reply was helpful).",
  ].join("\n");
}

function defaultLinks(intent: AdminOpsIntent["kind"]): { label: string; href: string }[] {
  const links = [
    { label: "My day", href: "/" },
    { label: "Task board", href: "/admin/tasks" },
    { label: "Team", href: "/team" },
  ];
  if (intent === "team_pulse") return [{ label: "Team", href: "/team" }, ...links.slice(1)];
  if (intent === "ops_engagement") {
    return [
      { label: "Ops dashboard", href: "/ops" },
      { label: "Team", href: "/team" },
      { label: "My day", href: "/" },
    ];
  }
  return links;
}

export async function runAdminOpsCoach(
  message: string,
  snapshot: AdminOpsSnapshot,
  token: string,
  history: { role: string; content: string }[],
): Promise<AdminOpsReply | null> {
  const intent = detectAdminOpsIntent(message, history);
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
    case "ops_engagement":
      messageOut = opsEngagementMessage(snapshot);
      break;
    default:
      return null;
  }

  // Team pulse + ops engagement are deterministic pointers — never LLM-rewrite.
  if (intent.kind !== "team_pulse" && intent.kind !== "ops_engagement") {
    const llm = await synthesizeAdminOpsAnswer({
      userMessage: message,
      intent: intent.kind,
      snapshotSummary: messageOut,
      history,
    });
    if (llm) messageOut = llm;
  }

  return {
    intent: intent.kind,
    message: messageOut,
    links: defaultLinks(intent.kind),
  };
}
