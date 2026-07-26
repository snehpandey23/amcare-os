/**
 * Siya Knowledge Governance Framework v1.0 — Reusable Content Block Registry.
 *
 * The UNIT OF GOVERNANCE is the block, not the page.
 * Audits ask "which blocks are unsafe?" — not "which pages contain unsafe things?"
 *
 * Every content-bearing block declares:
 *   - owner: { clinical, editorial, engineering }
 *   - allowedTopics / allowedPaths: where it may render (Clinical Context gate)
 *   - entity: canonical knowledge-graph entity it belongs to (graph is the source of truth)
 *   - version + approved: change history anchor
 *   - clinicalReview: 'approved' | 'pending' | 'n/a'
 *   - status: 'production' | 'deprecated' | 'chrome'
 *   - generator: file/function that emits it
 *
 * Consumed by: scripts/validate-block-registry.mjs
 * Layer order: Knowledge Graph → Content Assembly → Validation → Audit
 */

/** @typedef {'adhd'|'weight-loss'|'mens-health'|'womens-health'|'telehealth'|'labs'|'primary-care'|'any'} Topic */

export const ALL_TOPICS = ['adhd', 'weight-loss', 'mens-health', 'womens-health', 'telehealth', 'labs', 'primary-care'];

/**
 * @type {Array<{
 *   id: string, name: string, kind: 'clinical'|'editorial'|'cta'|'geo'|'chrome'|'navigation',
 *   entity?: string, allowedTopics: Topic[]|'any', allowedPaths?: RegExp,
 *   owner: { clinical: string, editorial: string, engineering: string },
 *   version: string, approved: string, clinicalReview: 'approved'|'pending'|'n/a',
 *   status: 'production'|'deprecated'|'chrome', generator: string, notes?: string
 * }>}
 */
export const CONTENT_BLOCKS = [
  // ── Clinical blocks (Clinical Safety + Context governed) ───────────────
  {
    id: 'coordination-of-care',
    name: 'Coordinating medical care (topic-gated prep)',
    kind: 'clinical',
    entity: 'per-topic',
    allowedTopics: 'any',
    owner: { clinical: 'Dr. Swati Pandey', editorial: 'Content OS', engineering: 'answer-seeds generator' },
    version: 'v2.0',
    approved: '2026-07-26',
    clinicalReview: 'approved',
    status: 'production',
    generator: 'data/answer-seeds.mjs → phase5CoordinationSection',
    notes: 'Prep + normal-results paragraphs are topic+slug unique. Must never carry ADHD onset language off ADHD topic.',
  },
  {
    id: 'adhd-visit-prep',
    name: 'ADHD childhood-vs-adult onset prep',
    kind: 'clinical',
    entity: 'adult-adhd',
    allowedTopics: ['adhd'],
    owner: { clinical: 'Dr. Natasha Desai', editorial: 'ADHD Cluster', engineering: 'content-assembly' },
    version: 'v2.0',
    approved: '2026-07-26',
    clinicalReview: 'approved',
    status: 'production',
    generator: 'scripts/content-assembly.mjs → visitPrepParagraph',
    notes: 'Previously bled onto 12 non-ADHD guides (P0). Now gated to ADHD topic/slug family.',
  },
  {
    id: 'glp1-emergency-node',
    name: 'GLP-1 emergency decision node',
    kind: 'clinical',
    entity: 'glp1-therapy',
    allowedTopics: ['weight-loss'],
    allowedPaths: /glp-1|semaglutide|tirzepatide|ozempic|wegovy|mounjaro|compounded|weight/i,
    owner: { clinical: 'Dr. Swati Pandey', editorial: 'Metabolic Cluster', engineering: 'answer-engagement generator' },
    version: 'v2.0',
    approved: '2026-07-26',
    clinicalReview: 'approved',
    status: 'production',
    generator: 'scripts/answer-engagement-system.mjs → defaultDecisionNodes (isGlp1Page gate)',
    notes: 'Emergency abdominal-pain guidance. Previously rendered on fatigue/labs pages (P0). Now gated by isGlp1Page().',
  },
  {
    id: 'trt-monitoring-disclaimer',
    name: 'TRT monitoring / fertility disclaimer',
    kind: 'clinical',
    entity: 'testosterone-therapy',
    allowedTopics: ['mens-health'],
    owner: { clinical: 'Dr. Sneh Pandey', editorial: "Men's Cluster", engineering: 'answer-seeds generator' },
    version: 'v1.0',
    approved: '2026-07-26',
    clinicalReview: 'approved',
    status: 'production',
    generator: 'data/answer-seeds.mjs (mens-health coordination)',
  },
  {
    id: 'SIYA:PRIMARY-CARE-FAQ',
    name: 'Primary & urgent care FAQ + FAQPage schema',
    kind: 'clinical',
    entity: 'primary-care',
    allowedTopics: ['primary-care'],
    owner: { clinical: 'Dr. Swati Pandey', editorial: 'Content OS', engineering: 'primary-urgent-care page' },
    version: 'v1.0',
    approved: '2026-07-26',
    clinicalReview: 'approved',
    status: 'production',
    generator: 'primary-urgent-care.html (injected)',
  },

  // ── CTA blocks (User journey; one primary per page) ────────────────────
  {
    id: 'SIYA:CONTEXT-CLOSING',
    name: 'Answer context-aware closing (one primary CTA)',
    kind: 'cta',
    entity: 'per-topic',
    allowedTopics: 'any',
    allowedPaths: /answers\//,
    owner: { clinical: 'n/a', editorial: 'Content OS', engineering: 'answer generator' },
    version: 'v1.0',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/content-assembly.mjs → renderContextAwareClosing',
    notes: 'Unique per slug. Carries the single primary CTA on answer pages.',
  },
  {
    id: 'SIYA:BLOG-CTA-ADHD',
    name: 'ADHD screening blog CTA band',
    kind: 'cta',
    entity: 'adult-adhd',
    allowedTopics: ['adhd'],
    // Mirrors generator gate: apply-conversion-cleanup.mjs → isAdhdBlog()
    allowedPaths: /(adhd|adderall|vyvanse|focalin|stimulant|creyos)/i,
    owner: { clinical: 'n/a', editorial: 'ADHD Cluster', engineering: 'conversion-cleanup generator' },
    version: 'v1.1',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/conversion-cleanup-content.mjs → renderBlogCtaAdhd',
    notes: 'Topic-gated by isAdhdBlog(). Must not appear on metabolic/hormone blogs.',
  },
  {
    id: 'SIYA:BLOG-CTA-METABOLIC',
    name: 'Metabolic / men’s / energy blog CTA band',
    kind: 'cta',
    entity: 'metabolic-health',
    allowedTopics: ['weight-loss', 'mens-health', 'telehealth'],
    // Mirrors generator gate: apply-conversion-cleanup.mjs → classifyBlogMetabolic()
    // (weight/metabolic + men's health + fatigue/sleep→telehealth funnels)
    allowedPaths: /(weight|glp|glp-1|semaglutide|tirzepatide|metabolic|insulin|phentermine|ozempic|food-noise|obesity|testosterone|hormone|minoxidil|erectile|sildenafil|hair-loss|longevity|libido|tired|fatigue|sleep|apnea|insomnia|energy)/i,
    owner: { clinical: 'n/a', editorial: 'Metabolic Cluster', engineering: 'conversion-cleanup generator' },
    version: 'v1.1',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/conversion-cleanup-content.mjs → renderBlogCtaMetabolic',
  },
  {
    id: 'SIYA:ADHD-NEXT-STEPS',
    name: 'ADHD "what happens next" journey',
    kind: 'cta',
    entity: 'adult-adhd',
    allowedTopics: ['adhd'],
    owner: { clinical: 'n/a', editorial: 'ADHD Cluster', engineering: 'conversion-cleanup generator' },
    version: 'v1.1',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/conversion-cleanup-content.mjs → renderAdhdNextSteps',
    notes: 'Reduced to one primary CTA (screening) + secondary text links.',
  },
  {
    id: 'SIYA:PRICING-STRIP',
    name: 'Transparent pricing strip',
    kind: 'cta',
    entity: 'pricing',
    allowedTopics: 'any',
    owner: { clinical: 'n/a', editorial: 'Content OS', engineering: 'conversion-cleanup generator' },
    version: 'v1.0',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/conversion-cleanup-content.mjs → renderPricingStrip',
    notes: 'Price source of truth = data/site-standards.mjs PRICING. Never hard-code.',
  },
  {
    id: 'SIYA:ANSWERS-ADHD-CARE-PATHWAYS',
    name: 'Answers hub next-step',
    kind: 'cta',
    entity: 'adult-adhd',
    allowedTopics: ['adhd'],
    allowedPaths: /answers\/index\.html/,
    owner: { clinical: 'n/a', editorial: 'Content OS', engineering: 'adhd-commercial-links' },
    version: 'v2.0',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'data/adhd-commercial-links.mjs → renderAnswersHubCarePathwaysSection',
    notes: '≤3 links + 1 button. State availability = one sentence, no directory.',
  },
  {
    id: 'SIYA:ADHD-BLOG-CARE-PATHWAYS',
    name: 'ADHD blog hub care pathways',
    kind: 'cta',
    entity: 'adult-adhd',
    allowedTopics: ['adhd'],
    allowedPaths: /blog\/adhd\.html/,
    owner: { clinical: 'n/a', editorial: 'ADHD Cluster', engineering: 'adhd-commercial-links' },
    version: 'v2.0',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'data/adhd-commercial-links.mjs → renderBlogAdhdCarePathwaysSection',
    notes: 'Was 19 links (P0). Capped to ≤3 + 1 button.',
  },

  // ── Geo blocks (Geography gate; only on geo landers) ──────────────────
  {
    id: 'SIYA:CA-GEO-PARAGRAPH',
    name: 'California metro context paragraph',
    kind: 'geo',
    entity: 'adhd-california',
    allowedTopics: ['adhd'],
    allowedPaths: /california|adult-adhd-screening-california/i,
    owner: { clinical: 'n/a', editorial: 'ADHD Cluster', engineering: 'ca-city-linking' },
    version: 'v1.1',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/apply-california-city-linking.mjs → geoParagraphBlock',
    notes: 'Removed from educational guides. Geo landers only.',
  },
  {
    id: 'SIYA:CA-CITY-CLUSTER',
    name: 'California city cluster links',
    kind: 'geo',
    entity: 'adhd-california',
    allowedTopics: ['adhd'],
    allowedPaths: /california|adult-adhd-screening-california/i,
    owner: { clinical: 'n/a', editorial: 'ADHD Cluster', engineering: 'ca-city-linking' },
    version: 'v1.1',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/apply-california-city-linking.mjs → cityClusterBlock',
  },
  {
    id: 'SIYA:CA-CITY-ANSWER',
    name: 'California metro directory on answers',
    kind: 'geo',
    entity: 'adhd-california',
    allowedTopics: [],
    owner: { clinical: 'n/a', editorial: 'ADHD Cluster', engineering: 'ca-city-linking' },
    version: 'v0-retired',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'deprecated',
    generator: 'scripts/apply-california-city-linking.mjs (now strips this)',
    notes: 'RETIRED. Metro directory on educational guides = geography bleed. Must never render.',
  },
  {
    id: 'SIYA:ADHD-SHADOW-GEO-CONTEXT',
    name: 'Shadow LP geo context',
    kind: 'geo',
    entity: 'adhd-geo',
    allowedTopics: ['adhd'],
    allowedPaths: /adhd-diagnosis-|adhd-treatment-/i,
    owner: { clinical: 'n/a', editorial: 'ADHD Cluster', engineering: 'adhd-commercial-links' },
    version: 'v2.0',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'data/adhd-commercial-links.mjs → renderShadowLpGeoContext',
    notes: 'Capped; no metro directory dump.',
  },

  // ── Editorial / navigation blocks ─────────────────────────────────────
  {
    id: 'SIYA:ANSWERS-TOPIC-CLUSTERS',
    name: 'Health Guides topic cluster explorer',
    kind: 'navigation',
    entity: 'knowledge-graph',
    allowedTopics: 'any',
    allowedPaths: /answers\/index\.html/,
    owner: { clinical: 'n/a', editorial: 'Content OS', engineering: 'answer generator' },
    version: 'v1.0',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/generate-answer-pages.mjs → buildIndexClusterExplorerHtml',
    notes: 'Renders from content-topic-clusters (graph). Generator must not invent relationships.',
  },
  {
    id: 'SIYA:GUIDE-SEARCH',
    name: 'Health Guides search',
    kind: 'navigation',
    entity: 'knowledge-graph',
    allowedTopics: 'any',
    allowedPaths: /answers\/index\.html/,
    owner: { clinical: 'n/a', editorial: 'Content OS', engineering: 'answer generator + guide-search.js' },
    version: 'v1.0',
    approved: '2026-07-26',
    clinicalReview: 'n/a',
    status: 'production',
    generator: 'scripts/generate-answer-pages.mjs',
  },

  // ── Chrome (engineering-owned; not clinically/editorially gated) ───────
  { id: 'SIYA:TRACKING', name: 'Analytics tracking', kind: 'chrome', allowedTopics: 'any', owner: { clinical: 'n/a', editorial: 'n/a', engineering: 'site-chrome' }, version: 'v1.0', approved: '2026-07-26', clinicalReview: 'n/a', status: 'chrome', generator: 'site-chrome.mjs' },
  { id: 'SIYA:COOKIE-NOTICE', name: 'Cookie notice', kind: 'chrome', allowedTopics: 'any', owner: { clinical: 'n/a', editorial: 'Legal', engineering: 'site-chrome' }, version: 'v1.0', approved: '2026-07-26', clinicalReview: 'n/a', status: 'chrome', generator: 'site-chrome.mjs' },
  { id: 'SIYA:CIRCLE-ANALYTICS', name: 'Circle analytics', kind: 'chrome', allowedTopics: 'any', owner: { clinical: 'n/a', editorial: 'n/a', engineering: 'site-chrome' }, version: 'v1.0', approved: '2026-07-26', clinicalReview: 'n/a', status: 'chrome', generator: 'site-chrome.mjs' },
  { id: 'SIYA:PROVIDER-ATTRIBUTION', name: 'Provider attribution', kind: 'chrome', allowedTopics: 'any', owner: { clinical: 'Clinical', editorial: 'Content OS', engineering: 'clinical-entity' }, version: 'v1.0', approved: '2026-07-26', clinicalReview: 'approved', status: 'chrome', generator: 'scripts/clinical-entity.mjs' },
  { id: 'SIYA:CONCIERGE', name: 'Concierge widget', kind: 'chrome', allowedTopics: 'any', owner: { clinical: 'n/a', editorial: 'n/a', engineering: 'site-chrome' }, version: 'v1.0', approved: '2026-07-26', clinicalReview: 'n/a', status: 'chrome', generator: 'site-chrome.mjs' },
  { id: 'SIYA:HEADER-SCROLL', name: 'Header scroll script', kind: 'chrome', allowedTopics: 'any', owner: { clinical: 'n/a', editorial: 'n/a', engineering: 'site-chrome' }, version: 'v1.0', approved: '2026-07-26', clinicalReview: 'n/a', status: 'chrome', generator: 'site-chrome.mjs' },
  { id: 'SIYA:FAQ-ACCORDION', name: 'FAQ accordion script', kind: 'chrome', allowedTopics: 'any', owner: { clinical: 'n/a', editorial: 'n/a', engineering: 'site-chrome' }, version: 'v1.0', approved: '2026-07-26', clinicalReview: 'n/a', status: 'chrome', generator: 'site-chrome.mjs' },
];

/** Marker prefixes considered chrome even if not individually registered (labs/learn-more families). */
export const CHROME_MARKER_PATTERNS = [
  /^SIYA:LABS-(LINK|CHIPS)-/,
  /^SIYA:LEARN-MORE-/,
  /^SIYA:MEET-PHYSICIANS$/,
  /^SIYA:CARE-TEAM$/,
  /^SIYA:ABOUT-CARE-TEAM$/,
  /^SIYA:LEGAL-CONTENT$/,
  /^SIYA:BLOG-SEARCH/,
  /^SIYA:LABS-TOPIC-HUB$/,
  /^SIYA:CA-CITY-(SIBLINGS|HUB-CARDS)$/,
  /^SIYA:ADHD-(FUNNEL-BANNER|ONLINE-TEST-CROSS-LINKS)$/,
  /^SIYA:WELLNESS-FUNNEL$/,
];

export const BLOCK_BY_ID = new Map(CONTENT_BLOCKS.map((b) => [b.id, b]));

/** Governance version */
export const GOVERNANCE_VERSION = '1.0';
