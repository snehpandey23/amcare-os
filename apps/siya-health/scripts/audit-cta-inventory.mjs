/**
 * CTA inventory audit — scans indexable pages and outputs data/cta-audit.json
 * Run: node scripts/audit-cta-inventory.mjs [--md docs/CTA-AUDIT.md]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const BOOKING_CANONICAL =
  'https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=sysv73e4';
const GHL_CANONICAL = 'https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl';

const RECOMMENDED = {
  primary: { label: 'Talk to a Clinician', url: BOOKING_CANONICAL },
  secondary: { label: 'Explore Services', url: '/telehealth' },
  newsletter: { label: 'Siya Circle', url: GHL_CANONICAL },
};

const SERVICE_PATHS = new Set([
  '/telehealth',
  '/adhd-care',
  '/adhd-screening',
  '/weight-loss-metabolic-health',
  '/mens-health-longevity',
  '/primary-urgent-care',
  '/membership-pricing',
  '/book-appointment',
  '/labs',
  '/providers',
  '/about',
]);

function decodeText(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function pathToFile(p) {
  if (p === '/') return 'index.html';
  if (p === '/blog') return 'blog/index.html';
  const candidate = p.slice(1) + '/index.html';
  if (fs.existsSync(path.join(SITE_ROOT, candidate))) return candidate;
  return p.slice(1) + '.html';
}

function normalizeUrl(href) {
  if (!href) return '';
  if (href.startsWith('#')) return href.split('?')[0];
  const base = href.split('#')[0].split('?')[0];
  return decodeText(base);
}

function isBookingUrl(href) {
  return /book\.carepatron\.com\/Siya-Health/i.test(href || '');
}

function isGhlUrl(href) {
  return /link\.yourmarketingai\.com\/widget\/form\/HmvqrDVq3tq3qv6rkCjl/i.test(href || '');
}

function isScreeningUrl(href) {
  const n = normalizeUrl(href);
  return n === '/adhd-screening' || n.startsWith('/adhd-screening') || n === '/online-adhd-test';
}

function inferPageType(pagePath) {
  if (pagePath === '/') return 'homepage';
  if (pagePath === '/about') return 'about';
  if (pagePath.startsWith('/providers/')) return 'provider';
  if (pagePath === '/providers') return 'provider-hub';
  if (pagePath.startsWith('/legal')) return 'legal';
  if (pagePath === '/answers') return 'health-guides-hub';
  if (pagePath.startsWith('/answers/')) return 'health-guide';
  if (pagePath === '/blog' || /^\/blog\/(adhd|weight-loss|telehealth|all)$/.test(pagePath)) return 'blog-hub';
  if (pagePath.startsWith('/blog/')) return 'blog';
  if (
    [
      '/adhd-care',
      '/adhd-screening',
      '/adult-adhd-diagnosis',
      '/adhd-treatment-online',
      '/online-adhd-test',
      '/creyos-adhd-testing',
      '/weight-loss-metabolic-health',
      '/mens-health-longevity',
      '/telehealth',
      '/primary-urgent-care',
      '/pricing',
      '/book-appointment',
      '/labs',
      '/siya-circle',
    ].includes(pagePath) ||
    /^\/adhd-diagnosis-/.test(pagePath)
  ) {
    return 'service';
  }
  return 'other';
}

function getZone(html, index) {
  const mainOpen = html.search(/<main[\s>]/i);
  const mainClose = html.search(/<\/main>/i);
  const headerEnd = html.search(/<\/header>/i);
  const footerOpen = html.search(/<footer[\s>]/i);

  if (index < mainOpen || (headerEnd >= 0 && index <= headerEnd)) {
    const slice = html.slice(Math.max(0, index - 400), index);
    if (/nav-cta|nav-mobile|site-header/.test(slice)) return 'nav';
    return 'header';
  }
  if (mainOpen >= 0 && mainClose >= 0 && index > mainOpen && index < mainClose) return 'main';
  if (footerOpen >= 0 && index >= footerOpen) {
    const slice = html.slice(index - 200, index + 400);
    if (/footer-contact-block|footer-brand-bar/.test(slice)) return 'footer-contact';
    if (/footer-col|footer-links|footer-grid/.test(slice)) return 'footer-links';
    return 'footer';
  }
  if (/mobile-sticky-cta/.test(html.slice(index - 120, index + 120))) return 'mobile-sticky';
  return 'outside-main';
}

function getMainContext(mainSlice, localIndex) {
  const before = mainSlice.slice(0, localIndex);
  const markers = [
    ['cta-band-buttons', 'cta-band'],
    ['class="cta-band"', 'cta-band'],
    ['blog-final-cta', 'cta-band'],
    ['provider-lp-ctas', 'hero'],
    ['hero-ctas', 'hero'],
    ['hero-merged-content', 'hero'],
    ['hero-merged', 'hero'],
    ['siya-circle-promo', 'newsletter-section'],
    ['symptoms-card-actions', 'symptoms-grid'],
    ['symptoms-transition', 'symptoms-grid'],
    ['care-team-profile', 'provider-grid'],
    ['provider-card', 'provider-grid'],
    ['testimonials', 'testimonials'],
    ['article-body', 'inline-content'],
    ['blog-content', 'inline-content'],
    ['guide-content', 'inline-content'],
    ['post-content', 'inline-content'],
  ];

  let bestContext = 'main-body';
  let bestPos = -1;
  for (const [marker, ctx] of markers) {
    const pos = before.lastIndexOf(marker);
    if (pos > bestPos) {
      bestPos = pos;
      bestContext = ctx;
    }
  }
  return bestContext;
}

function classifyCtaType(anchor, href, cls, attrs, zone, context) {
  if (isGhlUrl(href) || /siya-circle/i.test(anchor)) return 'newsletter';
  if (attrs.providerCta) return 'provider-booking';
  if (isScreeningUrl(href) || /screening/i.test(anchor) || attrs.track?.includes('screening')) return 'screening';
  if (isBookingUrl(href) || /book-appointment/.test(normalizeUrl(href))) return 'booking';
  if (/\bbutton\b/.test(cls) && /\bsecondary\b/.test(cls)) {
    if (SERVICE_PATHS.has(normalizeUrl(href)) || /\/providers\//.test(href)) return 'secondary-service';
    if (/^\/blog\//.test(normalizeUrl(href)) || /^\/answers\//.test(normalizeUrl(href))) return 'content-crosslink';
    if (/View profile|profile/i.test(anchor)) return 'provider-profile';
    return 'secondary-other';
  }
  if (/hero-cta-link|hero-cta-secondary/.test(cls)) return 'secondary-text';
  if (/symptoms-card-secondary/.test(cls)) return 'screening';
  if (/\bbutton\b/.test(cls)) {
    if (SERVICE_PATHS.has(normalizeUrl(href))) return 'secondary-service';
    return 'button-other';
  }
  if (zone === 'footer-contact' && isBookingUrl(href)) return 'booking';
  if (zone === 'footer-contact' && /book appointment/i.test(anchor)) return 'utility-link';
  if (zone === 'footer-links' && /Free ADHD screening|ADHD screening/i.test(anchor)) return 'footer-nav';
  return 'text-link-cta';
}

function recommend(cta, pageType, pagePath) {
  const { type, zone, context, label, href, cls } = cta;
  const normalizedHref = normalizeUrl(href);

  if (type === 'newsletter') {
    if (zone === 'main' && context === 'newsletter-section') {
      return { action: 'KEEP', slot: 'newsletter', note: 'Dedicated Siya Circle section (answers hub)' };
    }
    if (zone.startsWith('footer')) {
      return { action: 'KEEP', slot: 'newsletter', note: 'Footer newsletter — do not modify footer in prior sprints' };
    }
    return { action: 'REMOVE', slot: null, note: 'Newsletter CTA belongs in footer or dedicated hub section only' };
  }

  if (type === 'booking') {
    if (zone === 'nav') {
      return { action: 'CONSOLIDATE', slot: 'primary', note: 'Nav booking — keep one label: Talk to a Clinician' };
    }
    if (zone === 'mobile-sticky') {
      return { action: 'REMOVE', slot: null, note: 'Duplicate primary; hero or final band is sufficient' };
    }
    if (zone.startsWith('footer')) {
      return {
        action: 'CONSOLIDATE',
        slot: 'primary',
        note: 'Footer booking duplicate — inventory only; footer frozen per prior sprint',
      };
    }
    if (zone === 'main') {
      if (context === 'hero') {
        return { action: 'CONSOLIDATE', slot: 'primary', note: 'Hero primary — one per page; unify label to Talk to a Clinician' };
      }
      if (context === 'cta-band') {
        return {
          action: 'CONSOLIDATE',
          slot: 'primary',
          note: 'Final-band primary — keep one per page; remove if hero already has booking',
        };
      }
      if (context === 'testimonials' || context === 'inline-content' || context === 'main-body') {
        return { action: 'REMOVE', slot: null, note: 'Mid-page booking — use hero OR final band only' };
      }
      if (context === 'provider-grid') {
        return { action: 'REMOVE', slot: null, note: 'Homepage care-team section — not a sitewide CTA slot' };
      }
      return { action: 'REMOVE', slot: null, note: 'Extra main booking beyond hero/final band' };
    }
    return { action: 'REMOVE', slot: null, note: 'Booking outside allowed zones' };
  }

  if (type === 'provider-booking') {
    if (pageType === 'provider') {
      if (context === 'hero' || context === 'cta-band') {
        return { action: 'CONSOLIDATE', slot: 'primary', note: 'Provider page — consolidate to Talk to a Clinician with UTM retained' };
      }
      return { action: 'REMOVE', slot: null, note: 'Duplicate provider booking in main body' };
    }
    return { action: 'REMOVE', slot: null, note: 'Provider-specific booking off profile pages' };
  }

  if (type === 'provider-profile') {
    return { action: 'REMOVE', slot: null, note: 'Profile buttons are navigation, not sitewide secondary CTA' };
  }

  if (type === 'screening') {
    const adhdContext = /adhd|screening|online-adhd-test/.test(pagePath);
    if (adhdContext && zone === 'main' && (context === 'hero' || context === 'symptoms-grid')) {
      return {
        action: 'CONSOLIDATE',
        slot: 'secondary',
        note: 'ADHD funnel secondary — optional one max; consider Explore Services on non-ADHD pages',
      };
    }
    if (zone.startsWith('footer')) {
      return { action: 'KEEP', slot: null, note: 'Footer nav link — not a main CTA slot' };
    }
    return { action: 'REMOVE', slot: null, note: 'Screening CTA outside ADHD hero/symptoms' };
  }

  if (type === 'secondary-service' || type === 'secondary-text' || type === 'secondary-other') {
    if (href.startsWith('#')) {
      return { action: 'REMOVE', slot: null, note: 'In-page anchor button — not a sitewide CTA slot' };
    }
    if (zone === 'main' && (context === 'hero' || context === 'cta-band')) {
      return {
        action: 'CONSOLIDATE',
        slot: 'secondary',
        note: `Consolidate to "${RECOMMENDED.secondary.label}" → ${RECOMMENDED.secondary.url} (or contextual service path)`,
      };
    }
    if (zone === 'nav') return { action: 'KEEP', slot: null, note: 'Nav text links are navigation, not CTAs' };
    return { action: 'REMOVE', slot: null, note: 'Secondary explore link outside hero/final band' };
  }

  if (type === 'content-crosslink') {
    return { action: 'REMOVE', slot: null, note: 'Styled content cross-link — use text links in body, not button CTAs' };
  }

  if (type === 'utility-link') {
    return { action: 'REMOVE', slot: null, note: 'Remove /book-appointment intermediary; link primary booking directly' };
  }

  if (type === 'footer-nav') {
    return { action: 'KEEP', slot: null, note: 'Footer navigation — inventory only' };
  }

  if (type === 'button-other') {
    if (/Browse Health Guides|Open all articles/i.test(label)) {
      return { action: 'REMOVE', slot: null, note: 'Hub navigation styled as button — not a sitewide CTA' };
    }
    return { action: 'REMOVE', slot: null, note: 'Misc button — not part of 3-slot system' };
  }

  return { action: 'REMOVE', slot: null, note: 'Unclassified CTA pattern' };
}

function extractCtas(html, pagePath) {
  const pageType = inferPageType(pagePath);
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const mainHtml = mainMatch ? mainMatch[1] : '';
  const mainOffset = mainMatch ? html.indexOf(mainMatch[0]) + html.indexOf('>', html.indexOf('<main')) + 1 : -1;

  const re = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
  const ctas = [];
  let m;

  while ((m = re.exec(html)) !== null) {
    const full = m[0];
    const attrsRaw = m[1];
    const inner = m[2];
    const hrefMatch = attrsRaw.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    const cls = (attrsRaw.match(/class=["']([^"']+)["']/i) || [])[1] || '';
    const label = decodeText(inner.replace(/<[^>]+>/g, ''));
    if (!label) continue;

    const track = (attrsRaw.match(/data-siya-track=["']([^"']+)["']/i) || [])[1] || '';
    const providerCta = (attrsRaw.match(/data-provider-cta=["']([^"']+)["']/i) || [])[1] || '';
    const zone = getZone(html, m.index);

    const isButton = /\bbutton\b/.test(cls);
    const isHeroLink = /hero-cta-link|hero-cta-secondary/.test(cls);
    const isSymptomsSecondary = /symptoms-card-secondary/.test(cls);
    const isCtaCandidate =
      isButton ||
      isHeroLink ||
      isSymptomsSecondary ||
      isBookingUrl(href) ||
      isGhlUrl(href) ||
      isScreeningUrl(href) ||
      providerCta ||
      /screening-cta|booking-cta|hero-cta|final-cta|siya-circle-join/.test(track) ||
      (zone === 'footer-contact' && (isBookingUrl(href) || /book appointment/i.test(label))) ||
      (zone === 'mobile-sticky' && isButton);

    if (!isCtaCandidate) continue;

    let context = 'global';
    if (zone === 'main' && mainOffset >= 0) {
      const localIndex = m.index - mainOffset;
      context = getMainContext(mainHtml, localIndex);
    } else if (zone === 'nav') context = 'nav';
    else if (zone === 'mobile-sticky') context = 'mobile-sticky';
    else if (zone.startsWith('footer')) context = zone;

    const type = classifyCtaType(label, href, cls, { track, providerCta }, zone, context);
    const rec = recommend({ type, zone, context, label, href, cls }, pageType, pagePath);

    ctas.push({
      label,
      href,
      normalizedHref: normalizeUrl(href),
      classes: cls,
      zone,
      context,
      type,
      isSecondary: /\bsecondary\b/.test(cls),
      recommendation: rec.action,
      slot: rec.slot,
      note: rec.note,
    });
  }

  return { pageType, ctas };
}

function patternKey(cta) {
  return `${cta.label}|||${cta.normalizedHref}|||${cta.type}|||${cta.zone}|||${cta.recommendation}`;
}

function loadIndexablePages() {
  const invPath = path.join(SITE_ROOT, 'data', 'website-inventory.json');
  const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
  return inv.pages.filter((p) => p.indexable);
}

function countMainCtas(ctas) {
  return ctas.filter((c) => c.zone === 'main').length;
}

function buildAudit() {
  const pages = loadIndexablePages();
  const pageResults = [];
  const allCtas = [];
  const patterns = new Map();

  for (const page of pages) {
    const rel = pathToFile(page.path);
    const filePath = path.join(SITE_ROOT, rel);
    if (!fs.existsSync(filePath)) {
      pageResults.push({ path: page.path, file: rel, missing: true, ctas: [] });
      continue;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const { pageType, ctas } = extractCtas(html, page.path);
    const mainCount = countMainCtas(ctas);
    const bookingInMain = ctas.filter((c) => c.zone === 'main' && c.type === 'booking').length;

    pageResults.push({
      path: page.path,
      file: rel,
      pageType: page.pageType || pageType,
      mainCtaCount: mainCount,
      bookingInMain,
      ctas,
    });

    for (const cta of ctas) {
      allCtas.push({ ...cta, pagePath: page.path, pageType: page.pageType || pageType });
      const key = patternKey(cta);
      if (!patterns.has(key)) {
        patterns.set(key, {
          label: cta.label,
          url: cta.normalizedHref,
          type: cta.type,
          zone: cta.zone,
          count: 0,
          pages: [],
          recommendation: cta.recommendation,
          slot: cta.slot,
          note: cta.note,
        });
      }
      const p = patterns.get(key);
      p.count += 1;
      if (p.pages.length < 8 && !p.pages.includes(page.path)) p.pages.push(page.path);
    }
  }

  const uniqueLabels = new Set(allCtas.map((c) => c.label));
  const removeInstances = allCtas.filter((c) => c.recommendation === 'REMOVE');
  const consolidateInstances = allCtas.filter((c) => c.recommendation === 'CONSOLIDATE');
  const keepInstances = allCtas.filter((c) => c.recommendation === 'KEEP');

  const excessivePages = pageResults
    .filter((p) => p.mainCtaCount > 3)
    .sort((a, b) => b.mainCtaCount - a.mainCtaCount)
    .map((p) => ({
      path: p.path,
      mainCtaCount: p.mainCtaCount,
      bookingInMain: p.bookingInMain,
      ctas: p.ctas
        .filter((c) => c.zone === 'main')
        .map((c) => ({ label: c.label, type: c.type, context: c.context, recommendation: c.recommendation })),
      remove: p.ctas.filter((c) => c.zone === 'main' && c.recommendation === 'REMOVE').map((c) => c.label),
    }));

  const duplicateBookingPages = pageResults
    .filter((p) => p.bookingInMain > 1)
    .sort((a, b) => b.bookingInMain - a.bookingInMain)
    .map((p) => ({ path: p.path, bookingInMain: p.bookingInMain }));

  const bookingLabels = [...new Set(allCtas.filter((c) => c.type === 'booking' || c.type === 'provider-booking').map((c) => c.label))];

  const chaosScore = Math.round(
    (uniqueLabels.size / 3) * 10 +
      (allCtas.length / pages.length) * 5 +
      bookingLabels.length * 8 +
      duplicateBookingPages.length * 2,
  );

  const removalList = [...patterns.values()]
    .filter((p) => p.recommendation === 'REMOVE')
    .sort((a, b) => b.count - a.count);

  const byPageType = {};
  for (const cta of allCtas) {
    const t = cta.pageType || 'other';
    if (!byPageType[t]) byPageType[t] = { instances: 0, remove: 0, keep: 0, consolidate: 0 };
    byPageType[t].instances += 1;
    byPageType[t][cta.recommendation.toLowerCase()] += 1;
  }

  return {
    generated: new Date().toISOString(),
    indexablePageCount: pages.length,
    recommendedSystem: RECOMMENDED,
    summary: {
      totalCtaInstances: allCtas.length,
      uniqueLabels: uniqueLabels.size,
      uniquePatterns: patterns.size,
      bookingLabelVariants: bookingLabels.length,
      bookingLabels,
      keepInstances: keepInstances.length,
      consolidateInstances: consolidateInstances.length,
      removeInstances: removeInstances.length,
      pagesWithMainCtaOver3: excessivePages.length,
      pagesWithDuplicateBookingInMain: duplicateBookingPages.length,
      chaosScore,
    },
    patterns: [...patterns.values()].sort((a, b) => b.count - a.count),
    excessivePages,
    duplicateBookingPages: duplicateBookingPages.slice(0, 30),
    removalList,
    byPageType,
    pageResults: pageResults.map(({ path, file, pageType, mainCtaCount, bookingInMain }) => ({
      path,
      file,
      pageType,
      mainCtaCount,
      bookingInMain,
    })),
  };
}

function mdEscape(s) {
  return String(s).replace(/\|/g, '\\|');
}

function generateMarkdown(audit) {
  const s = audit.summary;
  const lines = [];

  lines.push('# CTA Audit — Siya Health');
  lines.push('');
  lines.push(`Generated: ${audit.generated}`);
  lines.push('');
  lines.push('> Audit-only deliverable. No pages were modified. Footer CTAs are inventoried but flagged as frozen per prior sprints.');
  lines.push('');
  lines.push('Related: [UX-CTA-AUDIT-BEFORE.md](./UX-CTA-AUDIT-BEFORE.md) · [UX-CTA-AUDIT-AFTER.md](./UX-CTA-AUDIT-AFTER.md)');
  lines.push('');

  lines.push('## Executive summary');
  lines.push('');
  lines.push(`Scanned **${audit.indexablePageCount}** indexable pages (per \`data/website-inventory.json\`).`);
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|------:|');
  lines.push(`| Total CTA instances | ${s.totalCtaInstances} |`);
  lines.push(`| Unique CTA labels | ${s.uniqueLabels} |`);
  lines.push(`| Unique CTA patterns (label + URL + type + zone) | ${s.uniquePatterns} |`);
  lines.push(`| Booking label variants | ${s.bookingLabelVariants} |`);
  lines.push(`| Instances to **KEEP** | ${s.keepInstances} |`);
  lines.push(`| Instances to **CONSOLIDATE** | ${s.consolidateInstances} |`);
  lines.push(`| Instances to **REMOVE** | ${s.removeInstances} |`);
  lines.push(`| Pages with >3 CTAs in \`<main>\` | ${s.pagesWithMainCtaOver3} |`);
  lines.push(`| Pages with duplicate booking in \`<main>\` | ${s.pagesWithDuplicateBookingInMain} |`);
  lines.push(`| **Chaos score** (higher = worse) | **${s.chaosScore}** |`);
  lines.push('');
  lines.push(
    `**Fragmentation:** ${s.uniqueLabels} distinct labels and ${s.bookingLabelVariants} booking variants across ${audit.indexablePageCount} pages — far above the target **3-slot** system. Prior UX sprint reduced buttons (~925→704) but label/URL duplication remains.`,
  );
  lines.push('');

  lines.push('## Recommended final CTA system');
  lines.push('');
  lines.push('| Slot | Label | URL | Usage rules |');
  lines.push('|------|-------|-----|-------------|');
  lines.push(
    `| **Primary** | ${RECOMMENDED.primary.label} | \`${RECOMMENDED.primary.url}\` | One per page max in hero **or** final \`cta-band\`; nav may repeat same label. Consolidate all booking variants (Book ADHD Evaluation, Book a Meet & Greet, Book with {name}, etc.). |`,
  );
  lines.push(
    `| **Secondary** | ${RECOMMENDED.secondary.label} | \`${RECOMMENDED.secondary.url}\` (contextual: \`/adhd-care\`, \`/weight-loss-metabolic-health\`, etc.) | Optional, one max in hero or final band. ADHD funnel may use Free ADHD Screening instead on service/screening pages only. |`,
  );
  lines.push(
    `| **Newsletter** | ${RECOMMENDED.newsletter.label} | \`${RECOMMENDED.newsletter.url}\` | Footer Company column only (+ dedicated promo on \`/answers\` hub). Do not add to hero or article bodies. |`,
  );
  lines.push('');

  lines.push('## Sitewide inventory table');
  lines.push('');
  lines.push('| Label | URL | Type | Zone | Count | Pages (sample) | Recommendation |');
  lines.push('|-------|-----|------|------|------:|----------------|----------------|');
  for (const p of audit.patterns.slice(0, 80)) {
    lines.push(
      `| ${mdEscape(p.label)} | \`${mdEscape(p.url)}\` | ${p.type} | ${p.zone} | ${p.count} | ${p.pages.slice(0, 3).map((x) => `\`${x}\``).join(', ')}${p.pages.length > 3 ? '…' : ''} | **${p.recommendation}**${p.slot ? ` (${p.slot})` : ''} |`,
    );
  }
  if (audit.patterns.length > 80) {
    lines.push(`| … | … | … | … | … | … | *${audit.patterns.length - 80} more patterns in \`data/cta-audit.json\`* |`);
  }
  lines.push('');

  lines.push('## Per-page-type rules');
  lines.push('');
  lines.push('| Page type | Primary | Secondary | Newsletter | Remove |');
  lines.push('|------|---------|-----------|------------|--------|');
  const rules = [
    ['Homepage', 'Hero only (drop testimonials + final-band duplicate)', 'Optional: Explore Services → /telehealth', 'Footer only', '7 profile buttons, mid-page booking, mobile sticky, hero pricing link → consolidate'],
    ['Service pages', 'Hero OR final band (not both)', 'Contextual service or screening on ADHD pages', 'Footer only', 'Inline body booking, duplicate nav labels per funnel'],
    ['About', 'Hero Talk to a Clinician', 'Explore Services → /telehealth', 'Footer only', 'Extra Meet & Greet variants, mid-section booking'],
    ['Provider profiles', 'Hero booking (UTM OK)', 'None (bio is the content)', 'Footer only', 'Duplicate Book with {name} in body band'],
    ['Blog articles', 'Final cta-band only', 'Optional contextual (/adhd-care)', 'Footer only', 'Nav duplicate + inline `<p>` booking links + mid-article buttons'],
    ['Health guides', 'Final cta-band only', 'Optional screening on ADHD guides', 'Footer only', 'Nav Meet & Greet variant, content-crosslink `.button.secondary` to blog'],
    ['Legal', 'None in main', 'None', 'Footer only', 'Footer contact booking duplicates (inventory only)'],
  ];
  for (const r of rules) {
    lines.push(`| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} |`);
  }
  lines.push('');

  lines.push('## Pages with excessive CTAs (>3 in `<main>`)');
  lines.push('');
  if (audit.excessivePages.length === 0) {
    lines.push('None.');
  } else {
    lines.push('| Page | Main CTAs | Booking in main | Remove (labels) |');
    lines.push('|------|----------:|----------------:|-----------------|');
    for (const p of audit.excessivePages) {
      lines.push(
        `| \`${p.path}\` | ${p.mainCtaCount} | ${p.bookingInMain} | ${p.remove.slice(0, 4).join('; ') || '—'}${p.remove.length > 4 ? '…' : ''} |`,
      );
    }
  }
  lines.push('');

  lines.push('## Duplicate booking in `<main>` (same URL, multiple buttons)');
  lines.push('');
  lines.push(`**${audit.duplicateBookingPages.length}** pages shown (top 30 in JSON). Worst offenders:`);
  lines.push('');
  for (const p of audit.duplicateBookingPages.slice(0, 15)) {
    lines.push(`- \`${p.path}\` — ${p.bookingInMain} booking CTAs in main`);
  }
  lines.push('');

  lines.push('## Exact removal list');
  lines.push('');
  lines.push('CTA label + URL patterns flagged **REMOVE** sitewide (sorted by instance count):');
  lines.push('');
  lines.push('| Label | URL | Count | Note |');
  lines.push('|-------|-----|------:|------|');
  for (const p of audit.removalList.slice(0, 50)) {
    lines.push(`| ${mdEscape(p.label)} | \`${mdEscape(p.url)}\` | ${p.count} | ${mdEscape(p.note)} |`);
  }
  lines.push('');

  lines.push('## Booking label consolidation');
  lines.push('');
  lines.push('Replace all variants with **Talk to a Clinician** → CarePatron canonical URL:');
  lines.push('');
  for (const label of s.bookingLabels) {
    const mark = label === RECOMMENDED.primary.label ? '✓ canonical' : '→ consolidate';
    lines.push(`- \`${label}\` (${mark})`);
  }
  lines.push('');

  lines.push('## By page type (instance counts)');
  lines.push('');
  lines.push('| Page type | Instances | KEEP | CONSOLIDATE | REMOVE |');
  lines.push('|-----------|----------:|-----:|------------:|-------:|');
  for (const [type, stats] of Object.entries(audit.byPageType).sort((a, b) => b[1].instances - a[1].instances)) {
    lines.push(`| ${type} | ${stats.instances} | ${stats.keep} | ${stats.consolidate} | ${stats.remove} |`);
  }
  lines.push('');

  return lines.join('\n');
}

const audit = buildAudit();
const jsonPath = path.join(SITE_ROOT, 'data', 'cta-audit.json');
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(audit, null, 2) + '\n');
console.log(`Wrote data/cta-audit.json`);

const mdArg = process.argv.indexOf('--md');
const mdPath =
  mdArg >= 0 ? path.join(SITE_ROOT, process.argv[mdArg + 1]) : path.join(SITE_ROOT, 'docs', 'CTA-AUDIT.md');
fs.mkdirSync(path.dirname(mdPath), { recursive: true });
fs.writeFileSync(mdPath, generateMarkdown(audit) + '\n');
console.log(`Wrote ${path.relative(SITE_ROOT, mdPath)}`);
console.log(`Total CTAs: ${audit.summary.totalCtaInstances}, remove: ${audit.summary.removeInstances}, labels: ${audit.summary.uniqueLabels}`);
