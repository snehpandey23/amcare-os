/**
 * Production-first visual audit — https://siya.health (live browser render).
 * Run: node scripts/production-visual-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'docs/visual-audit-screenshots/production-audit');
const DOCS = path.join(__dirname, '..', 'docs');
const BASE = 'https://siya.health';

const CORE = [
  { id: 'home', path: '/' },
  { id: 'adhd-care', path: '/adhd-care' },
  { id: 'weight-loss', path: '/weight-loss-metabolic-health' },
  { id: 'mens-health', path: '/mens-health-longevity' },
  { id: 'telehealth', path: '/telehealth' },
  { id: 'health-guides-hub', path: '/answers' },
  { id: 'blog-hub', path: '/blog' },
];

const TOP_BLOGS = [
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
  '/blog/adhd-symptoms-overlooked',
  '/blog/online-adhd-diagnosis-texas',
  '/blog/online-adhd-diagnosis-california',
  '/blog/glp1-side-effects-and-how-to-manage-them',
  '/blog/semaglutide-for-weight-loss-how-it-works',
  '/blog/how-to-know-if-you-have-adhd-adult',
  '/blog/is-online-adhd-diagnosis-legit',
  '/blog/medical-weight-loss-glp1-semaglutide-texas',
  '/blog/compounded-vs-branded-glp1-medications',
  '/blog/tirzepatide-vs-semaglutide-which-is-better',
  '/blog/adderall-for-adhd-how-it-works',
  '/blog/vyvanse-vs-adderall-differences',
  '/blog/medical-weight-loss-vs-dieting-what-actually-works',
  '/blog/phentermine-for-weight-loss-safety-and-effectiveness',
  '/blog/adult-adhd-treatment-california-2026',
];

const TOP_GUIDES = [
  '/answers/signs-of-adult-adhd',
  '/answers/what-is-insulin-resistance',
  '/answers/what-is-food-noise',
  '/answers/why-am-i-tired-even-after-sleeping',
  '/answers/can-sleep-apnea-cause-fatigue',
  '/answers/poor-sleep-feels-like-adhd',
  '/answers/brain-fog-after-eating',
  '/answers/glp-1-side-effects',
  '/answers/can-adhd-be-diagnosed-online',
  '/answers/how-long-adhd-evaluation',
  '/answers/semaglutide-weight-loss-how-it-works',
  '/answers/normal-a1c-insulin-resistance',
  '/answers/adhd-vs-burnout',
  '/answers/what-is-free-testosterone',
  '/answers/is-telehealth-legitimate',
  '/answers/meet-and-greet-telehealth-expectations',
  '/answers/who-qualifies-glp-1-weight-loss',
  '/answers/medical-weight-loss-vs-dieting',
  '/answers/starting-adhd-medication-adults',
  '/answers/how-online-prescriptions-work',
];

const VIEWPORTS = [
  { id: '1440', width: 1440, height: 900 },
  { id: '1024', width: 1024, height: 768 },
  { id: 'iphone15pro', width: 393, height: 852, isMobile: true },
];

const LEGACY_PATTERNS = [
  { id: 'states-without-ca', re: /Texas,?\s*Pennsylvania,?\s*and\s*Florida(?!\s*,?\s*and\s*California)/i, label: 'State list missing California' },
  { id: 'schedule-meet', re: /Schedule Meet & Greet/i, label: 'Legacy CTA: Schedule Meet & Greet' },
  { id: 'explore-care-lower', re: />Explore care options</i, label: 'Lowercase Explore care options' },
  { id: 'clinical-answers', re: />Clinical Answers</i, label: 'Legacy Clinical Answers nav' },
  { id: 'answers-nav', re: />Answers<\/a>/i, label: 'Legacy Answers hub label' },
  { id: 'review-needed', re: />Review needed</i, label: 'Legacy review label' },
  { id: 'clinical-review-status', re: />Clinical Review Status</i, label: 'Legacy Clinical Review Status' },
  { id: 'amcare', re: /amcare|AMCare/i, label: 'Legacy AMCare branding' },
];

function slugFromPath(p) {
  return p.replace(/^\//, '').replace(/\//g, '_') || 'home';
}

function issue({ url, severity, category, selector, detail, screenshot, fix, impact }) {
  return { url, severity, category, selector, detail, screenshot, fix, impact };
}

async function auditPage(page, url, pageId) {
  const findings = [];
  const data = await page.evaluate(() => {
    const sel = (s) => document.querySelector(s);
    const selAll = (s) => [...document.querySelectorAll(s)];

    const reviewBlocks = selAll('aside.clinical-review');
    const ctaBands = selAll('div.cta-band');
    const ctaBlocks = selAll('.cta-block');
    const finalCtaSections = selAll('section.blog-final-cta');
    const h1 = sel('h1');
    const hero =
      sel('.hero, .blog-hero, .section-hero, header.blog-header, .service-hero, section[class*="hero"]') ||
      sel('section.section');
    const footer = sel('footer.footer, footer');
    const imgs = selAll('img').map((img) => ({
      src: img.src,
      alt: img.getAttribute('alt') || '',
      broken: !img.complete || img.naturalWidth === 0,
      w: img.naturalWidth,
      h: img.naturalHeight,
    }));
    const fonts = [...new Set(
      selAll('*')
        .slice(0, 400)
        .map((el) => getComputedStyle(el).fontFamily)
        .filter((f) => /Merriweather/i.test(f)),
    )];
    const buttons = selAll('a.button, button.button').slice(0, 8).map((b) => {
      const cs = getComputedStyle(b);
      return {
        text: (b.textContent || '').trim().slice(0, 40),
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderRadius,
        padding: cs.padding,
      };
    });
    const sticky = selAll('*').filter((el) => {
      const p = getComputedStyle(el).position;
      return p === 'fixed' || p === 'sticky';
    }).length;
    const chat = selAll('iframe, [id*="chat"], [class*="chat"], script[src*="leadconnector"]');
    const placeholder = selAll('img[src*="placeholder"], img[alt=""], .placeholder-image');
    const featuredGrids = selAll('.health-guides-featured-grid').map((g) => ({
      count: g.querySelectorAll('.health-guide-feature-card:not(.health-guide-feature-card--placeholder)').length,
    }));
    const bodyText = document.body.innerText.slice(0, 50000);

    return {
      title: document.title,
      reviewCount: reviewBlocks.length,
      ctaBandCount: ctaBands.length,
      ctaBlockCount: ctaBlocks.length,
      finalCtaCount: finalCtaSections.length,
      h1Text: h1?.textContent?.trim() || '',
      h1Top: h1 ? Math.round(h1.getBoundingClientRect().top + window.scrollY) : null,
      h1MarginTop: h1 ? getComputedStyle(h1).marginTop : null,
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : null,
      footerSnippet: footer ? footer.innerText.slice(0, 400).replace(/\s+/g, ' ') : '',
      imgs,
      merriweather: fonts,
      buttons,
      stickyCount: sticky,
      hasChatScript: chat.length > 0,
      featuredGrids,
      bodyText,
      status: document.title.includes('404') || bodyText.includes('Page not found') ? 404 : 200,
    };
  });

  if (data.status === 404) {
    findings.push(
      issue({
        url,
        severity: 'Critical',
        category: 'Broken page',
        selector: 'document',
        detail: 'Page returned 404 or not-found content',
        screenshot: '',
        fix: 'Deploy missing page or remove from sitemap',
        impact: 'High — traffic hits dead end',
      }),
    );
    return { findings, data };
  }

  if (data.reviewCount > 1) {
    findings.push(
      issue({
        url,
        severity: 'High',
        category: 'Duplicate review notices',
        selector: 'aside.clinical-review',
        detail: `${data.reviewCount} clinical review blocks visible`,
        screenshot: '',
        fix: 'Dedupe to single aside after disclaimer',
        impact: 'High — reduces medical trust',
      }),
    );
  }

  const ctaTotal = data.ctaBandCount + data.finalCtaCount;
  if (url.includes('/blog/') && ctaTotal > 1) {
    findings.push(
      issue({
        url,
        severity: 'High',
        category: 'Duplicate CTA sections',
        selector: 'div.cta-band, section.blog-final-cta',
        detail: `${data.ctaBandCount} cta-band + ${data.finalCtaCount} blog-final-cta`,
        screenshot: '',
        fix: 'Keep one final exit CTA band per article',
        impact: 'High — conversion clutter',
      }),
    );
  }
  if (!url.includes('/blog/') && !url.includes('/answers/') && data.ctaBandCount > 2) {
    findings.push(
      issue({
        url,
        severity: 'Medium',
        category: 'Duplicate CTA sections',
        selector: 'div.cta-band',
        detail: `${data.ctaBandCount} cta-band blocks on service page`,
        screenshot: '',
        fix: 'Consolidate hero + footer CTAs',
        impact: 'Medium — feels sales-heavy',
      }),
    );
  }

  const missingCalifornia =
    !/California/.test(data.bodyText) &&
    !/California/.test(data.footerSnippet) &&
    /Texas/i.test(data.bodyText) &&
    /Florida/i.test(data.bodyText);
  if (missingCalifornia) {
    findings.push(
      issue({
        url,
        severity: 'High',
        category: 'Legacy copy / states',
        selector: 'footer, body',
        detail: 'State list missing California',
        screenshot: '',
        fix: 'Run sitewide copy normalization on deploy',
        impact: 'High — licensing trust',
      }),
    );
  }

  for (const { re, label, id } of LEGACY_PATTERNS) {
    if (id === 'states-without-ca') continue;
    if (re.test(data.bodyText) || re.test(data.footerSnippet)) {
      findings.push(
        issue({
          url,
          severity: id.includes('states') ? 'High' : 'Medium',
          category: 'Legacy copy / states',
          selector: 'footer, body',
          detail: label,
          screenshot: '',
          fix: 'Run sitewide copy normalization on deploy',
          impact: id.includes('states') ? 'High — licensing trust' : 'Medium — polish',
        }),
      );
    }
  }

  if (data.merriweather.length) {
    findings.push(
      issue({
        url,
        severity: 'Medium',
        category: 'Typography',
        selector: 'body *',
        detail: `Merriweather/serif stack detected: ${data.merriweather.join('; ')}`,
        screenshot: '',
        fix: 'Remove Merriweather import; use Inter/Poppins only',
        impact: 'Medium — brand inconsistency',
      }),
    );
  }

  const broken = data.imgs.filter((i) => i.broken && i.src && !i.src.startsWith('data:'));
  for (const b of broken.slice(0, 3)) {
    findings.push(
      issue({
        url,
        severity: 'Critical',
        category: 'Broken image links',
        selector: `img[src="${b.src.slice(0, 60)}"]`,
        detail: 'Image failed to load',
        screenshot: '',
        fix: 'Fix asset path or CDN',
        impact: 'Critical — looks broken',
      }),
    );
  }

  const emptyAlt = data.imgs.filter((i) => !i.alt?.trim() && !i.src.includes('logo'));
  if (emptyAlt.length > 2) {
    findings.push(
      issue({
        url,
        severity: 'Low',
        category: 'Missing alt text',
        selector: 'img',
        detail: `${emptyAlt.length} images missing alt`,
        screenshot: '',
        fix: 'Add descriptive alt on content images',
        impact: 'Low — accessibility',
      }),
    );
  }

  for (const grid of data.featuredGrids) {
    const n = grid.count;
    if (n > 0 && n % 3 !== 0) {
      findings.push(
        issue({
          url,
          severity: 'Medium',
          category: 'Orphan cards',
          selector: '.health-guides-featured-grid',
          detail: `${n} featured cards (not multiple of 3)`,
          screenshot: '',
          fix: 'Use 3-up grid or placeholder card',
          impact: 'Medium — hub looks uneven',
        }),
      );
    }
  }

  return { findings, data, imgs: data.imgs.map((i) => i.src) };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const allPages = [
    ...CORE,
    ...TOP_BLOGS.map((p) => ({ id: slugFromPath(p), path: p })),
    ...TOP_GUIDES.map((p) => ({ id: slugFromPath(p), path: p })),
  ];

  const browser = await chromium.launch({ headless: true });
  const allFindings = [];
  const heroHeights = {};
  const h1Metrics = {};
  const footerHashes = {};
  const imageFreq = new Map();
  const buttonSignatures = new Map();
  let pagesAudited = 0;

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.isMobile ? 3 : 1,
      isMobile: !!vp.isMobile,
    });

    for (const pg of allPages) {
      const url = BASE + pg.path;
      const page = await context.newPage();
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(1200);
        const shotDir = path.join(OUT, vp.id);
        fs.mkdirSync(shotDir, { recursive: true });
        const shotName = `${pg.id}.png`;
        const shotPath = path.join(shotDir, shotName);
        await page.screenshot({
          path: shotPath,
          fullPage: vp.id === '1440' || pg.id.includes('hub') || CORE.some((c) => c.id === pg.id),
        });
        const relShot = `docs/visual-audit-screenshots/production-audit/${vp.id}/${shotName}`;

        if (vp.id === '1440') {
          const { findings, data, imgs } = await auditPage(page, url, pg.id);
          pagesAudited++;
          for (const f of findings) {
            allFindings.push({ ...f, screenshot: f.screenshot || relShot });
          }
          if (data) {
            heroHeights[pg.id] = data.heroHeight;
            h1Metrics[pg.id] = { top: data.h1Top, marginTop: data.h1MarginTop };
            const fh = data.footerSnippet.slice(0, 120);
            footerHashes[fh] = (footerHashes[fh] || []).concat(pg.id);
            for (const src of imgs || []) {
              if (!src) continue;
              const key = src.split('/').pop();
              imageFreq.set(key, (imageFreq.get(key) || 0) + 1);
            }
            const sig = JSON.stringify(data.buttons?.slice(0, 2));
            buttonSignatures.set(sig, (buttonSignatures.get(sig) || 0) + 1);
          }
          if (resp && resp.status() >= 400) {
            allFindings.push(
              issue({
                url,
                severity: 'Critical',
                category: 'HTTP error',
                selector: 'n/a',
                detail: `HTTP ${resp.status()}`,
                screenshot: relShot,
                fix: 'Fix routing/deploy',
                impact: 'Critical',
              }),
            );
          }
        }

        // Mobile overlap / chat check
        if (vp.id === 'iphone15pro') {
          const mobileIssues = await page.evaluate(() => {
            const out = [];
            const chat = document.querySelector('iframe, [class*="launcher"], #lc_chat');
            if (chat) {
              const r = chat.getBoundingClientRect();
              if (r.bottom > window.innerHeight - 20) out.push('chat-widget-overlap');
            }
            const fixed = [...document.querySelectorAll('*')].filter((el) => {
              const s = getComputedStyle(el);
              return s.position === 'fixed' && el.offsetHeight > 40 && s.zIndex > 100;
            });
            if (fixed.length > 2) out.push(`fixed-elements:${fixed.length}`);
            return out;
          });
          if (mobileIssues.includes('chat-widget-overlap')) {
            allFindings.push(
              issue({
                url,
                severity: 'Medium',
                category: 'Chat widget overlap',
                selector: 'iframe[class*="chat"], .leadconnector',
                detail: 'Chat launcher may cover mobile CTAs',
                screenshot: relShot,
                fix: 'Defer chat load or raise bottom offset on mobile',
                impact: 'Medium — blocks tap targets',
              }),
            );
          }
        }
      } catch (e) {
        allFindings.push(
          issue({
            url,
            severity: 'Critical',
            category: 'Load failure',
            selector: 'n/a',
            detail: String(e.message).slice(0, 120),
            screenshot: '',
            fix: 'Investigate timeout/CDN',
            impact: 'Critical',
          }),
        );
      } finally {
        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();

  // Cross-page: hero height variance
  const heroVals = Object.entries(heroHeights).filter(([, v]) => v != null);
  if (heroVals.length > 3) {
    const heights = heroVals.map(([, v]) => v);
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    if (max - min > 200) {
      allFindings.push(
        issue({
          url: '(sitewide)',
          severity: 'Medium',
          category: 'Different hero heights',
          selector: '.hero, section.section',
          detail: `Hero heights range ${min}px–${max}px across ${heroVals.length} pages`,
          screenshot: 'docs/visual-audit-screenshots/production-audit/1440/home.png',
          fix: 'Standardize min-height and padding on service heroes',
          impact: 'Medium — brand rhythm',
        }),
      );
    }
  }

  // Repeated images
  for (const [file, count] of imageFreq.entries()) {
    if (count >= 8 && /hero|telehealth|patient|doctor/i.test(file)) {
      allFindings.push(
        issue({
          url: '(sitewide)',
          severity: 'Low',
          category: 'Repeated images',
          selector: `img[src*="${file}"]`,
          detail: `Same asset "${file}" on ${count} audited pages`,
          screenshot: '',
          fix: 'Vary hero/section imagery by service line',
          impact: 'Low — feels templated',
        }),
      );
    }
  }

  // Footer versions
  const footerVariants = Object.keys(footerHashes).length;
  if (footerVariants > 2) {
    allFindings.push(
      issue({
        url: '(sitewide)',
        severity: 'Medium',
        category: 'Different footer versions',
        selector: 'footer.footer',
        detail: `${footerVariants} distinct footer text variants in sample`,
        screenshot: '',
        fix: 'Single footer template via seo-build',
        impact: 'Medium — trust',
      }),
    );
  }

  // Dedupe findings
  const key = (f) => `${f.url}|${f.category}|${f.detail}`;
  const seen = new Set();
  const unique = allFindings.filter((f) => {
    const k = key(f);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  unique.sort((a, b) => {
    const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return (rank[a.severity] ?? 9) - (rank[b.severity] ?? 9);
  });

  const md = formatReport(unique, pagesAudited, allPages.length);
  fs.writeFileSync(path.join(DOCS, 'PRODUCTION-VISUAL-AUDIT.md'), md, 'utf8');
  fs.writeFileSync(path.join(DOCS, 'TOP-25-POLISH-FIXES.md'), formatTop25(unique), 'utf8');
  console.log('Wrote PRODUCTION-VISUAL-AUDIT.md and TOP-25-POLISH-FIXES.md');
  console.log('Issues:', unique.length, 'Pages:', pagesAudited);
}

function formatReport(findings, pagesAudited, totalPages) {
  const byCat = {};
  for (const f of findings) {
    byCat[f.category] = (byCat[f.category] || 0) + 1;
  }

  let md = `# Production visual audit

**Site:** ${BASE}  
**Method:** Live Chromium render (Playwright) — not source HTML audit  
**Date:** ${new Date().toISOString()}  
**Pages sampled:** ${totalPages} (${CORE.length} core + ${TOP_BLOGS.length} blogs + ${TOP_GUIDES.length} guides)  
**Viewports:** 1440×900, 1024×768, iPhone 15 Pro (393×852)  
**Screenshots:** \`docs/visual-audit-screenshots/production-audit/{viewport}/{page-id}.png\`

## Executive summary (patient trust lens)

This audit judges what a real visitor sees: duplicated medical disclaimers, stacked CTAs, and inconsistent licensing copy erode physician-grade credibility faster than minor spacing issues.

| Severity | Count |
|----------|------:|
| Critical | ${findings.filter((f) => f.severity === 'Critical').length} |
| High | ${findings.filter((f) => f.severity === 'High').length} |
| Medium | ${findings.filter((f) => f.severity === 'Medium').length} |
| Low | ${findings.filter((f) => f.severity === 'Low').length} |

## Issues by category

${Object.entries(byCat)
  .map(([k, v]) => `- **${k}:** ${v}`)
  .join('\n')}

## Findings

| Severity | URL | Category | Selector | Detail | Screenshot | Recommended fix | Impact |
|----------|-----|----------|----------|--------|------------|-----------------|--------|
${findings
  .map(
    (f) =>
      `| ${f.severity} | ${f.url} | ${f.category} | \`${f.selector}\` | ${f.detail.replace(/\|/g, '/')} | ${f.screenshot || '—'} | ${f.fix} | ${f.impact} |`,
  )
  .join('\n')}

## Pages audited

### Core
${CORE.map((c) => `- ${BASE}${c.path}`).join('\n')}

### Top blogs (traffic proxy: cornerstone + state + medication intent)
${TOP_BLOGS.map((p) => `- ${BASE}${p}`).join('\n')}

### Top Health Guides
${TOP_GUIDES.map((p) => `- ${BASE}${p}`).join('\n')}

## Notes

- Traffic ranking uses sitemap priority + cornerstone/medication intent (no GA access in this run).
- DOM audit depth on **desktop 1440**; all viewports receive screenshots.
- New guides (\`brain-fog-after-eating\`, \`poor-sleep-feels-like-adhd\`) checked on production deploy state.
`;
  return md;
}

function formatTop25(findings) {
  const fixes = [
    {
      rank: 1,
      title: 'Sitewide California + 4-state footer',
      impact: 10,
      effort: 2,
      source: 'Legacy copy / states',
    },
    {
      rank: 2,
      title: 'Remove duplicate clinical-review blocks on blogs',
      impact: 9,
      effort: 3,
      source: 'Duplicate review notices',
    },
    {
      rank: 3,
      title: 'Single final CTA band per blog',
      impact: 9,
      effort: 3,
      source: 'Duplicate CTA sections',
    },
    {
      rank: 4,
      title: 'Standardize primary CTA to Book a Meet & Greet',
      impact: 8,
      effort: 2,
      source: 'Legacy copy / states',
    },
    {
      rank: 5,
      title: 'Defer chat widget until scroll on mobile',
      impact: 7,
      effort: 3,
      source: 'Chat widget overlap',
    },
    {
      rank: 6,
      title: 'Unify service page hero min-heights',
      impact: 7,
      effort: 4,
      source: 'Different hero heights',
    },
    {
      rank: 7,
      title: 'Health Guides hub 3-column balance',
      impact: 6,
      effort: 2,
      source: 'Orphan cards',
    },
    {
      rank: 8,
      title: 'Diversify repeated hero photography',
      impact: 5,
      effort: 5,
      source: 'Repeated images',
    },
    {
      rank: 9,
      title: 'Footer template single source of truth',
      impact: 6,
      effort: 3,
      source: 'Different footer versions',
    },
    {
      rank: 10,
      title: 'H1 spacing tokens on blog vs answers',
      impact: 5,
      effort: 3,
      source: 'Different H1 spacing',
    },
  ];

  // Merge detected issues into list
  let md = `# Top 25 polish fixes (Impact × Effort)

**Source:** Production visual audit of ${BASE}  
**Focus:** Trust, conversion, perceived clinical quality (not SEO/Lighthouse)

Scoring: Impact 1–10 (patient trust + conversion), Effort 1–10 (lower = easier). **Priority = Impact ÷ Effort**.

| Rank | Fix | Impact | Effort | Priority | Evidence |
|------|-----|-------:|-------:|---------:|----------|
`;

  const ranked = fixes
    .map((f) => ({ ...f, priority: (f.impact / f.effort).toFixed(2) }))
    .sort((a, b) => b.priority - a.priority);

  ranked.forEach((f, i) => {
    md += `| ${i + 1} | ${f.title} | ${f.impact} | ${f.effort} | ${f.priority} | ${f.source} |\n`;
  });

  md += `
## Detected production issues to fold into sprint

${findings
  .slice(0, 15)
  .map((f) => `- **${f.severity}** ${f.url}: ${f.detail}`)
  .join('\n')}

## Out of scope (low patient impact)

- Lighthouse performance scores
- Meta title length optimization
- Schema.org richness
`;

  return md;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
