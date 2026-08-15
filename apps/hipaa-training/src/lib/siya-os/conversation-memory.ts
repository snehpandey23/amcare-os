/**
 * Conversational personal context vs company-policy assertions vs role/authority claims.
 *
 * Tier 1 — Personal preference: safe to remember for this chat (no confirmation).
 * Tier 2 — Policy assertion: never accept from chat; stay locked to approved sources.
 * Tier 3 — Role/authority claim: heard but unconfirmed; never restate as directory fact.
 */

export type PersonalFactKind = "preference" | "role_unconfirmed";

export type PersonalFact = {
  raw: string;
  /** Short staff-facing paraphrase for prompts / sync answers */
  summary: string;
  kind: PersonalFactKind;
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

/** Role / title / authority nouns used in org-position claims. */
const ROLE_NOUN =
  "(?:clinical|billing|compliance|hr|marketing|operations|ops|tech(?:nology)?|product|finance)\\s+" +
  "(?:lead|manager|director|head|supervisor|owner)|" +
  "(?:lead|manager|director|supervisor|head|owner|vp|chief|" +
  "program\\s+manager|team\\s+lead|dept(?:artment)?\\s+lead)";

/** Questions about roles — recall path, not a new assertion. */
function isRoleAuthorityQuestion(t: string): boolean {
  return (
    /^(who|what|which)\b/.test(t) ||
    /\bwho\s+(is|are|was|were|'s)\b/.test(t) ||
    /\b(is|are)\s+(?:the\s+)?(?:new\s+)?(?:clinical|billing)?\s*(?:lead|manager)\b/.test(t) ||
    /\?/.test(t)
  );
}

/**
 * Tier 3 — WHO holds a role/title/authority (not a personal routing preference).
 * Must not be silently accepted or restated as confirmed directory fact.
 */
export function isRoleAuthorityAssertion(text: string): boolean {
  const t = normalizeChatText(text).toLowerCase();
  if (!t) return false;
  if (isCompanyPolicyAssertion(t)) return false;
  // "who is clinical lead now" is a question — never treat as a new claim
  if (isRoleAuthorityQuestion(t)) return false;

  // Tier 1 wins: own preference / escalation contact phrasing
  if (
    /\bmy\s+preferred\b/.test(t) ||
    /\bi\s+prefer\b/.test(t) ||
    /\bpreferred\s+(escalation\s+)?contact\b/.test(t) ||
    /\bfor\s+me[,\s]+(use|escalate|contact|go\s+to)\b/.test(t) ||
    (isPersonalContactPreferenceShape(t) &&
      !new RegExp(`\\b(?:the\\s+)?(?:new\\s+)?(?:${ROLE_NOUN})\\s+is\\b`).test(t))
  ) {
    return false;
  }

  // "clinical lead is priya" / "the new manager is X" (+ optional "remember it")
  if (new RegExp(`\\b(?:the\\s+)?(?:new\\s+)?(?:${ROLE_NOUN})\\s+is\\s+[a-z][a-z'-]{1,40}\\b`).test(t)) {
    return true;
  }

  // "priya is (the) (new) clinical lead" — require a real name, not who/what
  if (
    new RegExp(
      `\\b(?!who|what|which|where|when|how)[a-z][a-z'-]{1,40}\\s+is\\s+(?:(?:the|our|now)\\s+)*(?:new\\s+)?(?:${ROLE_NOUN})\\b`,
    ).test(t)
  ) {
    return true;
  }

  // "Y is now in charge of Z" / "X is in charge"
  if (
    /\b(?!who|what|which)[a-z][a-z'-]{1,40}\s+is\s+(?:now\s+)?in\s+charge(?:\s+of\b)?/.test(t)
  ) {
    return true;
  }

  // "X is the (new) manager of Y"
  if (/\bis\s+(?:the\s+)?(?:new\s+)?(?:manager|director|head|lead)\s+of\b/.test(t)) {
    return true;
  }

  return false;
}

/**
 * Staff stating a personal preference / working fact for THIS chat
 * (not a claim that company policy changed, and not a role/authority claim).
 */
export function isPersonalPreferenceStatement(text: string): boolean {
  const t = normalizeChatText(text);
  if (!t || t.length < 8) return false;
  if (isCompanyPolicyAssertion(t)) return false;
  if (isRoleAuthorityAssertion(t)) return false;

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
      /\b(preferred|contact|escalate|owner)\b/.test(lower) &&
      !/\b(clinical|billing|compliance)\s+lead\b/.test(lower))
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
    /\bwho\s+is\s+[a-z]{2,}\b/.test(t) ||
    /\bwho\s+is\s+(?:the\s+)?(?:new\s+)?(?:clinical|billing|compliance|hr)?\s*(?:lead|manager|director)\b/.test(
      t,
    )
  );
}

/** Meta follow-up questioning certainty of a prior (esp. role) claim. */
export function isMetaCertaintyAboutPriorClaim(text: string): boolean {
  const t = normalizeChatText(text).toLowerCase();
  if (!t) return false;
  if (
    /\bare\s+you\s+sure\b/.test(t) ||
    /\bconfirm\s+with\s+admin\b/.test(t) ||
    /\bshould\s+have\s+told\b/.test(t) ||
    /\bbefore\s+acting\b/.test(t) ||
    /\b(u|you)\s+(r|are)\s+not\s+sure\b/.test(t) ||
    /\bi\s+think\s+(u|you)\s+should\b/.test(t)
  ) {
    return true;
  }
  return false;
}

export function extractPersonalFactsFromHistory(
  history: { role: string; content: string }[],
): PersonalFact[] {
  const out: PersonalFact[] = [];
  for (const h of history) {
    if (h.role !== "user") continue;
    const content = normalizeChatText(h.content);
    if (isRoleAuthorityAssertion(content)) {
      out.push({
        raw: content.slice(0, 500),
        summary: summarizeRoleClaim(content),
        kind: "role_unconfirmed",
      });
      continue;
    }
    if (!isPersonalPreferenceStatement(content)) continue;
    out.push({
      raw: content.slice(0, 500),
      summary: summarizePersonalFact(content),
      kind: "preference",
    });
  }
  const seen = new Set<string>();
  return out.filter((f) => {
    const k = `${f.kind}:${f.summary.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Preference summaries only — safe to pass to LLM as chat preferences. */
export function preferenceSummariesForLlm(facts: PersonalFact[]): string[] {
  return facts.filter((f) => f.kind === "preference").map((f) => f.summary);
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

function summarizeRoleClaim(text: string): string {
  const t = normalizeChatText(text);
  const lower = t.toLowerCase();

  const roleIsWho = lower.match(
    new RegExp(
      `\\b((?:the\\s+)?(?:new\\s+)?(?:${ROLE_NOUN}))\\s+is\\s+([a-z][a-z'-]{1,40})\\b`,
      "i",
    ),
  );
  if (roleIsWho) {
    const role = roleIsWho[1].replace(/\bthe\s+/i, "").replace(/\s+/g, " ").trim();
    const who = roleIsWho[2];
    return `${role.replace(/\b\w/g, (c) => c.toUpperCase())}: ${who.replace(/\b\w/g, (c) => c.toUpperCase())}`;
  }

  const whoIsRole = lower.match(
    new RegExp(
      `\\b([a-z][a-z'-]{1,40})\\s+is\\s+(?:(?:the|our|now)\\s+)*(?:new\\s+)?((?:${ROLE_NOUN}))\\b`,
      "i",
    ),
  );
  if (whoIsRole) {
    const who = whoIsRole[1];
    const role = whoIsRole[2].replace(/\s+/g, " ").trim();
    return `${role.replace(/\b\w/g, (c) => c.toUpperCase())}: ${who.replace(/\b\w/g, (c) => c.toUpperCase())}`;
  }

  const inCharge = lower.match(
    /\b([a-z][a-z'-]{1,40})\s+is\s+(?:now\s+)?in\s+charge(?:\s+of\s+(.+?))?(?:\s+remember|\s*$)/i,
  );
  if (inCharge) {
    const who = inCharge[1].replace(/\b\w/g, (c) => c.toUpperCase());
    const ofWhat = (inCharge[2] || "this area").trim();
    return `In charge of ${ofWhat}: ${who}`;
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

/** Sync ack for tier-3 role/authority claims — heard, not confirmed. */
export function acknowledgeRoleAuthorityClaim(text: string): string {
  const summary = summarizeRoleClaim(text);
  return [
    `Got it — I heard you say **${summary}**.`,
    "",
    "I’m treating that as **unconfirmed** until an admin or approved source verifies it. I will **not** treat it as the official org directory.",
    "If you need the real holder of that role, **check with admin** (or HR / an approved org chart) before acting.",
  ].join("\n");
}

/** Sync recall when staff asks what they said earlier and we have personal facts. */
export function answerPersonalFactRecall(
  question: string,
  facts: PersonalFact[],
): string | null {
  if (!facts.length) return null;
  const q = normalizeChatText(question).toLowerCase();

  const roleFacts = facts.filter((f) => f.kind === "role_unconfirmed");
  const prefFacts = facts.filter((f) => f.kind === "preference");

  const asksRole =
    /\b(clinical|billing|compliance|hr|marketing)?\s*(lead|manager|director|supervisor|head|in\s+charge)\b/.test(
      q,
    ) || /\bwho\s+is\s+(?:the\s+)?(?:new\s+)?/.test(q);

  if (roleFacts.length && asksRole) {
    const ranked = rankFacts(roleFacts, q);
    const best = ranked[0];
    return [
      `You told me in this chat: **${best.summary}**.`,
      "",
      "I **don’t have this confirmed** from an approved source — treat it as what **you** said here, not the official directory.",
      "**Check with admin** before acting on it.",
    ].join("\n");
  }

  if (!prefFacts.length) {
    if (roleFacts.length && isAskingAboutPriorPersonalFact(question)) {
      const best = roleFacts[roleFacts.length - 1];
      return [
        `You told me in this chat: **${best.summary}**.`,
        "",
        "That’s **unconfirmed** chat context only — **check with admin** before treating it as fact.",
      ].join("\n");
    }
    return null;
  }

  const whoIs = q.match(/^who\s+is\s+([a-z][a-z'-]{1,40})\??$/i);
  if (whoIs) {
    const name = whoIs[1].toLowerCase();
    const hit = prefFacts.find(
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
  const best = rankFacts(prefFacts, q)[0];
  return [
    `You told me earlier (your preference in this chat): **${best.summary}**.`,
    "",
    "Again — that’s what **you** stated here, not an approved company policy change.",
  ].join("\n");
}

function rankFacts(facts: PersonalFact[], q: string): PersonalFact[] {
  return [...facts].sort((a, b) => {
    const score = (f: PersonalFact) => {
      let n = 0;
      if (/refund/i.test(q) && /refund/i.test(f.raw)) n += 3;
      if (/clinical/i.test(q) && /clinical/i.test(f.raw)) n += 3;
      if (/billing/i.test(q) && /billing/i.test(f.raw)) n += 3;
      if (/contact|escalat|handles|who|lead|manager/i.test(q)) n += 1;
      return n;
    };
    return score(b) - score(a);
  });
}

/**
 * When staff questions certainty after a tier-3 claim (or any prior chat claim).
 * Prefer this over the generic “right staff guide” fallback.
 */
export function answerMetaCertaintyAboutPriorClaim(
  question: string,
  facts: PersonalFact[],
): string | null {
  if (!isMetaCertaintyAboutPriorClaim(question)) return null;
  const roleFacts = facts.filter((f) => f.kind === "role_unconfirmed");
  if (roleFacts.length) {
    const best = roleFacts[roleFacts.length - 1];
    return [
      "You’re right to push on that.",
      "",
      `I only have what **you** typed earlier (**${best.summary}**). That is **unconfirmed** — not an approved org-chart or admin verification.`,
      "I should **not** state it as settled fact. **Confirm with admin** (or an approved source) before acting.",
    ].join("\n");
  }
  const prefFacts = facts.filter((f) => f.kind === "preference");
  if (prefFacts.length) {
    const best = prefFacts[prefFacts.length - 1];
    return [
      "For what you told me in this chat (**" + best.summary + "**): that’s your **stated preference** here, not company policy.",
      "I’m sure about what you said in-thread; I’m **not** asserting it as an official directory or SOP change.",
    ].join("\n");
  }
  return [
    "I shouldn’t treat staff chat claims as confirmed org facts without an approved source.",
    "If this is about who holds a role, **confirm with admin** before acting — I won’t invent a directory answer.",
  ].join("\n");
}
