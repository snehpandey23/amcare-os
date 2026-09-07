/**
 * Ask — "how is my typing speed" → personal Practice / chat-sim stats (deterministic).
 * Same pattern as my-shifts: live data for the signed-in user only.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { DayLedgerEntry, LevelUpProgress } from "@/lib/level-up/progress";

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

/** Personal typing / WPM / chat-speed status — not “open the drill”. */
export function isMyTypingSpeedQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;
  // Open/start drill — leave to feature navigation
  if (/\b(start|open|begin|do|launch)\b[\s\S]{0,24}\b(typing|chat\s+speed|type\s*test)\b/.test(t)) {
    return false;
  }
  if (/\b(how\s+(is|was|'s|s)\s+my\s+typing(\s+speed)?)\b/.test(t)) return true;
  if (/\b(what('s| is)|show|see)\s+my\s+(typing\s+speed|wpm|chat\s+speed)\b/.test(t)) return true;
  if (/\bmy\s+(typing\s+speed|wpm|chat\s+speed(\s+(&|and)\s+accuracy)?)\b/.test(t)) return true;
  if (/\b(typing\s+speed|wpm)\b/.test(t) && /\b(my|mine|i|me)\b/.test(t)) return true;
  if (/\bhow\s+fast\s+(do\s+i|am\s+i)\s+typ/.test(t)) return true;
  return false;
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

export function formatPracticeStatsMessage(progress: LevelUpProgress | null): string {
  const typing = typingEntries(progress);
  const best = typing.reduce<{ wpm: number; accuracy?: number; date?: string } | null>((acc, e) => {
    if (!acc || (e.wpm ?? 0) > acc.wpm) {
      return { wpm: e.wpm!, accuracy: e.accuracy, date: e.date };
    }
    return acc;
  }, null);
  const recent = typing.slice(0, 5);
  const sims = chatSimEntries(progress).slice(0, 3);

  const lines: string[] = ["**Your Practice stats** (synced ledger for this account):", ""];

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
      ].filter(Boolean);
      lines.push(`• ${e.date}: ${bits.join(" · ")}`);
    }
  } else {
    lines.push("", "No chat-simulator sessions on this ledger yet.");
  }

  lines.push(
    "",
    "Open **Learn → Practice** for drills, or **Chat simulator** for live persona practice. Tour sandbox typing does not write to this ledger.",
  );
  return lines.join("\n");
}

export async function answerMyTypingSpeedQuery(
  token: string,
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
    return {
      message: formatPracticeStatsMessage(data.progress ?? null),
      sources: [{ title: "Practice progress (level-up ledger)", id: "level-up-progress" }],
    };
  } catch {
    return null;
  }
}
