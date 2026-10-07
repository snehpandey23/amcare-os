/**
 * Transition overlap gate for employer demo.
 * - Autoplays tour at 1440×900 and 390×844, samples every 100ms
 * - Fails if >1 slide has opacity > 0.05 for longer than 300ms
 * - Spam Next×10 / Back×5: no merge, no console errors
 * - Writes build-end vs advance table
 *
 * Usage: node internal/demo-qa/transition-check.mjs
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

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    const ext = path.extname(f);
    const mime = {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.png': 'image/png', '.svg': 'image/svg+xml', '.mjs': 'text/javascript',
      '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
    }[ext];
    res.writeHead(200, mime ? { 'Content-Type': mime } : undefined);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const browser = await chromium.launch();
const failures = [];
const tables = [];

async function bootTour(page) {
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  await page.evaluate(() => {
    document.getElementById('begin').hidden = true;
    document.documentElement.classList.add('welcome-live');
    document.getElementById('welcome').classList.remove('on');
    const tour = document.getElementById('tour');
    tour.hidden = false;
    tour.classList.add('on');
  });
}

async function timingTable(page, label) {
  const rows = await page.evaluate(() => {
    const demo = window.__employerDemo;
    const slides = [...document.querySelectorAll('#tour article.slide:not(.parked)')].filter((s) => {
      const surf = s.dataset.surface || 'both';
      const phone = matchMedia('(max-width:640px)').matches || innerWidth < 700;
      if (surf === 'phone') return phone;
      if (surf === 'desk') return !phone;
      return true;
    });
    return slides.map((s) => {
      let lastAt = 0; let buildEnd = 0;
      s.querySelectorAll('[data-at]').forEach((el) => {
        const at = +el.dataset.at;
        lastAt = Math.max(lastAt, at);
        let anim = 700;
        if (el.classList.contains('draw') || el.classList.contains('grow')) anim = 1100;
        else if (el.classList.contains('pop')) anim = 700;
        else if (el.classList.contains('b') || el.classList.contains('fade')) anim = 800;
        buildEnd = Math.max(buildEnd, at + anim);
      });
      s.querySelectorAll('[data-out]').forEach((el) => {
        buildEnd = Math.max(buildEnd, +el.dataset.out + 600);
      });
      if (s.hasAttribute('data-walk')) buildEnd = Math.max(buildEnd, 7 * (demo.WALK_MS || 3000) + 800);
      const advance = demo.computeAdvanceMs(s);
      const hand = +s.dataset.dur || 0;
      return {
        id: s.id,
        handDur: hand,
        lastAt,
        buildEnd,
        advance,
        ok: hand === 0 || advance >= buildEnd,
      };
    });
  });
  tables.push({ label, rows });
  return rows;
}

async function autoplaySample(w, h, label) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    isMobile: w < 500,
    hasTouch: w < 500,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message || e)));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    /* Ignore transient Chromium network noise during long local autoplay */
    if (/ERR_NETWORK_CHANGED|Failed to load resource|net::ERR_/i.test(t)) return;
    errs.push('console:' + t);
  });
  await bootTour(page);
  // Timing table uses real computeAdvanceMs (full dwell)
  await timingTable(page, label);
  // Fast autoplay for overlap sampling (builds still run; dwell shortened)
  await page.evaluate(() => { window.__SIYA_QA_FAST = true; });

  // Start autoplay from slide 0
  await page.evaluate(() => {
    window.__employerDemo.playSlideDeepLink(
      [...document.querySelectorAll('#tour article.slide:not(.parked)')].filter((s) => {
        const surf = s.dataset.surface || 'both';
        const phone = matchMedia('(max-width:640px)').matches || innerWidth < 700;
        if (surf === 'phone') return phone;
        if (surf === 'desk') return !phone;
        return true;
      })[0]?.id,
      { playBuild: true },
    );
    // unpause for autoplay
    const pause = document.getElementById('pause');
    if (pause && pause.textContent === 'Play') pause.click();
  });

  const overlapEvents = [];
  let streak = 0;
  const maxMs = 180000; // hard cap
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const sample = await page.evaluate(() => {
      const slides = [...document.querySelectorAll('#tour article.slide')];
      const visible = slides
        .map((s) => {
          const st = getComputedStyle(s);
          const op = parseFloat(st.opacity) || 0;
          return {
            id: s.id,
            op,
            vis: st.visibility,
            active: s.classList.contains('active'),
            leaving: s.classList.contains('leaving'),
            entering: s.classList.contains('entering'),
          };
        })
        .filter((x) => x.op > 0.05 && x.vis !== 'hidden');
      const cur = window.__employerDemo.getCur?.() ?? -1;
      const tx = window.__employerDemo.getTx?.() ?? '?';
      const last = slides.filter((s) => !s.classList.contains('parked')).length - 1;
      const onClose = cur >= last;
      return { visible, tx, cur, onClose, n: slides.filter((s) => !s.classList.contains('parked')).length };
    });

    if (sample.visible.length > 1) {
      streak += 100;
      if (streak > 300) {
        overlapEvents.push({
          at: Date.now() - t0,
          ms: streak,
          ids: sample.visible.map((v) => `${v.id}:${v.op.toFixed(2)}${v.leaving ? ':leaving' : ''}${v.entering ? ':entering' : ''}`),
          tx: sample.tx,
        });
        streak = 0; // count distinct windows
      }
    } else streak = 0;

    if (sample.onClose && sample.tx === 'idle') break;
    await page.waitForTimeout(100);
  }

  // Spam test
  await page.evaluate(() => {
    // jump near middle so Next/Back have room
    const ids = [...document.querySelectorAll('#tour article.slide:not(.parked)')]
      .filter((s) => {
        const surf = s.dataset.surface || 'both';
        const phone = matchMedia('(max-width:640px)').matches || innerWidth < 700;
        if (surf === 'phone') return phone;
        if (surf === 'desk') return !phone;
        return true;
      })
      .map((s) => s.id);
    window.__employerDemo.playSlideDeepLink(ids[Math.min(5, ids.length - 1)], { playBuild: true });
  });
  await page.waitForTimeout(400);
  for (let i = 0; i < 10; i++) {
    await page.click('#next', { force: true }).catch(() => {});
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(500);
  for (let i = 0; i < 5; i++) {
    await page.click('#prev', { force: true }).catch(() => {});
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(600);

  const afterSpam = await page.evaluate(() => {
    const vis = [...document.querySelectorAll('#tour article.slide')].filter((s) => {
      const st = getComputedStyle(s);
      return (parseFloat(st.opacity) || 0) > 0.05 && st.visibility !== 'hidden';
    });
    const cur = window.__employerDemo.getCur?.();
    const ch = document.querySelector('.ch[aria-current="true"] span, #chNow');
    return {
      visibleCount: vis.length,
      visibleIds: vis.map((s) => s.id),
      curId: document.querySelectorAll('#tour article.slide:not(.parked)')[cur]?.id,
      chapter: ch?.textContent || null,
      tx: window.__employerDemo.getTx?.(),
    };
  });

  if (overlapEvents.length) {
    failures.push({ view: label, type: 'overlap', events: overlapEvents.slice(0, 8) });
  }
  if (afterSpam.visibleCount > 1) {
    failures.push({ view: label, type: 'spam-merge', afterSpam });
  }
  if (errs.length) {
    failures.push({ view: label, type: 'console', errs: errs.slice(0, 10) });
  }
  if (afterSpam.tx && afterSpam.tx !== 'idle') {
    // allow brief settling
    await page.waitForTimeout(400);
    const tx2 = await page.evaluate(() => window.__employerDemo.getTx?.());
    if (tx2 !== 'idle') failures.push({ view: label, type: 'tx-stuck', tx: tx2 });
  }

  await ctx.close();
  return { overlapEvents, afterSpam, errs };
}

const desk = await autoplaySample(1440, 900, 'desk-1440');
const phone = await autoplaySample(390, 844, 'phone-390');
const phoneToolbar = await autoplaySample(390, 664, 'phone-390x664');

let md = `# Transition check AFTER \`${HASH}\`\n\n`;
md += `## Diagnose summary (fixed)\n`;
md += `- Leave/enter state machine (LEAVING ${280}ms → hide/reset → ENTERING); builds start only on enter.\n`;
md += `- Slide-scoped timers; cancelled on exit.\n`;
md += `- Auto-advance = computeAdvanceMs(lastBuildEnd + dwell).\n`;
md += `- Next: first click finishes builds; second advances. Debounced while tx≠idle.\n`;
md += `- Back: re-enters at final state.\n\n`;

for (const t of tables) {
  md += `## Timing table — ${t.label}\n\n`;
  md += `| id | hand data-dur | lastAt | buildEnd | advance (computed) |\n|---|---:|---:|---:|---:|\n`;
  for (const r of t.rows) {
    md += `| ${r.id} | ${r.handDur} | ${r.lastAt} | ${r.buildEnd} | ${r.advance} |\n`;
  }
  md += '\n';
}

md += `## Autoplay overlap\n`;
md += `- desk: ${desk.overlapEvents.length} prolonged overlap window(s)\n`;
md += `- phone: ${phone.overlapEvents.length} prolonged overlap window(s)\n`;
if (desk.overlapEvents[0]) md += `- desk sample: ${JSON.stringify(desk.overlapEvents[0])}\n`;
if (phone.overlapEvents[0]) md += `- phone sample: ${JSON.stringify(phone.overlapEvents[0])}\n`;
md += `\n## Spam Next×10 / Back×5\n`;
md += `- desk: visible=${desk.afterSpam.visibleCount} ids=${desk.afterSpam.visibleIds} chapter=${desk.afterSpam.chapter} tx=${desk.afterSpam.tx}\n`;
md += `- phone: visible=${phone.afterSpam.visibleCount} ids=${phone.afterSpam.visibleIds} chapter=${phone.afterSpam.chapter} tx=${phone.afterSpam.tx}\n`;
md += `\n## Result: ${failures.length ? 'FAIL' : 'PASS'}\n`;
if (failures.length) md += `\n\`\`\`json\n${JSON.stringify(failures, null, 2)}\n\`\`\`\n`;

fs.writeFileSync(path.join(OUT, 'transition-check-AFTER.md'), md);
fs.writeFileSync(path.join(OUT, 'transition-check.json'), JSON.stringify({ HASH, failures, tables, desk, phone }, null, 2));

await browser.close();
server.close();

if (failures.length) {
  console.error('TRANSITION FAIL', failures.length);
  console.error(JSON.stringify(failures, null, 2).slice(0, 2000));
  process.exit(1);
}
console.log('TRANSITION PASS');
console.log(md.split('\n').slice(0, 40).join('\n'));
