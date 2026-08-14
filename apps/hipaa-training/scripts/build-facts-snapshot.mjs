#!/usr/bin/env node
/**
 * Snapshot public site facts for staff Ask facts-lookup.
 * Source of truth: apps/siya-health data modules + service-index.json (not a separate admin DB).
 *
 * Includes: pricing, org states, providers (license + credentials), insurance/cash-pay,
 * contact, service lines, booking CTAs.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AVAILABLE_SERVICE_STATES,
  PRICING,
} from '../../siya-health/data/site-standards.mjs'
import {
  getAllProviders,
  providerServiceStates,
} from '../../siya-health/data/providers.mjs'
import { SITE_CONTACT } from '../../siya-health/data/homepage-trust-metrics.mjs'
import {
  BASE_URL,
  MEET_GREET_BOOKING_URL,
  ADHD_EVALUATION_199_LINK,
  SPRUCE_CHAT_URL,
  REDIRECT_MEET_GREET_URL,
  REDIRECT_CHAT_URL,
  REDIRECT_ADHD_EVALUATION_URL,
  BOOKING_LINK,
} from '../../siya-health/data/providers-core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const siteRoot = path.join(__dirname, '../../siya-health')
const outFile = path.join(__dirname, '../src/content/facts-snapshot.generated.ts')

const providerCanonical = JSON.parse(
  fs.readFileSync(path.join(siteRoot, 'data/provider-canonical.json'), 'utf8'),
)

const SITE = 'https://www.siya.health'

function absUrl(pathOrUrl) {
  if (!pathOrUrl) return SITE
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl.replace('https://siya.health', SITE).replace(/\/$/, '') || SITE
  }
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${SITE}${p}`
}

const providers = getAllProviders().map((p) => {
  const licensed = [...(p.statesLicensed || [])]
  const service = providerServiceStates(p)
  const abbrevs = [...(p.stateAbbreviations || [])]
  const canon = providerCanonical.providers?.[p.slug]
  const credentials = [
    ...(p.credentials || []),
    ...(canon?.credentials?.suffixes || []),
  ].filter(Boolean)
  const uniqueCreds = [...new Set(credentials.map((c) => String(c).trim()).filter(Boolean))]
  const specialtyChips = [
    ...(canon?.credentials?.chips || []),
    ...(p.boardCertifications || []).map((b) =>
      typeof b === 'string' ? b.replace(/\s*\(.*$/, '').trim() : b?.name || '',
    ),
  ].filter(Boolean)
  const uniqueSpecialty = [...new Set(specialtyChips.map((s) => String(s).trim()).filter(Boolean))]
  const role =
    canon?.role?.hub ||
    canon?.role?.homepage ||
    canon?.role?.profileHero ||
    p.schema?.medicalSpecialty?.[0] ||
    ''

  return {
    slug: p.slug,
    name: p.name,
    displayName: p.displayName || p.name,
    givenName: p.givenName || '',
    familyName: p.familyName || '',
    credentials: uniqueCreds,
    specialtyChips: uniqueSpecialty,
    role: String(role || '').trim(),
    profilePath: `/providers/${p.slug}`,
    profileUrl: absUrl(`/providers/${p.slug}`),
    statesLicensed: licensed,
    statesService: service,
    stateAbbreviations: abbrevs,
  }
})

const pricing = {
  meetGreet: PRICING.meetGreet,
  initialEvaluation: PRICING.initialEvaluation,
  nonControlledFollowUp: PRICING.nonControlledFollowUp,
  controlledFollowUp: PRICING.controlledFollowUp,
  path: PRICING.path,
}

/** Siya.health cash-pay — NOT Klarity marketplace insurance. */
const insurance = {
  acceptsInsurance: false,
  summary:
    'Siya Health does not accept insurance. We offer transparent cash pricing today. Many patients use FSA or HSA funds for eligible services — confirm with your plan administrator; Siya provides itemized receipts. Insurance-based options may be added later.',
  fsaHsaNote:
    'FSA/HSA: clinical evaluation and many visit fees may qualify as medical expenses when documented — plan administrator decides. Medication is usually paid at the pharmacy under separate pharmacy/plan rules.',
  pricingPath: '/pricing',
  fsaHsaPath: '/answers/fsa-hsa-adhd-evaluation',
  pricingUrl: absUrl('/pricing'),
  fsaHsaUrl: absUrl('/answers/fsa-hsa-adhd-evaluation'),
  channelNote:
    'This is siya.health direct cash-pay — not Klarity marketplace insurance. Do not mix Klarity insured-patient rules with this answer.',
}

const contact = {
  phoneDisplay: SITE_CONTACT.phoneDisplay,
  phoneHref: SITE_CONTACT.phoneHref,
  email: SITE_CONTACT.email,
  emailHref: SITE_CONTACT.emailHref,
}

/**
 * Canonical service lines for “do we offer X?” — hubs only, not geo landings.
 * Paths cross-checked against service-index.json + known root pages.
 */
const serviceIndex = JSON.parse(
  fs.readFileSync(path.join(siteRoot, 'service-index.json'), 'utf8'),
)
const byType = new Map()
for (const s of serviceIndex.services || []) {
  if (!s.type?.startsWith('service-')) continue
  if (!byType.has(s.type)) byType.set(s.type, [])
  byType.get(s.type).push(s)
}

function pickHub(type, preferredPaths) {
  const list = byType.get(type) || []
  for (const pref of preferredPaths) {
    const hit = list.find((s) => {
      try {
        return new URL(s.url).pathname.replace(/\/$/, '') === pref.replace(/\/$/, '')
      } catch {
        return false
      }
    })
    if (hit) return hit
  }
  return list[0] || null
}

/** Staff one-liners for “do we offer X?” — keep in sync with service-line-blurbs KB topic. */
const STAFF_BLURBS = {
  adhd:
    'Physician-led adult ADHD evaluation and follow-up via telehealth — structured history, validated tools as appropriate, comorbidity screening, and a documented plan. Diagnosis does not guarantee medication.',
  weight:
    'Provider-guided medical weight-loss and metabolic care, including GLP-1 or other options when clinically appropriate — not a meds-only storefront.',
  primary:
    'Virtual primary and urgent-style adult visits — wellness, chronic care support, preventive lab review, and clear follow-up plans. Not an emergency room.',
  telehealth:
    'Siya Health delivers physician-led virtual medical care (telehealth) in licensed states, with documented visits and secure messaging pathways.',
  mens:
    "Physician-led men's health telehealth — testosterone evaluation, ED support, metabolic/longevity planning — not testosterone-first marketing.",
  womens:
    "Women's health telehealth for PCOS, perimenopause, thyroid/metabolic concerns, ADHD in women, and preventive care.",
  labs:
    'Transparent direct-pay lab testing (thyroid, blood sugar, vitamins, iron, metabolic/preventive) with physician guidance available. Labs alone do not diagnose ADHD.',
  prescriptions:
    'Provider-reviewed prescriptions through Siya telehealth when clinically appropriate. Availability varies by state and indication — never promise a specific controlled substance.',
}

function serviceLine(key, label, aliases, type, preferredPaths, fallbackPath) {
  const hub = pickHub(type, preferredPaths)
  let pathStr = fallbackPath
  let title = label
  if (hub) {
    try {
      pathStr = new URL(hub.url).pathname || fallbackPath
      title = (hub.title || label).replace(/&amp;/g, '&')
    } catch {
      /* keep fallback */
    }
  }
  // Prefer short staff label over SEO titles
  return {
    key,
    label,
    aliases,
    path: pathStr,
    url: absUrl(pathStr),
    indexTitle: title,
    staffBlurb: STAFF_BLURBS[key] || `${label} is offered via Siya Health telehealth in published states.`,
  }
}

const services = [
  serviceLine(
    'adhd',
    'Adult ADHD care',
    ['adhd', 'adult adhd', 'adhd care', 'adhd evaluation', 'adhd diagnosis', 'focus care'],
    'service-adhd',
    ['/adhd-care'],
    '/adhd-care',
  ),
  serviceLine(
    'weight',
    'Weight loss / metabolic health',
    ['weight', 'weight loss', 'metabolic', 'glp-1', 'glp1', 'semaglutide', 'ozempic'],
    'service-weight-loss',
    ['/weight-loss-metabolic-health'],
    '/weight-loss-metabolic-health',
  ),
  serviceLine(
    'primary',
    'Primary & urgent care',
    ['primary', 'primary care', 'urgent care', 'sick visit'],
    'service-telehealth',
    ['/primary-urgent-care', '/primary-care'],
    '/primary-urgent-care',
  ),
  serviceLine(
    'telehealth',
    'Telehealth',
    ['telehealth', 'virtual care', 'online visit', 'video visit'],
    'service-telehealth',
    ['/telehealth'],
    '/telehealth',
  ),
  serviceLine(
    'mens',
    "Men's health",
    ["men's health", 'mens health', 'testosterone', 'trt', "men's"],
    'service-mens-health',
    ['/mens-health-longevity'],
    '/mens-health-longevity',
  ),
  {
    key: 'womens',
    label: "Women's health",
    aliases: ["women's health", 'womens health', 'midlife', 'perimenopause', 'pcos', "women's"],
    path: '/womens-health',
    url: absUrl('/womens-health'),
    indexTitle: "Women's health",
    staffBlurb: STAFF_BLURBS.womens,
  },
  serviceLine(
    'labs',
    'Labs & blood tests',
    ['labs', 'lab', 'blood test', 'bloodwork', 'lab testing'],
    'service-labs',
    ['/labs'],
    '/labs',
  ),
  {
    key: 'prescriptions',
    label: 'Prescriptions / pharmacy pathway',
    aliases: ['prescriptions', 'prescription', 'rx', 'pharmacy', 'refill page'],
    path: '/prescriptions',
    url: absUrl('/prescriptions'),
    indexTitle: 'Prescriptions',
    staffBlurb: STAFF_BLURBS.prescriptions,
  },
]

const booking = {
  meetGreet: {
    key: 'meetGreet',
    label: 'Free Meet & Greet',
    redirectPath: REDIRECT_MEET_GREET_URL,
    redirectUrl: absUrl(REDIRECT_MEET_GREET_URL),
    directUrl: MEET_GREET_BOOKING_URL,
    note: 'Primary patient intro CTA. Free, non-clinical. Prefer site redirect for tracking.',
  },
  spruce: {
    key: 'spruce',
    label: 'Spruce secure medical chat',
    redirectPath: REDIRECT_CHAT_URL,
    redirectUrl: absUrl(REDIRECT_CHAT_URL),
    directUrl: SPRUCE_CHAT_URL,
    note: 'Private clinical messaging via Spruce. Prefer /redirect/chat for ads tracking.',
  },
  evaluation: {
    key: 'evaluation',
    label: 'ADHD / clinical evaluation booking',
    redirectPath: REDIRECT_ADHD_EVALUATION_URL,
    redirectUrl: absUrl(REDIRECT_ADHD_EVALUATION_URL),
    directUrl: ADHD_EVALUATION_199_LINK,
    note: 'Paid evaluation CarePatron slot ($149 canonical). Prefer /redirect/adhd-evaluation.',
  },
  defaultBooking: {
    key: 'defaultBooking',
    label: 'Default booking link (Meet & Greet)',
    redirectPath: REDIRECT_MEET_GREET_URL,
    redirectUrl: absUrl(REDIRECT_MEET_GREET_URL),
    directUrl: BOOKING_LINK,
    note: 'BOOKING_LINK currently equals Meet & Greet.',
  },
}

/** Direct siya.health bookings only — NOT Klarity marketplace. */
const cancellation = {
  channel: 'siya.health_direct',
  noShowFeeAmount: 50,
  noShowFeeDisplay: '$50',
  noShowSummary:
    'Do not waive or refund in chat — escalate Billing lead for disputes.',
  lateCancelStatus: 'pending_founder',
  lateCancelSummary:
    'Late-cancel amount is not locked — escalate Billing lead; do not invent a fee (legacy $40/$79 retired).',
  channelNote:
    'Klarity-booked visits use klarity-billing-cancellation — not the direct $50 no-show fee.',
  retiredLegacyAmounts: ['$40', '$79 full no-show (legacy conflict)', 'full appointment fee as default no-show'],
}

/** No practice-wide published hours — provider schedules in EHR. */
const hours = {
  hasFixedPracticeHours: false,
  summary:
    'Siya Health does not publish fixed practice-wide business hours. Availability is provider-specific and set weekly in the EHR. Direct patients to check open slots at scheduling / booking — do not invent or imply a standard Monday–Friday hours string.',
  staffNote: 'If a patient needs a human for booking help, use care@siya.health or (215) 445-1244 — still without inventing hours.',
}

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  source:
    'apps/siya-health site-standards + providers + provider-canonical + homepage-trust-metrics + providers-core + service-index.json + founder-locked cancel/hours facts',
  availableServiceStates: [...AVAILABLE_SERVICE_STATES],
  pricing,
  providers,
  insurance,
  contact,
  services,
  booking,
  cancellation,
  hours,
  baseUrl: BASE_URL.includes('www') ? BASE_URL : SITE,
}

const ts = `/* eslint-disable */
/** AUTO-GENERATED by scripts/build-facts-snapshot.mjs — do not edit by hand */
export type FactsPricingSku =
  | "meetGreet"
  | "initialEvaluation"
  | "nonControlledFollowUp"
  | "controlledFollowUp";

export interface FactsPricingRow {
  label: string;
  amount: number;
  display: string;
  period: string;
  description: string;
}

export interface FactsProviderRow {
  slug: string;
  name: string;
  displayName: string;
  givenName: string;
  familyName: string;
  credentials: string[];
  specialtyChips: string[];
  role: string;
  profilePath: string;
  profileUrl: string;
  statesLicensed: string[];
  statesService: string[];
  stateAbbreviations: string[];
}

export interface FactsInsurance {
  acceptsInsurance: boolean;
  summary: string;
  fsaHsaNote: string;
  pricingPath: string;
  fsaHsaPath: string;
  pricingUrl: string;
  fsaHsaUrl: string;
  channelNote: string;
}

export interface FactsContact {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  emailHref: string;
}

export interface FactsServiceLine {
  key: string;
  label: string;
  aliases: string[];
  path: string;
  url: string;
  indexTitle: string;
  staffBlurb: string;
}

export interface FactsBookingLink {
  key: string;
  label: string;
  redirectPath: string;
  redirectUrl: string;
  directUrl: string;
  note: string;
}

export interface FactsCancellation {
  channel: string;
  noShowFeeAmount: number;
  noShowFeeDisplay: string;
  noShowSummary: string;
  lateCancelStatus: string;
  lateCancelSummary: string;
  channelNote: string;
  retiredLegacyAmounts: string[];
}

export interface FactsHours {
  hasFixedPracticeHours: boolean;
  summary: string;
  staffNote: string;
}

export interface FactsSnapshot {
  generated: string;
  source: string;
  availableServiceStates: string[];
  pricing: Record<FactsPricingSku, FactsPricingRow> & { path: string };
  providers: FactsProviderRow[];
  insurance: FactsInsurance;
  contact: FactsContact;
  services: FactsServiceLine[];
  booking: Record<string, FactsBookingLink>;
  cancellation: FactsCancellation;
  hours: FactsHours;
  baseUrl: string;
}

export const FACTS_SNAPSHOT: FactsSnapshot = ${JSON.stringify(payload, null, 2)} as FactsSnapshot;
`

fs.writeFileSync(outFile, ts)
console.log(
  `Wrote ${outFile} (${providers.length} providers, ${services.length} services, ${AVAILABLE_SERVICE_STATES.length} states)`,
)
