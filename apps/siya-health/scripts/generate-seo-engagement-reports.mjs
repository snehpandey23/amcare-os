/**
 * Generate SEO & engagement strategy reports for cornerstone cluster.
 * Run: node scripts/generate-seo-engagement-reports.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CORNERSTONE_ARTICLES,
  KEYWORD_DESTINATIONS,
  ROADMAP_90_DAY,
} from '../data/keyword-universe.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(SITE_ROOT, 'blog');

function readBlog(slug) {
  return fs.readFileSync(path.join(BLOG_DIR, `${slug}.html`), 'utf8');
}

function countMatches(html, pattern) {
  const re = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
  return (html.match(re) || []).length;
}

function auditArticle(article) {
  const html = readBlog(article.slug);
  const text = html.replace(/<[^>]+>/g, ' ').toLowerCase();
  const primaryHits = countMatches(text, article.primary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const secondaryHits = article.secondary.map((kw) => ({
    keyword: kw,
    count: countMatches(text, kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(' ').join('\\s+')),
  }));
  const entityHits = article.entities.map((e) => ({
    entity: e,
    present: text.includes(e.toLowerCase()),
  }));
  const internalLinks = (html.match(/href="\/(blog|answers|weight-loss|mens-health|adhd-care|telehealth)[^"]*"/g) || []).length;
  const faqSchema = html.includes('"@type":"FAQPage"');
  const faqH3 = countMatches(html, /<h3>/g);
  const h2 = countMatches(html, /<h2>/g);
  const engage = {
    takeaway: html.includes('blog-engage--takeaway'),
    evidence: html.includes('blog-engage--evidence'),
    myth: html.includes('blog-engage--myth'),
    reddit: html.includes('blog-engage--reddit'),
    pearl: html.includes('blog-engage--pearl'),
    infographic: html.includes('blog-engage--infographic'),
    flowchart: html.includes('blog-engage--flowchart'),
    decision: html.includes('blog-engage--decision'),
  };
  const engageCount = Object.values(engage).filter(Boolean).length;
  return {
    ...article,
    primaryHits,
    secondaryHits,
    entityHits,
    internalLinks,
    faqSchema,
    faqH3,
    h2,
    engage,
    engageCount,
  };
}

function buildKeywordMap() {
  const lines = [
    '# Keyword Map — Siya Health Metabolic Cluster',
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Maps target queries to the best on-site destination. Prefer one primary URL per intent; use secondary links for cluster depth—not keyword stuffing.',
    '',
    '| Keyword / query | Status | Primary destination | Type | Notes |',
    '|-----------------|--------|---------------------|------|-------|',
  ];
  for (const row of KEYWORD_DESTINATIONS) {
    const dest = row.path || `**NEW:** ${row.recommendation || 'TBD'}`;
    const type = row.destination || '—';
    const notes = row.also ? `Also: ${row.also}` : (row.recommendation || '—');
    lines.push(`| ${row.keyword} | ${row.status} | ${dest} | ${type} | ${notes} |`);
  }
  lines.push('', '## Cornerstone primary targets', '');
  for (const a of CORNERSTONE_ARTICLES) {
    lines.push(`- **${a.title}** → \`${a.path}\` — primary: *${a.primary}*`);
  }
  return lines.join('\n');
}

function buildGapReport(audits) {
  const covered = KEYWORD_DESTINATIONS.filter((k) => k.status === 'covered');
  const partial = KEYWORD_DESTINATIONS.filter((k) => k.status === 'partial');
  const gap = KEYWORD_DESTINATIONS.filter((k) => k.status === 'gap');
  const lines = [
    '# Content Gap Report',
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Summary',
    '',
    `| Coverage | Count |`,
    `|----------|------:|`,
    `| A — Covered well | ${covered.length} |`,
    `| B — Partially covered | ${partial.length} |`,
    `| C — Not covered (new content) | ${gap.length} |`,
    '',
    '## A. Covered well',
    '',
    ...covered.map((k) => `- **${k.keyword}** → ${k.path}`),
    '',
    '## B. Partially covered',
    '',
    ...partial.map((k) => `- **${k.keyword}** → ${k.path}${k.also ? ` (+ ${k.also})` : ''}`),
    '',
    '## C. Not covered — prioritize new content',
    '',
    ...gap.map((k) => `- **${k.keyword}** — ${k.recommendation}`),
    '',
    '## Cornerstone keyword depth (automated scan)',
    '',
    '| Article | Primary mentions | Secondary hits (≥1) | Entities present | Internal links |',
    '|---------|-----------------:|--------------------:|-----------------:|---------------:|',
  ];
  for (const a of audits) {
    const sec = a.secondaryHits.filter((s) => s.count > 0).length;
    const ent = a.entityHits.filter((e) => e.present).length;
    lines.push(`| ${a.title} | ${a.primaryHits} | ${sec}/${a.secondaryHits.length} | ${ent}/${a.entityHits.length} | ${a.internalLinks} |`);
  }
  lines.push(
    '',
    '## Prioritization rubric',
    '',
    '1. **Business value** — queries tied to Meet & Greet, metabolic, ADHD, men\'s health funnels',
    '2. **Search intent** — informational with clear path to telehealth evaluation',
    '3. **Cluster authority** — strengthens fatigue ↔ metabolic ↔ hormone ↔ GLP-1 graph',
    '4. **Internal linking value** — fills orphan nodes in `internal-link-audit.json`',
    ''
  );
  return lines.join('\n');
}

function buildEnhancementReport(audits) {
  const recs = {
    'food-noise-and-glp-1-what-it-means-and-what-helps': {
      h2: ['Optional: “Food noise after substantial weight loss” (Science 2025 rebound theme)'],
      faq: ['Add FAQ: “Does tirzepatide quiet food noise differently than semaglutide?” (qualitative only)'],
      links: ['Link to new article when published: weight regain / breakthrough cravings'],
      answers: ['/answers/who-qualifies-glp-1-weight-loss'],
      entities: ['Zepbound', 'Mounjaro naming for patient search'],
      reject: ['“Best GLP-1 for food noise” ranking without head-to-head food-noise endpoints'],
    },
    'insulin-resistance-and-weight-loss-clinician-overview': {
      h2: ['Optional H2: “Post-meal fatigue and glucose — patient tracking”'],
      faq: ['PAA: “Does metformin help weight loss with insulin resistance?”'],
      links: ['Stronger bidirectional link to sleep apnea cornerstone in body (not only hub)'],
      answers: ['/blog/oral-vs-injectable-weight-loss-medications'],
      entities: ['PCOS', 'fatty liver (MASLD) as comorbidity anchors'],
      reject: ['HOMA-IR cutoff tables marketed as diagnosis'],
    },
    'why-am-i-always-tired-causes-when-to-see-doctor': {
      h2: ['Optional: “Medications that cause fatigue” (common culprits list)'],
      faq: ['PAA: “Can B12 deficiency cause fatigue if level is low-normal?”'],
      links: ['New article: poor sleep vs ADHD when published'],
      answers: ['/answers/can-sleep-apnea-cause-fatigue', '/answers/signs-of-sleep-apnea-in-adults'],
      entities: ['ME/CFS PEM criteria — keep brief, avoid treatment promises'],
      reject: ['Universal supplement stacks for “adrenal fatigue”'],
    },
    'free-testosterone-vs-total-testosterone-what-patients-should-know': {
      h2: ['Optional: “Fertility and TRT — what to ask before starting”'],
      faq: ['PAA: “What is bioavailable testosterone?”'],
      links: ['Link modafinil/fatigue blog only if clinically framed as differential'],
      answers: ['/answers/when-is-testosterone-therapy-appropriate'],
      entities: ['LH/FSH', 'prolactin when secondary hypogonadism suspected'],
      reject: ['“Optimal” total T 800–1200 ng/dL marketing ranges'],
    },
  };
  const lines = [
    '# Article Enhancement Report',
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Recommendations improve usefulness for patients and clinicians—not SEO filler.',
    '',
  ];
  for (const a of audits) {
    const r = recs[a.slug];
    lines.push(`## ${a.title}`, '', `**URL:** \`${a.path}\``, '');
    lines.push('### Recommended additions', '');
    lines.push('**H2 sections:**', ...r.h2.map((x) => `- ${x}`), '');
    lines.push('**FAQ additions:**', ...r.faq.map((x) => `- ${x}`), '');
    lines.push('**Internal links:**', ...r.links.map((x) => `- ${x}`), '');
    lines.push('**Answer page links:**', ...r.answers.map((x) => `- ${x}`), '');
    lines.push('**Semantic entities:**', ...r.entities.map((x) => `- ${x}`), '');
    lines.push('### Reject (SEO-only / low credibility)', '', ...r.reject.map((x) => `- ${x}`), '');
  }
  return lines.join('\n');
}

function buildOptimizationReport(audits) {
  const before = {
    engage: 0,
    faq: 6,
    links: 8,
  };
  const lines = [
    '# SEO & Engagement Optimization Report',
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## System delivered',
    '',
    '| Component | CSS class | Purpose |',
    '|-----------|-----------|---------|',
    '| Key Takeaway Box | `.blog-engage--takeaway` | Scannable conclusions |',
    '| Evidence Snapshot | `.blog-engage--evidence` | Trial/guideline anchors |',
    '| Myth vs Reality | `.blog-engage--myth` | Correct common misconceptions |',
    '| Reddit Reality Box | `.blog-engage--reddit` | Patient-language themes (paraphrased) |',
    '| Clinical Pearl | `.blog-engage--pearl` | Clinician-style practical note |',
    '| Mini Infographic | `.blog-engage--infographic` | Stat highlights |',
    '| Symptom Flowchart | `.blog-flowchart` | Stepwise differentials |',
    '| Decision Tree | `.blog-decision-tree` | When to seek care / labs |',
    '',
    '**Implementation:** `scripts/blog-engagement-components.mjs`, `scripts/apply-cornerstone-engagement.mjs`, `styles.css`',
    '',
    '**Documentation:** `BLOG-ENGAGEMENT-SYSTEM.md`',
    '',
    '## Before / after — four cornerstone articles',
    '',
    '| Article | Metric | Before | After (current) |',
    '|---------|--------|--------|-----------------|',
  ];
  for (const a of audits) {
    lines.push(`| ${a.title} | Engagement blocks | 0 | ${a.engageCount} (8 types max) |`);
    lines.push(`| ${a.title} | FAQ items (H3) | ~6–8 | ${a.faqH3} |`);
    lines.push(`| ${a.title} | Internal links (body) | ~8–12 | ${a.internalLinks} |`);
    lines.push(`| ${a.title} | Primary keyword density | baseline | ${a.primaryHits} phrase hits (natural) |`);
    lines.push(`| ${a.title} | H2 sections | ~10 | ${a.h2} |`);
  }
  lines.push(
    '',
    '### Engagement inventory (after)',
    '',
    '| Article | Takeaway | Evidence | Myth | Reddit | Pearl | Infographic | Flowchart | Decision |',
    '|---------|:--------:|:--------:|:----:|:------:|:-----:|:-----------:|:---------:|:--------:|'
  );
  for (const a of audits) {
    const e = a.engage;
    const y = (v) => (v ? '✓' : '—');
    lines.push(
      `| ${a.title} | ${y(e.takeaway)} | ${y(e.evidence)} | ${y(e.myth)} | ${y(e.reddit)} | ${y(e.pearl)} | ${y(e.infographic)} | ${y(e.flowchart)} | ${y(e.decision)} |`
    );
  }
  lines.push(
    '',
    '## 90-day cluster expansion roadmap',
    '',
    '| Cluster | Article | Topical authority | Business impact | Linking impact | Priority |',
    '|---------|---------|:-----------------:|:---------------:|:--------------:|:--------:|'
  );
  for (const r of ROADMAP_90_DAY) {
    lines.push(
      `| ${r.cluster} | ${r.title} | ${r.authority} | ${r.business} | ${r.linking} | ${r.priority} |`
    );
  }
  lines.push(
    '',
    '## Part 2 — Cornerstone keyword & intent audit',
    '',
    'Scoring: **Strong** = primary + most secondaries present naturally; **Partial** = theme covered but query variant thin; **Gap** = needs new FAQ/H2 or dedicated URL.',
    '',
    '### Food Noise and GLP-1',
    '| Dimension | Assessment |',
    '|-----------|------------|',
    '| Primary (`food noise GLP-1`) | Strong — title, lead, body |',
    '| Secondaries | Strong — semaglutide, tirzepatide, cravings, mental hunger |',
    '| Entities | Strong — STEP 1, AACE, hedonic eating, Science 2025 VTA paper |',
    '| PAA gaps | Tirzepatide vs semaglutide for food noise (add FAQ if physician-approved) |',
    '| Reddit themes | Covered via Reddit Reality box + patient story |',
    '| Internal links | Strong — IR, fatigue, answers, weight-loss service |',
    '',
    '### Insulin Resistance and Weight Loss',
    '| Dimension | Assessment |',
    '|-----------|------------|',
    '| Primary | Strong |',
    '| Secondaries | Strong — normal A1C, post-meal fatigue, visceral fat |',
    '| Entities | Strong — DPP, DIETFITS, HOMA-IR (with caveats), ADA 2025 |',
    '| PAA gaps | Metformin + weight loss FAQ; PCOS/MASLD H2 optional |',
    '| Reddit themes | Covered — A1C 5.4, keto myth, HOMA-IR DIY |',
    '',
    '### Why Am I Always Tired?',
    '| Dimension | Assessment |',
    '|-----------|------------|',
    '| Primary | Strong |',
    '| Secondaries | Strong — unrefreshing sleep, ADHD fatigue, iron without anemia |',
    '| Entities | Strong — OSA, ferritin, ME/CFS, burnout ICD-11 |',
    '| PAA gaps | Medication-induced fatigue list; B12 low-normal FAQ |',
    '| Reddit themes | Covered — normal labs, coffee, lunch crash |',
    '',
    '### Free vs Total Testosterone',
    '| Dimension | Assessment |',
    '|-----------|------------|',
    '| Primary | Strong |',
    '| Secondaries | Strong — SHBG, bioavailable T, TRT red flags |',
    '| Entities | Strong — Endocrine Society, AUA, Vermeulen, OSA |',
    '| PAA gaps | Bioavailable testosterone FAQ; fertility + TRT H2 |',
    '| Reddit themes | Covered — afternoon labs, high SHBG |',
    '',
    '## Strategic goal',
    '',
    'Build the strongest **physician-led** content ecosystem around fatigue, brain fog, sleep, metabolic health, hormones, ADHD, and sustainable weight loss—optimized for **users first**, search visibility second.',
    '',
    '## Next steps',
    '',
    '1. Physician review of engagement copy on cornerstones',
    '2. Publish gap articles (sleep vs ADHD, weight regain after GLP-1)',
    '3. Extend engagement components to sleep apnea cornerstone',
    '4. Monitor Search Console for PAA queries → FAQ additions only when clinically accurate',
    ''
  );
  return lines.join('\n');
}

function main() {
  const audits = CORNERSTONE_ARTICLES.map(auditArticle);
  fs.writeFileSync(path.join(SITE_ROOT, 'KEYWORD-MAP.md'), buildKeywordMap(), 'utf8');
  fs.writeFileSync(path.join(SITE_ROOT, 'CONTENT-GAP-REPORT.md'), buildGapReport(audits), 'utf8');
  fs.writeFileSync(path.join(SITE_ROOT, 'ARTICLE-ENHANCEMENT-REPORT.md'), buildEnhancementReport(audits), 'utf8');
  fs.writeFileSync(path.join(SITE_ROOT, 'SEO-ENGAGEMENT-OPTIMIZATION-REPORT.md'), buildOptimizationReport(audits), 'utf8');
  console.log('Wrote KEYWORD-MAP.md, CONTENT-GAP-REPORT.md, ARTICLE-ENHANCEMENT-REPORT.md, SEO-ENGAGEMENT-OPTIMIZATION-REPORT.md');
  for (const a of audits) {
    console.log(a.slug, 'engage:', a.engageCount, 'links:', a.internalLinks);
  }
}

main();
