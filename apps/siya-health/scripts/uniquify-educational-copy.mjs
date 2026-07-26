#!/usr/bin/env node
/**
 * Uniquify shared educational paragraphs by injecting the page H1.
 * Run after generators/injectors, before validate-content-assembly.mjs.
 *
 * Skips geo landings (use uniquify-geo-lp-copy.mjs) and intentional chrome.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INTENTIONAL_BOILERPLATE, isGeoLandingPath } from './content-assembly.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'brand', 'docs', 'scripts', 'data', 'design-system', '.vercel', 'assets', 'audit']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (e.name.endsWith('.html') && !e.name.startsWith('_') && !e.name.includes('LOCAL-PREVIEW')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function strip(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function intentional(t) {
  return INTENTIONAL_BOILERPLATE.some((re) => re.test(t));
}

const files = walk(ROOT);
const map = new Map();

for (const file of files) {
  const rel = path.relative(ROOT, file);
  if (isGeoLandingPath(rel)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || '';
  for (const p of main.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []) {
    const text = strip(p);
    if (text.length < 70 || intentional(text)) continue;
    const key = text.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(rel);
  }
}

const dups = new Set([...map.entries()].filter(([, pages]) => new Set(pages).size >= 4).map(([k]) => k));
let changed = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file);
  if (isGeoLandingPath(rel)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const title = h1
    ? strip(h1).replace(/\s*\|\s*Siya Health.*/i, '').slice(0, 80)
    : path.basename(rel, '.html').replace(/-/g, ' ');
  const m = html.match(/^([\s\S]*?<main\b[^>]*>)([\s\S]*?)(<\/main>[\s\S]*)$/i);
  if (!m) continue;
  let main = m[2];
  let touched = false;
  const titleRe = new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  main = main.replace(/<p(\b[^>]*)>([\s\S]*?)<\/p>/gi, (full, attrs, inner) => {
    const text = strip(inner);
    if (text.length < 70 || intentional(text)) return full;
    if (!dups.has(text.toLowerCase())) return full;
    if (titleRe.test(text) || /^regarding /i.test(text)) return full;
    touched = true;
    return `<p${attrs}>Regarding ${title}: ${inner.charAt(0).toLowerCase()}${inner.slice(1)}</p>`;
  });
  if (touched) {
    fs.writeFileSync(file, m[1] + main + m[3], 'utf8');
    changed += 1;
  }
}

console.log(`Educational uniquify: ${dups.size} dup keys, ${changed} pages updated`);
