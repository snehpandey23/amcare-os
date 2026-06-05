# Provider Page UI Strategy

Generated: 2026-06-05  
Inspiration: [Kiwi Health provider layout](https://www.kiwihealth.com/provider/TX/Pearland/Sneh-Pandey) (structured credentials, philosophy, specialties, education) — adapted to Siya design system (`styles.css`, `provider-lp-*` classes)

---

## Design goals

1. **Scalable** — one template, data-driven sections, per-provider optional blocks.
2. **Trust-first** — name + credentials above the fold; emotional copy as secondary deck.
3. **Mobile-safe** — no credential walls; chips and accordions for long training lists.
4. **Consistent** — same section order and component names across all providers.

---

## Preferred layout: **Split hero + stacked sections** (no sticky sidebar)

Sidebars add maintenance cost and hurt mobile. Use full-width sections with optional **in-page anchor nav** when 8+ sections.

---

## Desktop wireframe (≥900px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Home  About  ADHD  Weight  Telehealth  Guides  Blog   [Meet&Greet] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Breadcrumb: Home › Our providers › Dr. Sneh Pandey, MD                     │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  H1: Dr. Sneh Pandey, MD      │         ┌─────────────────────┐             │
│  Sub: Medical Director         │         │                     │             │
│  [IM] [Obesity] [ADHD-CCSP]    │         │   Headshot 1:1      │             │
│  [CA] [TX] [PA] [FL]           │         │   280–320px         │             │
│  Lead: 1-line clinical focus   │         │                     │             │
│  [Meet & Greet] [ADHD Screen]  │         └─────────────────────┘             │
│  ── optional emotional deck ─  │         Credential card (compact):          │
│  "If you're exhausted..."      │         · Board: ABIM, ABOM                  │
│                                │         · ADHD-CCSP                        │
├────────────────────────────────┴─────────────────────────────────────────────┤
│  § Clinical focus          [4 cards in 2×2 grid]                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  § Credentials & training  [timeline or definition list — 2 col on desktop]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  § Care philosophy         [single prose block]                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  § Who I help              [bullet list]                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  § Services & conditions   [linked chips → service pages]                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  § What to expect          [numbered steps — reuse provider-lp-steps]        │
├─────────────────────────────────────────────────────────────────────────────┤
│  § States & telehealth     [trust-strip-compact — 3 cards]                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  § Reviewed content        [0–6 links — only if clinically reviewed]         │
├─────────────────────────────────────────────────────────────────────────────┤
│  § CTA band                [Meet & Greet + Explore care]                     │
│  Disclaimer + profile meta (last updated · credential status)                 │
│  Other providers: [card] [card] [card]                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile wireframe (<768px)

```
┌──────────────────────────┐
│  [≡]  Siya Health        │
├──────────────────────────┤
│  Breadcrumb (truncated)  │
│  ┌────────────────────┐  │
│  │    Headshot 1:1    │  │  ← Image FIRST on mobile
│  └────────────────────┘  │
│  Dr. Name, MD            │  ← Name H1 (not emotional line)
│  Role · Credentials chips  │
│  State chips (wrap)        │
│  [Meet & Greet full width] │
│  [Secondary CTA]           │
│  Emotional deck (optional) │
├──────────────────────────┤
│  Focus cards (1 col)     │
├──────────────────────────┤
│  Credentials (accordion)   │  ← Collapse education/work
├──────────────────────────┤
│  Philosophy              │
│  Who I help              │
│  Services (chip wrap)    │
│  Steps                   │
│  States / trust strip    │
│  Reviewed content        │
│  CTA band                │
│  Disclaimer + meta       │
│  Other providers (scroll)│
└──────────────────────────┘
```

**Mobile rules**

- Image before copy (trust recognition).
- Max 2 credential chips visible before “+N more”.
- Education/work history in `<details>` accordion — avoid Kiwi-style long bullet walls on small screens.
- Sticky bottom CTA **optional** only for ADHD funnel pages; default = inline CTAs.

---

## Component map (reuse + new)

| Component | CSS class (existing / proposed) | Notes |
|-----------|-------------------------------|-------|
| Provider hero | `.provider-lp-hero`, `.provider-lp-hero-inner` | **Change:** swap H1 to name; move emotional line to `.provider-lp-hero-deck` |
| Photo | `.provider-lp-photo-wrap` | 1:1 ratio, `border-radius: 16px`, `max-width: 280px` |
| Credential chips | `.provider-lp-badges` | Reuse for boards + ADHD-CCSP |
| State chips | `.provider-state-chips` (new) | Distinct color from credential chips |
| Credential card | `.provider-credential-card` (new) | Desktop: beside photo; mobile: below image |
| Section shell | `.provider-lp-section`, `.section-tinted` | Alternate tint per section |
| Split body | `.provider-lp-split` | Why patients choose / philosophy |
| Steps | `.provider-lp-steps` | What to expect |
| Trust strip | `.trust-strip-compact` | States, HIPAA, board |
| CTA cluster | `.provider-lp-ctas`, `.cta-band` | One exit band at bottom |
| Reviewed content | `.provider-reviewed-content` (new) | Mirror `related-health-guides` |
| Provider cross-links | `.provider-lp-cross` | + future `.provider-card-row` on index |
| Profile meta | `.provider-profile-meta` (new) | Last updated, verification status |
| Accordion credentials | `.provider-credentials-accordion` (new) | Mobile education/work |

---

## Spacing recommendations

| Token | Value |
|-------|-------|
| Hero top padding | `100px` mobile / `120px` desktop (clear fixed header) |
| Section vertical | `40px` mobile / `56px` desktop (match `.provider-lp-section`) |
| Chip gap | `8px` |
| CTA gap | `12px` |
| Max prose width | `65ch` for philosophy |
| Container | `1100px` (`--container-max`) |

---

## Image ratio recommendation

| Use | Ratio | Min source |
|-----|-------|------------|
| Profile hero | **1:1** | 560×560 |
| Provider card (index) | 1:1 | 200×200 |
| About team thumb | 1:1 | 176×176 |
| OG/social | 1.91:1 | 1200×630 (crop from 1:1 with safe margins) |

Use one **canonical headshot per provider**; founder/environment shot only on homepage story block.

---

## Trust signal placement

| Signal | Position |
|--------|----------|
| Board certification | Hero credential card + Credentials section |
| State licenses | Hero chips + States section |
| HIPAA | Trust strip (not hero) |
| Last updated / verified | Footer of main content, above disclaimer |
| Reviewed articles | Below credentials, above CTA |
| Third-party reviews | Optional link (HelloKlarity pattern on homepage) — not fabricated on-page quotes |

---

## Kiwi Health patterns to adopt / avoid

| Adopt | Avoid |
|-------|-------|
| Structured education + work timeline | Emoji checklist treatment approaches |
| Separate Philosophy block | Unverified aggregate rating percentages |
| Specialties + conditions lists | Long condition laundry list without service links |
| Video visit prep | Marketplace branding (“built by Kiwi”) |
| Accepting new patients badge | Copying Kiwi bio verbatim onto Siya |

---

## Navigation integration (future)

- Add **Our providers** to About dropdown or top nav when `/providers` index ships.
- Service pages: **2–3 provider cards** filtered by `statesLicensed` + `clinicalFocus`.
