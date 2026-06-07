/**
 * Site pruning audit — classifies all indexable pages for minimum viable site.
 * Run: node scripts/audit-site-pruning.mjs [--md docs/SITE-PRUNING-AUDIT.md]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HIGH_OVERLAP_PAIRS, CANONICAL_WINNING_BLOGS } from '../data/cannibalization-phase1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

/** @typedef {'KEEP'|'KEEP + REWRITE'|'MERGE'|'REDIRECT'|'DELETE'} Classification */

/** @type {Record<string, { target?: string, rationale: string, phase?: number }>} */
const EXPLICIT = {
  // ── DELETE immediately ──────────────────────────────────────────────
  '/terms': {
    classification: 'DELETE',
    target: '/legal/terms-of-use',
    rationale: 'Legacy legal stub; canonical is /legal/terms-of-use. Zero inbound. Remove file after 301.',
    phase: 1,
  },
  '/privacy-policy': {
    classification: 'DELETE',
    target: '/legal/privacy-policy',
    rationale: 'Legacy legal stub; canonical is /legal/privacy-policy. Zero inbound. Remove file after 301.',
    phase: 1,
  },
  '/blog/all': {
    classification: 'DELETE',
    target: '/blog',
    rationale: 'Redundant article index duplicating /blog hub; 4 inbound only from footer. High maintenance, no unique SEO value.',
    phase: 1,
  },
  '/adhd-diagnosis-florida': {
    classification: 'DELETE',
    target: '/adhd-care',
    rationale: 'Thin geo landing; zero inbound links, orphan. Florida not a licensed priority state in entity-graph.',
    phase: 1,
  },
  '/siya-circle': {
    classification: 'DELETE',
    target: 'https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl',
    rationale: 'Orphan utility page (0 inbound). Newsletter signup belongs in footer only per CTA audit.',
    phase: 1,
  },
  '/blog/ambien-and-sleep-medications-risks-and-benefits': {
    classification: 'DELETE',
    target: '/blog/insomnia-treatment-options-beyond-medication',
    rationale: 'Off-scope sleep Rx content; Siya does not promote Ambien prescribing. 2 inbound, no conversion path.',
    phase: 1,
  },
  '/blog/glutathione-and-peptides-what-do-they-actually-do': {
    classification: 'DELETE',
    target: '/mens-health-longevity',
    rationale: 'Peptide marketing content outside current service scope; 2 inbound, maintenance with no revenue tie.',
    phase: 1,
  },
  '/blog/modafinil-for-focus-and-fatigue-is-it-safe': {
    classification: 'DELETE',
    target: '/adhd-care',
    rationale: 'Modafinil not a Siya service line; risks implying off-label prescribing. 4 inbound only.',
    phase: 1,
  },

  // ── REDIRECT — legacy & funnel consolidation ────────────────────────
  '/online-adhd-test': {
    classification: 'REDIRECT',
    target: '/adhd-screening',
    rationale: 'Duplicate screening funnel intent with /adhd-screening; CTA audit flags cross-link confusion.',
    phase: 1,
  },
  '/adult-adhd-diagnosis': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Overlaps /adhd-care H1 and offer; splits ADHD commercial intent across 3 URLs.',
    phase: 1,
  },
  '/adhd-treatment-online': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Post-diagnosis treatment belongs as section on /adhd-care; 1 inbound, thin duplicate.',
    phase: 1,
  },
  '/adhd-evaluation-cost': {
    classification: 'REDIRECT',
    target: '/pricing',
    rationale: 'Standalone pricing page duplicates /pricing and adhd-care; consolidate single pricing source.',
    phase: 1,
  },
  '/creyos-adhd-testing': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Creyos is included in $199 evaluation; standalone page fragments ADHD funnel (3 inbound).',
    phase: 1,
  },
  '/prescriptions': {
    classification: 'REDIRECT',
    target: '/telehealth',
    rationale: '92-word coming-soon placeholder; 1 inbound. Telehealth owns prescription narrative.',
    phase: 1,
  },
  '/labs': {
    classification: 'REDIRECT',
    target: '/telehealth',
    rationale: '102-word coming-soon placeholder; no unique content. Defer until labs launch.',
    phase: 1,
  },
  '/primary-urgent-care': {
    classification: 'REDIRECT',
    target: '/telehealth',
    rationale: 'Secondary service with 1 inbound; telehealth page covers virtual primary care positioning.',
    phase: 1,
  },

  // ── REDIRECT — geo consolidation ────────────────────────────────────
  '/adhd-diagnosis-austin': {
    classification: 'REDIRECT',
    target: '/adhd-diagnosis-texas',
    rationale: 'City geo page with 1 inbound; Texas state cornerstone absorbs Austin intent.',
    phase: 1,
  },
  '/adhd-diagnosis-houston': {
    classification: 'REDIRECT',
    target: '/adhd-diagnosis-texas',
    rationale: 'City geo page with 2 inbound; consolidate to single Texas geo cornerstone.',
    phase: 1,
  },
  '/adhd-diagnosis-philadelphia': {
    classification: 'REDIRECT',
    target: '/adhd-diagnosis-pennsylvania',
    rationale: 'City duplicate of PA state page; 1 inbound each, same offer.',
    phase: 1,
  },
  '/adhd-diagnosis-pennsylvania': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Thin state geo (451 words, 1 inbound); PA coverage belongs as section on /adhd-care until traffic justifies standalone.',
    phase: 1,
  },
  '/blog/online-adhd-diagnosis-texas': {
    classification: 'REDIRECT',
    target: '/adhd-diagnosis-texas',
    rationale: 'Houston blog duplicates Texas geo landing; 3 inbound.',
    phase: 1,
  },
  '/blog/adhd-evaluation-cost-texas': {
    classification: 'REDIRECT',
    target: '/pricing',
    rationale: 'State-specific pricing duplicate; /pricing is canonical pricing page.',
    phase: 1,
  },
  '/blog/adhd-evaluation-cost-texas': {
    classification: 'REDIRECT',
    target: '/pricing',
    rationale: 'State-specific pricing duplicate of /adhd-evaluation-cost and /pricing.',
    phase: 1,
  },
  '/blog/adhd-testing-online-california-screening-vs-evaluation': {
    classification: 'REDIRECT',
    target: '/adhd-screening',
    rationale: 'Screening vs evaluation intent owned by /adhd-screening + /adhd-care.',
    phase: 1,
  },
  '/blog/adhd-evaluation-california-online-vs-in-person': {
    classification: 'REDIRECT',
    target: '/blog/online-adhd-diagnosis-california',
    rationale: 'CA geo cluster consolidation; online diagnosis cornerstone absorbs comparison intent.',
    phase: 1,
  },
  '/blog/adhd-medication-online-california': {
    classification: 'REDIRECT',
    target: '/blog/adhd-medication-options-for-adults',
    rationale: 'CA medication blog duplicates general adult medication guide.',
    phase: 1,
  },
  '/blog/online-adhd-diagnosis-texas': {
    classification: 'REDIRECT',
    target: '/blog/online-adhd-diagnosis-texas',
    rationale: 'TX medication logistics covered by TX diagnosis cornerstone + /adhd-care.',
    phase: 1,
  },
  '/blog/adhd-medication-options-california': {
    classification: 'REDIRECT',
    target: '/blog/adhd-medication-options-for-adults',
    rationale: 'State variant of general medication options article; cannibalizes adult guide.',
    phase: 1,
  },
  '/blog/adult-adhd-symptoms-california': {
    classification: 'REDIRECT',
    target: '/blog/how-to-know-if-you-have-adhd-adult',
    rationale: 'Symptoms content duplicates sitewide ADHD symptoms cornerstone (167 inbound).',
    phase: 1,
  },
  '/blog/adult-adhd-treatment-california-2026': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Treatment commercial intent belongs on service page, not geo blog.',
    phase: 1,
  },
  '/blog/how-to-choose-adhd-provider-california': {
    classification: 'REDIRECT',
    target: '/providers',
    rationale: 'Provider selection intent better served by /providers hub + profiles.',
    phase: 1,
  },
  '/answers/starting-adhd-medication-adults': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Post-diagnosis journey belongs on /adhd-care; 2 inbound thin article.',
    phase: 1,
  },
  '/answers/telehealth-adhd-texas': {
    classification: 'REDIRECT',
    target: '/blog/online-adhd-diagnosis-texas',
    rationale: 'TX telehealth FAQ duplicates TX diagnosis blog; geo FAQ → geo cornerstone.',
    phase: 1,
  },
  '/answers/how-much-does-adhd-testing-cost': {
    classification: 'REDIRECT',
    target: '/pricing',
    rationale: 'Pricing FAQ duplicates /pricing and adhd-care pricing sections.',
    phase: 1,
  },
  '/answers/what-included-199-adhd-evaluation': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Evaluation scope FAQ belongs on /adhd-care offer section.',
    phase: 1,
  },
  '/creyos-adhd-testing': {
    classification: 'REDIRECT',
    target: '/adhd-care',
    rationale: 'Creyos FAQ with 1 inbound; merge into adhd-care evaluation section.',
    phase: 1,
  },

  // ── REDIRECT — medication comparison duplicates ─────────────────────
  '/blog/vyvanse-vs-adderall-differences': {
    classification: 'REDIRECT',
    target: '/blog/vyvanse-vs-adderall-differences',
    rationale: 'Third stimulant comparison page; consolidate ADHD med comparisons to canonical pair.',
    phase: 1,
  },
  '/blog/vyvanse-vs-adderall-differences': {
    classification: 'REDIRECT',
    target: '/blog/adderall-for-adhd-how-it-works',
    rationale: 'IR/XR variant duplicates Adderall mechanism article.',
    phase: 1,
  },
  '/answers/adhd-and-weight-loss-connection': {
    classification: 'REDIRECT',
    target: '/weight-loss-metabolic-health',
    rationale: 'Cross-service article with 2 inbound; metabolic service page owns dual-condition positioning.',
    phase: 1,
  },

  // ── REDIRECT — thin guides ──────────────────────────────────────────
  '/answers/signs-of-adult-adhd': {
    classification: 'REDIRECT',
    target: '/answers/signs-of-adult-adhd',
    rationale: 'Thin gender variant (348 words, 1 inbound); signs-of-adult-adhd covers presentation.',
    phase: 1,
  },
  '/answers/adhd-in-women': {
    classification: 'REDIRECT',
    target: '/answers/signs-of-adult-adhd',
    rationale: 'Thin gender variant (356 words, 3 inbound); consolidate to adult signs cornerstone guide.',
    phase: 1,
  },
  '/answers/rejection-sensitivity-adhd': {
    classification: 'REDIRECT',
    target: '/answers/signs-of-adult-adhd',
    rationale: 'Niche ADHD symptom (365 words, 2 inbound); low search volume vs maintenance cost.',
    phase: 1,
  },
  '/answers/time-blindness-adhd': {
    classification: 'REDIRECT',
    target: '/answers/signs-of-adult-adhd',
    rationale: 'Micro-topic guide (358 words, 2 inbound); consolidate to adult signs cornerstone guide.',
    phase: 1,
  },
  '/answers/high-functioning-adhd': {
    classification: 'REDIRECT',
    target: '/blog/how-to-know-if-you-have-adhd-adult',
    rationale: 'Thin guide (350 words); high-functioning narrative covered in adult ADHD cornerstone blog.',
    phase: 1,
  },
  '/answers/weight-gain-after-stopping-ozempic': {
    classification: 'REDIRECT',
    target: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
    rationale: 'Ozempic cessation FAQ with 1 inbound; food-noise cornerstone owns GLP-1 rebound narrative.',
    phase: 1,
  },
  '/answers/glp-1-nausea-management': {
    classification: 'REDIRECT',
    target: '/blog/glp1-side-effects-and-how-to-manage-them',
    rationale: 'Cannibalization owner Blog; nausea subset fully covered in GLP-1 side effects cornerstone.',
    phase: 1,
  },

  // ── KEEP + REWRITE ──────────────────────────────────────────────────
  '/': { classification: 'KEEP + REWRITE', rationale: 'Homepage MVP polish needed; consolidate CTAs and link all provider cards per provider audit.', phase: 2 },
  '/adhd-care': { classification: 'KEEP + REWRITE', rationale: 'Core revenue page; add state availability sections, Creyos/pricing blocks, provider cards.', phase: 2 },
  '/weight-loss-metabolic-health': { classification: 'KEEP + REWRITE', rationale: 'Core revenue; add provider authority (Sneh), simplify CTA bands per CTA audit.', phase: 2 },
  '/mens-health-longevity': { classification: 'KEEP + REWRITE', rationale: 'Core revenue; align scope to actual services, add hormone cornerstone links.', phase: 2 },
  '/telehealth': { classification: 'KEEP + REWRITE', rationale: 'Core routing hub; absorb redirected coming-soon services, simplify service grid.', phase: 2 },
  '/pricing': { classification: 'KEEP', rationale: 'Single pricing source of truth; absorbs legacy redirects.', phase: 1 },
  '/about': { classification: 'KEEP + REWRITE', rationale: 'Fix team image alt text, link providers, reduce duplicate CTAs.', phase: 2 },
  '/answers': { classification: 'KEEP + REWRITE', rationale: 'Hub needs pillar restructure after guide pruning; reduce 87 outbound links.', phase: 2 },
  '/blog': { classification: 'KEEP + REWRITE', rationale: 'Simplify discovery; remove blog/all dependency; category hubs may merge.', phase: 2 },
  '/blog/adhd': { classification: 'MERGE', target: '/blog', rationale: 'Category hub duplicates /blog index; merge ADHD article list into main blog hub.', phase: 2 },
  '/blog/weight-loss': { classification: 'MERGE', target: '/blog', rationale: 'Category hub duplicates /blog; merge weight-loss articles into filtered blog index.', phase: 2 },
  '/blog/telehealth': { classification: 'MERGE', target: '/blog', rationale: 'Category hub duplicates /blog; low unique value (327 words).', phase: 2 },
  '/adhd-screening': { classification: 'KEEP + REWRITE', rationale: 'Top-of-funnel; align copy with /adhd-care after online-adhd-test redirect.', phase: 2 },
  '/adhd-diagnosis-texas': { classification: 'KEEP + REWRITE', rationale: 'Geo cornerstone; add provider routing and state-specific trust signals.', phase: 2 },
};

// Cannibalization: redirect Duplicate-owner guides to winning blog
for (const pair of HIGH_OVERLAP_PAIRS) {
  if (pair.classification === 'Duplicate' && pair.owner === 'Blog') {
    EXPLICIT[pair.guide] = {
      classification: 'REDIRECT',
      target: pair.blog,
      rationale: `Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning.`,
      phase: 3,
    };
  }
}

/** Core pages always kept */
const CORE_KEEP = new Set([
  '/',
  '/about',
  '/adhd-care',
  '/adhd-screening',
  '/adhd-diagnosis-texas',
  '/weight-loss-metabolic-health',
  '/telehealth',
  '/mens-health-longevity',
  '/pricing',
  '/book-appointment',
  '/providers',
  '/answers',
  '/blog',
  '/legal',
  '/legal/controlled-substance-treatment-agreement',
  '/legal/cookie-policy',
  '/legal/notice-of-privacy-practices',
  '/legal/privacy-policy',
  '/legal/terms-of-use',
]);

/** Curated cornerstone URLs (~15–25 strategic anchors) */
const CORNERSTONE_PATHS = new Set([
  // Core revenue & trust
  '/',
  '/about',
  '/providers',
  '/adhd-care',
  '/adhd-screening',
  '/adhd-diagnosis-texas',
  '/weight-loss-metabolic-health',
  '/telehealth',
  '/mens-health-longevity',
  '/pricing',
  '/book-appointment',
  '/answers',
  '/blog',
  // Geo blog cornerstones
  '/blog/online-adhd-diagnosis-california',
  '/blog/online-adhd-diagnosis-texas',
  '/blog/adhd-telehealth-california',
  '/blog/medical-weight-loss-glp1-semaglutide-texas',
  // Clinical blog cornerstones (CORNERSTONE_SYSTEMS + top performers)
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
  '/blog/how-to-know-if-you-have-adhd-adult',
  '/blog/is-online-adhd-diagnosis-legit',
  // Primary PAA guides
  '/answers/signs-of-adult-adhd',
  '/answers/can-adhd-be-diagnosed-online',
  '/answers/what-is-insulin-resistance',
  '/answers/what-is-food-noise',
  '/answers/what-is-free-testosterone',
  '/answers/why-am-i-tired-even-after-sleeping',
]);

/** Provider profile paths */
function isProviderProfile(p) {
  return p.startsWith('/providers/') && p !== '/providers';
}

/** Default for remaining health guides */
function defaultGuideClassification(page) {
  if (GUIDE_KEEP.has(page.path)) {
    return {
      classification: 'KEEP',
      rationale: 'Primary PAA guide for cornerstone cluster; paired blog owns long-form depth.',
      phase: null,
    };
  }
  const guideRedirect = inferGuideRedirectTarget(page.path);
  return {
    classification: 'REDIRECT',
    target: guideRedirect,
    rationale: `Supporting/thin guide not in minimum viable whitelist; consolidate to ${guideRedirect}.`,
    phase: 3,
  };
}

function inferGuideRedirectTarget(guidePath) {
  const slug = guidePath.replace('/answers/', '');
  const pair = HIGH_OVERLAP_PAIRS.find((p) => p.guide === guidePath);
  if (pair) return pair.blog;
  if (slug.includes('adhd')) return '/adhd-care';
  if (slug.includes('glp') || slug.includes('insulin') || slug.includes('food-noise') || slug.includes('weight')) {
    return '/weight-loss-metabolic-health';
  }
  if (slug.includes('testosterone') || slug.includes('minoxidil') || slug.includes('sildenafil')) {
    return '/mens-health-longevity';
  }
  if (slug.includes('sleep') || slug.includes('tired') || slug.includes('fatigue')) {
    return '/blog/why-am-i-always-tired-causes-when-to-see-doctor';
  }
  if (slug.includes('telehealth')) return '/telehealth';
  return '/answers';
}

/** Blogs retained in minimum viable site (whitelist) */
const BLOG_KEEP = new Set([
  ...CANONICAL_WINNING_BLOGS,
  '/blog/how-to-know-if-you-have-adhd-adult',
  '/blog/how-to-safely-get-prescriptions-online',
  '/blog/adhd-symptoms-overlooked',
  '/blog/how-adhd-medication-is-prescribed-online',
  '/blog/adderall-for-adhd-how-it-works',
  '/blog/online-adhd-diagnosis-california',
  '/blog/online-adhd-diagnosis-texas',
  '/blog/adhd-medication-options-for-adults',
  '/blog/telehealth-prescriptions-how-online-treatment-works',
  '/blog/youre-not-lazy-signs-undiagnosed-adult-adhd',
  '/blog/insomnia-treatment-options-beyond-medication',
]);

/** Primary PAA guide per cornerstone cluster (supporting guides redirect here or to blog) */
const GUIDE_KEEP = new Set([
  '/answers/signs-of-adult-adhd',
  '/answers/can-adhd-be-diagnosed-online',
  '/answers/what-is-insulin-resistance',
  '/answers/what-is-food-noise',
  '/answers/why-am-i-tired-even-after-sleeping',
  '/answers/can-sleep-apnea-cause-fatigue',
  '/answers/what-is-free-testosterone',
  '/answers/screening-vs-adhd-evaluation',
  '/answers/is-telehealth-legitimate',
  '/answers/adhd-medication-every-day',
  '/answers/who-qualifies-glp-1-weight-loss',
  '/answers/telehealth-adhd-california',
]);

/** Default for blog articles */
function defaultBlogClassification(page) {
  if (BLOG_KEEP.has(page.path)) {
    return { classification: 'KEEP', rationale: 'Whitelisted cornerstone or high-equity blog in minimum viable site.', phase: null };
  }
  // Map non-whitelisted blogs to best redirect target
  const blogRedirect = inferBlogRedirectTarget(page.path);
  return {
    classification: 'REDIRECT',
    target: blogRedirect,
    rationale: `Blog not in minimum viable whitelist; redirect to preserve link equity on ${blogRedirect}.`,
    phase: 3,
  };
}

function inferBlogRedirectTarget(blogPath) {
  if (blogPath.includes('adhd')) return '/adhd-care';
  if (blogPath.includes('weight') || blogPath.includes('glp') || blogPath.includes('semaglutide')) {
    return '/weight-loss-metabolic-health';
  }
  if (blogPath.includes('testosterone') || blogPath.includes('minoxidil') || blogPath.includes('sildenafil')) {
    return '/mens-health-longevity';
  }
  if (blogPath.includes('telehealth') || blogPath.includes('prescription')) return '/telehealth';
  return '/blog';
}

function classifyPage(page) {
  if (EXPLICIT[page.path]) {
    const e = EXPLICIT[page.path];
    return {
      path: page.path,
      classification: e.classification,
      redirectTarget: e.target ?? null,
      rationale: e.rationale,
      phase: e.phase ?? null,
      groups: page.groups,
      internalLinksIn: page.internalLinksIn,
      wordCount: page.wordCount,
      pageType: page.pageType,
    };
  }

  if (CORE_KEEP.has(page.path) || isProviderProfile(page.path)) {
    return {
      path: page.path,
      classification: 'KEEP',
      redirectTarget: null,
      rationale: isProviderProfile(page.path)
        ? 'Provider profile — required for E-E-A-T and booking conversion.'
        : 'Core revenue, trust, or legal page in minimum viable site.',
      phase: null,
      groups: page.groups,
      internalLinksIn: page.internalLinksIn,
      wordCount: page.wordCount,
      pageType: page.pageType,
    };
  }

  if (page.path.startsWith('/answers/')) {
    const d = defaultGuideClassification(page);
    return { path: page.path, redirectTarget: d.target ?? null, phase: d.phase, groups: page.groups, internalLinksIn: page.internalLinksIn, wordCount: page.wordCount, pageType: page.pageType, ...d };
  }

  if (page.path.startsWith('/blog/')) {
    const d = defaultBlogClassification(page);
    return { path: page.path, redirectTarget: d.target ?? null, phase: d.phase, groups: page.groups, internalLinksIn: page.internalLinksIn, wordCount: page.wordCount, pageType: page.pageType, ...d };
  }

  return {
    path: page.path,
    classification: 'KEEP',
    redirectTarget: null,
    rationale: 'Unclassified page; default keep pending manual review.',
    phase: null,
    groups: page.groups,
    internalLinksIn: page.internalLinksIn,
    wordCount: page.wordCount,
    pageType: page.pageType,
  };
}

function buildAudit() {
  const inventory = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'data/website-inventory.json'), 'utf8'));
  let linkAudit = { zeroInbound: [] };
  try {
    linkAudit = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'data/internal-link-audit.json'), 'utf8'));
  } catch {
    /* optional */
  }

  const indexable = inventory.pages.filter((p) => p.indexable);
  const classifications = indexable.map(classifyPage);

  const counts = {
    KEEP: 0,
    'KEEP + REWRITE': 0,
    MERGE: 0,
    REDIRECT: 0,
    DELETE: 0,
  };
  for (const c of classifications) counts[c.classification]++;

  const surviving = classifications.filter(
    (c) => c.classification === 'KEEP' || c.classification === 'KEEP + REWRITE' || c.classification === 'MERGE',
  );
  const recommendedCount = surviving.length;

  const cornerstones = [...CORNERSTONE_PATHS]
    .filter((p) => {
      const c = classifications.find((x) => x.path === p);
      return c && (c.classification === 'KEEP' || c.classification === 'KEEP + REWRITE');
    })
    .sort();

  const maintenance = {
    currentPages: indexable.length,
    recommendedPages: recommendedCount,
    pagesRemoved: indexable.length - recommendedCount,
    percentReduction: Math.round(((indexable.length - recommendedCount) / indexable.length) * 100),
    duplicateContentStreamsEliminated: counts.REDIRECT + counts.DELETE,
    guideBlogPairsRedirected: HIGH_OVERLAP_PAIRS.filter((p) => p.classification === 'Duplicate' && p.owner === 'Blog').length,
  };

  return {
    generated: new Date().toISOString(),
    summary: {
      currentPageCount: indexable.length,
      recommendedPageCount: recommendedCount,
      ...counts,
      cornerstoneCount: cornerstones.length,
      maintenance,
    },
    cornerstones,
    phases: {
      phase1: classifications.filter((c) => c.phase === 1),
      phase2: classifications.filter((c) => c.phase === 2),
      phase3: classifications.filter((c) => c.phase === 3),
    },
    deletes: classifications.filter((c) => c.classification === 'DELETE'),
    redirects: classifications.filter((c) => c.classification === 'REDIRECT'),
    merges: classifications.filter((c) => c.classification === 'MERGE'),
    rewrites: classifications.filter((c) => c.classification === 'KEEP + REWRITE'),
    pages: classifications.sort((a, b) => a.path.localeCompare(b.path)),
    inputs: {
      websiteInventory: 'data/website-inventory.json',
      cannibalization: 'data/cannibalization-phase1.mjs',
      internalLinkAudit: 'data/internal-link-audit.json',
      zeroInboundPages: linkAudit.zeroInbound ?? [],
    },
  };
}

function mdEscape(s) {
  return String(s ?? '').replace(/\|/g, '\\|');
}

function generateMarkdown(audit) {
  const s = audit.summary;
  const m = s.maintenance;
  const lines = [];

  lines.push('# Site Pruning Audit — Siya Health');
  lines.push('');
  lines.push(`Generated: ${audit.generated.slice(0, 10)}`);
  lines.push('');
  lines.push('> Audit-only deliverable. No pages were modified.');
  lines.push('');
  lines.push('Related: [WEBSITE-INVENTORY.md](./WEBSITE-INVENTORY.md) · [CANNIBALIZATION-PHASE1-FINAL.md](./CANNIBALIZATION-PHASE1-FINAL.md) · [CTA-AUDIT.md](./CTA-AUDIT.md) · [PROVIDER-CONSISTENCY-AUDIT.md](./PROVIDER-CONSISTENCY-AUDIT.md)');
  lines.push('');

  lines.push('## Executive summary');
  lines.push('');
  lines.push(
    `Siya Health has **${s.currentPageCount} indexable pages** today. This audit recommends pruning to **${s.recommendedPageCount} pages** — a **${m.percentReduction}% reduction** — by deleting legacy stubs, consolidating geo/funnel duplicates, and redirecting cannibalizing guide→blog pairs. The goal is maximum trust and clarity with minimum maintenance: one pricing source, one ADHD funnel, two geo cornerstones (Texas + California blog), and **${s.cornerstoneCount} cornerstone URLs** that anchor SEO authority.`,
  );
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|------:|');
  lines.push(`| Current indexable pages | ${s.currentPageCount} |`);
  lines.push(`| Recommended pages (after pruning) | ${s.recommendedPageCount} |`);
  lines.push(`| DELETE | ${s.DELETE} |`);
  lines.push(`| REDIRECT | ${s.REDIRECT} |`);
  lines.push(`| MERGE | ${s.MERGE} |`);
  lines.push(`| KEEP + REWRITE | ${s['KEEP + REWRITE']} |`);
  lines.push(`| KEEP (no rewrite) | ${s.KEEP} |`);
  lines.push(`| Cornerstone pages | ${s.cornerstoneCount} |`);
  lines.push('');

  lines.push('## Classification summary');
  lines.push('');
  lines.push('| Classification | Count | Action |');
  lines.push('|----------------|------:|--------|');
  lines.push(`| KEEP | ${s.KEEP} | Retain as-is |`);
  lines.push(`| KEEP + REWRITE | ${s['KEEP + REWRITE']} | Retain; content/UX pass required |`);
  lines.push(`| MERGE | ${s.MERGE} | Fold into target page, then redirect |`);
  lines.push(`| REDIRECT | ${s.REDIRECT} | 301 to target; remove source |`);
  lines.push(`| DELETE | ${s.DELETE} | Remove immediately (301 first if live) |`);
  lines.push('');

  lines.push('## Maintenance burden estimate');
  lines.push('');
  lines.push(`| Measure | Before | After | Change |`);
  lines.push(`|---------|-------:|------:|--------|`);
  lines.push(`| Indexable pages | ${m.currentPages} | ${m.recommendedPages} | **−${m.pagesRemoved} (${m.percentReduction}%)** |`);
  lines.push(`| Duplicate content streams eliminated | — | ${m.duplicateContentStreamsEliminated} | Redirects + deletes |`);
  lines.push(`| Guide→blog duplicate pairs redirected | 17 | ${m.guideBlogPairsRedirected} | Phase 3 consolidation |`);
  lines.push(`| Legacy legal stubs | 2 | 0 | DELETE after 301 |`);
  lines.push(`| Geo landing pages | 7 | 1 | Texas cornerstone only |`);
  lines.push(`| ADHD commercial funnel URLs | 6 | 2 | /adhd-care + /adhd-screening |`);
  lines.push('');
  lines.push(
    '**Estimated ongoing maintenance reduction:** ~' +
      m.percentReduction +
      '% fewer pages to update on pricing/provider/copy changes; 3 blog category hubs merged into one; single pricing page replaces 4 pricing URLs.',
  );
  lines.push('');

  lines.push('## Delete immediately');
  lines.push('');
  lines.push('| Source | Redirect target (if any) | Rationale |');
  lines.push('|--------|--------------------------|-----------|');
  for (const d of audit.deletes) {
    lines.push(`| \`${d.path}\` | ${d.redirectTarget ? `\`${d.redirectTarget}\`` : '—'} | ${mdEscape(d.rationale)} |`);
  }
  lines.push('');

  lines.push('## Redirect map (full)');
  lines.push('');
  lines.push('| Source | Target | Phase | Rationale |');
  lines.push('|--------|--------|------:|-----------|');
  for (const r of audit.redirects) {
    lines.push(`| \`${r.path}\` | \`${r.redirectTarget}\` | ${r.phase ?? '—'} | ${mdEscape(r.rationale)} |`);
  }
  lines.push('');

  lines.push('## Merge map');
  lines.push('');
  if (audit.merges.length === 0) {
    lines.push('None.');
  } else {
    lines.push('| Source | Target | Phase | Rationale |');
    lines.push('|--------|--------|------:|-----------|');
    for (const r of audit.merges) {
      lines.push(`| \`${r.path}\` | \`${r.redirectTarget}\` | ${r.phase ?? '—'} | ${mdEscape(r.rationale)} |`);
    }
  }
  lines.push('');

  lines.push('## Cornerstone pages');
  lines.push('');
  lines.push(`**${audit.cornerstones.length} URLs** anchor revenue, trust, and SEO authority:`);
  lines.push('');
  lines.push('### Core service & trust');
  lines.push('');
  for (const p of audit.cornerstones.filter((x) => !x.startsWith('/blog/') && !x.startsWith('/answers/') && !x.startsWith('/legal/'))) {
    lines.push(`- \`${p}\``);
  }
  lines.push('');
  lines.push('### Legal (required)');
  lines.push('');
  for (const p of audit.cornerstones.filter((x) => x.startsWith('/legal'))) {
    lines.push(`- \`${p}\``);
  }
  lines.push('');
  lines.push('### Blog cornerstones');
  lines.push('');
  for (const p of audit.cornerstones.filter((x) => x.startsWith('/blog/'))) {
    lines.push(`- \`${p}\``);
  }
  lines.push('');
  lines.push('### Health guide cornerstones (supporting PAA)');
  lines.push('');
  for (const p of audit.cornerstones.filter((x) => x.startsWith('/answers/'))) {
    lines.push(`- \`${p}\``);
  }
  lines.push('');

  lines.push('## KEEP + REWRITE');
  lines.push('');
  lines.push('| Page | Rationale |');
  lines.push('|------|-----------|');
  for (const r of audit.rewrites) {
    lines.push(`| \`${r.path}\` | ${mdEscape(r.rationale)} |`);
  }
  lines.push('');

  lines.push('## Phased implementation');
  lines.push('');
  lines.push('### Phase 1 — Deletes & safe redirects (Week 1)');
  lines.push('');
  lines.push(`**${audit.phases.phase1.length} pages.** Legacy legal stubs, orphan utilities, off-scope blogs, funnel duplicates, geo consolidation. No content loss on canonical targets.`);
  lines.push('');
  for (const p of audit.phases.phase1.slice(0, 15)) {
    lines.push(`- \`${p.path}\` → ${p.classification}${p.redirectTarget ? ` \`${p.redirectTarget}\`` : ''}`);
  }
  if (audit.phases.phase1.length > 15) {
    lines.push(`- *…and ${audit.phases.phase1.length - 15} more (see JSON)*`);
  }
  lines.push('');
  lines.push('### Phase 2 — Rewrites & hub merges (Weeks 2–4)');
  lines.push('');
  lines.push(`**${audit.phases.phase2.length} pages.** Service page rewrites, provider cards, pricing consolidation, blog category hub merge into /blog.`);
  lines.push('');
  for (const p of audit.phases.phase2) {
    lines.push(`- \`${p.path}\` — ${p.classification}${p.redirectTarget ? ` → \`${p.redirectTarget}\`` : ''}`);
  }
  lines.push('');
  lines.push('### Phase 3 — Guide consolidation (Weeks 4–6)');
  lines.push('');
  lines.push(
    `**${audit.phases.phase3.length} pages.** Redirect 17 cannibalizing Health Guides to winning blogs; redirect thin guides to hub or parent cornerstone.`,
  );
  lines.push('');
  lines.push('Monitor Search Console for 404s and ranking shifts 30 days post-redirect.');
  lines.push('');

  lines.push('## Per-page appendix');
  lines.push('');
  lines.push('| Path | Classification | Redirect target | Rationale |');
  lines.push('|------|----------------|-----------------|-----------|');
  for (const p of audit.pages) {
    lines.push(
      `| \`${p.path}\` | ${p.classification} | ${p.redirectTarget ? `\`${p.redirectTarget}\`` : '—'} | ${mdEscape(p.rationale)} |`,
    );
  }
  lines.push('');

  return lines.join('\n');
}

const audit = buildAudit();
const jsonPath = path.join(SITE_ROOT, 'data', 'site-pruning-audit.json');
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(audit, null, 2) + '\n');
console.log(`Wrote data/site-pruning-audit.json`);

const mdArg = process.argv.indexOf('--md');
const mdPath =
  mdArg >= 0 ? path.join(SITE_ROOT, process.argv[mdArg + 1]) : path.join(SITE_ROOT, 'docs', 'SITE-PRUNING-AUDIT.md');
fs.mkdirSync(path.dirname(mdPath), { recursive: true });
fs.writeFileSync(mdPath, generateMarkdown(audit) + '\n');
console.log(`Wrote ${path.relative(SITE_ROOT, mdPath)}`);
console.log(
  `Current: ${audit.summary.currentPageCount} → Recommended: ${audit.summary.recommendedPageCount} | DELETE: ${audit.summary.DELETE} | REDIRECT: ${audit.summary.REDIRECT} | Cornerstones: ${audit.summary.cornerstoneCount}`,
);
