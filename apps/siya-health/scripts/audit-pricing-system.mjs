/**
 * Pricing system audit for Siya Health static site.
 * Run: node scripts/audit-pricing-system.mjs
 * Output: data/pricing-system-audit.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT_PATH = path.join(SITE_ROOT, 'data', 'pricing-system-audit.json');

/** Canonical care-delivery pricing model (audit target). */
const CANONICAL = {
  initialEvaluation: 199,
  nonControlledFollowUp: 79,
  controlledFollowUp: 149,
};

const SKIP_DIRS = new Set(['node_modules', 'docs', 'scripts', 'data', 'public', 'legal-document-versions', 'content']);

const PATTERNS = {
  dollarAmounts: /\$[\d,]+(?:\.\d{2})?/g,
  perMonth: /\$[\d,]+(?:\.\d{2})?\s*(?:<[^>]+>\s*)*\/?\s*month/gi,
  membership: /\bmembership\b/gi,
  subscription: /\bsubscription\b/gi,
  concierge: /\bconcierge\b/gi,
  cashPay: /\bcash[- ]?pay\b/gi,
  transparentPricing: /transparent\s+pricing/gi,
  bronzeSilverGold: /\b(Bronze|Silver|Gold)\b/g,
  planNames: /\b(Initial\s+(?:ADHD\s+)?Evaluation|Non[- ]?(?:Stimulant|Controlled)|Controlled|Stimulant|Ongoing\s+Care)\b/gi,
  pricingLinks: /href=["']([^"']*(?:membership-pricing|adhd-evaluation-cost)[^"']*)["']/gi,
  footerMembership: /Membership\s*&\s*pricing/gi,
};

const PAGE_CATEGORIES = {
  corePricing: ['/pricing'],
  servicePages: [
    '/adhd-care', '/adhd-screening', '/weight-loss-metabolic-health', '/telehealth',
    '/mens-health-longevity', '/primary-urgent-care', '/prescriptions', '/labs', '/book-appointment',
  ],
  adhdFunnel: [
    '/adult-adhd-diagnosis', '/adhd-treatment-online', '/online-adhd-test', '/creyos-adhd-testing',
    '/adhd-diagnosis-austin', '/adhd-diagnosis-florida', '/adhd-diagnosis-houston',
    '/adhd-diagnosis-pennsylvania', '/adhd-diagnosis-philadelphia', '/adhd-diagnosis-texas',
  ],
  hubPages: ['/', '/about', '/providers'],
};

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function fileToPath(rel) {
  if (rel === 'index.html') return '/';
  if (rel === 'blog/index.html') return '/blog';
  if (rel === 'answers/index.html') return '/answers';
  if (rel === 'providers/index.html') return '/providers';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/i, '');
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMainContent(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return main ? main[1] : html;
}

function unique(arr) {
  return [...new Set(arr)];
}

function parseDollarAmounts(text) {
  const matches = text.match(PATTERNS.dollarAmounts) || [];
  return unique(matches.map((m) => m.replace(/,/g, '')));
}

function parseNumericAmounts(amounts) {
  return unique(
    amounts
      .map((a) => parseInt(a.replace(/[^\d]/g, ''), 10))
      .filter((n) => !Number.isNaN(n) && n >= 10 && n <= 5000)
  );
}

function getCategory(route) {
  if (PAGE_CATEGORIES.corePricing.includes(route)) return 'core-pricing';
  if (PAGE_CATEGORIES.servicePages.includes(route)) return 'service-page';
  if (PAGE_CATEGORIES.adhdFunnel.includes(route)) return 'adhd-funnel';
  if (route === '/' || route === '/about') return 'hub';
  if (route.startsWith('/providers')) return 'provider';
  if (route.startsWith('/answers')) return 'health-guide';
  if (route.startsWith('/blog')) return 'blog';
  if (route.startsWith('/legal')) return 'legal';
  return 'other';
}

function snippetAround(text, index, len = 120) {
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + len);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
}

function findSnippets(text, regex, max = 5) {
  const out = [];
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  let m;
  while ((m = re.exec(text)) !== null && out.length < max) {
    out.push(snippetAround(text, m.index));
  }
  return out;
}

function detectIssues(page) {
  const issues = [];
  const { route, amounts, flags, mainText } = page;

  // Legacy membership tier model
  if (flags.hasBronzeSilverGold) {
    issues.push({
      type: 'legacy-membership-tiers',
      severity: 'critical',
      detail: 'Uses Bronze/Silver/Gold membership tiers instead of care-delivery $199/$79/$149 model',
    });
  }

  if (flags.has249) {
    issues.push({
      type: 'orphan-price-249',
      severity: 'high',
      detail: 'References $249 (Gold tier) — not in canonical care-delivery model',
    });
  }

  if (flags.has150 && !flags.has149) {
    issues.push({
      type: 'stimulant-price-150',
      severity: 'high',
      detail: 'Shows $150/month for controlled/stimulant follow-up; canonical is $149',
    });
  }

  if (flags.has149 && route !== '/membership-pricing' && flags.hasBronzeSilverGold === false) {
    // $149 in blog/ADHD context as single follow-up price — may omit $79 tier
    if (!flags.has79 && (route.startsWith('/blog') || route.startsWith('/answers') || PAGE_CATEGORIES.adhdFunnel.includes(route))) {
      issues.push({
        type: 'adhd-only-follow-up-149',
        severity: 'medium',
        detail: 'Mentions $149/month follow-up without $79 non-controlled tier or universal plan naming',
      });
    }
  }

  if (flags.has79 && route === '/membership-pricing') {
    issues.push({
      type: '79-as-bronze-tier',
      severity: 'critical',
      detail: '$79 framed as Bronze membership (2 visits/month) not Non-Controlled Follow-Up Plan',
    });
  }

  if (flags.has149 && route === '/membership-pricing') {
    issues.push({
      type: '149-as-silver-tier',
      severity: 'critical',
      detail: '$149 framed as Silver membership (4 visits/month) not Controlled Medication Follow-Up Plan',
    });
  }

  // ADHD-specific evaluation pricing on non-ADHD pages
  if (flags.has199 && route.includes('weight-loss')) {
    // weight loss has no $199 in body — skip
  } else if (
    flags.has199 &&
    !route.includes('adhd') &&
    !PAGE_CATEGORIES.corePricing.includes(route) &&
    route !== '/' &&
    !route.startsWith('/blog') &&
    !route.startsWith('/answers') &&
    !['service-page', 'hub'].includes(page.category) === false
  ) {
    const adhdSpecificRoutes = PAGE_CATEGORIES.adhdFunnel;
    if (!adhdSpecificRoutes.includes(route) && ['service-page', 'hub', 'other'].includes(page.category)) {
      const heroOnly = (page.amounts.length <= 1 && mainText.match(/\$199/g)?.length <= 2);
      if (heroOnly || ['primary-urgent-care', 'mens-health-longevity', 'prescriptions', 'labs', 'book-appointment'].some((p) => route.includes(p.replace(/\//, '')))) {
        issues.push({
          type: 'hero-199-without-breakdown',
          severity: 'medium',
          detail: 'Shows "$199 Transparent Pricing" hero badge without explaining universal Initial Evaluation model',
        });
      }
    }
  }

  if (flags.hasMembership && route === '/membership-pricing' && flags.hasWaitlist) {
    issues.push({
      type: 'membership-waitlist-vs-live-pricing',
      severity: 'high',
      detail: 'Page sells membership tiers but CTA is "Join the Waitlist" — pricing not actionable',
    });
  }

  if (flags.hasMembership && !flags.has199 && route === '/membership-pricing') {
    issues.push({
      type: 'membership-without-evaluation-anchor',
      severity: 'high',
      detail: 'Membership page omits $199 Initial Evaluation entry point',
    });
  }

  if (flags.hasConcierge && route === '/primary-urgent-care') {
    issues.push({
      type: 'concierge-primary-care',
      severity: 'medium',
      detail: 'Primary care page titled "Concierge" — may conflate with Gold-tier concierge on membership page',
    });
  }

  if (flags.linksToMembershipPricing && route === '/membership-pricing') {
    // self-link ok
  } else if (flags.linksToMembershipPricing && flags.hasBronzeSilverGold === false && page.category === 'service-page' && !flags.has199 && !flags.has79 && !flags.has149) {
    issues.push({
      type: 'service-links-membership-no-local-pricing',
      severity: 'high',
      detail: 'Footer/links point to membership-pricing but page has no local pricing table or dollar amounts',
    });
  }

  if (
    route === '/adhd-evaluation-cost' &&
    flags.has199 &&
    !flags.has79 &&
    !flags.has149
  ) {
    issues.push({
      type: 'evaluation-cost-page-missing-follow-up-tiers',
      severity: 'medium',
      detail: 'ADHD evaluation cost page shows $199 only; follow-up plans ($79/$149) not enumerated',
    });
  }

  if (route === '/adhd-care' && flags.has150) {
    issues.push({
      type: 'adhd-care-stimulant-150',
      severity: 'high',
      detail: 'adhd-care shows $150/month stimulant plan; canonical Controlled Follow-Up is $149',
    });
  }

  if (flags.hasAdhdEvaluationPricing && route !== '/adhd-care' && route !== '/pricing') {
    const dupRoutes = PAGE_CATEGORIES.adhdFunnel.filter((r) => r !== '/adhd-care');
    if (dupRoutes.includes(route) || route === '/online-adhd-test' || route === '/creyos-adhd-testing' || route === '/adult-adhd-diagnosis' || route === '/adhd-treatment-online') {
      issues.push({
        type: 'duplicate-adhd-pricing-surface',
        severity: 'low',
        detail: 'Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page',
      });
    }
  }

  if (flags.hasMonthlyPlanVague) {
    issues.push({
      type: 'vague-monthly-plan',
      severity: 'medium',
      detail: 'Says "monthly plan" without specifying $79 vs $149 follow-up tiers',
    });
  }

  return issues;
}

function analyzePage(rel) {
  const full = path.join(SITE_ROOT, rel);
  const html = fs.readFileSync(full, 'utf8');
  const route = fileToPath(rel);
  const mainHtml = extractMainContent(html);
  const mainText = stripTags(mainHtml);
  const fullText = stripTags(html);

  const amounts = parseDollarAmounts(mainText);
  const numeric = parseNumericAmounts(amounts);

  const flags = {
    has199: numeric.includes(199),
    has79: numeric.includes(79),
    has149: numeric.includes(149),
    has150: numeric.includes(150),
    has249: numeric.includes(249),
    hasBronzeSilverGold: PATTERNS.bronzeSilverGold.test(mainText),
    hasMembership: PATTERNS.membership.test(mainText),
    hasSubscription: PATTERNS.subscription.test(mainText),
    hasConcierge: PATTERNS.concierge.test(mainText),
    hasCashPay: PATTERNS.cashPay.test(mainText),
    hasTransparentPricing: PATTERNS.transparentPricing.test(mainText),
    hasWaitlist: /\bwaitlist\b/i.test(mainText),
    hasMonthlyPlanVague: /monthly plan/i.test(mainText) && !numeric.includes(79) && !numeric.includes(149),
    hasAdhdEvaluationPricing: /ADHD evaluation.*\$199|\$199.*ADHD/i.test(mainText),
    linksToMembershipPricing: /href=["']\/membership-pricing["']/i.test(html),
    linksToAdhdEvaluationCost: /href=["']\/adhd-evaluation-cost["']/i.test(html),
    footerMembershipLink: PATTERNS.footerMembership.test(html),
  };

  // reset regex lastIndex side effects — bronze test mutates
  PATTERNS.bronzeSilverGold.lastIndex = 0;

  const mentions = {
    amounts: amounts.slice(0, 30),
    numericAmounts: numeric,
    membershipCount: (mainText.match(PATTERNS.membership) || []).length,
    subscriptionCount: (mainText.match(PATTERNS.subscription) || []).length,
    conciergeCount: (mainText.match(PATTERNS.concierge) || []).length,
    cashPayCount: (mainText.match(PATTERNS.cashPay) || []).length,
    transparentPricingCount: (mainText.match(PATTERNS.transparentPricing) || []).length,
    perMonthSnippets: findSnippets(mainText, /\$[\d,]+\s*\/?\s*month/i, 4),
    membershipSnippets: findSnippets(mainText, /membership/i, 3),
    pricingTableDetected: /pricing-plan|pricing-grid|pricing-price|pricing-comparison-table/i.test(mainHtml),
    title: (html.match(/<title>([^<]*)<\/title>/i) || [])[1]?.trim(),
    h1: (mainHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim(),
  };

  const category = getCategory(route);
  const page = { route, file: rel, category, flags, amounts: numeric, mainTextLength: mainText.length, mentions };
  page.issues = detectIssues({ ...page, mainText });
  return page;
}

// --- Run audit ---
const files = walkHtml(SITE_ROOT);
const pages = files.map(analyzePage);

const summary = {
  auditedAt: new Date().toISOString(),
  canonicalModel: CANONICAL,
  totalHtmlPages: pages.length,
  pagesWithPricingMentions: pages.filter((p) => p.amounts.length > 0 || p.flags.hasMembership || p.flags.hasTransparentPricing).length,
  pagesWithDollarAmounts: pages.filter((p) => p.amounts.length > 0).length,
  pagesLinkingMembershipPricing: pages.filter((p) => p.flags.linksToMembershipPricing).length,
  pagesWithBronzeSilverGold: pages.filter((p) => p.flags.hasBronzeSilverGold).map((p) => p.route),
  amountDistribution: {},
  issueCounts: {},
  allIssues: [],
};

for (const p of pages) {
  for (const n of p.amounts) {
    summary.amountDistribution[n] = (summary.amountDistribution[n] || 0) + 1;
  }
  for (const issue of p.issues) {
    summary.issueCounts[issue.type] = (summary.issueCounts[issue.type] || 0) + 1;
    summary.allIssues.push({ route: p.route, file: p.file, category: p.category, ...issue });
  }
}

summary.totalInconsistencies = summary.allIssues.length;
summary.criticalIssues = summary.allIssues.filter((i) => i.severity === 'critical');
summary.highIssues = summary.allIssues.filter((i) => i.severity === 'high');
summary.pagesNeedingUpdates = unique(
  summary.allIssues
    .filter((i) => ['critical', 'high', 'medium'].includes(i.severity))
    .map((i) => i.route)
).sort();

const inventoryByCategory = {};
for (const p of pages) {
  if (
    p.amounts.length === 0 &&
    !p.flags.hasMembership &&
    !p.flags.hasTransparentPricing &&
    !p.flags.linksToMembershipPricing &&
    !p.flags.footerMembershipLink
  ) continue;

  if (!inventoryByCategory[p.category]) inventoryByCategory[p.category] = [];
  inventoryByCategory[p.category].push({
    route: p.route,
    file: p.file,
    amounts: p.mentions.numericAmounts,
    flags: {
      membership: p.flags.hasMembership,
      subscription: p.flags.hasSubscription,
      concierge: p.flags.hasConcierge,
      cashPay: p.flags.hasCashPay,
      bronzeSilverGold: p.flags.hasBronzeSilverGold,
      pricingTable: p.mentions.pricingTableDetected,
      linksMembership: p.flags.linksToMembershipPricing,
    },
    snippets: {
      perMonth: p.mentions.perMonthSnippets,
      membership: p.mentions.membershipSnippets,
    },
    title: p.mentions.title,
    issueCount: p.issues.length,
  });
}

const output = {
  summary,
  inventoryByCategory,
  pages: pages.map((p) => ({
    route: p.route,
    file: p.file,
    category: p.category,
    amounts: p.amounts,
    flags: p.flags,
    mentions: p.mentions,
    issues: p.issues,
  })),
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
console.log(`Wrote ${OUT_PATH}`);
console.log(`Pages: ${summary.totalHtmlPages} | With pricing mentions: ${summary.pagesWithPricingMentions}`);
console.log(`Inconsistencies: ${summary.totalInconsistencies} | Pages needing updates: ${summary.pagesNeedingUpdates.length}`);
