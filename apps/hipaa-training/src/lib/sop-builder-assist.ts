import { generateText } from "ai";
import { retrieveLayeredKnowledge, type RetrievedChunk } from "@/lib/siya-os/retrieval";
import { getWorkforceModel, workforceLlmEnabled } from "@/lib/siya-os/model";
import { fetchSopsForRetrieval } from "@/lib/sop-api";

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

function parseJsonFromLlm(text: string): unknown {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed);
}

export type InterviewStartResult = {
  questions: string[];
  readyToDraft: boolean;
};

export async function generateInterviewStart(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
}): Promise<InterviewStartResult | null> {
  if (!workforceLlmEnabled()) return null;
  const prompt = [
    `Topic for a new operational daily checklist SOP: "${opts.topic}"`,
    "",
    formatSourceContext(opts.sourceRefs),
    "",
    `Generate 1-2 short, plain-language interview questions to understand how staff actually do this process.`,
    `Questions should be specific, easy to answer on a phone, and informed by any source material above.`,
    `Return ONLY JSON: {"questions":["...","..."],"readyToDraft":false}`,
    `readyToDraft should always be false at start.`,
  ].join("\n");
  try {
    const { text } = await generateText({
      model: getWorkforceModel(),
      system:
        "You interview Siya Health staff to capture operational checklists. No patient identifiers. Output JSON only.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      maxOutputTokens: 400,
    });
    const parsed = parseJsonFromLlm(text) as { questions?: string[]; readyToDraft?: boolean };
    const questions = (parsed.questions ?? []).map((q) => q.trim()).filter(Boolean).slice(0, 2);
    if (!questions.length) return null;
    return { questions, readyToDraft: false };
  } catch (err) {
    console.error("[sop-builder-assist] interview start failed", err);
    return null;
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
  if (!workforceLlmEnabled()) return null;
  const answerCount = opts.transcript.filter((e) => e.role === "user").length;
  const forceReady = answerCount >= MAX_QUESTIONS;
  const prompt = [
    `Topic: "${opts.topic}"`,
    "",
    formatSourceContext(opts.sourceRefs),
    "",
    "INTERVIEW SO FAR:",
    formatTranscript(opts.transcript),
    "",
    `Answer count so far: ${answerCount}. Target ${MIN_QUESTIONS}-${MAX_QUESTIONS} questions total.`,
    forceReady
      ? "You have enough answers. Set readyToDraft true and question null."
      : `If you have enough detail for a solid checklist (usually after ${MIN_QUESTIONS}+ answers), set readyToDraft true.`,
    `Otherwise ask ONE follow-up question that adapts to prior answers and fills gaps.`,
    `Return ONLY JSON: {"question":"... or null","readyToDraft":true|false,"questionNumber":${answerCount + 1}}`,
  ].join("\n");
  try {
    const { text } = await generateText({
      model: getWorkforceModel(),
      system:
        "You conduct adaptive SOP interviews. Skip re-asking answered topics. No PHI. JSON only.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      maxOutputTokens: 350,
    });
    const parsed = parseJsonFromLlm(text) as {
      question?: string | null;
      readyToDraft?: boolean;
      questionNumber?: number;
    };
    const readyToDraft = forceReady || Boolean(parsed.readyToDraft) || answerCount >= MIN_QUESTIONS && !parsed.question?.trim();
    if (readyToDraft) {
      return { question: null, readyToDraft: true, questionNumber: answerCount + 1 };
    }
    const question = parsed.question?.trim() || null;
    if (!question) return { question: null, readyToDraft: answerCount >= MIN_QUESTIONS, questionNumber: answerCount + 1 };
    return {
      question,
      readyToDraft: false,
      questionNumber: parsed.questionNumber ?? answerCount + 1,
    };
  } catch (err) {
    console.error("[sop-builder-assist] interview next failed", err);
    return null;
  }
}

export async function generateChecklistDraft(opts: {
  topic: string;
  sourceRefs: SopBuilderSourceRefs;
  transcript: SopBuilderTranscriptEntry[];
}): Promise<SopBuilderChecklistDraft | null> {
  if (!workforceLlmEnabled()) return null;
  const prompt = [
    `Create an operational daily checklist SOP template from this interview.`,
    `Original topic: "${opts.topic}"`,
    "",
    formatSourceContext(opts.sourceRefs),
    "",
    "FULL INTERVIEW:",
    formatTranscript(opts.transcript),
    "",
    `Return ONLY valid JSON:`,
    `{"title":"...","description":"one short paragraph","checklistItems":[{"label":"actionable step","order":0},...],"gaps":["open question or uncertainty",...]}`,
    "checklistItems: 4-15 ordered steps, each label starts with a verb, no patient identifiers.",
    "gaps: list items the AI is unsure about or that need human verification (empty array if confident).",
  ].join("\n");
  try {
    const { text } = await generateText({
      model: getWorkforceModel(),
      system:
        "You draft operational checklist SOPs for Siya Health staff My day tasks. Be concrete. JSON only.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
      maxOutputTokens: 1400,
    });
    const parsed = parseJsonFromLlm(text) as {
      title?: string;
      description?: string;
      checklistItems?: { label?: string; order?: number }[];
      gaps?: string[];
    };
    const title = parsed.title?.trim();
    if (!title) return null;
    const items = (parsed.checklistItems ?? [])
      .map((it, i) => ({
        label: (it.label ?? "").trim(),
        order: typeof it.order === "number" ? it.order : i,
      }))
      .filter((it) => it.label)
      .sort((a, b) => a.order - b.order)
      .map((it, i) => ({ label: it.label.slice(0, 500), order: i }));
    if (!items.length) return null;
    return {
      title: title.slice(0, 500),
      description: (parsed.description ?? "").trim().slice(0, 2000),
      checklistItems: items,
      gaps: (parsed.gaps ?? []).map((g) => g.trim()).filter(Boolean).slice(0, 10),
    };
  } catch (err) {
    console.error("[sop-builder-assist] draft failed", err);
    return null;
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
