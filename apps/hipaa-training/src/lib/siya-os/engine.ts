import { getEscalationContacts } from "./config";
import { defaultEscalationOwner } from "./escalation";
import { retrievalQueryBoost, routeIntent } from "./flows";
import { retrieveWorkspaceKnowledge, type RetrievedChunk } from "./retrieval";
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

export function runSiyaAssistant(message: string, _history: { role: string; content: string }[] = []): SiyaReply {
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

  const routing = routeIntent(text);
  const query = retrievalQueryBoost(text, routing);
  const chunks = retrieveWorkspaceKnowledge(query);

  const sources = chunks.slice(0, 3).map((c) => ({ title: c.title, id: c.id }));
  const escalateOwner = chunks[0]?.escalate ?? defaultEscalationOwner(routing.department);

  let msg = formatRoutingIntro(routing);

  if (routing.flowId === "accounts-reimbursement" && !chunks.some((c) => c.id.includes("reimburs"))) {
    msg +=
      "\n\n**Heads up:** We don't have a published reimbursement SOP in the KB yet. I'll still gather details and point you to **Accounts**.\n";
  }

  const hasApprovedAnswer = chunks.length > 0 && chunks[0].score >= 1;
  const knowledgeGap = !hasApprovedAnswer;

  if (chunks.length) {
    const top = chunks[0];
    msg += `\n\n${top.snippet}`;
    if (top.escalate) msg += `\n\n**Loop in:** ${top.escalate}`;
  } else {
    msg +=
      "\n\nI don't have an **approved** answer for this yet. Use **Notify owner** below so we can add policy — or copy the escalation summary for Slack or email.";
  }

  if (routing.followUpQuestions.length) {
    msg += "\n\n**A few quick questions:**";
    routing.followUpQuestions.forEach((q, i) => {
      msg += `\n${i + 1}. ${q}`;
    });
  }

  const showContacts = knowledgeGap || Boolean(chunks[0]?.escalate);
  if (showContacts) {
    const contacts = getEscalationContacts()
      .slice(0, 4)
      .map((c) => `${c.role}: ${c.detail}`)
      .join(" · ");
    msg += `\n\n**People to try:** ${contacts}`;
  }

  const escalationPreview = [
    `Team: ${displayDepartment(routing.department)}`,
    `Topic: ${routing.task}`,
    `Issue: ${text.slice(0, 500)}`,
    `Escalate to: ${escalateOwner}`,
    routing.followUpQuestions.length ? `Open questions: ${routing.followUpQuestions.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    message: msg,
    chunks,
    escalate: escalateOwner,
    routing: {
      department: routing.department,
      task: routing.task,
      confidence: routing.confidence,
      followUpQuestions: routing.followUpQuestions,
    },
    sources,
    escalationPreview,
    knowledgeGap,
  };
}

function formatRoutingIntro(routing: NonNullable<SiyaReply["routing"]>) {
  const team = displayDepartment(routing.department);
  return `Routing this under **${team}** — *${routing.task}*.`;
}
