# Competency / graded-data corrections

Manual production corrections to competency exam (or similarly graded) records.

**Rule:** Prefer a short markdown entry here over a silent DB edit. Employment-linked scores need an audit trail.

| Field | Required |
|-------|----------|
| Authorizer | Who approved the write (name / role + how) |
| Timestamp | When the DB write landed (ISO UTC) |
| Attempt / sitting IDs | Exact record keys |
| Before / after | Scores and trail fields changed |
| Reason | Why — link bug, deploy, or decision |
| Scope | Confirm no other trainees batch-corrected |

Template: copy `_TEMPLATE.md` or mirror an existing entry.
