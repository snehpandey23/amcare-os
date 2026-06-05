# Provider Inventory

Generated: 2026-06-05  
Scope: `apps/siya-health/` (154 HTML pages, 3 dedicated provider profiles)

---

## Summary

| Metric | Count |
|--------|------:|
| Named physicians with profile pages | 3 |
| Provider index page (`/providers`) | 0 |
| Provider pages in sitemap | 3 |
| Pages with `Physician` JSON-LD | 3 (provider pages only) |
| Health Guides / blogs with `Physician reviewed` block | 0 (all pending) |

---

## Provider 1 — Dr. Sneh Pandey, MD

| Field | Value |
|-------|-------|
| **Name** | Dr. Sneh Pandey, MD |
| **Credentials** | MD; Board Certified Internal Medicine; Obesity Medicine; ADHD-CCSP |
| **Role / title** | Medical Director |
| **Specialty / focus** | Internal Medicine, Obesity Medicine, Adult ADHD, metabolic health, medical weight loss, ADHD–weight overlap |
| **States licensed** | California, Texas, Pennsylvania, Florida |
| **Provider page** | `/providers/dr-sneh-pandey` |
| **Profile image** | `assets/images/dr-sneh-pandey.png` (280×280 on profile; 140×140 on About) |
| **Alternate image** | `assets/images/dr-sneh-pandey-founder.png` (homepage “Why Siya” section only) |
| **Schema** | `Physician` + `MedicalOrganization` + `WebPage` `@graph` on profile page |
| **Entity graph** | `data/entity-graph.json` → `dr-sneh-pandey` |

### Pages mentioning this provider

| Page | Link to profile? | Image used? |
|------|------------------|-------------|
| `/providers/dr-sneh-pandey` | ✓ (canonical) | `dr-sneh-pandey.png` |
| `/about` (Medical Director + team card) | ✓ | `dr-sneh-pandey.png` |
| `/` (homepage founder block, testimonials) | ✗ (name only; HelloKlarity external link) | `dr-sneh-pandey-founder.png` |
| `/answers/telehealth-adhd-california` | ✗ (text: licensed in CA) | — |
| Cross-links on Natasha/Swati provider pages | ✓ | — |

### Reviewer assignment (seeds)

Default reviewer for ADHD, weight-loss, GLP-1, telehealth, metabolic topics in `clinical-entity.mjs` / `answer-seeds.mjs` (`reviewerSlug: dr-sneh-pandey` on majority of guides). **No content currently displays as clinically reviewed** (`content-review-registry.mjs` allowlist empty).

---

## Provider 2 — Dr. Natasha Desai, MD

| Field | Value |
|-------|-------|
| **Name** | Dr. Natasha Desai, MD |
| **Credentials** | MD; Family Medicine; Behavioral Medicine; ADHD-CCSP |
| **Role / title** | Family & Behavioral Medicine Physician |
| **Specialty / focus** | Adult ADHD, anxiety overlap, emotional dysregulation, behavioral health, stress/sleep foundations |
| **States licensed** | Texas, Florida |
| **Provider page** | `/providers/dr-natasha-desai` |
| **Profile image** | `assets/images/dr-natasha-desai.png` |
| **Schema** | `Physician` `@graph` on profile page |
| **Entity graph** | `data/entity-graph.json` → `dr-natasha-desai` |

### Pages mentioning this provider

| Page | Link to profile? | Image used? |
|------|------------------|-------------|
| `/providers/dr-natasha-desai` | ✓ | `dr-natasha-desai.png` |
| `/about` (team card) | ✓ | `dr-natasha-desai.png` (empty `alt`) |
| Cross-links on Sneh/Swati pages | ✓ | — |

### Reviewer assignment

Assigned in `pickReviewer()` for symptom, anxiety, burnout, emotional overlap content. Registry allowlist empty → no live “reviewed by” links.

---

## Provider 3 — Dr. Swati Pandey, MD

| Field | Value |
|-------|-------|
| **Name** | Dr. Swati Pandey, MD |
| **Credentials** | MD; Psychiatric & Mental Health Physician; ADHD-CCSP |
| **Role / title** | Psychiatric Physician |
| **Specialty / focus** | Adult ADHD with psychiatric comorbidity, depression, anxiety, complex medication histories |
| **States licensed** | Pennsylvania |
| **Provider page** | `/providers/dr-swati-pandey` |
| **Profile image** | `assets/images/dr-swati-pandey.png` |
| **Schema** | `Physician` `@graph` on profile page |
| **Entity graph** | `data/entity-graph.json` → `dr-swati-pandey` |

### Pages mentioning this provider

| Page | Link to profile? | Image used? |
|------|------------------|-------------|
| `/providers/dr-swati-pandey` | ✓ | `dr-swati-pandey.png` |
| `/about` (team card) | ✓ | `dr-swati-pandey.png` (empty `alt`) |
| Cross-links on Sneh/Natasha pages | ✓ | — |

### Reviewer assignment

Assigned for medication, stimulant, GLP-1, psychiatric-depth topics in `pickReviewer()`. Registry allowlist empty.

---

## Non-profile provider references (generic)

| Location | Copy pattern | Individual link? |
|----------|--------------|------------------|
| `/adhd-care` | “board-certified providers,” “ADHD-CCSP provider” | ✗ |
| `/telehealth`, `/mens-health-longevity`, `/weight-loss-metabolic-health` | “board-certified providers/clinicians” | ✗ |
| `/index` testimonials | “Dr. Pandey” (ambiguous; context = Sneh) | External HelloKlarity only |
| Sitewide footer | “Board-certified providers” | ✗ |
| 65 Health Guides | `reviewerSlug` in seeds; UI shows “Pending physician review” | ✗ |
| 50 blog articles | Pending review block | ✗ |

---

## Assets inventory

| Asset | Used on |
|-------|---------|
| `dr-sneh-pandey.png` | Profile, About (2×), cross-links |
| `dr-sneh-pandey-founder.png` | Homepage only |
| `dr-natasha-desai.png` | Profile, About |
| `dr-swati-pandey.png` | Profile, About |
| `care-team.png` | About hero (generic team, not individual headshots) |
| `provider-placeholder.svg` | Exists in assets; **not used** on live provider pages |

---

## Data layer (existing, not page-generating)

| File | Purpose |
|------|---------|
| `data/entity-graph.json` | Canonical provider graph, conditions, state hubs |
| `provider-index.json` | Machine index (generated) |
| `scripts/clinical-entity.mjs` | Physician schema builder, review blocks, reviewer routing |
| `data/content-review-registry.mjs` | Clinical sign-off allowlist (currently empty) |

---

## Navigation & discovery

| Surface | Provider discovery |
|---------|-------------------|
| Primary nav | No “Providers” or “Our team” link |
| Footer | No provider links |
| `/about` | Medical Director + 3 team cards → profiles |
| Service pages | Generic “providers” language only |
| Sitemap | 3 provider URLs (priority 0.85) |
