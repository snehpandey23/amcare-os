import { getEscalationContacts } from "./config";
import { defaultEscalationOwner } from "./escalation";
import { retrievalQueryBoost, routeIntent } from "./flows";
import { composeAnswerFromChunks, clarifyVagueMessage, formatEscalationForSlack, isVagueUserMessage, polishStaffMessage } from "./compose-answer";
import { staffTopicLabel } from "./staff-voice";
import { synthesizeWorkforceAnswer } from "./llm-answer";
import { retrieveWorkspaceKnowledge, retrieveWorkspaceNearMisses, type RetrievedChunk } from "./retrieval";
import { displayDepartment, type Confidence, type Department } from "./departments";

export interface SiyaReply {
  message: string;
  chunks: RetrievedChunk[];
  escalate?: string;
  refused?: boolean;
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
}

const PHI = /\b(mrn|ssn|social security|patient name is|date of birth)\b/i;
const CLINICAL_DECISION = /\b(prescrib|dosage|diagnos|should i take|suicid|911)\b/i;

export function runSiyaAssistant(message: string, history: { role: string; content: string }[] = []): SiyaReply {
  return buildSiyaReply(message, history);
}

export async function runSiyaAssistantAsync(
  message: string,
  history: { role: string; content: string }[] = []
): Promise<SiyaReply> {
  const base = buildSiyaReply(message, history);
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
  });

  if (!llmText) return { ...base, message: polishStaffMessage(base.message) };

  let msg = polishStaffMessage(llmText);
  if (base.chunks[0]?.escalate && !msg.includes(base.chunks[0].escalate!)) {
    msg += `\n\n**Loop in:** ${base.chunks[0].escalate}`;
  }

  if (base.routing?.confidence === "high" && base.routing.followUpQuestions.length) {
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

function buildSiyaReply(message: string, history: { role: string; content: string }[] = []): SiyaReply {
  const text = message.trim();
  if (!text) {
    return {
      message: "What do you need help with today? Type a question or pick a suggestion below.",
      chunks: [],
    };
  }
  if (PHI.test(text)) {
    return {
      message:
        "Please don't paste names, MRNs, or other chart identifiers here — use the EHR or secure channels. I can still walk through **internal steps** if you describe the situation without identifiers.",
      chunks: [],
      refused: true,
    };
  }
  if (CLINICAL_DECISION.test(text)) {
    return {
      message:
        "I'm not for medical advice or prescribing decisions. I **can** help with internal workflows (who to loop in, SOP steps) and draft an escalation for your supervisor.",
      chunks: [],
      refused: true,
    };
  }

  if (isVagueUserMessage(text) && !history.some((h) => h.role === "user" && h.content.trim().length > 12)) {
    return {
      message: clarifyVagueMessage(),
      chunks: [],
      knowledgeGap: true,
      routing: {
        department: "General",
        task: "Need more detail",
        confidence: "low",
        followUpQuestions: [],
      },
      sources: [],
      escalationPreview: undefined,
    };
  }

  const routing = routeIntent(text);
  const query = retrievalQueryBoost(resolveQuery(text, history), routing);
  let chunks = retrieveWorkspaceKnowledge(query);

  const hasStrongMatch = chunks.length > 0 && chunks[0].score >= 2;
  const knowledgeGap = !hasStrongMatch;

  const sources = chunks.slice(0, hasStrongMatch ? 2 : 3).map((c) => ({
    title: staffTopicLabel(c.title),
    id: c.id,
  }));
  const escalateOwner = chunks[0]?.escalate ?? defaultEscalationOwner(routing.department);

  if (!chunks.length) {
    chunks = retrieveWorkspaceNearMisses(query, 3);
  }

  let msg = composeAnswerFromChunks(text, chunks, knowledgeGap);

  if (routing.flowId === "accounts-reimbursement" && !chunks.some((c) => c.id.includes("reimburs"))) {
    msg =
      "**Note:** There isn't a live **employee reimbursement** topic in Company Memory yet — Accounts will need to publish one.\n\n" +
      msg;
  }

  if (!hasStrongMatch && chunks.length && !msg.includes("Closest")) {
    msg += `\n\n**Closest topics:** ${chunks.slice(0, 3).map((c) => c.title).join(" · ")}`;
  }

  if (chunks[0]?.escalate && knowledgeGap) {
    msg += `\n\n**Loop in:** ${chunks[0].escalate}`;
  }

  const showFollowUps = routing.confidence === "high" && routing.followUpQuestions.length > 0;
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
    routing.confidence === "high" || routing.task !== "Company memory lookup" || routing.department !== "General";

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
    sources,
    escalationPreview,
    knowledgeGap,
  };
}
