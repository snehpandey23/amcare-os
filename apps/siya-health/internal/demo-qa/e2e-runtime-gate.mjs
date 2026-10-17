/**
 * Full sound-on play-through at 1×.
 * Wall time from the first slide's start to the close slide must be within +2% of 225660 ms.
 * The longest gap between one clip ending and the next clip starting must be ≤ 700 ms.
 */
import { chromium, webkit, devices } from 'playwright';
import { MUTE_SPEAKERS } from './mute-speakers.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET = 225660;
const MAX_WALL = TARGET * 1.02;
const MIN_WALL = TARGET * 0.98;
const MAX_GAP = 700;
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const failures = [];
const rows = [];

async function playThrough(label, browserType, contextOptions) {
  const browser = label === 'webkit-iphone13'
    ? await browserType.launch()
    : await browserType.launch({ args: ['--mute-audio'] });
  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
  await page.addInitScript({ content: MUTE_SPEAKERS });
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  await page.click('#beginBtn');
  const sample = await page.evaluate(async ({ maxWall }) => {
    const demo = window.__employerDemo;
    window.__voEdges = [];
    demo.setPlaySpeed(1);
    demo.setCaptions(false);
    const gen0 = window.__slideStarted ? window.__slideStarted.gen : 0;
    demo.playSlideDeepLink('statement');
    const waitCap = performance.now() + 8000;
    while ((window.__slideStarted ? window.__slideStarted.gen : 0) === gen0 && performance.now() < waitCap) {
      await new Promise((r) => setTimeout(r, 20));
    }
    const started = window.__slideStarted && window.__slideStarted.gen !== gen0;
    const t0 = started ? window.__slideStarted.t : performance.now();
    const limit = maxWall + 15000;
    let arrived = false;
    while (performance.now() - t0 < limit) {
      const close = document.getElementById('close');
      if (close && close.classList.contains('active')) { arrived = true; break; }
      await new Promise((r) => setTimeout(r, 40));
    }
    const wall = performance.now() - t0;
    const edges = window.__voEdges || [];
    let maxGap = 0;
    let pair = '';
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].kind !== 'end') continue;
      let nxt = null;
      for (let j = i + 1; j < edges.length; j++) {
        if (edges[j].kind === 'start') { nxt = edges[j]; break; }
      }
      if (!nxt) continue;
      const gap = nxt.t - edges[i].t;
      if (gap > maxGap) { maxGap = gap; pair = edges[i].id + '→' + nxt.id; }
    }
    const t0edge = edges.length ? edges[0].t : 0;
    const log = edges.map((e) => ({ kind: e.kind, id: e.id, t: Math.round(e.t - t0edge) }));
    const open = [];
    const seen = {};
    const violations = [];
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (e.kind === 'start') {
        if (open.length) violations.push(`overlap ${open.join('+')} still open when ${e.id} starts`);
        if (seen[e.id]) violations.push(`replay ${e.id}`);
        seen[e.id] = (seen[e.id] || 0) + 1;
        const prevEnd = [...edges.slice(0, i)].reverse().find((x) => x.kind === 'end');
        if (prevEnd && e.t < prevEnd.t) violations.push(`${prevEnd.id} still audible after ${e.id} starts`);
        open.push(e.id);
      } else if (e.kind === 'end') {
        if (open[open.length - 1] !== e.id) violations.push(`end ${e.id} while open ${open.join('+') || 'none'}`);
        else open.pop();
      }
    }
    return {
      started,
      arrived,
      wall,
      maxGap,
      pair,
      starts: edges.filter((e) => e.kind === 'start').length,
      ends: edges.filter((e) => e.kind === 'end').length,
      last: document.querySelector('article.slide.active')?.id || '',
      log,
      violations,
    };
  }, { maxWall: MAX_WALL });
  await browser.close();
  rows.push({ label, ...sample });
  console.log(`${label} wall ${Math.round(sample.wall)} gap ${Math.round(sample.maxGap)} ${sample.pair} starts ${sample.starts} ends ${sample.ends} last ${sample.last}`);
  for (const e of sample.log || []) console.log(`  ${label} ${e.kind} ${e.id} t=${e.t}`);
  for (const v of sample.violations || []) console.log(`  ${label} VIOLATION ${v}`);
  if (!sample.started) failures.push(`${label} first slide did not start`);
  if (!sample.arrived) failures.push(`${label} did not reach close (last ${sample.last})`);
  if (sample.wall > MAX_WALL || sample.wall < MIN_WALL) {
    failures.push(`${label} wall ${Math.round(sample.wall)}ms outside ${Math.round(MIN_WALL)}–${Math.round(MAX_WALL)}`);
  }
  if (sample.maxGap > MAX_GAP) failures.push(`${label} gap ${Math.round(sample.maxGap)}ms ${sample.pair} > ${MAX_GAP}`);
  for (const v of sample.violations || []) failures.push(`${label} ${v}`);
}

await playThrough('desk', chromium, { viewport: { width: 1440, height: 900 } });
await playThrough('pixel7', chromium, { ...devices['Pixel 7'] });
await playThrough('webkit-iphone13', webkit, { ...devices['iPhone 13'] });

fs.mkdirSync(OUT, { recursive: true });
const report = { target: TARGET, maxWall: MAX_WALL, minWall: MIN_WALL, maxGap: MAX_GAP, rows, failures };
fs.writeFileSync(path.join(OUT, 'e2e-runtime.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, 'e2e-runtime.md'), `# e2e runtime\n\n${rows.map((r) => `- ${r.label}: wall ${Math.round(r.wall)} ms, max gap ${Math.round(r.maxGap)} ms (${r.pair})`).join('\n')}\n\nFailures: ${failures.length}\n`);

await new Promise((r) => server.close(r));
if (failures.length) {
  console.log('FAILURES', failures.length);
  failures.forEach((f) => console.log(' -', f));
  process.exit(1);
}
console.log('FAILURES 0');
