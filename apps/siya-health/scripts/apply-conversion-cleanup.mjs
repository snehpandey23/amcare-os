/**
 * Conversion-clarity cleanup — idempotent injection of pricing strips,
 * ADHD screening disclaimers, "what happens next" journeys, and blog CTA blocks.
 * Runs before seo-build so chrome/normalization apply afterward.
 * Run: node scripts/apply-conversion-cleanup.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  renderPricingStrip,
  renderAdhdNextSteps,
  renderBlogCtaAdhd,
  renderBlogCtaMetabolic,
} from './conversion-cleanup-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const PRICING_STRIP_PAGES = [
  // adhd-care.html intentionally omitted — primary pricing section lives on-page
  'weight-loss-metabolic-health.html',
  'telehealth.html',
  'mens-health-longevity.html',
  'womens-health.html',
  'primary-urgent-care.html',
  'labs.html',
];

const ADHD_FUNNEL_PAGES = [
  // adhd-care.html intentionally omitted — journey covered by care pathways + final CTA
  // Metro diagnosis clones retired (geo-consolidation) — do not inject into stubs
  'online-adhd-test.html',
  'adhd-screening.html',
  'adhd-diagnosis-texas.html',
  'creyos-adhd-testing.html',
];

const BLOG_HUBS = new Set(['index.html', 'adhd.html', 'weight-loss.html', 'telehealth.html', 'mens-health.html']);

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function upsertMarkedBlock(html, markerName, block) {
  const open = `<!-- ${markerName} -->`;
  const close = `<!-- /${markerName} -->`;
  const re = new RegExp(`${esc(open)}[\\s\\S]*?${esc(close)}`);
  if (re.test(html)) return html.replace(re, block.trim());
  return null;
}

/**
 * @param {string} relPath
 * @param {string} markerName
 * @param {string} block
 * @param {string[]} anchors - insert block before the first anchor found
 */
function patchFile(relPath, markerName, block, anchors) {
  const filePath = path.join(SITE_ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip ${relPath} (missing)`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  const updated = upsertMarkedBlock(html, markerName, block);
  if (updated !== null) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }
  for (const anchor of anchors) {
    const idx = html.indexOf(anchor);
    if (idx !== -1) {
      html = html.slice(0, idx) + `${block.trim()}\n${anchor}` + html.slice(idx + anchor.length);
      fs.writeFileSync(filePath, html, 'utf8');
      return true;
    }
  }
  console.warn(`  could not place ${markerName} in ${relPath}`);
  return false;
}

function classifyBlogMetabolic(slug) {
  if (/(weight|glp|glp-1|semaglutide|tirzepatide|metabolic|insulin|phentermine|ozempic|food-noise|obesity)/i.test(slug)) {
    return { serviceHref: '/weight-loss-metabolic-health', serviceLabel: 'Medical weight loss &amp; metabolic health' };
  }
  if (/(testosterone|hormone|minoxidil|erectile|sildenafil|hair-loss|longevity|libido)/i.test(slug)) {
    return { serviceHref: '/mens-health-longevity', serviceLabel: "Men's health &amp; longevity" };
  }
  if (/(tired|fatigue|sleep|apnea|insomnia|energy)/i.test(slug)) {
    return { serviceHref: '/telehealth', serviceLabel: 'Telehealth care' };
  }
  return null;
}

function isAdhdBlog(slug) {
  return /(adhd|adderall|vyvanse|focalin|stimulant|creyos)/i.test(slug);
}

function main() {
  let counts = { pricing: 0, whatNext: 0, disclaimer: 0, blogAdhd: 0, blogMetabolic: 0 };

  // Task 3 — pricing strip on major service pages
  for (const rel of PRICING_STRIP_PAGES) {
    if (patchFile(rel, 'SIYA:PRICING-STRIP', renderPricingStrip(rel), ['<!-- SIYA:MEET-PHYSICIANS -->', '    </main>', '  </main>'])) {
      counts.pricing++;
    }
  }

  // Task 4 + 5 — ADHD "what happens next" (leads with screening disclaimer)
  for (const rel of ADHD_FUNNEL_PAGES) {
    if (patchFile(rel, 'SIYA:ADHD-NEXT-STEPS', renderAdhdNextSteps(rel), ['<!-- SIYA:MEET-PHYSICIANS -->', '    </main>'])) {
      counts.whatNext++;
    }
  }

  // Task 4 — screening disclaimer lives on /adhd-screening only (not adhd-care hero)
  // Previously injected SIYA:ADHD-SCREENING-DISCLAIMER under adhd-care hero CTAs — retired.

  // Task 6 + 7 — blog CTA blocks (inject before Related Articles)
  const blogDir = path.join(SITE_ROOT, 'blog');
  const anchors = ['<section class="related-articles"', '<section class="section blog-final-cta">'];
  for (const file of fs.readdirSync(blogDir)) {
    if (!file.endsWith('.html') || BLOG_HUBS.has(file)) continue;
    const rel = `blog/${file}`;
    const filePath = path.join(SITE_ROOT, rel);
    let html = fs.readFileSync(filePath, 'utf8');
    if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
    const slug = file.replace(/\.html$/, '');
    if (isAdhdBlog(slug)) {
      // Pillar hubs own Meet & Greet + Evaluation CTAs (restored post-build).
      if (slug === 'adhd-in-women' || slug === 'executive-dysfunction-adhd') continue;
      if (patchFile(rel, 'SIYA:BLOG-CTA-ADHD', renderBlogCtaAdhd(rel), anchors)) counts.blogAdhd++;
      continue;
    }
    const metabolic = classifyBlogMetabolic(slug);
    if (metabolic) {
      if (patchFile(rel, 'SIYA:BLOG-CTA-METABOLIC', renderBlogCtaMetabolic(rel, metabolic), anchors)) counts.blogMetabolic++;
    }
  }

  console.log(
    `Conversion cleanup: pricing ${counts.pricing}, what-next ${counts.whatNext}, disclaimer ${counts.disclaimer}, blog-adhd ${counts.blogAdhd}, blog-metabolic ${counts.blogMetabolic}`,
  );
}

main();
