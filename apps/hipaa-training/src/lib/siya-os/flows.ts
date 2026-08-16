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
    id: "accounts-billing-patient",
    department: "Accounts",
    task: "Patient billing / Klarity",
    patterns: [
      /\bbilling\s+(question|issue|problem|help|inquiry)\b/i,
      /\bi\s+have\s+a\s+billing\b/i,
      /\bpatient\s+billing\b/i,
      /\bklarity\b.*\b(billing|refund|cancel)/i,
      /\b(billing|refund).*\bklarity\b/i,
      /\bchargeback/i,
      /\bno-?show\s+fee\b/i,
    ],
    followUpQuestions: [
      "Refund, cancellation, chargeback, or insurance charge?",
      "Klarity booking or direct Siya?",
    ],
    retrievalBoost: ["billing", "klarity", "refund", "cancellation", "chargeback", "no-show"],
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
    id: "marketing-daily",
    department: "Marketing",
    task: "Today's marketing / content plan",
    patterns: [
      /marketing plan/i,
      /plan for today/i,
      /marketing today/i,
      /content today/i,
      /what.*post/i,
      /social today/i,
      /campaign today/i,
      /\bposting\b/i,
      /\btoday\b.*\b(post|content|social)/i,
    ],
    followUpQuestions: [
      "Are you drafting patient-facing content, or asking about strategy/calendar?",
      "Which channel (Instagram, LinkedIn, site, email)?",
      "Does this mention clinical care, pricing, or outcomes?",
    ],
    retrievalBoost: ["marketing", "content", "QA", "compliance", "editorial", "brand", "tracker"],
  },
  {
    id: "marketing-carousel",
    department: "Marketing",
    task: "Social content (carousel / post)",
    patterns: [
      /carousel/i,
      /instagram/i,
      /\binsta\b/i,
      /linkedin/i,
      /facebook/i,
      /tiktok/i,
      /social post/i,
      /\breels?\b/i,
      /make.*content/i,
      /adhd.*post/i,
      /\bpost\b/i,
      /caption/i,
    ],
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
    retrievalBoost: ["escalation", "clinical", "refill", "pharmacy"],
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
    id: "clinical-ops-abusive-patient",
    department: "Clinical Operations",
    task: "Hostile / abusive patient interaction",
    patterns: [
      /abusive\s+patient/i,
      /hostile\s+patient/i,
      /angry\s+patient/i,
      /patient\s+(is\s+)?(abusive|hostile|angry|threatening|yelling|screaming|cursing)/i,
      /(abusive|hostile|threatening|yelling|screaming).{0,40}\bpatient\b/i,
      /\bpatient\b.{0,40}(abusive|hostile|threatening|yell|scream|threat|curse|swear)/i,
      /verbal\s+abuse/i,
      /patient\s+threat/i,
      /(caller|patient).{0,30}(hung up|screaming|cursing|swearing|threatening)/i,
      /threaten(ed|ing)?\s+(me|us|staff)/i,
    ],
    followUpQuestions: [
      "Is this happening right now, or already over?",
      "Phone, portal chat, or in-visit?",
      "Any safety threat (harm to self/others/staff)?",
    ],
    retrievalBoost: ["escalation", "supervisor", "clinical", "angry", "hostile", "billing"],
  },
  {
    id: "hr-workplace",
    department: "HR",
    task: "Workplace concern",
    patterns: [
      /\brude\b(?!.{0,20}\bpatient\b)/i,
      /harass/i,
      /bully/i,
      /hostile\s+(work|workplace|environment|coworker|colleague|teammate|manager|staff)/i,
      /(coworker|colleague|teammate|manager|supervisor|staff).{0,20}(yell|yelled|yelling)/i,
      /disrespect/i,
      /mistreat/i,
      /staff (was|were|is|are) rude/i,
      /(coworker|colleague|teammate|manager|supervisor).*(rude|mean|unfair)/i,
      /(rude|mean|unfair).*(coworker|colleague|teammate|manager|staff)/i,
      /complain(t|ing)? about (staff|a coworker|my manager)/i,
    ],
    followUpQuestions: [
      "Is this about a teammate, a manager, or something else?",
      "Do you want this escalated to your supervisor / People (HR)?",
      "Any same-day safety concern?",
    ],
    retrievalBoost: ["hr", "people", "supervisor", "escalation", "workplace"],
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

/** One-word channel names etc. → richer retrieval query */
const SHORT_QUERY_EXPAND: Record<string, string> = {
  instagram: "instagram social post patient-facing marketing",
  insta: "instagram social post marketing",
  linkedin: "linkedin company post marketing",
  facebook: "facebook social post marketing",
  tiktok: "tiktok social video marketing",
  carousel: "carousel social content marketing editorial",
  post: "patient-facing social post marketing checklist",
  posting: "social posting marketing today",
  caption: "social caption marketing compliance",
  marketing: "marketing content plan today editorial",
  reimbursement: "employee reimbursement expense report",
  pricing: "public patient pricing ADHD",
};

export function expandShortQuery(message: string): string {
  const t = message.trim().toLowerCase();
  if (SHORT_QUERY_EXPAND[t]) return SHORT_QUERY_EXPAND[t];
  return message.trim();
}

export function hasRoutableIntent(message: string): boolean {
  const text = expandShortQuery(message);
  let best = 0;
  for (const flow of FLOWS) {
    best = Math.max(best, scoreFlow(text, flow));
  }
  return best >= 3;
}

export function routeIntent(message: string): RouteResult {
  const text = expandShortQuery(message);
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
    task: "Company memory lookup",
    confidence: bestScore > 0 ? "low" : "medium",
    followUpQuestions: [],
    // Do not attach a weak near-miss flowId — that poisons retrieval boosts.
  };
}

export function retrievalQueryBoost(message: string, route: RouteResult): string {
  const flow = FLOWS.find((f) => f.id === route.flowId);
  // Never append department/task prose — "General Company memory lookup" poisoned retrieval
  // toward PHI / archive topics. Only append intentional keyword boosts from a matched flow.
  if (!flow?.retrievalBoost?.length) return message.trim();
  return `${message.trim()} ${flow.retrievalBoost.join(" ")}`.trim();
}
