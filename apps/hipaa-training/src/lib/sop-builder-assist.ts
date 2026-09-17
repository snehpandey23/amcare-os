import { generateObject } from "ai";
import { z } from "zod";
import { retrieveLayeredKnowledge, type RetrievedChunk } from "@/lib/siya-os/retrieval";
import {
  assessAnswerSubstantiveness,
  isHeuristicallyWeakAnswer,
} from "@/lib/answer-quality";
import {
  markWorkforceLlmFailure,
  workforceLlmConfigured,
  withWorkforceModelFallback,
  type ClassifiedWorkforceLlmError,
} from "@/lib/siya-os/model";
import { fetchSopsForRetrieval } from "@/lib/sop-api";

export class SopBuilderLlmError extends Error {
  readonly classified: ClassifiedWorkforceLlmError;
  constructor(classified: ClassifiedWorkforceLlmError) {
    super(classified.userMessage);
    this.name = "SopBuilderLlmError";
    this.classified = classified;
  }
}

/** Interview coverage slots — used for skip-advance + placeholder owners. */
export type SopCoverageTag =
  | "prep"
  | "live_troubleshoot"
  | "tech_escalation"
  | "clinical_continue"
  | "reschedule"
  | "owner"
  | "unknown";

export const COVERAGE_ORDER: readonly SopCoverageTag[] = [
  "prep",
  "live_troubleshoot",
  "tech_escalation",
  "clinical_continue",
  "reschedule",
  "owner",
] as const;

const OWNER_FOR_TAG: Record<SopCoverageTag, string> = {
  prep: "Ops",
  live_troubleshoot: "Ops",
  tech_escalation: "Engineering / IT",
  clinical_continue: "Clinical",
  reschedule: "Ops",
  owner: "Leadership",
  unknown: "the relevant owner",
};

const TOPIC_LABEL_FOR_TAG: Record<SopCoverageTag, string> = {
  prep: "preparation / pre-start instructions",
  live_troubleshoot: "live troubleshooting steps (who / what / when)",
  tech_escalation: "technical escalation path (what to send, who owns handoff)",
  clinical_continue: "clinical/operational fallback if the main path fails",
  reschedule: "same-day recovery / reschedule rules",
  owner: "day-to-day owner and escalation owner",
  unknown: "this process detail",
};

/** Visible gap marker — must stay distinct from real checklist prose. */
export const PLACEHOLDER_PREFIX = "[PLACEHOLDER —";

export type SopBuilderTranscriptEntry = {
  role: "assistant" | "user";
  content: string;
  skipped?: boolean;
  /** Assistant: coverage slot for this question. */
  coverageTag?: SopCoverageTag;
  /** Assistant: true when this is the one allowed pushback for a thin answer. */
  isPushback?: boolean;
  /** User: second thin answer after one pushback — treat as gap and advance. */
  gapFlagged?: boolean;
};

export type SopBuilderSourceRefs = {
  sops: { id: string; title: string; snippet: string }[];
  kb: { id: string; title: string; snippet: string }[];
};

export type SopBuilderChecklistDraft = {
  title: string;
  description: string;
  checklistItems: { label: string; order: number }[];
  gaps: string[];
};

const MIN_QUESTIONS = 4;
const MAX_QUESTIONS = 8;

/** Fast heuristic — prefer assessAnswerSubstantiveness for gate decisions. */
export function isWeakInterviewAnswer(answer: string, skipped = false): boolean {
  return isHeuristicallyWeakAnswer(answer, skipped);
}

/** Explicit don't-know phrasing → same as Skip for gap purposes. */
export function isDontKnowAnswer(answer: string): boolean {
  const t = answer.trim();
  if (!t) return true;
  return /^(i\s*don'?t\s*know|idk|no\s*idea|not\s*sure|dunno|tbd|n\/a|na)\.?$/i.test(t);
}

export function formatGapPlaceholder(tag: SopCoverageTag, topicHint?: string): string {
  const topic = (topicHint?.trim() || TOPIC_LABEL_FOR_TAG[tag] || TOPIC_LABEL_FOR_TAG.unknown).slice(0, 120);
  const owner = OWNER_FOR_TAG[tag] || OWNER_FOR_TAG.unknown;
  return `${PLACEHOLDER_PREFIX} ${topic} not yet defined. Needs input from ${owner} before this can be finalized.]`;
}

export function draftHasUnresolvedPlaceholders(draft: {
  description?: string;
  checklistItems?: { label?: string }[];
  gaps?: string[];
}): boolean {
  const parts = [
    draft.description || "",
    ...(draft.checklistItems || []).map((it) => it.label || ""),
    ...(draft.gaps || []),
  ];
  return parts.some((p) => p.includes(PLACEHOLDER_PREFIX));
}

export function questionForCoverage(tag: SopCoverageTag, processTopic: string): string {
  const t = processTopic.trim() || "this process";
  switch (tag) {
    case "prep":
      return `What do staff do to prepare before “${t}” starts (tools, timing, patient or staff instructions)?`;
    case "live_troubleshoot":
      return `What are the step-by-step actions when something goes wrong during “${t}” — who does what, and in what order?`;
    case "tech_escalation":
      return `When and how do you escalate technical issues for “${t}” — what to send (e.g. screenshot/ticket), and who owns the handoff?`;
    case "clinical_continue":
      return `If the main path fails during “${t}”, what is the clinical or operational fallback (continue differently, pause, abort) and who decides?`;
    case "reschedule":
      return `When do you reschedule or recover the same day for “${t}” — who books it and what is the timeline?`;
    case "owner":
      return `Who owns “${t}” day-to-day, and who is the escalation owner if they are unavailable?`;
    default:
      return `What are the actual steps, who does them, and when for “${t}”?`;
  }
}

function countMeaningfulAnswers(transcript: SopBuilderTranscriptEntry[]): number {
  return transcript.filter((e) => {
    if (e.role !== "user" || e.skipped || e.gapFlagged) return false;
    const t = e.content.trim();
    if (isDontKnowAnswer(t)) return false;
    if (t.length >= 80) return true;
    return !isWeakInterviewAnswer(t, false);
  }).length;
}

function pushbackQuestion(lastAssistantQ: string | null, custom?: string): string {
  if (custom?.trim()) return custom.trim();
  const topicHint = lastAssistantQ?.trim()
    ? `You answered about: "${lastAssistantQ.slice(0, 120)}". That reply was too thin.`
    : "That reply was too thin.";
  return `${topicHint} I need real operational detail — what are the actual steps, who does them, and when (timeline / priority)?`;
}

/** Infer coverage tag from free-form question text (LLM start / legacy sessions). */
export function inferCoverageTag(question: string): SopCoverageTag {
  const q = question.toLowerCase();
  if (/\b(escalat|ticket|screenshot|tech(nical)?\s*(support|team)|it\b|engineering)\b/.test(q)) {
    return "tech_escalation";
  }
  if (/\b(reschedul|same[- ]day|recover|rebook)\b/.test(q)) return "reschedule";
  if (/\b(audio[- ]?only|fallback|abort|continue|provider|clinical)\b/.test(q)) {
    return "clinical_continue";
  }
  if (/\b(prepar|before|download|instructions|5 minutes|log\s*in)\b/.test(q)) return "prep";
  if (/\b(who owns|owner|raci|accountable)\b/.test(q)) return "owner";
  if (/\b(troubleshoot|cannot connect|goes wrong|step[- ]by[- ]step|during)\b/.test(q)) {
    return "live_troubleshoot";
  }
  return "unknown";
}

export type InterviewGap = {
  coverageTag: SopCoverageTag;
  question: string;
  placeholder: string;
  reason: "skipped" | "dont_know" | "thin_after_pushback";
};

/** Pair each user turn with the preceding assistant question; collect gap slots. */
export function collectInterviewGaps(transcript: SopBuilderTranscriptEntry[]): InterviewGap[] {
  const gaps: InterviewGap[] = [];
  let lastQ: SopBuilderTranscriptEntry | null = null;
  for (const e of transcript) {
    if (e.role === "assistant") {
      lastQ = e;
      continue;
    }
    if (e.role !== "user" || !lastQ) continue;
    const tag = lastQ.coverageTag || inferCoverageTag(lastQ.content);
    const question = lastQ.content;
    if (e.skipped || isDontKnowAnswer(e.content)) {
      gaps.push({
        coverageTag: tag,
        question,
        placeholder: formatGapPlaceholder(tag, TOPIC_LABEL_FOR_TAG[tag]),
        reason: e.skipped ? "skipped" : "dont_know",
      });
    } else if (e.gapFlagged) {
      gaps.push({
        coverageTag: tag,
        question,
        placeholder: formatGapPlaceholder(tag, TOPIC_LABEL_FOR_TAG[tag]),
        reason: "thin_after_pushback",
      });
    }
  }
  return gaps;
}

function coveredTags(transcript: SopBuilderTranscriptEntry[]): Set<SopCoverageTag> {
  const covered = new Set<SopCoverageTag>();
  let lastQ: SopBuilderTranscriptEntry | null = null;
  for (const e of transcript) {
    if (e.role === "assistant") {
      lastQ = e;
      continue;
    }
    if (e.role === "user" && lastQ) {
      // Any response (substantive, skip, don't-know, or gap-flagged) closes this slot.
      const tag = lastQ.coverageTag || inferCoverageTag(lastQ.content);
      covered.add(tag);
    }
  }
  return covered;
}

function nextUncoveredTag(transcript: SopBuilderTranscriptEntry[]): SopCoverageTag | null {
  const done = coveredTags(transcript);
  for (const tag of COVERAGE_ORDER) {
    if (!done.has(tag)) return tag;
  }
  return null;
}

const interviewStartSchema = z.object({
  questions: z.array(z.string()).min(1).max(2),
  readyToDraft: z.boolean(),
});

const checklistDraftSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  checklistItems: z
    .array(
      z.object({
        label: z.string().min(1).max(500),
        order: z.number().int().nonnegative(),
      }),
    )
    .min(4)
    .max(15),
  gaps: z.array(z.string().max(400)).max(12),
});

function chunksToRefs(chunks: RetrievedChunk[], max = 5): { id: string; title: string; snippet: string }[] {
  return chunks.slice(0, max).map((c) => ({
    id: c.id,
    title: c.title,
    snippet: c.snippet.slice(0, 1200),
  }));
}

export async function gatherSopBuilderContext(
  topic: string,
  authHeader: string,
): Promise<SopBuilderSourceRefs> {
  const sops = await fetchSopsForRetrieval(authHeader.replace(/^Bearer\s+/i, ""));
  const sopEntries = sops.map((s) => ({
    id: s.id,
    title: s.title,
    body: s.body,
    keywords: s.keywords ?? [],
    department: s.department,
    status: s.status,
  }));
  const kbChunks = retrieveLayeredKnowledge(topic, { sops: sopEntries, limit: 8 });
  const sopChunks = kbChunks.filter((c) => c.id.startsWith("sop-db-"));
  const otherKb = kbChunks.filter((c) => !c.id.startsWith("sop-db-"));
  return {
    sops: chunksToRefs(sopChunks, 5),
    kb: chunksToRefs(otherKb, 5),
  };
}

function formatSourceContext(refs: SopBuilderSourceRefs): string {
  const parts: string[] = [];
  if (refs.sops.length) {
    parts.push(
      "EXISTING SOPs (reference only — build an operational checklist, not prose duplicate):",
      ...refs.sops.map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}`),
    );
  }
  if (refs.kb.length) {
    parts.push(
      "INTERNAL KB SNIPPETS:",
      ...refs.kb.map((k, i) => `[${i + 1}] ${k.title}\n${k.snippet}`),
    );
  }
  if (!parts.length) return "(No matching internal materials — ask practical process questions.)";
  return parts.join("\n\n");
}

function formatTranscript(transcript: SopBuilderTranscriptEntry[]): string {
  if (!transcript.length) return "(No answers yet.)";
  return transcript
    .map((e) => {
      if (e.role === "assistant") {
        const tag = e.coverageTag ? ` [${e.coverageTag}${e.isPushback ? "/pushback" : ""}]` : "";
        return `Q${tag}: ${e.content}`;
      }
      if (e.skipped) return "A: (skipped / don't know)";
      if (e.gapFlagged) return `A: (thin after pushback — gap) ${e.content}`;
      return `A: ${e.content}`;
    })
    .join("\n");
}

export function countSubstantiveAnswers(transcript: SopBuilderTranscriptEntry[]): number {
  return countMeaningfulAnswers(transcript);
}

export type InterviewStartResult = {
  questions: string[];
  readyToDraft: boolean;
  /** Metadata for the first on-screen question (transcript seed). */
  firstQuestionMeta: { coverageTag: SopCoverageTag; isPushback: false };
};

export function deterministicInterviewStart(topic: string): InterviewStartResult {
  const tag: SopCoverageTag = "prep";
  return {
    questions: [questionForCoverage(tag, topic)],
    readyToDraft: false,
    firstQuestionMeta: { coverageTag: tag, isPushback: false },
  };
}

export async function generateInterviewStart(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
}): Promise<InterviewStartResult> {
  const fallback = () => deterministicInterviewStart(opts.topic);
  if (!workforceLlmConfigured()) {
    return fallback();
  }
  const prompt = [
    `Topic for a new operational daily checklist SOP: "${opts.topic}"`,
    "",
    formatSourceContext(opts.sourceRefs),
    "",
    `Generate 1 short, plain-language interview question about how staff prepare before this process.`,
    `readyToDraft should always be false at start.`,
  ].join("\n");
  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: interviewStartSchema,
        system:
          "You interview Siya Health staff to capture operational checklists. No patient identifiers.",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.35,
      });
      return o;
    });
    const questions = object.questions.map((q) => q.trim()).filter(Boolean).slice(0, 1);
    if (!questions.length) return fallback();
    const coverageTag = inferCoverageTag(questions[0]!) || "prep";
    return {
      questions,
      readyToDraft: false,
      firstQuestionMeta: { coverageTag, isPushback: false },
    };
  } catch {
    return fallback();
  }
}

export type InterviewNextResult = {
  question: string | null;
  readyToDraft: boolean;
  questionNumber: number;
  /** Caller should set gapFlagged on the last user turn before persisting. */
  markLastUserAsGap?: boolean;
  nextQuestionMeta?: { coverageTag: SopCoverageTag; isPushback: boolean };
};

/**
 * Adaptive next turn:
 * - Skip / don't-know → advance (no re-ask of same slot)
 * - Thin answer → at most ONE pushback; second thin → gap-flag + advance
 * - Next question from uncovered coverage tags (deterministic) so Skip cannot loop
 */
export async function generateInterviewNext(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
  transcript: SopBuilderTranscriptEntry[];
}): Promise<InterviewNextResult> {
  const answerCount = opts.transcript.filter((e) => e.role === "user").length;
  const substantive = countSubstantiveAnswers(opts.transcript);
  const lastUser = [...opts.transcript].reverse().find((e) => e.role === "user");
  const lastQEntry = [...opts.transcript].reverse().find((e) => e.role === "assistant");
  const lastQ = lastQEntry?.content ?? `Interview question about: ${opts.topic}`;
  const lastTag: SopCoverageTag =
    lastQEntry?.coverageTag || inferCoverageTag(lastQ);

  let markLastUserAsGap = false;

  const treatAsSkip =
    Boolean(lastUser?.skipped) ||
    (lastUser && !lastUser.skipped && isDontKnowAnswer(lastUser.content));

  if (lastUser && !treatAsSkip) {
    // Quality gate — may use LLM; if unconfigured, heuristic only via assessAnswerSubstantiveness.
    let qualityOk = true;
    let followUp: string | undefined;
    try {
      if (workforceLlmConfigured()) {
        const quality = await assessAnswerSubstantiveness({
          question: lastQ,
          answer: lastUser.content,
          skipped: false,
        });
        qualityOk = quality.ok;
        followUp = quality.followUp;
      } else if (isWeakInterviewAnswer(lastUser.content, false)) {
        qualityOk = false;
      }
    } catch (err) {
      // Don't stall the interview on LLM billing — fall back to heuristic.
      if (isWeakInterviewAnswer(lastUser.content, false)) {
        qualityOk = false;
      } else {
        throw err instanceof SopBuilderLlmError
          ? err
          : new SopBuilderLlmError(markWorkforceLlmFailure(err));
      }
    }

    if (!qualityOk) {
      if (lastQEntry?.isPushback) {
        // Mandatory cap: one pushback already used → gap + advance.
        markLastUserAsGap = true;
      } else {
        return {
          question: pushbackQuestion(lastQ, followUp),
          readyToDraft: false,
          questionNumber: answerCount + 1,
          nextQuestionMeta: { coverageTag: lastTag, isPushback: true },
        };
      }
    }
  }

  // Build a view of transcript as if last user were gap-flagged when advancing after thin.
  const effectiveTranscript: SopBuilderTranscriptEntry[] = opts.transcript.map((e, i) => {
    if (!markLastUserAsGap) return e;
    if (i === opts.transcript.length - 1 && e.role === "user") {
      return { ...e, gapFlagged: true };
    }
    return e;
  });

  const nextTag = nextUncoveredTag(effectiveTranscript);
  const hitMax = answerCount >= MAX_QUESTIONS;
  const enoughSubstance = substantive >= MIN_QUESTIONS && !nextTag;
  const coverageDone = !nextTag;

  if (hitMax || coverageDone || enoughSubstance) {
    return {
      question: null,
      readyToDraft: true,
      questionNumber: answerCount + 1,
      markLastUserAsGap: markLastUserAsGap || undefined,
    };
  }

  // Prefer advancing after at least some progress even if substance < MIN — coverage outline drives end.
  const tag = nextTag!;
  return {
    question: questionForCoverage(tag, opts.topic),
    readyToDraft: false,
    questionNumber: answerCount + 1,
    markLastUserAsGap: markLastUserAsGap || undefined,
    nextQuestionMeta: { coverageTag: tag, isPushback: false },
  };
}

function mergePlaceholdersIntoDraft(
  draft: SopBuilderChecklistDraft,
  gaps: InterviewGap[],
): SopBuilderChecklistDraft {
  if (!gaps.length) return draft;
  const placeholderLabels = gaps.map((g) => g.placeholder);
  const existingLabels = new Set(draft.checklistItems.map((it) => it.label));
  const items = [...draft.checklistItems];
  for (const ph of placeholderLabels) {
    if (![...existingLabels].some((l) => l.includes(PLACEHOLDER_PREFIX) && l === ph)) {
      // Avoid dupes of same placeholder text
      if (!existingLabels.has(ph)) {
        items.push({ label: ph.slice(0, 500), order: items.length });
        existingLabels.add(ph);
      }
    }
  }
  const gapLines = [
    ...draft.gaps,
    ...gaps.map((g) => g.placeholder),
  ];
  const uniqGaps = [...new Set(gapLines.map((g) => g.trim()).filter(Boolean))].slice(0, 12);
  return {
    ...draft,
    checklistItems: items.map((it, i) => ({ ...it, order: i })),
    gaps: uniqGaps,
  };
}

export async function generateChecklistDraft(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
  transcript: SopBuilderTranscriptEntry[];
  /** When set with refineInstruction — iterate on this draft (Founder Coach refine pattern). */
  currentDraft?: SopBuilderChecklistDraft | null;
  refineInstruction?: string | null;
}): Promise<SopBuilderChecklistDraft | null> {
  const interviewGaps = collectInterviewGaps(opts.transcript);

  const fallback = (): SopBuilderChecklistDraft => {
    const userBits = opts.transcript
      .filter((e) => e.role === "user" && !e.skipped && !e.gapFlagged && !isDontKnowAnswer(e.content))
      .map((e) => e.content.trim())
      .filter((t) => t.length >= 8);
    const items = userBits.slice(0, 12).map((label, i) => ({
      label: (label.length > 120 ? `${label.slice(0, 117)}…` : label).replace(/^[•\-*]\s*/, ""),
      order: i,
    }));
    for (const g of interviewGaps) {
      items.push({ label: g.placeholder.slice(0, 500), order: items.length });
    }
    while (items.length < 4) {
      items.push({
        label: formatGapPlaceholder("unknown", `additional step for ${opts.topic}`).slice(0, 500),
        order: items.length,
      });
    }
    return {
      title: opts.topic.slice(0, 200),
      description: interviewGaps.length
        ? `Drafted from interview answers with ${interviewGaps.length} explicit placeholder gap(s). Fill placeholders before publish.`
        : `Drafted from interview answers (AI polish unavailable). Edit before submit.`,
      checklistItems: items.map((it, i) => ({ ...it, order: i })),
      gaps: interviewGaps.map((g) => g.placeholder),
    };
  };

  if (!workforceLlmConfigured()) {
    return fallback();
  }
  const { refinePromptPreamble } = await import("@/lib/sop-refine");
  const refine = opts.refineInstruction?.trim() || "";
  const cur = opts.currentDraft;
  const isRefine = Boolean(refine && cur?.title && cur.checklistItems?.length);

  const gapBlock =
    interviewGaps.length > 0
      ? [
          "UNANSWERED / SKIPPED SLOTS (must appear as placeholders — do NOT invent content for these):",
          ...interviewGaps.map((g) => `- ${g.placeholder}`),
          "Copy each placeholder string EXACTLY into checklistItems and into gaps[]. Never replace a placeholder with plausible-sounding steps.",
        ].join("\n")
      : "No skipped slots.";

  const prompt = isRefine
    ? [
        refinePromptPreamble(refine),
        "",
        `Original topic: "${opts.topic}"`,
        "",
        "CURRENT DRAFT (JSON):",
        JSON.stringify(
          {
            title: cur!.title,
            description: cur!.description,
            checklistItems: cur!.checklistItems.map((it) => ({ label: it.label, order: it.order })),
            gaps: cur!.gaps ?? [],
          },
          null,
          2,
        ),
        "",
        gapBlock,
        "",
        "Interview context (for grounding only — prefer CURRENT DRAFT content):",
        formatTranscript(opts.transcript).slice(0, 4000),
        "",
        "Return the full updated checklist (title, description, checklistItems 4-15, gaps).",
        "Preserve every existing [PLACEHOLDER — …] line unless the refine instruction explicitly fills that gap with real operational detail from the user.",
        "checklistItems: each real step starts with a verb; placeholders keep the [PLACEHOLDER —] form. No patient identifiers.",
      ].join("\n")
    : [
        `Create an operational daily checklist SOP from this interview.`,
        `Original topic: "${opts.topic}"`,
        "",
        formatSourceContext(opts.sourceRefs),
        "",
        "FULL INTERVIEW:",
        formatTranscript(opts.transcript),
        "",
        gapBlock,
        "",
        "RULES:",
        "- Use ONLY real answers from the interview for concrete steps.",
        "- For every unanswered/skipped slot, include the exact [PLACEHOLDER — …] string as a checklist item AND in gaps[].",
        "- Do NOT invent escalation contacts, timelines, or troubleshooting steps that were not stated.",
        "- checklistItems: 4-15 ordered steps; real steps start with a verb; no patient identifiers.",
      ].join("\n");
  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: checklistDraftSchema,
        system: isRefine
          ? "You refine operational checklist SOPs for Siya Health staff. Apply only the requested adjustment; keep the rest. Never invent content for [PLACEHOLDER —] gaps."
          : "You draft operational checklist SOPs for Siya Health staff My day tasks. Be concrete. Never invent content for skipped slots — use [PLACEHOLDER —] lines instead.",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.25,
      });
      return o;
    });
    const title = object.title.trim();
    if (!title) return fallback();
    const items = object.checklistItems
      .map((it, i) => ({
        label: it.label.trim(),
        order: typeof it.order === "number" ? it.order : i,
      }))
      .filter((it) => it.label)
      .sort((a, b) => a.order - b.order)
      .map((it, i) => ({ label: it.label.slice(0, 500), order: i }));
    if (!items.length) return fallback();
    const draft: SopBuilderChecklistDraft = {
      title: title.slice(0, 500),
      description: object.description.trim().slice(0, 2000),
      checklistItems: items,
      gaps: object.gaps.map((g) => g.trim()).filter(Boolean).slice(0, 12),
    };
    return mergePlaceholdersIntoDraft(draft, interviewGaps);
  } catch (err) {
    const classified = markWorkforceLlmFailure(err);
    if (isRefine) throw new SopBuilderLlmError(classified);
    return fallback();
  }
}

export function countUserAnswers(transcript: SopBuilderTranscriptEntry[]): number {
  return transcript.filter((e) => e.role === "user").length;
}

export function pendingQuestion(transcript: SopBuilderTranscriptEntry[]): string | null {
  if (!transcript.length) return null;
  const last = transcript[transcript.length - 1];
  if (last.role === "assistant") return last.content;
  return null;
}

export { MIN_QUESTIONS, MAX_QUESTIONS };
