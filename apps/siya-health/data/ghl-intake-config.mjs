/**
 * Intake legal acceptance — field keys, policy versions, and booking URL.
 * Booking is CarePatron (BOOKING_LINK); GHL form IDs retained for legacy intake field mapping.
 * Client bundle: scripts/ghl-legal-acceptance.js (loaded on /intake only via site-chrome.mjs)
 */
import { BOOKING_LINK } from './providers-core.mjs';
import { LEGAL_EFFECTIVE_DATE, PUBLISHED_LEGAL_DOCUMENTS } from './legal-documents.mjs';

export const GHL_FORM_ID = 'mnWpgh0IEgFvJymdZqHY';
export const GHL_FORM_HOST_PATTERN = 'link.yourmarketingai.com/widget/form/';
/** Primary booking URL — CarePatron direct scheduling */
export const GHL_BOOKING_URL = BOOKING_LINK;

/** Hidden / custom field keys — must match GHL form + workflow field mapping */
export const GHL_LEGAL_FIELDS = {
  timestamp: 'legal_acceptance_timestamp',
  source: 'legal_acceptance_source',
  version: 'legal_document_version',
  terms: 'legal_acceptance_terms',
  privacy: 'legal_acceptance_privacy',
  npp: 'legal_acceptance_npp',
};

export const LEGAL_LINK_PATHS = {
  terms: '/legal/terms-of-use',
  privacy: '/legal/privacy-policy',
  npp: '/legal/notice-of-privacy-practices',
};

const versionBySlug = Object.fromEntries(
  PUBLISHED_LEGAL_DOCUMENTS.map((d) => [d.slug, d.version]),
);

/** Serialized policy version passed to GHL on every acceptance */
export function legalDocumentVersionString() {
  return [
    `terms:${versionBySlug['terms-of-use']}`,
    `privacy:${versionBySlug['privacy-policy']}`,
    `npp:${versionBySlug['notice-of-privacy-practices']}`,
    `effective:${LEGAL_EFFECTIVE_DATE}`,
  ].join(';');
}

export const LEGAL_ACCEPTANCE_COPY = {
  checkboxTerms: 'I agree to the Terms of Use',
  checkboxPrivacy: 'I acknowledge the Privacy Policy',
  checkboxNpp: 'I acknowledge the Notice of Privacy Practices',
  submitConfirmation:
    'By submitting this form, I confirm that I have read and agree to the Terms of Use, Privacy Policy, and Notice of Privacy Practices. I understand that submitting this form does not establish a physician-patient relationship, does not guarantee treatment or medication, and does not constitute emergency medical care.',
  adhdDisclaimer:
    'I understand that ADHD screening tools are not diagnostic. Any diagnosis, treatment recommendation, or medication decision requires a clinical evaluation by a licensed clinician. Medication, including stimulant medication, is never guaranteed and is prescribed only when clinically appropriate and permitted by applicable law.',
  modalTitle: 'Before you continue',
  modalSubmit: 'Continue to booking',
  modalCancel: 'Cancel',
};

/** JSON-safe config exported to window.SIYA_GHL_INTAKE at build time */
export function buildClientIntakeConfig() {
  return {
    formId: GHL_FORM_ID,
    bookingUrl: GHL_BOOKING_URL,
    hostPattern: GHL_FORM_HOST_PATTERN,
    fields: GHL_LEGAL_FIELDS,
    legalLinks: LEGAL_LINK_PATHS,
    legalDocumentVersion: legalDocumentVersionString(),
    copy: LEGAL_ACCEPTANCE_COPY,
  };
}
