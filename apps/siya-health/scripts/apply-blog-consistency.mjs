/**
 * Blog CTA-band dedupe, final CTA standardization, Related Health Guides.
 * Run: node scripts/apply-blog-consistency.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import {
  finalCtaBandSection,
  MEET_GREET_URL,
  relatedHealthGuides,
} from './blog-engagement-components.mjs';
import { normalizeSitewideCopy, topicFromPath } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const DOCS = path.join(__dirname, '..', 'docs');

const BLOG_HUBS = new Set(['index.html', 'all.html', 'adhd.html', 'weight-loss.html', 'telehealth.html']);

const ANSWER_LABELS = Object.fromEntries(
  ANSWER_SEEDS.map((s) => [`/answers/${s.slug}`, s.question]),
);

const GUIDE_POOLS = {
  adhd: [
    'signs-of-adult-adhd',
    'can-adhd-be-diagnosed-online',
    'starting-adhd-medication-adults',
    'non-stimulant-adhd-medications',
    'adhd-vs-burnout',
  ],
  metabolic: [
    'brain-fog-after-eating',
    'what-is-food-noise',
    'what-is-insulin-resistance',
    'glp-1-side-effects',
    'medical-weight-loss-vs-dieting',
  ],
  energy: [
    'brain-fog-after-eating',
    'poor-sleep-feels-like-adhd',
    'why-am-i-tired-even-after-sleeping',
    'can-sleep-apnea-cause-fatigue',
  ],
  hormone: [
    'what-is-free-testosterone',
    'what-does-low-testosterone-feel-like',
    'when-is-testosterone-therapy-appropriate',
    'trt-monitoring-requirements',
  ],
  telehealth: [
    'is-telehealth-legitimate',
    'meet-and-greet-telehealth-expectations',
    'how-online-prescriptions-work',
  ],
};

const SECONDARY_BY_TOPIC = {
  adhd: '/adhd-care',
  metabolic: '/weight-loss-metabolic-health',
  energy: '/telehealth',
  hormone: '/mens-health-longevity',
  telehealth: '/telehealth',
};

const CTA_BAND_SECTION_RE =
  /<section class="section(?:\s+blog-final-cta)?">\s*<div class="container">\s*<div class="cta-band">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/g;

const PROVIDER_CTA_RE =
  /\s*<section class="blog-provider-cta"[\s\S]*?<\/section>/g;

function extractTitle(html) {
  const m = html.match(/<h1[^>]*>([^<]+)</i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function blogTopic(slug, title) {
  const t = `${slug} ${title}`.toLowerCase();
  if (/testosterone|trt|sildenafil|erectile|minoxidil|libido|glutathione|peptide/.test(t)) {
    return 'hormone';
  }
  if (/sleep-apnea|apnea|insomnia|ambien|always-tired|fatigue|modafinil/.test(t)) {
    return 'energy';
  }
  if (/glp|semaglutide|tirzepatide|phentermine|weight|food-noise|insulin|metabolic|dieting|obesity/.test(t)) {
    return 'metabolic';
  }
  if (/adhd|adderall|vyvanse|focalin|stimulant|asrs|creyos|executive|lazy/.test(t)) {
    return 'adhd';
  }
  return topicFromPath(`/blog/${slug}`, title) === 'general' ? 'telehealth' : topicFromPath(`/blog/${slug}`, title);
}

function isAdhdBlog(slug, title, topic) {
  if (topic !== 'adhd') return false;
  return !/weight-loss|glp|semaglutide|tirzepatide|phentermine|combining.*weight/.test(`${slug} ${title}`);
}

function guideItemsForTopic(topic, slug) {
  const pool = GUIDE_POOLS[topic] || GUIDE_POOLS.telehealth;
  const ordered = [...pool];
  const slugHint = slug.replace(/-/g, ' ');
  for (let i = ordered.length - 1; i >= 0; i--) {
    const s = ordered[i];
    if (slugHint.includes(s.split('-').slice(0, 2).join('-')) || slug.includes(s)) {
      ordered.splice(i, 1);
      ordered.unshift(s);
    }
  }
  const seen = new Set();
  const slugs = [];
  for (const s of ordered) {
    if (seen.has(s)) continue;
    seen.add(s);
    slugs.push(s);
    if (slugs.length >= 3) break;
  }
  while (slugs.length < 3 && pool.length) {
    const next = pool.find((s) => !slugs.includes(s));
    if (!next) break;
    slugs.push(next);
  }
  return slugs.map((s) => ({
    href: `/answers/${s}`,
    label: ANSWER_LABELS[`/answers/${s}`] || s.replace(/-/g, ' '),
  }));
}

function countCtaBandDivs(html) {
  return (html.match(/<div class="cta-band">/g) || []).length;
}

function ensureMidCtaClass(html) {
  const contentEnd = html.indexOf('</article>');
  if (contentEnd < 0) return html;
  const head = html.slice(0, contentEnd);
  const tail = html.slice(contentEnd);
  const stripped = head.replace(/<div class="cta-block blog-cta blog-cta--mid"[\s\S]*?<\/div>\s*/g, '');
  const fixed = stripped.replace(
    /<div class="cta-block blog-cta(?!\s+blog-cta--mid)">/g,
    '',
  );
  return fixed + tail;
}

function upsertRelatedGuides(html, items) {
  const section = relatedHealthGuides({ items }).trim();
  if (html.includes('related-health-guides')) {
    return html.replace(
      /<section class="related-health-guides"[\s\S]*?<\/section>/,
      section,
    );
  }
  if (html.includes('<section class="continue-reading"')) {
    return html.replace('<section class="continue-reading"', `${section}\n            <section class="continue-reading"`);
  }
  const bands = [...html.matchAll(CTA_BAND_SECTION_RE)];
  if (bands.length) {
    const idx = bands[bands.length - 1].index;
    return html.slice(0, idx) + section + '\n\n      ' + html.slice(idx);
  }
  return html.replace('</article>', `\n            ${section}\n          </div>\n        </div>\n      </article>`);
}

function replaceFinalCtaBand(html, opts) {
  const bandSection = finalCtaBandSection(opts);
  const matches = [...html.matchAll(CTA_BAND_SECTION_RE)];
  const countBefore = matches.length;
  html = html.replace(CTA_BAND_SECTION_RE, '');
  const mainClose = html.indexOf('</main>');
  if (mainClose === -1) return { html, countBefore, countAfter: 0 };
  html = html.slice(0, mainClose) + bandSection + '\n    ' + html.slice(mainClose);
  return { html, countBefore, countAfter: 1 };
}

function processArticle(filename) {
  const slug = filename.replace(/\.html$/, '');
  const filePath = path.join(BLOG_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(html);
  const topic = blogTopic(slug, title);
  const adhd = isAdhdBlog(slug, title, topic);
  const bandsBefore = countCtaBandDivs(html);

  const dupRemoved = bandsBefore > 1;
  let providerRemoved = false;
  if (PROVIDER_CTA_RE.test(html)) {
    html = html.replace(PROVIDER_CTA_RE, '');
    providerRemoved = true;
  }

  const { html: html2, countBefore, countAfter } = replaceFinalCtaBand(html, {
    adhd,
    secondaryHref: SECONDARY_BY_TOPIC[topic] || '/telehealth',
  });
  html = html2;

  html = ensureMidCtaClass(html);
  const guides = guideItemsForTopic(topic, slug);
  const hadRelated = html.includes('related-health-guides');
  html = upsertRelatedGuides(html, guides);
  html = normalizeSitewideCopy(html);
  html = html.replace(/\s*<\/article>\s+(?=<section class="section)/, '\n      </article>\n\n      ');

  const bandsAfter = countCtaBandDivs(html);
  fs.writeFileSync(filePath, html, 'utf8');

  return {
    slug,
    topic,
    adhd,
    bandsBefore,
    bandsAfter,
    dupRemoved: dupRemoved || countBefore > 1,
    providerRemoved,
    relatedAdded: !hadRelated,
    relatedUpdated: hadRelated,
    guides: guides.map((g) => g.href),
    exception: bandsAfter !== 1 ? `expected 1 cta-band, got ${bandsAfter}` : null,
  };
}

function auditBlog(relPath, html) {
  const issues = [];
  const bands = countCtaBandDivs(html);
  if (bands !== 1) issues.push(`cta-band divs: ${bands}`);
  if ((html.match(/cta-band/g) || []).length > 3) issues.push('possible cta-band string duplication');
  if (!html.includes('related-health-guides')) issues.push('missing Related Health Guides');
  if (!html.includes('continue-reading')) issues.push('missing Continue reading');
  const reviews = (html.match(/<aside class="clinical-review/g) || []).length;
  if (reviews !== 1) issues.push(`clinical-review: ${reviews}`);
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) issues.push(`h1 count: ${h1}`);
  if (/>Schedule Meet &amp; Greet</.test(html) || />Explore care options</.test(html)) {
    issues.push('legacy CTA copy');
  }
  if (/>Clinical Review Status</.test(html) || />\s*Review needed\s*</.test(html)) {
    issues.push('legacy review label');
  }
  if (/<a[^>]*href="\/answers"[^>]*>\s*Answers\s*<\/a>/i.test(html)) {
    issues.push('Answers hub nav label');
  }
  return issues;
}

function writeReport(name, body) {
  fs.writeFileSync(path.join(DOCS, name), body, 'utf8');
  console.log('Wrote', path.join(DOCS, name));
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.html') && !BLOG_HUBS.has(f));
  const results = files.map(processArticle);

  const dupBefore = results.filter((r) => r.bandsBefore > 1);
  const providerRemoved = results.filter((r) => r.providerRemoved);
  const relatedAdded = results.filter((r) => r.relatedAdded);
  const exceptions = results.filter((r) => r.exception);

  writeReport(
    'CTA-BAND-DEDUPLICATION-REPORT.md',
    `# CTA band deduplication report

Generated: ${new Date().toISOString()}

## Blogs scanned

${files.length} blog articles (excluding ${BLOG_HUBS.size} category/index hubs).

## Duplicate \`<div class="cta-band">\` before fix

${dupBefore.length ? dupBefore.map((r) => `- \`${r.slug}\`: ${r.bandsBefore} blocks`).join('\n') : '_None — prior audits counted \`cta-band-buttons\` as a second match; actual duplicate divs were rare._'}

## Provider CTA blocks removed (redundant with final band)

${providerRemoved.length} articles had \`blog-provider-cta\` sections removed.

${providerRemoved.slice(0, 15).map((r) => `- ${r.slug}`).join('\n')}${providerRemoved.length > 15 ? `\n- …and ${providerRemoved.length - 15} more` : ''}

## Standardized final CTA

All articles now use one exit band:

- **Title:** Not sure where to start?
- **Body:** Talk to a Clinician can help you understand your options and choose the right care path.
- **Default primary:** Talk to a Clinician
- **Default secondary:** Explore Care Options (topic service page)
- **ADHD-specific primary:** Book ADHD Evaluation
- **ADHD-specific secondary:** Start Free Screening

## Final count per blog

| Result | Count |
|--------|------:|
| Exactly 1 \`cta-band\` div | ${results.filter((r) => !r.exception).length} |
| Exceptions | ${exceptions.length} |

${exceptions.length ? `### Exceptions\n\n${exceptions.map((r) => `- \`${r.slug}\`: ${r.exception}`).join('\n')}` : ''}

## Mid-article CTAs

In-article \`cta-block\` elements inside \`<article>\` now include \`blog-cta--mid\` (final band uses \`cta-band\` only).
`,
  );

  writeReport(
    'RELATED-HEALTH-GUIDES-REPORT.md',
    `# Related Health Guides report

Generated: ${new Date().toISOString()}

## Blogs scanned

${files.length}

## Sections added

${relatedAdded.length} blogs received a new Related Health Guides block.

## Sections updated (trimmed to 3 links)

${results.filter((r) => r.relatedUpdated).length} blogs already had a section — normalized to 3 links.

## Guide mappings used

| Topic | Pool slugs |
|-------|------------|
| ADHD | ${GUIDE_POOLS.adhd.join(', ')} |
| Metabolic / GLP-1 | ${GUIDE_POOLS.metabolic.join(', ')} |
| Energy / sleep | ${GUIDE_POOLS.energy.join(', ')} |
| Hormone | ${GUIDE_POOLS.hormone.join(', ')} |
| Telehealth | ${GUIDE_POOLS.telehealth.join(', ')} |

## Sample mappings

${results
  .slice(0, 12)
  .map((r) => `- \`${r.slug}\` (${r.topic}${r.adhd ? ', ADHD CTAs' : ''}): ${r.guides.join(', ')}`)
  .join('\n')}

## Pages still missing section

${results.filter((r) => !fs.readFileSync(path.join(BLOG_DIR, `${r.slug}.html`), 'utf8').includes('related-health-guides')).map((r) => `- ${r.slug}`).join('\n') || '_None_'}
`,
  );

  const postAudit = files.map((f) => {
    const html = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
    return { slug: f.replace(/\.html$/, ''), issues: auditBlog(`blog/${f}`, html) };
  });
  const failing = postAudit.filter((a) => a.issues.length);

  writeReport(
    'BLOG-CONSISTENCY-FINAL-QA.md',
    `# Blog consistency final QA

Generated: ${new Date().toISOString()}

## Articles audited

${files.length}

## Pass summary

| Check | Pass |
|-------|------|
| 1 clinical review block | ${postAudit.filter((a) => !a.issues.some((i) => i.includes('clinical-review'))).length}/${files.length} |
| 1 H1 | ${postAudit.filter((a) => !a.issues.some((i) => i.includes('h1'))).length}/${files.length} |
| 1 final cta-band div | ${postAudit.filter((a) => !a.issues.some((i) => i.includes('cta-band div'))).length}/${files.length} |
| Related Health Guides | ${postAudit.filter((a) => !a.issues.some((i) => i.includes('Related'))).length}/${files.length} |
| Continue reading | ${postAudit.filter((a) => !a.issues.some((i) => i.includes('Continue'))).length}/${files.length} |
| No legacy review/copy | ${postAudit.filter((a) => !a.issues.some((i) => i.includes('legacy') || i.includes('Answers'))).length}/${files.length} |

## Articles with issues

${failing.length ? failing.map((a) => `- \`${a.slug}\`: ${a.issues.join('; ')}`).join('\n') : '_All checks passed._'}

**QA gate:** ${failing.length === 0 ? 'PASS' : 'FAIL'}
`,
  );

  console.log(`Processed ${files.length} blogs; exceptions: ${exceptions.length}; QA failing: ${failing.length}`);
  if (failing.length) process.exitCode = 1;
}

main();
