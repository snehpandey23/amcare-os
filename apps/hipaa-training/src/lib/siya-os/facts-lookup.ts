/**
 * Deterministic public facts for staff Ask — ahead of SOP / KB retrieval.
 * Data comes from FACTS_SNAPSHOT (built from siya-health site-standards + providers).
 */
import {
  FACTS_SNAPSHOT,
  type FactsPricingSku,
  type FactsProviderRow,
  type FactsPricingRow,
} from "@/content/facts-snapshot.generated";
import type { Department } from "./departments";
import type { RetrievedChunk } from "./retrieval";

const STATE_ALIASES: Record<string, string> = {
  ca: "California",
  california: "California",
  tx: "Texas",
  texas: "Texas",
  pa: "Pennsylvania",
  pennsylvania: "Pennsylvania",
  fl: "Florida",
  florida: "Florida",
  oh: "Ohio",
  ohio: "Ohio",
  ny: "New York",
  "new york": "New York",
};

const SKU_ALIASES: Record<string, FactsPricingSku> = {
  meetgreet: "meetGreet",
  "meet&greet": "meetGreet",
  "meet and greet": "meetGreet",
  "meet-and-greet": "meetGreet",
  intro: "meetGreet",
  "intro call": "meetGreet",
  "intro consult": "meetGreet",
  "introduction call": "meetGreet",
  discovery: "meetGreet",
  "discovery call": "meetGreet",
  walkthrough: "meetGreet",
  evaluation: "initialEvaluation",
  "initial evaluation": "initialEvaluation",
  "adhd evaluation": "initialEvaluation",
  "full evaluation": "initialEvaluation",
  "non-controlled": "nonControlledFollowUp",
  "non controlled": "nonControlledFollowUp",
  "follow-up": "nonControlledFollowUp",
  "follow up": "nonControlledFollowUp",
  controlled: "controlledFollowUp",
  stimulant: "controlledFollowUp",
};

export function lookupPricing(sku: string): FactsPricingRow | null {
  const key = normalizeSku(sku);
  if (!key) return null;
  return FACTS_SNAPSHOT.pricing[key] ?? null;
}

export function lookupOrgStates(): string[] {
  return [...FACTS_SNAPSHOT.availableServiceStates];
}

export type ProviderStateLookup =
  | {
      kind: "match";
      provider: FactsProviderRow;
      state: string;
      licensed: boolean;
      serviceable: boolean;
    }
  | { kind: "provider_not_found"; nameQuery: string }
  | { kind: "state_not_parsed"; nameQuery: string; stateQuery: string }
  | { kind: "ambiguous"; matches: FactsProviderRow[] };

export function lookupProviderState(nameQuery: string, stateQuery: string): ProviderStateLookup {
  const providers = matchProviders(nameQuery);
  if (!providers.length) return { kind: "provider_not_found", nameQuery };
  if (providers.length > 1) return { kind: "ambiguous", matches: providers };

  const state = normalizeState(stateQuery);
  if (!state) return { kind: "state_not_parsed", nameQuery, stateQuery };

  const provider = providers[0];
  const licensed = provider.statesLicensed.some((s) => s.toLowerCase() === state.toLowerCase());
  const serviceable = provider.statesService.some((s) => s.toLowerCase() === state.toLowerCase());
  return { kind: "match", provider, state, licensed, serviceable };
}

export interface FactsLookupHit {
  message: string;
  chunks: RetrievedChunk[];
  sources: { title: string; id: string }[];
  department: Department;
  task: string;
}

/** Intent router — returns a staff-ready answer or null to fall through to KB retrieval. */
export function tryFactsLookup(query: string): FactsLookupHit | null {
  const q = query.trim();
  if (!q) return null;

  const meetPrice = matchMeetGreetPrice(q);
  if (meetPrice) return meetPrice;

  const cancellation = matchCancellation(q);
  if (cancellation) return cancellation;

  const hours = matchHours(q);
  if (hours) return hours;

  const brandTokens = matchBrandTokens(q);
  if (brandTokens) return brandTokens;

  const serviceOffer = matchServiceOffer(q);
  if (serviceOffer) return serviceOffer;

  const orgStates = matchOrgStates(q);
  if (orgStates) return orgStates;

  const providerState = matchProviderStateQuestion(q);
  if (providerState) return providerState;

  const skuPrice = matchGenericSkuPrice(q);
  if (skuPrice) return skuPrice;

  return null;
}

function normalizeSku(raw: string): FactsPricingSku | null {
  const t = raw.toLowerCase().replace(/\s+/g, " ").trim();
  if ((FACTS_SNAPSHOT.pricing as Record<string, unknown>)[raw]) {
    return raw as FactsPricingSku;
  }
  return SKU_ALIASES[t] ?? null;
}

function normalizeState(raw: string): string | null {
  const t = raw.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (STATE_ALIASES[t]) return STATE_ALIASES[t];
  for (const name of [
    ...FACTS_SNAPSHOT.availableServiceStates,
    "Ohio",
    "New York",
    "Arizona",
    "Georgia",
  ]) {
    if (t === name.toLowerCase()) return name;
  }
  return null;
}

function matchProviders(nameQuery: string): FactsProviderRow[] {
  const q = nameQuery.toLowerCase().replace(/[^a-z\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (!q || q.length < 3) return [];
  const tokens = q.split(/\s+/).filter((t) => t.length > 1 && !["dr", "md", "np", "pa", "fnp"].includes(t));

  return FACTS_SNAPSHOT.providers.filter((p) => {
    const hay = `${p.slug} ${p.name} ${p.displayName} ${p.givenName} ${p.familyName}`.toLowerCase();
    if (hay.includes(q)) return true;
    return tokens.length > 0 && tokens.every((t) => hay.includes(t));
  });
}

function factsChunk(id: string, title: string, snippet: string): RetrievedChunk {
  return {
    id,
    title,
    snippet,
    score: 100,
    layer: 2,
    layerLabel: "Knowledge",
  };
}

function hit(
  message: string,
  id: string,
  title: string,
  department: Department,
  task: string,
): FactsLookupHit {
  const chunk = factsChunk(id, title, message.slice(0, 400));
  return {
    message,
    chunks: [chunk],
    sources: [{ title, id }],
    department,
    task,
  };
}

function matchMeetGreetPrice(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  const aboutMeet =
    /meet\s*(?:&|and)?\s*greet|intro(duction)?\s*(call|consult|visit)|discovery\s*call|walkthrough|process\s*call/.test(
      lower,
    );
  const aboutPrice = /price|pricing|cost|fee|how much|\$|free|charge|pay/.test(lower) || /discovery\s*call/.test(lower);
  if (!aboutMeet) return null;
  if (!aboutPrice && !/discovery\s*call/.test(lower)) return null;

  const row = lookupPricing("meetGreet")!;
  const asksLegacyDiscovery = /discovery\s*call/.test(lower);
  const discontinued = asksLegacyDiscovery
    ? " The old paid Discovery Call product was **discontinued on 2026-08-06** and replaced by free Meet & Greet — do not quote legacy Discovery Call fees for intros."
    : "";

  const message = [
    `**${row.label}** is **${row.display}**${row.period ? ` ${row.period}` : ""} (amount **$${row.amount}**).`,
    row.description,
    discontinued,
    "Canonical amount comes from the public site pricing standards (Meet & Greet SKU).",
  ]
    .filter(Boolean)
    .join(" ");

  return hit(message, "facts-pricing-meetGreet", "Facts · Meet & Greet pricing", "Accounts", "Patient pricing");
}

function matchOrgStates(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  const asksOrg =
    /\b(what|which)\s+states\b|\bstates?\s+(do\s+)?(we|siya|you)\s+(serve|cover|offer|see|practice|operate)/.test(
      lower,
    ) ||
    /\b(org|organization|company|siya)\b.{0,40}\b(service|licensed|availability)\s+states?\b/.test(lower) ||
    /\b(service|telehealth)\s+states?\b/.test(lower) ||
    /\bwhere\s+(can|do)\s+(patients|we)\s+(book|get\s+care|see)\b/.test(lower);
  if (!asksOrg) return null;
  // Prefer provider-specific handler when a clinician name is present
  if (matchProviders(extractNameHint(q)).length) return null;

  const states = lookupOrgStates();
  const message = [
    `**Siya Healthcare, PLLC service states** (where we offer telehealth): **${states.join(", ")}**.`,
    "Source: organizational service-state list on the public site standards.",
    "Eligibility is still confirmed at scheduling. A clinician may hold a license in another state without Siya offering service there — ask by provider name if you need that distinction.",
  ].join(" ");

  return hit(message, "facts-org-states", "Facts · Org service states", "Clinical Operations", "State availability");
}

function extractNameHint(q: string): string {
  const m =
    q.match(/\b(?:dr\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/) ||
    q.match(/\b(derek|timbs|sneh|swati|natasha|vanessa|megan|wendy|wunderlich|delgado|pandey|desai|urbina)\b/i);
  return m ? m[0] : "";
}

function matchProviderStateQuestion(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  const stateHit = Object.keys(STATE_ALIASES).find((k) => new RegExp(`\\b${k}\\b`, "i").test(lower));
  if (!stateHit) return null;

  const wantsLicense =
    /licen[cs]|credential|can\s+(he|she|they|we|i)\s+(see|book|practice|see patients)|book\s+(in|here)|see\s+patients|serviceable|serve|available\s+in/.test(
      lower,
    ) || /\bin\s+(ohio|california|texas|pennsylvania|florida|new york|ca|tx|pa|fl|oh|ny)\b/.test(lower);
  if (!wantsLicense) return null;

  const nameHint =
    lower.match(
      /\b(derek(?:\s+timbs)?|timbs|sneh(?:\s+pandey)?|swati(?:\s+pandey)?|natasha(?:\s+desai)?|vanessa(?:\s+urbina)?|megan(?:\s+wunderlich)?|wendy(?:\s+delgado)?|dr\.?\s+\w+(?:\s+\w+)?)\b/i,
    )?.[0] || extractNameHint(q);

  if (!nameHint || nameHint.length < 3) return null;

  const stateName = STATE_ALIASES[stateHit] || normalizeState(stateHit);
  if (!stateName) return null;

  const result = lookupProviderState(nameHint, stateName);
  if (result.kind === "provider_not_found") return null;
  if (result.kind === "ambiguous") {
    return hit(
      `Several providers matched **${nameHint}**. Clarify which clinician: ${result.matches.map((p) => p.displayName).join(" · ")}.`,
      "facts-provider-ambiguous",
      "Facts · Provider match",
      "Clinical Operations",
      "Provider licensure",
    );
  }
  if (result.kind === "state_not_parsed") return null;

  const { provider, state, licensed, serviceable } = result;
  const licensedList = provider.statesLicensed.join(", ") || "—";
  const serviceList = provider.statesService.join(", ") || "—";

  let verdict: string;
  if (serviceable) {
    verdict = `**Yes — bookable for Siya telehealth in ${state}.** Licensed **and** in the org service footprint.`;
  } else if (licensed) {
    verdict = `**Licensed in ${state}, but Siya does not offer telehealth service there.** Do **not** tell patients they can book ${provider.displayName} for care in ${state}. Service states for this clinician: **${serviceList}**.`;
  } else {
    verdict = `**Not licensed in ${state}** (per roster). Licensed: **${licensedList}**. Siya service states for this clinician: **${serviceList}**.`;
  }

  const message = [
    `**${provider.displayName}** · ${state}`,
    verdict,
    `• **states.licensed:** ${licensedList}`,
    `• **states.service:** ${serviceList}`,
    `Org service footprint: **${lookupOrgStates().join(", ")}**.`,
  ].join("\n");

  return hit(
    message,
    `facts-provider-${provider.slug}`,
    `Facts · ${provider.displayName} · ${state}`,
    "Clinical Operations",
    "Provider licensure",
  );
}

function matchGenericSkuPrice(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  if (!/how much|what(?:'s| is) the (price|cost|fee)|pricing for|cost of/.test(lower)) return null;
  if (/meet\s*&?\s*greet|discovery|intro/.test(lower)) return null;
  // Cancellation / no-show fees are handled by matchCancellation — not visit pricing SKUs.
  if (/no[-\s]?show|late[-\s]?cancel|missed\s+(the\s+)?(visit|appointment)/.test(lower)) return null;

  let sku: FactsPricingSku | null = null;
  if (/controlled|stimulant/.test(lower)) sku = "controlledFollowUp";
  else if (/non[-\s]?controlled|follow[-\s]?up/.test(lower)) sku = "nonControlledFollowUp";
  else if (/evaluation|eval\b|initial/.test(lower)) sku = "initialEvaluation";
  if (!sku) return null;

  const row = lookupPricing(sku)!;
  const message = [
    `**${row.label}:** **${row.display}**${row.period ? ` ${row.period}` : ""} (amount **$${row.amount}**).`,
    row.description,
    `Canonical SKU from public site pricing standards · see ${FACTS_SNAPSHOT.pricing.path}.`,
  ].join(" ");

  return hit(message, `facts-pricing-${sku}`, `Facts · ${row.label}`, "Accounts", "Patient pricing");
}

function mentionsKlarity(lower: string): boolean {
  return /\bklarity\b/.test(lower);
}

/**
 * Direct siya.health no-show = $50.
 * Late-cancel amount not locked — escalate (do not guess $40/$79).
 * Klarity queries fall through to Klarity KB topics.
 */
function matchCancellation(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  if (mentionsKlarity(lower)) return null;

  const aboutNoShow =
    /\bno[-\s]?show\b|\bmissed\s+(?:\w+\s+){0,3}(visit|appointment|call)\b|\bdidn't\s+show\b|\bdid\s+not\s+show\b|\bwhat\s+do\s+we\s+charge\b.*\b(missed|no[-\s]?show)/.test(
      lower,
    ) ||
    (/\b(missed|no[-\s]?show)\b/.test(lower) && /\b(fee|charge|policy|how much)\b/.test(lower));
  const aboutLateCancel =
    /\blate[-\s]?cancel|\bcancel(?:lation|led)?\s+(same[-\s]?day|late|inside|within)|same[-\s]?day\s+cancel/.test(
      lower,
    );
  const aboutCancelGeneric =
    /\b(cancel(?:lation)?|refund)\b/.test(lower) &&
    /\b(fee|policy|charge|how much|what(?:'s| is))\b/.test(lower);

  if (!aboutNoShow && !aboutLateCancel && !aboutCancelGeneric) return null;

  const c = FACTS_SNAPSHOT.cancellation;
  const fee = c.noShowFeeDisplay;

  if (aboutLateCancel && !aboutNoShow) {
    const message = [
      `**Late cancellation (direct siya.health):** amount **not locked** — escalate **Billing lead** with cancel time documented; do not invent a fee (legacy $40/$79 retired).`,
      `If it was a **no-show** (missed, not cancelled before start), fee is **${fee}**.`,
      c.channelNote,
    ].join(" ");
    return hit(
      message,
      "facts-late-cancel-escalate",
      "Facts · Late cancel (escalate)",
      "Accounts",
      "Late cancellation",
    );
  }

  const parts = [
    `**No-show (direct siya.health):** **${fee}** for missed appointments.`,
    c.noShowSummary,
  ];
  if (aboutLateCancel || aboutCancelGeneric) {
    parts.push(
      `**Late-cancel** amount is **not locked** — escalate Billing lead; do not quote legacy $40/$79.`,
    );
  }
  parts.push(c.channelNote);

  return hit(
    parts.join(" "),
    "facts-no-show-fee",
    "Facts · No-show fee (direct)",
    "Accounts",
    "No-show fee",
  );
}

/** “Do we offer X?” — yes/no + staff blurb (pairs with service-line-blurbs KB). */
function matchServiceOffer(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  const asksOffer =
    /\b(do\s+we\s+offer|do\s+you\s+offer|do\s+we\s+(do|have|provide)|do\s+you\s+(do|have|provide)|what\s+services|are\s+you\s+(able\s+to|able\sto)\s+(treat|see|help)|can\s+we\s+(treat|see|help|do)|can\s+you\s+(treat|see|help|do))\b/.test(
      lower,
    ) ||
    (/\b(offer|provide)\b/.test(lower) &&
      /\b(adhd|weight|glp|primary|urgent|men'?s|women'?s|lab|prescription|rx|telehealth|trt|ozempic|semaglutide)\b/.test(
        lower,
      ));

  if (!asksOffer) return null;

  const services = FACTS_SNAPSHOT.services;
  let matched = services.find((s) =>
    s.aliases.some((a) => {
      const alias = a.toLowerCase();
      return lower.includes(alias) || new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(lower);
    }),
  );

  // Soft match on label words when alias miss
  if (!matched) {
    matched = services.find((s) => {
      const key = s.key.toLowerCase();
      if (key === "mens" && /\bmen'?s\b|\btrt\b|\btestosterone\b/.test(lower)) return true;
      if (key === "womens" && /\bwomen'?s\b|\bpcos\b|\bperimenopause\b/.test(lower)) return true;
      if (key === "weight" && /\bglp-?\s*1\b|\bozempic\b|\bsemaglutide\b|\bweight\b/.test(lower))
        return true;
      if (key === "prescriptions" && /\b(rx|prescription|pharmacy|refill)\b/.test(lower)) return true;
      return lower.includes(key);
    });
  }

  if (!matched) {
    // Broad “what services do we offer?”
    if (/\bwhat\s+services\b|\bwhich\s+services\b|\bservices\s+do\s+(we|you)\b/.test(lower)) {
      const list = services
        .filter((s) => s.key !== "telehealth")
        .map((s) => s.label)
        .join("; ");
      const message = [
        `**Yes — public service lines (siya.health):** ${list}.`,
        `Each is telehealth in published states (CA, TX, PA, FL). For a one-paragraph explainer, ask “do we offer [service]?” or open KB topic **service-line-blurbs**.`,
      ].join(" ");
      return hit(message, "facts-service-list", "Facts · Services list", "Clinical Operations", "Services");
    }
    return null;
  }

  const message = [
    `**Yes — we offer ${matched.label}.**`,
    matched.staffBlurb,
    `Public page: ${matched.url}`,
    `More detail in KB: **service-line-blurbs**.`,
  ].join(" ");

  return hit(
    message,
    `facts-service-offer-${matched.key}`,
    `Facts · Service · ${matched.label}`,
    "Clinical Operations",
    "Service offer",
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Staff portal brand tokens (globals.css) — marketing design system surfaces. */
function matchBrandTokens(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  const asksBg =
    /\b(background|bg)\s*(colou?r|token|hex)?\b/.test(lower) ||
    /\bdefault\s+background\b/.test(lower) ||
    (/\b(page|portal|app)\s+background\b/.test(lower) && /\b(colo?u?r|token|hex|brand)\b/.test(lower));
  // Tolerate common typo "desgin" from live staff chat.
  const asksBrandSystem =
    /\bbrand\s+system\b/.test(lower) ||
    /\bmarketing\s+des[ig]{1,2}n\b/.test(lower) ||
    /\bdes[ig]{1,2}n\s+brand\s+system\b/.test(lower) ||
    /\bbrand\s+tokens?\b/.test(lower);

  if (!asksBg && !(asksBrandSystem && /\b(background|bg|colo?u?r|cream|page)\b/.test(lower))) {
    return null;
  }
  if (!asksBg && !asksBrandSystem) return null;

  const message = [
    "**Staff portal brand surfaces (marketing design / Brand System tokens):**",
    "• **Default page background** (CSS token siya-bg-page): #fffdf6 — warm cream",
    "• **Subtle / secondary surface** (siya-bg-subtle): #faf4e4",
    "• **White cards / panels** (siya-white): #ffffff",
    "",
    "These are the live staff-portal surface tokens. Pack-specific editorial colors may differ — escalate Marketing if you need a carousel/static token from Brand System docs.",
  ].join("\n");

  return hit(message, "facts-brand-bg-page", "Facts · Brand · Background", "Marketing", "Brand tokens");
}

/** No fixed practice-wide hours — provider schedules live in the EHR. */
function matchHours(q: string): FactsLookupHit | null {
  const lower = q.toLowerCase();
  const asksHours =
    /\b(business\s+hours|office\s+hours|practice\s+hours|opening\s+hours|what\s+hours|when\s+(are\s+you|is\s+(the\s+)?(clinic|office|practice|siya)|do\s+you)\s+open|hours\s+of\s+operation|are\s+you\s+open|24\s*\/?\s*7|nine\s+to\s+five|9\s*[-–to]+\s*5)\b/.test(
      lower,
    ) ||
    (/\bhours\b/.test(lower) &&
      /\b(siya|practice|clinic|office|open|available|schedule)\b/.test(lower) &&
      !/\bchat\s+sla|review\s+sla|within\s+\d+\s*h/.test(lower));

  if (!asksHours) return null;

  const h = FACTS_SNAPSHOT.hours;
  const message = [h.summary, h.staffNote].filter(Boolean).join(" ");
  return hit(message, "facts-hours", "Facts · Hours / availability", "Clinical Operations", "Hours");
}
