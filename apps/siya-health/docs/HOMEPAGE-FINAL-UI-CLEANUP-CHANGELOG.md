# Homepage Final UI Cleanup Changelog

Visual refinement only. No redesign, SEO/routing/analytics changes, or conversion-flow rewrites.

## Completed

### Logo
- Header/footer mark: `siya-health-logo-registered.png` (official ®) replacing TM `pre-registered`
- Transparent PNG derived from registered asset for chrome use; OG/schema keep white `siya-health-logo.png`
- Logo size ~+50%: `--header-logo-height` 56→84px, desktop 72→108px; footer compact 64→96px
- `normalizeBrandLogos()` updated so builds keep the registered mark

### Header rhythm
- Nav centered (not flushed to CTA)
- Cluster spacing: brand links (Home/About/Care Team) → services (ADHD/Weight/Telehealth/Men’s/Blog) → flexible space → CTA
- Primary nav: Health Guides removed; Men’s Health added; Care Team label shortened
- Chrome: `injectMensHealthNav`, Health Guides stripped from primary/mobile nav (footer guides unchanged)

### Hero
- Primary: Book Free Meet & Greet (unchanged)
- Secondary: solid **Explore Our Blog** → `/blog` (replaces Secure Medical Chat text link)
- Removed ADHD-specific `hero-edu-routing` line (states remain in trust bar)

### Common Care Paths
- Editorial photos on all four cards (existing site imagery):
  - Primary Care → `editorial-finally-heard.jpg`
  - Weight Loss → `editorial-weight-effort.jpg`
  - ADHD → `editorial-focus-overwhelm.jpg`
  - Men’s Health → `editorial-burnout-afterwork.jpg`

### Men’s Health page
- Production polish of `/mens-health-longevity` (same URL): recognition section, editorial hero, Meet & Greet CTAs, existing blog/guide links preserved
- MedConnect `doctor-video-consult.png` removed from men’s (+ women’s hero swap)

## Tracking notes
- Hero secondary uses `data-siya-track="blog_click"`
- Nav Chat CTA unchanged on homepage
