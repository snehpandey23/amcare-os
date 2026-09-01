# Siya OS Architecture

**Status:** v1.0 foundation · **Owner:** CEO / Leadership  
**Purpose:** Company operating blueprint. Department manuals (e.g. Marketing OS) are modules under this tree — not independent operating philosophies.

> Siya OS is how the company runs. Each department OS is how that function runs *inside* the same architecture.

---

## System map

```text
SIYA OS
├── Executive OS
├── Marketing OS          ← first fully mature module (v1.0 frozen)
├── Clinical OS
├── Patient Operations OS
├── Compliance OS
├── Technology OS
├── Finance OS
└── HR OS
```

**Knowledge / product layers (do not confuse with department OS):**

| Layer | What it is | Location |
|-------|------------|----------|
| **Company Siya OS** | How the *company* runs (this document) | `docs/siyaos-knowledge-base/SIYA-OS-ARCHITECTURE.md` |
| **Product SiyaOS** | Clinical OS for longitudinal ADHD care (seed/YC product) | Seed Round V6 / product roadmap |
| Company memory KB | Staff + Siya Assist retrieval | `docs/siyaos-knowledge-base/` |
| Patient / public knowledge | Website, Siya Guide | `apps/siya-health/` + governance |
| Product doorway (internal) | Siya Assist — one chat help desk | Employees |

Department OS documents define **how work is owned and improved**. They do **not** invent separate chat apps, ERP modules, or dashboard product suites. “Dashboards” below means **KPI definitions + reporting cadence**, not a multi-app UI.

**Naming rule:** Say **“Marketing OS (department of Siya OS)”** in ops docs. Say **“SiyaOS”** only for the clinical product. Do not merge the two.

---

## Shared module architecture (every department)

Every department OS must eventually include:

| Element | Meaning |
|---------|---------|
| Mission | Why this function exists for the company |
| Strategy | Multi-year bets and constraints |
| Pipelines | Repeatable flows (intake → output) |
| SOPs | How work is done |
| Dashboards | Named KPIs + where/how they are reported |
| KPIs | Leading and lagging measures |
| Meeting cadence | Rituals that keep the system honest |
| Decision rights | Who decides what (and what escalates) |
| Templates | Reusable artifacts |
| AI agents | Assistive roles (e.g. Siya Assist routing to this dept) — not autonomous ops |
| Continuous improvement log | Versioned changes (v1.1, v1.2…) |

If a department invents a different philosophy, reconcile it **here** — not in Slack.

---

## Module ownership (v1)

| Module | Primary owner | KB home |
|--------|---------------|---------|
| Executive OS | CEO | `01-executive-vision/`, `02-company-structure/`, decisions |
| Marketing OS | CMO | `05-marketing-os/` + growth/brand topics |
| Clinical OS | Clinical leadership | `04-clinical-operations/` |
| Patient Operations OS | Ops / Clinical Program | `11-operations/`, `14-patient-journey/` |
| Compliance OS | Privacy / Counsel | `13-legal-compliance/` |
| Technology OS | Engineering | `08-technology/`, `09-ai-strategy/` |
| Finance OS | Finance | `12-finance/` |
| HR OS | People | `10-hr/` |

See `manifest.json` for compile status and topic lists.

---

## Versioning rule

- **Foundation docs** freeze as `v1.0`.
- Improvements ship as `v1.1`, `v1.2`, or `v2.0` — do not silently rewrite foundations.
- Breaking philosophy changes require a **decision log** entry under `decisions/`.

---

## Related

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — internal KB vs patient knowledge graph
- [`PRODUCT.md`](./PRODUCT.md) — Siya Assist product definition
- [`05-marketing-os/MARKETING-OS-v1.0.md`](./05-marketing-os/MARKETING-OS-v1.0.md) — Marketing department manual (frozen)
- WorkDrive Brand / editorial: `Siya Knowledge Editorial/00-Brand-System/`

## Revision history

| Version | Date | Note |
|---------|------|------|
| 1.0 | 2026-07-27 | Initial company OS blueprint; Marketing named first mature module |
