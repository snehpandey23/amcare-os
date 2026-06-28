/**
 * Audit consultation / booking CTA routing across built HTML.
 * Run: node scripts/audit-consultation-cta-routing.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SPRUCE_CHAT_URL,
  ADHD_WALKTHROUGH_LINK,
  ADHD_EVALUATION_199_LINK,
} from '../data/providers-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const CTA_TEXT_RE =
  /schedule consultation|book consultation|book appointment|schedule appointment|schedule visit|book visit|book now|get started|adhd walkthrough|initial consultation|evaluation|secure chat|start secure medical chat|book free consultation|take free adhd screening|start \$199|\$199 evaluation|talk to our team|need help deciding|questions\?/i;

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'scripts', 'public', 'docs', 'data'].includes(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function normalizeHref(href) {
  return decodeEntities(href).replace(/\/$/, '');
}

function classifyIntent(text, href = '') {
  const t = text.replace(/\s+/g, ' ').trim();
  if (/schedule consultation\s*→/i.test(t) && href.startsWith('/') && !href.includes('book')) {
    return { intent: 'service_explore', expected: null };
  }
  if (/start secure medical chat|start secure chat|talk to (a |our )?clinician|questions\?|talk to our team|need help deciding/i.test(t)) {
    return { intent: 'spruce_chat', expected: SPRUCE_CHAT_URL };
  }
  if (
    /book free consultation|book your adhd walkthrough|schedule consultation|book consultation|book appointment|schedule appointment|schedule visit|book visit|initial consultation|adhd walkthrough|evaluation walkthrough|15-minute adhd consultation/i.test(
      t,
    )
  ) {
    return { intent: 'walkthrough', expected: ADHD_WALKTHROUGH_LINK };
  }
  if (/start \$199|\$199 evaluation|start \$199 evaluation|start the \$199/i.test(t)) {
    return { intent: 'evaluation_199', expected: ADHD_EVALUATION_199_LINK };
  }
  if (/take free adhd screening|start free.*screening|free adhd screening|start screening|2-minute screening/i.test(t)) {
    return { intent: 'screening', expected: '/adhd-screening' };
  }
  if (/start secure medical chat/i.test(t)) {
    return { intent: 'spruce_chat', expected: SPRUCE_CHAT_URL };
  }
  if (/evaluation/i.test(t) && !/walkthrough|consultation/i.test(t)) {
    return { intent: 'evaluation_context', expected: null };
  }
  if (/get started|book now/i.test(t)) {
    return { intent: 'ambiguous', expected: null };
  }
  return { intent: 'unclassified', expected: null };
}

function hrefMatchesExpected(href, expected) {
  if (!expected) return true;
  const h = normalizeHref(href);
  const e = normalizeHref(expected);
  if (expected === '/adhd-screening') return h.includes('/adhd-screening');
  return h === e || h.startsWith(e.split('?')[0]);
}

function extractAnchors(html) {
  const rows = [];
  const re = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const hrefM = attrs.match(/href="([^"]*)"/i);
    if (!hrefM) continue;
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text || !CTA_TEXT_RE.test(text)) continue;
    rows.push({
      href: decodeEntities(hrefM[1]),
      text,
      track: (attrs.match(/data-siya-track="([^"]*)"/i) || [])[1] || '',
      location: (attrs.match(/data-siya-location="([^"]*)"/i) || [])[1] || '',
      cta: (attrs.match(/data-cta="([^"]*)"/i) || [])[1] || '',
    });
  }
  return rows;
}

const files = walkHtml(SITE_ROOT);
const inventory = [];
let incorrect = 0;
let fixedNote = 0;

for (const rel of files.sort()) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  for (const row of extractAnchors(html)) {
    const { intent, expected } = classifyIntent(row.text, row.href);
    const ok = expected ? hrefMatchesExpected(row.href, expected) : true;
    const isSpruceMisroute =
      row.href.includes('spruce.care/siyahealth') &&
      /schedule consultation|book consultation|book appointment|book free consultation|walkthrough/i.test(row.text);
    const status = isSpruceMisroute || (expected && !ok) ? 'INCORRECT' : expected ? 'OK' : 'REVIEW';
    if (status === 'INCORRECT') incorrect++;
    inventory.push({ file: rel, ...row, intent, expected: expected || '—', status });
  }
}

const lines = [
  '# Consultation CTA Routing Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Intent mapping (source of truth)',
  '',
  '| Intent | Example labels | Expected URL |',
  '|--------|----------------|--------------|',
  `| Spruce chat | Start Secure Medical Chat, Questions? | \`${SPRUCE_CHAT_URL}\` |`,
  `| Walkthrough | Schedule Consultation, Book Free Consultation | \`${ADHD_WALKTHROUGH_LINK}\` |`,
  `| $199 evaluation | Start $199 Evaluation | \`${ADHD_EVALUATION_199_LINK}\` |`,
  '| Screening | Take Free ADHD Screening | `/adhd-screening` |',
  '',
  '## Summary',
  '',
  `| Metric | Count |`,
  `|--------|------:|`,
  `| HTML files scanned | ${files.length} |`,
  `| CTAs matched | ${inventory.length} |`,
  `| Incorrect routing | ${incorrect} |`,
  `| Needs manual review (ambiguous) | ${inventory.filter((r) => r.status === 'REVIEW').length} |`,
  '',
  '## Fixes applied in this release',
  '',
  '- `BOOKING_LINK` restored to ADHD walkthrough (`ftxOxenx`), not Spruce',
  '- `normalizeConsultationCtaRouting()` rewrites Spruce/sysv73e4/`/book-appointment` on consultation labels → walkthrough',
  '- Footer **Book appointment** now points to walkthrough booking',
  '- California ADHD blog generator CTAs corrected',
  '- Weight-loss page broken `#book-telehealth` anchors → Spruce',
  '',
];

if (incorrect > 0) {
  lines.push('## Incorrect routing (must fix)', '', '| File | CTA text | Current URL | Expected |', '|------|----------|-------------|----------|');
  for (const r of inventory.filter((x) => x.status === 'INCORRECT')) {
    lines.push(`| \`${r.file}\` | ${r.text.slice(0, 60)} | \`${r.href}\` | \`${r.expected}\` |`);
  }
  lines.push('');
}

lines.push('## Full inventory', '', '| Status | File | CTA text | Destination | Intent | Expected |', '|--------|------|----------|-------------|--------|----------|');
for (const r of inventory) {
  const hrefShort = r.href.length > 48 ? `${r.href.slice(0, 45)}…` : r.href;
  const expectedCell =
    r.expected === '—' ? '—' : '`' + String(r.expected).slice(0, 55) + (String(r.expected).length > 55 ? '…' : '') + '`';
  lines.push(
    `| ${r.status} | \`${r.file}\` | ${r.text.slice(0, 50)} | \`${hrefShort}\` | ${r.intent} | ${expectedCell} |`,
  );
}

const outPath = path.join(SITE_ROOT, 'docs', 'CONSULTATION-CTA-AUDIT.md');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');

console.log(`Wrote ${outPath}`);
console.log(`CTAs: ${inventory.length} | Incorrect: ${incorrect}`);
process.exit(incorrect > 0 ? 1 : 0);
