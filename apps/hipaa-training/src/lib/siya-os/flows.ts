import type { RouteResult } from "./departments";

/** Task flows: match phrases → department, task label, follow-ups (MVP — no LLM). */
const FLOWS: {
  id: string;
  department: RouteResult["department"];
  task: string;
  patterns: RegExp[];
  followUpQuestions: string[];
  retrievalBoost: string[];
}[] = [
  {
    id: "leadership-decision",
    department: "Leadership",
    task: "Decision log / context",
    patterns: [/why did we/i, /decision log/i, /who decided/i, /when did we change/i, /why.*change/i],
    followUpQuestions: ["Which project or area?", "Approximate timeframe?", "Who was in the room?"],
    retrievalBoost: ["decision", "homepage", "cta", "leadership"],
  },
  {
    id: "accounts-reimbursement",
    department: "Accounts",
    task: "Employee reimbursement",
    patterns: [/reimburs/i, /expense report/i, /paid personally/i, /heygen/i, /chatgpt/i, /openai/i, /invoice/i],
    followUpQuestions: [
      "What was the amount?",
      "Purchase date?",
      "Do you have a receipt or invoice uploaded?",
      "Who approved the expense (manager name)?",
    ],
    retrievalBoost: ["billing", "reimburse", "expense", "accounts"],
  },
  {
    id: "marketing-carousel",
    department: "Marketing",
    task: "Social content (carousel / post)",
    patterns: [/carousel/i, /instagram/i, /social post/i, /make.*content/i, /adhd.*post/i],
    followUpQuestions: [
      "What is the topic or insight ID?",
      "Siya Health company voice or physician profile?",
      "Static or carousel — which platforms?",
      "State or audience (CA, TX, PA, FL)?",
      "Clinical / medical review required?",
    ],
    retrievalBoost: ["content", "QA", "brand", "editorial", "caption", "CTA"],
  },
  {
    id: "clinical-refill",
    department: "Clinical Operations",
    task: "Medication refill workflow",
    patterns: [/refill/i, /prescription not sent/i, /medication.*not/i, /pharmacy/i],
    followUpQuestions: [
      "Which provider is assigned? (no names in chat)",
      "Date of last visit?",
      "Request already in the chart?",
      "Urgent or routine?",
    ],
    retrievalBoost: ["escalation", "clinical", "chat", "portal"],
  },
  {
    id: "compliance-privacy",
    department: "Compliance",
    task: "Privacy or compliance question",
    patterns: [/hipaa/i, /phi/i, /breach/i, /privacy/i, /third party/i, /family.*charg/i],
    followUpQuestions: ["Is this about a specific incident? (Keep identifiers out of chat.)"],
    retrievalBoost: ["hipaa", "breach", "privacy", "third party"],
  },
  {
    id: "tech-access",
    department: "Technology",
    task: "System / access issue",
    patterns: [/login/i, /password/i, /zoho/i, /ehr/i, /can't access/i, /software/i, /website/i],
    followUpQuestions: ["Which system?", "Error message or screenshot available?", "Does this block your work today?"],
    retrievalBoost: ["amcare", "integration", "IT", "zoho"],
  },
  {
    id: "hr-general",
    department: "HR",
    task: "People policy or onboarding",
    patterns: [/onboard/i, /leave/i, /pto/i, /holiday/i, /performance review/i, /hr/i],
    followUpQuestions: ["Are you a contractor or employee?", "Which country / timezone?", "Who is your supervisor?"],
    retrievalBoost: ["hr", "onboarding", "contractor", "SOW"],
  },
  {
    id: "clinical-ops-chat",
    department: "Clinical Operations",
    task: "Scheduling & portal workflow",
    patterns: [/portal chat/i, /schedule/i, /appointment/i, /no-show/i, /late cancel/i, /payment check/i],
    followUpQuestions: ["Routine or urgent?", "Same-day deadline?"],
    retrievalBoost: ["chat", "24", "payment", "cancel", "escalation"],
  },
];

function scoreFlow(text: string, flow: (typeof FLOWS)[0]) {
  let s = 0;
  const lower = text.toLowerCase();
  for (const p of flow.patterns) {
    if (p.test(text)) s += 3;
  }
  for (const b of flow.retrievalBoost) {
    if (lower.includes(b.toLowerCase())) s += 1;
  }
  return s;
}

export function routeIntent(message: string): RouteResult {
  const text = message.trim();
  let best: (typeof FLOWS)[0] | null = null;
  let bestScore = 0;
  for (const flow of FLOWS) {
    const s = scoreFlow(text, flow);
    if (s > bestScore) {
      bestScore = s;
      best = flow;
    }
  }

  if (best && bestScore >= 3) {
    return {
      department: best.department,
      task: best.task,
      confidence: bestScore >= 6 ? "high" : "medium",
      followUpQuestions: best.followUpQuestions,
      flowId: best.id,
    };
  }

  if (/approv/i.test(text) || /strategy/i.test(text) || /founder/i.test(text)) {
    return {
      department: "Leadership",
      task: "Approval or strategy reference",
      confidence: "low",
      followUpQuestions: ["What decision or approval do you need?", "Deadline?", "Who already reviewed?"],
    };
  }

  return {
    department: "General",
    task: "Find an SOP or policy",
    confidence: bestScore > 0 ? "low" : "medium",
    followUpQuestions: ["Which team are you on?", "What outcome do you need today?"],
    flowId: best?.id,
  };
}

export function retrievalQueryBoost(message: string, route: RouteResult): string {
  const flow = FLOWS.find((f) => f.id === route.flowId);
  const boost = flow?.retrievalBoost.join(" ") ?? "";
  return `${message} ${route.department} ${route.task} ${boost}`.trim();
}
