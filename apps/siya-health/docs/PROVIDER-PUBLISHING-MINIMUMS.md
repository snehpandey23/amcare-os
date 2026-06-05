# Provider Publishing Minimums

Defines what Siya Health must collect and verify before expanding provider profiles, linking physicians to reviewed content, or adding provider #4.

Source audits: `PROVIDER-MISSING-INFO-AUDIT.md`, `PROVIDER-BIO-COMPLETENESS-AUDIT.md`, `data/providers.mjs`.

---

## Required before publishing (profile expansion / new provider)

These fields are missing or empty for all current providers. Collect before treating profiles as fully verified or adding provider #4.

### Identity
- Full legal name (must match license)
- Preferred public display name
- Credentials / suffixes
- Current role / title at Siya Health
- Professional headshot + alt text
- Headshot publication consent

### Licensing (per active state)
- State
- License type
- License status
- Expiration date (if available)
- Public verification link (state medical board profile)
- Accepting new patients (yes/no per state)

### Education & training
- Medical / PA / NP school
- Residency (specialty + institution)
- Board certifications (with verification source)
- ADHD-CCSP or other specialty training (if claimed on profile)

### Clinical (minimum)
- Clinical focus areas
- Services supported at Siya
- Patient-fit description
- Short bio + care philosophy (provider-approved copy)
- Telehealth / state eligibility disclaimer language

### Admin
- Profile last-updated date
- Credential verification completed by (name/role)
- Credential verification date

---

## Required before physician-reviewed content linkage

Do **not** add `reviewedBy` schema, “Physician reviewed” badges, or reviewer attribution until:

1. **Credential status** is verified (not “pending per-state documentation”)
2. **Per-state licenses** are documented with public verification links
3. **Board certifications** listed on the profile are confirmed against primary source
4. Provider has signed **reviewer consent** (Section 7 of intake form)
5. `reviewedContent` list is explicit (URL + title per piece the physician has reviewed)

Until then, all educational content remains **“Pending physician review”** per `content-review-registry.mjs`.

---

## Nice to have

Optional for E-E-A-T and schema enrichment; not blocking current profile publication.

- Fellowship
- Professional memberships
- Languages spoken (beyond English, if applicable)
- NPI
- External profiles (`sameAs`): LinkedIn, Doximity, Healthgrades, WebMD
- `authoredContent` (only if physician authored the piece)
- Graduation year (if approved for publication)
- Controlled-substance eligibility notes
- Crisis / emergency limitation language (recommended for psychiatric profiles)

---

## Claims requiring proof

Do **not** publish or retain without attached documentation and admin sign-off.

| Claim type | Current site examples | Required proof |
|------------|----------------------|----------------|
| Patient volume | “5,000+ patients” (Dr. Sneh Pandey profile + homepage) | Internal report, EHR export summary, or signed attestation with methodology + date |
| Testimonials marked “verified” | Provider profile blockquotes (all 3 providers) | Patient consent form, de-identified chart note, or CRM record |
| Ratings / reviews | None currently | Third-party platform export or licensed review aggregator record |
| Awards / recognition | None currently | Primary source (certificate, press release, organization listing) |
| Board certification (marketing copy) | “Board-certified” language sitewide | ABMS / AOA / NBPAS verification link or certificate |
| “Verified experiences” (membership page) | Membership-pricing copy | Same as testimonials |

**Policy:** If proof is not provided, either remove the claim or change wording to non-quantified, non-verified language (e.g. “patients we have supported” without numbers; testimonials without “verified” label).

---

## Minimum to add provider #4

Before a fourth provider page goes live:

1. All items in **Required before publishing**
2. Complete provider-specific intake (`docs/provider-intake/<slug>.md` or full clean form)
3. Headshot asset saved to `assets/images/` with alt text
4. Entry added to `data/providers.mjs` (generator handles HTML)
5. Admin tracker rows marked **Verified** for all Required fields
6. No unsubstantiated claims in `longBio`, testimonials, or marketing modules
7. Service-page assignment reviewed so state chips do not imply coverage beyond licensed states

---

## Current provider status (2026-06-05)

| Provider | Profile live | Credentials verified | Reviewer linkage ready |
|----------|:------------:|:--------------------:|:----------------------:|
| Dr. Sneh Pandey, MD | Yes | No — pending intake | No |
| Dr. Natasha Desai, MD | Yes | No — pending intake | No |
| Dr. Swati Pandey, MD | Yes | No — pending intake | No |

---

## Related documents

- `PROVIDER-INTAKE-FORM-CLEAN.md` — send to any new or existing provider
- `docs/provider-intake/dr-*.md` — pre-filled gap forms per provider
- `PROVIDER-INTAKE-ADMIN-TRACKER.csv` — internal tracking
- `PROVIDER-BIO-REQUEST-SHEET.csv` — field-level request log
