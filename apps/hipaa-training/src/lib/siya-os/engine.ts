import { getEscalationContacts } from "./config";
import { defaultEscalationOwner } from "./escalation";
import { retrievalQueryBoost, routeIntent } from "./flows";
import { retrieveWorkspaceKnowledge, type RetrievedChunk } from "./retrieval";
import type { Confidence, Department } from "./departments";

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
        "Don't paste patient identifiers here. Use the EHR. I can still help with **operational** steps if you describe the situation without PHI.",
      chunks: [],
      refused: true,
    };
  }
  if (CLINICAL_DECISION.test(text)) {
    return {
      message:
        "I can't make clinical decisions or give medical advice. I can walk through **approved operational workflows** and escalate to the **provider / clinical lead**.",
      chunks: [],
      refused: true,
    };
  }

  const routing = routeIntent(text);
  const query = retrievalQueryBoost(text, routing);
  const chunks = retrieveWorkspaceKnowledge(query);

  const sources = chunks.slice(0, 3).map((c) => ({ title: c.title, id: c.id }));
  const escalateOwner = chunks[0]?.escalate ?? defaultEscalationOwner(routing.department);

  let msg = formatRoutingHeader(routing);

  if (routing.flowId === "accounts-reimbursement" && !chunks.some((c) => c.id.includes("reimburs"))) {
    msg +=
      "\n\n**Policy note:** Reimbursement SOP is not in the approved KB yet. I can still collect details and escalate to **Accounts** with context.\n";
  }

  if (chunks.length) {
    const top = chunks[0];
    msg += `\n\n${top.snippet}`;
    if (top.escalate) msg += `\n\n**Escalate:** ${top.escalate}`;
  } else {
    msg +=
      "\n\nI don't have an **approved** document for this yet. Use **Escalate** to send your manager a filled summary—or ask your owner to add a live topic in `docs/siyaos-knowledge-base`.";
  }

  if (routing.followUpQuestions.length) {
    msg += "\n\n**I need a few details:**";
    routing.followUpQuestions.forEach((q, i) => {
      msg += `\n${i + 1}. ${q}`;
    });
  }

  const contacts = getEscalationContacts()
    .map((c) => `${c.role}: ${c.detail}`)
    .join(" · ");
  msg += `\n\n**Contacts:** ${contacts}`;

  const escalationPreview = [
    `Department: ${routing.department}`,
    `Task: ${routing.task}`,
    `Issue: ${text.slice(0, 500)}`,
    `Confidence: ${routing.confidence}`,
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
  };
}

function formatRoutingHeader(routing: SiyaReply["routing"]) {
  if (!routing) return "";
  return `**Department:** ${routing.department}\n**Task:** ${routing.task}\n**Confidence:** ${routing.confidence}`;
}
