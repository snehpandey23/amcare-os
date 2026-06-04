/**
 * Consistency QA screenshots — /answers + five cornerstone blogs.
 */
import fs from 'fs';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/visual-audit-screenshots/consistency');
const BASE = process.env.SIYA_PREVIEW_URL || 'http://127.0.0.1:8877';
const LOCAL_PREVIEW = /localhost|127\.0\.0\.1/.test(BASE);

const PAGES = [
  { id: 'answers-hub', path: '/answers' },
  { id: 'food-noise', path: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps' },
  { id: 'insulin', path: '/blog/insulin-resistance-and-weight-loss-clinician-overview' },
  { id: 'fatigue', path: '/blog/why-am-i-always-tired-causes-when-to-see-doctor' },
  { id: 'sleep-apnea', path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign' },
  { id: 'free-t', path: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know' },
].map((p) => ({
  ...p,
  path: LOCAL_PREVIEW && p.path !== '/answers' ? `${p.path}.html` : p.path === '/answers' ? '/answers/index.html' : p.path,
}));

const VIEWPORTS = [
  { id: '1440', width: 1440, height: 900 },
  { id: 'iphone15pro', width: 393, height: 852, deviceScaleFactor: 3, isMobile: true },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const notes = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor || 1,
      isMobile: !!vp.isMobile,
    });
    const page = await context.newPage();
    for (const p of PAGES) {
      await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(400);
      const dir = path.join(OUT, vp.id);
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${p.id}-full.png`);
      await page.screenshot({ path: file, fullPage: true });

      const reviewCount = await page.locator('aside.clinical-review').count();
      const midCta = await page.locator('.blog-cta--mid').count();
      notes.push({ vp: vp.id, page: p.id, reviewCount, midCta, file: file.replace(SITE_ROOT + '/', '') });
      console.log('OK', vp.id, p.id, 'reviews=', reviewCount);
    }
    await context.close();
  }
  await browser.close();

  const report = `# Consistency screenshot QA

Generated: ${new Date().toISOString()}
Base URL: ${BASE}
Output: \`docs/visual-audit-screenshots/consistency/\`

## Viewports

- Desktop: 1440×900
- Mobile: iPhone 15 Pro (393×852 @3x)

## Pages captured

${PAGES.map((p) => `- ${p.path}`).join('\n')}

## Automated checks (DOM at capture time)

| Viewport | Page | Review blocks | Mid CTAs |
|----------|------|---------------|----------|
${notes.map((n) => `| ${n.vp} | ${n.page} | ${n.reviewCount} | ${n.midCta} |`).join('\n')}

## Visual QA checklist

- [ ] No repeated review badges above the fold
- [ ] Health Guides hub: 3 balanced cards per category
- [ ] No CTA duplication clutter on mobile scroll
- [ ] Cornerstone blogs: single review strip, one final CTA band

## Files

${notes.map((n) => `- \`${n.file}\``).join('\n')}
`;

  fs.writeFileSync(path.join(SITE_ROOT, 'docs/CONSISTENCY-SCREENSHOT-QA.md'), report, 'utf8');
  console.log('Wrote docs/CONSISTENCY-SCREENSHOT-QA.md');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
