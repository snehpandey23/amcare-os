/**
 * Full Design QA for /employers/demo at 1440×900 and 390×844.
 * Usage: node scripts/qa-employer-demo-slides.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'internal', 'demo-qa');
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(ROOT, rel.replace(/^\//, ''));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('missing'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function activateSlide(page, slideId) {
  await page.evaluate((id) => {
    const tour = document.getElementById('tour');
    const welcome = document.getElementById('welcome');
    const begin = document.getElementById('begin');
    if (begin) begin.hidden = true;
    if (welcome) welcome.classList.remove('on');
    if (tour) { tour.hidden = false; tour.classList.add('on'); }
    document.querySelectorAll('article.slide').forEach((s) => s.classList.remove('active'));
    const slide = document.getElementById(id);
    if (!slide || slide.classList.contains('parked')) throw new Error('missing/parked ' + id);
    slide.classList.add('active');
    slide.querySelectorAll('[data-at]').forEach((el) => el.classList.add('in'));
    slide.querySelectorAll('[data-count]').forEach((el) => {
      const n = el.getAttribute('data-count');
      const suf = el.getAttribute('data-suf') || '';
      const dec = +(el.getAttribute('data-dec') || 0);
      el.textContent = dec ? Number(n).toFixed(dec) + suf : n + suf;
    });
    if (slide.hasAttribute('data-walk')) {
      const phone = slide.querySelector('#walkPhone');
      const list = slide.querySelector('#walkSteps');
      if (phone) phone.innerHTML = '<div class="vm-row"><b>Private link</b><small>Your organization\'s link</small></div>';
      if (list) list.innerHTML = '<div class="door on"><span class="ic">1</span><div><b>Open your organization\'s private link</b></div></div>';
    }
  }, slideId);
  await page.waitForTimeout(500);
}

async function audit(page, label) {
  return page.evaluate((viewportLabel) => {
    const bar = document.querySelector('.bar');
    const barTop = bar ? bar.getBoundingClientRect().top : innerHeight;
    const slide = document.querySelector('article.slide.active');
    if (!slide) return { viewportLabel, issues: ['no active slide'] };
    const phone = viewportLabel.includes('390');
    const issues = [];
    // Leaf-ish text only (avoid huge containers that false-flag off-screen / contrast)
    const nodes = [...slide.querySelectorAll('h2,h3,p,.eyebrow,.sub,.cap,.refcard,.tick,.tilecard b,.xchip,.jcard h3,.walk-now,.rfoot,.note-s,.pack-note,.q2,.big,.appt b,.appt small,.stat b,.stat span,.spark b,.spark span,.rgrid b,.rgrid span,.door b,.card-lite b,.siya-core')];
    const boxes = [];
    const parse = (c) => {
      const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?/);
      return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
    };
    const lum = ([r, g, b]) => {
      const s = [r, g, b].map((v) => {
        v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
    };
    const solidBg = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const st = getComputedStyle(n);
        const c = st.backgroundColor;
        const rgb = parse(c);
        if (rgb && rgb[3] > 0.6) {
          // treat gradients on brand chips as passing (white-on-brand)
          if (st.backgroundImage && st.backgroundImage !== 'none' && /gradient/i.test(st.backgroundImage)) return 'brand-gradient';
          return c;
        }
        n = n.parentElement;
      }
      return 'rgb(244, 239, 231)';
    };
    for (const el of nodes) {
      if (el.closest('a.start,button.start,.start,.siya-core,.ev.siya,.badge,.hol,.grad,.pillstep.in')) continue;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const text = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 70);
      const fs = parseFloat(st.fontSize) || 0;
      boxes.push({ el, r, text, fs });
      // off-screen: require the majority of the box outside the safe content area
      const safeBottom = barTop - 4;
      const visibleH = Math.min(r.bottom, safeBottom) - Math.max(r.top, 0);
      const visibleW = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
      if (text && (visibleH < r.height * 0.55 || visibleW < r.width * 0.55)) {
        issues.push(`off-screen: "${text}"`);
      }
      if (r.bottom > barTop + 8 && r.top < barTop && visibleH < r.height * 0.7) issues.push(`under bar: "${text}"`);
      if (phone && text && fs && fs < 12 - 0.05) {
        issues.push(`text <12px (${fs.toFixed(1)}): "${text}"`);
      }
      if (!text || !fs) continue;
      const bg = solidBg(el);
      if (bg === 'brand-gradient') continue;
      const fg = parse(st.color); const bgRgb = parse(bg);
      if (!fg || !bgRgb) continue;
      const ratio = (Math.max(lum(fg), lum(bgRgb)) + 0.05) / (Math.min(lum(fg), lum(bgRgb)) + 0.05);
      const large = fs >= 24 || (fs >= 19 && (parseInt(st.fontWeight, 10) || 400) >= 600);
      const need = large ? 3 : 4.5;
      if (ratio + 1e-6 < need) issues.push(`contrast ${ratio.toFixed(2)}<${need}: "${text}"`);
    }
    const majors = boxes.filter((b) => b.el.matches('h2,.cap,.sub,.refcard,.eyebrow,.jcard'));
    for (let i = 0; i < majors.length; i++) {
      for (let j = i + 1; j < majors.length; j++) {
        const a = majors[i].r, b = majors[j].r;
        const ox = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const oy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (ox > 10 && oy > 10) issues.push(`overlap: "${majors[i].text}" × "${majors[j].text}"`);
      }
    }
    if (slide.id.startsWith('privacy') && slide.querySelectorAll('.spark').length) {
      issues.push('employee spark charts on privacy');
    }
    if ((slide.id === 'privacy' || slide.id === 'privacy-emp')) {
      const ref = slide.querySelector('.refcard');
      if (!ref || !/Sample · illustrative/i.test(ref.textContent || '')) issues.push('missing Sample · illustrative refcard');
    }
    if (slide.id === 'outcomes') {
      const soon = document.getElementById('outcomesSoon');
      if (soon && !soon.hidden) issues.push('outcomesSoon visible');
    }
    return { viewportLabel, slide: slide.id, issues: [...new Set(issues)] };
  }, label);
}

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '390x844', width: 390, height: 844 },
];

const server = await startServer();
const port = server.address().port;
const browser = await chromium.launch();
const report = [];

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#tour', { state: 'attached', timeout: 30000 });
    await page.waitForFunction(() => document.querySelectorAll('article.slide').length > 5, null, { timeout: 30000 });
    await page.waitForTimeout(400);
    // apply flags / collect playable ids for this viewport
    const ids = await page.evaluate((phone) => {
      if (window.__employerDemo?.applyDemoFlags) window.__employerDemo.applyDemoFlags();
      else document.querySelectorAll('[data-founder]').forEach((el) => el.classList.add('parked'));
      return [...document.querySelectorAll('article.slide:not(.parked)')]
        .filter((s) => {
          const surf = s.dataset.surface || 'both';
          if (surf === 'phone') return phone;
          if (surf === 'desk') return !phone;
          return true;
        })
        .map((s) => s.id);
    }, vp.width <= 640);

    for (const id of ids) {
      await activateSlide(page, id);
      const shot = path.join(OUT, `${id}-${vp.name}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      const result = await audit(page, vp.name);
      result.screenshot = shot;
      report.push(result);
      const status = result.issues.length ? 'FAIL' : 'PASS';
      console.log(`${vp.name} ${id}: ${status}${result.issues.length ? ' — ' + result.issues.join(' | ') : ''}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

const summaryPath = path.join(OUT, 'full-qa.json');
fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2));
const failed = report.filter((r) => r.issues.length);
console.log(`\n${report.length - failed.length}/${report.length} passed. Report: ${summaryPath}`);
if (failed.length) process.exit(1);
