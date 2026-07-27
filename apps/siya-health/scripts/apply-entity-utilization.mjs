/**
 * Inject data-siya-entity* attributes on Canonical Entity pages for utilization tracking.
 * Run: node scripts/apply-entity-utilization.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CANONICAL_ENTITIES } from '../data/canonical-entities.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function fileForPath(urlPath) {
  if (urlPath === '/') return 'index.html';
  return `${urlPath.replace(/^\//, '')}.html`;
}

function stripEntityAttrs(tag) {
  return String(tag || '')
    .replace(/\s*data-siya-entity(?:-family)?="[^"]*"/gi, '')
    .replace(/\s*data-siya-care-pathway="[^"]*"/gi, '')
    .replace(/\s*data-siya-state="[^"]*"/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function attrsFor(meta) {
  const parts = [
    `data-siya-entity="${meta.entity}"`,
    `data-siya-entity-family="${meta.entity_family}"`,
    `data-siya-care-pathway="${meta.care_pathway}"`,
  ];
  if (meta.state) parts.push(`data-siya-state="${meta.state}"`);
  return parts.join(' ');
}

let n = 0;
for (const [urlPath, meta] of Object.entries(CANONICAL_ENTITIES)) {
  const rel = fileForPath(urlPath);
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.warn('SKIP missing', rel);
    continue;
  }
  let html = fs.readFileSync(abs, 'utf8');
  if (!/<body\b/i.test(html)) {
    console.warn('SKIP no body', rel);
    continue;
  }
  html = html.replace(/<body([^>]*)>/i, (_, attrs) => {
    const cleaned = stripEntityAttrs(attrs);
    return cleaned
      ? `<body ${cleaned} ${attrsFor(meta)}>`
      : `<body ${attrsFor(meta)}>`;
  });
  fs.writeFileSync(abs, html);
  console.log('OK', rel, meta.entity);
  n += 1;
}
console.log(`Entity utilization attrs applied on ${n} pages`);
