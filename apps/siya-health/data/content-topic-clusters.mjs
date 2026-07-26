/**
 * Content hierarchy — topic clusters linking guides, blogs, and service pages.
 * Consumed by generate-answer-pages.mjs and apply-content-hierarchy.mjs
 */

/** @typedef {{ slug: string, label?: string }} ClusterLink */
/** @typedef {{ id: string, name: string, blurb: string, cornerstoneGuide: string, cornerstoneBlog: string, guides: string[], blogs: string[], service: string, screening?: string }} TopicCluster */

export const ADHD_TOPIC_CLUSTERS = [
  {
    id: 'adhd-executive-dysfunction',
    name: 'Executive dysfunction',
    blurb: 'Task initiation, working memory, planning, organization, decision fatigue, and time blindness in adult ADHD.',
    cornerstoneGuide: 'executive-dysfunction-adhd',
    cornerstoneBlog: '/blog/executive-dysfunction-adhd',
    guides: [
      'executive-dysfunction-adhd',
      'time-blindness-adhd',
      'high-functioning-adhd',
      'adhd-vs-burnout',
    ],
    blogs: [
      '/blog/executive-dysfunction-adhd',
      '/blog/how-to-know-if-you-have-adhd-adult',
      '/blog/youre-not-lazy-signs-undiagnosed-adult-adhd',
      '/blog/adhd-in-women',
      '/blog/iron-deficiency-brain-fog-adhd',
      '/blog/pots-and-adhd',
      '/blog/adhd-brain-imaging-subtypes',
    ],
    service: '/adhd-care',
    screening: '/adhd-screening',
  },
  {
    id: 'adhd-women',
    name: 'ADHD in women',
    blurb: 'Presentation, masking, hormones, late diagnosis, and evaluation for adult women.',
    cornerstoneGuide: 'adhd-in-women',
    cornerstoneBlog: '/blog/adhd-in-women',
    guides: [
      'adhd-in-women',
      'late-adhd-diagnosis-adults',
      'rejection-sensitivity-adhd',
      'high-functioning-adhd',
    ],
    blogs: [
      '/blog/adhd-in-women',
      '/blog/how-to-know-if-you-have-adhd-adult',
      '/blog/youre-not-lazy-signs-undiagnosed-adult-adhd',
      '/blog/adhd-and-binge-eating',
      '/blog/adhd-symptoms-overlooked',
      '/blog/executive-dysfunction-adhd',
      '/blog/iron-deficiency-brain-fog-adhd',
    ],
    service: '/adhd-care',
    screening: '/adhd-screening',
  },
  {
    id: 'adhd-symptoms-evaluation',
    name: 'Symptoms & evaluation',
    blurb: 'Adult signs, differentials, and when structured evaluation makes sense.',
    cornerstoneGuide: 'signs-of-adult-adhd',
    cornerstoneBlog: '/blog/how-to-know-if-you-have-adhd-adult',
    guides: [
      'signs-of-adult-adhd',
      'adhd-vs-anxiety',
      'adhd-vs-burnout',
      'can-adhd-cause-anxiety',
      'high-functioning-adhd',
      'late-adhd-diagnosis-adults',
      'rejection-sensitivity-adhd',
      'poor-sleep-feels-like-adhd',
    ],
    blogs: [
      '/blog/how-to-know-if-you-have-adhd-adult',
      '/blog/executive-dysfunction-adhd',
      '/blog/adhd-in-women',
      '/blog/adhd-symptoms-overlooked',
      '/blog/youre-not-lazy-signs-undiagnosed-adult-adhd',
      '/blog/adult-adhd-symptoms-california',
      '/blog/iron-deficiency-brain-fog-adhd',
      '/blog/adhd-brain-imaging-subtypes',
      '/blog/pots-and-adhd',
    ],
    service: '/adhd-care',
    screening: '/adhd-screening',
  },
  {
    id: 'adhd-screening-diagnosis',
    name: 'Screening & diagnosis',
    blurb: 'ASRS screening, online legitimacy, visit length, and evaluation scope.',
    cornerstoneGuide: 'screening-vs-adhd-evaluation',
    cornerstoneBlog: '/blog/is-online-adhd-diagnosis-legit',
    guides: [
      'screening-vs-adhd-evaluation',
      'asrs-adhd-screening-explained',
      'can-adhd-be-diagnosed-online',
      'is-online-adhd-diagnosis-legitimate',
      'how-long-adhd-evaluation',
      'how-much-does-adhd-testing-cost',
    ],
    blogs: [
      '/blog/is-online-adhd-diagnosis-legit',
      '/blog/adhd-testing-online-california-screening-vs-evaluation',
      '/blog/how-adhd-medication-is-prescribed-online',
    ],
    service: '/adhd-care',
    screening: '/adhd-screening',
  },
  {
    id: 'adhd-medication',
    name: 'Medication',
    blurb: 'Starting treatment, side effects, dosing patterns, and stimulant vs non-stimulant paths.',
    cornerstoneGuide: 'starting-adhd-medication-adults',
    cornerstoneBlog: '/blog/adhd-medication-options-for-adults',
    guides: [
      'starting-adhd-medication-adults',
      'adhd-medication-side-effects',
      'is-adhd-medication-safe-long-term',
      'adhd-medication-every-day',
      'adderall-vs-vyvanse-adults',
      'can-you-get-adhd-medication-online',
    ],
    blogs: [
      '/blog/adhd-medication-options-for-adults',
      '/blog/vyvanse-vs-adderall-differences',
      '/blog/adderall-for-adhd-how-it-works',
      '/blog/non-stimulant-adhd-medications-explained',
      '/blog/adhd-medication-side-effects-what-to-expect',
      '/blog/is-adhd-medication-safe-long-term',
      '/blog/adhd-medication-daily-or-as-needed-adults',
    ],
    service: '/adhd-care',
    screening: '/adhd-screening',
  },
  {
    id: 'adhd-telehealth-access',
    name: 'Telehealth & access',
    blurb: 'State telehealth logistics, pricing context, and what visits include.',
    cornerstoneGuide: 'what-included-199-adhd-evaluation',
    cornerstoneBlog: '/blog/online-adhd-diagnosis-california',
    guides: [
      'what-included-199-adhd-evaluation',
      'telehealth-adhd-california',
      'telehealth-adhd-texas',
      'fsa-hsa-adhd-evaluation',
    ],
    blogs: [
      '/blog/online-adhd-diagnosis-california',
      '/blog/online-adhd-diagnosis-texas',
      '/blog/adhd-telehealth-california',
      '/blog/adhd-evaluation-cost-texas',
      '/blog/how-to-choose-adhd-provider-california',
    ],
    service: '/adhd-care',
    screening: '/adhd-screening',
  },
];

export const METABOLIC_TOPIC_CLUSTERS = [
  {
    id: 'food-noise-glp1',
    name: 'Food noise & GLP-1',
    blurb: 'Cravings, food preoccupation, and GLP-1 therapy context.',
    cornerstoneGuide: 'what-is-food-noise',
    cornerstoneBlog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
    guides: ['what-is-food-noise', 'food-noise-returned-on-glp-1', 'glp-1-side-effects', 'glp-1-nausea-management'],
    blogs: [
      '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
      '/blog/glp1-side-effects-and-how-to-manage-them',
      '/blog/semaglutide-for-weight-loss-how-it-works',
    ],
    service: '/weight-loss-metabolic-health',
  },
  {
    id: 'insulin-metabolic',
    name: 'Insulin resistance & metabolic health',
    blurb: 'Early metabolic signals, labs, and medical weight-loss pathways.',
    cornerstoneGuide: 'what-is-insulin-resistance',
    cornerstoneBlog: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
    guides: [
      'what-is-insulin-resistance',
      'insulin-resistance-without-diabetes',
      'normal-a1c-insulin-resistance',
      'why-normal-labs-dont-mean-healthy',
      'which-preventive-blood-tests-adults',
      'what-to-do-after-lab-results',
      'brain-fog-after-eating',
      'afternoon-energy-crash-after-lunch',
    ],
    blogs: [
      '/blog/insulin-resistance-and-weight-loss-clinician-overview',
      '/blog/medical-weight-loss-vs-dieting-what-actually-works',
      '/blog/medical-weight-loss-glp1-semaglutide-texas',
    ],
    service: '/weight-loss-metabolic-health',
  },
];

export const ENERGY_TOPIC_CLUSTERS = [
  {
    id: 'fatigue-sleep',
    name: 'Fatigue & sleep',
    blurb: 'Unrefreshing sleep, apnea clues, and fatigue workups.',
    cornerstoneGuide: 'why-am-i-tired-even-after-sleeping',
    cornerstoneBlog: '/fatigue',
    guides: ['why-am-i-tired-even-after-sleeping', 'can-sleep-apnea-cause-fatigue', 'signs-of-sleep-apnea-in-adults'],
    blogs: [
      '/fatigue',
      '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
      '/blog/insomnia-treatment-options-beyond-medication',
    ],
    service: '/telehealth',
  },
];

export const HORMONE_TOPIC_CLUSTERS = [
  {
    id: 'testosterone-mens-health',
    name: "Men's health & testosterone",
    blurb: 'Free vs total testosterone, symptoms, TRT candidacy, and monitoring.',
    cornerstoneGuide: 'what-is-free-testosterone',
    cornerstoneBlog: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
    guides: [
      'what-is-free-testosterone',
      'what-does-low-testosterone-feel-like',
      'high-shbg-low-free-testosterone',
      'when-is-testosterone-therapy-appropriate',
      'trt-monitoring-requirements',
      'testosterone-and-adhd-overlap',
    ],
    blogs: [
      '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
      '/blog/when-is-testosterone-therapy-appropriate',
    ],
    service: '/mens-health-longevity',
  },
];

export const ALL_TOPIC_CLUSTERS = [
  ...ADHD_TOPIC_CLUSTERS,
  ...METABOLIC_TOPIC_CLUSTERS,
  ...ENERGY_TOPIC_CLUSTERS,
  ...HORMONE_TOPIC_CLUSTERS,
];

const GUIDE_TO_CLUSTER = new Map();
for (const cluster of ALL_TOPIC_CLUSTERS) {
  for (const slug of cluster.guides) {
    if (!GUIDE_TO_CLUSTER.has(slug)) GUIDE_TO_CLUSTER.set(slug, cluster);
  }
}

export function clusterForGuide(slug) {
  return GUIDE_TO_CLUSTER.get(slug) || null;
}

/** Default blog + landing when a guide is not in a named cluster */
export const DEFAULT_TOPIC_LINKING = {
  adhd: {
    blog: '/blog/how-to-know-if-you-have-adhd-adult',
    blogLabel: 'How to know if you have ADHD as an adult (full article)',
    service: '/adhd-care',
    serviceLabel: 'ADHD evaluation & telehealth care',
  },
  'weight-loss': {
    blog: '/blog/medical-weight-loss-glp1-semaglutide-texas',
    blogLabel: 'Medical weight loss with GLP-1 (full overview)',
    service: '/weight-loss-metabolic-health',
    serviceLabel: 'Medical weight loss programs',
  },
  'mens-health': {
    blog: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
    blogLabel: 'Free vs total testosterone (full article)',
    service: '/mens-health-longevity',
    serviceLabel: "Men's health & longevity care",
  },
  telehealth: {
    blog: '/blog/how-to-safely-get-prescriptions-online',
    blogLabel: 'How to safely get prescriptions online (full guide)',
    service: '/telehealth',
    serviceLabel: 'Telehealth services',
  },
};

const SERVICE_LABELS = {
  '/adhd-care': 'ADHD evaluation & telehealth care',
  '/adhd-screening': 'Free ADHD screening',
  '/weight-loss-metabolic-health': 'Medical weight loss programs',
  '/telehealth': 'Telehealth services',
  '/mens-health-longevity': "Men's health & longevity care",
};

/**
 * Resolve internal links for an answer page (supporting FAQ → blog primary).
 * @param {{ slug: string, topic: string, related?: string[] }} seed
 * @param {{ path: string, label?: string } | null} canonicalBlog
 */
export function resolveAnswerInternalLinks(seed, canonicalBlog = null) {
  const cluster = clusterForGuide(seed.slug);
  const relatedSlugs = [];

  for (const s of seed.related || []) {
    if (s !== seed.slug && !relatedSlugs.includes(s)) relatedSlugs.push(s);
    if (relatedSlugs.length >= 3) break;
  }

  if (cluster) {
    for (const s of cluster.guides) {
      if (relatedSlugs.length >= 3) break;
      if (s === seed.slug || relatedSlugs.includes(s)) continue;
      relatedSlugs.push(s);
    }
  }

  const topicFallbackGuides =
    {
      adhd: ['signs-of-adult-adhd', 'can-adhd-be-diagnosed-online', 'screening-vs-adhd-evaluation'],
      'weight-loss': ['what-is-insulin-resistance', 'what-is-food-noise', 'glp-1-side-effects'],
      'mens-health': ['what-is-free-testosterone', 'what-does-low-testosterone-feel-like'],
      telehealth: ['is-telehealth-legitimate', 'how-online-prescriptions-work'],
    }[seed.topic] || ['is-telehealth-legitimate', 'how-online-prescriptions-work'];

  for (const s of topicFallbackGuides) {
    if (relatedSlugs.length >= 2) break;
    if (s !== seed.slug && !relatedSlugs.includes(s)) relatedSlugs.push(s);
  }
  const topicDefaults = DEFAULT_TOPIC_LINKING[seed.topic] || DEFAULT_TOPIC_LINKING.telehealth;
  const blogPath = canonicalBlog?.path || cluster?.cornerstoneBlog || topicDefaults.blog;
  const blogLabel =
    canonicalBlog?.label ||
    BLOG_CLUSTER_ANCHORS[blogPath] ||
    topicDefaults.blogLabel ||
    'Read the full clinical article';

  const landingPath = cluster?.service || topicDefaults.service;
  const landingLabel = SERVICE_LABELS[landingPath] || topicDefaults.serviceLabel || 'Explore care options';

  return {
    relatedSlugs: relatedSlugs.slice(0, 3),
    blogPath,
    blogLabel,
    landingPath,
    landingLabel,
  };
}

export const ASK_SIYA_CHAT_PATH = '/redirect/chat';

/** Highest-value informational URLs for strengthened internal linking */
export const PRIORITY_INFORMATIONAL_PATHS = new Set([
  '/answers/signs-of-adult-adhd',
  '/answers/can-adhd-be-diagnosed-online',
  '/answers/is-online-adhd-diagnosis-legitimate',
  '/answers/screening-vs-adhd-evaluation',
  '/answers/how-long-adhd-evaluation',
  '/answers/starting-adhd-medication-adults',
  '/answers/what-is-food-noise',
  '/answers/what-is-insulin-resistance',
  '/answers/why-am-i-tired-even-after-sleeping',
  '/answers/what-is-free-testosterone',
  '/blog/how-to-know-if-you-have-adhd-adult',
  '/blog/adhd-in-women',
  '/blog/executive-dysfunction-adhd',
  '/blog/iron-deficiency-brain-fog-adhd',
  '/blog/adhd-brain-imaging-subtypes',
  '/blog/pots-and-adhd',
  '/blog/is-online-adhd-diagnosis-legit',
  '/blog/adhd-medication-options-for-adults',
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  '/fatigue',
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
  '/blog/online-adhd-diagnosis-california',
  '/blog/online-adhd-diagnosis-texas',
  '/adhd-care',
  '/adhd-screening',
  '/weight-loss-metabolic-health',
  '/telehealth',
  '/mens-health-longevity',
  '/answers',
  '/blog/adhd',
]);

/**
 * Pages targeting the same search intent — recommend consolidation (no redirects applied here).
 * `keep` is the canonical URL; `merge` should defer with prominent internal links.
 */
export const CONSOLIDATION_RECOMMENDATIONS = [
  {
    keep: '/blog/adhd-in-women',
    merge: '/answers/adhd-in-women',
    reason: 'Women’s ADHD hub owns broad intent; answer page remains the concise FAQ companion.',
  },
  {
    keep: '/blog/executive-dysfunction-adhd',
    merge: '/answers/executive-dysfunction-adhd',
    reason: 'Executive dysfunction pillar owns broad intent; answer page remains the concise FAQ companion.',
  },
  {
    keep: '/answers/signs-of-adult-adhd',
    merge: '/answers/high-functioning-adhd',
    reason: 'High-functioning narrative is a subset of adult signs; thin standalone guide.',
  },
  {
    keep: '/answers/signs-of-adult-adhd',
    merge: '/answers/time-blindness-adhd',
    reason: 'Micro-topic (time blindness) covered in ED pillar + time-blindness FAQ; do not expand into broad ED intent.',
  },
  {
    keep: '/blog/how-to-know-if-you-have-adhd-adult',
    merge: '/blog/adult-adhd-symptoms-california',
    reason: 'California geo variant duplicates sitewide symptoms cornerstone.',
  },
  {
    keep: '/blog/online-adhd-diagnosis-california',
    merge: '/blog/adhd-evaluation-california-online-vs-in-person',
    reason: 'Online vs in-person comparison absorbed by CA diagnosis cornerstone.',
  },
  {
    keep: '/blog/online-adhd-diagnosis-texas',
    merge: '/answers/telehealth-adhd-texas',
    reason: 'TX telehealth FAQ duplicates TX diagnosis blog intent.',
  },
  {
    keep: '/blog/is-online-adhd-diagnosis-legit',
    merge: '/answers/is-online-adhd-diagnosis-legitimate',
    reason: 'Duplicate intent — guide narrowed to FAQ checklist; blog owns depth (already differentiated).',
  },
  {
    keep: '/blog/vyvanse-vs-adderall-differences',
    merge: '/answers/adderall-vs-vyvanse-adults',
    reason: 'Guide scoped to preference FAQ; blog owns full comparison.',
  },
  {
    keep: '/blog/glp1-side-effects-and-how-to-manage-them',
    merge: '/answers/glp-1-nausea-management',
    reason: 'Nausea subset fully covered in GLP-1 side effects cornerstone.',
  },
  {
    keep: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
    merge: '/answers/weight-gain-after-stopping-ozempic',
    reason: 'Ozempic cessation / food-noise rebound owned by food-noise cornerstone.',
  },
  {
    keep: '/blog/how-to-know-if-you-have-adhd-adult',
    merge: '/answers/rejection-sensitivity-adhd',
    reason: 'RSD micro-guide; symptom covered in signs cornerstone and ADHD blog cluster.',
  },
];

export const BLOG_CLUSTER_ANCHORS = {
  '/blog/executive-dysfunction-adhd': 'Executive dysfunction in ADHD: domains & what helps (full guide)',
  '/blog/adhd-in-women': 'ADHD in women: symptoms, masking & late diagnosis (full guide)',
  '/blog/how-to-know-if-you-have-adhd-adult': 'How to know if you have ADHD as an adult (cornerstone)',
  '/blog/is-online-adhd-diagnosis-legit': 'Is online ADHD diagnosis legit? (cornerstone)',
  '/blog/adhd-medication-options-for-adults': 'ADHD medication options for adults (cornerstone)',
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps': 'Food noise & GLP-1 (cornerstone)',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview': 'Insulin resistance & weight loss (cornerstone)',
  '/fatigue': 'Fatigue: when tired stops being normal (canonical entity)',
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': 'Sleep apnea & metabolic risk (cornerstone)',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know': 'Free vs total testosterone (cornerstone)',
  '/blog/online-adhd-diagnosis-california': 'Online ADHD diagnosis in California',
  '/blog/online-adhd-diagnosis-texas': 'Online ADHD diagnosis in Texas',
  '/blog/iron-deficiency-brain-fog-adhd': 'Iron deficiency, brain fog & ADHD (association vs causation)',
  '/blog/adhd-brain-imaging-subtypes': 'ADHD brain imaging biotypes: emerging research explained',
  '/blog/pots-and-adhd': 'POTS and ADHD: shared symptoms & diagnostic overlap',
};
