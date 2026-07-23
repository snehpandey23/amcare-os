# Instagram static design system — Siya Health

```text
Status: Locked from founder feedback 2026-07-21
Applies to: All Instagram carousels + static posts going forward
Prototype: Perfect ONE slide before regenerating full carousels
```

## What went wrong (WH-R-02 v1)

- White logo plate sitting on top of headline
- “siya.health / Educational only” as a prominent badge
- Brand elements fighting the illustration instead of living inside it

## Rules (non-negotiable)

### Logo
- **Submerged**, not stamped — present but not loud.
- No white box, no rounded plate, no opaque badge.
- Brand must be **recognizable**, not invisible. Target: noticeable at a glance, never competing with headline.
- **Sizing (locked from prototype feedback 2026-07-21):**
  - Corner wordmark ≈ **80–90px** tall on 1080×1350 (~2× early prototype)
  - Ambient mark watermark ≈ **400–450px** tall at low opacity in a quiet field
  - Opacity: wordmark ~30–35%; ambient mark ~10–14%
- Headline and body text must remain fully readable **on top of** any logo presence.

### Footer (every slide)
One quiet footnote line only — same treatment on every slide:

```text
siya.health  ·  All content for educational purposes only
```

- Small footnote size (editorial fine print), not a pill/button/badge
- Low contrast charcoal on cream — visible, never loud
- No second disclaimer box elsewhere

### Header / layout
- One composition: brand presence is ambient; copy + image do the work
- Left/top: quiet zone for headline; illustration holds the emotional center
- No floating chips, promo stickers, or URL callout boxes on mid-slides
- End slide may use a slightly stronger path line, still no badge chrome

### Copy clarity (carousel content)
- Every headline must be understandable in one glance without prior context
- Avoid insider metaphors unless the support line explains them immediately
- **Company carousels must include ≥1 practical, evidence-aligned change** (see `EDITORIAL-TEST.md`)
  - Fail: open-ended vibe with no next step
  - Pass: track → ask clinician for X / do Y for N days

### Production workflow
1. Agree design theme on **one** perfected static (header + footer + submerged logo) ✅
2. Lock useful copy (recognition → explanation → practical change)
3. Batch regenerate carousel with locked theme + copy
4. Caption must restate the practical change

## Prototype file

`editorial-packs/WH-R-02/images/prototype/slide-01-prototype.png`
Desktop: `~/Desktop/Siya-IG-Prototype/`

## Related

Full brand visual identity (palette, lighting, people, video): `SIYA-HEALTH-VISUAL-STYLE.md`.
