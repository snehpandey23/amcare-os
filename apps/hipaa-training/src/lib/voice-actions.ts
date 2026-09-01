/**
 * Talk Mode voice actions — small set, confirm-before-execute mandatory.
 * Reuses existing shift / task APIs; no new action logic.
 */

import type { TaskRecord } from "@/lib/tasks-types";

export type VoiceWorkShift = "morning" | "evening" | "night";

export type PendingVoiceAction =
  | {
      kind: "start_shift";
      workShift: VoiceWorkShift;
      readback: string;
    }
  | {
      kind: "mark_task_done";
      taskId: string;
      taskTitle: string;
      readback: string;
    }
  | {
      kind: "assign_task";
      taskId: string;
      taskTitle: string;
      assigneeId: string;
      assigneeLabel: string;
      readback: string;
    };

export type VoiceActionResolve =
  | { status: "not_action" }
  | { status: "need_clarify"; message: string }
  | { status: "pending_confirm"; action: PendingVoiceAction };

export type VoicePerson = { id: string; name: string | null; email: string };

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

export function isConfirmYes(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(yes|yeah|yep|yup|confirm|do it|go ahead|correct|that'?s right|sure|ok|okay)\b/.test(t);
}

export function isConfirmNo(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(no|nope|cancel|stop|never\s*mind|dont|don't|abort)\b/.test(t);
}

/** Looks like one of the three Stage-2 commands (even if args are incomplete). */
export function looksLikeVoiceAction(text: string): boolean {
  const t = norm(text);
  if (!t) return false;
  if (/^(start|begin)\s+(my\s+)?(shift|day)\b/.test(t)) return true;
  if (/\b(mark|complete|finish)\b/.test(t) && /\b(done|complete|completed)\b/.test(t)) return true;
  if (/^assign\b/.test(t) && /\bto\b/.test(t)) return true;
  return false;
}

function parseWorkShift(text: string): VoiceWorkShift {
  const t = norm(text);
  if (/\bevening\b/.test(t)) return "evening";
  if (/\bnight\b/.test(t)) return "night";
  return "morning";
}

function scoreTitleMatch(query: string, title: string): number {
  const q = norm(query);
  const t = norm(title);
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.includes(q)) return 80 + Math.min(q.length, 19);
  if (q.includes(t) && t.length >= 4) return 70;
  const qw = q.split(" ").filter((w) => w.length > 2);
  if (!qw.length) return 0;
  const hits = qw.filter((w) => t.includes(w)).length;
  if (hits === 0) return 0;
  return Math.round((hits / qw.length) * 60);
}

function pickTasks(query: string, tasks: TaskRecord[]): TaskRecord[] {
  const open = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const scored = open
    .map((task) => ({ task, score: scoreTitleMatch(query, task.title) }))
    .filter((x) => x.score >= 40)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  const best = scored[0]!.score;
  return scored.filter((x) => x.score >= best - 5).map((x) => x.task);
}

function pickPeople(query: string, people: VoicePerson[]): VoicePerson[] {
  const q = norm(query);
  if (!q || q.length < 2) return [];
  const hits = people.filter((p) => {
    const name = norm(p.name || "");
    const email = norm(p.email);
    const local = norm(p.email.split("@")[0] || "");
    return (
      (name && (name === q || name.includes(q) || q.includes(name))) ||
      email === q ||
      local === q ||
      local.includes(q)
    );
  });
  return hits;
}

/**
 * Parse a spoken/typed utterance into a confirmable action, or ask for clarification.
 * Never executes — caller must wait for explicit yes.
 */
export function resolveVoiceActionCommand(
  text: string,
  ctx: {
    tasks: TaskRecord[];
    people: VoicePerson[];
  },
): VoiceActionResolve {
  const raw = text.trim();
  const t = norm(raw);
  if (!looksLikeVoiceAction(raw)) return { status: "not_action" };

  // start my shift / begin shift / start morning shift
  if (/^(start|begin)\s+(my\s+)?(shift|day)\b/.test(t) || /^start\s+(morning|evening|night)\s+shift\b/.test(t)) {
    const workShift = parseWorkShift(raw);
    return {
      status: "pending_confirm",
      action: {
        kind: "start_shift",
        workShift,
        readback: `I heard: start your ${workShift} shift. Say yes to confirm, or no to cancel.`,
      },
    };
  }

  // mark task X done / complete task X / mark X as done
  const mark =
    /^(?:mark|complete|finish)\s+(?:task\s+)?(.+?)\s+(?:as\s+)?(?:done|complete|completed)\s*$/i.exec(raw) ||
    /^(?:mark|set)\s+(.+?)\s+as\s+done\s*$/i.exec(raw);
  if (mark) {
    const titleQuery = mark[1]!.trim().replace(/^["']|["']$/g, "");
    if (titleQuery.length < 2) {
      return {
        status: "need_clarify",
        message: "Which task should I mark done? Say the task title, for example: mark Follow up on refund done.",
      };
    }
    const hits = pickTasks(titleQuery, ctx.tasks);
    if (hits.length === 0) {
      return {
        status: "need_clarify",
        message: `I couldn’t find an open task matching “${titleQuery}”. Say the title again, or check My day.`,
      };
    }
    if (hits.length > 1) {
      const list = hits
        .slice(0, 4)
        .map((h) => `“${h.title}”`)
        .join(", ");
      return {
        status: "need_clarify",
        message: `A few tasks matched “${titleQuery}”: ${list}. Say the full title so I don’t guess.`,
      };
    }
    const task = hits[0]!;
    return {
      status: "pending_confirm",
      action: {
        kind: "mark_task_done",
        taskId: task.id,
        taskTitle: task.title,
        readback: `I heard: mark “${task.title}” done. Say yes to confirm, or no to cancel.`,
      },
    };
  }

  // assign task X to Person
  const assign = /^assign\s+(?:task\s+)?(.+?)\s+to\s+(.+?)\s*$/i.exec(raw);
  if (assign) {
    const titleQuery = assign[1]!.trim().replace(/^["']|["']$/g, "");
    const personQuery = assign[2]!.trim().replace(/^["']|["']$/g, "");
    if (titleQuery.length < 2 || personQuery.length < 2) {
      return {
        status: "need_clarify",
        message: "Say it like: assign Follow up on refund to Isha.",
      };
    }
    const taskHits = pickTasks(titleQuery, ctx.tasks);
    if (taskHits.length === 0) {
      return {
        status: "need_clarify",
        message: `I couldn’t find an open task matching “${titleQuery}”. Say the full title again.`,
      };
    }
    if (taskHits.length > 1) {
      return {
        status: "need_clarify",
        message: `A few tasks matched “${titleQuery}”. Say the full title so I don’t guess.`,
      };
    }
    const peopleHits = pickPeople(personQuery, ctx.people);
    if (peopleHits.length === 0) {
      return {
        status: "need_clarify",
        message: `I don’t see “${personQuery}” on the staff directory. Try the first name or email — I won’t guess.`,
      };
    }
    if (peopleHits.length > 1) {
      return {
        status: "need_clarify",
        message: `A few people matched “${personQuery}”. Say the email or full name so I don’t guess.`,
      };
    }
    const task = taskHits[0]!;
    const person = peopleHits[0]!;
    const label = person.name?.trim() || person.email;
    return {
      status: "pending_confirm",
      action: {
        kind: "assign_task",
        taskId: task.id,
        taskTitle: task.title,
        assigneeId: person.id,
        assigneeLabel: label,
        readback: `I heard: assign “${task.title}” to ${label}. Say yes to confirm, or no to cancel.`,
      },
    };
  }

  if (looksLikeVoiceAction(raw)) {
    return {
      status: "need_clarify",
      message:
        "I caught an action, but not clearly enough. Try: start my shift — or mark [task] done — or assign [task] to [person].",
    };
  }
  return { status: "not_action" };
}
