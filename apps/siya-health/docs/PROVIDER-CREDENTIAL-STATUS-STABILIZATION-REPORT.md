# Provider Credential Status Stabilization Report

Generated: 2026-06-05

## Summary

Public credential badges now derive from **computed** `credentialStatus` — not hardcoded `verified`.

| Badge | When shown |
|-------|------------|
| **Credentials verified** | `verified` — NPI + all license numbers present internally |
| **Active Siya Health clinician** | `active_internal` — contracted, public profile live, internal file incomplete |
| **Credential details updating** | `pending_internal` — reserved for non-contracted / intake |

## Per-provider public badge (post-build)

| Provider | NPI internal | License # internal | Public badge |
|----------|:------------:|:------------------:|--------------|
| Dr. Sneh Pandey | ❌ | ❌ | Active Siya Health clinician |
| Dr. Natasha Desai | ❌ | ❌ | Active Siya Health clinician |
| Dr. Swati Pandey | ❌ | ❌ | Active Siya Health clinician |
| Dr. Vanessa Urbina | ❌ | ❌ | Active Siya Health clinician |
| Megan Wunderlich | ✅ | ❌ | Active Siya Health clinician |
| Derek Timbs | ✅ | ❌ | Active Siya Health clinician |
| Wendy Delgado | ✅ | ✅ | **Credentials verified** |

Wendy is the only provider whose internal record passes `isInternalCredentialRecordComplete()`.

## Implementation

- `computeCredentialStatus()`, `formatCredentialMeta()` in `data/internal-provider-records.mjs`
- Removed hardcoded `credentialStatus: 'verified'` from all records
- `applyInternalRecords()` computes status; verifier/date only exposed when `verified`
- `scripts/generate-provider-pages.mjs` uses `formatCredentialMeta()` for profile meta lines

## Gate status

**PASS** — No provider shows “Credentials verified” without internal completeness (except Wendy, who qualifies).

## Next action

Populate `npi` and `licenseNumber` per license in `internal-provider-records.mjs` → badges auto-upgrade on rebuild.
