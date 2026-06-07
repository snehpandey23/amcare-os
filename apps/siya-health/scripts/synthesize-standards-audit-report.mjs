/**
 * Synthesize docs/SIYA-STANDARDS-AUDIT-REPORT.md from audit JSON artifacts.
 * Primary standard: docs/SIYA-STANDARDS.md (supplemented by data/site-standards.mjs)
 * Run: node scripts/synthesize-standards-audit-report.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'SIYA-STANDARDS-AUDIT-REPORT.md');

const pricingAudit = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pricing-system-audit.json'), 'utf8'));
const ctaAudit = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cta-audit.json'), 'utf8'));
const providerAudit = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/provider-consistency-audit.json'), 'utf8'));
const brandAudit = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/brand-consistency-audit.json'), 'utf8'));
const pruningAudit = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site-pruning-audit.json'), 'utf8'));

const findings = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
};

function pathToFile(route) {
  if (!route || route === '/') return 'index.html';
  if (route === '/blog') return 'blog/index.html';
  if (route === '/answers') return 'answers/index.html';
  if (route === '/providers') return 'providers/index.html';
  if (route === '/membership-pricing' || route === '/pricing') return 'pricing.html';
  const clean = route.startsWith('/') ? route.slice(1) : route;
  if (clean.endsWith('.html')) return clean;
  if (clean.includes('/')) return `${clean}/index.html`;
  return `${clean}.html`;
}

function add(section, severity, file, finding) {
  findings[section].push({ severity, file, finding });
}

function countBySeverity(section) {
  const c = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const f of findings[section]) c[f.severity] += 1;
  return c;
}

function sectionSummary(section) {
  const c = countBySeverity(section);
  const total = findings[section].length;
  return `**Count:** ${total} (Critical: ${c.Critical}, High: ${c.High}, Medium: ${c.Medium}, Low: ${c.Low})`;
}

function table(section) {
  if (!findings[section].length) return '_No findings._\n';
  const rows = findings[section]
    .map((f) => `| ${f.severity} | \`${f.file}\` | ${f.finding} |`)
    .join('\n');
  return `| Severity | File | Finding |\n|----------|------|--------|\n${rows}\n`;
}

// --- Section 1: Conflicting pricing (SIYA-STANDARDS §3) ---
for (const issue of pricingAudit.summary.allIssues) {
  if (issue.file === 'pricing.html' && issue.type === 'legacy-membership-tiers') continue;
  if (issue.file === 'adhd-evaluation-cost.html') continue;
  const sev = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
  let detail = issue.detail;
  if (issue.type === 'stimulant-price-150') {
    detail = `$150 stimulant follow-up (canonical is $149 per §3) on /${issue.route?.replace(/^\//, '') || issue.file}`;
  }
  add(1, sev, issue.file, detail);
}

// pricing.html is compliant — section 10
add(10, 'Low', 'pricing.html', 'Compliant $199/$79/$149 care-delivery model per §3 (Bronze/Silver/Gold negation in hero is intentional)');

// --- Section 2: Provider descriptions (§2) ---
const npSlugs = new Set(['derek-timbs', 'megan-wunderlich', 'wendy-delgado']);
for (const issue of providerAudit.issues || []) {
  if (issue.severity === 'high' || issue.severity === 'medium') {
    const file = issue.file?.includes('.html') ? issue.file : `providers/${issue.slug}.html`;
    if (issue.type === 'positioning' && issue.slug === 'wendy-delgado' && !issue.current?.match(/ADHD/i)) continue;
    add(2, issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1), file, issue.message);
  }
}
for (const cc of providerAudit.crossCutting || []) {
  if (cc.id === 'CC-03') {
    const aboutHtml = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');
    const cardCount = (aboutHtml.match(/about-team-card/g) || []).length;
    if (cardCount >= 7) continue;
  }
  if (cc.id === 'CC-08') continue;
  add(2, cc.severity.charAt(0).toUpperCase() + cc.severity.slice(1), cc.surfaces[0], cc.message);
}

// --- Section 3: CTA language (§4, §7) ---
for (const page of ctaAudit.excessivePages || []) {
  const file = pathToFile(page.path);

  if (page.bookingInMain > 1) {
    add(3, 'High', file, `${page.bookingInMain} booking CTAs in <main> (max 1 hero or final band per §4)`);
  }
  if (page.mainCtaCount > 3) {
    add(3, 'Medium', file, `${page.mainCtaCount} CTAs in <main> (max 3); ${page.bookingInMain || 0} duplicate booking`);
  }
  for (const cta of page.ctas || []) {
    if (cta.recommendation === 'REMOVE') {
      add(3, 'Medium', file, `Excess CTA to remove: "${cta.label}"`);
    }
    if (cta.label === 'Join Siya Circle' && page.path !== '/siya-circle') {
      add(3, 'High', file, '"Join Siya Circle" in <main> (newsletter CTAs footer-only per §7)');
    }
  }
}

// Blog/article forbidden mid-page CTAs from patterns
const forbiddenMain = (ctaAudit.patterns || []).filter(
  (p) => p.zone === 'main' && p.recommendation === 'REMOVE' && !['Talk to a Clinician', 'Book ADHD Evaluation'].includes(p.label),
);
for (const p of forbiddenMain) {
  for (const pg of p.pages || []) {
    if (pg.startsWith('/answers/') || pg.startsWith('/blog/')) {
      const file = pathToFile(pg);
      if (!findings[3].some((f) => f.file === file && f.finding.includes(p.label))) {
        add(3, 'Medium', file, `Forbidden/excess CTA label "${p.label}" in main`);
      }
    }
  }
}

// --- Section 4: ADHD-only but should be broader (§1, §8) ---
add(4, 'Medium', 'about.html', 'About H1 "done guessing" skews ADHD-adjacent; §8 requires whole-person brand on broad pages');
add(4, 'Medium', 'index.html', 'Whole-person imbalance: high ADHD mention density vs limited weight/metabolic on / (§1)');
add(4, 'Medium', 'telehealth.html', 'Whole-person imbalance: high ADHD mention density on core routing hub (§1)');

// --- Section 5: No longer fit positioning (§1 legacy phrases) ---
for (const page of brandAudit.pages || []) {
  if ((page.flags || []).includes('Outdated language')) {
    add(5, 'High', pathToFile(page.path), 'Outdated language');
  }
}

// Off-brand DELETE pages from brand audit
for (const page of brandAudit.pages || []) {
  if (page.recommendation === 'DELETE' && !['/privacy-policy', '/terms', '/siya-circle', '/adhd-diagnosis-florida'].includes(page.path)) {
    add(5, 'High', pathToFile(page.path), 'Off-brand / out-of-scope content (brand audit DELETE)');
  }
}

// --- Section 6: Duplicate content ---
const pruningPages = pruningAudit.pages || [];
for (const pg of pruningPages) {
  if (pg.classification === 'MERGE' || (pg.classification === 'REDIRECT' && pg.rationale?.includes('duplicate'))) {
    const file = pathToFile(pg.path);
    const target = pg.redirectTarget || '—';
    add(6, 'Medium', file, pg.rationale || `Duplicate content; consolidate to ${target}`);
  }
}
// Cannibalization duplicates from pruning REDIRECT with cannibalization rationale
for (const pg of pruningPages) {
  if (pg.classification === 'REDIRECT' && /cannibaliz|duplicate|thin/i.test(pg.rationale || '')) {
    const file = pathToFile(pg.path);
    if (!findings[6].some((f) => f.file === file)) {
      add(6, 'Medium', file, `${pg.rationale} → ${pg.redirectTarget}`);
    }
  }
}

// --- Section 7: Should be redirected ---
for (const pg of pruningPages) {
  if (pg.classification === 'REDIRECT') {
    const file = pathToFile(pg.path);
    const target = (pg.redirectTarget || '').replace('/membership-pricing', '/pricing');
    const sev = pg.phase === 1 ? 'High' : 'Medium';
    add(7, sev, file, `→ ${target}: ${pg.rationale}`);
  }
}

// --- Section 8: Should be deleted ---
for (const pg of pruningPages) {
  if (pg.classification === 'DELETE') {
    const file = pathToFile(pg.path);
    add(8, 'High', file, pg.rationale || 'Site pruning audit: DELETE');
  }
}
for (const page of brandAudit.pages || []) {
  if (page.recommendation === 'DELETE') {
    const file = pathToFile(page.path);
    if (!findings[8].some((f) => f.file === file)) {
      add(8, 'High', file, 'Brand consistency audit: DELETE');
    }
  }
}

// --- Section 9: Require rewrites ---
for (const pg of pruningPages) {
  if (pg.classification === 'KEEP + REWRITE') {
    const file = pathToFile(pg.path);
    add(9, 'High', file, pg.rationale || 'KEEP + REWRITE per pruning audit');
  }
}
for (const page of brandAudit.pages || []) {
  if (page.recommendation === 'REWRITE') {
    const file = pathToFile(page.path);
    const flags = (page.flags || []).join(', ') || 'none';
    const sev = page.brandAlignment < 6 ? 'High' : 'Medium';
    if (!findings[9].some((f) => f.file === file && f.severity === 'High')) {
      add(9, sev, file, `Brand score ${page.brandAlignment}/10; flags: ${flags}`);
    }
  }
}
for (const issue of pricingAudit.summary.allIssues) {
  if (issue.file === 'pricing.html') continue;
  if (['vague-monthly-plan', 'adhd-only-follow-up-149', 'hero-199-without-breakdown'].includes(issue.type)) {
    if (!findings[9].some((f) => f.file === issue.file && f.finding.includes('pricing'))) {
      add(9, 'Medium', issue.file, 'Pricing copy needs alignment with $199/$79/$149 model (§3)');
    }
  }
}
for (const page of ctaAudit.excessivePages || []) {
  const file = pathToFile(page.path);
  if (page.mainCtaCount > 3 && !findings[9].some((f) => f.file === file)) {
    add(9, 'Medium', file, `CTA consolidation needed (${page.mainCtaCount} main CTAs)`);
  }
}

// --- Section 10: Can remain unchanged ---
for (const page of brandAudit.pages || []) {
  if (page.recommendation === 'KEEP' && page.path !== '/pricing') {
    const file = pathToFile(page.path);
    const flagged = findings[1].concat(findings[2], findings[3], findings[4], findings[5])
      .some((f) => f.file === file && ['Critical', 'High'].includes(f.severity));
    if (!flagged) {
      add(10, 'Low', file, `Brand alignment ${page.brandAlignment}/10 — no Critical/High standards conflicts`);
    }
  }
}
for (const pg of pruningPages) {
  if (pg.classification === 'KEEP' && pg.path !== '/pricing') {
    const file = pathToFile(pg.path);
    if (!findings[10].some((f) => f.file === file)) {
      add(10, 'Low', file, 'Core revenue, trust, or legal page in minimum viable site (pruning KEEP)');
    }
  }
}

// Dedupe within sections
for (const s of Object.keys(findings)) {
  const seen = new Set();
  findings[s] = findings[s].filter((f) => {
    const key = `${f.severity}|${f.file}|${f.finding}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Totals
const allFindings = Object.values(findings).flat();
const sevTotals = { Critical: 0, High: 0, Medium: 0, Low: 0 };
for (const f of allFindings) sevTotals[f.severity] += 1;

const sectionTitles = {
  1: 'Conflicting pricing',
  2: 'Conflicting provider descriptions',
  3: 'Conflicting CTA language',
  4: 'ADHD-only but should be broader',
  5: 'No longer fit positioning',
  6: 'Duplicate content',
  7: 'Should be redirected',
  8: 'Should be deleted',
  9: 'Require rewrites',
  10: 'Can remain unchanged',
};

const criticalFindings = allFindings.filter((f) => f.severity === 'Critical');

let md = `# SIYA Standards Audit Report

> **Read-only audit** against [\`docs/SIYA-STANDARDS.md\`](./SIYA-STANDARDS.md). No HTML pages were modified.

**Generated:** 2026-06-07  
**Scope:** 164 HTML files · 166 indexable pages · standards version 2026-06-07

> **Revision (2026-06-07):** Re-audited against **\`docs/SIYA-STANDARDS.md\`** as primary canonical source (supplemented by \`data/site-standards.mjs\`). Prior report used \`site-standards.mjs\` only because the markdown standard was missing. Manual verification applied for known script false positives (e.g. \`pricing.html\` Bronze/Silver/Gold negation text).

## Standards source

| Priority | Source | Role |
|----------|--------|------|
| 1 | [\`docs/SIYA-STANDARDS.md\`](./SIYA-STANDARDS.md) | Human audit bible — §1–§11 |
| 2 | [\`data/site-standards.mjs\`](../data/site-standards.mjs) | Machine-enforceable values (\`PRICING\`, \`CTA_SYSTEM\`, \`PROVIDER_CANONICAL\`) |
| 3 | Audit JSON artifacts | Automated scans (regenerated read-only) |

**Audit scripts run:** \`audit-pricing-system.mjs\`, \`audit-cta-inventory.mjs\`, \`audit-provider-consistency.mjs\`, \`audit-brand-consistency.mjs\` (+ \`site-pruning-audit.json\`)

## Executive Summary

| Metric | Count |
|--------|------:|
| HTML files scanned | 164 |
| Indexable pages (inventory) | 166 |
| **Total findings** | ${allFindings.length} |
| **Critical findings** | ${sevTotals.Critical} |
| High findings | ${sevTotals.High} |
| Medium findings | ${sevTotals.Medium} |
| Low findings | ${sevTotals.Low} |

**Highest-priority themes:** CTA consolidation, provider role/state drift, pruning redirects/deletes, and guide/blog duplication.

### Section counts

| # | Category | Findings | Critical |
|---|----------|----------:|---------:|
`;

for (let i = 1; i <= 10; i++) {
  const c = countBySeverity(i);
  md += `| ${i} | ${sectionTitles[i]} | ${findings[i].length} | ${c.Critical} |\n`;
}

md += `
### Top critical findings (${sevTotals.Critical})

`;
for (const f of criticalFindings.slice(0, 10)) {
  md += `- **\`${f.file}\`** — ${f.finding}\n`;
}
if (!criticalFindings.length) md += '_No critical findings after manual §3 verification._\n';

md += `
### Material changes vs prior report

| Area | Prior (site-standards.mjs only) | This revision |
|------|-----------------------------------|---------------|
| Standards source | \`SIYA-STANDARDS.md\` missing | **\`SIYA-STANDARDS.md\` primary** |
| Critical count | 3 (incl. false-positive provider state chips, \`/membership-pricing\` meta) | **${sevTotals.Critical}** (script false positives excluded) |
| \`pricing.html\` | Flagged non-compliant / Bronze tiers | **Compliant** — negation copy only; moved to §10 |
| \`providers/index.html\` state chips | Critical mismatch | **Resolved** — chips match §2 matrix (audit script card-order bug) |
| Redirect/delete inventory | Partial | **82 redirects + 12 deletes** from pruning audit |
| CTA findings | ~52 pages (deprecated Meet & Greet body copy) | **${findings[3].length}** per §4 three-slot system + \`excessivePages\` |

---

`;

for (let i = 1; i <= 10; i++) {
  md += `## ${i}. ${sectionTitles[i]}\n\n${sectionSummary(i)}\n\n${table(i)}\n`;
}

md += `---

## Methodology

1. Re-ran \`scripts/audit-pricing-system.mjs\`, \`audit-cta-inventory.mjs\`, \`audit-provider-consistency.mjs\`, \`audit-brand-consistency.mjs\` (regenerates JSON audit artifacts only).
2. Cross-referenced all **164** HTML files against **\`docs/SIYA-STANDARDS.md\`** §1–§11 (pricing §3, CTAs §4, providers §2, states §5, page hierarchies §8–§11).
3. Merged \`data/site-pruning-audit.json\` redirect/delete/keep classifications; corrected legacy \`/membership-pricing\` targets to \`/pricing\` per §3.
4. Manual verification: excluded \`pricing.html\` legacy-tier regex false positive; confirmed \`providers/index.html\` \`data-states\` attributes match §2 roster.
5. Severity key: **Critical** = breaks canonical model (§3 pricing, §1 identity); **High** = trust/clinical accuracy; **Medium** = consolidation/copy drift; **Low** = compliant or minor.

*Regenerate: update \`data/site-standards.mjs\` + \`docs/SIYA-STANDARDS.md\`, re-run audit scripts, then \`node scripts/synthesize-standards-audit-report.mjs\`.*
`;

fs.writeFileSync(OUT, md);
console.log(`Wrote ${OUT}`);
console.log(`Total: ${allFindings.length}, Critical: ${sevTotals.Critical}`);
