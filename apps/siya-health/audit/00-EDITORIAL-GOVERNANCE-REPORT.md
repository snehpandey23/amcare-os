# Siya Health — Editorial Governance Audit

```text
Part of: Siya Knowledge Governance Framework v1.0 (FROZEN 2026-07-26)
Date: 2026-07-26
Status: Freeze new content publishing until P0 = 0 and generators stay green
Scope: Public site (191 HTML pages audited)
Unit of governance: Reusable Content Block (data/content-blocks.mjs)
Method: Verified static scans + prior browser design sample + generator inventory
Framework index: docs/SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK.md
Companion artifacts:
  - audit/editorial-governance-scorecard.csv
  - audit/00-CLINICAL-SAFETY-AUDIT.md      (was: Clinical Relevance, now split)
  - audit/00-CLINICAL-CONTEXT-AUDIT.md     (was: Clinical Relevance, now split)
  - audit/00-EDITORIAL-FINGERPRINT.md
  - audit/00-AI-READINESS-AUDIT.md
  - docs/CONTENT-ASSEMBLY-SYSTEM.md
  - docs/BLOCK-REGISTRY-STATUS.json
```

---

## 1. Executive summary

This is no longer a cohesion polish pass. The site has **systemic content-generation issues**: shared appenders that ignored topic relevance, geography/CTA templates that competed with reading flow, and at least one indexed page with incoherent clinical prose.

### Headline scores (weighted governance rubric)

| Metric | Value |
|--------|------:|
| Pages scored | 191 |
| Site average | **92.4 / 100** |
| Below threshold (&lt;85) — remediation backlog | **17** |
| P0 pages | **0** |
| P1 pages | **16** |
| P2 pages | **48** |
| Monitor / healthy | **126** |

### P0 clinical bleed — generator status

| Issue | Status (2026-07-26) | Evidence |
|-------|---------------------|----------|
| Cross-topic ADHD “childhood onset” prep on non-ADHD guides | **Resolved in generators** | 0 non-ADHD pages still contain the bleed string |
| GLP-1 emergency tree on unrelated pages | **Resolved in generators** | 0 non-GLP-1 pages still contain the emergency node |
| Garbled indexed ADHD article | **Closed** | noindex stub + 301 → `/adhd-care`; unlinked; publisher skips slug |

### Assembly gate (mechanical)

`node scripts/validate-content-assembly.mjs` → **PASS**

- Duplicate paragraph groups (excl. intentional chrome): 1 (&lt;5)
- Irrelevant geography on educational pages: 0
- Sections with &gt;8 links: 0
- Pages with &gt;1 primary CTA in main: 0
- Unique context closings on answers: 100%
- Editorial fingerprint (core): 10/10

**Interpretation:** Mechanical assembly is largely fixed. Editorial governance still fails on (1) the garbled California article, (2) geo-page cannibalization debt, and (3) residual “feels templated” risk on city LPs—even after uniquify scripts.

### Freeze rule (locked)

> Do **not** publish new pillars (Fatigue, Primary Care CA, Preventive, tools) until:
> 1. Open P0 = 0
> 2. `assembly:validate` stays green after a full build
> 3. Geo consolidation plan is approved (even if execution is phased)

Fix **generators and shared blocks first**. Avoid page-by-page hand edits that rebuilds will overwrite.

---

## 2. Rubric (every page)

| Category | Weight | Primary signal |
|----------|-------:|----------------|
| Medical relevance | 25 | Clinical blocks match topic; no cross-condition advice |
| Editorial cohesion | 20 | Unique prose; sections earn their place |
| Information architecture | 15 | Clear parent; no cannibalizing URL class |
| User journey / CTA | 15 | One primary journey; ≤8 links/section |
| SEO quality | 10 | Intent ownership, depth, technical basics |
| Visual consistency | 10 | Template/token consistency (partly inferred) |
| Accessibility | 5 | Headings, alt, labels, ARIA hygiene |

**Gate:** total **&lt; 85 → automatic remediation backlog**.

---

## 3. Verified vs inferred

### Verified (prove with scans / HTML)

- Duplicate paragraphs and shared SIYA markers
- Cross-topic clinical strings (childhood-onset, GLP-1 emergency)
- Garbled/incoherent published prose
- Primary CTA counts, section link counts
- Geography directories / metro dumps on educational pages
- Canonical, meta description, H1 count
- Duplicate ARIA ids, missing alt, skip-link presence
- FAQPage / schema presence where claimed
- Generator ownership of bleed (file + function)

### Inferred (needs human editorial judgment)

- “Reading flow feels abrupt”
- Visual balance / hero density
- Tone / voice consistency across clusters
- “Feels templated” after uniquify prefixes
- Whether a city LP has enough local value to keep vs redirect

Developers should treat **Verified** as tickets that can close with tests. **Inferred** items need an editor sign-off.

---

## 4. Clinical Relevance Audit (new)

See `audit/00-CLINICAL-RELEVANCE-AUDIT.md`.

Hard rule for every reusable block:

1. Is this directly relevant to the page topic?
2. Would a physician intentionally include this here?
3. Could this confuse someone reading about a different condition?
4. Does it introduce unnecessary clinical information?

Any “yes” to confusion/irrelevance → **do not render**.

---

## 5. P0 / P1 / P2 remediation backlog

### P0 — fix before any new publishing

| ID | Issue | Type | Effort | Impact | Disposition |
|----|-------|------|--------|--------|-------------|
| EG-P0-01 | Garbled page `/blog/adult-adhd-treatment-california-2026` | Page + index | Done | Trust + SEO | **Closed:** noindex stub + 301 → `/adhd-care`; removed from sitemap/indexes/internal links; publisher skips slug |
| EG-P0-02 | Prevent regression of cross-topic clinical appenders | Generator | Done / guard | Trust | Keep `validate-content-assembly` + clinical relevance checks in CI |
| EG-P0-03 | Prevent GLP-1 emergency branch outside GLP pages | Generator | Done / guard | Safety/trust | `isGlp1Page()` gate must remain |

### P1 — high ROI after P0

| ID | Issue | Type | Effort | Impact | Disposition |
|----|-------|------|--------|--------|-------------|
| EG-P1-01 | 16 city `/blog/adhd-treatment-*` clones (&lt;85 scores) | Generator + IA | L (3–5d) | SEO + editorial | Consolidate to state canons; redirect cities (or keep ≤1–2 with unique demand) |
| EG-P1-02 | Root `/adhd-diagnosis-*` thin geo landers | IA | M (1–2d) | Cannibalization | One state owner; redirect metros into state |
| EG-P1-03 | CA/TX diagnosis variant cluster (~9 blogs) | IA | M (2d) | Intent ownership | Merge into 1–2 canonical explainers |
| EG-P1-04 | CTA product proliferation (Meet & Greet / chat / book / Zocdoc) | Generator + chrome | M (1–2d) | Conversion clarity | One primary label+URL sitewide; secondary only |
| EG-P1-05 | “Regarding {title}:” uniquify smell on educational pages | Generator | S (0.5d) | Editorial | Replace post-hoc prefixing with true topic-compiled blocks |
| EG-P1-06 | Women’s Health vs Midlife hierarchy | IA | S–M | Findability | Hub + subordinate program |
| EG-P1-07 | Services missing from primary nav | IA | S | Discoverability | Add Women’s, Primary/Urgent, Pricing, Tools |

### P2 — polish after architecture is sound

| ID | Issue | Type | Effort | Impact |
|----|-------|------|--------|--------|
| EG-P2-01 | Design token consistency (gaps, radii, CTA weight) | Design system | M | Perceived quality |
| EG-P2-02 | Mobile hero density | CSS | S | UX |
| EG-P2-03 | Footer link spacing | CSS | S | Scanability |
| EG-P2-04 | Generic “Read more” labels | A11y | S | WCAG 2.4.4 |
| EG-P2-05 | Citation links (named sources without hrefs) | Trust | M | E-E-A-T |
| EG-P2-06 | Labs missing educational disclaimers | Trust | S | Consistency |
| EG-P2-07 | Physician review sign-off wave | Trust/process | L | Clinical attribution |

---

## 6. Generator-level fixes (highest ROI)

| Generator / module | Fix | Status |
|--------------------|-----|--------|
| `scripts/content-assembly.mjs` | Earn-worthiness rules, closings, fingerprint, clinical gates | Shipped |
| `data/answer-seeds.mjs` → `phase5CoordinationSection` | Topic+slug unique prep; no ADHD onset off-topic | Shipped |
| `scripts/answer-engagement-system.mjs` → `defaultDecisionNodes` / myths | GLP-1 gated; question-scoped copy | Shipped |
| `data/adhd-commercial-links.mjs` | Care pathways ≤3 links + 1 button | Shipped |
| `scripts/apply-california-city-linking.mjs` | Strip metro directories from educational guides | Shipped |
| `scripts/generate-answer-pages.mjs` | Context-aware closing; one primary CTA | Shipped |
| `scripts/enforce-assembly-caps.mjs` | Cap links + demote extra primaries | Shipped |
| `scripts/validate-content-assembly.mjs` | Metric gate | Shipped |
| City LP / shadow generators | Stop cloning FAQ+CTA shells; or delete via redirects | **Not done** (P1) |
| `conversion-cleanup` / site-chrome CTA policy | Single primary journey sitewide | Partial |
| Engagement uniquify scripts | Temporary; replace with compiled blocks | Debt (P1-05) |

**Rule:** If a fix can be done in a generator, it is not a page ticket.

---

## 7. Page-level fixes (only where necessary)

| Page | Action | Why page-level |
|------|--------|----------------|
| `blog/adult-adhd-treatment-california-2026.html` | Rewrite or redirect + remove from sitemap/index | Content is incoherent; not a template toggle |
| Individual city LPs | Only after IA decides keepers | Most should redirect, not be rewritten ×16 |
| Labs spokes | Add disclaimer via labs generator | Prefer generator, not 10 hand edits |

---

## 8. Impact × effort (sequence)

```
Day 0–1   EG-P0-01  noindex/redirect garbled page          Impact: Critical  Effort: S
Day 1     Confirm assembly gate in CI / pre-deploy         Impact: High      Effort: S
Day 2–4   EG-P1-01..03  geo consolidation plan + redirects Impact: Highest SEO Effort: L
Day 4–5   EG-P1-04  CTA unification                        Impact: High UX   Effort: M
Day 5–6   EG-P1-05..07 IA nav + women hierarchy + remove uniquify smell
Then      Resume Fatigue / Primary Care CA / tools
P2        Design + citations + review badges
```

Estimated impact if P0+P1 geo/CTA land:

- Fewer competing URLs for “ADHD + state/city”
- Higher trust on educational guides (already improved)
- Cleaner conversion paths
- Less rewrite debt on the next content wave

---

## 9. Page-by-page scorecard

Full CSV: [`audit/editorial-governance-scorecard.csv`](editorial-governance-scorecard.csv)

### Backlog (&lt;85) — 17 pages

| Score | Priority | Page |
|------:|----------|------|
| 76 | P0 | `blog/adult-adhd-treatment-california-2026.html` |
| 77 | P1 | 15× `blog/adhd-treatment-{city}-{st}.html` (+ texas hub variants in set) |
| … | P1 | Remaining city treatment LPs in scorecard |

All other public pages score ≥85 under the weighted rubric (Monitor/P2).

---

## 10. Publishing decision

| Question | Answer |
|----------|--------|
| Continue new content generation? | **No — freeze 48h+ until P0 clear** |
| Hand-edit dozens of guides? | **No — generators first** |
| Resume Fatigue / VPC CA / tools? | **After P0=0 and geo consolidation plan approved** |
| Is assembly “done”? | Mechanical gate green; governance still open on garbled page + geo IA |

---

## 11. Owner checklist

- [x] EG-P0-01: noindex + 301 → `/adhd-care`; unlinked; publisher skip
- [ ] Add `assembly:validate` to deploy/CI preflight
- [ ] Approve geo consolidation map (state canon + redirect list)
- [ ] Approve single primary CTA label + URL
- [ ] Only then: reopen content roadmap
