import { getEscalationContacts } from "./config";
import { retrieveWorkspaceKnowledge, type RetrievedChunk } from "./retrieval";

export interface SiyaReply {
  message: string;
  chunks: RetrievedChunk[];
  escalate?: string;
  refused?: boolean;
}

const CLINICAL_PATTERNS =
  /\b(diagnos|prescri|dosage|medication for|should i take|symptom|suicid|emergency|911|chest pain)\b/i;
const PHI_PATTERNS =
  /\b(mrn|ssn|social security|patient name is|dob is|date of birth|phone number is)\b/i;

function refusalClinical(): SiyaReply {
  return {
    message:
      "I can't help with **clinical or medical decisions**. Route the patient to **Secure Medical Chat** or the **on-call provider**, and document the handoff per workflow.",
    chunks: [],
    refused: true,
  };
}

function refusalPhiInChat(): SiyaReply {
  return {
    message:
      "Please **don't paste patient identifiers** (names, DOB, MRN, etc.) into SiyaOS. Use the **EHR/CRM** and escalate to **Privacy Officer / supervisor** for account-specific issues.",
    chunks: [],
    refused: true,
  };
}

function formatChunkAnswer(chunks: RetrievedChunk[]): SiyaReply {
  const primary = chunks[0];
  const parts = [primary.snippet];
  if (primary.escalate) {
    parts.push(`\n\n**Escalate:** ${primary.escalate}`);
  }
  if (chunks.length > 1) {
    parts.push(`\n\n**Related:** ${chunks.slice(1, 3).map((c) => c.title).join(" · ")}`);
  }
  const contacts = getEscalationContacts();
  parts.push(
    `\n\n**Internal contacts:** ${contacts.map((c) => `${c.role}: ${c.detail}`).join(" · ")}`
  );
  return {
    message: parts.join(""),
    chunks,
    escalate: primary.escalate,
  };
}

function fallback(): SiyaReply {
  return {
    message:
      "I didn't find a strong match in the internal playbook. Try rephrasing, or ask about **escalation**, **late cancel**, **no-show**, **HIPAA breach**, **telehealth privacy**, or open **HIPAA certification** under Training. For patient-specific accounts, escalate to **billing** or **Privacy Officer**.",
    chunks: [],
  };
}

export function runSiyaAssistant(userMessage: string): SiyaReply {
  const text = userMessage.trim();
  if (!text) return fallback();

  if (PHI_PATTERNS.test(text)) return refusalPhiInChat();
  if (CLINICAL_PATTERNS.test(text)) return refusalClinical();

  const chunks = retrieveWorkspaceKnowledge(text);
  if (!chunks.length) return fallback();

  return formatChunkAnswer(chunks);
}

export function runSiyaAssistantForEscalationOverview(): SiyaReply {
  const chunks = retrieveWorkspaceKnowledge("escalation pathways contact supervisor billing privacy");
  return formatChunkAnswer(chunks.length ? chunks : []);
}
