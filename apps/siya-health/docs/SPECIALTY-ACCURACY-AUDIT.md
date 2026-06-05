# Clinical Specialty Accuracy Audit — Siya Health

Generated: 2026-06-05  
Scope: Full-site read-only audit per search terms: *psychiatrist, psychiatry, psychiatric physician, psychologist, psychology specialist, psychiatric specialist, psychiatric provider, behavioral psychiatrist, mental health specialist*  
**No site changes made.** Review this report before implementation.

---

## 1. Executive summary

| Finding | Count (approx.) |
|---------|----------------:|
| HTML files with ≥1 psychiatry-related term | **~55** |
| **High-risk** provider/org specialty claims | **42** |
| **Medium-risk** Swati-linked marketing copy | **14** |
| **Low-risk** acceptable clinical/educational usage | **~80+** |
| Matches for psychologist / psychology specialist / behavioral psychiatrist / mental health specialist | **0** (as provider titles) |

**Primary issue:** The site positions **Dr. Swati Pandey** and **Siya Health organization schema** as **Psychiatry / Psychiatric Physician**, while the stated brand positioning is **primary care–based ADHD and mental health care**. Board certification for Swati is listed as *“Psychiatric & Mental Health Physician”* with an ABPN verification URL, but **medical school, residency specialty, and ABMS board name are not documented** in `internal-provider-records.mjs`. Until credentialing confirms psychiatry board certification, **Psychiatry-labeled schema and titles exceed verifiable training**.

**Secondary issue:** Organization-level JSON-LD on the homepage includes `"Psychiatry"` and `"Endocrinology"` under `medicalSpecialty` without a credentialed endocrinology physician on the roster.

**No occurrences** of *psychologist*, *psychology specialist*, *psychiatric specialist*, *psychiatric provider*, *behavioral psychiatrist*, or *mental health specialist* as Siya provider titles were found.

---

## 2. Credential baseline (contracted team)

Use this table as the accuracy standard for replacements.

| Provider | Documented credentials | Verified board certs (internal export) | Safe public specialty framing |
|----------|------------------------|----------------------------------------|------------------------------|
| **Dr. Sneh Pandey, MD** | MD | Internal Medicine; Obesity Medicine; ADHD-CCSP | Internal Medicine / Obesity Medicine physician; Medical Director |
| **Dr. Natasha Desai, MD** | MD | Family & Behavioral Medicine; ADHD-CCSP | Family & Behavioral Medicine physician |
| **Dr. Swati Pandey, MD** | MD | *Psychiatric & Mental Health Physician* (ABPN URL listed; residency TBD) | **Pending credentialing:** if **not** ABPN Psychiatry → *Adult ADHD & Mental Health physician* or confirmed primary specialty; if **is** psychiatrist → may retain board-accurate title but org should still avoid “Psychiatry clinic” positioning per brand |
| **Dr. Vanessa Urbina, MD** | MD | Family Medicine | Family Medicine physician |
| **Megan Wunderlich, FNP-C** | FNP-C | FNP-C | Family Nurse Practitioner — mental health & ADHD support |
| **Derek Timbs, FNP-BC** | FNP-BC | FNP-BC | Family Nurse Practitioner — weight & metabolic care |
| **Wendy Delgado, PA-C** | PA-C | NCCPA PA | Physician Associate — weight & metabolic care |

**Preferred practice positioning (per audit brief):**  
*"Primary care–based ADHD and mental health care"* — not *"Psychiatry"* or *"Psychiatry services."*

---

## 3. Risk framework

| Level | Definition | Action |
|-------|------------|--------|
| **Critical** | Schema `medicalSpecialty`, `jobTitle`, or page title implies board specialty not verified | Fix in source data + rebuild |
| **High** | Provider role line, meta description, or hub copy names provider as psychiatric specialist | Fix in `providers.mjs` / generator |
| **Medium** | Service cards, about copy, or blogs link Swati/Siya to “psychiatric depth” or “telepsychiatry” | Reword to ADHD / mental health care |
| **Low** | Clinical education: “psychiatric history,” “psychiatric medications,” comorbidity screening | Optional soften to “mental health history”; generally acceptable |
| **Informational** | Third-party references (e.g. “psychiatrist waitlists,” “discuss with your psychiatrist”) | No change or generic “licensed clinician” |

---

## 4. Critical & high-risk flagged occurrences

### 4.1 Dr. Swati Pandey — source data (`data/providers.mjs`)

| Line area | Current text | Accurate? | Recommended replacement |
|-----------|--------------|:---------:|-------------------------|
| `role` | Psychiatric Physician | **Unverified** | `Adult ADHD & Mental Health Physician` *or* confirmed board specialty (e.g. Internal Medicine Physician) |
| `boardCertifications` | Psychiatric & Mental Health Physician | **Verify** | ABMS-exact name from credentialing (e.g. *Board Certified in Psychiatry* **only if** true) |
| `credentialChips` | Psychiatric & Mental Health | **Unverified** | `Adult ADHD` · `Mental Health` · `ADHD-CCSP` |
| `patientFit.deck` | psychiatric depth | **High** | `mental health depth` or `clinical depth for overlapping mood and ADHD` |
| `patientFit.bullets` | psychiatrist's lens | **High** | `clinician's lens on mood and anxiety` |
| `whatToExpect` | psychiatric evaluation / psychiatric care | **High** | `ADHD and mental health evaluation` / `ongoing medication management` |
| `trustCards.Scope` | psychiatric practice | **High** | `ADHD-CCSP–structured assessment within telehealth scope` |
| `longBio` | Psychiatric care | **Medium** | `Mental health care` or `ADHD and mood care` |
| `disclaimer` | Psychiatric treatment | **Medium** | `Medical treatment` / `mental health treatment` |
| `schema.medicalSpecialty` | `Psychiatry`, `Mental Health` | **Critical** | `Adult ADHD`, `Mental Health`, plus **confirmed** primary specialty only |
| `schema.jobTitle` | Psychiatric Physician | **Critical** | Match verified role |
| `seo.title` | Adult ADHD & **Psychiatric Care** | **High** | `Adult ADHD & Mental Health Care` |
| `seo.description` | Psychiatric physician | **High** | `Siya Health physician` + confirmed specialty |
| `servicePageTagline` | ADHD & psychiatric depth | **High** | `ADHD & mental health depth` |

**Regenerates:** `providers/dr-swati-pandey.html`, hub card, service `#meet-physicians` blocks, `entity-graph.json`, `provider-index.json`, `llms.txt`.

---

### 4.2 Dr. Swati Pandey — live profile (`providers/dr-swati-pandey.html`)

| Location | Occurrence | Risk | Replacement |
|----------|------------|------|-------------|
| `<title>`, OG/Twitter meta | `Psychiatric Care` / `Psychiatric physician` | **Critical** | `Mental Health Care` / `Siya Health physician` |
| JSON-LD Physician | `jobTitle: Psychiatric Physician` | **Critical** | Verified `jobTitle` |
| JSON-LD Physician | `medicalSpecialty: ["Psychiatry", ...]` | **Critical** | Remove `Psychiatry` unless ABPN Psychiatry confirmed |
| JSON-LD | `psychiatric comorbidity` in `knowsAbout` | **Low** | `ADHD with depression or anxiety overlap` (clinical term, not specialty claim) |
| Hero role line | Psychiatric Physician | **High** | See §4.1 |
| Hero deck | psychiatric depth | **High** | mental health depth |
| Credential card | Psychiatric & Mental Health Physician | **High** | Verified board string |
| Body copy (×4) | psychiatrist's lens; psychiatric evaluation; psychiatric care; psychiatric practice | **High** | clinician / mental health / ADHD evaluation wording |
| Disclaimer | Psychiatric treatment | **Medium** | Mental health treatment |

---

### 4.3 Organization & entity schema

| Page / file | Occurrence | Provider ref | Risk | Replacement |
|-------------|------------|--------------|------|-------------|
| `index.html` JSON-LD `MedicalOrganization` | `medicalSpecialty: ["Psychiatry", ...]` | Org-wide | **Critical** | `["Adult ADHD", "Internal Medicine", "Family Medicine", "Obesity Medicine", "Medical Weight Loss"]` — drop `Psychiatry`, review `Endocrinology` |
| `data/entity-graph.json` | `organization.medicalSpecialty` includes `Psychiatry` | Org | **Critical** | Align with homepage fix |
| `data/entity-graph.json` | Swati `jobTitle`, `medicalSpecialty: Psychiatry` | Swati | **Critical** | §4.1 |
| `provider-index.json` | Swati `jobTitle: Psychiatric Physician` | Swati | **High** | Regenerate from `providers.mjs` |
| `llms.txt` | `Psychiatry / ADHD (PA)` | Swati | **High** | `Adult ADHD & mental health (PA)` |
| `llms-full.txt` | Org `Psychiatry`; Swati psychiatric telehealth copy | Org + Swati | **High** | Rebuild indexes |

---

### 4.4 Provider hub (`providers/index.html` + generator)

| Location | Occurrence | Risk | Replacement |
|----------|------------|------|-------------|
| Meta description (×4) | behavioral, and **psychiatric telehealth** | **High** | `behavioral, and mental health telehealth` |
| WebPage JSON-LD | same | **Critical** | same |
| Swati hub card `provider-index-role` | Psychiatric Physician | **High** | §4.1 role |
| Swati hub teaser | psychiatric depth | **High** | mental health depth |

---

### 4.5 Internal credential export (`data/internal-provider-records.mjs`)

| Field | Occurrence | Risk | Replacement |
|-------|------------|------|-------------|
| Swati `boardCertifications[0].name` | Psychiatric & Mental Health Physician | **High** | ABMS-exact certification name from credentialing file |
| Swati `verificationUrl` | abpn.com | **Info** | Valid **only if** Psychiatry board cert confirmed |

---

### 4.6 Service-page & homepage provider cards (Swati tagline)

**Current:** `ADHD & psychiatric depth · PA`  
**Injected via:** `site-chrome.mjs` from `providers.mjs` → `servicePageTagline`

| Page | Risk | Replacement |
|------|------|-------------|
| `/` (`index.html` #care-team) | **High** | `ADHD & mental health depth · PA` |
| `/adhd-care` | **High** | same |
| `/telehealth` | **High** | same |
| `/adhd-treatment-online` | **High** | same |
| `/online-adhd-test` | **High** | same |
| `/adult-adhd-diagnosis` | **High** | same |
| `/adhd-diagnosis-pennsylvania` | **High** | same |
| `/adhd-diagnosis-philadelphia` | **High** | same (if present) |

---

### 4.7 About page (`about.html`)

| Location | Occurrence | Provider | Risk | Replacement |
|----------|------------|----------|------|-------------|
| Swati team card tagline | **Psychiatric depth** for ADHD alongside depression... | Swati | **High** | `Mental health depth for ADHD alongside depression, anxiety, or complex medication histories` |

---

## 5. Medium-risk flagged occurrences

### 5.1 Dr. Natasha Desai — referral language (`providers/dr-natasha-desai.html`, `providers.mjs`)

| Occurrence | Accurate? | Risk | Replacement |
|------------|:---------:|------|-------------|
| `When therapy or **psychiatry escalation** is the better path` | Referral context | **Medium** | `When therapy or **referral to a psychiatric specialist** is the better path` *or* `specialist mental health care` |

*Natasha is Family & Behavioral Medicine — not psychiatry. Wording is referral-only but can imply she provides psychiatry.*

---

### 5.2 California / Texas geo & blog content (Siya as service provider)

| Page | Occurrence | Risk | Replacement |
|------|------------|------|-------------|
| `blog/adult-adhd-treatment-california-2026.html` | FAQ schema: `psychiatric office cadence`; body `psychiatry substitutes` | **Medium** | `in-person specialist office cadence`; `unregulated substitutes for medical care` |
| `scripts/california-adhd-blog-rest.mjs` (source) | `telepsychiatry`; `ADHD telepsychiatry California` | **Medium** | `ADHD telehealth in California` — avoid implying Siya is a telepsychiatry practice |
| `adhd-diagnosis-texas.html` | `waitlists for **psychiatry** and ADHD specialists` | **Low–Medium** | Informational market context — OK; optional: `psychiatric specialists` |
| `adhd-diagnosis-austin.html` | `local **psychiatry** waitlists` | **Low** | Informational — OK |
| `blog/combining-adhd-treatment-and-weight-loss-strategies.html` | `discuss with your **psychiatrist**` | **Medium** | `discuss with your **prescribing clinician**` |
| `blog/insomnia-treatment-options-beyond-medication.html` | `targeted **psychiatric care**` | **Medium** | `targeted **mental health specialist care**` (referral) |

---

### 5.3 Generated machine indexes

| File | Occurrence | Risk |
|------|------------|------|
| `scripts/generate-ai-indexes.mjs` | `Psychiatry / ADHD` label for Swati | **High** |
| `scripts/rebuild-entity-graph.mjs` | topic slug `psychiatric-comorbidity` | **Low** (topic tag, not specialty claim) |

---

## 6. Low-risk / acceptable occurrences (no change required)

These use *psychiatric* as **clinical adjective** (history, medications, screening, comorbidity), not as **Siya specialty branding**.

| Pattern | Example locations | Notes |
|---------|-------------------|-------|
| `psychiatric history` | `/answers/can-adhd-be-diagnosed-online`, `/answers/is-online-adhd-diagnosis-legitimate`, CA ADHD blogs (FAQ JSON-LD) | Standard intake language |
| `psychiatric medications` | Multiple blogs (weight, TRT, telehealth Rx boilerplate) | Refers to drug class, not provider title |
| `psychiatric conditions` / `screening` | Phentermine blog, Adderall blogs, ADHD side-effects blog | Education |
| `psychiatric comorbidity` | Medication options CA blog | Clinical term |
| `psychiatric crisis` | `/answers/high-shbg-low-free-testosterone` | Triage language |
| `psychiatric diagnoses` | `/answers/can-adhd-be-diagnosed-online` (prep list) | Patient history |
| `psychiatric symptoms` (section H2) | `blog/adhd-medication-side-effects-what-to-expect.html` | Med safety education |
| `neuropsychology` | `/answers/executive-dysfunction-adhd` evidence row | Literature label, not provider title |
| `Integrated metabolic psychiatry literature` | `/answers/adhd-and-weight-loss-connection` | Citation category |
| `psychiatrists` (third parties) | `blog/adult-adhd-symptoms-california.html` | Societal narrative, not Siya claim |
| `psychology` (patient experience) | `blog/food-noise-and-glp-1-...` | Behavioral science context |
| `occupational psychology` | `blog/adult-adhd-treatment-california-2026.html` | Accommodations context |
| Testimonials on Swati profile | Hidden (`needsVerification: true`) | Quotes use “Psychiatric follow-up patient” in **cite** only — if testimonials re-enabled, change cite to `PA patient` |

---

## 7. Schema-specific audit summary

| Schema surface | Issue | Risk |
|----------------|-------|------|
| `index.html` → `MedicalOrganization.medicalSpecialty` | Includes `Psychiatry`, `Endocrinology` without roster match | **Critical** |
| `providers/dr-swati-pandey.html` → `Physician.jobTitle` | Psychiatric Physician | **Critical** |
| `providers/dr-swati-pandey.html` → `Physician.medicalSpecialty` | Psychiatry | **Critical** |
| `providers/index.html` → `CollectionPage` / `WebPage` description | psychiatric telehealth | **High** |
| `entity-graph.json` | Org + Swati psychiatry nodes | **Critical** |
| Answer/blog `FAQPage` / `MedicalWebPage` | “psychiatric history” in answers | **Low** (clinical accuracy OK) |
| No `Physician` schema found for Natasha/Sneh with Psychiatry | — | ✓ |

**Rule for implementation:** `medicalSpecialty` in JSON-LD must be a **subset of verified board certifications + contracted scope** (ADHD-CCSP, Obesity Medicine, Family Medicine, etc.) — never generic `Psychiatry` at org level.

---

## 8. Testimonials & metadata

| Item | Status |
|------|--------|
| Swati testimonials | Not rendered (`needsVerification: true`); cites say “Psychiatric follow-up patient” — **fix before publish** |
| Natasha testimonials | Hidden; cite “Behavioral health follow-up” — **OK** |
| Homepage testimonials | Reference Dr. Pandey only — **OK** |
| Provider meta titles | Swati title/descriptions — **flagged §4.2** |
| Hub meta | **flagged §4.4** |

---

## 9. Implementation plan (post-review)

### Phase 0 — Credentialing gate (1–2 days, Clinical/Ops)

1. Confirm **Dr. Swati Pandey** ABMS board specialty (Psychiatry vs Internal Medicine / Family Medicine / other).
2. Document **medical school + residency specialty** for all MDs in `internal-provider-records.mjs`.
3. Confirm whether org offers **endocrinology**; if no ABMS endocrinologist, remove from org schema.

### Phase 1 — Source-of-truth fixes (Engineering)

| File | Changes |
|------|---------|
| `data/providers.mjs` | Swati role, chips, bios, schema, SEO, `servicePageTagline` per §4.1 |
| `data/internal-provider-records.mjs` | Board cert exact names |
| `index.html` (or org schema injector) | Replace org `medicalSpecialty` array |
| `scripts/generate-ai-indexes.mjs` | Swati llms.txt line |
| `scripts/california-adhd-blog-rest.mjs` | Remove `telepsychiatry` service positioning |
| `about.html` | Swati tagline (or inject via chrome) |

### Phase 2 — Regenerate & redeploy

```bash
node scripts/generate-provider-pages.mjs
node scripts/rebuild-entity-graph.mjs
node scripts/seo-build.mjs
node scripts/generate-ai-indexes.mjs
npm run build
```

### Phase 3 — QA checklist

- [ ] Grep: no `Psychiatric Physician` / `jobTitle.*Psychiatry` / org `Psychiatry` in HTML JSON-LD
- [ ] Swati profile shows confirmed board string only
- [ ] Service cards: no `psychiatric depth` taglines
- [ ] `provider-index.json` + `entity-graph.json` aligned
- [ ] Re-run this audit script (add `scripts/specialty-accuracy-scan.mjs` optional)
- [ ] Legal/compliance sign-off on final Swati title if psychiatry board **is** confirmed

### Phase 4 — Optional content polish (Medium → Low)

- Replace blog boilerplate “psychiatric medications” → “mental health medications” where readability helps (cosmetic).
- Standardize referral phrase: “licensed psychiatric specialist” vs “psychiatry escalation.”

---

## 10. Recommended replacement dictionary

| Avoid (specialty overreach) | Use instead |
|----------------------------|-------------|
| Psychiatry (org specialty) | Adult ADHD; Mental Health Care; Primary Care |
| Psychiatric Physician | *[Confirmed specialty]* Physician — e.g. Internal Medicine, Family Medicine, or Board-Certified Psychiatrist **only if verified** |
| Psychiatric Care (service) | ADHD Evaluation & Treatment; Mental Health Care |
| psychiatric depth (marketing) | mental health depth; clinical depth |
| psychiatrist's lens | clinician's lens |
| psychiatric telehealth (hub) | mental health telehealth; ADHD telehealth |
| telepsychiatry (as Siya service) | ADHD telehealth; telehealth mental health support |
| Psychiatry Services | ADHD & Mental Health Services |

---

## 11. Sign-off blockers

Before merging specialty fixes:

1. **Swati board specialty** confirmation from Siya credentialing (single source of truth).
2. **Org medicalSpecialty** list approved by compliance to match contracted scope only.
3. **Endocrinology** in homepage schema — confirm remove or add credentialed provider.

---

*Audit only — no HTML, schema, or `providers.mjs` edits applied. Implementation should begin after clinical review of §4.1 and §7.*
