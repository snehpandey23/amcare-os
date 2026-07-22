# Siya Health — Phase 2 Page Polish Changelogs

Polish only. No redesign. Homepage and ADHD Care frozen from Phase 1.

---

## 1. About (`/about`)

### Readability Improvements
- Shortened hero lead
- Tightened Why We Exist copy; expanded scan bullets
- Medical Director bio converted to short intro + bullets
- Removed mid-page Meet & Greet under Who We Help (hero + final remain)

### Visual Improvements
- Trust states card de-duplicated (heading + body no longer repeat full state names twice)

### Image Updates
- Hero: `doctor-office.png` (Wellspring Medical stock) → `editorial-finally-heard.jpg`
- Why We Exist: `care-team.png` (Wellspring stock) → `editorial-exhausted-morning.jpg`

### Consistency Fixes
- Privacy Policy card now links to `/legal/privacy-policy` (was wrongly pointing at Notice of Privacy Practices)
- Fixed `normalizeLegalLinks` regex that crossed `</a>` and rewrote Privacy Policy cards to NPP on every build

### Deferred Ideas
- Full About narrative rewrite
- Custom Siya team photography shoot for care-team surfaces

---

## 2. Medical Weight Loss (`/weight-loss-metabolic-health`)

### Readability Improvements
- Complexity cards shortened to one sentence each
- Care roadmap steps converted to bullets
- Duplicate “Who This Program Is For” card grid → compact bullet list (recognition grid retained above)

### Visual Improvements
- Clearer hierarchy between recognition cards and audience bullets

### Image Updates
- Hero: `weightloss-health.png` (MedConnect-branded stock) → `editorial-weight-effort.jpg`

### Consistency Fixes
- Pricing strip note: Meet & Greet (not Secure Chat); generator `conversion-cleanup-content.mjs` updated to match

### Deferred Ideas
- Merging Cornerstone + Learn More link hubs
- Custom metabolic recognition photography set
- Replacing SVG media-accent block with editorial photo

---

## 3. Telehealth (`/telehealth`)

### Readability Improvements
- FAQ CTA tracking location fixed (`telehealth-faq`)

### Visual Improvements
- Mid-page SVG illustration band → editorial photo figure (same section slot)

### Image Updates
- Hero: `doctor-video-consult.png` (MedConnect stock) → `editorial-adhd-consult.jpg`
- Mid media: `editorial-finally-heard.jpg`
- Preload updated to match hero

### Consistency Fixes
- FAQ mid-CTA: Chat → Meet & Greet
- Pricing strip note: Meet & Greet language
- State line uses middots (CA · TX · PA · FL pattern)

### Deferred Ideas
- Collapsing recognition grid vs services grid overlap
- Custom branded telehealth photography (no competitor UI)

---

## 4. Care Team (`/providers`)

### Readability Improvements
- Hero lead + supporting line shortened
- Positioning blurb tightened

### Visual Improvements
- Hero layout preserved; stock team photo replaced with consult editorial

### Image Updates
- Hero media: `care-team.png` (Wellspring) → `editorial-adhd-consult.jpg`
- Change lives in `generate-provider-pages.mjs` so builds keep it

### Consistency Fixes
- Filters and empty-heading hide behavior unchanged

### Deferred Ideas
- Real Siya clinician group photo
- Adding a light final CTA band (would be a small IA addition—deferred)

---

## 5. Blog (`/blog`) — minor only

### Readability Improvements
- None structural (hub layout preserved)

### Visual Improvements
- None beyond hero swap

### Image Updates
- Hero: `blog-hero-doctor-consultation.png` (“Doctor Philo” stock) → `editorial-finally-heard.jpg`

### Consistency Fixes
- Final CTA: Chat → Meet & Greet
- Hero state formatting uses middots
- Card title/href mismatches fixed (Vyvanse vs Adderall; Houston treatment; Texas diagnosis titles)

### Deferred Ideas
- Trimming Featured & Trending from 12 → 3–4 cards
- Deduplicating articles across featured + category sections
- Cleaning ~250 blank lines in `<head>`
