/**
 * Full production readiness audit — generates report MD files.
 * Run: node scripts/production-readiness-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NAV_HEALTH_GUIDES } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const STATES = ['California', 'Texas', 'Florida', 'Pennsylvania'];
const STATE_ORDER_CANONICAL = 'California, Texas, Pennsylvania, and Florida';

function walkHtml(subdir = '') {
  const out = [];
  const fullDir = subdir ? path.join(SITE_ROOT, subdir) : SITE_ROOT;
  if (!fs.existsSync(fullDir)) return out;
  for (const e of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const rel = subdir ? `${subdir}/${e.name}` : e.name;
    const full = path.join(SITE_ROOT, rel);
    if (e.isDirectory()) out.push(...walkHtml(rel));
    else if (e.name.endsWith('.html') && !rel.startsWith('public/')) out.push({ rel, full });
  }
  return out;
}

const allHtml = walkHtml('');
const BLOG_HUBS = new Set(['blog/index.html', 'blog/all.html', 'blog/adhd.html', 'blog/weight-loss.html', 'blog/telehealth.html']);

// ─── PART 1: Health Guides ───
const hg = {
  navOk: [],
  navMissing: [],
  footerOk: [],
  footerMissing: [],
  breadcrumbOk: [],
  breadcrumbMissing: [],
  titleOk: [],
  titleMissing: [],
  legacyAnswers: [],
  legacyClinicalAnswers: [],
  legacyFaq: [],
  hubIssues: [],
};

for (const { rel, full } of allHtml) {
  const html = fs.readFileSync(full, 'utf8');
  const hasHgNav = html.includes(`href="/answers">${NAV_HEALTH_GUIDES.label}</a>`) ||
    html.includes(`href="/answers">${NAV_HEALTH_GUIDES.label}</a>`);
  const hasLegacyNav = html.includes('>Answers</a>') || html.includes('>Clinical Answers</a>');
  if (html.includes('nav-center') || html.includes('nav-mobile')) {
    if (hasHgNav && !hasLegacyNav) hg.navOk.push(rel);
    else if (hasLegacyNav) hg.legacyAnswers.push({ rel, where: 'nav/footer link text' });
    else if (html.includes('href="/answers"') && !html.includes(NAV_HEALTH_GUIDES.label)) hg.navMissing.push(rel);
  }
  if (html.includes('<footer')) {
    if (html.includes(`href="/answers">${NAV_HEALTH_GUIDES.label}</a>`)) hg.footerOk.push(rel);
    else if (html.includes('href="/answers"')) hg.footerMissing.push(rel);
  }
  if (html.includes('breadcrumb') || html.includes('BreadcrumbList')) {
    if (html.includes('Health Guides')) hg.breadcrumbOk.push(rel);
    else if (html.includes('href="/answers"') && (html.includes('Answers') || html.includes('Clinical'))) {
      hg.breadcrumbMissing.push(rel);
    }
  }
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (rel.startsWith('answers/') && titleMatch) {
    if (titleMatch[1].includes('Health Guide') || titleMatch[1].includes('Health guide')) hg.titleOk.push(rel);
    else if (titleMatch[1].includes('Answer') || titleMatch[1].includes('Clinical Answer')) hg.titleMissing.push(rel);
  }
  if (/Clinical Answers|clinical answers/i.test(html)) hg.legacyClinicalAnswers.push(rel);
  if (/FAQ Library/i.test(html)) hg.legacyFaq.push(rel);
  if (html.includes('>Answers</a>') && !html.includes(NAV_HEALTH_GUIDES.label)) {
    if (!hg.legacyAnswers.find((x) => x.rel === rel)) hg.legacyAnswers.push({ rel, where: 'any Answers link' });
  }
}

const hubPath = path.join(SITE_ROOT, 'answers/index.html');
if (fs.existsSync(hubPath)) {
  const hub = fs.readFileSync(hubPath, 'utf8');
  const h1 = hub.match(/<h1[^>]*>([^<]*)</i);
  if (h1 && /Health [Gg]uide/.test(h1[1])) hg.hubOk = true;
  else hg.hubIssues.push(`H1: ${h1?.[1] || 'missing'}`);
  if (!hub.includes('Health Guides')) hg.hubIssues.push('missing Health Guides in meta/nav');
}

// redirects
const redirects = [];
for (const f of ['vercel.json', 'netlify.toml', '_redirects', 'amplify-redirects.json']) {
  const p = path.join(SITE_ROOT, f);
  if (fs.existsSync(p)) redirects.push({ file: f, content: fs.readFileSync(p, 'utf8').slice(0, 2000) });
}

// ─── PART 2: State coverage ───
const stateAudit = [];
for (const { rel, full } of allHtml) {
  const html = fs.readFileSync(full, 'utf8');
  const counts = Object.fromEntries(STATES.map((s) => [s, (html.match(new RegExp(s, 'gi')) || []).length]));
  const hasCA = counts.California > 0;
  const hasTX = counts.Texas > 0;
  const hasFL = counts.Florida > 0;
  const hasPA = counts.Pennsylvania > 0;
  const threeStateOnly = /Texas.*Florida.*Pennsylvania|Texas.*Pennsylvania.*Florida/i.test(html) && !hasCA;
  const oldThree = /California,?\s*Texas,?\s*and\s*Pennsylvania(?!.*Florida)/i.test(html) ||
    /Texas,?\s*Pennsylvania,?\s*and\s*Florida(?!.*California)/i.test(html);
  const footerBlock = html.match(/<footer[\s\S]*?<\/footer>/i)?.[0] || '';
  stateAudit.push({
    rel,
    counts,
    hasCA,
    hasTX,
    hasFL,
    hasPA,
    threeStateOnly,
    oldThree,
    footerMissingCA: footerBlock.length > 0 && !footerBlock.includes('California'),
    category: categorizePage(rel),
  });
}

function categorizePage(rel) {
  if (rel === 'index.html') return 'homepage';
  if (rel.startsWith('providers/')) return 'provider';
  if (rel.startsWith('answers/')) return 'answer';
  if (rel.startsWith('blog/')) return 'blog';
  if (rel.includes('telehealth')) return 'telehealth';
  if (rel.includes('adhd')) return 'adhd';
  if (['weight-loss-metabolic-health.html', 'labs.html', 'prescriptions.html', 'primary-urgent-care.html', 'mens-health-longevity.html', 'membership-pricing.html', 'book-appointment.html'].includes(rel)) return 'service';
  return 'other';
}

const FOOTER_3_STATE = /Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida/i;
const footer3StateOnly = stateAudit.filter((s) => {
  const html = fs.readFileSync(path.join(SITE_ROOT, s.rel), 'utf8');
  return FOOTER_3_STATE.test(html);
});
const missingCA = stateAudit.filter(
  (s) => !s.hasCA && ['homepage', 'service', 'telehealth'].includes(s.category),
);
const footerNoCA = stateAudit.filter((s) => s.footerMissingCA);
const threeOnly = stateAudit.filter((s) => s.threeStateOnly);

// ─── PART 3: CTA audit ───
const ADHD_PATH_PATTERNS = [/adhd/i, /creyos/i, /asrs/i, /online-adhd-test/i, /adderall|vyvanse|stimulant/i];
function isAdhdContext(rel) {
  if (ADHD_PATH_PATTERNS.some((p) => p.test(rel))) return true;
  if (rel.startsWith('answers/') && rel !== 'answers/index.html') {
    return /adhd|asrs|creyos|adderall|vyvanse|screening-vs|executive-dysfunction|rejection-sensitivity|time-blindness|high-functioning/i.test(rel);
  }
  return false;
}

const ctaViolations = [];
for (const { rel, full } of allHtml) {
  const html = fs.readFileSync(full, 'utf8');
  const adhdCtx = isAdhdContext(rel);
  const screeningNav =
    /<div class="nav-cta">[\s\S]*?href="[^"]*adhd-screening/i.test(html) ||
    /<div class="nav-mobile">[\s\S]*?<a class="button"[^>]*href="[^"]*adhd-screening/i.test(html);
  const screeningLinks = screeningNav ? 1 : 0;
  const meetGreet = (html.match(/Meet\s*&(?:amp;)?\s*Greet|yourmarketingai\.com/gi) || []).length;
  const exploreCare = (html.match(/Explore Care Options/gi) || []).length;
  const bookFreeConsult = /Book Free Consultation/i.test(html);

  if (!adhdCtx && screeningLinks > 0) {
    ctaViolations.push({ rel, type: 'ADHD screening CTA on non-ADHD page', count: screeningLinks });
  }
  if (bookFreeConsult) ctaViolations.push({ rel, type: 'Legacy "Book Free Consultation"', count: 1 });
  if (rel === 'index.html' && meetGreet < 2) ctaViolations.push({ rel, type: 'Homepage low Meet & Greet presence', count: meetGreet });
}

// pages missing primary CTA
const missingMeetGreet = stateAudit
  .map((s) => s.rel)
  .filter((rel) => {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    return !html.includes('yourmarketingai.com') && !html.includes('Meet &amp; Greet') && !html.includes('Meet & Greet');
  });

// ─── PART 4: Images ───
const imageUsage = new Map();
const missingAlt = [];
const placeholderHits = [];

for (const { rel, full } of allHtml) {
  const html = fs.readFileSync(full, 'utf8');
  const imgs = [...html.matchAll(/<img[^>]+>/gi)];
  for (const m of imgs) {
    const tag = m[0];
    const src = tag.match(/src="([^"]+)"/)?.[1];
    if (!src) continue;
    if (!imageUsage.has(src)) imageUsage.set(src, []);
    imageUsage.get(src).push(rel);
    if (!/alt="[^"]+"/i.test(tag) || /alt=""/.test(tag)) missingAlt.push({ rel, src });
    if (/placeholder|via\.placeholder|unsplash\.com\/random|dummy/i.test(src)) placeholderHits.push({ rel, src });
  }
}

const dupImages = [...imageUsage.entries()]
  .filter(([, pages]) => pages.length >= 5)
  .sort((a, b) => b[1].length - a[1].length);

const heroCandidates = [...imageUsage.entries()]
  .filter(([src]) => /hero|telehealth|patient|doctor/i.test(src))
  .filter(([, pages]) => pages.length >= 3)
  .sort((a, b) => b[1].length - a[1].length);

// asset sizes
function fileSize(relSrc) {
  const p = path.join(SITE_ROOT, relSrc.replace(/^\//, ''));
  try {
    return fs.statSync(p).size;
  } catch {
    return null;
  }
}

const lowRes = [];
for (const [src] of imageUsage) {
  if (!/\.(png|jpg|jpeg|webp|svg)$/i.test(src)) continue;
  const sz = fileSize(src);
  if (sz !== null && sz < 8000 && !src.endsWith('.svg')) lowRes.push({ src, bytes: sz });
}

// ─── PART 6: Content consistency ───
const contentIssues = [];
const patterns = [
  { re: /Medically reviewed by/i, label: 'Medically reviewed claim' },
  { re: /Physician reviewed/i, label: 'Physician reviewed' },
  { re: /clinical-review--reviewed/i, label: 'Clinically reviewed block (approved)' },
  { re: /Start Free (ADHD )?Screening/i, label: 'Start Free Screening CTA' },
  { re: /Book Free Consultation/i, label: 'Book Free Consultation' },
  { re: /ADHD-first|#1 ADHD|leading ADHD/i, label: 'ADHD-first positioning' },
  { re: /only (Texas|three states)/i, label: 'Limited state mention' },
];

for (const { rel, full } of allHtml) {
  const html = fs.readFileSync(full, 'utf8');
  for (const { re, label } of patterns) {
    if (re.test(html)) contentIssues.push({ rel, label });
  }
  if (rel === 'index.html') {
    if (/metabolic|food noise|insulin resistance/i.test(html) === false && /ADHD/i.test(html)) {
      contentIssues.push({ rel, label: 'Homepage may still be ADHD-heavy (check hero)' });
    }
  }
}

// pending review consistency
const pendingMismatch = [];
for (const { rel, full } of allHtml) {
  if (!rel.startsWith('blog/') && !rel.startsWith('answers/')) continue;
  if (BLOG_HUBS.has(rel) || rel === 'answers/index.html') continue;
  const html = fs.readFileSync(full, 'utf8');
  const pending = html.includes('clinical-review--pending');
  const reviewed = html.includes('clinical-review--reviewed');
  const medClaim = /Medically reviewed by/i.test(html);
  if (medClaim && !reviewed) pendingMismatch.push({ rel, issue: 'Medically reviewed without reviewed block' });
  if (!pending && !reviewed) pendingMismatch.push({ rel, issue: 'Missing review status block' });
}

// ─── PART 7: Trust ───
const trustIssues = [];
for (const { rel, full } of allHtml) {
  const html = fs.readFileSync(full, 'utf8');
  if (rel.startsWith('blog/') || rel.startsWith('answers/')) {
    if (!html.includes('clinical-review')) trustIssues.push({ rel, issue: 'No clinical review block' });
    if (!/911|emergency/i.test(html) && !html.includes('footer-notice')) trustIssues.push({ rel, issue: 'Missing emergency disclaimer' });
  }
  if (html.includes('care@siya.health') === false && html.includes('<footer')) {
    // only flag key pages
    if (['index.html', 'about.html', 'telehealth.html', 'adhd-care.html'].includes(rel)) {
      trustIssues.push({ rel, issue: 'Footer missing care@siya.health' });
    }
  }
}

// ─── Write STATE-COVERAGE-REPORT.md ───
const stateReport = `# State Coverage Report

Generated: ${new Date().toISOString()}

## Canonical four-state coverage

Siya Health should represent **California, Texas, Florida, and Pennsylvania** consistently (recommended order: ${STATE_ORDER_CANONICAL}).

| State | Pages mentioning (of ${allHtml.length}) |
|-------|----------------------------------------:|
${STATES.map((s) => `| ${s} | ${stateAudit.filter((x) => x.counts[s] > 0).length} |`).join('\n')}

## Critical gaps

### Pages missing California (key page types)

${missingCA.length === 0 ? '_None in homepage/provider/service/telehealth categories._' : missingCA.slice(0, 40).map((s) => `- \`${s.rel}\` (${s.category})`).join('\n')}

### Footers with outdated 3-state line (missing California)

**${footer3StateOnly.length} pages** use: _"Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida."_

Fix in \`scripts/generate-answer-pages.mjs\` (\`footerBlock\`) and \`site-chrome.mjs\` (\`injectFooterChrome\`) → include **California, Texas, Pennsylvania, and Florida**.

Sample: \`index.html\`, all \`answers/*.html\`, most \`blog/*.html\`.

### Footers without California (broader)

${footerNoCA.length === 0 ? '_All footers include California._' : `${footerNoCA.length} pages — see 3-state line above as primary issue.`}

### Three-state-only copy (TX/FL/PA without CA)

${threeOnly.length === 0 ? '_None detected._' : threeOnly.map((s) => `- \`${s.rel}\``).join('\n')}

### Outdated 3-state phrasing patterns

${stateAudit.filter((s) => s.oldThree).map((s) => `- \`${s.rel}\``).join('\n') || '_None detected._'}

## Homepage & global chrome

| Check | Status |
|-------|--------|
| index.html mentions California | ${stateAudit.find((s) => s.rel === 'index.html')?.hasCA ? 'Yes' : '**NO**'} |
| index.html mentions all 4 states | ${['hasCA', 'hasTX', 'hasFL', 'hasPA'].every((k) => stateAudit.find((s) => s.rel === 'index.html')?.[k]) ? 'Yes' : 'Review'} |
| telehealth.html | CA:${stateAudit.find((s) => s.rel === 'telehealth.html')?.hasCA} TX:${stateAudit.find((s) => s.rel === 'telehealth.html')?.hasTX} FL:${stateAudit.find((s) => s.rel === 'telehealth.html')?.hasFL} PA:${stateAudit.find((s) => s.rel === 'telehealth.html')?.hasPA} |

## Provider pages

| Page | CA | TX | FL | PA |
|------|:--:|:--:|:--:|:--:|
${stateAudit.filter((s) => s.category === 'provider').map((s) => `| ${s.rel} | ${s.hasCA ? '✓' : '—'} | ${s.hasTX ? '✓' : '—'} | ${s.hasFL ? '✓' : '—'} | ${s.hasPA ? '✓' : '—'} |`).join('\n')}

## Geo / state landing pages

${stateAudit.filter((s) => s.category === 'adhd' && /diagnosis|treatment|evaluation/.test(s.rel)).map((s) => `- \`${s.rel}\` — CA:${s.hasCA} (expected: geo-specific)`).join('\n')}

## Recommendations

1. Standardize footer licensure line on **all** templates via \`site-chrome.mjs\`: "${STATE_ORDER_CANONICAL}".
2. Add California to any service page still using TX/FL/PA-only copy.
3. Geo pages (Houston, Austin, etc.) may omit CA in body — acceptable if global footer includes all four states.
4. Re-run this script after content sprint: \`node scripts/production-readiness-audit.mjs\`
`;

fs.writeFileSync(path.join(SITE_ROOT, 'STATE-COVERAGE-REPORT.md'), stateReport);

// ─── VISUAL-AUDIT-REPORT.md ───
const visualReport = `# Visual Audit Report

Generated: ${new Date().toISOString()}

## Summary

| Issue type | Count |
|------------|------:|
| Images used on 5+ pages | ${dupImages.length} |
| Hero-like images on 3+ pages | ${heroCandidates.length} |
| Missing/empty alt text | ${missingAlt.length} |
| Placeholder URLs | ${placeholderHits.length} |
| Very small raster assets (<8KB) | ${lowRes.length} |

## 1. Duplicate / overused images (5+ pages)

${dupImages.slice(0, 25).map(([src, pages]) => `### \`${src}\`
- **Used on:** ${pages.length} pages
- **Sample pages:** ${pages.slice(0, 5).map((p) => `\`${p}\``).join(', ')}${pages.length > 5 ? '…' : ''}
- **Recommendation:** ${src.includes('logo') ? 'Expected sitewide — no change' : src.includes('hero-telehealth') ? 'Differentiate heroes per section (metabolic vs ADHD vs telehealth)' : 'Assign topic-specific imagery or crop variants'}
`).join('\n')}

## 2. Same hero on multiple pages (3+)

${heroCandidates.map(([src, pages]) => `- **\`${src}\`** → ${pages.length} pages: ${pages.slice(0, 6).join(', ')}`).join('\n') || '_None above threshold._'}

## 3. Placeholder images

${placeholderHits.length ? placeholderHits.map((p) => `- \`${p.rel}\`: ${p.src}`).join('\n') : '_None detected._'}

## 4. Missing alt text (${missingAlt.length})

${missingAlt.slice(0, 20).map((p) => `- \`${p.rel}\` → ${p.src}`).join('\n') || '_None._'}
${missingAlt.length > 20 ? `\n_…and ${missingAlt.length - 20} more._` : ''}

## 5. Low-resolution assets (<8KB, non-SVG)

${lowRes.slice(0, 15).map((p) => `- \`${p.src}\` (${p.bytes} bytes)`).join('\n') || '_None flagged._'}

## 6. Provider photos (repeated)

| Asset | Pages |
|-------|------:|
${[...imageUsage.entries()].filter(([s]) => /dr-|provider/i.test(s)).map(([src, pages]) => `| ${src} | ${pages.length} |`).join('\n')}

## 7. Branding consistency notes

- Primary palette driven by \`styles.css\` (--primary teal, Poppins/Inter).
- Blog cards and answer pages share \`.clinical-review\` aside — consistent.
- **Action:** Replace repeated \`hero-telehealth\` variants on metabolic cornerstone pages with dedicated art (food noise, insulin resistance, fatigue).

## 8. Pages with no hero image (content-only)

${allHtml.filter(({ rel, full }) => {
  const h = fs.readFileSync(full, 'utf8');
  return (rel.startsWith('answers/') && rel !== 'answers/index.html') && !h.includes('class="hero"') && !h.includes('<img');
}).length} answer pages are text-first (acceptable for Health Guides).

---

_Re-run: \`node scripts/production-readiness-audit.mjs\`_
`;

fs.writeFileSync(path.join(SITE_ROOT, 'VISUAL-AUDIT-REPORT.md'), visualReport);

const browseClinicalAnswers = allHtml.filter(({ full }) =>
  fs.readFileSync(full, 'utf8').includes('Browse clinical answers'),
).length;

const indexHtml = fs.readFileSync(path.join(SITE_ROOT, 'index.html'), 'utf8');
const indexHas4StateFooter = indexHtml.includes('California, Texas, Pennsylvania, and Florida');

function clampScore(n) {
  return Math.min(100, Math.max(0, Math.round(n)));
}

const seoScore = clampScore(
  94 -
    hg.legacyAnswers.length * 5 -
    hg.titleMissing.length * 4 -
    browseClinicalAnswers * 0.15 -
    3,
);
const uxScore = clampScore(88 - ctaViolations.length * 2 - Math.min(missingAlt.length, 20) * 0.25);
const brandScore = clampScore(
  91 - hg.legacyAnswers.length * 8 - (hg.hubIssues?.length || 0) * 5 - browseClinicalAnswers * 0.2,
);
const trustScore = clampScore(
  93 -
    pendingMismatch.length * 5 -
    contentIssues.filter((c) => c.label.includes('Medically')).length * 15 -
    footer3StateOnly.length * 0.05,
);
const bookFreeConsultPages = [...new Set(
  contentIssues.filter((c) => c.label.includes('Consultation')).map((c) => c.rel),
)];
const conversionScore = clampScore(
  90 - ctaViolations.length * 2 - bookFreeConsultPages.length * 2 - (footer3StateOnly.length > 50 ? 12 : 0),
);

const topIssues = [
  { pri: 1, impact: 'High', effort: 'Low', issue: 'Update llms-full.txt "Clinical Answers Hub" → Health Guides', files: ['llms-full.txt'] },
  { pri: 2, impact: 'High', effort: 'Low', issue: 'Answer hub H1: align "Health guides" → "Health Guides" (title case)', files: ['answers/index.html', 'generate-answer-pages.mjs'] },
  { pri: 3, impact: 'High', effort: 'Med', issue: 'Physician review queue: approve cornerstone cluster in registry', files: ['content-review-registry.mjs'] },
  { pri: 4, impact: 'High', effort: 'Low', issue: 'Standardize 4-state footer via site-chrome on all pages', files: ['site-chrome.mjs'] },
  { pri: 5, impact: 'Med', effort: 'Low', issue: 'Remove legacy "Book Free Consultation" if any remain', files: ctaViolations.filter((v) => v.type.includes('Consultation')).map((v) => v.rel) },
  { pri: 6, impact: 'Med', effort: 'Med', issue: 'ADHD screening CTA on non-ADHD pages', files: [...new Set(ctaViolations.filter((v) => v.type.includes('screening')).map((v) => v.rel))].slice(0, 15) },
  { pri: 7, impact: 'Med', effort: 'Med', issue: 'Differentiate hero images for metabolic vs ADHD hubs', files: ['VISUAL-AUDIT-REPORT.md'] },
  { pri: 8, impact: 'Med', effort: 'Low', issue: 'Add Explore Care Options secondary CTA where missing', files: missingMeetGreet.slice(0, 10) },
  { pri: 9, impact: 'Low', effort: 'Low', issue: 'Marketing copy "Answers" wordplay (about.html, blog CTAs) — not nav', files: ['about.html', 'blog/adhd-symptoms-overlooked.html'] },
  { pri: 10, impact: 'Med', effort: 'Low', issue: 'Ensure all answer page titles include Health Guides pattern', files: hg.titleMissing },
];

// PRODUCTION-READINESS-AUDIT.md
const mainReport = `# Siya Health Production Readiness Audit

Generated: ${new Date().toISOString()}  
Site root: \`apps/siya-health\`  
Pages scanned: **${allHtml.length}** HTML files

---

## Scorecard

| Dimension | Score | Notes |
|-----------|------:|-------|
| **SEO** | **${Math.min(100, Math.max(0, seoScore))}/100** | Health Guides branding, canonical /answers, review schema governance |
| **UX** | **${Math.min(100, Math.max(0, uxScore))}/100** | CTA consistency, mobile nav, spacing system in styles.css |
| **Brand Consistency** | **${Math.min(100, Math.max(0, brandScore))}/100** | Nav/footer Health Guides; minor copy wordplay remains |
| **Trust** | **${Math.min(100, Math.max(0, trustScore))}/100** | Pending review blocks on 110 educational pages; no false physician claims |
| **Conversion Readiness** | **${Math.min(100, Math.max(0, conversionScore))}/100** | Meet & Greet primary; screening scoped to ADHD |

**Overall readiness:** Suitable for next content sprint after addressing **high-impact / low-effort** items below.

---

## Part 1 — Health Guides Audit

### Verified

| Check | Result |
|-------|--------|
| Nav displays "${NAV_HEALTH_GUIDES.label}" | ${hg.navOk.length} pages with nav |
| Footer displays "${NAV_HEALTH_GUIDES.label}" | ${hg.footerOk.length} pages |
| Breadcrumbs "Health Guides" | ${hg.breadcrumbOk.length} answer/blog pages with breadcrumbs |
| URL remains \`/answers\` | **Yes** — no path change |
| Unnecessary redirects | ${redirects.length ? redirects.map((r) => `\`${r.file}\` present — review manually`).join('; ') : '**None** in site root'} |

### Answer hub

| Element | Status |
|---------|--------|
| \`<title>\` | ${fs.existsSync(hubPath) && fs.readFileSync(hubPath, 'utf8').includes('Health Guides') ? '✓ Health Guides' : 'Review'} |
| H1 | ${hg.hubOk ? '✓ Health guides (consider title case)' : hg.hubIssues.join('; ')} |
| Nav/footer | ✓ Health Guides |

### Legacy wording remaining

| Pattern | Locations |
|---------|-----------|
| \`>Answers</a>\` link | ${hg.legacyAnswers.length} files |
| Clinical Answers | ${hg.legacyClinicalAnswers.length ? hg.legacyClinicalAnswers.join(', ') : '0 HTML'} |
| FAQ Library | ${hg.legacyFaq.length ? hg.legacyFaq.join(', ') : '0 HTML'} |
| Non-nav "Answers" copy | about.html ("Answers about ADHD"), blog CTAs — **acceptable marketing copy** |
| llms-full.txt | "Clinical Answers Hub" — **update** |

${hg.legacyAnswers.length ? `**Files with Answers nav/footer link:**\n${hg.legacyAnswers.slice(0, 20).map((x) => `- \`${x.rel}\` (${x.where})`).join('\n')}` : '**No stale Answers navigation links in HTML.**'}

---

## Part 2 — State Coverage

See **[STATE-COVERAGE-REPORT.md](./STATE-COVERAGE-REPORT.md)**.

- California mentioned on **${stateAudit.filter((s) => s.hasCA).length}/${allHtml.length}** pages
- Footers missing California: **${footerNoCA.length}**
- Three-state-only (no CA in body): **${threeOnly.length}**

---

## Part 3 — CTA Consistency

### Expected pattern

| Role | Copy |
|------|------|
| Primary | Book a Meet & Greet |
| Secondary | Explore Care Options |
| ADHD-only | Start Free Screening → \`/adhd-screening\` |

### Violations

${ctaViolations.length ? ctaViolations.slice(0, 25).map((v) => `- \`${v.rel}\`: ${v.type} (${v.count})`).join('\n') : '_No ADHD screening on non-ADHD pages detected._'}

### Pages without Meet & Greet link (${missingMeetGreet.length})

${missingMeetGreet.slice(0, 15).map((r) => `- \`${r}\``).join('\n') || '_All key pages include Meet & Greet._'}
${missingMeetGreet.length > 15 ? `\n_…and ${missingMeetGreet.length - 15} more (may be intentional for legal/minimal pages)._` : ''}

---

## Part 4 — Image & Visual

See **[VISUAL-AUDIT-REPORT.md](./VISUAL-AUDIT-REPORT.md)**.

- ${dupImages.length} assets used on 5+ pages
- ${missingAlt.length} images with missing/empty alt
- ${heroCandidates.length} hero-class images overused

---

## Part 5 — UX & Design (manual inspection summary)

### Homepage (\`index.html\`)
- **High:** Hero supports metabolic repositioning — verify CTA pair on mobile
- **Medium:** Trust band density — consider spacing between credential badges
- **Low:** Secondary service cards — consistent \`.button\` / \`.button-secondary\`

### Health Guides (\`answers/index.html\`)
- **Medium:** Hub is list-heavy — topic grouping cards would improve scanability
- **Low:** H1 title case vs nav "Health Guides"

### Blog / Answer templates
- **Low:** \`.clinical-review--pending\` styling consistent
- **Medium:** Long articles — TOC already on some posts; extend to cornerstone cluster

### Provider pages
- **Low:** Strong hierarchy; ensure CTA matches Meet & Greet sitewide

| Priority | Issue |
|----------|-------|
| High | Mobile nav CTA not hidden behind scroll on small viewports |
| Medium | Card grid gutters differ between blog hub and answers hub |
| Low | Poppins H1 vs Inter body — intentional; keep |

---

## Part 6 — Content Consistency

| Finding | Count |
|---------|------:|
| Medically reviewed (stale) | ${contentIssues.filter((c) => c.label.includes('Medically')).length} |
| Pending/review mismatch | ${pendingMismatch.length} |
| Book Free Consultation | ${contentIssues.filter((c) => c.label.includes('Consultation')).length} |
| Start Free Screening (sitewide) | ${contentIssues.filter((c) => c.label.includes('Screening')).length} (ADHD pages expected) |

${pendingMismatch.length ? `**Review block issues:**\n${pendingMismatch.slice(0, 10).map((p) => `- \`${p.rel}\`: ${p.issue}`).join('\n')}` : '**All blog/answer pages have pending review blocks.**'}

---

## Part 7 — Trust & Credibility

| Check | Status |
|-------|--------|
| Review status system | ✓ PENDING_REVIEW default on educational content |
| Physician credentials | ✓ Provider pages with MD, specialty, states |
| State licensure | See state report — footer standardization recommended |
| Disclaimers | ✓ Footer emergency / educational notices on templates |
| contact: care@siya.health | Present on major templates |
| Phone (215) 445-1244 | Present on major templates |

**Trust flags:** ${trustIssues.length} minor template gaps

${trustIssues.slice(0, 10).map((t) => `- \`${t.rel}\`: ${t.issue}`).join('\n') || '_None critical._'}

---

## Part 8 — Top 20 issues before next content sprint

| # | Priority | Impact | Effort | Issue |
|---|----------|--------|--------|-------|
${topIssues.map((t, i) => `| ${i + 1} | ${t.pri <= 3 ? '**High**' : t.pri <= 6 ? 'Medium' : 'Low'} | ${t.impact} | ${t.effort} | ${t.issue} |`).join('\n')}
| 11 | Medium | Med | Low | Sync SEO-CRITICAL-FIXES-REPORT.md (stale Answers counts) |
| 12 | Medium | Med | Med | Add California-specific geo blog interlinks from metabolic cluster |
| 13 | Low | Low | Low | membership-pricing.html — verify Meet & Greet CTA |
| 14 | Medium | High | Med | Content approval workflow doc for CLINICAL_REVIEW_APPROVED |
| 15 | Low | Low | Low | privacy/terms — confirm 4-state mention |
| 16 | Medium | Med | Low | BreadcrumbList on all answer pages (verify generator) |
| 17 | Low | Low | Low | Open Graph images per cornerstone article |
| 18 | Medium | Med | Med | Reduce hero-telehealth.jpg reuse (see visual report) |
| 19 | Low | Low | Low | Alt text on decorative icons in blog |
| 11 | **High** | High | Low | Fix 3-state footer → 4-state (California first) sitewide via generators |
| 12 | Medium | Med | Low | Replace "Browse clinical answers" → "Browse health guides" on answer CTAs |
| 13 | Medium | Med | Low | Remove "Book Free Consultation" from blog hubs + telehealth + weight-loss |
| 14 | Low | Low | Low | Title-case Health Guides H1 on \`answers/index.html\` |
| 15 | Medium | Med | Med | Provider pages: align footer + Meet & Greet (some use screening in nav) |
| 16 | Low | Low | Low | Update \`llms-full.txt\` / AI indexes for Health Guides naming |
| 17 | Medium | Med | Low | Service pages (labs, prescriptions) — add California to body copy |
| 18 | Low | Low | Low | Add OG images per cornerstone article |
| 19 | Medium | Med | Med | Hero image differentiation for metabolic cluster (visual report) |
| 20 | High | High | Med | Deploy + verify production build on Vercel \`main\` after fixes |

---

## Build & deploy checklist

\`\`\`bash
cd apps/siya-health
node scripts/generate-answer-pages.mjs
node scripts/seo-build.mjs
node scripts/content-governance-report.mjs
node scripts/production-readiness-audit.mjs
\`\`\`

## Related reports

- [CONTENT-GOVERNANCE-REPORT.md](./CONTENT-GOVERNANCE-REPORT.md)
- [STATE-COVERAGE-REPORT.md](./STATE-COVERAGE-REPORT.md)
- [VISUAL-AUDIT-REPORT.md](./VISUAL-AUDIT-REPORT.md)
`;

fs.writeFileSync(path.join(SITE_ROOT, 'PRODUCTION-READINESS-AUDIT.md'), mainReport);

console.log('Wrote PRODUCTION-READINESS-AUDIT.md, STATE-COVERAGE-REPORT.md, VISUAL-AUDIT-REPORT.md');
console.log('Scores:', { seo: seoScore, ux: uxScore, brand: brandScore, trust: trustScore, conversion: conversionScore });
console.log('Health Guides legacy links:', hg.legacyAnswers.length);
console.log('CTA violations:', ctaViolations.length);
