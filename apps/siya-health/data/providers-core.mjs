export const BASE_URL = 'https://siya.health';
export const BOOKING_LINK = 'https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY';
export const PROFILE_LAST_UPDATED = '2026-06-05';

export const PROVIDER_PHOTO_PLACEHOLDER = 'assets/provider-placeholder.svg';

export function providerPhotoInitials(provider) {
  const g = provider.givenName?.[0] || '';
  const f = provider.familyName?.[0] || '';
  return (g + f).toUpperCase() || '?';
}

/** @returns {{ src: string, alt: string, pending: boolean, initials: string, pendingNote: string }} */
export function resolveProviderPhoto(provider) {
  const status = provider.photoStatus || 'approved';
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
