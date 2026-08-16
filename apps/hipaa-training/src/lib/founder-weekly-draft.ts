/**
 * Phase 2 — AI-assisted weekly plan draft grounded in founder input + Phase 1 signals.
 * Must not invent content outside those sources.
 */
import { generateObject } from "ai";
import { z } from "zod";
import {
  markWorkforceLlmFailure,
  markWorkforceLlmSuccess,
  workforceLlmConfigured,
  workforceLlmDisabledMessage,
  withWorkforceModelFallback,
  type ClassifiedWorkforceLlmError,
} from "@/lib/siya-os/model";
import type { DelegateLane, DomainItem, ObserveOnlyFlag } from "@/lib/founder-coach-api";

export type WeeklyDraftResult = {
  founderFocus: string;
  canWait: string[];
  delegate: DelegateLane[];
  observeOnly: ObserveOnlyFlag[];
  groundedOnly: boolean;
  method: "llm" | "deterministic";
  citations: string[];
  /** Present when AI rewrite failed — UI must not present this as a grounded AI plan. */
  aiUnavailable?: ClassifiedWorkforceLlmError | null;
};

const draftSchema = z.object({
  founderFocus: z.string().max(800),
  canWait: z.array(z.string().max(400)).max(3),
  delegate: z
    .array(
      z.object({
        lane: z.string().max(200),
        ownerName: z.string().max(120),
        // OpenAI strict JSON schema requires every property in `required` — no .optional().
        note: z.string().max(400),
      }),
    )
    .max(8),
  observeOnly: z
    .array(
      z.object({
        id: z.string().max(80),
        lane: z.string().max(200),
        instruction: z.string().max(500),
      }),
    )
    .max(8),
  citations: z.array(z.string().max(200)).max(20),
});

function splitPriorities(raw: string): string[] {
  return raw
    .split(/\n|[•·]|(?:^|\s)[-*]\s+/)
    .map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
    .filter((s) => s.length >= 3)
    .slice(0, 12);
}

/** Question / probe — must not be copied into Founder Focus as if it were a priority. */
export function isFounderQuestion(text: string): boolean {
  const t = text.trim();
  if (!t || t.length < 3) return false;
  if (/\?\s*$/.test(t)) return true;
  if (
    /^(what|whats|what's|how|who|why|which|when|where|should\s+i|do\s+i|is\s+there|are\s+there|can\s+i|could\s+i)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(on top of (the )?list|needs? (my )?attention|should i (focus|prioritize|do)|what('?s| is) (first|urgent|important))\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Fingerprint for deduping the same underlying portal fact (e.g. clin-hipaa vs comp-hipaa).
 * Prefer meaning over source id / domain bucket.
 */
export function factFingerprint(item: {
  id?: string;
  label: string;
  detail?: string;
  source?: string;
}): string {
  const blob = `${item.label} ${item.detail || ""}`.toLowerCase().replace(/\s+/g, " ").trim();

  if (/\bhipaa\b/.test(blob) && /\b(not started|training)\b/.test(blob)) {
    const n = blob.match(/(\d+)\s+active users/);
    return `fact:hipaa-training-not-started:${n?.[1] ?? "n"}`;
  }
  if (/\bopen chat review/.test(blob)) {
    const n = blob.match(/(\d+)\s+open/);
    return `fact:open-chat-reviews:${n?.[1] ?? "n"}`;
  }
  if (/\bshift handoff/.test(blob)) {
    const n = blob.match(/(\d+)\s+shift/);
    return `fact:shift-handoffs:${n?.[1] ?? "n"}`;
  }
  if (/\bsop(s)? on founder queue|\bfounder.?routed\b/.test(blob) || /siya_sops\.founder/.test(item.source || "")) {
    return `fact:founder-sop-queue:${blob.match(/(\d+)/)?.[1] ?? "n"}`;
  }
  if (/\blive sops past review/.test(blob)) {
    return `fact:sops-past-review:${blob.match(/(\d+)/)?.[1] ?? "n"}`;
  }
  if (/^decision\s*[·:]/i.test(item.label) || (item.source || "").startsWith("siya_decisions")) {
    return `fact:decision:${(item.id || item.label).toLowerCase().slice(0, 80)}`;
  }

  return blob
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(clin|comp)-?\w*\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

export function dedupeDomainItemsByFact(items: DomainItem[]): DomainItem[] {
  const seen = new Set<string>();
  const out: DomainItem[] = [];
  for (const item of items) {
    const key = factFingerprint(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function dedupeCanWaitLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = factFingerprint({ label: line });
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function rankSignals(items: DomainItem[]): DomainItem[] {
  return [...items].sort((a, b) => {
    if (a.founderFlag !== b.founderFlag) return a.founderFlag ? -1 : 1;
    const aLead = a.source.startsWith("weekly_lead_checkins") ? 1 : 0;
    const bLead = b.source.startsWith("weekly_lead_checkins") ? 1 : 0;
    if (aLead !== bLead) return bLead - aLead;
    const aU = a.urgencyDate ? 1 : 0;
    const bU = b.urgencyDate ? 1 : 0;
    if (aU !== bU) return bU - aU;
    if (a.urgencyDate && b.urgencyDate) return a.urgencyDate.localeCompare(b.urgencyDate);
    const aDec = a.source.startsWith("siya_decisions") ? 1 : 0;
    const bDec = b.source.startsWith("siya_decisions") ? 1 : 0;
    if (aDec !== bDec) return bDec - aDec;
    return a.label.localeCompare(b.label);
  });
}

function focusFromSignal(top: DomainItem): string {
  const body = top.detail ? `${top.label} — ${top.detail}` : top.label;
  return `Priority: ${body}`.replace(/\s+/g, " ").trim().slice(0, 800);
}

/** Deterministic grounding — used when LLM is off or as validation baseline. */
export function buildDeterministicWeeklyDraft(opts: {
  prioritiesRaw: string;
  leadSignals: DomainItem[];
  nearestDeadlines: DomainItem[];
}): WeeklyDraftResult {
  const question = isFounderQuestion(opts.prioritiesRaw);
  const priorityLines = question ? [] : splitPriorities(opts.prioritiesRaw);
  const pool = dedupeDomainItemsByFact(
    rankSignals([...opts.leadSignals, ...opts.nearestDeadlines]),
  );
  const founderFlags = pool.filter((s) => s.founderFlag);
  const blockers = pool.filter((s) => s.source.includes("blockers"));
  const citations: string[] = [];

  let founderFocus = "";
  if (question) {
    const top = pool[0];
    if (top) {
      founderFocus = focusFromSignal(top);
      citations.push(top.id);
    } else {
      founderFocus =
        "No strong portal signal this week — file a lead check-in or name one Founder Focus decision manually.";
      citations.push("signals.empty");
    }
  } else if (priorityLines[0]) {
    founderFocus = priorityLines[0].slice(0, 800);
    citations.push("founder.priorities_raw");
  } else if (founderFlags[0]) {
    founderFocus = focusFromSignal(founderFlags[0]);
    citations.push(founderFlags[0].id);
  } else if (pool[0]) {
    founderFocus = focusFromSignal(pool[0]);
    citations.push(pool[0].id);
  }

  const canWaitRaw: string[] = [];
  if (!question) {
    for (const line of priorityLines.slice(1, 4)) {
      canWaitRaw.push(line.slice(0, 400));
      citations.push("founder.priorities_raw");
    }
  }
  for (const d of pool) {
    if (canWaitRaw.length >= 6) break;
    if (d.id && citations.includes(d.id) && founderFocus.includes(d.label)) continue;
    const text = d.detail ? `${d.label} — ${d.detail}` : d.label;
    canWaitRaw.push(text.slice(0, 400));
    citations.push(d.id);
  }
  const canWait = dedupeCanWaitLines(canWaitRaw)
    .filter((line) => {
      const fp = factFingerprint({ label: line });
      const focusFp = factFingerprint({ label: founderFocus });
      return fp !== focusFp;
    })
    .slice(0, 3);

  const delegate: DelegateLane[] = [];
  for (const b of blockers.slice(0, 4)) {
    delegate.push({
      lane: b.label.slice(0, 200),
      ownerName: "Department lead",
      note: (b.detail || "From weekly lead check-in blocker").slice(0, 400),
    });
    citations.push(b.id);
  }

  const observeOnly: ObserveOnlyFlag[] = [];
  for (const f of founderFlags.slice(0, 4)) {
    if (founderFocus.includes(f.label) || founderFocus.includes(f.detail || "")) continue;
    observeOnly.push({
      id: f.id.slice(0, 80),
      lane: f.label.slice(0, 200),
      instruction: (f.detail || "Watch — flagged in lead check-in").slice(0, 500),
    });
    citations.push(f.id);
  }

  return {
    founderFocus: founderFocus.slice(0, 800),
    canWait,
    delegate: delegate.slice(0, 8),
    observeOnly: observeOnly.slice(0, 8),
    groundedOnly: true,
    method: "deterministic",
    citations: [...new Set(citations)],
  };
}

/** Apply a single refine instruction to an existing draft without a full restart (deterministic). */
export function refineDeterministicWeeklyDraft(
  current: WeeklyDraftResult,
  instruction: string,
): WeeklyDraftResult {
  const tip = instruction.trim().slice(0, 800);
  if (!tip) return current;
  const lower = tip.toLowerCase();
  const next: WeeklyDraftResult = {
    ...current,
    canWait: dedupeCanWaitLines([...current.canWait]),
    delegate: current.delegate.map((d) => ({ ...d })),
    observeOnly: current.observeOnly.map((o) => ({ ...o })),
    citations: [...new Set([...current.citations, "founder.refine"])],
    method: "deterministic",
    groundedOnly: true,
  };

  if (/\b(can wait|defer|later|park)\b/i.test(tip) && next.founderFocus.trim()) {
    const moved = next.founderFocus.trim().slice(0, 400);
    if (!next.canWait.includes(moved) && next.canWait.length < 3) {
      next.canWait = dedupeCanWaitLines([moved, ...next.canWait]).slice(0, 3);
    }
    next.founderFocus = tip.replace(/^[^:]*:\s*/, "").slice(0, 800) || next.founderFocus;
  } else if (/\b(delegate|hand off|assign)\b/i.test(tip)) {
    next.delegate = [
      {
        lane: tip.slice(0, 200),
        ownerName: "Department lead",
        note: "From refine instruction",
      },
      ...next.delegate,
    ].slice(0, 8);
  } else if (/\b(observe|watch|don't touch|do not change)\b/i.test(tip)) {
    next.observeOnly = [
      {
        id: `refine-${Date.now().toString(36)}`,
        lane: "Refine note",
        instruction: tip.slice(0, 500),
      },
      ...next.observeOnly,
    ].slice(0, 8);
  } else if (/\bfocus\b/i.test(tip) || lower.startsWith("make ") || lower.startsWith("change focus")) {
    next.founderFocus = tip.slice(0, 800);
  } else {
    next.founderFocus = `${next.founderFocus}\n(Refine: ${tip})`.trim().slice(0, 800);
  }
  next.canWait = dedupeCanWaitLines(next.canWait).slice(0, 3);
  return next;
}

export async function draftWeeklyPlanFromSignals(opts: {
  prioritiesRaw: string;
  leadSignals: DomainItem[];
  nearestDeadlines: DomainItem[];
  /** When refining: pass the current structured draft (not from scratch). */
  currentDraft?: Pick<WeeklyDraftResult, "founderFocus" | "canWait" | "delegate" | "observeOnly" | "citations"> | null;
  refineInstruction?: string;
}): Promise<WeeklyDraftResult> {
  const refine = opts.refineInstruction?.trim() || "";
  const isRefine = Boolean(refine && opts.currentDraft);
  const askedQuestion = !isRefine && isFounderQuestion(opts.prioritiesRaw);

  const base = isRefine
    ? refineDeterministicWeeklyDraft(
        {
          founderFocus: opts.currentDraft!.founderFocus,
          canWait: opts.currentDraft!.canWait,
          delegate: opts.currentDraft!.delegate,
          observeOnly: opts.currentDraft!.observeOnly,
          citations: opts.currentDraft!.citations ?? [],
          groundedOnly: true,
          method: "deterministic",
        },
        refine,
      )
    : buildDeterministicWeeklyDraft(opts);

  if (!isRefine && !opts.prioritiesRaw.trim() && !opts.leadSignals.length && !opts.nearestDeadlines.length) {
    return { ...base, groundedOnly: false, aiUnavailable: null };
  }

  const unavailable = (err: ClassifiedWorkforceLlmError): WeeklyDraftResult => ({
    ...base,
    groundedOnly: false,
    method: "deterministic",
    aiUnavailable: err,
    citations: [...new Set([...(base.citations || []), "ai.unavailable"])],
  });

  if (!workforceLlmConfigured()) {
    return unavailable(workforceLlmDisabledMessage());
  }

  const signalPool = dedupeDomainItemsByFact(
    rankSignals([...opts.leadSignals, ...opts.nearestDeadlines]),
  );
  const signalBlock = signalPool
    .slice(0, 40)
    .map(
      (s) =>
        `- id=${s.id} | ${s.label} | ${s.detail || ""} | source=${s.source} | urgency=${s.urgencyDate || "none"} | founderFlag=${s.founderFlag}`,
    )
    .join("\n");

  const modePrompt = isRefine
    ? `You are REFINING an existing weekly plan. Start from CURRENT DRAFT and apply ONLY the founder's adjustment.
Do not rebuild from scratch. Keep categories that the adjustment does not mention.
Adjustment:
"""
${refine.slice(0, 2000)}
"""

CURRENT DRAFT:
${JSON.stringify({
  founderFocus: opts.currentDraft!.founderFocus,
  canWait: opts.currentDraft!.canWait,
  delegate: opts.currentDraft!.delegate,
  observeOnly: opts.currentDraft!.observeOnly,
})}
`
    : `You draft a Founder Decision Coach weekly plan for Siya Health (physician-led telehealth).

Founder input (${askedQuestion ? "QUESTION — do not echo into Founder Focus" : "stated priorities"}):
"""
${opts.prioritiesRaw.slice(0, 6000)}
"""

Deterministic baseline (you may refine wording but stay grounded):
${JSON.stringify({
  founderFocus: base.founderFocus,
  canWait: base.canWait,
  delegate: base.delegate,
  observeOnly: base.observeOnly,
})}
`;

  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: draftSchema,
        prompt: `${modePrompt}

RULES (non-negotiable):
- Use ONLY the founder's text, the CURRENT DRAFT (when refining), and the listed Phase 1 signals.
- Do NOT invent deadlines, metrics, legal/tax/CPOM advice, or department facts not listed.
- Founder Focus = exactly ONE most important decision for this week — a concrete priority from signals (or stated priorities), never a restatement of a question.
${askedQuestion ? "- The founder asked a QUESTION. Answer it by choosing Founder Focus from signals. Never set Founder Focus to the question text." : ""}
- Can Wait = max 3 items. Never list the same underlying fact twice (e.g. same HIPAA count from two domain tabs).
- Delegate = items a lead can own (prefer blockers from check-ins). Each delegate object must include note (use "" if none).
- Observe only = watch items.
- citations must be signal ids from the list and/or "founder.priorities_raw" / "founder.refine".

Phase 1 signals (lead check-ins + portal domain items + decisions — already deduped by fact):
${signalBlock || "(none this week)"}
`,
      });
      return o;
    });
    markWorkforceLlmSuccess();
    const canWait = dedupeCanWaitLines(object.canWait.filter(Boolean)).slice(0, 3);
    let founderFocus = object.founderFocus.slice(0, 800);
    if (askedQuestion && isFounderQuestion(founderFocus)) {
      founderFocus = base.founderFocus;
    }
    return {
      founderFocus,
      canWait,
      delegate: object.delegate.slice(0, 8).map((d) => ({
        lane: d.lane,
        ownerName: d.ownerName,
        note: (d.note || "").slice(0, 400) || undefined,
      })),
      observeOnly: object.observeOnly.slice(0, 8),
      groundedOnly: true,
      method: "llm",
      aiUnavailable: null,
      citations: object.citations.length
        ? object.citations
        : [...new Set([...(base.citations || []), ...(isRefine ? ["founder.refine"] : [])])],
    };
  } catch (err) {
    return unavailable(markWorkforceLlmFailure(err));
  }
}
