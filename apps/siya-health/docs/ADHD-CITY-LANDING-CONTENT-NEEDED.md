# ADHD city landing pages — content needed (human / clinical pass)

**Status:** Content drafted + clinical review signed off (Aug 2026) · **`index, follow`**.  
**Test cities (live URLs):** Miami · Orlando · San Diego  
**Do not expand other cities until Search Console shows movement** (re-check ~2–4 weeks after indexing).

Generator: `node scripts/generate-adhd-city-pages.mjs` (emits `noindex` until flipped)  
Data: `data/adhd-city-landings.mjs`

---

## Provider licensing ground truth (founder-supplied Aug 2026)

| State | City pages | Licensed clinicians to reference |
| --- | --- | --- |
| Florida | Miami, Orlando | Dr. Sneh Pandey · Dr. Vanessa Urbina · Dr. Natasha Desai · Wendy Delgado, PA-C |
| California | San Diego | Dr. Sneh Pandey · Wendy Delgado, PA-C |

**Do not** reference Derek Timbs, Megan Wunderlich, or Dr. Swati Pandey on these three city pages.  
Display name for Delgado follows the live provider page (**Wendy Delgado, PA-C**), not “Dr. Delgado.”

---

## Per-city checklist

| # | Need | Miami | Orlando | San Diego |
|---|---|---|---|---|
| 1 | City-specific intro (150–250 words)—no invented stats | Drafted | Drafted | Drafted |
| 2 | Confirmed clinician roster for that **state** | Drafted (FL list) | Drafted (FL list) | Drafted (CA list) |
| 3 | Telehealth vs in-person (only if true) | Telehealth-only; no local office claimed | Same | Same |
| 4 | 3–5 city FAQs + FAQPage JSON-LD | 5 + schema | 5 + schema | 5 + schema |
| 5 | Optional local social proof | Skipped (none approved) | Skipped | Skipped |
| 6 | Internal links (hub / providers / Ads where appropriate) | Drafted | Drafted | + CA Ads landing |
| 7 | Flip `noindex` → `index` | Done (Aug 2026) | Done | Done |

---

## NEEDS CLINICAL REVIEW (visible on-page asides)

Shared across all three:

- Medication / stimulant / efficacy language beyond sitewide “never guaranteed”
- Clinician assignment rules (who leads adult ADHD evals vs other pathways)

San Diego–specific:

- Wendy Delgado, PA-C live focus is weight loss — do not imply ADHD evaluation leadership without confirmation

---

## Explicit non-goals for agents

- Do **not** invent which providers see patients in a city beyond the founder licensing list above.
- Do **not** invent wait times, clinic addresses, or local epidemiology.
- Do **not** auto-expand drug comparison or dosing content on Focalin/Vyvanse pages.

---

## Related comparison pages (clinical copy backlog)

| URL | Gap |
|---|---|
| `/blog/focalin-vs-adderall-comparison` | Full comparison body + FAQ (scaffold only today) |
| `/blog/vyvanse-vs-adderall-differences` | Comparison table, special populations, visit checklist |
