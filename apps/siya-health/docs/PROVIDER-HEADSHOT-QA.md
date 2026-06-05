# Provider Headshot QA

Generated: 2026-06-05 (post-stabilization)

## Summary

| Metric | Result |
|--------|--------|
| Wrong-person duplicate PNGs in HTML | **0** |
| Pending providers on placeholder | **4** |
| Approved photo profiles | **3** |
| **Gate** | **PASS** |

Duplicate interim PNGs (`dr-vanessa-urbina.png`, etc.) are **not referenced** in generated HTML. Pending providers use `assets/provider-placeholder.svg` with pending alt text.

## Per-provider

| Provider | photoStatus | Public asset | Alt matches? | Deploy-ready photo |
|----------|:-----------:|--------------|:------------:|:------------------:|
| Dr. Sneh Pandey | approved | `dr-sneh-pandey.png` | Yes | Yes |
| Dr. Natasha Desai | approved | `dr-natasha-desai.png` | Yes | Yes |
| Dr. Swati Pandey | approved | `dr-swati-pandey.png` | Yes | Yes |
| Dr. Vanessa Urbina | pending | placeholder SVG | Yes | Gated |
| Megan Wunderlich | pending | placeholder SVG | Yes | Gated |
| Derek Timbs | pending | placeholder SVG | Yes | Gated |
| Wendy Delgado | pending | placeholder SVG | Yes | Gated |

See `PROVIDER-HEADSHOT-STABILIZATION-REPORT.md` for implementation detail.
