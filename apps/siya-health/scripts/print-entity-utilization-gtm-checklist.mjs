/**
 * Print Entity Utilization GTM checklist from the machine map.
 * Run: node scripts/print-entity-utilization-gtm-checklist.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'entity-utilization-ga4-map.json'), 'utf8'),
);

console.log(`# Entity Utilization GTM checklist`);
console.log(`Container: ${map.gtm_container_id} → GA4 ${map.ga4_measurement_id}\n`);

console.log('## Custom dimensions');
for (const d of map.custom_dimensions) {
  console.log(`- [ ] ${d.name} (event) ← ${d.parameter}`);
}

console.log('\n## Events → GA4 tags');
for (const e of map.events) {
  const flag = e.status === 'reserved' ? ' (reserved)' : '';
  const key = e.key_event ? ' ★ key event' : '';
  console.log(`- [ ] ${e.name}${key}${flag}`);
  console.log(`      params: ${e.params.join(', ')}`);
}

console.log('\n## Preview URLs');
for (const u of map.preview_urls) {
  console.log(`- ${u}`);
}

console.log('\nFull recipe: docs/GTM-GA4-ENTITY-UTILIZATION.md');
