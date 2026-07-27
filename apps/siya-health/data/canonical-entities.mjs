/**
 * Canonical Entity registry for Entity Utilization analytics.
 * Paths must stay aligned with Taxonomy v1 / graph:observe inventory.
 */
export const CANONICAL_ENTITIES = {
  '/primary-care': {
    entity: 'primary_care',
    entity_family: 'root_service',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary'],
  },
  '/preventive-care': {
    entity: 'preventive_care',
    entity_family: 'service',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary'],
  },
  '/adult-adhd-california': {
    entity: 'adult_adhd_california',
    entity_family: 'condition',
    care_pathway: 'adhd',
    state: 'CA',
    primaryCtaHints: ['adhd-screening', 'adhd-evaluation', 'meet-greet', 'walkthrough'],
  },
  '/fatigue': {
    entity: 'fatigue',
    entity_family: 'symptom',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary'],
  },
  '/brain-fog': {
    entity: 'brain_fog',
    entity_family: 'symptom',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary'],
  },
  '/labs/cbc': {
    entity: 'lab_cbc',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
  '/labs/cmp': {
    entity: 'lab_cmp',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
  '/labs/lipid-panel': {
    entity: 'lab_lipid_panel',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
  '/labs/a1c-blood-sugar': {
    entity: 'lab_a1c',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
  '/labs/thyroid': {
    entity: 'lab_thyroid',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
  '/labs/iron-ferritin': {
    entity: 'lab_ferritin',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
  '/labs/vitamin-b12': {
    entity: 'lab_vitamin_b12',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
  '/labs/vitamin-d': {
    entity: 'lab_vitamin_d',
    entity_family: 'laboratory',
    care_pathway: 'primary_care',
    primaryCtaHints: ['book-appointment', 'meet-greet', 'primary', 'labs'],
  },
};

/** Normalized pathname (no trailing slash except root). */
export function normalizeEntityPath(pathname) {
  if (!pathname) return '/';
  const bare = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return bare;
}

export function resolveCanonicalEntity(pathname) {
  return CANONICAL_ENTITIES[normalizeEntityPath(pathname)] || null;
}

export const CANONICAL_PATHS = Object.keys(CANONICAL_ENTITIES);
