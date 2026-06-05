# Provider Page E-E-A-T Requirements

Generated: 2026-06-05  
Purpose: Minimum trustworthy physician profile standard for Siya Health

---

## Principles

1. **Experience** — Show real training, licenses, and clinical focus (not marketing adjectives alone).
2. **Expertise** — Tie each provider to conditions they actually treat; link to service pages and reviewed content only when true.
3. **Authoritativeness** — Consistent credentials across site, schema, and profiles; Medical Director role explicit for Sneh only.
4. **Trustworthiness** — State licensing, telehealth limits, disclaimers, last-updated date, verification status.

---

## Required sections (every provider page)

### 1. Hero section

| Element | Requirement |
|---------|-------------|
| Provider photo | Professional headshot, min 560×560 source, displayed ~280px; WebP + PNG fallback |
| Name | `Dr. [First Last], MD` visible in first screen |
| Credentials | MD + board/cert chips (only verifiable items) |
| Role | Job title (Medical Director, Psychiatric Physician, etc.) |
| States licensed | Chip row: only states on active license file |
| Primary CTA | Meet & Greet (default) or service-specific CTA (ADHD screening on ADHD-heavy profiles) |

**Current gap:** H1 is emotional copy; name appears only in `<title>` and badges, not as primary heading.

---

### 2. Clinical focus areas

Include **only relevant** areas from:

- ADHD (adult evaluation, medication, screening)
- Metabolic health / obesity medicine
- Medical weight loss / GLP-1
- Hormones / men's health
- Telehealth / primary care
- Behavioral health / anxiety overlap
- Psychiatry (depression, complex meds)

Format: 4–6 bullet cards with one-line patient-facing description.

---

### 3. Credentials & training

| Field | Required? | Notes |
|-------|-----------|-------|
| Medical degree (school, country) | Yes | MD or equivalent |
| Residency | Yes | Specialty + institution if public |
| Fellowship | If applicable | Optional |
| Board certification | Yes, per specialty | Name the board (e.g., ABIM, ABFM, ABPN) — **do not claim if not certified** |
| ABOM | If obesity medicine | Sneh only today |
| ADHD-CCSP | If completed | Explain acronym once sitewide |
| Active licenses | Yes | State list + “confirm at scheduling” |
| Professional memberships | Optional | AMA, county medical society, etc. |

**Do not include:** unsourced patient volume, “world-class,” “leading expert” without evidence.

---

### 4. Care philosophy

- **1 short paragraph** (80–120 words), human voice.
- Must answer: *How do you practice? How do you communicate? What do you refuse to do?*
- No generic “patient-centered care” without specifics.

**Inspiration (Kiwi Health):** philosophy + treatment approaches as separate, scannable blocks — adapt tone for Siya (less checklist emoji, more clinical warmth).

---

### 5. Conditions / services supported

- Link each focus area to a **live service page** (`/adhd-care`, `/weight-loss-metabolic-health`, etc.).
- Do not link to conditions the provider does not serve in licensed states.

---

### 6. Patient-fit section

**“Who I commonly help”** — 4–6 bullets:

- Example: “Adults with late ADHD diagnosis and high-functioning burnout”
- Example: “Patients needing psychiatric depth for ADHD + depression overlap”

Avoid implying exclusive ability to treat.

---

### 7. Availability / states

| Element | Requirement |
|---------|-------------|
| State list | Match `entity-graph.json` exactly |
| Telehealth disclaimer | “Eligibility depends on state law, visit type, and clinical appropriateness” |
| New patients | Accepting / waitlist if known |
| Controlled substances | Note if PDMP / ID verification required (ADHD profiles) |

---

### 8. Review status

| Element | Requirement |
|---------|-------------|
| Profile last updated | Visible date (ISO in schema, human-readable on page) |
| Credential verification status | e.g., “Credentials verified by Siya Health operations [date]” or “Pending annual reverification” |
| Content reviewed by | Only if this provider signed off on profile copy |

**Current gap:** No last-updated or verification block on provider pages.

---

### 9. Related articles / Health Guides

**Only include content this provider actually reviewed or authored.**

| Rule | Current state |
|------|---------------|
| Link blog/guide with `clinical-review--reviewed` + matching reviewer | 0 pages qualify today |
| Do not imply review via `relatedContent` in entity-graph alone | Graph lists aspirational links |

When registry is populated, show 3–6 links max with “Reviewed by Dr. X” label.

---

### 10. CTA

| CTA | When |
|-----|------|
| Book a Meet & Greet | Always (primary or secondary) |
| Explore Care Options | Link to most relevant service hub |
| Start Free ADHD Screening | ADHD-focused providers only |

Exit band: single `cta-band` (match blog consistency standard).

---

## YMYL compliance checklist (per page)

- [ ] No guaranteed outcomes
- [ ] Emergency / crisis language where psychiatric content exists
- [ ] HIPAA mention without overclaiming certification badges
- [ ] Testimonials labeled as illustrative or linked to verified platform
- [ ] Privacy policy / terms point to `siya.health` (not legacy `adhd.siya.health`)

---

## Per-provider minimum focus (current roster)

| Provider | Must emphasize | Must omit |
|----------|----------------|-----------|
| Sneh | Medical Director, obesity + ADHD, 4-state license, metabolic overlap | Psychiatric-exclusive claims |
| Natasha | Behavioral + family lens, TX/FL, anxiety/ADHD overlap | PA license, weight-loss program lead |
| Swati | Psychiatric depth, PA only, complex meds | 4-state license, obesity program stats |
