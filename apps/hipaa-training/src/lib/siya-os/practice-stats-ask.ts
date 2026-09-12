/**
 * Ask — personal Practice / chat-sim stats and “what should I practice next”.
 * Same pattern as my-shifts: live data for the signed-in user only. Not a staff-guide lookup.
 */
import { MODULES } from "@/content/modules";
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { DailyCompletion, DayLedgerEntry, LevelUpProgress } from "@/lib/level-up/progress";
import type { ProgressState } from "@/lib/types";
import { pullProgressFromServer } from "@/lib/progressStorage";

export type PracticeStatsAnswer = {
  message: string;
  sources: { title: string; id: string }[];
};

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

export type PersonalPracticeKind = "stats" | "recommend" | "last_typing" | "last_chat_sim";

const STALE_DRILL_DAYS = 14;

const SUGGESTABLE_DRILLS: Array<{ key: DailyCompletion; label: string }> = [
  { key: "typing", label: "Chat speed & accuracy" },
  { key: "english", label: "American English" },
  { key: "documentation", label: "Documentation" },
  { key: "compliance", label: "Compliance quiz" },
  { key: "healthterm", label: "Healthcare terms" },
  { key: "trivia", label: "Culture & trivia" },
  { key: "billing", label: "Billing practice" },
  { key: "timezone", label: "Timezones" },
  { key: "map", label: "US map" },
];

function isPeerPerformance(t: string): boolean {
  return /\b([a-z][a-z'-]{1,40})(?:'s|s)\s+performance\b/.test(t) && !/\bmy\s+performance\b/.test(t);
}

/** Open/start a drill — feature nav, not a personal-stats answer. */
function isOpenDrillAsk(t: string): boolean {
  if (/\b(what|which|should|when did|last|my|scores?)\b/.test(t)) return false;
  return /\b(start|open|begin|launch)\b[\s\S]{0,32}\b(typing|chat\s+speed|type\s*test|practice|drill|simulator)\b/.test(
    t,
  );
}

/**
 * Personal Practice / training questions. Not peer performance, not “open the drill”.
 * `recommend` is “what should I practice/do next” — needs ranking, not a raw stats dump.
 */
export function classifyPersonalPracticeAsk(message: string): PersonalPracticeKind | null {
  const t = norm(message);
  if (!t || isPeerPerformance(t) || isOpenDrillAsk(t)) return null;
  if (/\b(task|sop|my day|assign)\b/.test(t) && !/\b(practice|drill|training score)\b/.test(t)) return null;

  if (
    /\bwhen did i last\b/.test(t) && /\b(chat simulator|patient chat|simulator)\b/.test(t)
  ) {
    return "last_chat_sim";
  }
  if (/\bpractice chat simulator\b/.test(t)) return "last_chat_sim";
  if (/\blast\b/.test(t) && /\b(chat simulator|patient chat)\b/.test(t) && /\b(my|i|when)\b/.test(t)) {
    return "last_chat_sim";
  }

  if (
    /\bwhat was my last typing(\s+speed)?\b/.test(t) ||
    (/\blast\b/.test(t) && /\b(typing\s+speed|wpm)\b/.test(t) && /\b(my|i)\b/.test(t))
  ) {
    return "last_typing";
  }

  if (
    /\bwhat (tests?|drills?) should i (do|practice)\b/.test(t) ||
    /\bwhat should i practice( next)?\b/.test(t) ||
    /\bwhat (practice|drills?|tests?) (should i do|next)\b/.test(t) ||
    (/\bwhat should i do next\b/.test(t) && /\b(practice|drill|test|train|learn)\b/.test(t))
  ) {
    return "recommend";
  }

  if (/\b(how\s+(is|was|are|'s|s)\s+my\s+typing(\s+speed)?)\b/.test(t)) return "stats";
  if (/\bhow are my (training\s+)?scores?\b/.test(t)) return "stats";
  if (/\bcheck my scores?\b/.test(t)) return "stats";
  if (/\b(what('s| is)|show|see)\s+my\s+(typing\s+speed|wpm|chat\s+speed|scores?|practice\s+stats?|performance|training\s+scores?)\b/.test(t)) {
    return "stats";
  }
  if (/\bmy\s+(typing\s+speed|wpm|chat\s+speed(\s+(&|and)\s+accuracy)?|scores?|practice\s+stats?|performance|training\s+scores?)\b/.test(t)) {
    return "stats";
  }
  if (/\b(typing\s+speed|wpm)\b/.test(t) && /\b(my|mine|i|me)\b/.test(t) && !/\blast\b/.test(t)) return "stats";
  if (/\bhow\s+fast\s+(do\s+i|am\s+i)\s+typ/.test(t)) return "stats";
  if (/\bhow\s+(am\s+i|am i)\s+(doing|performing)\b/.test(t) && /\b(practice|score|typing|drill)\b/.test(t)) {
    return "stats";
  }
  return null;
}

/** Personal typing / WPM / practice scores — not “open the drill” or peer performance. */
export function isMyTypingSpeedQuery(message: string): boolean {
  return classifyPersonalPracticeAsk(message) != null;
}

function typingEntries(progress: LevelUpProgress | null): DayLedgerEntry[] {
  const ledger = progress?.dayLedger ?? [];
  return ledger
    .filter((e) => e.drill === "typing" && typeof e.wpm === "number" && e.wpm > 0)
    .sort((a, b) => b.at - a.at);
}

function chatSimEntries(progress: LevelUpProgress | null): DayLedgerEntry[] {
  const ledger = progress?.dayLedger ?? [];
  return ledger
    .filter((e) => e.drill === "patientChat" && e.chatSim)
    .sort((a, b) => b.at - a.at);
}

function accuracyLabel(accuracy: number | undefined): string | null {
  if (typeof accuracy !== "number") return null;
  const pct = accuracy <= 1 ? Math.round(accuracy * 100) : Math.round(accuracy);
  return `${pct}%`;
}

function daysSinceDate(date: string, now = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const then = Date.parse(`${date}T12:00:00.000Z`);
  if (!Number.isFinite(then)) return null;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

function lastByDrill(progress: LevelUpProgress | null, drill: DailyCompletion): DayLedgerEntry | null {
  const rows = (progress?.dayLedger ?? []).filter((e) => e.drill === drill).sort((a, b) => b.at - a.at);
  return rows[0] ?? null;
}

function snapshotLines(progress: LevelUpProgress | null): string[] {
  const typing = typingEntries(progress);
  const lastType = typing[0];
  const lastSim = chatSimEntries(progress)[0];
  const streak = progress?.streak ?? 0;
  const typeBit = lastType
    ? `**${lastType.wpm} WPM**${accuracyLabel(lastType.accuracy) ? ` · ${accuracyLabel(lastType.accuracy)}` : ""} on ${lastType.date}`
    : "none logged yet";
  const simBit = lastSim
    ? `${lastSim.date}${lastSim.chatSim?.personaName ? ` · ${lastSim.chatSim.personaName}` : ""}`
    : "never";
  return [
    `**Current numbers:** last typing ${typeBit} · last chat simulator ${simBit} · streak **${streak}** day${streak === 1 ? "" : "s"}.`,
  ];
}

function hipaaLine(hipaa: ProgressState | null): { incomplete: boolean; line: string } {
  const total = MODULES.length;
  const done = hipaa?.modulesCompleted?.length ?? 0;
  if (!hipaa || done === 0) {
    return {
      incomplete: true,
      line: `**HIPAA training:** not started (${done}/${total} modules). Continue it before extra drills.`,
    };
  }
  if (done < total) {
    return {
      incomplete: true,
      line: `**HIPAA training:** ${done}/${total} modules done — continue the course (Learn → HIPAA).`,
    };
  }
  const scores = Object.values(hipaa.moduleQuizScores ?? {});
  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((s, q) => s + (q.total ? (q.correct / q.total) * 100 : 0), 0) / scores.length)
      : null;
  return {
    incomplete: false,
    line: `**HIPAA training:** complete (${done}/${total})${avg != null ? ` · quiz average about ${avg}%` : ""}.`,
  };
}

/** Rank next practice from live ledger + HIPAA progress. Always includes real numbers. */
export function formatPracticeRecommendation(
  progress: LevelUpProgress | null,
  hipaa: ProgressState | null,
  now = new Date(),
): string {
  const suggestions: string[] = [];
  const hipaaInfo = hipaaLine(hipaa);
  if (hipaaInfo.incomplete) {
    suggestions.push("Continue **HIPAA training** — it is still incomplete.");
  }

  const lastSim = chatSimEntries(progress)[0];
  const simAge = lastSim ? daysSinceDate(lastSim.date, now) : null;
  if (!lastSim || simAge == null || simAge >= STALE_DRILL_DAYS) {
    suggestions.push(
      lastSim
        ? `Do a **chat simulator** persona session — last one was ${lastSim.date} (${simAge} days ago).`
        : "Do a **chat simulator** persona session — none on this ledger yet.",
    );
  }

  const stale = SUGGESTABLE_DRILLS.filter((d) => {
    const last = lastByDrill(progress, d.key);
    if (!last) return true;
    const age = daysSinceDate(last.date, now);
    return age == null || age >= STALE_DRILL_DAYS;
  });
  for (const d of stale.slice(0, 2)) {
    const last = lastByDrill(progress, d.key);
    suggestions.push(
      last
        ? `Try **${d.label}** — last logged ${last.date}.`
        : `Try **${d.label}** — not logged yet.`,
    );
  }

  if (!suggestions.length) {
    suggestions.push("Nothing is stale. Keep the streak — a short typing passage or one persona chat is enough today.");
  }

  return [
    "**What to practice next** (from your ledger, not a generic guide):",
    "",
    ...suggestions.map((s, i) => `${i + 1}. ${s}`),
    "",
    hipaaInfo.line,
    ...snapshotLines(progress),
    "",
    "Open **Learn → Practice** or **Chat simulator**. I only used scores already on your account.",
  ].join("\n");
}

export function formatLastTypingMessage(progress: LevelUpProgress | null): string {
  const last = typingEntries(progress)[0];
  const lines = ["**Your last typing speed** (this account’s Practice ledger):", ""];
  if (!last) {
    lines.push("No reliable typing WPM logged yet.");
  } else {
    const acc = accuracyLabel(last.accuracy);
    lines.push(
      `**${last.wpm} WPM**${acc ? ` · ${acc} accuracy` : ""} on **${last.date}**.`,
    );
  }
  lines.push("", ...snapshotLines(progress));
  return lines.join("\n");
}

export function formatLastChatSimMessage(progress: LevelUpProgress | null, now = new Date()): string {
  const last = chatSimEntries(progress)[0];
  const lines = ["**Your last chat simulator session** (this account’s Practice ledger):", ""];
  if (!last) {
    lines.push("No chat-simulator session on this ledger yet. Pick a persona and do one — that’s the next step.");
  } else {
    const age = daysSinceDate(last.date, now);
    const who = last.chatSim?.personaName || last.chatSim?.personaId || "a persona";
    lines.push(
      `Last session: **${last.date}** · ${who}${age != null ? ` (${age} day${age === 1 ? "" : "s"} ago)` : ""}.`,
    );
    if (age == null || age >= STALE_DRILL_DAYS) {
      lines.push("That is stale — a new persona session is the useful next step.");
    }
  }
  lines.push("", ...snapshotLines(progress));
  return lines.join("\n");
}

export function formatPracticeStatsMessage(
  progress: LevelUpProgress | null,
  hipaa: ProgressState | null = null,
): string {
  const typing = typingEntries(progress);
  const best = typing.reduce<{ wpm: number; accuracy?: number; date?: string } | null>((acc, e) => {
    if (!acc || (e.wpm ?? 0) > acc.wpm) {
      return { wpm: e.wpm!, accuracy: e.accuracy, date: e.date };
    }
    return acc;
  }, null);
  const recent = typing.slice(0, 5);
  const sims = chatSimEntries(progress).slice(0, 3);

  const lines: string[] = ["**Your Practice stats** (synced ledger for this account):", "", hipaaLine(hipaa).line, ""];

  if (best) {
    const acc =
      typeof best.accuracy === "number"
        ? best.accuracy <= 1
          ? Math.round(best.accuracy * 100)
          : Math.round(best.accuracy)
        : null;
    lines.push(
      `**Personal best typing:** **${best.wpm} WPM**${acc != null ? ` · ${acc}% accuracy` : ""}${
        best.date ? ` (${best.date})` : ""
      }`,
    );
  } else {
    lines.push(
      "**Personal best typing:** none logged yet — finish a **Chat speed & accuracy** passage at 92%+ (reliable WPM only).",
    );
  }

  if (recent.length) {
    lines.push("", "**Recent typing attempts:**");
    for (const e of recent) {
      const acc =
        typeof e.accuracy === "number"
          ? e.accuracy <= 1
            ? Math.round(e.accuracy * 100)
            : Math.round(e.accuracy)
          : null;
      lines.push(
        `• ${e.date}: **${e.wpm} WPM**${acc != null ? ` · ${acc}%` : ""}${
          e.shareDecision === "yes" ? " · shared" : e.shareDecision === "no" ? " · private" : ""
        }`,
      );
    }
  }

  if (sims.length) {
    lines.push("", "**Recent chat simulator scores:**");
    for (const e of sims) {
      const cs = e.chatSim!;
      const bits = [
        cs.personaName || cs.personaId || "session",
        cs.outcome || "completed",
        typeof cs.grammarScore === "number" ? `Grammar ${cs.grammarScore}` : null,
        typeof cs.politenessScore === "number" ? `Politeness ${cs.politenessScore}` : null,
        typeof cs.relevanceScore === "number" ? `Relevance ${cs.relevanceScore}` : null,
        (cs.safetyReasons || []).includes("screening_as_diagnosis")
          ? "Clinical accuracy: a screening is not a diagnosis"
          : null,
      ].filter(Boolean);
      lines.push(`• ${e.date}: ${bits.join(" · ")}`);
    }
  } else {
    lines.push("", "No chat-simulator sessions on this ledger yet.");
  }

  lines.push("", ...snapshotLines(progress));
  lines.push(
    "",
    "Open **Learn → Practice** for drills, or **Chat simulator** for live persona practice. Tour sandbox typing does not write to this ledger.",
  );
  return lines.join("\n");
}

export async function answerMyTypingSpeedQuery(
  token: string,
  kind: PersonalPracticeKind = "stats",
): Promise<PracticeStatsAnswer | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/level-up/progress`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { progress: LevelUpProgress | null };
    const progress = data.progress ?? null;
    const hipaa = await pullProgressFromServer(token);
    const message =
      kind === "recommend"
        ? formatPracticeRecommendation(progress, hipaa)
        : kind === "last_typing"
          ? formatLastTypingMessage(progress)
          : kind === "last_chat_sim"
            ? formatLastChatSimMessage(progress)
            : formatPracticeStatsMessage(progress, hipaa);
    return {
      message,
      sources: [
        { title: "Practice progress (level-up ledger)", id: "level-up-progress" },
        { title: "HIPAA training progress", id: "training-progress" },
      ],
    };
  } catch {
    return null;
  }
}
