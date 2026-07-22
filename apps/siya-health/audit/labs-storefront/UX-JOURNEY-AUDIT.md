# Siya Health × Rupa Labs — UX Journey Audit

**Date:** 2026-07-20  
**Storefront:** https://labs.rupahealth.com/store/storefront_42daXx7  
**Siya Labs hub:** https://www.siya.health/labs  
**Screenshots:** `apps/siya-health/audit/labs-storefront/`  
**Scope:** Audit only — no website code changes in this phase.

---

## Executive verdict

Siya Health has built the right **clinical frame** (physician-guided labs, topic guides, interpretation caveats). The Rupa storefront is a competent **fulfillment catalog** (Quest pricing, cart, draw instructions).

The gap is the **bridge**: patients leave Siya’s medical narrative and land in a price-led e-commerce grid that leads with “affordable,” shows a **LabCorop typo**, and does not reinforce “Siya interprets / Siya follows up.” Meet & Greet gets a branded interstitial; labs do not.

**Positioning opportunity:** Be Parsley-like (labs inside a care relationship), not Function-like (labs as the product). Rupa stays fulfillment; Siya stays the physician.

---

## 1. Screenshot inventory

### Desktop (`audit/labs-storefront/desktop/`)

| File | Contents |
|------|----------|
| `01-storefront-full.png` | Full-page Rupa storefront |
| `02-storefront-hero-viewport.png` | Hero + first product row |
| `03-storefront-scrolled-listing.png` | Mid catalog |
| `04-storefront-bottom.png` | Bottom / FAQ region |
| `05-test-detail-or-nav.png` | Post-navigation capture |
| `06-siya-labs-hub-full.png` | Siya `/labs` full page |
| `07-siya-labs-hub-hero.png` | Siya labs hero |
| `08-browser-fullpage.png` | Browser capture of storefront |
| `09-siya-labs-live.png` | Live Siya labs hub |
| `storefront-text-extract.txt` | OCR/text dump of storefront |

### Mobile (`audit/labs-storefront/mobile/`)

| File | Contents |
|------|----------|
| `01-storefront-full.png` | Mobile storefront full |
| `02-storefront-hero.png` | Mobile hero |
| `03-siya-labs-hub.png` | Mobile Siya labs hub |

### Storefront observations (from live capture)

- **Header:** Rupa Health chrome + FAQ + Cart  
- **Hero:** Siya Health logo + “Get **affordable** and accessible lab tests… Quest/**LabCorop**” (typo)  
- **Catalog:** Flat Quest product grid with prices (CBC $3.35, CMP $7.90, Vit D $20, B12/Folate $13, Thyroid Panel $20.33, A1c $5, Ferritin $7, etc.)  
- **No symptom categories** on storefront (fatigue / midlife / metabolic)  
- **How it Works (Rupa):** Order → instructions (lab or at home) → complete test → results in Rupa  
- **FAQ topics:** process, payment/insurance, draw, requisition, shipping, turnaround, where to view results  
- **Geo note:** US only; some tests unavailable in NY/NJ/RI  
- **Footer:** “LabShop Powered by Rupa Health”

Checkout: cart UI present (`Cart 0`); full purchase flow not completed in audit (no test order placed).

---

## 2. Before patients leave Siya — comprehension check

| Question | Today on Siya `/labs` | Gap |
|----------|----------------------|-----|
| Why might I need labs? | Strong (“why testing matters”) | OK |
| When are labs useful? | Strong + topic pages | OK |
| When are labs NOT useful? | Strong limits + ADHD disclaimer | OK |
| Which tests fit my symptoms? | Topic hub helps; storefront is alphabet/catalog | Medium — map topics → curated test groups on Siya before exit |
| What happens after results? | Siya says discuss with clinician; Rupa says results in Rupa | **High** — no shared timeline / who messages whom |
| Who interprets results? | Siya says clinician can help | **High** — storefront never says “return to Siya for interpretation” |

---

## 3. Navigation audit

| Surface | Labs today | Recommendation |
|---------|------------|----------------|
| Header desktop | Yes — “Labs” | **Keep** |
| Mobile nav | Yes | **Keep** |
| Services dropdown | None (flat nav) | **Optional later** — only if nav overcrowds; not required now |
| Footer Care & Services | “Labs & blood tests” | **Keep**; consider sibling “Preventive labs” → `/labs/preventive` |
| Homepage body | **Absent** | **Add** pathway card or service strip (High) |
| Sticky CTA | Site uses Meet & Greet sticky on some pages | Do **not** sticky-link storefront; sticky → `/labs` only |
| Primary Care | Body links present | Strengthen “preventive labs” language → `/labs/preventive` |
| Meet & Greet flow | No labs mention | Add one calm sentence (Medium) |

**Do not** put the Rupa URL in primary nav.

---

## 4. Knowledge Product / internal linking audit

**Live gap:** ~98 blogs/answers mention lab keywords without body `/labs` links. Only iron-deficiency blog reliably links today. Soft-insert script exists but is often overwritten or skipped.

### Highest-priority link targets (to `/labs` or topic URLs — never direct to Rupa)

| Source | Recommend destination | Anchor direction |
|--------|----------------------|------------------|
| `blog/why-am-i-always-tired-…` | `/labs/fatigue-brain-fog` | fatigue-related lab options |
| `answers/why-normal-labs-dont-mean-healthy` | `/labs` | physician-guided labs |
| `answers/normal-a1c-insulin-resistance` | `/labs/a1c-blood-sugar` | A1c / metabolic options |
| `blog/perimenopause-brain-fog` | `/labs/womens-midlife` | midlife lab evaluation |
| `blog/free-testosterone-vs-total-…` | `/labs/mens-health` | men’s health lab options |
| `answers/what-is-insulin-resistance` | `/labs/a1c-blood-sugar` | metabolic testing |
| `womens-midlife-health.html` | `/labs/womens-midlife` | **body link missing** |
| Thyroid-dense guides | `/labs/thyroid` | thyroid testing |
| Ferritin/iron guides | `/labs/iron-ferritin` | iron & ferritin |
| B12 mentions | `/labs/vitamin-b12` | B12 testing |
| ADHD differential | `/labs/adhd-support` | disclaimer-first |

---

## 5. Homepage opportunities

**Yes — mention Labs & Blood Tests**, but as a **care path**, not a storefront promo.

Suggested placements (one composition, not a dashboard):

1. **Common Care Paths** — fifth card: “Labs & blood tests” → `/labs`  
   Supporting line: “Physician-guided testing with transparent direct-pay options.”
2. Optional mid-page strip after pathways (not in hero): one sentence + text link to `/labs`.
3. Do **not** put Rupa in homepage hero CTAs.

---

## 6. Service page recommendations (natural, not forced)

| Page | Where Labs should appear |
|------|--------------------------|
| **Primary Care** | Preventive / lab review cards → `/labs/preventive` (already partially linked) |
| **Women’s Health** | History + labs language → `/labs` or `/labs/womens-midlife` |
| **Women’s Midlife** | **Add body link** near iron/thyroid/fatigue pathways |
| **Men’s Health** | Process “labs when appropriate” → `/labs/mens-health` |
| **Weight / Metabolic** | FAQ “Is lab testing required?” answer → `/labs/a1c-blood-sugar` |
| **Telehealth** | Labs service card already links — keep |
| **ADHD** | Keep disclaimer-first link to `/labs/adhd-support` |

---

## 7. Meet & Greet flow

Current interstitial: leaving Siya for a short free call — **no labs**.

**Recommended microcopy (one line):**

> “If you’re wondering about blood work, we can also help you decide whether labs make sense and how to interpret results later—this call is still just a conversation, not a medical visit.”

Do **not** deep-link Rupa from the Meet & Greet redirect.

---

## 8. Footer audit

| Item | Recommendation |
|------|----------------|
| Labs & Blood Tests | Keep |
| Preventive Care | Optional: link `/labs/preventive` or `/primary-urgent-care` — avoid duplicate “Medical Library” |
| Health Guides | Keep (answers hub) |
| Medical Library | **Skip** as a new label — confuses with Health Guides |

DPC/concierge peers often list Labs under Services + emphasize “we review your results.” Footer is fine; homepage + handoff matter more.

---

## 9. SEO opportunities (authority pages — not storefront SEO)

Already have strong topic cluster under `/labs/*`. Next educational pages (Siya-owned):

| Priority | Page | Why |
|----------|------|-----|
| High | How to Read Lab Results (with Siya) | Trust + post-purchase return path |
| High | Understanding Blood Work / What Happens After You Order | Handoff education |
| Medium | Annual Wellness Labs | Preventive SEO |
| Medium | Quest draw: what to expect (neutral, no overclaim) | Operational anxiety |
| Low | Vitamin Deficiencies hub | Overlaps B12/iron/D topics |

Do **not** create Product schema with hard-coded Rupa prices on Siya.

---

## 10. Trust audit — would patients feel confident leaving?

**Partial confidence.** Siya educates well; the leave moment is abrupt.

### Missing trust elements before exit

1. **Branded handoff** (like Meet & Greet): “You’re opening Siya’s lab storefront (powered by Rupa). Prices shown there. Return here or book a visit to interpret results.”  
2. **External label** on CTAs: “Opens lab storefront in a new tab”  
3. **Who interprets** callout adjacent to primary CTA  
4. **State / NY-NJ-RI availability** note before exit (Rupa already discloses; Siya should preview)  
5. **Fix storefront tagline typo** LabCorop → LabCorp (Rupa admin)  
6. **Replace “affordable” lead** on storefront with physician-guided / transparent-pricing language aligned with Siya (Rupa admin)

---

## 11. Design audit

| Siya Labs | Rupa storefront |
|-----------|-----------------|
| Editorial hero, topic cards, FAQs | E-commerce grid, Quest box imagery |
| Poppins/Inter, warm clinical | Rupa system UI |
| Process = clinical journey | Process = order logistics |

### Recommendations (Siya side only)

- Add a **simple 4-step diagram** matching Rupa’s logistics but ending in “Siya interprets”  
- Optional **non-branded** storefront preview screenshot (blurred prices OK) with caption “Browse tests on our lab storefront”  
- CTA hierarchy: Primary = Meet & Greet when unsure; Primary = storefront only when user already knows the test  
- Do **not** copy Rupa purple/product-box aesthetic onto Siya

---

## 12. Competitive insights

| Model | Lesson for Siya |
|-------|-----------------|
| **Function Health** | Labs-as-product + dashboard; weak ongoing care. **Avoid** becoming this. |
| **Parsley Health** | Labs inside clinician relationship + “review visit.” **Emulate** narrative. |
| **DirectLabs / Walk-In Lab** | Pure catalog. Siya must stay differentiated via interpretation + primary care. |
| **DPC practices** | Often: “We order & review.” Clear ownership. Siya should sound like this on the handoff. |

---

## 13. Prioritized roadmap

### High impact (fast, high patient benefit)

1. **Branded labs handoff interstitial** (`/redirect/labs` or soft modal copy) mirroring Meet & Greet  
2. **Homepage Care Path card** → `/labs`  
3. **CTA microcopy** “Opens lab storefront · new tab” + interpretation reminder  
4. **Fix apply-labs linking durability** so top 15 content pages keep `/labs/*` body links  
5. **Women’s midlife body link** to `/labs/womens-midlife`  
6. **Rupa admin:** fix LabCorop typo; soften “affordable” hero to transparent / physician-guided  

### Medium impact

7. Meet & Greet one-line labs awareness  
8. “How to read results with Siya” education page  
9. Service FAQ deepen (weight-loss lab FAQ → topic page)  
10. Footer link to `/labs/preventive` if desired  
11. Curated “starter sets” on Siya (education only) mapping to storefront tests — still link via `/labs` topics  

### Low impact

12. Services dropdown regroup  
13. Storefront screenshot collage on Labs page  
14. Competitive comparison content  
15. Sticky labs CTA (likely harmful — skip)

---

## 14. Implementation checklist (for next phase — not executed here)

- [ ] Create `/redirect/labs` interstitial → Rupa URL + `lab_storefront_click`  
- [ ] Update all storefront buttons to use interstitial (or add visible external labeling)  
- [ ] Homepage pathways card  
- [ ] Harden `apply-labs-hub-linking.mjs` against generator overwrites  
- [ ] Patch midlife + top 15 content links  
- [ ] Meet & Greet copy line  
- [ ] Rupa storefront copy/typo (admin, outside repo)  
- [ ] Optional: How to Read Lab Results page  
- [ ] QA: mobile handoff, analytics event, no direct Rupa in nav  
- [ ] Medical review of handoff + Meet & Greet wording  

---

## 15. Labs page recommendations (hub)

Already strong. Next iterations:

1. Move “Who interprets results?” higher (adjacent to hero CTAs)  
2. Add handoff callout before primary storefront button  
3. Preview Rupa “How it works” in Siya language ending with clinician review  
4. State availability note (CA/TX/PA/FL care vs US storefront + NY/NJ/RI testing limits)  
5. Keep topic grid; ensure every category card “Learn more” survives rebuilds  

---

## Bottom line

**Siya = physician + journey. Rupa = cart + Quest draws.**  
The audit shows education is ahead of conversion trust. Close the handoff, put Labs on the homepage journey, and make Knowledge Products point to `/labs` topics—not the external catalog.
