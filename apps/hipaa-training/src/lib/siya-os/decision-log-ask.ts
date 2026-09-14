/**
 * Broad “decision log overview” asks — ranked working set, not a flat archive dump.
 */

import { MEMORY_DEEP_LINKS } from "@/lib/memory-deep-links";
import { DEPARTMENTS, type Department } from "./departments";
import { routeIntent } from "./flows";

export type DecisionRetrievalRow = {
  id: string;
  title: string;
  body: string;
  keywords: string[];
  status?: string;
  department: string;
  actionHook?: string | null;
  importance?: number;
  decisionDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type DecisionOverviewOpts = {
  /** Preferred department from Founder Talk / last-turn routing (not General). */
  preferredDepartment?: string | null;
  /** Prior chat turns — used for light conversation pin (last 1–2 user messages). */
  history?: { role: string; content: string }[];
  /** Injectable clock for tests. */
  nowMs?: number;
  /** Soft target size (default 5). */
  targetCap?: number;
  /** Hard ceiling (default 7). */
  hardCap?: number;
};

const TARGET_CAP = 5;
const HARD_CAP = 7;

/** “Any decisions I should remember?” / decision-log overview — not a specific “why did we X”. */
export function wantsDecisionLogOverview(message: string): boolean {
  const t = message.trim().toLowerCase().replace(/[?.!]+$/g, "");
  if (!t) return false;
  if (
    /\b(any )?decisions? (i|we|you) should (remember|know|keep in mind)\b/.test(t) ||
    /\bdecisions? (to|i should) remember\b/.test(t) ||
    (/\b(what|which) decisions?\b/.test(t) && /\b(remember|know|matter|important|recent)\b/.test(t)) ||
    /\bremind me (of |about )?(the |our |recent )?decisions?\b/.test(t) ||
    /\b(show|list|open|check|from) (me )?(the |our )?decision log\b/.test(t) ||
    /^(the )?decision log$/.test(t) ||
    /^recent decisions$/.test(t) ||
    /\bwhat('s| is) in (the )?decision log\b/.test(t)
  ) {
    return true;
  }
  return false;
}

export function isLiveDecision(d: DecisionRetrievalRow): boolean {
  const s = (d.status || "active").toLowerCase();
  return s !== "superseded" && s !== "archived" && s !== "draft";
}

export function displayDecisionTitle(title: string): string {
  return title.replace(/^Decision\s*·\s*/i, "").trim() || title;
}

function hasActionHook(d: DecisionRetrievalRow): boolean {
  return Boolean(d.actionHook && d.actionHook.trim());
}

function importanceOf(d: DecisionRetrievalRow): 1 | 2 | 3 {
  const n = Number(d.importance);
  if (n === 1 || n === 3) return n;
  return 2;
}

function ageDays(d: DecisionRetrievalRow, nowMs: number): number | null {
  const raw = d.decisionDate || d.updatedAt || d.createdAt;
  if (!raw) return null;
  const t = Date.parse(raw);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, (nowMs - t) / (1000 * 60 * 60 * 24));
}

/** Recency: strong <30d, soft <90d, near-zero older unless importance=3 or action_hook. */
export function recencyScore(d: DecisionRetrievalRow, nowMs: number): number {
  const age = ageDays(d, nowMs);
  const keepAlive = importanceOf(d) === 3 || hasActionHook(d);
  if (age == null) return keepAlive ? 8 : 4;
  if (age < 30) return 30;
  if (age < 90) return 12;
  return keepAlive ? 8 : 0;
}

export function qualifiesForStanding(d: DecisionRetrievalRow, nowMs: number): boolean {
  if (hasActionHook(d)) return false;
  if (importanceOf(d) < 2) return false;
  const age = ageDays(d, nowMs);
  if (age == null) return importanceOf(d) >= 2;
  if (age < 90) return true;
  return importanceOf(d) === 3;
}

/** Higher is better. */
export function scoreDecisionForOverview(d: DecisionRetrievalRow, nowMs: number): number {
  let s = 0;
  if (hasActionHook(d)) s += 100;
  const imp = importanceOf(d);
  if (imp === 3) s += 40;
  else if (imp === 2) s += 20;
  else s += 5;
  s += recencyScore(d, nowMs);
  return s;
}

function normalizeDept(raw: string | null | undefined): string {
  const t = (raw || "").trim();
  if (!t) return "General";
  const hit = DEPARTMENTS.find((d) => d.toLowerCase() === t.toLowerCase());
  return hit ?? t;
}

function isCrossCutting(dept: string): boolean {
  const d = normalizeDept(dept).toLowerCase();
  return d === "leadership" || d === "general" || d === "";
}

function deptMatchesPreferred(dept: string, preferred: string): boolean {
  return normalizeDept(dept).toLowerCase() === preferred.toLowerCase();
}

/**
 * Infer preferred department from last 1–2 user turns (and optional current routing).
 * Returns null for General / unset — no bias.
 */
export function inferOverviewDepartment(
  history: { role: string; content: string }[] = [],
  routingDepartment?: string | null,
): string | null {
  const priorUsers = history
    .filter((h) => h.role === "user")
    .map((h) => h.content.trim())
    .filter(Boolean)
    .slice(-2);

  for (let i = priorUsers.length - 1; i >= 0; i--) {
    const text = priorUsers[i]!;
    // Explicit department name in the turn beats generic routing.
    const named = DEPARTMENTS.find(
      (d) => d !== "General" && new RegExp(`\\b${d.replace(/\s+/g, "\\s+")}\\b`, "i").test(text),
    );
    if (named) return named;
    const routed = routeIntent(text).department;
    if (routed && routed !== "General" && routed !== "Leadership") return routed;
    // Leadership only if the turn is clearly about leadership (not a weak fallback).
    if (routed === "Leadership" && /\bleadership\b|\bfounder\b|\bstrategy\b/i.test(text)) return routed;
  }

  if (routingDepartment && routingDepartment !== "General" && routingDepartment !== "Leadership") {
    return normalizeDept(routingDepartment);
  }
  return null;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

/** Light keyword match against last 1–2 user turns — reuses topic signals, no new store. */
export function findConversationPin(
  decisions: DecisionRetrievalRow[],
  history: { role: string; content: string }[] = [],
): DecisionRetrievalRow | null {
  const prior = history
    .filter((h) => h.role === "user")
    .map((h) => h.content.trim())
    .filter(Boolean)
    .slice(-2);
  if (!prior.length || !decisions.length) return null;
  const blob = prior.join("\n").toLowerCase();
  const tokens = new Set(tokenize(blob));
  if (tokens.size < 2) return null;

  let best: DecisionRetrievalRow | null = null;
  let bestScore = 0;
  for (const d of decisions) {
    if (!isLiveDecision(d)) continue;
    let s = 0;
    const title = displayDecisionTitle(d.title).toLowerCase();
    for (const k of d.keywords || []) {
      const kl = k.toLowerCase();
      if (kl.length > 2 && blob.includes(kl)) s += 4;
    }
    for (const w of tokenize(title)) {
      if (tokens.has(w)) s += 3;
    }
    for (const w of tokenize(d.body.slice(0, 400))) {
      if (w.length > 4 && tokens.has(w)) s += 1;
    }
    // Need a real topical overlap, not a single stopword-ish hit
    if (s > bestScore && s >= 6) {
      bestScore = s;
      best = d;
    }
  }
  return best;
}

function sortByScore(rows: DecisionRetrievalRow[], nowMs: number): DecisionRetrievalRow[] {
  return [...rows].sort((a, b) => {
    const ds = scoreDecisionForOverview(b, nowMs) - scoreDecisionForOverview(a, nowMs);
    if (ds !== 0) return ds;
    return displayDecisionTitle(a.title).localeCompare(displayDecisionTitle(b.title));
  });
}

function pickWithDepartmentBias(
  candidates: DecisionRetrievalRow[],
  preferred: string | null,
  limit: number,
  excludeIds: Set<string>,
): DecisionRetrievalRow[] {
  const available = candidates.filter((d) => !excludeIds.has(d.id));
  if (!preferred || limit <= 0) return available.slice(0, limit);

  const focused = available.filter((d) => deptMatchesPreferred(d.department, preferred));
  const rest = available.filter((d) => !deptMatchesPreferred(d.department, preferred));
  // Prefer Leadership/General among the remainder (cross-cutting), then other depts
  const cross = rest.filter((d) => isCrossCutting(d.department));
  const other = rest.filter((d) => !isCrossCutting(d.department));
  return [...focused, ...cross, ...other].slice(0, limit);
}

function snippet(body: string, max = 180): string {
  const one = body.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 1).trim()}…`;
}

function formatRow(d: DecisionRetrievalRow, i: number): string {
  const dept = d.department?.trim() ? ` · ${normalizeDept(d.department)}` : "";
  const hook = hasActionHook(d) ? `\n   Apply: ${d.actionHook!.trim()}` : "";
  return `${i}. **${displayDecisionTitle(d.title)}**${dept}\n   ${snippet(d.body)}${hook}`;
}

/** Rule-final overview: ranked, bucketed, capped — not a flat archive dump. */
export function formatDecisionLogOverview(
  decisions: DecisionRetrievalRow[],
  opts: DecisionOverviewOpts = {},
): {
  message: string;
  links: { label: string; href: string }[];
} {
  const nowMs = opts.nowMs ?? Date.now();
  const targetCap = opts.targetCap ?? TARGET_CAP;
  const hardCap = Math.max(targetCap, opts.hardCap ?? HARD_CAP);
  const preferred = opts.preferredDepartment ? normalizeDept(opts.preferredDepartment) : null;
  const preferredActive = preferred && preferred !== "General" ? preferred : null;

  const links = [{ label: MEMORY_DEEP_LINKS.knowledge.label, href: MEMORY_DEEP_LINKS.knowledge.href }];
  const live = decisions.filter(isLiveDecision);
  const pool = live.length ? live : decisions;

  if (!pool.length) {
    return {
      message: [
        "**Decision log** — I don’t have published decisions loaded right now.",
        "",
        `Open **${MEMORY_DEEP_LINKS.knowledge.label}** in Memory to browse or add entries.`,
      ].join("\n"),
      links,
    };
  }

  const pin = findConversationPin(pool, opts.history ?? []);
  const exclude = new Set<string>();
  const selected: DecisionRetrievalRow[] = [];

  if (pin) {
    selected.push(pin);
    exclude.add(pin.id);
  }

  const stillCandidates = sortByScore(
    pool.filter((d) => hasActionHook(d) && !exclude.has(d.id)),
    nowMs,
  );
  const standingCandidates = sortByScore(
    pool.filter((d) => qualifiesForStanding(d, nowMs) && !exclude.has(d.id)),
    nowMs,
  );

  // Leave room for standing when both buckets have content; stay near targetCap.
  const stillBudget = Math.min(
    hardCap - selected.length,
    stillCandidates.length && standingCandidates.length
      ? Math.max(1, Math.ceil((targetCap - selected.length) * 0.55))
      : targetCap - selected.length,
  );
  for (const d of pickWithDepartmentBias(stillCandidates, preferredActive, stillBudget, exclude)) {
    selected.push(d);
    exclude.add(d.id);
  }

  const standingBudget = Math.min(hardCap - selected.length, Math.max(0, targetCap - selected.length));
  for (const d of pickWithDepartmentBias(standingCandidates, preferredActive, standingBudget, exclude)) {
    selected.push(d);
    exclude.add(d.id);
  }

  // Sparse data: backfill by score (+ dept bias) up to targetCap.
  if (selected.length < targetCap) {
    for (const d of pickWithDepartmentBias(
      sortByScore(
        pool.filter((d) => !exclude.has(d.id)),
        nowMs,
      ),
      preferredActive,
      targetCap - selected.length,
      exclude,
    )) {
      selected.push(d);
      exclude.add(d.id);
    }
  }

  // If still-in-play overflowed soft budget but hardCap allows and standing empty, OK.
  // If we have unused hardCap and high-score still-in-play left, add one more action item.
  if (selected.length < hardCap && selected.length < targetCap + 1) {
    const extraStill = pickWithDepartmentBias(stillCandidates, preferredActive, 1, exclude);
    for (const d of extraStill) {
      if (selected.length >= hardCap) break;
      selected.push(d);
      exclude.add(d.id);
    }
  }

  const finalRows = selected.slice(0, hardCap);
  const stillInPlay = finalRows.filter((d) => hasActionHook(d) && d.id !== pin?.id);
  const standing = finalRows.filter((d) => d.id !== pin?.id && !hasActionHook(d));
  // Pin may also be "in play" — keep it only under Related, not duplicated in buckets
  const pinOnly = pin && finalRows.some((d) => d.id === pin.id) ? pin : null;

  const focusedCount = preferredActive
    ? finalRows.filter((d) => deptMatchesPreferred(d.department, preferredActive)).length
    : 0;
  const companyWideCount = preferredActive
    ? finalRows.filter((d) => !deptMatchesPreferred(d.department, preferredActive)).length
    : 0;

  const lines: string[] = ["**Decision log** — what to keep in mind:"];

  if (preferredActive && focusedCount > 0) {
    const biasNote =
      companyWideCount > 0
        ? `Focused on **${preferredActive}** (${focusedCount}); also ${companyWideCount} company-wide.`
        : `Focused on **${preferredActive}** (${focusedCount}).`;
    lines.push(biasNote);
  }

  lines.push("");

  let n = 1;
  if (pinOnly) {
    lines.push("**Related to what you just asked:**");
    lines.push(formatRow(pinOnly, n++));
    lines.push("");
  }

  if (stillInPlay.length) {
    lines.push("**Still in play**");
    for (const d of stillInPlay) {
      lines.push(formatRow(d, n++));
    }
    lines.push("");
  }

  if (standing.length) {
    lines.push("**Standing constraints**");
    for (const d of standing) {
      lines.push(formatRow(d, n++));
    }
    lines.push("");
  }

  // Edge: pin-only or unsorted leftovers if buckets empty (backfill-only)
  if (!stillInPlay.length && !standing.length && !pinOnly) {
    lines.push("**Standing constraints**");
    for (const d of finalRows) {
      lines.push(formatRow(d, n++));
    }
    lines.push("");
  } else if (!stillInPlay.length && !standing.length && pinOnly && finalRows.length > 1) {
    const rest = finalRows.filter((d) => d.id !== pinOnly.id);
    lines.push("**Standing constraints**");
    for (const d of rest) {
      lines.push(formatRow(d, n++));
    }
    lines.push("");
  }

  lines.push("Full log in Memory → Knowledge.");
  lines.push(
    `Open **${MEMORY_DEEP_LINKS.knowledge.label}**, or ask about a specific decision (e.g. “why did we change the homepage CTA?”) for more depth.`,
  );

  return { message: lines.join("\n"), links };
}

/** @deprecated Use inferOverviewDepartment — kept for typed Department callers. */
export function asDepartment(raw: string | null | undefined): Department | null {
  const n = raw ? normalizeDept(raw) : null;
  if (!n || n === "General") return null;
  return (DEPARTMENTS as readonly string[]).includes(n) ? (n as Department) : null;
}
