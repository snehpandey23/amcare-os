/**
 * Permanent guard: document never scrolls; headlines stay in the visible viewport.
 * Viewports: toolbar heights + tall phones. Engines: Chromium (+ WebKit when available).
 * Also samples mid-build, after address-bar resize, and after pause/next/back via evaluate.
 *
 * Usage: node internal/demo-qa/no-scroll-gate.mjs
 * Exit 1 on any failure.
 */
import { chromium as playwrightChromium, webkit as playwrightWebkit } from 'playwright';
import { withSilence } from './silence-audio.mjs';
const chromium = withSilence(playwrightChromium);
const webkit = withSilence(playwrightWebkit);
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(OUT, { recursive: true });
const HASH = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();

const VIEWS = [
  [390, 664],
  [393, 659],
  [375, 553],
  [390, 844],
  [360, 800],
];

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    const ext = path.extname(f);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' }[ext];
    res.writeHead(200, mime ? { 'Content-Type': mime } : undefined);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;

const failures = [];

function measure(page) {
  return page.evaluate(() => {
    const slide = document.querySelector('article.slide.active');
    const head = slide?.querySelector('.cap, .big, h2, .q2') || slide?.querySelector('.eyebrow');
    const frame = slide?.querySelector('.frame');
    const hr = head?.getBoundingClientRect();
    const fr = frame?.getBoundingClientRect();
    const vv = window.visualViewport;
    const visTop = vv ? vv.offsetTop : 0;
    const visBottom = vv ? vv.offsetTop + vv.height : innerHeight;
    const outs = [];
    if (slide) {
      for (const el of slide.querySelectorAll('.cap, .big, h2, .sub, .eyebrow, .q2')) {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) continue;
        if (el.classList.contains('out')) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.top < visTop - 1) outs.push({ el: el.className, top: r.top, why: 'above-visible' });
        /* Below: only fail if past the visual bottom (not merely under the translucent bar). */
        if (r.top < visBottom && r.bottom > visBottom + 8) outs.push({ el: el.className, bottom: r.bottom, why: 'below-visible' });
      }
    }
    return {
      id: slide?.id || '?',
      scrollY: window.scrollY,
      scrollTop: document.scrollingElement?.scrollTop || 0,
      headTop: hr ? hr.top : null,
      frameTop: fr ? fr.top : null,
      visTop,
      visBottom,
      transform: frame?.style.transform || '',
      align: slide ? getComputedStyle(slide).alignContent : null,
      outs: outs.slice(0, 6),
    };
  });
}

function checkMeas(m, meta) {
  const bad = [];
  if (m.scrollY) bad.push(`scrollY=${m.scrollY}`);
  if (m.scrollTop) bad.push(`scrollTop=${m.scrollTop}`);
  if (m.headTop != null && m.headTop < m.visTop - 0.5) bad.push(`headTop=${m.headTop.toFixed?.(1) ?? m.headTop}<visTop`);
  if (m.frameTop != null && m.frameTop < m.visTop - 2) bad.push(`frameTop=${m.frameTop.toFixed?.(1) ?? m.frameTop}<visTop`);
  if (m.outs?.length) bad.push(`clipped:${m.outs.map((o) => o.why).join('|')}`);
  if (bad.length) failures.push({ ...meta, id: m.id, bad, ...m });
}

async function runEngine(engine, label, views = VIEWS) {
  for (const [w, h] of views) {
    const browser = await engine.launch();
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      isMobile: true,
      hasTouch: true,
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
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll('#tour article.slide:not(.parked)')]
        .filter((s) => (s.dataset.surface || 'both') !== 'desk')
        .map((s) => s.id)
        .filter(Boolean),
    );
    for (const id of ids) {
      await page.evaluate((id) => window.__employerDemo.playSlideDeepLink(id, { playBuild: true }), id);
      for (const wait of [300, 1200, 2400]) {
        await page.waitForTimeout(wait === 300 ? 300 : 900);
        checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: `build-${wait}`, id });
      }
      await page.evaluate((id) => window.__employerDemo.showSlide(id), id);
      await page.waitForTimeout(220);
      checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'final', id });
      await page.setViewportSize({ width: w, height: Math.max(480, h - 72) });
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await page.waitForTimeout(220);
      checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'resize', id });
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await page.waitForTimeout(120);
      await page.evaluate(() => document.getElementById('pause')?.click());
      await page.waitForTimeout(100);
      checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'paused', id });
      await page.evaluate(() => document.getElementById('pause')?.click());
      await page.waitForTimeout(80);
      checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'playing', id });
      await page.evaluate(() => {
        document.querySelector('.bar')?.classList.remove('bar-hidden');
      });
      await page.waitForTimeout(80);
      checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'bar-shown', id });
      await page.evaluate(() => {
        document.querySelector('.bar')?.classList.add('bar-hidden');
        window.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(160);
      checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'bar-hidden', id });
      await page.evaluate(() => document.querySelector('.bar')?.classList.remove('bar-hidden'));
      // next/back once per viewport on a heavy slide only
      if (id === 'f-ways' || id === 'outcomes') {
        await page.evaluate(() => document.getElementById('next')?.click());
        await page.waitForTimeout(200);
        checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'after-next', id: 'nav' });
        await page.evaluate(() => document.getElementById('prev')?.click());
        await page.waitForTimeout(200);
        checkMeas(await measure(page), { engine: label, view: `${w}x${h}`, phase: 'after-back', id: 'nav' });
      }
    }
    await ctx.close();
    await browser.close();
  }
}

await runEngine(chromium, 'chromium', VIEWS);
try {
  await runEngine(webkit, 'webkit', [[390, 664], [375, 553], [393, 659]]);
} catch (e) {
  console.log('webkit skipped', String(e.message || e).slice(0, 120));
}

const report = { commit: HASH, failures: failures.length, sample: failures.slice(0, 80) };
fs.writeFileSync(path.join(OUT, 'no-scroll-gate.json'), JSON.stringify(report, null, 2));
const md = `# no-scroll + visible-top gate \`${HASH}\`

**Failures: ${failures.length}**

${failures.length ? failures.slice(0, 60).map((f) =>
  `- **${f.id}** @ ${f.view} [${f.engine}/${f.phase}]: ${f.bad?.join(', ')} (headTop=${f.headTop}, scrollY=${f.scrollY})`,
).join('\n') : '_Zero failures._'}
`;
fs.writeFileSync(path.join(OUT, 'no-scroll-gate.md'), md);
console.log(md);
console.log('FAILURES', failures.length);
await new Promise((r) => server.close(r));
process.exit(failures.length ? 1 : 0);
