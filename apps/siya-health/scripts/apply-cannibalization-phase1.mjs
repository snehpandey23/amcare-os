/**
 * Cannibalization Phase 1 — blog reciprocal links, audits, reports.
 * Run after generate-answer-pages: node scripts/apply-cannibalization-phase1.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import {
  BLOG_RECIPROCAL_GUIDE_LINKS,
  CANONICAL_WINNING_BLOGS,
  CORNERSTONE_SYSTEMS,
  GUIDE_CANNIBALIZATION_OVERRIDES,
  HIGH_OVERLAP_PAIRS,
} from '../data/cannibalization-phase1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(SITE_ROOT, 'blog');
const ANSWERS_DIR = path.join(SITE_ROOT, 'answers');
const DOCS = path.join(SITE_ROOT, 'docs');

const BLOG_HUBS = new Set(['index.html', 'all.html', 'adhd.html', 'weight-loss.html', 'telehealth.html']);

function applyGuideOverrides(slug) {
  const base = ANSWER_SEEDS.find((s) => s.slug === slug);
  const patch = GUIDE_CANNIBALIZATION_OVERRIDES[slug];
  return patch ? { ...base, ...patch } : base;
}

const GUIDE_QUESTIONS = Object.fromEntries(
  ANSWER_SEEDS.map((s) => {
    const merged = applyGuideOverrides(s.slug);
    return [s.slug, merged?.question || s.question];
  }),
);

/** Extra supporting guides per cornerstone blog */
const BLOG_EXTRA_GUIDES = {
  'food-noise-and-glp-1-what-it-means-and-what-helps': [
    'food-noise-returned-on-glp-1',
    'what-is-food-noise',
  ],
  'insulin-resistance-and-weight-loss-clinician-overview': [
    'what-is-insulin-resistance',
    'insulin-resistance-without-diabetes',
    'normal-a1c-insulin-resistance',
  ],
  'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': [
    'can-sleep-apnea-cause-fatigue',
    'signs-of-sleep-apnea-in-adults',
  ],
  'free-testosterone-vs-total-testosterone-what-patients-should-know': [
    'what-is-free-testosterone',
    'what-does-low-testosterone-feel-like',
    'high-shbg-low-free-testosterone',
  ],
  'glp1-side-effects-and-how-to-manage-them': ['glp-1-side-effects', 'glp-1-nausea-management'],
  'why-am-i-always-tired-causes-when-to-see-doctor': ['why-am-i-tired-even-after-sleeping', 'why-normal-labs-dont-mean-healthy'],
  'when-is-testosterone-therapy-appropriate': ['when-is-testosterone-therapy-appropriate', 'trt-monitoring-requirements'],
  'medical-weight-loss-glp1-semaglutide-texas': ['who-qualifies-glp-1-weight-loss'],
  'adhd-telehealth-california': ['telehealth-adhd-california'],
};

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['public', 'node_modules', 'scripts', 'data', 'docs'].includes(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i');
  const m = html.match(re);
  return m ? m[1].replace(/&amp;/g, '&').trim() : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)/i);
  return m ? m[1].replace(/&amp;/g, '&').replace(/\s*\|\s*Siya Health\s*$/i, '').trim() : '';
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([^<]+)/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : '';
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function upsertBlogInternalLink(html, guidePath, anchor) {
  if (html.includes(`href="${guidePath}"`)) return { html, added: false };
  const snippet = `<a href="${guidePath}">${anchor}</a>`;
  if (html.includes('class="blog-internal-links"')) {
    return {
      html: html.replace(
        /(<div class="blog-internal-links"><p>)([\s\S]*?)(<\/p><\/div>)/,
        (_, open, inner, close) => {
          const trimmed = inner.trim().replace(/\.\s*$/, '');
          const sep = trimmed.endsWith('.') || !trimmed ? ' ' : ', ';
          return `${open}${trimmed}${sep}${snippet}.${close}`;
        },
      ),
      added: true,
    };
  }
  const insert = `            <div class="blog-internal-links"><p>Related: ${snippet}.</p></div>\n`;
  const idx = html.indexOf('<aside class="blog-engage');
  if (idx > 0) return { html: html.slice(0, idx) + insert + html.slice(idx), added: true };
  const idx2 = html.indexOf('<aside class="clinical-review');
  if (idx2 > 0) return { html: html.slice(0, idx2) + insert + html.slice(idx2), added: true };
  return { html, added: false };
}

function upsertRelatedGuides(html, guideSlugs) {
  const items = guideSlugs
    .map((slug) => ({
      href: `/answers/${slug}`,
      label: GUIDE_QUESTIONS[slug] || slug.replace(/-/g, ' '),
    }))
    .filter((item, i, arr) => arr.findIndex((x) => x.href === item.href) === i);

  const lis = items.map((g) => `                <li><a href="${g.href}">${g.label}</a></li>`).join('\n');
  const section = `            <section class="related-health-guides" aria-labelledby="related-health-guides-heading">
              <h2 id="related-health-guides-heading">Related Health Guides</h2>
              <ul>
${lis}
              </ul>
            </section>`;

  if (html.includes('related-health-guides')) {
    return {
      html: html.replace(/<section class="related-health-guides"[\s\S]*?<\/section>/, section),
      updated: true,
    };
  }
  if (html.includes('<section class="continue-reading"')) {
    return {
      html: html.replace('<section class="continue-reading"', `${section}\n            <section class="continue-reading"`),
      updated: true,
    };
  }
  return { html, updated: false };
}

function upsertContinueReadingGuide(html, guidePath, anchor) {
  if (!html.includes('continue-reading')) return { html, added: false };
  if (html.includes(`href="${guidePath}"`)) return { html, added: false };
  const li = `                <li class="continue-reading-answer"><a href="${guidePath}">${anchor}</a></li>`;
  return {
    html: html.replace(
      /(<section class="continue-reading"[\s\S]*?<ul>)/,
      `$1\n${li}`,
    ),
    added: true,
  };
}

function processBlog(filename) {
  const slug = filename.replace(/\.html$/, '');
  const filePath = path.join(BLOG_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf8');
  const changes = [];

  const reciprocal = BLOG_RECIPROCAL_GUIDE_LINKS[slug];
  if (reciprocal) {
    const anchorRe = new RegExp(
      `<a href="${reciprocal.guide.replace(/\//g, '\\/')}">[^<]*</a>`,
      'g',
    );
    const freshAnchor = `<a href="${reciprocal.guide}">${reciprocal.anchor}</a>`;
    if (html.includes(reciprocal.guide) && !html.includes(reciprocal.anchor)) {
      html = html.replace(anchorRe, freshAnchor);
      changes.push(`anchor-refresh:${reciprocal.guide}`);
    }

    const r1 = upsertBlogInternalLink(html, reciprocal.guide, reciprocal.anchor);
    html = r1.html;
    if (r1.added) changes.push(`internal-link:${reciprocal.guide}`);

    const r2 = upsertContinueReadingGuide(html, reciprocal.guide, reciprocal.anchor);
    html = r2.html;
    if (r2.added) changes.push(`continue-reading:${reciprocal.guide}`);
  }

  const extraGuides = BLOG_EXTRA_GUIDES[slug];
  if (extraGuides?.length) {
    const r3 = upsertRelatedGuides(html, extraGuides);
    html = r3.html;
    if (r3.updated) changes.push(`related-guides:${extraGuides.join(',')}`);
  }

  if (changes.length) fs.writeFileSync(filePath, html, 'utf8');
  return { slug, changes };
}

function scanDuplicates(files) {
  const titles = new Map();
  const h1s = new Map();
  const metas = new Map();
  const nearTitles = [];

  for (const rel of files) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    const title = extractTitle(html);
    const h1 = extractH1(html);
    const meta = extractMeta(html, 'description');
    const url = `/${rel.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '')}`.replace(/\/+/g, '/') || '/';

    for (const [map, val, kind] of [
      [titles, title, 'title'],
      [h1s, h1, 'h1'],
      [metas, meta, 'meta'],
    ]) {
      if (!val) continue;
      const key = normalizeTitle(val);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ url, raw: val, kind });
    }
  }

  const dupTitles = [...titles.entries()].filter(([, v]) => v.length > 1);
  const dupH1s = [...h1s.entries()].filter(([, v]) => v.length > 1);
  const dupMetas = [...metas.entries()].filter(([, v]) => v.length > 1);

  const titleKeys = [...titles.keys()];
  for (let i = 0; i < titleKeys.length; i++) {
    for (let j = i + 1; j < titleKeys.length; j++) {
      const a = titleKeys[i];
      const b = titleKeys[j];
      if (a === b) continue;
      const wordsA = new Set(a.split(' '));
      const wordsB = new Set(b.split(' '));
      const inter = [...wordsA].filter((w) => wordsB.has(w)).length;
      const union = new Set([...wordsA, ...wordsB]).size;
      if (union > 4 && inter / union >= 0.75) {
        nearTitles.push({ a: titles.get(a)[0], b: titles.get(b)[0], similarity: (inter / union).toFixed(2) });
      }
    }
  }

  return { dupTitles, dupH1s, dupMetas, nearTitles };
}

function linkEquityReport() {
  const audit = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'data/internal-link-audit.json'), 'utf8'));
  const inbound = audit.inboundCounts || {};

  const rows = CANONICAL_WINNING_BLOGS.map((blogPath) => {
    const slug = blogPath.replace('/blog/', '');
    const guideLink = Object.entries(BLOG_RECIPROCAL_GUIDE_LINKS).find(([, v]) => v.guide)?.[1];
    const reciprocal = BLOG_RECIPROCAL_GUIDE_LINKS[slug];
    const html = fs.existsSync(path.join(BLOG_DIR, `${slug}.html`))
      ? fs.readFileSync(path.join(BLOG_DIR, `${slug}.html`), 'utf8')
      : '';

    return {
      blog: blogPath,
      inbound: inbound[blogPath] || 0,
      fromGuide: reciprocal ? fs.readFileSync(path.join(ANSWERS_DIR, `${reciprocal.guide.replace('/answers/', '')}.html`), 'utf8').includes(blogPath) : false,
      guideReciprocal: reciprocal ? html.includes(reciprocal.guide) : false,
      categoryHub: ['weight-loss.html', 'adhd.html', 'telehealth.html'].some((h) => {
        const hub = fs.readFileSync(path.join(BLOG_DIR, h), 'utf8');
        return hub.includes(blogPath);
      }),
      relatedBlock: html.includes('continue-reading') || html.includes('related-health-guides'),
      servicePage: ['/weight-loss-metabolic-health.html', '/mens-health-longevity.html', '/adhd-care.html', '/telehealth.html'].some((p) => {
        const fp = path.join(SITE_ROOT, p);
        return fs.existsSync(fp) && fs.readFileSync(fp, 'utf8').includes(blogPath);
      }),
    };
  });

  const needsLinks = rows
    .map((r) => ({
      ...r,
      score: [r.fromGuide, r.guideReciprocal, r.categoryHub, r.relatedBlock, r.servicePage].filter(Boolean).length,
    }))
    .sort((a, b) => a.score - b.score || a.inbound - b.inbound);

  return { rows, needsLinks: needsLinks.slice(0, 20) };
}

function cornerstoneReport() {
  const lines = [];
  for (const sys of CORNERSTONE_SYSTEMS) {
    const blogHtml = fs.readFileSync(path.join(SITE_ROOT, sys.blog.replace(/^\//, '') + '.html'), 'utf8');
    const blogTitle = extractTitle(blogHtml);
    const blogH1 = extractH1(blogHtml);
    const blogMeta = extractMeta(blogHtml, 'description');

    lines.push(`### ${sys.name}`);
    lines.push(`- **Cornerstone blog:** ${sys.blog}`);
    lines.push(`- **Blog title:** ${blogTitle}`);
    lines.push(`- **Blog H1:** ${blogH1}`);
    lines.push('');

    for (const guidePath of sys.guides) {
      const slug = guidePath.replace('/answers/', '');
      const merged = applyGuideOverrides(slug);
      const gHtml = fs.readFileSync(path.join(ANSWERS_DIR, `${slug}.html`), 'utf8');
      const gTitle = extractTitle(gHtml);
      const gH1 = extractH1(gHtml);
      const gMeta = extractMeta(gHtml, 'description');
      const identicalTitle = normalizeTitle(gTitle) === normalizeTitle(blogTitle);
      const identicalH1 = normalizeTitle(gH1) === normalizeTitle(blogH1);
      const identicalMeta = gMeta && blogMeta && normalizeTitle(gMeta) === normalizeTitle(blogMeta);
      const hasCanonical = gHtml.includes('answer-canonical-pointer') && gHtml.includes(sys.blog);

      lines.push(`| Guide | ${guidePath} |`);
      lines.push(`| Guide H1 | ${merged?.question || gH1} |`);
      lines.push(`| Identical title? | ${identicalTitle ? '⚠️ YES' : '✓ No'} |`);
      lines.push(`| Identical H1? | ${identicalH1 ? '⚠️ YES' : '✓ No'} |`);
      lines.push(`| Identical meta? | ${identicalMeta ? '⚠️ YES' : '✓ No'} |`);
      lines.push(`| Canonical pointer to blog? | ${hasCanonical ? '✓ Yes' : '✗ No'} |`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

function writeDoc(name, body) {
  fs.writeFileSync(path.join(DOCS, name), body, 'utf8');
  console.log('Wrote docs/' + name);
}

function main() {
  const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.html') && !BLOG_HUBS.has(f));
  const blogResults = blogFiles.map(processBlog);
  const modifiedBlogs = blogResults.filter((r) => r.changes.length);

  const duplicateChanges = Object.entries(GUIDE_CANNIBALIZATION_OVERRIDES)
    .filter(([slug]) => HIGH_OVERLAP_PAIRS.find((p) => p.guide === `/answers/${slug}` && p.classification === 'Duplicate'))
    .map(([slug, patch]) => {
      const before = ANSWER_SEEDS.find((s) => s.slug === slug);
      return {
        slug,
        beforeQuestion: before?.question,
        afterQuestion: patch.question || before?.question,
        beforeMeta: (before?.metaDescription || before?.shortAnswer || '').slice(0, 80),
        afterMeta: (patch.metaDescription || '').slice(0, 80),
        blog: HIGH_OVERLAP_PAIRS.find((p) => p.guide === `/answers/${slug}`)?.blog,
      };
    });

  const supportingPairs = HIGH_OVERLAP_PAIRS.filter((p) => p.classification === 'Supporting');

  const htmlFiles = walkHtml(SITE_ROOT);
  const dupScan = scanDuplicates(htmlFiles);
  const equity = linkEquityReport();

  writeDoc(
    'CANNIBALIZATION-PHASE1-AUDIT.md',
    `# Cannibalization Phase 1 Audit

Generated: ${new Date().toISOString()}

## HIGH overlap pairs (${HIGH_OVERLAP_PAIRS.length})

| Guide URL | Blog URL | Classification | Recommended owner | Action |
|-----------|----------|----------------|-------------------|--------|
${HIGH_OVERLAP_PAIRS.map((p) => `| ${p.guide} | ${p.blog} | ${p.classification} | ${p.owner} | ${p.action} |`).join('\n')}

## Summary

| Classification | Count |
|----------------|------:|
| Duplicate | ${HIGH_OVERLAP_PAIRS.filter((p) => p.classification === 'Duplicate').length} |
| Supporting | ${HIGH_OVERLAP_PAIRS.filter((p) => p.classification === 'Supporting').length} |
`,
  );

  writeDoc(
    'DUPLICATE-PAIR-CHANGES.md',
    `# Duplicate Pair Changes

Generated: ${new Date().toISOString()}

Blog wins for ${duplicateChanges.length} duplicate pairs. Guides retained as narrowed FAQ/PAA pages with canonical blog pointers.

| Guide | Before H1/Title | After H1/Title | Canonical blog |
|-------|-----------------|----------------|----------------|
${duplicateChanges.map((r) => `| \`/answers/${r.slug}\` | ${r.beforeQuestion} | ${r.afterQuestion} | ${r.blog} |`).join('\n')}

## On-page changes (all duplicate guides)

1. Narrowed \`<title>\` and \`<h1>\` (via \`question\` override)
2. Narrowed meta description (FAQ-scoped)
3. Top contextual pointer (\`.answer-canonical-pointer\`)
4. Bottom "Read the full guide" CTA (\`.answer-full-guide-cta\`)
5. Reciprocal blog → guide links added where missing
`,
  );

  writeDoc(
    'SUPPORTING-PAIR-LINKING.md',
    `# Supporting Pair Linking

Generated: ${new Date().toISOString()}

| Guide | Blog | Guide → Blog | Blog → Guide |
|-------|------|--------------|--------------|
${supportingPairs.map((p) => {
  const slug = p.guide.replace('/answers/', '');
  const blogSlug = p.blog.replace('/blog/', '');
  const gHtml = fs.readFileSync(path.join(ANSWERS_DIR, `${slug}.html`), 'utf8');
  const bHtml = fs.readFileSync(path.join(BLOG_DIR, `${blogSlug}.html`), 'utf8');
  return `| ${p.guide} | ${p.blog} | ${gHtml.includes(p.blog) ? '✓' : '✗'} | ${bHtml.includes(p.guide) ? '✓' : '✗'} |`;
}).join('\n')}

## Intent split

- **Guide:** definition, FAQ, PAA, snippet intent
- **Blog:** long-form evidence, treatment discussion, conversion path
`,
  );

  writeDoc(
    'CORNERSTONE-PROTECTION-REPORT.md',
    `# Cornerstone Protection Report

Generated: ${new Date().toISOString()}

${cornerstoneReport()}
`,
  );

  writeDoc(
    'TITLE-META-DUPLICATE-AUDIT.md',
    `# Title & Meta Duplicate Audit

Generated: ${new Date().toISOString()}

## Duplicate title tags (${dupScan.dupTitles.length})

${dupScan.dupTitles.length ? dupScan.dupTitles.map(([k, v]) => `- **"${v[0].raw}"** — ${v.map((x) => x.url).join(', ')}`).join('\n') : '_None after Phase 1 differentiation._'}

## Duplicate H1s (${dupScan.dupH1s.length})

${dupScan.dupH1s.length ? dupScan.dupH1s.map(([k, v]) => `- **"${v[0].raw}"** — ${v.map((x) => x.url).join(', ')}`).join('\n') : '_None after Phase 1 differentiation._'}

## Duplicate meta descriptions (${dupScan.dupMetas.length})

${dupScan.dupMetas.length ? dupScan.dupMetas.map(([k, v]) => `- ${v.map((x) => x.url).join(', ')}`).join('\n') : '_None detected._'}

## Near-duplicate titles (≥75% token overlap)

${dupScan.nearTitles.length ? dupScan.nearTitles.slice(0, 25).map((p) => `- ${p.similarity}: ${p.a.url} ↔ ${p.b.url}`).join('\n') : '_None flagged._'}

## Fixes applied

- ${duplicateChanges.length} guide title/H1/meta narrowed for duplicate pairs
- Canonical blog pointer blocks added to ${Object.keys(GUIDE_CANNIBALIZATION_OVERRIDES).length} guides
`,
  );

  writeDoc(
    'LINK-EQUITY-REPORT.md',
    `# Link Equity Report — Canonical Winning Blogs

Generated: ${new Date().toISOString()}

## Top 20 blogs needing more internal links

| Rank | Blog | Inbound | Guide link | Reciprocal | Category hub | Related block | Service page | Score |
|------|------|--------:|------------|------------|--------------|---------------|--------------|------:|
${equity.needsLinks.map((r, i) => `| ${i + 1} | ${r.blog} | ${r.inbound} | ${r.fromGuide ? '✓' : '✗'} | ${r.guideReciprocal ? '✓' : '✗'} | ${r.categoryHub ? '✓' : '✗'} | ${r.relatedBlock ? '✓' : '✗'} | ${r.servicePage ? '✓' : '✗'} | ${r.score}/5 |`).join('\n')}

## All canonical blogs

| Blog | Inbound |
|------|--------:|
${equity.rows.sort((a, b) => b.inbound - a.inbound).map((r) => `| ${r.blog} | ${r.inbound} |`).join('\n')}
`,
  );

  return {
    modifiedBlogs,
    duplicateChanges,
    supportingPairs,
    dupScan,
    equity,
  };
}

const result = main();

export { result };
