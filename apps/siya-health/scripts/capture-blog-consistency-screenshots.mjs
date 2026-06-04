/**
 * Blog consistency screenshot QA.
 */
import fs from 'fs';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/visual-audit-screenshots/blog-consistency');
const BASE = process.env.SIYA_PREVIEW_URL || 'http://127.0.0.1:8877';
const LOCAL = /localhost|127\.0\.0\.1/.test(BASE);

const PAGES = [
  { id: 'adhd-legacy', path: '/blog/adhd-symptoms-overlooked' },
  { id: 'glp1', path: '/blog/glp1-side-effects-and-how-to-manage-them' },
  { id: 'metabolic-cornerstone', path: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps' },
  { id: 'fatigue', path: '/blog/why-am-i-always-tired-causes-when-to-see-doctor' },
  { id: 'hormone', path: '/blog/when-is-testosterone-therapy-appropriate' },
].map((p) => ({
  ...p,
  path: LOCAL ? `${p.path}.html` : p.path,
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
      const ctaBandCount = await page.locator('div.cta-band').count();
      const related = await page.locator('section.related-health-guides').count();
      notes.push({
        vp: vp.id,
        page: p.id,
        reviewCount,
        ctaBandCount,
        related,
        file: file.replace(SITE_ROOT + '/', ''),
      });
      console.log('OK', vp.id, p.id, 'bands=', ctaBandCount, 'related=', related);
    }
    await context.close();
  }
  await browser.close();

  const report = `# Blog consistency screenshot QA

Generated: ${new Date().toISOString()}
Base URL: ${BASE}

## Pages

${PAGES.map((p) => `- ${p.path}`).join('\n')}

## DOM checks

| Viewport | Page | Review blocks | CTA bands | Related guides |
|----------|------|---------------|-----------|----------------|
${notes.map((n) => `| ${n.vp} | ${n.page} | ${n.reviewCount} | ${n.ctaBandCount} | ${n.related} |`).join('\n')}

## Visual checklist

- [ ] Single final CTA band visible at bottom
- [ ] Related Health Guides section present above exit CTA
- [ ] No duplicate provider CTA clutter
- [ ] Mobile scroll: one clear conversion path

## Screenshots

${notes.map((n) => `- \`${n.file}\``).join('\n')}
`;

  fs.writeFileSync(path.join(SITE_ROOT, 'docs/BLOG-CONSISTENCY-SCREENSHOT-QA.md'), report, 'utf8');
  console.log('Wrote docs/BLOG-CONSISTENCY-SCREENSHOT-QA.md');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
