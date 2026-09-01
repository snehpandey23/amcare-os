import { MODULES } from "@/content/modules";
import { WORKSPACE_KB, type WorkspaceKbEntry } from "@/content/workspace-kb";
import { SIYA_LAWS_SEEDS, SIYA_WAY_SEEDS } from "@/content/siya-layer-seeds";
import { MEMORY_DEEP_LINKS } from "@/lib/memory-deep-links";
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
  /** Tier-1 SOP published as draft-live — hedge in the answer. */
  draftLive?: boolean;
  /** Authored provisional KB stub — not signed-off policy; UI chip + disclaimer. */
  provisional?: boolean;
  /** Citation label override (e.g. HR · provisional stub). */
  sourceLabel?: string;
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
  // Decision-log / architecture meta — not staff help-desk answers
  "founder-approval-for-shared-knowledge",
  "pricing-facts-deterministic-lookup",
  "llm-gateway-billing-gate",
  "siya-guide-separate-from-staff-ask",
  "knowledge-sop-paste-and-review",
  "sop-builder-and-knowledge-sop-separate",
  "agent-org-chart-deferred",
  "chat-first-home-deferred",
  "mvp-v1-scope-locked",
  "personal-ai-coach-deferred",
]);

const META_TITLE_RE =
  /founder approval|shared company knowledge|deterministic lookup|semantic retrieval|exact-match facts|company memory without|llm gateway|gateway billing|org chart deferred|chat-first home/i;

/** Topics never shown to staff unless they ask where policies live / WorkDrive */
export function filterStaffFacingChunks<T extends { id: string; title?: string }>(
  chunks: T[],
  query: string,
): T[] {
  if (wantsInternalMetaQuery(query)) return chunks;
  return chunks.filter((c) => {
    if (META_TOPIC_IDS.has(c.id)) return false;
    if (c.id.startsWith("dec-db-") && META_TOPIC_IDS.has(c.id.replace(/^dec-db-/, ""))) return false;
    if (c.title && META_TITLE_RE.test(c.title)) return false;
    return true;
  });
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
  abusive: ["hostile", "angry", "verbally", "verbal", "threat", "patient", "interaction"],
  hostile: ["abusive", "angry", "verbally", "verbal", "threat", "patient"],
  memory: ["workdrive", "knowledge base", "siyaos", "company"],
  sop: ["policy", "workflow", "operations"],
  meet: ["greet", "homepage", "cta", "booking"],
  greet: ["meet", "homepage", "cta"],
  password: ["security", "mfa", "account"],
  phishing: ["security", "account"],
  roi: ["release", "information", "medical", "records", "provider", "fax", "chart"],
  medical: ["records", "roi", "release", "information", "provider", "chart"],
  records: ["medical", "roi", "release", "provider", "chart"],
  unreachable: ["contact", "phone", "number", "provider", "twice", "patient", "roi", "chart"],
  reachable: ["unreachable", "contact", "phone", "number", "provider", "roi"],
  chart: ["medical", "records", "roi", "provider", "number", "phone", "contact"],
};

const GENERIC_QUERY_TOKENS = new Set([
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
]);

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
  if (/\b(abusive|hostile|threatening|verbal\s+abuse)\b/i.test(lower)) {
    extra.push("escalate", "escalation", "supervisor", "angry", "hostile");
  }
  return [...new Set([...base, ...extra])];
}

function scoreTokens(
  queryTokens: string[],
  text: string,
  title: string,
  id: string,
  gateTokens?: string[],
) {
  const lower = text.toLowerCase();
  const titleLower = title.toLowerCase();
  let s = 0;
  for (const t of queryTokens) {
    if (titleLower.includes(t)) s += 4;
    if (id.includes(t.replace(/\s/g, "-"))) s += 3;
    if (lower.includes(t)) s += 1;
    if (t.length >= 4 && lower.includes(t.slice(0, Math.max(3, t.length - 1)))) s += 0.5;
  }
  // Gate on original query tokens only — expansions like abusive→escalate would
  // otherwise unlock every SOP that says "Escalate to Billing".
  const gate = gateTokens ?? queryTokens;
  const specific = gate.filter((t) => t.length > 3 && !GENERIC_QUERY_TOKENS.has(t));
  if (specific.length > 0) {
    const anySpecific = specific.some(
      (t) => titleLower.includes(t) || lower.includes(t) || id.includes(t.replace(/\s/g, "-")),
    );
    if (!anySpecific) return 0;
  }
  return s;
}

function keywordBoost(qLower: string, keywords: string[], queryTokens: string[]): number {
  const qTokens = new Set(queryTokens.map((t) => t.toLowerCase()));
  let specificHits = 0;
  let genericHits = 0;
  for (const k of keywords) {
    const kl = k.toLowerCase();
    const words = kl.split(/\s+/).filter(Boolean);
    const hit =
      words.length > 1
        ? qLower.includes(kl)
        : qTokens.has(kl) || (kl.length > 4 && [...qTokens].some((t) => t === kl));
    if (!hit) continue;
    if (words.length === 1 && GENERIC_QUERY_TOKENS.has(kl)) genericHits += 1;
    else specificHits += 1;
  }
  return specificHits * 5 + genericHits * 0.5;
}

function withLayer(chunk: RetrievedChunk, layer: KnowledgeLayerId): RetrievedChunk {
  return { ...chunk, layer, layerLabel: LAYER_LABEL[layer] };
}

function provisionalKbSourceLabel(id: string): string {
  if (id === "leave-pto-request-provisional") return "HR · provisional stub";
  if (id === "patient-manager-request-provisional") return "Clinical Ops · provisional stub";
  return "Provisional stub (not approved policy)";
}

function fromKb(e: WorkspaceKbEntry, s: number): RetrievedChunk {
  const provisional = e.answerTrust === "provisional";
  return withLayer(
    {
      id: e.id,
      title: e.title,
      snippet: e.body,
      score: s,
      links: e.links,
      escalate: e.escalate,
      provisional,
      sourceLabel: provisional ? provisionalKbSourceLabel(e.id) : undefined,
    },
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
  const base = tokenizeForSearch(query);
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const qLower = query.toLowerCase();
  const out: RetrievedChunk[] = [];
  for (const e of SIYA_WAY_SEEDS) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body}`;
    const tokenScore = scoreTokens(qt, corpus, e.title, e.slug, base);
    if (tokenScore <= 0) continue;
    let s = tokenScore + keywordBoost(qLower, e.keywords, qt);
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: e.id,
            title: e.title,
            snippet: e.body,
            score: s * 1.35,
            links: [{ label: MEMORY_DEEP_LINKS.way.label, href: MEMORY_DEEP_LINKS.way.href }],
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
  const base = tokenizeForSearch(query);
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const qLower = query.toLowerCase();
  const out: RetrievedChunk[] = [];
  for (const e of SIYA_LAWS_SEEDS) {
    const corpus = `${e.title} ${e.summary} ${e.keywords.join(" ")} ${e.body}`;
    const tokenScore = scoreTokens(qt, corpus, e.title, e.slug, base);
    if (tokenScore <= 0) continue;
    let s = tokenScore + keywordBoost(qLower, e.keywords, qt);
    // PHI-in-Ask is a channel rule — do not let incidental "Spruce"/"chat" tokens beat
    // operational Spruce how-to (e.g. notification workaround).
    if (e.id === "law-phi-in-internal-chat") {
      const wantsPhiChannel =
        /\b(phi|paste|screenshot|identifier|mrn|dob|hipaa)\b/.test(qLower) ||
        /(don't|do not|can i|cannot|can't).{0,48}(paste|put|send|share|upload).{0,48}(ask|slack|cliq|chat)/i.test(
          query,
        ) ||
        /internal chat|siyaos ask|\bin ask\b/.test(qLower);
      if (!wantsPhiChannel) s *= 0.08;
    }
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: e.id,
            title: e.title,
            snippet: `${e.summary}\n\n${e.body}`.slice(0, 2800),
            score: s * 1.55,
            escalate: e.escalate,
            links: [{ label: MEMORY_DEEP_LINKS.policies.label, href: MEMORY_DEEP_LINKS.policies.href }],
          },
          1,
        ),
      );
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

/** Staff portal personalization wizard — not MA Day-1 hire KB. */
export function isStaffPortalOnboardingQuery(q: string): boolean {
  const t = q.toLowerCase();
  return (
    /\bwhy\b.*\b(do|did|run|make)\b.*\bmy\b.*\bonboard/.test(t) ||
    /\bwhy\b.*\b(you|u|assist|siya)\b.*\b(do|did|run|make)\b.*\bonboard/.test(t) ||
    /\bportal\b.*\bonboard/.test(t) ||
    /\bpersonaliz(e|ation)\b/.test(t) ||
    /\b(preferred name|assistant name|training reminder|what should i call you)\b/.test(t) ||
    (/\bonboard/.test(t) && /\b(wizard|portal|app|siyaos|my day|personalize|assist)\b/.test(t))
  );
}

export function retrieveWorkspaceKnowledge(query: string, limit = 6): RetrievedChunk[] {
  const base = tokenizeForSearch(query);
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
    { pattern: /\bbrand\b(?!\s+new)|voice|positioning|how we describe/, id: "brand-entities-voice", boost: 14 },
    { pattern: /pricing|price|\$149|\$79|evaluation cost|membership|how much|meet.?and.?greet/, id: "patient-pricing-public-canonical", boost: 20 },
    { pattern: /meet.*greet|homepage cta|book free|discovery call/, id: "homepage-cta-meet-and-greet", boost: 18 },
    { pattern: /late cancel|refund|cancellation|no-show/, id: "billing-late-cancel", boost: 16 },
    { pattern: /refill|pharmacy|early refill|prescription (sent|ready)|med(ication)? not received|pill count|video pill|csa v2|controlled.?substance/, id: "refill-pharmacy-staff-guidance", boost: 22 },
    { pattern: /\b(new hire|day.?1|ma orientation|tool surprise|concierge\b.*\bonboard|onboard\b.*\b(new hire|ma\b|concierge))\b/, id: "ma-onboarding-field-lessons", boost: 20 },
    { pattern: /\b(leave|pto|time\s*off|day\s*off|vacation|holiday|sick\s+leave|request\s+leave|take\s+(a\s+)?leave)\b/, id: "leave-pto-request-provisional", boost: 32 },
    {
      pattern:
        /\b(patient|caller|they|he|she).{0,40}\b(want|wants|ask|asked|asking|request|requested).{0,30}\b(manager|supervisor)\b|\b(speak|talk|transfer).{0,20}\b(to\s+)?(a\s+)?(manager|supervisor)\b|\bask(ed|ing)?\s+for\s+(a\s+)?(manager|supervisor)\b/i,
      id: "patient-manager-request-provisional",
      boost: 34,
    },
    { pattern: /\bzoho\b|workdrive|true.?sync|\bspruce\b/, id: "ma-platforms-zoho-spruce", boost: 22 },
    { pattern: /zoho.{0,40}(access|login|provision)|request.{0,30}zoho|new hire.{0,30}(zoho|access)|access.{0,20}(zoho|workdrive)/, id: "ma-platforms-zoho-spruce", boost: 28 },
    { pattern: /spruce.{0,40}(notif|workaround|another app|background|push)|notif.{0,20}spruce/, id: "ma-platforms-zoho-spruce", boost: 28 },
    { pattern: /daily payment|payment check|payment report|zoho books/, id: "daily-payment-check", boost: 30 },
    { pattern: /portal chat|response time|sla|24 hour/, id: "chat-review-sla", boost: 16 },
    { pattern: /third party|family member|authorization/, id: "third-party-caller", boost: 16 },
    { pattern: /workdrive|company memory|where.*sop|knowledge base/, id: "company-memory-workdrive-index", boost: 14 },
    { pattern: /marketing.*claim|fda|ftc|testimonial|ads compliance/, id: "medical-compliance-marketing", boost: 14 },
    { pattern: /escalat|who do i call|supervisor/, id: "escalation-pathways", boost: 12 },
    // Hostile/abusive patient → live Postgres SOP (see retrieveDynamicSops), not escalation-pathways.
    { pattern: /hipaa|breach|phi|privacy/, id: "hipaa-breach", boost: 12 },
  ];

  for (const e of WORKSPACE_KB) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body}`;
    const tokenScore = scoreTokens(qt, corpus, e.title, e.id, base);
    let s = tokenScore;
    s += keywordBoost(qLower, e.keywords, qt);
    let intentHit = false;
    for (const intent of TOPIC_INTENT_BOOST) {
      if (e.id === intent.id && intent.pattern.test(qLower)) {
        if (intent.id === "ma-onboarding-field-lessons" && isStaffPortalOnboardingQuery(qLower)) {
          continue;
        }
        s += intent.boost;
        intentHit = true;
      }
    }
    if (META_TOPIC_IDS.has(e.id) && !wantsInternalMetaQuery(qLower)) s *= 0.12;
    // Don't surface docs that only matched generic tokens (e.g. "patient") unless intent boost says so.
    if (tokenScore <= 0 && !intentHit) continue;
    if (s > 0) out.push(fromKb(e, s));
  }

  const trainingQuery = /training|hipaa|certification|module|ce\b|ba\b/i.test(qLower);
  if (trainingQuery) {
    for (const m of MODULES) {
      const corpus = `${m.title} ${m.summary} ${m.keyConcepts.join(" ")}`;
      const s = scoreTokens(qt, corpus, m.title, m.id, base) * 0.9;
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
  status?: string;
};

export type DynamicDecisionEntry = {
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

/** Layer 2 SOPs from Postgres — live + draft-live only (never pending_review). */
export function retrieveDynamicSops(query: string, entries: DynamicSopEntry[], limit = 6): RetrievedChunk[] {
  const base = tokenizeForSearch(query);
  const qt = expandQuery(query);
  if (!qt.length || !entries.length) return [];
  const qLower = query.toLowerCase();
  const out: RetrievedChunk[] = [];
  for (const e of entries) {
    if (e.status === "pending_review" || e.status === "needs_review" || e.status === "draft") continue;
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body} ${e.department} sop`;
    const tokenScore = scoreTokens(qt, corpus, e.title, e.id, base);
    if (tokenScore <= 0) continue;
    let s = tokenScore;
    for (const k of e.keywords) {
      const kl = k.toLowerCase();
      if (qLower.includes(kl) || kl.split(/\s+/).some((w) => w.length > 2 && qLower.includes(w))) s += 4;
    }
    // Clinical ROI / prior-records SOP — common follow-ups must still hit the published guide.
    if (
      /medical\s+record|release\s+of\s+information|\broi\b|previous\s+provider/i.test(
        `${e.title} ${e.keywords.join(" ")} ${e.body.slice(0, 800)}`,
      )
    ) {
      if (/\b(roi|medical\s+records?|release\s+of\s+information|previous\s+(medical\s+)?records?)\b/i.test(qLower)) {
        s += 18;
      }
      if (/\b(unreachable|not\s+reachable|no\s+number|missing\s+number|wrong\s+number|chart)\b/i.test(qLower)) {
        s += 12;
      }
    }
    // Verbally abusive / hostile patient — prefer the reviewed live SOP over git escalation stubs.
    if (
      /verbally\s+abusive|abusive\s+patient|hostile\s+patient|verbal\s+abuse|patient\s+interaction/i.test(
        `${e.title} ${e.keywords.join(" ")} ${e.body.slice(0, 800)}`,
      )
    ) {
      if (
        /\b(abusive|hostile|angry|threatening|yelling|screaming|verbal\s+abuse|patient\s+threat)\b/i.test(
          qLower,
        )
      ) {
        s += 28;
      }
    }
    const draftLive = e.status === "draft_live" || e.title.includes("[Active draft]");
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: `sop-db-${e.id}`,
            title: e.title,
            snippet: e.body.slice(0, 2400),
            score: s,
            links: [{ label: `SOP · ${e.department}`, href: MEMORY_DEEP_LINKS.sops.href }],
            draftLive,
            /** Citation must reflect live Postgres department — never a provisional stub label. */
            sourceLabel: `${e.title} · ${e.department}${e.status === "live" ? " · live" : e.status === "draft_live" ? " · draft-live" : ""}`,
          },
          2,
        ),
      );
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

const DECISION_INTENT_BOOST: { pattern: RegExp; id: string; boost: number }[] = [
  { pattern: /chat review|admin only|clinical lead.*review/, id: "chat-review-admin-clinical-lead-only", boost: 22 },
  { pattern: /marketing (systems|os)|bigger systems|research os|content os|distribution os/, id: "marketing-bigger-systems-paused", boost: 22 },
  { pattern: /discovery call|meet.?and.?greet|\$79/, id: "meet-greet-replaced-discovery-call", boost: 20 },
  { pattern: /homepage cta|book free|zocdoc/, id: "homepage-cta-meet-and-greet", boost: 18 },
  { pattern: /agent org|executive office|coo agent/, id: "agent-org-chart-deferred", boost: 18 },
  { pattern: /flat team|no manager|hierarchy/, id: "flat-team-structure", boost: 18 },
  { pattern: /founder approval|shared company knowledge|pending.?review/, id: "founder-approval-for-shared-knowledge", boost: 18 },
  { pattern: /llm (off|gateway)|billing gate|vercel.*gateway/, id: "llm-gateway-billing-gate", boost: 18 },
];

/** Layer 2 decisions from Postgres — authoritative decision log for Ask. */
export function retrieveDynamicDecisions(
  query: string,
  entries: DynamicDecisionEntry[],
  limit = 6,
): RetrievedChunk[] {
  const base = tokenizeForSearch(query);
  const qt = expandQuery(query);
  if (!qt.length || !entries.length) return [];
  const qLower = query.toLowerCase();
  const out: RetrievedChunk[] = [];
  for (const e of entries) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body} ${e.department} decision why decided`;
    const tokenScore = scoreTokens(qt, corpus, e.title, e.id, base);
    let s = tokenScore;
    for (const k of e.keywords) {
      const kl = k.toLowerCase();
      if (qLower.includes(kl)) s += 4;
    }
    let intentHit = false;
    for (const intent of DECISION_INTENT_BOOST) {
      if (e.id === intent.id && intent.pattern.test(qLower)) {
        s += intent.boost;
        intentHit = true;
      }
    }
    if (/why did we|decision log|who decided|why (is|are|do|did)/i.test(qLower)) s += 3;
    if (tokenScore <= 0 && !intentHit) continue;
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: `dec-db-${e.id}`,
            title: e.title,
            snippet: e.body.slice(0, 2400),
            score: s * 1.1,
            links: [{ label: MEMORY_DEEP_LINKS.knowledge.label, href: MEMORY_DEEP_LINKS.knowledge.href }],
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
  const base = tokenizeForSearch(query);
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const out: RetrievedChunk[] = [];
  for (const e of entries) {
    const corpus = `${e.title} ${e.body} ${e.department ?? ""}`;
    const s = scoreTokens(qt, corpus, e.title, e.id, base) * 0.65;
    if (s > 0) {
      out.push(
        withLayer(
          {
            id: `mem-${e.id}`,
            title: e.title,
            snippet: e.body.slice(0, 1200),
            score: s,
            links: [{ label: MEMORY_DEEP_LINKS.memory.label, href: MEMORY_DEEP_LINKS.memory.href }],
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
    decisions?: DynamicDecisionEntry[];
    memories?: MemorySearchHit[];
    limit?: number;
  },
): RetrievedChunk[] {
  const limit = opts?.limit ?? 6;
  const way = retrieveSiyaWay(query, 3);
  const laws = retrieveLaws(query, 3);
  let knowledge = retrieveWorkspaceKnowledge(query, 6);
  // When Postgres decision log is loaded, drop markdown decision duplicates from static KB.
  if (opts?.decisions?.length) {
    const dbIds = new Set(opts.decisions.map((d) => d.id));
    knowledge = knowledge.filter((c) => !dbIds.has(c.id) && !c.id.startsWith("dec-db-"));
    // Also drop static KB entries that are category decisions by known markdown ids
    const markdownDecisionIds = new Set([
      "homepage-cta-meet-and-greet",
      "marketing-os-v1-frozen",
      "agent-org-chart-deferred",
    ]);
    knowledge = knowledge.filter((c) => !markdownDecisionIds.has(c.id));
    knowledge = mergeRetrievalChunks(knowledge, retrieveDynamicDecisions(query, opts.decisions, 5), 8);
  }
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
  const base = tokenizeForSearch(query);
  const qt = expandQuery(query);
  if (!qt.length) return [];
  const out: RetrievedChunk[] = [];
  for (const e of WORKSPACE_KB) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body}`;
    const s = scoreTokens(qt, corpus, e.title, e.id, base);
    if (s > 0) out.push(fromKb(e, s));
  }
  // Prefer laws/way near-misses too
  out.push(...retrieveLaws(query, 2), ...retrieveSiyaWay(query, 1));
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}
