/**
 * Conversational personal context vs company-policy assertions.
 * Personal prefs may be recalled within a thread; first-person policy claims must NOT override SOPs.
 */

export type PersonalFact = {
  raw: string;
  /** Short staff-facing paraphrase for prompts / sync answers */
  summary: string;
};

/** Strip wrapping/trailing quotes staff sometimes paste in. */
function normalizeChatText(text: string): string {
  return text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Assertions about company policy, pricing, or procedure — never treat as stored fact. */
export function isCompanyPolicyAssertion(text: string): boolean {
  const t = normalizeChatText(text).toLowerCase();
  if (!t) return false;

  // Explicit policy / pricing / procedure language (even in first person)
  if (
    /\b(policy|sop|procedure|playbook|fee|pricing|price|rate|cost|charge|waiver|waive|guarantee|guaranteed)\b/.test(
      t,
    ) &&
    /\b(is|are|was|were|now|always|never|must|should|will|refunds?|cancell?ations?)\b/.test(t)
  ) {
    // Allow "my preferred contact for refunds" — contact preference, not "refunds are free"
    if (isPersonalContactPreferenceShape(t) && !/\b(are|is)\s+(now|always|never|free|100%|full)\b/.test(t)) {
      return false;
    }
    return true;
  }

  if (
    /\brefunds?\b/.test(t) &&
    /\b(100\s*%|full\s+refund|no\s+matter\s+what|always\s+(refund|approve)|never\s+charge|free\s+refund|automatic(?:ally)?\s+refund)\b/.test(
      t,
    )
  ) {
    return true;
  }

  if (
    /\b(i\s+(told|said|heard)\s+(you\s+)?(that\s+)?|remember\s+(that\s+)?)\b/.test(t) &&
    /\b(policy|fee|price|refunds?\s+are|we\s+(always|never)|patients?\s+(always|never|get))\b/.test(t)
  ) {
    return true;
  }

  return false;
}

function isPersonalContactPreferenceShape(t: string): boolean {
  return (
    /\b(my\s+preferred|prefer(?:red)?|escalation\s+contact|contact\s+for|go\s+to|loop\s+in|hand\s+off\s+to)\b/.test(
      t,
    ) && /\b(contact|person|lead|owner|manager|name|escalat)\b/.test(t)
  );
}

/**
 * Staff stating a personal preference / working fact for THIS chat
 * (not a claim that company policy changed).
 */
export function isPersonalPreferenceStatement(text: string): boolean {
  const t = normalizeChatText(text);
  if (!t || t.length < 8) return false;
  if (isCompanyPolicyAssertion(t)) return false;

  const lower = t.toLowerCase();

  if (
    /\bmy\s+preferred\b/.test(lower) ||
    /\bi\s+prefer\b/.test(lower) ||
    /\bpreferred\s+(escalation\s+)?contact\b/.test(lower) ||
    /\b(remember|note)\s+(that\s+)?(i|my)\b/.test(lower) ||
    /\bfor\s+me[,\s]+(use|escalate|contact|go\s+to)\b/.test(lower) ||
    /\b(please\s+)?(use|escalate\s+to|contact)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(for|when|on)\b/.test(t) ||
    /\bmy\s+.+\s+is\s+[A-Z][a-z]{2,}\b/.test(t) ||
    (/\bis\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)?\.?\s*$/.test(t) &&
      /\b(preferred|contact|escalate|owner|lead)\b/.test(lower))
  ) {
    return true;
  }

  // "I told you to use Priya for refunds" — preference, not policy rewrite
  if (
    /\bi\s+(told|said|asked)\s+you\b/i.test(t) &&
    /\b(use|escalate|contact|prefer)\b/i.test(t) &&
    !/\b(policy|fee|price|are\s+now|always\s+refund)\b/i.test(t)
  ) {
    return true;
  }

  return false;
}

/** Follow-up asking what the user previously stated in this thread. */
export function isAskingAboutPriorPersonalFact(text: string): boolean {
  const t = normalizeChatText(text).toLowerCase();
  if (!t) return false;
  if (isCompanyPolicyAssertion(t)) return false;
  return (
    /\b(who|what)\s+did\s+i\s+(say|tell|mention)\b/.test(t) ||
    /\b(what|who)\s+(was|is)\s+my\s+preferred\b/.test(t) ||
    /\b(remind|recall)\s+me\b/.test(t) ||
    /\bwho\s+(handles|should\s+i\s+(use|contact)|did\s+i\s+(pick|choose))\b/.test(t) ||
    /\bdid\s+i\s+(say|tell\s+you)\b/.test(t) ||
    /\bwho\s+is\s+[a-z]{2,}\b/.test(t)
  );
}

export function extractPersonalFactsFromHistory(
  history: { role: string; content: string }[],
): PersonalFact[] {
  const out: PersonalFact[] = [];
  for (const h of history) {
    if (h.role !== "user") continue;
    const content = normalizeChatText(h.content);
    if (!isPersonalPreferenceStatement(content)) continue;
    out.push({
      raw: content.slice(0, 500),
      summary: summarizePersonalFact(content),
    });
  }
  const seen = new Set<string>();
  return out.filter((f) => {
    const k = f.summary.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function summarizePersonalFact(text: string): string {
  const t = normalizeChatText(text);
  const m = t.match(/\bmy\s+preferred\s+(?:escalation\s+)?contact\s+for\s+(.+?)\s+is\s+(.+)$/i);
  if (m) {
    const topic = m[1].trim();
    const who = m[2].replace(/[."'`]+$/g, "").trim();
    if (who) return `Preferred contact for ${topic}: ${who}`;
  }
  const m2 = t.match(
    /\b(?:preferred\s+contact|i\s+prefer(?:\s+to\s+(?:use|escalate\s+to))?)\s+(?:for\s+(.+?)\s+)?is\s+(.+)$/i,
  );
  if (m2) {
    const topic = (m2[1] || "this").trim();
    const who = m2[2].replace(/[."'`]+$/g, "").trim();
    if (who) return `Preferred contact for ${topic}: ${who}`;
  }
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}

/** Sync ack when staff states a personal preference (skip SOP dump). */
export function acknowledgePersonalPreference(text: string): string {
  const summary = summarizePersonalFact(text);
  return [
    `Got it — I’ll remember this **for this chat only** as your stated preference: **${summary}**.`,
    "",
    "That’s **your** working preference, not a change to company policy. If you ask about official refunds / fees / SOPs, I’ll still use approved internal guides.",
  ].join("\n");
}

/** Sync recall when staff asks what they said earlier and we have personal facts. */
export function answerPersonalFactRecall(
  question: string,
  facts: PersonalFact[],
): string | null {
  if (!facts.length) return null;
  const q = normalizeChatText(question).toLowerCase();
  const whoIs = q.match(/^who\s+is\s+([a-z][a-z'-]{1,40})\??$/i);
  if (whoIs) {
    const name = whoIs[1].toLowerCase();
    const hit = facts.find(
      (f) => f.summary.toLowerCase().includes(name) || f.raw.toLowerCase().includes(name),
    );
    if (!hit) return null;
    return [
      `In this chat you named **${whoIs[1]}** as your stated preference: **${hit.summary}**.`,
      "",
      "That’s what **you** said here — not an HR directory entry or company policy.",
    ].join("\n");
  }
  if (!isAskingAboutPriorPersonalFact(question) && !/\b(preferred|contact|handles|escalat)/i.test(question)) {
    return null;
  }
  const ranked = [...facts].sort((a, b) => {
    const score = (f: PersonalFact) => {
      let n = 0;
      if (/refund/i.test(q) && /refund/i.test(f.raw)) n += 3;
      if (/contact|escalat|handles|who/i.test(q)) n += 1;
      return n;
    };
    return score(b) - score(a);
  });
  const best = ranked[0];
  return [
    `You told me earlier (your preference in this chat): **${best.summary}**.`,
    "",
    "Again — that’s what **you** stated here, not an approved company policy change.",
  ].join("\n");
}
