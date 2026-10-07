/**
 * Capture a static Letter-sized freeze of the homepage2 motion background
 * for /employers/one-pager print (browsers drop CSS backgrounds when printing).
 *
 * Usage (from monorepo root or apps/siya-health):
 *   npx tsx apps/siya-health/scripts/capture-onepager-bg.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(SITE_ROOT, 'print');

/** Letter at 96dpi CSS px */
const CSS_W = 816;
const CSS_H = 1056;
const SCALE = 3;

/**
 * Homepage2 SVG (from partials/homepage2-bg.mjs), print-tuned:
 * lower stop-opacity / stroke so text cards stay WCAG-safe on cream.
 */
const BG_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="presentation">
  <defs>
    <linearGradient id="siyaHeroCream" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4EFE7"/>
      <stop offset="55%" stop-color="#E8EEF8"/>
      <stop offset="100%" stop-color="#F7F2EC"/>
    </linearGradient>
    <radialGradient id="siyaHeroGlowA" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D81088" stop-opacity="0.18"/>
      <stop offset="45%" stop-color="#D81088" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#D81088" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="siyaHeroGlowB" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#001878" stop-opacity="0.14"/>
      <stop offset="50%" stop-color="#0A246B" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#001878" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="siyaHeroGlowC" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7B2D8E" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="#0A246B" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#0A246B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#siyaHeroCream)"/>
  <g>
    <circle cx="240" cy="220" r="190" fill="url(#siyaHeroGlowA)"/>
    <circle cx="240" cy="220" r="88" fill="none" stroke="#D81088" stroke-width="2.75" stroke-opacity="0.28"/>
    <circle cx="240" cy="220" r="132" fill="none" stroke="#D81088" stroke-width="1.6" stroke-opacity="0.18"/>
  </g>
  <g>
    <circle cx="940" cy="500" r="230" fill="url(#siyaHeroGlowB)"/>
    <circle cx="940" cy="500" r="108" fill="none" stroke="#001878" stroke-width="2.75" stroke-opacity="0.26"/>
    <circle cx="940" cy="500" r="156" fill="none" stroke="#0A246B" stroke-width="1.6" stroke-opacity="0.16"/>
  </g>
  <g>
    <circle cx="700" cy="150" r="160" fill="url(#siyaHeroGlowC)"/>
    <circle cx="700" cy="150" r="72" fill="none" stroke="#7B2D8E" stroke-width="2.5" stroke-opacity="0.24"/>
    <circle cx="700" cy="150" r="112" fill="none" stroke="#D81088" stroke-width="1.5" stroke-opacity="0.16"/>
  </g>
  <g>
    <circle cx="130" cy="680" r="150" fill="url(#siyaHeroGlowB)"/>
    <circle cx="130" cy="680" r="70" fill="none" stroke="#001878" stroke-width="2.25" stroke-opacity="0.22"/>
    <circle cx="1080" cy="110" r="120" fill="url(#siyaHeroGlowA)"/>
    <circle cx="1080" cy="110" r="58" fill="none" stroke="#D81088" stroke-width="2.25" stroke-opacity="0.22"/>
  </g>
  <g>
    <path d="M40 620 C 220 500, 380 700, 560 560 S 900 480, 1180 380" fill="none" stroke="#D81088" stroke-width="2.75" stroke-linecap="round" stroke-opacity="0.22"/>
    <path d="M20 300 C 200 380, 360 180, 540 280 S 840 360, 1160 200" fill="none" stroke="#001878" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.2"/>
    <path d="M60 740 C 300 660, 480 780, 700 680 S 980 620, 1180 540" fill="none" stroke="#C4A574" stroke-width="2.25" stroke-linecap="round" stroke-opacity="0.22"/>
  </g>
</svg>
`;

const CAPTURE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    html, body { margin: 0; width: ${CSS_W}px; height: ${CSS_H}px; overflow: hidden; background: #F4EFE7; }
    .stage { width: ${CSS_W}px; height: ${CSS_H}px; position: relative; }
    .stage svg {
      position: absolute; inset: 0; width: 100%; height: 100%;
      display: block;
    }
    /* Freeze any inherited motion */
    * { animation: none !important; transition: none !important; }
  </style>
</head>
<body>
  <div class="stage" id="stage">${BG_SVG.replace('<?xml version="1.0" encoding="UTF-8"?>', '')}</div>
</body>
</html>`;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svgPath = path.join(OUT_DIR, 'onepager-bg.svg');
  const pngPath = path.join(OUT_DIR, 'onepager-bg.png');
  const webpPath = path.join(OUT_DIR, 'onepager-bg.webp');

  fs.writeFileSync(svgPath, BG_SVG, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: CSS_W, height: CSS_H },
    deviceScaleFactor: SCALE,
  });
  await page.setContent(CAPTURE_HTML, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      const s = (el as HTMLElement).style;
      if (s) {
        s.animationPlayState = 'paused';
        s.animationDelay = '-12s';
      }
    });
  });
  await page.locator('#stage').screenshot({ path: pngPath, type: 'png' });
  await browser.close();

  await sharp(pngPath).webp({ quality: 88 }).toFile(webpPath);

  const meta = await sharp(pngPath).metadata();
  console.log('Wrote', svgPath);
  console.log('Wrote', pngPath, `${meta.width}x${meta.height}`);
  console.log('Wrote', webpPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
