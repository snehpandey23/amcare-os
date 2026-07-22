/**
 * Machine-first phone audit — screenshots + layout probes + Lighthouse mobile.
 * Run: node scripts/phone-audit.mjs
 * Optional: PHONE_AUDIT_BASE=https://www.siya.health node scripts/phone-audit.mjs
 */
import { chromium, devices } from 'playwright';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const STAMP = new Date().toISOString().slice(0, 10);
const OUT = path.join(SITE_ROOT, 'docs', 'phone-audit', STAMP);
const BASE = (process.env.PHONE_AUDIT_BASE || 'https://www.siya.health').replace(/\/$/, '');

const PAGES = [
  { id: 'home', path: '/', symptoms: null },
  { id: 'adhd-care', path: '/adhd-care', symptoms: '#symptoms' },
  { id: 'weight-loss', path: '/weight-loss-metabolic-health', symptoms: '#weight-recognition' },
  { id: 'telehealth', path: '/telehealth', symptoms: '#tele-recognition' },
  { id: 'mens-health', path: '/mens-health-longevity', symptoms: '#mens-recognition' },
  { id: 'labs', path: '/labs', symptoms: '#why-labs' },
  { id: 'blog', path: '/blog', symptoms: '.blog-featured' },
];

async function probePage(page, pageId) {
  return page.evaluate((id) => {
    const issues = [];
    const docW = document.documentElement.scrollWidth;
    const viewW = window.innerWidth;
    if (docW > viewW + 2) {
      issues.push({
        severity: 'high',
        code: 'overflow-x',
        message: `Horizontal overflow: scrollWidth ${docW}px vs viewport ${viewW}px`,
      });
    }

    const header = document.querySelector('#site-header, .site-header');
    if (header) {
      const r = header.getBoundingClientRect();
      if (r.height > 96) {
        issues.push({
          severity: 'med',
          code: 'header-tall',
          message: `Header height ${Math.round(r.height)}px may crowd first viewport`,
        });
      }
    }

    const sticky = document.querySelector('.mobile-sticky-cta');
    if (sticky) {
      const style = getComputedStyle(sticky);
      const visible = style.display !== 'none' && style.visibility !== 'hidden';
      if (visible) {
        const sr = sticky.getBoundingClientRect();
        const buttons = [...document.querySelectorAll('a.button, button')].filter((el) => {
          const br = el.getBoundingClientRect();
          return br.bottom > sr.top - 8 && br.top < sr.bottom + 8 && br.width > 0;
        });
        if (buttons.length > 2) {
          issues.push({
            severity: 'med',
            code: 'sticky-overlap-risk',
            message: `Sticky CTA may overlap ${buttons.length} interactive elements near bottom`,
          });
        }
      }
    }

    const smallTaps = [...document.querySelectorAll('a, button')]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height, text: (el.textContent || '').trim().slice(0, 40) };
      })
      .filter((t) => t.w > 0 && t.h > 0 && (t.w < 40 || t.h < 40) && t.text.length > 0)
      .slice(0, 8);
    if (smallTaps.length) {
      issues.push({
        severity: 'med',
        code: 'small-tap-targets',
        message: `${smallTaps.length}+ tap targets under ~40px (sample: ${smallTaps
          .slice(0, 3)
          .map((t) => `"${t.text}" ${Math.round(t.w)}×${Math.round(t.h)}`)
          .join('; ')})`,
      });
    }

    const imgs = [...document.querySelectorAll('img')]
      .filter((img) => img.complete && img.naturalWidth === 0 && img.getAttribute('src'))
      .map((img) => img.getAttribute('src'))
      .slice(0, 5);
    if (imgs.length) {
      issues.push({
        severity: 'high',
        code: 'broken-images',
        message: `Broken images: ${imgs.join(', ')}`,
      });
    }

    const hero = document.querySelector('.hero-merged, .hero');
    if (hero) {
      const hr = hero.getBoundingClientRect();
      if (hr.height > 0 && hr.height < 280) {
        issues.push({
          severity: 'low',
          code: 'hero-short',
          message: `Hero only ${Math.round(hr.height)}px tall on phone`,
        });
      }
    }

    return { pageId: id, issues, title: document.title, url: location.href };
  }, pageId);
}

function runLighthouse(url, outJson) {
  const args = [
    url,
    '--quiet',
    '--chrome-flags=--headless --no-sandbox',
    '--form-factor=mobile',
    '--screenEmulation.mobile',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json',
    `--output-path=${outJson}`,
  ];
  const result = spawnSync('npx', ['--yes', 'lighthouse', ...args], {
    encoding: 'utf8',
    timeout: 180000,
    cwd: SITE_ROOT,
  });
  return { status: result.status, stderr: result.stderr || '' };
}

function scoreFromLh(jsonPath) {
  if (!fs.existsSync(jsonPath)) return null;
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const cats = data.categories || {};
  return {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'lighthouse'), { recursive: true });

  const iphone = devices['iPhone 13'];
  const browser = await chromium.launch({ headless: true });
  const findings = [];
  const lhScores = [];

  for (const pageDef of PAGES) {
    const context = await browser.newContext({
      ...iphone,
      locale: 'en-US',
    });
    const page = await context.newPage();
    const url = `${BASE}${pageDef.path}`;
    console.log('Auditing', url);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1200);

      // Dismiss cookie banner if present so shots are clean
      const accept = page.getByRole('button', { name: /accept all/i });
      if (await accept.isVisible().catch(() => false)) {
        await accept.click().catch(() => {});
        await page.waitForTimeout(400);
      }

      await page.screenshot({
        path: path.join(OUT, 'shots', `${pageDef.id}-hero.png`),
        fullPage: false,
      });

      if (pageDef.symptoms) {
        const loc = page.locator(pageDef.symptoms).first();
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          await page.screenshot({
            path: path.join(OUT, 'shots', `${pageDef.id}-section.png`),
            fullPage: false,
          });
        }
      }

      // Open mobile nav
      const toggle = page.locator('.nav-toggle-label, label[for="nav-toggle"]').first();
      if (await toggle.count()) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await toggle.click({ force: true }).catch(() => {});
        await page.waitForTimeout(400);
        await page.screenshot({
          path: path.join(OUT, 'shots', `${pageDef.id}-nav.png`),
          fullPage: false,
        });
      }

      const probe = await probePage(page, pageDef.id);
      findings.push(probe);
    } catch (err) {
      findings.push({
        pageId: pageDef.id,
        url,
        title: '',
        issues: [{ severity: 'high', code: 'load-error', message: String(err.message || err) }],
      });
    }

    await context.close();

    const lhPath = path.join(OUT, 'lighthouse', `${pageDef.id}.json`);
    console.log('Lighthouse', url);
    const lh = runLighthouse(url, lhPath);
    if (lh.status === 0) {
      lhScores.push({ id: pageDef.id, path: pageDef.path, ...scoreFromLh(lhPath) });
    } else {
      lhScores.push({ id: pageDef.id, path: pageDef.path, error: lh.stderr.slice(0, 200) });
    }
  }

  await browser.close();

  // Build punch list
  const lines = [];
  lines.push(`# Phone audit — ${STAMP}`);
  lines.push('');
  lines.push(`Base: ${BASE}`);
  lines.push(`Device: iPhone 13 emulation (390×844)`);
  lines.push(`Shots: \`${path.relative(SITE_ROOT, path.join(OUT, 'shots'))}\``);
  lines.push('');
  lines.push('## Lighthouse mobile scores');
  lines.push('');
  lines.push('| Page | Perf | A11y | BP | SEO |');
  lines.push('|---|---:|---:|---:|---:|');
  for (const s of lhScores) {
    if (s.error) {
      lines.push(`| ${s.id} | — | — | — | error |`);
    } else {
      lines.push(`| ${s.id} | ${s.performance} | ${s.accessibility} | ${s.bestPractices} | ${s.seo} |`);
    }
  }
  lines.push('');
  lines.push('## Automated layout / UX findings');
  lines.push('');

  const allIssues = findings.flatMap((f) =>
    (f.issues || []).map((i) => ({ ...i, pageId: f.pageId, url: f.url })),
  );
  const high = allIssues.filter((i) => i.severity === 'high');
  const med = allIssues.filter((i) => i.severity === 'med');
  const low = allIssues.filter((i) => i.severity === 'low');

  if (!allIssues.length) {
    lines.push('_No automated layout issues detected._');
    lines.push('');
  } else {
    for (const [label, list] of [
      ['High', high],
      ['Medium', med],
      ['Low', low],
    ]) {
      if (!list.length) continue;
      lines.push(`### ${label}`);
      lines.push('');
      for (const i of list) {
        lines.push(`- **${i.pageId}** (\`${i.code}\`): ${i.message}`);
      }
      lines.push('');
    }
  }

  lines.push('## Screenshot review checklist (agent)');
  lines.push('');
  lines.push('Review `shots/*-hero.png` and `*-section.png` for:');
  lines.push('1. Hero CTA / nav collision on transparent headers');
  lines.push('2. Symptom card image relevance (gender / topic match)');
  lines.push('3. Text overflow under sticky CTAs');
  lines.push('4. Blog search + featured cards density');
  lines.push('5. Labs visual strip readability');
  lines.push('');
  lines.push('## Next');
  lines.push('');
  lines.push('Human review only for remaining subjective brand/trust notes after machine punch list is cleared.');
  lines.push('');

  const reportPath = path.join(OUT, 'PHONE-AUDIT-REPORT.md');
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify({ findings, lhScores }, null, 2));
  console.log('Report:', reportPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
