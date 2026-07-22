# Homepage Final Polish Changelog

Focused production polish based on desktop human review + transcript. No redesign. No carousel. Layout architecture preserved.

---

## Completed Changes

### Header and logo
- Increased header logo size (~1.5×): `--header-logo-height` 48→56px mobile, desktop 56→72px; homepage max-width up to ~260px
- Footer compact logo height 52→64px
- Rebalanced nav: links `justify-content: flex-end` with tighter gaps so Blog sits closer to the CTA (removes the empty “dead zone”)
- Homepage navbar CTA: **Start Secure Medical Chat** (`/redirect/chat`) instead of repeating Meet & Greet
- Generator: `resolveNavCtaSlot('index.html')` → `CTA_SLOTS.secureChat` so builds keep this

### Hero
- Softened headline tone (transcript: opening felt too negative): “Something feels off—and you want clearer answers.”
- Shortened lead; states moved into supporting edu line
- Primary CTA: **Book Free Meet & Greet**
- Secondary: text link **Start Secure Medical Chat** (not a second equal button; not “Explore Care Options”)
- Trust chips updated toward current figures (patients / Google rating / states)
- No carousel; existing frosted hero structure kept

### Recognition section
- Removed **Start Here** eyebrow
- Removed interrupting **Physician-led care for everyday health** block so flow is Hero → Recognition
- Recognition cards unchanged (layout, links, imagery)

### How to Get Started
- Renamed **How We Get Started** → **How to Get Started**
- Kept three-step structure with concise bullets

### Common Care Paths
- Renamed **Where People Often Start** → **Common Care Paths**
- Reduced to four cards:
  1. Primary Care and Ongoing Care → `/telehealth`
  2. Medical Weight Loss → `/weight-loss-metabolic-health`
  3. ADHD Evaluation and Treatment → `/adhd-care`
  4. Men’s Health and Hormone Care → `/mens-health-longevity` (existing page; no new page created)
- Removed Fatigue & Wellness as a standalone care path
- Shorter card copy; one primary link each

### Care team
- Homepage shows **3** featured providers only
- **View full care team** retained → `/providers`
- `buildHomepageCareTeam()` in `site-chrome.mjs` limited to `.slice(0, 3)` so builds don’t restore all seven

### Reviews and trust
- Trust summary leads the section with owner-supplied figures:
  - 4.8★ Google rating
  - 44 Google reviews
  - 2,200+ patients treated
  - 1,000+ ADHD evaluations & screenings
  - 600+ verified patient reviews
- Source of truth: `data/homepage-trust-metrics.mjs` (+ aligned `design-system/trust-system.mjs` items)
- Testimonials kept secondary under the stats
- Warmer contrast via existing brand blues/teals (no new palette)
- Removed prominent **HelloKlarity** “read all reviews” button

### Conversion sections
- Replaced weak “Care that continues / See pricing” bridge with **Still not sure where to start?**
  - Primary: Start Secure Medical Chat
  - Secondary: Book Free Meet & Greet
  - Call + email using existing `(215) 445-1244` / `care@siya.health`
  - Short platform disclosure
- Final CTA: Chat primary, Meet & Greet secondary (Explore Care Options removed)
- Homepage final-CTA inject in `site-chrome.mjs` updated to match

### Pricing navigation bug
- `scripts/generate-pricing-page.mjs` now emits standard header (logo + nav + mobile menu) and footer with homepage link
- Regenerated `pricing.html`

### Mobile synchronization
- Same content hierarchy; CSS stacks trust stats 2-col → 5-col, featured providers 1→3 col, care paths 1→2→4 col
- Larger logo constrained with max-width; nav CTA remains mobile-menu based under 900px

---

## Tracking Verification

| Location | Label | Destination | Track |
|---|---|---|---|
| Nav / nav-mobile | Start Secure Medical Chat | `/redirect/chat` | `secure_chat_click` |
| Hero primary | Book Free Meet & Greet | `/redirect/meet-greet` | `meet_greet_click` |
| Hero secondary | Start Secure Medical Chat | `/redirect/chat` | `secure_chat_click` |
| Still not sure primary | Start Secure Medical Chat | `/redirect/chat` | `secure_chat_click` |
| Still not sure secondary | Book Free Meet & Greet | `/redirect/meet-greet` | `meet_greet_click` |
| Final primary | Start Secure Medical Chat | `/redirect/chat` | `secure_chat_click` |
| Final secondary | Book Free Meet & Greet | `/redirect/meet-greet` | `meet_greet_click` |
| Care team hub | View full care team | `/providers` | (text link) |
| Care paths | Telehealth / Weight / ADHD / Men’s | existing routes | (text links) |

---

## Content or Data Assumptions

- Trust figures live in `apps/siya-health/data/homepage-trust-metrics.mjs` (edit there first).
- Mirrored into `design-system/trust-system.mjs` for hero trust-bar profiles.
- Contact: phone `+1-215-445-1244`, email `care@siya.health` (entity graph / existing site).
- Men’s Health card points to existing `/mens-health-longevity` (no new page in this sprint).

---

## Deferred Items

- Hero carousel / rotating human stories (explicitly rejected for performance + cognitive load)
- Full storytelling homepage redesign (Apple/Headspace-style full-bleed story system)
- New brand color system or “warmer healthcare” redesign beyond light trust/CTA contrast
- Dedicated new Men’s Health page beyond existing longevity route
- Custom photography shoot for care-path cards
- Homepage V3 architecture
- Separating mobile-only content strategy
