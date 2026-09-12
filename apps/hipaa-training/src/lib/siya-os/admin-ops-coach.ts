/**
 * Admin co-pilot: plan the day, priorities, task visibility, lightweight assign-from-chat.
 * Complements KB help desk — does not replace Admin task board UI.
 */

import type { TaskRecord, TaskPriority } from "@/lib/tasks-types";
import { taskIsComplete } from "@/lib/tasks-types";
import type { AdminOpsSnapshot, OpsCoachEngagementRow } from "./admin-ops-snapshot";
import { fetchOpsEngagementRows } from "./admin-ops-snapshot";
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
  | { kind: "ops_engagement" }
  /** Practice drill adoption → Ops Section A level_up signals. */
  | { kind: "ops_practice" };

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

  // Calendar / MA duty roster (“who works tomorrow”, “on duty”, month roster) is
  // shift_roster Ask — not live presence. Keep pulse for right-now / online.
  if (/\bon\s+duty\b/.test(t) || /\b(ma\s+)?(duty\s+)?roster\b/.test(t)) return false;
  if (
    /\b(tomorrow|this\s+week|next\s+week|september|october|november|december|january|february|march|april|may|june|july|august)\b/.test(
      t,
    ) &&
    !/\b(right\s+now|currently|online|logged\s*in|logging\s*in)\b/.test(t)
  ) {
    return false;
  }

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
 * Founder/lead hypothesis about someone’s Start shift / End shift state
 * (“forgot to log out”, “still showing online”). Not first-person IT login help.
 */
export function isPresenceStatusHypothesis(message: string): boolean {
  const t = normalizePresenceAskText(message);
  if (!t) return false;
  // First-person “I forgot to login” → workplace/IT, not Team pulse.
  if (/\bi(?:'?ve| have)?\s+forgot\b/.test(t) && !/\b(?:he|she|they|[a-z]{3,})\s+forgot\b/.test(t)) {
    return false;
  }
  if (
    /\bforgot\s+to\s+(?:log\s*in|login|log\s*out|logout|sign\s*out|end(?:\s+(?:the\s+)?shift)?|start(?:\s+(?:the\s+)?shift)?)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(?:didn'?t|did\s+not|never)\s+(?:log\s*out|logout|end(?:\s+(?:the\s+)?shift)|log\s*in|login)\b/.test(t)
  ) {
    return true;
  }
  if (/\bstill\s+(?:showing|marked|listed|online|working|on\s+shift|logged)\b/.test(t)) return true;
  if (/\bneeds?\s+to\s+(?:log\s*out|logout|end\s+shift)\b/.test(t)) return true;
  return false;
}

/**
 * Team usage / engagement / “who’s using the OS” → Ops dashboard Section A
 * (not thumbs chrome, not live Team pulse).
 */
export function isOpsEngagementAsk(message: string): boolean {
  // Normalize loggin→logging so “are staff loggin into OS” matches.
  const t = normalizePresenceAskText(message);
  if (!t) return false;
  // How-to “how do I use the OS” is not engagement analytics.
  if (/\bhow\s+(do\s+i|to|can\s+i)\s+use\b/.test(t)) return false;
  if (/\bthumbs?\s*(up|down)?\b/.test(t) && !/\b(team|staff|engagement|usage|ops)\b/.test(t)) return false;
  // Practice drills have their own intent.
  if (isOpsPracticeDrillAsk(message)) return false;

  const osOrPortal = /\b(os|siya\s*os|portal|staff\s*(?:app|portal)|assist|siya\s*assist)\b/.test(t);
  const usageVerb =
    /\b(who(?:'s|’s| is| are)?\s+using|using|used|usage|adoption|how\s+often|engagement)\b/.test(t) ||
    /\bwho\s+all\b[\s\S]{0,40}\b(used|using|have\s+used)\b/.test(t) ||
    /\bwho\s+(has|have)\s+used\b/.test(t);
  const windowHint = /\b(last|past|this)\s+week\b|\b(7|fourteen|14|30)\s*days?\b|\brecently\b/.test(t);
  const problemsFacing =
    /\b(what\s+)?problems?\b/.test(t) && /\b(facing|have|having|they)\b/.test(t);
  const teamUsageLabel = /\b(staff|team)\s+(engagement|usage|adoption|performance)\b/.test(t);
  const staffPerformance =
    /\bstaff\s+performance\b/.test(t) ||
    (/\bperformance\b/.test(t) && /\b(staff|team|people)\b/.test(t));
  const namedPerson = Boolean(extractNamedPerformanceSubject(message));
  const loginIntoOs =
    osOrPortal &&
    /\b(staff|team|people|members|everyone|employees?)\b/.test(t) &&
    /\b(logg?(?:ing|ed)?\s*(?:in|into)|signing\s*(?:in|into)|logins?)\b/.test(t);
  const opsSectionA =
    /\bops\b/.test(t) && /\b(engagement|usage|section\s*a|dashboard|performance)\b/.test(t);

  if (namedPerson || teamUsageLabel || opsSectionA || staffPerformance || loginIntoOs) return true;
  if (osOrPortal && usageVerb) return true;
  if (osOrPortal && windowHint && /\bwho\b/.test(t)) return true;
  if (osOrPortal && problemsFacing) return true;
  if (usageVerb && problemsFacing && /\b(team|staff|people|they)\b/.test(t)) return true;
  if (/\bhow\s+often\b/.test(t) && /\b(staff|team|people|using|ask|turns?)\b/.test(t)) return true;
  return false;
}

/** “Has anyone tried drills / practice” → Ops Section A level_up signals. */
export function isOpsPracticeDrillAsk(message: string): boolean {
  const t = normalizePresenceAskText(message);
  if (!t) return false;
  if (/\b(corporate\s+)?practice\s+of\s+medicine\b|\bcpom\b/.test(t)) return false;
  if (/\b(medical\s+practice|the\s+practice)\b/.test(t) && !/\bdrills?\b/.test(t)) return false;
  // Personal how-to stays on Practice nav / meta — not team analytics.
  if (
    /\b(how\s+(do|can)\s+i|why\s+(do\s+we|should)|open\s+practice|my\s+practice\s+progress)\b/.test(t) &&
    !/\b(anyone|anybody|who|team|staff|people)\b/.test(t)
  ) {
    return false;
  }
  const drillish =
    /\b(drills?|practice\s+drills?|level\s*[- ]?up|typing\s+drill|culture\s+trivia)\b/.test(t) ||
    (/\bpractice\b/.test(t) && /\b(learn|portal|os|team|staff|anyone|anybody|who)\b/.test(t));
  if (!drillish) return false;
  return (
    /\b(anyone|anybody|who|who\s+all|team|staff|people)\b/.test(t) ||
    /\b(tried|try|done|doing|completed|attempted|started|using|used|did)\b[\s\S]{0,32}\b(drills?|practice)\b/.test(
      t,
    )
  );
}

/** Staff performance / Section A Ask+practice summary (not a clinical performance review). */
export function isOpsStaffPerformanceAsk(message: string): boolean {
  const t = normalizePresenceAskText(message);
  if (!t) return false;
  if (extractNamedPerformanceSubject(message)) return true;
  return (
    /\bstaff\s+performance\b/.test(t) ||
    (/\bperformance\b/.test(t) && /\b(staff|team|people)\b/.test(t)) ||
    /\b(engagement|usage)\s+(by\s+)?(person|staff|team)\b/.test(t)
  );
}

const PERFORMANCE_NAME_STOP = new Set([
  "staff",
  "team",
  "people",
  "someone",
  "anyone",
  "everyone",
  "my",
  "our",
  "the",
  "a",
  "an",
  "their",
  "his",
  "her",
  "your",
  "this",
  "that",
  "overall",
  "general",
]);

/**
 * “Sonu's performance”, “how is Sonu doing”, “about Alex engagement”.
 * Returns first-name / display hint for Ops Section A lookup.
 */
export function extractNamedPerformanceSubject(message: string): string | null {
  const raw = message.trim();
  if (!raw || raw.length > 200) return null;
  const patterns: RegExp[] = [
    /\b(?:about|know\s+about|see|show|check|tell\s+me\s+about)\s+([A-Za-z][A-Za-z-]{1,40})(?:'s|’s)?\s+performance\b/i,
    /\b([A-Za-z][A-Za-z-]{1,40})(?:'s|’s)\s+performance\b/i,
    /\bhow\s+is\s+([A-Za-z][A-Za-z-]{1,40})\s+(?:doing|performing|progressing)\b/i,
    /\b(?:how\s+is|what\s+about)\s+([A-Za-z][A-Za-z-]{1,40})(?:'s|’s)?\s+(?:usage|engagement|practice|scores?)\b/i,
    /\b([A-Za-z][A-Za-z-]{1,40})\s+(?:engagement|practice\s+stats?|ask\s+usage|portal\s+usage)\b/i,
  ];
  for (const re of patterns) {
    const m = raw.match(re);
    let name = m?.[1]?.trim() ?? "";
    name = name.replace(/['’]s$/i, "").trim();
    if (!name) continue;
    if (PERFORMANCE_NAME_STOP.has(name.toLowerCase())) continue;
    if (/^(performance|review|rating|appraisal)$/i.test(name)) continue;
    return name;
  }
  return null;
}

/** Named teammate portal engagement (Ask turns + Practice) — founder/admin Ops data. */
export function isNamedPersonPerformanceAsk(message: string): boolean {
  return Boolean(extractNamedPerformanceSubject(message));
}

/** Personal My day / urgent tasks (not “assign task to X”). */
export function isPersonalTasksAsk(message: string): boolean {
  const t = message.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return false;
  if (/\b(assign|create|add|give)\s+(a\s+)?task\b/.test(t)) return false;
  if (isWhatsNextTaskAsk(message)) return true;
  return (
    /\burgent\s+tasks?\s+(for\s+)?me\b/.test(t) ||
    /\b(my|today'?s)\s+(urgent\s+)?tasks?\b/.test(t) ||
    /\bwhat\s+are\s+my\s+(urgent\s+)?tasks?\b/.test(t) ||
    /\btasks?\s+for\s+me\b/.test(t) ||
    /\b(do\s+i\s+have|have\s+i\s+got|any)\s+.{0,24}\btasks?\b/.test(t) ||
    /\bwhat\s+tasks?\s+(do\s+i\s+have|are\s+assigned)\b/.test(t) ||
    /\btasks?\s+assigned(\s+to\s+me)?\b/.test(t) ||
    /\b(is\s+that|are\s+those|is\s+lead\s+review)\s+my\s+tasks?\b/.test(t) ||
    /\bwhy\s+(are\s+you\s+)?showing\s+lead\s+review\b/.test(t)
  );
}

/**
 * “SOP is done, what else” / “I reviewed them, what’s next task” — remaining My day,
 * not an SOP body dump or a Leadership soft-stop.
 */
export function isWhatsNextTaskAsk(message: string): boolean {
  const t = message.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t || t.length > 280) return false;
  if (/\bwhat('?s| is)\s+next(\s+task)?\b/.test(t)) return true;
  if (/\bwhat\s+else\b/.test(t) && /\b(sop|task|review|done|reviewed|finished|next)\b/.test(t)) return true;
  if (/\b(sop|sops)\s+(is|are|was|were)\s+done\b/.test(t)) return true;
  if (/\b(i\s+)?reviewed\s+(them|those|the\s+sops?)\b/.test(t) && /\b(next|else|task)\b/.test(t)) return true;
  if (/\bmarked\s+for\s+my\s+review\b/.test(t) && /\b(next|reviewed|what)\b/.test(t)) return true;
  if (/\b(next|remaining)\s+tasks?\b/.test(t) && /\b(my|me|after|else|what)\b/.test(t)) return true;
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
  if (!t || t.length > 120) return false;
  if (isTeamPulseAsk(message) || isAmbiguousStaffLoginDashboardQuery(message)) return true;
  if (isPresenceStatusHypothesis(message)) return true;
  if (
    /\b(online|logged?\s*in|logging\s*in|log\s*in|log\s*out|logout|signed?\s*out|end\s+shift|start\s+shift|working|present|active|around|pulse|on\s+shift|forgot)\b/.test(
      t,
    )
  ) {
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
  // Practice drills before generic engagement (“has anyone tried drills”).
  if (isOpsPracticeDrillAsk(message)) {
    return { kind: "ops_practice" };
  }
  // Named person performance / team usage BEFORE presence.
  if (isOpsEngagementAsk(message) || isNamedPersonPerformanceAsk(message)) {
    return { kind: "ops_engagement" };
  }
  // Live presence / shift — hard Team pulse path (never Founder Talk portal LLM).
  // Match natural asks + typo/slang ("who all r online", "who is loggin in") + thread continuations
  // + named login/out hypotheses ("anmol forgot to log out").
  if (
    isTeamPulseAsk(message) ||
    isPresenceTopicContinuation(message, history) ||
    isPresenceStatusHypothesis(message)
  ) {
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
    isPersonalTasksAsk(message) ||
    /\b(task board|open tasks|assignments|track tasks|company tasks|ops status)\b/.test(t) ||
    /\bwhere\s+(are|is)\s+(my|the)\s+tasks?\b/.test(t) ||
    /\bare\s+these\s+(my\s+)?tasks?\b/.test(t) ||
    /\burgent\s+tasks?\b/.test(t)
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

function sopReviewHref(t: TaskRecord): string | null {
  const adminOrLead = t.id.match(/^kn-sop-(?:admin-review|lead-review)-(.+)$/);
  if (adminOrLead?.[1]) return `/admin/sop-review?id=${encodeURIComponent(adminOrLead[1])}`;
  if (/^(SOP review|Lead review):/i.test(t.title)) return "/admin/sop-review";
  return null;
}

function formatTaskLine(t: TaskRecord, showAssignee = false): string {
  const who =
    showAssignee && (t.assigneeName || t.assigneeEmail)
      ? ` → ${t.assigneeName || t.assigneeEmail}`
      : "";
  const href = sopReviewHref(t);
  const link = href ? ` — [Open review](${href})` : "";
  return `• **${t.title}** (${t.priority}, due ${t.dueDate})${who}${link}`;
}

function isMine(t: TaskRecord, snapshot: AdminOpsSnapshot): boolean {
  return t.assigneeId === snapshot.user.id;
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
  const overdueMine = overdue.filter((t) => isMine(t, snapshot));
  const overdueOthers = overdue.filter((t) => !isMine(t, snapshot));
  const live = snapshot.pulse?.live;
  const me = snapshot.user.name || snapshot.user.email;

  let msg = `**Your day** (${snapshot.date}) — assigned to **${me}**\n\n`;

  if (live) {
    msg += `**Team now:** ${live.working} working · ${live.onBreak} on break · ${live.inFocus} focus · ${live.offShift} off shift\n\n`;
  }

  if (mine.length) {
    msg += `**Your open tasks (${mine.length}):**\n`;
    mine.slice(0, 5).forEach((t) => {
      msg += `${formatTaskLine(t)}\n`;
    });
    if (mine.length > 5) msg += `_…${mine.length - 5} more on My day._\n`;
    msg += "\n";
  } else {
    msg += `**Your My day:** no open tasks assigned to you.\n\n`;
  }

  if (overdueMine.length) {
    msg += `**Yours and overdue (${overdueMine.length}):** already in the list above — start with the first high-priority one.\n\n`;
  }

  if (overdueOthers.length) {
    msg += `**Not your tasks — company overdue assigned to others (${overdueOthers.length}):**\n`;
    overdueOthers.slice(0, 5).forEach((t) => {
      msg += `${formatTaskLine(t, true)}\n`;
    });
    if (overdueOthers.length > 5) msg += `_…${overdueOthers.length - 5} more on the task board._\n`;
    msg +=
      "\n_Lead review / SOP review lines with someone else’s name are **their** queue, not yours — unless your name is on the line._\n\n";
  }

  msg +=
    "**Suggested focus:** work **your** open list top to bottom. Others’ lead reviews are not for you to complete.\n";
  msg +=
    "\nSay **what’s next** after you finish one, or **open SOP review** for the queue.";

  return msg;
}

function teamPulsePresenceLabel(m: {
  onShift: boolean;
  presence: string | null;
}): string {
  if (!m.onShift) return "off shift";
  if (m.presence === "break") return "on break";
  if (m.presence === "focus") return "in focus";
  return "working";
}

/** Match a pulse member named in the message (first/last token ≥3 chars). */
export function findMentionedPulseMember(
  message: string,
  members: { id: string; name: string | null; email: string; onShift: boolean; presence: string | null }[],
): (typeof members)[number] | null {
  const t = normalizePresenceAskText(message);
  if (!t) return null;
  let best: (typeof members)[number] | null = null;
  let bestLen = 0;
  for (const m of members) {
    const label = (m.name || m.email.split("@")[0] || "").trim();
    if (!label) continue;
    const lower = label.toLowerCase();
    if (lower.length >= 4 && t.includes(lower) && lower.length > bestLen) {
      best = m;
      bestLen = lower.length;
      continue;
    }
    for (const part of lower.split(/\s+/).filter((p) => p.length >= 3)) {
      if (new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t) && part.length > bestLen) {
        best = m;
        bestLen = part.length;
      }
    }
  }
  return best;
}

function personPresenceHypothesisMessage(
  message: string,
  m: { name: string | null; email: string; onShift: boolean; presence: string | null },
): string {
  const t = normalizePresenceAskText(message);
  const display = m.name?.trim() || m.email;
  const status = teamPulsePresenceLabel(m);
  const forgotIn = /\bforgot\s+to\s+(?:log\s*in|login|start(?:\s+(?:the\s+)?shift)?)\b/.test(t);
  const forgotOut =
    /\bforgot\s+to\s+(?:log\s*out|logout|sign\s*out|end(?:\s+(?:the\s+)?shift)?)\b/.test(t) ||
    /\bstill\s+(?:showing|marked|listed|online|working|on\s+shift|logged)\b/.test(t) ||
    /\bneeds?\s+to\s+(?:log\s*out|logout|end\s+shift)\b/.test(t);

  let msg = `**${display}** on Team pulse right now: **${m.onShift ? "on shift" : "off shift"} · ${status}**.\n\n`;

  if (m.onShift && forgotIn) {
    msg +=
      "So they **did** start a shift (self-declared presence) — this isn’t “forgot to log in.” " +
      "If they look idle or already left, they’re more likely to need **End shift** or **Break** on My day.\n";
  } else if (m.onShift && forgotOut) {
    msg +=
      "Pulse still shows them **on shift**. If they’re done for the day, they should tap **End shift** on My day — presence won’t clear until they do.\n";
  } else if (!m.onShift && forgotIn) {
    msg +=
      "Pulse shows them **off shift** — they haven’t started a shift (or already ended). They can tap **Start shift** on My day.\n";
  } else if (!m.onShift && forgotOut) {
    msg +=
      "Pulse already shows them **off shift** — either they ended shift, or they never started. They’re not marked online right now.\n";
  } else if (m.onShift) {
    msg += "They’re currently marked on shift. Open **Team** for the full board.\n";
  } else {
    msg += "They’re currently marked off shift. Open **Team** for the full board.\n";
  }

  msg +=
    "\n_Team pulse = Start shift / presence on My day — not Zoho/OS password login._\n\n" +
    "Say **who’s online** for the full list.";
  return msg;
}

function teamPulseMessage(snapshot: AdminOpsSnapshot, userMessage?: string): string {
  const p = snapshot.pulse;
  if (!p) return "I couldn't load team presence. Open **Team** on My day or try again in a moment.";

  if (userMessage) {
    const mentioned = findMentionedPulseMember(userMessage, p.members);
    // Named follow-up / login-out hypothesis → focused answer (not a full roster dump).
    if (mentioned && (isPresenceStatusHypothesis(userMessage) || !isTeamPulseAsk(userMessage))) {
      return personPresenceHypothesisMessage(userMessage, mentioned);
    }
  }

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

/** Exported for smokes — Team pulse list or named login/out hypothesis reply. */
export function composeTeamPulseAskMessage(message: string, snapshot: AdminOpsSnapshot): string {
  return teamPulseMessage(snapshot, message);
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

export function opsPracticePointerMessage(): string {
  return [
    "For **who’s done Practice drills**, open **Ops → Section A · Staff engagement** (lifetime drills + shared weekly report).",
    "",
    "Tour sandbox drills do **not** count toward real progress. Staff Practice is under **Learn → Practice**.",
  ].join("\n");
}

/** Live answer for “has anyone tried drills”. */
export function opsPracticeMessage(rows: OpsCoachEngagementRow[]): string {
  const active = rows
    .filter((r) => !isOpsTestAccount(r.email))
    .filter((r) => (r.practiceLifetime ?? 0) > 0)
    .sort((a, b) => (b.practiceLifetime ?? 0) - (a.practiceLifetime ?? 0));

  if (!active.length) {
    return [
      "**Practice drills:** no non-test accounts have saved drill progress yet (lifetime count = 0).",
      "",
      "Tour sandbox drills don’t write progress. Open **Ops → Section A** or **Learn → Practice** to check live.",
    ].join("\n");
  }

  const lines = active.slice(0, 20).map((r) => {
    const label = (r.name && r.name.trim()) || r.email;
    const last = r.lastActiveDate ? ` · last active ${r.lastActiveDate}` : "";
    const week = r.practiceShareThisWeek?.optedInShared
      ? ` · shared ${r.practiceShareThisWeek.drillDaysShared} day(s) this week`
      : "";
    return `• **${label}** — ${r.practiceLifetime} lifetime drill(s)${last}${week}${
      (r.chatSimRedFlags ?? 0) > 0 ? ` · chat-sim red flags: ${r.chatSimRedFlags}` : ""
    }`;
  });
  const more =
    active.length > 20 ? `\n…and **${active.length - 20}** more on Ops Section A.` : "";

  return [
    "**Who has tried Practice drills** (saved progress; QA/test hidden):",
    "",
    `**${active.length}** people:`,
    ...lines,
    more,
    "",
    "Open **Ops → Section A · Staff engagement** for Ask turns + weekly shared practice detail.",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/** One teammate’s Ops Section A signals (Ask + Practice) — not HR ratings. */
export function opsPersonPerformanceMessage(
  rows: OpsCoachEngagementRow[],
  nameHint: string,
): string {
  const hint = nameHint.trim().toLowerCase();
  const people = rows.filter((r) => !isOpsTestAccount(r.email));
  const hits = people.filter((r) => {
    const name = (r.name || "").trim().toLowerCase();
    const email = r.email.toLowerCase();
    const local = email.split("@")[0] || "";
    if (!hint) return false;
    if (name === hint || local === hint || email === hint) return true;
    if (name.includes(hint) || local.includes(hint)) return true;
    if (name.split(/\s+/).some((p) => p === hint || p.startsWith(hint))) return true;
    return false;
  });

  if (hits.length === 0) {
    return [
      `I couldn’t match **${nameHint}** to someone on **Ops → Staff engagement** (Ask turns + Practice drills).`,
      "",
      "Try their **first name as on the roster**, or open **Ops** and search the table. This is portal engagement — not an HR performance review.",
    ].join("\n");
  }

  if (hits.length > 1) {
    const labels = hits
      .slice(0, 6)
      .map((r) => (r.name && r.name.trim()) || r.email)
      .join(" · ");
    return [
      `**${nameHint}** matches more than one person: ${labels}${hits.length > 6 ? " …" : ""}.`,
      "",
      "Ask again with a fuller name or email, e.g. **Sonu Sharma’s performance**.",
    ].join("\n");
  }

  const r = hits[0]!;
  const label = (r.name && r.name.trim()) || r.email;
  const ask14 = r.askTurnsLast14d ?? 0;
  const ask30 = r.askTurnsLast30d ?? 0;
  const practice = r.practiceLifetime ?? 0;
  const flags = r.chatSimRedFlags ?? 0;
  const share = r.practiceShareThisWeek;
  const shareLine =
    share?.optedInShared != null
      ? share.optedInShared
        ? `Shared practice this week: **${share.drillDaysShared}** of **${share.drillDaysActive}** active day(s)`
        : "Practice sharing this week: **not opted in**"
      : null;

  const quiet = ask14 === 0 && ask30 === 0 && practice === 0;
  return [
    `**${label}** — portal engagement (Ops Section A)`,
    `• **Email:** ${r.email}`,
    `• **Ask turns:** ${ask14} in last 14 days · ${ask30} in last 30 days`,
    `• **Practice drills (lifetime):** ${practice}`,
    r.lastActiveDate ? `• **Last practice day:** ${r.lastActiveDate}` : null,
    flags > 0 ? `• **Chat sim red flags:** ${flags}` : null,
    shareLine ? `• ${shareLine}` : null,
    quiet
      ? ""
      : null,
    quiet
      ? "_No Ask or Practice activity recorded yet for this account._"
      : null,
    "",
    "This is **portal engagement** (Ask + Practice), not an HR performance review or clinical scorecard. Full table: **Ops**.",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** Section A Ask + practice snapshot for “staff performance”. */
export function opsPerformanceMessage(rows: OpsCoachEngagementRow[]): string {
  const people = rows
    .filter((r) => !isOpsTestAccount(r.email))
    .map((r) => ({
      label: (r.name && r.name.trim()) || r.email,
      ask14: r.askTurnsLast14d ?? 0,
      ask30: r.askTurnsLast30d ?? 0,
      practice: r.practiceLifetime ?? 0,
      last: r.lastActiveDate || "",
    }))
    .filter((r) => r.ask30 > 0 || r.practice > 0 || r.ask14 > 0)
    .sort((a, b) => b.ask14 - a.ask14 || b.practice - a.practice);

  if (!people.length) {
    return [
      "**Staff engagement / performance signals:** no Ask turns or Practice drills recorded yet for non-test accounts.",
      "",
      "Open **Ops → Section A · Staff engagement** for the live table. This is portal engagement — not a clinical performance review.",
    ].join("\n");
  }

  const lines = people.slice(0, 15).map((r) => {
    const bits = [
      r.ask14 ? `${r.ask14} Ask turn(s) / 14d` : null,
      r.ask30 && !r.ask14 ? `${r.ask30} Ask turn(s) / 30d` : null,
      r.practice ? `${r.practice} practice drill(s)` : null,
      r.last ? `last practice day ${r.last}` : null,
    ].filter(Boolean);
    return `• **${r.label}** — ${bits.join(" · ")}`;
  });
  const more =
    people.length > 15 ? `\n…and **${people.length - 15}** more on Ops Section A.` : "";

  return [
    "**Staff portal engagement** (Ask turns + Practice drills; QA/test hidden):",
    "",
    `**${people.length}** people with activity:`,
    ...lines,
    more,
    "",
    "This is **Ops Section A** engagement — not HR performance ratings. Open **Ops** for the full table.",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function personalUrgentTasksMessage(snapshot: AdminOpsSnapshot, preferUrgent: boolean): string {
  const mine = sortByPriority(openMyTasks(snapshot.myTasks));
  const urgent = mine.filter((t) => t.priority === "urgent" || t.priority === "high");
  const list = preferUrgent && urgent.length ? urgent : mine;
  if (!list.length) {
    return [
      `**Your My day (${snapshot.date}):** no open tasks${preferUrgent ? " marked urgent/high" : ""} right now.`,
      "",
      "Check the checklist above Ask (leave **Focus** if it’s hidden), or ask **task board** for company-wide work.",
    ].join("\n");
  }
  const label =
    preferUrgent && urgent.length
      ? `**Your urgent / high tasks (${snapshot.date}):**`
      : `**Your My day (${snapshot.date}):**`;
  return (
    `${label} ${list.length} open\n\n` +
    list
      .slice(0, 5)
      .map((t) => formatTaskLine(t))
      .join("\n") +
    (list.length > 5 ? `\n_…${list.length - 5} more on My day._` : "") +
    "\n\nThese are **assigned to you** — not other people’s Lead review. Open the first link, finish it, then say **what’s next**."
  );
}

function defaultLinks(intent: AdminOpsIntent["kind"]): { label: string; href: string }[] {
  const links = [
    { label: "My day", href: "/" },
    { label: "Task board", href: "/admin/tasks" },
    { label: "Team", href: "/team" },
  ];
  if (intent === "team_pulse") return [{ label: "Team", href: "/team" }, ...links.slice(1)];
  if (intent === "ops_engagement" || intent === "ops_practice") {
    return [
      { label: "Ops dashboard", href: "/ops" },
      { label: "Practice", href: "/learn/practice" },
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
      messageOut = composeTeamPulseAskMessage(message, snapshot);
      break;
    case "task_status": {
      const preferUrgent = /\burgent\b/i.test(message);
      if (isPersonalTasksAsk(message)) {
        messageOut = personalUrgentTasksMessage(snapshot, preferUrgent);
      } else {
        messageOut = taskStatusMessage(snapshot);
      }
      break;
    }
    case "overdue":
      messageOut = overdueMessage(snapshot);
      break;
    case "ops_brief":
      messageOut = opsBriefMessage(snapshot);
      break;
    case "ops_engagement": {
      const named = extractNamedPerformanceSubject(message);
      if (named) {
        const rows = await fetchOpsEngagementRows(token);
        messageOut = rows?.length
          ? opsPersonPerformanceMessage(rows, named)
          : [
              `I can’t load **Ops → Staff engagement** on this login (admin Ops access needed for named teammate stats).`,
              "",
              `Open **Ops** and look up **${named}** in Section A — I won’t invent Ask/Practice numbers.`,
            ].join("\n");
      } else if (isOpsStaffPerformanceAsk(message)) {
        const rows = await fetchOpsEngagementRows(token);
        messageOut = rows?.length
          ? opsPerformanceMessage(rows)
          : opsEngagementPointerMessage();
      } else {
        messageOut = opsEngagementMessage(snapshot);
      }
      break;
    }
    case "ops_practice": {
      const rows = await fetchOpsEngagementRows(token);
      messageOut = rows ? opsPracticeMessage(rows) : opsPracticePointerMessage();
      break;
    }
    default:
      return null;
  }

  // Deterministic — never LLM-rewrite (LLM was mixing others' lead reviews into "your" plan).
  const personalQueue =
    intent.kind === "task_status" && isPersonalTasksAsk(message);
  if (
    intent.kind !== "team_pulse" &&
    intent.kind !== "ops_engagement" &&
    intent.kind !== "ops_practice" &&
    intent.kind !== "plan_day" &&
    !personalQueue
  ) {
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
