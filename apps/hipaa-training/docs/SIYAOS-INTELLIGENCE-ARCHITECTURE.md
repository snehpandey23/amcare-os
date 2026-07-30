# Siya Intelligence — three products, one brain

```
                    Siya Intelligence Engine
                    (knowledge · memory · routing · gaps)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
     SiyaOS              Siya Guide         Physician Copilot
   (employees)           (patients)           (providers)
```

Same core: every question anywhere should improve the engine.

| Surface | Example question | Loop |
|---------|------------------|------|
| **SiyaOS** | How do I submit reimbursement? | Gap → Accounts SOP → never ask twice |
| **Siya Guide** | Why do I forget appointments? | Patient education improves |
| **Copilot** | Document this visit faster? | Clinical workflow improves |

**SiyaOS is the first interface** — safest place to learn and validate before extending intelligence outward.

Repo today:

| Product | Path |
|---------|------|
| SiyaOS | `apps/hipaa-training` (deploy: staff assist) |
| Siya Guide | `apps/siya-assistant` |
| Patient site / graph | `apps/siya-health` |

Internal KB: `docs/siyaos-knowledge-base/`. Do not merge employee, patient, and clinical permission models.

---

# Presence, not attendance

| Avoid | Prefer |
|-------|--------|
| Login = clock only | **Start Shift** → My Day → work |
| Break surveillance | Outcomes only (learning, SOPs, Ask, practice) |
| Mandatory End Shift | Gentle prompt after inactivity |
| Employee score 82/100 | Growth arrows (↑ documentation, → English) |

**Start Shift** records timestamp and opens My Day. **End Shift** collects optional mood + reflection + saves progress.

---

# Metrics that matter (leadership)

1. **Time to competence** — weeks until a new hire is independently useful (by role).  
2. **Questions eliminated** — repeated Ask themes down month over month (Principle 1).  
3. **Organizational IQ** — open knowledge gaps down over time.  
4. **Daily adoption** — people *want* to stay after Start Shift (not DAU for its own sake).

---

# Shift admin view (coaching)

**Team Today:** expected / started / on shift / ended / not started.

Per person: shift start, learning ✔, practice ✔, questions asked, gaps found, reflection ✔, status.

No minute-by-minute timelines. No idle/mouse/keyboard.

---

# Memory & journal (roadmap)

- **Coach memory** (opt-in): recall struggles and celebrate improvement over months.  
- **Today I learned…** — one private sentence per day (365/year journal).  
- **Growth Timeline** — events, not grades.

See [SIYAOS-PRINCIPLES.md](./SIYAOS-PRINCIPLES.md).
