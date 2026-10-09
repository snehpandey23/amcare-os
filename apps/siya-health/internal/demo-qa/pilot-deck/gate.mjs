/**
 * Pilot deck gates. One browser, one context per viewport.
 * Layout proof uses the brief's draft figures and the public site contact
 * only in memory. It does not write employers/pilot-deck/index.html.
 *
 * Run from apps/siya-health: node internal/demo-qa/pilot-deck/gate.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { buildPage } from '../../../scripts/generate-employer-pilot-deck.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const OUT = path.join(ROOT, 'internal/demo-qa/pilot-deck');
const PROTO = path.join(ROOT, 'internal/employer-demo-prototype.html');
const DATA = path.join(ROOT, 'data/employer-pilot-deck.mjs');
fs.mkdirSync(OUT, { recursive: true });

const PROOF = {
  EVALUATIONS: '1,200+',
  MONTHLY_PATIENTS: '~380, 178 new / 201 returning',
  BAA_BADGE: null,
  CONTACT_EMAIL: 'care@siya.health',
  CONTACT_PHONE: '(215) 445-1244',
};

const SIZES = [
  { name: '1440x900', w: 1440, h: 900 },
  { name: '1280x720', w: 1280, h: 720 },
  { name: '1024x768', w: 1024, h: 768 },
  { name: '390x664', w: 390, h: 664 },
  { name: '664x390', w: 664, h: 390 },
];

const html = await buildPage(PROOF);
const proofPath = '/tmp/siya-pilot-deck-layout-proof.html';
fs.writeFileSync(proofPath, html);

const unset = spawnSync(process.execPath, ['scripts/generate-employer-pilot-deck.mjs'], { cwd: ROOT, encoding: 'utf8' });
const unsetFails = unset.status !== 0 && /PLACEHOLDERS\.EVALUATIONS is unset/.test(unset.stderr + unset.stdout);

function serve() {
  const mime = { '.html': 'text/html', '.png': 'image/png', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (rel === '/employers/pilot-deck' || rel === '/employers/pilot-deck/') rel = '/employers/pilot-deck/index.html';
      const file = rel === '/employers/pilot-deck/index.html' ? proofPath : path.join(ROOT, rel.replace(/^\//, ''));
      const rootOk = file.startsWith(ROOT) || file === proofPath;
      if (!rootOk || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function cssCoverage(pageHtml) {
  const css = (pageHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i) || ['', ''])[1];
  const defined = new Set();
  for (const m of css.matchAll(/\.([A-Za-z_][\w-]*)/g)) defined.add(m[1]);
  const used = new Set();
  for (const m of pageHtml.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (/^[A-Za-z_][\w-]*$/.test(c)) used.add(c);
  }
  const missing = [...used].filter((c) => !defined.has(c)).sort();
  return { used: used.size, missing };
}

function factsAudit(pageHtml) {
  const src = fs.readFileSync(DATA, 'utf8');
  const problems = [];
  if (!src.includes('EMPLOYER_PILOT_FACTS')) problems.push('data module does not import employer-pilot-facts');
  const literals = ['2,700+', '4.90', '4.66', '30 minutes', '2 hours', 'California, Texas'];
  for (const lit of literals) {
    if (src.includes(lit)) problems.push(`hardcoded fact literal in data module: ${lit}`);
  }
  const banned = ['guarantee', 'SOC 2', '$', 'Klarity', '[Contact', '{{', 'Creyos', 'Spruce', 'CarePatron', '1 hr', '$0'];
  for (const word of banned) {
    if (pageHtml.includes(word)) problems.push(`rendered output contains ${JSON.stringify(word)}`);
  }
  for (const need of ['2,700+', '4.90', '4.66', '102', '589', '30 minutes', '2 hours', 'California, Texas, Pennsylvania and Florida']) {
    if (!pageHtml.includes(need)) problems.push(`rendered output missing imported fact ${need}`);
  }
  return problems;
}

function allowedColours() {
  const proto = fs.readFileSync(PROTO, 'utf8');
  const root = (proto.match(/:root\{[\s\S]*?\}/) || [''])[0];
  const set = new Set(['255,255,255']);
  for (const hex of root.match(/#[0-9A-Fa-f]{6}/g) || []) {
    const n = parseInt(hex.slice(1), 16);
    set.add(`${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`);
  }
  for (const m of root.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
    set.add(`${m[1]},${m[2]},${m[3]}`);
  }
  return set;
}

const ALLOWED = allowedColours();

const auditJs = `() => {
  const stage = document.getElementById('stage');
  const slide = document.querySelector('.slide.is-on');
  const sr = stage.getBoundingClientRect();
  const tol = 2;
  const leaves = [...slide.querySelectorAll('[data-piece]')].filter((el) => !el.querySelector('[data-piece]'));
  const boxes = leaves.map((el) => {
    const r = el.getBoundingClientRect();
    return { t: (el.innerText || '').slice(0, 48), x: r.x, y: r.y, r: r.right, b: r.bottom, w: r.width, h: r.height };
  }).filter((b) => b.w > 1 && b.h > 1);
  const collisions = [];
  const outside = [];
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    if (a.x < sr.left - tol || a.y < sr.top - tol || a.r > sr.right + tol || a.b > sr.bottom + tol) {
      outside.push(a.t);
    }
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      const w = Math.min(a.r, b.r) - Math.max(a.x, b.x);
      const h = Math.min(a.b, b.b) - Math.max(a.y, b.y);
      if (w > tol && h > tol) collisions.push(a.t + ' ∩ ' + b.t);
    }
  }
  const n = Number(slide.getAttribute('data-n'));
  let low = 0;
  for (const b of boxes) low = Math.max(low, (b.b - sr.top) / sr.height);
  const bottomOk = n === 1 || n === 17 ? true : low >= 0.75;
  const floors = [];
  const textEls = [...slide.querySelectorAll('h1,h2,h3,p,li,span,small,b,a,div')];
  for (const el of textEls) {
    if (!el.childNodes.length) continue;
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (!text) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    let floor = 16;
    if (el.closest('[data-foot], .cover-foot, .slide-foot')) floor = 13;
    else if (el.closest('.eyebrow')) floor = 14;
    else if (el.matches('.headline, .stat-n') || (el.matches('.step-n') && el.closest('.step'))) floor = 40;
    else if (el.closest('.sub, .kicker') || (el.closest('.bullets') && !el.closest('.bullets.tight') && !el.closest('.card'))) floor = 18;
    if (size + 0.2 < floor) floors.push(size.toFixed(1) + 'px < ' + floor + ' “' + text.slice(0, 42) + '”');
  }
  function parse(c) {
    if (!c || c === 'transparent' || c === 'none') return null;
    const m = c.match(/rgba?\\(\\s*([\\d.]+)[\\s,]+([\\d.]+)[\\s,]+([\\d.]+)(?:[\\s,/]+([\\d.]+))?\\)/);
    if (!m) return c;
    if (m[4] !== undefined && Number(m[4]) === 0) return null;
    return Math.round(Number(m[1])) + ',' + Math.round(Number(m[2])) + ',' + Math.round(Number(m[3]));
  }
  const colours = [];
  for (const el of slide.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const found = [parse(cs.color), parse(cs.backgroundColor)];
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      if (parseFloat(cs['border' + side + 'Width']) > 0) found.push(parse(cs['border' + side + 'Color']));
    }
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
      found.push(parse(cs.fill), parse(cs.stroke));
    }
    const shadow = cs.boxShadow || '';
    for (const m of shadow.matchAll(/rgba?\\([^)]*\\)/g)) found.push(parse(m[0]));
    for (const c of found) {
      if (!c) continue;
      if (!${JSON.stringify([...ALLOWED])}.includes(c)) colours.push(c + ' ' + el.tagName + '.' + (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 40));
    }
  }
  return { n, collisions, outside, bottomOk, low: Math.round(low * 100), floors, colours: [...new Set(colours)].slice(0, 8) };
}`;

const auditFn = eval(auditJs);
const server = await serve();
const port = server.address().port;
const browser = await chromium.launch();
const results = [];
const shotDir = path.join(OUT, '_slides');
fs.mkdirSync(shotDir, { recursive: true });
const slideShots = new Map();

for (const size of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/employers/pilot-deck/index.html?review=1#1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  for (let n = 1; n <= 17; n++) {
    await page.evaluate((n) => window.__pilotDeck.show(n), n);
    await page.waitForTimeout(30);
    const audit = await page.evaluate(auditFn);
    const fail = [];
    if (audit.collisions.length) fail.push('collision');
    if (audit.outside.length) fail.push('outside');
    if (!audit.bottomOk) fail.push('bottom-third ' + audit.low + '%');
    if (size.name === '1440x900' && audit.floors.length) fail.push('type');
    if (size.name === '1440x900' && audit.colours.length) fail.push('colour');
    results.push({ size: size.name, n, pass: fail.length === 0, fail, detail: audit });
    if (size.name === '1440x900') {
      const box = await page.locator('#stage').boundingBox();
      const file = path.join(shotDir, String(n).padStart(2, '0') + '.png');
      await page.screenshot({ path: file, clip: box });
      slideShots.set(n, file);
    }
    if (size.name === '664x390' && [2, 9, 14].includes(n)) {
      const box = await page.locator('#stage').boundingBox();
      await page.screenshot({ path: path.join(shotDir, 'land-' + n + '.png'), clip: box });
    }
  }
  await ctx.close();
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`http://127.0.0.1:${port}/employers/pilot-deck/index.html?review=1#2`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
await page.evaluate(() => {
  const stage = document.getElementById('stage');
  const card = document.querySelector('#slide-2 [data-piece]');
  card.style.position = 'absolute';
  card.style.top = (stage.clientHeight + 60) + 'px';
  const tag = document.createElement('p');
  tag.textContent = '$150';
  card.appendChild(tag);
});
const mutated = await page.evaluate(auditFn);
const mutation = {
  outsideFailed: mutated.outside.length > 0,
  dollarInDom: await page.evaluate(() => document.body.innerText.includes('$150')),
};
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
const reverted = await page.evaluate(() => !document.body.innerText.includes('$150'));
await browser.close();
server.close();

const coverage = cssCoverage(html);
const facts = factsAudit(html);
const hardFail = results.filter((r) => !r.pass);
const mutationOk = mutation.outsideFailed && mutation.dollarInDom && reverted;

const { default: { createCanvas, loadImage } } = { default: {} };
let sheetNote = 'pillow';
try {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const PIL = null;
  void PIL;
  void createCanvas;
  void loadImage;
  void require;
} catch { /* sheet is built in python below */ }

const py = spawnSync('python3', ['-c', `
from PIL import Image, ImageDraw
import os
out = ${JSON.stringify(OUT)}
shots = os.path.join(out, '_slides')
w, h = 1280, 720
cols = 3
rows = 6
land_h = 220
sheet = Image.new('RGB', (cols*w, rows*h + land_h + 24), (244,239,231))
for i in range(1, 18):
    im = Image.open(os.path.join(shots, f'{i:02d}.png')).convert('RGB')
    im = im.resize((w, h))
    r, c = divmod(i-1, cols)
    sheet.paste(im, (c*w, r*h))
draw = ImageDraw.Draw(sheet)
x = 0
for n in (2, 9, 14):
    im = Image.open(os.path.join(shots, f'land-{n}.png')).convert('RGB')
    im.thumbnail((640, land_h))
    sheet.paste(im, (x, rows*h + 12))
    x += im.size[0] + 16
sheet.save(os.path.join(out, 'contact-sheet.png'))
print(sheet.size)
`], { encoding: 'utf8' });
sheetNote = (py.stdout || '') + (py.stderr || '');

const lines = [];
lines.push('# Employer pilot deck gate');
lines.push('');
lines.push(`Unset-placeholder generator fails: ${unsetFails ? 'PASS' : 'FAIL'}`);
lines.push(`CSS coverage missing classes: ${coverage.missing.length ? coverage.missing.join(', ') : 'none'}`);
lines.push(`Facts audit: ${facts.length ? facts.join('; ') : 'PASS'}`);
lines.push(`Mutation (card 60px below stage and $150, then revert): outside=${mutation.outsideFailed} dollar=${mutation.dollarInDom} reverted=${reverted} ${mutationOk ? 'PASS' : 'FAIL'}`);
lines.push('');
lines.push('| Size | Slide | Result | Notes |');
lines.push('|---|---|---|---|');
for (const row of results) {
  lines.push(`| ${row.size} | ${row.n} | ${row.pass ? 'PASS' : 'FAIL'} | ${row.fail.join(', ') || ''} |`);
}
if (hardFail.length) {
  lines.push('');
  lines.push('## Failures');
  for (const row of hardFail.filter((r) => r.size === '1440x900' || r.fail.includes('collision') || r.fail.includes('outside'))) {
    const d = row.detail;
    lines.push(`- ${row.size} slide ${row.n}: ${row.fail.join(', ')}`);
    if (d.collisions.length) lines.push('  - overlap: ' + d.collisions.slice(0, 4).join(' | '));
    if (d.outside.length) lines.push('  - outside: ' + d.outside.slice(0, 4).join(' | '));
    if (d.floors.length) lines.push('  - type: ' + d.floors.slice(0, 6).join(' | '));
    if (d.colours.length) lines.push('  - colour: ' + d.colours.join(' | '));
  }
}
lines.push('');
lines.push('Contact sheet: internal/demo-qa/pilot-deck/contact-sheet.png');
lines.push(sheetNote.trim());
fs.writeFileSync(path.join(OUT, 'gate-report.md'), lines.join('\n'));
const failed = !unsetFails || coverage.missing.length || facts.length || !mutationOk || hardFail.length || py.status !== 0;
console.log(lines.filter((l) => l.startsWith('Unset') || l.startsWith('CSS') || l.startsWith('Facts') || l.startsWith('Mutation') || l.startsWith('- ') || l.startsWith('| 1440')).join('\n'));
console.log('FAILS', hardFail.length, 'exit', failed ? 1 : 0);
process.exit(failed ? 1 : 0);
