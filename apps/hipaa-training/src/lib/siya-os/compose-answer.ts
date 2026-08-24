/**
 * Deterministic answers when LLM is off — direct, staff-facing prose (not KB dump).
 */
import type { RetrievedChunk } from "./retrieval";
import { tokenizeForSearch } from "./retrieval";
import { sanitizeStaffText, staffTopicLabel } from "./staff-voice";

const VAGUE_ONLY = new Set([
  "human",
  "hi",
  "hey",
  "hello",
  "help",
  "test",
  "thanks",
  "ok",
  "okay",
  "yes",
  "no",
]);

const CONFUSED_FOLLOW_UP =
  /^(what(\s+the\s+heck|\s+the\s+fuck|\s+are\s+you|\s+r\s+u|\s+do\s+you\s+mean)\b|huh+\??|wtf\??|idk|this (doesn'?t|dont) make sense|that (doesn'?t|dont) (help|make sense)|speak english)\b/i;

export function isVagueUserMessage(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  if (t.length <= 2) return true;
  if (CONFUSED_FOLLOW_UP.test(t) && t.length < 80) return true;
  const tokens = tokenizeForSearch(t);
  if (tokens.length === 0 && t.length < 20) return true;
  if (tokens.length === 1 && VAGUE_ONLY.has(tokens[0])) return true;
  if (tokens.length <= 2 && t.length < 12) return true;
  return false;
}

/** Frustrated / confused reply about the previous Assist answer — do not re-run retrieval. */
export function isConfusedAboutPriorAnswer(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (CONFUSED_FOLLOW_UP.test(t) && t.length < 100) return true;
  if (
    /^(what (the heck|are you saying|r u saying|does that mean)|i don'?t understand|that'?s not (what i|helpful)|stop)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  // Frustration about Assist itself (not a SOP lookup)
  if (t.length < 120) {
    if (/\bthis\s+(isn'?t|is\s+not|aint)\s+working\b/i.test(t)) return true;
    if (/\b(you|u)\s+(are|r|ain'?t)\s+not\s+(helping|assisting)\b/i.test(t)) return true;
    if (/\b(you|u)\s+(are|r)\s+not\s+(helping|assisting)\b/i.test(t)) return true;
    if (/\bnot\s+assisting\s+me\b/i.test(t) && !/\bmy\s+name\s+is\b/i.test(t)) return true;
  }
  return false;
}

/** Prior Assist turn flagged a missing guide / gap — staff asking how to contribute input. */
const GAP_PRIOR_MARK =
  /no approved guidance|don'?t have a (full )?approved guide|Notify owner|knowledge gap|not documented in|requires input from|recommended actions/i;

export function isGapContributionFollowUp(text: string, lastAssistant?: string | null): boolean {
  const t = text.trim();
  const prior = (lastAssistant || "").trim();
  if (!t || !prior || t.length > 220) return false;
  if (!GAP_PRIOR_MARK.test(prior)) return false;
  return (
    /\b(can|could|may)\s+i\s+(give|provide|share|submit|add)\s+(some\s+)?(input|feedback|ideas?|thoughts?)\b/i.test(
      t,
    ) ||
    /\b(how|where)\s+(can|do)\s+i\s+(give|provide|share|submit)\s+(input|feedback|ideas?)\b/i.test(t) ||
    (/\b(about|on|for)\s+this\b/i.test(t) &&
      /\b(input|feedback|contribute|suggest|idea|thought|help)\b/i.test(t))
  );
}

export function answerGapContributionFollowUp(): string {
  return [
    "Yes — you can contribute input on a **missing guide**, but I can’t publish policy from chat.",
    "",
    "1. **Notify owner** (when it appears after a gap) — logs the topic for the department lead’s digest.",
    "2. **Copy escalation summary** — paste a de-identified note to Compliance / Leadership or your supervisor.",
    "3. **Drafting a new SOP?** Use **Memory → SOP builder**; submitted drafts go through review before Ask can cite them.",
    "",
    "Include what you want the guide to say, who should own it, and any compliance concerns (e.g. Gen AI use).",
  ].join("\n");
}

/** Clarifying / exception follow-up on the same topic (e.g. “what if the number is unreachable?”). */
export function isClarifyingFollowUp(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 220) return false;
  if (
    /^(what if|what about|and if|but what if|how about if|if (the|they|it|that)|suppose|in case)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/\b(not reachable|unreachable|doesn'?t (work|go through)|no answer|busy signal)\b/i.test(t)) {
    return true;
  }
  if (/\b(no|missing|wrong)\s+(phone\s+)?number\b/i.test(t) && /\b(chart|roi|provider|form)\b/i.test(t)) {
    return true;
  }
  return false;
}

const SOFT_STOP_MARK =
  /i'?m not sure i have the right staff guide|say what you'?re trying to get done in one short sentence/i;

/**
 * If the last Assist turn already covered this clarifying follow-up, return a focused restatement
 * instead of soft-stopping / auto-gap. Returns null when prior content does not cover the ask.
 */
export function answerFromPriorAssistIfCovered(
  userMessage: string,
  lastAssistant: string | null | undefined,
): string | null {
  const user = userMessage.trim();
  const prior = (lastAssistant || "").trim();
  if (!user || !prior || prior.length < 120) return null;
  if (SOFT_STOP_MARK.test(prior)) return null;
  if (!isClarifyingFollowUp(user)) return null;

  const userTokens = new Set(
    tokenizeForSearch(user).filter((t) => t.length > 2 && !VAGUE_ONLY.has(t)),
  );
  if (userTokens.size === 0) return null;

  const priorLower = prior.toLowerCase();
  // Domain synonyms so “not reachable” matches prior “unreachable”.
  const expanded = new Set(userTokens);
  if ([...userTokens].some((t) => /reach|contact|phone|number|call/.test(t))) {
    for (const syn of ["unreachable", "reachable", "contact", "phone", "number", "twice", "patient"]) {
      expanded.add(syn);
    }
  }

  let hit = 0;
  for (const t of expanded) {
    if (priorLower.includes(t)) hit += 1;
  }
  // Need real overlap with the prior answer, not just a generic “what if”.
  if (hit < 2) return null;

  const blocks = prior
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const scored = blocks
    .map((b) => {
      const bl = b.toLowerCase();
      let s = 0;
      for (const t of expanded) {
        if (bl.includes(t)) s += 1;
      }
      if (/exception|escalat|if .+unreachable|if .+not reach|attempt to contact/i.test(b)) s += 3;
      return { b, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (!scored.length || scored[0].s < 2) return null;

  const picked = scored.slice(0, 2).map((x) => x.b);
  return [
    "That case is already covered in the steps above:",
    "",
    ...picked,
    "",
    "If you’ve already tried twice and confirmed the number with the patient, escalate to the **Clinical Program Manager** with the ROI date and provider name (no patient identifiers in this chat).",
  ].join("\n");
}

export function clarifyVagueMessage(): string {
  return [
    "Happy to help — what are you trying to get done?",
    "",
    "For example: reimbursement, a marketing post, patient pricing, or who to escalate to.",
    "You can also tap a suggestion below the chat box.",
  ].join("\n");
}

export function clarifyConfusedFollowUp(): string {
  return [
    "Sorry — that last answer wasn’t useful.",
    "",
    "Tell me what you need in plain terms (e.g. “a teammate was rude — who do I talk to?” or “how do I submit a reimbursement?”).",
    "I’ll route you to the right owner instead of dumping unrelated policies.",
  ].join("\n");
}

/** When retrieval/routing is weak — plain ask-back, never a 1–5 triage menu. */
export function askClarifyingQuestion(userMessage: string): string {
  void userMessage;
  return [
    "I’m not sure I have the right staff guide for that yet.",
    "",
    "Say what you’re trying to get done in one short sentence — e.g. a reimbursement, an SOP, patient pricing, brand tokens, or who to escalate to.",
  ].join("\n");
}

/** Music / celebrity / entertainment / civics trivia — not staff help-desk work. */
export function isCasualOffTopic(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (
    /\b(led zeppelin|ac\/?\s*dc|post malone|taylor swift|beyonc[eé]|drake|spotify|apple music|lyrics|album|discography)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/\b(best|favorite|favourite)\s+songs?\b/i.test(t)) return true;
  if (/\b(best|favorite|favourite)\s+music\b/i.test(t)) return true;
  if (/\bsongs?\s+by\b/i.test(t)) return true;
  if (/^(best song ever|ac\s*dc\??|favorite music|favourite music|song)\s*$/i.test(t)) return true;
  if (/^(music|songs?)\s*\??\s*$/i.test(t)) return true;
  // Civics / general culture Q&A in Ask — refuse inventing answers.
  // (Wanting to *practice* culture routes via tryPracticeLookup before this runs.)
  if (/\bpresident of (the )?(usa|u\.?s\.?a\.?|united states|india)\b/i.test(t)) return true;
  if (/\bwho (is|was) the president\b/.test(t)) return true;
  if (/\bcurrent events\b/.test(t)) return true;
  // Immigration / visas / personal US employment paths — not staff SOP help desk
  if (/\b(h-?1b|h1[- ]?b)\b/.test(t)) return true;
  if (/\b(visa|visas|immigration|green\s+card)\b/.test(t)) return true;
  if (/\btrump\b/.test(t) && /\b(ban|visa|h-?1b|immigrat)\b/.test(t)) return true;
  if (/\bemployed\s+by\s+(the\s+)?(us|u\.?s\.?a\.?|united\s+states|american)\s+compan/.test(t)) {
    return true;
  }
  if (
    /\bmedical\s+assistant\b/.test(t) ||
    (/\bma\b/.test(t) &&
      /\b(usa|u\.?s\.?a\.?|united\s+states|in[- ]person|not\s+just\s+virtual|actual)\b/.test(t))
  ) {
    if (/\b(usa|u\.?s\.?a\.?|united\s+states|in[- ]person|not\s+just\s+virtual|actual|virtual)\b/.test(t)) {
      return true;
    }
  }
  // Bare culture curriculum claims without a practice intent word still refuse inventing in Ask
  if (
    /\b(american|us|u\.?s\.?)\s+culture\b/.test(t) &&
    !/\b(practice|drill|quiz|trivia|learn|open|improve)\b/.test(t)
  ) {
    return true;
  }
  if (/\btrain(?:ing)?\s+staff\b/.test(t) && /\b(culture|civics|current events)\b/.test(t)) return true;
  return false;
}

export function casualOffTopicReply(): string {
  return [
    "That’s outside what I can help with here — I don’t cover news, immigration/visas, entertainment, civics trivia, or personal US career paths.",
    "",
    "Ask me about **Siya Health** policies, SOPs, pricing, brand tokens, or who owns an ops question.",
  ].join("\n");
}

const CLARIFY_GENERIC = new Set([
  "patient",
  "patients",
  "care",
  "visit",
  "chat",
  "ask",
  "policy",
  "sop",
  "help",
  "staff",
  "siya",
  "health",
  "need",
  "want",
  "please",
]);

/**
 * Only answer from KB when we're actually confident.
 * Weak / ambiguous hits should clarify — not dump the nearest "patient" FAQ.
 */
export function isConfidentAssistAnswer(opts: {
  userMessage: string;
  flowId?: string;
  routingConfidence?: string;
  topScore: number;
  topChunk?: RetrievedChunk | null;
}): boolean {
  const { flowId, routingConfidence, topScore, topChunk, userMessage } = opts;
  if (!topChunk || topScore <= 0) return false;

  // Vague / underspecified asks should clarify unless we have a real task flow
  if (
    !flowId &&
    /\b(weird|something|thing|broken|issue|problem|idk|not sure|confused|help me)\b/i.test(userMessage) &&
    topScore < 40
  ) {
    return false;
  }

  // Dedicated task flows with a strong KB hit
  if (flowId && routingConfidence === "high" && topScore >= 8) return true;

  // Published Postgres SOPs — approved guides; don't require the 40+ intent-boost bar.
  if (topChunk.id.startsWith("sop-db-") && topScore >= 8) {
    const base = tokenizeForSearch(userMessage).filter((t) => t.length > 3 && !CLARIFY_GENERIC.has(t));
    if (!base.length) return topScore >= 12;
    const hay = `${topChunk.title} ${topChunk.snippet} ${topChunk.id}`.toLowerCase();
    return base.some((t) => hay.includes(t)) || topScore >= 15;
  }

  // Very strong retrieval (intent boosts + real overlap land well above this)
  if (topScore >= 40) return true;

  // Medium retrieval only if the original wording actually appears in the hit
  if (topScore >= 15) {
    const base = tokenizeForSearch(userMessage).filter((t) => t.length > 3 && !CLARIFY_GENERIC.has(t));
    if (!base.length) return topScore >= 25;
    const hay = `${topChunk.title} ${topChunk.snippet} ${topChunk.id}`.toLowerCase();
    return base.some((t) => hay.includes(t));
  }

  return false;
}

export function workplaceConcernAnswer(): string {
  return [
    "I’m sorry that happened. For **workplace / people concerns** (including a teammate or manager being rude), use this path:",
    "",
    "1. If there’s an **immediate safety** issue, contact your **supervisor** (or on-call lead) now.",
    "2. Otherwise, escalate to your **supervisor** and **People / HR** — don’t put patient identifiers in this chat.",
    "3. Share **what happened**, **when**, and **who was involved** (names of staff only — no patient PHI).",
    "",
    "I don’t have a published SOP for interpersonal complaints yet — use **Notify owner** if you want this tracked as a knowledge gap, or **Copy escalation summary** for Slack/email.",
  ].join("\n");
}

export function abusivePatientAnswer(): string {
  return [
    "For a **hostile, abusive, or threatening patient/caller** (keep names and chart details out of this chat):",
    "",
    "1. **You can end the interaction** — stay calm; you don’t have to continue abuse. Say you’re ending the call/chat and a supervisor will follow up.",
    "2. **Don’t argue, diagnose, or promise** refunds, meds, or exceptions.",
    "3. **Document in the approved clinical system** (what happened, time, channel) — not in Ask/Slack with PHI.",
    "4. **Escalate same day** to your **supervisor / clinical lead**. If there’s a **safety threat**, escalate immediately and loop leadership.",
    "5. **Billing / refund anger** → supervisor + **Billing lead** decide; don’t waive fees yourself.",
    "",
    "Use **Copy escalation summary** for a de-identified handoff, or **Notify owner** if you want a fuller published SOP.",
  ].join("\n");
}

function pickSentences(body: string, queryTokens: string[], max = 4): string[] {
  const cleaned = body
    .replace(/\*\*/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 12);
  if (!queryTokens.length) return sentences.slice(0, max);

  const scored = sentences.map((s) => {
    const lower = s.toLowerCase();
    let n = 0;
    for (const t of queryTokens) {
      if (lower.includes(t)) n += 1;
    }
    return { s, n };
  });
  scored.sort((a, b) => b.n - a.n);
  const hits = scored.filter((x) => x.n > 0).map((x) => x.s);
  return (hits.length ? hits : sentences).slice(0, max);
}

function numberedSteps(body: string): string[] {
  const steps: string[] = [];
  const flat = body.replace(/\n/g, " ");
  const re = /(?:^|\s)(\d+)\.\s+([^.\d]+?)(?=\s+\d+\.|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(flat)) && steps.length < 6) {
    steps.push(m[2].trim());
  }
  return steps;
}

function relatedChunks(userMessage: string, primary: RetrievedChunk, rest: RetrievedChunk[]): RetrievedChunk[] {
  const qt = tokenizeForSearch(userMessage);
  return rest.filter((c) => {
    if (c.score < primary.score * 0.88) return false;
    if (c.id === primary.id) return false;
    const title = c.title.toLowerCase();
    const sharesToken = qt.some((t) => t.length > 3 && (title.includes(t) || c.snippet.toLowerCase().includes(t)));
    return sharesToken || c.score >= primary.score * 0.98;
  });
}

function formatSocialPostAnswer(): string[] {
  return [
    "**Social post (Instagram / LinkedIn / etc.) — do this:**",
    "",
    "1. **Tracker first** — confirm insight ID and row on the marketing **content tracker** (no orphan posts).",
    "2. **Pre-publish QA (10 checks)** — states we serve (CA, TX, PA, FL), disclaimers, CTA links, no outcome guarantees.",
    "3. **Clinical or pricing claims** → **Medical Director** sign-off before anything goes live.",
    "4. Use captions from the editorial pack (**ALL-PLATFORMS**); company voice unless it's an approved physician profile post.",
    "",
    "Tell me the **topic** (e.g. ADHD, GLP-1) if you want a tighter checklist.",
  ];
}

function formatPrimaryAnswer(
  userMessage: string,
  primary: RetrievedChunk,
  flowId?: string,
): string[] {
  const qt = tokenizeForSearch(userMessage);
  const sentences = pickSentences(primary.snippet, qt, 5);

  const socialQuery =
    flowId === "marketing-carousel" ||
    flowId === "marketing-daily" ||
    /\b(instagram|linkedin|facebook|tiktok|social\s+media|social\s+post|carousel|caption|patient-facing\s+post)\b/i.test(
      userMessage,
    ) ||
    (/\bposts?\b/i.test(userMessage) &&
      /\b(social|instagram|linkedin|facebook|tiktok|draft|caption|publish|editorial)\b/i.test(userMessage));

  if (socialQuery && (primary.id === "content-qa-checklist" || primary.id === "marketing-staff-daily-help")) {
    return formatSocialPostAnswer();
  }

  if (primary.id === "marketing-staff-daily-help") {
    return [
      "I don't have your personal calendar, but here's how we usually run marketing day-to-day:",
      "",
      "1. **Sync with Marketing lead (CMO)** on what's on the editorial tracker today.",
      "2. **Anything patient-facing** — run the **pre-publish QA checklist** (states, disclaimers, CTAs, links) before it goes live.",
      "3. **Clinical or pricing claims** — get **Medical Director** sign-off first (marketing compliance SOP).",
      "4. **Big campaigns or ad plans** — owned by leadership/CMO; I won't invent a strategy deck for you.",
      "",
      "If you tell me whether you're drafting a post, checking compliance, or asking about brand voice, I can narrow this down.",
    ];
  }

  if (primary.id === "homepage-cta-meet-and-greet") {
    return [
      "**Short answer:** The homepage hero CTA is **Book Free Meet & Greet** — owned booking, not a third-party marketplace checkout.",
      "",
      "**Why (approved):** Lower friction and higher trust for physician-led telehealth; aligns with SIYA-STANDARDS CTA hierarchy.",
      "",
      "If someone asks about Zocdoc or alternate heroes, point them to that standards doc — don’t invent reasons.",
    ];
  }

  if (primary.id === "patient-pricing-public-canonical") {
    return [
      "**Public pricing (siya.health):**",
      "• **Free** — Meet & Greet (sole intro; no invoice; Discovery Call $79 retired)",
      "• **$149** — initial physician evaluation",
      "• **$79/mo** — non-controlled follow-up",
      "• **$149/mo** — controlled-substance follow-up",
      "",
      "Other legacy draft numbers → escalate **Billing lead** or **CEO** before patient-facing changes.",
    ];
  }

  const parts: string[] = [];
  parts.push(sentences.slice(0, 3).join(" ") || primary.snippet.slice(0, 500));
  return parts;
}

export function composeAnswerFromChunks(
  userMessage: string,
  chunks: RetrievedChunk[],
  knowledgeGap: boolean,
  flowId?: string,
): string {
  if (!chunks.length) {
    return askClarifyingQuestion(userMessage);
  }

  const primary = chunks[0];
  const parts: string[] = [...formatPrimaryAnswer(userMessage, primary, flowId)];

  const steps = numberedSteps(primary.snippet);
  if (steps.length >= 2 && primary.id !== "homepage-cta-meet-and-greet") {
    parts.push("");
    parts.push("**Steps:**");
    steps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`);
    });
  }

  const related = relatedChunks(userMessage, primary, chunks.slice(1, 4));
  if (related.length && !knowledgeGap) {
    parts.push("");
    parts.push("**Also see:** " + related.map((r) => r.title).join(" · "));
  }

  if (knowledgeGap) {
    parts.push("");
    parts.push(
      "We don't have a full approved guide for this yet. Use **Notify owner** to queue a knowledge gap for the department lead (or founder if no lead), or **Copy escalation summary** for Slack.",
    );
  }

  return appendDraftLiveHedge(parts.join("\n"), chunks);
}

export const DRAFT_LIVE_HEDGE =
  "**Note:** This guidance is from an **active draft SOP**, not finalized policy. Confirm with the department lead before treating it as required procedure.";

/** Append once when any retrieved SOP is draft-live. */
export function appendDraftLiveHedge(message: string, chunks: RetrievedChunk[]): string {
  if (!message.trim() || !chunks.some((c) => c.draftLive)) return message;
  if (/active draft/i.test(message)) return message;
  return `${message}\n\n${DRAFT_LIVE_HEDGE}`;
}

/** Final pass before anything reaches the UI */
export function polishStaffMessage(text: string): string {
  return sanitizeStaffText(text);
}

export function formatEscalationForSlack(opts: {
  question: string;
  department: string;
  task: string;
  escalateTo: string;
  sourceTitles: string[];
  followUps?: string[];
}): string {
  const lines = [
    "Siya Helpdesk — escalation summary",
    "",
    `Question: ${opts.question}`,
    `Route: ${opts.department} · ${opts.task}`,
    `Suggested owner: ${opts.escalateTo}`,
  ];
  if (opts.sourceTitles.length) {
    lines.push(`KB sources: ${opts.sourceTitles.join("; ")}`);
  }
  if (opts.followUps?.length) {
    lines.push(`Open questions: ${opts.followUps.join("; ")}`);
  }
  lines.push("", "— paste into Slack or email —");
  return lines.join("\n");
}
