/**
 * Read-only Founder Coach brief → chat context.
 * Never used to write Plan Record fields (Focus / Can Wait / Delegate / Observe).
 */

import { getTrainingApiUrl } from "@/lib/trainingConfig";

export function wantsFounderPortalSignals(message: string): boolean {
  const t = message.trim().toLowerCase();
  if (!t) return false;
  // Only live portal / Plan snapshot questions — not general strategy, trivia, or culture.
  return (
    /\b(accounts|hr|clinical|marketing|compliance)\b/.test(t) ||
    /\b(check-?in|domain|sop(?: review)? queue|pending sop|lead (said|reported|flagged))\b/.test(t) ||
    /\b(founder should know|founder focus|can wait|observe-?only)\b/.test(t) ||
    /\b(what('s| is) (on|in) (my )?(week|list|radar)|this week('s)? (signals?|plan|status|focus))\b/.test(
      t,
    ) ||
    /\b(what('s| is) flagged|domain (tab|signal)|lead check-?ins?)\b/.test(t) ||
    /\b(decision log|why did we|who decided)\b/.test(t)
  );
}

/** Which domain section to keep when the ask names one (e.g. Clinical flagged). */
export function portalDomainFilter(message: string): string | null {
  const t = message.trim().toLowerCase();
  if (/\bclinical\b/.test(t)) return "clinical";
  if (/\bmarketing\b/.test(t)) return "marketing";
  if (/\bcompliance\b/.test(t)) return "compliance";
  if (/\baccounts\b/.test(t)) return "accounts";
  if (/\bhr\b|\bhuman resources\b/.test(t)) return "hr";
  return null;
}

export function asksDomainFlags(message: string): boolean {
  return /\bflagged\b|\bflags?\b|\bfounder should know\b|\bblockers?\b/i.test(message);
}

type BriefDomain = {
  id?: string;
  title?: string;
  summary?: string;
  status?: string;
  items?: { label?: string; detail?: string; founderShouldKnow?: string; founderFlag?: boolean }[];
  checkins?: {
    whatChanged?: string;
    keyNumbersStatus?: string;
    blockers?: string;
    founderShouldKnow?: string;
    submitterName?: string;
  }[];
  placeholders?: string[];
};

function isNoiseTrainingItem(label: string): boolean {
  return /hipaa training not started|modulesCompleted|training starts/i.test(label);
}

/** Compact read-only snapshot for LLM grounding — no Plan Record mutation instructions. */
export async function fetchFounderPortalSignalsBlock(
  token: string,
  opts?: { domainFilter?: string | null; flagsOnly?: boolean },
): Promise<string | null> {
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
    const domainFilter = opts?.domainFilter?.toLowerCase() || null;
    const flagsOnly = Boolean(opts?.flagsOnly);
    const lines: string[] = [
      "PORTAL SNAPSHOT (read-only — for answering only).",
      "Do NOT update, suggest writing into, or claim you changed Founder Focus, Can Wait, Delegate, or Observe-only.",
      "Those Plan Record fields are manual; founder edits them on This week's plan if they choose.",
      `Week of ${brief.weekStart ?? "unknown"}.`,
    ];
    if (!domainFilter && brief.weeklyPlan?.founderFocus?.trim()) {
      lines.push(`Current manual Founder Focus (read-only): ${brief.weeklyPlan.founderFocus.trim().slice(0, 400)}`);
    }
    let domains = brief.domains ?? [];
    if (domainFilter) {
      domains = domains.filter(
        (d) =>
          (d.id || "").toLowerCase() === domainFilter ||
          (d.title || "").toLowerCase().includes(domainFilter),
      );
    }
    for (const d of domains) {
      const title = d.title || d.id || "Domain";
      lines.push(`## ${title} (${d.status ?? "unknown"})`);
      if (d.summary && !flagsOnly) lines.push(d.summary.slice(0, 400));
      const checkins = d.checkins ?? [];
      let wroteSignal = false;
      for (const c of checkins.slice(0, 5)) {
        const who = c.submitterName || "Lead";
        if (c.founderShouldKnow) {
          lines.push(`- ${who} · founder should know: ${c.founderShouldKnow.slice(0, 240)}`);
          wroteSignal = true;
        } else if (c.blockers) {
          lines.push(`- ${who} · blockers: ${c.blockers.slice(0, 160)}`);
          wroteSignal = true;
        } else if (!flagsOnly && c.whatChanged) {
          lines.push(`- ${who} · changed: ${c.whatChanged.slice(0, 200)}`);
          wroteSignal = true;
        }
      }
      for (const it of (d.items ?? []).slice(0, 8)) {
        if (!it.label) continue;
        if (isNoiseTrainingItem(it.label)) continue; // never treat HIPAA training headcount as a clinical "flag"
        if (flagsOnly && !it.founderFlag && !/open chat review|founder queue|block/i.test(it.label)) {
          continue;
        }
        lines.push(`- ${it.label}${it.detail ? `: ${it.detail.slice(0, 120)}` : ""}`);
        wroteSignal = true;
      }
      if (!wroteSignal) {
        lines.push("No founder-facing flags or check-in signals in this domain for the current week.");
      }
      if (!flagsOnly && d.placeholders?.length) {
        lines.push(`Not yet tracked: ${d.placeholders.slice(0, 4).join("; ")}`);
      }
    }
    if (domainFilter && !domains.length) {
      lines.push(`No ${domainFilter} domain snapshot available.`);
    }
    return lines.join("\n").slice(0, 6000);
  } catch {
    return null;
  }
}

export function founderCoachVaguePrompt(): string {
  return [
    "What do you want to talk through?",
    "",
    "For example: what's flagged in Clinical this week, a decision we made, SOP review queue, or who owns a blocker.",
    "I answer from portal signals and approved guides — I never write your Plan Record for you.",
  ].join("\n");
}
