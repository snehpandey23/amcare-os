/**
 * Sitewide consistency audit + fixes (review dedupe, copy, Health Guides hub regen).
 * Run: node scripts/apply-sitewide-consistency.mjs
 * Then: npm run build && node scripts/capture-consistency-qa-screenshots.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import { COPY_STANDARDS } from '../data/site-standards.mjs';
import { dedupeClinicalReview } from './blog-engagement-components.mjs';
import { applyBlogReviewStatus, applyAnswerReviewStatus } from './clinical-entity.mjs';
import { normalizeSitewideCopy } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const DOCS = path.join(SITE_ROOT, 'docs');

const HEALTH_GUIDE_CATEGORIES = [
  { id: 'metabolic', label: 'Metabolic Health' },
  { id: 'energy', label: 'Energy & Fatigue' },
  { id: 'hormone', label: 'Hormone Health' },
  { id: 'adhd', label: 'ADHD & Focus' },
  { id: 'telehealth', label: 'Telehealth & Care' },
];

const FEATURED_BY_CATEGORY = {
  metabolic: ['what-is-food-noise', 'what-is-insulin-resistance', 'semaglutide-weight-loss-how-it-works'],
  energy: ['why-am-i-tired-even-after-sleeping', 'can-sleep-apnea-cause-fatigue', 'signs-of-sleep-apnea-in-adults'],
  hormone: ['what-is-free-testosterone', 'what-does-low-testosterone-feel-like', 'when-is-testosterone-therapy-appropriate'],
  adhd: ['signs-of-adult-adhd', 'how-long-adhd-evaluation', 'can-adhd-be-diagnosed-online'],
  telehealth: ['is-telehealth-legitimate', 'meet-and-greet-telehealth-expectations', 'how-online-prescriptions-work'],
};

const RECOMMENDED_NEXT_GUIDES = {
  metabolic: ['GLP-1 plateaus and dose adjustments', 'A1C vs fasting glucose for metabolic screening'],
  energy: ['Sleep hygiene when you are still tired', 'Iron deficiency vs thyroid fatigue'],
  hormone: ['SHBG and free testosterone labs', 'When to recheck testosterone on TRT'],
  adhd: ['ADHD medication holidays', 'Women and inattentive ADHD presentation'],
  telehealth: ['State licensing for telehealth visits', 'FSA/HSA for telehealth visits'],
};

const CORNERSTONE_BLOGS = [
  'blog/food-noise-and-glp-1-what-it-means-and-what-helps.html',
  'blog/insulin-resistance-and-weight-loss-clinician-overview.html',
  'blog/why-am-i-always-tired-causes-when-to-see-doctor.html',
  'blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html',
  'blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html',
];

const CATEGORY_HUBS = [
  'blog/index.html',
  'blog/all.html',
  'blog/adhd.html',
  'blog/weight-loss.html',
  'blog/telehealth.html',
  'answers/index.html',
];

function guideCategoryForSeed(seed) {
  if (
    seed.slug === 'why-am-i-tired-even-after-sleeping' ||
    seed.slug === 'can-sleep-apnea-cause-fatigue' ||
    seed.slug === 'signs-of-sleep-apnea-in-adults'
  ) {
    return 'energy';
  }
  if (seed.topic === 'adhd') return 'adhd';
  if (seed.topic === 'mens-health') return 'hormone';
  if (seed.topic === 'telehealth') return 'telehealth';
  if (seed.topic === 'weight-loss') return 'metabolic';
  return 'telehealth';
}

function walkHtmlFiles(dir, rel = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const r = rel ? `${rel}/${name}` : name;
    if (fs.statSync(full).isDirectory()) out.push(...walkHtmlFiles(full, r));
    else if (name.endsWith('.html')) out.push(r);
  }
  return out;
}

function countReviewBlocks(html) {
  return (html.match(/<aside class="clinical-review/g) || []).length;
}

function stripReviewFromHubs(html) {
  return html.replace(/\s*<aside class="clinical-review[\s\S]*?<\/aside>/g, '');
}

function relPathToUrl(rel) {
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\.html$/, '').replace(/\/index$/, '/');
}

function auditBlogArticle(rel, html) {
  const issues = [];
  const reviewCount = countReviewBlocks(html);
  if (reviewCount > 1) issues.push(`${reviewCount} clinical-review blocks`);
  if (reviewCount === 0 && !CATEGORY_HUBS.includes(rel)) issues.push('missing clinical-review block');

  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) issues.push(`${h1} H1 tags (expected 1)`);

  const midCta = (html.match(/blog-cta--mid/g) || []).length;
  if (midCta > 1) issues.push(`${midCta} mid-article CTAs`);

  const ctaBand = (html.match(/cta-band/g) || []).length;
  if (ctaBand > 1) issues.push(`${ctaBand} cta-band blocks`);

  const serviceCards = (html.match(/blog-service-card/g) || []).length;
  if (serviceCards > 1) issues.push(`${serviceCards} service cards`);

  if (!html.includes('related-health-guides') && !html.includes('Related Health Guides')) {
    issues.push('no Related Health Guides section');
  }
  if (!html.includes('continue-reading')) issues.push('no Continue reading section');

  if (/Review needed|Clinical Review Status/i.test(html) && !/Pending physician review/i.test(html)) {
    issues.push('legacy review label text');
  }

  return issues;
}

function scanCopyInconsistencies(allHtml) {
  const patterns = [
    { label: 'Schedule Meet & Greet', re: />Schedule Meet &amp; Greet</ },
    { label: 'Explore care options (lowercase)', re: />Explore care options</ },
    { label: 'Take Free Screening', re: />Take Free Screening</ },
    { label: 'Clinical Answers nav', re: />Clinical Answers</ },
    { label: 'Answers hub nav', re: />Answers<\/a>/ },
    { label: 'Review needed', re: /Review needed/i },
    { label: 'Clinical Review Status label', re: />Clinical Review Status</ },
    { label: 'Clinically Reviewed label', re: />Clinically Reviewed</ },
    { label: 'Book ADHD evaluation (lowercase)', re: />Book ADHD evaluation</ },
  ];
  const found = {};
  for (const { label, re } of patterns) {
    const hits = [];
    for (const [rel, html] of allHtml) {
      if (re.test(html)) hits.push(rel);
    }
    if (hits.length) found[label] = hits;
  }
  return found;
}

function fixContentFile(relPath) {
  let html = fs.readFileSync(path.join(SITE_ROOT, relPath), 'utf8');
  const before = countReviewBlocks(html);

  if (CATEGORY_HUBS.includes(relPath)) {
    html = stripReviewFromHubs(html);
  } else if (relPath.startsWith('blog/')) {
    const slug = relPath.replace(/^blog\//, '').replace(/\.html$/, '');
    html = dedupeClinicalReview(html);
    html = applyBlogReviewStatus(html, slug);
  } else if (relPath.startsWith('answers/') && relPath !== 'answers/index.html') {
    const slug = relPath.replace(/^answers\//, '').replace(/\.html$/, '');
    html = dedupeClinicalReview(html);
    html = applyAnswerReviewStatus(html, slug);
  }

  html = normalizeSitewideCopy(html);
  const after = countReviewBlocks(html);
  fs.writeFileSync(path.join(SITE_ROOT, relPath), html, 'utf8');
  return { before, after };
}

function categoryInventory() {
  const byCat = Object.fromEntries(HEALTH_GUIDE_CATEGORIES.map((c) => [c.id, []]));
  for (const s of ANSWER_SEEDS) byCat[guideCategoryForSeed(s)].push(s);
  return HEALTH_GUIDE_CATEGORIES.map((cat) => {
    const seeds = byCat[cat.id];
    const featured = (FEATURED_BY_CATEGORY[cat.id] || [])
      .map((slug) => seeds.find((s) => s.slug === slug))
      .filter(Boolean);
    const missing = Math.max(0, 3 - featured.length);
    return {
      ...cat,
      total: seeds.length,
      featured: featured.map((s) => s.slug),
      missingGuideCount: missing,
      recommended: RECOMMENDED_NEXT_GUIDES[cat.id] || [],
    };
  });
}

function writeReport(name, body) {
  const p = path.join(DOCS, name);
  fs.mkdirSync(DOCS, { recursive: true });
  fs.writeFileSync(p, body, 'utf8');
  console.log('Wrote', p);
}

function main() {
  const allRel = walkHtmlFiles(SITE_ROOT);
  const blogArticles = allRel.filter((r) => r.startsWith('blog/') && !CATEGORY_HUBS.includes(r));
  const answerPages = allRel.filter((r) => r.startsWith('answers/') && r !== 'answers/index.html');

  const pagesScanned = [...blogArticles, ...answerPages, ...CATEGORY_HUBS];
  const duplicatesBefore = [];
  const duplicatesRemoved = [];
  const manualReview = [];

  for (const rel of pagesScanned) {
    const full = path.join(SITE_ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const before = countReviewBlocks(fs.readFileSync(full, 'utf8'));
    if (before > 1 || (CATEGORY_HUBS.includes(rel) && before > 0)) {
      duplicatesBefore.push({ rel, count: before });
    }
  }

  for (const rel of allRel) {
    if (!rel.endsWith('.html')) continue;
    const full = path.join(SITE_ROOT, rel);
    if (!fs.existsSync(full)) continue;

    if (rel.startsWith('blog/') || rel.startsWith('answers/') || CATEGORY_HUBS.includes(rel)) {
      const { before, after } = fixContentFile(rel);
      if (before > after || (CATEGORY_HUBS.includes(rel) && before > 0)) {
        duplicatesRemoved.push({ rel, before, after });
      }
      if (after > 1) manualReview.push({ rel, count: after, reason: 'still multiple review blocks' });
      if (after === 0 && !CATEGORY_HUBS.includes(rel)) {
        manualReview.push({ rel, count: 0, reason: 'missing review block after fix' });
      }
    } else {
      let html = fs.readFileSync(full, 'utf8');
      html = normalizeSitewideCopy(html);
      fs.writeFileSync(full, html, 'utf8');
    }
  }

  const allHtmlAfter = allRel
    .filter((r) => r.endsWith('.html'))
    .map((r) => [r, fs.readFileSync(path.join(SITE_ROOT, r), 'utf8')]);

  const copyBefore = scanCopyInconsistencies(
    duplicatesBefore.length
      ? allRel.map((r) => [r, fs.readFileSync(path.join(SITE_ROOT, r), 'utf8')])
      : allHtmlAfter,
  );
  const copyAfter = scanCopyInconsistencies(allHtmlAfter);

  const blogAudit = blogArticles.map((rel) => ({
    rel,
    issues: auditBlogArticle(rel, fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8')),
  }));
  const blogIssues = blogAudit.filter((b) => b.issues.length);

  const inventory = categoryInventory();

  writeReport(
    'REVIEW-STATUS-CONSISTENCY-REPORT.md',
    `# Review status consistency report

Generated: ${new Date().toISOString()}

## Pages scanned

| Area | Count |
|------|------:|
| Blog articles | ${blogArticles.length} |
| Health Guide answer pages | ${answerPages.length} |
| Category hubs | ${CATEGORY_HUBS.length} |
| **Total** | **${pagesScanned.length}** |

## Duplicates found (before fix)

${duplicatesBefore.length ? duplicatesBefore.map((d) => `- \`${d.rel}\`: ${d.count} blocks`).join('\n') : '_None_'}

## Duplicates removed

${duplicatesRemoved.length ? duplicatesRemoved.map((d) => `- \`${d.rel}\`: ${d.before} → ${d.after}`).join('\n') : '_None_'}

## Pages still needing manual review

${manualReview.length ? manualReview.map((m) => `- \`${m.rel}\`: ${m.reason} (${m.count})`).join('\n') : '_None — automated dedupe + seo-build sync applied_'}

## Rules applied

1. One \`clinical-review\` aside per blog article and answer page.
2. Category hubs (\`answers/index.html\`, blog category indexes) have **no** article-level review blocks.
3. Pending badge label: **${COPY_STANDARDS.reviewBadgePending}**.
4. Reviewed badge label: **${COPY_STANDARDS.reviewBadgeReviewed}**.
`,
  );

  writeReport(
    'COPY-CONSISTENCY-REPORT.md',
    `# Copy consistency report

Generated: ${new Date().toISOString()}

## Approved wording system

| Use | Copy |
|-----|------|
| Primary CTA | ${COPY_STANDARDS.primaryCta} |
| Secondary CTA | ${COPY_STANDARDS.secondaryCta} |
| ADHD primary CTA | ${COPY_STANDARDS.adhdPrimaryCta} |
| ADHD secondary CTA | ${COPY_STANDARDS.adhdSecondaryCta} |
| Education hub | ${COPY_STANDARDS.educationHub} |
| Review badge (pending) | ${COPY_STANDARDS.reviewBadgePending} |
| Review badge (reviewed) | ${COPY_STANDARDS.reviewBadgeReviewed} |

## Inconsistencies remaining after fix

${Object.keys(copyAfter).length ? Object.entries(copyAfter).map(([k, v]) => `### ${k}\n${v.map((f) => `- \`${f}\``).join('\n')}`).join('\n\n') : '_None detected in HTML scan_'}

## Fixes applied

- \`normalizeSitewideCopy()\` extended in \`scripts/site-chrome.mjs\`
- \`syncClinicalReviewAside()\` strips all review asides then inserts one governed block
- Blog engagement dedupe aligned with pending badge copy

## Note

Marketing wordplay using the word "answers" (e.g. blog titles) was not changed. Only hub/nav labels use **Health Guides**.
`,
  );

  writeReport(
    'HEALTH-GUIDES-HUB-REDESIGN-REPORT.md',
    `# Health Guides hub redesign report

Generated: ${new Date().toISOString()}

## Before

- Uneven category cards (4-item previews, long expandable lists on hub).
- Telehealth category forced full-width row; visual imbalance across categories.

## After

- \`/answers\` hub shows **exactly 3 featured guide cards** per category.
- Each card: category icon accent, title, one-line description, Read guide link.
- **View all [Category] guides** reveals remaining guides in a collapsed panel (not on initial view).
- Categories with fewer than 3 guides show **More guides coming soon** placeholder cards.
- Secondary link uses **${COPY_STANDARDS.secondaryCta}**.

## Categories

${inventory.map((c) => `- **${c.label}**: ${c.total} guides, ${3 - c.missingGuideCount} featured + ${c.missingGuideCount} placeholder slot(s)`).join('\n')}

## Implementation

- \`scripts/generate-answer-pages.mjs\` — \`buildIndexPage()\`, \`FEATURED_BY_CATEGORY\`
- \`styles.css\` — \`.health-guides-featured-grid\`, \`.health-guide-feature-card\`

## Next step

Run \`npm run build\` to regenerate \`answers/index.html\` from the generator.
`,
  );

  writeReport(
    'HEALTH-GUIDES-CATEGORY-BALANCE.md',
    `# Health Guides category balance

Generated: ${new Date().toISOString()}

${inventory
  .map(
    (c) => `## ${c.label}

| Metric | Value |
|--------|------:|
| Total guides | ${c.total} |
| Featured (hub) | ${c.featured.join(', ') || '—'} |
| Placeholder slots on hub | ${c.missingGuideCount} |
| Guides behind “View all” | ${Math.max(0, c.total - c.featured.length)} |

### Recommended next guides to create (planning only — not authored in this pass)

${c.recommended.map((r) => `- ${r}`).join('\n')}
`,
  )
  .join('\n')}

## Sleep / energy note

Energy & Fatigue has **${inventory.find((c) => c.id === 'energy')?.total ?? 0}** guides (sleep apnea + fatigue cluster). Sleep-specific expansion is listed under Energy & Fatigue recommendations above.
`,
  );

  writeReport(
    'BLOG-CONSISTENCY-REPORT.md',
    `# Blog consistency report

Generated: ${new Date().toISOString()}

## Articles audited

${blogArticles.length} blog HTML files.

## Cornerstone articles (QA focus)

${CORNERSTONE_BLOGS.map((b) => {
  const issues = blogAudit.find((x) => x.rel === b)?.issues || [];
  return `- \`${b}\`${issues.length ? ` — ⚠ ${issues.join('; ')}` : ' — OK'}`;
}).join('\n')}

## Articles with remaining issues

${blogIssues.length ? blogIssues.map((b) => `- \`${b.rel}\`: ${b.issues.join('; ')}`).join('\n') : '_None_'}

## Checks performed

- Single clinical-review block
- Single H1
- Mid-article CTA count (\`blog-cta--mid\`)
- \`cta-band\` duplication
- Service card duplication
- Related Health Guides section
- Continue reading section
- Legacy review label strings
`,
  );

  console.log('\nDone. Regenerate hub: npm run build');
  console.log(`Review dedupe: ${duplicatesRemoved.length} files updated`);
  console.log(`Blog issues remaining: ${blogIssues.length}`);
}

main();
