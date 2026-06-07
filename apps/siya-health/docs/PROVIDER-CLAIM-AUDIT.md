# Provider Claim Audit

**Generated:** 2026-06-07 (Phase 6 hygiene sprint)  
**Scope:** Patient-visible numeric/experience claims on provider and weight-loss surfaces

---

## Claim: “5,000+ patients” / “5,000+ Weight Loss Patients”

| Location | Prior claim | Action | Source verified? |
|----------|-------------|--------|------------------|
| `providers/dr-sneh-pandey.html` (from `data/providers.mjs`) | “5,000+ patients in structured weight-loss programs” | **Replaced** with “thousands of patient encounters in structured weight-loss programs” | **No** — no documented source in repo |
| `weight-loss-metabolic-health.html` hero trust bar | “5,000+ Weight Loss Patients” | **Replaced** with “Extensive Telehealth Experience” | **No** |
| `weight-loss-metabolic-health.html` trust metrics headline | “Trusted by 5,000+ Adults…” | **Replaced** with non-numeric “Trusted by adults pursuing weight management through telehealth” | **No** |

### Source search (repository)

| Search target | Result |
|---------------|--------|
| Internal provider records (`data/internal-provider-records.mjs`) | No patient-volume statistic |
| Provider intake docs (`docs/provider-intake/`) | No 5,000+ citation |
| `docs/PROVIDER-BIO-COMPLETENESS-AUDIT.md` | Flags claim as **requiring source documentation** (prior audit) |
| `data/providers.mjs` `claimsNeedingVerification` | Previously listed “5,000+ patients…” — **removed** after copy softening |

### Approved replacement language (applied)

- Provider bio: **“thousands of patient encounters”** in structured weight-loss programs
- Weight-loss hub: **non-numeric** experience/trust phrasing (no fabricated counts)

### Claims still requiring future documentation (not changed in this sprint)

| Claim | Location | Notes |
|-------|----------|-------|
| “450+ verified reviews” / “4.7★” | `weight-loss-metabolic-health.html` trust metrics | Out of Phase 6 scope; not part of HIGH finding #3 |
| “2,500+ comprehensive metabolic health evaluations” | Same section | Out of Phase 6 scope |
| “1,000+ Adults Evaluated” | Various hero trust bars | Sitewide pattern; not verified in this audit |

---

## Recommendation

Do **not** restore specific patient-volume numbers until a citable internal source (CRM export, audited chart count, or signed marketing approval) is stored in `docs/provider-intake/` or `data/internal-provider-records.mjs` with date and methodology.
