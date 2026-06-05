# Future Provider Enrichment Audit

**Audit date:** 2026-06-02  
**Scope:** External research only — no site changes, no `providers.mjs` edits, no new live profiles.  
**Benchmark:** `PROVIDER-PUBLISHING-MINIMUMS.md`

## Methodology

- Sources reviewed: URLs supplied in the research brief (plus publicly indexed pages returned when a primary URL timed out).
- Each field tagged: **Verified from public source** | **Mentioned but needs confirmation** | **Not found**
- **Do not infer licensure** beyond what a source explicitly states.
- **Readiness score (0–100):** share of “Required before publishing” items in `PROVIDER-PUBLISHING-MINIMUMS.md` that are **Verified from public source** (partial credit = 0.5 for “Mentioned but needs confirmation”).
- **Ready for Siya profile / reviewedBy / schema:** binary gates per publishing minimums — all require internal intake, consent, and license verification even when public bios are rich.

### Source access notes

| Source | Status |
|--------|--------|
| helloklarity.com (Megan, Derek) | Retrieved |
| comphealthforyou.com | Retrieved — **no Megan Wunderlich content found** |
| kiwihealth.com (Derek) | Retrieved |
| linkedin.com (Derek) | Retrieved |
| cmdocc-med.com/about-us | Retrieved |
| helloklarity.com/post/personal-story-derek-timbs | **Not retrieved** (timeout) |
| health.usnews.com (Wendy) | **Not retrieved** (timeout / blocked) |
| arrivehw.com (Wendy) | Retrieved |
| doximity.com (Wendy) | Retrieved (partial — full profile gated) |

---

## 1. Megan Wunderlich, NP

**Sources:** [Klarity profile](https://www.helloklarity.com/provider/megan-wunderlich) · [comphealthforyou.com](https://www.comphealthforyou.com/) (no provider match)

### Field extraction

| Field | Value | Status | Source |
|-------|-------|--------|--------|
| Name | Megan Wunderlich | Verified from public source | Klarity |
| Credentials | MSN, APRN, FNP-C | Verified from public source | Klarity |
| Role / type | Family Nurse Practitioner; specialties listed as Mental Health, Family Medicine | Verified from public source | Klarity |
| States mentioned | Pennsylvania | Verified from public source | Klarity (“Licensed state”) |
| Education | Duquesne University BSN (2006–2010); Chatham University MSN Leadership (2011–2012); Carlow University PMC-FNP (2020–2022) | Verified from public source | Klarity |
| Training / experience | RN, VA Pittsburgh Healthcare System (2010–current per listing); 15 years of experience (platform claim) | Verified from public source (dates/employer); experience years **Mentioned but needs confirmation** | Klarity |
| Residency | — | Not found | — |
| Certifications | FNP-C; associations: AANP, Sigma Theta Tau | Verified from public source (credential label); board verification link **Not found** | Klarity |
| Clinical focus | Mental Health, Family Medicine; conditions include ADHD; geriatrics, chronic disease, post-surgical care referenced in philosophy | Verified from public source | Klarity |
| Services | Telehealth; mental health / family medicine visits via Klarity | Verified from public source | Klarity |
| Bio | Short “About Megan” narrative on Klarity | Verified from public source | Klarity |
| Care philosophy | Patient-centered, empathetic, evidence-based advocacy; interdisciplinary collaboration | Verified from public source | Klarity |
| Headshot URL | — | Not found | Page fetch did not expose a stable public image URL |
| NPI | 1629930532 | Verified from public source | Klarity |
| External profiles | Klarity booking profile only in scope | Verified from public source | Klarity |
| Organization affiliations | VA Pittsburgh Healthcare System (RN); independent practice via Klarity platform | Verified from public source | Klarity |
| Accepting new patients | Yes | Verified from public source | Klarity |
| License type / status / expiration | — | Not found | — |
| Public license verification link | — | Not found | — |
| Languages | English | Verified from public source | Klarity |

### Claims requiring proof (if reused on Siya)

- Klarity patient review marked “Verified patient” (1 review, 3.0 rating) — platform claim, not Siya-verified.
- Prescribing restrictions (e.g. no stimulants for adults over 45) — policy text on Klarity; needs Siya clinical policy alignment if cited.

### vs publishing minimums

| Gate | Ready? |
|------|:------:|
| Siya profile | **No** |
| reviewedBy attribution | **No** |
| Schema (Physician/NP + creds) | **Partial** — NPI + name + credentials public; licenses unverified |

**Readiness score:** **46 / 100**

**Missing required fields:** Siya role/title; headshot asset + consent; per-state license type, status, expiration, **public board verification URL**; residency (listed in minimums); board certification primary-source verification; Siya-approved services mapping; admin verification (verified by/date); internal intake/consent.

**Questions for provider/admin**

1. Confirm active PA license number, type, status, expiration, and PA board profile URL.
2. Confirm whether you are contracted with or affiliated with Siya Health (comphealthforyou.com listed as source — **no profile found there**).
3. Provide ANCC (or equivalent) FNP-BC verification for publication.
4. Confirm ADHD scope for telehealth at Siya (Klarity lists ADHD; confirm evaluation vs medication policies).
5. Approve or rewrite bio/philosophy for siya.health; provide headshot + publication consent.
6. Which Siya licensed states (if any beyond PA) should appear on profile chips?

**Recommended service page placement**

| Page | Fit | Caveat |
|------|-----|--------|
| `/adhd-care` | Strong | ADHD listed; confirm evaluation workflow |
| `/telehealth` | Moderate | Telehealth offered; **PA only** until other licenses verified |
| `/weight-loss-metabolic-health` | Weak | Not primary focus on Klarity |
| `/mens-health-longevity` | None evident | — |

**Recommended tier:** **Tier 2 — core clinician** (NP, ADHD + mental health telehealth; not MD flagship)

---

## 2. Vanessa Urbina, MD

**Sources:** [comphealthforyou.com](https://www.comphealthforyou.com/) · [About Dr. Urbina](https://www.comphealthforyou.com/about-dr-vanessa-urbina)

### Field extraction

| Field | Value | Status | Source |
|-------|-------|--------|--------|
| Name | Vanessa Urbina, M.D. | Verified from public source | Comprehensive Health |
| Credentials | MD | Verified from public source | Comprehensive Health |
| Role / type | Founder & Medical Director; family medicine / general practitioner | Verified from public source | Comprehensive Health |
| States mentioned | Florida (Mount Dora practice; resides Sanford, FL) | Verified from public source | Comprehensive Health |
| Education | FAU bachelor’s (2003); University of Miami medical school (2007) | Verified from public source | Comprehensive Health |
| Training | 4 years general surgery, Baptist Princeton Medical Center, Birmingham, AL; internship Physicians Medical Center Carraway; residency Brookwood Baptist Health (listed without specialty dates) | Mentioned but needs confirmation | Comprehensive Health (self-reported practice site) |
| Fellowship | — | Not found | — |
| Certifications | “FL State Medical License” listed | Mentioned but needs confirmation | No board name, cert number, or verification URL |
| Clinical focus | Family medicine, DPC, chronic disease, pediatrics, urgent care, ADHD/ADD, obesity, lifestyle/holistic medicine | Verified from public source | Comprehensive Health service pages |
| Services | DPC membership, primary care, telemedicine, house calls, occupational health, immigration/DOT physicals, procedures, labs | Verified from public source | Comprehensive Health |
| Bio | Long “Dr. Urbina’s Story” + short homepage bio (~20 years / 15+ years experience — **inconsistent counts**) | Verified from public source (text); year claims **Mentioned but needs confirmation** | Comprehensive Health |
| Care philosophy | Patient-first, family-like care, affordable DPC, lifestyle medicine before medications | Verified from public source | Comprehensive Health |
| Headshot URL | — | Not found | — |
| NPI | — | Not found | — |
| External profiles | comphealthforyou.com only in scope | Verified from public source | — |
| Organization affiliations | Comprehensive Health PLLC (founder) | Verified from public source | Comprehensive Health |
| Accepting new patients | — | Not found | — |
| License verification link | — | Not found | — |
| Languages | — | Not found | — |

### Claims requiring proof (if reused on Siya)

- Patient testimonials on practice site (Mr. Crawford, Velasquez, Mario L) — no Siya verification packet.
- “Nearly 20 years” vs “15+ years” experience — inconsistent on same site.

### vs publishing minimums

| Gate | Ready? |
|------|:------:|
| Siya profile | **No** |
| reviewedBy attribution | **No** |
| Schema | **Partial** — strong bio/education narrative; no NPI or license URL in sources |

**Readiness score:** **48 / 100**

**Missing required fields:** License type, status, expiration, public FL board URL; board certification verification; accepting patients per state; NPI; headshot + consent; Siya role; telehealth/state disclaimer approved for Siya; admin verification; explicit Siya service mapping.

**Questions for provider/admin**

1. Confirm FL medical license number and link to Florida DOH profile.
2. Confirm board certification(s) (specialty) with ABMS/AOA verification links.
3. Clarify residency/training timeline (general surgery vs family medicine path).
4. Is Vanessa Urbina affiliated with Siya Health, or only listed for future consideration?
5. Telehealth-only vs in-person DPC — what would appear on a Siya profile?
6. Accepting new patients via telehealth in FL for Siya booking?
7. Provide headshot, NPI, and publication consent.

**Recommended service page placement**

| Page | Fit | Caveat |
|------|-----|--------|
| `/adhd-care` | Strong | ADHD evaluation/treatment on practice site |
| `/weight-loss-metabolic-health` | Moderate | Weight loss listed in training/practice history |
| `/telehealth` | Moderate | Telemedicine offered; confirm Siya coverage model |
| `/primary-urgent-care` | Moderate | DPC / urgent care scope — may overlap Siya primary positioning |

**Recommended tier:** **Tier 1 — flagship physician** *candidate* (MD, founder, broad primary scope) — **only if** Siya affiliation + FL license verification completed; otherwise hold.

---

## 3. Derek Timbs, NP

**Sources:** [KiwiHealth](https://www.kiwihealth.com/provider/TX/Houston/Derek-Timbs) · [Klarity](https://www.helloklarity.com/provider/derek-timbs) · [LinkedIn](https://www.linkedin.com/in/derek-timbs-a54247320/) · [CMD Occ-Med About](https://cmdocc-med.com/about-us/) · [Klarity personal story](https://www.helloklarity.com/post/personal-story-derek-timbs/) (not retrieved)

### Field extraction

| Field | Value | Status | Source |
|-------|-------|--------|--------|
| Name | Derek Timbs | Verified from public source | KiwiHealth, Klarity, CMD |
| Credentials | FNP-BC; MSN, APRN on CMD page | Verified from public source | Klarity, CMD |
| Role / type | CEO, C.M.D. Occ-Med; Family Nurse Practitioner, CMD Wellness | Verified from public source | CMD, Klarity |
| States mentioned | Texas, Ohio | Mentioned but needs confirmation | Klarity/KiwiHealth list states; **no state board URLs** |
| Education | Texas A&M University–Corpus Christi, Master of Family Nurse Practitioner (2002–2005) | Verified from public source | KiwiHealth, Klarity, LinkedIn |
| Training / experience | 30+ / 32 years healthcare (since 1992); ER, ICU, cardiac rehab, home health, occupational medicine; CORE Occupational Medicine 2008–2024 | Verified from public source (employers/dates); year totals **Mentioned but needs confirmation** | KiwiHealth, Klarity |
| Residency | — | Not found | — |
| Certifications | FNP-BC | Verified from public source (label); ANCC verification link **Not found** | Klarity |
| Clinical focus | Medical weight loss, obesity, lifestyle change, preventive medicine; HRT, aesthetics, occupational medicine | Verified from public source | KiwiHealth, Klarity |
| Services | Semaglutide, tirzepatide, phentermine (state-specific per Klarity); in-person + video visits | Verified from public source | Klarity, KiwiHealth |
| Bio | Long bio on Klarity/KiwiHealth | Verified from public source | Klarity |
| Care philosophy | Person-focused, emotionally focused, coaching; individualized assessment | Verified from public source | KiwiHealth, Klarity |
| Headshot URL | — | Not found | — |
| NPI | 1609886910 | Verified from public source | Klarity |
| External profiles | LinkedIn; KiwiHealth; Klarity; CMD Occ-Med | Verified from public source | Multiple |
| Organization affiliations | CMD Wellness; CORE Occupational Medicine; C.M.D. Occ-Med | Verified from public source | CMD, Klarity |
| Accepting new patients | Yes | Verified from public source | Klarity |
| License type / status / expiration | — | Not found | — |
| Public license verification link | — | Not found | — |
| Languages | English | Verified from public source | Klarity |

### Claims requiring proof (if reused on Siya)

- KiwiHealth patient satisfaction percentages (98% / 83% / 93%).
- Klarity 4.99 rating / 227 reviews.
- LinkedIn activity tags “Siya Health” — **affiliation Mentioned but needs confirmation** (social tag ≠ employment verification).

### vs publishing minimums

| Gate | Ready? |
|------|:------:|
| Siya profile | **No** |
| reviewedBy attribution | **No** |
| Schema | **Partial** — NPI, credentials, employer; licenses unverified |

**Readiness score:** **57 / 100**

**Missing required fields:** TX/OH license verification URLs; license type/status/expiration; board cert primary source; Siya role; headshot + consent; ADHD-CCSP or equivalent if ADHD content linked; admin verification; Siya-approved service list (weight-loss focus ≠ current ADHD-heavy site without scope review).

**Questions for provider/admin**

1. Confirm Siya Health relationship (LinkedIn mentions — employment/contract status?).
2. Provide TX and OH APRN license numbers + public board profile URLs.
3. Confirm GLP-1 / phentermine scope per state for Siya weight-loss page.
4. ANCC FNP-BC verification link.
5. Is occupational medicine (CMD Occ-Med) in scope for Siya marketing or separate brand?
6. Approve bio; provide headshot + publication consent.
7. ADHD content reviewer eligibility? (No ADHD specialty in public sources — likely **not** without new training/credentials.)

**Recommended service page placement**

| Page | Fit | Caveat |
|------|-----|--------|
| `/weight-loss-metabolic-health` | **Strong** | Core public focus |
| `/telehealth` | Strong | Video visits; TX/OH only until verified |
| `/mens-health-longevity` | Moderate | HRT/wellness overlap — confirm scope |
| `/adhd-care` | **None evident** | Do not place without explicit ADHD credentials |

**Recommended tier:** **Tier 2 — core clinician** (NP weight-loss / metabolic telehealth)

---

## 4. Wendy Delgado, PA-C

**Sources:** [US News](https://health.usnews.com/physician-assistants/wendy-delgado-2130416) (not retrieved) · [Arrive HW](https://www.arrivehw.com/wendy-delgado) · [Doximity](https://www.doximity.com/pub/wendy-delgado-pa) · NPI aggregator data via public index (NPI 1063725059)

### Field extraction

| Field | Value | Status | Source |
|-------|-------|--------|--------|
| Name | Wendy Delgado (NPI: WENDY C DELGADO) | Verified from public source | NPI registry (public index) |
| Credentials | PA-C | Verified from public source | Doximity, NPI index |
| Credential conflict | Arrive page title “Wendy Delgado, **RN**” vs PA-C elsewhere | Mentioned but needs confirmation | Arrive vs Doximity/NPI |
| Role / type | Physician Associate (Arrive); Physician Assistant — Medical (NPI taxonomy) | Verified from public source | Arrive, NPI |
| States mentioned | California license #20963 (NPI primary taxonomy) | Verified from public source | NPI public index |
| Other states | AZ, CA, FL, IL, NY, PA, TX, UT on LinkedIn headline | Mentioned but needs confirmation | LinkedIn (self-reported; not in brief URL list but indexed) |
| Education | Western University of Health Sciences, Physician Assistant (2007–2009) | Verified from public source | Doximity |
| Residency | — | Not found | — |
| Certifications | NCCPA Certified Physician Assistant | Verified from public source | Doximity |
| Clinical focus | Medical weight loss (GLP-1s), aesthetics, telemedicine, urgent care, allergy & asthma | Verified from public source | Arrive, Doximity, LinkedIn (indexed) |
| Services | Telehealth intake; weight-loss medication evaluation; cosmetic procedure exams (LinkedIn) | Mentioned but needs confirmation | LinkedIn — not primary brief URL |
| Bio | Brief Arrive blurb; Doximity summary | Verified from public source (short) | Arrive, Doximity |
| Care philosophy | Patient collaboration, reliable/skilled team member (Arrive) | Mentioned but needs confirmation | Thin public copy |
| Headshot URL | — | Not found | — |
| NPI | 1063725059 | Verified from public source | NPI index |
| External profiles | Doximity; Arrive HW; US News ID 2130416 (content not retrieved) | Partial | — |
| Organization affiliations | Arrive Health and Wellness; NPI lists org Pine Park Health, Inc. (PECOS) | Mentioned but needs confirmation | NPI PECOS ≠ current employer proof |
| Experience years | 14 years (Arrive) vs 17 years (LinkedIn) | Mentioned but needs confirmation | Conflicting public sources |
| License verification link | CA license number only | Mentioned but needs confirmation | No board URL |
| Accepting new patients | — | Not found | — |

### Claims requiring proof (if reused on Siya)

- “Board-certified Physician Associate” — NCCPA cited on Doximity; needs primary confirmation packet for Siya.
- Multi-state licensure beyond CA.

### vs publishing minimums

| Gate | Ready? |
|------|:------:|
| Siya profile | **No** |
| reviewedBy attribution | **No** |
| Schema | **Partial** — NPI + PA-C + education; Arrive credential typo; licenses incomplete |

**Readiness score:** **43 / 100**

**Missing required fields:** Resolve RN vs PA-C on public materials; multi-state licenses with board URLs; accepting patients; care philosophy + patient-fit copy; headshot + consent; Siya role; admin verification; US News profile review (source inaccessible).

**Questions for provider/admin**

1. Confirm correct credential for publication: PA-C (not RN).
2. List active state licenses with board profile URLs (CA #20963 verified — others?).
3. Current employer for Siya listing: Arrive HW vs other orgs on NPI/PECOS.
4. Weight-loss-only vs aesthetics — what services should Siya profile include?
5. Telehealth states aligned with Siya service chips?
6. Provide headshot, publication consent, and approved bio.
7. US News / Healthgrades profiles — confirm URLs for `sameAs`.

**Recommended service page placement**

| Page | Fit | Caveat |
|------|-----|--------|
| `/weight-loss-metabolic-health` | **Strong** | GLP-1 telehealth focus |
| `/telehealth` | Moderate | Confirm licensed states |
| `/adhd-care` | None evident | No ADHD in public sources |
| `/mens-health-longevity` | Weak | — |

**Recommended tier:** **Tier 3 — supporting clinician** (PA-C weight-loss telehealth; credential conflicts and thin bio)

---

## Comparative summary

| Provider | Readiness | Siya profile | reviewedBy | Schema | Tier |
|----------|:---------:|:----------:|:----------:|:------:|------|
| Megan Wunderlich, NP | 46 | No | No | Partial | Tier 2 |
| Vanessa Urbina, MD | 48 | No | No | Partial | Tier 1 candidate |
| Derek Timbs, FNP-BC | 57 | No | No | Partial | Tier 2 |
| Wendy Delgado, PA-C | 43 | No | No | Partial | Tier 3 |

**None** of the four candidates meet `PROVIDER-PUBLISHING-MINIMUMS.md` for live publication, physician-reviewed content linkage, or fully verified schema.

### Cross-cutting gaps (all four)

1. No **state medical/nursing board verification URLs** collected.
2. No **Siya Health role/title** or internal affiliation confirmation.
3. No **headshot asset URLs** or publication consent.
4. No **admin verification** (verified by / date).
5. No **reviewer consent** or `reviewedContent` lists.
6. **ADHD-CCSP** (or equivalent) not found for any candidate — important if placed on `/adhd-care`.

### Recommended intake order (if pursuing)

1. **Derek Timbs** — highest public completeness; clearest weight-loss fit; confirm Siya affiliation first.
2. **Megan Wunderlich** — ADHD-relevant; PA-only until multi-state licenses documented.
3. **Vanessa Urbina** — strongest physician narrative; DPC/in-person model may mismatch Siya telehealth-first UX.
4. **Wendy Delgado** — resolve credential conflicts before any outreach.

---

## Related files

- `docs/FUTURE-PROVIDER-INTAKE-GAPS.csv` — field-level gap export
- `docs/provider-intake/megan-wunderlich.md` — gap-only intake packet
- `docs/provider-intake/vanessa-urbina.md`
- `docs/provider-intake/derek-timbs.md`
- `docs/provider-intake/wendy-delgado.md`
- `docs/PROVIDER-PUBLISHING-MINIMUMS.md`
