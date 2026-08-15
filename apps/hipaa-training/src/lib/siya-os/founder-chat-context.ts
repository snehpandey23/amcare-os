/**
 * Read-only Founder Coach brief → chat context.
 * Never used to write Plan Record fields (Focus / Can Wait / Delegate / Observe).
 */

import { getTrainingApiUrl } from "@/lib/trainingConfig";

export function wantsFounderPortalSignals(message: string): boolean {
  const t = message.trim().toLowerCase();
  if (!t) return false;
  return (
    /\b(accounts|hr|clinical|marketing|compliance)\b/.test(t) ||
    /\b(check-?in|domain|sop queue|pending sop|lead (said|reported|flagged))\b/.test(t) ||
    /\b(founder should know|what('s| is) (on|in) (my )?(week|list|radar)|this week('s)? (signals?|plan|status))\b/.test(
      t,
    ) ||
    /\b(decision log|why did we|who decided)\b/.test(t)
  );
}

type BriefDomain = {
  id?: string;
  title?: string;
  summary?: string;
  status?: string;
  items?: { label?: string; detail?: string; founderShouldKnow?: string }[];
  checkins?: {
    whatChanged?: string;
    keyNumbersStatus?: string;
    blockers?: string;
    founderShouldKnow?: string;
    submitterName?: string;
  }[];
  placeholders?: string[];
};

/** Compact read-only snapshot for LLM grounding — no Plan Record mutation instructions. */
export async function fetchFounderPortalSignalsBlock(token: string): Promise<string | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/founder-coach/brief`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const brief = (await res.json()) as {
      weekStart?: string;
      domains?: BriefDomain[];
      weeklyPlan?: { founderFocus?: string; canWait?: string[] } | null;
    };
    const lines: string[] = [
      "PORTAL SNAPSHOT (read-only — for answering only).",
      "Do NOT update, suggest writing into, or claim you changed Founder Focus, Can Wait, Delegate, or Observe-only.",
      "Those Plan Record fields are manual; founder edits them on This week's plan if they choose.",
      `Week of ${brief.weekStart ?? "unknown"}.`,
    ];
    if (brief.weeklyPlan?.founderFocus?.trim()) {
      lines.push(`Current manual Founder Focus (read-only): ${brief.weeklyPlan.founderFocus.trim().slice(0, 400)}`);
    }
    for (const d of brief.domains ?? []) {
      const title = d.title || d.id || "Domain";
      lines.push(`## ${title} (${d.status ?? "unknown"})`);
      if (d.summary) lines.push(d.summary.slice(0, 400));
      for (const c of (d.checkins ?? []).slice(0, 3)) {
        const who = c.submitterName || "Lead";
        if (c.founderShouldKnow) lines.push(`- ${who} · founder should know: ${c.founderShouldKnow.slice(0, 240)}`);
        else if (c.whatChanged) lines.push(`- ${who} · changed: ${c.whatChanged.slice(0, 200)}`);
        if (c.blockers) lines.push(`  blockers: ${c.blockers.slice(0, 160)}`);
      }
      for (const it of (d.items ?? []).slice(0, 5)) {
        if (it.label) lines.push(`- ${it.label}${it.detail ? `: ${it.detail.slice(0, 120)}` : ""}`);
      }
      if (d.placeholders?.length) {
        lines.push(`Not yet tracked: ${d.placeholders.slice(0, 4).join("; ")}`);
      }
    }
    return lines.join("\n").slice(0, 6000);
  } catch {
    return null;
  }
}

export function founderCoachPlainOffTopic(): string {
  return [
    `I don't have a strong approved match for that yet.`,
    "",
    "Say what you're trying to understand in one sentence (a decision, a domain this week, an SOP, or who owns something), or open the matching domain tab for the structured snapshot.",
    "I won't write anything into your Plan Record — that's manual on This week's plan.",
  ].join("\n");
}

export function founderCoachVaguePrompt(): string {
  return [
    "What do you want to talk through?",
    "",
    "For example: what's flagged in Clinical this week, a decision we made, SOP review queue, or who owns a blocker.",
    "I answer from portal signals and approved guides — I never write your Plan Record for you.",
  ].join("\n");
}
