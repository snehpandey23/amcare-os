/**
 * Content governance audit + report generation.
 * Run after: generate-answer-pages → seo-build
 * node scripts/content-governance-report.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import {
  CLINICAL_REVIEW_APPROVED,
  REVIEW_STATUS,
} from '../data/content-review-registry.mjs';
import { NAV_HEALTH_GUIDES } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'CONTENT-GOVERNANCE-REPORT.md');

const BLOG_HUBS = new Set(['index.html', 'all.html', 'adhd.html', 'weight-loss.html', 'telehealth.html']);

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(SITE_ROOT, dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(path.join(dir, e.name), rel));
    else if (e.name.endsWith('.html')) out.push({ rel: `${dir}/${rel}`, full });
  }
  return out;
}

function scanFile(full, rel) {
  const html = fs.readFileSync(full, 'utf8');
  return {
    rel,
    medicallyReviewed: /Medically reviewed by/i.test(html),
    pendingBlock: /clinical-review--pending/i.test(html),
    reviewedBlock: /clinical-review--reviewed/i.test(html),
    clinicalReviewLabel: /Clinical review/i.test(html),
    schemaReviewedBy: /"reviewedBy"\s*:\s*\{/.test(html),
    drSneh: /Dr\.\s*Sneh Pandey|dr-sneh-pandey/i.test(html) && /Medically reviewed|Clinically Reviewed/i.test(html),
    drNatasha: /Dr\.\s*Natasha Desai|dr-natasha-desai/i.test(html) && /Medically reviewed|Clinically Reviewed/i.test(html),
    drSwati: /Dr\.\s*Swati Pandey|dr-swati-pandey/i.test(html) && /Medically reviewed|Clinically Reviewed/i.test(html),
    healthGuidesNav: html.includes(`>${NAV_HEALTH_GUIDES.label}</a>`),
    answersNav: html.includes('>Answers</a>') && !html.includes(NAV_HEALTH_GUIDES.label),
  };
}

const blogs = walkHtml('blog').filter((f) => !BLOG_HUBS.has(f.rel.replace('blog/', '')));
const answers = walkHtml('answers').filter((f) => f.rel !== 'answers/index.html');
const blogScans = blogs.map((f) => scanFile(f.full, f.rel));
const answerScans = answers.map((f) => scanFile(f.full, f.rel));

const blogArticles = blogScans.filter((b) => !BLOG_HUBS.has(b.rel.split('/').pop()));
const pendingBlogs = blogArticles.filter((b) => b.pendingBlock).length;
const reviewedBlogs = blogArticles.filter((b) => b.reviewedBlock).length;
const falseClaimsBlogs = blogArticles.filter((b) => b.medicallyReviewed && !b.reviewedBlock).length;

const pendingAnswers = answerScans.filter((a) => a.pendingBlock).length;
const reviewedAnswers = answerScans.filter((a) => a.reviewedBlock).length;
const falseClaimsAnswers = answerScans.filter((a) => a.medicallyReviewed && !a.reviewedBlock).length;

const schemaWithReview = [...blogArticles, ...answerScans].filter((s) => s.schemaReviewedBy).length;

const navStillAnswers = walkHtml('.')
  .map((f) => scanFile(f.full, f.rel))
  .filter((s) => s.answersNav && s.rel.endsWith('.html')).length;

const approvedBlogCount = Object.keys(CLINICAL_REVIEW_APPROVED.blogs).length;
const approvedAnswerCount = Object.keys(CLINICAL_REVIEW_APPROVED.answers).length;

const preAuditClaims = {
  blogsWithMedicallyReviewed: 59,
  answersWithMedicallyReviewed: 56,
  note: 'Pre-governance snapshot: auto-assigned reviewer text on nearly all educational pages',
};

const report = `# Content Governance Report

Generated: ${new Date().toISOString()}

## Executive summary

A **clinical review status system** now governs all blog articles and answer pages. Content defaults to **\`PENDING_REVIEW\`** until explicitly allowlisted in \`data/content-review-registry.mjs\` as **\`CLINICALLY_REVIEWED\`**.

| Layer | Implementation |
|-------|----------------|
| Registry | \`data/content-review-registry.mjs\` |
| Blog apply | \`applyBlogReviewStatus()\` in \`seo-build.mjs\` |
| Answer apply | \`generate-answer-pages.mjs\` + \`applyAnswerReviewStatus()\` in \`seo-build.mjs\` |
| UI block | \`clinicalReviewBlock()\` in \`clinical-entity.mjs\` |
| Nav label | **${NAV_HEALTH_GUIDES.label}** → \`${NAV_HEALTH_GUIDES.path}\` (URL unchanged) |

---

## 1. Pre-change audit (claims on site)

Before this change, educational pages displayed physician review without a formal allowlist:

| Content type | Pages with "Medically reviewed" / \`reviewedBy\` schema | Issue |
|--------------|--------------------------------------------------------:|-------|
| Blog articles | ~${preAuditClaims.blogsWithMedicallyReviewed} | Auto \`pickReviewer()\` by keyword |
| Answer pages | ~${preAuditClaims.answersWithMedicallyReviewed} | Every seed used \`reviewerSlug\` + schema \`reviewedBy\` |

**Physician names appearing in review claims (historical):**

- Dr. Sneh Pandey — default fallback reviewer
- Dr. Natasha Desai — symptom / mental-health keyword routing
- Dr. Swati Desai — medication / GLP-1 keyword routing

These assignments were **editorial automation**, not documented sign-off.

---

## 2. Review status system

### Status values

| Status | User-facing display | Schema |
|--------|---------------------|--------|
| \`PENDING_REVIEW\` (default) | **Clinical Review Status** — Pending physician review. This educational content is awaiting final physician review. | No \`reviewedBy\` on BlogPosting / MedicalWebPage |
| \`CLINICALLY_REVIEWED\` | **Clinically Reviewed** — Reviewed by: [Physician] · Review date: [Date] | \`reviewedBy\` Physician entity included |

### How to approve content

Add an entry to \`CLINICAL_REVIEW_APPROVED\` in \`data/content-review-registry.mjs\`:

\`\`\`javascript
blogs: {
  'your-blog-slug': { reviewerSlug: 'dr-sneh-pandey', reviewDate: '2026-06-15' },
},
answers: {
  'your-answer-slug': { reviewerSlug: 'dr-natasha-desai', reviewDate: '2026-06-15' },
},
\`\`\`

Then run: \`node scripts/generate-answer-pages.mjs && node scripts/seo-build.mjs\`

---

## 3. Post-build audit (current)

| Metric | Blog articles | Answer pages |
|--------|:-------------:|:------------:|
| Total scanned | ${blogArticles.length} | ${answerScans.length} |
| \`PENDING_REVIEW\` (pending block) | ${pendingBlogs} | ${pendingAnswers} |
| \`CLINICALLY_REVIEWED\` (reviewed block) | ${reviewedBlogs} | ${reviewedAnswers} |
| Stale "Medically reviewed" without reviewed block | ${falseClaimsBlogs} | ${falseClaimsAnswers} |
| Allowlisted in registry | ${approvedBlogCount} | ${approvedAnswerCount} |
| JSON-LD with \`reviewedBy\` | — | — |

**Site-wide pages with \`reviewedBy\` in schema:** ${schemaWithReview} (should equal clinically reviewed count only)

**Nav still showing "Answers" (not Health Guides):** ${navStillAnswers} HTML files

---

## 4. Navigation wording

### Options evaluated

| Label | Pros | Cons | Fit for Siya |
|-------|------|------|:------------:|
| **Answers** (legacy) | Short, FAQ-like | Implies certainty; weak for unreviewed content | ★★ |
| **Health Library** | Authoritative | Sounds static/archival; less action-oriented | ★★★ |
| **Health Guides** | Physician-led, educational, pairs with "review status" | Slightly longer in nav | ★★★★★ |
| **Learn** | Minimal | Vague; not medical | ★★ |
| **Conditions & Symptoms** | SEO-descriptive | Narrow; excludes GLP-1, telehealth, labs topics | ★★ |

### Recommendation: **Health Guides**

Best match for a **physician-led virtual care** brand: signals curated education, allows pending review states, and avoids overpromising clinical certainty like "Answers."

### Implementation (this release)

- Primary nav + footer: **${NAV_HEALTH_GUIDES.label}** → \`${NAV_HEALTH_GUIDES.path}\`
- Answer hub H1: **Health guides**
- Breadcrumbs / schema: **Health Guides**
- URL \`/answers\` unchanged (preserve backlinks and sitemap)

### Optional phase 2

- 301 \`/answers\` → \`/health-guides\` after Search Console mapping
- Update \`llms.txt\` / indexes to say "health guides"

---

## 5. Cornerstone cluster (review status)

| Page | Status (default) |
|------|------------------|
| Food Noise & GLP-1 | PENDING_REVIEW |
| Insulin Resistance overview | PENDING_REVIEW |
| Why Am I Always Tired? | PENDING_REVIEW |
| Free vs Total Testosterone | PENDING_REVIEW |

Add to registry when physician sign-off is complete.

---

## 6. Files changed (governance release)

| File | Role |
|------|------|
| \`data/content-review-registry.mjs\` | Allowlist + status constants |
| \`scripts/clinical-entity.mjs\` | Review blocks + schema sync |
| \`scripts/seo-build.mjs\` | Apply status on blogs/answers |
| \`scripts/generate-answer-pages.mjs\` | Governed answer generation |
| \`scripts/site-chrome.mjs\` | Health Guides nav |
| \`styles.css\` | Pending vs reviewed styles |
| \`scripts/content-governance-report.mjs\` | This report |

---

## 7. Build order

\`\`\`bash
node scripts/generate-answer-pages.mjs
node scripts/internal-link-audit.mjs
node scripts/seo-build.mjs
node scripts/content-governance-report.mjs
\`\`\`

---

## 8. Remaining actions

1. Physician review queue: prioritize cornerstone metabolic/fatigue/hormone cluster, then high-traffic ADHD/GLP-1 URLs.
2. After each sign-off, add slug to \`CLINICAL_REVIEW_APPROVED\` and rebuild.
3. Quarterly audit: re-run \`content-governance-report.mjs\` and confirm \`falseClaims\` = 0.
4. Consider CMS field \`reviewStatus\` if moving off static HTML generation.
`;

fs.writeFileSync(OUT, report, 'utf8');
console.log('Wrote', OUT);
console.log('Blogs pending/reviewed:', pendingBlogs, reviewedBlogs, 'Answers:', pendingAnswers, reviewedAnswers);
