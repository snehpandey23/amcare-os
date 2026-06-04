/**
 * Audits all Health Guides and writes HEALTH-GUIDE-VISUAL-AUDIT.md
 * Run: node scripts/health-guide-visual-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import { buildHealthGuideEngagement, ENGAGE_COMPONENTS } from './answer-engagement-system.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(__dirname, '..', 'docs');
const ANSWERS = path.join(__dirname, '..', 'answers');

function countEngageInHtml(html) {
  const types = {
    flowchart: (html.match(/blog-engage--flowchart/g) || []).length,
    decision: (html.match(/blog-engage--decision/g) || []).length,
    comparison: (html.match(/blog-engage--comparison/g) || []).length,
    myth: (html.match(/blog-engage--myth/g) || []).length,
    evidence: (html.match(/blog-engage--evidence/g) || []).length,
    pearl: (html.match(/blog-engage--pearl/g) || []).length,
    infographic: (html.match(/blog-engage--infographic/g) || []).length,
    takeaway: (html.match(/blog-engage--takeaway/g) || []).length,
  };
  return { total: Object.values(types).reduce((a, b) => a + b, 0), types };
}

const rows = [];
const densityBuckets = { high: [], medium: [], low: [] };
const noVisualBefore = [];
const lowEngagement = [];

for (const seed of ANSWER_SEEDS) {
  const plan = buildHealthGuideEngagement(seed).audit;
  const htmlPath = path.join(ANSWERS, `${seed.slug}.html`);
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
  const engage = countEngageInHtml(html);

  densityBuckets[plan.density].push(seed.slug);
  if (plan.noVisualBefore) noVisualBefore.push(seed.slug);
  if (plan.engagementPotential === 'low') lowEngagement.push(seed.slug);

  const recommendedSecondary =
    plan.midType === 'myth'
      ? 'Myth vs reality card'
      : plan.midType === 'pearl'
        ? 'Clinical pearl callout'
        : 'Key takeaway strip';

  rows.push({
    slug: seed.slug,
    question: plan.question,
    aboveType: plan.aboveFoldType,
    abovePlacement: plan.aboveFoldPlacement,
    aboveComponent: `blog-engage--${plan.aboveFoldComponent === 'symptomFlowchart' ? 'flowchart' : plan.aboveFoldComponent === 'comparisonTable' ? 'comparison' : plan.aboveFoldComponent === 'miniInfographic' ? 'infographic' : plan.aboveFoldComponent}`,
    midType: plan.midType,
    midComponent: `blog-engage--${plan.midComponent === 'mythVsReality' ? 'myth' : plan.midComponent === 'clinicalPearl' ? 'pearl' : plan.midComponent}`,
    evidenceComponent: 'blog-engage--evidence',
    decisionComponent: 'blog-engage--decision',
    copy: plan.supportingCopy,
    density: plan.density,
    words: plan.wordCount,
    sections: plan.sectionCount,
    engageTotal: engage.total,
    potential: plan.engagementPotential,
    hadTextDecision: plan.hadDecisionSection ? 'yes (seed)' : 'generator',
  });
}

const excessive = rows.filter((r) => r.density === 'high' && r.words > 850);
const sparse = rows.filter((r) => r.density === 'low' || r.words < 350);
const noBreaksLegacy = rows.filter((r) => r.engageTotal === 0);

let md = `# Health Guide visual audit

**Scope:** ${ANSWER_SEEDS.length} Health Guides (\`/answers/*\`)  
**Generated:** ${new Date().toISOString()}  
**Implementation:** \`scripts/answer-engagement-system.mjs\` → \`generate-answer-pages.mjs\`

## Component registry (reusable)

| Visual type | CSS / class | Builder |
|-------------|-------------|---------|
| Symptom flowchart | \`blog-engage--flowchart\` | \`symptomFlowchart()\` |
| Decision tree | \`blog-engage--decision\` | \`decisionTree()\` |
| Comparison table | \`blog-engage--comparison\` | \`comparisonTable()\` |
| Myth vs reality | \`blog-engage--myth\` | \`mythVsReality()\` |
| Evidence snapshot | \`blog-engage--evidence\` | \`evidenceSnapshot()\` |
| Clinical pearl | \`blog-engage--pearl\` | \`clinicalPearl()\` |
| Mini infographic | \`blog-engage--infographic\` | \`miniInfographic()\` |
| Key takeaway | \`blog-engage--takeaway\` | \`keyTakeaway()\` |

## Placement standard (all guides post-implementation)

| Requirement | Placement | Component |
|-------------|-----------|-----------|
| ≥1 above-the-fold visual | After \`#short-answer\` | flowchart / infographic / comparison |
| ≥1 decision support | After main sections | \`decisionTree\` |
| ≥1 evidence summary | Inside \`#evidence\` before bullet list | \`evidenceSnapshot\` |
| Mid visual break | After section 2 (or section 1 if only one) | myth / pearl |

## Summary counts

| Metric | Count |
|--------|------:|
| High text density (>900 words) | ${densityBuckets.high.length} |
| Medium density (500–900) | ${densityBuckets.medium.length} |
| Low density (<500) | ${densityBuckets.low.length} |
| Low engagement potential (flagged) | ${lowEngagement.length} |
| Guides with 0 engagement blocks (post-build HTML) | ${noBreaksLegacy.length} |

## Guides with high text density (watch wall-of-text)

${excessive.map((r) => `- \`${r.slug}\` (${r.words} words)`).join('\n') || '_None_'}

## Guides with low density / short copy (boost visuals)

${sparse.map((r) => `- \`${r.slug}\` (${r.words} words, ${r.potential} potential)`).join('\n') || '_None_'}

## Low engagement potential (telehealth logistics / thin copy)

${lowEngagement.map((s) => `- \`${s}\``).join('\n') || '_None_'}

---

## Per-guide recommendations

| Guide | Above-fold visual | Placement | Mid break | Decision | Evidence card | Density | Words | Engage blocks |
|-------|-------------------|-----------|-----------|----------|---------------|---------|------:|-------------:|
${rows
  .map(
    (r) =>
      `| [${r.slug}](/answers/${r.slug}) | ${r.aboveType} | ${r.abovePlacement} | ${r.midType} | ${r.decisionComponent} | ${r.evidenceComponent} | ${r.density} | ${r.words} | ${r.engageTotal} |`,
  )
  .join('\n')}

---

## Per-guide detail

${rows
  .map(
    (r) => `### ${r.question}

- **Slug:** \`${r.slug}\`
- **Recommended above-fold:** ${r.aboveType} → \`${r.aboveComponent}\`
- **Placement:** ${r.abovePlacement}
- **Mid visual:** ${r.midType} → \`${r.midComponent}\`
- **Decision support:** \`${r.decisionComponent}\` (after sections)
- **Evidence snapshot:** \`${r.evidenceComponent}\` (before reference bullets)
- **Supporting copy hook:** ${r.copy}
- **Text density:** ${r.density} (${r.words} words, ${r.sections} sections)
- **Engagement potential:** ${r.potential}
- **Text decision section in seed:** ${r.hadTextDecision}

`,
  )
  .join('\n')}

## Notes

- Re-run \`npm run build\` then this script to refresh \`Engage blocks\` column from generated HTML.
- Tier-1 overrides: \`poor-sleep-feels-like-adhd\`, \`brain-fog-after-eating\`, Phase 3 slugs, \`adderall-vs-vyvanse\`, \`tirzepatide-vs-semaglutide\`.
- No new URLs; no blog posts.
`;

fs.writeFileSync(path.join(DOCS, 'HEALTH-GUIDE-VISUAL-AUDIT.md'), md);
console.log('Wrote HEALTH-GUIDE-VISUAL-AUDIT.md', rows.length, 'guides');
