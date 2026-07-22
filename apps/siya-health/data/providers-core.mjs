import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

export const BASE_URL = 'https://siya.health';
export const CAREPATRON_BASE = 'https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA';
/** Spruce secure medical chat — questions / not ready to book */
export const SPRUCE_CHAT_URL = 'https://spruce.care/siyahealth';
/** Internal transition pages (Google Ads conversion tracking) */
export const REDIRECT_CHAT_URL = '/redirect/chat';
export const REDIRECT_MEET_GREET_URL = '/redirect/meet-greet';
/** @deprecated Legacy path — same destination as meet-greet; kept for tracking compatibility */
export const REDIRECT_ADHD_WALKTHROUGH_URL = '/redirect/adhd-walkthrough';
export const REDIRECT_ADHD_EVALUATION_URL = '/redirect/adhd-evaluation';
export const ZOCDOC_BOOKING_URL =
  'https://www.zocdoc.com/booking-link/practice/siya-healthcare-182234';
/** Direct-pay laboratory storefront (Rupa Health) — browse tests & pricing externally */
export const RUPA_LAB_STOREFRONT_URL =
  'https://labs.rupahealth.com/store/storefront_42daXx7';
/** Free 15-minute Meet & Greet / discovery call (non-clinical) */
export const MEET_GREET_BOOKING_URL = `${CAREPATRON_BASE}&i=kkarJfxH`;
/** @deprecated Alias — intro call / walkthrough now routes to Meet & Greet slot */
export const ADHD_WALKTHROUGH_LINK = MEET_GREET_BOOKING_URL;
/** $149 adult ADHD evaluation booking */
export const ADHD_EVALUATION_199_LINK = `${CAREPATRON_BASE}&i=bxrKBOuk`;
/** Primary low-friction booking — Free Meet & Greet */
export const BOOKING_LINK = MEET_GREET_BOOKING_URL;
/** @deprecated Legacy CarePatron consultation slot — migrates to walkthrough */
export const LEGACY_CAREPATRON_CONSULTATION_LINK = `${CAREPATRON_BASE}&i=sysv73e4`;
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
