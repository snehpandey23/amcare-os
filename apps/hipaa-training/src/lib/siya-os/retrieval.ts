import { MODULES } from "@/content/modules";
import { WORKSPACE_KB, type WorkspaceKbEntry } from "@/content/workspace-kb";

export interface RetrievedChunk {
  id: string;
  title: string;
  snippet: string;
  score: number;
  links?: { label: string; href: string }[];
  escalate?: string;
}

const STOP = new Set(
  "a an the and or but if is are to of in on at for with from you your our how what where when why can do does".split(" "),
);

/** Exported for compose-answer */
export function tokenizeForSearch(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-$]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

const QUERY_EXPANSIONS: Record<string, string[]> = {
  price: ["pricing", "$149", "$79", "evaluation", "follow-up", "membership", "adhd"],
  pricing: ["$149", "$79", "evaluation", "patient-pricing-public-canonical"],
  adhd: ["evaluation", "pricing", "telehealth", "care"],
  reimburse: ["expense", "accounts", "billing", "invoice"],
  reimbursement: ["expense", "accounts", "billing"],
  refund: ["billing", "late cancel", "cancellation"],
  cancel: ["late cancel", "cancellation", "no-show", "billing"],
  spruce: ["chat", "portal", "patient communication"],
  chat: ["portal", "sla", "response", "clinical"],
  hipaa: ["privacy", "phi", "breach", "training"],
  marketing: ["content", "compliance", "ads", "claims", "social"],
  social: ["marketing", "content", "instagram", "compliance"],
  brand: ["voice", "entities", "editorial"],
  escalate: ["escalation", "pathways", "supervisor"],
  memory: ["workdrive", "knowledge base", "siyaos", "company"],
  sop: ["policy", "workflow", "operations"],
  meet: ["greet", "homepage", "cta", "booking"],
  greet: ["meet", "homepage", "cta"],
};

function expandQuery(raw: string): string[] {
  const base = tokenizeForSearch(raw);
  const extra: string[] = [];
  const lower = raw.toLowerCase();
  for (const t of base) {
    const add = QUERY_EXPANSIONS[t];
    if (add) extra.push(...add);
  }
  if (/meet\s*&?\s*greet/i.test(lower)) extra.push("homepage", "cta", "meet and greet");
  if (/24\s*\/\s*7|24 hour|twenty four/i.test(lower)) extra.push("chat", "sla", "concierge");
  return [...new Set([...base, ...extra])];
}

function scoreTokens(queryTokens: string[], text: string, title: string, id: string) {
  const lower = text.toLowerCase();
  const titleLower = title.toLowerCase();
  let s = 0;
  for (const t of queryTokens) {
    if (titleLower.includes(t)) s += 4;
    if (id.includes(t.replace(/\s/g, "-"))) s += 3;
    if (lower.includes(t)) s += 1;
    if (t.length >= 4 && lower.includes(t.slice(0, Math.max(3, t.length - 1)))) s += 0.5;
  }
  return s;
}

function fromKb(e: WorkspaceKbEntry, s: number): RetrievedChunk {
  return { id: e.id, title: e.title, snippet: e.body, score: s, links: e.links, escalate: e.escalate };
}

export function retrieveWorkspaceKnowledge(query: string, limit = 6): RetrievedChunk[] {
  const qt = expandQuery(query);
  if (!qt.length) {
    const fallback = query.toLowerCase().trim();
    if (fallback.length >= 3) qt.push(fallback);
  }
  if (!qt.length) return [];

  const out: RetrievedChunk[] = [];
  const qLower = query.toLowerCase();

  const TOPIC_INTENT_BOOST: { pattern: RegExp; id: string; boost: number }[] = [
    { pattern: /pricing|price|\$149|\$79|evaluation cost|membership|how much/, id: "patient-pricing-public-canonical", boost: 20 },
    { pattern: /meet.*greet|homepage cta|book free/, id: "homepage-cta-meet-and-greet", boost: 18 },
    { pattern: /late cancel|refund|cancellation|no-show/, id: "billing-late-cancel", boost: 16 },
    { pattern: /portal chat|response time|sla|24 hour/, id: "chat-review-sla", boost: 16 },
    { pattern: /third party|family member|authorization/, id: "third-party-caller", boost: 16 },
    { pattern: /workdrive|company memory|where.*sop|knowledge base/, id: "company-memory-workdrive-index", boost: 14 },
    { pattern: /marketing.*claim|fda|ftc|testimonial|ads compliance/, id: "medical-compliance-marketing", boost: 14 },
    { pattern: /escalat|who do i call|supervisor/, id: "escalation-pathways", boost: 12 },
  ];

  for (const e of WORKSPACE_KB) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body}`;
    let s = scoreTokens(qt, corpus, e.title, e.id);
    for (const k of e.keywords) {
      const kl = k.toLowerCase();
      if (qLower.includes(kl) || kl.split(/\s+/).some((w) => qLower.includes(w) && w.length > 3)) {
        s += 5;
      }
    }
    for (const intent of TOPIC_INTENT_BOOST) {
      if (e.id === intent.id && intent.pattern.test(qLower)) s += intent.boost;
    }
    if (s > 0) out.push(fromKb(e, s));
  }

  for (const m of MODULES) {
    const corpus = `${m.title} ${m.summary} ${m.keyConcepts.join(" ")}`;
    const s = scoreTokens(qt, corpus, m.title, m.id) * 0.9;
    if (s >= 2) {
      out.push({
        id: `mod-${m.id}`,
        title: m.title,
        snippet: m.summary,
        score: s,
        links: [{ label: `Module: ${m.shortTitle}`, href: `/module/${m.id}` }],
      });
    }
  }

  out.sort((a, b) => b.score - a.score);
  const top = out.slice(0, limit);
  if (!top.length) return [];
  const best = top[0].score;
  if (best >= 2) return top;
  if (best >= 1 && top.length >= 1) return top;
  return [];
}

/** Weak matches for "did you mean" when nothing clears the bar */
export function retrieveWorkspaceNearMisses(query: string, limit = 3): RetrievedChunk[] {
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const out: RetrievedChunk[] = [];
  for (const e of WORKSPACE_KB) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body}`;
    const s = scoreTokens(qt, corpus, e.title, e.id);
    if (s > 0) out.push(fromKb(e, s));
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}
