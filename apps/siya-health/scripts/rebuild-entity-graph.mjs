/**
 * Rebuild data/entity-graph.json provider nodes from data/providers.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REVIEWER_OWNERSHIP } from '../data/content-review-registry.mjs';
import { getReviewedContentForProvider } from '../data/provider-reviewed-content.mjs';
import { BASE_URL, getAllProviders, toEntityGraphProvider } from '../data/providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_PATH = path.join(__dirname, '..', 'data', 'entity-graph.json');

const EXPERTISE_BY_SLUG = {
  'dr-sneh-pandey': ['adhd-diagnosis', 'adhd-medication', 'weight-loss', 'glp-1', 'metabolic-health', 'mens-health', 'telehealth'],
  'dr-vanessa-urbina': ['primary-care', 'adhd-diagnosis', 'weight-loss', 'lifestyle-medicine', 'telehealth'],
  'dr-natasha-desai': ['adhd-diagnosis', 'adhd-anxiety', 'behavioral-health', 'burnout', 'telehealth'],
  'dr-swati-pandey': ['adhd-medication', 'adhd-diagnosis', 'depression', 'anxiety', 'telehealth'],
  'megan-wunderlich': ['adhd-screening', 'mental-health', 'family-medicine', 'telehealth'],
  'wendy-delgado': ['weight-loss', 'glp-1', 'food-noise', 'patient-education', 'telehealth'],
};

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf8'));
const previousBySlug = Object.fromEntries((graph.providers || []).map((p) => [p.slug, p]));

const providers = getAllProviders().map((p) => {
  const base = toEntityGraphProvider(p);
  const prev = previousBySlug[p.slug] || {};
  const reviewed = getReviewedContentForProvider(p.slug);
  return {
    ...base,
    expertiseTopics: EXPERTISE_BY_SLUG[p.slug] || prev.expertiseTopics || [],
    reviewerForTopics: EXPERTISE_BY_SLUG[p.slug] || prev.reviewerForTopics || [],
    relatedContent: reviewed.map((r) => r.path),
    reviewerOwnership: REVIEWER_OWNERSHIP,
  };
});

graph.version = new Date().toISOString().slice(0, 10);
graph.providers = providers;
graph.organization.employee = providers.map((p) => ({ '@id': p['@id'] }));
graph.organization.medicalSpecialty = [
  'Internal Medicine',
  'Family Medicine',
  'Obesity Medicine',
  'Adult ADHD',
  'Behavioral Medicine',
];

fs.writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2) + '\n', 'utf8');
console.log(`Rebuilt entity-graph.json with ${providers.length} providers`);
