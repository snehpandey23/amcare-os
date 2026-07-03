/**
 * Apply blog internal linking — Related Articles, master index, crawl paths.
 * Run: node scripts/apply-blog-internal-linking.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BLOG_HUB_FILES,
  loadBlogRegistry,
  landingForTopic,
  pickRelatedArticles,
  renderMasterIndexHtml,
  renderRelatedArticlesSection,
  topicFromBlog,
} from '../data/blog-internal-linking.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(SITE_ROOT, 'blog');

const CONTINUE_READING_RE = /<section class="continue-reading"[\s\S]*?<\/section>/;
const RELATED_ARTICLES_RE = /<section class="related-articles"[\s\S]*?<\/section>/;

function upsertRelatedArticles(html, section) {
  if (RELATED_ARTICLES_RE.test(html)) {
    return html.replace(RELATED_ARTICLES_RE, section.trim());
  }
  if (CONTINUE_READING_RE.test(html)) {
    return html.replace(CONTINUE_READING_RE, section.trim());
  }
  if (html.includes('class="related-health-guides"')) {
    return html.replace(
      /<section class="related-health-guides"/,
      `${section.trim()}\n            <section class="related-health-guides"`,
    );
  }
  if (html.includes('<section class="continue-reading"')) {
    return html.replace(CONTINUE_READING_RE, section.trim());
  }
  return html.replace(/<\/div>\s*<\/div>\s*<\/article>/, `${section.trim()}\n          </div>\n        </div>\n      </article>`);
}

function processBlogArticle(filename, registry) {
  const slug = filename.replace(/\.html$/, '');
  const filePath = path.join(BLOG_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf8');
  const topic = topicFromBlog(slug, registry.find((e) => e.slug === slug)?.title || '');
  const related = pickRelatedArticles(slug, registry, 3);
  const landing = landingForTopic(topic);
  const section = renderRelatedArticlesSection({ articles: related, landing });

  const hadRelated = RELATED_ARTICLES_RE.test(html);
  const hadContinue = CONTINUE_READING_RE.test(html);
  html = upsertRelatedArticles(html, section);
  fs.writeFileSync(filePath, html, 'utf8');

  const blogLinkCount = (html.match(/href="\/blog\/[^"]+"/g) || [])
    .filter((h) => !/\/blog\/(adhd|weight-loss|telehealth)"/.test(h))
    .length;

  return {
    slug,
    topic,
    relatedCount: related.length,
    relatedSlugs: related.map((r) => r.slug),
    landing: landing.href,
    hadRelated,
    hadContinue,
    blogLinkCount,
    ok: related.length >= 3 && html.includes(landing.href),
  };
}

function updateBlogIndex(registry) {
  const indexPath = path.join(BLOG_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const block = renderMasterIndexHtml(registry);

  if (html.includes('SIYA:BLOG-MASTER-INDEX')) {
    html = html.replace(/<!-- SIYA:BLOG-MASTER-INDEX -->[\s\S]*?<!-- \/SIYA:BLOG-MASTER-INDEX -->/, block);
  } else if (html.includes('blog-master-index')) {
    html = html.replace(
      /<section class="section blog-index blog-master-index"[\s\S]*?<\/section>/,
      block.trim(),
    );
  } else {
    html = html.replace(
      /<section class="section blog-index">\s*<div class="container">\s*<div class="section-header" style="text-align: center;">\s*<h2>Master article index<\/h2>[\s\S]*?<\/section>/,
      block.trim(),
    );
  }

  fs.writeFileSync(indexPath, html, 'utf8');
}

function main() {
  const registry = loadBlogRegistry(BLOG_DIR);
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.html') && !BLOG_HUB_FILES.has(f));
  const results = files.map((f) => processBlogArticle(f, registry));
  updateBlogIndex(registry);

  const failing = results.filter((r) => !r.ok);
  const report = `# Blog internal linking report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Value |
|--------|------:|
| Articles processed | ${results.length} |
| Related Articles sections | ${results.filter((r) => r.hadRelated || r.hadContinue).length} updated |
| Passing (≥3 related + landing) | ${results.filter((r) => r.ok).length} |
| Failures | ${failing.length} |

## Master index

Blog index updated with **${registry.length}** articles across topic groups.

## Failures

${failing.length ? failing.map((r) => `- \`${r.slug}\`: ${r.relatedCount} related, landing ${r.landing}`).join('\n') : '_None_'}

## Sample mappings

${results
  .slice(0, 8)
  .map((r) => `- \`${r.slug}\` → ${r.relatedSlugs.join(', ')} + ${r.landing}`)
  .join('\n')}
`;

  fs.writeFileSync(path.join(SITE_ROOT, 'docs', 'BLOG-INTERNAL-LINKING-REPORT.md'), report, 'utf8');
  console.log(`Blog internal linking: ${results.length} articles; failures: ${failing.length}`);
  if (failing.length) process.exitCode = 1;
}

main();
