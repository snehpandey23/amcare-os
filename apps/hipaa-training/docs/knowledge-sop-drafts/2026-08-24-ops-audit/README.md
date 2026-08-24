# Knowledge SOP drafts — ops audit batch (2026-08-24)

**Status:** Draft pack for lead review. **Not live.** Do not treat Ask answers as approved until each row is `live`.

**Install path:** `integrations/hipaa-training-api/src/audit-knowledge-sop-pack.ts` → `ensureOperationalSopPack` creates `siya_sops` with `status=draft` and open Knowledge tasks. Lead/admin: edit → **Submit for review** → approve.

| Draft SOP title | Department | Reviewer |
|-----------------|------------|----------|
| Clinical Program daily SLAs (pre-chart, fax, note lock, ops day) | Clinical Operations | Clinical lead |
| Workplace and interpersonal concerns | HR | HR / People lead |
| Chat Review QC vs shift handoff | Clinical Operations | Clinical lead |
| Practice hours and patient booking contact | General | Founder |
| Notify owner — knowledge gap routing | Technology | Tech lead |
| Expense reimbursement (interim) | Accounts | Accounts lead |
| Leave and PTO (interim — handbook pending) | HR | Founder + HR (required before live) |
| Staff talk-tracks (site canon) | Clinical Operations | Clinical + Compliance skim |

Bodies live in the TypeScript pack (source of truth for DB install). Hostile-patient content is **excluded** — use live `sop-1786241888864-djh6i5`.
