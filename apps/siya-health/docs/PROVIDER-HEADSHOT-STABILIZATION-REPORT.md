# Provider Headshot Stabilization Report

Generated: 2026-06-05  
Sprint: Provider Expansion Stabilization

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Duplicate/wrong-person headshots published | 4 | **0** |
| `photoStatus: approved` | implicit | 3 (Sneh, Natasha, Swati) |
| `photoStatus: pending` | — | 4 (Vanessa, Megan, Derek, Wendy) |
| Placeholder in HTML/schema | No | **Yes** for pending |

## Implementation

- Added `photoStatus` (`approved` | `pending`) in `data/internal-provider-records.mjs`
- Added `resolveProviderPhoto()` in `data/providers-core.mjs`
- Pending providers render `assets/provider-placeholder.svg` (neutral silhouette — not a real photo)
- Alt text: `[Name], [Credential] — profile image pending` (credential omitted when already in display name)
- Profile hero shows subtle note: **Profile photo pending**
- Hub cards, homepage care team, and service cards use compact placeholder + initials overlay

## Per-provider status

| Provider | photoStatus | Public image | Deploy-safe? |
|----------|:-----------:|--------------|:------------:|
| Dr. Sneh Pandey | approved | `dr-sneh-pandey.png` | Yes |
| Dr. Natasha Desai | approved | `dr-natasha-desai.png` | Yes |
| Dr. Swati Pandey | approved | `dr-swati-pandey.png` | Yes |
| Dr. Vanessa Urbina | pending | placeholder SVG | Gated |
| Megan Wunderlich | pending | placeholder SVG | Gated |
| Derek Timbs | pending | placeholder SVG | Gated |
| Wendy Delgado | pending | placeholder SVG | Gated |

## Files changed

- `data/providers-core.mjs`
- `data/internal-provider-records.mjs`
- `scripts/generate-provider-pages.mjs`
- `scripts/site-chrome.mjs`
- `styles.css`
- Regenerated: `providers/*.html`, service/home cards via `seo-build`

## Gate status

**PASS** — No wrong-person headshots ship. Pending providers clearly labeled.

## Next action (non-blocking for commit)

Replace placeholder with approved photos → set `photoStatus: 'approved'` → rebuild.
