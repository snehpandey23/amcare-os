#!/usr/bin/env node
/**
 * Retire geo clone LPs: write noindex stubs, register redirects.
 * Does NOT invent unique local copy — clones without unique value redirect.
 *
 * Usage: node scripts/retire-geo-clones.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GEO_CLONE_REDIRECTS, GEO_CLONE_STATS } from '../data/geo-consolidation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function pathToFile(urlPath) {
  const clean = urlPath.replace(/^\//, '');
  return path.join(ROOT, `${clean}.html`);
}

function stubHtml(dest) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Moved — Siya Health</title>
    <link rel="canonical" href="https://siya.health${dest}" />
    <meta http-equiv="refresh" content="0;url=${dest}" />
    <script>location.replace('${dest}');</script>
  </head>
  <body>
    <p>This page was consolidated (geo clone retirement). Continues at <a href="${dest}">${dest}</a>.</p>
  </body>
</html>
`;
}

function upsertVercelRedirects() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const existing = new Set(vercel.redirects.map((r) => r.source));
  let added = 0;
  for (const [source, destination] of Object.entries(GEO_CLONE_REDIRECTS)) {
    if (existing.has(source)) {
      const row = vercel.redirects.find((r) => r.source === source);
      if (row) {
        row.destination = destination;
        row.permanent = true;
      }
      continue;
    }
    // Insert before the catch-all host redirect at the end
    const hostIdx = vercel.redirects.findIndex((r) => r.has);
    const entry = { source, destination, permanent: true };
    if (hostIdx >= 0) vercel.redirects.splice(hostIdx, 0, entry);
    else vercel.redirects.push(entry);
    added += 1;
  }
  fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + '\n');
  return added;
}

function upsertRedirectMap() {
  const mapPath = path.join(ROOT, 'data', 'redirect-map.mjs');
  let src = fs.readFileSync(mapPath, 'utf8');
  // Ensure each GEO_CLONE_REDIRECTS entry is in RAW
  for (const [from, to] of Object.entries(GEO_CLONE_REDIRECTS)) {
    const key = `'${from}'`;
    if (src.includes(key)) {
      src = src.replace(new RegExp(`${key}\\s*:\\s*'[^']*'`), `${key}: '${to}'`);
    } else {
      src = src.replace(
        /\/\/ EG-P0-01:[^\n]*\n\s*'\/blog\/adult-adhd-treatment-california-2026': '\/adhd-care',/,
        (m) => `${m}\n  '${from}': '${to}',`,
      );
      if (!src.includes(key)) {
        // Fallback: insert after modafinil line
        src = src.replace(
          /('\/blog\/modafinil-for-focus-and-fatigue-is-it-safe': '\/adhd-care',)/,
          `$1\n  '${from}': '${to}',`,
        );
      }
    }
  }
  fs.writeFileSync(mapPath, src);
}

let stubs = 0;
for (const [from, to] of Object.entries(GEO_CLONE_REDIRECTS)) {
  const file = pathToFile(from);
  fs.writeFileSync(file, stubHtml(to));
  stubs += 1;
}

const added = upsertVercelRedirects();
upsertRedirectMap();

console.log(
  JSON.stringify(
    {
      stubsWritten: stubs,
      vercelRedirectsAdded: added,
      ...GEO_CLONE_STATS,
    },
    null,
    2,
  ),
);
