import { getEscalationContacts } from "./config";
import { retrieveWorkspaceKnowledge, type RetrievedChunk } from "./retrieval";

export interface SiyaReply {
  message: string;
  chunks: RetrievedChunk[];
  escalate?: string;
  refused?: boolean;
}

const PHI = /\b(mrn|ssn|social security|patient name is|date of birth)\b/i;
const CLINICAL = /\b(prescrib|dosage|diagnos|should i take|suicid|911)\b/i;

export function runSiyaAssistant(message: string): SiyaReply {
  const text = message.trim();
  if (!text) {
    return {
      message: "Ask me about HIPAA, billing workflow, escalation, or open **Training** for certification.",
      chunks: [],
    };
  }
  if (PHI.test(text)) {
    return {
      message: "Don't paste patient identifiers here. Use the EHR and escalate account issues to **Privacy Officer / billing**.",
      chunks: [],
      refused: true,
    };
  }
  if (CLINICAL.test(text)) {
    return {
      message: "I can't give clinical advice. Escalate to the **provider / clinical lead**.",
      chunks: [],
      refused: true,
    };
  }

  const chunks = retrieveWorkspaceKnowledge(text);
  if (!chunks.length) {
    return {
      message:
        "I didn't find a strong match. Try: escalation, late cancel, no-show, breach, telehealth background, or **Training** for the full HIPAA course.",
      chunks: [],
    };
  }

  const top = chunks[0];
  const contacts = getEscalationContacts()
    .map((c) => `${c.role}: ${c.detail}`)
    .join(" · ");
  let msg = top.snippet;
  if (top.escalate) msg += `\n\n**Escalate:** ${top.escalate}`;
  msg += `\n\n**Contacts:** ${contacts}`;

  return { message: msg, chunks, escalate: top.escalate };
}
