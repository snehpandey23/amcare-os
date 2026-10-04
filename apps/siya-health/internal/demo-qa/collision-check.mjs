/**
 * Automated collision / edge / nowrap check for employer demo slides.
 * Uses getBoundingClientRect on every visible descendant (incl. absolute /
 * transformed nodes) and compares against the stage rect and control bar.
 *
 * Usage: node internal/demo-qa/collision-check.mjs [slideId ...]
 * Exit 1 if any failure.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(OUT, { recursive: true });
const HASH = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();

const VIEWS = [
  [1440, 900],
  [1366, 768],
  [390, 844],
  [360, 800],
];

const TEXT_SELECTOR = [
  'h2', '.cap', '.sub', '.eyebrow', '.q1', '.q2', '.big',
  '.hlab', '.body-cap', '.away-total', '.away-src', '.away-rx', '.away-row-lab',
  '.away-seg', '.away-siya-visit', '.away-ghost',
  '.hr-bub', '.hr-chat-top b',
  '.appt-callout', '.chk-row', '.chk-final', '.card-lite', '.prac', '.cpill',
  '.cond', '.spec', '.stress', '.app', '.app-row', '.me-node', '.siya-core',
  '.vm-row', '.vm-call', '.days .day.in:not(.out)', '.ph-day.in:not(.out)', '.ticker',
  '.cont-pair', '.panel-card', '.chart-card', '.priv-vault', '.priv-you',
].join(',');

/** Structural / absolute nodes that must stay inside stage + above the bar */
const STRUCT_SKIP = new Set([
  'SCRIPT', 'STYLE', 'LINK', 'META', 'BR', 'PATH', 'DEFS', 'STOP', 'LINEARGRADIENT',
]);

const DEFAULT_SLIDES = [
  'statement', 'p-familiar', 'p-time', 'p-away', 'p-response', 'p-whole', 'p-coord',
  'question', 'care-checklist', 'turn',
  'f-time', 'f-time-a', 'f-time-b', 'f-ways', 'f-response', 'f-urgent', 'f-whole',
  'employer', 'journey', 'baseline', 'outcomes', 'clinicians',
  'cost', 'privacy', 'proof', 'close',
];

const argSlides = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const CHECK_SLIDES = argSlides.length ? argSlides : DEFAULT_SLIDES;

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    const ext = path.extname(f);
    const mime = { '.html': 'text/html', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[ext];
    res.writeHead(200, mime ? { 'Content-Type': mime } : undefined);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const browser = await chromium.launch();

const slideIds = await (async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll('#tour article.slide:not(.parked)')].map((s) => s.id).filter(Boolean)
  );
  await ctx.close();
  return ids;
})();

const failures = [];

async function check(page, slideId, viewport) {
  return page.evaluate(({ TEXT_SELECTOR, STRUCT_SKIP, slideId, viewport }) => {
    const fails = [];
    const skip = new Set(STRUCT_SKIP);
    const bar = document.querySelector('.bar');
    const barBox = bar ? bar.getBoundingClientRect() : null;
    const barTop = barBox ? barBox.top : innerHeight;
    const stage = document.querySelector('.desk-canvas') || document.getElementById('tour');
    const stageBox = stage
      ? stage.getBoundingClientRect()
      : { left: 0, top: 0, right: innerWidth, bottom: innerHeight, width: innerWidth, height: innerHeight };
    const slide = document.querySelector('article.slide.active');
    if (!slide) return [{ slideId, viewport, type: 'no-active-slide' }];

    const visible = (el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) return false;
      if (el.classList.contains('out')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };

    const labelOf = (el) =>
      (el.className && String(el.className).split(/\s+/).filter(Boolean)[0]) || el.tagName;
    const textOf = (el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);

    /* ---- 1) Every visible descendant vs stage + bar (catches absolute/transform overflow) ---- */
    const descendants = [...slide.querySelectorAll('*')].filter((el) => {
      if (skip.has(el.tagName)) return false;
      return visible(el);
    });

    const pad = 2;
    const stageBottomCap = Math.min(stageBox.bottom, barTop);
    const overflowHits = [];
    for (const el of descendants) {
      const r = el.getBoundingClientRect();
      const underBar = r.bottom > barTop + pad;
      const pastStage =
        r.left < stageBox.left - pad ||
        r.right > stageBox.right + pad ||
        r.top < stageBox.top - pad ||
        r.bottom > stageBottomCap + pad;
      let barOverlap = false;
      let overlap = null;
      if (barBox) {
        const ox = Math.min(r.right, barBox.right) - Math.max(r.left, barBox.left);
        const oy = Math.min(r.bottom, barBox.bottom) - Math.max(r.top, barBox.top);
        if (ox > 4 && oy > 4) {
          barOverlap = true;
          overlap = { w: Math.round(ox), h: Math.round(oy) };
        }
      }
      if (underBar || pastStage || barOverlap) {
        overflowHits.push({ el, r, underBar, pastStage, barOverlap, overlap });
      }
    }
    // Keep outermost offenders only (skip descendants of another offender)
    const outermost = overflowHits.filter((hit, i) =>
      !overflowHits.some((other, j) => j !== i && other.el.contains(hit.el))
    );
    for (const hit of outermost) {
      const lab = labelOf(hit.el);
      const text = textOf(hit.el);
      if (hit.underBar || hit.barOverlap) {
        fails.push({
          slideId, viewport, type: hit.barOverlap ? 'bar-overlap' : 'under-bar',
          el: `${lab}:${text}`,
          bottom: Math.round(hit.r.bottom), barTop: Math.round(barTop),
          stageBottom: Math.round(stageBox.bottom),
          overlap: hit.overlap || undefined,
        });
      } else if (hit.pastStage) {
        fails.push({
          slideId, viewport, type: 'stage-overflow',
          el: `${lab}:${text}`,
          box: {
            l: Math.round(hit.r.left), t: Math.round(hit.r.top),
            r: Math.round(hit.r.right), b: Math.round(hit.r.bottom),
          },
        });
      }
    }

    /* ---- 2) Pairwise text/card collisions (named content) ---- */
    const nodes = [...slide.querySelectorAll(TEXT_SELECTOR)].filter(visible);
    const boxes = nodes.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        label: labelOf(el),
        text: textOf(el),
        r: { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
      };
    });

    const intersects = (a, b) =>
      !(a.right <= b.left + 1 || a.left >= b.right - 1 || a.bottom <= b.top + 1 || a.top >= b.bottom - 1);

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i], B = boxes[j];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        if (A.label === 'node' || B.label === 'node') continue;
        if (intersects(A.r, B.r)) {
          const ox = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
          const oy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
          if (ox > 4 && oy > 4) {
            fails.push({
              slideId, viewport, type: 'overlap',
              a: `${A.label}:${A.text}`, b: `${B.label}:${B.text}`,
            });
          }
        }
      }
    }

    /* ---- 3) nowrap wrap check ---- */
    for (const b of boxes) {
      const nowrap = b.el.closest('.cond, .spec, .away-seg, .away-siya-visit, .app-row b, .days .day, .ph-day, .eyebrow');
      if (nowrap && b.el.matches('.cond, .spec, .away-seg, .away-siya-visit, .days .day, .ph-day, .eyebrow, .app-row b')) {
        const st = getComputedStyle(b.el);
        if (st.whiteSpace === 'nowrap' || b.el.classList.contains('cond') || b.el.classList.contains('spec') || b.el.classList.contains('day') || b.el.classList.contains('ph-day') || b.el.classList.contains('eyebrow')) {
          const rects = [...b.el.getClientRects()];
          if (rects.length > 1) {
            fails.push({ slideId, viewport, type: 'wrapped-nowrap', el: `${b.label}:${b.text}`, lines: rects.length });
          }
        }
      }
    }

    /* ---- 4) Day / ph-day ticker: at most one visible ---- */
    for (const sel of ['.days .day', '.ph-date .ph-day']) {
      const days = [...slide.querySelectorAll(sel)].filter((el) => {
        const st = getComputedStyle(el);
        return el.classList.contains('in') && !el.classList.contains('out') && +st.opacity > 0.5;
      });
      if (days.length > 1) {
        fails.push({
          slideId, viewport, type: 'days-stacked', count: days.length,
          words: days.map((d) => d.textContent.trim()),
        });
      }
    }

    return fails;
  }, { TEXT_SELECTOR, STRUCT_SKIP: [...STRUCT_SKIP], slideId, viewport });
}

for (const [w, h] of VIEWS) {
  for (const id of CHECK_SLIDES) {
    if (!slideIds.includes(id)) continue;
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      isMobile: w < 500,
      hasTouch: w < 500,
    });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
    await page.evaluate(() => {
      document.getElementById('begin').hidden = true;
      document.documentElement.classList.add('welcome-live');
      document.getElementById('welcome').classList.remove('on');
      document.getElementById('tour').hidden = false;
      document.getElementById('tour').classList.add('on');
    });
    const surfaceOk = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el || el.classList.contains('parked')) return false;
      const phone = window.matchMedia('(max-width:640px)').matches;
      const surface = el.getAttribute('data-surface');
      if (surface === 'desk' && phone) return false;
      if (surface === 'phone' && !phone) return false;
      return true;
    }, id);
    if (!surfaceOk) {
      await ctx.close();
      continue;
    }
    try {
      await page.evaluate((id) => window.__employerDemo.showSlide(id), id);
    } catch (e) {
      failures.push({ slideId: id, viewport: `${w}x${h}`, type: 'missing-slide', err: String(e.message || e) });
      await ctx.close();
      continue;
    }
    const wait = (id === 'p-away' || id === 'p-coord' || id === 'f-time') ? 6500 : 4000;
    await page.waitForTimeout(wait);
    const f = await check(page, id, `${w}x${h}`);
    failures.push(...f);
    await ctx.close();
  }
}

const report = {
  commit: HASH,
  checked: CHECK_SLIDES.filter((id) => slideIds.includes(id)),
  views: VIEWS.map(([a, b]) => `${a}x${b}`),
  failures,
};
fs.writeFileSync(path.join(OUT, 'collision-report.json'), JSON.stringify(report, null, 2));

const lines = failures.length
  ? failures.slice(0, 120).map((f) =>
    `- **${f.slideId}** @ ${f.viewport}: ${f.type}` +
    `${f.a ? ` · ${f.a} × ${f.b}` : ''}` +
    `${f.el ? ` · ${f.el}` : ''}` +
    `${f.words ? ` · ${f.words.join('|')}` : ''}` +
    `${f.bottom != null ? ` · bottom=${f.bottom} bar=${f.barTop}` : ''}`
  ).join('\n')
  : '_Zero failures._';
fs.writeFileSync(
  path.join(OUT, 'collision-report.md'),
  `# Collision report \`${HASH}\`\n\nChecked: ${report.checked.join(', ')}\nViews: ${report.views.join(', ')}\n\n**Failures: ${failures.length}**\n\n${lines}\n`,
);

console.log('FAILURES', failures.length);
failures.slice(0, 60).forEach((f) => console.log(JSON.stringify(f)));
await browser.close();
server.close();
process.exit(failures.length ? 1 : 0);
