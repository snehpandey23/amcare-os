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

/** Deterministic grounding — used when LLM is off or as validation baseline. */
export function buildDeterministicWeeklyDraft(opts: {
  prioritiesRaw: string;
  leadSignals: DomainItem[];
  nearestDeadlines: DomainItem[];
}): WeeklyDraftResult {
  const lines = splitPriorities(opts.prioritiesRaw);
  const founderFlags = opts.leadSignals.filter((s) => s.founderFlag);
  const blockers = opts.leadSignals.filter((s) => s.source.includes("blockers"));
  const citations: string[] = [];

  let founderFocus = lines[0] || "";
  if (!founderFocus && founderFlags[0]) {
    founderFocus = `${founderFlags[0].label}: ${founderFlags[0].detail || ""}`.trim().slice(0, 800);
    citations.push(founderFlags[0].id);
  } else if (lines[0]) {
    citations.push("founder.priorities_raw");
  }

  const canWait: string[] = [];
  for (const line of lines.slice(1, 4)) {
    canWait.push(line.slice(0, 400));
    citations.push("founder.priorities_raw");
  }
  for (const d of opts.nearestDeadlines) {
    if (canWait.length >= 3) break;
    if (founderFocus.includes(d.label)) continue;
    const text = d.detail ? `${d.label} — ${d.detail}` : d.label;
    canWait.push(text.slice(0, 400));
    citations.push(d.id);
  }

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
    canWait: canWait.slice(0, 3),
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
    canWait: [...current.canWait],
    delegate: current.delegate.map((d) => ({ ...d })),
    observeOnly: current.observeOnly.map((o) => ({ ...o })),
    citations: [...new Set([...current.citations, "founder.refine"])],
    method: "deterministic",
    groundedOnly: true,
  };

  // Lightweight heuristics for common adjustments; otherwise annotate focus.
  if (/\b(can wait|defer|later|park)\b/i.test(tip) && next.founderFocus.trim()) {
    const moved = next.founderFocus.trim().slice(0, 400);
    if (!next.canWait.includes(moved) && next.canWait.length < 3) {
      next.canWait = [moved, ...next.canWait].slice(0, 3);
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

  const signalBlock = [...opts.leadSignals, ...opts.nearestDeadlines]
    .slice(0, 40)
    .map((s) => `- id=${s.id} | ${s.label} | ${s.detail || ""} | source=${s.source} | urgency=${s.urgencyDate || "none"} | founderFlag=${s.founderFlag}`)
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

Founder priorities / thoughts:
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
- Founder Focus = exactly ONE most important decision for this week.
- Can Wait = max 3 items.
- Delegate = items a lead can own (prefer blockers from check-ins). Each delegate object must include note (use "" if none).
- Observe only = watch items.
- citations must be signal ids from the list and/or "founder.priorities_raw" / "founder.refine".

Phase 1 signals (weekly_lead_checkins + nearest deadlines from portal domain items):
${signalBlock || "(none this week)"}
`,
      });
      return o;
    });
    markWorkforceLlmSuccess();
    return {
      founderFocus: object.founderFocus.slice(0, 800),
      canWait: object.canWait.filter(Boolean).slice(0, 3),
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
