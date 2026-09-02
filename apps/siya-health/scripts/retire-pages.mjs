#!/usr/bin/env node
/**
 * Retire pages: write noindex stubs, register permanent redirects.
 *
 * Two kinds of retirement, one mechanism:
 *   1. Geo clones      (data/geo-consolidation.mjs)  — no unique value, consolidate into state canonical.
 *   2. Superseded content (data/retired-content.mjs) — had value, handed over to a Canonical Entity Page.
 *
 * Never invents unique copy to justify keeping a page, and never merges an old
 * blog architecture into a new entity architecture. Runs FIRST in the build so
 * every later generator sees a stub instead of a live page.
 *
 * Usage: node scripts/retire-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GEO_CLONE_REDIRECTS, GEO_CLONE_STATS } from '../data/geo-consolidation.mjs';
import { RETIRED_CONTENT_REDIRECTS, RETIRED_CONTENT_STATS } from '../data/retired-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** source path → { destination, note } for every retirement kind. */
const ALL_RETIREMENTS = {
  ...Object.fromEntries(
    Object.entries(GEO_CLONE_REDIRECTS).map(([from, destination]) => [
      from,
      { destination, note: 'geo clone retirement' },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(RETIRED_CONTENT_REDIRECTS).map(([from, spec]) => [
      from,
      { destination: spec.destination, note: `superseded by the ${spec.entity} canonical entity page` },
    ]),
  ),
};

function pathToFile(urlPath) {
  const clean = urlPath.replace(/^\//, '');
  return path.join(ROOT, `${clean}.html`);
}

function stubHtml(dest, note) {
  const slug = dest.replace(/^\//, '').replace(/\//g, ' · ');
  const title = slug ? `Moved to ${slug} — Siya Health` : 'Moved — Siya Health';
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${title}</title>
    <link rel="canonical" href="https://siya.health${dest}" />
    <meta http-equiv="refresh" content="0;url=${dest}" />
    <script>location.replace('${dest}');</script>
  </head>
  <body>
    <p>This page was retired (${note}). Continues at <a href="${dest}">${dest}</a>.</p>
  </body>
</html>
`;
}

function upsertVercelRedirects() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const existing = new Set(vercel.redirects.map((r) => r.source));
  let added = 0;
  for (const [source, { destination }] of Object.entries(ALL_RETIREMENTS)) {
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
  for (const [from, { destination: to }] of Object.entries(ALL_RETIREMENTS)) {
    const key = `'${from}'`;
    if (src.includes(key)) {
      src = src.replace(new RegExp(`${key}\\s*:\\s*'[^']*'`), `${key}: '${to}'`);
    } else {
      src = src.replace(
        /\/\/ EG-P0-01:[^\n]*\n\s*'\/blog\/adult-adhd-treatment-california-2026': '\/adult-adhd-california',/,
        (m) => `${m}\n  '${from}': '${to}',`,
      );
      if (!src.includes(key)) {
        // Fallback: insert after the modafinil line
        src = src.replace(
          /('\/blog\/modafinil-for-focus-and-fatigue-is-it-safe': '[^']*',)/,
          `$1\n  '${from}': '${to}',`,
        );
      }
    }
  }
  fs.writeFileSync(mapPath, src);
}

let stubs = 0;
let skipped = 0;
for (const [from, { destination, note }] of Object.entries(ALL_RETIREMENTS)) {
  const file = pathToFile(from);
  // Some retirements predate the file being deleted; redirect registration is enough.
  if (!fs.existsSync(file) && !fs.existsSync(path.dirname(file))) {
    skipped += 1;
    continue;
  }
  fs.writeFileSync(file, stubHtml(destination, note));
  stubs += 1;
}

const added = upsertVercelRedirects();
upsertRedirectMap();

console.log(
  JSON.stringify(
    {
      stubsWritten: stubs,
      stubsSkippedMissingDir: skipped,
      vercelRedirectsAdded: added,
      ...GEO_CLONE_STATS,
      ...RETIRED_CONTENT_STATS,
    },
    null,
    2,
  ),
);
