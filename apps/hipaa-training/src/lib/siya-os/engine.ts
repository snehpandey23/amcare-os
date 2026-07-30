import { getEscalationContacts } from "./config";
import { defaultEscalationOwner } from "./escalation";
import { retrievalQueryBoost, routeIntent, expandShortQuery, hasRoutableIntent } from "./flows";
import { composeAnswerFromChunks, clarifyVagueMessage, formatEscalationForSlack, isVagueUserMessage, polishStaffMessage } from "./compose-answer";
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
import { searchMemory } from "@/lib/memory-api";
import { displayDepartment, type Confidence, type Department } from "./departments";
import {
  assessStaffMessageSafety,
  staffRefusalMessage,
  type StaffRefusalCategory,
} from "./phi-guard";
import { fetchAdminOpsSnapshot } from "./admin-ops-snapshot";
import { detectAdminOpsIntent, runAdminOpsCoach } from "./admin-ops-coach";

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
  executiveMeta?: {
    confidence: string;
    freshnessSeconds: number;
    recommendedAction: string;
    evidenceCount: number;
  };
  pendingTask?: {
    title: string;
    assigneeId: string;
    assigneeLabel: string;
    priority: string;
    dueDate: string;
  };
}

const REFUND_PROMISE = /\b(i (can|will) (approve|refund|waive|credit)|guaranteed refund|refund is approved)\b/i;

export function runSiyaAssistant(message: string, history: { role: string; content: string }[] = []): SiyaReply {
  return buildSiyaReply(message, history);
}

export async function runSiyaAssistantAsync(
  message: string,
  history: { role: string; content: string }[] = [],
  opts?: { focusMode?: boolean; authToken?: string | null }
): Promise<SiyaReply> {
  const focusMode = opts?.focusMode ?? false;
  const token = opts?.authToken?.trim() || null;

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
          pendingTask: ops.pendingTask,
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

  const normalized = expandShortQuery(message.trim());
  const routing = routeIntent(normalized);
  const query = retrievalQueryBoost(resolveQuery(normalized, history), routing);

  let sops: Awaited<ReturnType<typeof fetchSopsForRetrieval>> = [];
  let memories: { id: string; title: string; body: string; department?: string | null }[] = [];
  try {
    sops = await fetchSopsForRetrieval(token);
  } catch {
    sops = [];
  }
  if (token && isHistoricalMemoryQuery(query)) {
    try {
      memories = await searchMemory(query, token);
    } catch {
      memories = [];
    }
  }

  const layered = retrieveLayeredKnowledge(query, { sops, memories, limit: 6 });
  const base = buildSiyaReply(message, history, {
    focusMode,
    layeredChunks: layered,
    queryOverride: query,
  });
  if (base.refused || !base.chunks.length) return base;

  const routingLine = base.routing
    ? `Department: ${displayDepartment(base.routing.department)}. Task: ${base.routing.task}.`
    : "";

  const llmText = await synthesizeWorkforceAnswer({
    userMessage: message,
    routingLine,
    chunks: base.chunks,
    followUpQuestions: base.routing?.followUpQuestions ?? [],
    history,
    focusMode,
  });

  if (!llmText) return { ...base, message: polishStaffMessage(base.message) };

  let msg = polishStaffMessage(llmText);
  if (base.chunks[0]?.escalate && !msg.includes(base.chunks[0].escalate!)) {
    msg += `\n\n**Loop in:** ${base.chunks[0].escalate}`;
  }

  if (base.routing?.confidence === "high" && base.routing.followUpQuestions.length && !focusMode) {
    msg += "\n\n**A few quick questions:**";
    base.routing.followUpQuestions.forEach((q, i) => {
      msg += `\n${i + 1}. ${q}`;
    });
  }

  const showContacts = base.knowledgeGap || Boolean(base.chunks[0]?.escalate);
  if (showContacts && base.message.includes("People to try:")) {
    const contactsPart = base.message.split("**People to try:**")[1];
    if (contactsPart) msg += `\n\n**People to try:**${contactsPart}`;
  } else if (showContacts) {
    const contacts = getEscalationContacts()
      .slice(0, 4)
      .map((c) => `${c.role}: ${c.detail}`)
      .join(" · ");
    msg += `\n\n**People to try:** ${contacts}`;
  }

  return { ...base, message: msg };
}

function resolveQuery(message: string, history: { role: string; content: string }[]): string {
  if (!isVagueUserMessage(message)) return message;
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h.role === "user" && h.content.trim().length > 12 && !isVagueUserMessage(h.content)) {
      return `${h.content.trim()} (follow-up: ${message})`;
    }
  }
  return message;
}

function buildSiyaReply(
  message: string,
  history: { role: string; content: string }[] = [],
  opts?: {
    focusMode?: boolean;
    layeredChunks?: RetrievedChunk[];
    queryOverride?: string;
  }
): SiyaReply {
  const focusMode = opts?.focusMode ?? false;
  const text = message.trim();
  if (!text) {
    return {
      message: "What do you need help with today? Type a question or pick a suggestion below.",
      chunks: [],
    };
  }

  const safety = assessStaffMessageSafety(text, history);
  if (safety.blocked && safety.category) {
    return {
      message: staffRefusalMessage(safety.category),
      chunks: [],
      refused: true,
      refusalCategory: safety.category,
    };
  }

  if (
    isVagueUserMessage(text) &&
    !hasRoutableIntent(text) &&
    !history.some((h) => h.role === "user" && h.content.trim().length > 12)
  ) {
    return {
      message: clarifyVagueMessage(),
      chunks: [],
      knowledgeGap: false,
      sources: [],
      escalationPreview: undefined,
    };
  }

  const normalized = expandShortQuery(text);
  const routing = routeIntent(normalized);
  const query = opts?.queryOverride ?? retrievalQueryBoost(resolveQuery(normalized, history), routing);
  let chunks =
    opts?.layeredChunks?.length ? opts.layeredChunks : retrieveLayeredKnowledge(query, { limit: 6 });
  chunks = filterStaffFacingChunks(chunks, normalized);

  const hasStrongMatch = chunks.length > 0 && chunks[0].score >= 2;
  const knowledgeGap = !hasStrongMatch;

  const sources = chunks.slice(0, hasStrongMatch ? 2 : 3).map((c) => ({
    title: c.layerLabel ? `${c.layerLabel} · ${staffTopicLabel(c.title)}` : staffTopicLabel(c.title),
    id: c.id,
  }));
  const escalateOwner = chunks[0]?.escalate ?? defaultEscalationOwner(routing.department);

  if (!chunks.length) {
    chunks = filterStaffFacingChunks(retrieveWorkspaceNearMisses(query, 3), normalized);
  }

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

  if (!hasStrongMatch && chunks.length && !msg.includes("Closest")) {
    msg += `\n\n**Closest topics:** ${chunks.slice(0, 3).map((c) => staffTopicLabel(c.title)).join(" · ")}`;
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

  const escalationPreview =
    knowledgeGap || chunks[0]?.escalate
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
