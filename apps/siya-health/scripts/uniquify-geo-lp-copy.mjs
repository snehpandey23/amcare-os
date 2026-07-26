#!/usr/bin/env node
/**
 * Uniquify cloned geo landing-page paragraphs by injecting locale context.
 * Temporary assembly fix until geo LPs are consolidated (IA audit P0).
 *
 * Targets:
 * - blog/adhd-treatment-*-{ca,tx,fl,pa}.html
 * - adhd-diagnosis-*.html
 *
 * Usage: node scripts/uniquify-geo-lp-copy.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CITY_FROM_SLUG = {
  'los-angeles': 'Los Angeles',
  'san-diego': 'San Diego',
  'san-francisco': 'San Francisco',
  'san-jose': 'San Jose',
  sacramento: 'Sacramento',
  oakland: 'Oakland',
  'orange-county': 'Orange County',
  austin: 'Austin',
  houston: 'Houston',
  dallas: 'Dallas',
  'fort-worth': 'Fort Worth',
  'san-antonio': 'San Antonio',
  miami: 'Miami',
  orlando: 'Orlando',
  philadelphia: 'Philadelphia',
  texas: 'Texas',
  florida: 'Florida',
  pennsylvania: 'Pennsylvania',
  california: 'California',
};

function localeFromRel(rel) {
  const base = path.basename(rel, '.html');
  for (const [slug, label] of Object.entries(CITY_FROM_SLUG)) {
    if (base.includes(slug)) return label;
  }
  return null;
}

function uniquifyMain(html, locale) {
  const m = html.match(/^([\s\S]*?<main\b[^>]*>)([\s\S]*?)(<\/main>[\s\S]*)$/i);
  if (!m) return html;
  let main = m[2];
  main = main.replace(/<p(\b[^>]*)>([\s\S]*?)<\/p>/gi, (full, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 60) return full;
    if (new RegExp(locale, 'i').test(text)) return full;
    // Skip short UI / CTA-only lines that already vary by button markup
    if (/^book free|^take free|^learn more/i.test(text)) return full;
    const injected = `In ${locale}, ${inner.charAt(0).toLowerCase()}${inner.slice(1)}`;
    return `<p${attrs}>${injected}</p>`;
  });
  // FAQ answers inside <dd> / answer paragraphs
  main = main.replace(/<(dd|li)(\b[^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 80) return full;
    if (new RegExp(locale, 'i').test(text)) return full;
    if (!/^yes|^no|^stimulant|^external|^good adhd|^siya health/i.test(text)) return full;
    const injected = `For adults in ${locale}: ${inner}`;
    return `<${tag}${attrs}>${injected}</${tag}>`;
  });
  return m[1] + main + m[3];
}

const targets = [];
for (const f of fs.readdirSync(path.join(ROOT, 'blog'))) {
  if (/^adhd-treatment-.*\.(ca|tx|fl|pa)\.html$/.test(f) || f === 'adhd-treatment-texas.html') {
    targets.push(path.join('blog', f));
  }
}
for (const f of fs.readdirSync(ROOT)) {
  if (/^adhd-diagnosis-.*\.html$/.test(f)) targets.push(f);
}

let n = 0;
for (const rel of targets) {
  const locale = localeFromRel(rel);
  if (!locale) continue;
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const before = fs.readFileSync(full, 'utf8');
  const after = uniquifyMain(before, locale);
  if (after !== before) {
    fs.writeFileSync(full, after, 'utf8');
    n += 1;
    console.log('OK', rel, '→', locale);
  }
}
console.log(`Uniquified ${n} geo landing pages`);
