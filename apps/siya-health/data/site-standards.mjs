/**
 * Sitewide copy standards — states, footer, Health Guides naming.
 */
import { LEGAL_HUB, LEGAL_PATHS, LEGAL_EFFECTIVE_DATE as LEGAL_EFFECTIVE_DATE_ISO } from './legal-documents.mjs';
import { buildProviderAuditCanonical } from './provider-canonical.mjs';
import { BOOKING_LINK, REDIRECT_CHAT_URL, REDIRECT_MEET_GREET_URL } from './providers-core.mjs';
import { SIYA_CIRCLE_GHL_FORM_URL } from './siya-circle-config.mjs';

/** Counsel-approved effective date for published legal documents. */
export const LEGAL_EFFECTIVE_DATE = LEGAL_EFFECTIVE_DATE_ISO;
export const LEGAL_EFFECTIVE_DATE_DISPLAY = 'October 31, 2025';

/** Canonical Inc./PLLC administrative vs clinical split — required on legal surfaces. */
export const CANONICAL_ENTITY_STATEMENT =
  'Siya Health Inc. provides administrative and non-clinical support services. Medical services are provided by Siya Healthcare, PLLC through licensed clinicians.';

/** Organizational clinical service footprint — controls where Siya Healthcare, PLLC offers telehealth. */
export const AVAILABLE_SERVICE_STATES = ['California', 'Texas', 'Pennsylvania', 'Florida'];

/** @deprecated Use AVAILABLE_SERVICE_STATES — alias for backward compatibility during migration */
export const LICENSED_STATES = AVAILABLE_SERVICE_STATES;

/** Display: California • Texas • Pennsylvania • Florida */
export const STATES_BULLET = LICENSED_STATES.join(' • ');

/** Prose: California, Texas, Pennsylvania, and Florida */
export const STATES_INLINE =
  'California, Texas, Pennsylvania, and Florida';

export const FOOTER_STATES_LINE = `Licensed clinicians providing telehealth care across ${STATES_INLINE}.`;

/** Mixed MD/NP/PA roster pages — avoid implying all clinicians are board-certified physicians. */
export const MIXED_ROSTER_CLINICIAN_PHRASE = 'Licensed, ADHD-CCSP–trained clinicians';

/** Canonical care-delivery pricing — NOT ADHD-specific; applies across service lines. */
export const PRICING = {
  path: '/pricing',
  legacyPath: '/membership-pricing',
  navLabel: 'Pricing',
  pageTitle: 'Pricing | Siya Health',
  initialEvaluation: {
    label: 'Initial Evaluation',
    amount: 149,
    display: '$149',
    period: 'one-time visit',
    description:
      'Structured clinician visit: history, goals, and a clear plan. Applies to ADHD, weight, metabolic, primary care, and telehealth pathways.',
  },
  nonControlledFollowUp: {
    label: 'Non-Controlled Medication Follow-Up',
    amount: 79,
    display: '$79',
    period: '/month',
    description:
      'Ongoing follow-up for non-controlled medications, lifestyle plans, labs review, and care coordination when appropriate.',
  },
  controlledFollowUp: {
    label: 'Controlled Medication Follow-Up',
    amount: 149,
    display: '$149',
    period: '/month',
    description:
      'Ongoing follow-up when controlled medications are part of your plan—including monitoring, dose adjustments, and safety checks per state law.',
  },
};

/** Three-slot CTA system — applied via normalizeSitewideCopy() */
export const CTA_SYSTEM = {
  primary: { label: 'Book Free Meet & Greet', url: REDIRECT_MEET_GREET_URL },
  secureChat: { label: 'Start Secure Medical Chat', url: REDIRECT_CHAT_URL },
  newsletter: {
    label: 'Join Our Health Guide',
    microcopy: 'Weekly evidence-based health insights from Siya Health physicians.',
    url: SIYA_CIRCLE_GHL_FORM_URL,
  },
  secondary: {
    booking: { label: 'View Telehealth Services', url: '/telehealth' },
    adhd: { label: 'Take Free ADHD Screening', url: '/adhd-screening?adhd=1' },
    weight: { label: 'View Pricing', url: '/pricing' },
    telehealth: { label: 'View Telehealth Services', url: '/telehealth' },
    default: { label: 'View Telehealth Services', url: '/telehealth' },
  },
};

/** Non-clinical Free Meet & Greet (CarePatron booking slot) — button labels only.
 *  This is a free discovery call, NOT a medical visit, diagnosis, or treatment. */
export const MEET_GREET_CTA = {
  label: 'Book Free Meet & Greet',
  screeningResultLabel: 'Book Free Meet & Greet',
  adhdMicrocopy:
    "We'll explain the ADHD evaluation process, pricing, and next steps. This is not a medical visit or diagnosis.",
  microcopy:
    'A short, free call to understand your needs, explain care options, and help you choose the right next step. This is not a medical visit, diagnosis, or treatment recommendation.',
  disclaimer:
    'This is not a medical visit, diagnosis, or treatment recommendation. No medication will be prescribed during this call.',
};

/** @deprecated Use MEET_GREET_CTA — kept for import compatibility */
export const WALKTHROUGH_CTA = MEET_GREET_CTA;

/** Legacy walkthrough/demo/consultation button labels → canonical MEET_GREET_CTA.label. */
export const LEGACY_WALKTHROUGH_CTA_LABELS = [
  'Book Free Walkthrough',
  'Book Free Evaluation Walkthrough',
  'Book Free ADHD Evaluation Walkthrough',
  'Book ADHD Evaluation Walkthrough',
  'Book Your ADHD Walkthrough',
  'Book ADHD Walkthrough',
  'Book Free ADHD Process Call',
  'Book ADHD Process Call',
  'Book Free Consultation',
  'Book Free ADHD Consultation',
  'Book Free ADHD Intro Call',
  'Book ADHD Walkthrough',
  'ADHD Evaluation Walkthrough',
  'Schedule Consultation',
  'Book Free Demo',
  'Book Demo',
];

/** Booking CTAs consolidated to primary label (regex-safe literals). */
export const REMOVED_BOOKING_CTA_LABELS = [
  'Talk to a Clinician',
  'Talk to a clinician',
  'Contact Care Team',
  'Contact care team',
  'Discovery Call',
  'Book Discovery Call',
  'Schedule a Quick Call',
  'Find the Right Starting Point',
  'Explore ADHD Care',
  'Explore ADHD care',
  'Talk to a Provider When You\'re Ready',
  'Start Here',
  'Learn More First',
  'Join the Waitlist',
  'Join Waitlist',
  'Book Your Free 15-Minute Discovery Call',
  'Book Consultation',
  'Book evaluation ($149)',
  'Book ADHD Evaluation online',
  'Book with Sneh',
  'Book with Natasha',
  'Book with Swati',
  'Book with Vanessa',
  'Book with Derek',
  'Book with Wendy',
  'Book with Megan',
];

/** Deleted blog URLs → canonical replacement (internal links only; vercel.json handles external redirects). */
export const REMOVED_BLOG_PATHS = {
  '/blog/all': '/blog',
  // Retargeted to /fatigue when the tiredness blog was retired — keeps this single-hop.
  '/blog/modafinil-for-focus-and-fatigue-is-it-safe': '/fatigue',
  '/blog/glutathione-and-peptides-what-do-they-actually-do': '/mens-health-longevity',
  '/blog/ambien-and-sleep-medications-risks-and-benefits': '/blog/insomnia-treatment-options-beyond-medication',
  '/adhd-evaluation-cost': '/pricing',
};

/** Brand pillars — patient-facing language (not SEO keyword stuffing). */
export const BRAND_PILLARS = [
  'Physician-led telehealth',
  'Whole-person care',
  'Evidence-based medicine',
  'Transparent pricing',
  'Long-term relationships',
  'Licensed clinicians',
  'Board-certified physicians',
  'HIPAA-compliant',
];

/** Phrases to replace sitewide (non-destructive) */
export const LEGACY_MARKETPLACE_PHRASES = [
  { from: /membership-based care/gi, to: 'physician-led telehealth' },
  { from: /concierge membership/gi, to: 'transparent pricing' },
  { from: /Join the Waitlist/gi, to: CTA_SYSTEM.primary.label },
  { from: /Join Waitlist/gi, to: CTA_SYSTEM.primary.label },
  { from: /Board-certified, ADHD-CCSP trained providers/gi, to: MIXED_ROSTER_CLINICIAN_PHRASE },
  { from: /membership plans/gi, to: 'follow-up plan pricing' },
  { from: /\bfree discovery call\b/gi, to: 'free Meet & Greet' },
];

/** Canonical provider positioning — generated from provider-canonical.json */
export const PROVIDER_CANONICAL = buildProviderAuditCanonical();

/** Approved user-facing copy — applied via normalizeSitewideCopy() */
export const COPY_STANDARDS = {
  primaryCta: CTA_SYSTEM.primary.label,
  primaryCtaUrl: CTA_SYSTEM.primary.url,
  secureChatCta: CTA_SYSTEM.secureChat.label,
  secureChatUrl: CTA_SYSTEM.secureChat.url,
  secondaryCta: CTA_SYSTEM.secondary.booking.label,
  secondaryCtaUrl: CTA_SYSTEM.secondary.booking.url,
  secondaryCtaTelehealth: CTA_SYSTEM.secondary.telehealth.label,
  adhdPrimaryCta: CTA_SYSTEM.secondary.adhd.label,
  weightPrimaryCta: CTA_SYSTEM.secondary.weight.label,
  adhdSecondaryCta: 'Take Free ADHD Screening',
  meetGreetCta: MEET_GREET_CTA.label,
  meetGreetMicrocopy: MEET_GREET_CTA.microcopy,
  meetGreetDisclaimer: MEET_GREET_CTA.disclaimer,
  meetGreetAdhdMicrocopy: MEET_GREET_CTA.adhdMicrocopy,
  walkthroughCta: MEET_GREET_CTA.label,
  walkthroughScreeningResultCta: MEET_GREET_CTA.screeningResultLabel,
  walkthroughMicrocopy: MEET_GREET_CTA.microcopy,
  walkthroughDisclaimer: MEET_GREET_CTA.disclaimer,
  newsletterCta: CTA_SYSTEM.newsletter.label,
  newsletterMicrocopy: CTA_SYSTEM.newsletter.microcopy,
  pricingNavLabel: PRICING.navLabel,
  pricingPath: PRICING.path,
  educationHub: 'Health Guides',
  reviewBadgePending: 'Clinician-informed',
  reviewBadgeReviewed: 'Physician reviewed',
};

/** Legacy footer strings to replace during seo-build */
export const LEGACY_FOOTER_PATTERNS = [
  'Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida.',
  'Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.',
  'Board-certified providers providing telehealth care across California, Texas, Florida, and Pennsylvania.',
  'Board-certified providers providing telehealth care across California, California, Texas, Pennsylvania, and Florida.',
  'Licensed clinicians providing telehealth care across Texas, Pennsylvania, and Florida.',
  'Modern telehealth care for ADHD, weight loss, and concierge primary care across California, California, Texas, Pennsylvania, and Florida.',
];

/**
 * Provider license display — sitewide helper copy pattern.
 * Provider state chips = credential transparency only; NOT service availability.
 */
export const PROVIDER_LICENSE_DISCLAIMER =
  'Provider licenses are displayed for transparency. Service availability is determined by Siya Healthcare, PLLC operational coverage.';

/** Canonical on-site legal URLs — driven by legal-documents.mjs registry */
export const LEGAL_LINKS = {
  hub: LEGAL_HUB.path,
  terms: LEGAL_PATHS['terms-of-use'],
  privacy: LEGAL_PATHS['privacy-policy'],
  noticeOfPrivacy: LEGAL_PATHS['notice-of-privacy-practices'],
  telehealthConsent: LEGAL_PATHS['telehealth-consent'],
  cookie: LEGAL_PATHS['cookie-policy'],
  controlledSubstanceTreatment: LEGAL_PATHS['controlled-substance-treatment-agreement'],
  /** @deprecated Use controlledSubstanceTreatment */
  controlledSubstance: LEGAL_PATHS['controlled-substance-treatment-agreement'],
  prescription: LEGAL_PATHS['prescription-policy'],
  /** Legacy paths — redirect via vercel.json until cutover complete */
  legacyTerms: '/terms',
  legacyPrivacy: '/privacy-policy',
};

/**
 * Root-level legal HTML superseded by /legal/* — excluded from sitemap and duplicate SEO audits.
 * vercel.json 301s handle production traffic; files retained for local builds.
 */
export const LEGACY_LEGAL_PAGE_META = {
  'privacy-policy.html': {
    destination: LEGAL_PATHS['privacy-policy'],
    title: 'Privacy Policy Redirect | Siya Health',
    h1: 'Privacy Policy has moved',
    description:
      'Legacy privacy policy URL. The current Privacy Policy is published at siya.health/legal/privacy-policy.',
  },
  'terms.html': {
    destination: LEGAL_PATHS['terms-of-use'],
    title: 'Terms of Use Redirect | Siya Health',
    h1: 'Terms of Use has moved',
    description:
      'Legacy terms URL. The current Terms of Use are published at siya.health/legal/terms-of-use.',
  },
};

export function isLegacyLegalPage(relPath) {
  return Object.hasOwn(LEGACY_LEGAL_PAGE_META, relPath);
}

/** Counsel-aligned ADHD clinical positioning — canonical copy blocks for generators and hardening. */
export const ADHD_POSITIONING = {
  practiceStatement:
    'Siya Health is not a psychiatry practice or psychology practice. ADHD care is delivered through internal medicine, family medicine, nurse practitioners, and physician associates using a structured primary care–led evaluation process.',
  toolsIndividualized:
    'Clinicians may use validated tools such as ASRS, DIVA, Wender Utah Rating Scale, SWAN, Creyos, and other clinically appropriate assessment methods based on the patient\'s presentation. No specific tool is required for every patient.',
  toolsEvaluationShort:
    'Your clinician may use one or more validated assessment tools as clinically appropriate.',
  toolsSupportDisclaimer:
    'Assessment tools support clinical evaluation but do not independently establish a diagnosis.',
  medicationNonGuarantee:
    'Diagnosis does not guarantee medication. Evaluation does not guarantee medication. Medication does not guarantee stimulants. Stimulant prescribing is never guaranteed.',
  metaDescription:
    'Primary care–led adult ADHD evaluation online — DSM-based assessment ($149). Licensed medical providers. Individualized validated tools as clinically appropriate. CA, TX, PA, FL.',
  stimulantCaveat:
    'Medication, including stimulant medication, is not guaranteed and depends on clinical judgment, state law, safety considerations, and medical appropriateness.',
  screeningNotDiagnosis:
    'Screening is not diagnosis. Assessment tools support clinical evaluation but do not independently establish a diagnosis.',
};
