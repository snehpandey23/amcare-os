# Provider Consistency Audit

Generated: 2026-06-05  
Scope: `apps/siya-health/`

Severity: **High** = trust/legal risk · **Medium** = E-E-A-T or UX · **Low** = polish

---

## Executive summary

The three provider **profile pages are internally consistent** with `entity-graph.json`, but **sitewide provider copy diverges** in footers, hero semantics, images, licensing callouts, and review linkage. No article or Health Guide currently links to a reviewing physician because the clinical review registry is empty.

---

## Issues

| # | Issue | Page URL(s) | Severity | Recommended fix |
|---|-------|-------------|----------|-----------------|
| 1 | Footer state list typo: **“California, California”** | Sitewide (~154 pages) | Medium | Normalize footer via `site-chrome.mjs` to single California mention |
| 2 | About team card images use **empty `alt=""`** | `/about` | High | Add `alt="Dr. [Name], MD"` on all three team thumbnails |
| 3 | Homepage mentions **Dr. Pandey** without profile link | `/` | Medium | Link “Dr. Sneh Pandey” to `/providers/dr-sneh-pandey`; disambiguate from Swati in copy |
| 4 | **Two different Sneh images** (`dr-sneh-pandey.png` vs `dr-sneh-pandey-founder.png`) | `/` vs profile/About | Low | Standardize on one primary headshot; use founder crop only if intentional variant |
| 5 | Provider page **H1 is emotional headline**, not `Dr. Name, MD — Role` | All 3 `/providers/*` | Medium | Add visible name/credentials line under or above H1; keep emotional subhead as deck copy |
| 6 | **OG/Twitter images** use site logo, not provider photo | All 3 `/providers/*` | Medium | Use provider headshot for social cards (with consent) |
| 7 | **“5,000+ patients”** weight-loss claim on Sneh profile only | `/providers/dr-sneh-pandey` | Low | Source, date-range, and context in credentials section; avoid unsourced stats elsewhere |
| 8 | **“Board-certified”** on Sneh profile; Natasha/Swati use “Training” / “Scope” without equivalent board language | `/providers/dr-natasha-desai`, `/providers/dr-swati-pandey` | Medium | Align certification wording to verifiable credentials per provider |
| 9 | **ADHD-CCSP** listed on all three; training description varies (“specialist training” vs “structured ADHD care”) | All profiles | Low | Single glossary definition + per-provider completion statement |
| 10 | **Service pages** say “board-certified providers” but link to **no individual profiles** | `/adhd-care`, `/telehealth`, `/weight-loss-metabolic-health`, `/mens-health-longevity` | Medium | Add compact provider cards with state-filtered links |
| 11 | **`/answers/telehealth-adhd-california`** names Dr. Sneh Pandey as CA-licensed **without profile link** | `/answers/telehealth-adhd-california` | Medium | Link to `/providers/dr-sneh-pandey` |
| 12 | **65/65 Health Guides** show “Pending physician review” despite `reviewerSlug` in seeds | `/answers/*` | High | Populate `content-review-registry.mjs` OR remove implied reviewer assignment until signed off |
| 13 | **0 blogs** display “Physician reviewed” | `/blog/*` | High | Same as above; link reviewed articles to provider profile |
| 14 | **Provider pages use legacy footer** (duplicate CA, `adhd.siya.health` legal links) | `/providers/*` | Medium | Run through `seo-build` / `site-chrome` normalization like other pages |
| 15 | **Testimonials on provider pages** cite “verified” without methodology | All 3 profiles | Medium | Add “representative patient feedback” disclaimer; link to third-party reviews where available (HelloKlarity for Sneh on homepage model) |
| 16 | **No `/providers` index** — only discoverable via About or cross-links | Site-wide | Medium | Add provider directory page (Phase 4 of implementation plan) |
| 17 | **Primary nav** has no Providers/Team entry | Site-wide | Low | Add “Our providers” under About or top-level when index exists |
| 18 | **entity-graph** assigns Sneh to weight-loss + men's health; **weight-loss service page** has zero provider mention | `/weight-loss-metabolic-health` | Medium | Surface Sneh (or future obesity clinician) on metabolic service page |
| 19 | **Pennsylvania** lists both Sneh and Swati in entity-graph; only Swati profile emphasizes PA psychiatric depth | State hubs | Low | State-specific provider routing copy on `/adhd-diagnosis-pennsylvania` etc. |
| 20 | **Kiwi Health external profile** (Pearland, TX) may diverge from Siya copy on philosophy, conditions, ratings | External reference | Low | Treat Kiwi as legacy marketplace listing; Siya profiles should be canonical for siya.health |

---

## Duplicate / repeated copy patterns

| Pattern | Occurrences | Risk |
|---------|-------------|------|
| “Why patients choose Dr. [Name]” section structure | 3 profiles | Low — intentional template |
| “What to expect” 4-step funnel (Screen → Meet & Greet → Eval → Follow-up) | 3 profiles + About | Low — acceptable funnel consistency |
| “Start Free ADHD Screening” + “Book a Meet & Greet” dual CTA | 3 profiles + many pages | Low |
| Trust strip (3 cards: credentials / states / HIPAA) | 3 profiles | Low |
| Footer “Board-certified providers…” boilerplate | 154 pages | Medium when combined with CA typo |

---

## Credential consistency matrix

| Credential / claim | Sneh | Natasha | Swati | entity-graph |
|--------------------|------|---------|-------|--------------|
| MD | ✓ | ✓ | ✓ | ✓ |
| Internal Medicine board-certified | ✓ (page + graph) | — | — | Sneh only |
| Obesity Medicine | ✓ | — | — | Sneh only |
| Family Medicine | — | ✓ (badges) | — | Natasha |
| Behavioral Medicine | ✓ (badges) | ✓ | — | Natasha |
| Psychiatry / Psychiatric | — | — | ✓ | Swati |
| ADHD-CCSP | ✓ | ✓ | ✓ | All three |
| Medical Director | ✓ | — | — | Sneh only |

---

## Image & alt text audit

| Image | Alt text | Issue |
|-------|----------|-------|
| `dr-sneh-pandey.png` (profile) | “Dr. Sneh Pandey, MD” | ✓ |
| `dr-sneh-pandey-founder.png` (home) | Long descriptive alt | ✓ |
| `dr-natasha-desai.png` (About card) | `""` | **High** |
| `dr-swati-pandey.png` (About card) | `""` | **High** |
| `dr-sneh-pandey.png` (About team card) | `""` | **High** |
| OG image (all profiles) | N/A (logo) | Missing provider-specific social image |

---

## Unsupported or soft claims to verify before scaling

- “5,000+ patients” in structured weight-loss programs (Sneh profile)
- “Same-week access where possible” (About)
- “verified” patient testimonials on provider pages (no linked source)
- “ADHD-CCSP–trained clinician” on evaluation step (implies all evaluators — clarify which providers)
