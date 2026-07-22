# Phone audit — 2026-07-22

Base: https://www.siya.health  
Device: iPhone 13 emulation (390×844)  
Shots: `docs/phone-audit/2026-07-22/shots`  
Raw: `findings.json`, `lighthouse/*.json`

## Lighthouse mobile scores

| Page | Perf | A11y | BP | SEO |
|---|---:|---:|---:|---:|
| home | 64 | 96 | 100 | 92 |
| adhd-care | 59 | 96 | 100 | 100 |
| weight-loss | 65 | 96 | 100 | 100 |
| telehealth | 66 | 96 | 100 | 100 |
| mens-health | 66 | 96 | 100 | 100 |
| labs | 65 | 95 | 100 | 92 |
| blog | 65 | 96 | 100 | 100 |

## Automated layout probes

No horizontal overflow, broken images, or sticky-overlap flags on the audited set.

**Medium (all pages):** 8+ tap targets under ~40px height — mostly inline text links (`Learn more`, doctor profile, `pricing`, blog `Read More →`).

## Visual review (screenshots)

### What looks solid
- Service heroes (ADHD, weight loss, telehealth, men’s): glass card + stacked CTAs fit the viewport; nav does not collide with headline.
- Recognition / symptom cards: topic-true imagery; single-column stack reads cleanly.
- Labs visual strip: kit + draw photos readable on cream.
- Blog hub: newsletter + health-guides CTAs; search + featured cards usable.
- Mobile nav: large row targets, clear list.

### Issues found

| Pri | Page | Issue | Evidence |
|---:|---|---|---|
| P0 | **labs** | Helper lines under states nearly unreadable (dark grey on dark glass) | `labs-hero.png` — “Not sure which tests…” / “Already have results…” |
| P1 | **home** | Secondary hero CTA clipped at fold; sticky bar duplicates primary Meet & Greet | `home-hero.png` |
| P1 | **sitewide** | Inline / text-link tap heights ~17–31px | `findings.json` `small-tap-targets` |
| P2 | **adhd-care** | “Poor Focus” card title + body blue vs black siblings (selected state or style leak) | `adhd-care-section.png` |
| P2 | **blog** | “Popular with our patients.” sits tight under sticky header | `blog-section.png` |
| P3 | **perf** | Mobile Lighthouse Perf 59–66 (ADHD lowest) | LH table above |

## Punch list (fix order)

1. **Labs hero contrast** — ✅ Fixed: light text on `.labs-hero-value` / hero glass `p` (global `p` color was winning).
2. **Home hero CTA budget** — ✅ Fixed: sticky Meet & Greet reveals only after hero CTAs leave viewport (`header-scroll.js` + `.is-revealed`).
3. **Tap targets** — ✅ Fixed: mobile `min-height: 44px` on text CTAs (profile, lab topics, blog Read More, etc.).
4. **ADHD recognition blue** — Confirm intentional focus state; if not, restore black typography like sibling cards.
5. **Blog section spacing** — Add ~8–12px under sticky header before “Popular with our patients.”
6. **Perf (optional)** — ADHD hero/image weight first if chasing LH mobile ≥70.

## Out of scope / OK for now

- No sticky Labs CTA (prior product decision).
- Blog content density after hub cleanup — acceptable.
- Men’s / weight / telehealth image rematches — hold on phone.

## Next

Deploy to production, then re-run `npm run phone:audit`. Optional follow-ups: punch items **4–5**.
