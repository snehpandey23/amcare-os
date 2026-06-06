/**
 * Validates assets/diagrams/*.svg are well-formed XML (broken SVGs render as 0×0 in browsers).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIAGRAMS_DIR = path.join(__dirname, '..', 'assets', 'diagrams');

const files = fs.readdirSync(DIAGRAMS_DIR).filter((f) => f.endsWith('.svg'));
const errors = [];

for (const file of files) {
  const full = path.join(DIAGRAMS_DIR, file);
  try {
    execSync(`xmllint --noout "${full}"`, { stdio: 'pipe' });
  } catch (e) {
    errors.push(`${file}: ${e.stderr?.toString().trim() || 'invalid XML'}`);
  }
}

if (errors.length) {
  console.error('validate-svg-diagrams: FAIL');
  for (const err of errors) console.error('  -', err);
  process.exit(1);
}

console.log('validate-svg-diagrams: PASS —', files.length, 'SVG files');
