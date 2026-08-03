import { MODULES } from "@/content/modules";
import { WORKSPACE_KB, type WorkspaceKbEntry } from "@/content/workspace-kb";
import { SIYA_LAWS_SEEDS, SIYA_WAY_SEEDS } from "@/content/siya-layer-seeds";
import { wantsInternalMetaQuery } from "./staff-voice";

export type KnowledgeLayerId = 0 | 1 | 2 | 3;

export interface RetrievedChunk {
  id: string;
  title: string;
  snippet: string;
  score: number;
  links?: { label: string; href: string }[];
  escalate?: string;
  /** 0 Way · 1 Laws · 2 Knowledge · 3 Memory */
  layer?: KnowledgeLayerId;
  layerLabel?: string;
}

export const LAYER_LABEL: Record<KnowledgeLayerId, string> = {
  0: "The Siya Way",
  1: "Policies & requirements",
  2: "Knowledge",
  3: "Memory",
};

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

const META_TOPIC_IDS = new Set([
  "company-memory-workdrive-index",
  "internal-assistant-guardrails",
  "siya-helpdesk-assistant-persona",
  "amcare-os-overview",
  "legacy-pricing-funnel-unresolved",
]);

/** Topics never shown to staff unless they ask where policies live / WorkDrive */
export function filterStaffFacingChunks<T extends { id: string }>(chunks: T[], query: string): T[] {
  if (wantsInternalMetaQuery(query)) return chunks;
  const filtered = chunks.filter((c) => !META_TOPIC_IDS.has(c.id));
  return filtered.length ? filtered : chunks.slice(0, 1);
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
  phi: ["screenshot", "patient", "identifier", "upload", "chat", "ask"],
  screenshot: ["phi", "patient", "upload", "photo", "image", "chart"],
  upload: ["screenshot", "phi", "patient", "image"],
  leave: ["pto", "vacation", "time off", "hr"],
  pto: ["leave", "vacation", "time off", "hr"],
  marketing: ["content", "compliance", "ads", "claims", "social", "marketing plan", "editorial", "approval"],
  plan: ["marketing", "content", "editorial", "campaign"],
  today: ["marketing", "content", "daily"],
  social: ["marketing", "content", "instagram", "compliance"],
  brand: ["voice", "entities", "editorial"],
  escalate: ["escalation", "pathways", "supervisor"],
  memory: ["workdrive", "knowledge base", "siyaos", "company"],
  sop: ["policy", "workflow", "operations"],
  meet: ["greet", "homepage", "cta", "booking"],
  greet: ["meet", "homepage", "cta"],
  password: ["security", "mfa", "account"],
  phishing: ["security", "account"],
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
  if (/patient\s+(screenshot|photo|image|chart)|upload.*(screenshot|phi|patient)/i.test(lower)) {
    extra.push("phi", "screenshot", "upload", "patient");
  }
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

function keywordBoost(qLower: string, keywords: string[]): number {
  let s = 0;
  for (const k of keywords) {
    const kl = k.toLowerCase();
    if (qLower.includes(kl) || kl.split(/\s+/).some((w) => qLower.includes(w) && w.length > 3)) {
      s += 5;
    }
  }
  return s;
}

function withLayer(chunk: RetrievedChunk, layer: KnowledgeLayerId): RetrievedChunk {
  return { ...chunk, layer, layerLabel: LAYER_LABEL[layer] };
}

function fromKb(e: WorkspaceKbEntry, s: number): RetrievedChunk {
  return withLayer(
    { id: e.id, title: e.title, snippet: e.body, score: s, links: e.links, escalate: e.escalate },
    2,
  );
}

/** Memory only when the question is explicitly historical / reconstructive. */
export function isHistoricalMemoryQuery(query: string): boolean {
  return /when did we|who decided|what did we (try|ship|do|learn)|last (week|month|quarter)|week in review|in (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+202\d|what happened (last|in)|remember when|from memory/i.test(
    query,
  );
}

export function retrieveSiyaWay(query: string, limit = 4): RetrievedChunk[] {
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const qLower = query.toLowerCase();
  const out: RetrievedChunk[] = [];
  for (const e of SIYA_WAY_SEEDS) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body}`;
    let s = scoreTokens(qt, corpus, e.title, e.slug) + keywordBoost(qLower, e.keywords);
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: e.id,
            title: e.title,
            snippet: e.body,
            score: s * 1.35,
            links: [{ label: "The Siya Way", href: "/memory" }],
          },
          0,
        ),
      );
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

export function retrieveLaws(query: string, limit = 4): RetrievedChunk[] {
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const qLower = query.toLowerCase();
  const out: RetrievedChunk[] = [];
  for (const e of SIYA_LAWS_SEEDS) {
    const corpus = `${e.title} ${e.summary} ${e.keywords.join(" ")} ${e.body}`;
    let s = scoreTokens(qt, corpus, e.title, e.slug) + keywordBoost(qLower, e.keywords);
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: e.id,
            title: e.title,
            snippet: `${e.summary}\n\n${e.body}`.slice(0, 2800),
            score: s * 1.55,
            escalate: e.escalate,
            links: [{ label: "Policies & requirements", href: "/memory" }],
          },
          1,
        ),
      );
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
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
    { pattern: /marketing plan|plan for today|what.*post|content today|marketing today|campaign today|social today/, id: "marketing-staff-daily-help", boost: 28 },
    { pattern: /marketing|content plan|social|editorial|caption|instagram|ads\b/, id: "content-qa-checklist", boost: 18 },
    { pattern: /marketing|social|ad copy|claim|testimonial|compliance/, id: "medical-compliance-marketing", boost: 16 },
    { pattern: /brand|voice|positioning|how we describe/, id: "brand-entities-voice", boost: 14 },
    { pattern: /pricing|price|\$149|\$79|evaluation cost|membership|how much/, id: "patient-pricing-public-canonical", boost: 20 },
    { pattern: /meet.*greet|homepage cta|book free/, id: "homepage-cta-meet-and-greet", boost: 18 },
    { pattern: /late cancel|refund|cancellation|no-show/, id: "billing-late-cancel", boost: 16 },
    { pattern: /portal chat|response time|sla|24 hour/, id: "chat-review-sla", boost: 16 },
    { pattern: /third party|family member|authorization/, id: "third-party-caller", boost: 16 },
    { pattern: /workdrive|company memory|where.*sop|knowledge base/, id: "company-memory-workdrive-index", boost: 14 },
    { pattern: /marketing.*claim|fda|ftc|testimonial|ads compliance/, id: "medical-compliance-marketing", boost: 14 },
    { pattern: /escalat|who do i call|supervisor/, id: "escalation-pathways", boost: 12 },
    { pattern: /hipaa|breach|phi|privacy/, id: "hipaa-breach", boost: 12 },
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
    if (META_TOPIC_IDS.has(e.id) && !wantsInternalMetaQuery(qLower)) s *= 0.12;
    if (s > 0) out.push(fromKb(e, s));
  }

  const trainingQuery = /training|hipaa|certification|module|ce\b|ba\b/i.test(qLower);
  if (trainingQuery) {
    for (const m of MODULES) {
      const corpus = `${m.title} ${m.summary} ${m.keyConcepts.join(" ")}`;
      const s = scoreTokens(qt, corpus, m.title, m.id) * 0.9;
      if (s >= 2) {
        out.push(
          withLayer(
            {
              id: `mod-${m.id}`,
              title: m.title,
              snippet: m.summary,
              score: s,
              links: [{ label: `Module: ${m.shortTitle}`, href: `/module/${m.id}` }],
            },
            2,
          ),
        );
      }
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

export type DynamicSopEntry = {
  id: string;
  title: string;
  body: string;
  keywords: string[];
  department: string;
};

export type MemorySearchHit = {
  id: string;
  title: string;
  body: string;
  department?: string | null;
};

/** Layer 2 SOPs from Postgres — merged into Ask retrieval (includes pending / needs-review tags in title). */
export function retrieveDynamicSops(query: string, entries: DynamicSopEntry[], limit = 6): RetrievedChunk[] {
  const qt = expandQuery(query);
  if (!qt.length || !entries.length) return [];
  const qLower = query.toLowerCase();
  const out: RetrievedChunk[] = [];
  for (const e of entries) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body} ${e.department} sop`;
    let s = scoreTokens(qt, corpus, e.title, e.id);
    for (const k of e.keywords) {
      const kl = k.toLowerCase();
      if (qLower.includes(kl)) s += 4;
    }
    if (e.title.includes("[Pending Review]")) s += 0.5;
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: `sop-db-${e.id}`,
            title: e.title,
            snippet: e.body.slice(0, 2400),
            score: s,
            links: [{ label: `SOP · ${e.department}`, href: "/memory/knowledge/sops" }],
          },
          2,
        ),
      );
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

export function retrieveMemoryHits(query: string, entries: MemorySearchHit[], limit = 3): RetrievedChunk[] {
  if (!isHistoricalMemoryQuery(query) || !entries.length) return [];
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const out: RetrievedChunk[] = [];
  for (const e of entries) {
    const corpus = `${e.title} ${e.body} ${e.department ?? ""}`;
    const s = scoreTokens(qt, corpus, e.title, e.id) * 0.65;
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: `mem-${e.id}`,
            title: e.title,
            snippet: e.body.slice(0, 1200),
            score: s,
            links: [{ label: "Memory", href: "/memory" }],
          },
          3,
        ),
      );
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

/**
 * Default Ask order: Way → Laws → Knowledge → Memory (Memory only for historical questions).
 * Scores already include layer boosts; we still prefer lower layer when scores are close.
 */
export function retrieveLayeredKnowledge(
  query: string,
  opts?: {
    sops?: DynamicSopEntry[];
    memories?: MemorySearchHit[];
    limit?: number;
  },
): RetrievedChunk[] {
  const limit = opts?.limit ?? 6;
  const way = retrieveSiyaWay(query, 3);
  const laws = retrieveLaws(query, 3);
  let knowledge = retrieveWorkspaceKnowledge(query, 6);
  if (opts?.sops?.length) {
    knowledge = mergeRetrievalChunks(knowledge, retrieveDynamicSops(query, opts.sops, 4), 8);
  }
  const memory = retrieveMemoryHits(query, opts?.memories ?? [], 2);

  const merged = [...way, ...laws, ...knowledge, ...memory];
  merged.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.75) return b.score - a.score;
    const la = a.layer ?? 2;
    const lb = b.layer ?? 2;
    if (la !== lb) return la - lb;
    return b.score - a.score;
  });

  // Dedupe by id
  const seen = new Set<string>();
  const out: RetrievedChunk[] = [];
  for (const c of merged) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

export function mergeRetrievalChunks(staticChunks: RetrievedChunk[], dynamic: RetrievedChunk[], limit = 6): RetrievedChunk[] {
  const merged = [...staticChunks, ...dynamic];
  merged.sort((a, b) => b.score - a.score);
  return merged.slice(0, limit);
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
  // Prefer laws/way near-misses too
  out.push(...retrieveLaws(query, 2), ...retrieveSiyaWay(query, 1));
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}
