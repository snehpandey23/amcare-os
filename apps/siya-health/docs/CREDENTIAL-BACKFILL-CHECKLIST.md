# Credential Backfill Checklist

Generated: 2026-06-05  
Source: `data/internal-provider-records.mjs` (internal only — no public page changes)

## Field definitions

| # | Field | Pass criteria |
|---|-------|---------------|
| 1 | NPI | `npi` non-null |
| 2 | License number | Every license entry has `licenseNumber` |
| 3 | State licenses | ≥1 active license with state |
| 4 | Medical school / training | `medicalSchool` (MD) or `graduate`/`undergraduate` (APP) |
| 5 | Residency / training | `residency` or documented post-graduate training path |
| 6 | Board certification | ≥1 entry in `boardCertifications` |
| 7 | Credential verification URL | All licenses have `verificationUrl` **and** ≥1 board cert has `verificationUrl` |

Completion % = fields passing ÷ 7.

---

## Provider table (sorted: lowest completion first)

| Provider | NPI | Lic # | States | School | Residency | Board | Verify URL | **%** |
|----------|:---:|:-----:|:------:|:------:|:---------:|:-----:|:----------:|:-----:|
| Dr. Swati Pandey | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | **29%** |
| Dr. Sneh Pandey | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | **43%** |
| Dr. Natasha Desai | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | **43%** |
| Dr. Vanessa Urbina | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | **71%** |
| Megan Wunderlich, FNP-C | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | **71%** |
| Derek Timbs, FNP-BC | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | **71%** |
| Wendy Delgado, PA-C | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | **86%** |

---

## Per-provider backfill actions

### Dr. Swati Pandey (29%)
- [ ] Add NPI
- [ ] Add PA MD `licenseNumber`
- [ ] Add medical school + residency
- [ ] Add board cert verification URL (or confirm ADHD-CCSP-only public framing)

### Dr. Sneh Pandey (43%)
- [ ] Add NPI
- [ ] Add license numbers (CA, TX, PA, FL)
- [ ] Add medical school + residency

### Dr. Natasha Desai (43%)
- [ ] Add NPI
- [ ] Add license numbers (TX, FL)
- [ ] Add medical school + residency

### Dr. Vanessa Urbina (71%)
- [ ] Add NPI
- [ ] Add FL MD `licenseNumber`

### Megan Wunderlich (71%)
- [ ] Add PA APRN `licenseNumber`
- [ ] Add residency/preceptorship note if applicable

### Derek Timbs (71%)
- [ ] Add TX + OH `licenseNumber` per state

### Wendy Delgado (86%)
- [ ] Optional: document residency/preceptorship if applicable
- [ ] **Only provider currently eligible for `verified` badge** (NPI + license # complete)

---

## Compliance workflow

1. Export credentialing CSV → update `internal-provider-records.mjs` only.
2. Re-run `node scripts/generate-provider-pages.mjs` (badges recompute automatically).
3. Re-run this checklist — target **100%** before org-wide `verified` messaging.

**Do not deploy** until compliance signs off on backfilled fields.
