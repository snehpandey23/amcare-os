/**
 * Apply contextual internal links from ADHD authority hubs to commercial landing pages.
 * Run after phase7-link-remediation.mjs (preserves commercial LP hrefs).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  renderBlogAdhdCarePathwaysSection,
  renderOnlineTestCrossLinks,
  renderShadowLpGeoContext,
} from '../data/adhd-commercial-links.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function upsertMarkedBlock(html, markerName, block) {
  const open = `<!-- SIYA:${markerName} -->`;
  const close = `<!-- /SIYA:${markerName} -->`;
  const re = new RegExp(`${open.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${close.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  if (re.test(html)) return html.replace(re, block.trim());
  return null;
}

function patchFile(relPath, markerName, block, { insertBefore, insertBeforeFallback } = {}) {
  const filePath = path.join(SITE_ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip ${relPath} (missing)`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  const existing = upsertMarkedBlock(html, markerName, block);
  if (existing) {
    fs.writeFileSync(filePath, existing, 'utf8');
    return true;
  }
  for (const anchor of [insertBefore, insertBeforeFallback].filter(Boolean)) {
    if (html.includes(anchor)) {
      html = html.replace(anchor, `${block.trim()}\n${anchor}`);
      fs.writeFileSync(filePath, html, 'utf8');
      return true;
    }
  }
  console.warn(`  could not place ${markerName} in ${relPath}`);
  return false;
}

function main() {
  const results = [];

  // adhd-care.html: pathways hub block retired in desktop polish (Suggested Reading replaces it)

  results.push(
    patchFile('blog/adhd.html', 'ADHD-BLOG-CARE-PATHWAYS', renderBlogAdhdCarePathwaysSection(), {
      insertBefore: '<p class="blog-hub-see-all">',
    }),
  );

  for (const rel of ['adult-adhd-diagnosis.html', 'adhd-treatment-online.html', 'adhd-evaluation-cost.html']) {
    results.push(
      patchFile(rel, 'ADHD-SHADOW-GEO-CONTEXT', renderShadowLpGeoContext(), {
        insertBefore: '<!-- SIYA:MEET-PHYSICIANS -->',
        insertBeforeFallback: '    </main>',
      }),
    );
  }

  results.push(
    patchFile('online-adhd-test.html', 'ADHD-ONLINE-TEST-CROSS-LINKS', renderOnlineTestCrossLinks(), {
      insertBefore: '<!-- SIYA:MEET-PHYSICIANS -->',
    }),
  );

  const ok = results.filter(Boolean).length;
  console.log(`ADHD hub linking: patched ${ok}/${results.length} pages`);
}

main();
