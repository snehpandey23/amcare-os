# Siya Health — Master Cursor Prompt
## Use for section-by-section or full-site UI upgrades

---

## 🚨 CRITICAL CONTEXT (Read First)

**Your site:** Live healthcare website running ads. Plain HTML/CSS. Must look premium immediately.

**Stack:** Plain HTML + CSS (no React/Next/Tailwind).

**Do NOT:**
- Redesign entire pages
- Change navigation, footer, or pricing logic
- Preserve poor formatting
- Make minimal edits — FULLY REPLACE when a section is broken

**Always:**
- REPLACE plain text/bullets with structured card UI
- Override weak CSS if needed (inline or new classes)
- Ensure changes are VISIBLE and PREMIUM

---

# PART 1: HERO SECTURES (Apply to ALL pages)

**Rule:** Every hero must look identical in structure, size, alignment, and flow.

**Structure (all pages):**
```html
<section class="hero-merged" or "hero-fullwidth">
  <div class="container hero-inner">
    <div class="hero-merged-content" or "hero-fullwidth-inner">
      <h1>Headline (6–10 words)</h1>
      <p class="hero-merged-lead">Subheadline (max 2 lines)</p>
      <div class="hero-ctas">
        <a class="button" href="/adhd-screening">Start Free Screening</a>
        <a class="button hero-cta-secondary" href="...">Schedule Meet & Greet</a>
      </div>
      <p class="cta-screening-subtext hero-cta-subtext">Takes 2 minutes • No obligation</p>
      <div class="hero-trust-bar">
        <span>1,000+ Adults Evaluated</span>
        <span>Same-Week Appointments</span>
        <span>$199 Transparent Pricing</span>
        <span>HIPAA-Compliant</span>
      </div>
    </div>
  </div>
</section>
```

---

# PART 2: ICON CARD SYSTEM

**Rule:** Bullets → icon cards. Use classes: `icon-card`, `icon-cards-grid`, `icon-cards-2col`, `icon-cards-3col`

**Icons:** 👤 ⚡ 🧠 💳 🔒 🩺 📋 🏠 🤝 🎯 ✨ ❤️ 💡

---

# PART 3: SECTION-BY-SECTION UPGRADE PROMPT

Highlight a section, then paste:

```
You are editing a SELECTED section of a live website.
ONLY modify the highlighted code. FULLY REPLACE layout if plain/text-heavy.
Convert to responsive card grid (desktop 2–3 cols, mobile 1 col).
Each card: white bg, 16px radius, 20px+ padding, icon + title + one-line description.
Use emoji icons (👤 ⚡ 🧠 💳 🔒 🩺) if no SVG.
Add CTA below: "Ready to get clarity?" + "Start Free Screening"
Return ONLY the rewritten section code.
```

---

*Last updated: Premium UI upgrade applied. Hero alignment fixed sitewide.*
