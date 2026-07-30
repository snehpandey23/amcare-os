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

export function isVagueUserMessage(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  if (t.length <= 2) return true;
  const tokens = tokenizeForSearch(t);
  if (tokens.length === 0 && t.length < 20) return true;
  if (tokens.length === 1 && VAGUE_ONLY.has(tokens[0])) return true;
  if (tokens.length <= 2 && t.length < 12) return true;
  return false;
}

export function clarifyVagueMessage(): string {
  return [
    "Happy to help — what are you trying to get done?",
    "",
    "For example: reimbursement, a marketing post, patient pricing, or who to escalate to.",
    "You can also tap a suggestion below the chat box.",
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
    /instagram|linkedin|social|carousel|caption|\bpost\b/i.test(userMessage);

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
      "• **$149** — initial physician evaluation",
      "• **$79/mo** — non-controlled follow-up",
      "• **$149/mo** — controlled-substance follow-up",
      "",
      "Internal drafts may still disagree on $79 discovery vs $149 — escalate to **Billing lead** or **CEO** before patient-facing changes.",
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
    return [
      "I searched our **approved internal guides** and didn't find a matching topic yet.",
      "",
      "Try a fuller phrase (e.g. \"portal chat SLA\", \"late cancel refund\", \"Meet and Greet homepage\").",
      "",
      "Use **Notify owner** if this should become a published policy.",
    ].join("\n");
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
      "We don't have a full approved guide for this yet. Use **Notify owner** to email **bot@siya.health**, or **Copy escalation summary** for Slack.",
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
