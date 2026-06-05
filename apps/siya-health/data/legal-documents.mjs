/**
 * Legal document registry — single source of truth for URLs, metadata, and publish status.
 * Counsel-approved body text lives in legal-document-versions/{slug}.md (drop-in).
 * Generated pages: scripts/generate-legal-pages.mjs
 */
/** Counsel-approved effective date — keep in sync with site-standards.mjs LEGAL_EFFECTIVE_DATE */
export const LEGAL_EFFECTIVE_DATE = '2025-10-31';

export const LEGAL_DOC_STATUS = {
  DRAFT: 'draft',
  COUNSEL_REVIEW: 'counsel_review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  PLANNED: 'planned',
};

/** @typedef {'draft'|'counsel_review'|'approved'|'published'|'planned'} LegalDocStatus */

/** Phase 2 — counsel-approved stack (live on site) */
export const PUBLISHED_LEGAL_DOCUMENTS = [
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    version: '1.0.0-counsel',
    status: LEGAL_DOC_STATUS.PUBLISHED,
    sourceFile: 'legal-document-versions/terms-of-use.md',
    requiresAcceptance: true,
    legacyPaths: ['/terms'],
    relatedSlugs: ['privacy-policy', 'notice-of-privacy-practices'],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    version: '1.0.0-counsel',
    status: LEGAL_DOC_STATUS.PUBLISHED,
    sourceFile: 'legal-document-versions/privacy-policy.md',
    requiresAcceptance: false,
    legacyPaths: ['/privacy-policy'],
    relatedSlugs: ['notice-of-privacy-practices', 'terms-of-use'],
  },
  {
    slug: 'notice-of-privacy-practices',
    title: 'Notice of Privacy Practices',
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    version: '1.0.0-counsel',
    status: LEGAL_DOC_STATUS.PUBLISHED,
    sourceFile: 'legal-document-versions/notice-of-privacy-practices.md',
    requiresAcceptance: true,
    legacyPaths: [],
    relatedSlugs: ['privacy-policy', 'terms-of-use'],
  },
  {
    slug: 'controlled-substance-treatment-agreement',
    title: 'Controlled Substance Treatment Agreement',
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    version: '1.0.0-operations',
    status: LEGAL_DOC_STATUS.PUBLISHED,
    sourceFile: 'legal-document-versions/controlled-substance-treatment-agreement.md',
    requiresAcceptance: true,
    legacyPaths: [],
    relatedSlugs: ['terms-of-use', 'notice-of-privacy-practices', 'privacy-policy'],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    version: '1.0.0-operations',
    status: LEGAL_DOC_STATUS.PUBLISHED,
    sourceFile: 'legal-document-versions/cookie-policy.md',
    requiresAcceptance: false,
    legacyPaths: [],
    relatedSlugs: ['privacy-policy'],
  },
];

/** Future policies — registry only; no generated pages until counsel approves */
export const PLANNED_LEGAL_DOCUMENTS = [
  {
    slug: 'telehealth-consent',
    title: 'Telehealth Informed Consent',
    effectiveDate: null,
    version: '0.0.0-planned',
    status: LEGAL_DOC_STATUS.PLANNED,
    sourceFile: 'legal-document-versions/telehealth-consent.md',
    requiresAcceptance: true,
    legacyPaths: [],
    relatedSlugs: ['notice-of-privacy-practices', 'terms-of-use'],
  },
  {
    slug: 'controlled-substance-policy',
    title: 'Controlled Substance Policy',
    effectiveDate: null,
    version: '0.0.0-planned',
    status: LEGAL_DOC_STATUS.PLANNED,
    sourceFile: 'legal-document-versions/controlled-substance-policy.md',
    requiresAcceptance: false,
    legacyPaths: [],
    relatedSlugs: ['terms-of-use'],
  },
  {
    slug: 'prescription-policy',
    title: 'Prescription Policy',
    effectiveDate: null,
    version: '0.0.0-planned',
    status: LEGAL_DOC_STATUS.PLANNED,
    sourceFile: 'legal-document-versions/prescription-policy.md',
    requiresAcceptance: false,
    legacyPaths: [],
    relatedSlugs: ['terms-of-use'],
  },
];

/** All registry entries (published + planned) */
export const LEGAL_DOCUMENTS = [...PUBLISHED_LEGAL_DOCUMENTS, ...PLANNED_LEGAL_DOCUMENTS];

/** Hub index — not a counsel document; generated from registry */
export const LEGAL_HUB = {
  slug: 'legal',
  title: 'Legal & Compliance',
  path: '/legal',
};

export function getLegalDocument(slug) {
  return LEGAL_DOCUMENTS.find((d) => d.slug === slug) ?? null;
}

export function getPublishedLegalDocument(slug) {
  return PUBLISHED_LEGAL_DOCUMENTS.find((d) => d.slug === slug) ?? null;
}

export function getLegalPath(slug) {
  return `/legal/${slug}`;
}

/** Map slug → canonical path for footer and cross-links (published only) */
export const LEGAL_PATHS = Object.fromEntries(
  PUBLISHED_LEGAL_DOCUMENTS.map((d) => [d.slug, getLegalPath(d.slug)]),
);

/** Documents requiring intake clickwrap (GHL) — published only */
export const INTAKE_ACCEPTANCE_SLUGS = PUBLISHED_LEGAL_DOCUMENTS.filter((d) => d.requiresAcceptance).map(
  (d) => d.slug,
);
