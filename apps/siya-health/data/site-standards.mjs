/**
 * Sitewide copy standards — states, footer, Health Guides naming.
 */
import { LEGAL_HUB, LEGAL_PATHS } from './legal-documents.mjs';

import { LEGAL_EFFECTIVE_DATE as LEGAL_EFFECTIVE_DATE_ISO } from './legal-documents.mjs';

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

export const FOOTER_STATES_LINE = `Board-certified providers providing telehealth care across ${STATES_INLINE}.`;

/** Approved user-facing copy — applied via normalizeSitewideCopy() */
export const COPY_STANDARDS = {
  primaryCta: 'Talk to a Clinician',
  secondaryCta: 'Find the Right Starting Point',
  adhdPrimaryCta: 'Book ADHD Evaluation',
  adhdSecondaryCta: 'Free ADHD Screening',
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
    'Primary care–led adult ADHD evaluation online — DSM-based assessment ($199). Licensed medical providers. Individualized validated tools as clinically appropriate. CA, TX, PA, FL.',
  stimulantCaveat:
    'Medication, including stimulant medication, is not guaranteed and depends on clinical judgment, state law, safety considerations, and medical appropriateness.',
  screeningNotDiagnosis:
    'Screening is not diagnosis. Assessment tools support clinical evaluation but do not independently establish a diagnosis.',
};
