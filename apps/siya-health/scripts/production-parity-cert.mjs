/**
 * Production parity certification — live https://www.siya.health
 * Run: node scripts/production-parity-cert.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(__dirname, '..', 'docs');
const BASE = 'https://www.siya.health';
const TARGET_STATES = 'California • Texas • Pennsylvania • Florida';
const TARGET_STATES_INLINE = 'California, Texas, Pennsylvania, and Florida';

const TIER1 = [
  '/answers/poor-sleep-feels-like-adhd',
  '/answers/brain-fog-after-eating',
];

const SAMPLE_BLOGS = [
  '/blog/adhd-symptoms-overlooked',
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  '/blog/glp1-side-effects-and-how-to-manage-them',
];

const SAMPLE_GUIDES = [
  '/answers/signs-of-adult-adhd',
  '/answers/what-is-insulin-resistance',
];

const HUBS = ['/', '/answers', '/blog', '/adhd-care', '/telehealth'];

const checks = [];

function record(id, pass, detail, url = '') {
  checks.push({ id, pass, detail, url });
}

async function probe(page, urlPath) {
  const url = BASE + urlPath;
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(800);
  const status = resp?.status() ?? 0;
  const data = await page.evaluate(
    ({ urlPath, targetBullet, targetInline }) => {
      const review = document.querySelectorAll('aside.clinical-review').length;
      const ctaBands = document.querySelectorAll('div.cta-band').length;
      const schedule = [...document.querySelectorAll('a,button')].filter((e) =>
        /schedule meet/i.test(e.textContent || ''),
      ).length;
      const book = [...document.querySelectorAll('a,button')].filter((e) =>
        /book a meet/i.test(e.textContent || ''),
      ).length;
      const body = document.body.innerText;
      const navAnswers = [...document.querySelectorAll('nav a, .nav-mobile a')].some((a) =>
        /health guides/i.test(a.textContent) && a.getAttribute('href')?.includes('/answers'),
      );
      const hasCA = /California/.test(body);
      const hasBullet = body.includes(targetBullet);
      const hasInline = body.includes(targetInline);
      const broken = [...document.querySelectorAll('img')]
        .filter((i) => i.src && !i.src.startsWith('data:') && i.complete && i.naturalWidth === 0)
        .length;
      return {
        review,
        ctaBands,
        schedule,
        book,
        hasCA,
        hasBullet,
        hasInline,
        navAnswers,
        broken,
        isHub: ['/', '/answers', '/blog'].includes(urlPath) || urlPath === '/answers' || urlPath === '/blog',
        isBlog: urlPath.startsWith('/blog/') && urlPath !== '/blog',
        isGuide: urlPath.startsWith('/answers/'),
      };
    },
    { urlPath, targetBullet: TARGET_STATES, targetInline: TARGET_STATES_INLINE },
  );
  return { ...data, status };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const p of TIER1) {
    const d = await probe(page, p);
    record(
      `404-${p}`,
      d.status === 200,
      `HTTP ${d.status}`,
      BASE + p,
    );
  }

  for (const p of SAMPLE_BLOGS) {
    const d = await probe(page, p);
    record(`review-blog-${p}`, d.review === 1, `${d.review} clinical-review blocks`, BASE + p);
    record(`cta-blog-${p}`, d.ctaBands <= 1, `${d.ctaBands} cta-band blocks`, BASE + p);
    record(`schedule-blog-${p}`, d.schedule === 0, `${d.schedule} Schedule Meet CTAs`, BASE + p);
    record(`book-blog-${p}`, d.book >= 1, `${d.book} Book a Meet CTAs`, BASE + p);
  }

  for (const p of SAMPLE_GUIDES) {
    const d = await probe(page, p);
    record(`review-guide-${p}`, d.review === 1, `${d.review} clinical-review blocks`, BASE + p);
  }

  for (const p of HUBS) {
    const d = await probe(page, p);
    record(`review-hub-${p}`, d.review === 0, `${d.review} clinical-review on hub`, BASE + p);
    if (p === '/' || p === '/adhd-care') {
      record(`states-${p}`, d.hasCA && (d.hasInline || d.hasBullet), `CA=${d.hasCA} inline=${d.hasInline} bullet=${d.hasBullet}`, BASE + p);
      record(`book-${p}`, d.book >= 1, `${d.book} Book a Meet CTAs`, BASE + p);
      record(`schedule-${p}`, d.schedule === 0, `${d.schedule} Schedule Meet CTAs`, BASE + p);
    }
    if (p === '/' || p === '/answers' || p === '/blog') {
      record(`nav-guides-${p}`, d.navAnswers, 'Health Guides in nav', BASE + p);
    }
  }

  await browser.close();

  const failed = checks.filter((c) => !c.pass);
  const pass = failed.length === 0;

  let md = `# Production parity certification

**Site:** ${BASE}  
**Branch target:** \`main\` (latest audited parity sprint)  
**Certified at:** ${new Date().toISOString()}  
**Overall:** ${pass ? '**PASS**' : '**FAIL**'}

Target state display: \`${TARGET_STATES}\` or prose \`${TARGET_STATES_INLINE}\`

## Success criteria

| Criterion | Result |
|-----------|--------|
| Tier-1 guides HTTP 200 | ${checks.filter((c) => c.id.startsWith('404-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| 1 review per blog (sample) | ${checks.filter((c) => c.id.startsWith('review-blog-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| 1 review per Health Guide (sample) | ${checks.filter((c) => c.id.startsWith('review-guide-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| 0 review on hubs (sample) | ${checks.filter((c) => c.id.startsWith('review-hub-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| ≤1 cta-band per blog (sample) | ${checks.filter((c) => c.id.startsWith('cta-blog-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| 0 Schedule Meet & Greet | ${checks.filter((c) => c.id.startsWith('schedule-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| Book a Meet & Greet present | ${checks.filter((c) => c.id.startsWith('book-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| California in state lists | ${checks.filter((c) => c.id.startsWith('states-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |
| Health Guides in navigation | ${checks.filter((c) => c.id.startsWith('nav-guides-')).every((c) => c.pass) ? 'PASS' : 'FAIL'} |

## Check log

| Check | Pass | URL | Detail |
|-------|:----:|-----|--------|
${checks.map((c) => `| ${c.id} | ${c.pass ? '✓' : '✗'} | ${c.url || '—'} | ${c.detail} |`).join('\n')}

`;

  if (!pass) {
    md += `## Failures (${failed.length})

${failed.map((f) => `- **${f.id}** (${f.url || 'n/a'}): ${f.detail}`).join('\n')}

## Remediation

1. \`cd apps/siya-health && npm run consistency:apply && npm run blog:consistency:apply && npm run build\`
2. Commit, merge to \`main\`, push (Vercel Git deploy)
3. Re-run: \`node scripts/production-parity-cert.mjs\`

`;
  } else {
    md += `## Notes

Production matches audited branch for all sampled gates. Full-site visual audit: \`node scripts/production-visual-audit.mjs\`.

`;
  }

  fs.writeFileSync(path.join(DOCS, 'PRODUCTION-PARITY-CERTIFICATION.md'), md, 'utf8');
  console.log(pass ? 'PASS' : 'FAIL', `— wrote PRODUCTION-PARITY-CERTIFICATION.md (${failed.length} failures)`);
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
