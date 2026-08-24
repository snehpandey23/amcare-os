# Audit — Staff Ask ↔ Founder Talk parity (2026-08-24)

**Scope:** Tonight’s Ask/chat fixes + architecture + standing dual-verify policy  
**Method:** Code path review (`engine.ts`, `chat/route.ts`, shells) + dual-surface smoke `scripts/smoke-dual-surface-parity.ts`  
**Out of scope:** Plan Record UI, domain tab collectors (admin-only by design)

---

## Root cause

**One engine, surface parameter — not two engines.**

- Both surfaces call `POST /api/chat` → `runSiyaAssistantAsync(..., { surface })`.
- Shared rule paths live in `buildSiyaReply` (off-topic, Practice/ops holiday, escalate-challenge, SOP chrome, tool shortcuts, gap contribution, retrieval compose).
- `founderCoach = surface === "founder-coach"` only toggles **documented** Talk differences (below).

Tonight’s accidental pain was mostly a **process gap**: smokes/reports often ran **default only**, while live bugs showed up on **Founder Talk** (admin testing). One known intentional UI/meta mismatch remains (Personalize copy vs blurb).

---

## Part 1 — Parity table (tonight’s chat fixes)

| Feature / fix | Staff Ask | Founder Talk | Gap type |
|---------------|-----------|--------------|----------|
| Civics / off-topic refuse (`isCasualOffTopic`) | Live — shared `buildSiyaReply` | Live — same path (smoke dual OK) | None |
| Off-topic meta pushback (“why not… learn USA”) | Live — no Leadership gap | Live — same (smoke dual OK) | None |
| Bare “when is thanksgiving” → Culture drill | Live | Live | None |
| Thanksgiving + leave/provider → calendar date | Live | Live | None |
| Gap-thread escalate challenge (“why marketing”) | Live | Live | None |
| Gap contribution (“can I give input”) | Live | Live (shared) | None |
| SOP-builder chrome / Gen AI SOP how-to | Live | Live (shared) | None |
| Org-leads away from MA onboarding KB | Live | Live (shared meta/flows) | None |
| `open Spruce` / tool bookmarks | Live | Live (label prefix only: “Founder Talk — tool bookmark”) | Intentional label |
| Onboarding / Personalize **meta** answers | Live | Live engine; **copy still says** admins lack Personalize | **Stale meta** vs UI |
| Personalize **link** on My day | Staff subtitle / HomeHub | **Present** on Founder Talk blurb (`FounderCoachPanel`) | Meta outdated (fix meta or leave as “also URL”) |
| Soft-stop / auto-gap when truly unmatched | Gap + department from routing | Gap + **Leadership · Founder Talk** label / default dept | Intentional labeling |
| Task **Approve** (`pendingTask`) | Available on ops-coach Recommend path | **Suppressed** (`pendingTask: undefined`) | **Intentional** |
| Flow follow-up questions (1–5 triage) | Can show on high-confidence flows | Stripped on Talk LLM path | Intentional |
| Founder portal domain signals / brief LLM | N/A (no brief pull) | Available when ask matches portal signals | Intentional |
| Patient/public marketing dump on Talk | N/A | Redirect away from inventing public FAQ | Intentional |
| Medium-score retrieval dump gate | Normal confidence | Stricter unless live SOP / portal ask | Intentional |
| Plan Record (Focus / Can Wait / …) | Staff don’t get Founder Coach plan | Manual plan tab — chat never writes | Intentional |
| My day tour (spotlight / Ask tour) | Staff only | Admins skipped | Intentional (no shift chrome) |

**Evidence:** `npx tsx scripts/smoke-dual-surface-parity.ts` — off-topic, pushback, bare/ops Thanksgiving, escalate challenge, tool shortcut all match on both surfaces.

---

## Intentional vs accidental (summary)

**Keep separate (intentional):**

1. Approve / `pendingTask` off on Founder Talk  
2. Portal signals + founder brief context  
3. No Plan Record writes from chat; plan UI admin-only  
4. Soft-stop chrome labeled Leadership · Founder Talk  
5. Stricter Talk dump gate; patient-public marketing redirect  
6. Staff-only shift tour  

**Fix / clean up (accidental or stale):**

1. **Meta Personalize copy** still claims admins have no Personalize — UI now has the link. Update `meta-conversation.ts` PORTAL_ONBOARDING* strings (not done in this audit pass unless requested).  
2. **Process:** default-only smokes for shared engine paths — addressed by dual-surface rule + `smoke-dual-surface-parity.ts`.

---

## Part 2 — Standing policy

**Confirmed.** Cursor rule: `.cursor/rules/siya-ask-dual-surface.mdc` (`alwaysApply: true`).

Any Ask/chat fix or feature must be verified on **both** staff Ask and Founder Talk before reporting done, unless explicitly scoped to one surface (stated in the report). Dual smoke preferred for shared engine paths. Deploy remains one staff-app ship (`deploy-staff-portal.sh`) — both surfaces ride the same build.
