/**
 * __slideSettled.gen must increase within 1500ms on every slide-change path.
 * Read gen before the action. Slides: p-time, e1-time, care-checklist.
 * Sound on and off, paused and playing. Desktop 1440×900 and phone 390×664.
 *
 * Usage: node internal/demo-qa/settle-signal-gate.mjs
 */
import { chromium as playwrightChromium } from 'playwright';
import { withSilence } from './silence-audio.mjs';
const chromium = withSilence(playwrightChromium);
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { waitForLoad, logLoad } from './load-guard.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(OUT, { recursive: true });
const HASH = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const VIEWS = [
  { w: 1440, h: 900, mobile: false },
  { w: 390, h: 664, mobile: true },
];
const SLIDES = ['p-time', 'e1-time', 'care-checklist'];
const PATHS = ['showSlide', 'playSlideDeepLink', 'next', 'prev', 'resize', 'orientation', 'fit', 'speed'];

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const failures = [];

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

async function prep(page) {
  await page.addInitScript({ content: TRACE });
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  await page.evaluate(() => {
    document.getElementById('begin').hidden = true;
    document.documentElement.classList.add('welcome-live');
    document.getElementById('welcome').classList.remove('on');
    document.getElementById('tour').hidden = false;
    document.getElementById('tour').classList.add('on');
  });
}

async function gen(page) {
  return page.evaluate(() => window.__slideSettled?.gen || 0);
}

/** Wait until gen has increased and then stayed still, so the next read is the baseline. */
async function waitQuiet(page, before) {
  const start = Date.now();
  let last = before;
  let changedAt = 0;
  while (Date.now() - start < 1500) {
    const g = await gen(page);
    if (g !== last) {
      last = g;
      changedAt = Date.now();
    }
    if (g > before && changedAt && Date.now() - changedAt >= 200) return g;
    await page.waitForTimeout(30);
  }
  return last;
}

await waitForLoad('settle');
const browser = await chromium.launch();
for (const view of VIEWS) {
  const ctx = await browser.newContext({
    viewport: { width: view.w, height: view.h },
    isMobile: view.mobile,
    hasTouch: view.mobile,
  });
  const page = await ctx.newPage();
  await prep(page);
  for (const id of SLIDES) {
    for (const soundOn of [true, false]) {
      for (const playing of [true, false]) {
        for (const pathName of PATHS) {
          const label = `${view.w}x${view.h} ${id} sound-${soundOn ? 'on' : 'off'} ${playing ? 'playing' : 'paused'} ${pathName}`;
          const armedBefore = await gen(page);
          await page.evaluate(({ id, soundOn, playing }) => {
            const demo = window.__employerDemo;
            const muteBtn = document.getElementById('muteTour') || document.getElementById('mute');
            const isMuted = muteBtn && muteBtn.getAttribute('aria-pressed') === 'true';
            if (isMuted === soundOn) muteBtn.click();
            if (playing) demo.playSlideDeepLink(id, { playBuild: true });
            else demo.showSlide(id);
            if (demo.getPaused() === playing) demo.togglePause();
          }, { id, soundOn, playing });
          const armed = await waitQuiet(page, armedBefore);
          if (armed <= armedBefore) {
            failures.push(`${label} arm did not settle (${armedBefore})`);
            continue;
          }
          const before = await gen(page);
          if (pathName === 'resize') {
            await page.setViewportSize({ width: view.w, height: Math.max(480, view.h - 40) });
          }
          await page.evaluate((pathName) => {
            const demo = window.__employerDemo;
            if (pathName === 'showSlide') {
              const id = document.querySelector('article.slide.active')?.id;
              demo.showSlide(id);
            } else if (pathName === 'playSlideDeepLink') {
              const id = document.querySelector('article.slide.active')?.id;
              demo.playSlideDeepLink(id, { playBuild: true });
            } else if (pathName === 'next') {
              document.getElementById('next')?.click();
            } else if (pathName === 'prev') {
              document.getElementById('prev')?.click();
            } else if (pathName === 'resize') {
              window.dispatchEvent(new Event('resize'));
            } else if (pathName === 'orientation') {
              window.dispatchEvent(new Event('orientationchange'));
            } else if (pathName === 'fit') {
              if (!demo.getPaused()) demo.togglePause();
              demo.scheduleSettle();
            } else if (pathName === 'speed') {
              const cur = demo.getPlaySpeed();
              demo.setPlaySpeed(cur === 1 ? 1.5 : 1);
            }
          }, pathName);
          if (pathName === 'resize') {
            await page.setViewportSize({ width: view.w, height: view.h });
          }
          try {
            await page.waitForFunction((n) => (window.__slideSettled?.gen || 0) > n, before, { timeout: 1500 });
          } catch (e) {
            const now = await gen(page);
            failures.push(`${label} gen ${before} -> ${now}`);
            const trace = await page.evaluate(() => ({
              tx: window.__employerDemo && window.__employerDemo.getTx(),
              visits: (window.__settleVisits || []).length,
              events: window.__settleTrace || [],
            }));
            const settles = trace.events.filter((ev) => ev.kind === 'settle').slice(-10);
            console.log('SETTLE_TRACE', JSON.stringify({ label, before, now, tx: trace.tx, visits: trace.visits, settles, events: trace.events.slice(-24) }));
          }
        }
      }
    }
  }
  await ctx.close();
}
await browser.close();
logLoad('settle end');
await new Promise((r) => server.close(r));

const report = { commit: HASH, failures: failures.length, sample: failures.slice(0, 40) };
fs.writeFileSync(path.join(OUT, 'settle-signal-gate.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, 'settle-signal-gate.md'), `# settle-signal gate \`${HASH}\`\n\n**Failures: ${failures.length}**\n\n${failures.length ? failures.slice(0, 40).map((f) => `- ${f}`).join('\n') : '_Zero failures._'}\n`);
console.log('FAILURES', failures.length);
failures.slice(0, 20).forEach((f) => console.log(' -', f));
process.exit(failures.length ? 1 : 0);
