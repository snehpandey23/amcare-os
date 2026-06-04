/**
 * Phase 5 — THIN-GUIDE-EXPANSION-REPORT.md
 * Run: node scripts/thin-guide-expansion-report.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import {
  PHASE5_BEFORE_WORD_COUNTS,
  PHASE5_EXPANSION_SLUGS,
} from '../data/phase5-thin-expansions.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(__dirname, '..', 'docs');

function wordCount(seed) {
  const parts = [
    seed.shortAnswer,
    ...(seed.paragraphs || []),
    ...(seed.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.listItems || [])]),
  ];
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

function sectionHeadings(seed) {
  return (seed.sections || []).map((s) => s.heading);
}

function countInternalLinks(seed) {
  const text = [
    seed.shortAnswer,
    ...(seed.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.listItems || [])]),
    ...(seed.learnMore || []).map((l) => l.href),
  ].join(' ');
  const answerLinks = (text.match(/\/answers\/[a-z0-9-]+/g) || []).length;
  const blogLinks = (text.match(/\/blog\/[a-z0-9-]+/g) || []).length;
  const serviceLinks = (text.match(/\/(adhd-care|weight-loss-metabolic-health|telehealth|mens-health-longevity|adult-adhd-diagnosis|prescriptions)[^"'\\s]*/g) || []).length;
  return {
    learnMore: (seed.learnMore || []).length,
    related: (seed.related || []).length,
    answerLinks,
    blogLinks,
    serviceLinks,
  };
}

const expanded = PHASE5_EXPANSION_SLUGS.map((slug) => {
  const seed = ANSWER_SEEDS.find((s) => s.slug === slug);
  if (!seed) throw new Error(`Missing seed: ${slug}`);
  const before = PHASE5_BEFORE_WORD_COUNTS[slug] ?? 0;
  const after = wordCount(seed);
  const links = countInternalLinks(seed);
  return {
    slug,
    question: seed.question,
    topic: seed.topic,
    before,
    after,
    delta: after - before,
    sections: sectionHeadings(seed),
    faqCount: (seed.faqs || []).length + 1,
    links,
  };
});

const allThin = ANSWER_SEEDS.map((s) => ({ slug: s.slug, words: wordCount(s), topic: s.topic }))
  .filter((x) => x.words < 300)
  .sort((a, b) => a.words - b.words);

const remainingThin = allThin.filter((x) => !PHASE5_EXPANSION_SLUGS.includes(x.slug));

let buildStatus = 'not run';
try {
  const { execSync } = await import('child_process');
  execSync('node scripts/generate-answer-pages.mjs', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
  });
  buildStatus = 'PASS — generate-answer-pages.mjs';
} catch (e) {
  buildStatus = `FAIL — ${e.message?.slice(0, 200)}`;
}

const lines = [
  '# Thin Health Guide expansion — Phase 5 report',
  '',
  '**Goal:** Expand thin existing Health Guides (no new URLs, no new blogs).',
  `**Date:** ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## Summary',
  '',
  `| Metric | Value |`,
  `|--------|-------|`,
  `| Guides expanded (Phase 5) | ${expanded.length} |`,
  `| Target word range | 500–900 |`,
  `| Expanded guides now ≥500 words | ${expanded.filter((e) => e.after >= 500).length} / ${expanded.length} |`,
  `| Total Health Guides | ${ANSWER_SEEDS.length} |`,
  `| Still under 300 words (all guides) | ${allThin.length} |`,
  `| Build status | ${buildStatus} |`,
  '',
  '## Pages expanded',
  '',
  '| Slug | Before | After | Δ | Sections | FAQ entities |',
  '|------|--------|-------|---|----------|--------------|',
  ...expanded.map(
    (e) =>
      `| [\`${e.slug}\`](/answers/${e.slug}) | ${e.before} | ${e.after} | +${e.delta} | ${e.sections.length} | ${e.faqCount} |`,
  ),
  '',
  '## Sections added (by guide)',
  '',
  ...expanded.flatMap((e) => [
    `### ${e.slug}`,
    '',
    ...e.sections.map((h) => `- ${h}`),
    '',
  ]),
  '',
  '## FAQ schema updates',
  '',
  'Each expanded guide now includes **5–6 `FAQPage` entities** (primary question + `seed.faqs`). Regenerated on every `npm run build`.',
  '',
  ...expanded.map((e) => `- **${e.slug}:** ${e.faqCount} FAQ entities`),
  '',
  '## Internal links added',
  '',
  '| Slug | learnMore | related | In-copy /answers | In-copy /blog | Service paths |',
  '|------|-----------|---------|------------------|---------------|---------------|',
  ...expanded.map(
    (e) =>
      `| ${e.slug} | ${e.links.learnMore} | ${e.links.related} | ${e.links.answerLinks} | ${e.links.blogLinks} | ${e.links.serviceLinks} |`,
  ),
  '',
  '## Remaining thin pages (<300 words)',
  '',
  remainingThin.length
    ? `| Words | Slug | Topic |\n|-------|------|-------|\n${remainingThin.map((r) => `| ${r.words} | ${r.slug} | ${r.topic} |`).join('\n')}`
    : '_None — all guides meet 300+ word threshold._',
  '',
  '## Implementation',
  '',
  '- Seed patches: `data/phase5-thin-expansions.mjs` merged in `data/answer-seeds.mjs`',
  '- Visual engagement preserved via `answer-engagement-system.mjs` on rebuild',
  '- Physician review status unchanged (`clinical-review--pending` until signed)',
  '',
  '## Next batch (suggested priority)',
  '',
  remainingThin
    .slice(0, 15)
    .map((r, i) => `${i + 1}. \`${r.slug}\` (${r.words} words) — ${r.topic}`)
    .join('\n') || '_N/A_',
  '',
];

fs.writeFileSync(path.join(DOCS, 'THIN-GUIDE-EXPANSION-REPORT.md'), lines.join('\n'));
console.log('Wrote THIN-GUIDE-EXPANSION-REPORT.md');
console.log('Expanded:', expanded.length, '| ≥500w:', expanded.filter((e) => e.after >= 500).length);
console.log('Remaining <300w:', remainingThin.length);
