/**
 * SOP ownership / review assignment — live portal data, not SOP body dumps.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { SopRecord, SopTaskRecord } from "@/lib/sop-types";

export type SopAssignmentAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  links: { label: string; href: string }[];
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function apiGet<T>(token: string, path: string): Promise<T | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  const res = await fetch(`${base}${path}`, { headers: authHeaders(token) });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as T | null;
}

/** True when staff is asking who owns/reviews/handles an SOP — not for the procedure itself. */
export function isSopAssignmentQuery(message: string, history: { role: string; content: string }[] = []): boolean {
  const t = message.trim().toLowerCase();
  if (!t) return false;
  if (
    /\b(who\s+is\s+reviewing|who\s+reviews|confirm\s+who\s+is\s+reviewing|who\s+owns\s+(this\s+)?sop|who\s+is\s+assigned)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (/\bwhy\s+(r\s+u|are\s+you|you)\s+telling\s+sop\b/.test(t) && /\breview/i.test(t)) return true;
  if (/\bconfirm\s+who\b/.test(t) && /\bsop\b/.test(t)) return true;
  // "is Rock Star reviewing/handling/handing … sop" OR "rock star is handing … sop?"
  if (/\bsop\b/.test(t) && /\b(reviewing|handling|handing|assigned\s+to)\b/.test(t)) {
    if (
      /\bis\s+[\w .'-]{2,40}\s+(reviewing|handling|handing|assigned\s+to)\b/.test(t) ||
      /^[\w .'-]{2,48}\s+is\s+(reviewing|handling|handing)\b/.test(t)
    ) {
      return true;
    }
  }
  // Follow-up "confirm who is reviewing SOP" after an SOP was discussed
  if (/\b(who\s+is\s+reviewing|confirm\s+who)\b/.test(t) && /\bsop\b/.test(t)) return true;
  if (
    /\b(this|that|the)\s+sop\b/.test(t) &&
    /\b(who|review|assigned|owner|handling)\b/.test(t) &&
    history.some((h) => h.role === "assistant" && /\bsop\b/i.test(h.content))
  ) {
    return true;
  }
  return false;
}

function extractPersonHint(message: string): string | null {
  const m =
    message.match(/\bis\s+([\w .'-]{2,40}?)\s+(?:reviewing|handling|handing|assigned)/i) ||
    message.match(/\b([\w .'-]{2,40}?)\s+is\s+(?:reviewing|handling|handing)\b/i);
  const name = m?.[1]?.trim();
  if (!name || /^(the|this|that|a|an|who|what)$/i.test(name)) return null;
  return name;
}

function extractSopHint(message: string, history: { role: string; content: string }[]): string {
  const fromMsg =
    message.match(/\b(?:sop[:\s]+|handling\s+|reviewing\s+)(.{5,80}?)(?:\?|$)/i)?.[1] ||
    message.match(/\b(verbally\s+abusive[^?]{0,60}|abusive\s+patient[^?]{0,40})/i)?.[0] ||
    "";
  if (fromMsg.trim().length >= 5) return fromMsg.trim();
  for (const h of [...history].reverse()) {
    if (h.role !== "assistant") continue;
    const titled = h.content.match(/SOP:\s*([^\n·]+)/i)?.[1];
    if (titled) return titled.trim();
    const abusive = h.content.match(/Handling Verbally Abusive Patient Interactions/i)?.[0];
    if (abusive) return abusive;
    const arrow = h.content.match(/SOP[:\s]+([^\n(→]+)\s*(?:\(|→)/i)?.[1];
    if (arrow) return arrow.trim();
  }
  return "";
}

/** Pull "Title → Assignee" lines from a prior Daily Plan / task list in-thread. */
export function extractAssignmentsFromHistory(
  history: { role: string; content: string }[],
  sopHint: string,
): { title: string; assignee: string; lane?: string }[] {
  const out: { title: string; assignee: string; lane?: string }[] = [];
  const hint = sopHint.toLowerCase();
  let lane = "";
  for (const h of history) {
    if (h.role !== "assistant") continue;
    for (const line of h.content.split("\n")) {
      const laneMatch = line.match(/^\s*[-*]?\s*\*?\*?(Lead Review|SOP Reviews|Overdue)\*?\*?\s*:?\s*$/i);
      if (laneMatch) {
        lane = laneMatch[1]!;
        continue;
      }
      const m = line.match(/SOP[:\s]+(.+?)\s*(?:\([^)]*\))?\s*→\s*(.+)$/i);
      if (!m) continue;
      const title = m[1]!.replace(/\*\*/g, "").trim();
      const assignee = m[2]!.replace(/\*\*/g, "").trim();
      if (hint && !title.toLowerCase().includes(hint.slice(0, 24).toLowerCase()) && !hint.includes(title.toLowerCase().slice(0, 24))) {
        // still allow abusive shortcut
        if (!/abusive/i.test(hint) || !/abusive/i.test(title)) continue;
      }
      out.push({ title, assignee, lane: lane || undefined });
    }
  }
  return out;
}

function scoreTitle(a: string, b: string): number {
  const ta = a.toLowerCase().replace(/^sop:\s*/i, "");
  const tb = b.toLowerCase().replace(/^sop:\s*/i, "");
  if (!ta || !tb) return 0;
  if (ta === tb) return 100;
  if (ta.includes(tb) || tb.includes(ta)) return 80;
  const aw = new Set(ta.split(/\W+/).filter((w) => w.length > 3));
  let n = 0;
  for (const w of tb.split(/\W+/)) if (aw.has(w)) n += 1;
  return n * 10;
}

export async function answerSopAssignmentAsk(
  message: string,
  history: { role: string; content: string }[],
  authToken: string,
): Promise<SopAssignmentAnswer | null> {
  const sopHint = extractSopHint(message, history);
  const personHint = extractPersonHint(message);
  const historyHits = extractAssignmentsFromHistory(history, sopHint || "abusive");

  const [sopsPayload, tasksPayload, ctxPayload] = await Promise.all([
    apiGet<{ sops: SopRecord[] }>(authToken, "/api/knowledge/sops"),
    apiGet<{ tasks: SopTaskRecord[] }>(authToken, "/api/knowledge/sop-tasks"),
    apiGet<{
      departmentLeads: {
        department: string;
        userName: string | null;
        userEmail: string | null;
        userId: string | null;
      }[];
    }>(authToken, "/api/knowledge/sops/context"),
  ]);

  const sops = sopsPayload?.sops ?? [];
  const tasks = tasksPayload?.tasks ?? [];
  const leads = ctxPayload?.departmentLeads ?? [];

  let best: SopRecord | null = null;
  let bestScore = 0;
  const needle = sopHint || "verbally abusive";
  for (const s of sops) {
    const sc = scoreTitle(s.title, needle) + (/abusive/i.test(needle) && /abusive/i.test(s.title) ? 40 : 0);
    if (sc > bestScore) {
      bestScore = sc;
      best = s;
    }
  }
  if (!best || bestScore < 20) {
    if (historyHits.length) {
      const lines = historyHits.map(
        (h) => `• **${h.title}** → **${h.assignee}**${h.lane ? ` (${h.lane})` : ""}`,
      );
      return {
        message: [
          "From **this conversation’s** task list (not inventing a review process):",
          "",
          ...lines,
          "",
          personHint
            ? `You asked about **${personHint}** — ${historyHits.some((h) => h.assignee.toLowerCase().includes(personHint.toLowerCase())) ? `yes, they appear as an assignee above.` : `they do not appear as an assignee on those lines.`}`
            : "Ask with the SOP title if you need a live portal check.",
        ].join("\n"),
        sources: [{ title: "This conversation · task list", id: "thread-task-list" }],
        links: [
          { label: "SOP review", href: "/admin/sop-review" },
          { label: "Task board", href: "/admin/tasks" },
        ],
      };
    }
    return {
      message: [
        "I need the **SOP title** (or keep this thread after a Daily Plan / SOP mention) to look up who owns or is reviewing it.",
        "I won’t invent a generic review process.",
      ].join("\n"),
      sources: [],
      links: [{ label: "Memory · SOPs", href: "/memory/knowledge/sops" }],
    };
  }

  const relatedTasks = tasks.filter(
    (t) =>
      (best!.id && t.sopId === best!.id) ||
      scoreTitle(t.title, best!.title) >= 50 ||
      (/abusive/i.test(best!.title) && /abusive/i.test(t.title)),
  );
  const deptLead = leads.find((l) => l.department === best.department);

  const lines: string[] = [
    `**${best.title}**`,
    `• **Status:** ${best.status}${best.approvedAt ? ` (approved ${best.approvedAt.slice(0, 10)})` : ""}`,
    `• **Department:** ${best.department}`,
    `• **Owner (author):** ${best.ownerName || best.ownerUserId}`,
  ];
  if (best.status === "pending_review") {
    lines.push(
      `• **Pending review:** department lead path${
        deptLead?.userName || deptLead?.userEmail
          ? ` → **${deptLead.userName || deptLead.userEmail}**`
          : " (no lead assigned in portal yet)"
      }`,
    );
  } else if (best.status === "live") {
    lines.push("• **Live guide** — not waiting on pending_review approval.");
  }

  if (relatedTasks.length) {
    lines.push("", "**Open SOP tasks (portal):**");
    for (const t of relatedTasks.slice(0, 6)) {
      lines.push(
        `• ${t.title} — ${t.status}${t.assigneeName ? ` → **${t.assigneeName}**` : " (unassigned)"}${
          t.dueDate ? `, due ${t.dueDate}` : ""
        }`,
      );
    }
  }

  if (historyHits.length) {
    lines.push("", "**Also shown earlier in this chat (task board snapshot):**");
    for (const h of historyHits.slice(0, 6)) {
      lines.push(`• ${h.title} → **${h.assignee}**${h.lane ? ` (${h.lane})` : ""}`);
    }
  }

  if (personHint) {
    const personL = personHint.toLowerCase();
    const inTasks = relatedTasks.some((t) => (t.assigneeName || "").toLowerCase().includes(personL));
    const inHistory = historyHits.some((h) => h.assignee.toLowerCase().includes(personL));
    const isOwner = (best.ownerName || "").toLowerCase().includes(personL);
    const isLead = (deptLead?.userName || "").toLowerCase().includes(personL);
    lines.push("");
    if (inTasks || inHistory || isOwner || isLead) {
      const bits = [
        isOwner ? "SOP owner" : null,
        isLead ? `${best.department} lead` : null,
        inTasks ? "open SOP task assignee" : null,
        inHistory ? "named on this chat’s task list" : null,
      ].filter(Boolean);
      lines.push(`**${personHint}:** yes — ${bits.join("; ")}.`);
    } else {
      lines.push(
        `**${personHint}:** not listed as owner, department lead, or an open SOP-task assignee for this record in the portal data I can see.`,
      );
    }
  }

  lines.push("", "This is **assignment/status data**, not the SOP procedure text.");

  return {
    message: lines.join("\n"),
    sources: [{ title: `${best.title} · ${best.department} · ${best.status}`, id: `sop-assign-${best.id}` }],
    links: [
      { label: `SOP · ${best.department}`, href: "/memory/knowledge/sops" },
      { label: "SOP review", href: "/admin/sop-review" },
      { label: "Task board", href: "/admin/tasks" },
    ],
  };
}
