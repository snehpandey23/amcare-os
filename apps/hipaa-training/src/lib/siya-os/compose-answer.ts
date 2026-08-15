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
  return /^(what (the heck|are you saying|r u saying|does that mean)|i don'?t understand|that'?s not (what i|helpful)|stop)\b/i.test(
    t,
  );
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
  // Civics / general culture — not Siya staff SOPs
  if (/\bpresident of (the )?(usa|u\.?s\.?a\.?|united states|india)\b/i.test(t)) return true;
  if (/\b(american|us|u\.?s\.?)\s+culture\b/.test(t)) return true;
  if (/\bcurrent events\b/.test(t) || /\bwho (is|was) the president\b/.test(t)) return true;
  if (/\btrain(?:ing)?\s+staff\b/.test(t) && /\b(culture|civics|current events)\b/.test(t)) return true;
  return false;
}

export function casualOffTopicReply(): string {
  return [
    "That’s outside what I can help with here — I don’t cover entertainment, civics trivia, or general culture curriculum.",
    "",
    "Ask me about policies, SOPs, pricing, brand tokens, domain signals, or who owns an ops question.",
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
      "• **Free** — Meet & Greet (non-clinical intro; Discovery Call $79 discontinued)",
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

  return parts.join("\n");
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
