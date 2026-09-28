/**
 * Per-provider Klarity figures. Manual check of the public profile badge, not a live API.
 *
 * Last verified: 2026-09-28.
 * The number shown is the badge on the profile ("4.72 · 299 reviews"), which matches
 * that page's AggregateRating. Klarity's page data also has a slightly lower reviewCount
 * field; that field is not the number printed next to the provider's name.
 *
 * These are Klarity's aggregates of post-visit patient surveys. Siya does not compile them.
 */
export const PROVIDER_KLARITY_CHECKED = '2026-09-28';

/** Numeric badge only when the public review count is above this. */
export const MIN_KLARITY_REVIEWS = 50;

export const PROVIDER_KLARITY = {
  'dr-sneh-pandey': {
    rating: '4.72',
    reviewCount: 299,
    profileUrl: 'https://www.helloklarity.com/provider/sneh-pandey',
    lastVerified: '2026-09-28',
  },
  'dr-swati-pandey': {
    rating: '4.93',
    reviewCount: 139,
    profileUrl: 'https://www.helloklarity.com/provider/swati-pandey',
    lastVerified: '2026-09-28',
  },
  'dr-vanessa-urbina': {
    rating: '4.17',
    reviewCount: 20,
    profileUrl: 'https://www.helloklarity.com/provider/vanessa-urbina',
    lastVerified: '2026-09-28',
  },
  'dr-natasha-desai': {
    rating: '4.93',
    reviewCount: 67,
    profileUrl: 'https://www.helloklarity.com/provider/natasha-desai',
    lastVerified: '2026-09-28',
  },
  'megan-wunderlich': {
    rating: '4.43',
    reviewCount: 12,
    profileUrl: 'https://www.helloklarity.com/provider/megan-wunderlich',
    lastVerified: '2026-09-28',
  },
  'wendy-delgado': {
    rating: '4.83',
    reviewCount: 58,
    profileUrl: 'https://www.helloklarity.com/provider/wendy-delgado',
    lastVerified: '2026-09-28',
  },
};
