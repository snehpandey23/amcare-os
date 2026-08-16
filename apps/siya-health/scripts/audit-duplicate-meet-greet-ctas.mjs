/**
 * Audit: flag hero / cta-band groups with 2+ Meet & Greet buttons.
 * Run: node scripts/audit-duplicate-meet-greet-ctas.mjs
 * Exit 1 if any duplicates remain.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (['node_modules', 'brand', 'docs', 'public'].includes(e.name)) continue;
    const rel = path.join(dir, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

function isMeetGreetAnchor(anchor) {
  return (
    /\/redirect\/meet-greet/i.test(anchor) &&
    /meet\s*&(?:amp;)?\s*greet|meet.?greet/i.test(anchor.replace(/<[^>]+>/g, ' '))
  );
}

const issues = [];
for (const rel of walkHtml('.')) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const blocks = html.match(/<div class="((?:hero-ctas|cta-band-buttons)[^"]*)"[^>]*>[\s\S]*?<\/div>/gi) || [];
  for (const block of blocks) {
    const anchors = block.match(/<a\s[^>]*>[\s\S]*?<\/a>/gi) || [];
    const count = anchors.filter(isMeetGreetAnchor).length;
    if (count >= 2) issues.push({ path: `/${rel.replace(/\.html$/, '').replace(/\/index$/, '') || ''}`, file: rel, count });
  }
}

if (!issues.length) {
  console.log('Duplicate Meet & Greet CTA audit OK (0 issues)');
  process.exit(0);
}

console.error('Duplicate Meet & Greet CTAs found:');
for (const i of issues) console.error(`- ${i.file}: ${i.count} Meet & Greet buttons in one CTA group`);
process.exit(1);
