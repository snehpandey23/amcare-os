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
  workforceLlmDisabledMessage,
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

export type SopBuilderTranscriptEntry = {
  role: "assistant" | "user";
  content: string;
  skipped?: boolean;
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

function countMeaningfulAnswers(transcript: SopBuilderTranscriptEntry[]): number {
  return transcript.filter((e) => {
    if (e.role !== "user" || e.skipped) return false;
    const t = e.content.trim();
    // Long pasted answers count as substantive even if heuristic is overly picky on endings.
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

const interviewStartSchema = z.object({
  questions: z.array(z.string()).min(1).max(2),
  readyToDraft: z.boolean(),
});

const interviewNextSchema = z.object({
  question: z.string().nullable(),
  readyToDraft: z.boolean(),
  questionNumber: z.number().int().positive(),
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
  gaps: z.array(z.string().max(400)).max(10),
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
    .map((e) => `${e.role === "assistant" ? "Q" : "A"}: ${e.skipped ? "(skipped / don't know)" : e.content}`)
    .join("\n");
}

export function countSubstantiveAnswers(transcript: SopBuilderTranscriptEntry[]): number {
  return countMeaningfulAnswers(transcript);
}

export type InterviewStartResult = {
  questions: string[];
  readyToDraft: boolean;
};

export async function generateInterviewStart(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
}): Promise<InterviewStartResult | null> {
  if (!workforceLlmConfigured()) {
    throw new SopBuilderLlmError(workforceLlmDisabledMessage());
  }
  const prompt = [
    `Topic for a new operational daily checklist SOP: "${opts.topic}"`,
    "",
    formatSourceContext(opts.sourceRefs),
    "",
    `Generate 1-2 short, plain-language interview questions to understand how staff actually do this process.`,
    `Questions should be specific, easy to answer on a phone, and informed by any source material above.`,
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
    const questions = object.questions.map((q) => q.trim()).filter(Boolean).slice(0, 2);
    if (!questions.length) return null;
    return { questions, readyToDraft: false };
  } catch (err) {
    if (err instanceof SopBuilderLlmError) throw err;
    throw new SopBuilderLlmError(markWorkforceLlmFailure(err));
  }
}

export type InterviewNextResult = {
  question: string | null;
  readyToDraft: boolean;
  questionNumber: number;
};

export async function generateInterviewNext(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
  transcript: SopBuilderTranscriptEntry[];
}): Promise<InterviewNextResult | null> {
  if (!workforceLlmConfigured()) {
    throw new SopBuilderLlmError(workforceLlmDisabledMessage());
  }
  const answerCount = opts.transcript.filter((e) => e.role === "user").length;
  const substantive = countSubstantiveAnswers(opts.transcript);
  const lastUser = [...opts.transcript].reverse().find((e) => e.role === "user");
  const lastQ =
    [...opts.transcript].reverse().find((e) => e.role === "assistant")?.content ??
    `Interview question about: ${opts.topic}`;

  // Heuristic first-pass, then LLM substantiveness — thin/filler never unlocks draft.
  if (lastUser && !lastUser.skipped) {
    const quality = await assessAnswerSubstantiveness({
      question: lastQ,
      answer: lastUser.content,
      skipped: false,
    });
    if (!quality.ok) {
      return {
        question: pushbackQuestion(lastQ, quality.followUp),
        readyToDraft: false,
        questionNumber: answerCount + 1,
      };
    }
  }

  // Unlock draft once we have enough usable answers — don't keep grilling after solid pastes.
  const forceReady = substantive >= MIN_QUESTIONS;

  if (forceReady) {
    return {
      question: null,
      readyToDraft: true,
      questionNumber: answerCount + 1,
    };
  }

  const prompt = [
    `Topic: "${opts.topic}"`,
    "",
    formatSourceContext(opts.sourceRefs),
    "",
    "INTERVIEW SO FAR:",
    formatTranscript(opts.transcript),
    "",
    `Answer count so far: ${answerCount} (${substantive} substantive). Target ${MIN_QUESTIONS}-${MAX_QUESTIONS} solid answers.`,
    "QUALITY RULE: Push back only on gibberish, placeholders, or empty deferrals. Accept rough but concrete operational pastes.",
    `Only set readyToDraft true when you have enough concrete detail for a solid checklist (usually after ${MIN_QUESTIONS}+ substantive answers). Otherwise ask ONE follow-up.`,
    `questionNumber should be ${answerCount + 1}.`,
  ].join("\n");
  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: interviewNextSchema,
        system:
          "You conduct adaptive SOP interviews like a careful human interviewer. Push back on vague answers. Skip re-asking answered topics. No PHI.",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.35,
      });
      return o;
    });
    const readyToDraft = Boolean(object.readyToDraft) && substantive >= MIN_QUESTIONS;
    if (readyToDraft) {
      return { question: null, readyToDraft: true, questionNumber: answerCount + 1 };
    }
    const question = object.question?.trim() || null;
    if (!question) {
      return {
        question: null,
        readyToDraft: false,
        questionNumber: answerCount + 1,
      };
    }
    return {
      question,
      readyToDraft: false,
      questionNumber: object.questionNumber ?? answerCount + 1,
    };
  } catch (err) {
    if (err instanceof SopBuilderLlmError) throw err;
    throw new SopBuilderLlmError(markWorkforceLlmFailure(err));
  }
}

export async function generateChecklistDraft(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
  transcript: SopBuilderTranscriptEntry[];
  /** When set with refineInstruction — iterate on this draft (Founder Coach refine pattern). */
  currentDraft?: SopBuilderChecklistDraft | null;
  refineInstruction?: string | null;
}): Promise<SopBuilderChecklistDraft | null> {
  const fallback = (): SopBuilderChecklistDraft => {
    const userBits = opts.transcript
      .filter((e) => e.role === "user" && !e.skipped && e.content.trim().length >= 8)
      .map((e) => e.content.trim());
    const items = userBits.slice(0, 12).map((label, i) => ({
      label: (label.length > 120 ? `${label.slice(0, 117)}…` : label).replace(/^[•\-*]\s*/, ""),
      order: i,
    }));
    while (items.length < 4) {
      items.push({
        label: `Confirm step ${items.length + 1} for: ${opts.topic}`.slice(0, 500),
        order: items.length,
      });
    }
    return {
      title: opts.topic.slice(0, 200),
      description: `Drafted from interview answers (AI polish unavailable). Edit before submit.`,
      checklistItems: items,
      gaps: ["AI draft unavailable — verify every step with the process owner."],
    };
  };

  if (!workforceLlmConfigured()) {
    return fallback();
  }
  const { refinePromptPreamble } = await import("@/lib/sop-refine");
  const refine = opts.refineInstruction?.trim() || "";
  const cur = opts.currentDraft;
  const isRefine = Boolean(refine && cur?.title && cur.checklistItems?.length);

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
        "Interview context (for grounding only — prefer CURRENT DRAFT content):",
        formatTranscript(opts.transcript).slice(0, 4000),
        "",
        "Return the full updated checklist (title, description, checklistItems 4-15, gaps).",
        "checklistItems: each label starts with a verb, no patient identifiers.",
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
        "checklistItems: 4-15 ordered steps, each label starts with a verb, no patient identifiers.",
        "gaps: list items the AI is unsure about or that need human verification (empty array if confident).",
      ].join("\n");
  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: checklistDraftSchema,
        system: isRefine
          ? "You refine operational checklist SOPs for Siya Health staff. Apply only the requested adjustment; keep the rest. Be concrete."
          : "You draft operational checklist SOPs for Siya Health staff My day tasks. Be concrete.",
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
    return {
      title: title.slice(0, 500),
      description: object.description.trim().slice(0, 2000),
      checklistItems: items,
      gaps: object.gaps.map((g) => g.trim()).filter(Boolean).slice(0, 10),
    };
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
