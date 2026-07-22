/**
 * Apply content hierarchy — priority page cluster bridges, architecture report.
 * Run after generate-answer-pages.mjs and apply-blog-internal-linking.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ALL_TOPIC_CLUSTERS,
  CONSOLIDATION_RECOMMENDATIONS,
  PRIORITY_INFORMATIONAL_PATHS,
  clusterForGuide,
} from '../data/content-topic-clusters.mjs';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import { BLOG_HUB_FILES } from '../data/blog-internal-linking.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(SITE_ROOT, 'blog');
const DOCS = path.join(SITE_ROOT, 'docs');

function guideQuestion(slug) {
  return ANSWER_SEEDS.find((s) => s.slug === slug)?.question || slug.replace(/-/g, ' ');
}

function clusterForBlog(blogPath) {
  return ALL_TOPIC_CLUSTERS.find(
    (c) => c.cornerstoneBlog === blogPath || c.blogs.includes(blogPath),
  );
}

function renderBlogClusterBridge(cluster, blogPath) {
  const isCornerstone = cluster.cornerstoneBlog === blogPath;
  const guideQ = guideQuestion(cluster.cornerstoneGuide);
  return `            <aside class="topic-cluster-bridge" aria-label="Topic cluster navigation">
              <p class="topic-cluster-bridge-label">Topic cluster: ${cluster.name}</p>
              <ul>
                <li><a href="/answers/${cluster.cornerstoneGuide}">${guideQ}</a> <span class="topic-cluster-badge">Cornerstone guide</span></li>
                ${isCornerstone ? '' : `<li><a href="${cluster.cornerstoneBlog}">Read the cornerstone clinical article</a></li>`}
                <li><a href="${cluster.service}">Explore care options</a></li>
                ${cluster.screening ? `<li><a href="${cluster.screening}">Free ADHD screening</a></li>` : ''}
                <li><a href="/answers#cluster-${cluster.id}">All guides in this cluster</a></li>
              </ul>
            </aside>`;
}

const BRIDGE_RE = /<aside class="topic-cluster-bridge"[\s\S]*?<\/aside>/;

function upsertBlogBridge(html, bridge) {
  if (BRIDGE_RE.test(html)) return html.replace(BRIDGE_RE, bridge.trim());
  if (html.includes('class="related-articles"')) {
    return html.replace(
      /(<section class="related-articles"[\s\S]*?<\/section>)/,
      `$1\n${bridge.trim()}`,
    );
  }
  return html.replace(/<\/div>\s*<\/div>\s*<\/article>/, `${bridge.trim()}\n          </div>\n        </div>\n      </article>`);
}

function processPriorityBlogs() {
  const results = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.html') || BLOG_HUB_FILES.has(file)) continue;
    const blogPath = `/blog/${file.replace(/\.html$/, '')}`;
    if (!PRIORITY_INFORMATIONAL_PATHS.has(blogPath)) continue;

    const cluster = clusterForBlog(blogPath);
    if (!cluster) continue;

    const filePath = path.join(BLOG_DIR, file);
    let html = fs.readFileSync(filePath, 'utf8');
    const bridge = renderBlogClusterBridge(cluster, blogPath);
    html = upsertBlogBridge(html, bridge);
    fs.writeFileSync(filePath, html, 'utf8');
    results.push({ blogPath, cluster: cluster.id });
  }
  return results;
}

function writeArchitectureReport(blogPatches) {
  const clusterSummary = ALL_TOPIC_CLUSTERS.map((c) => ({
    name: c.name,
    cornerstoneGuide: `/answers/${c.cornerstoneGuide}`,
    cornerstoneBlog: c.cornerstoneBlog,
    guideCount: c.guides.length,
    blogCount: c.blogs.length,
    service: c.service,
  }));

  const body = `# Content architecture report

Generated: ${new Date().toISOString()}

## Summary

- **Topic clusters defined:** ${ALL_TOPIC_CLUSTERS.length} (ADHD, metabolic, energy, hormone)
- **Priority informational URLs:** ${PRIORITY_INFORMATIONAL_PATHS.size}
- **Priority blogs patched with cluster bridges:** ${blogPatches.length}
- **Consolidation recommendations:** ${CONSOLIDATION_RECOMMENDATIONS.length} (recommend only — no pages removed)

## Answers hub structure

\`/answers\` now includes:

1. **Topic cluster explorer** — cornerstone guide + article + service links per cluster
2. **Category sections** — existing metabolic / energy / hormone / ADHD / telehealth groupings
3. **Per-guide cluster navigation** — each clustered answer page links siblings, cornerstone blog, and care pathways

## Topic clusters

| Cluster | Cornerstone guide | Cornerstone blog | Guides | Service |
|---------|-------------------|------------------|--------|---------|
${clusterSummary.map((c) => `| ${c.name} | ${c.cornerstoneGuide} | ${c.cornerstoneBlog} | ${c.guideCount} | ${c.service} |`).join('\n')}

## Consolidation recommendations (answer ↔ blog overlap)

These pairs target **essentially the same search intent**. Keep the canonical URL; strengthen internal links from the merge candidate. Do **not** create new pages.

| Keep (canonical) | Defer / merge candidate | Reason |
|----------------|-------------------------|--------|
${CONSOLIDATION_RECOMMENDATIONS.map((r) => `| ${r.keep} | ${r.merge} | ${r.reason} |`).join('\n')}

## Priority pages strengthened

${[...PRIORITY_INFORMATIONAL_PATHS].map((p) => `- ${p}`).join('\n')}

## Blog cluster bridges applied

${blogPatches.length ? blogPatches.map((b) => `- ${b.blogPath} → cluster \`${b.cluster}\``).join('\n') : '_None_'}

## Next steps (editorial, not automated)

1. When consolidating, add a visible banner on merge candidates pointing to the canonical page (no content rewrites required).
2. Request indexing recrawl for \`/answers\` and cornerstone guides after deploy.
3. Monitor Search Console for reduced "Discovered – not indexed" on cluster hub paths first.
`;

  fs.writeFileSync(path.join(DOCS, 'CONTENT-ARCHITECTURE-REPORT.md'), body, 'utf8');
  console.log('Wrote docs/CONTENT-ARCHITECTURE-REPORT.md');
}

function main() {
  const blogPatches = processPriorityBlogs();
  writeArchitectureReport(blogPatches);
  console.log(`Content hierarchy: ${blogPatches.length} priority blogs patched; ${ALL_TOPIC_CLUSTERS.length} clusters active`);
}

main();
