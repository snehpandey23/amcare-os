/**
 * Phase 2 QA screenshots for cornerstones + service pages.
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/visual-audit-screenshots/phase2');
const BASE = process.env.SIYA_PREVIEW_URL || 'http://127.0.0.1:8877';

const PAGES = [
  { id: 'food-noise', path: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps' },
  { id: 'insulin', path: '/blog/insulin-resistance-and-weight-loss-clinician-overview' },
  { id: 'fatigue', path: '/blog/why-am-i-always-tired-causes-when-to-see-doctor' },
  { id: 'free-t', path: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know' },
  { id: 'sleep-apnea', path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign' },
  { id: 'weight-loss-svc', path: '/weight-loss-metabolic-health' },
  { id: 'mens-health-svc', path: '/mens-health-longevity' },
  { id: 'telehealth-svc', path: '/telehealth' },
  { id: 'health-guides', path: '/answers/' },
];

const VIEWPORTS = [
  { id: '1440', width: 1440, height: 900 },
  { id: 'iphone15pro', width: 393, height: 852, deviceScaleFactor: 3, isMobile: true },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
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
      await page.screenshot({ path: path.join(dir, `${p.id}-full.png`), fullPage: true });
      console.log('OK', vp.id, p.id);
    }
    await context.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
