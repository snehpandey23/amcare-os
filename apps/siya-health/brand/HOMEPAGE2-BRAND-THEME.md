# Siya Health — homepage2 brand theme

Standalone spec taken from the locked homepage2 preview (`apps/siya-health/homepage2.html`). Use this for pitch decks, one-pagers, and other creative. It is not the social-carousel frame spec (those still use Georgia on cream). Do not treat this file as permission to restyle the rest of the website until that follow-up is approved.

Status: extracted from the current homepage2 build. Founder can still lock wording; the visual values below are what the page actually uses.

---

## Color

| Name | Hex | Use |
|---|---|---|
| Cream | `#F4EFE7` | Page background |
| Cream light | `#F7F2EC` | Soft section wash |
| Cool mist | `#E8EEF8` | Soft section wash (blue end of a cream blend) |
| White | `#FFFFFF` | Cards at about half strength (`50%` white) |
| Navy | `#001878` | Logo navy, rules, icons, end of button gradient |
| Dark navy | `#0A246B` | Headings and body ink on cream |
| Magenta | `#D81088` | Accent word, icon color, start of button gradient |
| Mid magenta | `#A81490` | Middle stop of the headline emphasis gradient |
| Violet | `#7B2D8E` | Middle stop of the button gradient |
| Champagne | `#C4A574` | Rare accent only (not a button fill) |
| White text | `#FFFFFF` | Text on gradient buttons |

Headline emphasis is a left-to-right word fill: magenta `#D81088` (0–28%), `#A81490` (48%), dark navy `#0A246B` (68%), navy `#001878` (100%). Short words must show both magenta and navy, not a solid pink.

Body copy on cream is dark navy at about 78% strength, not brown or charcoal.

---

## Type

- Headings: **Poppins** (300, 600, 700). Hero uses 700. Emphasis words are 700.
- Body: **Inter** (400, 500, 600, 700).
- Fallback: system sans if those fonts are not loaded.

Sizes used on homepage2:

| Role | Size |
|---|---|
| Hero headline | 34px to 54px (scales with the screen), line height 1.15 |
| Section heading | about 28px to 36px |
| Card title | 18px to 21px |
| Body and card support | 16px, line height about 1.45 |
| Small captions | 12px to 14px |

Headings sit tight to the line. Do not add letter-spacing on the hero headline.

---

## Buttons

Primary call to action, including the nav button and the same treatment as the AI concierge launcher:

- Shape: full pill (fully rounded ends).
- Fill: diagonal gradient, top-left to bottom-right — magenta `#D81088` → violet `#7B2D8E` → navy `#001878`.
- Text: white.
- Shadow: soft magenta glow, about 10px down, 28px blur, magenta at 22% opacity.
- Hover: same fill, about 5% brighter. No underline.
- Border: none.

Secondary actions stay quiet text links in navy, not a second filled color.

---

## Cards

Access-pain cards, symptom / recognition boxes, and the “Siya vs traditional clinics” cards share one treatment:

- Corner radius: about 18px (1.1rem).
- Fill: white at 50% opacity, so cream shows through.
- Border: 1px navy `#001878` at 10% opacity.
- Inner padding: about 20px vertical, 22px horizontal.
- Gap between cards: about 15–20px.
- Icons on those cards: magenta `#D81088`, simple line icons, about 34px.
- Comparison cards: same box. Each row uses the original emoji as the marker (not a new icon set).

Do not use a hard drop shadow on these cards. Do not use brown outlines.

---

## Spacing

- Page sections: 72px top and bottom on desktop, 40px on small screens.
- Content column: up to 1100px wide, 24px side padding.
- Page background stays cream between sections. Soft section blends use cream into `#E8EEF8` and back to `#F7F2EC`.

---

## What this is not

The rest of siya.health still uses an older shared button fill (a steeper magenta-to-violet gradient that ends near `#642EAE`, not this homepage2 magenta–violet–navy pill). Social carousels still use Georgia and Arial on cream, per `BRAND-STYLE-LOCK.md`. This document describes homepage2 only.
