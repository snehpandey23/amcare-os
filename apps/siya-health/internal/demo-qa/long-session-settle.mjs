/**
 * One phone page, sound on, every slide twice, no reload.
 * Looks for the settle generation sticking after a long session.
 * Not part of the release gate.
 *
 * Usage: node internal/demo-qa/long-session-settle.mjs
 */
import { chromium } from 'playwright';
import { MUTE_SPEAKERS } from './mute-speakers.mjs';
import { waitForLoad, logLoad } from './load-guard.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TRACE = `(() => {
  const log = [];
  const visits = [];
  window.__settleTrace = log;
  window.__settleVisits = visits;
  const mark = (kind, extra) => {
    log.push(Object.assign({ kind, t: Math.round(performance.now()) }, extra || {}));
    if (log.length > 80) log.shift();
  };
  let box = window.__slideSettled;
  Object.defineProperty(window, '__slideSettled', {
    configurable: true,
    get() { return box; },
    set(v) {
      box = v;
      mark('settle', { gen: v && v.gen, id: v && v.id });
      if (v && v.id && visits[visits.length - 1] !== v.id) visits.push(v.id);
    },
  });
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('#next,#prev');
    if (b) mark(b.id);
  }, true);
  document.addEventListener('transitionend', (e) => {
    const art = e.target && e.target.closest && e.target.closest('article.slide');
    if (!art || e.propertyName !== 'opacity') return;
    mark('transitionend', { id: art.id });
  }, true);
  let edgeN = 0;
  setInterval(() => {
    const edges = window.__voEdges || [];
    for (let i = edgeN; i < edges.length; i++) mark('clip', { clip: edges[i].kind, id: edges[i].id });
    edgeN = edges.length;
  }, 100);
})();`;

function mime(ext) {
  return {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.webp': 'image/webp', '.mp3': 'audio/mpeg',
  }[ext] || 'application/octet-stream';
}

const server = await new Promise((resolve) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { 'Content-Type': mime(path.extname(f)) });
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => resolve(s));
});
const port = server.address().port;

await waitForLoad('long-session-settle');
const browser = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.addInitScript({ content: MUTE_SPEAKERS });
await page.addInitScript({ content: TRACE });
await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
const ids = await page.evaluate(() => {
  document.getElementById('begin').hidden = true;
  document.documentElement.classList.add('welcome-live');
  document.getElementById('welcome').classList.remove('on');
  document.getElementById('tour').hidden = false;
  document.getElementById('tour').classList.add('on');
  const phone = window.__employerDemo.isPhoneLayout();
  return [...document.querySelectorAll('#tour .slide:not(.parked)')].filter((s) => {
    const surf = s.dataset.surface || 'both';
    if (surf === 'phone') return phone;
    if (surf === 'desk') return !phone;
    return true;
  }).map((s) => s.id);
});

const failures = [];
for (let pass = 1; pass <= 2; pass++) {
  for (const id of ids) {
    const beforeArm = await page.evaluate(() => window.__slideSettled?.gen || 0);
    await page.evaluate((slideId) => {
      const demo = window.__employerDemo;
      const muteBtn = document.getElementById('muteTour') || document.getElementById('mute');
      if (muteBtn && muteBtn.getAttribute('aria-pressed') === 'true') muteBtn.click();
      demo.playSlideDeepLink(slideId, { playBuild: true });
      if (demo.getPaused()) demo.togglePause();
    }, id);
    try {
      await page.waitForFunction((n) => (window.__slideSettled?.gen || 0) > n, beforeArm, { timeout: 4000 });
    } catch {
      failures.push(`pass ${pass} ${id} arm stuck`);
    }
    const before = await page.evaluate(() => window.__slideSettled?.gen || 0);
    await page.evaluate(() => document.getElementById('next')?.click());
    try {
      await page.waitForFunction((n) => (window.__slideSettled?.gen || 0) > n, before, { timeout: 1500 });
    } catch {
      const trace = await page.evaluate(() => ({
        tx: window.__employerDemo.getTx(),
        visits: (window.__settleVisits || []).length,
        events: window.__settleTrace || [],
      }));
      failures.push(`pass ${pass} ${id} next gen ${before}`);
      console.log('SETTLE_TRACE', JSON.stringify({
        pass, id, before, tx: trace.tx, visits: trace.visits,
        settles: trace.events.filter((ev) => ev.kind === 'settle').slice(-10),
        events: trace.events.slice(-24),
      }));
    }
  }
}

await browser.close();
logLoad('long-session-settle end');
await new Promise((r) => server.close(r));
console.log('SLIDES', ids.length, 'FAILURES', failures.length);
failures.slice(0, 20).forEach((f) => console.log(' -', f));
process.exit(failures.length ? 1 : 0);
