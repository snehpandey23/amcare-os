/**
 * Full sound-on play-through at 1×.
 * Wall time from the first slide's start to the close slide must be within +2% of 239220 ms.
 * The longest gap between one clip ending and the next clip starting must be ≤ 700 ms.
 */
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET = 239220;
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

async function playThrough(label, contextOptions) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
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
    return {
      started,
      arrived,
      wall,
      maxGap,
      pair,
      starts: edges.filter((e) => e.kind === 'start').length,
      ends: edges.filter((e) => e.kind === 'end').length,
      last: document.querySelector('article.slide.active')?.id || '',
    };
  }, { maxWall: MAX_WALL });
  await browser.close();
  rows.push({ label, ...sample });
  console.log(`${label} wall ${Math.round(sample.wall)} gap ${Math.round(sample.maxGap)} ${sample.pair} starts ${sample.starts} ends ${sample.ends} last ${sample.last}`);
  if (!sample.started) failures.push(`${label} first slide did not start`);
  if (!sample.arrived) failures.push(`${label} did not reach close (last ${sample.last})`);
  if (sample.wall > MAX_WALL || sample.wall < MIN_WALL) {
    failures.push(`${label} wall ${Math.round(sample.wall)}ms outside ${Math.round(MIN_WALL)}–${Math.round(MAX_WALL)}`);
  }
  if (sample.maxGap > MAX_GAP) failures.push(`${label} gap ${Math.round(sample.maxGap)}ms ${sample.pair} > ${MAX_GAP}`);
}

await playThrough('desk', { viewport: { width: 1440, height: 900 } });
await playThrough('pixel7', { ...devices['Pixel 7'] });

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
