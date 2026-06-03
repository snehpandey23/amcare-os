/**
 * Reports SEO critical-fix implementation stats after build.
 * Run: node scripts/seo-critical-fixes-report.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'SEO-CRITICAL-FIXES-REPORT.md');

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['public', 'node_modules', 'scripts', 'data'].includes(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const files = walkHtml(SITE_ROOT);
let navAnswers = 0;
let footerAnswers = 0;
let footerHealthcare = 0;
let continueReading = 0;
let learnMoreAdhd = 0;
let learnMoreWeight = 0;
let answerNextSteps = 0;
let internalLinkAdds = 0;

for (const rel of files) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  if (html.includes('href="/answers">Answers</a>')) {
    if (html.includes('nav-center')) navAnswers++;
    if (html.includes('<footer')) footerAnswers++;
  }
  if (html.includes('Healthcare Services')) footerHealthcare++;
  if (html.includes('class="continue-reading"')) continueReading++;
  if (html.includes('SIYA:LEARN-MORE-ADHD')) learnMoreAdhd++;
  if (html.includes('SIYA:LEARN-MORE-WEIGHT')) learnMoreWeight++;
  if (html.includes('answer-next-steps')) answerNextSteps++;
  internalLinkAdds +=
    (html.match(/href="\/primary-urgent-care"/g) || []).length +
    (html.match(/href="\/labs"/g) || []).length +
    (html.match(/href="\/prescriptions"/g) || []).length +
    (html.match(/href="\/answers\/signs-of-adult-adhd"/g) || []).length +
    (html.match(/href="\/blog\/adhd"/g) || []).length;
}

const report = `# SEO Critical Fixes — Implementation Report

Generated: ${new Date().toISOString().split('T')[0]}

## Components created

| Component | Location |
|-----------|----------|
| Sitewide chrome injector | \`scripts/site-chrome.mjs\` |
| Continue Reading block | \`site-chrome.mjs\` → \`.continue-reading\` |
| Learn More About ADHD | \`adhd-care.html\` (\`#learn-more-adhd\`) |
| Learn More About Medical Weight Loss | \`weight-loss-metabolic-health.html\` |
| Next steps (answer pages) | \`generate-answer-pages.mjs\` → \`.answer-next-steps\` |
| Styles | \`styles.css\` (continue-reading, learn-more, answer-next-steps) |

## Build integration

- \`scripts/seo-build.mjs\` calls \`applySiteChrome()\` on every HTML file
- \`scripts/generate-answer-pages.mjs\` emits Next steps + expanded footer
- Recommended build order: \`generate-answer-pages.mjs\` → \`internal-link-audit.mjs\` → \`seo-build.mjs\` → \`seo-critical-fixes-report.mjs\`

## Pages updated (${files.length} HTML files scanned)

| Metric | Count |
|--------|------:|
| Pages with Answers in primary/mobile nav | ${navAnswers} |
| Pages with Answers in footer | ${footerAnswers} |
| Pages with Healthcare Services footer group | ${footerHealthcare} |
| Blog articles with Continue reading | ${continueReading} |
| ADHD care Learn More section | ${learnMoreAdhd} |
| Weight loss Learn More section | ${learnMoreWeight} |
| Answer pages with Next steps | ${answerNextSteps} |

## Files modified (source)

- \`scripts/site-chrome.mjs\` (new)
- \`scripts/seo-build.mjs\`
- \`scripts/generate-answer-pages.mjs\`
- \`scripts/seo-critical-fixes-report.mjs\` (new)
- \`styles.css\`
- All \`*.html\` under \`apps/siya-health/\` (via build scripts)

## Internal links added (sitewide occurrences)

Approximate new link instances across all pages: **${internalLinkAdds}** (footer/nav/learn-more/continue-reading; includes repeated chrome).

### Critical link targets now reachable from chrome

- \`/answers\` — global nav + footer
- \`/primary-urgent-care\`, \`/labs\`, \`/prescriptions\` — Healthcare Services footer
- \`/blog/adhd\`, \`/answers/signs-of-adult-adhd\`, \`/creyos-adhd-testing\`, \`/adhd-evaluation-cost\`, state diagnosis blogs — ADHD Learn More
- \`/blog/weight-loss\`, GLP-1 answers — Weight loss Learn More
- Per-blog Continue reading — 3–5 articles + 1 answer + 1 service page
- Answer Next steps — \`/adhd-screening\`, \`/adult-adhd-diagnosis\`, topic service hub
`;

fs.writeFileSync(OUT, report, 'utf8');
console.log('Wrote', OUT);
console.log(report);
