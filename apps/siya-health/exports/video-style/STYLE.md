# Siya Health — video typography style sheet

Source of truth for this pack: **live website code** (`styles.css` + homepage2 Option E emphasis), not social compositor Georgia.

Generated for video lower-thirds / title cards. Companion route: `/video-cards`. PNG exports: `exports/video-cards/`.

---

## Exact hex colors

| Token | Hex | RGB | Site source |
|-------|-----|-----|-------------|
| Cream (page / card canvas) | `#F4EFE7` | `244, 239, 231` | `--page-bg` in `styles.css` |
| Deep Navy | `#001878` | `0, 24, 120` | `--primary` / `--navy` |
| Dark Navy (headline default) | `#0A246B` | `10, 36, 107` | `--primary-hover` / `--dark-navy`; homepage2 section `h2` |
| Magenta | `#D81088` | `216, 16, 136` | `--accent` |
| Magenta accessible (links) | `#A80C6A` | `168, 12, 106` | `--accent-accessible` |
| Champagne gold (tertiary only) | `#C4A574` | `196, 165, 116` | `--accent-tertiary` — pills/dividers, **not** headline emphasis |
| Body text | `#1c1917` | — | `--text` |
| White | `#ffffff` | — | `--white` |

**Reject for this pack:** plum `#8D3A78`, brown/espresso body type, pure black headlines, gray as primary type.

---

## Gradients (CSS)

### 1. Headline word emphasis — Option E (LOCKED)

Used on `.siya-em` / `.siya-em--sweep` / `.siya-h2-word` (homepage2). Magenta→navy so short words still read as **two** colors.

```css
background-image: linear-gradient(
  90deg,
  #D81088 0%,
  #D81088 28%,
  #A81490 48%,
  #0A246B 68%,
  #001878 100%
);
color: transparent;
-webkit-text-fill-color: transparent;
-webkit-background-clip: text;
background-clip: text;
```

Optional entrance (web only; **disable for still PNG exports**):

```css
animation: siya-em-sweep-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
/* from background-size 280% → 100%; position 100% → 0 */
```

### 2. Primary CTA fill (buttons — not for headline words)

```css
/* --accent-gradient */
linear-gradient(145deg, #d81088 0%, #c32889 28%, #87218b 68%, #642eae 100%);
```

### 3. Soft UI accents (reference only)

```css
/* example trust / UI washes — not video title cards */
linear-gradient(145deg, #001878 0%, #0A246B 55%, #D81088 140%);
```

---

## Font families & weights

| Role | Family | Weights used on site | Notes |
|------|--------|----------------------|-------|
| Headlines | `"Poppins", "Inter", sans-serif` | **700** (Bold); occasionally 650/600 on UI | `--font-heading` |
| Body | `"Inter", -apple-system, BlinkMacSystemFont, sans-serif` | 400–700 | `--font-body` |
| Google Fonts URL | `family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700` | — | Linked site-wide |

**Letter-spacing (headlines):** about `-0.025em` to `-0.03em` (homepage2 section titles / welcome).  
**Line-height (headlines):** ~`1.12`–`1.2`.

### Surface note (do not mix blindly)

Social compositor Style Lock (`brand/BRAND-STYLE-LOCK.md`) uses **Georgia Bold** + solid magenta accent on cream for carousels. That is a different delivery surface. **This video pack follows the website:** Poppins + Option E gradient emphasis.

---

## How we emphasize key words in headlines

| Property | Treatment |
|----------|-----------|
| Markup | Wrap the phrase in `<span class="siya-em">…</span>` (do **not** show brackets) |
| Font style | `font-style: normal` — **not italic** |
| Weight | `font-weight: 700` |
| Color | Not a flat fill — **gradient text** (Option E above) via `background-clip: text` |
| Decoration | None (`text-decoration: none`) |
| Scope | Prefer short phrases (a few words), same as live homepage2 |

**Not used for emphasis:** italic, underline, solid magenta-only fill on long phrases, champagne gold on headline words.

---

## Three real examples from the live site

From `homepage2.html` (production `/homepage2`):

1. **Hero**  
   `Welcome to an integrated care `**`experience`**` for busy `**`professionals`**  
   Markup: `<span class="siya-em">experience</span>` · `<span class="siya-em">professionals</span>`

2. **Access / recognition**  
   `Why busy professionals don’t get `**`clear answers`**  
   Markup: `<span class="siya-em">clear answers</span>`

3. **Care model**  
   `Explore our `**`care model`**  
   Markup: `<span class="siya-em">care model</span>`

(Additional live uses of the same class: `busy professionals`, `system`, `family`, `traditional clinics`, `clearer answers`, and chip words like `Exhausted`, `stuck`, `Brain fog`, etc.)

---

## Video card recipe (this pack)

- Canvas: **1920 × 1080**
- Background: cream `#F4EFE7` **or** fully transparent (PNG with alpha)
- Type: Poppins 700, Dark Navy `#0A246B`, centered, generous margins
- Bracketed words in the brief → Option E `.siya-em` (brackets never rendered)
- Still exports: force settled gradient (`animation: none`, `background-size: 100%`)

See `/video-cards` and `scripts/export-video-cards.mjs`.
