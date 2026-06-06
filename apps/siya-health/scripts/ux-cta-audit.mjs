/**
 * UX CTA audit — counts buttons/booking/screening by page type.
 * Run: node scripts/ux-cta-audit.mjs [--out docs/UX-CTA-AUDIT.md]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function walkHtml(subdir = '') {
  const out = [];
  const fullDir = subdir ? path.join(SITE_ROOT, subdir) : SITE_ROOT;
  if (!fs.existsSync(fullDir)) return out;
  for (const e of fs.readdirSync(fullDir, { withFileTypes: true })) {
    if (e.name === 'public' || e.name === 'node_modules' || e.name === 'scripts') continue;
    const rel = subdir ? `${subdir}/${e.name}` : e.name;
    const full = path.join(SITE_ROOT, rel);
    if (e.isDirectory()) out.push(...walkHtml(rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function classifyPage(rel) {
  if (rel === 'index.html') return 'homepage';
  if (rel.startsWith('answers/')) return rel === 'answers/index.html' ? 'health-guides-hub' : 'health-guide';
  if (rel.startsWith('blog/')) return 'blog';
  if (rel.startsWith('providers/')) return 'provider';
  if (
    [
      'adhd-care.html',
      'adhd-screening.html',
      'adult-adhd-diagnosis.html',
      'adhd-treatment-online.html',
      'adhd-evaluation-cost.html',
      'online-adhd-test.html',
      'creyos-adhd-testing.html',
      'weight-loss-metabolic-health.html',
      'mens-health-longevity.html',
      'telehealth.html',
      'primary-urgent-care.html',
    ].includes(rel) ||
    /^adhd-diagnosis-/.test(rel)
  ) {
    return 'service';
  }
  return 'other';
}

function auditFile(rel) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const buttons = (html.match(/class="button/g) || []).length;
  const booking = (html.match(/carepatron|yourmarketingai/gi) || []).length;
  const screening = (html.match(/adhd-screening|Free ADHD Screening|free screening|Start Free Screening/gi) || []).length;
  const pendingReview = /Clinician-informed|Pending physician review|clinical-review--pending/i.test(html);
  return { rel, buttons, booking, screening, pendingReview };
}

const files = walkHtml('');
const rows = files.map(auditFile);
const byType = {};
for (const r of rows) {
  const t = classifyPage(r.rel);
  if (!byType[t]) byType[t] = { pages: 0, buttons: 0, booking: 0, screening: 0, pending: 0 };
  byType[t].pages += 1;
  byType[t].buttons += r.buttons;
  byType[t].booking += r.booking;
  byType[t].screening += r.screening;
  if (r.pendingReview) byType[t].pending += 1;
}

const total = rows.reduce(
  (a, r) => ({
    pages: a.pages + 1,
    buttons: a.buttons + r.buttons,
    booking: a.booking + r.booking,
    screening: a.screening + r.screening,
    pending: a.pending + (r.pendingReview ? 1 : 0),
  }),
  { pages: 0, buttons: 0, booking: 0, screening: 0, pending: 0 },
);

const topButtons = [...rows].sort((a, b) => b.buttons - a.buttons).slice(0, 15);
const topBooking = [...rows].sort((a, b) => b.booking - a.booking).slice(0, 15);

const md = `# UX CTA Audit

Generated: ${new Date().toISOString()}

## Totals

| Metric | Count |
|--------|------:|
| HTML pages | ${total.pages} |
| \`class="button"\` | ${total.buttons} |
| Booking URL refs | ${total.booking} |
| Screening refs | ${total.screening} |
| Pages with pending review badge | ${total.pending} |

## By page type

| Type | Pages | Buttons | Booking refs | Screening refs | Pending review |
|------|------:|--------:|-------------:|---------------:|---------------:|
${Object.entries(byType)
  .sort((a, b) => b[1].buttons - a[1].buttons)
  .map(([t, s]) => `| ${t} | ${s.pages} | ${s.buttons} | ${s.booking} | ${s.screening} | ${s.pending} |`)
  .join('\n')}

## Top 15 pages by button count

| Page | Buttons | Booking | Screening |
|------|--------:|--------:|----------:|
${topButtons.map((r) => `| \`${r.rel}\` | ${r.buttons} | ${r.booking} | ${r.screening} |`).join('\n')}

## Top 15 pages by booking refs

| Page | Booking | Buttons |
|------|--------:|--------:|
${topBooking.map((r) => `| \`${r.rel}\` | ${r.booking} | ${r.buttons} |`).join('\n')}
`;

const outArg = process.argv.indexOf('--out');
const outPath = outArg >= 0 ? process.argv[outArg + 1] : 'docs/UX-CTA-AUDIT.md';
const fullOut = path.join(SITE_ROOT, outPath);
fs.mkdirSync(path.dirname(fullOut), { recursive: true });
fs.writeFileSync(fullOut, md);
console.log(`Wrote ${outPath}`);
console.log(`Total buttons: ${total.buttons}, booking refs: ${total.booking}`);
