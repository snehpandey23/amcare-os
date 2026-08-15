import { getEscalationContacts } from "./config";
import { defaultEscalationOwner } from "./escalation";
import { retrievalQueryBoost, routeIntent, expandShortQuery, hasRoutableIntent } from "./flows";
import { composeAnswerFromChunks, clarifyVagueMessage, clarifyConfusedFollowUp, askClarifyingQuestion, isConfidentAssistAnswer, workplaceConcernAnswer, abusivePatientAnswer, formatEscalationForSlack, isVagueUserMessage, isConfusedAboutPriorAnswer, polishStaffMessage, isCasualOffTopic, casualOffTopicReply } from "./compose-answer";
import { staffTopicLabel } from "./staff-voice";
import { synthesizeWorkforceAnswer } from "./llm-answer";
import {
  retrieveLayeredKnowledge,
  retrieveWorkspaceNearMisses,
  filterStaffFacingChunks,
  isHistoricalMemoryQuery,
  type RetrievedChunk,
} from "./retrieval";
import { fetchSopsForRetrieval } from "@/lib/sop-api";
import { fetchDecisionsForRetrieval } from "@/lib/knowledge-api";
import { searchMemory } from "@/lib/memory-api";
import { displayDepartment, type Confidence, type Department } from "./departments";
import {
  assessStaffMessageSafety,
  staffRefusalMessage,
  type StaffRefusalCategory,
} from "./phi-guard";
import { fetchAdminOpsSnapshot } from "./admin-ops-snapshot";
import { detectAdminOpsIntent, runAdminOpsCoach } from "./admin-ops-coach";
import { tryFactsLookup } from "./facts-lookup";
import {
  acknowledgePersonalPreference,
  answerPersonalFactRecall,
  extractPersonalFactsFromHistory,
  isAskingAboutPriorPersonalFact,
  isCompanyPolicyAssertion,
  isPersonalPreferenceStatement,
} from "./conversation-memory";
import {
  fetchFounderPortalSignalsBlock,
  founderCoachPlainOffTopic,
  founderCoachVaguePrompt,
  wantsFounderPortalSignals,
} from "./founder-chat-context";

export interface SiyaReply {
  message: string;
  chunks: RetrievedChunk[];
  escalate?: string;
  refused?: boolean;
  refusalCategory?: StaffRefusalCategory;
  routing?: {
    department: Department;
    task: string;
    confidence: Confidence;
    followUpQuestions: string[];
  };
  sources?: { title: string; id: string }[];
  escalationPreview?: string;
  /** No approved KB match — show notify-owner flow */
  knowledgeGap?: boolean;
  /** Admin ops co-pilot quick links (task board, team, etc.) */
  portalLinks?: { label: string; href: string }[];
  /** True when reply used live task/team data */
  opsCoPilot?: boolean;
  /** True when deterministic site facts-lookup answered (skip LLM rewrite) */
  factsLookup?: boolean;
  /**
   * Rule engine already produced a final answer (off-topic, clarify, meta, etc.).
   * Never pass to LLM for "enhancement" — even when portalSignals are present.
   */
  ruleFinal?: boolean;
  executiveMeta?: {
    confidence: string;
    freshnessSeconds: number;
    recommendedAction: string;
    evidenceCount: number;
  };
  /** True when the reply body came from Workforce LLM synthesis */
  llmUsed?: boolean;
  /** True when retrieval compose was used because LLM was off, skipped, or failed */
  llmFallback?: boolean;
  /** Distinguishes billing/auth/quota from “LLM off” when synthesis fails */
  llmError?: {
    code: string;
    kind: string;
    message: string;
  } | null;
  pendingTask?: {
    title: string;
    assigneeId: string;
    assigneeLabel: string;
    priority: string;
    dueDate: string;
  };
}

const REFUND_PROMISE = /\b(i (can|will) (approve|refund|waive|credit)|guaranteed refund|refund is approved)\b/i;

function answerStaffMetaQuestion(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (/what('s| is) your name|who are you|what are you\b/.test(t)) {
    return [
      "I'm **Siya Assist** — the internal help desk for Siya Health staff.",
      "",
      "I answer from **approved internal guides** and can route you to the right owner when we don't have a published policy yet.",
    ].join("\n");
  }
  if (/^(hi|hello|hey)\b/.test(t) && t.length < 24) {
    return "Hi — ask me about policies, SOPs, tools, or who to contact. I'll use approved internal guides first.";
  }
  return null;
}

export function runSiyaAssistant(message: string, history: { role: string; content: string }[] = []): SiyaReply {
  return buildSiyaReply(message, history);
}

export async function runSiyaAssistantAsync(
  message: string,
  history: { role: string; content: string }[] = [],
  opts?: { focusMode?: boolean; authToken?: string | null; surface?: "default" | "founder-coach" }
): Promise<SiyaReply> {
  const focusMode = opts?.focusMode ?? false;
  const token = opts?.authToken?.trim() || null;
  const founderCoach = opts?.surface === "founder-coach";

  if (token && detectAdminOpsIntent(message)) {
    const snapshot = await fetchAdminOpsSnapshot(token);
    if (snapshot) {
      const ops = await runAdminOpsCoach(message, snapshot, token, history);
      if (ops) {
        return {
          message: polishStaffMessage(ops.message),
          chunks: [],
          sources: [],
          portalLinks: ops.links,
          opsCoPilot: true,
          pendingTask: founderCoach ? undefined : ops.pendingTask,
          executiveMeta: {
            confidence: ops.mode === "recommend" ? "high" : "medium",
            freshnessSeconds: 0,
            recommendedAction: ops.pendingTask
              ? "Review the proposed task and tap Approve to create it."
              : "Open the linked board or continue in Ask.",
            evidenceCount: 1,
          },
          routing: {
            department: "Leadership",
            task: "Executive Workspace",
            confidence: "high",
            followUpQuestions: [],
          },
        };
      }
    }
  }

  const normalized = expandShortQuery(resolveQuery(message.trim(), history));
  const routing = routeIntent(normalized);
  const query = retrievalQueryBoost(normalized, routing);

  let sops: Awaited<ReturnType<typeof fetchSopsForRetrieval>> = [];
  let decisions: Awaited<ReturnType<typeof fetchDecisionsForRetrieval>> = [];
  let memories: { id: string; title: string; body: string; department?: string | null }[] = [];
  try {
    sops = await fetchSopsForRetrieval(token);
  } catch {
    sops = [];
  }
  try {
    decisions = await fetchDecisionsForRetrieval(token);
  } catch {
    decisions = [];
  }
  if (token && isHistoricalMemoryQuery(query)) {
    try {
      memories = await searchMemory(query, token);
    } catch {
      memories = [];
    }
  }

  let portalSignals: string | null = null;
  if (token && (founderCoach || wantsFounderPortalSignals(message))) {
    portalSignals = await fetchFounderPortalSignalsBlock(token);
  }

  const layered = retrieveLayeredKnowledge(query, { sops, decisions, memories, limit: 6 });
  const base = buildSiyaReply(message, history, {
    focusMode,
    layeredChunks: layered,
    queryOverride: query,
    founderCoach,
    hasPortalSignals: Boolean(portalSignals),
  });
  // Definitive rule answers always stick — portalSignals must NEVER unlock LLM overwrite.
  // Only intentional empty-message + portal (Founder Talk soft ground) may continue to LLM.
  if (base.refused || base.factsLookup || base.knowledgeGap || base.ruleFinal) {
    return base;
  }
  if (!base.chunks.length) {
    const allowPortalLlm = Boolean(portalSignals && !base.message?.trim());
    if (!allowPortalLlm) return base;
  }

  const routingLine = base.routing
    ? `Department: ${displayDepartment(base.routing.department)}. Task: ${base.routing.task}.`
    : "";

  const personalFacts = extractPersonalFactsFromHistory(history);
  const synthesis = await synthesizeWorkforceAnswer({
    userMessage: message,
    routingLine,
    chunks: base.chunks,
    followUpQuestions: founderCoach ? [] : (base.routing?.followUpQuestions ?? []),
    history,
    focusMode,
    personalFacts: personalFacts.map((f) => f.summary),
    portalSignals,
  });

  if (synthesis.text) {
    let msg = polishStaffMessage(synthesis.text);
    if (base.chunks[0]?.escalate && !msg.includes(base.chunks[0].escalate!)) {
      msg += `\n\n**Loop in:** ${base.chunks[0].escalate}`;
    }

    if (
      !founderCoach &&
      base.routing?.confidence === "high" &&
      base.routing.followUpQuestions.length &&
      !focusMode
    ) {
      msg += "\n\n**A few quick questions:**";
      base.routing.followUpQuestions.forEach((q, i) => {
        msg += `\n${i + 1}. ${q}`;
      });
    }

    return {
      ...base,
      message: msg,
      knowledgeGap: false,
      escalationPreview: undefined,
      llmUsed: true,
      llmFallback: false,
      llmError: null,
    };
  }

  const fallbackMsg =
    base.message?.trim() ||
    (founderCoach ? founderCoachPlainOffTopic() : "");

  return {
    ...base,
    message: polishStaffMessage(fallbackMsg),
    llmUsed: false,
    llmFallback: synthesis.llmFallback,
    llmError: synthesis.llmError
      ? {
          code: synthesis.llmError.code,
          kind: synthesis.llmError.kind,
          message: synthesis.llmError.userMessage,
        }
      : null,
  };
}

function mapClarifyOptionReply(message: string): string {
  const t = message.trim().toLowerCase();
  const map: Record<string, string> = {
    "1": "patient or caller situation",
    "2": "teammate or HR workplace concern",
    "3": "billing refund or reimbursement",
    "4": "policy or SOP lookup",
    "5": "tech login or system access issue",
  };
  if (map[t]) return map[t];
  if (/^1\b/.test(t) && t.length < 40) return `patient or caller situation — ${message}`;
  if (/^2\b/.test(t) && t.length < 40) return `teammate or HR workplace concern — ${message}`;
  if (/^3\b/.test(t) && t.length < 40) return `billing refund or reimbursement — ${message}`;
  if (/^4\b/.test(t) && t.length < 40) return `policy or SOP lookup — ${message}`;
  if (/^5\b/.test(t) && t.length < 40) return `tech login or system access issue — ${message}`;
  return message;
}

function resolveQuery(message: string, history: { role: string; content: string }[]): string {
  const mapped = mapClarifyOptionReply(message);
  const lastAssistant = [...history].reverse().find((h) => h.role === "assistant");
  const priorUser = [...history].reverse().find((h) => h.role === "user");
  // Only merge when the user is clearly answering an old 1–5 / path prompt — never glue a new topic onto the prior turn.
  if (
    lastAssistant &&
    priorUser &&
    /not sure which path|one line is enough|are you asking about|which path you need|reply with one line/i.test(
      lastAssistant.content,
    )
  ) {
    const reply = mapped.trim();
    const answeredMenu =
      /^[1-5]\b/.test(reply) ||
      /^(patient|caller|teammate|hr|billing|refund|reimburs|policy|sop|tech|login|access)\b/i.test(reply);
    if (answeredMenu) {
      return `${priorUser.content.trim()} — ${reply}`;
    }
    return mapped;
  }
  if (!isVagueUserMessage(mapped)) return mapped;
  // Don't stitch a new short topic onto an older user turn — that caused “X — Y” echo bugs.
  return mapped;
}

function buildSiyaReply(
  message: string,
  history: { role: string; content: string }[] = [],
  opts?: {
    focusMode?: boolean;
    layeredChunks?: RetrievedChunk[];
    queryOverride?: string;
    founderCoach?: boolean;
    hasPortalSignals?: boolean;
  }
): SiyaReply {
  const focusMode = opts?.focusMode ?? false;
  const founderCoach = opts?.founderCoach ?? false;
  const text = message.trim();
  if (!text) {
    return {
      message: founderCoach
        ? founderCoachVaguePrompt()
        : "What do you need help with today? Type a question or pick a suggestion below.",
      chunks: [],
      ruleFinal: true,
    };
  }

  const safety = assessStaffMessageSafety(text, history);
  if (safety.blocked && safety.category) {
    return {
      message: staffRefusalMessage(safety.category),
      chunks: [],
      refused: true,
      refusalCategory: safety.category,
      ruleFinal: true,
    };
  }

  const metaAnswer = answerStaffMetaQuestion(text);
  if (metaAnswer) {
    return {
      message: polishStaffMessage(metaAnswer),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
    };
  }

  if (isCasualOffTopic(text)) {
    return {
      message: polishStaffMessage(casualOffTopicReply()),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Out of scope (entertainment)",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  // Personal preference / fact for THIS chat — do not let refund SOP keywords hijack.
  // Company-policy assertions in first person still fall through to retrieval (locked).
  if (isPersonalPreferenceStatement(text) && !isCompanyPolicyAssertion(text)) {
    return {
      message: polishStaffMessage(acknowledgePersonalPreference(text)),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
      routing: {
        department: "General",
        task: "Personal preference (this chat)",
        confidence: "high",
        followUpQuestions: [],
      },
    };
  }

  const personalFacts = extractPersonalFactsFromHistory(history);
  if (
    personalFacts.length &&
    (isAskingAboutPriorPersonalFact(text) ||
      (/\b(who|what)\b/i.test(text) && /\b(say|said|told|preferred|handles|contact)\b/i.test(text)))
  ) {
    const recall = answerPersonalFactRecall(text, personalFacts);
    if (recall) {
      return {
        message: polishStaffMessage(recall),
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        ruleFinal: true,
        routing: {
          department: "General",
          task: "Personal preference recall (this chat)",
          confidence: "high",
          followUpQuestions: [],
        },
      };
    }
  }

  const factsHit = tryFactsLookup(expandShortQuery(text));
  if (factsHit) {
    return {
      message: polishStaffMessage(factsHit.message),
      chunks: factsHit.chunks,
      knowledgeGap: false,
      sources: factsHit.sources,
      escalate: defaultEscalationOwner(factsHit.department),
      routing: {
        department: factsHit.department,
        task: factsHit.task,
        confidence: "high",
        followUpQuestions: [],
      },
      escalationPreview: undefined,
      factsLookup: true,
      ruleFinal: true,
    };
  }

  if (isConfusedAboutPriorAnswer(text) && history.some((h) => h.role === "assistant")) {
    return {
      message: clarifyConfusedFollowUp(),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
    };
  }

  if (
    isVagueUserMessage(text) &&
    !hasRoutableIntent(text) &&
    !history.some((h) => h.role === "user" && h.content.trim().length > 12)
  ) {
    return {
      message: founderCoach ? founderCoachVaguePrompt() : clarifyVagueMessage(),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
    };
  }

  const normalized = expandShortQuery(resolveQuery(text, history));
  const routing = routeIntent(normalized);

  if (routing.flowId === "clinical-ops-abusive-patient") {
    const escalateOwner = defaultEscalationOwner("Clinical Operations");
    return {
      message: polishStaffMessage(abusivePatientAnswer()),
      chunks: [],
      escalate: escalateOwner,
      knowledgeGap: true,
      sources: [],
      routing: {
        department: "Clinical Operations",
        task: routing.task,
        confidence: routing.confidence,
        followUpQuestions: routing.followUpQuestions,
      },
      escalationPreview: formatEscalationForSlack({
        question: text,
        department: displayDepartment("Clinical Operations"),
        task: routing.task,
        escalateTo: escalateOwner,
        sourceTitles: [],
        followUps: routing.followUpQuestions,
      }),
    };
  }

  if (routing.flowId === "hr-workplace") {
    const escalateOwner = defaultEscalationOwner("HR");
    return {
      message: polishStaffMessage(workplaceConcernAnswer()),
      chunks: [],
      escalate: escalateOwner,
      knowledgeGap: true,
      sources: [],
      routing: {
        department: "HR",
        task: routing.task,
        confidence: routing.confidence,
        followUpQuestions: routing.followUpQuestions,
      },
      escalationPreview: formatEscalationForSlack({
        question: text,
        department: displayDepartment("HR"),
        task: routing.task,
        escalateTo: escalateOwner,
        sourceTitles: [],
        followUps: routing.followUpQuestions,
      }),
    };
  }

  const query = opts?.queryOverride ?? retrievalQueryBoost(resolveQuery(normalized, history), routing);
  let chunks =
    opts?.layeredChunks?.length ? opts.layeredChunks : retrieveLayeredKnowledge(query, { limit: 6 });
  chunks = filterStaffFacingChunks(chunks, normalized);

  const STRONG_SCORE = 3;
  let hasStrongMatch = chunks.length > 0 && chunks[0].score >= STRONG_SCORE;

  if (!hasStrongMatch) {
    const near = filterStaffFacingChunks(retrieveWorkspaceNearMisses(query, 3), normalized).filter(
      (c) => c.score >= STRONG_SCORE,
    );
    if (near.length) {
      chunks = near;
      hasStrongMatch = true;
    } else {
      chunks = [];
    }
  }

  const confident = isConfidentAssistAnswer({
    userMessage: normalized,
    flowId: routing.flowId,
    routingConfidence: routing.confidence,
    topScore: chunks[0]?.score ?? 0,
    topChunk: chunks[0] ?? null,
  });

  // Unsure → ask back. Do not dump the nearest weak keyword hit.
  // Founder Talk: empty message + portalSignals intentionally allows LLM (not ruleFinal).
  if (!confident) {
    if (founderCoach && opts?.hasPortalSignals) {
      return {
        message: "",
        chunks: [],
        knowledgeGap: false,
        sources: [],
        escalationPreview: undefined,
        routing: {
          department: "Leadership",
          task: "Founder Talk",
          confidence: "medium",
          followUpQuestions: [],
        },
      };
    }
    return {
      message: polishStaffMessage(
        founderCoach ? founderCoachPlainOffTopic() : askClarifyingQuestion(normalized),
      ),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
      ruleFinal: true,
    };
  }

  const knowledgeGap = false;

  const sources = chunks.slice(0, 2).map((c) => ({
    title: staffTopicLabel(c.title),
    id: c.id,
  }));
  const escalateOwner = chunks[0]?.escalate ?? defaultEscalationOwner(routing.department);

  let msg = composeAnswerFromChunks(normalized, chunks, knowledgeGap, routing.flowId);

  if (REFUND_PROMISE.test(msg)) {
    msg =
      "I can't approve refunds or billing exceptions here. Use the **billing / accounts** escalation path from our approved guides, or loop in the **Billing lead** with dates and amounts (no patient identifiers in this chat).";
  }

  if (
    routing.flowId === "accounts-reimbursement" &&
    !chunks.some((c) => /reimburs|expense/i.test(c.id) || /reimburs|expense/i.test(c.title))
  ) {
    msg =
      "**Note:** There isn't a live **employee reimbursement** SOP yet — use **Policies & requirements** (expense) and check with **Accounts**.\n\n" +
      msg;
  }

  if (chunks[0]?.escalate && knowledgeGap) {
    msg += `\n\n**Loop in:** ${chunks[0].escalate}`;
  }

  const showFollowUps =
    !focusMode &&
    routing.followUpQuestions.length > 0 &&
    (routing.confidence === "high" ||
      (routing.confidence === "medium" &&
        (routing.flowId === "marketing-carousel" || routing.flowId === "marketing-daily")));
  if (showFollowUps) {
    msg += "\n\n**To help you faster:**";
    routing.followUpQuestions.forEach((q, i) => {
      msg += `\n${i + 1}. ${q}`;
    });
  }

  const showContacts = knowledgeGap;
  if (showContacts) {
    const contacts = getEscalationContacts()
      .slice(0, 4)
      .map((c) => `${c.role}: ${c.detail}`)
      .join(" · ");
    msg += `\n\n**People to try:** ${contacts}`;
  }

  const escalationPreview = knowledgeGap
    ? formatEscalationForSlack({
        question: text,
        department: displayDepartment(routing.department),
        task: routing.task,
        escalateTo: escalateOwner,
        sourceTitles: sources.map((s) => s.title),
        followUps: showFollowUps ? routing.followUpQuestions : undefined,
      })
    : undefined;

  const showRouting =
    routing.confidence === "high" ||
    routing.confidence === "medium" ||
    (routing.task !== "Company memory lookup" && routing.department !== "General");

  return {
    message: polishStaffMessage(msg),
    chunks,
    escalate: escalateOwner,
    routing: showRouting
      ? {
          department: routing.department,
          task: routing.task,
          confidence: routing.confidence,
          followUpQuestions: showFollowUps ? routing.followUpQuestions : [],
        }
      : undefined,
    sources: sources.map((s) => ({ ...s, title: staffTopicLabel(s.title) })),
    escalationPreview,
    knowledgeGap,
  };
}
