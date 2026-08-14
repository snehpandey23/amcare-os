/**
 * Pre-submit AI review for SOPs — feedback only (not a hard gate).
 * Reuses workforce model + live SOP samples (same stack as draft/refine).
 */
import { generateObject } from "ai";
import { z } from "zod";
import {
  getWorkforceLlmHealth,
  markWorkforceLlmFailure,
  workforceLlmConfigured,
  withWorkforceModelFallback,
  type ClassifiedWorkforceLlmError,
} from "@/lib/siya-os/model";

const LLM_SUBMIT_REVIEW_MS = 6_000;

const feedbackSchema = z.object({
  purposeComplete: z.boolean(),
  scopeComplete: z.boolean(),
  stepsComplete: z.boolean(),
  exceptionsComplete: z.boolean(),
  escalationComplete: z.boolean(),
  stepsSpecific: z.boolean(),
  possibleDuplicate: z.boolean(),
  duplicateOfTitle: z.string().max(200).optional().nullable(),
  summary: z.string().max(600),
  suggestions: z.array(z.string().max(300)).max(8),
});

export type SopSubmitFeedback = {
  purposeComplete: boolean;
  scopeComplete: boolean;
  stepsComplete: boolean;
  exceptionsComplete: boolean;
  escalationComplete: boolean;
  stepsSpecific: boolean;
  possibleDuplicate: boolean;
  duplicateOfTitle: string | null;
  summary: string;
  suggestions: string[];
  /** Soft score for UI — not a gate */
  readyHint: "looks_ready" | "needs_work";
  /** When true, checklist came from heuristics after LLM failure */
  heuristicOnly?: boolean;
};

function formatLiveSamples(samples: { title: string; body: string }[]): string {
  if (!samples.length) return "(No live SOPs in this department yet.)";
  return samples
    .slice(0, 8)
    .map((s, i) => `### Live ${i + 1}: ${s.title}\n${s.body.slice(0, 800)}`)
    .join("\n\n");
}

function readyHint(f: Omit<SopSubmitFeedback, "readyHint" | "heuristicOnly">): "looks_ready" | "needs_work" {
  const sections =
    Number(f.purposeComplete) +
    Number(f.scopeComplete) +
    Number(f.stepsComplete) +
    Number(f.exceptionsComplete) +
    Number(f.escalationComplete);
  if (!f.stepsSpecific || sections < 4 || f.possibleDuplicate) return "needs_work";
  return "looks_ready";
}

function hasSection(body: string, ...labels: string[]): boolean {
  const lower = body.toLowerCase();
  return labels.some((l) => lower.includes(l.toLowerCase()));
}

function numberedSteps(body: string): number {
  const matches = body.match(/^\s*\d+[.)]\s+\S+/gm);
  return matches?.length ?? 0;
}

/** Visible checklist when Gateway/OpenAI fails — never leave the UI blank after "Running AI review". */
export function heuristicReviewSopDraft(opts: {
  title: string;
  body: string;
  liveSamples: { title: string; body: string }[];
  llmErrorNote?: string;
}): SopSubmitFeedback {
  const body = opts.body;
  const purposeComplete = hasSection(body, "purpose") || opts.title.trim().length > 8;
  const scopeComplete = hasSection(body, "scope", "applies to", "who");
  const stepCount = numberedSteps(body);
  const stepsComplete = stepCount >= 2 || hasSection(body, "steps");
  const exceptionsComplete = hasSection(body, "exception", "edge case", "don't", "do not");
  const escalationComplete = hasSection(body, "escalat", "who to", "supervisor", "lead");
  const vague =
    /\b(as needed|handle appropriately|etc\.?|tbd|figure it out)\b/i.test(body) && stepCount < 4;
  const stepsSpecific = stepsComplete && !vague && body.trim().length >= 120;
  const titleLower = opts.title.trim().toLowerCase();
  const dup = opts.liveSamples.find((s) => {
    const t = s.title.trim().toLowerCase();
    return t && (t === titleLower || (t.length > 12 && titleLower.includes(t)) || (titleLower.length > 12 && t.includes(titleLower)));
  });
  const suggestions: string[] = [];
  if (!purposeComplete) suggestions.push("Add a clear Purpose section.");
  if (!scopeComplete) suggestions.push("Add Scope: who this applies to and when.");
  if (!stepsComplete) suggestions.push("Add numbered Steps (at least two concrete actions).");
  if (!exceptionsComplete) suggestions.push("Add Exceptions / common mistakes.");
  if (!escalationComplete) suggestions.push("Add Escalation: who to loop in when stuck.");
  if (!stepsSpecific) suggestions.push("Replace vague steps (e.g. “as needed”) with who/what/when.");
  if (dup) suggestions.push(`Check overlap with live SOP “${dup.title}”.`);

  const base = {
    purposeComplete,
    scopeComplete,
    stepsComplete,
    exceptionsComplete,
    escalationComplete,
    stepsSpecific,
    possibleDuplicate: Boolean(dup),
    duplicateOfTitle: dup?.title ?? null,
    summary:
      opts.llmErrorNote ||
      "Automated structure check only (AI model unavailable). Review the checklist below before submitting.",
    suggestions: suggestions.slice(0, 8),
  };
  return { ...base, readyHint: readyHint(base), heuristicOnly: true };
}

export async function reviewPolicySopDraft(opts: {
  title: string;
  body: string;
  department: string;
  liveSamples: { title: string; body: string }[];
}): Promise<{ feedback: SopSubmitFeedback } | { error: ClassifiedWorkforceLlmError }> {
  const heuristic = (note?: string) =>
    heuristicReviewSopDraft({
      title: opts.title,
      body: opts.body,
      liveSamples: opts.liveSamples,
      llmErrorNote: note,
    });

  if (!workforceLlmConfigured()) {
    return {
      feedback: heuristic(
        "Workforce AI is off — showing a basic structure checklist so you still see what was checked.",
      ),
    };
  }

  // Gateway free-tier / billing already known bad — do not burn 30–90s of retries and lock the UI.
  const health = getWorkforceLlmHealth();
  if (health.status === "degraded") {
    const why = health.lastError?.userMessage || health.lastError?.code || "AI degraded";
    return {
      feedback: heuristic(`AI review skipped (${why}). Structure checklist below — submit is not blocked.`),
    };
  }

  const system = [
    "You review internal department SOP drafts for Siya Health staff before human approval.",
    "This is feedback only — never block submission.",
    "Check: Purpose, Scope (who/when), Steps (numbered, concrete), Exceptions, Escalation.",
    "Flag vague steps (e.g. 'handle appropriately', 'as needed' with no who/what/when).",
    "Flag possible duplicates against LIVE SOPs listed (same procedure, not merely same topic words).",
    "Be concise and actionable. No clinical advice. No PHI.",
  ].join(" ");

  const user = [
    `Department: ${opts.department}`,
    `Title: ${opts.title}`,
    "",
    "DRAFT BODY:",
    opts.body.slice(0, 6000),
    "",
    "LIVE SOPS IN DEPARTMENT (for duplicate check):",
    formatLiveSamples(opts.liveSamples),
  ].join("\n");

  try {
    const object = await Promise.race([
      withWorkforceModelFallback(async (model) => {
        const { object: o } = await generateObject({
          model,
          schema: feedbackSchema,
          system,
          prompt: user,
        });
        return o;
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("llm_timeout")), LLM_SUBMIT_REVIEW_MS);
      }),
    ]);
    const base = {
      purposeComplete: object.purposeComplete,
      scopeComplete: object.scopeComplete,
      stepsComplete: object.stepsComplete,
      exceptionsComplete: object.exceptionsComplete,
      escalationComplete: object.escalationComplete,
      stepsSpecific: object.stepsSpecific,
      possibleDuplicate: object.possibleDuplicate,
      duplicateOfTitle: object.duplicateOfTitle?.trim() || null,
      summary: object.summary.trim().slice(0, 600),
      suggestions: (object.suggestions || []).map((s) => s.trim()).filter(Boolean).slice(0, 8),
    };
    return { feedback: { ...base, readyHint: readyHint(base) } };
  } catch (err) {
    const classified =
      err instanceof Error && err.message === "llm_timeout"
        ? null
        : markWorkforceLlmFailure(err);
    return {
      feedback: heuristic(
        classified
          ? `AI review unavailable (${classified.code}). Structure checklist below — submit is not blocked.`
          : "AI review timed out — structure checklist below. Submit is not blocked.",
      ),
    };
  }
}

export async function reviewChecklistSopDraft(opts: {
  title: string;
  description: string;
  steps: string[];
  liveSamples: { title: string; body: string }[];
}): Promise<{ feedback: SopSubmitFeedback } | { error: ClassifiedWorkforceLlmError }> {
  const body = [
    `Purpose / description: ${opts.description || "(missing)"}`,
    "",
    "Steps:",
    ...opts.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Exceptions: (checklist SOPs often omit — note if escalation/exception is missing)",
    "Escalation: (note if missing who to loop in when a step fails)",
  ].join("\n");

  return reviewPolicySopDraft({
    title: opts.title,
    body,
    department: "Operational checklist",
    liveSamples: opts.liveSamples,
  });
}
