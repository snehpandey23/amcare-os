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
  "(?:admin(?:istrative)?(?:\\s+lead)?|administrator)|" +
  "(?:lead|manager|director|supervisor|head|owner|vp|chief|" +
  "program\\s+manager|team\\s+lead|dept(?:artment)?\\s+lead)";

/** Shorthand: "priya is clinical", "preeti is admin" */
const ROLE_SHORTHAND = "(?:clinical|billing|admin(?:istrative)?|compliance|hr|marketing)";

function normalizeRoleTypos(t: string): string {
  return t.replace(/\bclincal\b/g, "clinical");
}

/** Questions about roles — recall path only. Never match statements like "Priya is clinical lead". */
function isRoleAuthorityQuestion(t: string): boolean {
  const s = t.trim();
  if (/^(who|what|which)\b/.test(s)) return true;
  if (/\bwho\s+(is|are|was|were|'s)\b/.test(s)) return true;
  if (/\?/.test(s) && /\b(lead|manager|director|admin|in\s+charge)\b/.test(s)) return true;
  if (/^(is|are)\s+(?:the\s+)?(?:new\s+)?/.test(s) && /\b(lead|manager|director|admin)\b/.test(s)) {
    return true;
  }
  return false;
}

/**
 * Tier 3 — WHO holds a role/title/authority (not a personal routing preference).
 * Must not be silently accepted or restated as confirmed directory fact.
 */
export function isRoleAuthorityAssertion(text: string): boolean {
  const t = normalizeRoleTypos(normalizeChatText(text).toLowerCase());
  if (!t) return false;
  if (isCompanyPolicyAssertion(t)) return false;
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

  // "clinical lead is priya"
  if (new RegExp(`\\b(?:the\\s+)?(?:new\\s+)?(?:${ROLE_NOUN})\\s+is\\s+[a-z][a-z'-]{1,40}\\b`).test(t)) {
    return true;
  }

  // "priya is (the) clinical lead"
  if (
    new RegExp(
      `\\b(?!who|what|which|where|when|how|she|he|they)[a-z][a-z'-]{1,40}\\s+is\\s+(?:(?:the|our|now)\\s+)*(?:new\\s+)?(?:${ROLE_NOUN})\\b`,
    ).test(t)
  ) {
    return true;
  }

  // Shorthand / multi: "priya is clinical and preeti is admin"
  if (
    new RegExp(
      `\\b(?!who|what|which|she|he|they)[a-z][a-z'-]{1,40}\\s+is\\s+(?:the\\s+)?(?:${ROLE_SHORTHAND})\\b`,
    ).test(t)
  ) {
    return true;
  }

  // Pronoun form (engine expands she/he via history before ack)
  if (
    new RegExp(
      `\\b(she|he)\\s+is\\s+(?:(?:the|our|now)\\s+)*(?:new\\s+)?(?:${ROLE_NOUN}|${ROLE_SHORTHAND})\\b`,
    ).test(t)
  ) {
    return true;
  }

  if (
    /\b(?!who|what|which)[a-z][a-z'-]{1,40}\s+is\s+(?:now\s+)?in\s+charge(?:\s+of\b)?/.test(t)
  ) {
    return true;
  }

  if (/\bis\s+(?:the\s+)?(?:new\s+)?(?:manager|director|head|lead)\s+of\b/.test(t)) {
    return true;
  }

  return false;
}

/**
 * Expand "she/he is clinical lead" using the last named person in recent user turns
 * (e.g. after "who is priya").
 */
export function expandRoleClaimWithHistory(
  text: string,
  history: { role: string; content: string }[],
): string {
  const t = normalizeRoleTypos(normalizeChatText(text));
  if (!/\b(she|he)\s+is\b/i.test(t)) return t;

  let lastName: string | null = null;
  for (const h of [...history].reverse()) {
    if (h.role !== "user") continue;
    const c = normalizeChatText(h.content);
    const whoIs = c.match(/\bwho\s+is\s+([A-Za-z][A-Za-z'-]{1,40})\b/i);
    if (whoIs) {
      lastName = whoIs[1];
      break;
    }
  }
  if (!lastName) return t;
  return t.replace(/\b(she|he)\b/i, lastName);
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
  const users = history.filter((h) => h.role === "user");
  for (let i = 0; i < users.length; i++) {
    const prior = users.slice(0, i).map((u) => ({ role: "user" as const, content: u.content }));
    const content = expandRoleClaimWithHistory(normalizeChatText(users[i].content), prior);
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
  const t = normalizeRoleTypos(normalizeChatText(text));
  const lower = t.toLowerCase();
  const parts: string[] = [];

  const pairRe = new RegExp(
    `\\b([a-z][a-z'-]{1,40})\\s+is\\s+(?:(?:the|our|now)\\s+)*(?:new\\s+)?((?:${ROLE_NOUN})|(?:${ROLE_SHORTHAND}))\\b`,
    "gi",
  );
  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(lower)) !== null) {
    if (/^(who|what|which|she|he|they)$/i.test(m[1])) continue;
    let role = m[2].replace(/\s+/g, " ").trim();
    if (/^(clinical|billing|admin|administrative|compliance|hr|marketing)$/i.test(role)) {
      role = /admin/i.test(role) ? "Admin" : `${role} lead`;
    }
    const who = m[1].replace(/\b\w/g, (c) => c.toUpperCase());
    const roleLabel = role.replace(/\b\w/g, (c) => c.toUpperCase());
    parts.push(`${roleLabel}: ${who}`);
  }

  if (!parts.length) {
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
  }

  if (parts.length) return parts.join("; ");

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
    const roleHit = roleFacts.find(
      (f) => f.summary.toLowerCase().includes(name) || f.raw.toLowerCase().includes(name),
    );
    if (roleHit) {
      return [
        `You told me in this chat: **${roleHit.summary}**.`,
        "",
        "That’s **unconfirmed** — not an approved directory entry. **Check with admin** before acting.",
      ].join("\n");
    }
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

/** Bare "who is Name" with no prior chat fact — don't dump SOPs. */
export function answerUnknownPersonAsk(text: string): string | null {
  const t = normalizeChatText(text);
  if (!/^who\s+is\s+[A-Za-z][A-Za-z'-]{1,40}\??$/i.test(t)) return null;
  const name = t.match(/^who\s+is\s+([A-Za-z][A-Za-z'-]{1,40})/i)?.[1];
  if (!name) return null;
  return [
    `I don’t have an **approved staff directory** entry for **${name}** in this chat.`,
    "",
    "If you’re teaching a role for this thread only, say e.g. “clinical lead is Priya — remember it” — I’ll treat that as **unconfirmed** until admin verifies.",
    "I won’t invent org-chart answers.",
  ].join("\n");
}

/**
 * Staff challenging a wrong "Loop in" / escalate suggestion (e.g. Privacy Officer on billing),
 * or asking why not use a name they stated earlier (Preeti).
 */
export function answerEscalateChallenge(
  text: string,
  history: { role: string; content: string }[],
  facts: PersonalFact[],
): string | null {
  const t = normalizeChatText(text).toLowerCase();
  if (!t) return null;

  const challengesEscalate =
    /\bwhy\b/.test(t) &&
    /\b(loop|privacy\s+officer|escalat|billing\s+lead|preeti|priya)\b/.test(t);
  const noBreachPushback =
    /\b(no\s+breach|not\s+a\s+breach|what\s+are\s+you\s+sayin|that'?s\s+wrong|wrong\s+escalat)\b/.test(
      t,
    );

  if (!challengesEscalate && !noBreachPushback) return null;

  const lastAssistant = [...history].reverse().find((h) => h.role === "assistant");
  const priorHadPrivacy =
    lastAssistant && /privacy\s+officer|breach|phi\b/i.test(lastAssistant.content);
  const priorHadBilling =
    lastAssistant && /billing|klarity|refund|chargeback|no-?show/i.test(lastAssistant.content);

  const roleFacts = facts.filter((f) => f.kind === "role_unconfirmed");
  const preetiClaim = roleFacts.find((f) => /preeti/i.test(f.summary) || /preeti/i.test(f.raw));

  if (noBreachPushback || (challengesEscalate && priorHadPrivacy)) {
    const lines = [
      "You’re right to push back — a **billing** question is not a privacy breach.",
      "",
      "Approved billing guides escalate to the **Billing lead**, not the Privacy Officer.",
      "I should not have pulled a PHI/breach topic just because “loop in” or “privacy” appeared in the thread.",
    ];
    if (preetiClaim) {
      lines.push(
        "",
        `You also said in this chat (**${preetiClaim.summary}**) — that’s **unconfirmed** chat context, not a substitute for the Billing lead in the approved SOP.`,
      );
    }
    lines.push("", "For patient billing / Klarity refunds / chargebacks: escalate **Billing lead**.");
    return lines.join("\n");
  }

  if (challengesEscalate) {
    const lines = [
      "Fair question on the escalate target.",
      "",
      priorHadBilling
        ? "For **patient billing** (refunds, Klarity cancel, chargebacks), approved guides say **Billing lead** — not Privacy Officer."
        : "I only escalate from **approved guides** (or your unconfirmed chat notes, labeled as such).",
    ];
    if (preetiClaim) {
      lines.push(
        "",
        `**${preetiClaim.summary}** is what **you** said here — **unconfirmed**. Don’t treat it as the official directory; still use **Billing lead** for billing SOPs until admin confirms roles.`,
      );
    }
    return lines.join("\n");
  }

  return null;
}
