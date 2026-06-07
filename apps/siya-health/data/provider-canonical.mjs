/**
 * Single source of truth for provider display fields (roles, credentials, states, bios, SEO).
 * Narrative profile content remains in providers.mjs / providers-additional.mjs.
 */
import canonicalJson from './provider-canonical.json' with { type: 'json' };

const { providers: CANONICAL_BY_SLUG } = canonicalJson;

export function getCanonicalProvider(slug) {
  return CANONICAL_BY_SLUG[slug] ?? null;
}

export function getAllCanonicalProviders() {
  return Object.entries(CANONICAL_BY_SLUG).map(([slug, record]) => ({ slug, ...record }));
}

/** Hub card presentation — derived from canonical only. */
export function getProviderHubPresentation(slug) {
  const c = getCanonicalProvider(slug);
  if (!c) return null;
  return {
    role: c.role.hub,
    credentials: c.credentials.hubLine || '',
    focus: c.focus.hubTags,
    description: c.positioning.hubBio,
  };
}

/** Service-page / meet-physicians tagline for a provider on a given service key. */
export function getServiceTagline(slug, serviceKey) {
  const c = getCanonicalProvider(slug);
  if (!c) return null;
  const map = c.positioning.serviceTaglines || {};
  return map[serviceKey] ?? c.positioning.defaultTagline ?? null;
}

/** Audit matrix for site-standards.mjs — generated from canonical JSON. */
export function buildProviderAuditCanonical() {
  const out = {};
  for (const [slug, c] of Object.entries(CANONICAL_BY_SLUG)) {
    out[slug] = {
      role: c.role.hub,
      credentials: c.credentials.hubLine || '',
      focus: c.credentials.auditFocus ?? c.focus.audit,
    };
  }
  return out;
}

/**
 * Merge canonical display fields onto a provider object (after internal records).
 * Narrative fields (bios, clinicalFocus, testimonials) are untouched.
 */
export function applyCanonicalToProvider(provider) {
  const c = getCanonicalProvider(provider.slug);
  if (!c) return provider;

  const serviceTaglines = {
    default: c.positioning.defaultTagline,
    ...(c.positioning.serviceTaglines || {}),
  };

  return {
    ...provider,
    role: c.role.profileHero,
    homepageRole: c.role.homepage,
    homepageBio: c.positioning.homepageBio,
    servicePageTagline: c.positioning.defaultTagline,
    serviceTaglines,
    statesDisplayHub: c.states.display.hub,
    statesDisplayHomepage: c.states.display.homepageCards,
    credentialChips: [...c.credentials.chips],
    seo: {
      title: c.seo.title,
      description: c.seo.description,
      focusLead: c.seo.focusLead,
    },
    schema: {
      ...provider.schema,
      jobTitle: c.role.schemaJobTitle,
      medicalSpecialty: c.schema.medicalSpecialty,
      knowsAbout: c.schema.knowsAbout,
    },
    hubRole: c.role.hub,
    hubCredentials: c.credentials.hubLine,
    hubFocus: c.focus.hubTags,
    hubBio: c.positioning.hubBio,
    canonical: c,
  };
}
