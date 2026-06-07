/**
 * Audits Health Guide evidence snapshot rows for placeholder / thin content.
 * Run: node scripts/audit-health-guide-evidence.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const ANSWERS = path.join(SITE_ROOT, 'answers');

function norm(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const flagged = [];
const withCard = [];
const withoutCard = [];

for (const file of fs.readdirSync(ANSWERS).filter((f) => f.endsWith('.html') && f !== 'index.html')) {
  const html = fs.readFileSync(path.join(ANSWERS, file), 'utf8');
  const url = `/answers/${file.replace('.html', '')}`;
  const hasCard = html.includes('blog-engage--evidence');
  if (hasCard) withCard.push(url);
  else withoutCard.push(url);

  const rows = [...html.matchAll(/<div class="blog-engage-evidence-row"><dt>([^<]*)<\/dt><dd>([^<]*)/g)];
  for (const [, label, dd] of rows) {
    const value = dd.replace(/\s*<span[^>]*>[^<]*<\/span>/, '').trim();
    if (norm(label) === norm(value)) {
      flagged.push({ url, label, value, issue: 'duplicate_label_value' });
    } else if (value.length < 20) {
      flagged.push({ url, label, value, issue: 'thin_value' });
    }
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  guidesWithEvidenceCard: withCard.length,
  guidesWithoutEvidenceCard: withoutCard.length,
  guidesWithoutCard: withoutCard,
  flaggedRows: flagged,
  flaggedCount: flagged.length,
};

fs.writeFileSync(path.join(SITE_ROOT, 'data', 'health-guide-evidence-audit.json'), JSON.stringify(out, null, 2));
console.log('Evidence audit:', flagged.length, 'flagged rows;', withoutCard.length, 'guides without snapshot card');
if (flagged.length) console.log('Sample:', flagged.slice(0, 3));
