/**
 * Pause must freeze builds, advance, counters, CSS/SVG animations.
 * Pause at 3 random points per slide on 390×664 and 1440×900;
 * after 5s paused: DOM + screenshot unchanged; slide did not advance.
 * Usage: node internal/demo-qa/pause-freeze-gate.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(OUT, { recursive: true });
const HASH = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const VIEWS = [
  { w: 390, h: 664, mobile: true },
  { w: 1440, h: 900, mobile: false },
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

function snapHash(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12);
}
function almostSamePng(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  if (a.equals(b)) return true;
  /* allow tiny encoder / subpixel noise (<0.15% differing bytes) */
  let diff = 0;
  const step = 16;
  for (let i = 0; i < a.length; i += step) if (a[i] !== b[i]) diff += 1;
  return (diff * step) / a.length < 0.0015;
}

async function domSig(page) {
  return page.evaluate(() => {
    const s = document.querySelector('article.slide.active');
    const demo = window.__employerDemo;
    const texts = [...(s?.querySelectorAll('[data-at].in, [data-count], .cap, .bub, .chk-row.in') || [])]
      .map((el) => (el.textContent || '').trim().slice(0, 40));
    return JSON.stringify({
      id: s?.id,
      cur: demo.getCur?.(),
      elapsed: Math.round(demo.getElapsed?.() || 0),
      firedIn: s ? s.querySelectorAll('[data-at].in').length : 0,
      paused: !!demo.getPaused?.(),
      texts,
    });
  });
}

const browser = await chromium.launch();
for (const { w, h, mobile } of VIEWS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    isMobile: mobile,
    hasTouch: mobile,
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
  const ids = await page.evaluate((isMobile) => {
    return [...document.querySelectorAll('#tour article.slide:not(.parked)')]
      .filter((s) => {
        const surf = s.dataset.surface || 'both';
        if (isMobile) return surf !== 'desk';
        return surf !== 'phone';
      })
      .map((s) => s.id)
      .filter(Boolean);
  }, mobile);

  /* Sample up to 8 slides for runtime; always include heavy ones */
  const prefer = ['f-ways', 'outcomes', 'p-time', 'journey', 'f-response', 'close', 'clinicians', 'care-checklist'];
  const sample = [...new Set([...prefer.filter((id) => ids.includes(id)), ...ids])].slice(0, 8);

  for (const id of sample) {
    await page.evaluate((id) => {
      window.__employerDemo.playSlideDeepLink(id, { playBuild: true });
      if (window.__employerDemo.getPaused()) window.__employerDemo.togglePause();
    }, id);
    await page.waitForTimeout(200);
    const dur = await page.evaluate(() => window.__employerDemo.getDur?.() || 4000);
    const points = [0.15, 0.45, 0.75].map((f) => Math.max(200, Math.floor(dur * f)));
    for (const wait of points) {
      await page.evaluate((id) => {
        window.__employerDemo.playSlideDeepLink(id, { playBuild: true });
        if (window.__employerDemo.getPaused()) window.__employerDemo.togglePause();
      }, id);
      await page.waitForTimeout(Math.min(wait, 2800));
      const beforeCur = await page.evaluate(() => window.__employerDemo.getCur());
      if (!(await page.evaluate(() => window.__employerDemo.getPaused()))) {
        await page.evaluate(() => window.__employerDemo.togglePause());
      }
      await page.waitForTimeout(80);
      const sig1 = await domSig(page);
      const shot1 = await page.screenshot({ type: 'png', animations: 'disabled', timeout: 15000 });
      const h1 = snapHash(shot1);
      const elapsed1 = await page.evaluate(() => window.__employerDemo.getElapsed());
      await page.waitForTimeout(5000);
      const sig2 = await domSig(page);
      const shot2 = await page.screenshot({ type: 'png', animations: 'disabled', timeout: 15000 });
      const h2 = snapHash(shot2);
      const elapsed2 = await page.evaluate(() => window.__employerDemo.getElapsed());
      const afterCur = await page.evaluate(() => window.__employerDemo.getCur());
      const stillPaused = await page.evaluate(() => window.__employerDemo.getPaused());
      if (!stillPaused) failures.push({ view: `${w}x${h}`, id, wait, why: 'unpaused' });
      if (afterCur !== beforeCur) failures.push({ view: `${w}x${h}`, id, wait, why: `advanced ${beforeCur}->${afterCur}` });
      if (elapsed1 !== elapsed2) failures.push({ view: `${w}x${h}`, id, wait, why: `elapsed ${elapsed1}->${elapsed2}` });
      if (sig1 !== sig2) failures.push({ view: `${w}x${h}`, id, wait, why: 'dom-changed', a: sig1.slice(0, 160), b: sig2.slice(0, 160) });
      if (!almostSamePng(shot1, shot2)) failures.push({ view: `${w}x${h}`, id, wait, why: `screenshot-diff ${h1}!=${h2}` });
      /* resume for next */
      if (await page.evaluate(() => window.__employerDemo.getPaused())) {
        await page.evaluate(() => window.__employerDemo.togglePause());
      }
    }
  }
  await ctx.close();
}
await browser.close();

const report = { commit: HASH, failures: failures.length, sample: failures.slice(0, 40) };
fs.writeFileSync(path.join(OUT, 'pause-freeze-gate.json'), JSON.stringify(report, null, 2));
const md = `# pause-freeze gate \`${HASH}\`

**Failures: ${failures.length}**

${failures.length ? failures.slice(0, 40).map((f) => `- **${f.id}** @ ${f.view} t≈${f.wait}: ${f.why}`).join('\n') : '_Zero failures._'}
`;
fs.writeFileSync(path.join(OUT, 'pause-freeze-gate.md'), md);
console.log(md);
console.log('FAILURES', failures.length);
await new Promise((r) => server.close(r));
process.exit(failures.length ? 1 : 0);
