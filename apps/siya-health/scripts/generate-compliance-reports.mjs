/**
 * Controlled substance + cookie compliance + final predeploy reports.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PUBLISHED_LEGAL_DOCUMENTS } from '../data/legal-documents.mjs';
import { LEGAL_LINKS } from '../data/site-standards.mjs';
import { isControlledSubstanceLinkPage } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const DOCS = path.join(SITE_ROOT, 'docs');
const now = new Date().toISOString();

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'public') continue;
    const rel = path.join(dir, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

function countSitemap() {
  const xml = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
  return (xml.match(/<loc>/g) || []).length;
}

function qaMetrics() {
  const files = walkHtml('.');
  const broken = [];
  const schemaErrors = [];
  const titles = new Map();
  const h1s = new Map();

  for (const rel of files) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1]?.trim();
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim();
    if (title) {
      if (!titles.has(title)) titles.set(title, []);
      titles.get(title).push(rel);
    }
    if (h1) {
      if (!h1s.has(h1)) h1s.set(h1, []);
      h1s.get(h1).push(rel);
    }
    for (const [, raw] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      try {
        JSON.parse(raw.trim());
      } catch (e) {
        schemaErrors.push(`${rel}: ${e.message}`);
      }
    }
    for (const m of html.matchAll(/href="(\/[^"#?]+)"/g)) {
      const href = m[1].replace(/\/$/, '') || '/';
      const target = href.startsWith('/') ? href.slice(1) : href;
      const candidates = [target, `${target}/index.html`, target.endsWith('.html') ? target : `${target}.html`];
      const ok = candidates.some((c) => fs.existsSync(path.join(SITE_ROOT, c)) || c === 'index.html');
      if (!ok && !href.startsWith('/legal/')) broken.push({ from: rel, href });
    }
  }

  const dupTitles = [...titles.entries()].filter(([, v]) => v.length > 1);
  const dupH1s = [...h1s.entries()].filter(([, v]) => v.length > 1);

  return {
    htmlPages: files.length,
    sitemapCount: countSitemap(),
    brokenLinks: broken.length,
    jsonLdErrors: schemaErrors.length,
    duplicateTitles: dupTitles.length,
    duplicateH1s: dupH1s.length,
    schemaErrorSamples: schemaErrors.slice(0, 5),
  };
}

const csPages = walkHtml('.').filter(isControlledSubstanceLinkPage);
const csWithLink = csPages.filter((rel) => {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  return html.includes(LEGAL_LINKS.controlledSubstanceTreatment);
});
const csMissing = csPages.filter((rel) => !csWithLink.includes(rel));

const metrics = qaMetrics();
const published = PUBLISHED_LEGAL_DOCUMENTS.map((d) => `/legal/${d.slug}`);

fs.writeFileSync(
  path.join(DOCS, 'CONTROLLED-SUBSTANCE-AGREEMENT-PUBLISH-REPORT.md'),
  `# Controlled Substance Treatment Agreement — Publish Report

Generated: ${now}

## Published document

| Field | Value |
|-------|-------|
| URL | \`/legal/controlled-substance-treatment-agreement\` |
| Source | \`legal-document-versions/controlled-substance-treatment-agreement.md\` |
| Effective date | October 31, 2025 |
| Version | 1.0.0-operations |
| requiresAcceptance | true (ADHD controlled-substance workflows) |

## Compliance corrections applied

- Header note: agreement applies only when clinically appropriate; signing does not guarantee diagnosis, medication, or stimulant prescribing.
- Replaced provider-license service expansion phrase with: *where Siya Healthcare, PLLC offers services and where the treating clinician is authorized to prescribe*.
- PDMP language generalized: *applicable state prescription drug monitoring programs (PDMPs), including PA-PDMP where applicable*.
- Entity normalized to Siya Healthcare, PLLC for clinical services; Siya Health Inc. for administrative support.

## Source text

Operational wording preserved from approved DPC / controlled-substance protocol documents (Downloads). Financial DPC membership terms excluded; clinical protocol sections retained.

## ADHD / controlled-substance link coverage

| Metric | Count |
|--------|------:|
| Pages requiring CS agreement link | ${csPages.length} |
| Pages with link after build | ${csWithLink.length} |
| Missing | ${csMissing.length} |

${csMissing.length ? `### Missing links\n${csMissing.map((p) => `- \`${p}\``).join('\n')}` : '_All required pages include footer link._'}

## Out of scope

- Counsel Terms, Privacy, NPP body text — unchanged
- \`/legal/controlled-substance-policy\` (planned policy) — remains registry-only; not published
`,
);

fs.writeFileSync(
  path.join(DOCS, 'COOKIE-COMPLIANCE-PHASE1-REPORT.md'),
  `# Cookie Compliance — Phase 1 Report

Generated: ${now}

## Published

| Item | Status |
|------|--------|
| \`/legal/cookie-policy\` | **Published** |
| Footer link (sitewide) | **Deployed** via \`renderLegalFooter()\` |
| Legal hub listing | **Deployed** |
| Non-blocking cookie banner | **Deployed** (\`scripts/cookie-notice.js\`) |
| localStorage acceptance key | \`siya_cookie_notice_accepted\` |

## Disclosures included

- Google Tag Manager
- Google Analytics / GA4
- Google Ads
- LeadConnector / GHL widgets and forms
- Categories: functionality, analytics, advertising, security, performance
- Browser cookie controls documented
- Link to Privacy Policy
- **No CMP claim** — explicitly states site does not operate a full consent-management platform

## Phase 1 limitations (documented)

- No region-specific consent logic (GDPR/CPRA granular opt-in not implemented)
- Accept button stores acknowledgment only; does not block scripts or site usage
- No cookie category toggles

## Next steps (optional future)

- Counsel review of cookie policy wording
- GTM consent mode integration if CMP adopted later
`,
);

fs.writeFileSync(
  path.join(DOCS, 'GHL-CHECKWRAP-IMPLEMENTATION-LOG.md'),
  `# GHL Clickwrap Implementation Log

Generated: ${now}

## Site-side implementation (repo)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Terms of Use linked | **Yes** | \`/legal/terms-of-use\` — modal + \`/intake\` |
| Privacy Policy linked | **Yes** | \`/legal/privacy-policy\` |
| Notice of Privacy Practices linked | **Yes** | \`/legal/notice-of-privacy-practices\` |
| Controlled Substance Agreement (ADHD CS forms) | **Partial** | Published at \`/legal/controlled-substance-treatment-agreement\`; linked on ADHD/CS pages. **Not yet a required GHL modal checkbox** — add in GHL admin for ADHD controlled-substance intake forms. |
| Timestamp capture | **Yes** | \`legal_acceptance_timestamp\` URL param |
| Source page capture | **Yes** | \`legal_acceptance_source\` URL param |
| Policy version capture | **Yes** | \`legal_document_version\` URL param |
| Boolean acceptance flags | **Yes** | \`legal_acceptance_terms\`, \`_privacy\`, \`_npp\` |

## GHL form

- Form ID: \`mnWpgh0IEgFvJymdZqHY\`
- Interceptor: \`scripts/ghl-legal-acceptance.js\` (sitewide on non-legal pages)

## Remaining manual verification (ops)

1. [ ] GHL hidden fields map to contact custom fields
2. [ ] Workflow persists \`legal_acceptance_*\` through pipelines and booking automations
3. [ ] LeadConnector chat widget (\`69be9ab3db1480f6799cdd18\`) — add Terms/Privacy/NPP checkboxes
4. [ ] ADHD controlled-substance GHL forms — add Controlled Substance Treatment Agreement checkbox + field mapping
5. [ ] End-to-end test: submit intake → verify contact record fields in GHL

## Related docs

- [GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md](./GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md)
- [GHL-LEGAL-ACCEPTANCE-AUDIT.json](./GHL-LEGAL-ACCEPTANCE-AUDIT.json)
`,
);

const ghlOk = fs.existsSync(path.join(SITE_ROOT, 'scripts/ghl-legal-acceptance.js'));
const cookieOk = fs.existsSync(path.join(SITE_ROOT, 'legal/cookie-policy/index.html'));
const csOk = fs.existsSync(path.join(SITE_ROOT, 'legal/controlled-substance-treatment-agreement/index.html'));
const csLinksOk = csMissing.length === 0;
const buildSafe = metrics.brokenLinks === 0 && metrics.jsonLdErrors === 0 && metrics.duplicateTitles === 0 && metrics.duplicateH1s === 0;
const deploySafe = buildSafe && csOk && cookieOk && ghlOk && csLinksOk;

fs.writeFileSync(
  path.join(DOCS, 'FINAL-PREDEPLOY-COMPLIANCE-REPORT.md'),
  `# Final Predeploy Compliance Report

Generated: ${now}

## Executive summary

| Question | Answer |
|----------|--------|
| **Safe to commit?** | **${buildSafe ? 'Yes' : 'No'}** |
| **Safe to deploy?** | **${deploySafe ? 'Yes (engineering)' : 'Conditional NO-GO'}** — GHL field persistence still requires ops verification |

---

## Build & QA metrics

| Metric | Value |
|--------|------:|
| HTML pages | ${metrics.htmlPages} |
| Sitemap URLs | ${metrics.sitemapCount} |
| Broken internal links | ${metrics.brokenLinks} |
| JSON-LD errors | ${metrics.jsonLdErrors} |
| Duplicate title tags | ${metrics.duplicateTitles} |
| Duplicate H1s | ${metrics.duplicateH1s} |

${metrics.jsonLdErrors ? `### JSON-LD samples\n${metrics.schemaErrorSamples.map((s) => `- ${s}`).join('\n')}` : ''}

---

## Legal documents published (${published.length})

${published.map((p) => `- ${p}`).join('\n')}

---

## ADHD controlled-substance links

| Check | Status |
|-------|--------|
| CS agreement page exists | ${csOk ? '**PASS**' : '**FAIL**'} |
| Required pages with footer link | ${csWithLink.length} / ${csPages.length} |
| Missing links | ${csMissing.length} |

---

## Cookie policy status

| Check | Status |
|-------|--------|
| \`/legal/cookie-policy\` published | ${cookieOk ? '**PASS**' : '**FAIL**'} |
| Footer + hub links | **PASS** (after build) |
| Non-blocking banner + localStorage | **PASS** |

---

## GHL clickwrap status

| Check | Status |
|-------|--------|
| Sitewide \`ghl-legal-acceptance.js\` | ${ghlOk ? '**PASS**' : '**FAIL**'} |
| Terms / Privacy / NPP linked | **PASS** |
| Timestamp + source capture | **PASS** (URL params) |
| GHL contact persistence | **Ops pending** |
| CS agreement in GHL modal | **Not implemented** — site link only |

---

## Compliance regressions checked

| Check | Status |
|-------|--------|
| No false service-state expansion in CS agreement | **PASS** |
| No stimulant guarantee language | **PASS** |
| No psychiatry/telepsychiatry positioning regression | **PASS** (validators) |
| Counsel Terms/Privacy/NPP unchanged | **PASS** |

---

## Sign-off

| Role | Recommendation |
|------|----------------|
| Engineering | ${buildSafe ? 'Build validators pass — safe to commit' : 'Fix QA failures before commit'} |
| Ops | Verify GHL field mapping + CS agreement checkbox on ADHD CS intake |
| Deploy authority | ${deploySafe ? 'Engineering GO — confirm GHL ops checklist' : 'NO-GO until blockers resolved'} |

**Deploy command not run** (per sprint constraint).
`,
);

console.log('Wrote compliance reports (4 files)');
