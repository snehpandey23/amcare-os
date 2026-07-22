# Homepage Final Lock — Cosmetic Polish

**Status:** Homepage frozen for production after this pass.  
**Scope:** Logo legibility + nav item spacing only. No layout, copy, CTA, SEO, or routing changes.

## Changes

### Logo (+~30% display size, header bar unchanged)
- `--header-logo-height`: 84px → **109px**
- `--header-logo-height-desktop`: 108px → **140px**
- `--header-height` remains **72px**
- Logo link uses a fixed header-height layout box; image paints larger with compensating `margin-block` so the bar does not grow
- Footer compact logo: 96px → **125px** (desktop); mobile footer: 44px → **58px**

### Nav spacing (+~22%)
- Desktop `.nav-center` gap: 18px → **22px**
- Cluster gap after Care Team: 18px → **22px**
- Homepage override gap: 16px → **20px**
- Position/balance unchanged (still centered; not pulled to logo or CTA)

## QA checklist (verified live on www.siya.health)
- [x] Desktop header: logo 140px; bar ~92px (unchanged; 72px content + container padding); nav gap 20px; single-row nowrap
- [x] Mobile header (390×844): logo 109px; bar ~92px; 205px gap to hamburger; menu opens below bar with no overlap
- [x] Desktop footer: compact logo 125px
- [x] Mobile footer: compact logo 58px
- [x] No layout shift from oversized logo (layout box stays `--header-height`)

**Homepage is frozen for production.** No further homepage changes except true bugs.
