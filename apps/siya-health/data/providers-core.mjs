import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

export const BASE_URL = 'https://siya.health';
export const CAREPATRON_BASE = 'https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA';
/** Spruce secure medical chat — primary sitewide entry CTA (v2.0) */
export const SPRUCE_CHAT_URL = 'https://spruce.care/siyahealth';
/** Schedule Consultation — secure medical chat (replaces legacy CarePatron sysv73e4 slot) */
export const BOOKING_LINK = SPRUCE_CHAT_URL;
/** @deprecated Legacy CarePatron consultation slot — do not use in new CTAs */
export const LEGACY_CAREPATRON_CONSULTATION_LINK = `${CAREPATRON_BASE}&i=sysv73e4`;
/** ADHD evaluation walkthrough (non-clinical) */
export const ADHD_WALKTHROUGH_LINK = `${CAREPATRON_BASE}&i=ftxOxenx`;
/** $199 adult ADHD evaluation booking */
export const ADHD_EVALUATION_199_LINK = `${CAREPATRON_BASE}&i=bxrKBOuk`;
export const PROFILE_LAST_UPDATED = '2026-06-05';

export const PROVIDER_PHOTO_PLACEHOLDER = 'assets/provider-placeholder.svg';

function providerPhotoFileExists(photoPath) {
  if (!photoPath) return false;
  const rel = String(photoPath).replace(/^\//, '');
  return fs.existsSync(path.join(SITE_ROOT, rel));
}

export function providerPhotoInitials(provider) {
  const g = provider.givenName?.[0] || '';
  const f = provider.familyName?.[0] || '';
  return (g + f).toUpperCase() || '?';
}

/** @returns {{ src: string, alt: string, pending: boolean, initials: string, pendingNote: string }} */
export function resolveProviderPhoto(provider) {
  let status = provider.photoStatus || 'approved';
  if (status === 'pending' && providerPhotoFileExists(provider.photo)) {
    status = 'approved';
  }
  const credential = provider.honorificSuffix || provider.credentials?.[0] || '';
  const name = provider.displayName || provider.name;

  if (status === 'approved') {
    return {
      src: provider.photo,
      alt: provider.altText || name,
      pending: false,
      initials: '',
      pendingNote: '',
    };
  }

  const nameAlreadyHasCredential = credential && name.includes(credential);
  const altCredential = credential && !nameAlreadyHasCredential ? `, ${credential}` : '';
  return {
    src: PROVIDER_PHOTO_PLACEHOLDER,
    alt: `${name}${altCredential} — profile image pending`,
    pending: true,
    initials: providerPhotoInitials(provider),
    pendingNote: 'Profile photo pending',
  };
}
