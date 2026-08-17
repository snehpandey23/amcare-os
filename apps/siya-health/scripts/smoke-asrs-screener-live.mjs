/**
 * Live ASRS screener smoke — auto-advance + no scroll-jump on option select.
 *
 * Usage:
 *   node scripts/smoke-asrs-screener-live.mjs
 *   ADS_SMOKE_BASE=https://www.siya.health node scripts/smoke-asrs-screener-live.mjs
 *
 * Exit 1 if auto-advance fails or selecting an answer scrolls the question
 * under the sticky header / out of the readable viewport.
 */
import { chromium } from 'playwright';

const BASE = (process.env.ADS_SMOKE_BASE || 'https://www.siya.health').replace(/\/$/, '');
const URL = `${BASE}/adhd-screening?adhd=1&t=${Date.now()}`;

function fail(msg) {
  console.error(`smoke-asrs-screener-live: FAIL — ${msg}`);
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(600);

  const start = page.locator('#asrs-start-btn');
  if ((await start.count()) === 0) fail('missing #asrs-start-btn (deep link should skip chooser)');
  await start.click();
  await page.waitForTimeout(200);

  const stepBefore = await page.locator('.asrs-step-active').getAttribute('data-step');
  if (stepBefore !== '1') fail(`expected step 1 after start, got ${stepBefore}`);

  const question = page.locator('.asrs-step-active .asrs-question');
  await question.waitFor({ state: 'visible' });

  const before = await page.evaluate(() => {
    const q = document.querySelector('.asrs-step-active .asrs-question');
    const header = document.querySelector('.site-header');
    const qr = q.getBoundingClientRect();
    const hb = header ? header.getBoundingClientRect().bottom : 0;
    return {
      qTop: Math.round(qr.top),
      qBottom: Math.round(qr.bottom),
      headerBottom: Math.round(hb),
      scrollY: Math.round(window.scrollY),
      text: (q.textContent || '').trim().slice(0, 80),
    };
  });

  /* Select Often — must not yank the current question out of view before advance */
  await page.getByRole('radio', { name: 'Often', exact: true }).check({ force: true });
  await page.waitForTimeout(120);

  const mid = await page.evaluate(() => {
    const step = document.querySelector('.asrs-step-active')?.getAttribute('data-step');
    const q = document.querySelector('.asrs-step-active .asrs-question');
    const header = document.querySelector('.site-header');
    if (!q) return { step, missingQuestion: true };
    const qr = q.getBoundingClientRect();
    const hb = header ? header.getBoundingClientRect().bottom : 0;
    const readable = qr.bottom > hb + 8 && qr.top < window.innerHeight - 24;
    return {
      step,
      qTop: Math.round(qr.top),
      qBottom: Math.round(qr.bottom),
      headerBottom: Math.round(hb),
      scrollY: Math.round(window.scrollY),
      readable,
      text: (q.textContent || '').trim().slice(0, 80),
    };
  });

  if (mid.step === '1') {
    if (!mid.readable) {
      fail(
        `question scrolled out of readable viewport after option select (still on Q1). before=${JSON.stringify(before)} mid=${JSON.stringify(mid)}`,
      );
    }
    /* Question must not jump upward under the sticky header */
    if (mid.qBottom < mid.headerBottom + 4) {
      fail(`question bottom under sticky header after select. mid=${JSON.stringify(mid)}`);
    }
  }

  /* Wait for auto-advance to Q2 */
  await page.waitForFunction(
    () => document.querySelector('.asrs-step-active')?.getAttribute('data-step') === '2',
    { timeout: 3000 },
  );

  const after = await page.evaluate(() => {
    const q = document.querySelector('.asrs-step-active .asrs-question');
    const header = document.querySelector('.site-header');
    const qr = q.getBoundingClientRect();
    const hb = header ? header.getBoundingClientRect().bottom : 0;
    return {
      step: document.querySelector('.asrs-step-active')?.getAttribute('data-step'),
      qTop: Math.round(qr.top),
      headerBottom: Math.round(hb),
      readable: qr.bottom > hb + 8 && qr.top < window.innerHeight - 24,
      text: (q.textContent || '').trim().slice(0, 80),
    };
  });

  if (after.step !== '2') fail(`auto-advance failed; step=${after.step}`);
  if (!after.readable) {
    fail(`Q2 question not readable after auto-advance. after=${JSON.stringify(after)}`);
  }

  console.log('smoke-asrs-screener-live: PASS');
  console.log(
    JSON.stringify(
      {
        base: BASE,
        before,
        midSelectStillOnQ1OrAdvanced: mid,
        afterAdvance: after,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
