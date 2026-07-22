# Siya Brand OS

```text
Brand OS v1.3
Ratified: July 2026
Status: Active Constitution + Creative Factory (Phase 2)
```

**Spine:** [`01-BRAND-OS.md`](./01-BRAND-OS.md) · [`02-VISUAL-LANGUAGE.md`](./02-VISUAL-LANGUAGE.md) · [`04-CREATIVE-SYSTEM.md`](./04-CREATIVE-SYSTEM.md)  
**Factory:** [`creative-registry/`](./creative-registry/) · [`prompts/`](./prompts/) · [`research/`](./research/) (Phase 3 stub)  
**Anti-patterns:** [`ANTI-PATTERNS.md`](./ANTI-PATTERNS.md)  
**Changelog:** [`CHANGELOG.md`](./CHANGELOG.md)  
**Live demonstrations (not owners of philosophy):** Homepage (`/`) · ADHD Care (`/adhd-care`)

This folder is Siya’s **operating system for creative and patient-facing work** — writing, photography, UX, advertising, newsletters, LinkedIn, presentations, video, and future products.

The website is **implementation #1** of Brand OS. It is not the source of the brand.

**Freeze (philosophy):** Brand OS changes rarely. Clarify; don’t invent without review.  
**Factory (production):** Fill the Creative Registry before writing more philosophy.  
**Versioning / earned changes:** See `CHANGELOG.md`. New principles only when the eleven can’t resolve a recurring situation; new anti-patterns only after ≥2 real mistakes; **v2.0** = genuine philosophy shift.

---

## Hierarchy

```
SIYA BRAND OS (constitution)
        │
        ▼
Brand Philosophy
        │
        ▼
Editorial Voice · Visual Language · Photography
        │
        ▼
Homepage · ADHD Care · Service Blueprint · CSS Tokens
        │
        ▼
Social · Newsletter · Ads · Slides · Video · Email
```

If the homepage is redesigned in three years, Brand OS does not change — only one implementation does.

---

## Document set

| # | File | Role | Status |
|---|------|------|--------|
| — | `README.md` | Map + which laws are SoT | **Live** |
| — | `ANTI-PATTERNS.md` | Mistakes / what never to ship | **Live** |
| — | `CHANGELOG.md` | Version history | **Live** |
| 01 | `01-BRAND-OS.md` | Manifesto · worldview · principles | **Live** |
| 02 | `02-VISUAL-LANGUAGE.md` | Visual north star (why + what + never) | **Live** |
| 03 | `03-EDITORIAL-VOICE.md` | Thin pointer → Editorial Style Guide | Planned |
| 04 | `04-CREATIVE-SYSTEM.md` | Outbound production manual (families + layouts + QA) | **Live** |
| — | `creative-registry/` | Filled layout instances (matrix) | **Live v0.1** (15 seeds → target 200) |
| — | `prompts/` | One prompt pattern per family | **Live** |
| — | `research/` | Paper → multi-asset pipeline | **Stub** (Phase 3) |
| 05 | `05-COMPONENT-SYSTEM.md` | Tokens / components / runtime CSS | **Deferred** (after registry traction) |
| 06 | `06-AI-CREATIVE-GUIDE.md` | Orchestration only — points to SoTs | Planned (last) |

Do **not** create fifteen parallel “brand guidelines.” Reference existing laws; do not rewrite them.

---

## Build order (Phase 2 factory)

```text
Phase 1 — Foundation     ✅
  01 Brand OS
  02 Visual Language
  ANTI-PATTERNS
  04 Creative System

Phase 2 — Factory        ← NOW
  Creative Registry      ✅ scaffold + 15 seeds (fill to ~200)
  Prompt library         ✅
  Content matrix         ✅ INDEX.md
        ↓
Phase 3 — Research engine (paper → many assets)
Phase 4 — Marketing OS loop (plan → publish → measure)
Phase 5 — 05 Component System (website implementation consistency)
Phase 6 — 06 AI Creative Guide (tiny orchestrator)
```

**Priority:** Marketing registry before website Component System — registry ships revenue creatives; components polish the site.

Ask **“What gaps exist in the matrix?”** (`creative-registry/INDEX.md`) — not “What should we post?”

---

## Planned shape of `04-CREATIVE-SYSTEM.md`

**Shipped** — see [`04-CREATIVE-SYSTEM.md`](./04-CREATIVE-SYSTEM.md).

Includes: Intent (Part 0) · Creative Hierarchy · Families (R/E/M/RS/PP/PR/PF/A) · Layout Registry · Design rules · Illustration language · Platform adaptation · AI workflow · QA · **Creative Schema** · brief template.

### Creative hierarchy (every asset)

```text
Intent → Message → Recognition → Trust → Structure → Visual → Decoration
```

### Creative families (layout intent)

| Family | Code | Pattern |
|--------|------|---------|
| Recognition | R | Large statement · human image · one idea |
| Explanation | E | Teach one concept |
| Myth vs Fact | M | Myth → reality → explanation |
| Research | RS | Finding + limitations |
| Physician Perspective | PP | Memory → pattern → lesson |
| Process | PR | Screening → evaluation → plan |
| Proof | PF | Canonical trust only |
| Action | A | One offer · one CTA |

---

## Source of Truth map

| Layer | Authoritative source | Class |
|-------|----------------------|--------|
| Philosophy | `brand/01-BRAND-OS.md` | **SoT** |
| Visual direction | `brand/02-VISUAL-LANGUAGE.md` | **SoT** (V2 docs = historical) |
| Creative production | `brand/04-CREATIVE-SYSTEM.md` | **SoT** |
| Creative instances | `brand/creative-registry/` + `INDEX.md` | **Factory SoT** |
| Prompt patterns | `brand/prompts/` | **Factory** |
| Anti-patterns | `brand/ANTI-PATTERNS.md` | **Companion SoT** |
| Copy / voice / claims | `docs/EDITORIAL-STYLE-GUIDE.md` | **SoT** |
| Service page structure | `docs/SERVICE-PAGE-BLUEPRINT.md` | **SoT** |
| Positioning · CTAs · pricing · states | `docs/SIYA-STANDARDS.md` + `data/site-standards.mjs` | **SoT** |
| Photography | `brand/photography/README.md` + `INVENTORY.md` | **SoT** |
| Allowed statistics | `data/homepage-trust-metrics.mjs` | **SoT** |
| Pricing display | `data/pricing-display.mjs` + `site-standards` PRICING | **SoT** |
| Runtime color / type / space | `styles.css` `:root` + `design-system/tokens.css` | **Implicit SoT** |
| Chrome freeze (logo / nav) | `docs/HOMEPAGE-FINAL-LOCK.md` | **SoT** (narrow) |

### Reference (helpful, not law)

Sprint reports · perception audits · inspiration boards · per-guide SOCIAL-HOOKS · design-system README (partially stale) · `docs/VISUAL-LANGUAGE-V2*.md` · `FIRST-5-SECONDS.md`

### Deprecated (do not follow)

| Artifact | Why |
|----------|-----|
| `CURSOR-MASTER-PROMPT.md` | Cards, emoji icons, ATF pills — fights Visual Language |
| `assets/images/README.md` | Early SVG placeholders — superseded by `brand/photography/` |

---

## How to use Brand OS

**Before building anything** (page, carousel, newsletter, deck, ad, video):

1. Read [`01-BRAND-OS.md`](./01-BRAND-OS.md) — does this express who Siya is?  
2. Apply [`02-VISUAL-LANGUAGE.md`](./02-VISUAL-LANGUAGE.md) and Editorial / Photography / Standards as needed.  
3. Pick **family + layout ID** from [`04-CREATIVE-SYSTEM.md`](./04-CREATIVE-SYSTEM.md) — or **clone a registry entry**.  
4. Check [`creative-registry/INDEX.md`](./creative-registry/INDEX.md) for matrix gaps.  
5. Skim [`ANTI-PATTERNS.md`](./ANTI-PATTERNS.md) — reject known mistakes early.  
6. Prefer **consistency over novelty**.  
7. If unsure: *Does this reduce confusion, increase trust, and help someone recognize themselves before we ask them to decide?*

---

## Photography library

Asset library lives at [`photography/`](./photography/). Brand OS owns *why* images exist; the library owns *which* images are approved.
