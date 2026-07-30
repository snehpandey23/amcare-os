# Release levels — maturity, not “deployed”

Employees infer trust from labels. **Internal Preview · v0.1-alpha** is intentional. Do not call this “production” in comms or UI.

---

## Level 0 — Developer only

- Local or private preview deployments  
- No real users  
- PHI forbidden (engineering habit)  
- OK to break things  

---

## Level 1 — Internal preview (≤5 named testers)

- Named testers only (email list in release record)  
- **No PHI** — non-PHI environment  
- **No clinical decisions** via assistant  
- URL must be **access-controlled** (Vercel Deployment Protection, SSO, or VPN)  
- Requires: `gate:deploy` pass + abbreviated checklist + CEO aware  

**Target for current Vercel app until gate is green.**

---

## Level 2 — One department pilot

- Example: Marketing only  
- Still **no PHI**  
- Daily owner review of failures (👎 feedback + knowledge gaps)  
- Requires: Level 1 clean for **1 week** + department lead sign-off  

---

## Level 3 — Company-wide (non-PHI)

- All internal staff may use **work and learning** features  
- Still **no patient identifiers** in chat  
- Continuous monitoring + weekly trust review  
- Requires: content score ≥ **80** (pilot bar), red team pass, all owner sign-offs  

---

## Level 4 — PHI-capable (future)

**Not offered in v0.1.**

Only after:

- Executed **BAA** (ChatGPT Enterprise and/or infra vendors — legal decides)  
- Legal + Privacy Officer approval  
- Security review  
- Clinical sign-off  
- Separate environment, logging, and incident playbooks  

---

## Promotion rules

1. Never skip levels.  
2. Demote on any **critical** failure (unsafe clinical, PHI accepted, fabricated refund/pricing).  
3. Record level in `trust-status.json` → visible on [/trust](/trust).  
