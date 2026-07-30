# Deployment gate — no exceptions

**The release process is the product.** Code and copy do not ship on optimism.

Every promotion of **Siya Assistant (staff)** or **Siya Helpdesk (Custom GPT)** must complete this checklist. If **one box is unchecked**, **do not deploy** and **do not widen access**.

Current environment label: **Internal Preview · v0.1-alpha** — not “production.”

---

## Mandatory checklist

Copy into each release record (`docs/releases/YYYY-MM-DD-siya-assist-vX.md`).

```
□ PHI review complete (non-PHI scope documented; BAA N/A or executed for Level 4 only)
□ KB review complete (live topics only; no draft bundle uploaded to GPT)
□ Pricing conflicts checked (canonical pricing topic wins; conflicts escalated)
□ Red team passed (V4 — run `npm run red-team:staff -w @amcare/hipaa-training`, then `gate:deploy`)
□ Zero critical failures (fabricated policy, PHI accepted, clinical dosing, refund promises)
□ Department owners approved (clinical, privacy, billing, HR, marketing, technology — written sign-off)
□ Pilot users trained (5-minute PHI + “this is not official prod” usage)
□ Rollback tested (prior Vercel deployment + prior GPT knowledge package restorable)
□ Release logged (commit, knowledge build id, test suite version, pilot group, release level)
□ CEO approval (for any move above Release Level 1)
```

---

## Automated gate (CI / local)

**New to this?** Read [HOW-TO-RUN-TESTS-NOOB.md](./HOW-TO-RUN-TESTS-NOOB.md).

GitHub: push to `main` or open a PR → **Actions** → **Siya Staff — safety & build** (red team + build must pass).

```bash
npm run gate:deploy -w @amcare/hipaa-training
```

Exit code **1** = blocked. Human debate does not override a failed gate without a **new** signed checklist and **retest**.

---

## Release levels (see [RELEASE-LEVELS.md](./RELEASE-LEVELS.md))

| Level | Who | PHI | Deploy when |
|------|-----|-----|-------------|
| 0 | Builder only | No | Anytime (local) |
| 1 | ≤5 named testers | No | Gate pass + CEO for first external URL |
| 2 | One department | No | Gate pass + owner sign-offs + 1 week Level 1 clean |
| 3 | Whole company | No | Gate pass + content score ≥80 pilot bar + monitoring on |
| 4 | PHI-capable | Yes (BAA) | Legal + security + clinical — **out of scope for v0.1** |

**Today:** treat `siya-staff-assist.vercel.app` as **Level 0–1 until** access restriction + gate pass + checklist.

---

## Custom GPT (parallel track)

Same checklist. Additionally:

- Browsing, actions, code interpreter **off** unless documented exception  
- Sharing: named users only — never public link  
- Knowledge = **compiled live package only** (git → build → upload)

---

## Kill switch

| Action | Owner |
|--------|--------|
| Disable Vercel production alias / enable Deployment Protection | Engineering |
| Revoke GPT workspace sharing | GPT owner (CEO delegate) |
| Set `SIYA_WORKFORCE_USE_LLM=0` | Engineering (retrieval-only) |
| Remove compromised topic from git + rebuild KB | Topic owner + Engineering |

Document who owns each lever in the release record.

---

## Related

- [RELEASE-LEVELS.md](./RELEASE-LEVELS.md)
- [CONTINUOUS-MONITORING.md](./CONTINUOUS-MONITORING.md)
- [Trust dashboard](/trust) (Internal Preview)
- `docs/siyaos-knowledge-base/AUDIT-PROGRAM.md`
