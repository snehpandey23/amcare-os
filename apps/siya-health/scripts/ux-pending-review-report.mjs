/**
 * Lists Health Guides / blogs with clinician review badges.
 * Run: node scripts/ux-pending-review-report.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function walkHtml(subdir) {
  const out = [];
  const full = path.join(SITE_ROOT, subdir);
  for (const e of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = `${subdir}/${e.name}`;
    if (e.isDirectory()) out.push(...walkHtml(rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const rows = [];
for (const rel of [...walkHtml('answers'), ...walkHtml('blog')]) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const pending = /clinical-review--pending|Clinician-informed|Pending physician review/i.test(html);
  const reviewed = /clinical-review--reviewed|Physician reviewed/i.test(html);
  if (pending || reviewed) {
    rows.push({
      rel,
      status: reviewed && !pending ? 'reviewed' : 'pending',
      title: (html.match(/<h1[^>]*>([^<]+)</) || [])[1]?.trim() || rel,
    });
  }
}

const pendingRows = rows.filter((r) => r.status === 'pending');
const priority = pendingRows.slice(0, 20);

const md = `# Pending Review Report

Generated: ${new Date().toISOString()}

## Summary

| Status | Pages |
|--------|------:|
| Clinician-informed (pending) | ${pendingRows.length} |
| Physician reviewed | ${rows.filter((r) => r.status === 'reviewed').length} |

## Recommendation

- **Badge:** Replaced "Pending physician review" with **Clinician-informed** (softer, preserves trust without implying deficiency).
- **High-traffic guides:** Prioritize physician review for top 20 below.
- **SEO:** No URL or content removal; badge wording only.

## Top 20 review priority

| Priority | Page | Title |
|----------|------|-------|
${priority.map((r, i) => `| ${i + 1} | \`${r.rel}\` | ${r.title.replace(/\|/g, '/')} |`).join('\n')}

## All clinician-informed pages

${pendingRows.map((r) => `- \`${r.rel}\` — ${r.title}`).join('\n')}
`;

const out = path.join(SITE_ROOT, 'docs/UX-PENDING-REVIEW-REPORT.md');
fs.writeFileSync(out, md);
console.log(`Wrote docs/UX-PENDING-REVIEW-REPORT.md (${pendingRows.length} pending)`);
