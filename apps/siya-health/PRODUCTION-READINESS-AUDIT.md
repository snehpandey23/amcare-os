# Siya Health Production Readiness Audit

Generated: 2026-06-04T00:59:23.626Z  
Site root: `apps/siya-health`  
Pages scanned: **144** HTML files

---

## Scorecard

| Dimension | Score | Notes |
|-----------|------:|-------|
| **SEO** | **86/100** | Health Guides branding, canonical /answers, review schema governance |
| **UX** | **68/100** | CTA consistency, mobile nav, spacing system in styles.css |
| **Brand Consistency** | **85/100** | Nav/footer Health Guides; minor copy wordplay remains |
| **Trust** | **90/100** | Pending review blocks on 110 educational pages; no false physician claims |
| **Conversion Readiness** | **70/100** | Meet & Greet on templates; 8× "Book Free Consultation"; 3-state footer omits California |

**Overall readiness:** Strong base for the next content sprint. Prioritize **4-state footer**, **legacy CTAs**, and **"Browse clinical answers"** copy before publishing new articles.

---

## Part 1 — Health Guides Audit

### Verified

| Check | Result |
|-------|--------|
| Nav displays "Health Guides" | 144 pages with nav |
| Footer displays "Health Guides" | 144 pages |
| Breadcrumbs "Health Guides" | 122 answer/blog pages with breadcrumbs |
| URL remains `/answers` | **Yes** — no path change |
| Unnecessary redirects | **None for /answers** — `vercel.json` only: `/mental-health-adhd` → `/adhd-care`, apex → `www` |

### Answer hub

| Element | Status |
|---------|--------|
| `<title>` | ✓ Health Guides |
| H1 | ✓ Health guides (consider title case) |
| Nav/footer | ✓ Health Guides |

### Legacy wording remaining

| Pattern | Locations |
|---------|-----------|
| `>Answers</a>` link | 0 files |
| "Browse clinical answers" in-page CTA | **31** answer pages (metabolic + general) — rename to "Browse health guides" |
| Clinical Answers (phrase) | adhd-care.html, answers/adhd-and-weight-loss-connection.html, answers/compounded-vs-branded-glp-1.html, answers/ed-telehealth-legitimate.html, answers/fsa-hsa-adhd-evaluation.html, answers/glp-1-nausea-management.html, answers/glp-1-side-effects.html, answers/how-online-prescriptions-work.html, answers/index.html, answers/insulin-resistance-without-diabetes.html, answers/is-telehealth-legitimate.html, answers/medical-weight-loss-vs-dieting.html, answers/meet-and-greet-telehealth-expectations.html, answers/minoxidil-hair-loss-does-it-work.html, answers/normal-a1c-insulin-resistance.html, answers/oral-vs-injectable-weight-loss-meds.html, answers/oral-vs-topical-minoxidil.html, answers/phentermine-weight-loss-safety.html, answers/semaglutide-weight-loss-how-it-works.html, answers/sildenafil-erectile-dysfunction-expectations.html, answers/telehealth-adhd-california.html, answers/telehealth-adhd-texas.html, answers/testosterone-and-adhd-overlap.html, answers/tirzepatide-vs-semaglutide.html, answers/trt-monitoring-requirements.html, answers/what-does-low-testosterone-feel-like.html, answers/what-included-199-adhd-evaluation.html, answers/what-is-food-noise.html, answers/what-is-free-testosterone.html, answers/what-is-insulin-resistance.html, answers/when-is-testosterone-therapy-appropriate.html, answers/who-qualifies-glp-1-weight-loss.html, answers/why-am-i-tired-even-after-sleeping.html, weight-loss-metabolic-health.html |
| FAQ Library | 0 HTML |
| Non-nav "Answers" copy | about.html ("Answers about ADHD"), blog CTAs — **acceptable marketing copy** |
| llms-full.txt | "Clinical Answers Hub" — **update** |

**No stale Answers navigation links in HTML.**

---

## Part 2 — State Coverage

See **[STATE-COVERAGE-REPORT.md](./STATE-COVERAGE-REPORT.md)**.

- California mentioned on **81/144** pages
- Footers missing California: **71**
- Three-state-only (no CA in body): **61**

---

## Part 3 — CTA Consistency

### Expected pattern

| Role | Copy |
|------|------|
| Primary | Book a Meet & Greet |
| Secondary | Explore Care Options |
| ADHD-only | Start Free Screening → `/adhd-screening` |

### Violations (8 real)

- `blog/adhd.html`: Legacy "Book Free Consultation" (1)
- `blog/all.html`: Legacy "Book Free Consultation" (1)
- `blog/index.html`: Legacy "Book Free Consultation" (1)
- `blog/medical-weight-loss-glp1-semaglutide-texas.html`: Legacy "Book Free Consultation" (1)
- `blog/telehealth.html`: Legacy "Book Free Consultation" (1)
- `blog/weight-loss.html`: Legacy "Book Free Consultation" (1)
- `telehealth.html`: Legacy "Book Free Consultation" (1)
- `weight-loss-metabolic-health.html`: Legacy "Book Free Consultation" (1)

### Pages without Meet & Greet link (0)

_All key pages include Meet & Greet._


---

## Part 4 — Image & Visual

See **[VISUAL-AUDIT-REPORT.md](./VISUAL-AUDIT-REPORT.md)**.

- 5 assets used on 5+ pages
- 9 images with missing/empty alt
- 0 hero-class images overused

---

## Part 5 — UX & Design (manual inspection summary)

### Homepage (`index.html`)
- **High:** Hero supports metabolic repositioning — verify CTA pair on mobile
- **Medium:** Trust band density — consider spacing between credential badges
- **Low:** Secondary service cards — consistent `.button` / `.button-secondary`

### Health Guides (`answers/index.html`)
- **Medium:** Hub is list-heavy — topic grouping cards would improve scanability
- **Low:** H1 title case vs nav "Health Guides"

### Blog / Answer templates
- **Low:** `.clinical-review--pending` styling consistent
- **Medium:** Long articles — TOC already on some posts; extend to cornerstone cluster

### Provider pages
- **Low:** Strong hierarchy; ensure CTA matches Meet & Greet sitewide

| Priority | Issue |
|----------|-------|
| High | Mobile nav CTA not hidden behind scroll on small viewports |
| Medium | Card grid gutters differ between blog hub and answers hub |
| Low | Poppins H1 vs Inter body — intentional; keep |

---

## Part 6 — Content Consistency

| Finding | Count |
|---------|------:|
| Medically reviewed (stale) | 0 |
| Pending/review mismatch | 0 |
| Book Free Consultation | 8 |
| Start Free Screening (sitewide) | 73 (ADHD pages expected) |

**All blog/answer pages have pending review blocks.**

---

## Part 7 — Trust & Credibility

| Check | Status |
|-------|--------|
| Review status system | ✓ PENDING_REVIEW default on educational content |
| Physician credentials | ✓ Provider pages with MD, specialty, states |
| State licensure | See state report — footer standardization recommended |
| Disclaimers | ✓ Footer emergency / educational notices on templates |
| contact: care@siya.health | Present on major templates |
| Phone (215) 445-1244 | Present on major templates |

**Trust flags:** 6 minor template gaps

- `answers/index.html`: No clinical review block
- `blog/adhd.html`: No clinical review block
- `blog/all.html`: No clinical review block
- `blog/index.html`: No clinical review block
- `blog/telehealth.html`: No clinical review block
- `blog/weight-loss.html`: No clinical review block

---

## Part 8 — Top 20 issues before next content sprint

| # | Priority | Impact | Effort | Issue |
|---|----------|--------|--------|-------|
| 1 | **High** | High | Low | Update llms-full.txt "Clinical Answers Hub" → Health Guides |
| 2 | **High** | High | Low | Answer hub H1: align "Health guides" → "Health Guides" (title case) |
| 3 | **High** | High | Med | Physician review queue: approve cornerstone cluster in registry |
| 4 | **High** | High | Low | **Fix 3-state footer** → include California on ~120 pages (`generate-answer-pages.mjs` + `site-chrome.mjs`) |
| 5 | **High** | High | Low | Replace "Browse clinical answers" on 31 answer pages |
| 6 | **High** | Med | Low | Remove "Book Free Consultation" (8 pages: blog hubs, telehealth, weight-loss) |
| 7 | Low | Med | Med | Differentiate hero images for metabolic vs ADHD hubs |
| 8 | Low | Med | Low | Add Explore Care Options secondary CTA where missing |
| 9 | Low | Low | Low | Marketing copy "Answers" wordplay (about.html, blog CTAs) — not nav |
| 10 | Low | Med | Low | Ensure all answer page titles include Health Guides pattern |
| 11 | Medium | Med | Low | Sync SEO-CRITICAL-FIXES-REPORT.md (stale Answers counts) |
| 12 | Medium | Med | Med | Add California-specific geo blog interlinks from metabolic cluster |
| 13 | Low | Low | Low | membership-pricing.html — verify Meet & Greet CTA |
| 14 | Medium | High | Med | Content approval workflow doc for CLINICAL_REVIEW_APPROVED |
| 15 | Low | Low | Low | privacy/terms — confirm 4-state mention |
| 16 | Medium | Med | Low | BreadcrumbList on all answer pages (verify generator) |
| 17 | Low | Low | Low | Open Graph images per cornerstone article |
| 18 | Medium | Med | Med | Reduce hero-telehealth.jpg reuse (see visual report) |
| 19 | Low | Low | Low | Alt text on decorative icons in blog |
| 11 | **High** | High | Low | Fix 3-state footer → 4-state (California first) sitewide via generators |
| 12 | Medium | Med | Low | Replace "Browse clinical answers" → "Browse health guides" on answer CTAs |
| 13 | Medium | Med | Low | Remove "Book Free Consultation" from blog hubs + telehealth + weight-loss |
| 14 | Low | Low | Low | Title-case Health Guides H1 on `answers/index.html` |
| 15 | Medium | Med | Med | Provider pages: align footer + Meet & Greet (some use screening in nav) |
| 16 | Low | Low | Low | Update `llms-full.txt` / AI indexes for Health Guides naming |
| 17 | Medium | Med | Low | Service pages (labs, prescriptions) — add California to body copy |
| 18 | Low | Low | Low | Add OG images per cornerstone article |
| 19 | Medium | Med | Med | Hero image differentiation for metabolic cluster (visual report) |
| 20 | High | High | Med | Deploy + verify production build on Vercel `main` after fixes |

---

## Build & deploy checklist

```bash
cd apps/siya-health
node scripts/generate-answer-pages.mjs
node scripts/seo-build.mjs
node scripts/content-governance-report.mjs
node scripts/production-readiness-audit.mjs
```

## Related reports

- [CONTENT-GOVERNANCE-REPORT.md](./CONTENT-GOVERNANCE-REPORT.md)
- [STATE-COVERAGE-REPORT.md](./STATE-COVERAGE-REPORT.md)
- [VISUAL-AUDIT-REPORT.md](./VISUAL-AUDIT-REPORT.md)
